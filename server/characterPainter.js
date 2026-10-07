// server/characterPainter.js — Procedural character renderer.
//
// Paints a fully-specified character (from characterEngine.js) frame-by-frame:
// expressive vector face with viseme-driven lip sync, hair styles, outfits,
// accessories, poses (sing / dance / walk / reach / idle), and a concert
// stage backdrop for performance shots. Pure Skia canvas — deterministic.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

function hsla(h, s, l, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }

// ---------------------------------------------------------------------------
// Face
// ---------------------------------------------------------------------------

/**
 * Draw the character's head in LOCAL coordinates: head center at (0,0),
 * chin at +1r, crown at -1r. Caller sets transform/scale.
 * @param {object} o { r, spec, viseme:{open,wide,round,smile,singing},
 *                     expression:{browRaise,browAnger}, blink 0..1,
 *                     t, pal, energy, pulse, threeQuater? }
 */
function drawHead(ctx, o) {
  const { r, spec, pal } = o;
  const vis = o.viseme || { open: 0, wide: 0, round: 0, smile: 0.15 };
  const expr = o.expression || { browRaise: 0, browAnger: 0 };
  const blink = clamp(o.blink || 0, 0, 1);
  const skin = spec.skin;
  const jaw = spec.jawSoft || 1; // 1 = soft round, 0.85 = narrower
  const [hh, hs, hl] = spec.hair.color;

  // ---- back hair (behind head) ----
  drawHairBack(ctx, r, spec, o);

  // ---- neck & shoulders hint ----
  ctx.fillStyle = hsla(skin.shade[0], skin.shade[1], skin.shade[2] - 4);
  ctx.beginPath();
  ctx.roundRect(-0.30 * r, 0.62 * r, 0.60 * r, 0.85 * r, 0.16 * r);
  ctx.fill();
  // chin shadow on neck
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.roundRect(-0.30 * r, 0.66 * r, 0.60 * r, 0.26 * r, 0.12 * r);
  ctx.fill();

  // ---- ears ----
  for (const side of [-1, 1]) {
    ctx.fillStyle = hsla(skin.base[0], skin.base[1], skin.base[2] - 6);
    ctx.beginPath();
    ctx.ellipse(side * 0.80 * r, 0.10 * r, 0.13 * r, 0.20 * r, 0, 0, TAU);
    ctx.fill();
    if (spec.accessories.includes('earrings') || spec.accessories.includes('earring')) {
      ctx.fillStyle = hsla(spec.outfit.accentHue, 90, 68, 0.95);
      ctx.beginPath();
      ctx.arc(side * 0.82 * r, 0.26 * r, 0.05 * r, 0, TAU);
      ctx.fill();
    }
  }

  // ---- face shape ----
  const faceGrad = ctx.createLinearGradient(0, -r, 0.25 * r, r);
  faceGrad.addColorStop(0, hsla(skin.base[0], skin.base[1], Math.min(96, skin.base[2] + 6)));
  faceGrad.addColorStop(0.65, hsla(skin.base[0], skin.base[1], skin.base[2]));
  faceGrad.addColorStop(1, hsla(skin.shade[0], skin.shade[1], skin.shade[2]));
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(-0.80 * r * jaw, -0.08 * r);
  ctx.bezierCurveTo(-0.82 * r * jaw, 0.52 * r, -0.42 * r, 1.00 * r, 0, 1.00 * r);
  ctx.bezierCurveTo(0.42 * r, 1.00 * r, 0.82 * r * jaw, 0.52 * r, 0.80 * r * jaw, -0.08 * r);
  ctx.bezierCurveTo(0.72 * r, -0.92 * r, -0.72 * r, -0.92 * r, -0.80 * r * jaw, -0.08 * r);
  ctx.closePath();
  ctx.fill();

  // side shade (right)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0.12 * r, -0.9 * r);
  ctx.bezierCurveTo(0.75 * r, -0.7 * r, 0.85 * r * jaw, 0.3 * r, 0.25 * r, 1.0 * r);
  ctx.bezierCurveTo(0.55 * r, 0.6 * r, 0.75 * r * jaw, 0.0 * r, 0.60 * r, -0.6 * r);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = hsla(skin.shade[0], skin.shade[1], skin.shade[2], 0.35);
  ctx.fillRect(-r, -r, 2.2 * r, 2.4 * r);
  ctx.restore();

  // ---- brows ----
  const browY = (-0.24 + expr.browRaise * -0.09) * r;
  for (const side of [-1, 1]) {
    const anger = expr.browAnger * side * 0.06 * r;
    ctx.save();
    ctx.translate(side * 0.34 * r, browY + anger);
    ctx.rotate(side * (0.10 + expr.browAnger * 0.28) - expr.browRaise * 0.05 * side);
    ctx.fillStyle = hsla(hh, Math.max(10, hs - 10), Math.max(6, hl - 4));
    ctx.beginPath();
    ctx.roundRect(-0.19 * r, -0.045 * r * spec.browThickness * 2, 0.38 * r, 0.09 * r * spec.browThickness * 2, 0.05 * r);
    ctx.fill();
    ctx.restore();
  }

  // ---- eyes ----
  const eyeY = 0.08 * r;
  const eyeRx = 0.155 * r * spec.eyes.size;
  const eyeRy = 0.105 * r * spec.eyes.size * (1 - blink * 0.92);
  const squint = vis.singing ? 0.88 : 1;
  for (const side of [-1, 1]) {
    const ex = side * 0.34 * r;
    // sclera
    ctx.fillStyle = '#f6f3ef';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRx, Math.max(0.012 * r, eyeRy * squint), 0, 0, TAU);
    ctx.fill();
    if (blink < 0.85) {
      // iris + pupil + highlight
      const irisR = eyeRy * 0.95;
      ctx.fillStyle = hsla(spec.eyes.color[0], spec.eyes.color[1], spec.eyes.color[2]);
      ctx.beginPath();
      ctx.arc(ex + side * 0.02 * r, eyeY, irisR, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(10,8,14,0.9)';
      ctx.beginPath();
      ctx.arc(ex + side * 0.02 * r, eyeY, irisR * 0.45, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex + side * 0.02 * r - irisR * 0.3, eyeY - irisR * 0.35, irisR * 0.22, 0, TAU);
      ctx.fill();
    }
    // upper lash / lid line
    ctx.strokeStyle = 'rgba(20,14,20,0.85)';
    ctx.lineWidth = 0.045 * r;
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRx, Math.max(0.012 * r, eyeRy * squint), 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }

  // ---- nose ----
  ctx.strokeStyle = hsla(skin.shade[0], skin.shade[1], skin.shade[2] - 8, 0.85);
  ctx.lineWidth = 0.05 * r;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0.015 * r, 0.22 * r);
  ctx.quadraticCurveTo(0.06 * r, 0.34 * r, 0.045 * r, 0.40 * r);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.045 * r, 0.42 * r);
  ctx.quadraticCurveTo(0, 0.455 * r, -0.05 * r, 0.425 * r);
  ctx.stroke();

  // ---- mouth (viseme-driven) ----
  drawMouth(ctx, r, spec, vis);

  // ---- blush ----
  ctx.fillStyle = 'rgba(255,110,130,0.16)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 0.48 * r, 0.34 * r, 0.13 * r, 0.075 * r, 0, 0, TAU);
    ctx.fill();
  }

  // ---- front hair ----
  drawHairFront(ctx, r, spec, o);

  // ---- accessories over face ----
  if (spec.accessories.includes('glasses')) {
    ctx.strokeStyle = 'rgba(230,235,245,0.9)';
    ctx.lineWidth = 0.045 * r;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(side * 0.34 * r - 0.19 * r, eyeY - 0.15 * r, 0.38 * r, 0.32 * r, 0.09 * r);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-0.15 * r, eyeY - 0.02 * r);
    ctx.lineTo(0.15 * r, eyeY - 0.02 * r);
    ctx.stroke();
    ctx.fillStyle = 'rgba(160,200,255,0.14)';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(side * 0.34 * r - 0.19 * r, eyeY - 0.15 * r, 0.38 * r, 0.32 * r, 0.09 * r);
      ctx.fill();
    }
  } else if (spec.accessories.includes('visor')) {
    const g = ctx.createLinearGradient(-0.6 * r, 0, 0.6 * r, 0);
    g.addColorStop(0, hsla(spec.outfit.accentHue, 90, 60, 0.75));
    g.addColorStop(1, hsla(pal ? pal.base : 260, 90, 55, 0.75));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-0.62 * r, eyeY - 0.16 * r, 1.24 * r, 0.30 * r, 0.12 * r);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.roundRect(-0.55 * r, eyeY - 0.12 * r, 0.5 * r, 0.07 * r, 0.04 * r);
    ctx.fill();
  }

  // ---- rim light (scene palette) ----
  if (pal) {
    ctx.save();
    ctx.beginPath();
    // re-trace face path for clip
    ctx.moveTo(-0.80 * r * jaw, -0.08 * r);
    ctx.bezierCurveTo(-0.82 * r * jaw, 0.52 * r, -0.42 * r, 1.00 * r, 0, 1.00 * r);
    ctx.bezierCurveTo(0.42 * r, 1.00 * r, 0.82 * r * jaw, 0.52 * r, 0.80 * r * jaw, -0.08 * r);
    ctx.bezierCurveTo(0.72 * r, -0.92 * r, -0.72 * r, -0.92 * r, -0.80 * r * jaw, -0.08 * r);
    ctx.closePath();
    ctx.clip();
    const rim = ctx.createLinearGradient(0.2 * r, 0, 0.85 * r, 0);
    rim.addColorStop(0, 'rgba(0,0,0,0)');
    rim.addColorStop(1, hsla(pal.base, 90, 62, 0.4));
    ctx.fillStyle = rim;
    ctx.fillRect(-r, -r, 2.2 * r, 2.4 * r);
    ctx.restore();
  }
}

