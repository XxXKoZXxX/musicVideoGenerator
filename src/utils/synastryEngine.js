// Complete Dual-Person Multi-Subject Comparison, House Overlay & Twin Flame Calculation Engine

import { calculatePlanetaryPositions } from './astrologyEngine';
import { calculateLifePath, calculateNameNumerology } from './numerologyEngine';
import { getSecretLanguageProfile } from '../data/secretLanguageData';
import { calculateBirthTarotCards } from './tarotEngine';

// Calculate exact angular difference between two astrological longitudes
export function getAspect(deg1, deg2) {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;

  if (diff <= 8) return { name: 'Conjunction (0°)', symbol: '☌', type: 'conjunction', bonus: 28, desc: 'Direct energetic fusion & instant soul recognition', orb: diff.toFixed(1) };
  if (Math.abs(diff - 60) <= 6) return { name: 'Sextile (60°)', symbol: '⚹', type: 'harmonious', bonus: 20, desc: 'Natural creative flow, smooth communication & mutual inspiration', orb: Math.abs(diff - 60).toFixed(1) };
  if (Math.abs(diff - 90) <= 7) return { name: 'Square (90°)', symbol: '□', type: 'challenging', bonus: 6, desc: 'Dynamic evolutionary tension & mutual growth catalyst', orb: Math.abs(diff - 90).toFixed(1) };
  if (Math.abs(diff - 120) <= 8) return { name: 'Trine (120°)', symbol: '△', type: 'harmonious', bonus: 26, desc: 'Divine ease, spiritual resonance & effortless harmony', orb: Math.abs(diff - 120).toFixed(1) };
  if (Math.abs(diff - 180) <= 8) return { name: 'Opposition (180°)', symbol: '☍', type: 'magnetic', bonus: 24, desc: 'Magnetic attraction of polar opposites & profound mirror effect', orb: Math.abs(diff - 180).toFixed(1) };
  
  return { name: 'Neutral (No Major Aspect)', symbol: '—', type: 'neutral', bonus: 8, desc: 'Independent energy paths with room for conscious connection', orb: 'N/A' };
}

// Numerology Life Path Compatibility Family Map
export function getNumerologyHarmonicScore(lpA, lpB) {
  if (lpA === lpB) return { score: 98, note: 'Identical Life Path - Twin Soul Resonance & Shared Life Mission' };
  
  // Master Number connections
  if ([11, 22, 33].includes(lpA) || [11, 22, 33].includes(lpB)) {
    return { score: 94, note: 'Master Number Spiritual Resonance - Heightened Soul Contract' };
  }

  // Harmonic Families
  const mindFamily = [1, 5, 7];
  const manifestFamily = [2, 4, 8];
  const creativeFamily = [3, 6, 9];

  if (mindFamily.includes(lpA) && mindFamily.includes(lpB)) {
    return { score: 92, note: 'Mind & Pioneer Family (1-5-7) - Mutual intellectual freedom & adventure' };
  }
  if (manifestFamily.includes(lpA) && manifestFamily.includes(lpB)) {
    return { score: 94, note: 'Manifestation & Builder Family (2-4-8) - Unshakeable loyalty & material stability' };
  }
  if (creativeFamily.includes(lpA) && creativeFamily.includes(lpB)) {
    return { score: 95, note: 'Creative & Healer Family (3-6-9) - Heart-centered devotion & artistic synergy' };
  }

  // Complementary Polarity Pairs
  if ((lpA === 1 && lpB === 2) || (lpA === 2 && lpB === 1)) return { score: 90, note: 'Leader & Harmonizer Polarity - Balanced divine masculine & feminine' };
  if ((lpA === 4 && lpB === 8) || (lpA === 8 && lpB === 4)) return { score: 96, note: 'Power & Structure Alliance - Supreme empire building' };
  if ((lpA === 3 && lpB === 5) || (lpA === 5 && lpB === 3)) return { score: 89, note: 'Joy & Exploration Duo - Endless charisma & laughter' };

  return { score: 82, note: 'Complementary Paths - Opportunity to learn different lifetime skills' };
}

// Elemental Compatibility Alchemy
export function getElementalAlchemy(elemA, elemB) {
  if (elemA === elemB) return { score: 95, desc: `Twin ${elemA} element: Instant energetic familiarity and shared rhythm.` };
  if ((elemA === 'Fire' && elemB === 'Air') || (elemA === 'Air' && elemB === 'Fire')) {
    return { score: 96, desc: 'Fire & Air Alchemy: Air fans Fire into creative brilliance, Fire gives Air passion and warmth.' };
  }
  if ((elemA === 'Earth' && elemB === 'Water') || (elemA === 'Water' && elemB === 'Earth')) {
    return { score: 95, desc: 'Earth & Water Alchemy: Earth provides stable banks for Water to flow; Water nourishes Earth into bloom.' };
  }
  if ((elemA === 'Fire' && elemB === 'Earth') || (elemA === 'Earth' && elemB === 'Fire')) {
    return { score: 80, desc: 'Fire & Earth: Volcano energy — Fire inspires ambitious goals, Earth grounds them into reality.' };
  }
  if ((elemA === 'Air' && elemB === 'Water') || (elemA === 'Water' && elemB === 'Air')) {
    return { score: 82, desc: 'Air & Water: Mist and rain — Air articulates feelings, Water introduces deep emotional intuition.' };
  }
  return { score: 78, desc: 'Steam & Transformation: Dynamic energetic friction requiring conscious balance.' };
}

