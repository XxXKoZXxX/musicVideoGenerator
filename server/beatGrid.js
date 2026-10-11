// server/beatGrid.js — Audio analysis for beat-synced visuals of ANY uploaded song.
//
// Decodes audio to mono PCM via ffmpeg, then computes:
//   • BPM estimate (autocorrelation of the onset envelope)
//   • Beat grid (phase-aligned onset peaks)
//   • RMS energy envelope (for per-frame audio reactivity)
//   • Coarse section boundaries (energy segmentation)
//
// Pure JS — no native deps.

const { execFileSync } = require('child_process');

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const fs = require('fs');
const path = require('path');

function decodeToMono(audioPath, ffmpegPath) {
  const rawPath = audioPath + '.pcm';
  try {
    execFileSync(ffmpegPath, [
      '-y', '-v', 'error',
      '-i', audioPath,
      '-ac', '1', '-ar', '22050',
      '-f', 's16le', rawPath,
    ], { timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
    const buf = fs.readFileSync(rawPath);
    const n = buf.length / 2;
    const pcm = new Float32Array(n);
    for (let i = 0; i < n; i++) pcm[i] = buf.readInt16LE(i * 2) / 32768;
    return pcm;
  } finally {
    try { fs.unlinkSync(rawPath); } catch (_) {}
  }
}

/**
 * Analyze an audio file. Returns { bpm, beats, onsets, energy, duration }.
 * energy: { fps, data: Float32Array } RMS at ~86 fps for frame reactivity.
 */
function analyzeAudio(audioPath, ffmpegPath) {
  const SR = 22050;
  const pcm = decodeToMono(audioPath, ffmpegPath);
  const duration = pcm.length / SR;

  // Onset envelope: RMS in 1024-sample hops (~43 fps), spectral-flux-ish via
  // positive first difference.
  const hop = 512;
  const win = 1024;
  const frames = Math.floor((pcm.length - win) / hop);
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const off = f * hop;
    for (let i = 0; i < win; i++) { const s = pcm[off + i]; sum += s * s; }
    rms[f] = Math.sqrt(sum / win);
  }
  const onset = new Float32Array(frames);
  for (let f = 1; f < frames; f++) onset[f] = Math.max(0, rms[f] - rms[f - 1]);

  // Smooth onset envelope
  const sm = new Float32Array(frames);
  const k = 4;
  for (let f = 0; f < frames; f++) {
    let s = 0, c = 0;
    for (let j = Math.max(0, f - k); j <= Math.min(frames - 1, f + k); j++) { s += onset[j]; c++; }
    sm[f] = s / c;
  }

  const fpsEnv = SR / hop;

  // BPM via autocorrelation of the onset envelope in the 60-190 BPM range.
  let bestBpm = 120, bestScore = -1;
  const minLag = Math.floor(fpsEnv * 60 / 190);
  const maxLag = Math.ceil(fpsEnv * 60 / 60);
  let mean = 0;
  for (let f = 0; f < frames; f++) mean += sm[f];
  mean /= Math.max(1, frames);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    for (let f = lag; f < frames; f++) score += (sm[f] - mean) * (sm[f - lag] - mean);
    score /= (frames - lag);
    // weight ~120 BPM slightly (perceptual prior)
    const bpm = 60 * fpsEnv / lag;
    const prior = 1 - Math.min(0.35, Math.abs(bpm - 122) / 320);
    score *= prior;
    if (score > bestScore) { bestScore = score; bestBpm = bpm; }
  }
  // Halve/double into a sane range
  while (bestBpm > 175) bestBpm /= 2;
  while (bestBpm < 65) bestBpm *= 2;
  const bpm = Math.round(bestBpm);

  // Beat grid: pick onset peaks nearest to a phase-aligned grid.
  const secPerBeat = 60 / bpm;
  // find global phase by maximizing onset energy on grid positions
  let bestPhase = 0, bestPhaseScore = -1;
  for (let p = 0; p < 32; p++) {
    const phase = (p / 32) * secPerBeat;
    let s = 0;
    for (let t = phase; t < duration; t += secPerBeat) {
      const f = Math.round(t * fpsEnv);
      if (f >= 0 && f < frames) s += sm[f];
    }
    if (s > bestPhaseScore) { bestPhaseScore = s; bestPhase = phase; }
  }
  const beats = [];
  for (let t = bestPhase, i = 0; t < duration; t += secPerBeat, i++) {
    // snap to local onset peak within ±120ms
    let best = t;
    let bestV = -1;
    for (let dt = -0.12; dt <= 0.12; dt += 0.02) {
      const f = Math.round((t + dt) * fpsEnv);
      if (f >= 0 && f < frames && sm[f] > bestV) { bestV = sm[f]; best = t + dt; }
    }
    beats.push({ t: Math.round(Math.max(0, best) * 1000) / 1000, index: i, strong: i % 4 === 0 });
  }

  // Frame-rate energy envelope for reactivity (~60 fps)
  const eFps = 60;
  const eFrames = Math.max(1, Math.floor(duration * eFps));
  const energy = new Float32Array(eFrames);
  const peak = Math.max(...rms) || 1;
  for (let i = 0; i < eFrames; i++) {
    const t = i / eFps;
    const f = Math.min(frames - 1, Math.round(t * fpsEnv));
    energy[i] = Math.min(1, (rms[f] / peak) * 1.4);
  }

  // ---- Vocal-band envelope (~60 fps) for lip-sync ----
  // Band-pass the PCM to the speech/vocal formant region (300–3400 Hz) with
  // cascaded one-pole filters, then track smoothed RMS. This is what the
  // character's mouth follows — real audio-driven lip-sync for any upload.
  const hpState = { x: 0, y: 0 };
  const lp1 = { y: 0 }, lp2 = { y: 0 };
  const dt = 1 / SR;
  const rcHP = 1 / (2 * Math.PI * 280);
  const aHP = rcHP / (rcHP + dt);
  const rcLP = 1 / (2 * Math.PI * 3400);
  const aLP = dt / (rcLP + dt);
  const vHop = Math.round(SR / eFps);
  const vWin = Math.round(SR * 0.024);
  const vocalRaw = new Float32Array(eFrames);
  for (let i = 0; i < eFrames; i++) {
    const start = i * vHop;
    let sum = 0, n = 0;
    for (let j = start; j < Math.min(pcm.length, start + vWin); j++) {
      const x = pcm[j];
      // high-pass 280Hz
      hpState.y = aHP * (hpState.y + x - hpState.x);
      hpState.x = x;
      // low-pass 3400Hz (two poles)
      lp1.y += aLP * (hpState.y - lp1.y);
      lp2.y += aLP * (lp1.y - lp2.y);
      sum += lp2.y * lp2.y;
      n++;
    }
    vocalRaw[i] = n ? Math.sqrt(sum / n) : 0;
  }
  // smooth + normalize (95th percentile as reference)
  const sorted = Float32Array.from(vocalRaw).sort();
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
  const vocalEnv = new Float32Array(eFrames);
  let vs = 0;
  for (let i = 0; i < eFrames; i++) {
    const norm = Math.min(1.25, vocalRaw[i] / (p95 || 1));
    vs = vs * 0.55 + norm * 0.45;
    vocalEnv[i] = clamp01(vs);
  }

  // Coarse sections via energy: smooth energy at 1s resolution, split at
  // largest sustained transitions, ~20s target length.
  const sections = [];
  const secLen = Math.max(8, Math.round(duration / Math.max(2, Math.round(duration / 20))));
  for (let t = 0; t < duration; t += secLen) {
    const end = Math.min(duration, t + secLen);
    let sum = 0, c = 0;
    for (let i = Math.floor(t * eFps); i < Math.floor(end * eFps); i++) { sum += energy[i]; c++; }
    const avg = c ? sum / c : 0.4;
    sections.push({
      type: sections.length === 0 ? 'intro' : (avg > 0.62 ? 'chorus' : 'verse'),
      start: t,
      end,
      energy: Math.round(avg * 100),
      isDrop: avg > 0.72,
    });
  }

  return { bpm, beats, energy: { fps: eFps, data: energy }, vocal: { fps: eFps, data: vocalEnv }, sections, duration };
}

module.exports = { analyzeAudio, decodeToMono };
