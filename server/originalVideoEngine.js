// server/originalVideoEngine.js — ORIGINAL generative music video engine.
//
// Paints every single frame from scratch with a GPU-accelerated Skia canvas
// (@napi-rs/canvas) — no stock footage, no downloads, no external APIs —
// then pipes raw frames into ffmpeg to encode the master MP4 with the
// (uploaded or originally-composed) soundtrack and burned-in kinetic lyrics.
//
// Pipeline:
//   lyrics brief ──► scene plan (sections → environments, camera, energy)
//                 ──► per-frame procedural painters (12 environments,
//                     particles, camera moves, beat reactivity, transitions)
//                 ──► kinetic lyric typography (5 caption styles)
//                 ──► ffmpeg rawvideo ➜ libx264 + AAC master

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

const { makeRng } = require('./lyricsAnalysis');
const { ffmpegPath } = require('./ffmpegPaths');
const { createCast, paintCharacter, createMouthDriver, blinkAt } = require('./characterEngine');
const { buildStoryline } = require('./storyEngine');

// ---------------------------------------------------------------------------
// Setup: fonts
// ---------------------------------------------------------------------------
const FONT_CANDIDATES = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/System/Library/Fonts/Helvetica.ttc',
  'C:\\Windows\\Fonts\\arialbd.ttf',
];
let FONT_FAMILY = 'sans-serif';
for (const p of FONT_CANDIDATES) {
  if (fs.existsSync(p)) {
    try {
      GlobalFonts.registerFromPath(p, 'AstraeaSans');
      FONT_FAMILY = 'AstraeaSans';
      break;
    } catch (_) {}
  }
}
const font = (px, weight = 'bold') => `${weight} ${Math.round(px)}px "${FONT_FAMILY}"`;

// ---------------------------------------------------------------------------
// Small math helpers
// ---------------------------------------------------------------------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const TAU = Math.PI * 2;

function hsla(h, s, l, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }

// ---------------------------------------------------------------------------
// Quality presets
// ---------------------------------------------------------------------------
const QUALITY = {
  draft: { fps: 24, scale: 480 },
  standard: { fps: 30, scale: 720 },
  master: { fps: 30, scale: 1080 },
};

function resolveDims(aspect, quality) {
  const q = QUALITY[quality] || QUALITY.standard;
  let W, H;
  if (aspect === '9:16') { W = Math.round(q.scale * 9 / 16); H = q.scale; }
  else if (aspect === '1:1') { W = q.scale; H = q.scale; }
  else if (aspect === '4:5') { W = Math.round(q.scale * 4 / 5); H = q.scale; }
  else if (aspect === '2.39:1') { W = Math.round(q.scale * 16 / 9); H = Math.round(W / 2.39); }
  else { W = Math.round(q.scale * 16 / 9); H = q.scale; }
  // even dimensions for encoders
  W += W % 2; H += H % 2;
  return { W, H, fps: q.fps };
}

// ---------------------------------------------------------------------------
// Environment painters
// Each painter receives (ctx, s) where:
//   s.W, s.H        canvas size
//   s.t             absolute time (s)
//   s.st, s.sd      scene-local time / scene duration
//   s.energy        0..1 audio energy at this frame
//   s.pulse         decaying beat impulse 0..1
//   s.strong        true on downbeat frames
//   s.pal           {primary, secondary, deep, glow, base}
//   s.pd            per-scene precomputed paint data
//   s.rnd           deterministic fn (per frame index ok)
// ---------------------------------------------------------------------------

function initStars(rng, count, W, H, yMax = 1) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: rng() * W, y: rng() * H * yMax, r: 0.4 + rng() * 1.6, tw: rng() * TAU, sp: 0.5 + rng() * 2 });
  }
  return stars;
}