// House Descriptions
const HOUSE_OVERLAY_DESCRIPTIONS = {
  1: { theme: 'Persona, Identity & Magnetic Presence', meaning: 'Direct, instant energetic recognition. You feel seen at your core and physically magnetized by their presence.' },
  2: { theme: 'Values, Wealth & Physical Sanctuary', meaning: 'Enhances mutual self-worth and financial co-creation. You build tangible stability and security together.' },
  3: { theme: 'Mind, Daily Dialogue & Learning', meaning: 'Sparks continuous curious banter, lively texting, and easy intellectual companionship.' },
  4: { theme: 'Home, Soul Roots & Family Sanctuary', meaning: 'Deep feeling of coming home. Instant emotional safety, ancestral resonance, and cozy comfort.' },
  5: { theme: 'Romance, Passion & Creative Expression', meaning: 'Supreme romantic spark, playful chemistry, and shared joy in artistic and erotic expression.' },
  6: { theme: 'Devotion, Daily Rituals & Healing Service', meaning: 'Mutual dedication to everyday care, wholesome habits, and supporting each other\'s life responsibilities.' },
  7: { theme: 'Sacred Partnership, Mirror & Marriage', meaning: 'The classic soulmate overlay. You naturally see each other as ideal life partners and mirror allies.' },
  8: { theme: 'Psychological Alchemy, Kundalini & Rebirth', meaning: 'Profound, intense intimacy that dissolves ego defenses, sparking deep emotional and spiritual transformation.' },
  9: { theme: 'Higher Wisdom, Travel & Philosophy', meaning: 'Expands your horizons through spiritual study, foreign adventures, and discovering new life truths.' },
  10: { theme: 'Vocation, Status & Empire Building', meaning: 'Power alliance. You admire each other\'s ambition and elevate one another\'s public prestige and career goals.' },
  11: { theme: 'Soul Tribe, Friendship & Shared Dreams', meaning: 'Unconditional friendship and kindred spirits. You share utopian visions and support each other\'s ideals.' },
  12: { theme: 'Past Lives, Telepathy & Spiritual Transcendence', meaning: 'Mystic karmic link. Unspoken telepathic empathy, shared dream states, and profound past-life reunion.' }
};

// Calculate House Overlay (Equal House System from Ascendant)
export function getHouseFromAscendant(planetDeg, ascendantDeg) {
  let diff = (planetDeg - ascendantDeg + 360) % 360;
  const houseNum = Math.floor(diff / 30) + 1;
  return houseNum;
}

// Calculate House Overlays for both individuals
export function calculateHouseOverlays(astroA, astroB, nameA, nameB) {
  const ascA = astroA.planets.Ascendant.longitude;
  const ascB = astroB.planets.Ascendant.longitude;

  const planetsToCheck = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'NorthNode'];

  // Person A planets falling in Person B houses
  const aInB = planetsToCheck.map(pName => {
    const pDeg = astroA.planets[pName].longitude;
    const hNum = getHouseFromAscendant(pDeg, ascB);
    const info = HOUSE_OVERLAY_DESCRIPTIONS[hNum];
    return {
      planet: pName,
      house: hNum,
      title: `${nameA}'s ${pName} in ${nameB}'s ${hNum}th House`,
      theme: info.theme,
      desc: info.meaning
    };
  });

  // Person B planets falling in Person A houses
  const bInA = planetsToCheck.map(pName => {
    const pDeg = astroB.planets[pName].longitude;
    const hNum = getHouseFromAscendant(pDeg, ascA);
    const info = HOUSE_OVERLAY_DESCRIPTIONS[hNum];
    return {
      planet: pName,
      house: hNum,
      title: `${nameB}'s ${pName} in ${nameA}'s ${hNum}th House`,
      theme: info.theme,
      desc: info.meaning
    };
  });

  return { aInB, bInA };
}

// Mercury Communication Traits Map
const MERCURY_TRAITS = {
  Aries: { style: 'direct, passionate, and fast-paced', advice: 'action-oriented honesty and immediate clarity' },
  Taurus: { style: 'grounded, deliberate, and practical', advice: 'patience, steady pacing, and tangible real-world examples' },
  Gemini: { style: 'curious, witty, and versatile', advice: 'stimulating conversation, playfulness, and open dialogue' },
  Cancer: { style: 'intuitive, deeply empathetic, and sensitive', advice: 'emotional safety, gentle vocal tone, and validating feelings' },
  Leo: { style: 'expressive, heartfelt, and magnetic', advice: 'warm appreciation, authentic praise, and enthusiastic presence' },
  Virgo: { style: 'analytical, articulate, and detail-oriented', advice: 'clear structure, thoughtful precision, and practical solutions' },
  Libra: { style: 'diplomatic, balanced, and considerate', advice: 'fair collaboration, peaceful harmony, and mutual perspective' },
  Scorpio: { style: 'penetrating, perceptive, and truth-seeking', advice: 'total authenticity, emotional depth, and sacred confidence' },
  Sagittarius: { style: 'philosophical, candid, and visionary', advice: 'big-picture inspiration, freedom of thought, and humor' },
  Capricorn: { style: 'strategic, disciplined, and pragmatic', advice: 'constructive focus, reliability, and structured goals' },
  Aquarius: { style: 'innovative, objective, and unconventional', advice: 'intellectual freedom, mental breathing room, and progressive ideas' },
  Pisces: { style: 'poetic, imaginative, and holistic', advice: 'compassionate understanding, non-verbal resonance, and patience' }
};

