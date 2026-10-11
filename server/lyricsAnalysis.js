// server/lyricsAnalysis.js — Original-video lyric intelligence.
//
// Turns raw lyrics into a full creative brief that drives the generative
// video engine: song sections, per-line imagery → environments, emotion &
// energy arcs, color palettes, genre/mood classification and BPM suggestion.
//
// Zero network dependencies — 100% deterministic for a given input + seed.

const SECTION_TAGS = {
  intro: ['intro', 'prelude', 'overture'],
  verse: ['verse', 'v1', 'v2', 'v3'],
  prechorus: ['pre-chorus', 'prechorus', 'pre chorus', 'build', 'build-up'],
  chorus: ['chorus', 'hook', 'refrain', 'drop'],
  bridge: ['bridge', 'middle 8', 'middle-eight'],
  outro: ['outro', 'coda', 'fade'],
};

const STOPWORDS = new Set(('a an the and or but if then so as at by for from in into of on onto to with is are was were be been being am do does did doing have has had having i you he she it we they me him her them us my your his its our their this that these those not no yes oh o yeah ah eh hey na la da di duh gonna wanna gotta im ive ill youre dont cant wont lets just like when while who what where why how all any both each few more most other some such only own same too very can will would should could may might must shall about against between through during before after above below up down out off over under again further once here there').split(/\s+/));

// ---------------------------------------------------------------------------
// Imagery lexicon: maps lyric concepts to generative ENVIRONMENTS + palettes.
// Each keyword match scores its environment; the top env paints the scene.
// ---------------------------------------------------------------------------
const IMAGERY = [
  {
    env: 'neonCity',
    label: 'Neon City',
    words: ['city', 'street', 'streets', 'neon', 'lights', 'skyline', 'downtown', 'traffic', 'taxi', 'midnight', 'urban', 'concrete', 'crowd', 'club', 'dancefloor', 'subway', 'train', 'station', 'rain', 'neons', 'billboard', 'arcade', 'tokyo', 'vegas'],
    hue: [285, 320], // magenta/violet
    accent: '#ff2d95',
    night: true,
  },
  {
    env: 'synthwave',
    label: 'Retro Sunset Grid',
    words: ['retro', 'chrome', 'cassette', 'radio', 'ride', 'drive', 'driving', 'cruise', 'motor', 'engine', 'sunset', 'horizon', 'summer', 'eighties', '80s', 'arcade', 'laser', 'hologram'],
    hue: [15, 45], // sunset orange
    accent: '#ff9f1c',
    night: false,
  },
  {
    env: 'cosmos',
    label: 'Deep Cosmos',
    words: ['star', 'stars', 'space', 'galaxy', 'cosmic', 'universe', 'moon', 'planet', 'orbit', 'nebula', 'comet', 'sky', 'skies', 'infinity', 'eternal', 'astronaut', 'satellite', 'eclipse', 'celestial', 'constellation'],
    hue: [225, 265], // indigo
    accent: '#7b6cff',
    night: true,
  },
  {
    env: 'ocean',
    label: 'Moonlit Ocean',
    words: ['ocean', 'sea', 'wave', 'waves', 'tide', 'tides', 'shore', 'beach', 'sail', 'sailing', 'ship', 'boat', 'water', 'deep', 'drown', 'swim', 'coast', 'island', 'harbor', 'lighthouse'],
    hue: [190, 220], // cyan/teal
    accent: '#22d3ee',
    night: true,
  },
  {
    env: 'storm',
    label: 'Electric Storm',
    words: ['storm', 'rain', 'thunder', 'lightning', 'cloud', 'clouds', 'wind', 'hurricane', 'wild', 'chaos', 'fight', 'fighting', 'war', 'break', 'broken', 'crash', 'scream', 'angry', 'rage'],
    hue: [210, 240], // slate blue
    accent: '#8b9dff',
    night: true,
  },
  {
    env: 'embers',
    label: 'Fire & Embers',
    words: ['fire', 'burn', 'burning', 'flame', 'flames', 'blaze', 'ash', 'embers', 'smoke', 'spark', 'sparks', 'wildfire', 'heat', 'desire', 'passion', 'lava'],
    hue: [10, 35], // fire
    accent: '#ff5c33',
    night: true,
  },
  {
    env: 'forest',
    label: 'Enchanted Forest',
    words: ['forest', 'tree', 'trees', 'woods', 'leaf', 'leaves', 'green', 'river', 'garden', 'grow', 'roots', 'wildflower', 'meadow', 'valley', 'hills', 'bloom', 'mountain', 'mountains', 'trail', 'earth', 'home'],
    hue: [95, 150], // green
    accent: '#4ade80',
    night: false,
  },
  {
    env: 'snowfall',
    label: 'Winter Aurora',
    words: ['snow', 'winter', 'cold', 'ice', 'frozen', 'frost', 'chill', 'december', 'christmas', 'aurora', 'north', 'white'],
    hue: [180, 215], // ice
    accent: '#9be7ff',
    night: true,
  },
  {
    env: 'desert',
    label: 'Golden Desert',
    words: ['desert', 'sand', 'dune', 'dunes', 'mirage', 'canyon', 'sun', 'sunny', 'gold', 'golden', 'dust', 'road', 'highway', 'miles', 'journey', 'wander', 'wandering', 'freedom'],
    hue: [30, 55], // amber
    accent: '#ffb84d',
    night: false,
  },
  {
    env: 'cyberGrid',
    label: 'Cyber Tunnel',
    words: ['digital', 'cyber', 'machine', 'robot', 'android', 'code', 'glitch', 'virtual', 'wire', 'wires', 'electric', 'electricity', 'voltage', 'circuit', 'data', 'system', 'network', 'pixel', 'techno', 'future', 'future'],
    hue: [160, 200], // electric teal
    accent: '#00ffc8',
    night: true,
  },
  {
    env: 'hearts',
    label: 'Golden Hour Love',
    words: ['love', 'heart', 'hearts', 'kiss', 'kisses', 'baby', 'darling', 'honey', 'forever', 'together', 'hold', 'holding', 'touch', 'close', 'want', 'need', 'mine', 'soul', 'soulmate', 'wedding', 'valentine', 'beautiful'],
    hue: [330, 360], // rose/gold
    accent: '#ff8fb2',
    night: false,
  },
  {
    env: 'underwater',
    label: 'Underwater Dream',
    words: ['underwater', 'bubble', 'bubbles', 'coral', 'whale', 'dolphin', 'mermaid', 'float', 'floating', 'dream', 'dreaming', 'dreams', 'sleep', 'asleep', 'memory', 'memories', 'nostalgia', 'fading'],
    hue: [185, 230], // abyssal blue
    accent: '#5eead4',
    night: true,
  },
];

