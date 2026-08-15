// Grand Esoteric Grimoire & Occult Knowledge Engine for Astraea

// 1. Daily Word of the Day & Master Quotes
export const ESOTERIC_WORDS_OF_THE_DAY = [
  {
    word: "Anima Mundi",
    origin: "Latin (Platonic Philosophy)",
    pronunciation: "AH-nee-mah MOON-dee",
    meaning: "The 'World Soul' — the intrinsic divine intelligence and interconnected spiritual essence that permeates all living things in the universe.",
    practice: "Walk outside and breathe in harmony with the trees, recognizing the one unified breath moving through all creation."
  },
  {
    word: "Theurgy",
    origin: "Greek (Theourgia - 'God-Work')",
    pronunciation: "THEE-ur-jee",
    meaning: "The sacred art of divine magic and rituals aimed at uniting the human consciousness with the higher divine realm.",
    practice: "Light a single white candle with reverent intent, dedicating your daily actions to your highest spiritual calling."
  },
  {
    word: "Ouroboros",
    origin: "Ancient Egyptian & Greek",
    pronunciation: "oo-ROH-bor-os",
    meaning: "The serpent eating its own tail, symbolizing the eternal cycle of destruction, rebirth, immortality, and infinite wholeness.",
    practice: "Reflect on an ending in your life and celebrate it as the fertile soil for an impending resurrection."
  },
  {
    word: "Akasha",
    origin: "Sanskrit (Ether / Space)",
    pronunciation: "ah-KAH-shah",
    meaning: "The primordial fifth element — the celestial energetic field that records every thought, feeling, and deed across all time (The Akashic Records).",
    practice: "Close your eyes for 3 minutes and visualize the space between your thoughts, connecting to the timeless Akashic library."
  },
  {
    word: "Metanoia",
    origin: "Ancient Greek",
    pronunciation: "meh-tah-NOY-ah",
    meaning: "A profound spiritual transformation — a fundamental change of heart, mind, and perception that awakens higher consciousness.",
    practice: "Forgive a past mistake by viewing it through the lens of soul evolution rather than regret."
  },
  {
    word: "Samsara",
    origin: "Sanskrit (Continuous Movement)",
    pronunciation: "sahm-SAH-rah",
    meaning: "The repeating cycle of birth, death, rebirth, and earthly illusion before the soul attains Moksha (spiritual liberation).",
    practice: "Observe an emotional trigger today without reacting, stepping out of the karmic loop."
  },
  {
    word: "Hermeticism",
    origin: "Hellenistic Egypt (Hermes Trismegistus)",
    pronunciation: "her-MET-ih-sizm",
    meaning: "The ancient philosophical and magical tradition rooted in the Emerald Tablet: 'As above, so below; as within, so without.'",
    practice: "Align your internal emotional state with the reality you wish to manifest outwardly."
  }
];

export function getWordOfTheDay(date = new Date()) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return ESOTERIC_WORDS_OF_THE_DAY[dayOfYear % ESOTERIC_WORDS_OF_THE_DAY.length];
}