// Moon Intimacy Styles Map
const MOON_INTIMACY_TRAITS = {
  Aries: 'recharges through active shared adventures, spontaneous passion, and immediate emotional honesty',
  Taurus: 'recharges through physical comfort, sensory grounding, peaceful surroundings, and consistent loyalty',
  Gemini: 'recharges through mental banter, sharing curiosities, vocal communication, and intellectual variety',
  Cancer: 'recharges through home sanctuary, tender nurturing, soulful security, and sacred vulnerability',
  Leo: 'recharges through heartfelt admiration, generous warmth, romantic celebration, and shared creative play',
  Virgo: 'recharges through practical acts of service, quiet order, peaceful routine, and thoughtful consideration',
  Libra: 'recharges through aesthetic beauty, gracious partnership, harmonious balance, and peaceful connection',
  Scorpio: 'recharges through total emotional truth, profound intimate depth, vulnerability, and unspoken soul bonding',
  Sagittarius: 'recharges through optimistic freedom, exploratory journeys, laughter, and philosophical depth',
  Capricorn: 'recharges through dependable stability, shared accomplishments, mature integrity, and mutual respect',
  Aquarius: 'recharges through authentic individuality, intellectual space, kindred visions, and shared humanitarian ideals',
  Pisces: 'recharges through empathetic connection, spiritual presence, music, and quiet transcendent sanctuary'
};

export function generateCommunicationAndIntimacyAdvice(nameA, mercA, moonA, nameB, mercB, moonB) {
  const traitA = MERCURY_TRAITS[mercA] || { style: 'thoughtful and observant', advice: 'clear expression' };
  const traitB = MERCURY_TRAITS[mercB] || { style: 'engaging and reflective', advice: 'attentive presence' };
  const moonA_Need = MOON_INTIMACY_TRAITS[moonA] || 'values genuine emotional connection and presence';
  const moonB_Need = MOON_INTIMACY_TRAITS[moonB] || 'values authentic emotional presence and security';

  if (nameA.toLowerCase() === nameB.toLowerCase()) {
    return `${nameA} thrives with ${traitA.style} communication (Mercury in ${mercA}) and ${moonA_Need} (Moon in ${moonA}). When comparing two profiles, ensure Slot B is set to a partner or friend for dual side-by-side analysis.`;
  }

  return `In communication, ${nameA} communicates through a ${traitA.style} rhythm (Mercury in ${mercA}) and thrives with ${traitA.advice}, while ${nameB} processes through a ${traitB.style} approach (Mercury in ${mercB}) and benefits from ${traitB.advice}. In intimacy, ${nameA} (Moon in ${moonA}) ${moonA_Need}, whereas ${nameB} (Moon in ${moonB}) ${moonB_Need}.`;
}

// Conflict Resolution & Shadow Alchemy Generator
export function generateConflictResolutionProtocol(nameA, astroA, nameB, astroB) {
  const marsAspect = getAspect(astroA.planets.Mars.longitude, astroB.planets.Mars.longitude);
  const saturnAspect = getAspect(astroA.planets.Saturn.longitude, astroB.planets.Mars.longitude);

  let trigger = "Misalignment in pacing or sudden emotional defensiveness";
  let antidote = "Take a 20-minute pause to ground before discussing solutions";

  if (marsAspect.type === 'challenging') {
    trigger = `Ego friction between ${nameA}'s ${astroA.planets.Mars.zodiac.sign} assertive drive and ${nameB}'s ${astroB.planets.Mars.zodiac.sign} reaction style.`;
    antidote = "Acknowledge each other's feelings before proposing fixes. Frame requests with 'I feel' rather than 'You always'.";
  } else if (saturnAspect.type === 'challenging') {
    trigger = "Feeling restricted or criticized when boundaries are expressed too rigidly.";
    antidote = "Practice radical vulnerability. Express underlying fears of rejection rather than withdrawing into silence.";
  } else {
    trigger = "Unexpressed expectations and assuming the other can read your mind.";
    antidote = "Set weekly 10-minute check-ins to share appreciation and align on shared priorities.";
  }

  return {
    trigger,
    antidote,
    aspectNote: `${nameA}'s Mars ⟷ ${nameB}'s Mars: ${marsAspect.name} (${marsAspect.desc})`
  };
}

// Composite Midpoint Calculator (The Third Energy Entity)
export function calculateCompositeChart(astroA, astroB, lpA, lpB) {
  const getMidpoint = (deg1, deg2) => {
    let diff = Math.abs(deg1 - deg2);
    if (diff > 180) {
      return (Math.min(deg1, deg2) + (360 - diff) / 2 + 180) % 360;
    }
    return (deg1 + deg2) / 2;
  };

  const compSunDeg = getMidpoint(astroA.planets.Sun.longitude, astroB.planets.Sun.longitude);
  const compMoonDeg = getMidpoint(astroA.planets.Moon.longitude, astroB.planets.Moon.longitude);
  const compAscDeg = getMidpoint(astroA.planets.Ascendant.longitude, astroB.planets.Ascendant.longitude);

  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const compSunSign = signs[Math.floor(compSunDeg / 30)];
  const compMoonSign = signs[Math.floor(compMoonDeg / 30)];
  const compAscSign = signs[Math.floor(compAscDeg / 30)];

  const compositeLifePath = ((lpA + lpB - 1) % 9) + 1;

  return {
    sunSign: compSunSign,
    moonSign: compMoonSign,
    risingSign: compAscSign,
    compositeLifePath,
    coreMission: `As a united field, your relationship functions with ${compSunSign} solar purpose, ${compMoonSign} emotional harmony, and Life Path ${compositeLifePath} soul co-creation.`
  };
}

