// server/agentVideoEngine.js — "AI Director" orchestrator.
//
// One call turns lyrics into a fully original music video:
//   1. Reads & analyzes the lyrics (structure, imagery, emotion, genre)
//   2. Composes an ORIGINAL soundtrack (when no audio uploaded)
//      — or beat-analyzes the uploaded track for perfect sync
//   3. Plans the shot list (sections → generative environments)
//   4. Paints every frame procedurally & encodes the master MP4
//
// Exposes a live agent log so the UI can show the director "thinking".

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { analyzeLyrics } = require('./lyricsAnalysis');
const { composeTrack } = require('./musicGenerator');
const { analyzeAudio } = require('./beatGrid');
const { renderOriginalVideo, resolveDims } = require('./originalVideoEngine');
const { ffmpegPath } = require('./ffmpegPaths');

const RENDERS_DIR = path.join(__dirname, 'renders');
const TEMP_DIR = path.join(__dirname, 'temp');

const jobs = new Map();

function log(job, msg) {
  job.agentLog.push({ t: Date.now() - job.startTime, msg });
  job.stage = msg;
  console.log(`[AIDirector ${job.id}] ${msg}`);
}

function createAgentJob(request = {}) {
  const jobId = crypto.randomBytes(8).toString('hex');
  const outputFileName = `agent_${jobId}_${Date.now()}.mp4`;

  const job = {
    id: jobId,
    status: 'QUEUED', // QUEUED | ANALYZING | COMPOSING | ANALYZING_AUDIO | PLANNING | RENDERING | ENCODING | COMPLETED | FAILED
    progress: 0,
    stage: 'Job initialized',
    error: null,
    createdAt: new Date().toISOString(),
    outputFileName,
    videoUrl: `/renders/${outputFileName}`,
    downloadUrl: `/api/agent-video/download/${outputFileName}`,
    posterUrl: null,
    agentLog: [],
    startTime: Date.now(),
    cancelRequested: false,
    request: { ...request },
  };
  jobs.set(jobId, job);
  runJob(job).catch((err) => {
    console.error(`[AIDirector ${jobId}] FAILED:`, err);
    job.status = 'FAILED';
    job.error = err.message || 'Unknown error';
    job.stage = 'Render failed';
    log(job, `✖ ${job.error}`);
  });
  return job;
}

