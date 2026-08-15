// Secret Language of Birthdays - 366-Day Complete Esoteric Database

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ARCHETYPE_TITLES_POOL = [
  "The Day of Emotional Heights", "The Day of Material Mastery", "The Day of Meticulous Observation",
  "The Day of Radiant Leadership", "The Day of Sacred Harmony", "The Day of Unstoppable Drive",
  "The Day of Intuitive Vision", "The Day of The Cosmic Architect", "The Day of Deep Transformation",
  "The Day of Magnetic Charm", "The Day of Fearless Innovation", "The Day of Universal Compassion",
  "The Day of The Quiet Sentinel", "The Day of Creative Alchemy", "The Day of Structural Genius",
  "The Day of Vibrant Freedom", "The Day of Gentle Nurturing", "The Day of Penetrating Insight",
  "The Day of Strategic Mastery", "The Day of Cosmic Balance", "The Day of The Noble Trailblazer"
];

const STRENGTHS_POOL = [
  ["Determined", "Visionary", "Highly Intuitive", "Resilient"],
  ["Eloquent", "Charismatic", "Detail-Oriented", "Resourceful"],
  ["Compassionate", "Artistic", "Loyal", "Philosophical"],
  ["Analytical", "Disciplined", "Pioneering", "Magnetic"],
  ["Protective", "Innovative", "Generous", "Unwavering"]
];

const WEAKNESSES_POOL = [
  ["Impatience", "Over-Perfectionism", "Stubbornness"],
  ["Emotional Restlessness", "Workaholism", "Hypersensitivity"],
  ["Reluctance to Ask for Help", "Prone to Worry", "Possessiveness"],
  ["Difficulty Delegating", "Uncompromising", "Impulsivity"]
];

const MEDITATIONS_POOL = [
  "To understand the infinite cosmos, look deeply into the silent space between your own heartbeats.",
  "True strength is not the force that bends others, but the peace that remains untouched.",
  "The lotus blooms purest in the deepest waters; embrace every challenge as sacred nourishment.",
  "As above in the stars, so below in the soul — you are the universe observing itself.",
  "Wisdom is born when we listen to what is unsaid.",
  "Every doorway you encounter in life was built by your own previous intentions."
];

// Helper to determine Decan / Cusp
function getAstrologicalDecan(month, day) {
  // Simple zodiac mapping
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: "Aries", cusp: day <= 24 ? "Pisces-Aries Cusp" : "Aries Decan", element: "Fire" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: "Taurus", cusp: day <= 24 ? "Aries-Taurus Cusp" : "Taurus Decan", element: "Earth" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: "Gemini", cusp: day <= 24 ? "Taurus-Gemini Cusp" : "Gemini Decan", element: "Air" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: "Cancer", cusp: day <= 24 ? "Gemini-Cancer Cusp" : "Cancer Decan", element: "Water" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: "Leo", cusp: day <= 26 ? "Cancer-Leo Cusp" : "Leo Decan", element: "Fire" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: "Virgo", cusp: day <= 26 ? "Leo-Virgo Cusp" : "Virgo Decan", element: "Earth" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: "Libra", cusp: day <= 26 ? "Virgo-Libra Cusp" : "Libra Decan", element: "Air" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: "Scorpio", cusp: day <= 26 ? "Libra-Scorpio Cusp" : "Scorpio Decan", element: "Water" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: "Sagittarius", cusp: day <= 25 ? "Scorpio-Sagittarius Cusp" : "Sagittarius Decan", element: "Fire" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: "Capricorn", cusp: day <= 25 ? "Sagittarius-Capricorn Cusp" : "Capricorn Decan", element: "Earth" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: "Aquarius", cusp: day <= 23 ? "Capricorn-Aquarius Cusp" : "Aquarius Decan", element: "Air" };
  return { sign: "Pisces", cusp: day <= 22 ? "Aquarius-Pisces Cusp" : "Pisces Decan", element: "Water" };
}

// Generate complete dictionary of 366 profiles
const SECRET_LANGUAGE_DB = {};

for (let m = 1; m <= 12; m++) {
  const maxDays = DAYS_IN_MONTH[m - 1];
  for (let d = 1; d <= maxDays; d++) {
    const dateKey = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const titleIndex = (m * 31 + d) % ARCHETYPE_TITLES_POOL.length;
    const strengthsIndex = (m + d) % STRENGTHS_POOL.length;
    const weaknessesIndex = (m * d) % WEAKNESSES_POOL.length;
    const meditationIndex = (m + d * 3) % MEDITATIONS_POOL.length;

    const astroInfo = getAstrologicalDecan(m, d);
    const tarotNumber = (d % 22);

    SECRET_LANGUAGE_DB[dateKey] = {
      month: m,
      monthName: MONTH_NAMES[m - 1],
      day: d,
      dateFormatted: `${MONTH_NAMES[m - 1]} ${d}`,
      title: ARCHETYPE_TITLES_POOL[titleIndex],
      sign: astroInfo.sign,
      cusp: astroInfo.cusp,
      element: astroInfo.element,
      tarotCardNumber: tarotNumber,
      strengths: STRENGTHS_POOL[strengthsIndex],
      weaknesses: WEAKNESSES_POOL[weaknessesIndex],
      meditation: MEDITATIONS_POOL[meditationIndex],
      personalityText: `Those born on ${MONTH_NAMES[m - 1]} ${d} possess a distinct blend of ${astroInfo.element} intensity and unwavering dedication. Governed by their unique birth alignment, they navigate life with intense clarity, frequently serving as an anchor of inspiration for those around them.`,
      healthAdvice: `Individuals born on this day should prioritize high-quality sleep, balanced physical movement, and routine mental decompression through meditation or nature walks to avoid burnout.`,
      lifeTheme: `Mastering inner equilibrium while expressing authentic creative sovereignty.`
    };
  }
}

export function getSecretLanguageProfile(month, day) {
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return SECRET_LANGUAGE_DB[dateKey] || SECRET_LANGUAGE_DB["01-01"];
}
