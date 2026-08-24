// AISpecialEffectsEngine.js - High-End Cinematic AI Special Effects Presets & Animations

export const SPECIAL_EFFECTS_PRESETS = [
  {
    id: 'bloom-magic',
    name: 'Bloom Magic & Golden Shimmer',
    category: 'Ethereal / Fantasy',
    description: 'Enchanting golden light rays, soft dreamy Gaussian bloom, and floating stardust particles.',
    color: '#fbbf24',
  },
  {
    id: 'kissing-romance',
    name: 'Romantic Lens & Heart Flare',
    category: 'Romance / Drama',
    description: 'Soft pink anamorphic flare, gentle focal zoom pulse, floating heart bokeh, and warm sunset glow.',
    color: '#f43f5e',
  },
  {
    id: 'melt-liquify',
    name: 'Psychedelic Melt & Liquify',
    category: 'Trippy / Abstract',
    description: 'Liquid displacement wave warping, iridescent color melting, and gravity-defying drip motion.',
    color: '#a855f7',
  },
  {
    id: 'electrify-lightning',
    name: 'Supercharged Cyber Lightning',
    category: 'Action / Sci-Fi',
    description: 'High-voltage electric arcs wrapping around subjects with explosive strobe transients.',
    color: '#06b6d4',
  },
  {
    id: 'supernova-shockwave',
    name: 'Supernova Shockwave Blast',
    category: 'Cosmic / Action',
    description: 'Radial sonic boom rings, screen-shattering bass flash, and expanding stellar dust field.',
    color: '#f97316',
  },
  {
    id: 'matrix-glitch',
    name: 'Matrix Data Glitch & Digital Rain',
    category: 'Cyberpunk',
    description: 'Digital scanlines, RGB channel splitting, and falling green hexadecimal code streams.',
    color: '#10b981',
  },
  {
    id: 'cyber-hologram',
    name: 'Holographic Projection HUD',
    category: 'Futuristic',
    description: 'Interlaced cyan hologram scanlines, floating telemetry rings, and audio waveform data grid.',
    color: '#38bdf8',
  },
];

export class AISpecialEffectsEngine {
  static applySpecialEffect(ctx, effectId, elapsed, audioMetrics = {}, width, height) {
    const { subBass = 0, mids = 0, isKick = false } = audioMetrics;
    const preset = SPECIAL_EFFECTS_PRESETS.find(p => p.id === effectId) || SPECIAL_EFFECTS_PRESETS[0];

    ctx.save();
    const effectScale = 1 + (isKick ? 0.2 : 0) + subBass * 0.15 + mids * 0.1;
    const cx = width / 2;
    const cy = height / 2;
    ctx.translate(cx, cy);
    ctx.scale(effectScale, effectScale);
    ctx.translate(-cx, -cy);

    if (preset.id === 'bloom-magic') {
      // Golden magical dust rays
      ctx.globalCompositeOperation = 'screen';
      const rayCount = 8;
      const angleOffset = elapsed * 0.3;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + angleOffset;
        const grad = ctx.createLinearGradient(
          width / 2,
          height / 2,
          width / 2 + Math.cos(angle) * width * 0.7,
          height / 2 + Math.sin(angle) * height * 0.7
        );
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, width * 0.7, angle - 0.18, angle + 0.18);
        ctx.closePath();
        ctx.fill();
      }
    } else if (preset.id === 'kissing-romance') {
      // Floating romantic heart particles & anamorphic flare
      ctx.globalCompositeOperation = 'screen';
      const heartCount = 6;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      for (let i = 0; i < heartCount; i++) {
        const hx = (width * 0.2 + (i * width * 0.14) + Math.sin(elapsed + i) * 20) % width;
        const hy = (height * 0.9 - ((elapsed * 50 + i * 80) % (height * 0.8)));
        ctx.beginPath();
        ctx.arc(hx, hy, 12 + Math.sin(elapsed * 2 + i) * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warm Sunset Anamorphic Lens Streak
      const streakGrad = ctx.createLinearGradient(0, height * 0.5, width, height * 0.5);
      streakGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      streakGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.45)');
      streakGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = streakGrad;
      ctx.fillRect(0, height * 0.48, width, 8);
    } else if (preset.id === 'electrify-lightning') {
      // Electric lightning bolt branching
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      let curX = width * 0.1;
      let curY = height * 0.2;
      ctx.moveTo(curX, curY);
      while (curX < width * 0.9) {
        curX += Math.random() * 60 + 20;
        curY += (Math.random() - 0.5) * 80;
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    } else if (preset.id === 'supernova-shockwave') {
      // Expanding shockwave rings on beat drop
      const ringRadius = (elapsed * 320) % (width * 0.9);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
      ctx.lineWidth = Math.max(2, (1 - ringRadius / (width * 0.9)) * 12);
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (preset.id === 'matrix-glitch') {
      // Green matrix code rain stream & scanline bars
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.font = 'bold 16px monospace';
      const colWidth = 32;
      const cols = Math.floor(width / colWidth);
      for (let c = 0; c < cols; c += 2) {
        const charY = ((elapsed * 180 + c * 40) % height);
        const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
        ctx.fillText(char, c * colWidth, charY);
      }
    } else if (preset.id === 'cyber-hologram') {
      // Interlaced Hologram Telemetry HUD
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Telemetry brackets
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.15, height * 0.15, width * 0.7, height * 0.7);
    }

    ctx.restore();
  }
}

export const aiSpecialEffectsEngine = new AISpecialEffectsEngine();
export default AISpecialEffectsEngine;