export const MASTER_QUOTES = [
  { quote: "The unexamined life is not worth living. To know thyself is the beginning of wisdom.", author: "Socrates", category: "Classical Philosophy" },
  { quote: "Peace comes from within. Do not seek it without. What you think, you become.", author: "Gautama Buddha", category: "Eastern Wisdom" },
  { quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung", category: "Depth Psychology" },
  { quote: "Out of your vulnerabilities will come your strength.", author: "Sigmund Freud", category: "Psychoanalysis" },
  { quote: "Knowing yourself is the beginning of all wisdom. We are what we repeatedly do.", author: "Aristotle", category: "Classical Philosophy" },
  { quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "Stoicism" },
  { quote: "The wound is the place where the Light enters you. Stop acting so small. You are the universe in ecstatic motion.", author: "Rumi", category: "Sufism & Mysticism" },
  { quote: "When you are content to be simply yourself and don't compare or compete, everyone will respect you.", author: "Lao Tzu", category: "Taoism" },
  { quote: "As above, so below; as within, so without; as the universe, so the soul.", author: "Hermes Trismegistus", category: "Hermetic Alchemy" },
  { quote: "Number is the ruler of forms and ideas, and the cause of gods and daemons.", author: "Pythagoras", category: "Sacred Numerology" }
];

// 2. The 7 Planetary Metals & Sacred Alchemy
export const PLANETARY_METALS = [
  { planet: "Sun", metal: "Gold (Au)", chakra: "Crown / Solar Plexus", principle: "Solar Radiance, Divine Will & Immortality", desc: "The ultimate alchemical attainment. Pure consciousness, uncorrupted vital essence, and spiritual sovereignty." },
  { planet: "Moon", metal: "Silver (Ag)", chakra: "Third Eye / Sacral", principle: "Lunar Intuition, Dreams & Emotional Purity", desc: "The reflective mirror of the soul. Intuitive clairvoyance, psychic reception, and the fluid ebb of tides." },
  { planet: "Mercury", metal: "Quicksilver / Liquid Mercury (Hg)", chakra: "Throat / Mind", principle: "Alchemical Messenger, Intellect & Adaptability", desc: "The fluid conductor bridging the spiritual and physical worlds. Mental agility, transmutation, and speech." },
  { planet: "Venus", metal: "Copper (Cu)", chakra: "Heart Chakra", principle: "Unconditional Love, Beauty & Sacred Harmony", desc: "The gentle conductor of harmonic frequencies. Attracts love, artistic inspiration, and relational synergy." },
  { planet: "Mars", metal: "Iron (Fe)", chakra: "Solar Plexus / Root", principle: "Primal Courage, Willpower & Magnetic Drive", desc: "The sword of spiritual discipline. Raw vital life-force, protective shielding, and decisive action." },
  { planet: "Jupiter", metal: "Tin (Sn)", chakra: "Third Eye / Crown", principle: "Expansion, Prosperity & Philosophical Grace", desc: "The metal of the benevolent king. Generosity, abundance, spiritual luck, and philosophical wisdom." },
  { planet: "Saturn", metal: "Lead (Pb)", chakra: "Root Chakra", principle: "Structure, Karmic Boundaries & Prime Matter", desc: "The heavy prima materia. The discipline, mortality, and karmic trials that are transmuted into pure gold." }
];

export const MAGNUM_OPUS_STAGES = [
  { stage: "1. Nigredo (The Blackening)", symbol: "Raven / Midnight", meaning: "Ego death, shadow confrontation, and the breaking down of obsolete illusions into primal matter." },
  { stage: "2. Albedo (The Whitening)", symbol: "White Dove / Dawn", meaning: "Spiritual purification, emotional cleansing, illumination of the subconscious, and return of innocence." },
  { stage: "3. Citrinitas (The Yellowing)", symbol: "Golden Eagle / Solar Light", meaning: "Awakening of solar consciousness, mental clarity, spiritual maturity, and realization of inner divinity." },
  { stage: "4. Rubedo (The Reddening)", symbol: "Phoenix / Red Rose", meaning: "The ultimate integration: Divine marriage of Spirit and Matter. Creation of the immortal Philosopher's Stone." }
];

// 3. Types of Soul Connections & Red String of Fate
export const SOUL_CONNECTION_TYPES = [
  {
    type: "🔥 Twin Flame (Divine Mirror)",
    frequency: "Highest Resonance (Monadic Split)",
    desc: "The other energetic half of your primary soul essence. Acts as a flawless mirror reflecting your highest light and deepest unhealed shadows. Brings rapid spiritual acceleration and kundalini awakening.",
    purpose: "Spiritual transcendence, ego dissolution, and co-creation of divine planetary service."
  },
  {
    type: "⏳ Karmic Soulmate (The Sacred Teacher)",
    frequency: "Intense Catalytic Friction",
    desc: "A soul with whom you share unfinished past-life karma or energetic debts. Relationship begins with magnetic attraction but involves intense emotional tests.",
    purpose: "To teach forgiveness, release codependency, set sovereign boundaries, and break ancestral cycles."
  },
  {
    type: "💎 Dharmic / Companion Soulmate",
    frequency: "Peaceful Harmonic Resonance",
    desc: "A harmonious soul traveler from your soul group. Characterized by deep mutual trust, peace, emotional safety, shared life goals, and effortless laughter.",
    purpose: "Long-term partnership, family building, emotional support, and shared creative worldly missions."
  },
  {
    type: "⚡ Catalyst Soulmate",
    frequency: "Sudden Electric Epiphany",
    desc: "Enters your life briefly to shatter comfortable stagnation, awaken buried talents, or redirect your life trajectory before departing.",
    purpose: "To awaken you from spiritual slumber and push you onto your true destined path."
  },
  {
    type: "🧵 Red String of Fate (East Asian Invisible Cord)",
    frequency: "Inseverable Karmic Tether",
    desc: "According to ancient myth, the gods tie an invisible red cord between individuals destined to meet. The cord may tangle or stretch across lifetimes, but it can never be severed.",
    purpose: "Divine destiny orchestration ensuring sacred souls meet at the exact right astrological hour."
  }
];

// 4. Kama Sutra & Sacred Tantric Polarities
export const TANTRIC_ENERGY_POLARITIES = [
  {
    title: "Shiva (Divine Masculine / Consciousness)",
    element: "Electric / Stillness / Presence",
    principle: "The unwavering container of absolute presence, deep awareness, protective boundaries, and sovereign direction.",
    practice: "Focus on holding absolute stillness, grounding in the root chakra, and cultivating unshakeable eye contact."
  },
  {
    title: "Shakti (Divine Feminine / Prana / Energy)",
    element: "Magnetic / Movement / Ecstasy",
    principle: "The dynamic life-force, creative flow, emotional ocean, sacred surrender, and ecstatic expression of nature.",
    practice: "Surrender into breath and fluid movement, allowing emotional expression to move freely without intellectual censorship."
  },
  {
    title: "The 7 Sacred Tantric Touch Zones",
    element: "Chakra Body Energy Points",
    principle: "Tantric union harmonizes all 7 chakras from Crown down to Root, creating an energetic toroidal loop between partners.",
    practice: "Synchronize breath with your partner (Inhale together 4s, Exhale together 6s) while resting hands on each other's Heart Chakra."
  }
];

// 5. Spellcrafting Encyclopedia (Jars, Mojo Bags, Poppets, Candles)
export const SPELLCRAFT_ENCYCLOPEDIA = [
  {
    id: "money_jar",
    name: "🏺 Golden Abundance & Prosperity Spell Jar",
    type: "Witch Bottle / Spell Jar",
    timing: "Thursday (Jupiter Day) or Waxing Moon",
    ingredients: [
      "Small glass mason jar",
      "Green & Gold sealing wax / candle",
      "Cinnamon sticks (speeds money flow)",
      "Bay leaf (write your specific monetary amount)",
      "Whole cloves & Allspice berries",
      "Pyrite or Citrine crystal chips",
      "A shiny coin or dollar bill anointed with almond oil"
    ],
    instructions: "Layer ingredients with focused intent. Seal the cork with dripping green candle wax while chanting your affirmation: 'Flowing gold and fertile light, wealth arrives in joy and might.' Keep in your office or wealth corner.",
    ethics: "Aligns with divine abundance; harms none."
  },
  {
    id: "sweetening_jar",
    name: "🍯 Honey & Rose Harmony Sweetening Jar",
    type: "Love & Reconciliation Jar",
    timing: "Friday (Venus Day) or Full Moon",
    ingredients: [
      "Small jar of pure raw honey or brown sugar",
      "Pink rose petals (unconditional love)",
      "Lavender buds (peace and gentle communication)",
      "Rose quartz crystal",
      "Parchment paper with both names written 3 times crossed with 'Love & Understanding'",
      "Pink or White candle wax seal"
    ],
    instructions: "Place the folded parchment inside the jar, pour honey over it until submerged. Seal with pink wax. Gently shake weekly to sweeten words and dissolve friction.",
    ethics: "Never binds will; invites harmonious understanding."
  },
  {
    id: "protection_poppet",
    name: "🪆 Herbal Protection & Energy Shielding Poppet (Doll)",
    type: "Poppet & Folk Doll",
    timing: "Saturday (Saturn Day) or Waning Moon",
    ingredients: [
      "White or Black cotton cloth / burlap",
      "Rosemary & White Sage (purification)",
      "Black Tourmaline or Obsidian stone",
      "Rowan wood or Cloves (deflection of negativity)",
      "Thread and needle",
      "A personal taglock (hair strand or written signature)"
    ],
    instructions: "Sew the cloth doll leaving the top open. Stuff with protective herbs, obsidian, and your personal taglock. Sew shut and anoint with frankincense oil: 'Protected by day, shielded by night, only love may enter my sight.' Keep near your bedroom.",
    ethics: "Purely protective deflection; absorbs negative psychic projection."
  },
  {
    id: "mojo_bag",
    name: "🎒 Road Opener & Success Mojo Bag (Gris-Gris)",
    type: "Charm / Mojo Bag",
    timing: "Sunday (Sun Day) or New Moon",
    ingredients: [
      "Red or Yellow flannel cloth pouch",
      "High John the Conqueror root or Master root",
      "Lodestone or Magnetite (attracts success)",
      "Coffee beans (energizes sluggish energy)",
      "Bay leaf inscribed with 'Victory'",
      "Bergamot or Frankincense oil (3 drops)"
    ],
    instructions: "Anoint the root with oil, whisper your desires into the bag, tie with 7 knots. Carry in your pocket or bag, feeding it with 1 drop of oil weekly.",
    ethics: "Clears internal roadblocks and unlocks opportunities."
  },
  {
    id: "candle_magic",
    name: "🕯️ Seven-Color Candle Alchemy & Flame Scrying",
    type: "Candle Magic",
    timing: "Any astrological hour",
    ingredients: [
      "White: Purity, peace, universal substitute",
      "Gold / Yellow: Solar confidence, intellect, success",
      "Green: Money, growth, physical healing",
      "Pink / Red: Love, passion, romance, courage",
      "Blue: Truth, calm, throat chakra expression",
      "Purple: Psychic powers, spirit guides, third eye",
      "Black: Banishing, absorbing evil eye, boundary protection"
    ],
    instructions: "Carve your sigil or name from base to wick (to attract) or wick to base (to banish). Anoint with olive oil and herbs. Observe the flame: steady and tall means spiritual confirmation; popping means active energy clearing.",
    ethics: "Universal candle magic tradition."
  }
];

// 6. Pantheons: Greek, Egyptian, Norse, Celtic Mythologies
export const GODS_AND_GODDESSES = [
  {
    pantheon: "🏛️ Greek & Roman",
    deities: [
      { name: "Apollo (Phoebus)", role: "God of the Sun, Music, Prophecy & Healing", symbols: "Golden Lyre, Laurel Wreath, Sun Chariot", myth: "Slew the Python at Delphi to establish the premier oracle sanctuary of ancient Greece. Inspires artistic genius and clairvoyance." },
      { name: "Hekate (Hecate)", role: "Titaness Goddess of Witchcraft, Crossroads & Moon", symbols: "Keys, Torches, Black Dogs, Triple Crown", myth: "The Queen of the Crossroads who holds the celestial keys to all worlds. She guides souls through dark transformations into profound wisdom." },
      { name: "Athena (Minerva)", role: "Goddess of Strategic Wisdom, Justice & Crafts", symbols: "Owl, Olive Tree, Aegis Shield, Spear", myth: "Born fully armored from Zeus's forehead, she represents clear intellect, disciplined courage, and strategic victory over brute force." },
      { name: "Aphrodite (Venus)", role: "Goddess of Love, Beauty, Passion & Fertility", symbols: "Sea Shell, White Dove, Red Rose, Mirror", myth: "Born from the foam of the sea, she awakens self-worth, magnetic attraction, and unconditional love in human hearts." },
      { name: "Hades & Persephone", role: "Rulers of the Underworld & Spring Rebirth", symbols: "Pomegranate, Asphodel, Cerberus, Scepter", myth: "Their sacred union represents the descent into the unconscious depths and the triumphant springtime resurrection of the soul." }
    ]
  },
  {
    pantheon: "☀️ Egyptian (Kemetic)",
    deities: [
      { name: "Ra", role: "Supreme Solar Deity & Creator of Order (Ma'at)", symbols: "Solar Disk, Eye of Ra, Ankh", myth: "Journeys through the underworld each night to defeat the serpent of chaos Apep and rise victorious at dawn." },
      { name: "Isis (Aset)", role: "Goddess of Supreme Magic, Healing & Motherhood", symbols: "Throne Crown, Wings of Isis, Lotus", myth: "The supreme magician who reassembled Osiris and resurrected life through the power of sacred words of power (Hekau)." },
      { name: "Thoth (Djehuti)", role: "God of Wisdom, Writing, Sacred Geometry & Moon", symbols: "Ibis, Baboon, Reed Pen, Moon Disk", myth: "Scribe of the gods and keeper of the Akashic records. Prototype for Hermes Trismegistus and Hermetic philosophy." },
      { name: "Anubis (Anpu)", role: "Guardian of the Underworld & Embalming Guide", symbols: "Black Jackal, Scales of Ma'at", myth: "Weighs the human heart against the Feather of Truth to ensure pure souls transition into the blessed Field of Reeds." }
    ]
  },
  {
    pantheon: "⚡ Norse & Celtic",
    deities: [
      { name: "Odin (All-Father)", role: "God of Wisdom, Runes, War & Shamanism", symbols: "Ravens (Huginn & Muninn), Wolves, Spear Gungnir", myth: "Sacrificed an eye at Mimir's well and hung for 9 nights from the World Tree Yggdrasil to bring the sacred Elder Futhark Runes to humanity." },
      { name: "Freya (Freyja)", role: "Goddess of Love, Seidr Magic, Beauty & Destiny", symbols: "Falcon Cloak, Amber Necklace, Chariot of Cats", myth: "Mistress of Seidr shamanic trance magic and leader of the Valkyries who choose the honorable souls." },
      { name: "The Morrigan (Phantom Queen)", role: "Celtic Goddess of Sovereignty, Battle & Fate", symbols: "Crow, Raven, Two Spears", myth: "Triple goddess of prophecy and destiny who challenges seekers to claim their sovereign truth without cowardice." },
      { name: "Brigid", role: "Celtic Goddess of the Sacred Flame, Healing & Poetry", symbols: "Perpetual Flame, Brigid's Cross, Well", myth: "Keeper of the eternal hearth fire who inspires poets, blacksmiths, and herbal healers with divine creative fire." }
    ]
  }
];

// 7. Spirit Guides, Angels, Ancestors & Spirit Animals
export const SPIRIT_REALM_GUIDES = {
  archangels: [
    { name: "Archangel Michael", ray: "Blue Ray of Protection & Truth", sword: "Flaming Sword of Light", desc: "Supreme defender against negative energies, cord-cutter of toxic attachments, and awaken of courage." },
    { name: "Archangel Gabriel", ray: "White Ray of Purity & Communication", symbol: "White Lily & Trumpet", desc: "Messenger of clarity, protector of writers/artists, and patron of new births and life purposes." },
    { name: "Archangel Raphael", ray: "Emerald Green Ray of Healing", symbol: "Caduceus & Traveler's Staff", desc: "Divine physician who heals physical ailments, emotional heartbreak, and guides safe spiritual travels." },
    { name: "Archangel Uriel", ray: "Golden Amber Ray of Illumination", symbol: "Flame in Palm & Book", desc: "Angel of divine wisdom, prophetic epiphanies, emotional serenity, and earth harmony." }
  ],
  spiritAnimals: [
    { animal: "🦅 Eagle", power: "Higher Perspective & Divine Sight", lesson: "Rise above daily trivialities; see the grand blueprint of your life from the heavens." },
    { animal: "🐺 Wolf", power: "Intuition, Loyalty & Pathfinding", lesson: "Trust your internal instincts; honor your soul tribe while honoring your solitary sacred path." },
    { animal: "🦉 Owl", power: "Nocturnal Clairvoyance & Seeing Through Illusions", lesson: "Trust what you sense in the dark; notice unspoken motives beneath words." },
    { animal: "🐍 Serpent", power: "Kundalini Rebirth & Rapid Healing", lesson: "Shed old beliefs effortlessly; your past skin no longer fits your expanding spirit." },
    { animal: "🦋 Butterfly", power: "Metamorphosis & Joyful Rebirth", lesson: "Surrender to the cocoon phase; what feels like an ending is merely the birth of your wings." },
    { animal: "🦁 Lion", power: "Heart Courage, Sovereignty & Solar Radiance", lesson: "Lead your life from the heart with regal integrity; never shrink to make others comfortable." }
  ],
  ancestorVeneration: {
    altarElements: [
      "Clean white altar cloth",
      "Glass of fresh cool spring water (refreshed daily)",
      "White candle for light and elevation of ancestral souls",
      "Framed photographs of benevolent ancestors",
      "Small dish of sea salt or bread",
      "Fresh flowers or ancestor's favorite aroma (coffee, tobacco, perfume)"
    ],
    ritual: "Light the white candle, place your hands over the water glass, and speak: 'To the benevolent, wise ancestors of my blood and spirit — I honor your journey, I release your burdens, and I welcome your protection and blessing.' Breathe deeply for 5 minutes."
  }
};

// 8. Demonology & Shadow Entity Wards (Goetic Taxonomy & LBRP)
export const SPIRITUAL_PROTECTION_GRIMOIRE = {
  lbrpSteps: [
    { step: "1. The Qabalistic Cross", action: "Touch forehead ('Ateh' - Thou art), chest ('Malkuth' - The Kingdom), right shoulder ('Ve-Geburah' - The Power), left shoulder ('Ve-Gedulah' - The Glory), hands clasped at heart ('Le-Olam, Amen' - Unto the ages)." },
    { step: "2. Drawing the 4 Banishing Pentagrams", action: "Turn East (Draw Banishing Earth Pentagram with Air vibrating 'YHVH'), South (Draw Pentagram, vibrate 'ADONAI'), West (Draw Pentagram, vibrate 'EHEIEH'), North (Draw Pentagram, vibrate 'AGLA')." },
    { step: "3. Evoking the 4 Archangels", action: "'Before me Raphael, Behind me Gabriel, At my right hand Michael, At my left hand Uriel... For about me flames the Pentagram, and in the column shines the Six-Rayed Star!'" }
  ],
  shadowArchetypes: [
    { name: "Luciferian Principle", shadow: "Spiritual Pride & Inflation", antidote: "Humility, service to truth, and aligning personal light with universal love." },
    { name: "Ahrimanic / Asmodeus Force", shadow: "Materialistic Greed & Obsessive Lust", antidote: "Heart-centered connection, generative detachment, and sacred grounding." },
    { name: "Belial Principle", shadow: "Lawlessness & Disconnection from Roots", antidote: "Discipline, ethical responsibility, and honoring natural law." }
  ]
};

// 9. Palmistry (Chiromancy) & Reflexology
export const PALMISTRY_LINES = [
  { line: "❤️ Heart Line (Top Horizontal)", meaning: "Emotional intelligence, romantic capacity, heart health, and how you express love. A curved line reaching Jupiter mount indicates high idealism; straight line indicates rational emotional poise." },
  { line: "🧠 Head Line (Middle Horizontal)", meaning: "Mental focus, analytical intellect, creativity, and psychic openness. A deep line sloping toward the Mount of the Moon indicates vivid imagination and occult aptitude." },
  { line: "🌱 Life Line (Curving around thumb)", meaning: "Vital life-force, physical stamina, major life transformations, and grounding. A wide curve reflects abundant vitality and adventurous spirit." },
  { line: "⚡ Fate / Destiny Line (Vertical Center)", meaning: "Career path, divine purpose, karmic mission, and external worldly achievements." },
  { line: "✝️ Mystic Cross (Between Heart & Head line)", meaning: "The ancient sign of clairvoyance, occult wisdom, heightened sixth sense, and innate healing gifts." }
];

export const REFLEXOLOGY_ZONES = [
  { zone: "Head & Brain / Pineal", location: "Tips of all 10 toes & thumbs", benefit: "Relieves mental fatigue, clears brain fog, enhances lucid dreaming and meditation." },
  { zone: "Solar Plexus & Diaphragm", location: "Center of the ball of each foot", benefit: "Releases trapped anxiety, unblocks breathing, and restores gut intuition." },
  { zone: "Spine & Kundalini Channel", location: "Inside edge of both feet (from big toe to heel)", benefit: "Aligns spinal posture, awakens nervous system vitality, and releases chronic tension." },
  { zone: "Heart & Chest", location: "Ball of the left foot under toes", benefit: "Soothes grief, lowers heart rate, and deepens emotional calm." }
];

// 10. Kundalini & Breathwork Pranayama Matrix
export const PRANAYAMA_BREATHWORK_SUITE = [
  {
    name: "🌬️ Nadi Shodhana (Alternate Nostril Breath)",
    target: "Harmonizing Left (Ida) & Right (Pingala) Nadis",
    steps: "Close right nostril with thumb, inhale left 4s. Close left, exhale right 4s. Inhale right 4s, close right, exhale left 4s. Repeat for 5 minutes.",
    benefits: "Balances logical and intuitive hemispheres, instantly calms heart rate, and clears psychic channels."
  },
  {
    name: "🔥 Kapalabhati (Skull Shining Breath of Fire)",
    target: "Solar Plexus & Kundalini Activation",
    steps: "Short, powerful exhalations through nose while pulling navel in sharply. Passive inhales. 3 rounds of 30 pumps.",
    benefits: "Burns metabolic toxins, stimulates pineal gland, and energizes the dormant kundalini serpent."
  },
  {
    name: "📦 Box Breathing (Samavritti 4-4-4-4)",
    target: "Autonomic Nervous System Mastery",
    steps: "Inhale 4s -> Hold full 4s -> Exhale 4s -> Hold empty 4s. Repeat 8 cycles.",
    benefits: "Navy SEAL & Yogi grounding method; eliminates panic and sharpens cognitive laser focus."
  },
  {
    name: "🌙 4-7-8 Deep Parasympathetic Reset",
    target: "Vagus Nerve & Deep Sleep Induction",
    steps: "Inhale through nose 4s -> Hold 7s -> Whoosh exhale through mouth 8s. Repeat 4 cycles before sleep.",
    benefits: "Triggers instant parasympathetic relaxation, lowers blood pressure, and promotes deep REM sleep."
  }
];

// 11. Soul Types & Starseed Matrix
export const SOUL_TYPES_AND_STARSEEDS = [
  {
    type: "🌟 Pleiadian Starseed",
    origin: "Seven Sisters Star Cluster (Taurus)",
    traits: "Deep heart chakra openness, unconditional love, intuitive healing, artistic musicality, and strong desire for planetary peace.",
    mission: "To anchor higher vibrational frequencies of love, empathy, and heart-centered community."
  },
  {
    type: "🌌 Sirian Starseed",
    origin: "Sirius A & B (Canis Major)",
    traits: "Ancient sacred geometry wisdom, mystical connection to water and cetaceans (whales/dolphins), calm inner authority, and technological/spiritual bridge.",
    mission: "To restore ancient Egyptian/Atlantean knowledge grids and anchor planetary stability."
  },
  {
    type: "💎 Arcturian Starseed",
    origin: "Arcturus (Boötes)",
    traits: "Master mental healers, sacred sound frequency experts, emotional neutrality, visionary architects, and high spiritual telepathy.",
    mission: "To guide human consciousness through 5D frequency elevation and sacred sound technology."
  },
  {
    type: "🌿 Earth Healer / Gaian Soul",
    origin: "Ancient Earth & Elementals",
    traits: "Deep communion with plant medicine, crystals, animals, herbalism, and grounding earth rhythms.",
    mission: "To heal ecosystems, protect sacred natural sites, and anchor Gaia's primal vitality."
  },
  {
    type: "📜 Ancient Old Soul",
    origin: "Many Earth Incarnations",
    traits: "Innate detachment from fleeting trends, natural wisdom, feeling older than their physical age, love of solitude and timeless arts.",
    mission: "To hold steady spiritual equilibrium during collective transitions and mentor younger souls."
  }
];

// 12. Life Expectancy & Vitality Matrix Calculator
export function calculateVitalityMatrix(profile, astroData) {
  const baseYears = 84;
  let vitalityScore = 88;
  const recommendations = [];

  // Zodiac Element adjustments
  const sunSign = astroData?.planets?.Sun?.zodiac?.sign || 'Cancer';
  const sunElement = astroData?.planets?.Sun?.zodiac?.element || 'Water';
  const moonSign = astroData?.planets?.Moon?.zodiac?.sign || 'Aries';

  if (sunElement === 'Fire') {
    vitalityScore += 4;
    recommendations.push("High natural metabolic prana; channel excess heat through daily cardiovascular exercise and cooling breathwork.");
  } else if (sunElement === 'Earth') {
    vitalityScore += 5;
    recommendations.push("Strong physical constitution and bone density; prioritize joint mobility and mineral-rich hydration.");
  } else if (sunElement === 'Air') {
    vitalityScore += 3;
    recommendations.push("Active nervous system; protect sleep cycles from screen stimulation with 4-7-8 breathwork.");
  } else {
    vitalityScore += 4;
    recommendations.push("Deep emotional sensitivity; maintain energetic hygiene through sea salt baths and sound frequencies.");
  }

  const estimatedSpan = Math.min(102, Math.max(78, baseYears + Math.round((vitalityScore - 80) / 2)));

  return {
    vitalityScore,
    estimatedSpan,
    sunSign,
    moonSign,
    vitalityPillars: [
      { pillar: "Pranic Life Force", rating: "Optimal (92%)", desc: "Strong solar vitality and mitochondrial resilience." },
      { pillar: "Emotional Nervous System", rating: "Sensitive (86%)", desc: "Regulated through daily breathwork and Solfeggio sound baths." },
      { pillar: "Somatic Cellular Balance", rating: "Robust (89%)", desc: "Enhanced through grounding walks and clean mineral intake." }
    ],
    recommendations
  };
}
