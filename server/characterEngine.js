// server/characterEngine.js — procedural character cast + 2D puppet renderer.
//
// Creates a consistent, seeded cast (appearance never changes within a song)
// and paints stylized animated characters with:
//   • viseme-based mouth shapes driven by audio/lyrics (lip-sync)
//   • blinking, breathing, sway, beat gestures, expressive brows
//   • hair/outfit/accessory variety, environment rim-lighting
//
// Everything is drawn in a normalized "u" space: the character is 100u tall,
// feet at the anchor point, head center ~8u below the top.

const { makeRng, hashString } = require('./lyricsAnalysis');

// ---------------------------------------------------------------------------
// Cast generation
// ---------------------------------------------------------------------------
const NAMES_F = ['Nova', 'Luna', 'Aria', 'Skye', 'Jade', 'Ruby', 'Mira', 'Vera', 'Iris', 'Zara', 'Cleo', 'Nina'];
const NAMES_M = ['Jett', 'Ace', 'Rio', 'Kai', 'Dre', 'Leo', 'Max', 'Cruz', 'Neo', 'Zayn', 'Ash', 'Rome'];
const ROLES = ['the vocalist', 'the dreamer', 'the rebel', 'the storyteller', 'the wildcard', 'the romantic'];

const SKIN_TONES = [
  'hsl(28, 45%, 82%)', 'hsl(27, 42%, 68%)', 'hsl(26, 38%, 55%)',
  'hsl(25, 36%, 42%)', 'hsl(24, 34%, 30%)', 'hsl(26, 40%, 22%)',
];
const HAIR_COLORS = [
  'hsl(20, 30%, 12%)', 'hsl(25, 40%, 20%)', 'hsl(30, 45%, 32%)',
  'hsl(0, 0%, 92%)', 'hsl(280, 60%, 45%)', 'hsl(190, 70%, 45%)', 'hsl(330, 75%, 52%)',
];
const HAIR_STYLES = ['crop', 'long', 'curly', 'ponytail', 'buzz', 'hood'];
const ACCESSORIES = ['none', 'none', 'glasses', 'earrings', 'cap', 'headphones', 'chain'];
const OUTFIT_STYLES = ['jacket', 'hoodie', 'tee', 'dress'];

// Character Studio (leadActor) field mapping -> puppet engine styles
const HAIR_STYLE_MAP = {
  'cyber-ponytail': 'ponytail',
  'cosmic-afro': 'curly',
  'lunar-waves': 'long',
  'neo-pixie': 'crop',
  'dread-crown': 'long',
  // direct engine styles pass through
  crop: 'crop', long: 'long', curly: 'curly', ponytail: 'ponytail', buzz: 'buzz', hood: 'hood',
};
const ACCESSORY_MAP = { 'holo-visor': 'glasses', glasses: 'glasses', cap: 'cap', headphones: 'headphones', chain: 'chain', earrings: 'earrings', none: 'none' };

