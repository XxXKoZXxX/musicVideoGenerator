// CharacterLockEngine.js - AI Character Consistency & Identity Lock Engine

export const CHARACTER_PERSONAS = [
  {
    id: 'cyber-vocalist',
    name: 'Nyx Shadowcore',
    role: 'Cyberpunk Lead Vocalist',
    genre: 'Cyberpunk / Darksynth',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: cybernetic eye glow, holographic visor, neon cyan hair braids, matte black combat leather jacket, sharp aesthetic jawline',
    voiceType: 'Alto Synth Edge',
    outfitStyle: 'Cyberpunk Tactical Chic',
    expression: 'Confident & Electric',
  },
  {
    id: 'kpop-star',
    name: 'Min-Seo (Luna)',
    role: 'K-Pop Visual & Main Vocal',
    genre: 'K-Pop / Dance Pop',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: porcelain skin, soft pink pastel wavy hair, crystal ear jewelry, shimmering silver stage bodysuit, bright charismatic gaze',
    voiceType: 'Crystal Soprano Pop',
    outfitStyle: 'Sparkling Idol Haute Couture',
    expression: 'Charismatic & Joyful',
  },
  {
    id: 'trap-frontman',
    name: 'Damon Reign',
    role: 'Hip-Hop / Trap Frontman',
    genre: 'Trap / Drill / Hip-Hop',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: sharp fade haircut, heavy platinum layered chains, oversized designer streetwear hoodie, intense magnetic eye contact',
    voiceType: 'Deep Baritone Flow',
    outfitStyle: 'Luxury Designer Streetwear',
    expression: 'Intense & Unstoppable',
  },
  {
    id: 'retro-rocker',
    name: 'Jax Valentine',
    role: 'Synth-Rock / Indie Frontman',
    genre: 'Synthwave / Retro Rock',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: messy dark curls, vintage aviator sunglasses, distressed red leather biker jacket, electric charisma',
    voiceType: 'Gritty Tenor Rock',
    outfitStyle: '1984 Sunset Biker Glam',
    expression: 'Rebellious & Passionate',
  },
  {
    id: 'cosmic-oracle',
    name: 'Astraea Celestial',
    role: 'Ethereal / Dream Pop Oracle',
    genre: 'Dream Pop / Ambient / Cosmic',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: golden starlight eyes, flowing platinum silver locks, glowing celestial crown of constellations, sheer iridescent silk robes',
    voiceType: 'Celestial Echo Soprano',
    outfitStyle: 'Iridescent Starlight Goddess',
    expression: 'Mystical & Transcendental',
  },
  {
    id: 'anime-idol',
    name: 'Aoi Hoshino',
    role: 'Anime / J-Pop Virtual Idol',
    genre: 'J-Pop / Hyperpop / Anime OST',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    consistencyPrompt: 'character consistency lock: vibrant twin-tail cobalt blue hair, luminous violet anime eyes, holographic cyber maid ribbons, energetic smile',
    voiceType: 'Bright Sweet Mezzo',
    outfitStyle: 'Neo-Tokyo Holographic Idol',
    expression: 'Playful & Hyper-energetic',
  },
];

export class CharacterLockEngine {
  constructor() {
    this.lockedPersona = CHARACTER_PERSONAS[0];
    this.isCharacterLockEnabled = true;
    this.customFaceReferenceUrl = null;
    this.lockStrength = 85; // 0-100%
  }

  /**
   * Set active persona
   */
  setPersona(personaId) {
    const found = CHARACTER_PERSONAS.find((p) => p.id === personaId);
    if (found) {
      this.lockedPersona = found;
    }
  }

  /**
   * Set custom face reference image
   */
  setCustomFace(url) {
    this.customFaceReferenceUrl = url;
  }

  /**
   * Generate model-specific character consistency prompt suffix
   */
  generateConsistencyPrompt(sceneDescription = '', modelId = 'sora_ai') {
    if (!this.isCharacterLockEnabled) {
      return sceneDescription;
    }

    const persona = this.lockedPersona;
    const faceRef = this.customFaceReferenceUrl ? `[Face Reference Anchor: ${this.customFaceReferenceUrl}] ` : '';

    return `${sceneDescription}. ${faceRef}Main character: ${persona.name}, ${persona.consistencyPrompt}. Outfit: ${persona.outfitStyle}. Lighting and identity strictly consistent across camera cuts, photorealistic facial fidelity, high fidelity render.`;
  }
}

export const characterLockEngine = new CharacterLockEngine();
export default CharacterLockEngine;
