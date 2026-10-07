// server/characterEngine.js — Procedural character design for original videos.
//
// Generates a deterministic, fully-specified cast member (appearance, outfit,
// accessories, vibe) from a seed — the same seed always yields the same
// character, so identity stays consistent across every scene and every render.
// The spec is consumed by characterPainter.js which paints them per-frame.

const { makeRng, hashString } = require('./lyricsAnalysis');

const VIBES = {
  pop: { label: 'Pop Star', outfits: ['dress', 'jacket', 'glam'], hair: ['long', 'bob', 'ponytail', 'bun'], accessories: ['earrings', 'earrings+mic', 'mic'], palettes: [[340, 25], [200, 330], [280, 45]] },
  rapper: { label: 'Rapper', outfits: ['hoodie', 'leather', 'street'], hair: ['buzz', 'afro', 'curls', 'cornrow'], accessories: ['chain', 'cap+chain', 'chain+mic'], palettes: [[220, 20], [0, 0], [150, 200]] },
  rocker: { label: 'Rock Vocalist', outfits: ['leather', 'street', 'jacket'], hair: ['long', 'mohawk', 'shag', 'bob'], accessories: ['mic', 'earring+mic', 'none'], palettes: [[0, 0], [10, 260], [30, 210]] },
  edm: { label: 'Electronic Artist', outfits: ['neon', 'glam', 'hoodie'], hair: ['bob', 'buzz', 'ponytail', 'bun'], accessories: ['headphones', 'visor+mic', 'earrings+mic'], palettes: [[180, 280], [190, 310], [160, 250]] },
  indie: { label: 'Indie Dreamer', outfits: ['sweater', 'street', 'dress'], hair: ['curly', 'bob', 'long', 'bun'], accessories: ['glasses+mic', 'mic', 'earrings'], palettes: [[90, 30], [40, 200], [120, 60]] },
  anime: { label: 'Anime Hero', outfits: ['glam', 'neon', 'jacket'], hair: ['long', 'ponytail', 'spiky', 'bob'], accessories: ['visor', 'earrings+mic', 'none'], palettes: [[300, 190], [140, 270], [20, 320]] },
  soul: { label: 'Soul Singer', outfits: ['dress', 'glam', 'jacket'], hair: ['afro', 'curls', 'bun', 'long'], accessories: ['earrings+mic', 'mic', 'glasses+mic'], palettes: [[30, 340], [270, 40], [15, 200]] },
};

const NAMES_F = ['Nova', 'Luna', 'Aria', 'Mira', 'Zara', 'Iris', 'Juno', 'Vera', 'Sol', 'Echo', 'Ruby', 'Sage'];
const NAMES_M = ['Jax', 'Rio', 'Kai', 'Dre', 'Leo', 'Max', 'Ace', 'Cruz', 'Neo', 'Zayn', 'Cole', 'Rey'];
const LASTS = ['Skye', 'Wilder', 'Vance', 'Reyes', 'Cross', 'Monroe', 'Steele', 'Lane', 'Wolf', 'Hart', 'Vega', 'Knight'];

// Skin tone ramps (hue, sat, light for base + shadow)
const SKINS = [
  { base: [28, 45, 82], shade: [26, 38, 66] },
  { base: [26, 52, 68], shade: [24, 45, 52] },
  { base: [24, 55, 55], shade: [22, 50, 40] },
  { base: [22, 60, 42], shade: [20, 55, 29] },
  { base: [20, 65, 32], shade: [18, 60, 22] },
  { base: [18, 52, 72], shade: [20, 45, 56] },
];

const HAIR_COLORS = [
  [25, 30, 12], // near-black
  [28, 45, 20], // dark brown
  [30, 55, 34], // brown
  [42, 70, 55], // blonde
  [15, 75, 42], // auburn
  [0, 0, 8], // jet black
  [285, 70, 55], // fantasy violet
  [195, 80, 55], // fantasy cyan
  [330, 85, 60], // fantasy pink
];

/**
 * Generate a deterministic character spec.
 * @param {object} opts { seed, vibe, gender ('female'|'male'|'any'), genre }
 */
function generateCharacter(opts = {}) {
  const seed = opts.seed != null
    ? opts.seed >>> 0
    : (hashString(`${opts.vibe || ''}${opts.gender || ''}${opts.genre || ''}${Date.now()}`) % 2 ** 31);
  const rng = makeRng(seed);

  const vibeKey = (opts.vibe && VIBES[opts.vibe]) ? opts.vibe
    : guessVibe(opts.genre, rng);
  const vibe = VIBES[vibeKey];

  const gender = opts.gender && opts.gender !== 'any' ? opts.gender : (rng() > 0.5 ? 'female' : 'male');

  const skin = SKINS[Math.floor(rng() * SKINS.length)];
  const hairColor = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
  const [h1, h2] = vibe.palettes[Math.floor(rng() * vibe.palettes.length)];
  const outfitHue = Math.floor(h1 + rng() * Math.max(1, h2 - h1));
  const accentHue = (outfitHue + 120 + Math.floor(rng() * 120)) % 360;

  const accessories = vibe.accessories[Math.floor(rng() * vibe.accessories.length)].split('+');

  const spec = {
    id: `char_${seed.toString(36)}`,
    seed,
    name: `${(gender === 'female' ? NAMES_F : NAMES_M)[Math.floor(rng() * 12)]} ${LASTS[Math.floor(rng() * 12)]}`,
    vibe: vibeKey,
    vibeLabel: vibe.label,
    gender,
    skin,
    hair: {
      style: vibe.hair[Math.floor(rng() * vibe.hair.length)],
      color: hairColor,
    },
    eyes: {
      color: [230 + Math.floor(rng() * 100), 45 + Math.floor(rng() * 40), 30 + Math.floor(rng() * 35)],
      size: 0.9 + rng() * 0.25,
    },
    lips: { fullness: 0.7 + rng() * 0.6 },
    outfit: {
      style: vibe.outfits[Math.floor(rng() * vibe.outfits.length)],
      hue: outfitHue,
      sat: 45 + Math.floor(rng() * 40),
      light: 22 + Math.floor(rng() * 22),
      accentHue,
    },
    accessories,
    browThickness: 0.75 + rng() * 0.5,
    jawSoft: 0.8 + rng() * 0.4,
  };
  return spec;
}

function guessVibe(genre, rng) {
  const map = {
    pop: 'pop', edm: 'edm', trap: 'rapper', lofi: 'indie',
    rock: 'rocker', cinematic: 'soul', synthwave: 'edm', rnb: 'soul',
  };
  return (genre && map[genre]) || ['pop', 'rapper', 'edm', 'indie', 'soul'][Math.floor(rng() * 5)];
}

module.exports = { generateCharacter, VIBES, guessVibe };
