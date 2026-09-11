// src/services/__tests__/beatDetector.test.js
import {
  computeOnsetEnvelope,
  detectBPMFromOnsets,
  detectBPMFromChannelData,
  mixToMono,
} from '../BeatDetector';

/**
 * Synthesizes a mono kick-drum pattern at a given BPM:
 * exponentially decaying 60Hz pulses, one per beat, plus quiet noise floor.
 */
function synthesizeKicks(bpm, seconds = 16, sampleRate = 22050) {
  const total = Math.floor(seconds * sampleRate);
  const out = new Float32Array(total);
  const spb = Math.floor((60 / bpm) * sampleRate);
  for (let i = 0; i < total; i++) {
    const inBeat = i % spb;
    const env = Math.exp(-inBeat / (spb * 0.18));
    const kick = Math.sin((2 * Math.PI * 55 * i) / sampleRate) * env;
    out[i] = kick * 0.9 + (Math.random() * 2 - 1) * 0.004;
  }
  return out;
}

describe('BeatDetector', () => {
  test('onset envelope has peaks aligned with beats', () => {
    const data = synthesizeKicks(120, 8);
    const env = computeOnsetEnvelope(data, 22050);
    expect(env.length).toBeGreaterThan(100);
    // Max onset should occur near a beat boundary (within one hop)
    let maxIdx = 0;
    env.forEach((v, i) => {
      if (v > env[maxIdx]) maxIdx = i;
    });
    const hopSeconds = 1 / 50;
    const t = maxIdx * hopSeconds;
    const beatPeriod = 0.5; // 120 BPM
    const phase = t % beatPeriod;
    expect(Math.min(phase, beatPeriod - phase)).toBeLessThan(hopSeconds * 2);
  });

  test.each([
    [90, [80, 100]],
    [128, [118, 138]],
    [150, [140, 160]],
  ])('detects %i BPM kicks within %j', (bpm, [lo, hi]) => {
    const data = synthesizeKicks(bpm, 16);
    const { bpm: detected, confidence } = detectBPMFromChannelData(data, 22050);
    expect(detected).toBeGreaterThanOrEqual(lo);
    expect(detected).toBeLessThanOrEqual(hi);
    expect(confidence).toBeGreaterThan(0);
  });

  test('detectBPMFromOnsets folds to the plausible tempo window', () => {
    // Onset envelope with period 0.4688s (128 BPM) at 50 fps -> lag 23-24
    const hop = 1 / 50;
    const period = Math.round(60 / 128 / hop);
    const onsets = new Array(50 * 20).fill(0.02);
    for (let i = 0; i < onsets.length; i += period) onsets[i] = 1;
    const { bpm } = detectBPMFromOnsets(onsets, hop);
    expect(bpm).toBeGreaterThanOrEqual(118);
    expect(bpm).toBeLessThanOrEqual(138);
  });

  test('silence returns low-confidence default', () => {
    const data = new Float32Array(22050 * 8).fill(0);
    const { confidence } = detectBPMFromChannelData(data, 22050);
    expect(confidence).toBe(0);
  });

  test('mixToMono averages channels', () => {
    const buffer = {
      numberOfChannels: 2,
      length: 4,
      getChannelData: (ch) => (ch === 0 ? [1, 1, 1, 1] : [0.5, 0.5, 0.5, 0.5]),
    };
    const mono = mixToMono(buffer);
    expect(Array.from(mono)).toEqual([0.75, 0.75, 0.75, 0.75]);
  });
});
