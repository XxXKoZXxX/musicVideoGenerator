// lyricsEngine.test.js - Unit tests for LyricsEngine
import { LyricsEngine } from '../LyricsEngine';

describe('LyricsEngine', () => {
  test('parses timestamped LRC format lyrics correctly', () => {
    const rawLrc = `[00:00.00] Welcome to the future
[00:04.50] Neon lights are glowing
[00:09.00] Bass drops in the underground`;

    const parsed = LyricsEngine.parseLyrics(rawLrc, 30);
    expect(parsed.length).toBe(3);
    expect(parsed[0].text).toBe('Welcome to the future');
    expect(parsed[0].time).toBe(0);
    expect(parsed[0].duration).toBe(4.5);
    expect(parsed[1].text).toBe('Neon lights are glowing');
    expect(parsed[1].time).toBe(4.5);
  });

  test('auto-distributes timestamps for untimed text lines across duration', () => {
    const untimedText = `Line One
Line Two
Line Three
Line Four`;

    const parsed = LyricsEngine.parseLyrics(untimedText, 20);
    expect(parsed.length).toBe(4);
    expect(parsed[0].time).toBe(0);
    expect(parsed[1].time).toBe(5);
    expect(parsed[2].time).toBe(10);
    expect(parsed[3].time).toBe(15);
    expect(parsed[3].duration).toBe(5);
  });

  test('getActiveLyric returns the current active lyric at a given timestamp', () => {
    const rawLrc = `[00:00.00] Intro line
[00:05.00] Verse line
[00:10.00] Chorus line`;

    const parsed = LyricsEngine.parseLyrics(rawLrc, 20);

    const activeAt2 = LyricsEngine.getActiveLyric(parsed, 2);
    expect(activeAt2).toBeDefined();
    expect(activeAt2.text).toBe('Intro line');

    const activeAt7 = LyricsEngine.getActiveLyric(parsed, 7);
    expect(activeAt7).toBeDefined();
    expect(activeAt7.text).toBe('Verse line');

    const activeAt15 = LyricsEngine.getActiveLyric(parsed, 15);
    expect(activeAt15).toBeDefined();
    expect(activeAt15.text).toBe('Chorus line');
  });

  test('returns null for empty lyrics or out-of-range timestamp', () => {
    const parsedEmpty = LyricsEngine.parseLyrics('', 30);
    expect(parsedEmpty.length).toBe(0);
    expect(LyricsEngine.getActiveLyric(parsedEmpty, 5)).toBeNull();
  });
});