// Interactive Twin Flame Diagnostic Quiz Questions
export const TWIN_FLAME_DIAGNOSTIC_QUESTIONS = [
  {
    id: 'telepathy',
    question: 'Do you experience telepathic or intuitive emotional resonance across distance?',
    options: [
      { label: 'Frequently: I feel their mood shifts and sudden thoughts instantly before they speak', points: 25 },
      { label: 'Occasionally: We often text at the exact same second or say the same words', points: 18 },
      { label: 'Sometimes: Subtle intuitive hunches that turn out to be accurate', points: 10 },
      { label: 'Rarely: We communicate primarily through direct verbal interaction', points: 4 }
    ]
  },
  {
    id: 'synchronicities',
    question: 'How frequently do synchronicities (11:11, mirror numbers, serendipitous timing) occur around this bond?',
    options: [
      { label: 'Constant: 11:11, 222, 333, and uncanny cosmic alignments occur daily', points: 25 },
      { label: 'Frequent: We noticed significant numerical and date patterns since meeting', points: 18 },
      { label: 'Moderate: A few strange coincidences during pivotal moments', points: 12 },
      { label: 'Minimal: We haven\'t paid much attention to numerical patterns', points: 4 }
    ]
  },
  {
    id: 'shadowMirror',
    question: 'Does this relationship act as an intense mirror, bringing deep personal shadows into the light for healing?',
    options: [
      { label: 'Profoundly: Being around them pushes me to release obsolete ego patterns and grow', points: 25 },
      { label: 'Significantly: They inspire me to be my highest self, though it challenges my comfort zones', points: 18 },
      { label: 'Mildly: We have typical disagreements but work through them gently', points: 10 },
      { label: 'Rarely: Very smooth with little personal evolution triggered', points: 4 }
    ]
  },
  {
    id: 'kundaliniEnergy',
    question: 'What physical and energetic sensations do you feel in their presence?',
    options: [
      { label: 'Electric & Magnetic: Deep heart chakra expansion, electric touch, and intense energy warmth', points: 25 },
      { label: 'Warm & Calming: Peaceful grounded resonance and strong physical comfort', points: 18 },
      { label: 'Pleasant: Standard romantic attraction and affection', points: 12 },
      { label: 'Neutral: Familiar and friendly companionship', points: 5 }
    ]
  },
  {
    id: 'soulMission',
    question: 'Do you feel a mutual calling to co-create, serve, or heal something larger than yourselves?',
    options: [
      { label: 'Unmistakably: We feel an urgent shared soul mission to build and inspire others', points: 25 },
      { label: 'Strongly: We have complementary talents that empower both of our life goals', points: 18 },
      { label: 'Moderately: We support each other\'s individual careers and dreams', points: 10 },
      { label: 'Focus is Personal: Our focus is on private domestic happiness and leisure', points: 4 }
    ]
  }
];

// Evaluate Diagnostic Quiz Results
export function evaluateTwinFlameTest(answers, synastryComparison) {
  let rawScore = 0;
  Object.values(answers).forEach(pts => {
    rawScore += (pts || 0);
  });

  const baseCalculatedScore = synastryComparison?.twinFlame?.score || 75;
  const combinedScore = Math.round((rawScore * 0.55) + (baseCalculatedScore * 0.45));

  let stage = 'Recognition & Awakening';
  let stageDesc = 'Initial soul recognition and magnetic attraction. The veil of ordinary reality is lifted.';
  let prescription = 'Focus on open-hearted dialogue and exploring your shared creative affinities.';

  if (combinedScore >= 90) {
    stage = '✨ Harmonious Sacred Union & Radiant Co-Creation';
    stageDesc = 'Both individuals have integrated their inner shadows, embodying mutual unconditional love and sovereign mission co-creation.';
    prescription = 'Direct your united energy toward creative enterprise, spiritual mentoring, and building your shared legacy.';
  } else if (combinedScore >= 80) {
    stage = '🔥 Illumination & Surrender';
    stageDesc = 'Ego struggles are giving way to deeper trust. You are learning to see the divine reflection in each other.';
    prescription = 'Practice daily surrender of expectations. Meditate together using 528 Hz heart-opening frequencies.';
  } else if (combinedScore >= 70) {
    stage = '⚡ The Shadow Mirror & Growth Crucible';
    stageDesc = 'Intense catalytic transformation. Lingering defense mechanisms are being brought up for conscious release.';
    prescription = 'Focus on individual self-sovereignty. Do not attempt to fix or chase; allow space for authentic integration.';
  } else {
    stage = '🌱 Early Recognition & Exploration';
    stageDesc = 'A meaningful connection unfolding organically with great potential for mutual support.';
    prescription = 'Build strong foundations of shared values, reliable consistency, and playful shared activities.';
  }

  return {
    score: Math.min(99, Math.max(50, combinedScore)),
    stage,
    stageDesc,
    prescription,
    quizPoints: rawScore
  };
}

