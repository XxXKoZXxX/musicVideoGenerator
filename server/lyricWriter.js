// server/lyricWriter.js — Original lyric generator (100% offline).
//
// Writes structured, rhymed, singable lyrics from a theme using rhyme
// families + slot-filled line templates. Seeded → "regenerate" variations.
// Output feeds straight into the AI Director original-video engine.

const { makeRng, hashString } = require('./lyricsAnalysis');

// Noun-phrase rhyme families. Items are grammatically complete noun phrases
// ("the night", "city lights") so templates stay grammatical for any pick.
const RHYMES = {
  ight: ['the night', 'the light', 'city lights', 'the twilight', 'the spotlight', 'the satellite', 'fireworks at night'],
  ire:  ['the fire', 'the wire', 'a live wire', 'the whole empire', 'my one desire', 'a choir'],
  ain:  ['the rain', 'the chains', 'aeroplanes', 'the veins', 'the sweetest pain', 'the hurricane'],
  old:  ['the gold', 'the cold', 'the stories never told', 'the stronghold', 'streets of gold'],
  art:  ['the heart', 'the start', 'a work of art', 'the counterpart', 'the broken part'],
  ave:  ['the waves', 'the caves', 'the masquerade', 'the serenade', 'the choices that we made'],
  ars:  ['the stars', 'the cars', 'our scars', 'guitars', 'the boulevards'],
  eam:  ['the dreams', 'the streams', 'the sirens and the screams', 'laser beams', 'silver seams'],
  oon:  ['the moon', 'the dune', 'a lover’s tune', 'the monsoon', 'a neon balloon'],
  ound: ['the sound', 'the ground', 'the underground', 'the lost and found', 'the world spinning round'],
  ay:   ['the day', 'the highway', 'the runaway', 'the milky way', 'the words we never say'],
  eet:  ['the streets', 'the beats', 'two heartbeats', 'the city heat', 'the people that we meet'],
  ine:  ['the skyline', 'the moonshine', 'a boundary line', 'the design', 'the shine'],
  one:  ['the throne', 'the great unknown', 'the telephone', 'a rolling stone', 'the zone'],
  eel:  ['the wheels', 'the steel', 'the way that summer feels', 'the Appeal'.toLowerCase().replace('appeal', 'appeal'), 'behind the wheel'],
  oke:  ['the smoke', 'the Bloke'.toLowerCase().replace('bloke', 'oak'), 'the words we never spoke', 'the mirror broken'],
  ust:  ['the dust', 'the trust', 'the wanderlust', 'stardust', 'the roads we trust'],
  eart: ['the heart', 'the start', 'the map of every scar'.replace('scar', 'star'), 'the work of art'],
  ay2:  ['the daybreak', 'the earthquake', 'the heartbreak', 'the mistakes', 'the wake'],
  ore:  ['the shore', 'the encore', 'what we’re searching for', 'the ocean’s roar', 'forevermore'],
};

