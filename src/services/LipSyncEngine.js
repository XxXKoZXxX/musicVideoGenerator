// LipSyncEngine.js - Real-Time Audio-Reactive Viseme Lip-Syncing & Facial Performance Engine

const LIP_SYNC_IMAGE_CACHE = new Map();

function getSingerImageElement(source) {
  if (!source) return null;
  if (typeof source !== 'string') return source;
  if (LIP_SYNC_IMAGE_CACHE.has(source)) {
    return LIP_SYNC_IMAGE_CACHE.get(source);
  }
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = source;
  LIP_SYNC_IMAGE_CACHE.set(source, img);
  return img;
}

export class LipSyncEngine {
  constructor() {
    this.lastBlinkTime = 0;
    this.blinkDuration = 0.18; // seconds for natural eyelid blink
    this.nextBlinkInterval = 3.5; // seconds between blinks
    this.currentViseme = 'REST';
    this.smoothedOpenness = 0;
    this.smoothedWidth = 1;
    this.smoothedJaw = 0;
  }

  // Analyze audio frequency spectrum to extract vocal formants and phoneme visemes
  extractViseme(audioMetrics = {}) {
    const { masterEnergy = 0, mids = 0, highs = 0, subBass = 0, spectrum = [] } = audioMetrics;

    // Vocal energy is concentrated in mids (300Hz - 3400Hz)
    // Low vowels (AA, OH): High energy in 500-1000Hz (first formant)
    // High vowels (EE, AY): High energy in 1800-3000Hz (second formant)
    // Consonants/Sibilance (S, T, CH): High energy in >4000Hz

    let formant1 = 0;
    let formant2 = 0;

    if (spectrum && spectrum.length >= 32) {
      // Bins 4 to 12 correspond roughly to 500Hz - 1200Hz
      let sumF1 = 0;
      for (let i = 4; i <= 12; i++) sumF1 += spectrum[i] || 0;
      formant1 = sumF1 / 9 / 255;

      // Bins 14 to 28 correspond roughly to 1400Hz - 3200Hz
      let sumF2 = 0;
      for (let i = 14; i <= 28; i++) sumF2 += spectrum[i] || 0;
      formant2 = sumF2 / 15 / 255;
    } else {
      formant1 = mids * 1.1;
      formant2 = highs * 0.9;
    }

    const vocalActive = mids > 0.12 || masterEnergy > 0.15;
    let targetOpenness = 0;
    let targetWidth = 1;
    let targetJaw = 0;
    let viseme = 'REST';

    if (vocalActive) {
      // Calculate mouth openness from first formant & vocal power
      targetOpenness = Math.min(1, Math.max(0, (formant1 * 1.6 + mids * 0.8) * 1.2));
      targetJaw = targetOpenness * 0.85;

      // Calculate horizontal stretch vs round pucker from second formant
      if (formant2 > formant1 * 1.15) {
        // High frequency vowel: 'EE' / 'AY' (wide horizontal smile stretch)
        targetWidth = 1.15 + formant2 * 0.35;
        viseme = 'EE';
      } else if (formant1 > 0.55 && formant2 < 0.45) {
        // Deep round vowel: 'OH' / 'OO' (puckered round mouth)
        targetWidth = 0.82 - formant1 * 0.15;
        viseme = 'OH';
      } else if (targetOpenness > 0.45) {
        // Open wide vowel: 'AA' / 'AH'
        targetWidth = 1.05;
        viseme = 'AA';
      } else {
        viseme = 'CONSONANT';
        targetWidth = 1.0;
      }
    } else {
      targetOpenness = 0;
      targetWidth = 1;
      targetJaw = 0;
      viseme = 'REST';
    }

    // Smooth transitions between viseme frames for organic animation
    this.smoothedOpenness += (targetOpenness - this.smoothedOpenness) * 0.42;
    this.smoothedWidth += (targetWidth - this.smoothedWidth) * 0.38;
    this.smoothedJaw += (targetJaw - this.smoothedJaw) * 0.35;
    this.currentViseme = viseme;

    return {
      viseme: this.currentViseme,
      openness: this.smoothedOpenness,
      widthScale: this.smoothedWidth,
      jawDrop: this.smoothedJaw,
      vocalEnergy: mids,
      subBass,
    };
  }

