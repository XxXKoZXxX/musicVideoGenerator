// AtmosphereEngine.js - High-End Environmental Particle Shaders & Cinematic Physics (Rain, Embers, Matrix Rain, Sakura, God Rays)

export const ATMOSPHERE_MODES = [
  { id: 'none', name: 'None (Clean View)', desc: 'Standard clear camera view' },
  { id: 'rain', name: '🌧️ Cinematic Rain & Lens Droplets', desc: 'Falling rain streaks with glass refractions on beat drops' },
  { id: 'embers', name: '🔥 Fire Embers & Sparks', desc: 'Glowing volcanic particles rising and scattering on 808 kicks' },
  { id: 'matrix', name: '💻 Cyberpunk Matrix Code Rain', desc: 'Streams of glowing cyan & emerald digital glyphs' },
  { id: 'sakura', name: '🌸 Sakura Cherry Blossoms', desc: 'Gentle floating anime petals and stardust' },
  { id: 'godrays', name: '☀️ Volumetric God Rays & Light Leaks', desc: 'Sweeping warm golden sun rays & film burn leaks' },
];

export class AtmosphereEngine {
  constructor() {
    this.rainDrops = [];
    this.embers = [];
    this.sakuraPetals = [];
    this.matrixColumns = [];
    this.initParticles();
  }

  initParticles() {
    // 1. Rain Drops
    this.rainDrops = [];
    for (let i = 0; i < 160; i++) {
      this.rainDrops.push({
        x: Math.random(),
        y: Math.random(),
        length: Math.random() * 25 + 15,
        speed: Math.random() * 0.02 + 0.015,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    // 2. Fire Embers
    this.embers = [];
    for (let i = 0; i < 90; i++) {
      this.embers.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 4 + 1.5,
        vx: (Math.random() - 0.5) * 0.002,
        vy: -(Math.random() * 0.004 + 0.002),
        color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
        flicker: Math.random() * Math.PI * 2,
      });
    }

    // 3. Sakura Petals
    this.sakuraPetals = [];
    for (let i = 0; i < 60; i++) {
      this.sakuraPetals.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 7 + 4,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        speedY: Math.random() * 0.003 + 0.0015,
        speedX: Math.sin(Math.random() * Math.PI) * 0.002,
      });
    }

    // 4. Matrix Code Rain
    this.matrixColumns = [];
    for (let i = 0; i < 40; i++) {
      this.matrixColumns.push({
        x: i / 40,
        y: Math.random(),
        speed: Math.random() * 0.012 + 0.008,
        length: Math.floor(Math.random() * 10 + 6),
        chars: ['0', '1', 'X', 'Z', '9', '7', 'λ', 'Δ', 'Ω', 'Ψ', '0', '1'],
      });
    }
  }

  renderAtmosphere(ctx, atmosphereMode, audioMetrics, elapsed, width, height) {
    if (!atmosphereMode || atmosphereMode === 'none') return;

    const { subBass = 0, masterEnergy = 0, isKick = false } = audioMetrics;

    ctx.save();

    // 1. RAIN & LENS DROPLETS
    if (atmosphereMode === 'rain') {
      ctx.strokeStyle = 'rgba(200, 230, 255, 0.45)';
      ctx.lineWidth = Math.max(1, width * 0.001);

      const rainSpeedMult = 1 + subBass * 0.8;

      for (const drop of this.rainDrops) {
        drop.y += drop.speed * rainSpeedMult;
        drop.x += 0.002;
        if (drop.y > 1) {
          drop.y = 0;
          drop.x = Math.random();
        }
        if (drop.x > 1) drop.x = 0;

        const x1 = drop.x * width;
        const y1 = drop.y * height;
        const x2 = x1 + drop.length * 0.2;
        const y2 = y1 + drop.length;

        ctx.globalAlpha = drop.alpha * (0.6 + masterEnergy * 0.4);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Lens Droplets condensation on bass kick
      if (isKick || subBass > 0.55) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        for (let i = 0; i < 8; i++) {
          const rx = (Math.sin(elapsed * 2 + i * 3) * 0.4 + 0.5) * width;
          const ry = (Math.cos(elapsed * 2 + i * 2) * 0.4 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(rx, ry, 6 + subBass * 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. FIRE EMBERS & SPARKS
    else if (atmosphereMode === 'embers') {
      ctx.globalCompositeOperation = 'screen';
      const kickBurst = isKick ? 3.5 : 1;

      for (const ember of this.embers) {
        ember.y += ember.vy * kickBurst;
        ember.x += ember.vx + Math.sin(elapsed * 3 + ember.flicker) * 0.001;

        if (ember.y < 0) {
          ember.y = 1;
          ember.x = Math.random();
        }
        if (ember.x < 0) ember.x = 1;
        if (ember.x > 1) ember.x = 0;

        const alpha = Math.sin(elapsed * 6 + ember.flicker) * 0.3 + 0.7;
        ctx.globalAlpha = Math.min(1, alpha * (0.6 + subBass * 0.6));
        ctx.fillStyle = ember.color;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(
          ember.x * width,
          ember.y * height,
          ember.size * (1 + subBass * 0.8),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // 3. SAKURA CHERRY BLOSSOMS
    else if (atmosphereMode === 'sakura') {
      ctx.fillStyle = 'rgba(251, 207, 232, 0.75)';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 6;

      for (const petal of this.sakuraPetals) {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(elapsed * 2 + petal.angle) * 0.001;
        petal.angle += petal.rotSpeed;

        if (petal.y > 1) {
          petal.y = 0;
          petal.x = Math.random();
        }
        if (petal.x > 1) petal.x = 0;
        if (petal.x < 0) petal.x = 1;

        ctx.save();
        ctx.translate(petal.x * width, petal.y * height);
        ctx.rotate(petal.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. CYBERPUNK MATRIX CODE RAIN
    else if (atmosphereMode === 'matrix') {
      ctx.font = `700 ${Math.max(12, width * 0.012)}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;

      for (const col of this.matrixColumns) {
        col.y += col.speed * (1 + subBass * 0.6);
        if (col.y > 1.2) col.y = -0.2;

        const x = col.x * width;
        for (let j = 0; j < col.length; j++) {
          const y = (col.y - j * 0.025) * height;
          if (y > 0 && y < height) {
            const charIdx = (Math.floor(elapsed * 8) + j) % col.chars.length;
            ctx.globalAlpha = j === 0 ? 0.95 : Math.max(0.1, 1 - j / col.length);
            ctx.fillStyle = j === 0 ? '#ffffff' : (j % 2 === 0 ? '#06b6d4' : '#10b981');
            ctx.fillText(col.chars[charIdx], x, y);
          }
        }
      }
    }

    // 5. VOLUMETRIC GOD RAYS & LIGHT LEAKS
    else if (atmosphereMode === 'godrays') {
      ctx.globalCompositeOperation = 'screen';
      const numRays = 5;
      const originX = width * 0.15;
      const originY = height * 0.1;

      for (let i = 0; i < numRays; i++) {
        const sweep = Math.sin(elapsed * 0.8 + i * 0.9) * 0.2;
        const targetX = width * (0.3 + i * 0.2 + sweep);
        const targetY = height;

        const rayGrad = ctx.createLinearGradient(originX, originY, targetX, targetY);
        rayGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        rayGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
        rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(originX - 10, originY);
        ctx.lineTo(originX + 10, originY);
        ctx.lineTo(targetX + width * 0.18, targetY);
        ctx.lineTo(targetX - width * 0.18, targetY);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export const atmosphereEngine = new AtmosphereEngine();
export default AtmosphereEngine;