// Emotion lexicon → valence(-1..1) and energy(0..1) nudges.
const EMOTION_LEXICON = {
  // high-energy positive
  dance: { v: 0.8, e: 0.9 }, party: { v: 0.8, e: 0.9 }, alive: { v: 0.8, e: 0.8 }, fly: { v: 0.7, e: 0.8 }, flying: { v: 0.7, e: 0.8 }, high: { v: 0.6, e: 0.7 }, wild: { v: 0.3, e: 0.9 }, young: { v: 0.7, e: 0.7 }, free: { v: 0.8, e: 0.6 }, shine: { v: 0.8, e: 0.6 }, shining: { v: 0.8, e: 0.6 }, bright: { v: 0.7, e: 0.5 }, gold: { v: 0.6, e: 0.5 }, glory: { v: 0.7, e: 0.6 }, win: { v: 0.8, e: 0.7 }, champion: { v: 0.8, e: 0.8 }, rise: { v: 0.7, e: 0.7 }, rising: { v: 0.7, e: 0.7 }, stronger: { v: 0.6, e: 0.7 },
  // warm positive
  love: { v: 0.9, e: 0.4 }, heart: { v: 0.6, e: 0.3 }, kiss: { v: 0.8, e: 0.4 }, smile: { v: 0.8, e: 0.3 }, happy: { v: 0.9, e: 0.5 }, home: { v: 0.5, e: 0.2 }, dream: { v: 0.4, e: 0.25 }, dreamer: { v: 0.5, e: 0.3 }, hope: { v: 0.7, e: 0.35 }, beautiful: { v: 0.8, e: 0.3 }, angel: { v: 0.6, e: 0.2 }, forever: { v: 0.4, e: 0.35 },
  // melancholy
  alone: { v: -0.6, e: 0.2 }, lonely: { v: -0.7, e: 0.2 }, cry: { v: -0.7, e: 0.25 }, crying: { v: -0.7, e: 0.25 }, tears: { v: -0.6, e: 0.25 }, goodbye: { v: -0.7, e: 0.3 }, miss: { v: -0.5, e: 0.25 }, missing: { v: -0.5, e: 0.25 }, empty: { v: -0.6, e: 0.2 }, hollow: { v: -0.6, e: 0.2 }, lost: { v: -0.5, e: 0.35 }, gone: { v: -0.5, e: 0.3 }, fade: { v: -0.4, e: 0.2 }, fading: { v: -0.4, e: 0.2 }, ghost: { v: -0.4, e: 0.3 }, rain: { v: -0.3, e: 0.35 }, fall: { v: -0.3, e: 0.3 }, falling: { v: -0.3, e: 0.35 }, broken: { v: -0.7, e: 0.35 }, hurts: { v: -0.7, e: 0.3 }, hurt: { v: -0.7, e: 0.3 },
  // dark / aggressive
  dark: { v: -0.6, e: 0.5 }, night: { v: -0.1, e: 0.35 }, demon: { v: -0.8, e: 0.6 }, devil: { v: -0.8, e: 0.6 }, war: { v: -0.6, e: 0.7 }, fight: { v: -0.2, e: 0.8 }, fire: { v: 0.1, e: 0.75 }, burn: { v: -0.2, e: 0.7 }, burning: { v: -0.2, e: 0.7 }, scream: { v: -0.6, e: 0.85 }, rage: { v: -0.7, e: 0.9 }, hate: { v: -0.9, e: 0.6 }, shadow: { v: -0.4, e: 0.35 }, shadows: { v: -0.4, e: 0.35 }, fear: { v: -0.7, e: 0.5 }, afraid: { v: -0.6, e: 0.4 }, gravity: { v: -0.2, e: 0.4 },
};

