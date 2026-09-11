// server/tests/render-smoke.js — End-to-end smoke test for the server render pipeline.
// Generates synthetic audio + images, renders with LRC lyrics, validates output.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ffmpegPath, ffprobePath } = require('../ffmpegPaths');
const { createRenderJob, getJobStatus } = require('../renderEngine');

const FFMPEG = ffmpegPath || 'ffmpeg';
const FFPROBE = ffprobePath || 'ffprobe';

const WORK = path.join(__dirname, 'smoke_work');
fs.mkdirSync(WORK, { recursive: true });

function sh(cmd) {
  return execSync(cmd, { timeout: 120000 }).toString().trim();
}

async function main() {
  console.log('ffmpeg:', ffmpegPath);
  console.log('ffprobe:', ffprobePath);
  if (!ffmpegPath) throw new Error('ffmpeg binary not found');

  // 1) 10s stereo sine test tone (440→880Hz sweep feel)
  const audio = path.join(WORK, 'test_tone.wav');
  sh(`"${FFMPEG}" -y -f lavfi -i "sine=frequency=440:duration=10" -ac 2 -ar 44100 "${audio}"`);
  console.log('audio OK:', fs.statSync(audio).size, 'bytes');

  // 2) Two gradient test images (1280x720)
  const img1 = path.join(WORK, 'frame_a.jpg');
  const img2 = path.join(WORK, 'frame_b.jpg');
  sh(`"${FFMPEG}" -y -f lavfi -i "testsrc2=s=1280x720:rate=1" -frames:v 1 "${img1}"`);
  sh(`"${FFMPEG}" -y -f lavfi -i "smptebars=s=1280x720:rate=1" -frames:v 1 "${img2}"`);
  console.log('images OK');

  // 3) Start a render job with LRC lyrics + song structure
  const project = {
    audioTitle: 'Smoke Test Anthem',
    artistName: 'Astraea',
    audioDataUrl: 'data:audio/wav;base64,' + fs.readFileSync(audio).toString('base64'),
    images: [img1, img2],
    duration: 10,
    bpm: 120,
    aspectRatio: '16:9',
    resolution: '720p',
    lyricsStyle: 'neon',
    showLyrics: true,
    lyrics:
      '[00:00.50] Smoke test line one shining bright\n' +
      '[00:03.00] Smoke test line two burning hot\n' +
      '[00:06.00] Final smoke test line fading out',
    songStructure: {
      sections: [
        { id: 's1', type: 'Intro', start: 0, end: 5, energy: 40, isDrop: false },
        { id: 's2', type: 'Chorus / Drop', start: 5, end: 10, energy: 95, isDrop: true },
      ],
    },
  };

  const job = createRenderJob(project, { resolution: '720p' });
  console.log('job started:', job.id, '->', job.videoUrl);

  // 4) Poll
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = getJobStatus(job.id);
    process.stdout.write(`\r  [${st.status}] ${st.progress}% ${st.stage} `);
    if (st.status === 'COMPLETED') {
      console.log('\nCOMPLETED');
      // 5) Validate
      const out = sh(
        `"${FFPROBE}" -v error -show_entries format=duration:stream=codec_type,codec_name -of json "${job.outputPath}"`
      );
      const info = JSON.parse(out);
      const types = (info.streams || []).map((s) => `${s.codec_type}:${s.codec_name}`);
      console.log('streams:', types.join(', '));
      console.log('duration:', info.format?.duration);
      console.log('fileSize:', st.fileSize);
      console.log('srtUrl:', st.srtUrl, 'exists:', st.srtUrl ? fs.existsSync(path.join(__dirname, '..', st.srtUrl)) : false);
      console.log('lrcUrl:', st.lrcUrl, 'exists:', st.lrcUrl ? fs.existsSync(path.join(__dirname, '..', st.lrcUrl)) : false);
      console.log('thumbUrl:', st.thumbnailUrl, 'exists:', st.thumbnailUrl ? fs.existsSync(path.join(__dirname, '..', st.thumbnailUrl)) : false);
      console.log('lyricLines:', st.lyricLines);

      const hasVideo = types.some((t) => t.startsWith('video:'));
      const hasAudio = types.some((t) => t.startsWith('audio:'));
      if (!hasVideo) throw new Error('FAIL: no video stream');
      if (!hasAudio) throw new Error('FAIL: no audio stream');
      if (st.lyricLines !== 3) throw new Error('FAIL: expected 3 lyric lines, got ' + st.lyricLines);
      if (!st.srtUrl) throw new Error('FAIL: missing SRT sidecar');
      if (!st.lrcUrl) throw new Error('FAIL: missing LRC sidecar');
      console.log('\n✅ SMOKE TEST PASSED — MP4 with burned-in synced lyrics rendered successfully');
      // 6) SRT content check
      const srtContent = fs.readFileSync(path.join(__dirname, '..', st.srtUrl), 'utf8');
      console.log('--- SRT preview ---\n' + srtContent);
      return;
    }
    if (st.status === 'FAILED') {
      console.log('\nFAILED:', st.error);
      process.exit(1);
    }
  }
  console.log('\nTIMEOUT');
  process.exit(1);
}

main().catch((e) => {
  console.error('SMOKE TEST ERROR:', e);
  process.exit(1);
});
