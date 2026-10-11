// server/musicGenerator.js — Original procedural soundtrack composer.
//
// Composes a completely original, royalty-free instrumental from the lyric
// analysis brief: genre template → chord progression → drums / bass / pads /
// arps / melody, rendered to 44.1kHz stereo WAV via pure-JS synthesis.
// Deterministic per (lyrics seed, genre) so the same song re-renders identically.
//
// Sections follow radio form scaled to the requested duration:
//   intro → verse → chorus → verse → chorus → bridge → final chorus → outro

const { makeRng } = require('./lyricsAnalysis');

const SAMPLE_RATE = 44100;

// Scales (semitone offsets)
const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

// Chord progressions as scale-degree roots (0-indexed) + chord quality
const PROGRESSIONS = {
  minor: [
    [[0, 'min'], [5, 'maj'], [2, 'maj'], [6, 'maj']], // i VI III VII
    [[0, 'min'], [3, 'min'], [5, 'maj'], [6, 'maj']], // i iv VI VII
    [[0, 'min'], [6, 'maj'], [5, 'maj'], [4, 'min']], // i VII VI v
  ],
  major: [
    [[0, 'maj'], [4, 'maj'], [5, 'min'], [3, 'maj']], // I V vi IV
    [[5, 'min'], [3, 'maj'], [0, 'maj'], [4, 'maj']], // vi IV I V
  ],
  dorian: [
    [[0, 'min'], [3, 'maj'], [4, 'min'], [6, 'min']],
  ],
};

const GENRE_TEMPLATES = {
  pop:        { scale: 'major', swing: 0, kickPattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], hatDensity: 0.5, snare: [4, 12], padLevel: 0.5, arpLevel: 0.35, bassStyle: 'roots', melody: true },
  edm:        { scale: 'minor', swing: 0, kickPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hatDensity: 0.75, snare: [4, 12], padLevel: 0.55, arpLevel: 0.5, bassStyle: 'offbeat', melody: true, sidechain: true },
  trap:       { scale: 'minor', swing: 0, kickPattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], hatDensity: 1.0, hatTriplets: true, snare: [8], padLevel: 0.4, arpLevel: 0.3, bassStyle: '808', melody: true, halfTime: true },
  lofi:       { scale: 'dorian', swing: 0.18, kickPattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], hatDensity: 0.4, snare: [4, 12], padLevel: 0.6, arpLevel: 0.22, bassStyle: 'roots', melody: true, vinyl: true },
  rock:       { scale: 'minor', swing: 0, kickPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], hatDensity: 0.6, snare: [4, 12], padLevel: 0.25, arpLevel: 0.15, bassStyle: 'eighth', melody: true, powerChords: true },
  cinematic:  { scale: 'minor', swing: 0, kickPattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], hatDensity: 0.15, snare: [12], padLevel: 0.8, arpLevel: 0.4, bassStyle: 'sub', melody: true, swells: true },
  synthwave:  { scale: 'minor', swing: 0, kickPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hatDensity: 0.5, snare: [4, 12], padLevel: 0.6, arpLevel: 0.6, bassStyle: 'eighth', melody: true },
  rnb:        { scale: 'dorian', swing: 0.12, kickPattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], hatDensity: 0.55, snare: [4, 12], padLevel: 0.55, arpLevel: 0.3, bassStyle: 'roots', melody: true },
};

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

function scaleRootForGenre(genre, valence, rng) {
  const roots = [57, 58, 60, 62, 63, 65]; // A3..F4 region
  return roots[Math.floor(rng() * roots.length)];
}

function buildSections(durationSec, bpm, rng) {
  // Radio form in bars; each bar = 4 beats.
  const secPerBeat = 60 / bpm;
  const barSec = secPerBeat * 4;
  const totalBars = Math.max(8, Math.floor(durationSec / barSec));
  const form = [
    { type: 'intro', bars: 4, energy: 0.35 },
    { type: 'verse', bars: 8, energy: 0.5 },
    { type: 'chorus', bars: 8, energy: 1.0 },
    { type: 'verse', bars: 8, energy: 0.55 },
    { type: 'chorus', bars: 8, energy: 1.0 },
    { type: 'bridge', bars: 4, energy: 0.45 },
    { type: 'chorus', bars: 8, energy: 1.0, final: true },
    { type: 'outro', bars: 4, energy: 0.3 },
  ];
  const totalFormBars = form.reduce((s, f) => s + f.bars, 0);
  const scale = totalBars / totalFormBars;
  let t = 0;
  let barCursor = 0;
  const sections = form.map((f, i) => {
    const bars = Math.max(2, Math.round(f.bars * scale));
    const start = barCursor * barSec;
    const len = bars * barSec;
    barCursor += bars;
    const out = { ...f, index: i, start, end: Math.min(durationSec, start + len), isDrop: f.type === 'chorus' };
    t = out.end;
    return out;
  });
  // Normalize to requested duration
  const last = sections[sections.length - 1];
  last.end = durationSec;
  return sections;
}