// Genre signatures → production template for the original soundtrack + visuals.
const GENRE_SIGNATURES = {
  edm: ['dance', 'party', 'tonight', 'lights', 'hands', 'jump', 'rave', 'festival', 'electric', 'bass', 'drop', 'club', 'louder', 'forever young'],
  trap: ['money', 'grind', 'hustle', 'gang', 'streets', 'real', 'trap', 'swag', 'flex', 'top', 'up', 'lit', 'smoke'],
  lofi: ['rain', 'coffee', 'window', 'quiet', 'slow', 'lazy', 'sunday', 'memory', 'memories', 'old', 'photograph', 'missing', 'alone'],
  rock: ['scream', 'fight', 'wild', 'broken', 'road', 'guitar', 'thunder', 'fire', 'alive', 'rebel', 'steel'],
  cinematic: ['rise', 'mountains', 'ocean', 'time', 'legacy', 'empire', 'stars', 'hero', 'legend', 'eternal', 'breathe'],
  pop: ['baby', 'heart', 'love', 'dance', 'tonight', 'crazy', 'boy', 'girl', 'summer', 'want', 'need'],
};

const GENRE_BPM = { edm: 126, trap: 140, lofi: 82, rock: 118, cinematic: 90, pop: 112, synthwave: 108, rnb: 96 };

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) — deterministic per seed. */
function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function classifyLine(line) {
  const words = line.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
  const envScores = new Map();
  const emotion = { valence: 0, energy: 0.35, hits: 0 };
  const keywords = [];
  let genreHits = {};

  for (const w of words) {
    if (!STOPWORDS.has(w) && w.length > 2) keywords.push(w);
    for (const img of IMAGERY) {
      if (img.words.includes(w)) {
        envScores.set(img.env, (envScores.get(img.env) || 0) + 1);
      }
    }
    const emo = EMOTION_LEXICON[w];
    if (emo) {
      emotion.valence += emo.v;
      emotion.energy += emo.e;
      emotion.hits += 1;
    }
    for (const [g, sig] of Object.entries(GENRE_SIGNATURES)) {
      if (sig.includes(w)) genreHits[g] = (genreHits[g] || 0) + 1;
    }
  }

  const n = Math.max(1, emotion.hits);
  emotion.valence = Math.max(-1, Math.min(1, emotion.valence / n));
  emotion.energy = Math.max(0, Math.min(1, emotion.energy / n));

  const imagery = [...envScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([env, score]) => ({ env, score }));

  return { words, keywords, emotion, imagery, genreHits, isHook: /\b(oh|yeah|whoa|hey|na)\b/i.test(line) && words.length <= 8 };
}

