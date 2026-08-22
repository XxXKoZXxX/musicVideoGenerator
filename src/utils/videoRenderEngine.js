// 60 FPS HTML5 Canvas Video Render & WebRTC MediaRecorder Engine

import { calculatePlanetaryPositions, ZODIAC_SIGNS } from './astrologyEngine';
import { calculateLifePath } from './numerologyEngine';
import { getSecretLanguageProfile } from '../data/secretLanguageData';

export class VideoRenderEngine {
  constructor(canvas, profile) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.profile = profile || {
      name: 'Astraea',
      birthYear: 1993,
      birthMonth: 7,
      birthDay: 16,
      cityName: 'Newton, NJ, USA',
      lat: 41.0582,
      lng: -74.7529,
    };

    const bYear = this.profile.birthYear || 1993;
    const bMonth = this.profile.birthMonth || 7;
    const bDay = this.profile.birthDay || 16;
    const dateObj = new Date(bYear, bMonth - 1, bDay);

    this.astro = calculatePlanetaryPositions(
      dateObj,
      this.profile.birthHour || 12,
      this.profile.birthMinute || 0,
      this.profile.lat || 41.0582,
      this.profile.lng || -74.7529
    );
    this.lifePath = calculateLifePath(dateObj);
    this.secData = getSecretLanguageProfile(bMonth, bDay) || {
      dateFormatted: 'July 16',
      title: 'The Uncompromising Dynamo',
      meditation: 'Ride the wave of destiny.',
    };

    this.width = canvas.width || 640;
    this.height = canvas.height || 360;
    this.frame = 0;
    this.isRendering = false;
    this.animId = null;


    // Particles array
    this.particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random()
    }));
  }

  start() {
    this.isRendering = true;
    this.loop();
  }

  stop() {
    this.isRendering = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  loop() {
    if (!this.isRendering) return;
    this.frame++;
    this.renderFrame();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  renderFrame() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Background gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.2);
    grad.addColorStop(0, '#13172e');
    grad.addColorStop(1, '#060814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Render Particle Starfield
    ctx.fillStyle = '#F59E0B';
    this.particles.forEach(p => {
      p.x = (p.x + p.vx + w) % w;
      p.y = (p.y + p.vy + h) % h;
      ctx.globalAlpha = 0.3 + Math.sin(this.frame * 0.05 + p.x) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Cycle through 4 Motion Scenes based on frame count
    const totalFramesPerScene = 240; // 4 seconds at 60 fps
    const sceneIndex = Math.floor(this.frame / totalFramesPerScene) % 4;

    switch (sceneIndex) {
      case 0:
        this.renderSceneIntro(ctx, w, h);
        break;
      case 1:
        this.renderSceneAstrology(ctx, w, h);
        break;
      case 2:
        this.renderSceneSecretLanguage(ctx, w, h);
        break;
      case 3:
        this.renderSceneNumerology(ctx, w, h);
        break;
      default:
        this.renderSceneIntro(ctx, w, h);
    }
  }

  renderSceneIntro(ctx, w, h) {
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#F59E0B';
    ctx.font = '600 16px "Cinzel", serif';
    ctx.fillText('ASTRAEA COSMIC FORECAST', w / 2, h / 2 - 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.fillText(this.profile.name, w / 2, h / 2 - 20);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${this.secData.dateFormatted}, ${this.profile.birthYear} • ${this.profile.cityName}`, w / 2, h / 2 + 25);

    // Rotating Ring
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 160 + Math.sin(this.frame * 0.05) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderSceneAstrology(ctx, w, h) {
    ctx.textAlign = 'center';

    ctx.fillStyle = '#06B6D4';
    ctx.font = '600 16px "Cinzel", serif';
    ctx.fillText('ASTROLOGICAL TRIAD (BIG THREE)', w / 2, 70);

    // Render Rotating Wheel Symbol Ring
    const rotationAngle = this.frame * 0.01;
    const radius = 110;
    const cx = w / 2;
    const cy = h / 2 + 10;

    ZODIAC_SIGNS.forEach((sign, i) => {
      const angle = (i * 30 * Math.PI) / 180 + rotationAngle;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '18px sans-serif';
      ctx.fillText(sign.symbol, x, y + 6);
    });

    // Big 3 Text Overlay
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`☀️ Sun: ${this.astro.planets.Sun.zodiac.sign}  •  ☽ Moon: ${this.astro.planets.Moon.zodiac.sign}`, w / 2, h - 80);

    ctx.fillStyle = '#06B6D4';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Ascendant: ${this.astro.planets.Ascendant.zodiac.sign}`, w / 2, h - 50);
  }

  renderSceneSecretLanguage(ctx, w, h) {
    ctx.textAlign = 'center';

    ctx.fillStyle = '#F59E0B';
    ctx.font = '600 16px "Cinzel", serif';
    ctx.fillText('SECRET LANGUAGE ARCHETYPE', w / 2, 80);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 28px "Cinzel", serif';
    ctx.fillText(this.secData.title, w / 2, h / 2 - 30);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`"${this.secData.meditation}"`, w / 2, h / 2 + 40);
  }

  renderSceneNumerology(ctx, w, h) {
    ctx.textAlign = 'center';

    ctx.fillStyle = '#A855F7';
    ctx.font = '600 16px "Cinzel", serif';
    ctx.fillText('NUMEROLOGY POWER MATRIX', w / 2, 80);

    // Big Life Path Number
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 72px "Cinzel", serif';
    ctx.fillText(this.lifePath, w / 2, h / 2 + 10);

    ctx.fillStyle = '#FFF';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Life Path Number ${this.lifePath}`, w / 2, h / 2 + 60);
  }
}
