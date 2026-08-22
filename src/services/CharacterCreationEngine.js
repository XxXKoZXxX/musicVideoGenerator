// CharacterCreationEngine.js - 3D/2D AI Character Creation, Rigging & 60 FPS Canvas Performance Engine

export const CHARACTER_ARCHETYPES = [
  {
    id: 'celestial-deity',
    name: '🌟 Celestial Deity / Oracle',
    desc: 'Luminous starlight skin, glowing astral third eye, and floating cosmic halo',
    defaultSkin: '#f8fafc',
    defaultHair: '#38bdf8',
    defaultAura: '#38bdf8',
    halo: true,
  },
  {
    id: 'cyberpunk-android',
    name: '🤖 Cyberpunk Exo-Android',
    desc: 'Sleek chrome plating, glowing neon optical lines, and holographic visor',
    defaultSkin: '#94a3b8',
    defaultHair: '#ec4899',
    defaultAura: '#ec4899',
    halo: false,
  },
  {
    id: 'astral-sorceress',
    name: '🔮 Astral Sorceress / Mage',
    desc: 'Deep violet stardust aura, glowing runic tattoos, and velvet lunar robes',
    defaultSkin: '#e2e8f0',
    defaultHair: '#a855f7',
    defaultAura: '#a855f7',
    halo: true,
  },
  {
    id: 'urban-drill-rapper',
    name: '🔥 Urban Neo-Rebel / Rapper',
    desc: 'Cyber gold chains, holographic streetwear hoodie, and glowing iris augments',
    defaultSkin: '#78350f',
    defaultHair: '#0f172a',
    defaultAura: '#f59e0b',
    halo: false,
  },
  {
    id: 'mythic-starlight-elf',
    name: '🧝 Mythic Starlight Elf',
    desc: 'Elven ears, cascading emerald starlight locks, and forest blossom crown',
    defaultSkin: '#fdf4ff',
    defaultHair: '#10b981',
    defaultAura: '#10b981',
    halo: true,
  },
];

export const CHARACTER_EYE_COLORS = [
  { id: 'cyan-glow', name: 'Cyan Neon', hex: '#06b6d4' },
  { id: 'magenta-nova', name: 'Magenta Nova', hex: '#ec4899' },
  { id: 'amber-solar', name: 'Solar Amber', hex: '#f59e0b' },
  { id: 'emerald-aurora', name: 'Aurora Emerald', hex: '#10b981' },
  { id: 'violet-void', name: 'Violet Void', hex: '#8b5cf6' },
  { id: 'starlight-white', name: 'Starlight White', hex: '#ffffff' },
];

export const CHARACTER_HAIR_STYLES = [
  { id: 'cyber-ponytail', name: 'Holographic Cyber Ponytail' },
  { id: 'cosmic-afro', name: 'Constellation Afro & Braids' },
  { id: 'lunar-waves', name: 'Cascading Lunar Waves' },
  { id: 'neo-pixie', name: 'Neo-Tokyo Spiked Crop' },
  { id: 'dread-crown', name: 'Gold-Wrapped Locks' },
];

export const CHARACTER_ACCESSORIES = [
  { id: 'cosmic-crown', name: '👑 Astral Crown / Halo' },
  { id: 'holo-visor', name: '🕶️ Holographic HUD Visor' },
  { id: 'face-tattoos', name: '✨ Glowing Runic Face Glyphs' },
  { id: 'cyber-earpiece', name: '🎧 Cybernetic Comm Earpiece' },
  { id: 'gold-chains', name: '💎 Cyber Gold Choker' },
];

export class CharacterCreationEngine {
  constructor() {
    this.character = {
      name: 'Astraea Lead Vocalist',
      archetype: 'celestial-deity',
      skinTone: '#f8fafc',
      hairColor: '#38bdf8',
      hairStyle: 'lunar-waves',
      eyeColor: '#06b6d4',
      auraColor: '#38bdf8',
      accessories: ['cosmic-crown', 'face-tattoos'],
      glowIntensity: 1.3,
      emotion: 'expressive', // serene, intense, ecstatic, dramatic
      photoUrl: null, // If user uploaded a custom portrait
    };
  }

  // Set Character Attributes
  updateCharacter(newAttributes) {
    this.character = {
      ...this.character,
      ...newAttributes,
    };
    return this.character;
  }

