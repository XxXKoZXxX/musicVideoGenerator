// AIDanceEngine.js - Real-Time Audio-Reactive Dance Motion & Choreography Engine

export const DANCE_STYLES = [
  {
    id: 'hip-hop',
    name: 'Hip-Hop Groove & Bounce',
    bpmRange: [85, 115],
    description: 'Rhythmic body bounce, shoulder drops, arm isolations, and low-center swagger.',
    keyframeSpeed: 1.0,
    energyFactor: 1.2,
  },
  {
    id: 'k-pop',
    name: 'K-Pop Precision & Idol Swag',
    bpmRange: [115, 135],
    description: 'Sharp arm angles, synchronized head tilts, hand hearts, and dynamic poise.',
    keyframeSpeed: 1.4,
    energyFactor: 1.35,
  },
  {
    id: 'shuffle',
    name: 'Melbourne / Electro Shuffle',
    bpmRange: [125, 145],
    description: 'Fast running-man footwork, T-step rotations, and high-energy beat snaps.',
    keyframeSpeed: 1.8,
    energyFactor: 1.5,
  },
  {
    id: 'breakdance',
    name: 'Breakdance Toprock & Freezes',
    bpmRange: [100, 130],
    description: 'Dynamic 6-step footwork, power moves, toprock cross-steps, and beat freezes.',
    keyframeSpeed: 1.3,
    energyFactor: 1.6,
  },
  {
    id: 'cyber-vogue',
    name: 'Cyber Vogue & Arm Hands Performance',
    bpmRange: [110, 130],
    description: 'Geometric hand lines, runway struts, dramatic neck snap freezes, and high fashion.',
    keyframeSpeed: 1.2,
    energyFactor: 1.25,
  },
  {
    id: 'robot-pop',
    name: 'Popping & Cyber Robot Isolations',
    bpmRange: [90, 120],
    description: 'Tick-tock stop-motion joints, muscle hit pops on snare transients, and robotic gliding.',
    keyframeSpeed: 1.0,
    energyFactor: 1.4,
  },
];

export class AIDanceEngine {
  // Compute body joints & keypoints motion for current dance style and song BPM
  static calculateDancePose(elapsed = 0, bpm = 128, styleId = 'hip-hop', audioMetrics = {}) {
    const style = DANCE_STYLES.find(s => s.id === styleId) || DANCE_STYLES[0];
    const { subBass = 0, mids = 0, isKick = false } = audioMetrics;

    const secondsPerBeat = 60 / (bpm || 128);
    const beatProgress = (elapsed / secondsPerBeat) % 1;
    const measurePhase = (elapsed / (secondsPerBeat * 4)) % 1; // 4-beat measure

    let pelvisY = 0;
    let pelvisX = 0;
    let torsoRotation = 0;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let leftFootX = 0;
    let rightFootX = 0;
    let headSnap = 0;

    const bassBounce = isKick ? 1.0 : Math.sin(beatProgress * Math.PI * 2);

    if (style.id === 'hip-hop') {
      pelvisY = Math.abs(bassBounce) * 16 * style.energyFactor;
      pelvisX = Math.sin(measurePhase * Math.PI * 2) * 12;
      torsoRotation = Math.sin(beatProgress * Math.PI) * 0.08;
      leftArmAngle = Math.sin(beatProgress * Math.PI * 2) * 0.6 + 0.4;
      rightArmAngle = -Math.sin(beatProgress * Math.PI * 2) * 0.6 - 0.4;
    } else if (style.id === 'k-pop') {
      pelvisY = Math.sin(beatProgress * Math.PI * 2) * 10;
      pelvisX = Math.cos(beatProgress * Math.PI * 2) * 14;
      torsoRotation = Math.cos(measurePhase * Math.PI * 4) * 0.12;
      leftArmAngle = Math.sin(beatProgress * Math.PI * 4) * 0.9;
      rightArmAngle = Math.cos(beatProgress * Math.PI * 4) * 0.9;
      headSnap = beatProgress > 0.85 ? 0.15 : 0;
    } else if (style.id === 'shuffle') {
      pelvisY = Math.abs(Math.sin(beatProgress * Math.PI * 4)) * 18;
      leftFootX = Math.sin(beatProgress * Math.PI * 4) * 24;
      rightFootX = -Math.sin(beatProgress * Math.PI * 4) * 24;
      leftArmAngle = Math.cos(beatProgress * Math.PI * 2) * 0.8;
      rightArmAngle = -Math.cos(beatProgress * Math.PI * 2) * 0.8;
    } else if (style.id === 'breakdance') {
      pelvisY = 24 + Math.sin(beatProgress * Math.PI * 2) * 14;
      pelvisX = Math.cos(measurePhase * Math.PI * 2) * 28;
      torsoRotation = Math.sin(measurePhase * Math.PI * 2) * 0.25;
      leftArmAngle = 1.2 + Math.sin(beatProgress * Math.PI * 2) * 0.5;
      rightArmAngle = -1.2 - Math.sin(beatProgress * Math.PI * 2) * 0.5;
    } else if (style.id === 'cyber-vogue') {
      pelvisX = Math.sin(measurePhase * Math.PI * 2) * 18;
      torsoRotation = Math.sin(measurePhase * Math.PI * 4) * 0.08;
      const armPoseStep = Math.floor(elapsed * 2) % 4;
      leftArmAngle = armPoseStep * 0.5 - 0.7;
      rightArmAngle = -armPoseStep * 0.5 + 0.7;
      headSnap = (beatProgress < 0.15) ? 0.2 : 0;
    } else if (style.id === 'robot-pop') {
      const isTick = beatProgress < 0.12 || isKick;
      pelvisY = isTick ? 14 : 0;
      torsoRotation = (Math.floor(elapsed * 2) % 2 === 0) ? 0.1 : -0.1;
      leftArmAngle = Math.floor(beatProgress * 4) * 0.4 - 0.6;
      rightArmAngle = -Math.floor(beatProgress * 4) * 0.4 + 0.6;
    }

    return {
      styleName: style.name,
      pelvisX,
      pelvisY,
      torsoRotation,
      leftArmAngle,
      rightArmAngle,
      leftFootX,
      rightFootX,
      headSnap,
      subBassPulse: subBass,
      vocalEnergy: mids,
    };
  }