function applyOverrides(ch, o) {
  if (!o) return ch;
  if (o.name) ch.name = String(o.name).slice(0, 24);
  if (o.gender === 'f' || o.gender === 'm') ch.gender = o.gender;
  if (o.role) ch.role = String(o.role).slice(0, 24);
  if (typeof o.skin === 'string' && /^#[0-9a-f]{6}$/i.test(o.skin)) ch.skin = o.skin;
  const hc = {};
  if (typeof o.hairColor === 'string' && /^#[0-9a-f]{6}$/i.test(o.hairColor)) hc.color = o.hairColor;
  if (o.hairStyle && HAIR_STYLE_MAP[o.hairStyle]) hc.style = HAIR_STYLE_MAP[o.hairStyle];
  if (hc.color || hc.style) ch.hair = { ...ch.hair, ...hc };
  if (o.accessory != null && ACCESSORY_MAP[o.accessory] !== undefined) ch.accessory = ACCESSORY_MAP[o.accessory];
  if (typeof o.auraColor === 'string' && /^#[0-9a-f]{6}$/i.test(o.auraColor)) ch.auraColor = o.auraColor;
  return ch;
}

function createCast(seed, opts = {}) {
  const size = Math.max(1, Math.min(2, Number(opts.size) || 1));
  const rng = makeRng((seed ^ 0x5f3759df) >>> 0);
  const cast = [];
  for (let i = 0; i < size; i++) {
    const gender = rng() > 0.5 ? 'f' : 'm';
    const paletteHue = Math.floor(rng() * 360);
    cast.push({
      id: `char_${i}`,
      name: gender === 'f' ? NAMES_F[Math.floor(rng() * NAMES_F.length)] : NAMES_M[Math.floor(rng() * NAMES_M.length)],
      role: ROLES[Math.floor(rng() * ROLES.length)],
      gender,
      skin: SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)],
      hair: {
        style: HAIR_STYLES[Math.floor(rng() * HAIR_STYLES.length)],
        color: HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)],
      },
      outfit: {
        style: OUTFIT_STYLES[Math.floor(rng() * OUTFIT_STYLES.length)],
        main: `hsl(${paletteHue}, ${45 + Math.floor(rng() * 30)}%, ${16 + Math.floor(rng() * 14)}%)`,
        accent: `hsl(${(paletteHue + 40 + Math.floor(rng() * 80)) % 360}, 70%, 55%)`,
      },
      accessory: ACCESSORIES[Math.floor(rng() * ACCESSORIES.length)],
      build: 0.92 + rng() * 0.18,
      browMood: opts.mood === 'melancholy' ? 'sad' : opts.mood === 'uplifting' ? 'happy' : 'fierce',
      phase: rng() * Math.PI * 2,
    });
  }
  // Character Studio lead design overrides the lead role
  if (opts.overrides) applyOverrides(cast[0], opts.overrides);
  if (opts.overrides2) applyOverrides(cast[1], opts.overrides2);
  return cast;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function shade(hslStr, dl) {
  // hsl(h,s%,l%) → adjust lightness
  return hslStr.replace(/,\s*(\d+)%\)$/, (_, l) => `, ${clamp(parseInt(l, 10) + dl, 2, 96)}%)`);
}