export function calculateFullDualComparison(profileA, profileB) {
  const dateA = new Date(profileA.birthYear, profileA.birthMonth - 1, profileA.birthDay);
  const dateB = new Date(profileB.birthYear, profileB.birthMonth - 1, profileB.birthDay);

  // 1. ASTROLOGY CALCULATIONS
  const astroA = calculatePlanetaryPositions(dateA, profileA.birthHour || 12, profileA.birthMinute || 0, profileA.lat, profileA.lng);
  const astroB = calculatePlanetaryPositions(dateB, profileB.birthHour || 12, profileB.birthMinute || 0, profileB.lat, profileB.lng);

  // 2. NUMEROLOGY
  const lpA = calculateLifePath(dateA);
  const lpB = calculateLifePath(dateB);
  const numA = calculateNameNumerology(profileA.name);
  const numB = calculateNameNumerology(profileB.name);
  const numerologyHarmony = getNumerologyHarmonicScore(lpA, lpB);

  // 3. SECRET LANGUAGE
  const secA = getSecretLanguageProfile(profileA.birthMonth, profileA.birthDay);
  const secB = getSecretLanguageProfile(profileB.birthMonth, profileB.birthDay);

  // 4. TAROT BIRTH CARDS
  const tarotA = calculateBirthTarotCards(dateA);
  const tarotB = calculateBirthTarotCards(dateB);

  // --- CROSS-PLANETARY ASPECTS (BI-DIRECTIONAL) ---
  const sunSunAspect = getAspect(astroA.planets.Sun.longitude, astroB.planets.Sun.longitude);
  const moonMoonAspect = getAspect(astroA.planets.Moon.longitude, astroB.planets.Moon.longitude);
  const sunMoonCross1 = getAspect(astroA.planets.Sun.longitude, astroB.planets.Moon.longitude); // Sun A -> Moon B
  const sunMoonCross2 = getAspect(astroB.planets.Sun.longitude, astroA.planets.Moon.longitude); // Sun B -> Moon A
  const venusMarsCross1 = getAspect(astroA.planets.Venus.longitude, astroB.planets.Mars.longitude); // Venus A -> Mars B
  const venusMarsCross2 = getAspect(astroB.planets.Venus.longitude, astroA.planets.Mars.longitude); // Venus B -> Mars A
  const venusVenusAspect = getAspect(astroA.planets.Venus.longitude, astroB.planets.Venus.longitude);
  const mercuryMercuryAspect = getAspect(astroA.planets.Mercury.longitude, astroB.planets.Mercury.longitude);
  const ascendantAspect = getAspect(astroA.planets.Ascendant.longitude, astroB.planets.Ascendant.longitude);
  const jupiterAspect = getAspect(astroA.planets.Jupiter.longitude, astroB.planets.Sun.longitude);
  const saturnAspect = getAspect(astroA.planets.Saturn.longitude, astroB.planets.Sun.longitude);

  // Karmic Node Connections
  const nodeSun1 = getAspect(astroA.planets.NorthNode.longitude, astroB.planets.Sun.longitude);
  const nodeSun2 = getAspect(astroB.planets.NorthNode.longitude, astroA.planets.Sun.longitude);
  const nodeMoon1 = getAspect(astroA.planets.NorthNode.longitude, astroB.planets.Moon.longitude);
  const nodeMoon2 = getAspect(astroB.planets.NorthNode.longitude, astroA.planets.Moon.longitude);
  const nodeVenus1 = getAspect(astroA.planets.NorthNode.longitude, astroB.planets.Venus.longitude);
  const nodeVenus2 = getAspect(astroB.planets.NorthNode.longitude, astroA.planets.Venus.longitude);

  const hasKarmicNodeConnection = [nodeSun1, nodeSun2, nodeMoon1, nodeMoon2, nodeVenus1, nodeVenus2].some(a => ['conjunction', 'harmonious', 'magnetic'].includes(a.type));

  // --- ELEMENTAL ALCHEMY ---
  const elemSun = getElementalAlchemy(astroA.planets.Sun.zodiac.element, astroB.planets.Sun.zodiac.element);
  const elemMoon = getElementalAlchemy(astroA.planets.Moon.zodiac.element, astroB.planets.Moon.zodiac.element);

  // --- HOUSE OVERLAYS ---
  const houseOverlays = calculateHouseOverlays(astroA, astroB, profileA.name, profileB.name);

  // --- COMPOSITE CHART ---
  const compositeChart = calculateCompositeChart(astroA, astroB, lpA, lpB);

  // --- CONFLICT & SHADOW PROTOCOL ---
  const conflictProtocol = generateConflictResolutionProtocol(profileA.name, astroA, profileB.name, astroB);

  // --- 5 MULTI-DIMENSIONAL SCORES ---
  // 1. Emotional & Soul Intimacy (30% weight)
  let emotionalScore = Math.round(
    (elemMoon.score * 0.4) +
    (moonMoonAspect.bonus * 1.2) +
    (sunMoonCross1.bonus * 0.9) +
    (sunMoonCross2.bonus * 0.9) +
    (tarotA.personalityCard.element === tarotB.personalityCard.element ? 8 : 4)
  );
  emotionalScore = Math.min(99, Math.max(55, emotionalScore));

  // 2. Intellectual & Communication (20% weight)
  let intellectScore = Math.round(
    65 +
    (mercuryMercuryAspect.bonus * 1.2) +
    (astroA.planets.Mercury.zodiac.element === astroB.planets.Mercury.zodiac.element ? 12 : 6) +
    (secA.cusp === secB.cusp ? 6 : 2)
  );
  intellectScore = Math.min(99, Math.max(52, intellectScore));

  // 3. Romantic & Physical Chemistry (25% weight)
  let chemistryScore = Math.round(
    58 +
    (venusMarsCross1.bonus * 0.9) +
    (venusMarsCross2.bonus * 0.9) +
    (venusVenusAspect.bonus * 0.5) +
    (elemSun.score * 0.25)
  );
  chemistryScore = Math.min(99, Math.max(56, chemistryScore));

  // 4. Long-Term Stability & Life Building (25% weight)
  let stabilityScore = Math.round(
    (numerologyHarmony.score * 0.5) +
    (sunSunAspect.bonus * 0.8) +
    (saturnStabilityBonus(astroA, astroB) * 0.6) +
    25
  );
  stabilityScore = Math.min(99, Math.max(54, stabilityScore));

  // Overall Cosmic Harmony Index
  const totalScore = Math.round(
    emotionalScore * 0.30 +
    chemistryScore * 0.25 +
    stabilityScore * 0.25 +
    intellectScore * 0.20
  );

  // --- DEDICATED TWIN FLAME RESONANCE ENGINE ---
  let twinFlamePoints = 50; // Baseline soul connection

  // 1. Sun-Moon Yin/Yang Polarity (+16 pts)
  const isSunMoonYinYang = ['conjunction', 'harmonious', 'magnetic'].includes(sunMoonCross1.type) || ['conjunction', 'harmonious', 'magnetic'].includes(sunMoonCross2.type);
  if (isSunMoonYinYang) twinFlamePoints += 15;

  // 2. Venus-Mars Divine Sacred Union (+14 pts)
  const isVenusMarsUnion = ['conjunction', 'harmonious', 'magnetic'].includes(venusMarsCross1.type) || ['conjunction', 'harmonious', 'magnetic'].includes(venusMarsCross2.type);
  if (isVenusMarsUnion) twinFlamePoints += 14;

  // 3. Ascendant Horizon Mirror Axis (+12 pts)
  const isAscendantMirror = ['conjunction', 'magnetic', 'harmonious'].includes(ascendantAspect.type) || (astroA.planets.Ascendant.zodiac.modality === astroB.planets.Ascendant.zodiac.modality);
  if (isAscendantMirror) twinFlamePoints += 12;

  // 4. North Node Karmic Convergence (+15 pts)
  if (hasKarmicNodeConnection) twinFlamePoints += 15;

  // 5. Numerology Life Path Harmonic Alignment (+12 pts)
  if (numerologyHarmony.score >= 90) twinFlamePoints += 12;

  // 6. Same or Complementary Sun/Moon Elements (+8 pts)
  if (elemSun.score >= 90) twinFlamePoints += 8;

  const twinFlameScore = Math.min(99, Math.max(58, twinFlamePoints));

  // Twin Flame Status
  let twinFlameArchetype = "Karmic Growth Catalyst";
  let twinFlameDesc = "A potent transformational connection that brings deep personal lessons and emotional evolution.";
  let twinFlameBadge = "Transformational Catalyst";

  if (twinFlameScore >= 92) {
    twinFlameArchetype = "🔥 Divine Twin Flames & Harmonic Mirror Union";
    twinFlameDesc = "Supreme energetic mirror. You reflect each other's deepest core truths, accelerating spiritual awakening and soul sovereignty.";
    twinFlameBadge = "Divine Twin Flames";
  } else if (twinFlameScore >= 84) {
    twinFlameArchetype = "✨ Sacred Destiny Soulmates & Divine Partners";
    twinFlameDesc = "A profound soul contract marked by instant recognition, deep mutual reverence, and effortless life-building synergy.";
    twinFlameBadge = "Destiny Soulmates";
  } else if (twinFlameScore >= 76) {
    twinFlameArchetype = "🏛️ Cosmic Power Alliance & Visionary Duo";
    twinFlameDesc = "Highly dynamic co-creators. Combining your unique talents allows you to build enterprises, families, and lasting legacies.";
    twinFlameBadge = "Power Alliance";
  } else if (twinFlameScore >= 68) {
    twinFlameArchetype = "⚡ Evolutionary Mirror & Passion Crucible";
    twinFlameDesc = "Electric magnetic attraction with powerful evolutionary friction that rapidly burns away obsolete habits and ego defenses.";
    twinFlameBadge = "Evolutionary Mirror";
  }

  // 6 Key Twin Flame Alignment Markers
  const twinFlameMarkers = [
    {
      title: "☀️/🌙 Yin-Yang Sun-Moon Mirror",
      status: isSunMoonYinYang,
      desc: isSunMoonYinYang ? "Active cross-polarity: One person's conscious identity deeply nurtures the other's emotional subconscious." : "Independent emotional orbits with room for conscious understanding."
    },
    {
      title: "💖 Venus-Mars Sacred Union Magnetism",
      status: isVenusMarsUnion,
      desc: isVenusMarsUnion ? "Strong physical attraction and romantic polarity (Venus-Mars cross connection)." : "Subtle romantic chemistry built through shared experiences."
    },
    {
      title: "🧭 Ascendant Mirror Horizon Axis",
      status: isAscendantMirror,
      desc: isAscendantMirror ? "Complementary rising sign axis: Natural instinctive rapport and physical comfort." : "Distinct personal styles that bring fresh perspectives to the union."
    },
    {
      title: "🗝️ North Node Soul Destiny Alignment",
      status: hasKarmicNodeConnection,
      desc: hasKarmicNodeConnection ? "Past-life karmic convergence: Meeting each other unlocks major destiny milestones." : "Free-will evolutionary journey with self-directed milestones."
    },
    {
      title: "🔢 Life Path Harmonic Family Resonance",
      status: numerologyHarmony.score >= 90,
      desc: numerologyHarmony.note
    },
    {
      title: "🌿 Elemental Synergy Alchemy",
      status: elemSun.score >= 90,
      desc: elemSun.desc
    }
  ];

  const communicationTip = generateCommunicationAndIntimacyAdvice(
    profileA.name, 
    astroA.planets.Mercury.zodiac.sign, 
    astroA.planets.Moon.zodiac.sign, 
    profileB.name, 
    astroB.planets.Mercury.zodiac.sign, 
    astroB.planets.Moon.zodiac.sign
  );

  return {
    profileA,
    profileB,
    scores: {
      overall: totalScore,
      emotional: emotionalScore,
      intellectual: intellectScore,
      chemistry: chemistryScore,
      stability: stabilityScore,
      twinFlame: twinFlameScore
    },
    title: twinFlameArchetype,
    twinFlame: {
      score: twinFlameScore,
      archetype: twinFlameArchetype,
      badge: twinFlameBadge,
      desc: twinFlameDesc,
      markers: twinFlameMarkers,
      telepathyIndex: Math.round((emotionalScore * 0.6) + (twinFlameScore * 0.4)),
      mirrorIndex: Math.round((chemistryScore * 0.5) + (stabilityScore * 0.5))
    },

    // 1. ASTROLOGY COMPARISON & ASPECTS
    astrology: {
      personA: {
        sun: astroA.planets.Sun,
        moon: astroA.planets.Moon,
        ascendant: astroA.planets.Ascendant,
        mercury: astroA.planets.Mercury,
        venus: astroA.planets.Venus,
        mars: astroA.planets.Mars,
        jupiter: astroA.planets.Jupiter,
        saturn: astroA.planets.Saturn,
        northNode: astroA.planets.NorthNode,
        chiron: astroA.planets.Chiron
      },
      personB: {
        sun: astroB.planets.Sun,
        moon: astroB.planets.Moon,
        ascendant: astroB.planets.Ascendant,
        mercury: astroB.planets.Mercury,
        venus: astroB.planets.Venus,
        mars: astroB.planets.Mars,
        jupiter: astroB.planets.Jupiter,
        saturn: astroB.planets.Saturn,
        northNode: astroB.planets.NorthNode,
        chiron: astroB.planets.Chiron
      },
      aspects: [
        { pair: `${profileA.name}'s Sun ⟷ ${profileB.name}'s Sun`, aspect: sunSunAspect.name, symbol: sunSunAspect.symbol, desc: sunSunAspect.desc, orb: sunSunAspect.orb, impact: 'Core Willpower & Ego Alignment' },
        { pair: `${profileA.name}'s Moon ⟷ ${profileB.name}'s Moon`, aspect: moonMoonAspect.name, symbol: moonMoonAspect.symbol, desc: moonMoonAspect.desc, orb: moonMoonAspect.orb, impact: 'Emotional Sanctuary & Moods' },
        { pair: `${profileA.name}'s Sun ⟷ ${profileB.name}'s Moon (Yin-Yang)`, aspect: sunMoonCross1.name, symbol: sunMoonCross1.symbol, desc: sunMoonCross1.desc, orb: sunMoonCross1.orb, impact: 'Conscious Will to Subconscious Care' },
        { pair: `${profileB.name}'s Sun ⟷ ${profileA.name}'s Moon (Yin-Yang)`, aspect: sunMoonCross2.name, symbol: sunMoonCross2.symbol, desc: sunMoonCross2.desc, orb: sunMoonCross2.orb, impact: 'Mutual Emotional Nurturing' },
        { pair: `${profileA.name}'s Venus ⟷ ${profileB.name}'s Mars`, aspect: venusMarsCross1.name, symbol: venusMarsCross1.symbol, desc: venusMarsCross1.desc, orb: venusMarsCross1.orb, impact: 'Romantic & Physical Chemistry' },
        { pair: `${profileB.name}'s Venus ⟷ ${profileA.name}'s Mars`, aspect: venusMarsCross2.name, symbol: venusMarsCross2.symbol, desc: venusMarsCross2.desc, orb: venusMarsCross2.orb, impact: 'Erotic Magnetism & Passion' },
        { pair: `${profileA.name}'s Mercury ⟷ ${profileB.name}'s Mercury`, aspect: mercuryMercuryAspect.name, symbol: mercuryMercuryAspect.symbol, desc: mercuryMercuryAspect.desc, orb: mercuryMercuryAspect.orb, impact: 'Communication & Intellectual Pace' },
        { pair: `${profileA.name}'s Jupiter ⟷ ${profileB.name}'s Sun`, aspect: jupiterAspect.name, symbol: jupiterAspect.symbol, desc: jupiterAspect.desc, orb: jupiterAspect.orb, impact: 'Optimism, Luck & Mutual Expansion' },
        { pair: `${profileA.name}'s Saturn ⟷ ${profileB.name}'s Sun`, aspect: saturnAspect.name, symbol: saturnAspect.symbol, desc: saturnAspect.desc, orb: saturnAspect.orb, impact: 'Loyalty, Commitment & Longevity' }
      ]
    },

    // 2. HOUSE OVERLAYS
    houseOverlays,

    // 3. COMPOSITE CHART & THIRD ENERGY
    compositeChart,

    // 4. CONFLICT & SHADOW PROTOCOL
    conflictProtocol,

    // 5. SECRET LANGUAGE COMPARISON
    secretLanguage: {
      personA: secA,
      personB: secB,
      synthesis: `${profileA.name} as "${secA.title}" meets ${profileB.name} as "${secB.title}". ${elemSun.desc}`,
      strengthsCombined: [...new Set([...secA.strengths.slice(0, 3), ...secB.strengths.slice(0, 3)])],
      shadowsToWatch: [...new Set([...secA.weaknesses.slice(0, 2), ...secB.weaknesses.slice(0, 2)])]
    },

    // 6. NUMEROLOGY COMPARISON
    numerology: {
      personA: { lifePath: lpA, expression: numA.expression, soulUrge: numA.soulUrge, personality: numA.personality },
      personB: { lifePath: lpB, expression: numB.expression, soulUrge: numB.soulUrge, personality: numB.personality },
      lifePathHarmony: numerologyHarmony.score,
      lifePathNote: numerologyHarmony.note
    },

    // 7. TAROT COMPARISON
    tarot: {
      personA: tarotA,
      personB: tarotB,
      synergyArcana: `${tarotA.personalityCard.name} & ${tarotB.personalityCard.name}`,
      reading: `When ${tarotA.personalityCard.name} unites with ${tarotB.personalityCard.name}, the collective soul mission becomes one of conscious co-creation, balancing ${tarotA.personalityCard.element} with ${tarotB.personalityCard.element}.`
    },

    // 8. KARMA & DESTINY
    karma: {
      personA: { northNode: astroA.planets.NorthNode, chiron: astroA.planets.Chiron },
      personB: { northNode: astroB.planets.NorthNode, chiron: astroB.planets.Chiron },
      soulContract: hasKarmicNodeConnection 
        ? "🌟 Active Karmic Node Bond: You have crossed paths in prior incarnations to resolve evolutionary soul missions." 
        : "✨ Sovereign Present-Life Creation: Your connection is built primarily on free-will choices and conscious partnership."
    },

    // 9. ACOUSTIC PRESCRIPTION
    sharedSoundscape: {
      hz: elemSun.score >= 90 ? 528 : (elemMoon.score >= 90 ? 639 : 432),
      title: elemSun.score >= 90 ? "528 Hz Miracles & Transformation" : "639 Hz Harmonious Relationship & Heart Resonance",
      binauralBeat: "Schumann Resonance (7.83 Hz Earth Frequency)"
    },

    // 10. POTENTIAL PARTNER ALIGNMENT & DEEP COMPATIBILITY PILLARS
    partnerAlignment: {
      alignmentScore: totalScore,
      connectionTier: twinFlameArchetype,
      pillars: [
        {
          name: 'Emotional Sanctuary & Empathy',
          icon: '🌊',
          score: Math.min(99, Math.max(65, elemMoon.score + (sunMoonCross1.bonus > 15 ? 10 : 0))),
          desc: sunMoonCross1.bonus > 15 
            ? 'Effortless emotional transparency — you intuitively sense when the other needs tenderness or silence.'
            : 'Deep emotional empathy developed through active listening and emotional validation.'
        },
        {
          name: 'Romantic Spark & Erotic Chemistry',
          icon: '🔥',
          score: Math.min(99, Math.max(60, (venusMarsCross1.bonus + venusMarsCross2.bonus) * 1.8)),
          desc: venusMarsCross1.bonus > 15 || venusMarsCross2.bonus > 15
            ? 'High electric polarity — magnetic physical attraction and vibrant romantic playfulness.'
            : 'Warm, affectionate chemistry that grows steadily through shared sensual appreciation.'
        },
        {
          name: 'Intellectual Rhythm & Banter',
          icon: '💨',
          score: Math.min(99, Math.max(60, mercuryMercuryAspect.bonus * 3.5 + 20)),
          desc: mercuryMercuryAspect.bonus > 15
            ? 'Telepathic flow — effortless conversation, hilarious inside jokes, and shared curiosity.'
            : 'Stimulating dialogue where diverse perspectives sharpen each other’s worldview.'
        },
        {
          name: 'Long-Term Values & Empire Building',
          icon: '🌿',
          score: Math.min(99, Math.max(65, (saturnAspect.bonus + jupiterAspect.bonus) * 2 + 30)),
          desc: saturnAspect.bonus > 10
            ? 'Bedrock reliability — mutual dedication to financial stability, family safety, and integrity.'
            : 'Creative flexibility — navigating life changes through mutual respect and adaptability.'
        },
        {
          name: 'Karmic Evolution & Soul Growth',
          icon: '✨',
          score: Math.min(99, Math.max(70, hasKarmicNodeConnection ? 95 : 82)),
          desc: hasKarmicNodeConnection
            ? 'Profound soul agreement — this connection serves as an evolutionary mirror to heal old ancestral patterns.'
            : 'Conscious co-creation — empowering one another to step boldly into your highest potential.'
        }
      ],
      greenFlags: [
        {
          title: 'Immediate Soul Recognition',
          desc: `Natural ease between ${profileA.name} and ${profileB.name}; conversation flows with minimal awkwardness.`
        },
        {
          title: 'Constructive Mirroring',
          desc: 'Differences inspire mutual curiosity and growth rather than defensive ego battles.'
        },
        {
          title: 'Shared Vision & Protection',
          desc: 'Instinctive urge to celebrate each other’s victories and provide a safe shelter during hardship.'
        }
      ],
      redFlagsToWatch: [
        {
          title: 'Unspoken Expectations',
          desc: 'Assuming the other person can read your mind; practice expressing emotional needs directly.'
        },
        {
          title: 'Pacing & Independence Balance',
          desc: 'Allowing space for individual passions so the bond stays magnetic rather than suffocating.'
        },
        {
          title: 'Stress Response Friction',
          desc: 'When tired, one may retreat into silence while the other seeks immediate resolution.'
        }
      ],
      alignmentVerdict: totalScore >= 90
        ? '🌟 Extraordinary Cosmic Match: Rare vibrational synergy across emotional, mental, and spiritual planes.'
        : totalScore >= 80
        ? '💖 Highly Harmonious & Magnetic: Deep compatibility with rich opportunities for conscious co-creation.'
        : '⚡ Dynamic Growth Catalyst: High-chemistry connection with valuable life lessons and mutual evolution.'
    },

    communicationTip: communicationTip
  };
}

function saturnStabilityBonus(astroA, astroB) {
  const saturnTrine = getAspect(astroA.planets.Saturn.longitude, astroB.planets.Sun.longitude);
  return saturnTrine.bonus > 0 ? 15 : 5;
}