// Theme banks: imagery nouns/verbs/adjectives + hook + preferred rhyme keys.
const THEMES = {
  neon: {
    keys: ['neon', 'city', 'street', 'downtown', 'midnight', 'urban', 'club', 'traffic', 'taxi'],
    label: 'Neon City Nights',
    hooks: ['We are electric', 'Neon hearts tonight', 'Chasing the city glow', 'Alive in the afterglow'],
    imgs: ['headlights bleeding through the fog', 'a sky of broken glass', 'every window lit like a stage', 'the taxi radios', 'rainbows in the oil-slick streets'],
    verbs: ['running', 'dancing', 'burning', 'wandering', 'glowing', 'racing'],
    adjs: ['electric', 'restless', 'neon-bright', 'midnight', 'sleepless', 'golden'],
    rhymes: ['ight', 'eet', 'ine', 'one'],
  },
  rain: {
    keys: ['rain', 'storm', 'thunder', 'weather', 'grey', 'cloud'],
    label: 'Rain & Release',
    hooks: ['Let it pour over me', 'Dancing in the rain', 'Wash the night away', 'Every drop remembers'],
    imgs: ['thunder rolling like a drum', 'windowpanes full of light', 'the sky learning how to sing', 'puddles full of stars', 'clouds heavy with our names'],
    verbs: ['falling', 'washing', 'crashing', 'spinning', 'melting', 'pouring'],
    adjs: ['endless', 'quiet', 'electric', 'softly-thundering', 'restless', 'silver'],
    rhymes: ['ain', 'ay', 'ound', 'ust'],
  },
  ocean: {
    keys: ['ocean', 'sea', 'wave', 'tide', 'shore', 'sail', 'water', 'deep'],
    label: 'Ocean & Tide',
    hooks: ['Pull me like the tide', 'We are the ocean now', 'Salt in the starlight', 'Deeper than the sea'],
    imgs: ['a lighthouse born of foam', 'the horizon holding its breath', 'pearls in the moonlit foam', 'a compass made of stars', 'the deep blue hum'],
    verbs: ['drifting', 'sailing', 'diving', 'floating', 'breaking', 'rising'],
    adjs: ['boundless', 'tidal', 'moonlit', 'deep-blue', ' weightless'.trim(), 'shimmering'],
    rhymes: ['ore', 'ave', 'oon', 'eam'],
  },
  cosmos: {
    keys: ['star', 'space', 'galaxy', 'cosmic', 'moon', 'planet', 'universe', 'sky'],
    label: 'Cosmic Voyage',
    hooks: ['We are stardust', 'Written in the stars', 'Gravity forgot us', 'Orbit of your light'],
    imgs: ['a map of dying light', 'constellations of our own', 'the dark between the stars', 'comets drawing lines', 'a sky on infinite repeat'],
    verbs: ['orbiting', 'falling', 'shining', 'drifting', 'burning', 'soaring'],
    adjs: ['infinite', 'weightless', 'stellar', 'gravity-free', 'luminous', 'endless'],
    rhymes: ['ars', 'ight', 'oon', 'ust'],
  },
  fire: {
    keys: ['fire', 'burn', 'flame', 'ember', 'blaze', 'spark', 'ash'],
    label: 'Fire & Sparks',
    hooks: ['Light it up, light it up', 'We are the wildfire', 'Burn a little brighter', 'Sparks in the dark'],
    imgs: ['a match held to the dark', 'embers writing on the wind', 'the horizon catching flame', 'sparks like furious snow', 'a sun in our hands'],
    verbs: ['burning', 'igniting', 'rising', 'blazing', 'sparking', 'flaring'],
    adjs: ['blazing', 'untamed', 'red-gold', 'feverish', 'magnificent', 'wild'],
    rhymes: ['ire', 'ars', 'oke', 'ound'],
  },
  love: {
    keys: ['love', 'heart', 'kiss', 'baby', 'darling', 'forever', 'together', 'soul'],
    label: 'Golden Hour Love',
    hooks: ['Stay a little longer', 'You and me, forever', 'Every heartbeat is yours', 'Golden in your light'],
    imgs: ['your laughter in the hallway', 'a photograph still warm', 'the quiet after goodbye', 'sunlight on your shoulder', 'two shadows becoming one'],
    verbs: ['holding', 'falling', 'staying', 'breathing', 'aching', 'glowing'],
    adjs: ['golden', 'quiet', 'certain', 'helpless', 'luminous', 'true'],
    rhymes: ['art', 'ay', 'oon', 'ire'],
  },
  heartbreak: {
    keys: ['heartbreak', 'goodbye', 'alone', 'lonely', 'miss', 'lost', 'broken', 'cry'],
    label: 'After the Goodbye',
    hooks: ['I’m still here', 'Nothing like the rain', 'Ghosts of us', 'Learning to let go'],
    imgs: ['your coat still on the door', 'an empty side of bed', 'a voicemail I can’t delete', 'the silence where you laughed', 'our song in a strangers’ cart'],
    verbs: ['aching', 'reaching', 'fading', 'wandering', 'remembering', 'letting'],
    adjs: ['hollow', 'quiet', 'half-lit', 'unchanged', 'paper-thin', 'grey'],
    rhymes: ['ain', 'art', 'one', 'oke'],
  },
  forest: {
    keys: ['forest', 'tree', 'wood', 'river', 'green', 'garden', 'mountain', 'home', 'road'],
    label: 'Wild Green',
    hooks: ['Take me home', 'Grow wild with me', 'Roots and constellations', 'The river knows my name'],
    imgs: ['a cathedral made of pine', 'moss like whispered secrets', 'the river keeping time', 'ferns unrolling green prayers', 'smoke above the pines'],
    verbs: ['growing', 'wandering', 'climbing', 'rooting', 'waking', 'flowing'],
    adjs: ['evergreen', 'wild', 'sun-flecked', 'unhurried', 'ancient', 'green-gold'],
    rhymes: ['ine', 'eam', 'ound', 'ay'],
  },
  winter: {
    keys: ['snow', 'winter', 'cold', 'ice', 'frost', 'december', 'frozen'],
    label: 'Winter Aurora',
    hooks: ['Frozen but alive', 'Under the aurora', 'December in your eyes', 'The cold keeps us honest'],
    imgs: ['breath like little ghosts', 'frost ferns on the glass', 'a sky of slow white stars', 'the world held under glass', 'lamplight in the blue dusk'],
    verbs: ['freezing', 'glowing', 'wandering', 'shivering', 'huddling', 'shining'],
    adjs: ['crystalline', 'hushed', 'blue-white', 'flickering', 'polar', 'quiet-bright'],
    rhymes: ['oon', 'ight', 'eel', 'ust'],
  },
  desert: {
    keys: ['desert', 'sand', 'dune', 'sun', 'gold', 'highway', 'road', 'miles', 'freedom'],
    label: 'Golden Horizon',
    hooks: ['Run where the sun lands', 'Miles and miles of gold', 'West of forever', 'Highway hymn'],
    imgs: ['heat like a held note', 'a ribbon of blacktop humming', 'cathedrals of red stone', 'the sun melting into the dash', 'dust devils dancing slow'],
    verbs: ['driving', 'running', 'chasing', 'burning', 'wandering', 'shimmering'],
    adjs: ['sun-bleached', 'endless', 'amber', 'wide-open', 'dust-gold', 'free'],
    rhymes: ['one', 'ay', 'ust', 'ine'],
  },
  cyber: {
    keys: ['digital', 'cyber', 'machine', 'robot', 'code', 'glitch', 'virtual', 'electric', 'future'],
    label: 'Machine Dream',
    hooks: ['We are the signal', 'Static and starlight', 'Powered by forever', 'Run the night code'],
    imgs: ['a heartbeat in the mainframe', 'streets wired with starlight', 'the hum of somewhere else', 'pixels learning how to dream', 'a ghost in the machine'],
    verbs: ['running', 'compiling', 'glitching', 'streaming', 'charging', 'booting'],
    adjs: ['electric', 'chrome-plated', 'neon-lit', 'high-voltage', 'synthetic', 'luminous'],
    rhymes: ['ine', 'eam', 'one', 'eet'],
  },
  dream: {
    keys: ['dream', 'sleep', 'memory', 'remember', 'nostalgia', 'float'],
    label: 'Underwater Dreams',
    hooks: ['Meet me in the dream', 'We float, we glow', 'Half awake, half starlight', 'Where the memories swim'],
    imgs: ['a house built out of almosts', 'the blue inside a thought', 'hallways made of music', 'your voice under water', 'an ocean with no shore'],
    verbs: ['floating', 'drifting', 'dreaming', 'swimming', 'blurring', 'sinking'],
    adjs: ['underwater', 'soft-focus', 'slow-motion', 'blue-veiled', 'weightless', 'unwritten'],
    rhymes: ['eam', 'oon', 'ore', 'ave'],
  },
  rise: {
    keys: ['rise', 'strong', 'win', 'fight', 'champion', 'glory', 'alive', 'free', ' anthem'.trim()],
    label: 'Stadium Anthem',
    hooks: ['Tonight we rise', 'Louder than the storm', 'Built from every fall', 'We are the anthem'],
    imgs: ['a thousand hands like one', 'the jump before the flight', 'thunder in our chests', 'a flag on the mountain', 'the first light after war'],
    verbs: ['rising', 'marching', 'burning', 'climbing', 'roaring', 'soaring'],
    adjs: ['unbreakable', 'thunderous', 'iron-willed', 'electric', 'fearless', 'golden'],
    rhymes: ['ight', 'ound', 'ars', 'ire'],
  },
};

