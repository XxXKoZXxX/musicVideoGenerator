// server/storyEngine.js — narrative director.
//
// Turns the lyric analysis into a shot-by-shot STORY ARC with a cast:
//   • cast design (solo artist, or duo for love/duet songs)
//   • per-section beats: establishing / story scenes / singing performance
//   • actions (walk, reach, embrace, dance, stand-strong) per mood
//   • framing plan (wide establishing → medium story → closeup performance)
//
// The freebeat/opus signature: verses tell the story, choruses cut to the
// artist singing to camera (lip-sync closeups), bridge is the emotional peak.

const { makeRng } = require('./lyricsAnalysis');
const { createCast } = require('./characterEngine');

// Actions per story phase × mood. Each maps to a puppet pose + camera feel.
const ACTIONS = {
  setup: {
    uplifting: ['walk', 'look-out'],
    melancholy: ['walk', 'sit-edge'],
    cinematic: ['walk', 'look-out'],
  },
  develop: {
    uplifting: ['run', 'reach', 'dance'],
    melancholy: ['reach', 'wander', 'look-back'],
    cinematic: ['reach', 'look-out', 'wander'],
  },
  tension: {
    uplifting: ['climb', 'point'],
    melancholy: ['look-back', 'stand-rain'],
    cinematic: ['stand-rain', 'look-back'],
  },
  peak: {
    uplifting: ['dance', 'jump-cheer'],
    melancholy: ['embrace', 'tears'],
    cinematic: ['embrace', 'stand-strong'],
  },
  resolve: {
    uplifting: ['dance', 'look-out'],
    melancholy: ['walk-away', 'sit-edge'],
    cinematic: ['walk-away', 'embrace'],
  },
};

const POSE_BY_ACTION = {
  walk: 'walk', 'walk-away': 'walk', run: 'walk', wander: 'walk', climb: 'walk',
  'look-out': 'idle', 'sit-edge': 'idle', 'look-back': 'idle', 'stand-rain': 'idle',
  reach: 'sing', embrace: 'chest', tears: 'chest', 'jump-cheer': 'dance',
  dance: 'dance', point: 'point', 'stand-strong': 'idle',
};

/**
 * Design the cast + storyline for a song.
 * @returns { cast, beats: [{sectionIdx, type: 'establish'|'story'|'perf'|'duet', action, pose, framing, charIdxs, label}] }
 */
function buildStoryline(analysis, sections, opts = {}) {
  const seed = (analysis.seed ^ 0x1f2e3d4c) >>> 0;
  const rng = makeRng(seed);
  const mood = analysis.summary.mood || 'cinematic';

  // ---- cast size: duo for love/heartbreak, otherwise solo (auto) ----
  let castSize = opts.castSize === 'solo' ? 1 : opts.castSize === 'duo' ? 2 : null;
  if (castSize == null) {
    const loveWords = ['love', 'heart', 'baby', 'kiss', 'together', 'hold', 'her', 'his', 'we', 'us', 'goodbye', 'miss', 'heartbreak', 'alone'];
    const text = analysis.lines.map((l) => l.text).join(' ').toLowerCase();
    const hits = loveWords.filter((w) => text.includes(w)).length;
    castSize = hits >= 3 ? 2 : 1;
  }
  const cast = createCast(seed, { size: castSize, mood });

  // ---- beats per section ----
  const safeSections = (sections && sections.length ? sections : [{ type: 'song', start: 0, end: analysis.duration || 60, energy: 60 }]);

  let storyPhase = 'setup';
  let perfCount = 0;
  let storyCount = 0;
  const beats = safeSections.map((sec, i) => {
    const type = (sec.type || '').toLowerCase();
    const isChorus = type === 'chorus' || sec.isDrop || type === 'drop';
    const isIntro = type === 'intro' || i === 0;
    const isOutro = type === 'outro' || i === safeSections.length - 1;
    const isBridge = type === 'bridge';

    let beat;
    if (isIntro) {
      beat = { type: 'establish', action: 'look-out', pose: 'idle', framing: 'wide', charIdxs: castSize === 2 ? [0, 1] : [0] };
    } else if (isChorus) {
      perfCount += 1;
      beat = {
        type: perfCount % 2 === 0 && castSize === 2 ? 'duet' : 'perf',
        action: 'sing',
        pose: (analysis.avgEnergy > 0.55 || mood === 'uplifting') ? 'dance' : 'sing',
        framing: castSize === 2 ? (perfCount % 2 === 0 ? 'two-shot' : 'closeup') : (perfCount % 3 === 2 ? 'medium' : 'closeup'),
        charIdxs: castSize === 2 && perfCount % 2 === 0 ? [0, 1] : [0],
      };
    } else if (isBridge) {
      beat = {
        type: 'story',
        action: pick(ACTIONS.peak[mood]),
        pose: POSE_BY_ACTION[pick(ACTIONS.peak[mood])],
        framing: castSize === 2 ? 'two-shot' : 'closeup',
        charIdxs: castSize === 2 ? [0, 1] : [0],
        emotional: true,
      };
    } else if (isOutro) {
      beat = {
        type: 'story',
        action: pick(ACTIONS.resolve[mood]),
        pose: POSE_BY_ACTION[pick(ACTIONS.resolve[mood])],
        framing: 'wide',
        charIdxs: [0],
      };
    } else {
      // verse → story progression
      storyPhase = storyCount === 0 ? 'setup' : storyCount === 1 ? 'develop' : storyCount === 2 ? 'tension' : 'develop';
      storyCount += 1;
      const action = pick(ACTIONS[storyPhase][mood]);
      beat = {
        type: 'story',
        action,
        pose: POSE_BY_ACTION[action],
        framing: storyCount % 2 === 1 ? 'medium' : 'wide',
        charIdxs: castSize === 2 && storyCount % 2 === 0 ? [0, 1] : [0],
      };
    }

    return {
      sectionIdx: i,
      section: sec.type || 'section',
      start: sec.start,
      end: sec.end,
      label: `${sec.type || 'Scene'} — ${beat.type}`,
      ...beat,
    };
  });

  return { cast, beats, mood, castSize };
}

function pick(arr) { return arr[Math.floor(rngShared() * arr.length)]; }
let rngShared = makeRng(1);
function setRng(r) { rngShared = r; }

// deterministic per storyline — rebuild rng at each build
const _origBuild = buildStoryline;
function buildStorylineSafe(analysis, sections, opts) {
  setRng(makeRng((analysis.seed ^ 0x1f2e3d4c) >>> 0));
  return _origBuild(analysis, sections, opts);
}

module.exports = { buildStoryline: buildStorylineSafe };
