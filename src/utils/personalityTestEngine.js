// Cosmic, Jungian & Elemental Archetypal Personality Test Engine for Astraea

export const PERSONALITY_QUESTIONS = [
  {
    id: 1,
    question: "When facing a major life crossroads, what is your first instinctive compass?",
    dimension: 'energy',
    options: [
      { text: "A sudden fiery impulse or gut instinct that demands immediate bold action", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "A deep emotional wave and intuitive feeling of whether it feels safe and sacred", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "A detached analysis mapping out all logical possibilities, pros, and cons", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "A practical evaluation of stability, long-term security, and tangible results", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 2,
    question: "In your deepest personal relationships, what makes you feel truly cherished and understood?",
    dimension: 'intimacy',
    options: [
      { text: "Passionate devotion, spontaneous adventures, and intense shared excitement", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Vulnerable soul-to-soul conversations where no emotional depth is hidden", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Stimulating intellectual banter, mutual freedom, and shared future visions", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Unshakeable loyalty, consistent presence, and acts of quiet devoted support", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 3,
    question: "How do you naturally recharge your energy when feeling drained or overwhelmed?",
    dimension: 'recharge',
    options: [
      { text: "Creative physical expression, workouts, dynamic dancing, or starting a new project", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Immersing in warm water, listening to meditative music, or deep solitary journaling", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Reading, exploring fascinating rabbit holes, or exchanging ideas with kindred minds", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Walking barefoot in nature, cooking a wholesome meal, or organizing my sanctuary", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 4,
    question: "What is your secret superpower when a crisis or chaotic situation breaks out?",
    dimension: 'superpower',
    options: [
      { text: "Fearless courage to step into the fire and lead people through the storm", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Emotional empathy that senses unspoken pain and brings soothing healing", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Crystal clarity to spot the hidden pattern and architect an ingenious solution", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Rock-solid calm that grounds everyone and executes a concrete recovery plan", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 5,
    question: "What is your biggest personal shadow or recurring blind spot when under heavy stress?",
    dimension: 'shadow',
    options: [
      { text: "Impatience, hot temper, and burnout from running ahead of everyone else", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Absorbing others' negative emotions, feeling hypersensitive, or withdrawing into isolation", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Overthinking in loops, intellectualizing feelings, and paralysis by analysis", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Stubborn resistance to change, perfectionism, and clinging to rigid routines", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 6,
    question: "When you dream of your ultimate legacy or highest life purpose, what shines brightest?",
    dimension: 'purpose',
    options: [
      { text: "Inspiring millions to ignite their inner spark and courageously conquer their dreams", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Healing wounded hearts and anchoring unconditional love into the world", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Illuminating truth, awakening minds with revolutionary ideas and wisdom", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Building enduring foundations, flourishing communities, and lasting tangible beauty", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 7,
    question: "In social gatherings and group settings, which role do you naturally fall into?",
    dimension: 'social',
    options: [
      { text: "The charismatic spark who brings the energy and gets everyone laughing and moving", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "The empathetic confidant having a deep, meaningful 1-on-1 chat in a quiet corner", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "The curious connector introducing fascinating topics and linking diverse people", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "The observant guardian ensuring everyone is comfortable, fed, and grounded", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  },
  {
    id: 8,
    question: "What kind of beauty or art moves you most profoundly?",
    dimension: 'aesthetics',
    options: [
      { text: "Dazzling fiery spectacles, vibrant bold colors, and breathtaking dynamic drama", element: 'fire', weight: { fire: 3, air: 1 } },
      { text: "Melancholic poetry, haunting melodies, and mystical oceanic atmospheres", element: 'water', weight: { water: 3, earth: 1 } },
      { text: "Sacred geometry, futuristic minimalism, and clever conceptual design", element: 'air', weight: { air: 3, fire: 1 } },
      { text: "Timeless antique craftsmanship, organic stone architecture, and lush gardens", element: 'earth', weight: { earth: 3, water: 1 } }
    ]
  }
];

export const PERSONALITY_ARCHETYPES = {
  fire_primary: {
    id: 'solar_alchemist',
    name: 'The Solar Alchemist',
    tagline: 'Passionate Trailblazer & Radiant Catalyst',
    icon: '🔥',
    element: 'Fire',
    secondaryElement: 'Air',
    color: 'from-amber-500 to-rose-500 text-amber-400 border-amber-500/40',
    summary: 'You are an unstoppable beacon of vitality, courage, and divine inspiration. You thrive when initiating new ventures, breaking through limitations, and creating infectious enthusiasm wherever you walk.',
    superpower: 'Unshakeable Initiative & Magnetic Charisma',
    shadow: 'Impulsive Burnout & Impatience with Slow Paces',
    loveStyle: 'Passionate, exciting, and generous. You love a partner who can match your intensity and celebrate your independence.',
    soulmateMatch: 'The Mystic Visionary (Water-Air) or The Sacred Anchor (Earth-Fire)',
    idealPartnerTraits: ['Inspires your big ideas', 'Grounds your nervous system', 'Celebrates your fiery passions'],
    dailyRitual: 'Morning solar breathwork, 15 minutes of dynamic movement, and bold creative goal-setting.'
  },
  water_primary: {
    id: 'mystic_oracle',
    name: 'The Mystic Empath',
    tagline: 'Intuitive Healer & Ocean of Soul Wisdom',
    icon: '🌊',
    element: 'Water',
    secondaryElement: 'Earth',
    color: 'from-cyan-500 to-blue-600 text-cyan-300 border-cyan-500/40',
    summary: 'You possess a rare depth of emotional intelligence, psychic sensitivity, and poetic empathy. You see beyond social masks directly into the soul of others, acting as a sanctuary of unconditional acceptance.',
    superpower: 'Profound Emotional Telepathy & Restorative Compassion',
    shadow: 'Sponging External Stress & Fear of Emotional Rejection',
    loveStyle: 'Deep, devoted, and spiritually intertwined. You desire a sacred bond where emotional vulnerability is treated as holy.',
    soulmateMatch: 'The Celestial Architect (Earth-Water) or The Solar Alchemist (Fire-Air)',
    idealPartnerTraits: ['Offers consistent emotional safety', 'Communicates with gentle honesty', 'Respects your need for solitude'],
    dailyRitual: 'Salt bath purification, third-eye meditation with 528 Hz Solfeggio, and evening dream journaling.'
  },
  air_primary: {
    id: 'cosmic_visionary',
    name: 'The Cosmic Visionary',
    tagline: 'Illuminator of Truth & Master Strategist',
    icon: '💨',
    element: 'Air',
    secondaryElement: 'Fire',
    color: 'from-purple-400 to-indigo-500 text-purple-300 border-purple-500/40',
    summary: 'You are driven by relentless intellectual curiosity, inventive genius, and futuristic ideals. You elevate ordinary conversations into philosophical breakthroughs and have a gift for synthesizing complex ideas into simple wisdom.',
    superpower: 'Architectural Insight & Objective Clarity',
    shadow: 'Disconnection from Emotional Body & Analysis Paralysis',
    loveStyle: 'Stimulating, communicative, and playfully witty. You fall in love through the mind and adore deep midnight discussions.',
    soulmateMatch: 'The Solar Alchemist (Fire-Air) or The Mystic Empath (Water-Earth)',
    idealPartnerTraits: ['Loves open-minded intellectual debates', 'Honors your need for mental freedom', 'Expresses warmth openly'],
    dailyRitual: '10 minutes of Pranayama breath control, morning idea synthesis, and reading ancient philosophical texts.'
  },
  earth_primary: {
    id: 'sacred_architect',
    name: 'The Sacred Architect',
    tagline: 'Master Builder of Empires & Guardian of Sanctuaries',
    icon: '🌿',
    element: 'Earth',
    secondaryElement: 'Water',
    color: 'from-emerald-500 to-teal-600 text-emerald-300 border-emerald-500/40',
    summary: 'You are the unshakeable pillar of strength, wisdom, and craftsmanship. You transform abstract dreams into enduring physical reality, providing security, wisdom, and exquisite aesthetic harmony to all in your circle.',
    superpower: 'Unrivaled Manifestation & Calming Presence',
    shadow: 'Over-responsibility & Stubborn Resistance to Spontaneity',
    loveStyle: 'Loyal, protective, and sensory-rich. You show love through dependable devotion, delicious meals, and cozy sanctuary building.',
    soulmateMatch: 'The Mystic Empath (Water-Earth) or The Cosmic Visionary (Air-Fire)',
    idealPartnerTraits: ['Values lifelong loyalty and family roots', 'Appreciates your tangible efforts', 'Brings joyful spontaneity into your life'],
    dailyRitual: 'Earthing barefoot in nature, enjoying grounding herbal teas, and review of tangible life goals.'
  }
};

export function calculatePersonalityResult(answers) {
  const scores = { fire: 0, water: 0, air: 0, earth: 0 };

  PERSONALITY_QUESTIONS.forEach((q) => {
    const selectedOptIdx = answers[q.id];
    if (selectedOptIdx !== undefined && q.options[selectedOptIdx]) {
      const opt = q.options[selectedOptIdx];
      if (opt.weight) {
        Object.entries(opt.weight).forEach(([elem, pts]) => {
          scores[elem] = (scores[elem] || 0) + pts;
        });
      } else if (opt.element) {
        scores[opt.element] = (scores[opt.element] || 0) + 3;
      }
    }
  });

  const total = (scores.fire + scores.water + scores.air + scores.earth) || 1;
  const percentages = {
    fire: Math.round((scores.fire / total) * 100),
    water: Math.round((scores.water / total) * 100),
    air: Math.round((scores.air / total) * 100),
    earth: Math.round((scores.earth / total) * 100)
  };

  // Determine Primary & Secondary Elements
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryElement = sorted[0][0];
  const secondaryElement = sorted[1][0];

  const archetypeKey = `${primaryElement}_primary`;
  const archetype = PERSONALITY_ARCHETYPES[archetypeKey] || PERSONALITY_ARCHETYPES.fire_primary;

  return {
    primaryElement,
    secondaryElement,
    scores,
    percentages,
    archetype
  };
}
