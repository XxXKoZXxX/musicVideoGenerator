// server/tests/originalEngine.test.js — node --test suite for the original
// generative lyrics→video pipeline (analysis, composer, beat grid, render).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { analyzeLyrics } = require('../lyricsAnalysis');
const { composeTrack } = require('../musicGenerator');
const { planScenes, createFramePainter, resolveDims } = require('../originalVideoEngine');
const { ffmpegPath, ffprobePath } = require('../ffmpegPaths');

const SAMPLE_LYRICS = `[Verse]
City lights are calling out my name
Midnight rain on neon streets tonight
[Chorus]
We are electric, we are the fire
Burning like stars in a wireless sky
Dancing forever, hearts on a wire
We are electric, never gonna die
[Verse 2]
Ocean waves are whispering your dream
Moon above the water shines so deep
[Chorus]
We are electric, we are the fire
Burning like stars in a wireless sky
Dancing forever, hearts on a wire
We are electric, never gonna die
[Bridge]
Hold me closer, don't let go
[Outro]
We are electric`;

test('lyrics analysis finds sections, imagery, genre & palette', () => {
  const a = analyzeLyrics(SAMPLE_LYRICS, { duration: 60 });
  assert.ok(a.lines.length >= 12, 'should parse lines');
  assert.ok(a.lines.some((l) => l.section === 'chorus'), 'chorus detected');
  assert.ok(a.lines.some((l) => l.section === 'verse'), 'verse detected');
  assert.ok(a.rankedEnvs.length >= 1, 'at least one environment');
  assert.ok(a.bpm >= 60 && a.bpm <= 200, `sane bpm ${a.bpm}`);
  assert.ok(a.palette.primary, 'palette built');
  // deterministic
  const b = analyzeLyrics(SAMPLE_LYRICS, { duration: 60 });
  assert.strictEqual(b.seed, a.seed);
  assert.strictEqual(b.genre, a.genre);
  assert.strictEqual(b.palette.primary, a.palette.primary);
});

test('music composer produces a valid WAV with beats & sections', () => {
  const track = composeTrack({ seed: 1234, genre: 'edm', bpm: 124, duration: 16, valence: 0.4, energy: 0.7 });
  assert.ok(track.wav.length > 44, 'wav has data');
  assert.strictEqual(track.wav.readUInt32LE(24), 44100, 'sample rate');
  assert.ok(track.beats.length > 20, 'beat grid exists');
  assert.ok(track.sections.length >= 4, 'song sections exist');
  assert.strictEqual(track.duration, 16);
  // RIFF header
  assert.strictEqual(track.wav.toString('ascii', 0, 4), 'RIFF');
  assert.strictEqual(track.wav.toString('ascii', 8, 12), 'WAVE');
});

test('scene planner cuts scenes on section edges with environments', () => {
  const a = analyzeLyrics(SAMPLE_LYRICS, { duration: 60 });
  const track = composeTrack({ seed: a.seed, genre: a.genre, bpm: a.bpm, duration: 30, valence: a.avgValence, energy: a.avgEnergy });
  const scenes = planScenes(a, { duration: track.duration, beats: track.beats, sections: track.sections }, { duration: track.duration });
  assert.ok(scenes.length >= 3, `several scenes (got ${scenes.length})`);
  for (const s of scenes) {
    assert.ok(s.end > s.start, 'positive length');
    assert.ok(typeof s.env === 'string' && s.env.length, 'env assigned');
  }
  assert.strictEqual(scenes[scenes.length - 1].end, track.duration);
});

test('frame painter paints distinct beat-reactive frames', () => {
  const a = analyzeLyrics(SAMPLE_LYRICS, { duration: 30 });
  const dims = resolveDims('16:9', 'draft');
  const scenes = planScenes(a, { duration: 30, beats: [], sections: null }, { duration: 30 });
  const painter = createFramePainter(a, { duration: 30, beats: [{ t: 1, strong: true }, { t: 2, strong: false }], bpm: 120 }, scenes, { captionStyle: 'karaoke', artistName: 'Test Artist', title: 'Test Song' }, dims);
  const f1 = painter.paintFrame(1.0);
  const f2 = painter.paintFrame(1.4);
  assert.strictEqual(f1.length, dims.W * dims.H * 4);
  let diff = 0;
  for (let i = 0; i < f1.length; i += 997) if (Math.abs(f1[i] - f2[i]) > 8) diff++;
  assert.ok(diff > 40, `frames differ (${diff} sampled pixels)`);
});

test('end-to-end: lyrics render into a real playable MP4', { timeout: 240000 }, () => {
  assert.ok(ffmpegPath, 'ffmpeg present');
  const a = analyzeLyrics(SAMPLE_LYRICS, { duration: 12 });
  const track = composeTrack({ seed: a.seed, genre: a.genre, bpm: a.bpm, duration: 12, valence: a.avgValence, energy: a.avgEnergy });
  const tmp = path.join(__dirname, '..', 'temp');
  fs.mkdirSync(tmp, { recursive: true });
  const wavPath = path.join(tmp, 'test_track.wav');
  fs.writeFileSync(wavPath, track.wav);

  const { renderOriginalVideo } = require('../originalVideoEngine');
  const outDir = path.join(__dirname, '..', 'renders');
  fs.mkdirSync(outDir, { recursive: true });
  const job = { outputFileName: `test_original_${Date.now()}.mp4`, progress: 0, stage: '', cancelRequested: false, scenePlan: null, parsedLyricLines: 0 };
  const outPath = path.join(outDir, job.outputFileName);

  return renderOriginalVideo(
    a,
    { duration: track.duration, beats: track.beats, sections: track.sections, path: wavPath, bpm: track.bpm },
    { aspectRatio: '16:9', quality: 'draft', captionStyle: 'kinetic', artistName: 'Test Artist', title: 'Original Engine' },
    job,
    outDir
  ).then((result) => {
    assert.ok(fs.existsSync(outPath), 'mp4 written');
    const size = fs.statSync(outPath).size;
    assert.ok(size > 40000, `mp4 not tiny (${size} bytes)`);
    const probe = JSON.parse(execFileSync(ffprobePath, ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', outPath]).toString());
    const v = probe.streams.find((s) => s.codec_type === 'video');
    const au = probe.streams.find((s) => s.codec_type === 'audio');
    assert.strictEqual(v.codec_name, 'h264');
    assert.strictEqual(au.codec_name, 'aac');
    assert.ok(Math.abs(parseFloat(probe.format.duration) - 12) < 1.2, `duration ~12s (${probe.format.duration})`);
    console.log('   ✓ rendered', job.outputFileName, size, 'bytes,', probe.format.duration + 's');
  });
});
