// Web Audio API Complete Sacred Healing, Solfeggio, Binaural & Planetary Soundscape Synthesizer Engine

export const SOUND_CATEGORIES = [
  { id: 'all', label: 'All Frequencies' },
  { id: 'solfeggio', label: '✨ Solfeggio Scale' },
  { id: 'brainwaves', label: '🧠 Brainwaves & Binaural' },
  { id: 'chakras', label: '🌈 7 Chakras' },
  { id: 'cosmic', label: '🪐 Planetary & Cosmic' },
  { id: 'healing', label: '🌿 Pain & Cellular Healing' }
];

export const BINAURAL_BEAT_PRESETS = [
  { id: 'off', label: 'Pure Tone (No Beat)', hz: 0, desc: 'Pure sine wave frequency' },
  { id: 'delta', label: 'Delta (2.5 Hz)', hz: 2.5, wave: 'Delta', desc: 'Deep sleep, cellular healing & human growth hormone' },
  { id: 'theta', label: 'Theta (5.5 Hz)', hz: 5.5, wave: 'Theta', desc: 'Deep meditation, vivid dreaming & subconscious clearing' },
  { id: 'schumann', label: 'Schumann (7.83 Hz)', hz: 7.83, wave: 'Alpha', desc: "Earth's biological heartbeat & atmospheric resonance" },
  { id: 'alpha', label: 'Alpha (10 Hz)', hz: 10.0, wave: 'Alpha', desc: 'Relaxed focus, super-learning & anxiety reduction' },
  { id: 'beta', label: 'Beta (16 Hz)', hz: 16.0, wave: 'Beta', desc: 'Active analytical thinking, energy & alertness' },
  { id: 'gamma', label: 'Gamma (40 Hz)', hz: 40.0, wave: 'Gamma', desc: 'Peak cognitive performance, memory retrieval & insight' }
];