const ENVIRONMENTS = {
  // ----------------------------------------------------------------- neonCity
  neonCity: {
    label: 'Neon City',
    init(rng, W, H) {
      const layers = [];
      const span = W + 160;
      for (let l = 0; l < 3; l++) {
        const bldgs = [];
        let x = -40;
        while (x < span + 40) {
          const bw = 34 + rng() * 96;
          const bh = (0.26 + rng() * 0.5) * H * (1 - l * 0.16);
          const windows = [];
          for (let wy = 8; wy < bh - 8; wy += 14) {
            for (let wx = 5; wx < bw - 7; wx += 11) {
              if (rng() < 0.28) windows.push({ x: wx, y: wy, ph: rng() * TAU });
            }
          }
          bldgs.push({ x, w: bw, h: bh, windows });
          x += bw + 4 + rng() * 14;
        }
        layers.push({ bldgs, speed: 4 + l * 9, y: H - l * 26, shade: 8 + l * 6 });
      }
      const rain = Array.from({ length: 130 }, () => ({ x: rng() * W, y: rng() * H, len: 10 + rng() * 22, v: 420 + rng() * 480 }));
      return { layers, rain, span };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, energy, pulse } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, hsla(pal.base, 65, 6));
      sky.addColorStop(0.55, hsla((pal.base + 330) % 360, 70, 14 + pulse * 6));
      sky.addColorStop(1, hsla((pal.base + 300) % 360, 75, 20));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // glow haze
      const haze = ctx.createRadialGradient(W * 0.5, H * 0.72, 10, W * 0.5, H * 0.72, H * 0.85);
      haze.addColorStop(0, 'rgba(255,45,149,' + (0.10 + pulse * 0.12 + energy * 0.05) + ')');
      haze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);

      // stars
      for (const st of pd.stars) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * st.sp + st.tw));
        ctx.fillStyle = `rgba(255,255,255,${0.5 * tw})`;
        ctx.fillRect(st.x, st.y * 0.5, st.r, st.r);
      }

      // skyline layers (parallax, seamless wrap)
      pd.layers.forEach((layer, li) => {
        const off = (t * layer.speed) % pd.span;
        ctx.save();
        for (const b of layer.bldgs) {
          for (const rep of [0, pd.span]) {
            const bx = b.x - off + rep;
            if (bx > W + 60 || bx + b.w < -60) continue;
            ctx.fillStyle = hsla(pal.base, 45, layer.shade);
            ctx.fillRect(bx, layer.y - b.h, b.w, b.h);
            for (const win of b.windows) {
              const flick = 0.5 + 0.5 * Math.sin(t * 2.2 + win.ph);
              ctx.fillStyle = li === 2
                ? `rgba(255,220,150,${0.4 + 0.5 * flick})`
                : `rgba(120,220,255,${0.22 + 0.32 * flick})`;
              ctx.fillRect(bx + win.x, layer.y - b.h + win.y, 5, 8);
            }
            if (li === 2 && b.h > H * 0.3) {
              ctx.shadowColor = pal.glow;
              ctx.shadowBlur = 16;
              ctx.fillStyle = pal.glow;
              ctx.fillRect(bx + b.w * 0.4, layer.y - b.h - 7, 3, 9);
              ctx.shadowBlur = 0;
            }
          }
        }
        ctx.restore();
      });

      // wet street reflection
      const street = ctx.createLinearGradient(0, H - 40, 0, H);
      street.addColorStop(0, hsla((pal.base + 300) % 360, 80, 26, 0.85));
      street.addColorStop(1, hsla((pal.base + 310) % 360, 85, 10, 0.95));
      ctx.fillStyle = street;
      ctx.fillRect(0, H - 40, W, 40);
      for (let i = 0; i < 10; i++) {
        const rx = ((i * 197 + t * 30) % W);
        ctx.fillStyle = `rgba(255,105,180,${0.08 + pulse * 0.1})`;
        ctx.fillRect(rx, H - 40 + (i % 4) * 9, 46, 2);
      }

      // rain
      if (s.rainOn !== false) {
        ctx.strokeStyle = 'rgba(190,210,255,0.30)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const r of pd.rain) {
          const y = (r.y + t * r.v) % (H + 30) - 15;
          ctx.moveTo(r.x, y);
          ctx.lineTo(r.x - 3, y + r.len);
        }
        ctx.stroke();
      }
    },
  },

  // ---------------------------------------------------------------- synthwave
  synthwave: {
    label: 'Retro Sunset Grid',
    init(rng, W, H) {
      return { stars: initStars(rng, 90, W, H * 0.5), mts: [
        Array.from({ length: 12 }, (_, i) => ({ x: i * (W / 11), h: (0.10 + rng() * 0.14) * H, w: W / 11 * 1.4 })),
        Array.from({ length: 9 }, (_, i) => ({ x: i * (W / 8) - 60, h: (0.16 + rng() * 0.18) * H, w: W / 8 * 1.5 })),
      ] };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      sky.addColorStop(0, hsla(280, 70, 12));
      sky.addColorStop(0.6, hsla(330, 85, 30 + pulse * 6));
      sky.addColorStop(1, hsla(25, 95, 52));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.62);
      ctx.fillStyle = hsla(25, 95, 30);
      ctx.fillRect(0, H * 0.62, W, H * 0.38);

      for (const st of pd.stars) {
        ctx.fillStyle = `rgba(255,255,255,${0.6 * (0.4 + 0.6 * Math.abs(Math.sin(t * st.sp + st.tw)))})`;
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }

      // striped sun
      const sunR = H * 0.16 * (1 + pulse * 0.05);
      const sunY = H * 0.62 - sunR * 0.4;
      ctx.save();
      ctx.beginPath();
      ctx.arc(W * 0.5, sunY, sunR, 0, TAU);
      ctx.clip();
      const sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sg.addColorStop(0, '#ffe66d');
      sg.addColorStop(1, '#ff2965');
      ctx.fillStyle = sg;
      ctx.fillRect(W * 0.5 - sunR, sunY - sunR, sunR * 2, sunR * 2);
      ctx.fillStyle = hsla(320, 80, 14, 0.9);
      for (let i = 0; i < 7; i++) {
        const yy = sunY - sunR * 0.1 + i * (sunR * 0.26) + ((t * 18) % (sunR * 0.26));
        ctx.fillRect(W * 0.5 - sunR, yy, sunR * 2, 2 + i * 1.4);
      }
      ctx.restore();
      ctx.shadowColor = '#ff2965';
      ctx.shadowBlur = 60 + pulse * 50;
      ctx.strokeStyle = 'rgba(255,80,140,0.5)';
      ctx.beginPath();
      ctx.arc(W * 0.5, sunY, sunR, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // wireframe mountains
      pd.mts.forEach((mts, li) => {
        ctx.beginPath();
        ctx.moveTo(-60, H * 0.62);
        for (const m of mts) {
          ctx.lineTo(m.x + m.w / 2, H * 0.62 - m.h);
          ctx.lineTo(m.x + m.w, H * 0.62);
        }
        ctx.lineTo(W + 60, H * 0.62);
        ctx.closePath();
        ctx.fillStyle = li === 0 ? hsla(285, 60, 12) : hsla(300, 55, 18);
        ctx.fill();
        ctx.strokeStyle = li === 0 ? 'rgba(255,45,149,0.55)' : 'rgba(0,255,209,0.5)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // scrolling perspective grid
      const hz = H * 0.62;
      ctx.strokeStyle = `rgba(0,255,209,${0.35 + pulse * 0.3})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = -14; i <= 14; i++) {
        ctx.moveTo(W / 2 + i * 26, hz);
        ctx.lineTo(W / 2 + i * W * 0.16, H);
      }
      for (let i = 0; i < 12; i++) {
        const p = ((i / 12) + ((t * 0.5) % (1 / 12))) % 1;
        const y = hz + Math.pow(p, 2.2) * (H - hz);
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    },
  },

  // ------------------------------------------------------------------- cosmos
  cosmos: {
    label: 'Deep Cosmos',
    init(rng, W, H) {
      return {
        stars1: initStars(rng, 150, W, H),
        stars2: initStars(rng, 90, W, H),
        nebulas: Array.from({ length: 5 }, () => ({ x: rng() * W, y: rng() * H, r: (0.2 + rng() * 0.35) * H, h: 200 + rng() * 140 })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      ctx.fillStyle = hsla(232, 75, 5);
      ctx.fillRect(0, 0, W, H);

      // nebula clouds (screen-ish additive feel)
      ctx.globalCompositeOperation = 'lighter';
      pd.nebulas.forEach((nb, i) => {
        const ox = Math.sin(t * 0.05 + i * 2) * 40;
        const g = ctx.createRadialGradient(nb.x + ox, nb.y, 0, nb.x + ox, nb.y, nb.r);
        const pulseA = 0.17 + energy * 0.11 + pulse * 0.10;
        g.addColorStop(0, hsla((nb.h + pal.base) % 360, 90, 52, pulseA));
        g.addColorStop(0.5, hsla((nb.h + pal.base + 40) % 360, 90, 42, pulseA * 0.55));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // star layers with parallax drift + twinkle
      pd.stars2.forEach((st) => {
        const x = (st.x + t * 6) % W;
        ctx.fillStyle = `rgba(180,190,255,${0.35 + 0.3 * Math.sin(t * st.sp + st.tw)})`;
        ctx.fillRect(x, st.y, st.r * 1.4, st.r * 1.4);
      });
      pd.stars1.forEach((st) => {
        const x = (st.x + t * 14) % W;
        const twk = 0.4 + 0.6 * Math.abs(Math.sin(t * st.sp + st.tw));
        ctx.fillStyle = `rgba(255,255,255,${0.75 * twk})`;
        ctx.fillRect(x, st.y, st.r, st.r);
        if (st.r > 1.5) {
          ctx.fillStyle = `rgba(160,180,255,${0.25 * twk})`;
          ctx.fillRect(x - st.r * 2, st.y + st.r / 3, st.r * 5, st.r * 0.4);
        }
      });

      // ringed planet
      const px = W * 0.78, py = H * 0.3, pr = H * 0.11 * (1 + pulse * 0.03);
      ctx.globalCompositeOperation = 'source-over';
      const pg = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
      pg.addColorStop(0, hsla((pal.base + 40) % 360, 70, 62));
      pg.addColorStop(1, hsla(pal.base, 75, 14));
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.42);
      ctx.strokeStyle = `rgba(190,220,255,${0.5 + pulse * 0.2})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 1.7, pr * 0.42, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();

      // shooting star on strong pulse
      if (pulse > 0.55) {
        const sp = 1 - pulse;
        const sx = W * (0.15 + sp * 0.5), sy = H * (0.12 + sp * 0.3);
        const g2 = ctx.createLinearGradient(sx, sy, sx + 160, sy + 60);
        g2.addColorStop(0, 'rgba(255,255,255,0.9)');
        g2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 160, sy + 60);
        ctx.stroke();
      }
    },
  },

  // -------------------------------------------------------------------- ocean
  ocean: {
    label: 'Moonlit Ocean',
    init(rng, W, H) {
      return { stars: initStars(rng, 70, W, H * 0.55), sparkles: Array.from({ length: 60 }, () => ({ x: rng(), ph: rng() * TAU, depth: rng() })) };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      sky.addColorStop(0, hsla(225, 70, 7));
      sky.addColorStop(1, hsla(215, 65, 16));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.5);
      for (const st of pd.stars) {
        ctx.fillStyle = `rgba(255,255,255,${0.55 * (0.4 + 0.6 * Math.abs(Math.sin(t * st.sp + st.tw)))})`;
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      // moon
      const mx = W * 0.72, my = H * 0.18, mr = H * 0.07;
      ctx.shadowColor = 'rgba(240,240,255,0.9)';
      ctx.shadowBlur = 50 + pulse * 30;
      ctx.fillStyle = '#f4f2ff';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;

      const sea = ctx.createLinearGradient(0, H * 0.5, 0, H);
      sea.addColorStop(0, hsla(200, 70, 12 + pulse * 4));
      sea.addColorStop(1, hsla(205, 80, 5));
      ctx.fillStyle = sea;
      ctx.fillRect(0, H * 0.5, W, H * 0.5);

      // moon light path
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const p = i / 26;
        const y = H * 0.5 + p * H * 0.5;
        const w = 10 + p * 130 * (0.6 + 0.4 * Math.sin(t * 2 + i));
        const x = mx + Math.sin(t * 1.4 + i * 1.7) * p * 60;
        ctx.fillStyle = `rgba(235,240,255,${(0.30 - p * 0.2) * (0.7 + pulse * 0.7)})`;
        ctx.fillRect(x - w / 2, y, w, 2.6);
      }
      ctx.globalCompositeOperation = 'source-over';

      // wave layers
      for (let l = 0; l < 4; l++) {
        const baseY = H * (0.56 + l * 0.11);
        const amp = 6 + l * 9 + energy * 14 + pulse * 8;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 12) {
          const y = baseY
            + Math.sin(x * 0.008 + t * (0.9 + l * 0.35) + l * 2) * amp
            + Math.sin(x * 0.02 - t * (1.4 + l * 0.2)) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = hsla(200 + l * 6, 65, 8 + l * 6, 0.92);
        ctx.fill();
        ctx.strokeStyle = `rgba(160,230,255,${0.3 + l * 0.08})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      // sparkles
      for (const sp of pd.sparkles) {
        const y = H * (0.55 + sp.depth * 0.42);
        const a = Math.max(0, Math.sin(t * (1 + sp.depth * 2) + sp.ph)) * (0.3 + sp.depth * 0.5);
        if (a > 0.03) {
          ctx.fillStyle = `rgba(200,240,255,${a})`;
          ctx.fillRect(sp.x * W + Math.sin(t + sp.ph) * 12, y, 2, 2);
        }
      }
    },
  },

  // -------------------------------------------------------------------- storm
  storm: {
    label: 'Electric Storm',
    init(rng, W, H) {
      return {
        clouds: Array.from({ length: 12 }, () => ({ x: rng() * W, y: rng() * H * (0.12 + rng() * 0.3), r: (0.18 + rng() * 0.26) * H, v: 8 + rng() * 26 })),
        rain: Array.from({ length: 210 }, () => ({ x: rng() * W, y: rng() * H, len: 14 + rng() * 26, v: 640 + rng() * 560 })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, strong } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, hsla(220, 45, 5));
      sky.addColorStop(0.7, hsla(215, 40, 9));
      sky.addColorStop(1, hsla(210, 35, 12));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // horizon glow
      const hglow = ctx.createLinearGradient(0, H * 0.55, 0, H);
      hglow.addColorStop(0, 'rgba(0,0,0,0)');
      hglow.addColorStop(1, `rgba(72,92,150,${0.32 + pulse * 0.1})`);
      ctx.fillStyle = hglow;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);

      // churning clouds
      pd.clouds.forEach((c, i) => {
        const x = ((c.x + t * c.v) % (W + c.r * 2)) - c.r;
        const g = ctx.createRadialGradient(x, c.y + Math.sin(t * 0.5 + i) * 12, 0, x, c.y, c.r);
        g.addColorStop(0, `rgba(118,130,168,${0.6 - i * 0.025})`);
        g.addColorStop(0.6, `rgba(66,76,110,${0.32 - i * 0.015})`);
        g.addColorStop(1, 'rgba(20,24,38,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // lightning on strong beats
      if ((strong && pulse > 0.6) || pulse > 0.93) {
        const bx = W * (0.2 + (Math.sin(t * 7.7) * 0.5 + 0.5) * 0.6);
        let x = bx, y = -10;
        ctx.strokeStyle = `rgba(220,235,255,${pulse})`;
        ctx.shadowColor = '#bcd7ff';
        ctx.shadowBlur = 26;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        while (y < H * (0.45 + Math.abs(Math.sin(t * 3.3)) * 0.4)) {
          x += (Math.sin(y * 0.07 + t * 13) * 34) + (Math.sin(y * 13.7) * 16);
          y += 24 + (Math.abs(Math.sin(y * 1.7)) * 30);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        // flash
        ctx.fillStyle = `rgba(190,210,255,${0.32 * pulse})`;
        ctx.fillRect(0, 0, W, H);
      }

      // rain
      ctx.strokeStyle = 'rgba(160,185,230,0.34)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const r of pd.rain) {
        const y = (r.y + t * r.v) % (H + 40) - 20;
        ctx.moveTo(r.x, y);
        ctx.lineTo(r.x - 5, y + r.len);
      }
      ctx.stroke();

      // ground haze
      const hz = ctx.createLinearGradient(0, H * 0.75, 0, H);
      hz.addColorStop(0, 'rgba(0,0,0,0)');
      hz.addColorStop(1, `rgba(30,40,70,${0.5 + pulse * 0.2})`);
      ctx.fillStyle = hz;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);
    },
  },

  // ------------------------------------------------------------------- embers
  embers: {
    label: 'Fire & Embers',
    init(rng, W, H) {
      return { embers: Array.from({ length: 90 }, () => ({ x: rng() * W, y: rng() * H, r: 1 + rng() * 2.6, v: 30 + rng() * 90, sw: rng() * TAU, hot: rng() })) };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      ctx.fillStyle = hsla(8, 70, 4);
      ctx.fillRect(0, 0, W, H);

      const core = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, H * (0.5 + pulse * 0.14));
      core.addColorStop(0, `rgba(255,140,40,${0.5 + pulse * 0.28})`);
      core.addColorStop(0.4, `rgba(220,60,20,${0.26 + energy * 0.1})`);
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);

      // flames — jagged tongues, hot core over red body
      const flameLayers = [
        { col: 'rgba(255,60,0,0.9)',   f: 0.030, amp: 0.34, lift: 0.10, sp: 2.1 },
        { col: 'rgba(255,130,10,0.9)', f: 0.052, amp: 0.42, lift: 0.045, sp: 2.9 },
        { col: 'rgba(255,220,90,0.95)', f: 0.085, amp: 0.5, lift: 0.0, sp: 3.7 },
      ];
      for (const fl of flameLayers) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        const baseY = H * (0.985 - fl.lift);
        const hMul = (0.62 + energy * 0.4 + pulse * 0.3);
        for (let x = 0; x <= W; x += 6) {
          const n = Math.sin(x * fl.f + t * fl.sp) * 0.55
            + Math.sin(x * fl.f * 2.7 - t * fl.sp * 1.4) * 0.3
            + Math.sin(x * fl.f * 5.3 + t * fl.sp * 2.2) * 0.15;
          const flameH = H * (0.14 + fl.lift) * hMul * (0.55 + 0.75 * (n + 1) / 2);
          ctx.lineTo(x, baseY - flameH);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = fl.col;
        ctx.fill();
      }

      // rising embers
      for (const e of pd.embers) {
        const y = H - ((e.y + t * e.v) % (H * 1.15));
        const x = e.x + Math.sin(t * 1.8 + e.sw) * 26;
        const a = clamp(y / H, 0, 1);
        ctx.shadowColor = 'rgba(255,120,30,0.9)';
        ctx.shadowBlur = 9;
        ctx.fillStyle = e.hot > 0.6 ? `rgba(255,220,120,${a})` : `rgba(255,110,40,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, e.r, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // smoke wisps
      for (let i = 0; i < 5; i++) {
        const x = W * (0.2 + 0.15 * i) + Math.sin(t * 0.7 + i * 2) * 40;
        const g = ctx.createRadialGradient(x, H * 0.4 - i * 40, 0, x, H * 0.4 - i * 40, 90 + i * 20);
        g.addColorStop(0, 'rgba(60,40,40,0.16)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 160, H * 0.4 - i * 40 - 160, 320, 320);
      }
    },
  },

  // ------------------------------------------------------------------- forest
  forest: {
    label: 'Enchanted Forest',
    init(rng, W, H) {
      const trees = [];
      for (let l = 0; l < 3; l++) {
        const layer = [];
        for (let i = 0; i < 10 - l * 2; i++) {
          layer.push({ x: rng() * W * 1.2 - W * 0.1, w: (30 + rng() * 60) * (1 + l * 0.5), h: H * (0.35 + rng() * 0.4) * (1 + l * 0.3) });
        }
        layer.sort((a, b) => a.x - b.x);
        trees.push(layer);
      }
      return {
        trees,
        flies: Array.from({ length: 46 }, () => ({ x: rng() * W, y: rng() * H, ph: rng() * TAU, r: 1 + rng() * 2, sp: 0.4 + rng() * 1.2 })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, hsla(140, 45, 8 + pulse * 3));
      bg.addColorStop(1, hsla(160, 50, 4));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // god rays
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = W * (0.12 + i * 0.16) + Math.sin(t * 0.3 + i) * 20;
        const g = ctx.createLinearGradient(x, 0, x + 90, H);
        g.addColorStop(0, `rgba(190,255,190,${0.05 + pulse * 0.05})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 70, 0);
        ctx.lineTo(x + 190, H);
        ctx.lineTo(x + 60, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // tree layers
      pd.trees.forEach((layer, li) => {
        ctx.fillStyle = hsla(140 + li * 8, 42, 6 + li * 5);
        for (const tr of layer) {
          const sway = Math.sin(t * (0.5 + li * 0.2) + tr.x) * (3 + li * 3);
          ctx.beginPath();
          ctx.moveTo(tr.x + sway, H);
          ctx.lineTo(tr.x + sway + tr.w * 0.5, H - tr.h);
          ctx.lineTo(tr.x + sway + tr.w, H);
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(tr.x + sway + tr.w * 0.5 - 3, H - tr.h, 6, tr.h);
        }
      });

      // mist
      for (let i = 0; i < 3; i++) {
        const y = H * (0.6 + i * 0.13);
        const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
        g.addColorStop(0, 'rgba(180,220,200,0)');
        g.addColorStop(0.5, `rgba(180,220,200,${0.05 + 0.02 * i})`);
        g.addColorStop(1, 'rgba(180,220,200,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 40 + Math.sin(t + i) * 8, W, 80);
      }

      // fireflies
      for (const f of pd.flies) {
        const x = f.x + Math.sin(t * f.sp + f.ph) * 30;
        const y = f.y + Math.cos(t * f.sp * 0.8 + f.ph * 2) * 22;
        const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + f.sp) + f.ph * 3));
        ctx.shadowColor = 'rgba(220,255,140,1)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(225,255,150,${a * (0.4 + energy * 0.4)})`;
        ctx.beginPath();
        ctx.arc(x, y, f.r, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    },
  },

  // ----------------------------------------------------------------- snowfall
  snowfall: {
    label: 'Winter Aurora',
    init(rng, W, H) {
      return {
        snow: Array.from({ length: 160 }, () => ({ x: rng() * W, y: rng() * H, r: 0.8 + rng() * 2.4, v: 26 + rng() * 70, sw: rng() * TAU })),
        ridges: [0.62, 0.72, 0.84].map((f, i) => ({ f, seedPts: Array.from({ length: 24 }, () => rng()) })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, hsla(230, 60, 5));
      sky.addColorStop(0.7, hsla(215, 55, 10));
      sky.addColorStop(1, hsla(200, 40, 16));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // aurora ribbons
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < 3; r++) {
        const hue = 140 + r * 40 + Math.sin(t * 0.3 + r) * 20;
        ctx.beginPath();
        const yBase = H * (0.14 + r * 0.1);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 16) {
          ctx.lineTo(x, yBase + Math.sin(x * 0.006 + t * (0.5 + r * 0.2)) * 36 + Math.sin(x * 0.017 - t) * 16);
        }
        for (let x = W; x >= 0; x -= 16) {
          ctx.lineTo(x, yBase + 110 + Math.sin(x * 0.008 + t * 0.6 + r) * 48);
        }
        ctx.closePath();
        const g = ctx.createLinearGradient(0, yBase - 40, 0, yBase + 170);
        g.addColorStop(0, hsla(hue, 90, 62, 0.28 + pulse * 0.14));
        g.addColorStop(0.6, hsla(hue + 30, 90, 55, 0.1 + pulse * 0.05));
        g.addColorStop(1, hsla(hue + 40, 90, 60, 0));
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // mountains
      pd.ridges.forEach((r, ri) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        r.seedPts.forEach((sp, i) => {
          const x = (i / (r.seedPts.length - 1)) * W;
          const y = H * r.f - sp * H * 0.16 - Math.sin(i * 1.7 + ri) * H * 0.02;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = hsla(215, 35, 9 + ri * 5);
        ctx.fill();
        ctx.strokeStyle = `rgba(220,240,255,${0.22 - ri * 0.05})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });

      // snow
      for (const f of pd.snow) {
        const y = (f.y + t * f.v) % (H + 10);
        const x = (f.x + Math.sin(t * 0.9 + f.sw) * 24 + W) % W;
        ctx.fillStyle = `rgba(240,248,255,${0.5 + 0.4 * Math.sin(f.sw + t)})`;
        ctx.beginPath();
        ctx.arc(x, y, f.r, 0, TAU);
        ctx.fill();
      }
    },
  },

  // ------------------------------------------------------------------- desert
  desert: {
    label: 'Golden Desert',
    init(rng, W, H) {
      return {
        dunes: [0.6, 0.74, 0.88].map((f, i) => ({ f, amp: 34 + i * 36, ph: rng() * TAU, sp: 0.2 + i * 0.14 })),
        birds: Array.from({ length: 5 }, () => ({ x: rng(), y: 0.18 + rng() * 0.25, v: 0.01 + rng() * 0.02, ph: rng() * TAU })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      sky.addColorStop(0, hsla(28, 85, 22));
      sky.addColorStop(0.6, hsla(36, 95, 45 + pulse * 6));
      sky.addColorStop(1, hsla(46, 100, 62));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // sun
      const sr = H * 0.13 * (1 + pulse * 0.04);
      const sy = H * 0.42;
      ctx.shadowColor = 'rgba(255,220,130,1)';
      ctx.shadowBlur = 80;
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(W * 0.5, sy, sr, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;

      // birds
      ctx.strokeStyle = 'rgba(90,50,20,0.55)';
      ctx.lineWidth = 1.6;
      for (const b of pd.birds) {
        const x = ((b.x + t * b.v) % 1.2) * W - W * 0.1;
        const y = H * b.y + Math.sin(t + b.ph) * 10;
        const fl = Math.sin(t * 7 + b.ph) * 4;
        ctx.beginPath();
        ctx.moveTo(x - 7, y + fl);
        ctx.quadraticCurveTo(x, y - 3, x, y);
        ctx.quadraticCurveTo(x, y - 3, x + 7, y + fl);
        ctx.stroke();
      }

      // dunes
      pd.dunes.forEach((d, i) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 14) {
          const y = H * d.f + Math.sin(x * 0.004 + d.ph + t * d.sp * 0.3) * d.amp + Math.sin(x * 0.011 - d.ph) * d.amp * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = hsla(36 - i * 4, 70 - i * 8, 38 - i * 10, 0.96);
        ctx.fill();
        // ridge highlight
        ctx.strokeStyle = `rgba(255,235,180,${0.35 - i * 0.08})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // heat shimmer bands
      ctx.globalAlpha = 0.1 + energy * 0.08;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, H * (0.6 + i * 0.07) + Math.sin(t * 3 + i * 2) * 5, W, 1.6);
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- cyberGrid
  cyberGrid: {
    label: 'Cyber Tunnel',
    init(rng, W, H) {
      return { rings: Array.from({ length: 26 }, (_, i) => i / 26), glitch: true };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy, strong } = s;
      ctx.fillStyle = hsla(200, 80, 3);
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2 + Math.sin(t * 0.4) * W * 0.06;
      const cy = H / 2 + Math.cos(t * 0.33) * H * 0.05;
      const speed = 0.35 + energy * 0.5 + pulse * 0.35;

      ctx.globalCompositeOperation = 'lighter';
      pd.rings.forEach((p0) => {
        const p = ((p0 + t * speed) % 1);
        const z = Math.pow(p, 2.6);
        const rw = 30 + z * W * 1.1;
        const rh = 20 + z * H * 1.1;
        const a = p * (0.5 + pulse * 0.4);
        ctx.strokeStyle = hsla((pal.base + 160) % 360, 100, 55, a);
        ctx.lineWidth = 1 + p * 2.4;
        ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
      });

      // corner HUD ticks
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(0,255,209,${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      const tick = 26 + pulse * 14;
      [[24, 24, 1, 1], [W - 24, 24, -1, 1], [24, H - 24, 1, -1], [W - 24, H - 24, -1, -1]].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x + dx * tick, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * tick);
        ctx.stroke();
      });

      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = ((t * 60) % 4); y < H; y += 4) ctx.fillRect(0, y, W, 1);

      // glitch slices on strong beats
      if (strong && pulse > 0.8 && pd.glitch) {
        for (let i = 0; i < 6; i++) {
          const sy = Math.random() * H;
          const sh = 8 + Math.random() * 30;
          const off = (Math.random() - 0.5) * 90 * pulse;
          ctx.drawImage(ctx.canvas, 0, sy, W, sh, off, sy, W, sh);
        }
      }
    },
  },

  // --------------------------------------------------------------- underwater
  underwater: {
    label: 'Underwater Dream',
    init(rng, W, H) {
      return {
        bubbles: Array.from({ length: 60 }, () => ({ x: rng() * W, y: rng() * H, r: 1 + rng() * 4, v: 20 + rng() * 60, sw: rng() * TAU })),
        motes: Array.from({ length: 80 }, () => ({ x: rng() * W, y: rng() * H, r: 0.5 + rng() * 1.4, ph: rng() * TAU })),
        kelp: Array.from({ length: 12 }, () => ({ x: rng() * W, h: H * (0.2 + rng() * 0.35), seg: 6 + Math.floor(rng() * 5), ph: rng() * TAU })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, hsla(185, 70, 16 + pulse * 4));
      bg.addColorStop(1, hsla(210, 85, 4));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // caustic rays
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const x = W * (i / 6) + Math.sin(t * 0.4 + i * 2) * 30;
        const g = ctx.createLinearGradient(x, 0, x + 120, H * 0.9);
        g.addColorStop(0, `rgba(190,255,240,${0.10 + pulse * 0.06})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, -10);
        ctx.lineTo(x + 60, -10);
        ctx.lineTo(x + 190, H);
        ctx.lineTo(x + 60, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // kelp
      for (const k of pd.kelp) {
        ctx.beginPath();
        ctx.moveTo(k.x, H);
        for (let sgi = 1; sgi <= k.seg; sgi++) {
          const p = sgi / k.seg;
          const x = k.x + Math.sin(t * 1.1 + k.ph + p * 3) * 16 * p;
          ctx.lineTo(x, H - k.h * p);
        }
        ctx.strokeStyle = `rgba(20,90,70,${0.75})`;
        ctx.lineWidth = 7;
        ctx.stroke();
      }

      // bubbles + motes
      for (const b of pd.bubbles) {
        const y = H - ((b.y + t * b.v) % (H * 1.1));
        const x = b.x + Math.sin(t * 1.4 + b.sw) * 14;
        ctx.strokeStyle = `rgba(200,240,255,${0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, TAU);
        ctx.stroke();
      }
      for (const m of pd.motes) {
        const x = m.x + Math.sin(t * 0.5 + m.ph) * 20;
        const y = m.y + Math.cos(t * 0.4 + m.ph * 2) * 16;
        ctx.fillStyle = `rgba(220,245,255,${0.2 + 0.2 * Math.sin(t + m.ph)})`;
        ctx.fillRect(x, y, m.r, m.r);
      }
    },
  },

  // ------------------------------------------------------------------- hearts
  hearts: {
    label: 'Golden Hour Love',
    init(rng, W, H) {
      return {
        bokeh: Array.from({ length: 18 }, () => ({ x: rng() * W, y: rng() * H * 0.8, r: 10 + rng() * 46, ph: rng() * TAU, warm: rng() })),
        hearts: Array.from({ length: 30 }, () => ({ x: rng() * W, y: rng() * H, r: 6 + rng() * 14, v: 22 + rng() * 55, sw: rng() * TAU, hue: rng() })),
        dust: Array.from({ length: 80 }, () => ({ x: rng() * W, y: rng() * H, r: 0.6 + rng() * 1.8, ph: rng() * TAU })),
        hills: [0.86, 0.93].map((f, i) => ({ f, pts: Array.from({ length: 20 }, () => rng()), dark: 4 + i * 3 })),
      };
    },
    paint(ctx, s) {
      const { W, H, t, pal, pd, pulse, energy } = s;
      // deep rose dusk sky
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, hsla(335, 75, 7));
      bg.addColorStop(0.5, hsla(345, 70, 13 + pulse * 3));
      bg.addColorStop(1, hsla(25, 60, 9));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // low golden sun with strong bloom
      const sx = W * 0.5, sy = H * 0.62, sr = H * 0.16;
      const sunGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.62);
      sunGlow.addColorStop(0, `rgba(255,190,110,${0.5 + pulse * 0.16})`);
      sunGlow.addColorStop(0.25, `rgba(255,140,90,${0.2 + energy * 0.08})`);
      sunGlow.addColorStop(1, 'rgba(255,90,120,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffe9b8';
      ctx.shadowColor = 'rgba(255,200,120,0.95)';
      ctx.shadowBlur = 60 + pulse * 40;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 0.42, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;

      // god-ray fan from the sun
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const ang = Math.PI * (0.08 + (i / 8) * 0.84) + Math.sin(t * 0.24 + i * 1.3) * 0.02;
        const len = H * 1.15;
        const spread = 0.05 + (i % 3) * 0.018;
        const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(ang - Math.PI / 2 - 0 * 0) * len * 0.2, sy - len);
        g.addColorStop(0, `rgba(255,205,130,${0.10 + pulse * 0.05})`);
        g.addColorStop(1, 'rgba(255,205,130,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(ang - spread) * len * 2, sy - Math.sin(ang) * len * 2);
        ctx.lineTo(sx + Math.cos(ang + spread) * len * 2, sy - Math.sin(ang) * len * 2);
        ctx.closePath();
        ctx.fill();
      }

      // bokeh orbs
      for (const b of pd.bokeh) {
        const x = b.x + Math.sin(t * 0.3 + b.ph) * 20;
        const y = b.y + Math.cos(t * 0.24 + b.ph * 2) * 16;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        const col = b.warm > 0.5 ? '255,200,130' : '255,110,160';
        g.addColorStop(0, `rgba(${col},${0.10 + energy * 0.06})`);
        g.addColorStop(0.75, `rgba(${col},0.05)`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // silhouette hills (foreground contrast)
      pd.hills.forEach((hl) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        hl.pts.forEach((p, i) => {
          const x = (i / (hl.pts.length - 1)) * W;
          ctx.lineTo(x, H * hl.f - p * H * 0.05 - Math.sin(i * 1.9 + hl.f * 9) * H * 0.015);
        });
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = hsla(330, 45, hl.dark);
        ctx.fill();
      });

      // glowing rising hearts
      for (const h of pd.hearts) {
        const y = H - ((h.y + t * h.v) % (H * 1.18));
        const x = h.x + Math.sin(t * 1.2 + h.sw) * 24;
        const a = clamp(y / H, 0, 1) * 0.95;
        const r = h.r * (1 + pulse * 0.14);
        ctx.shadowColor = `hsla(340,95%,65%,${a})`;
        ctx.shadowBlur = 14;
        ctx.fillStyle = hsla(338 + h.hue * 26, 90, 62 + pulse * 12, a);
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.6);
        ctx.bezierCurveTo(x - r, y - r * 0.2, x - r * 0.5, y - r, x, y - r * 0.35);
        ctx.bezierCurveTo(x + r * 0.5, y - r, x + r, y - r * 0.2, x, y + r * 0.6);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // sparkle dust
      for (const d of pd.dust) {
        const x = d.x + Math.sin(t * 0.6 + d.ph) * 14;
        const y = d.y + Math.cos(t * 0.5 + d.ph * 3) * 12;
        const a = 0.25 + 0.6 * Math.abs(Math.sin(t * 1.6 + d.ph));
        ctx.fillStyle = `rgba(255,235,200,${a * 0.8})`;
        ctx.fillRect(x, y, d.r, d.r);
      }
    },
  },
};

// ---------------------------------------------------------------------------
// Scene planning
// ---------------------------------------------------------------------------
function planScenes(analysis, audioInfo, opts) {
  const duration = audioInfo.duration || opts.duration || 60;
  const beats = audioInfo.beats || [];
  const sections = (audioInfo.sections && audioInfo.sections.length
    ? audioInfo.sections
    : [{ type: 'song', start: 0, end: duration, energy: 60, isDrop: false }]
  ).slice();

  const envs = analysis.rankedEnvs.filter((e) => ENVIRONMENTS[e]);
  if (envs.length === 0) envs.push('cosmos');
  const rng = makeRng(analysis.seed ^ 0x9e3779b9);

  // Cut scenes on section edges, then split long sections at ~4-6s at beats.
  const scenes = [];
  const minScene = 2.4, maxScene = 7.5;
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const secLen = sec.end - sec.start;
    const parts = Math.max(1, Math.round(secLen / ((minScene + maxScene) / 2)));
    const secBeats = beats.filter((b) => b.t >= sec.start && b.t < sec.end);
    for (let p = 0; p < parts; p++) {
      const start = sec.start + (secLen * p) / parts;
      const end = sec.start + (secLen * (p + 1)) / parts;
      // snap start to nearest beat
      let snapStart = start;
      if (secBeats.length) {
        let best = secBeats[0];
        for (const b of secBeats) if (Math.abs(b.t - start) < Math.abs(best.t - start)) best = b;
        snapStart = clamp(best.t, sec.start, sec.end - 0.8);
      }
      const isChorus = sec.type === 'chorus' || sec.isDrop;
      const envIdx = isChorus ? 0 : (1 + scenes.length) % Math.max(1, envs.length);
      const env = envs[(isChorus ? 0 : Math.min(envs.length - 1, envIdx))];
      scenes.push({
        env,
        label: ENVIRONMENTS[env] ? ENVIRONMENTS[env].label : env,
        start: snapStart,
        end,
        energy: (sec.energy || 50) / 100,
        isDrop: Boolean(sec.isDrop),
        sectionType: sec.type,
        motion: ['push_in', 'drift_left', 'push_out', 'drift_right', 'sway'][Math.floor(rng() * 5)],
        seed: (analysis.seed + scenes.length * 7919) >>> 0,
      });
    }
  }
  // fix overlaps from snapping
  for (let i = 0; i < scenes.length - 1; i++) scenes[i].end = Math.min(scenes[i].end, scenes[i + 1].start + 0.001);
  if (scenes.length) scenes[scenes.length - 1].end = duration;
  const out = scenes.filter((s) => s.end - s.start > 0.5);
  return out.length ? out : [{ env: envs[0], label: ENVIRONMENTS[envs[0]].label, start: 0, end: duration, energy: 0.6, isDrop: false, sectionType: 'song', motion: 'push_in', seed: analysis.seed }];
}

// ---------------------------------------------------------------------------
// Kinetic lyric typography
// ---------------------------------------------------------------------------
function distributeWordTimes(line) {
  const weights = line.words.map((w) => Math.max(1.6, w.length + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return line.words.map((w, i) => {
    const start = line.time + (acc / total) * line.duration;
    acc += weights[i];
    return { word: w, start, duration: (weights[i] / total) * line.duration, index: i };
  });
}

function wrapWords(ctx, words, maxW) {
  const lines = [];
  let cur = [];
  for (const w of words) {
    const test = [...cur, w].join(' ');
    if (ctx.measureText(test).width > maxW && cur.length) {
      lines.push(cur);
      cur = [w];
    } else cur.push(w);
  }
  if (cur.length) lines.push(cur);
  return lines;
}

function paintLyrics(ctx, s, parsed, style, opts) {
  if (!parsed || parsed.length === 0) return;
  const { W, H, t, pal, pulse, energy } = s;
  // Pick the matching line with the LATEST start time so an outgoing line's
  // fade window never shadows the incoming line during transitions.
  let li = -1;
  for (let i = 0; i < parsed.length; i++) {
    if (t >= parsed[i].time - 0.25 && t <= parsed[i].time + parsed[i].duration + 0.35) {
      if (li < 0 || parsed[i].time > parsed[li].time) li = i;
    }
  }
  if (li < 0) return;
  const line = parsed[li];
  const lineAge = t - line.time;
  const appear = clamp(lineAge / 0.28, 0, 1);
  const vanish = clamp((t - (line.time + line.duration)) / 0.3, 0, 1);
  const alpha = easeOutCubic(appear) * (1 - easeOutCubic(vanish));
  if (alpha <= 0.02) return;

  const maxW = W * 0.82;
  const glow = pal.glow;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const outline = Math.max(2.5, W * 0.004);

  // dark backing stroke so lyrics stay readable on any scene
  const put = (text, x, y) => {
    ctx.strokeStyle = 'rgba(8,6,18,0.62)';
    ctx.lineWidth = outline;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  };

  const shadowPass = (text, x, y, px, color) => {
    ctx.strokeStyle = 'rgba(8,6,18,0.62)';
    ctx.lineWidth = outline;
    ctx.strokeText(text, x, y);
    ctx.shadowColor = color || glow;
    ctx.shadowBlur = px;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  };

  if (style === 'impact') {
    // huge center word-by-word bounce
    const wt = distributeWordTimes(line);
    const active = wt.filter((w) => t >= w.start - 0.12 && t <= w.start + w.duration + 0.5).slice(-3);
    const px = Math.min(W * 0.11, H * 0.17);
    ctx.font = font(px * 2.1);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    active.forEach((w) => {
      const age = t - w.start;
      const pop = 1 + 0.28 * Math.exp(-Math.max(0, age) * 9) * (age > -0.12 ? 1 : 0);
      const yJ = Math.sin(w.index * 1.7) * H * 0.05;
      ctx.save();
      ctx.translate(W / 2, H * 0.5 + yJ);
      ctx.scale(pop, pop);
      ctx.globalAlpha = alpha * 0.96;
      shadowPass(w.word.toUpperCase(), 0, 0, 30 + pulse * 26);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    return;
  }

  const px = clamp(W * 0.045, 22, 52);
  ctx.font = font(px);
  const rows = wrapWords(ctx, line.words, maxW);
  const rowH = px * 1.32;
  const blockH = rows.length * rowH;
  const baseY = style === 'minimal' ? H * 0.86 - blockH / 2 : style === 'top' ? H * 0.16 : H * 0.82 - blockH / 2;

  const wt = distributeWordTimes(line);
  let wordCursor = 0;
  rows.forEach((rowWords, ri) => {
    const rowText = rowWords.join(' ');
    const rowW = ctx.measureText(rowText).width;
    const y = baseY + ri * rowH + rowH / 2;
    let x = W / 2 - rowW / 2;

    for (const w of rowWords) {
      const info = wt[wordCursor++];
      const wpx = ctx.measureText(w + ' ').width;
      const cx = x + ctx.measureText(w).width / 2;
      const sung = clamp((t - info.start) / Math.max(0.12, info.duration), 0, 1);
      const wAge = t - info.start;

      if (style === 'karaoke') {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(8,6,18,0.5)';
        ctx.lineWidth = outline;
        ctx.fillStyle = 'rgba(255,255,255,0.34)';
        ctx.fillText(w, cx, y);
        ctx.strokeText(w, cx, y);
        if (sung > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(cx - ctx.measureText(w).width / 2 - 2, y - rowH, ctx.measureText(w).width * sung + 4, rowH * 2);
          ctx.clip();
          ctx.fillStyle = '#fff';
          shadowPass(w, cx, y, 18 + sung * 14);
          ctx.restore();
        }
      } else if (style === 'kinetic') {
        const inA = clamp(wAge / 0.16, 0, 1);
        const scale = 1 + 0.22 * (1 - easeOutCubic(inA));
        const yOff = (1 - easeOutCubic(inA)) * px * 0.5;
        ctx.globalAlpha = alpha * inA;
        ctx.save();
        ctx.translate(cx, y + yOff);
        ctx.scale(scale, scale);
        const useAccent = info.index % 3 === 0 && line.section === 'chorus';
        ctx.fillStyle = useAccent ? glow : '#ffffff';
        shadowPass(w, 0, 0, useAccent ? 22 + pulse * 16 : 10);
        ctx.restore();
      } else if (style === 'typewriter') {
        const shown = Math.ceil(clamp(lineAge / Math.max(0.4, line.duration * 0.7), 0, 1) * w.length);
        if (shown > 0) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#fff';
          put(w.slice(0, shown) + (shown < w.length ? '_' : ''), cx, y);
        }
      } else if (style === 'neon') {
        ctx.globalAlpha = alpha * (0.75 + 0.25 * Math.sin(t * 2.4 + info.index));
        ctx.fillStyle = '#fff';
        shadowPass(w, cx, y, 24 + pulse * 30 + energy * 10);
        ctx.fillStyle = glow;
        put(w, cx, y);
      } else {
        // minimal
        ctx.globalAlpha = alpha * 0.92;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        put(w, cx, y);
      }
      ctx.globalAlpha = 1;
      x += wpx;
    }
  });
  ctx.globalAlpha = 1;
}

function paintTitleCard(ctx, s, opts) {
  const { W, H, t } = s;
  const artist = (opts.artistName || '').trim();
  const title = (opts.title || opts.audioTitle || '').trim();
  if (!artist && !title) return;
  const inT = 0.4, outT = 3.4, dur = 3.0;
  if (t < inT || t > outT + dur * 0.2) return;
  const a = easeOutCubic(clamp((t - inT) / 0.9, 0, 1)) * (1 - easeOutCubic(clamp((t - outT) / 0.8, 0, 1)));
  if (a <= 0.01) return;
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (artist) {
    ctx.font = font(W * 0.028, 'normal');
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.shadowColor = s.pal.glow;
    ctx.shadowBlur = 18;
    ctx.fillText(artist.toUpperCase().split('').join('\u200a'), W / 2, H * 0.44);
    ctx.shadowBlur = 0;
  }
  if (title) {
    ctx.font = font(W * 0.058);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = s.pal.glow;
    ctx.shadowBlur = 30 + s.pulse * 20;
    ctx.fillText(title, W / 2, H * 0.53);
    ctx.shadowBlur = 0;
  }
  const lineW = W * 0.14 * easeOutCubic(clamp((t - inT) / 1.4, 0, 1));
  ctx.strokeStyle = s.pal.glow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - lineW, H * 0.585);
  ctx.lineTo(W / 2 + lineW, H * 0.585);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Post-processing overlays
// ---------------------------------------------------------------------------
function paintPostFX(ctx, s, opts) {
  const { W, H, energy, pulse, pal } = s;

  // bloom-ish glow wash on beats
  if (pulse > 0.05) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, `rgba(255,255,255,${0.05 * pulse})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.44, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  // film grain
  if (opts.filmGrain !== false) {
    ctx.fillStyle = 'rgba(255,255,255,0.028)';
    const grains = Math.floor((W * H) / 9000);
    for (let i = 0; i < grains; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
    }
  }

  // letterbox for 2.39 look
  if (opts.letterbox) {
    const bar = H * 0.075;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);
  }
}

// ---------------------------------------------------------------------------
// Frame renderer
// ---------------------------------------------------------------------------
function createFramePainter(analysis, audioInfo, scenes, opts, dims) {
  const { W, H, fps } = dims;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ---- cast & storyline (characters + lip-sync) ----
  const storyMode = opts.storyMode || 'story';
  const sectionsForStory = (audioInfo.sections && audioInfo.sections.length
    ? audioInfo.sections
    : [{ type: 'song', start: 0, end: audioInfo.duration || opts.duration || 60, energy: 60, isDrop: false }]);
  const story = storyMode === 'visuals-only'
    ? null
    : buildStoryline(analysis, sectionsForStory, { castSize: opts.castSize, mood: analysis.summary.mood });
  if (story && storyMode === 'performance') {
    // artist-performance mode: every section after the intro is a singing shot
    let perfN = 0;
    story.beats = story.beats.map((b) => {
      if (b.type === 'establish') return b;
      perfN += 1;
      return { ...b, type: 'perf', action: 'sing', pose: perfN % 3 === 2 ? 'dance' : 'sing', framing: perfN % 3 === 2 ? 'medium' : 'closeup', charIdxs: [0], label: `${b.section} — perf` };
    });
  }
  const cast = story ? story.cast : [];

  // word timeline for the lip-sync driver
  const wordTimeline = [];
  for (const line of analysis.lines) {
    if (line.time == null) continue;
    const words = (line.words && line.words.length ? line.words : String(line.text || '').split(/\s+/).filter(Boolean));
    let acc = 0;
    const total = words.reduce((s, w) => s + Math.max(1.6, w.length + 1), 0) || 1;
    words.forEach((w, wi) => {
      const dur = (Math.max(1.6, w.length + 1) / total) * line.duration;
      wordTimeline.push({ start: line.time + (acc / total) * line.duration, end: line.time + (acc / total) * line.duration + dur, word: w, lineIdx: line.time });
      acc += Math.max(1.6, w.length + 1);
    });
  }
  wordTimeline.sort((a, b) => a.start - b.start);
  const mouthDriver = createMouthDriver(wordTimeline, audioInfo.vocal || null, analysis.seed);
  const parsed = analysis.lines.map((l, i) => {
    const total = analysis.duration;
    const per = total / Math.max(1, analysis.lines.length);
    if (l.time == null) return { time: i * per, duration: per, text: l.text, words: l.text.split(/\s+/).filter(Boolean), section: l.section };
    return { time: l.time, duration: l.duration, text: l.text, words: l.words, section: l.section };
  });

  const beats = (audioInfo.beats || []).map((b) => b.t);
  const energyEnv = audioInfo.energy; // {fps, data}
  const scenePd = new Map();

  function getPaintData(scene) {
    if (!scenePd.has(scene.seed + scene.env)) {
      const rng = makeRng(scene.seed);
      const pd = ENVIRONMENTS[scene.env].init(rng, W, H);
      pd.stars = initStars(rng, 110, W, H);
      scenePd.set(scene.seed + scene.env, pd);
    }
    return scenePd.get(scene.seed + scene.env);
  }

  function energyAt(t) {
    if (energyEnv && energyEnv.data && energyEnv.data.length) {
      const idx = clamp(Math.round(t * energyEnv.fps), 0, energyEnv.data.length - 1);
      return energyEnv.data[idx];
    }
    // fall back to scene energy with gentle motion
    const sc = scenes.find((s) => t >= s.start && t < s.end) || scenes[0];
    return 0.45 + 0.3 * sc.energy * (0.7 + 0.3 * Math.sin(t * 1.7));
  }

  function beatPulseAt(t) {
    let pulse = 0;
    let strong = false;
    // find last beat <= t (beats sorted; walk from end cheaply with binary search)
    let lo = 0, hi = beats.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (beats[mid] <= t) { found = mid; lo = mid + 1; } else hi = mid - 1;
    }
    if (found >= 0) {
      const dt = t - beats[found];
      if (dt < 1.2) {
        pulse = Math.exp(-dt * 5.2);
        const beatIdx = Math.round(beats[found] * (audioInfo.bpm ? audioInfo.bpm / 60 : 2));
        strong = audioInfo.beats && audioInfo.beats[found] && audioInfo.beats[found].strong;
      }
    }
    return { pulse, strong };
  }

  function paintFrame(t) {
    const scene = scenes.find((s) => t >= s.start && t < s.end) || scenes[scenes.length - 1];
    const st = t - scene.start;
    const sd = scene.end - scene.start;
    const { pulse } = beatPulseAt(t);
    const strong = beatPulseAt(t).strong;
    const energy = energyAt(t);

    const s0 = {
      W, H, t, st, sd, energy,
      pulse: Math.min(1, pulse),
      strong,
      pal: analysis.palette,
      pd: getPaintData(scene),
      rainOn: scene.sectionType !== 'chorus',
    };

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // --- camera transform (motion + shake + scene-entry punch) ---
    const prog = clamp(st / sd, 0, 1);
    let zoom = 1, panX = 0, panY = 0, rot = 0;
    if (scene.motion === 'push_in') zoom = 1 + 0.10 * easeInOut(prog);
    if (scene.motion === 'push_out') zoom = 1.10 - 0.10 * easeInOut(prog);
    if (scene.motion === 'drift_left') { zoom = 1.07; panX = lerp(W * 0.035, -W * 0.035, easeInOut(prog)); }
    if (scene.motion === 'drift_right') { zoom = 1.07; panX = lerp(-W * 0.035, W * 0.035, easeInOut(prog)); }
    if (scene.motion === 'sway') { zoom = 1.08; rot = Math.sin(prog * Math.PI * 2) * 0.012; panY = Math.sin(prog * Math.PI) * H * 0.02; }
    zoom *= 1 + 0.13 * Math.exp(-st * 7);              // scene-entry punch
    zoom *= 1 + 0.05 * pulse * (scene.isDrop ? 1.6 : 1); // beat breathing
    const shakeAmp = pulse * (scene.isDrop ? 7 : 3.4) * energy;
    const shX = (Math.sin(t * 61.7) + Math.sin(t * 47.3)) * 0.5 * shakeAmp;
    const shY = (Math.cos(t * 53.1) + Math.sin(t * 41.9)) * 0.5 * shakeAmp;

    ctx.translate(W / 2 + shX + panX, H / 2 + shY + panY);
    ctx.rotate(rot);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);

    // --- transition: crossfade from previous scene during first 0.5s ---
    const xfade = 0.55;
    let prevScene = null;
    const sIdx = scenes.indexOf(scene);
    if (sIdx > 0 && st < xfade) prevScene = scenes[sIdx - 1];
    if (prevScene) {
      ctx.save();
      const pst = clamp(prevScene.end - 0.01 - prevScene.start, 0.01, 99);
      const ps0 = { ...s0, st: pst, pd: getPaintData(prevScene), t };
      ENVIRONMENTS[prevScene.env].paint(ctx, ps0);
      ctx.restore();
      ctx.globalAlpha = easeOutCubic(st / xfade);
      ctx.save();
      // slight scale settle for incoming scene during crossfade
      ctx.translate(W / 2, H / 2);
      ctx.scale(1.04 - 0.04 * (st / xfade), 1.04 - 0.04 * (st / xfade));
      ctx.translate(-W / 2, -H / 2);
    }
    ENVIRONMENTS[scene.env].paint(ctx, s0);
    if (prevScene) {
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // drop white flash
    if (scene.isDrop && st < 0.5) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 * Math.exp(-st * 9)})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore(); // camera

    // --- CHARACTERS + LIP-SYNC (screen-space composite, freebeat style) ---
    if (story && story.cast.length) {
      const beat = story.beats.find((b) => t >= b.start && t < b.end)
        || story.beats[story.beats.length - 1];
      const singing = beat.type === 'perf' || beat.type === 'duet' || (beat.framing === 'closeup' || beat.framing === 'two-shot');
      const mouth = mouthDriver(t);

      // closeups get a darkened backdrop so the artist pops
      if (beat.framing === 'closeup' || beat.framing === 'two-shot') {
        const dk = ctx.createLinearGradient(0, 0, 0, H);
        dk.addColorStop(0, 'rgba(4,3,12,0.45)');
        dk.addColorStop(1, 'rgba(4,3,12,0.66)');
        ctx.fillStyle = dk;
        ctx.fillRect(0, 0, W, H);
      }

      const rim = analysis.palette.glow;
      const mood = analysis.summary.mood === 'uplifting' ? 'happy' : analysis.summary.mood === 'melancholy' ? 'sad' : 'fierce';
      const amp = singing ? 1 : 0.16;

      const drawCastMember = (ci, x, y, u, dimv) => {
        const ch = story.cast[ci];
        if (!ch) return;
        paintCharacter(ctx, {
          x, y, u, t,
          char: ch,
          pulse: Math.min(1, pulse),
          energy,
          mood,
          pose: singing ? (beat.pose === 'dance' ? 'dance' : beat.pose === 'point' ? 'point' : beat.pose === 'chest' ? 'chest' : 'sing') : (beat.pose || 'idle'),
          mouth: { open: mouth.open * amp, shape: mouth.open * amp > 0.07 ? mouth.shape : 'rest' },
          blink: blinkAt(t, ch.phase),
          faceYaw: Math.sin(t * 0.4 + ch.phase) * 0.35,
          rim,
          dim: dimv,
          ground: beat.framing === 'wide' || beat.framing === 'medium',
        });
      };

      // puppet spans -4u (hair) .. +100u (feet) from its anchor point
      if (beat.framing === 'closeup') {
        // head + shoulders fills the frame — lip-sync readable
        const u = H * 0.023;
        drawCastMember(beat.charIdxs[0] || 0, W * 0.5 + Math.sin(t * 0.3) * 4, H * 0.40 - 8 * u, u, 1);
      } else if (beat.framing === 'medium') {
        // waist-up performance shot
        const u = H * 0.0139;
        drawCastMember(beat.charIdxs[0] || 0, W * 0.5, H * 0.42 - 8 * u, u, 1);
      } else if (beat.framing === 'two-shot') {
        const u = H * 0.0080;
        const gy = H * 0.95 - 100 * u;
        drawCastMember(0, W * 0.34, gy, u, 1);
        if (story.cast.length > 1) drawCastMember(1, W * 0.66, gy + 2 * u, u * 0.96, 0.94);
      } else { // wide / establish — full body in the world
        const u = H * 0.0053;
        const gy = H * 0.92 - 100 * u;
        if (beat.charIdxs.length > 1 && story.cast.length > 1) {
          drawCastMember(0, W * 0.36, gy, u, 1);
          drawCastMember(1, W * 0.64, gy + 2 * u, u * 0.96, 0.94);
        } else {
          drawCastMember(beat.charIdxs[0] || 0, W * (0.5 + Math.sin(t * 0.12) * 0.06), gy, u, 1);
        }
      }
    }

    // --- overlays in screen space ---
    const sScreen = { ...s0 };
    paintPostFX(ctx, sScreen, opts);

    // --- lyrics + title card ---
    if (opts.captions !== 'off') {
      paintLyrics(ctx, sScreen, parsed, opts.captionStyle || 'karaoke', opts);
    }
    paintTitleCard(ctx, sScreen, opts);

    // outro fade
    const outroFade = 1.2;
    if (t > s0.H && false) {} // noop guard
    if (audioInfo.duration && t > audioInfo.duration - outroFade) {
      const a = clamp((t - (audioInfo.duration - outroFade)) / outroFade, 0, 1);
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (t < 0.45) {
      ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }

    return ctx.getImageData(0, 0, W, H).data;
  }

  return { paintFrame, canvas, parsed, W, H, fps };
}

// ---------------------------------------------------------------------------
// Main render job
// ---------------------------------------------------------------------------
async function renderOriginalVideo(analysis, audioInfo, opts, job, RENDERS_DIR) {
  const dims = resolveDims(opts.aspectRatio || '16:9', opts.quality || 'standard');
  const { W, H, fps } = dims;
  const duration = Math.max(4, Math.min(600, audioInfo.duration || opts.duration || 60));
  const totalFrames = Math.round(duration * fps);

  const scenes = planScenes(analysis, audioInfo, opts);
  job.scenePlan = scenes.map((s) => ({ env: s.label, start: +s.start.toFixed(2), end: +s.end.toFixed(2), isDrop: s.isDrop }));
  job.parsedLyricLines = analysis.lines.length;

  const outputFileName = job.outputFileName;
  const outputPath = path.join(RENDERS_DIR, outputFileName);

  if (!ffmpegPath) throw new Error('ffmpeg binary not available');

  const args = [
    '-y', '-v', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`, '-r', String(fps),
    '-i', 'pipe:0',
  ];
  if (audioInfo.path) {
    args.push('-i', audioInfo.path);
  }
  args.push(
    '-c:v', 'libx264',
    '-preset', opts.encoderPreset || 'medium',
    '-crf', String(opts.crf || 19),
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-movflags', '+faststart',
  );
  if (audioInfo.path) {
    args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  } else {
    args.push('-an');
  }
  args.push(outputPath);

  const ff = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffmpegErr = '';
  ff.stderr.on('data', (d) => { ffmpegErr += d.toString(); if (ffmpegErr.length > 20000) ffmpegErr = ffmpegErr.slice(-8000); });

  const writeFrame = (buf) => new Promise((resolve, reject) => {
    ff.stdin.write(buf, (err) => (err ? reject(err) : resolve()));
  });

  const painter = createFramePainter(analysis, audioInfo, scenes, opts, { W, H, fps });

  const frame = Buffer.allocUnsafe(W * H * 4);
  let lastYield = Date.now();
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    const data = painter.paintFrame(t);
    frame.set(data);
    await writeFrame(frame);
    if (job.cancelRequested) {
      ff.kill('SIGKILL');
      throw new Error('Render cancelled');
    }
    if (i % 5 === 0) {
      job.progress = 5 + Math.round((i / totalFrames) * 88);
      job.stage = `Painting frame ${i + 1}/${totalFrames} — ${scenes.find((s) => t >= s.start && t < s.end)?.label || 'Scene'}`;
      job.currentScene = scenes.find((s) => t >= s.start && t < s.end)?.label;
    }
    if (Date.now() - lastYield > 250) {
      lastYield = Date.now();
      await new Promise((r) => setImmediate(r));
    }
  }

  await new Promise((resolve, reject) => {
    ff.stdin.end();
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${ffmpegErr.slice(-1200)}`))));
    ff.on('error', reject);
  });

  return { outputPath, scenes, totalFrames, W, H, fps };
}

/** Render a single poster frame as PNG (for thumbnails/previews). */
function renderPosterFrame(analysis, audioInfo, opts, tSec, dims) {
  const scenes = planScenes(analysis, audioInfo, opts);
  const painter = createFramePainter(analysis, audioInfo, scenes, opts, dims);
  const data = painter.paintFrame(tSec);
  const c = painter.canvas;
  const ctx2 = c.getContext('2d');
  const img = new Uint8ClampedArray(data);
  // write back and export png
  const imageData = ctx2.createImageData(dims.W, dims.H);
  imageData.data.set(img);
  ctx2.putImageData(imageData, 0, 0);
  return c.toBuffer('image/png');
}

module.exports = {
  renderOriginalVideo,
  renderPosterFrame,
  planScenes,
  createFramePainter,
  resolveDims,
  ENVIRONMENTS,
};
