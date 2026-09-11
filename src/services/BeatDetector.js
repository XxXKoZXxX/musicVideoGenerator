// src/services/BeatDetector.js — Onset-based BPM detection with tempo disambiguation.
// Pure functions over sample data so the core is fully unit-testable; the
// decodeAudioData wrapper is the only browser-dependent piece.

/**
 * Computes a frame-based onset strength envelope from a mono channel.
 * Uses half-wave rectified energy flux (difference of frame RMS), a simple
 * but robust "spectral flux" approximation that needs no FFT.
 *
 * @param {Float32Array|number[]} data - Mono PCM samples
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} hopSeconds - Frame hop in seconds (default 1/50 = 50fps)
 * @returns {number[]} Onset strengths (0..1 normalized)
 */
export function computeOnsetEnvelope(data, sampleRate, hopSeconds = 1 / 50) {
  if (!data || data.length < 2) return [];
  const hop = Math.max(1, Math.floor(sampleRate * hopSeconds));
  const frames = Math.floor(data.length / hop);
  if (frames < 4) return [];

  // Frame RMS energies
  const energies = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const start = f * hop;
    for (let i = 0; i < hop; i++) {
      const s = data[start + i];
      sum += s * s;
    }
    energies[f] = Math.sqrt(sum / hop);
  }

  // Half-wave rectified flux
  const flux = new Float32Array(frames);
  let max = 0;
  for (let f = 1; f < frames; f++) {
    const diff = energies[f] - energies[f - 1];
    const v = diff > 0 ? diff : 0;
    flux[f] = v;
    if (v > max) max = v;
  }
  if (max <= 0) return [];
  const envelope = Array.from(flux, (v) => v / max);
  return envelope;
}

/**
 * Detects BPM from an onset envelope via autocorrelation with
 * half/double-tempo disambiguation (tempos are folded into 70–180 BPM).
 *
 * @param {number[]} onsets - Normalized onset envelope
 * @param {number} hopSeconds - Frame hop in seconds (must match computeOnsetEnvelope)
 * @returns {{bpm: number, confidence: number}} Detected tempo + 0..1 confidence
 */
export function detectBPMFromOnsets(onsets, hopSeconds = 1 / 50) {
  if (!onsets || onsets.length < 8) return { bpm: 120, confidence: 0 };

  const minLag = Math.max(2, Math.round((60 / 180) / hopSeconds)); // 180 BPM
  const maxLag = Math.min(onsets.length - 1, Math.round((60 / 60) / hopSeconds)); // 60 BPM

  // Autocorrelation of the onset envelope
  let bestLag = 0;
  let bestScore = -Infinity;
  let totalEnergy = 0;
  for (let i = 0; i < onsets.length; i++) totalEnergy += onsets[i] * onsets[i];
  if (totalEnergy <= 0) return { bpm: 120, confidence: 0 };

  const scores = new Map();
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < onsets.length - lag; i++) {
      corr += onsets[i] * onsets[i + lag];
    }
    // Normalized correlation
    const score = corr / totalEnergy;
    scores.set(lag, score);
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  if (bestLag === 0 || bestScore <= 0) return { bpm: 120, confidence: 0 };

  const baseBpm = 60 / (bestLag * hopSeconds);

  // ---- Tempo disambiguation: fold into 70..180 window ----
  // Gather candidate tempo hypotheses (half, base, double) and score each
  // by how strongly its onsets align (correlation at the corresponding lag).
  const candidates = [baseBpm / 2, baseBpm, baseBpm * 2];
  let best = { bpm: 120, score: -Infinity };
  for (const bpm of candidates) {
    if (bpm < 65 || bpm > 190) continue;
    const lag = Math.round((60 / bpm) / hopSeconds);
    const s = scores.get(lag) ?? 0;
    // Slight prior toward the human-plausible 90–160 band
    const prior = bpm >= 90 && bpm <= 160 ? 1.0 : 0.85;
    const weighted = s * prior;
    if (weighted > best.score) best = { bpm, score: weighted };
  }

  const bpm = Math.round(Math.min(180, Math.max(65, best.bpm)));
  const confidence = Math.max(0, Math.min(1, bestScore));
  return { bpm, confidence };
}

/**
 * Full pipeline: mono samples -> onset envelope -> BPM.
 *
 * @returns {{bpm: number, confidence: number}}
 */
export function detectBPMFromChannelData(data, sampleRate) {
  try {
    const envelope = computeOnsetEnvelope(data, sampleRate);
    const { bpm, confidence } = detectBPMFromOnsets(envelope, 1 / 50);
    return confidence > 0.08 ? { bpm, confidence } : { bpm: 120, confidence: 0 };
  } catch {
    return { bpm: 120, confidence: 0 };
  }
}

/**
 * Mixes down a multi-channel AudioBuffer to mono.
 */
export function mixToMono(buffer) {
  const channels = buffer.numberOfChannels;
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) out[i] += data[i];
  }
  for (let i = 0; i < len; i++) out[i] /= channels;
  return out;
}

/**
 * Detects the BPM of a decoded Web Audio AudioBuffer.
 */
export function detectBPMFromBuffer(buffer) {
  try {
    const mono = mixToMono(buffer);
    return detectBPMFromChannelData(mono, buffer.sampleRate);
  } catch {
    return { bpm: 120, confidence: 0 };
  }
}

/**
 * Detects the BPM of an audio file in the browser (async decode).
 * Falls back gracefully when Web Audio is unavailable.
 */
export async function detectBPMFromAudioFile(fileOrUrl) {
  try {
    const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AudioCtx) return { bpm: 120, confidence: 0 };
    const ctx = new AudioCtx();
    let arrayBuffer;
    if (typeof fileOrUrl === 'string') {
      const res = await fetch(fileOrUrl);
      arrayBuffer = await res.arrayBuffer();
    } else {
      arrayBuffer = await fileOrUrl.arrayBuffer();
    }
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    const result = detectBPMFromBuffer(decoded);
    try {
      await ctx.close();
    } catch (_) {}
    return result;
  } catch {
    return { bpm: 120, confidence: 0 };
  }
}
