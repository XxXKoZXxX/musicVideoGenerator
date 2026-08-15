// Deep Multi-Domain Esoteric Oracle & Intelligent Synthesis Engine

import { calculatePlanetaryPositions } from './astrologyEngine';
import { calculateLifePath, calculateNameNumerology } from './numerologyEngine';
import { getSecretLanguageProfile } from '../data/secretLanguageData';
import { calculateBirthTarotCards, getRandomTarotCards } from './tarotEngine';

export const ORACLE_SUGGESTIONS = [
  { category: 'Purpose', prompt: "What is my highest soul purpose and career destiny in this lifetime?" },
  { category: 'Love', prompt: "What does my Venus and Moon placement reveal about my soulmate attraction?" },
  { category: 'Shadow', prompt: "What hidden subconscious shadows or fear patterns am I meant to overcome?" },
  { category: 'Wealth', prompt: "How can I align my Life Path energy with financial abundance and prosperity?" },
  { category: 'Karma', prompt: "What past-life karmic lessons are indicated by my North Node and Chiron?" },
  { category: 'Frequency', prompt: "Which sacred sound frequencies should I listen to for emotional healing?" },
  { category: 'Tarot', prompt: "Give me a 3-card Tarot reading for my current life path and next steps." }
];

export function generateOracleResponse(query, profile) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astro = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const lifePath = calculateLifePath(dateObj);
  const nameNum = calculateNameNumerology(profile.name);
  const secData = getSecretLanguageProfile(profile.birthMonth, profile.birthDay);
  const birthCards = calculateBirthTarotCards(dateObj);

  const q = query.toLowerCase();

  // 1. TAROT SPREAD / CARD INQUIRY
  if (q.includes('tarot') || q.includes('card') || q.includes('spread') || q.includes('draw')) {
    const cards = getRandomTarotCards(3);
    return {
      title: "🔮 Sacred 3-Card Oracle Tarot Spread",
      readingType: "Tarot Divination",
      cards: cards,
      answer: `Here is your contextual 3-card divination for "${query}":\n\n` +
        `1. **Past / Foundation:** ${cards[0].name} (${cards[0].isReversed ? 'Reversed' : 'Upright'})\n` +
        `   → ${cards[0].isReversed ? cards[0].reversed : cards[0].upright}\n\n` +
        `2. **Present Focus:** ${cards[1].name} (${cards[1].isReversed ? 'Reversed' : 'Upright'})\n` +
        `   → ${cards[1].isReversed ? cards[1].reversed : cards[1].upright}\n\n` +
        `3. **Future / Outcome:** ${cards[2].name} (${cards[2].isReversed ? 'Reversed' : 'Upright'})\n` +
        `   → ${cards[2].isReversed ? cards[2].reversed : cards[2].upright}\n\n` +
        `**Oracle Insight for ${profile.name}:** Your Birth Tarot Card (${birthCards.personalityCard.name}) confirms that the central energy of "${cards[1].keywords[0]}" is your key to breakthrough right now.`,
      tags: ['Tarot Spread', 'Divination', 'Soul Guidance']
    };
  }

  // 2. LOVE, ROMANCE & RELATIONSHIPS
  if (q.includes('love') || q.includes('relationship') || q.includes('partner') || q.includes('soulmate') || q.includes('marriage') || q.includes('dating')) {
    const venusSign = astro.planets.Venus.zodiac.sign;
    const moonSign = astro.planets.Moon.zodiac.sign;
    const sunSign = astro.planets.Sun.zodiac.sign;

    return {
      title: "💖 Love, Romance & Sacred Union Synthesis",
      readingType: "Synastry & Venusian Alchemy",
      answer: `For you, **${profile.name}**, romance is deeply governed by your **Venus in ${venusSign}** and **Moon in ${moonSign}**:\n\n` +
        `• **Your Love Language & Attraction (Venus in ${venusSign}):** You crave authentic, elevated partnerships that honor your individuality while cultivating passionate loyalty. Surface-level flattery will never satisfy your heart—you require intellectual depth and energetic resonance.\n\n` +
        `• **Emotional Safety (Moon in ${moonSign}):** In intimate spaces, you need partners who honor your emotional rhythms without making you feel rushed or judged.\n\n` +
        `• **Soulmate Element Match:** As a **${sunSign} (${astro.planets.Sun.zodiac.element} element)**, you thrive most with partners carrying complementary Air and Fire sparks or stabilizing Earth anchors.\n\n` +
        `• **Secret Language Love Note:** Your day archetype (*"${secData.title}"*) warns against closing your heart when feeling misunderstood. Your greatest love power is vulnerability combined with clear boundaries.`,
      tags: ['Love & Romance', `Venus in ${venusSign}`, 'Soulmate Resonance']
    };
  }

  // 3. CAREER, MONEY, WEALTH & SUCCESS
  if (q.includes('career') || q.includes('money') || q.includes('wealth') || q.includes('job') || q.includes('finance') || q.includes('business') || q.includes('success')) {
    const sunSign = astro.planets.Sun.zodiac.sign;
    const marsSign = astro.planets.Mars.zodiac.sign;
    const jupiterSign = astro.planets.Jupiter.zodiac.sign;

    return {
      title: "🏛️ Prosperity, Career & Life Calling Mastery",
      readingType: "Vocation & Abundance Matrix",
      answer: `Here is your tailored prosperity blueprint, **${profile.name}**:\n\n` +
        `• **Sun in ${sunSign} Purpose:** Your core drive shines through authoritative creativity and persistent strategic vision.\n\n` +
        `• **Life Path ${lifePath} Leadership:** Your numerological vibration is built for sovereign mastery. You are not meant to follow cookie-cutter templates—you achieve immense wealth when you innovate and create systems that reflect your unique mastery.\n\n` +
        `• **Action Drive (Mars in ${marsSign}):** When executing business strategies, your Mars gives you relentless drive. Beware of scattering energy across too many projects; pick one central vision and pour your focus into it.\n\n` +
        `• **Abundance Doorway (Jupiter in ${jupiterSign}):** Universal luck flows into your life through continuous learning, ethical service, and sharing knowledge generously.\n\n` +
        `• **Secret Language Career Secret:** Your archetype *"${secData.title}"* excels in roles requiring visionary strategy, storytelling, and high-trust leadership.`,
      tags: ['Career & Wealth', `Life Path ${lifePath}`, `Mars in ${marsSign}`]
    };
  }

  // 4. KARMA, PAST LIVES, CHIRON & SOUL DESTINY
  if (q.includes('karma') || q.includes('past life') || q.includes('destiny') || q.includes('purpose') || q.includes('node') || q.includes('chiron') || q.includes('wound')) {
    const northNodeSign = astro.planets.NorthNode.zodiac.sign;
    const chironSign = astro.planets.Chiron.zodiac.sign;

    return {
      title: "🗝️ Past-Life Karma & Evolutionary Soul Contract",
      readingType: "Karmic Astrology & Chiron Gift",
      answer: `Your evolutionary soul mission, **${profile.name}**:\n\n` +
        `• **North Node in ${northNodeSign} (Your Destiny Vector):** In past incarnations, you mastered familiar comfort zones. In this lifetime, your soul chose to incarnate to step boldly into **${northNodeSign}** themes—embracing personal courage, self-trust, and conscious spiritual evolution.\n\n` +
        `• **Chiron in ${chironSign} (The Wounded Healer):** Your deepest sacred sensitivity lies in ${chironSign}. The exact pain or self-doubt you have struggled with is not a flaw—it is the medicine you are meant to teach and heal others with.\n\n` +
        `• **Secret Language Meditation:** "*${secData.meditation}*"\n\n` +
        `• **Core Evolutionary Directive:** Trust that every challenge you have endured was cosmic training for your highest soul sovereignty.`,
      tags: ['Karmic Destiny', `North Node in ${northNodeSign}`, 'Chiron Healing']
    };
  }

  // 5. SHADOW WORK, ANXIETY & EMOTIONAL HEALING
  if (q.includes('shadow') || q.includes('fear') || q.includes('anxiety') || q.includes('heal') || q.includes('stress') || q.includes('weakness') || q.includes('challenge')) {
    return {
      title: "🌿 Sacred Shadow Integration & Inner Sanctuary",
      readingType: "Esoteric Shadow Work",
      answer: `Insight for integrating your subconscious shadow, **${profile.name}**:\n\n` +
        `• **Primary Shadow Patterns:** Your Secret Language archetype identifies these recurring blindspots: **${secData.weaknesses.join(', ')}**.\n\n` +
        `• **The Transmutation Key:** Shadow traits are simply unintegrated gifts in disguise. For instance, when you feel anxious or restless, your soul is signaling that your creative energy needs a physical outlet or creative project.\n\n` +
        `• **Chakra & Frequency Prescription:** We recommend listening to **396 Hz (Fear Liberation)** and **528 Hz (Cellular Transformation)** in the Soundscape Studio layered with **Schumann (7.83 Hz)** binaural beats.\n\n` +
        `• **Affirmation for Today:** "*I embrace all facets of my being with unconditional love. My perceived weaknesses are gateways to immense spiritual power.*"`,
      tags: ['Shadow Work', 'Emotional Healing', 'Frequency Alignment']
    };
  }

  // 6. ASTROLOGY & PLANETS (SUN, MOON, ASCENDANT)
  if (q.includes('sun') || q.includes('moon') || q.includes('ascendant') || q.includes('rising') || q.includes('chart') || q.includes('planet') || q.includes('horoscope')) {
    const sun = astro.planets.Sun;
    const moon = astro.planets.Moon;
    const asc = astro.planets.Ascendant;

    return {
      title: "☀️ The Sacred Trinity: Sun, Moon & Ascendant Blueprint",
      readingType: "Natal Astrology Synthesis",
      answer: `Here is your complete Big Three synthesis, **${profile.name}**:\n\n` +
        `1. **☀️ Sun in ${sun.zodiac.sign} (${sun.zodiac.element} / ${sun.zodiac.modality}):** Represents your conscious identity, life vitality, and outward expression. You shine when expressing authentic ${sun.zodiac.element} mastery.\n\n` +
        `2. **🌙 Moon in ${moon.zodiac.sign} (${moon.zodiac.element} in House ${moon.house}):** Governs your private emotional inner world, instinctive reactions, and what makes you feel secure.\n\n` +
        `3. **✨ Ascendant in ${asc.zodiac.sign}:** Your rising sign is the cosmic lens through which you interact with reality. It gives you a commanding, magnetic presence that leaves an unforgettable impression.\n\n` +
        `• **Planetary Ruler:** Your chart is guided by planetary alignments that favor bold creative sovereignty and intuitive foresight.`,
      tags: [`Sun in ${sun.zodiac.sign}`, `Moon in ${moon.zodiac.sign}`, `Ascendant in ${asc.zodiac.sign}`]
    };
  }

  // 7. FREQUENCIES & SOUNDSCAPES
  if (q.includes('frequency') || q.includes('sound') || q.includes('hertz') || q.includes('hz') || q.includes('binaural') || q.includes('music')) {
    return {
      title: "🎧 Personal Soundscape & Acoustic Prescription",
      readingType: "Acoustic Bio-Resonance",
      answer: `Tuned to your **${astro.planets.Sun.zodiac.element} element** and **Life Path ${lifePath}**:\n\n` +
        `• **Your Elemental Core Tone:** **${astro.planets.Sun.zodiac.element === 'Fire' ? '528 Hz (Vitality)' : astro.planets.Sun.zodiac.element === 'Earth' ? '432 Hz (Universal Peace)' : astro.planets.Sun.zodiac.element === 'Air' ? '639 Hz (Heart Harmony)' : '741 Hz (Detox & Intuition)'}**.\n\n` +
        `• **Binaural Entrainment:** Use **10 Hz Alpha** for deep daytime focus and **2.5 Hz Delta** for sound sleep and HGH cellular repair.\n\n` +
        `• **Cosmic Tone:** **136.1 Hz (Sacred OM)** balances your nervous system and grounds your electromagnetic field.`,
      tags: ['Soundscape Prescription', 'Solfeggio Healing', 'Binaural Waves']
    };
  }

  // 8. GENERAL HIGH-INTELLIGENCE ESOTERIC SYNTHESIS (FALLBACK WITH DEEP PERSONALIZATION)
  return {
    title: `🌌 Cosmic Oracle Synthesis for "${query}"`,
    readingType: "Comprehensive Esoteric Wisdom",
    answer: `Reflecting upon your cosmic blueprint, **${profile.name}**:\n\n` +
      `• **Astrological Resonance:** With your **Sun in ${astro.planets.Sun.zodiac.sign}**, **Moon in ${astro.planets.Moon.zodiac.sign}**, and **Ascendant in ${astro.planets.Ascendant.zodiac.sign}**, the question you ask touches upon your core desire for balance between outward ambition and inner emotional truth.\n\n` +
      `• **Numerological Vibration:** Operating under **Life Path ${lifePath}** and Destiny Number **${nameNum.expression}**, your greatest strength is your ability to transform visionary ideas into tangible reality.\n\n` +
      `• **Secret Language Archetype (*"${secData.title}"*):** Remember your core meditation: "*${secData.meditation}*". When navigating decisions, lean into your strengths (${secData.strengths.slice(0, 2).join(' & ')}) rather than acting from self-doubt.\n\n` +
      `• **Oracle Guidance:** What you are seeking is already aligning for you. Maintain your focus, honor your energetic boundaries, and take inspired daily action.`,
    tags: ['Oracle Synthesis', `Life Path ${lifePath}`, `Sun in ${astro.planets.Sun.zodiac.sign}`]
  };
}