  // Draw full 2D/3D beat-synced character dancer on canvas
  static renderDanceFrame(ctx, width, height, characterImage, dancePose, options = {}) {
    const { pelvisX, pelvisY, torsoRotation, leftArmAngle, rightArmAngle, headSnap } = dancePose;
    const cx = width / 2 + pelvisX;
    const cy = height * 0.46 + pelvisY;

    ctx.save();

    // 1. Stage Lighting & Dance Shadow
    const shadowW = width * 0.28 * (1 + (pelvisY / 50));
    const shadowH = 14;
    const shadowY = height * 0.88;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neon Dance Beat Ring Pulse
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, shadowY, (shadowW * 1.3) / 2, (shadowH * 1.3) / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Character Body Transform
    ctx.translate(cx, cy);
    ctx.rotate(torsoRotation);
    ctx.translate(-cx, -cy);

    if (characterImage && (characterImage.naturalWidth || characterImage.width)) {
      // Draw uploaded character performer with kinetic dance warp
      const charW = width * 0.42;
      const charH = height * 0.72;
      const charX = cx - charW / 2;
      const charY = cy - charH / 2 + 30;

      try {
        ctx.drawImage(characterImage, charX, charY, charW, charH);
      } catch (e) {}
    } else {
      // Stylized Procedural 3D Dance Silhouette
      // Torso & Body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 40, width * 0.09, height * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Jacket Gradient
      const jacketGrad = ctx.createLinearGradient(cx - 50, cy, cx + 50, cy + 80);
      jacketGrad.addColorStop(0, '#06b6d4');
      jacketGrad.addColorStop(0.5, '#3b82f6');
      jacketGrad.addColorStop(1, '#ec4899');
      ctx.strokeStyle = jacketGrad;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Arms with dance angle poses
      // Left Arm
      ctx.save();
      ctx.translate(cx - width * 0.08, cy - 10);
      ctx.rotate(leftArmAngle);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-40, 50);
      ctx.stroke();
      ctx.restore();

      // Right Arm
      ctx.save();
      ctx.translate(cx + width * 0.08, cy - 10);
      ctx.rotate(rightArmAngle);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 50);
      ctx.stroke();
      ctx.restore();

      // Head with snap rotation
      ctx.save();
      ctx.translate(cx, cy - height * 0.12);
      ctx.rotate(headSnap);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, width * 0.048, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Visor
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillRect(-width * 0.035, -4, width * 0.07, 8);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const aiDanceEngine = new AIDanceEngine();
export default AIDanceEngine;
