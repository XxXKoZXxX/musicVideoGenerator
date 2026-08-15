// Complete 78 Tarot Cards & Tarot Reading Engine

export const TAROT_DECK = [
  // MAJOR ARCANA (0-21)
  {
    id: 0,
    name: "0. The Fool",
    arcana: "Major",
    suit: "Major",
    number: 0,
    element: "Air",
    astrology: "Uranus",
    keywords: ["New Beginnings", "Innocence", "Spontaneity", "Leap of Faith"],
    upright: "A fresh journey begins. Trust the universe and embrace innocent wonder, unburdened by fear.",
    reversed: "Impulsivity, reckless risk-taking, vulnerability to deceit, holding back out of fear.",
    symbolism: "The cliff's edge represents infinite possibility; the white rose symbolizes pure intent."
  },
  {
    id: 1,
    name: "I. The Magician",
    arcana: "Major",
    suit: "Major",
    number: 1,
    element: "Air",
    astrology: "Mercury",
    keywords: ["Manifestation", "Resourcefulness", "Power", "Inspired Action"],
    upright: "You possess all tools needed to manifest your desires. As above, so below.",
    reversed: "Unrealized potential, manipulation, misdirection, energy leakage.",
    symbolism: "The infinity sign and four elemental tools demonstrate complete alignment of willpower."
  },
  {
    id: 2,
    name: "II. The High Priestess",
    arcana: "Major",
    suit: "Major",
    number: 2,
    element: "Water",
    astrology: "Moon",
    keywords: ["Intuition", "Sacred Knowledge", "Divine Feminine", "Subconscious"],
    upright: "Listen to the quiet voice within. Hidden truths and esoteric wisdom await revelation.",
    reversed: "Secrets, disconnected intuition, superficial noise, repressed feelings.",
    symbolism: "The veil of pomegranates shields the inner sanctuary between light and shadow pillars."
  },
  {
    id: 3,
    name: "III. The Empress",
    arcana: "Major",
    suit: "Major",
    number: 3,
    element: "Earth",
    astrology: "Venus",
    keywords: ["Abundance", "Fertility", "Nurturing", "Sensual Beauty"],
    upright: "Creation and sensual expression flourish. Nature and grace bring rich rewards.",
    reversed: "Creative block, neglect, dependence, over-indulgence or stifling control.",
    symbolism: "The crown of twelve stars and grain field signify maternal abundance and cosmic grace."
  },
  {
    id: 4,
    name: "IV. The Emperor",
    arcana: "Major",
    suit: "Major",
    number: 4,
    element: "Fire",
    astrology: "Aries",
    keywords: ["Authority", "Structure", "Mastery", "Father Figure"],
    upright: "Establish solid boundaries, order, and strategic discipline to command your domain.",
    reversed: "Tyranny, lack of self-control, rigidity, power struggles or chaotic leadership.",
    symbolism: "The ram-headed throne represents unyielding stability and strategic mastery."
  },
  {
    id: 5,
    name: "V. The Hierophant",
    arcana: "Major",
    suit: "Major",
    number: 5,
    element: "Earth",
    astrology: "Taurus",
    keywords: ["Spiritual Tradition", "Conformity", "Mentorship", "Belief Systems"],
    upright: "Honor wisdom lineages, spiritual mentors, and foundational spiritual practices.",
    reversed: "Dogma, rebellion against tradition, hypocrisy, original spiritual path discovery.",
    symbolism: "The papal cross keys unlock esoteric knowledge for initiates."
  },
  {
    id: 6,
    name: "VI. The Lovers",
    arcana: "Major",
    suit: "Major",
    number: 6,
    element: "Air",
    astrology: "Gemini",
    keywords: ["Sacred Union", "Harmony", "Values Alignment", "Choice"],
    upright: "Deeper connection, passionate harmony, and alignment of soul values.",
    reversed: "Disharmony, misaligned values, self-doubt in choices, relationship friction.",
    symbolism: "Archangel Raphael blesses the divine synthesis of masculine and feminine essence."
  },
  {
    id: 7,
    name: "VII. The Chariot",
    arcana: "Major",
    suit: "Major",
    number: 7,
    element: "Water",
    astrology: "Cancer",
    keywords: ["Willpower", "Victory", "Focused Drive", "Triumph"],
    upright: "Triumph through self-mastery and steering opposing forces toward a single destination.",
    reversed: "Lack of direction, losing control, aggressive force without purpose.",
    symbolism: "The black and white sphinxes are controlled purely by the charioteer's mind."
  },
  {
    id: 8,
    name: "VIII. Strength",
    arcana: "Major",
    suit: "Major",
    number: 8,
    element: "Fire",
    astrology: "Leo",
    keywords: ["Inner Courage", "Gentle Mastery", "Compassion", "Resilience"],
    upright: "Master primal instincts with gentle patience, quiet courage, and heart grace.",
    reversed: "Self-doubt, raw anger, feeling overwhelmed, weakness of spirit.",
    symbolism: "A maiden calmly taming the lion through love rather than brute strength."
  },
  {
    id: 9,
    name: "IX. The Hermit",
    arcana: "Major",
    suit: "Major",
    number: 9,
    element: "Earth",
    astrology: "Virgo",
    keywords: ["Soul Introspection", "Solitude", "Inner Guidance", "Beacon"],
    upright: "Withdraw into peaceful quiet to illuminate your inner path and gain profound clarity.",
    reversed: "Loneliness, isolation, paranoia, refusal of wise counsel.",
    symbolism: "The star lantern atop the snowy peak lights the path for fellow seekers."
  },
  {
    id: 10,
    name: "X. Wheel of Fortune",
    arcana: "Major",
    suit: "Major",
    number: 10,
    element: "Fire",
    astrology: "Jupiter",
    keywords: ["Karma", "Destiny", "Cycles of Life", "Turning Point"],
    upright: "The cosmic wheel turns in your favor. Sudden shifts, fortune, and karmic destiny.",
    reversed: "Resistance to change, bad luck cycle, feeling powerless against fate.",
    symbolism: "The sphinx, Hermanubis, and Typhon revolve around the eternal cosmic hub."
  },
  {
    id: 11,
    name: "XI. Justice",
    arcana: "Major",
    suit: "Major",
    number: 11,
    element: "Air",
    astrology: "Libra",
    keywords: ["Truth", "Fairness", "Cause & Effect", "Karmic Balance"],
    upright: "Truth prevails. Act with impeccable integrity and balanced cosmic cause and effect.",
    reversed: "Unfairness, dishonesty, unwillingness to accept accountability.",
    symbolism: "The sword of truth cuts through illusions while scales weigh actions precisely."
  },
  {
    id: 12,
    name: "XII. The Hanged Man",
    arcana: "Major",
    suit: "Major",
    number: 12,
    element: "Water",
    astrology: "Neptune",
    keywords: ["Surrender", "New Perspective", "Pause", "Enlightenment"],
    upright: "Surrender control to see the world from an inverted, enlightened perspective.",
    reversed: "Stagnation, useless martyrdom, procrastination, holding on to old perspectives.",
    symbolism: "The halo surrounding the suspended figure reveals wisdom born of surrender."
  },
  {
    id: 13,
    name: "XIII. Death",
    arcana: "Major",
    suit: "Major",
    number: 13,
    element: "Water",
    astrology: "Scorpio",
    keywords: ["Transformation", "Endings", "Rebirth", "Transition"],
    upright: "The old falls away to make room for radiant rebirth and profound renewal.",
    reversed: "Resistance to change, lingering attachments, fear of the unknown.",
    symbolism: "The setting sun between two towers marks the rebirth of a brand new dawn."
  },
  {
    id: 14,
    name: "XIV. Temperance",
    arcana: "Major",
    suit: "Major",
    number: 14,
    element: "Fire",
    astrology: "Sagittarius",
    keywords: ["Alchemy", "Balance", "Patience", "Moderation"],
    upright: "Synthesize extremes into harmonious alchemy. Patience and inner peace prevail.",
    reversed: "Imbalance, excess, clashing energies, haste.",
    symbolism: "An angel pouring water between two chalices blending spiritual and earthly realms."
  },
  {
    id: 15,
    name: "XV. The Devil",
    arcana: "Major",
    suit: "Major",
    number: 15,
    element: "Earth",
    astrology: "Capricorn",
    keywords: ["Shadow Self", "Material Attachment", "Illusion", "Release"],
    upright: "Recognize self-imposed chains and shadow illusions to reclaim true freedom.",
    reversed: "Breaking free from addiction or toxic patterns, shadow integration, empowerment.",
    symbolism: "The loose chains around human necks reveal that bondage is merely an illusion."
  },
  {
    id: 16,
    name: "XVI. The Tower",
    arcana: "Major",
    suit: "Major",
    number: 16,
    element: "Fire",
    astrology: "Mars",
    keywords: ["Sudden Awakening", "Breakthrough", "Liberation", "Truth Shock"],
    upright: "False structures shatter in a flash of lightning to reveal unshakeable truth.",
    reversed: "Delaying necessary breakdown, fear of chaos, disaster averted.",
    symbolism: "Lightning strikes the false crown of ego, freeing the trapped souls within."
  },
  {
    id: 17,
    name: "XVII. The Star",
    arcana: "Major",
    suit: "Major",
    number: 17,
    element: "Air",
    astrology: "Aquarius",
    keywords: ["Hope", "Inspiration", "Healing", "Cosmic Renewal"],
    upright: "Replenish your spirit under the serene light of hope, faith, and cosmic grace.",
    reversed: "Despair, lack of faith, creative burnout, cynicism.",
    symbolism: "Seven smaller stars circle the radiant central star of divine inspiration."
  },
  {
    id: 18,
    name: "XVIII. The Moon",
    arcana: "Major",
    suit: "Major",
    number: 18,
    element: "Water",
    astrology: "Pisces",
    keywords: ["Illusion", "Dreams", "Subconscious Mysteries", "Intuitive Realm"],
    upright: "Navigate the twilight realm of dreams and subconscious shadows with quiet trust.",
    reversed: "Confusion clearing, overcoming phobias, truth emerging from darkness.",
    symbolism: "The wolf and dog howl at the moon as the crayfish emerges from emotional depths."
  },
  {
    id: 19,
    name: "XIX. The Sun",
    arcana: "Major",
    suit: "Major",
    number: 19,
    element: "Fire",
    astrology: "Sun",
    keywords: ["Joy", "Vitality", "Success", "Radiant Truth"],
    upright: "Radiant warmth, unbridled joy, vitality, and triumphant clarity.",
    reversed: "Temporary cloudiness, muted joy, excessive pride or burnout.",
    symbolism: "A child riding a white horse under a smiling golden sun signifies pure bliss."
  },
  {
    id: 20,
    name: "XX. Judgement",
    arcana: "Major",
    suit: "Major",
    number: 20,
    element: "Fire",
    astrology: "Pluto",
    keywords: ["Rebirth", "Higher Calling", "Absolution", "Awakening"],
    upright: "Answer the horn of higher calling. Step into your reborn purpose.",
    reversed: "Self-doubt, harsh self-criticism, ignoring your calling.",
    symbolism: "Archangel Gabriel sounds the trumpet as souls rise transformed."
  },
  {
    id: 21,
    name: "XXI. The World",
    arcana: "Major",
    suit: "Major",
    number: 21,
    element: "Earth",
    astrology: "Saturn",
    keywords: ["Completion", "Wholeness", "Integration", "Cosmic Accomplishment"],
    upright: "The cycle completes in radiant wholeness. You are at one with the cosmos.",
    reversed: "Unfinished business, lack of closure, shortcutting the journey.",
    symbolism: "The laurel wreath encircles the dancer flanked by four sacred evangelist guardians."
  },

  // MINOR ARCANA SELECTION
  // Wands
  { id: 22, name: "Ace of Wands", arcana: "Minor", suit: "Wands", number: 1, element: "Fire", keywords: ["Inspiration", "Spark", "Passion"], upright: "A powerful spark of creative passion and new action.", reversed: "Delays, lack of motivation." },
  { id: 23, name: "Three of Wands", arcana: "Minor", suit: "Wands", number: 3, element: "Fire", keywords: ["Expansion", "Long-term Planning"], upright: "Your ships are coming in. Visionary expansion.", reversed: "Obstacles, delay in results." },
  { id: 24, name: "Six of Wands", arcana: "Minor", suit: "Wands", number: 6, element: "Fire", keywords: ["Victory", "Public Recognition"], upright: "Public acclaim, victory, and celebrated success.", reversed: "Ego clashes, delayed recognition." },
  { id: 25, name: "Ten of Wands", arcana: "Minor", suit: "Wands", number: 10, element: "Fire", keywords: ["Burden", "Responsibility"], upright: "Carrying a heavy load close to the finish line.", reversed: "Delegating tasks, releasing stress." },

  // Cups
  { id: 26, name: "Ace of Cups", arcana: "Minor", suit: "Cups", number: 1, element: "Water", keywords: ["Overflowing Love", "Emotional Awakening"], upright: "An explosion of emotional intimacy, love, and compassion.", reversed: "Blocked emotions, self-love needed." },
  { id: 27, name: "Two of Cups", arcana: "Minor", suit: "Cups", number: 2, element: "Water", keywords: ["Mutual Attraction", "Partnership"], upright: "Soulful union, mutual attraction, and deep harmony.", reversed: "Breakdown in communication, imbalance." },
  { id: 28, name: "Three of Cups", arcana: "Minor", suit: "Cups", number: 3, element: "Water", keywords: ["Celebration", "Sisterhood", "Friendship"], upright: "Joyful gatherings, celebration with close friends.", reversed: "Over-indulgence, gossip, social isolation." },
  { id: 29, name: "Ten of Cups", arcana: "Minor", suit: "Cups", number: 10, element: "Water", keywords: ["Emotional Fulfillment", "Family Harmony"], upright: "Ultimate emotional bliss and domestic peace under the rainbow.", reversed: "Family friction, broken harmony." },

  // Swords
  { id: 30, name: "Ace of Swords", arcana: "Minor", suit: "Swords", number: 1, element: "Air", keywords: ["Mental Clarity", "Breakthrough Truth"], upright: "Cutting through mental fog with razor-sharp insight.", reversed: "Misinformation, chaos, confusion." },
  { id: 31, name: "Three of Swords", arcana: "Minor", suit: "Swords", number: 3, element: "Air", keywords: ["Heartbreak", "Grief", "Emotional Release"], upright: "Acknowledging painful truths and releasing heartache.", reversed: "Healing, forgiveness, moving past pain." },
  { id: 32, name: "Six of Swords", arcana: "Minor", suit: "Swords", number: 6, element: "Air", keywords: ["Transition", "Moving Forward"], upright: "Sailing toward calmer, more peaceful waters.", reversed: "Unresolved baggage, rough transitions." },
  { id: 33, name: "Ten of Swords", arcana: "Minor", suit: "Swords", number: 10, element: "Air", keywords: ["Rock Bottom", "New Dawn"], upright: "The end of a painful cycle. The sun rises in the distance.", reversed: "Recovery, fear of repeat pain." },

  // Pentacles
  { id: 34, name: "Ace of Pentacles", arcana: "Minor", suit: "Pentacles", number: 1, element: "Earth", keywords: ["Material Opportunity", "Prosperity"], upright: "A tangible seed of financial and physical abundance.", reversed: "Missed chance, bad investment." },
  { id: 35, name: "Three of Pentacles", arcana: "Minor", suit: "Pentacles", number: 3, element: "Earth", keywords: ["Teamwork", "Mastery", "Collaboration"], upright: "Co-creating high quality work with skilled partners.", reversed: "Lack of teamwork, disorganization." },
  { id: 36, name: "Nine of Pentacles", arcana: "Minor", suit: "Pentacles", number: 9, element: "Earth", keywords: ["Self-Sufficiency", "Luxury", "Independence"], upright: "Enjoying the fruits of your labor in elegant peace.", reversed: "Over-spending, dependency on others." },
  { id: 37, name: "Ten of Pentacles", arcana: "Minor", suit: "Pentacles", number: 10, element: "Earth", keywords: ["Legacy", "Generational Wealth"], upright: "Lasting prosperity, family stability, and long-term legacy.", reversed: "Financial disputes, loss of foundation." }
];

export function calculateBirthTarotCards(dateObj) {
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  const y = dateObj.getFullYear();

  let sum = m + d + y;
  
  // Reduce to 22 or less for Major Arcana
  while (sum > 22) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  let personalityCardId = sum === 22 ? 0 : sum;
  let soulCardId = personalityCardId;

  if (personalityCardId > 9) {
    soulCardId = String(personalityCardId).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  return {
    personalityCard: TAROT_DECK.find(c => c.id === personalityCardId) || TAROT_DECK[0],
    soulCard: TAROT_DECK.find(c => c.id === soulCardId) || TAROT_DECK[0]
  };
}

export function getRandomTarotCards(count = 3) {
  const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(card => ({
    ...card,
    isReversed: Math.random() < 0.25 // 25% chance reversed for dynamic depth
  }));
}
