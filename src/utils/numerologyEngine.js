// Pythagorean Numerology Engine

const PYTHAGOREAN_TABLE = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

export function reduceToDigitOrMaster(num) {
  if (num === 11 || num === 22 || num === 33) return num;
  let current = num;
  while (current > 9) {
    if (current === 11 || current === 22 || current === 33) break;
    current = String(current).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return current;
}

export function calculateLifePath(dateObj) {
  const m = reduceToDigitOrMaster(dateObj.getMonth() + 1);
  const d = reduceToDigitOrMaster(dateObj.getDate());
  const y = reduceToDigitOrMaster(dateObj.getFullYear());
  
  return reduceToDigitOrMaster(m + d + y);
}

export function calculateNameNumerology(fullName) {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  
  let totalExpression = 0;
  let totalSoul = 0;
  let totalPersonality = 0;
  
  const letterBreakdown = [];

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const val = PYTHAGOREAN_TABLE[char] || 0;
    const isVowel = VOWELS.has(char);
    
    totalExpression += val;
    if (isVowel) {
      totalSoul += val;
    } else {
      totalPersonality += val;
    }

    letterBreakdown.push({
      char,
      val,
      type: isVowel ? 'Vowel' : 'Consonant'
    });
  }

  return {
    expression: reduceToDigitOrMaster(totalExpression),
    soulUrge: reduceToDigitOrMaster(totalSoul),
    personality: reduceToDigitOrMaster(totalPersonality),
    breakdown: letterBreakdown
  };
}

export function calculatePersonalYear(birthMonth, birthDay, currentYear = new Date().getFullYear()) {
  const m = reduceToDigitOrMaster(birthMonth);
  const d = reduceToDigitOrMaster(birthDay);
  const y = reduceToDigitOrMaster(currentYear);
  return reduceToDigitOrMaster(m + d + y);
}

export const NUMEROLOGY_MEANINGS = {
  1: {
    title: "The Pioneer & Leader",
    archetype: "Individualist & Innovator",
    gifts: "Independent drive, original vision, courageous initiative, strong willpower.",
    challenges: "Stubbornness, self-doubt, impatience, reluctance to accept assistance.",
    spiritualLesson: "Embracing self-sovereignty while holding compassionate connection with others."
  },
  2: {
    title: "The Diplomat & Peacemaker",
    archetype: "Intuitive Partner & Harmonizer",
    gifts: "Deep empathy, artistic sensitivity, diplomatic grace, keen intuitive awareness.",
    challenges: "Over-sensitivity, fear of confrontation, codependency, self-effacement.",
    spiritualLesson: "Cultivating inner security and emotional boundaries while building bridge connections."
  },
  3: {
    title: "The Catalyst & Creative Communicator",
    archetype: "Expressive Artist & Joybringer",
    gifts: "Radiant charisma, verbal eloquence, creative brilliance, uplifting optimism.",
    challenges: "Scattered energy, superficiality, emotional mood swings, fear of criticism.",
    spiritualLesson: "Channeling wild imaginative gifts into deep, authentic creative truth."
  },
  4: {
    title: "The Master Architect & Builder",
    archetype: "Foundation Craftsman & Organizer",
    gifts: "Rock-solid reliability, pragmatic discipline, structural genius, unfaltering work ethic.",
    challenges: "Rigidity, workaholism, fear of unexpected change, perfectionist anxiety.",
    spiritualLesson: "Learning flexibility and trusting the organic flow within solid boundaries."
  },
  5: {
    title: "The Visionary Freedom Seeker",
    archetype: "Adventurer & Transformer",
    gifts: "Adaptability, magnetic enthusiasm, multi-talented versatility, fearless love of freedom.",
    challenges: "Restlessness, impulsivity, fear of commitment or constraint, sensory overload.",
    spiritualLesson: "Finding true liberation through discipline and inner clarity."
  },
  6: {
    title: "The Nurturer & Cosmic Caregiver",
    archetype: "Healer & Protector",
    gifts: "Deep unconditional love, artistic refinement, protective sanctuary creation, responsibility.",
    challenges: "Martyrdom, over-controlling tendencies, idealizing others, neglect of self-care.",
    spiritualLesson: "Balancing devotion to others with radical self-compassion."
  },
  7: {
    title: "The Mystic Seeker & Analytic Philosopher",
    archetype: "Truth-Seeker & Alchemist",
    gifts: "Penetrating analytical mind, spiritual intuition, love of solitude, deep wisdom.",
    challenges: "Emotional detachment, cynicism, perfectionism, paranoia or isolation.",
    spiritualLesson: "Unifying logical intellect with sacred heart intuition."
  },
  8: {
    title: "The Sovereign Power & Manifestor",
    archetype: "Master of Abundance & Executive",
    gifts: "Executive vision, financial intelligence, resilience, natural authority, material mastery.",
    challenges: "Obsession with control, fear of failure, material greed or misuse of power.",
    spiritualLesson: "Aligning material ambition with divine spiritual purpose and generosity."
  },
  9: {
    title: "The Universal Humanitarian & Sage",
    archetype: "Cosmic Philanthropist & Lightworker",
    gifts: "Universal compassion, artistic breadth, wisdom of all numbers, selfless service.",
    challenges: "Difficulty letting go, carrying the weight of the world, emotional drama.",
    spiritualLesson: "Surrendering personal attachments to serve the collective awakening."
  },
  11: {
    title: "Master Number 11: The Illuminated Catalyst",
    archetype: "Spiritual Conduit & Intuitive Visionary",
    gifts: "High-frequency intuition, visionary lightning inspiration, psychic sensitivity.",
    challenges: "Nervous tension, overwhelming sensitivity, impostor syndrome.",
    spiritualLesson: "Grounding cosmic lightning into practical transformational service."
  },
  22: {
    title: "Master Number 22: The Master Builder",
    archetype: "Architect of New Universes",
    gifts: "Combines 11's spiritual vision with 4's practical manifestation strength.",
    challenges: "Enormous inner pressure, fear of failing grand potential.",
    spiritualLesson: "Manifesting tangible structures that uplift humanity for generations."
  },
  33: {
    title: "Master Number 33: The Master Teacher",
    archetype: "Avatar of Unconditional Love",
    gifts: "Supreme spiritual devotion, healing presence, cosmic compassion.",
    challenges: "Carrying overwhelming energetic burdens, personal sacrifice.",
    spiritualLesson: "Embodying divine unconditional love through joy and simplicity."
  }
};