/**
 * Analyze a lyrics sheet into a complete creative brief.
 * @param {string} lyrics raw lyrics (plain text or LRC-timed)
 * @param {object} opts { duration, genre, mood, artistName, title, seed }
 */
function analyzeLyrics(lyrics, opts = {}) {
  const duration = opts.duration || 60;
  const seed = opts.seed != null ? opts.seed : hashString(String(lyrics || '')) % 2 ** 31;
  const rng = makeRng(seed);

  const rawLines = String(lyrics || '')
    .split(/\r?\n/)
    .map((l) => l.trim());

  // ---- Section detection -------------------------------------------------
  const lines = [];
  let currentSection = null;
  let sectionIdx = 0;
  for (const raw of rawLines) {
    if (!raw) continue;
    const tagMatch = raw.match(/^[\[\(]([^\]\)]{2,24})[\]\)]:?$/);
    if (tagMatch) {
      const tag = tagMatch[1].toLowerCase();
      let type = null;
      for (const [t, names] of Object.entries(SECTION_TAGS)) {
        if (names.some((nm) => tag === nm || tag.includes(nm))) { type = t; break; }
      }
      if (type) {
        currentSection = { type, index: sectionIdx++ };
        continue;
      }
    }
    const inlineMatch = raw.match(/^[\[\(](verse|chorus|bridge|intro|outro|pre-?chorus|hook|drop)[^\]\)]*[\]\)]\s*/i);
    let text = raw;
    if (inlineMatch) {
      const tag = inlineMatch[1].toLowerCase();
      let type = null;
      for (const [t, names] of Object.entries(SECTION_TAGS)) {
        if (names.includes(tag)) { type = t; break; }
      }
      currentSection = { type, index: sectionIdx++ };
      text = raw.slice(inlineMatch[0].length).trim();
      if (!text) continue;
    }
    lines.push({
      text,
      section: currentSection ? currentSection.type : null,
      ...classifyLine(text),
    });
  }

  // Blank-line stanza inference when no explicit tags: guess verse/chorus via
  // repetition — stanzas with identical first lines (or highest frequency)
  // become choruses.
  const stanzas = [];
  let cur = [];
  for (const raw of rawLines) {
    const cleaned = raw.replace(/^[\[\(][^\]\)]*[\]\)]\s*/i, '').trim();
    if (!cleaned) {
      if (cur.length) stanzas.push(cur);
      cur = [];
      continue;
    }
    if (raw.match(/^[\[\(][^\]\)]*[\]\)]$/)) continue;
    cur.push(cleaned);
  }
  if (cur.length) stanzas.push(cur);

  const tagged = lines.some((l) => l.section);
  if (!tagged && stanzas.length > 1) {
    // chorus = the stanza that repeats (same joined text seen again)
    const seen = new Map();
    const stanzaType = new Array(stanzas.length).fill('verse');
    const stanzaKey = (st) => st.join('|').toLowerCase().replace(/[^a-z0-9| ]/g, '');
    let chorusKey = null;
    for (let i = 0; i < stanzas.length; i++) {
      const k = stanzaKey(stanzas[i]);
      if (seen.has(k)) {
        chorusKey = k;
        stanzaType[seen.get(k)] = 'chorus';
        stanzaType[i] = 'chorus';
      } else {
        seen.set(k, i);
      }
    }
    if (!chorusKey && stanzas.length >= 3) {
      // no repeat — treat stanza 2 (index 1) as chorus, classic radio form
      stanzaType[1] = 'chorus';
    }
    let si = 0;
    for (const line of lines) {
      while (si < stanzas.length - 1 && !stanzas[si].includes(line.text)) si++;
      line.section = stanzaType[si] || 'verse';
    }
  } else if (!tagged && lines.length) {
    lines.forEach((l, i) => { l.section = i === 0 ? 'intro' : (i === lines.length - 1 && lines.length > 4 ? 'outro' : 'verse'); });
  }

  // ---- Global analysis ---------------------------------------------------
  const genreScores = {};
  for (const line of lines) {
    for (const [g, hits] of Object.entries(line.genreHits || {})) genreScores[g] = (genreScores[g] || 0) + hits;
  }
  const genre =
    opts.genre && GENRE_BPM[opts.genre]
      ? opts.genre
      : Object.entries(genreScores).sort((a, b) => b[1] - a[1])[0]?.[0]
        || (opts.mood === 'chill' ? 'lofi' : rng() > 0.5 ? 'pop' : 'edm');

  const avgValence = lines.length ? lines.reduce((s, l) => s + l.emotion.valence, 0) / lines.length : 0.2;
  const avgEnergy = lines.length ? lines.reduce((s, l) => s + l.emotion.energy, 0) / lines.length : 0.5;

  // ---- Environment affinities -------------------------------------------
  const envScores = new Map();
  for (const line of lines) {
    for (const { env, score } of line.imagery) {
      envScores.set(env, (envScores.get(env) || 0) + score);
    }
  }
  let rankedEnvs = [...envScores.entries()].sort((a, b) => b[1] - a[1]).map(([env]) => env);
  if (rankedEnvs.length === 0) {
    // No explicit imagery — pick from mood
    const moodEnvs = avgValence > 0.2
      ? ['synthwave', 'hearts', 'forest', 'desert']
      : avgEnergy > 0.55 ? ['neonCity', 'cyberGrid', 'embers', 'storm'] : ['cosmos', 'underwater', 'ocean', 'snowfall'];
    rankedEnvs = [moodEnvs[Math.floor(rng() * moodEnvs.length)]];
  }

  const bpm = opts.bpm || Math.round(
    (GENRE_BPM[genre] || 110) * (0.94 + avgEnergy * 0.16) + (rng() * 4 - 2)
  );

  // ---- Palettes ----------------------------------------------------------
  const primaryEnvImg = IMAGERY.find((i) => i.env === rankedEnvs[0]) || IMAGERY[0];
  const palette = buildPalette(primaryEnvImg, avgValence, rng);

  // ---- Arc: energy curve across the song (intro low → chorus peak) ------
  const sectionEnergy = { intro: 0.3, verse: 0.5, prechorus: 0.65, chorus: 0.95, bridge: 0.45, drop: 1.0, outro: 0.25 };

  return {
    seed,
    genre,
    bpm,
    duration,
    lines,
    stanzas,
    avgValence,
    avgEnergy,
    rankedEnvs,
    palette,
    sectionEnergy,
    summary: {
      lineCount: lines.length,
      chorusCount: lines.filter((l) => l.section === 'chorus').length,
      topEnvs: rankedEnvs.slice(0, 4).map((e) => (IMAGERY.find((i) => i.env === e) || {}).label || e),
      mood: avgValence > 0.25 ? 'uplifting' : avgValence < -0.25 ? 'melancholy' : 'cinematic',
    },
  };
}

/** Build an HSL-based palette from the primary environment + valence. */
function buildPalette(envImg, valence, rng) {
  const [h1, h2] = envImg.hue;
  const hueShift = valence > 0.2 ? 12 : -14; // warm when happy, cool when sad
  const base = Math.floor(((h1 + h2) / 2 + hueShift + 360) % 360);
  const accent2 = Math.floor((base + 150 + rng() * 60) % 360);
  return {
    primary: `hsl(${base}, ${Math.round(70 + rng() * 20)}%, ${valence > 0 ? 55 : 42}%)`,
    secondary: `hsl(${accent2}, ${Math.round(65 + rng() * 25)}%, ${valence > 0 ? 60 : 48}%)`,
    deep: `hsl(${base}, 70%, ${valence > 0 ? 10 : 7}%)`,
    glow: envImg.accent,
    base,
  };
}

module.exports = {
  analyzeLyrics,
  classifyLine,
  IMAGERY,
  GENRE_BPM,
  makeRng,
  hashString,
  buildPalette,
};