  // 60 FPS Procedural Character Canvas Renderer with Lip-Sync & Blink Rigging
  renderCharacterFrame(ctx, width, height, performanceState = {}) {
    const {
      viseme = 'REST',
      openness = 0.0,
      widthScale = 1.0,
      blinkFactor = 0.0,
      audioMetrics = {},
      elapsed = 0,
    } = performanceState;

    const {
      skinTone,
      hairColor,
      eyeColor,
      auraColor,
      accessories = [],
      glowIntensity = 1.0,
    } = this.character;

    const { subBass = 0, masterEnergy = 0 } = audioMetrics;

    ctx.save();

    const centerX = width / 2;
    const centerY = height * 0.52;
    const headRadius = Math.min(width, height) * 0.22;

    // Organic Breathing & Audio-reactive head sway
    const breathOffset = Math.sin(elapsed * 2.5) * (height * 0.008);
    const headTilt = Math.sin(elapsed * 1.8) * 0.03 + (masterEnergy - 0.5) * 0.04;

    ctx.translate(centerX, centerY + breathOffset);
    ctx.rotate(headTilt);

    // 1. AURA & GLOW SHIELD
    const auraPulse = (1.0 + subBass * 0.4 + Math.sin(elapsed * 4) * 0.08) * glowIntensity;
    const auraGrad = ctx.createRadialGradient(0, 0, headRadius * 0.6, 0, 0, headRadius * 2.2 * auraPulse);
    auraGrad.addColorStop(0, `${auraColor}88`);
    auraGrad.addColorStop(0.5, `${auraColor}33`);
    auraGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, headRadius * 2.2 * auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // 2. COSMIC CROWN / HALO ACCESSORY
    if (accessories.includes('cosmic-crown')) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, -headRadius * 1.3, headRadius * 0.7, headRadius * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Floating halo stars
      for (let i = 0; i < 5; i++) {
        const starAngle = (i / 5) * Math.PI * 2 + elapsed * 1.2;
        const starX = Math.cos(starAngle) * headRadius * 0.7;
        const starY = -headRadius * 1.3 + Math.sin(starAngle) * headRadius * 0.18;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(starX, starY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. HAIR (Back Layer)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -headRadius * 0.2, headRadius * 1.25, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    // 4. NECK & SHOULDERS / WARDROBE
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.rect(-headRadius * 0.35, headRadius * 0.6, headRadius * 0.7, headRadius * 0.6);
    ctx.fill();

    // Collar / Wardrobe
    const wardrobeGrad = ctx.createLinearGradient(0, headRadius * 0.8, 0, headRadius * 1.6);
    wardrobeGrad.addColorStop(0, '#0f172a');
    wardrobeGrad.addColorStop(1, '#020617');
    ctx.fillStyle = wardrobeGrad;
    ctx.beginPath();
    ctx.moveTo(-headRadius * 1.1, headRadius * 1.6);
    ctx.lineTo(-headRadius * 0.4, headRadius * 0.85);
    ctx.lineTo(headRadius * 0.4, headRadius * 0.85);
    ctx.lineTo(headRadius * 1.1, headRadius * 1.6);
    ctx.closePath();
    ctx.fill();

    // 5. FACE HEAD MESH
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(0, 0, headRadius * 0.85, headRadius * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. EYES & BLINKING RIGGING
    const eyeSpacing = headRadius * 0.38;
    const eyeY = -headRadius * 0.12;
    const eyeWidth = headRadius * 0.22;
    const eyeOpenness = Math.max(0.08, 1.0 - blinkFactor);

    [-eyeSpacing, eyeSpacing].forEach((ex) => {
      // Sclera (Eye White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeWidth, eyeWidth * 0.6 * eyeOpenness, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris with Glowing Color
      if (eyeOpenness > 0.2) {
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeWidth * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#020617';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeWidth * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Eye Catchlight Sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + 2, eyeY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyelashes & Brow
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ex - eyeWidth, eyeY - 3);
      ctx.quadraticCurveTo(ex, eyeY - eyeWidth * 0.7 * eyeOpenness - 3, ex + eyeWidth, eyeY - 3);
      ctx.stroke();

      // Eyebrow
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ex - eyeWidth * 1.1, eyeY - headRadius * 0.25);
      ctx.quadraticCurveTo(ex, eyeY - headRadius * 0.32, ex + eyeWidth * 1.1, eyeY - headRadius * 0.25);
      ctx.stroke();
    });

    // 7. NOSE
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -headRadius * 0.05);
    ctx.lineTo(-2, headRadius * 0.2);
    ctx.lineTo(3, headRadius * 0.22);
    ctx.stroke();

    // 8. VISEME LIP-SYNC MOUTH RIGGING
    const mouthY = headRadius * 0.45;
    const baseMouthW = headRadius * 0.32 * widthScale;
    const mouthH = Math.max(3, headRadius * 0.38 * openness);

    ctx.save();
    if (openness > 0.15) {
      // Open Singing Mouth Cavity
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      if (viseme === 'OH' || viseme === 'O') {
        // Round O-shape
        ctx.ellipse(0, mouthY, baseMouthW * 0.6, mouthH * 1.1, 0, 0, Math.PI * 2);
      } else if (viseme === 'EE') {
        // Wide E-shape
        ctx.ellipse(0, mouthY, baseMouthW * 1.25, mouthH * 0.7, 0, 0, Math.PI * 2);
      } else {
        // Open A-shape
        ctx.ellipse(0, mouthY, baseMouthW, mouthH, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Upper Teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(-baseMouthW * 0.5, mouthY - mouthH * 0.6, baseMouthW, mouthH * 0.35);
      ctx.fill();

      // Glowing Lip Outline
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Closed Rest Smile
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-baseMouthW * 0.8, mouthY);
      ctx.quadraticCurveTo(0, mouthY + 4, baseMouthW * 0.8, mouthY);
      ctx.stroke();
    }
    ctx.restore();

    // 9. HAIR (Front Bangs Layer)
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.moveTo(-headRadius * 0.85, -headRadius * 0.4);
    ctx.quadraticCurveTo(-headRadius * 0.3, -headRadius * 0.9, 0, -headRadius * 0.5);
    ctx.quadraticCurveTo(headRadius * 0.4, -headRadius * 0.95, headRadius * 0.85, -headRadius * 0.4);
    ctx.lineTo(headRadius * 0.9, -headRadius * 0.9);
    ctx.lineTo(-headRadius * 0.9, -headRadius * 0.9);
    ctx.closePath();
    ctx.fill();

    // 10. RUNIC FACE GLYPHS / TATTOOS
    if (accessories.includes('face-tattoos')) {
      ctx.save();
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 6;
      // Forehead Third Eye Glyph
      ctx.beginPath();
      ctx.arc(0, -headRadius * 0.45, 4, 0, Math.PI * 2);
      ctx.fill();

      // Cheek Runes
      ctx.beginPath();
      ctx.arc(-headRadius * 0.55, headRadius * 0.15, 2.5, 0, Math.PI * 2);
      ctx.arc(headRadius * 0.55, headRadius * 0.15, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const characterCreationEngine = new CharacterCreationEngine();
