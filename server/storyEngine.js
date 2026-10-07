// server/storyEngine.js — Lyric-driven narrative director.
//
// Turns analyzed lyrics into a shot-by-shot STORYBOARD: which characters
// appear, what they're doing (action), which framing (closeup/medium/wide),
// and the emotional tone per scene. Verses establish the character & world,
// pre-chorus builds, chorus is the performance peak, bridge is the turn,
// outro resolves. Deterministic for a given (lyrics, seed).

const { makeRng, hashString } = require('./lyricsAnalysis');
const { generateCharacter, guessVibe } = require('./characterEngine');

// Section-role → framing + action language
const ROLE_LANGUAGE = {
  intro:    { framings: ['wide', 'medium'],           actions: ['idle', 'walk'],             energy: 0.25, expr: { browRaise: 0.1, browAnger: 0 } },
  verse:    { framings: ['medium', 'wide', 'closeup'], actions: ['walk', 'idle', 'sing'],     energy: 0.4,  expr: { browRaise: 0.2, browAnger: 0.05 } },
  pre:      { framings: ['medium', 'closeup'],         actions: ['sing', 'walk'],             energy: 0.6,  expr: { browRaise: 0.45, browAnger: 0.1 } },
  chorus:   { framings: ['closeup', 'medium', 'wide'], actions: ['sing', 'dance', 'reach'],   energy: 1.0,  expr: { browRaise: 0.7, browAnger: 0.15 } },
  post:     { framings: ['closeup', 'medium'],         actions: ['dance', 'sing'],            energy: 0.85, expr: { browRaise: 0.5, browAnger: 0.1 } },
  bridge:   { framings: ['closeup', 'medium'],         actions: ['sing', 'idle'],             energy: 0.5,  expr: { browRaise: 0.3, browAnger: 0 } },
  drop:     { framings: ['wide', 'medium'],            actions: ['dance', 'reach'],           energy: 1.0,  expr: { browRaise: 0.6, browAnger: 0.2 } },
  breakdown:{ framings: ['closeup'],                   actions: ['sing'],                     energy: 0.35, expr: { browRaise: 0.25, browAnger: 0 } },
  hook:     { framings: ['closeup', 'medium'],         actions: ['sing', 'dance'],            energy: 0.9,  expr: { browRaise: 0.6, browAnger: 0.1 } },
  outro:    { framings: ['wide', 'medium'],            actions: ['idle', 'walk'],             energy: 0.2,  expr: { browRaise: 0.05, browAnger: 0 } },
};

function classifyRole(name) {
  const n = (name || '').toLowerCase();
  if (/intro|opening/.test(n)) return 'intro';
  if (/pre[- ]?chorus|build|rise/.test(n)) return 'pre';
  if (/post[- ]?chorus|drop the beat/.test(n)) return 'post';
  if (/drop/.test(n)) return 'drop';
  if (/break|interlude|instrumental/.test(n)) return 'breakdown';
  if (/bridge|middle 8/.test(n)) return 'bridge';
  if (/hook|refrain/.test(n)) return 'hook';
  if (/outro|ending|fade|finale/.test(n)) return 'outro';
  if (/chorus|refrain|catch/.test(n)) return 'chorus';
  if (/verse/.test(n)) return 'verse';
  return 'verse';
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length) % list.length];
}

/** Sentiment-ish word scan for tone (tiny lexicon, deterministic). */
const DARK_WORDS = ['night', 'dark', 'alone', 'cry', 'tears', 'pain', 'hurt', 'lost', 'broken', 'cold', 'rain', 'fall', 'gone', 'goodbye', 'heartbreak', 'empty', 'shadow', 'fight', 'fire', 'burn'];
const LIGHT_WORDS = ['love', 'sun', 'shine', 'bright', 'dance', 'forever', 'high', 'fly', 'free', 'together', 'gold', 'light', 'smile', 'dream', 'alive', 'summer', 'wild', 'young'];

function lyricMood(lines) {
  let dark = 0;
  let light = 0;
  for (const l of lines) {
    const words = (l.text || '').toLowerCase().split(/[^a-z]+/);
    for (const w of words) {
      if (DARK_WORDS.includes(w)) dark += 1;
      if (LIGHT_WORDS.includes(w)) light += 1;
    }
  }
  const total = dark + light;
  if (!total) return 0.5;
  return light / total; // 0 = dark, 1 = light
}

