// Vercel serverless: REAL video rendering, within serverless limits.
// The full original engine (cast, storylines, lip-sync, composed soundtrack,
// burned karaoke captions) runs synchronously in this function and returns
// the finished master as a data URL — serverless has no shared disk between
// lambdas, so the video travels with the response.
//
// Caps (Vercel Hobby functions allow 60s / 3GB): max 16s, 480p draft,
// fast encoder settings. For full-length masters use the local/desktop
// render server, which streams progress and keeps a library.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_DURATION = 16;

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (_) { return {}; }
}

// 60s is the Hobby-plan function ceiling; declared in-code (schema-safe)
// rather than via vercel.json functions config.
const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST only' });
  const started = Date.now();
  let job = null;
  try {
    const request = await readJsonBody(req);
    const lyrics = String(request.lyrics || '').trim();
    if (!lyrics) return res.status(400).json({ success: false, error: 'Lyrics are required — give the director some words to film.' });

    const { analyzeLyrics } = require('../../server/lyricsAnalysis');
    const { renderOriginalVideo, renderPosterFrame, resolveDims } = require('../../server/originalVideoEngine');
    const { composeTrack } = require('../../server/musicGenerator');
    const { analyzeAudio } = require('../../server/beatGrid');
    const { ffmpegPath } = require('../../server/ffmpegPaths');
    const { toSrt } = require('../../server/lyricsParser');

    if (!ffmpegPath) {
      return res.status(503).json({ success: false, error: 'ffmpeg binary unavailable in this runtime — render locally instead.' });
    }

    const duration = Math.max(6, Math.min(MAX_DURATION, Number(request.duration) || 16));
    const seed = crypto.createHash('sha1').update(lyrics).digest()[0] * 7919;
    const analysis = analyzeLyrics(lyrics, {
      duration,
      genre: request.genre,
      mood: request.mood,
      bpm: request.bpm,
      seed,
    });

    // ---- audio: uploaded track (beat grid + vocal envelope) or composed ----
    let audioInfo;
    const rawAudio = request.audioDataUrl || request.audioUrl;
    const jobTemp = fs.mkdtempSync(path.join('/tmp', 'vg-render-'));
    if (rawAudio) {
      const ext = /wav/i.test(String(rawAudio).slice(0, 40)) ? 'wav' : /ogg/i.test(String(rawAudio).slice(0, 40)) ? 'ogg' : 'mp3';
      const audioPath = path.join(jobTemp, `track.${ext}`);
      const b64 = String(rawAudio).startsWith('data:') ? String(rawAudio).split(',')[1] : null;
      if (b64) {
        fs.writeFileSync(audioPath, Buffer.from(b64, 'base64'));
        try {
          const info = analyzeAudio(audioPath, ffmpegPath);
          audioInfo = { duration: Math.min(info.duration, duration + 2), beats: info.beats, sections: info.sections, energy: info.energy, vocal: info.vocal, path: audioPath, bpm: info.bpm };
        } catch (_) {
          audioInfo = { duration, beats: [], sections: null, path: audioPath, bpm: analysis.bpm };
        }
      } else {
        audioInfo = { duration, beats: [], sections: null, bpm: analysis.bpm };
      }
    } else {
      const track = composeTrack({
        seed: analysis.seed,
        genre: request.genre || analysis.genre,
        bpm: analysis.bpm,
        duration,
        valence: analysis.avgValence,
        energy: analysis.avgEnergy,
      });
      const wavPath = path.join(jobTemp, 'original_score.wav');
      fs.writeFileSync(wavPath, track.wav);
      audioInfo = { duration: track.duration, beats: track.beats, sections: track.sections, energy: track.energy, vocal: track.vocal, path: wavPath, bpm: track.bpm, original: true };
    }
    analysis.duration = audioInfo.duration;

    // ---- lyric timing: LRC timestamps honored, else even distribution ----
    const LRC_TS = /\[\d{1,3}:\d{2}(?:\.\d{1,3})?\]/;
    if (LRC_TS.test(lyrics)) {
      try {
        const { parseLyrics } = require('../../server/lyricsParser');
        const timed = parseLyrics(lyrics, audioInfo.duration);
        if (timed.length) {
          analysis.lines = timed.map((tl, i) => ({
            text: tl.text, words: tl.words, time: tl.time, duration: tl.duration,
            section: (analysis.lines[i] && analysis.lines[i].section) || 'verse',
          }));
        }
      } catch (_) { /* even timing fallback below */ }
    }
    if (analysis.lines.length && analysis.lines[0].time == null) {
      const startAt = Math.min(4.2, audioInfo.duration * 0.07);
      const span = Math.max(0.001, audioInfo.duration - startAt);
      const lineDur = span / analysis.lines.length;
      analysis.lines = analysis.lines.map((l, i) => ({ ...l, time: startAt + i * lineDur, duration: lineDur, words: (l.text || '').split(/\s+/).filter(Boolean) }));
    }

    // ---- render with the FULL engine (cast · story · lip-sync · captions) ----
    const rendersDir = path.join(jobTemp, 'out');
    fs.mkdirSync(rendersDir, { recursive: true });
    job = {
      id: crypto.randomBytes(8).toString('hex'),
      outputFileName: `agent_${crypto.randomBytes(8).toString('hex')}_${Date.now()}.mp4`,
      agentLog: [],
      progress: 5,
      cancelRequested: false,
    };
    await renderOriginalVideo(analysis, audioInfo, {
      aspectRatio: request.aspectRatio || '16:9',
      quality: 'draft', // 854×480 — serverless-friendly
      captions: 'on',
      captionStyle: request.captionStyle || 'karaoke',
      storyMode: request.storyMode || 'story',
      castSize: request.castSize || 'auto',
      filmGrain: request.filmGrain !== false,
      encoderPreset: 'veryfast',
      crf: 24,
      duration: audioInfo.duration,
    }, job, rendersDir);

    const masterPath = path.join(rendersDir, job.outputFileName);
    if (!fs.existsSync(masterPath)) throw new Error('Render engine produced no output');
    const videoBuffer = fs.readFileSync(masterPath);

    // ---- poster from the same engine ----
    let posterDataUrl = null;
    try {
      const png = renderPosterFrame(analysis, { ...audioInfo, path: null }, {
        aspectRatio: request.aspectRatio || '16:9',
        captions: 'off',
        storyMode: request.storyMode || 'story',
        castSize: request.castSize || 'auto',
      }, Math.min(4.2, audioInfo.duration * 0.35), resolveDims(request.aspectRatio || '16:9', 'draft'));
      posterDataUrl = `data:image/png;base64,${png.toString('base64')}`;
    } catch (_) { /* poster optional */ }

    const srt = (() => { try { return toSrt(analysis.lines); } catch (_) { return ''; } })();

    // best-effort temp cleanup
    try { fs.rmSync(jobTemp, { recursive: true, force: true }); } catch (_) {}

    const videoUrl = `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
    if (videoUrl.length > 4.4 * 1024 * 1024) {
      // Vercel response ceiling — shouldn't trigger at 16s/480p/crf24, but fail honestly rather than truncate
      return res.status(507).json({
        success: false,
        error: 'Rendered master exceeded the serverless response limit.',
        hint: 'Render locally for this length — the desktop/local server streams results without size limits.',
      });
    }

    return res.status(200).json({
      success: true,
      jobId: job.id,
      status: 'COMPLETED',
      progress: 100,
      stage: 'Serverless render complete',
      videoUrl,
      posterUrl: posterDataUrl,
      downloadUrl: videoUrl,
      srtText: srt || null,
      engine: 'original',
      agentLog: job.agentLog,
      stats: {
        frames: Math.round(audioInfo.duration * 24),
        resolution: '854×480',
        fps: 24,
        bpm: audioInfo.bpm,
        originalTrack: Boolean(audioInfo.original),
        scenes: (job.scenePlan || []).length,
        renderMs: Date.now() - started,
        serverless: true,
      },
      completedAt: new Date().toISOString(),
      request: { lyrics, aspectRatio: request.aspectRatio || '16:9', duration, storyMode: request.storyMode || 'story', castSize: request.castSize || 'auto' },
    });
  } catch (err) {
    console.error('[agent-video:create:vercel] render failed:', err);
    const msg = String(err && err.message || err);
    return res.status(Date.now() - started > 50000 ? 504 : 500).json({
      success: false,
      error: `Serverless render failed: ${msg.slice(0, 200)}`,
      hint: 'If this was a timeout, try a shorter duration — or run the studio locally for full-length renders with progress streaming.',
    });
  }
};

handler.maxDuration = 60;

module.exports = handler;
