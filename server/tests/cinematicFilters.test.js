// server/tests/cinematicFilters.test.js — Unit tests for cinematic filter builders.
const { test } = require('node:test');
const assert = require('node:assert');
const {
  COLOR_LOOKS,
  lookIds,
  lookLabel,
  buildLookFilter,
  buildVignetteFilter,
  buildGrainFilter,
  buildFadeFilter,
  buildBeatFlashFilter,
  buildWatermarkFilter,
  buildTimecodeFilter,
  buildChaptersMeta,
  suggestLook,
} = require('../cinematicFilters');

test('look catalog exposes 7 looks with stable ids', () => {
  const ids = lookIds();
  assert.ok(ids.length >= 7);
  for (const id of ids) {
    assert.ok(COLOR_LOOKS[id].label.length > 0);
    assert.strictEqual(typeof buildLookFilter(id), 'string');
  }
  assert.strictEqual(buildLookFilter('standard'), '');
  assert.strictEqual(lookLabel('nope'), 'Standard');
});

test('each non-standard look emits a real ffmpeg filter', () => {
  for (const id of lookIds()) {
    if (id === 'standard') continue;
    const f = buildLookFilter(id);
    assert.ok(f.length > 5, `${id} should produce a filter`);
    assert.ok(!f.includes("'"), 'filters must not contain raw quotes');
  }
  assert.ok(buildLookFilter('cinematic').includes('eq='));
  assert.ok(buildLookFilter('noir').includes('hue=s=0'));
  assert.ok(buildLookFilter('neon').includes('saturation=1.55'));
});

test('vignette & grain filters', () => {
  assert.ok(buildVignetteFilter().startsWith('vignette='));
  assert.ok(buildGrainFilter(10).startsWith('noise=alls=10'));
  assert.ok(buildGrainFilter(999).includes('alls=30')); // clamped
  assert.ok(buildGrainFilter(0).includes('alls=1')); // floored
});

test('fade filter never exceeds segment duration', () => {
  const f = buildFadeFilter(2, 0.35);
  assert.ok(f.includes('fade=t=in'));
  assert.ok(f.includes('fade=t=out'));
  // For a 1s segment the fade must shrink
  const tiny = buildFadeFilter(1, 0.35);
  assert.ok(tiny.includes('d=0.33'));
});

test('beat flash is a white fade-in that decays into the scene', () => {
  const f = buildBeatFlashFilter();
  assert.ok(f.startsWith('fade=t=in:st=0:'));
  assert.ok(f.includes(':color=white'));
  assert.ok(f.includes('d=0.22'));
  // Duration is clamped to a sane flash window
  assert.ok(buildBeatFlashFilter('white', 99).includes('d=0.60'));
  assert.ok(buildBeatFlashFilter('cyan', 0.01).includes('d=0.08'));
});

test('watermark escapes drawtext-special characters', () => {
  const f = buildWatermarkFilter("My: Band's #1", '/f.ttf');
  // Expected escaped form: text='My\: Band\'s #1'
  assert.ok(f.includes("text='My\\: Band\\'s #1'"));
  assert.ok(f.includes('fontcolor=white@0.55'));
  assert.strictEqual(buildWatermarkFilter('', '/f.ttf'), '');
});

test('timecode overlay uses escaped pts format', () => {
  const f = buildTimecodeFilter('/f.ttf');
  assert.ok(f.includes("%{pts\\:hms}"));
  assert.ok(f.includes('box=1'));
});

test('chapters meta builds valid ffmeta from sections', () => {
  const meta = buildChaptersMeta(
    [
      { type: 'Verse', start: 0, end: 16 },
      { type: 'Chorus / Drop', start: 16, end: 32 },
    ],
    32
  );
  // One [CHAPTER] block per section (ffmetadata format)
  assert.strictEqual((meta.match(/\[CHAPTER\]/g) || []).length, 2);
  assert.ok(meta.includes('TIMEBASE=1/1000000'));
  assert.ok(meta.includes('START=0'));
  assert.ok(meta.includes('END=16000000'));
  assert.ok(meta.includes('title=Verse'));
  assert.ok(meta.includes('title=Chorus / Drop'));
  // Sections beyond totalDuration are dropped
  const clamped = buildChaptersMeta([{ type: 'Late', start: 40, end: 50 }], 32);
  assert.strictEqual(clamped, '');
});

test('chapters meta survives odd titles', () => {
  const meta = buildChaptersMeta([{ type: 'A: B;C\nD', start: 0, end: 5 }], 10);
  assert.ok(meta.includes('title=A B C D'));
  assert.ok(!meta.includes('\nD'));
});

test('suggestLook maps energy profiles to looks', () => {
  assert.strictEqual(suggestLook([]), 'cinematic');
  assert.strictEqual(
    suggestLook([
      { energy: 95, isDrop: true },
      { energy: 90, isDrop: true },
    ]),
    'neon'
  );
  assert.strictEqual(suggestLook([{ energy: 30 }, { energy: 40 }]), 'dreamy');
  assert.strictEqual(suggestLook([{ energy: 70 }, { energy: 75 }]), 'vivid');
  assert.strictEqual(suggestLook([{ energy: 55 }, { energy: 60 }]), 'cinematic');
});