async function runJob(job) {
  const req = job.request;
  const lyrics = String(req.lyrics || '').trim();
  if (!lyrics) throw new Error('Lyrics are required — give the director some words to film.');

  const durationWanted = Math.max(10, Math.min(480, Number(req.duration) || 0) || 0);
  job.status = 'ANALYZING';
  job.progress = 3;
  log(job, 'Reading your lyrics…');
  const seed = crypto.createHash('sha1').update(lyrics + (req.seedSalt || '')).digest()[0] * 7919;
  const analysis = analyzeLyrics(lyrics, {
    duration: durationWanted || 60,
    genre: req.genre,
    mood: req.mood,
    bpm: req.bpm,
    seed,
  });
  log(job, `Found ${analysis.summary.lineCount} lyric lines — ${analysis.summary.chorusCount} chorus lines, mood: ${analysis.summary.mood}`);
  log(job, `Visual world: ${analysis.summary.topEnvs.join(', ')}`);
  await sleep(30);

  // ---- audio: uploaded or originally composed -----------------------------
  let audioInfo = { duration: durationWanted || Math.max(24, analysis.lines.length * 3.2), beats: [], sections: null, path: null, bpm: analysis.bpm };

  const rawAudio = req.audioDataUrl || req.audioBlobUrl || req.audioUrl;
  let uploadedPath = null;
  if (rawAudio) {
    job.status = 'ANALYZING_AUDIO';
    job.progress = 6;
    log(job, 'Uploaded track detected — decoding & beat-mapping…');
    const jobTemp = path.join(TEMP_DIR, `agent_${job.id}`);
    fs.mkdirSync(jobTemp, { recursive: true });
    const ext = /wav/i.test(String(rawAudio).slice(0, 40)) ? 'wav' : /ogg/i.test(String(rawAudio).slice(0, 40)) ? 'ogg' : /flac/i.test(String(rawAudio).slice(0, 40)) ? 'flac' : 'mp3';
    uploadedPath = path.join(jobTemp, `track.${ext}`);
    if (String(rawAudio).startsWith('data:')) {
      fs.writeFileSync(uploadedPath, Buffer.from(String(rawAudio).split(',')[1] || '', 'base64'));
    } else if (/^https?:\/\//.test(String(rawAudio))) {
      const res = await fetch(String(rawAudio));
      if (!res.ok) throw new Error(`Could not fetch audio URL (HTTP ${res.status})`);
      fs.writeFileSync(uploadedPath, Buffer.from(await res.arrayBuffer()));
    } else {
      fs.writeFileSync(uploadedPath, Buffer.from(String(rawAudio), 'utf8'));
    }
    try {
      const info = analyzeAudio(uploadedPath, ffmpegPath);
      audioInfo = { duration: info.duration, beats: info.beats, sections: info.sections, energy: info.energy, path: uploadedPath, bpm: info.bpm };
      log(job, `Beat grid locked: ${info.bpm} BPM, ${info.beats.length} beats, ${info.sections.length} sections detected`);
    } catch (e) {
      log(job, `Audio analysis unavailable (${e.message}) — continuing with estimated grid`);
    }
  } else if (req.autoTrack !== false) {
    job.status = 'COMPOSING';
    job.progress = 8;
    log(job, `No audio provided — composing an original ${analysis.genre} track at ${analysis.bpm} BPM…`);
    const track = composeTrack({
      seed: analysis.seed,
      genre: analysis.genre,
      bpm: analysis.bpm,
      duration: durationWanted || Math.max(24, Math.min(180, analysis.lines.length * 3.4)),
      valence: analysis.avgValence,
      energy: analysis.avgEnergy,
    });
    const jobTemp = path.join(TEMP_DIR, `agent_${job.id}`);
    fs.mkdirSync(jobTemp, { recursive: true });
    const wavPath = path.join(jobTemp, 'original_score.wav');
    fs.writeFileSync(wavPath, track.wav);
    audioInfo = { duration: track.duration, beats: track.beats, sections: track.sections, path: wavPath, bpm: track.bpm, original: true };
    log(job, `Original score ready — ${track.duration.toFixed(0)}s, key ${track.key}, ${track.sections.length} sections (intro/verse/chorus…)`);
  }

  // Auto-scale lyric timing to the real audio duration
  analysis.duration = audioInfo.duration;

  // Honor exact LRC timestamps when the user provided them
  const LRC_TS = /\[\d{1,3}:\d{2}(?:\.\d{1,3})?\]/;
  if (LRC_TS.test(lyrics)) {
    try {
      const { parseLyrics } = require('./lyricsParser');
      const timed = parseLyrics(lyrics, audioInfo.duration);
      if (timed.length) {
        analysis.lines = timed.map((tl, i) => ({
          text: tl.text,
          words: tl.words,
          time: tl.time,
          duration: tl.duration,
          section: (analysis.lines[i] && analysis.lines[i].section) || 'verse',
        }));
        log(job, `LRC timestamps detected — frame-accurate lyric sync for ${timed.length} lines`);
      }
    } catch (_) { /* fall back to even distribution */ }
  }

  if (!LRC_TS.test(lyrics)) {
    const span = Math.max(0.001, audioInfo.duration - Math.min(4.2, audioInfo.duration * 0.07));
    const startAt = audioInfo.original ? 0 : Math.min(4.2, audioInfo.duration * 0.07);
    const lineDur = span / Math.max(1, analysis.lines.length);
    analysis.lines = analysis.lines.map((l, i) => ({
      ...l,
      time: startAt + i * lineDur,
      duration: lineDur,
      words: (l.text || '').split(/\s+/).filter(Boolean),
    }));
  }

  // ---- shot planning -------------------------------------------------------
  job.status = 'PLANNING';
  job.progress = 10;
  log(job, 'Planning the shot list — cutting scenes on beat drops…');

  const opts = {
    aspectRatio: req.aspectRatio || '16:9',
    quality: req.quality || 'standard',
    captionStyle: req.captionStyle || 'karaoke',
    captions: req.captions !== false ? 'on' : 'off',
    artistName: req.artistName || '',
    title: req.title || req.audioTitle || '',
    filmGrain: req.filmGrain !== false,
    letterbox: Boolean(req.letterbox),
    duration: audioInfo.duration,
  };

  // ---- render --------------------------------------------------------------
  job.status = 'RENDERING';
  log(job, 'Rolling cameras — painting original frames in real time…');
  const result = await renderOriginalVideo(analysis, audioInfo, opts, job, RENDERS_DIR);
  job.status = 'ENCODING';
  job.progress = 96;
  log(job, `Master encoded — ${result.totalFrames} original frames @ ${result.fps}fps (${result.W}×${result.H})`);

  // ---- poster frame --------------------------------------------------------
  try {
    const { renderPosterFrame } = require('./originalVideoEngine');
    const dims = resolveDims(opts.aspectRatio, 'standard');
    const posterT = Math.min(4.2, audioInfo.duration * 0.35);
    const png = renderPosterFrame(analysis, { ...audioInfo, path: null }, opts, posterT, dims);
    const posterName = job.outputFileName.replace(/\.mp4$/, '_poster.png');
    fs.writeFileSync(path.join(RENDERS_DIR, posterName), png);
    job.posterUrl = `/renders/${posterName}`;
    log(job, 'Poster frame captured');
  } catch (e) {
    console.warn('[AIDirector] poster failed:', e.message);
  }

  // ---- sidecar lyrics exports (SRT + LRC) ----
  try {
    const { toSrt, toLrc } = require('./lyricsParser');
    const subDir = path.join(RENDERS_DIR, 'subtitles');
    fs.mkdirSync(subDir, { recursive: true });
    const baseName = job.outputFileName.replace(/\.mp4$/, '');
    fs.writeFileSync(path.join(subDir, `${baseName}_lyrics.srt`), toSrt(analysis.lines));
    fs.writeFileSync(path.join(subDir, `${baseName}_lyrics.lrc`), toLrc(analysis.lines));
    job.srtUrl = `/renders/subtitles/${baseName}_lyrics.srt`;
    job.lrcUrl = `/renders/subtitles/${baseName}_lyrics.lrc`;
  } catch (e) {
    console.warn('[AIDirector] sidecar write failed:', e.message);
  }

  job.status = 'COMPLETED';
  job.progress = 100;
  job.completedAt = new Date().toISOString();
  job.stage = 'Original music video complete';
  log(job, '★ That’s a wrap — original video rendered from your lyrics.');
  job.stats = {
    frames: result.totalFrames,
    resolution: `${result.W}×${result.H}`,
    fps: result.fps,
    bpm: audioInfo.bpm,
    originalTrack: Boolean(audioInfo.original),
    scenes: result.scenes.length,
  };
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function getJob(id) { return jobs.get(id) || null; }
function listJobs(limit = 30) {
  return [...jobs.values()]
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit)
    .map((j) => ({ ...j, agentLog: j.agentLog.slice(-4), request: { lyrics: (j.request.lyrics || '').slice(0, 120), title: j.request.title, artistName: j.request.artistName, genre: j.request.genre } }));
}
function cancelJob(id) {
  const j = jobs.get(id);
  if (!j) return false;
  j.cancelRequested = true;
  return true;
}

module.exports = { createAgentJob, getAgentJob: getJob, listAgentJobs: listJobs, cancelAgentJob: cancelJob, RENDERS_DIR };