const FALLBACK_THEME = 'neon';

const VERSE_TEMPLATES = [
  (b, np, r) => `I’ve been ${pick(r, b.verbs)} through ${pick(r, b.imgs)},`,
  (b, np) => `Something in ${np} keeps calling out my name,`,
  (b, np, r) => `We were ${pick(r, b.adjs)}, we were ${pick(r, b.adjs)}, born to ${pick(r, ['wander', 'run', 'burn', 'float', 'climb', 'shine'])},`,
  (b, np) => `Every heartbeat is a drum inside ${np},`,
  (b, np, r) => `Hold your breath — the ${pick(r, ['night', 'world', 'morning', 'static', 'silence'])} is about to break,`,
  (b, np) => `And I won’t wait for ${np} to fade,`,
  (b, np, r) => `${cap(pick(r, b.verbs))} over everything I know,`,
  (b, np) => `There’s a wildness in ${np} that I can’t ignore,`,
  (b, np, r) => `Say my name like ${pick(r, b.imgs)},`,
  (b, np, r) => `The ${pick(r, ['sky', 'city', 'ocean', 'forest', 'desert'])} bends to ${np} tonight,`,
  (b, np, r) => `Nothing ${pick(r, ['holy', 'quiet', 'sacred', 'endless'])} ever comes from standing still,`,
  (b, np) => `So meet me where ${np} meets the thrill,`,
];

const BRIDGE_TEMPLATES = [
  (b, np, r) => `Softer now — ${pick(r, b.imgs)} —`,
  (b, np) => `If the world should ask about us, tell them ${np} knows,`,
  (b, np, r) => `One more breath before the ${pick(r, ['chorus', 'storm', 'light', 'drop', 'morning'])},`,
  (b, np) => `Everything we are is humming under ${np},`,
];