/**
 * Cast the characters for a song.
 * @returns {cast: [spec,...], protagonist index 0}
 */
function buildCast({ genre, seed }) {
  const rng = makeRng(hashString(`cast:${seed}`));
  const vibe = guessVibe(genre, rng);
  const duo = rng() < 0.32; // some songs feature a second artist
  const cast = [generateCharacter({ seed, vibe })];
  if (duo) {
    const others = Object.keys(VIBES).filter((k) => k !== vibe);
    cast.push(generateCharacter({ seed: (seed ^ 0x9e3779b9) >>> 0, vibe: pick(others, rng) }));
  }
  return cast;
}

/**
 * Build the full storyboard.
 * @param {object} p { analysis (analyzeLyrics result), audioInfo
 *                     {duration,sections[],beats[]}, seed, genre, cast? }
 * @returns { scenes: [{ start, end, role, framing, action, energy,
 *                       castIndex, expression, label }...], cast, mood }
 */
function buildStoryboard(p) {
  const { analysis, audioInfo, seed, genre } = p;
  const rng = makeRng(hashString(`story:${seed}`));
  const cast = p.cast || buildCast({ genre, seed });
  const valence = analysis && Number.isFinite(analysis.avgValence) ? analysis.avgValence : 0.2;
  const mood = clampNum(0.5 + valence / 2, 0, 1);
  const duration = (audioInfo && audioInfo.duration) || (analysis && analysis.duration) || 60;

  // 1) Scene skeleton from audio sections; fall back to lyric-section groups.
  let raw = [];
  const sections = (audioInfo && audioInfo.sections && audioInfo.sections.length
    ? audioInfo.sections
    : [{ type: 'song', start: 0, end: duration, energy: 60, isDrop: false }]).slice();

  const minScene = 3.2, maxScene = 8.0;
  for (const sec of sections) {
    const role = classifyRole(sec.type);
    const secLen = sec.end - sec.start;
    if (secLen <= 0) continue;
    const parts = Math.max(1, Math.min(6, Math.round(secLen / ((minScene + maxScene) / 2))));
    for (let i = 0; i < parts; i++) {
      raw.push({
        start: sec.start + (secLen * i) / parts,
        end: sec.start + (secLen * (i + 1) / parts),
        role,
        label: sec.type && sec.type !== 'song' ? `${sec.type}${parts > 1 ? ` ${i + 1}` : ''}` : 'Scene',
      });
    }
  }

  // 2) If we have timed lyric lines, refine: split scenes where the lyric
  //    section label changes, so the picture follows the SONG structure.
  const lines = (analysis && analysis.lines) || [];
  if (lines.length && lines[0].time != null) {
    const refined = [];
    for (const s of raw) {
      const inner = lines.filter((l) => l.time + Math.max(0.3, l.duration || 1) > s.start && l.time < s.end);
      if (!inner.length) { refined.push(s); continue; }
      let cur = null;
      for (const l of inner) {
        const role = classifyRole(l.section || s.role);
        if (!cur || role !== cur.role) {
          if (cur) refined.push(cur);
          const start = Math.max(s.start, l.time - 0.15);
          cur = { start, end: Math.min(s.end, l.time + (l.duration || 1)), role, label: role };
        } else {
          cur.end = Math.min(s.end, l.time + (l.duration || 1));
        }
      }
      if (cur) {
        // extend to section end if nothing follows
        refined.push(cur);
      }
      // stitch: make each refined scene end where the next begins
    }
    refined.sort((a, b) => a.start - b.start);
    for (let i = 0; i < refined.length - 1; i++) {
      refined[i].end = Math.min(refined[i].end, refined[i + 1].start + 0.01);
      if (refined[i].end - refined[i].start < 1.2) refined[i].end = refined[i + 1].start; // absorb micro-scenes
    }
    raw = refined.filter((s) => s.end - s.start > 0.4);
    // fill instrumental gaps > 2.5s with breakdown scenes
    const filled = [];
    let cursor = 0;
    for (const s of raw) {
      if (s.start - cursor > 2.5) {
        filled.push({ start: cursor, end: s.start - 0.05, role: 'breakdown', label: 'Instrumental' });
      }
      filled.push(s);
      cursor = Math.max(cursor, s.end);
    }
    if (duration - cursor > 2.5) filled.push({ start: cursor, end: duration, role: 'outro', label: 'Outro' });
    raw = filled;
  }

  if (duration) {
    raw = raw
      .map((s) => ({ ...s, end: Math.min(s.end, duration), start: Math.min(s.start, duration) }))
      .filter((s) => s.end - s.start > 0.25)
      .sort((a, b) => a.start - b.start);
  }
  if (!raw.length) raw = [{ start: 0, end: duration, role: 'verse', label: 'Verse' }];
  raw[raw.length - 1].end = Math.max(raw[raw.length - 1].end, duration - 0.01);

  // 3) Track chorus appearances so each chorus can escalate.
  const chorusScenes = raw.filter((s) => ['chorus', 'hook', 'drop', 'post'].includes(s.role));

  // 4) Assign visual language per scene
  const scenes = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    const lang = ROLE_LANGUAGE[s.role] || ROLE_LANGUAGE.verse;
    const isFinalChorus = chorusScenes.length > 1 && s === chorusScenes[chorusScenes.length - 1];

    let framing = pick(lang.framings, rng);
    let mandated = false;
    if (['chorus', 'hook', 'drop'].includes(s.role)) {
      const idx = chorusScenes.indexOf(s);
      if (idx === 0) { framing = 'closeup'; mandated = true; }            // first chorus: the reveal
      else if (isFinalChorus) { framing = 'wide'; mandated = true; }      // final chorus: full stage
      else framing = pick(['medium', 'closeup', 'wide'], rng);            // middle choruses vary
    }
    if (s.role === 'bridge') { framing = 'closeup'; mandated = true; }
    const prev = scenes[i - 1];
    if (!mandated && prev && prev.framing === framing && lang.framings.length > 1) {
      framing = lang.framings[(lang.framings.indexOf(framing) + 1) % lang.framings.length];
    }

    // who's on screen: protagonist carries choruses; verses alternate with duo
    let castIndex = 0;
    if (cast.length > 1) {
      const verseNo = raw.slice(0, i + 1).filter((x) => x.role === 'verse').length;
      if (s.role === 'verse') castIndex = (verseNo - 1) % 2;
      else if (s.role === 'bridge') castIndex = 1;
      else castIndex = 0;
    }

    let action = pick(lang.actions, rng);
    if (['chorus', 'hook', 'drop'].includes(s.role)) action = rng() < 0.55 ? 'sing' : 'dance';
    if (s.role === 'bridge') action = 'sing';
    if (s.role === 'breakdown') action = 'idle';

    const escalation = chorusScenes.length > 1 && ['chorus', 'hook', 'drop'].includes(s.role)
      ? chorusScenes.indexOf(s) / Math.max(1, chorusScenes.length - 1) * 0.15 : 0;
    const energy = clampNum(lang.energy + escalation + (mood - 0.5) * 0.1, 0.15, 1);
    const expression = {
      browRaise: clampNum(lang.expr.browRaise + (mood > 0.6 ? 0.1 : -0.05), 0, 1),
      browAnger: clampNum(lang.expr.browAnger + (mood < 0.4 ? 0.15 : 0), 0, 1),
    };

    scenes.push({
      start: s.start,
      end: s.end,
      role: s.role,
      label: s.label,
      framing,
      action,
      energy,
      castIndex,
      expression,
    });
  }

  return { scenes, cast, mood };
}

function clampNum(v, a, b) { return Math.max(a, Math.min(b, v)); }

/** Scene active at time t. */
function sceneAt(storyboard, t) {
  const { scenes } = storyboard;
  for (const s of scenes) {
    if (t >= s.start && t < s.end) return s;
  }
  return scenes.length ? { ...scenes[scenes.length - 1], start: -Infinity, end: Infinity } : null;
}

/** Two-shot helper: do both cast members share the screen? */
function isTwoShot(scene, castLength) {
  return castLength > 1 && (scene.role === 'chorus' || scene.role === 'hook' || scene.role === 'outro' || scene.action === 'dance') && scene.framing !== 'closeup';
}

module.exports = { buildStoryboard, buildCast, sceneAt, isTwoShot, classifyRole, lyricMood };
