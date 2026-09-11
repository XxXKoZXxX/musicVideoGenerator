// server/tests/renderPipeline.test.js — Integration test for the full server render
// pipeline: uploaded song + LRC lyrics + beat sections → MP4 master with burned-in
// synced lyrics, SRT/LRC sidecars and gallery thumbnail.
// Run: node --test server/tests/
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ffmpegPath, ffprobePath } = require('../ffmpegPaths');
const { createRenderJob, getJobStatus, listCompletedRenders, deleteRenderFile } = require('../renderEngine');

const FFMPEG = ffmpegPath || 'ffmpeg';
const FFPROBE = ffprobePath || 'ffprobe';
const WORK = path.join(__dirname, 'pipeline_work');
let audio, img1, img2, job;

function sh(cmd) {
  return execSync(cmd, { timeout: 120000 }).toString().trim();
}

function waitForJob(jobId, maxSeconds = 240) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const st = getJobStatus(jobId);
      if (st.status === 'COMPLETED') {
        clearInterval(timer);
        resolve(st);
      } else if (st.status === 'FAILED') {
        clearInterval(timer);
        reject(new Error('job failed: ' + st.error));
      } else if (Date.now() - started > maxSeconds * 1000) {
        clearInterval(timer);
        reject(new Error('job timed out at ' + st.stage));
      }
    }, 1500);
  });
}

before(() => {
  assert.ok(ffmpegPath, 'ffmpeg binary must be available (npm @ffmpeg-installer)');
  fs.mkdirSync(WORK, { recursive: true });
  audio = path.join(WORK, 'song.wav');
  img1 = path.join(WORK, 'scene_a.jpg');
  img2 = path.join(WORK, 'scene_b.jpg');
  sh(`"${FFMPEG}" -y -f lavfi -i "sine=frequency=392:duration=8" -ac 2 -ar 44100 "${audio}"`);
  sh(`"${FFMPEG}" -y -f lavfi -i "testsrc2=s=1280x720:rate=1" -frames:v 1 "${img1}"`);
  sh(`"${FFMPEG}" -y -f lavfi -i "smptebars=s=1280x720:rate=1" -frames:v 1 "${img2}"`);
});

after(() => {
  try {
    if (job) fs.rmSync(job.outputPath, { force: true });
  } catch (_) {}
  try {
    fs.rmSync(WORK, { recursive: true, force: true });
  } catch (_) {}
});

test('renders an MP4 master with burned-in synced lyrics from an uploaded song', async () => {
  const project = {
    audioTitle: 'Pipeline Test Anthem',
    artistName: 'Integration Bot',
    audioDataUrl: 'data:audio/wav;base64,' + fs.readFileSync(audio).toString('base64'),
    images: [img1, img2],
    duration: 8,
    bpm: 128,
    aspectRatio: '16:9',
    resolution: '720p',
    lyricsStyle: 'neon',
    showLyrics: true,
    lyrics:
      '[00:00.50] Pipeline line one\n' +
      '[00:03.00] Pipeline line two\n' +
      '[00:05.50] Pipeline final line',
    songStructure: {
      sections: [
        { id: 's1', type: 'Verse', start: 0, end: 4, energy: 50, isDrop: false },
        { id: 's2', type: 'Chorus / Drop', start: 4, end: 8, energy: 95, isDrop: true },
      ],
    },
  };

  job = createRenderJob(project, { resolution: '720p' });
  assert.ok(job.id, 'job id assigned');
  assert.ok(job.videoUrl.startsWith('/renders/'), 'videoUrl is a server path');

  const done = await waitForJob(job.id);

  // Output file exists with real A/V streams
  assert.ok(fs.existsSync(done.outputPath), 'MP4 file exists');
  assert.ok(done.fileSize > 10000, 'MP4 is a real video, not a stub');

  const probe = JSON.parse(
    sh(`"${FFPROBE}" -v error -show_entries format=duration:stream=codec_type,codec_name -of json "${done.outputPath}"`)
  );
  const types = probe.streams.map((s) => s.codec_type);
  assert.ok(types.includes('video'), 'video stream present');
  assert.ok(types.includes('audio'), 'audio stream present');
  const dur = parseFloat(probe.format.duration);
  assert.ok(dur > 7 && dur < 9.5, `duration synced to song (got ${dur}s)`);

  // Lyrics metadata + sidecars
  assert.equal(done.lyricLines, 3, 'three lyric lines parsed');
  assert.ok(done.srtUrl && fs.existsSync(path.join(__dirname, '..', done.srtUrl)), 'SRT sidecar written');
  assert.ok(done.lrcUrl && fs.existsSync(path.join(__dirname, '..', done.lrcUrl)), 'LRC sidecar written');
  assert.ok(done.thumbnailUrl && fs.existsSync(path.join(__dirname, '..', done.thumbnailUrl)), 'thumbnail written');

  const srt = fs.readFileSync(path.join(__dirname, '..', done.srtUrl), 'utf8');
  assert.ok(srt.includes('Pipeline line one'));
  assert.ok(srt.includes('Pipeline final line'));

  // Gallery listing includes the render
  const list = listCompletedRenders();
  const entry = list.find((r) => r.fileName === done.outputFileName);
  assert.ok(entry, 'render listed in library');
  assert.equal(entry.title, 'Pipeline Test Anthem');
  assert.equal(entry.lyricLines, 3);
  assert.ok(entry.thumbnailUrl, 'library entry carries thumbnail');
});

test('render without lyrics still succeeds (no overlay pass)', async () => {
  const noLyricJob = createRenderJob(
    {
      audioTitle: 'NoLyric Test',
      artistName: 'Integration Bot',
      audioDataUrl: 'data:audio/wav;base64,' + fs.readFileSync(audio).toString('base64'),
      images: [img1],
      duration: 8,
      aspectRatio: '16:9',
      resolution: '720p',
      lyrics: '',
    },
    { resolution: '720p' }
  );

  const done = await waitForJob(noLyricJob.id);
  assert.equal(done.status, 'COMPLETED');
  assert.equal(done.lyricLines, 0);
  assert.equal(done.srtUrl, null);
  assert.ok(fs.existsSync(done.outputPath));
  assert.ok(done.fileSize > 10000);

  // cleanup
  deleteRenderFile(done.outputFileName);
  assert.ok(!fs.existsSync(done.outputPath), 'deleteRenderFile removed the master');
});

test('deleteRenderFile removes master, thumbnail and subtitle sidecars', () => {
  // Uses the main job from the first test
  assert.ok(job && job.outputFileName, 'main job exists');
  const file = job.outputFileName;
  const srtBefore = job.srtUrl ? path.join(__dirname, '..', job.srtUrl) : null;
  const lrcBefore = job.lrcUrl ? path.join(__dirname, '..', job.lrcUrl) : null;
  const thumbBefore = path.join(__dirname, '..', file.replace(/\.mp4$/, '_thumb.jpg'));

  deleteRenderFile(file);

  assert.ok(!fs.existsSync(path.join(__dirname, '..', file)), 'master removed');
  assert.ok(!fs.existsSync(thumbBefore), 'thumbnail removed');
  if (srtBefore) assert.ok(!fs.existsSync(srtBefore), 'SRT sidecar removed');
  if (lrcBefore) assert.ok(!fs.existsSync(lrcBefore), 'LRC sidecar removed');
});