function drawMouth(ctx, r, spec, vis) {
  const mx = 0;
  const my = 0.66 * r;
  const open = clamp(vis.open || 0, 0, 1);
  const wide = clamp(vis.wide || 0, 0, 1);
  const round = clamp(vis.round || 0, 0, 1);
  const smile = clamp(vis.smile != null ? vis.smile : 0.2, -1, 1);
  const lipW = 0.34 * r * (1 + 0.28 * wide - 0.34 * round);
  const lipH = (0.035 + 0.42 * open * (1 + 0.35 * round)) * r * (spec.lips.fullness || 1);

  if (open < 0.06) {
    // closed: smile / frown curve
    ctx.strokeStyle = hsla(355, 55, 38, 0.95);
    ctx.lineWidth = 0.055 * r * (spec.lips.fullness || 1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx - lipW * 0.62, my - smile * 0.075 * r);
    ctx.quadraticCurveTo(mx, my + smile * 0.12 * r, mx + lipW * 0.62, my - smile * 0.075 * r);
    ctx.stroke();
    // lower lip hint
    ctx.strokeStyle = 'rgba(255,140,150,0.25)';
    ctx.lineWidth = 0.045 * r;
    ctx.beginPath();
    ctx.moveTo(mx - lipW * 0.4, my + 0.09 * r);
    ctx.quadraticCurveTo(mx, my + (0.12 + smile * 0.03) * r, mx + lipW * 0.4, my + 0.09 * r);
    ctx.stroke();
    return;
  }

  // open mouth
  ctx.fillStyle = '#4a1220';
  ctx.beginPath();
  ctx.ellipse(mx, my, lipW, lipH, 0, 0, TAU);
  ctx.fill();
  // upper teeth
  if (open > 0.3) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mx, my, lipW * 0.96, lipH * 0.96, 0, 0, TAU);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,252,248,0.95)';
    ctx.beginPath();
    ctx.ellipse(mx, my - lipH * 0.78, lipW * 0.9, lipH * 0.38, 0, 0, TAU);
    ctx.fill();
    if (open > 0.62) {
      ctx.fillStyle = 'rgba(200,80,95,0.85)';
      ctx.beginPath();
      ctx.ellipse(mx, my + lipH * 0.82, lipW * 0.55, lipH * 0.34, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  // lip outline
  ctx.strokeStyle = hsla(355, 55, 34, 0.9);
  ctx.lineWidth = 0.045 * r * (spec.lips.fullness || 1);
  ctx.beginPath();
  ctx.ellipse(mx, my, lipW, lipH, 0, 0, TAU);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Hair
// ---------------------------------------------------------------------------
function drawHairBack(ctx, r, spec, o) {
  const [hh, hs, hl] = spec.hair.color;
  const col = hsla(hh, hs, hl);
  const colD = hsla(hh, hs, Math.max(4, hl - 8));
  const t = o.t || 0;
  ctx.fillStyle = col;
  switch (spec.hair.style) {
    case 'long': {
      ctx.beginPath();
      ctx.moveTo(-0.95 * r, -0.1 * r);
      ctx.bezierCurveTo(-1.15 * r, 1.4 * r, -0.9 * r, 2.3 * r, -0.7 * r + Math.sin(t * 0.9) * 0.04 * r, 2.9 * r);
      ctx.lineTo(0.7 * r + Math.sin(t * 0.9 + 1) * 0.04 * r, 2.9 * r);
      ctx.bezierCurveTo(0.9 * r, 2.3 * r, 1.15 * r, 1.4 * r, 0.95 * r, -0.1 * r);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'bob': {
      ctx.beginPath();
      ctx.ellipse(0, 0.05 * r, 1.02 * r, 1.25 * r, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case 'ponytail': {
      ctx.beginPath();
      ctx.ellipse(0, -0.05 * r, 1.0 * r, 1.1 * r, 0, 0, TAU);
      ctx.fill();
      // tail
      ctx.save();
      ctx.translate(0.55 * r, -0.55 * r);
      ctx.rotate(Math.sin(t * 1.4) * 0.14 + 0.5);
      ctx.fillStyle = colD;
      ctx.beginPath();
      ctx.ellipse(0.35 * r, 0.85 * r, 0.28 * r, 1.0 * r, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'bun': {
      ctx.beginPath();
      ctx.ellipse(0, -0.05 * r, 1.0 * r, 1.08 * r, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -1.02 * r, 0.42 * r, 0, TAU);
      ctx.fill();
      break;
    }
    case 'afro': {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 0.72 * r, Math.sin(a) * 0.72 * r - 0.1 * r, 0.52 * r, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'curly': {
      for (const [x, y, rr] of [[-0.8, -0.2, 0.42], [0.8, -0.2, 0.42], [-0.95, 0.35, 0.36], [0.95, 0.35, 0.36], [0, -0.95, 0.5], [-0.5, -0.8, 0.44], [0.5, -0.8, 0.44]]) {
        ctx.beginPath();
        ctx.arc(x * r, y * r, rr * r, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'shag': {
      ctx.beginPath();
      ctx.ellipse(0, -0.05 * r, 1.08 * r, 1.2 * r, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-0.85 * r, 0.5 * r, 0.3 * r, 0.6 * r, 0.3, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.85 * r, 0.5 * r, 0.3 * r, 0.6 * r, -0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'cornrow': {
      ctx.beginPath();
      ctx.ellipse(0, -0.02 * r, 0.98 * r, 1.05 * r, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case 'mohawk': {
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.86 * r, 1.0 * r, 0, 0, TAU);
      ctx.fillStyle = hsla(hh, hs, Math.max(4, hl - 14));
      ctx.fill();
      break;
    }
    case 'buzz': {
      ctx.fillStyle = hsla(hh, hs, hl, 0.9);
      ctx.beginPath();
      ctx.ellipse(0, -0.12 * r, 0.82 * r, 0.92 * r, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case 'spiky': {
      for (let i = -3; i <= 3; i++) {
        const x = i * 0.26 * r;
        ctx.beginPath();
        ctx.moveTo(x - 0.16 * r, -0.45 * r);
        ctx.lineTo(x + (i % 2 ? 0.1 : -0.1) * r, (-1.35 - Math.abs(i) * -0.08) * r);
        ctx.lineTo(x + 0.16 * r, -0.45 * r);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(0, -0.1 * r, 0.86 * r, 0.95 * r, 0, 0, TAU);
      ctx.fill();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.ellipse(0, -0.05 * r, 1.0 * r, 1.1 * r, 0, 0, TAU);
      ctx.fill();
    }
  }
}

function drawHairFront(ctx, r, spec, o) {
  const [hh, hs, hl] = spec.hair.color;
  const style = spec.hair.style;
  const shine = hsla(hh, Math.min(100, hs + 10), Math.min(85, hl + 22));

  if (style === 'buzz' || style === 'cornrow') {
    ctx.strokeStyle = hsla(hh, hs, Math.max(3, hl - 10), 0.65);
    ctx.lineWidth = 0.035 * r;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 0.16 * r, -0.85 * r);
      ctx.quadraticCurveTo(i * 0.2 * r, -0.5 * r, i * 0.14 * r, -0.2 * r);
      ctx.stroke();
    }
    return;
  }
  if (style === 'mohawk') {
    const g = ctx.createLinearGradient(0, -1.6 * r, 0, -0.3 * r);
    g.addColorStop(0, shine);
    g.addColorStop(1, hsla(hh, hs, hl));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-0.2 * r, -0.55 * r);
    for (let i = 0; i <= 6; i++) {
      const x = -0.2 * r + (i / 6) * 0.4 * r;
      ctx.lineTo(x, (-1.5 - (i % 2) * 0.18) * r);
      ctx.lineTo(x + 0.066 * r, -0.55 * r);
    }
    ctx.closePath();
    ctx.fill();
    return;
  }

  // Bangs — curtain front covering only the forehead (eyes stay visible)
  const g = ctx.createLinearGradient(0, -1.1 * r, 0, -0.1 * r);
  g.addColorStop(0, shine);
  g.addColorStop(0.45, hsla(hh, hs, hl));
  g.addColorStop(1, hsla(hh, hs, Math.max(4, hl - 9)));
  ctx.fillStyle = g;
  const fringeY = style === 'spiky' || style === 'shag' ? -0.34 : -0.46; // bottom edge of fringe
  ctx.beginPath();
  ctx.moveTo(-0.88 * r, -0.28 * r);
  ctx.bezierCurveTo(-0.62 * r, fringeY + 0.14 * r, -0.35 * r, fringeY + 0.05 * r, -0.12 * r, fringeY + 0.16 * r);
  ctx.bezierCurveTo(0.1 * r, fringeY + 0.28 * r, 0.38 * r, fringeY + 0.1 * r, 0.6 * r, fringeY + 0.2 * r);
  ctx.bezierCurveTo(0.75 * r, fringeY + 0.14 * r, 0.85 * r, -0.16 * r, 0.88 * r, -0.28 * r);
  ctx.bezierCurveTo(0.85 * r, -1.0 * r, -0.85 * r, -1.0 * r, -0.88 * r, -0.28 * r);
  ctx.closePath();
  ctx.fill();

  // side locks framing the face (except short styles)
  if (!['buzz', 'afro', 'curly'].includes(style)) {
    ctx.fillStyle = hsla(hh, hs, Math.max(4, hl - 6));
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 0.74 * r, -0.5 * r);
      ctx.bezierCurveTo(side * 1.0 * r, 0.2 * r, side * 0.92 * r, 0.7 * r, side * 0.68 * r, style === 'long' ? 1.9 * r : 1.05 * r);
      ctx.bezierCurveTo(side * 0.84 * r, 0.6 * r, side * 0.74 * r, 0.1 * r, side * 0.6 * r, -0.34 * r);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Body / figure
// ---------------------------------------------------------------------------
/**
 * Full figure, canvas-down coordinates. Local origin = feet-BOTTOM-CENTER,
 * figure occupies y in [-F*0.97 .. 0]: head center ~ -0.87F, feet ~ -0.01F.
 * Caller translates to placement. Returns anchor info.
 */
function drawFigure(ctx, o) {
  const { F, spec, pal, action, t, pulse, energy, viseme, blink, expression } = o;
  const r = F * 0.105;
  const skin = spec.skin;
  const out = spec.outfit;
  const beat = t;

  const bob = Math.sin(beat * (2.2 + energy * 1.5)) * F * 0.012 * (0.4 + energy)
    + pulse * F * 0.02 * (action === 'dance' ? 1.6 : 1);
  const sway = Math.sin(beat * 0.9) * F * 0.02;

  const headCY = -0.87 * F + bob;
  const shoulderY = -0.70 * F + bob;
  const hipY = -0.44 * F;
  const footY = -0.02 * F;

  // legs (hips -> feet) with walk swing
  const legSwing = action === 'walk' ? Math.sin(beat * 5.2) * 0.09 * F : 0;
  ctx.strokeStyle = hsla(out.hue, out.sat, Math.max(6, out.light - 14));
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.075 * F;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 0.07 * F, hipY);
    ctx.quadraticCurveTo(side * 0.085 * F, (hipY + footY) / 2, side * 0.08 * F + legSwing * side, footY);
    ctx.stroke();
  }
  // shoes
  ctx.fillStyle = 'rgba(12,12,18,0.95)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 0.08 * F + legSwing * side, footY + 0.012 * F, 0.055 * F, 0.024 * F, 0, 0, TAU);
    ctx.fill();
  }

  // torso / outfit (shoulders -0.70F -> waist -0.44F)
  const outfitG = ctx.createLinearGradient(0, shoulderY, 0, hipY);
  outfitG.addColorStop(0, hsla(out.hue, out.sat, out.light + 8));
  outfitG.addColorStop(1, hsla(out.hue, out.sat, out.light - 6));
  ctx.fillStyle = outfitG;
  const shW = 0.175 * F;
  const waW = 0.125 * F;
  ctx.beginPath();
  ctx.moveTo(-shW, shoulderY);
  ctx.quadraticCurveTo(-0.19 * F, (shoulderY + hipY) / 2, -waW, hipY);
  ctx.lineTo(waW, hipY);
  ctx.quadraticCurveTo(0.19 * F, (shoulderY + hipY) / 2, shW, shoulderY);
  ctx.quadraticCurveTo(0, shoulderY - 0.07 * F, -shW, shoulderY);
  ctx.closePath();
  ctx.fill();

  // outfit style details
  if (out.style === 'hoodie') {
    ctx.strokeStyle = hsla(out.hue, out.sat, out.light + 16);
    ctx.lineWidth = 0.02 * F;
    ctx.beginPath();
    ctx.arc(0, shoulderY - 0.015 * F, 0.09 * F, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else if (out.style === 'dress' || out.style === 'glam') {
    ctx.fillStyle = hsla(out.accentHue, 70, 55, 0.9);
    ctx.beginPath();
    ctx.moveTo(-0.05 * F, shoulderY + 0.02 * F);
    ctx.lineTo(0.05 * F, shoulderY + 0.02 * F);
    ctx.lineTo(0.09 * F, hipY + 0.05 * F);
    ctx.lineTo(-0.09 * F, hipY + 0.05 * F);
    ctx.closePath();
    ctx.fill();
  } else if (out.style === 'leather') {
    ctx.strokeStyle = hsla(out.accentHue, 80, 55, 0.8);
    ctx.lineWidth = 0.016 * F;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY + 0.03 * F);
    ctx.lineTo(0, hipY);
    ctx.stroke();
  } else if (out.style === 'neon') {
    ctx.strokeStyle = hsla(out.accentHue, 100, 62, 0.95);
    ctx.lineWidth = 0.02 * F;
    ctx.beginPath();
    ctx.moveTo(-0.16 * F, shoulderY + 0.1 * F);
    ctx.quadraticCurveTo(0, hipY - 0.05 * F, 0.16 * F, shoulderY + 0.1 * F);
    ctx.stroke();
  }

  // arms — two-joint strokes
  const hasMic = spec.accessories.includes('mic');
  const armStroke = hsla(skin.base[0], skin.base[1], skin.base[2] - 4);
  ctx.strokeStyle = armStroke;
  ctx.lineWidth = 0.05 * F;
  const shX = 0.15 * F;
  const shY = shoulderY + 0.03 * F;

  const drawArm = (side, elbow, hand) => {
    ctx.beginPath();
    ctx.moveTo(side * shX, shY);
    ctx.lineTo(elbow[0], elbow[1]);
    ctx.lineTo(hand[0], hand[1]);
    ctx.stroke();
    ctx.fillStyle = hsla(skin.base[0], skin.base[1], skin.base[2] - 2);
    ctx.beginPath();
    ctx.arc(hand[0], hand[1], 0.03 * F, 0, TAU);
    ctx.fill();
  };

  // left arm: gestures with the beat
  const lWave = action === 'dance' ? Math.sin(beat * 3.1) * 0.04 * F : Math.sin(beat * 1.2) * 0.012 * F;
  const lHandY = action === 'dance' ? shY - 0.34 * F + lWave : hipY + 0.16 * F + lWave;
  const lHandX = -0.22 * F + (action === 'dance' ? 0.04 * F : lWave);
  drawArm(-1, [-0.21 * F, shY + 0.13 * F], [lHandX, lHandY]);

  // right arm: mic near mouth, or gesture
  if (hasMic || action === 'sing') {
    const handX = 0.115 * F + Math.sin(beat * 2) * 0.005 * F;
    const handY = headCY + 0.72 * r;
    drawArm(1, [0.21 * F, shY + 0.12 * F], [handX, handY]);
    // mic from hand toward the mouth
    const micTipX = handX - 0.052 * F;
    const micTipY = handY - 0.02 * F;
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 0.026 * F;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(micTipX, micTipY);
    ctx.stroke();
    const mg = ctx.createRadialGradient(micTipX, micTipY, 0, micTipX, micTipY, 0.034 * F);
    mg.addColorStop(0, '#9aa4b8');
    mg.addColorStop(1, '#3a4152');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(micTipX, micTipY, 0.031 * F, 0, TAU);
    ctx.fill();
  } else {
    const rWave = action === 'dance' ? Math.sin(beat * 3.1 + 1.4) * 0.04 * F : 0;
    const rHandY = action === 'dance' ? shY - 0.32 * F + rWave : hipY + 0.17 * F;
    drawArm(1, [0.21 * F, shY + 0.13 * F], [0.22 * F + rWave, rHandY]);
  }

  // head
  ctx.save();
  ctx.translate(sway * 0.3, headCY);
  ctx.rotate(Math.sin(beat * 0.8) * 0.045 + pulse * 0.1);
  drawHead(ctx, { r, spec, pal, viseme, blink, expression, t });
  ctx.restore();

  // headphones accessory
  if (spec.accessories.includes('headphones')) {
    ctx.strokeStyle = '#20242e';
    ctx.lineWidth = 0.03 * F;
    ctx.beginPath();
    ctx.arc(sway * 0.3, headCY, r * 1.12, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.fillStyle = hsla(out.accentHue, 80, 50);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sway * 0.3 + side * r * 1.02, headCY + 0.08 * r, 0.05 * F, 0.07 * F, 0, 0, TAU);
      ctx.fill();
    }
  }

  // chain accessory
  if (spec.accessories.includes('chain')) {
    ctx.strokeStyle = hsla(48, 85, 60, 0.95);
    ctx.lineWidth = 0.012 * F;
    ctx.beginPath();
    ctx.arc(0, shoulderY + 0.03 * F, 0.1 * F, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.fillStyle = hsla(48, 85, 62);
    ctx.beginPath();
    ctx.arc(0, shoulderY + 0.125 * F, 0.017 * F, 0, TAU);
    ctx.fill();
  }

  // cap accessory
  if (spec.accessories.includes('cap')) {
    ctx.fillStyle = hsla(out.hue, out.sat, out.light - 4);
    ctx.beginPath();
    ctx.ellipse(sway * 0.3, headCY - 0.38 * r, 0.86 * r, 0.62 * r, 0, Math.PI, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sway * 0.3 + 0.5 * r, headCY - 0.34 * r, 0.5 * r, 0.13 * r, 0.1, Math.PI, TAU);
    ctx.fill();
  }

  return { headCY, shoulderY, bob };
}

// ---------------------------------------------------------------------------
// Visemes from lyric word timing
// ---------------------------------------------------------------------------
const VOWEL_MOUTH = {
  a: { open: 0.95, wide: 0.55, round: 0.1 },
  e: { open: 0.55, wide: 0.85, round: 0.05 },
  i: { open: 0.32, wide: 0.95, round: 0.0 },
  o: { open: 0.8, wide: 0.1, round: 0.95 },
  u: { open: 0.45, wide: 0.05, round: 0.9 },
  y: { open: 0.4, wide: 0.7, round: 0.15 },
};

/**
 * Compute the mouth shape at time t from timed lyric lines.
 * @returns {open, wide, round, smile, singing}
 */
function visemeAt(parsed, t) {
  if (!parsed || !parsed.length) return { open: 0, wide: 0, round: 0, smile: 0.2, singing: false };
  let line = null;
  for (const l of parsed) {
    if (t >= l.time - 0.08 && t <= l.time + l.duration + 0.05) { line = l; break; }
  }
  if (!line) return { open: 0, wide: 0, round: 0, smile: 0.25, singing: false };

  const words = line.words || [];
  if (!words.length) return { open: 0, wide: 0, round: 0, smile: 0.2, singing: false };
  // word timings proportional to word length
  const weights = words.map((w) => Math.max(1.4, w.replace(/[^a-z]/gi, '').length + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  let active = null;
  let prog = 0;
  for (let i = 0; i < words.length; i++) {
    const start = line.time + (acc / total) * line.duration;
    acc += weights[i];
    const end = line.time + (acc / total) * line.duration;
    if (t >= start && t < end) {
      active = words[i];
      prog = (t - start) / Math.max(0.01, end - start);
      break;
    }
  }
  if (!active) return { open: 0.04, wide: 0, round: 0, smile: 0.15, singing: true };

  // find the vowel driving this instant: pick vowel by progress within word
  const letters = active.toLowerCase().replace(/[^a-z]/g, '').split('');
  const vowelIdx = [];
  letters.forEach((ch, i) => { if (VOWEL_MOUTH[ch]) vowelIdx.push(i); });
  let mouth = { open: 0.18, wide: 0.1, round: 0 };
  if (vowelIdx.length) {
    const pick = vowelIdx[Math.min(vowelIdx.length - 1, Math.floor(prog * vowelIdx.length))];
    mouth = { ...VOWEL_MOUTH[letters[pick]] };
  } else if (/^[bmpt]/.test(active.toLowerCase())) {
    mouth = { open: 0.02, wide: 0, round: 0.1 };
  }
  // envelope inside the word (attack/decay so the mouth "syllables")
  const env = 0.55 + 0.45 * Math.sin(Math.min(1, prog) * Math.PI);
  // 22Hz-ish flutter for syllable feel
  const flutter = 0.82 + 0.18 * Math.sin(t * 2 * Math.PI * 11);
  return {
    open: clamp(mouth.open * env * flutter, 0, 1),
    wide: mouth.wide,
    round: mouth.round,
    smile: 0.25,
    singing: true,
  };
}

// ---------------------------------------------------------------------------
// Stage backdrop for performance shots
// ---------------------------------------------------------------------------
function paintStage(ctx, s) {
  const { W, H, t, pal, pulse, energy } = s;
  const bg = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.1, W / 2, H * 0.5, H * 0.95);
  bg.addColorStop(0, hsla(pal.base, 60, 12 + pulse * 4));
  bg.addColorStop(1, hsla(260, 60, 4));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // spotlight beams
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const ox = W * (0.3 + 0.2 * i);
    const ang = Math.sin(t * (0.35 + i * 0.13) + i * 2.2) * 0.5 + (i - 1) * 0.35;
    const len = H * 1.4;
    const spread = 0.10 + 0.05 * Math.sin(t * 0.8 + i);
    const hue = (pal.base + i * 42) % 360;
    ctx.save();
    ctx.translate(ox, -H * 0.05);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, hsla(hue, 95, 62, 0.20 + pulse * 0.10));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-W * spread * 2.2, len);
    ctx.lineTo(W * spread * 2.2, len);
    ctx.lineTo(20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // floor glow
  const fl = ctx.createRadialGradient(W / 2, H * 0.96, 0, W / 2, H * 0.96, W * 0.55);
  fl.addColorStop(0, hsla(pal.base, 80, 40, 0.30 + pulse * 0.14));
  fl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fl;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  ctx.globalCompositeOperation = 'source-over';

  // speaker stacks
  ctx.fillStyle = 'rgba(8,9,14,0.92)';
  for (const side of [0, 1]) {
    const x = side ? W * 0.94 : W * 0.06;
    for (let i = 0; i < 3; i++) {
      const bw = W * 0.055;
      const bh = H * 0.16;
      const by = H - (i + 1) * bh + i * 4;
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, by, bw, bh - 4, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,150,180,0.14)';
      ctx.stroke();
      // woofer circle
      ctx.beginPath();
      ctx.arc(x, by + bh / 2 - 2, Math.min(bw, bh) * 0.28 * (1 + pulse * 0.08), 0, TAU);
      ctx.stroke();
    }
  }

  // haze particles
  for (let i = 0; i < 26; i++) {
    const px = (i * 173.3 + t * (12 + (i % 5) * 8)) % W;
    const py = H * 0.25 + Math.sin(t * 0.5 + i) * H * 0.18 + (i * 61 % (H * 0.5));
    ctx.fillStyle = `rgba(220,215,255,${0.03 + (i % 4) * 0.012})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + (i % 3), 0, TAU);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Public: paint the character INTO a scene
// framing: 'closeup' | 'medium' | 'wide'
// ---------------------------------------------------------------------------
function paintCharacterInScene(ctx, s) {
  const { W, H, t, spec, framing, action, pal, parsed, pulse, energy, expression, lipSync } = s;

  const vis = lipSync !== false ? visemeAt(parsed, t) : { open: 0, wide: 0, round: 0, smile: 0.2, singing: false };
  // blink schedule: ~every 3.1s, 0.12s long
  const blinkT = (t + spec.seed % 7) % 3.1;
  const blink = blinkT < 0.13 ? Math.sin((blinkT / 0.13) * Math.PI) : 0;

  // two-shot support: horizontal offset (fraction of W), depth scale, focus dim
  const offX = (s.offsetX || 0) * W;
  const scl = s.scale || 1;
  if (s.dim) {
    // focus scrim behind the out-of-focus partner
    ctx.fillStyle = `rgba(2,2,8,${s.dim})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (framing === 'closeup') {
    // dark scrim + rim backdrop for intimate shot
    const scrim = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.12, W / 2, H * 0.5, H * 0.85);
    scrim.addColorStop(0, 'rgba(6,5,14,0.35)');
    scrim.addColorStop(1, 'rgba(4,3,10,0.86)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H);

    const r = Math.min(W, H) * 0.36 * scl * (1 + pulse * 0.015);
    ctx.save();
    ctx.translate(W / 2 + offX + Math.sin(t * 0.7) * W * 0.008, H * 0.46 + pulse * H * 0.008);
    ctx.rotate(Math.sin(t * 0.8) * 0.03 + pulse * 0.03);
    // shoulders
    const out = spec.outfit;
    const og = ctx.createLinearGradient(0, r * 1.1, 0, r * 2.6);
    og.addColorStop(0, hsla(out.hue, out.sat, out.light + 6));
    og.addColorStop(1, hsla(out.hue, out.sat, Math.max(5, out.light - 10)));
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.moveTo(-W * 0.62, r * 3.4);
    ctx.quadraticCurveTo(-W * 0.30, r * 1.22, -0.34 * r, r * 1.02);
    ctx.quadraticCurveTo(0, r * 0.86, 0.34 * r, r * 1.02);
    ctx.quadraticCurveTo(W * 0.30, r * 1.22, W * 0.62, r * 3.4);
    ctx.closePath();
    ctx.fill();
    drawHead(ctx, { r, spec, pal, viseme: vis, blink, expression, t });
    ctx.restore();
    return;
  }

  if (framing === 'medium') {
    const F = H * 0.94 * scl * (1 + pulse * 0.01);
    ctx.save();
    // fade figure feet into bottom shadow
    const shadow = ctx.createLinearGradient(0, H * 0.75, 0, H);
    shadow.addColorStop(0, 'rgba(0,0,0,0)');
    shadow.addColorStop(1, 'rgba(3,2,8,0.55)');
    ctx.fillStyle = shadow;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);
    ctx.translate(W * 0.5 + offX, H * 0.985);
    drawFigure(ctx, { F, spec, pal, action: action || 'sing', t, pulse, energy, viseme: vis, blink, expression });
    ctx.restore();
    return;
  }

  // wide — figure standing in the environment
  const F = H * 0.52 * scl * (1 + pulse * 0.01);
  const gx = W * (0.5 + Math.sin(t * 0.12) * 0.06) + offX;
  const gy = H * 0.975;
  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(gx, gy, F * 0.16, F * 0.035, 0, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(gx, gy);
  drawFigure(ctx, { F, spec, pal, action: action === 'sing' ? 'sing' : (action || 'idle'), t, pulse, energy, viseme: vis, blink, expression });
  ctx.restore();
}

module.exports = { drawHead, drawFigure, paintCharacterInScene, visemeAt, paintStage };