  // Calculate natural eye blink progress (0.0 = eyes open, 1.0 = eyes closed)
  getBlinkFactor(elapsed) {
    if (elapsed - this.lastBlinkTime > this.nextBlinkInterval) {
      this.lastBlinkTime = elapsed;
      this.nextBlinkInterval = 2.8 + Math.random() * 2.4; // random blink timing
    }

    const timeSinceBlink = elapsed - this.lastBlinkTime;
    if (timeSinceBlink < this.blinkDuration) {
      const progress = timeSinceBlink / this.blinkDuration;
      // Parabolic blink curve
      return Math.sin(progress * Math.PI);
    }
    return 0;
  }

  // Core Canvas Renderer: Warps and animates singer face with lip-syncing, jaw drop, blinking, and head sway
  renderLipSyncFace(
    ctx,
    image,
    audioMetrics,
    elapsed,
    bpm = 120,
    width,
    height,
    options = {}
  ) {
    const imageToDraw = getSingerImageElement(image);

    const {
      faceCenter = { x: 0.5, y: 0.44 },
      mouthPos = { x: 0.5, y: 0.58 },
      eyesPos = { x: 0.5, y: 0.38 },
      sensitivity = 1.0,
      showVocalGlow = true,
      zoom = 1.0,
    } = options;

    const visemeData = this.extractViseme(audioMetrics);
    const blinkFactor = this.getBlinkFactor(elapsed);
    const openness = Math.min(1, visemeData.openness * sensitivity);
    const widthScale = visemeData.widthScale;
    const jawDrop = visemeData.jawDrop * sensitivity;
    const vocalEnergy = visemeData.vocalEnergy;

    // Rhythmic Head Sway & Breathing based on BPM
    const secondsPerBeat = 60 / (bpm || 120);
    const beatPhase = (elapsed / secondsPerBeat) * Math.PI * 2;
    const headTilt = Math.sin(beatPhase * 0.5) * 0.022;
    const headSwayX = Math.cos(beatPhase * 0.5) * (width * 0.008);
    const headBobY = Math.abs(Math.sin(beatPhase)) * (height * 0.006) + jawDrop * (height * 0.008);
    const breathScale = 1 + Math.sin(elapsed * 2.2) * 0.006 + vocalEnergy * 0.03;

    ctx.save();

    // 1. Draw Singing Luminescence / Vocal Energy Glow Aura
    if (showVocalGlow && (vocalEnergy > 0.2 || openness > 0.1)) {
      const glowIntensity = Math.max(0.3, vocalEnergy * 1.5);
      const grad = ctx.createRadialGradient(
        width * faceCenter.x,
        height * faceCenter.y,
        width * 0.1,
        width * faceCenter.x,
        height * faceCenter.y,
        width * 0.5
      );
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.globalAlpha = glowIntensity;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Head Motion Matrix
    ctx.translate(width / 2 + headSwayX, height / 2 + headBobY);
    ctx.rotate(headTilt);
    ctx.scale(zoom * breathScale, zoom * breathScale);
    ctx.translate(-width / 2, -height / 2);

    // 3. Render Base Singer Portrait or Procedural Stylized Performer
    let renderedImageSuccessfully = false;

    if (imageToDraw && (imageToDraw.naturalWidth || imageToDraw.width)) {
      try {
        const frameRatio = width / height;
        const imgRatio = (imageToDraw.naturalWidth || imageToDraw.width) / (imageToDraw.naturalHeight || imageToDraw.height);
        let drawW = width;
        let drawH = height;

        if (imgRatio > frameRatio) {
          drawW = height * imgRatio;
        } else {
          drawH = width / imgRatio;
        }

        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;

        ctx.drawImage(imageToDraw, drawX, drawY, drawW, drawH);
        renderedImageSuccessfully = true;
      } catch (e) {
        renderedImageSuccessfully = false;
      }
    }

    if (!renderedImageSuccessfully) {
      // Stylized Procedural Cyber Singer Silhouette
      const cx = width / 2;
      const cy = height * 0.44;

      // Deep studio background
      const bgGrad = ctx.createRadialGradient(cx, cy, width * 0.1, cx, cy, width * 0.6);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber stage lights
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cx + 80, height);
      ctx.lineTo(cx - 80, height);
      ctx.closePath();
      ctx.fill();

      // Performer Silhouette Body & Shoulders
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(cx, height * 0.88, width * 0.28, height * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Performer Head / Face Contour
      const faceGrad = ctx.createLinearGradient(cx, cy - height * 0.15, cx, cy + height * 0.18);
      faceGrad.addColorStop(0, '#fcd34d');
      faceGrad.addColorStop(0.5, '#f59e0b');
      faceGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.11, height * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(cx, cy - height * 0.08, width * 0.125, height * 0.11, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(cx - width * 0.045, cy - height * 0.03, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + width * 0.045, cy - height * 0.03, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stage Microphone
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx, cy + height * 0.11, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 3, cy + height * 0.11, 6, height * 0.4);
    }

    // 4. Render Dynamic Lip-Sync Mouth Deformation
    const mouthCenterX = width * mouthPos.x;
    const mouthCenterY = height * mouthPos.y + headBobY * 0.5;
    const baseMouthRadiusX = width * 0.052 * widthScale;
    const baseMouthRadiusY = Math.max(3, height * 0.038 * openness);

    if (openness > 0.06) {
      ctx.save();

      // Clip mouth aperture region
      ctx.beginPath();
      ctx.ellipse(
        mouthCenterX,
        mouthCenterY,
        baseMouthRadiusX,
        baseMouthRadiusY,
        0,
        0,
        Math.PI * 2
      );

      // Inner mouth dark cavity
      const mouthGrad = ctx.createRadialGradient(
        mouthCenterX,
        mouthCenterY,
        2,
        mouthCenterX,
        mouthCenterY,
        baseMouthRadiusX
      );
      mouthGrad.addColorStop(0, '#150608');
      mouthGrad.addColorStop(0.7, '#2a0c10');
      mouthGrad.addColorStop(1, '#4a151b');

      ctx.fillStyle = mouthGrad;
      ctx.fill();

      // Upper Teeth
      if (openness > 0.18) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        const teethW = baseMouthRadiusX * 0.68;
        const teethH = Math.min(baseMouthRadiusY * 0.45, 8);
        ctx.roundRect(mouthCenterX - teethW / 2, mouthCenterY - baseMouthRadiusY + 1, teethW, teethH, [
          1, 1, 3, 3,
        ]);
        ctx.fill();
      }

      // Lower Tongue Depth
      if (openness > 0.32) {
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(
          mouthCenterX,
          mouthCenterY + baseMouthRadiusY * 0.4,
          baseMouthRadiusX * 0.5,
          baseMouthRadiusY * 0.35,
          0,
          0,
          Math.PI
        );
        ctx.fill();
      }

      // Lip contour shading & natural blend
      ctx.strokeStyle = 'rgba(120, 30, 45, 0.75)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    }

    // 5. Render Eye Blinking Micro-Animation
    if (blinkFactor > 0.05) {
      ctx.save();
      const eyeY = height * eyesPos.y;
      const leftEyeX = width * (eyesPos.x - 0.08);
      const rightEyeX = width * (eyesPos.x + 0.08);
      const eyeW = width * 0.038;
      const eyeH = height * 0.018 * blinkFactor;

      ctx.fillStyle = 'rgba(25, 18, 15, 0.85)';

      // Left eyelid
      ctx.beginPath();
      ctx.ellipse(leftEyeX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right eyelid
      ctx.beginPath();
      ctx.ellipse(rightEyeX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyelash line
      ctx.strokeStyle = '#0f0a08';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftEyeX - eyeW, eyeY);
      ctx.quadraticCurveTo(leftEyeX, eyeY + 2, leftEyeX + eyeW, eyeY);
      ctx.moveTo(rightEyeX - eyeW, eyeY);
      ctx.quadraticCurveTo(rightEyeX, eyeY + 2, rightEyeX + eyeW, eyeY);
      ctx.stroke();

      ctx.restore();
    }

    // 6. Eyebrow Emotional Expressions on Vocal Energy Peaks
    if (vocalEnergy > 0.22) {
      ctx.save();
      const eyeY = height * eyesPos.y;
      const leftEyeX = width * (eyesPos.x - 0.08);
      const rightEyeX = width * (eyesPos.x + 0.08);
      const browLift = Math.min(12, (vocalEnergy - 0.22) * 28 * sensitivity);

      ctx.strokeStyle = 'rgba(20, 15, 10, 0.75)';
      ctx.lineWidth = 3;

      // Left eyebrow arc
      ctx.beginPath();
      ctx.moveTo(leftEyeX - 18, eyeY - 14 - browLift);
      ctx.quadraticCurveTo(leftEyeX, eyeY - 20 - browLift * 1.2, leftEyeX + 18, eyeY - 12 - browLift * 0.8);
      ctx.stroke();

      // Right eyebrow arc
      ctx.beginPath();
      ctx.moveTo(rightEyeX - 18, eyeY - 12 - browLift * 0.8);
      ctx.quadraticCurveTo(rightEyeX, eyeY - 20 - browLift * 1.2, rightEyeX + 18, eyeY - 14 - browLift);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}

export const lipSyncEngine = new LipSyncEngine();
export default LipSyncEngine;
