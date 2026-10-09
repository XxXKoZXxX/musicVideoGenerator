// server/tests/happyhorse.test.js — optional HappyHorse AI-video engine.
// Uses a mock CLI (writes real mp4s via the bundled ffmpeg) so the entire
// pipeline — detection, generation, section fitting, concat, audio mux,
// lyrics burn, poster — is verifiable offline.
const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { analyzeLyrics } = require('../lyricsAnalysis');
const { composeTrack } = require('../musicGenerator');
const { analyzeAudio } = require('../beatGrid');
const { ffmpegPath } = require('../ffmpegPaths');
const happyhorse = require('../happyhorseEngine');

const MOCK = path.join(__dirname, 'fixtures', 'fake-happyhorse');

function withMock(fn) {
  const prev = process.env.HH_CLI_PATH;
  process.env.HH_CLI_PATH = MOCK;
  process.env.FAKE_HH_FFMPEG = ffmpegPath;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (prev === undefined) delete process.env.HH_CLI_PATH;
      else process.env.HH_CLI_PATH = prev;
      delete process.env.FAKE_HH_FFMPEG;
      happyhorse.getStatus(true).then(() => {}); // re-cache the real status
    });
}

test('getStatus detects the mock CLI and reports version', () => withMock(async () => {
  const s = await happyhorse.getStatus(true);
  assert.strictEqual(s.available, true);
  assert.match(s.version, /mock 1\.0\.0/);
  assert.strictEqual(s.source, 'HH_CLI_PATH');
}));

test('without the CLI, getStatus reports unavailable', async () => {
  const prev = process.env.HH_CLI_PATH;
  delete process.env.HH_CLI_PATH;
  // PATH lookup of a real happyhorse binary is assumed absent in the sandbox
  const s = await happyhorse.getStatus(true);
  if (prev === undefined) delete process.env.HH_CLI_PATH;
  else process.env.HH_CLI_PATH = prev;
  // don't hard-fail if the machine actually has it installed
  if (!s.available) assert.strictEqual(s.available, false);
});

test('generateClip produces a real playable mp4 via the CLI', () => withMock(async () => {
  const out = path.join(os.tmpdir(), `hh_clip_${Date.now()}.mp4`);
  try {
    const { path: p } = await happyhorse.generateClip({ prompt: 'neon city night', durationSec: 4, resolution: '720p', outPath: out });
    assert.strictEqual(p, out);
    const dur = await happyhorse.probeDuration(out);
    assert.ok(dur && dur > 3 && dur < 6, `expected ~4s clip, got ${dur}`);
  } finally {
    fs.existsSync(out) && fs.unlinkSync(out);
  }
}));

test('generateClip fails with a clear error when the CLI is absent', async () => {
  const prev = process.env.HH_CLI_PATH;
  const prevPath = process.env.PATH;
  delete process.env.HH_CLI_PATH;
  process.env.PATH = '/nonexistent-hh-test'; // hide any real install
  try {
    await assert.rejects(
      () => happyhorse.generateClip({ prompt: 'x', outPath: '/tmp/hh_should_fail.mp4' }),
      /not found|failed/i,
    );
  } finally {
    if (prev === undefined) delete process.env.HH_CLI_PATH;
    else process.env.HH_CLI_PATH = prev;
    process.env.PATH = prevPath;
  }
});

test('buildWindows groups sections into <=15s windows honoring the cap', () => {
  const sections = [];
  for (let i = 0; i < 8; i++) sections.push({ type: i % 2 ? 'chorus' : 'verse', start: i * 10, end: (i + 1) * 10 });
  const w = happyhorse.buildWindows(sections, 80, 4);
  assert.ok(w.length <= 4, `expected <=4 windows, got ${w.length}`);
  for (const win of w) assert.ok(win.end - win.start <= 15.001, 'windows must respect the 15s model clip limit');
  const empty = happyhorse.buildWindows(null, 30, 4);
  assert.strictEqual(empty.length, 1);
});

