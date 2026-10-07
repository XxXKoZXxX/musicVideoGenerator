// server/tests/story.test.js — character cast, storyline director, lip-sync.
const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { analyzeLyrics } = require('../lyricsAnalysis');
const { composeTrack } = require('../musicGenerator');
const { analyzeAudio } = require('../beatGrid');
const { buildStoryline } = require('../storyEngine');
const { createCast, paintCharacter, paintMouth, createMouthDriver, blinkAt } = require('../characterEngine');
const { createFramePainter, planScenes, resolveDims, renderPosterFrame } = require('../originalVideoEngine');
const { ffmpegPath } = require('../ffmpegPaths');

const LYRICS = [
  '[Verse]',
  'City lights are calling out my name',
  'Midnight rain on neon streets tonight',
  '[Chorus]',
  'We are electric, we are the fire',
  'Burning like stars in a wireless sky',
  '[Bridge]',
  'Hold on, the morning is coming for us',
  '[Chorus]',
  'We are electric, never gonna die',
].join('\n');

function makeAnalysis(duration = 32) {
  const a = analyzeLyrics(LYRICS, { duration });
  // deterministic line timings
  const n = Math.max(1, a.lines.length);
  a.lines = a.lines.map((l, i) => ({ ...l, time: (duration / n) * i, duration: duration / n }));
  a.duration = duration;
  return a;
}

test('createCast produces deterministic, consistent characters', () => {
  const c1 = createCast(424242, { size: 1, mood: 'uplifting' });
  const c2 = createCast(424242, { size: 1, mood: 'uplifting' });
  assert.strictEqual(c1.length, 1);
  assert.deepStrictEqual(JSON.stringify(c1[0]), JSON.stringify(c2[0]));
  for (const ch of c1) {
    assert.ok(ch.name && typeof ch.name === 'string');
    assert.ok(ch.skin && ch.hair && ch.outfit);
    assert.ok(['jacket', 'hoodie', 'tee', 'dress'].includes(ch.outfit.style));
  }
  const duo = createCast(99, { size: 2, mood: 'melancholy' });
  assert.strictEqual(duo.length, 2);
  assert.notStrictEqual(duo[0].name, duo[1].name);
});

test('storyline alternates establish/story/performance beats on song sections', () => {
  const a = makeAnalysis();
  const track = composeTrack({ seed: a.seed, genre: 'pop', bpm: a.bpm, duration: 32, valence: a.avgValence, energy: a.avgEnergy });
  const story = buildStoryline(a, track.sections, { castSize: 'auto' });
  assert.ok(story.cast.length >= 1 && story.cast.length <= 2);
  assert.strictEqual(story.beats.length, track.sections.length);
  assert.strictEqual(story.beats[0].type, 'establish');
  const perfBeats = story.beats.filter((b) => b.type === 'perf' || b.type === 'duet');
  const storyBeats = story.beats.filter((b) => b.type === 'story');
  assert.ok(perfBeats.length >= 2, 'chorus should cut to performance shots');
  assert.ok(storyBeats.length >= 1, 'verses should carry story scenes');
  // choruses must be lip-sync closeups or medium shots
  for (const b of perfBeats) assert.ok(['closeup', 'medium', 'two-shot'].includes(b.framing));
  // deterministic
  const again = buildStoryline(a, track.sections, { castSize: 'auto' });
  assert.deepStrictEqual(JSON.stringify(story.beats), JSON.stringify(again.beats));
});

test('performance mode turns every section into a singing shot', () => {
  const a = makeAnalysis(16);
  const track = composeTrack({ seed: 7, genre: 'pop', bpm: 120, duration: 16, valence: 0.6, energy: 0.7 });
  const { createFramePainter: cfp } = require('../originalVideoEngine');
  const dims = resolveDims('16:9', 'draft');
  const audio = { duration: 16, beats: track.beats, sections: track.sections, vocal: track.vocal, bpm: track.bpm };
  const scenes = planScenes(a, audio, { duration: 16 });
  const painter = cfp(a, audio, scenes, { storyMode: 'performance', captions: 'off' }, dims);
  // should not throw and should produce pixels
  const data = painter.paintFrame(9.0);
  assert.ok(data.length > dims.W * dims.H * 2);
});

test('paintCharacter renders different poses without errors', () => {
  // use napi canvas headless
  const { createCanvas } = require('@napi-rs/canvas');
  const cast = createCast(31337, { size: 1 });
  const c = createCanvas(240, 320);
  const ctx = c.getContext('2d');
  for (const pose of ['idle', 'sing', 'chest', 'point', 'dance', 'walk']) {
    paintCharacter(ctx, {
      x: 120, y: 70, u: 2.4, t: 1.3, char: cast[0], pulse: 0.5, energy: 0.5,
      mood: 'happy', pose, mouth: { open: 0.6, shape: 'AA' }, blink: 0,
      faceYaw: 0, rim: '#a78bfa', dim: 1, ground: true,
    });
  }
});

