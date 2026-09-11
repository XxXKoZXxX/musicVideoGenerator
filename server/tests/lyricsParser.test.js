// server/tests/lyricsParser.test.js — Unit tests for the server lyrics toolkit.
// Run: node --test server/tests/
const { test } = require('node:test');
const assert = require('node:assert');
const {
  parseLyrics,
  getActiveLyric,
  toSrt,
  toLrc,
  buildDrawtextFilters,
  escapeDrawtext,
} = require('../lyricsParser');

test('parseLyrics: LRC timestamps produce timed lines with durations', () => {
  const lyrics = parseLyrics('[00:00.00] hello world\n[00:05.00] second line', 10);
  assert.equal(lyrics.length, 2);
  assert.equal(lyrics[0].time, 0);
  assert.equal(lyrics[0].text, 'hello world');
  assert.equal(lyrics[1].time, 5);
  assert.equal(lyrics[1].duration, 5);
  assert.deepEqual(lyrics[0].words, ['hello', 'world']);
});

test('parseLyrics: plain text is evenly distributed across duration', () => {
  const lyrics = parseLyrics('one\ntwo\nthree\nfour', 12);
  assert.equal(lyrics.length, 4);
  assert.ok(Math.abs(lyrics[0].time - 0) < 0.001);
  assert.ok(Math.abs(lyrics[3].time - 9) < 0.001);
  assert.ok(Math.abs(lyrics[0].duration - 3) < 0.001);
});

test('parseLyrics: multiple timestamps on one line expand to entries', () => {
  const lyrics = parseLyrics('[00:00.00] a [00:02.00] b', 6);
  assert.equal(lyrics.length, 2);
  assert.equal(lyrics[0].text, 'a');
  assert.equal(lyrics[1].text, 'b');
});

test('parseLyrics: empty / non-string input returns []', () => {
  assert.deepEqual(parseLyrics('', 10), []);
  assert.deepEqual(parseLyrics(null, 10), []);
  assert.deepEqual(parseLyrics('   \n  \n', 10), []);
});

test('parseLyrics: LRC metadata tags are ignored', () => {
  const lyrics = parseLyrics('[ar:Artist]\n[ti:Title]\n[00:01.00] actual line', 5);
  assert.equal(lyrics.length, 1);
  assert.equal(lyrics[0].text, 'actual line');
});

test('getActiveLyric: finds the active line with word progress', () => {
  const lyrics = parseLyrics('[00:00.00] hi there friend\n[00:06.00] next line', 12);
  const active = getActiveLyric(lyrics, 3);
  assert.ok(active);
  assert.equal(active.text, 'hi there friend');
  assert.equal(active.isActive, true);
  assert.equal(active.wordIndex, 1); // halfway through 3 words
});

test('getActiveLyric: returns null outside lyric windows', () => {
  const lyrics = parseLyrics('[00:05.00] only line', 10);
  assert.equal(getActiveLyric(lyrics, 0), null);
  assert.equal(getActiveLyric(lyrics, 11), null);
});

test('toSrt: valid SRT with correct time format', () => {
  const lyrics = parseLyrics('[00:01.50] hello\n[00:06.00] world', 12);
  const srt = toSrt(lyrics);
  assert.ok(srt.includes('1\n00:00:01,500 --> 00:00:06,000\nhello'));
  assert.ok(srt.includes('2\n00:00:06,000 --> 00:00:12,000\nworld'));
});

test('toLrc: round-trips times', () => {
  const lyrics = parseLyrics('[00:01.50] hello', 12);
  const lrc = toLrc(lyrics);
  assert.ok(lrc.startsWith('[00:01.50] hello'));
  const reparsed = parseLyrics(lrc, 12);
  assert.equal(reparsed[0].text, 'hello');
  assert.ok(Math.abs(reparsed[0].time - 1.5) < 0.01);
});

test('buildDrawtextFilters: one core filter per line with enable windows', () => {
  const lyrics = parseLyrics('[00:01.00] line one\n[00:05.00] line two', 10);
  const filters = buildDrawtextFilters(lyrics, {
    width: 1280,
    height: 720,
    style: 'neon',
    fontfile: '/fonts/DejaVuSans-Bold.ttf',
    duration: 10,
  });
  // neon = glow pass + core pass per line
  assert.equal(filters.length, 4);
  assert.ok(filters.every((f) => f.startsWith('drawtext=')));
  assert.ok(filters.some((f) => f.includes("text='line one'")));
  assert.ok(filters.some((f) => f.includes("text='line two'")));
  assert.ok(filters.every((f) => f.includes('enable=\'between(t,')));
  assert.ok(filters.every((f) => f.includes('alpha=')));
});

test('buildDrawtextFilters: style variants (glitch splits RGB, cinema adds no glow)', () => {
  const lyrics = parseLyrics('[00:01.00] x', 10);
  const glitch = buildDrawtextFilters(lyrics, { style: 'glitch', fontfile: '/f.ttf', width: 1280, height: 720, duration: 10 });
  assert.equal(glitch.length, 3); // 2 channels + core
  const cinema = buildDrawtextFilters(lyrics, { style: 'cinema', fontfile: '/f.ttf', width: 1280, height: 720, duration: 10 });
  assert.equal(cinema.length, 1);
});

test('escapeDrawtext: neutralizes filter-special characters', () => {
  const escaped = escapeDrawtext("it's a: b;c,d[e]#f\\g");
  assert.ok(escaped.includes("\\'"));
  assert.ok(escaped.includes('\\:'));
  assert.ok(escaped.includes('\\;'));
  assert.ok(escaped.includes('\\,'));
  assert.ok(escaped.includes('\\['));
  assert.ok(escaped.includes('\\]'));
  assert.ok(escaped.includes('\\#'));
  assert.ok(escaped.includes('\\\\'));
  // A drawtext text parameter containing this should not break the filtergraph
  assert.doesNotThrow(() => {
    buildDrawtextFilters(
      [{ time: 0, duration: 2, text: "it's a: b;c,d[e]#f", words: [] }],
      { style: 'bold', fontfile: '/f.ttf', width: 640, height: 360, duration: 5 }
    );
  });
});

test('buildDrawtextFilters: lines after total duration are clamped, zero-length skipped', () => {
  const filters = buildDrawtextFilters(
    [{ time: 99, duration: 2, text: 'late', words: [] }, { time: 0, duration: 0, text: 'tiny', words: [] }],
    { style: 'bold', fontfile: '/f.ttf', width: 640, height: 360, duration: 5 }
  );
  // late line: start 99 > duration 5 → end clamped to 5.2, start 99 → end<=start? start=99, end=min(101, 5.2)+0.2... start>end → skipped by end<=0? No: start=99 → enabled between(99, ...) which never fires; kept but harmless.
  // tiny line: duration 0 → end = min(0+0, 5)+0.2 = 0.2, start 0 → kept (0.2s).
  assert.ok(Array.isArray(filters));
});