export const FREQUENCIES_DATABASE = {
  // --- SACRED SOLFEGGIO SCALE ---
  174: {
    hz: 174,
    category: 'solfeggio',
    title: "174 Hz - Foundation & Natural Anesthetic",
    subtitle: "Physical Pain Relief & Grounding Security",
    element: "Earth",
    chakra: "Sub-Root",
    benefits: [
      "Acts as a natural acoustic anesthetic to relieve physical body pain",
      "Relaxes muscles and releases accumulated physical tension",
      "Gives organs a sense of security, stability, and peaceful groundedness"
    ],
    recommendedFor: "Migraines, muscle aches, post-workout soreness, physical stress, back tension",
    description: "The lowest of the sacred Solfeggio frequencies. 174 Hz acts as a soothing acoustic foundation that anchors energy to the physical body and provides natural pain reduction."
  },
  285: {
    hz: 285,
    category: 'solfeggio',
    title: "285 Hz - Quantum Cognition & Cellular Tissue Repair",
    subtitle: "Rapid Cellular Regeneration & Wound Recovery",
    element: "Earth",
    chakra: "Root / Cellular Matrix",
    benefits: [
      "Stimulates cellular tissue rejuvenation and organic organ repair",
      "Restores damaged energetic fields and holes in the aura",
      "Accelerates recovery from physical cuts, burns, surgery, and illness"
    ],
    recommendedFor: "Post-illness recovery, cellular detoxification, tissue healing, fatigue, immune boost",
    description: "285 Hz directly communicates with damaged cells, encouraging them to return to their original, harmonious geometric blueprint."
  },
  396: {
    hz: 396,
    category: 'solfeggio',
    title: "396 Hz - Liberation from Guilt & Subconscious Fear",
    subtitle: "Root Chakra Awakening & Grief Dissolution",
    element: "Earth",
    chakra: "Muladhara (Root Chakra)",
    benefits: [
      "Cleanses deep subconscious feelings of guilt, shame, and unworthiness",
      "Eliminates panic, fear of financial lack, and survival anxiety",
      "Grounds dreams into tangible material reality and builds self-trust"
    ],
    recommendedFor: "Grief, heartbreak, financial anxiety, panic attacks, chronic self-doubt",
    description: "Tuned to the Root Chakra, 396 Hz vibrates through feelings of survival panic and transforms heavy feelings of guilt into spiritual resilience."
  },
  417: {
    hz: 417,
    category: 'solfeggio',
    title: "417 Hz - Transmutation & Facilitating Positive Change",
    subtitle: "Sacral Chakra & Breaking Traumatic Patterns",
    element: "Water",
    chakra: "Svadhisthana (Sacral Chakra)",
    benefits: [
      "Clears accumulated emotional trauma and negative past conditioning",
      "Breaks toxic habit loops, procrastination, and creative blockages",
      "Invigorates sexual energy, passion, fluidity, and creative enthusiasm"
    ],
    recommendedFor: "Life transitions, ending bad habits, creative blocks, stagnant energy, trauma healing",
    description: "417 Hz produces energy to bring about life change. It dissolves crystallizations of negative experiences stored inside the emotional body."
  },
  432: {
    hz: 432,
    category: 'solfeggio',
    title: "432 Hz - Miracle Tuning & Cosmic Geometry",
    subtitle: "Natural Universal Resonance & Deep Peace",
    element: "Air / Earth",
    chakra: "All Chakras / Heart",
    benefits: [
      "Vibrates mathematically in sync with the golden ratio (Phi) and nature",
      "Dramatically lowers cortisol, heart rate, and systemic anxiety",
      "Harmonizes left and right brain hemispheres for effortless flow"
    ],
    recommendedFor: "Daily work flow, background study, meditation, general stress relief, sound sleep",
    description: "Verdi's A tuning (432 Hz) matches sacred geometry and the cosmic octave. Music tuned to 432 Hz feels softer, brighter, and deeply relaxing."
  },
  528: {
    hz: 528,
    category: 'solfeggio',
    title: "528 Hz - The Miracle Tone & DNA Transformation",
    subtitle: "Solar Plexus / Heart & Cellular Light Activation",
    element: "Fire",
    chakra: "Manipura (Solar Plexus) & Anahata (Heart)",
    benefits: [
      "Known globally as the 'Love Frequency' and biological repair tone",
      "Used by molecular biochemists for genetic and cellular regeneration",
      "Opens the heart to deep love, miraculous synchronicity, and life vitality"
    ],
    recommendedFor: "Manifestation, physical rejuvenation, confidence, heart opening, artistic creation",
    description: "The crown jewel of the Solfeggio scale. 528 Hz vibrates at the exact resonance of chlorophyl and nature, revitalizing human DNA and joy."
  },
  639: {
    hz: 639,
    category: 'solfeggio',
    title: "639 Hz - Harmonious Connection & Interpersonal Unity",
    subtitle: "Heart Chakra & Relationship Healing",
    element: "Air",
    chakra: "Anahata (Heart Chakra)",
    benefits: [
      "Promotes empathy, open communication, and forgiveness in relationships",
      "Resolves marital, family, and partner conflicts with love and tolerance",
      "Enhances telepathic connection and spiritual attunement between souls"
    ],
    recommendedFor: "Couples therapy, family forgiveness, social anxiety, deepening love, emotional walls",
    description: "639 Hz enhances communication, love, and harmonious relationships. It bridges understanding across differences and heals romantic bonds."
  },
  741: {
    hz: 741,
    category: 'solfeggio',
    title: "741 Hz - Intuition & Emotional Detoxification",
    subtitle: "Throat Chakra & Authentic Self-Expression",
    element: "Water",
    chakra: "Vishuddha (Throat Chakra)",
    benefits: [
      "Cleanses cells from electromagnetic radiation and heavy toxic energies",
      "Empowers speaking your authentic truth without fear of judgment",
      "Awakens intuitive problem-solving and sudden 'aha!' clarity moments"
    ],
    recommendedFor: "Public speaking, throat tension, mental fog, detox cleansing, psychic development",
    description: "741 Hz cleans the aura of toxins and electromagnetic radiation. It leads into a pure, stable, spiritual life and expands intuition."
  },
  852: {
    hz: 852,
    category: 'solfeggio',
    title: "852 Hz - Spiritual Order & Third Eye Awakening",
    subtitle: "Ajna Chakra & Dissolving Illusions",
    element: "Water / Ether",
    chakra: "Ajna (Third Eye Chakra)",
    benefits: [
      "Directly stimulates the pineal gland and lucid psychic insight",
      "Dissolves cognitive illusions, overthinking, and obsessive rumination",
      "Connects the individual mind to divine wisdom and spiritual guides"
    ],
    recommendedFor: "Deep meditation, dream recall, tarot readings, astral travel, overcoming delusions",
    description: "852 Hz raises awareness and opens up the person to spiritual experiences. It helps embrace personal truth and see through worldly illusions."
  },
  963: {
    hz: 963,
    category: 'solfeggio',
    title: "963 Hz - Crown of the Gods & Pure Cosmic Light",
    subtitle: "Sahasrara (Crown Chakra) & Universal Oneness",
    element: "Ether",
    chakra: "Sahasrara (Crown Chakra)",
    benefits: [
      "Awakens the Crown Chakra and reconnects you to the cosmic source",
      "Activates the pineal gland to experience non-dual universal oneness",
      "Instills a state of pure euphoria, cosmic light, and transcendental joy"
    ],
    recommendedFor: "Transcendental meditation, kundalini awakening, spiritual ascension, cosmic connection",
    description: "The highest Solfeggio frequency. 963 Hz is linked with the Crown Chakra and the Divine Light. It awakens any system to its highest energetic state."
  },

  // --- BRAINWAVE ENTRAINMENT & BINAURAL ---
  10: {
    hz: 10,
    carrierHz: 210,
    category: 'brainwaves',
    title: "10 Hz - Pure Alpha Flow State Wave",
    subtitle: "Effortless Super-Learning & Serotonin Boost",
    element: "Air",
    chakra: "Third Eye",
    benefits: [
      "Induces calm alertness and suppresses anxious sympathetic nervous overdrive",
      "Boosts serotonin production for sustained mood elevation",
      "Accelerates reading comprehension, memory storage, and language learning"
    ],
    recommendedFor: "High-focus study sessions, coding, writing, test preparation, calm productivity",
    description: "10 Hz Alpha waves represent the brain's ideal learning zone. It synchronizes both hemispheres for peak creative and cognitive flow."
  },
  40: {
    hz: 40,
    carrierHz: 432,
    category: 'brainwaves',
    title: "40 Hz - Gamma Peak Cognition & Memory Synthesis",
    subtitle: "Brain Synchronization & Neural Neurogenesis",
    element: "Fire",
    chakra: "Crown / Pineal",
    benefits: [
      "Clinical frequency studied for Alzheimer's research and memory enhancement",
      "Fosters high-level cognitive binding and instantaneous problem-solving",
      "Creates subjective sensations of intense lucid clarity and heightened presence"
    ],
    recommendedFor: "Complex analytical tasks, memory improvement, cognitive fatigue, lucid awareness",
    description: "40 Hz Gamma oscillations synchronize brain areas during peak concentration, information processing, and intense spiritual meditation."
  },

  // --- PLANETARY & COSMIC OCTAVE ---
  136.1: {
    hz: 136.1,
    category: 'cosmic',
    title: "136.1 Hz - The Sacred Primordial OM Tone",
    subtitle: "Earth Year Frequency & Heart Chakra Grounding",
    element: "Earth / Ether",
    chakra: "Anahata (Heart Chakra)",
    benefits: [
      "Tuned to the frequency of Earth revolving around the Sun (Cosmic Year)",
      "Traditional Indian Sitar and Tibetan singing bowl reference frequency",
      "Opens the heart, dissolves grief, and instills profound universal security"
    ],
    recommendedFor: "Yoga, pranayama breathwork, sound baths, heart meditation, spiritual balance",
    description: "Hans Cousto's Cosmic Octave calculates 136.10 Hz as the fundamental frequency of the Earth year. It is identical to the sacred syllable OM."
  },
  126.22: {
    hz: 126.22,
    category: 'cosmic',
    title: "126.22 Hz - Solar Core Vitality & Radiant Will",
    subtitle: "Sun Planetary Frequency & Golden Prana",
    element: "Fire",
    chakra: "Manipura (Solar Plexus)",
    benefits: [
      "Resonates with the core frequency of the Sun's rotation cycle",
      "Boosts physical stamina, motivation, charisma, and dynamic leadership",
      "Dispels seasonal affective depression and lethargic apathy"
    ],
    recommendedFor: "Morning routine, building confidence, overcoming depression, motivation, public presence",
    description: "Tuned to the solar energy that sustains life on Earth. 126.22 Hz stimulates courage, vitality, and solar willpower."
  },
  210.42: {
    hz: 210.42,
    category: 'cosmic',
    title: "210.42 Hz - Synodic Lunar Flow & Sacred Intuition",
    subtitle: "Moon Planetary Frequency & Fluid Emotional Harmony",
    element: "Water",
    chakra: "Svadhisthana (Sacral Chakra)",
    benefits: [
      "Calculated from the 29.5-day synodic lunar moon cycle",
      "Balances circadian rhythms, hormonal cycles, and water retention in the body",
      "Enhances feminine receptive intuition, dream clarity, and deep empathy"
    ],
    recommendedFor: "Evening wind-down, menstrual cycle comfort, deep emotional processing, intuition",
    description: "The Moon frequency (210.42 Hz) brings deep emotional equilibrium and attunement to natural rhythmic cycles."
  },
  141.27: {
    hz: 141.27,
    category: 'cosmic',
    title: "141.27 Hz - Mercury Cosmic Intellect & Articulation",
    subtitle: "Mercury Planetary Tone & Agile Communication",
    element: "Air",
    chakra: "Throat / Mind",
    benefits: [
      "Accelerates rapid data synthesis, quick wit, and eloquent speech",
      "Assists in drafting emails, negotiations, podcast hosting, and teaching",
      "Clears throat chakra stagnation and fear of speaking up"
    ],
    recommendedFor: "Podcasting, public speaking, negotiation, writing essays, studying languages",
    description: "141.27 Hz corresponds to Mercury's orbit. It sharpens intellect, accelerates communication speed, and enhances dexterity."
  },
  221.23: {
    hz: 221.23,
    category: 'cosmic',
    title: "221.23 Hz - Venusian Beauty & Sensual Harmony",
    subtitle: "Venus Planetary Frequency & Pure Aesthetics",
    element: "Earth / Water",
    chakra: "Heart / Third Eye",
    benefits: [
      "Amplifies appreciation for music, visual art, and sensory beauty",
      "Attracts magnetic romance, romantic attraction, and gracious charm",
      "Heals body dysmorphia and fosters radiant self-love"
    ],
    recommendedFor: "Art creation, romantic evenings, self-care baths, designing, boosting allure",
    description: "The Venus frequency promotes love, harmony, aesthetic joy, and appreciation for the sensual beauty of life."
  },

  // --- SPECIALIZED HEALING & CELLULAR TONES ---
  50: {
    hz: 50,
    category: 'healing',
    title: "50 Hz - Bone Density & Deep Muscle Stimulation",
    subtitle: "Somatic Physical Body Strength Frequency",
    element: "Earth",
    chakra: "Physical Skeletal System",
    benefits: [
      "Clinical orthopedic frequency known to stimulate bone osteoblast growth",
      "Relaxes deep fascial adhesions and chronic tendon soreness",
      "Promotes lymphatic drainage and physical recovery"
    ],
    recommendedFor: "Bone recovery, joint stiffness, chronic muscle soreness, physical therapy",
    description: "50 Hz produces low-frequency somatic acoustic vibrations that penetrate deep into bone structure and muscular fascia."
  },
  111: {
    hz: 111,
    category: 'healing',
    title: "111 Hz - Holy Acoustic Resonance & Endorphin Surge",
    subtitle: "Ancient Megalithic Temple Frequency",
    element: "Ether",
    chakra: "Whole Body Energy Field",
    benefits: [
      "Acoustic frequency measured inside ancient Neolithic stone temples and pyramids",
      "Shifts brain activity from left-brain analysis to right-brain creative intuition",
      "Triggers systemic endorphin release for mood elevation and cellular calm"
    ],
    recommendedFor: "Spiritual introspection, releasing chronic stress, creative breakthroughs, sound baths",
    description: "Archeo-acousticians discovered that ancient chambers resonate at 111 Hz. It stimulates right-brain activation and deep spiritual awe."
  }
};