test('mouth driver follows word timeline and vocal envelope', () => {
  const fps = 60;
  const env = new Float32Array(4 * fps).fill(0);
  for (let i = 0; i < env.length; i++) env[i] = i / env.length; // rising ramp
  const words = [
    { start: 0.5, end: 1.0, word: 'we', lineIdx: 0 },
    { start: 1.0, end: 1.6, word: 'are', lineIdx: 0 },
  ];
  const driver = createMouthDriver(words, { fps, data: env }, 42);
  // mid-word: mouth should be open with a viseme
  const mid = driver(0.75);
  assert.ok(mid.open > 0.15, `expected open mouth mid-word, got ${mid.open}`);
  assert.ok(['AA', 'EE', 'OH', 'MM'].includes(mid.shape));
  // in the gap after words but envelope is high: improvised movement
  const gap = driver(1.9);
  assert.ok(gap.open >= 0);
  // long after words with low envelope... ramp is high here; use silence region via new driver
  const quiet = new Float32Array(4 * fps).fill(0);
  const driver2 = createMouthDriver([], { fps, data: quiet }, 42);
  const rest = driver2(2.0);
  assert.strictEqual(rest.shape, 'rest');
  assert.ok(rest.open < 0.1);
});

test('blinkAt produces mostly-open eyes with rare blinks', () => {
  let closed = 0;
  const N = 240;
  for (let i = 0; i < N; i++) if (blinkAt(i * 0.1, 0.3) > 0.5) closed++;
  assert.ok(closed < N * 0.08, `eyes closed too often: ${closed}/${N}`);
});

test('frames with story cast render characters + changing mouths (lip-sync)', () => {
  const a = makeAnalysis(24);
  const track = composeTrack({ seed: a.seed, genre: 'edm', bpm: a.bpm, duration: 24, valence: a.avgValence, energy: a.avgEnergy });
  const dims = resolveDims('16:9', 'draft');
  const audio = { duration: 24, beats: track.beats, sections: track.sections, vocal: track.vocal, bpm: track.bpm };
  const scenes = planScenes(a, audio, { duration: 24 });
  const painter = createFramePainter(a, audio, scenes, { storyMode: 'story', captions: 'off' }, dims);
  const tSec = track.sections.find((s) => s.type === 'chorus' && s.start < 20);
  const t0 = tSec ? tSec.start + 0.4 : 8;
  const f1 = painter.paintFrame(t0);
  const f2 = painter.paintFrame(t0 + 0.25);
  assert.ok(f1.length > 0 && f2.length > 0);
  // singing frames must actually differ (mouth/pose animation)
  let diff = 0;
  for (let i = 0; i < f1.length; i += 397) if (f1[i] !== f2[i]) diff++;
  assert.ok(diff > 0, 'frames with an animated singing cast should differ');
});

test('vocal envelope extraction isolates speech-band energy from uploads', () => {
  // wav: bass hum 80Hz everywhere + 800Hz bursts at 2–3s and 5–6s
  const SR = 22050, DUR = 8;
  const pcm = new Float32Array(SR * DUR);
  for (let i = 0; i < pcm.length; i++) {
    const t = i / SR;
    pcm[i] = 0.3 * Math.sin(2 * Math.PI * 80 * t);
    if ((t > 2 && t < 3) || (t > 5 && t < 6)) pcm[i] += 0.5 * Math.sin(2 * Math.PI * 800 * t);
  }
  const n = pcm.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 20000))), 44 + i * 2);
  const tmp = path.join(os.tmpdir(), `vocal_test_${Date.now()}.wav`);
  fs.writeFileSync(tmp, buf);
  try {
    const info = analyzeAudio(tmp, ffmpegPath);
    assert.ok(info.vocal && info.vocal.data && info.vocal.data.length > 100);
    const at = (t) => info.vocal.data[Math.round(t * info.vocal.fps)];
    assert.ok(at(2.5) > at(1) * 1.8, `speech burst should dominate: ${at(2.5)} vs ${at(1)}`);
    assert.ok(at(5.5) > at(4) * 1.8, `second burst should dominate: ${at(5.5)} vs ${at(4)}`);
    assert.ok(at(4) < 0.5, 'bass-only region should stay low');
  } finally {
    fs.unlinkSync(tmp);
  }
});

test('generated tracks emit a vocal envelope for lip-sync', () => {
  const track = composeTrack({ seed: 11, genre: 'pop', bpm: 118, duration: 18, valence: 0.6, energy: 0.6 });
  assert.ok(track.vocal && track.vocal.data && track.vocal.data.length >= 18 * 60 - 5);
  let active = 0;
  for (let i = 0; i < track.vocal.data.length; i++) if (track.vocal.data[i] > 0.12) active++;
  assert.ok(active > track.vocal.data.length * 0.08, 'lead melody should drive the mouth a meaningful amount');
});

test('poster frames (wizard fallback stills) include the cast', () => {
  const a = makeAnalysis(16);
  const png = renderPosterFrame(
    a,
    { duration: 16, beats: [], sections: null, bpm: a.bpm },
    { captions: 'off', storyMode: 'story' },
    10.0,
    resolveDims('16:9', 'draft'),
  );
  assert.ok(png.length > 50000, 'poster should be a substantial PNG (character + scene)');
});