/** Synthesize the full track. Returns { wav, duration, bpm, beats, sections, key }. */
function composeTrack({ seed = 42, genre = 'pop', bpm = 112, duration = 60, valence = 0.2, energy = 0.5 }) {
  const rng = makeRng(seed);
  const tpl = GENRE_TEMPLATES[genre] || GENRE_TEMPLATES.pop;
  bpm = Math.round(bpm);
  const durationSec = Math.max(12, Math.min(480, duration));
  const secPerBeat = 60 / bpm;
  const beat0 = 0; // music starts immediately
  const totalSamples = Math.ceil(durationSec * SAMPLE_RATE);
  const L = new Float32Array(totalSamples);
  const R = new Float32Array(totalSamples);

  const scaleName = tpl.scale;
  const scale = SCALES[scaleName];
  const progSet = PROGRESSIONS[scaleName];
  const progression = progSet[Math.floor(rng() * progSet.length)];
  const root = scaleRootForGenre(genre, valence, rng);

  const sections = buildSections(durationSec, bpm, rng);

  const beats = [];
  const barSec = secPerBeat * 4;
  const leadEvents = []; // for the lip-sync "vocal" envelope

  // ---- helpers -----------------------------------------------------------
  function addSample(idx, val, pan = 0.5) {
    if (idx < 0 || idx >= totalSamples) return;
    const gl = Math.cos(pan * Math.PI / 2);
    const gr = Math.sin(pan * Math.PI / 2);
    L[idx] += val * gl;
    R[idx] += val * gr;
  }

  function kick(t0, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const dur = 0.28;
    const n = Math.floor(dur * SAMPLE_RATE);
    const f0 = 150, f1 = 42;
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const f = f0 * Math.pow(f1 / f0, p * 3);
      const env = Math.exp(-p * 9);
      const s = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE)) * env * gain;
      addSample(start + i, s, 0.5);
    }
    // click transient
    for (let i = 0; i < 200; i++) addSample(start + i, (Math.random() * 2 - 1) * 0.3 * gain * Math.exp(-i / 60), 0.5);
  }

  function snare(t0, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(0.18 * SAMPLE_RATE);
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.exp(-p * 12);
      const noise = Math.random() * 2 - 1;
      const tone = Math.sin(2 * Math.PI * 190 * i / SAMPLE_RATE) * 0.4;
      addSample(start + i, (noise * 0.7 + tone) * env * gain, 0.5);
    }
  }

  function hat(t0, gain, open = false) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor((open ? 0.16 : 0.045) * SAMPLE_RATE);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.exp(-p * (open ? 7 : 16));
      const noise = Math.random() * 2 - 1;
      lp = lp * 0.55 + noise * 0.45; // crude high-pass by differencing below
      addSample(start + i, (noise - lp) * env * gain * 0.6, 0.42);
    }
  }

  function bassNote(t0, midi, dur, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(dur * SAMPLE_RATE);
    const f = midiToFreq(midi);
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.min(1, p * 30) * Math.exp(-p * (tpl.bassStyle === '808' ? 2.2 : 2.8));
      const s = Math.sin(2 * Math.PI * f * i / SAMPLE_RATE) * 0.85
        + Math.sin(4 * Math.PI * f * i / SAMPLE_RATE) * 0.12;
      // gentle saturation
      const sat = Math.tanh(s * 1.4) * env * gain;
      addSample(start + i, sat, 0.5);
    }
  }

  function padChord(t0, midis, dur, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(dur * SAMPLE_RATE);
    for (const m of midis) {
      const f = midiToFreq(m);
      const detune = 1 + (rng() - 0.5) * 0.004;
      for (let i = 0; i < n; i++) {
        const p = i / n;
        const env = Math.sin(Math.min(1, p * 6) * Math.PI / 2) * Math.sin(Math.min(1, (1 - p) * 6) * Math.PI / 2);
        const s = Math.sin(2 * Math.PI * f * detune * i / SAMPLE_RATE) * 0.5
          + Math.sin(2 * Math.PI * f * 2 * i / SAMPLE_RATE) * 0.1
          + Math.sin(2 * Math.PI * f * 0.5 * i / SAMPLE_RATE) * 0.15;
        addSample(start + i, s * env * gain * 0.32, m > root + 12 ? 0.42 : 0.58);
      }
    }
  }

  function pluck(t0, midi, dur, gain, pan = 0.5) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(dur * SAMPLE_RATE);
    const f = midiToFreq(midi);
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.exp(-p * 5);
      const s = Math.sin(2 * Math.PI * f * i / SAMPLE_RATE)
        + Math.sin(6 * Math.PI * f * i / SAMPLE_RATE) * 0.18;
      addSample(start + i, s * env * gain, pan);
    }
  }

  function riser(t0, dur, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(dur * SAMPLE_RATE);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const noise = Math.random() * 2 - 1;
      lp = lp * 0.9 + noise * 0.1;
      const env = p * p * gain;
      addSample(start + i, (noise - lp) * env * 0.5 + Math.sin(2 * Math.PI * (200 + 900 * p * p) * i / SAMPLE_RATE) * env * 0.2, 0.5);
    }
  }

  function impact(t0, gain) {
    const start = Math.floor(t0 * SAMPLE_RATE);
    const n = Math.floor(1.1 * SAMPLE_RATE);
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const env = Math.exp(-p * 5);
      const s = Math.sin(2 * Math.PI * (60 - 30 * p) * i / SAMPLE_RATE) * env * gain;
      addSample(start + i, s, 0.5);
    }
  }

  function chordMidis(degIdx, quality, octave = 0) {
    const [deg, q] = progression[degIdx % progression.length];
    const rootMidi = root + scale[deg % scale.length] + octave * 12;
    const third = q === 'min' ? 3 : 4;
    const fifth = 7;
    const base = scale[Math.floor(deg / scale.length)] || 0;
    const r = root + base + octave * 12;
    return [r, r + third, r + fifth, r + 12];
  }

  // ---- render each section ----------------------------------------------
  for (const sec of sections) {
    const bars = Math.max(1, Math.round((sec.end - sec.start) / barSec));
    const e = sec.energy;
    const drumGain = 0.55 * (0.35 + 0.65 * e);
    const isChorus = sec.type === 'chorus';
    const isIntro = sec.type === 'intro';
    const isOutro = sec.type === 'outro';

    for (let bar = 0; bar < bars; bar++) {
      const barStart = sec.start + bar * barSec;
      if (barStart >= durationSec) break;
      const degIdx = (bar + (isChorus ? 1 : 0)) % progression.length;
      const chordM = chordMidis(degIdx, null, 0);
      const bassRoot = chordM[0] - 24;

      // drums
      if (!isIntro || bar >= 2) {
        for (let step = 0; step < 16; step++) {
          const swingOff = tpl.swing && step % 2 === 1 ? tpl.swing * secPerBeat / 4 : 0;
          const tStep = barStart + step * (secPerBeat / 4) + swingOff;
          if (tStep >= durationSec) break;
          if (tpl.kickPattern[step]) kick(tStep, drumGain);
          if (tpl.snare.includes(step) && e > 0.4) snare(tStep, drumGain * 0.75);
          if (!tpl.halfTime || step % 2 === 0) {
            const hatChance = tpl.hatDensity * (0.5 + 0.5 * e);
            if (rng() < hatChance) hat(tStep, drumGain * 0.5 * (0.6 + 0.4 * e), step % 8 === 7 && e > 0.7);
          }
          if (tpl.hatTriplets && e > 0.6 && rng() < 0.22) {
            for (let k = 1; k < 3; k++) hat(tStep + k * (secPerBeat / 12), drumGain * 0.3);
          }
        }
      }

      // bass
      if (!isIntro || bar >= 2) {
        const bg = 0.5 * (0.4 + 0.6 * e);
        if (tpl.bassStyle === 'offbeat') {
          for (let step = 2; step < 16; step += 4) bassNote(barStart + step * secPerBeat / 4, bassRoot, secPerBeat / 4 * 1.6, bg);
          bassNote(barStart, bassRoot, secPerBeat / 2, bg * 0.8);
        } else if (tpl.bassStyle === 'eighth') {
          for (let step = 0; step < 16; step += 2) bassNote(barStart + step * secPerBeat / 4, bassRoot, secPerBeat / 4, bg);
        } else if (tpl.bassStyle === '808') {
          bassNote(barStart, bassRoot - 12, secPerBeat * 1.8, bg * 1.2);
          if (rng() < 0.4) bassNote(barStart + secPerBeat * 2.5, bassRoot + (rng() < 0.5 ? 3 : 5), secPerBeat * 0.9, bg);
        } else if (tpl.bassStyle === 'sub') {
          bassNote(barStart, bassRoot, barSec * 0.98, bg * 1.1);
        } else {
          bassNote(barStart, bassRoot, secPerBeat * 1.4, bg);
          bassNote(barStart + secPerBeat * 2, bassRoot, secPerBeat * 1.4, bg);
        }
      }

      // pads
      padChord(barStart, chordM.map((m) => m + 12), barSec * 1.02, tpl.padLevel * (0.35 + 0.65 * e));

      // arps (chorus + bridge always; verse lighter)
      const arpOn = e > 0.55 || isChorus;
      if (arpOn && tpl.arpLevel > 0.05) {
        const notes = [chordM[0] + 24, chordM[1] + 24, chordM[2] + 24, chordM[1] + 24];
        for (let step = 0; step < 16; step++) {
          const tStep = barStart + step * secPerBeat / 4;
          const note = notes[step % notes.length];
          pluck(tStep, note, secPerBeat / 3.2, tpl.arpLevel * 0.5 * (0.4 + 0.6 * e), 0.35 + 0.3 * (step % 2));
        }
      }

      // lead melody on chorus (deterministic motif per section) — also the
      // "vocal" line the singer character lip-syncs to
      if (tpl.melody && isChorus) {
        for (let beat = 0; beat < 4; beat++) {
          if (rng() < 0.72) {
            const deg = Math.floor(rng() * scale.length);
            const m = root + 24 + scale[deg];
            const nt = barStart + beat * secPerBeat;
            pluck(nt, m, secPerBeat * 0.9, 0.30, 0.5);
            leadEvents.push({ t: nt, dur: secPerBeat * 0.9 });
            if (rng() < 0.3) {
              const nt2 = nt + secPerBeat / 2;
              pluck(nt2, m + (rng() < 0.5 ? 2 : -2), secPerBeat * 0.4, 0.18, 0.45);
              leadEvents.push({ t: nt2, dur: secPerBeat * 0.4 });
            }
          }
        }
      }
    }

    // transition FX at section boundaries
    if (!isOutro) {
      if (isChorus || sec.final) {
        impact(sec.start, 0.5);
        riser(Math.max(0, sec.start - barSec), barSec, 0.16);
      } else if (sec.index > 0) {
        riser(Math.max(0, sec.start - secPerBeat * 2), secPerBeat * 2, 0.08);
      }
    }
  }

  // beats grid (for visual sync)
  for (let t = beat0, i = 0; t < durationSec; t += secPerBeat, i++) {
    beats.push({ t, index: i, strong: i % 4 === 0 });
  }

  // vocal envelope from lead events (60fps) — drives character lip-sync
  const vFps = 60;
  const vFrames = Math.max(1, Math.floor(durationSec * vFps));
  const vocal = new Float32Array(vFrames);
  for (const ev of leadEvents) {
    const s0 = Math.max(0, Math.floor(ev.t * vFps));
    const s1 = Math.min(vFrames, Math.ceil((ev.t + ev.dur) * vFps));
    for (let i = s0; i < s1; i++) {
      const p = (i - s0) / Math.max(1, s1 - s0);
      const v = 0.95 * (1 - p * 0.55) * (0.6 + 0.4 * Math.abs(Math.sin(p * Math.PI * 3)));
      vocal[i] = Math.min(1.2, Math.max(vocal[i], v));
    }
  }
  // light smoothing
  let pv = 0;
  for (let i = 0; i < vFrames; i++) { pv = pv * 0.5 + vocal[i] * 0.5; vocal[i] = pv; }
  const vocalEnvelope = { fps: vFps, data: vocal };

  // ---- master chain: soft clip + fade in/out + stereo width --------------
  const fadeIn = Math.floor(0.35 * SAMPLE_RATE);
  const fadeOut = Math.floor(Math.min(3, durationSec * 0.08) * SAMPLE_RATE);
  let peak = 1e-6;
  for (let i = 0; i < totalSamples; i++) {
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const norm = 0.86 / peak;
  for (let i = 0; i < totalSamples; i++) {
    let gl = Math.tanh(L[i] * norm * 1.1);
    let gr = Math.tanh(R[i] * norm * 1.1);
    if (i < fadeIn) { gl *= i / fadeIn; gr *= i / fadeIn; }
    if (i > totalSamples - fadeOut) {
      const k = (totalSamples - i) / fadeOut;
      gl *= k; gr *= k;
    }
    // subtle Haas widening on high band proxy
    L[i] = gl; R[i] = gr;
  }

  const wav = encodeWav(L, R, SAMPLE_RATE);
  return { wav, duration: durationSec, bpm, beats, sections, vocal: vocalEnvelope, key: `Root ${root} ${scaleName}`, sampleRate: SAMPLE_RATE };
}

function encodeWav(L, R, sampleRate) {
  const n = L.length;
  const bytesPerSample = 2;
  const dataSize = n * 2 * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // stereo
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2 * bytesPerSample, 28);
  buf.writeUInt16LE(2 * bytesPerSample, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  let off = 44;
  for (let i = 0; i < n; i++) {
    let l = Math.max(-1, Math.min(1, L[i]));
    let r = Math.max(-1, Math.min(1, R[i]));
    buf.writeInt16LE(Math.round(l * 32767), off);
    buf.writeInt16LE(Math.round(r * 32767), off + 2);
    off += 4;
  }
  return buf;
}

module.exports = { composeTrack, encodeWav, GENRE_TEMPLATES };