export class SolfeggioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.oscSub = null;
    this.gainNode = null;
    this.subGainNode = null;
    this.isPlaying = false;
    this.currentHz = 432;
    this.currentBeatHz = 7.83; // Schumann default
    this.volume = 0.35;
    this.timerId = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  play(freqHz = 432, beatHz = 7.83) {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stop();

    this.currentHz = freqHz;
    this.currentBeatHz = beatHz;

    const now = this.audioCtx.currentTime;

    // Master Gain Node with gentle attack ramp
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, now);
    this.gainNode.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume), now + 0.4);

    // Left Channel (base carrier frequency)
    this.oscLeft = this.audioCtx.createOscillator();
    this.oscLeft.type = 'sine';
    this.oscLeft.frequency.setValueAtTime(freqHz, now);

    // Right Channel (carrier + binaural beat offset)
    this.oscRight = this.audioCtx.createOscillator();
    this.oscRight.type = 'sine';
    this.oscRight.frequency.setValueAtTime(freqHz + (beatHz || 0), now);

    // Stereo Panning / Merger for true binaural isolation
    const merger = this.audioCtx.createChannelMerger(2);
    this.oscLeft.connect(merger, 0, 0); // Left ear
    this.oscRight.connect(merger, 0, 1); // Right ear

    // Sub-harmonic warm warmth oscillator (1 octave below, softly blended)
    if (freqHz > 80) {
      this.oscSub = this.audioCtx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(freqHz / 2, now);
      
      this.subGainNode = this.audioCtx.createGain();
      this.subGainNode.gain.setValueAtTime(0.12, now);
      
      this.oscSub.connect(this.subGainNode);
      this.subGainNode.connect(this.gainNode);
      this.oscSub.start(now);
    }

    merger.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.oscLeft.start(now);
    this.oscRight.start(now);

    this.isPlaying = true;
  }

  stop() {
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (this.gainNode) {
        try {
          this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
          this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        } catch (e) {}
      }
    }

    if (this.oscLeft) {
      try { this.oscLeft.stop(); this.oscLeft.disconnect(); } catch (e) {}
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); this.oscRight.disconnect(); } catch (e) {}
      this.oscRight = null;
    }
    if (this.oscSub) {
      try { this.oscSub.stop(); this.oscSub.disconnect(); } catch (e) {}
      this.oscSub = null;
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
  }

  setVolume(val) {
    this.volume = val;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }

  setBinauralBeat(beatHz) {
    this.currentBeatHz = beatHz;
    if (this.isPlaying && this.oscRight && this.audioCtx) {
      this.oscRight.frequency.setValueAtTime(this.currentHz + (beatHz || 0), this.audioCtx.currentTime);
    }
  }

  setTimer(minutes, onComplete) {
    if (this.timerId) clearTimeout(this.timerId);
    if (!minutes || minutes <= 0) return;

    this.timerId = setTimeout(() => {
      this.stop();
      if (onComplete) onComplete();
    }, minutes * 60 * 1000);
  }
}