const HOOK_LINES = {
  chorus: (hook, np, r, b) => [
    hook + ',',
    `${cap(pick(r, b.verbs))} through ${np} till the morning light,`,
    `Oh-oh-oh, ${hook.toLowerCase().replace(/[.,!]/g, '')},`,
    `We’re never giving up ${np},`,
  ],
};

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function detectTheme(text) {
  const t = String(text || '').toLowerCase();
  for (const [key, th] of Object.entries(THEMES)) {
    if (th.keys.some((k) => t.includes(k))) return key;
  }
  return FALLBACK_THEME;
}

function family(rng, themeKey, used) {
  const th = THEMES[themeKey];
  const keys = th.rhymes.filter((k) => !used.has(k));
  const key = keys.length ? keys[0] : pick(rng, Object.keys(RHYMES));
  used.add(key);
  return key;
}

/**
 * Write original lyrics.
 * @param {object} opts { theme|about, genre, mood, length: 'short'|'standard'|'long', seed }
 */
function writeLyrics(opts = {}) {
  const about = opts.about || opts.theme || '';
  const themeKey = opts.theme && THEMES[opts.theme] ? opts.theme : detectTheme(about || opts.genre || '');
  const th = THEMES[themeKey];
  const length = opts.length || 'standard';
  const seed = opts.seed != null ? opts.seed : (hashString(String(about) + themeKey + Date.now()) % 2 ** 31);
  const rng = makeRng(seed);

  const hook = pick(rng, th.hooks);
  const used = new Set();
  const famA = family(rng, themeKey, used);
  const famB = family(rng, themeKey, used);

  const line = (famKey, tpl) => {
    const fam = RHYMES[famKey] || RHYMES.ight;
    const np = pick(rng, fam);
    return tpl(th, np, rng).replace(/\s+/g, ' ').replace(/\s,/g, ',');
  };

  const rhymePair = (famKey, n = 2) => {
    const fam = [...RHYMES[famKey]];
    // shuffle deterministically
    for (let i = fam.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [fam[i], fam[j]] = [fam[j], fam[i]];
    }
    return fam.slice(0, n);
  };

  const verse = () => {
    const fam = rng() > 0.5 ? famA : famB;
    const nps = rhymePair(fam, 2);
    const t1 = pick(rng, VERSE_TEMPLATES);
    let t2 = pick(rng, VERSE_TEMPLATES);
    let guard = 0;
    while (t2 === t1 && guard++ < 5) t2 = pick(rng, VERSE_TEMPLATES);
    const midNp = pick(rng, RHYMES[family(rng, themeKey, new Set([famA, famB]))]);
    return [
      line(fam, t1).replace(/,$/, ','),
      `${cap(pick(rng, th.imgs))},`,
      line(fam, t2).replace(nps[1], nps[0]).replace(/,$/, ''),
      `Yeah, we’re ${pick(rng, th.verbs)} till we find ${nps[1]}.`,
    ];
  };

  const chorus = () => {
    const c = HOOK_LINES.chorus(hook, pick(rng, RHYMES[rng() > 0.5 ? famA : famB]), rng, th);
    return [c[0], c[1], c[2], c[0]];
  };

  const bridgeLine = () => line(famB, pick(rng, BRIDGE_TEMPLATES));
  const outro = () => [
    `${hook} — ${pick(rng, ['one more time', 'again, again', 'till the end', 'tonight'])},`,
    `${cap(pick(rng, th.verbs))} into ${pick(rng, RHYMES[famA])}.`,
  ];

  const sections = [];
  sections.push('[Verse 1]', ...verse());
  sections.push('', '[Chorus]', ...chorus());
  sections.push('', '[Verse 2]', ...verse());
  sections.push('', '[Chorus]', ...chorus());
  if (length === 'long' || length === 'standard') {
    sections.push('', '[Bridge]', bridgeLine(), bridgeLine());
  }
  if (length === 'long') {
    sections.push('', '[Final Chorus]', ...chorus());
  }
  sections.push('', '[Outro]', ...outro());

  const lyrics = sections.join('\n');
  const titles = [
    cap(hook),
    `${cap(pick(rng, th.adjs))} ${cap(pick(rng, th.verbs).replace(/ing$/, '') || 'night')}`,
    `${cap(pick(rng, ['Midnight', 'Golden', 'Electric', 'Endless', 'Neon']))} ${cap(pick(rng, ['Horizon', 'Skyline', 'Heartbeat', 'Afterglow', 'Odyssey']))}`,
  ];

  return {
    title: titles[0],
    altTitles: titles.slice(1),
    theme: themeKey,
    themeLabel: th.label,
    lyrics,
    lineCount: sections.filter((s) => s && !s.startsWith('[')).length,
    hook,
    seed,
  };
}

module.exports = { writeLyrics, THEMES, detectTheme, RHYMES };