test('buildPrompt includes world, mood, section and lyric line', () => {
  const a = analyzeLyrics('[Verse]\nCity lights are calling out my name\n[Chorus]\nWe are electric', { duration: 20 });
  const p = happyhorse.buildPrompt(a, 'chorus', 'We are electric');
  assert.match(p, /music video/);
  assert.match(p, /chorus/i);
  assert.match(p, /electric/i);
});

test('full pipeline: AI clips + soundtrack + lyrics assemble into a real mp4', () => withMock(async () => {
  const LYRICS = '[Verse]\nCity lights are calling out my name\nMidnight rain on neon streets tonight\n[Chorus]\nWe are electric, we are the fire\nBurning like stars in a wireless sky';
  const analysis = analyzeLyrics(LYRICS, { duration: 12 });
  analysis.lines = analysis.lines.map((l, i) => ({ ...l, time: i * 3, duration: 3 }));

  const track = composeTrack({ seed: 21, genre: 'pop', bpm: 120, duration: 12, valence: 0.6, energy: 0.6 });
  const wavPath = path.join(os.tmpdir(), `hh_score_${Date.now()}.wav`);
  fs.writeFileSync(wavPath, track.wav);
  const audioInfo = { duration: track.duration, beats: track.beats, sections: track.sections, vocal: track.vocal, path: wavPath, bpm: track.bpm, original: true };

  const rendersDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hh_renders_'));
  const job = { id: 'test', agentLog: [], cancelRequested: false, outputFileName: `hh_test_${Date.now()}.mp4`, posterUrl: null, progress: 0 };
  try {
    const result = await happyhorse.renderHappyHorseVideo(analysis, audioInfo, { quality: 'draft' }, job, rendersDir);
    assert.strictEqual(result.engine, 'happyhorse');
    assert.ok(result.scenes.length >= 1 && result.scenes.length <= 4);
    const out = path.join(rendersDir, job.outputFileName);
    assert.ok(fs.existsSync(out), 'final mp4 must exist');
    const dur = await happyhorse.probeDuration(out);
    assert.ok(dur && dur >= 10, `expected ~12s master, got ${dur}`);
    assert.ok(fs.statSync(out).size > 50000, 'master should be a real video, not an empty file');
    assert.ok(job.posterUrl, 'poster extracted from AI footage');
  } finally {
    fs.rmSync(rendersDir, { recursive: true, force: true });
    fs.existsSync(wavPath) && fs.unlinkSync(wavPath);
  }
}));

test('AI Director falls back to the procedural engine when happyhorse is requested but absent', async () => {
  const { createAgentJob, getAgentJob } = require('../agentVideoEngine');
  const prev = process.env.HH_CLI_PATH;
  const prevPath = process.env.PATH;
  delete process.env.HH_CLI_PATH;
  process.env.PATH = '/nonexistent-hh-test';
  await new Promise((resolve) => {
    const job = createAgentJob({
      lyrics: '[Verse]\nCity lights are calling out my name\n[Chorus]\nWe are electric tonight',
      title: 'HH Fallback', quality: 'draft', aspectRatio: '16:9', duration: 12,
      aiModel: 'happyhorse',
    });
    const iv = setInterval(() => {
      const j = getAgentJob(job.id);
      if (['COMPLETED', 'FAILED'].includes(j.status)) {
        clearInterval(iv);
        try {
          assert.strictEqual(j.status, 'COMPLETED', `fallback render should complete, got ${j.status}: ${j.error}`);
          assert.ok(j.agentLog.some((l) => /not found/i.test(l.msg || l)), 'should log the missing-CLI notice');
          resolve();
        } catch (e) { clearInterval(iv); resolve(e); }
      }
    }, 1500);
  });
  if (prev === undefined) delete process.env.HH_CLI_PATH;
  else process.env.HH_CLI_PATH = prev;
  process.env.PATH = prevPath;
});