// ---------------------------------------------------------------------------
// Mouth (viseme) rendering — the lip-sync core.
// s.mouth = { open: 0..1 (jaw), shape: 'AA'|'OH'|'EE'|'MM'|'rest', smile: -1..1 }
// Coordinates in u units, mouth center at (0, 11.2).
// ---------------------------------------------------------------------------
function paintMouth(ctx, u, mouth, mood, cy) {
  const open = clamp(mouth.open, 0, 1);
  const shape = mouth.shape || 'rest';
  const mx = 0;
  const my = (cy != null ? cy + 4.9 : 11.2); // just above chin, below nose

  ctx.save();
  if (shape === 'rest' || open < 0.06) {
    // closed lip line with mood curvature
    ctx.strokeStyle = 'rgba(60,20,25,0.9)';
    ctx.lineWidth = 0.34 * u;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const curve = (mood === 'happy' ? 0.55 : mood === 'sad' ? -0.4 : 0.1);
    ctx.moveTo(mx - 1.5 * u, my - curve * u * 0.2);
    ctx.quadraticCurveTo(mx, my + curve * u * 0.6, mx + 1.5 * u, my - curve * u * 0.2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  let rx = 1.7, ryK = 1.0;
  if (shape === 'AA') { rx = 1.55; ryK = 1.0; }
  else if (shape === 'OH') { rx = 1.05; ryK = 0.95; }
  else if (shape === 'EE') { rx = 2.15; ryK = 0.55; }
  else if (shape === 'MM') { rx = 1.2; ryK = 0.18; }

  const ry = (0.28 + 2.05 * open) * ryK;

  // oral cavity
  ctx.fillStyle = '#3a0d14';
  ctx.beginPath();
  ctx.ellipse(mx * u, my * u, rx * u, ry * u, 0, 0, Math.PI * 2);
  ctx.fill();
  // tongue hint
  if (open > 0.3) {
    ctx.fillStyle = 'rgba(190,80,90,0.75)';
    ctx.beginPath();
    ctx.ellipse(mx * u, (my + ry * 0.45) * u, rx * 0.6 * u, ry * 0.34 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // upper teeth
  if (open > 0.18 && shape !== 'OH') {
    ctx.fillStyle = 'rgba(245,245,240,0.95)';
    const tw = rx * 1.5 * u, th = ry * 0.32 * u;
    ctx.beginPath();
    ctx.roundRect(mx * u - tw / 2, (my - ry) * u, tw, Math.max(0.12 * u, th), 0.08 * u);
    ctx.fill();
  }
  // lips outline
  ctx.strokeStyle = 'rgba(70,25,30,0.85)';
  ctx.lineWidth = 0.3 * u;
  ctx.beginPath();
  if (shape === 'OH') {
    ctx.ellipse(mx * u, my * u, (rx + 0.22) * u, (ry + 0.22) * u, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(mx * u, my * u, (rx + 0.25) * u, (ry + 0.2) * u, 0, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Full character painter.
// state = {
//   x, y       ground point (px) — character stands on y
//   u          pixel size of one u-unit (character height = 100u)
//   t, pulse, energy, char, faceYaw (-1..1), mood,
//   mouth {open, shape}, blink 0..1, pose ('idle'|'sing'|'chest'|'point'|'dance'|'walk'),
//   rim (css color), dim (0..1 depth fade), ground (bool draw shadow)
// }
// ---------------------------------------------------------------------------
function paintCharacter(ctx, st) {
  const { char, u, t } = st;
  const sway = Math.sin(t * 1.1 + char.phase) * 0.9 + Math.sin(t * 0.53 + char.phase * 2) * 0.5;
  const breath = Math.sin(t * 1.9 + char.phase) * 0.35;
  const bounce = 1 + (st.pulse || 0) * 0.035 * (st.pose === 'dance' ? 2 : 1);
  const dim = st.dim != null ? st.dim : 1;

  ctx.save();
  ctx.translate(st.x, st.y);
  ctx.scale(u * bounce, u * bounce);
  ctx.translate(sway * (st.pose === 'walk' ? 2.2 : 1), Math.sin(t * 2.2 + char.phase) * 0.5 - (1 - bounce) * 12);
  if (st.faceYaw) ctx.rotate(st.faceYaw * 0.03);

  ctx.globalAlpha = dim;

  const skin = char.skin;
  const skinDark = shade(skin, -14);
  const outfit = char.outfit.main;
  const outfitAccent = char.outfit.accent;

  // ---- ground shadow ----
  if (st.ground) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 16, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const legTop = 46, hipW = 6.4 * char.build;
  const legPhase = st.pose === 'walk' ? Math.sin(t * 5.2) * 3.2 : 0;

  // ---- legs ----
  ctx.strokeStyle = shade(outfit, -8);
  ctx.lineCap = 'round';
  ctx.lineWidth = 4.6 * char.build;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * hipW * 0.5, legTop);
    ctx.quadraticCurveTo(side * hipW * 0.62 + legPhase * side * 0.4, 72, side * 2.4 + legPhase * side, 97);
    ctx.stroke();
  }
  // shoes
  ctx.fillStyle = '#14161f';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 2.4 + legPhase * side, 98.2, 2.7, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- torso ----
  const shY = 21, shW = 10.4 * char.build;
  const torsoGrad = ctx.createLinearGradient(-shW, shY, shW, 46);
  torsoGrad.addColorStop(0, shade(outfit, 6));
  torsoGrad.addColorStop(1, shade(outfit, -6));
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-shW, shY + 1.5);
  ctx.quadraticCurveTo(-shW - 1, shY - 2, -shW + 2.4, shY - 2.4);
  ctx.lineTo(shW - 2.4, shY - 2.4);
  ctx.quadraticCurveTo(shW + 1, shY - 2, shW, shY + 1.5);
  if (char.outfit.style === 'dress') {
    ctx.quadraticCurveTo(shW + 3.5, 36, shW + 7.5, legTop + 2);
    ctx.lineTo(-shW - 7.5, legTop + 2);
    ctx.quadraticCurveTo(-shW - 3.5, 36, -shW, shY + 1.5);
  } else {
    ctx.quadraticCurveTo(shW * 0.9, 38, hipW * 0.8, legTop);
    ctx.lineTo(-hipW * 0.8, legTop);
    ctx.quadraticCurveTo(-shW * 0.9, 38, -shW, shY + 1.5);
  }
  ctx.closePath();
  ctx.fill();

  // outfit details
  if (char.outfit.style === 'hoodie') {
    ctx.strokeStyle = outfitAccent;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-2, shY + 1); ctx.lineTo(-2.6, 32);
    ctx.moveTo(2, shY + 1); ctx.lineTo(2.6, 32);
    ctx.stroke();
    ctx.fillStyle = shade(outfit, -4);
    ctx.beginPath();
    ctx.roundRect(-4.4, 36, 8.8, 6, 1.4);
    ctx.fill();
  } else if (char.outfit.style === 'jacket') {
    ctx.strokeStyle = shade(outfit, -12);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, shY - 1.5); ctx.lineTo(-1.2, 44);
    ctx.stroke();
    ctx.fillStyle = outfitAccent;
    ctx.beginPath(); ctx.roundRect(-shW * 0.55, shY + 8, 2.2, 2.2, 0.5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(shW * 0.55 - 2.2, shY + 8, 2.2, 2.2, 0.5); ctx.fill();
  } else if (char.outfit.style === 'dress') {
    ctx.strokeStyle = outfitAccent; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-shW * 0.8, 30); ctx.quadraticCurveTo(0, 33.5, shW * 0.8, 30); ctx.stroke();
  }
  // neck
  ctx.fillStyle = skinDark;
  ctx.beginPath();
  ctx.roundRect(-1.7, 14.5, 3.4, 6.5, 1);
  ctx.fill();

  // ---- arms + hands (pose driven) ----
  const armPoses = {
    idle: [-0.5, 0.5, -0.1, 0.1],
    sing: [-2.35, 0.35, -0.5, 0.25],
    chest: [-1.9, 0.12, -0.85, 0.1],
    point: [-0.4, 0.55, -2.3, 0.2],
    dance: [-1.6, 0.9, -1.2, -0.75],
    walk: [-0.75, 0.75, 0.55, -0.55],
  };
  const [aLout, aLin, aRout, aRin] = armPoses[st.pose] || armPoses.idle;
  const gest = Math.sin(t * 3.1 + char.phase) * (0.14 + (st.energy || 0.4) * 0.22 + (st.pulse || 0) * 0.3);
  const drawArm = (side, outA, inA) => {
    const sx = side * (shW - 0.8);
    const elbowX = sx + side * 1.2 + Math.sin(outA) * 7.2;
    const elbowY = shY + 6 + Math.cos(outA) * 6.5;
    const handX = elbowX + side * 0.4 + Math.sin(outA + inA + gest * side) * 7.4;
    const handY = elbowY + 8.6 + Math.cos(outA + inA) * 2.2;
    ctx.strokeStyle = char.outfit.style === 'tee' || char.outfit.style === 'dress' ? skin : shade(outfit, 2);
    ctx.lineWidth = 3.5 * char.build;
    ctx.beginPath();
    ctx.moveTo(sx, shY + 1);
    ctx.quadraticCurveTo(elbowX, elbowY, handX, handY);
    ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(handX, handY, 1.75, 0, Math.PI * 2);
    ctx.fill();
  };
  drawArm(-1, aLout, aLin);
  drawArm(1, aRout, aRin);

  if (char.accessory === 'chain') {
    ctx.strokeStyle = 'hsl(45, 85%, 60%)';
    ctx.lineWidth = 0.42;
    ctx.beginPath();
    ctx.moveTo(-2.4, shY + 0.5);
    ctx.quadraticCurveTo(0, shY + 6 + breath, 2.4, shY + 0.5);
    ctx.stroke();
  }

  // ---- head ----
  const headR = 7.4;
  const headCY = 8 + breath * 0.4;
  const headTilt = Math.sin(t * 0.9 + char.phase) * 0.045 + (st.pulse || 0) * 0.03;
  ctx.save();
  ctx.translate(0, headCY);
  ctx.rotate(headTilt);
  ctx.translate(0, -headCY);

  // hair back layer (long/ponytail behind head)
  const hairBack = (style) => {
    ctx.fillStyle = shade(char.hair.color, -6);
    if (style === 'long') {
      ctx.beginPath();
      ctx.moveTo(-headR - 0.6, headCY - 3);
      ctx.quadraticCurveTo(-headR - 2.6, headCY + 14 + Math.sin(t * 1.2) * 0.5, -headR - 1.2, headCY + 19);
      ctx.lineTo(headR + 1.2, headCY + 19);
      ctx.quadraticCurveTo(headR + 2.6, headCY + 14, headR + 0.6, headCY - 3);
      ctx.closePath();
      ctx.fill();
    } else if (style === 'ponytail') {
      const sw = Math.sin(t * 1.6 + char.phase) * 2.4;
      ctx.beginPath();
      ctx.moveTo(headR * 0.7, headCY - 4.5);
      ctx.quadraticCurveTo(headR + 5.5 + sw, headCY + 2, headR + 3.5 + sw, headCY + 13);
      ctx.quadraticCurveTo(headR + 1.5 + sw, headCY + 6, headR * 0.8, headCY - 1.5);
      ctx.closePath();
      ctx.fill();
    }
  };
  if (char.hair.style === 'long' || char.hair.style === 'ponytail') hairBack(char.hair.style);

  // face
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, headCY + 0.6, headR * 0.92, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  // jaw shade
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(0, headCY + 5.4, headR * 0.62, headR * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(-headR * 0.9, headCY + 1, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(headR * 0.9, headCY + 1, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  if (char.accessory === 'earrings') {
    ctx.fillStyle = 'hsl(45, 90%, 62%)';
    ctx.beginPath(); ctx.arc(-headR * 0.9, headCY + 3.1, 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(headR * 0.9, headCY + 3.1, 0.55, 0, Math.PI * 2); ctx.fill();
  }

  // hair top styles
  const hc = char.hair.color;
  if (char.hair.style === 'crop' || char.hair.style === 'buzz' || char.hair.style === 'long' || char.hair.style === 'ponytail') {
    ctx.fillStyle = hc;
    ctx.beginPath();
    ctx.ellipse(0, headCY - 2.6, headR * 0.97, headR * 0.72, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (char.hair.style === 'crop') {
      ctx.beginPath();
      ctx.ellipse(-headR * 0.28, headCY - 4.6, headR * 0.5, headR * 0.34, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (char.hair.style === 'curly') {
    ctx.fillStyle = hc;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * headR * 0.78, headCY - 1.4 + Math.sin(a) * headR * 0.72, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (char.hair.style === 'hood') {
    ctx.fillStyle = shade(char.outfit.main, 6);
    ctx.beginPath();
    ctx.ellipse(0, headCY - 0.6, headR * 1.18, headR * 1.14, 0, Math.PI * 0.94, Math.PI * 2.06);
    ctx.quadraticCurveTo(headR * 1.2, headCY + 6, 0, headCY + 6.2);
    ctx.quadraticCurveTo(-headR * 1.2, headCY + 6, -headR * 1.18, headCY - 0.6);
    ctx.fill();
  } else if (char.hair.style === 'cap') {
    ctx.fillStyle = char.outfit.accent;
    ctx.beginPath();
    ctx.ellipse(0, headCY - 2.8, headR * 1.0, headR * 0.62, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, headCY - 2.4, headR * 1.35, headR * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- eyes ----
  const blink = st.blink || 0;
  const eyeY = headCY + 0.4;
  for (const side of [-1, 1]) {
    const ex = side * 2.75;
    const openH = 1.15 * (1 - blink);
    ctx.fillStyle = '#fff';
    if (openH > 0.12) {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 1.35, openH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1d1626';
      ctx.beginPath();
      ctx.ellipse(ex + (st.faceYaw || 0) * 0.5, eyeY, 0.72, Math.max(0.2, openH * 0.78), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex + (st.faceYaw || 0) * 0.5 - 0.28, eyeY - 0.3, 0.24, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#1d1626';
      ctx.lineWidth = 0.34;
      ctx.beginPath();
      ctx.moveTo(ex - 1.1, eyeY);
      ctx.lineTo(ex + 1.1, eyeY);
      ctx.stroke();
    }
    // brow
    const mood = st.mood || char.browMood || 'fierce';
    ctx.strokeStyle = shade(hc, -4);
    ctx.lineWidth = 0.55;
    ctx.lineCap = 'round';
    ctx.beginPath();
    let tilt = 0.12;
    if (mood === 'sad') tilt = side * -0.42;
    else if (mood === 'fierce') tilt = side * 0.34;
    else if (mood === 'happy') tilt = -side * 0.14;
    ctx.moveTo(ex - 1.3, eyeY - 1.9 + tilt);
    ctx.quadraticCurveTo(ex, eyeY - 2.5 - Math.abs(tilt) * 0.3, ex + 1.3, eyeY - 1.9 - tilt);
    ctx.stroke();
  }

  // nose
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(0.2, headCY + 2.2);
  ctx.quadraticCurveTo(0.9, headCY + 4.1, 0.1, headCY + 4.5);
  ctx.stroke();

  // mouth (lip-sync) — ctx is already in body units; pass u=1
  paintMouth(ctx, 1, st.mouth || { open: 0, shape: 'rest' }, st.mood, headCY);

  if (char.accessory === 'glasses') {
    ctx.strokeStyle = 'rgba(20,22,30,0.9)';
    ctx.lineWidth = 0.4;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(side * 2.75 - 1.7, headCY - 0.9, 3.4, 2.4, 0.6);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(1.05, headCY - 0.2);
    ctx.lineTo(-1.05, headCY - 0.2);
    ctx.stroke();
  }
  if (char.accessory === 'headphones') {
    ctx.strokeStyle = '#171a24';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, headCY - 0.8, headR * 1.06, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    // simple pads
    ctx.fillStyle = '#171a24';
    ctx.beginPath(); ctx.ellipse(-headR, headCY + 1, 1.3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headR, headCY + 1, 1.3, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore(); // head tilt

  // ---- rim light from the environment ----
  if (st.rim) {
    ctx.globalAlpha = dim * 0.75;
    ctx.strokeStyle = st.rim;
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(shW * 0.92, shY + 2);
    ctx.quadraticCurveTo(headR * 1.15, headCY - 3, headR * 0.72, headCY - headR * 0.9);
    ctx.stroke();
    ctx.globalAlpha = dim;
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Lip-sync state machine — drives mouth {open, shape} per frame.
// wordTimeline: [{start, end, word, lineIdx, wordIdx}]
// vocalEnv: {fps, data} | null
// ---------------------------------------------------------------------------
function createMouthDriver(wordTimeline, vocalEnv, seed) {
  let prevOpen = 0;
  const VISEMES = ['AA', 'EE', 'OH', 'AA', 'MM', 'EE', 'OH'];
  const rng = makeRng((seed || 1) >>> 0);

  function envAt(t) {
    if (vocalEnv && vocalEnv.data && vocalEnv.data.length) {
      const idx = clamp(Math.round(t * vocalEnv.fps), 0, vocalEnv.data.length - 1);
      return vocalEnv.data[idx];
    }
    return null;
  }

  function wordAt(t) {
    let lo = 0, hi = wordTimeline.length - 1, found = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const w = wordTimeline[mid];
      if (t >= w.start && t < w.end) { found = w; break; }
      if (t < w.start) hi = mid - 1; else lo = mid + 1;
    }
    return found;
  }

  return function mouthAt(t) {
    let target = 0;
    let shape = 'rest';

    const env = envAt(t);
    const w = wordAt(t);

    if (w) {
      const prog = clamp((t - w.start) / Math.max(0.08, w.end - w.start), 0, 1);
      const syllables = Math.max(1, Math.round(w.word.replace(/[^a-z]/gi, '').length / 2.2));
      const sylOsc = Math.abs(Math.sin(prog * Math.PI * syllables));
      const amp = env != null ? 0.35 + 0.65 * env : 0.85;
      target = clamp(amp * (0.25 + 0.75 * sylOsc), 0, 1);
      const vi = (hashString(w.word) + Math.floor(prog * syllables)) % VISEMES.length;
      shape = VISEMES[vi];
    } else if (env != null && env > 0.14) {
      // instrumental vocal-ish line: improvise visemes
      target = clamp(env * 1.15, 0, 1);
      const vi = Math.floor(t * 7.5 + rng() * 0.001) % VISEMES.length;
      shape = VISEMES[(vi + (seed % 3)) % VISEMES.length];
    }

    prevOpen = lerp(prevOpen, target, 0.55);
    if (target < 0.06 && prevOpen < 0.08) { prevOpen = 0; shape = 'rest'; }
    return { open: prevOpen, shape };
  };
}

function blinkAt(t, phase) {
  // occasional blinks (~every 3-5s), 140ms closed
  const cycle = 3.4 + (phase % 1.7);
  const local = (t + phase) % cycle;
  return local < 0.14 ? Math.sin((local / 0.14) * Math.PI) : 0;
}

module.exports = { createCast, paintCharacter, paintMouth, createMouthDriver, blinkAt, applyOverrides };
