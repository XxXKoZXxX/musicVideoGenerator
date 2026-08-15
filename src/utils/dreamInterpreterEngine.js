// Dream Sanctuary & Esoteric Dream Interpretation Engine for Astraea

import { calculatePlanetaryPositions } from './astrologyEngine';

export const DREAM_VIBES = [
  { id: 'mystical', label: '✨ Mystical & Transcendent', icon: '🌌', desc: 'Cosmic encounters, divine guidance, or spiritual epiphanies' },
  { id: 'lucid', label: '👁️ Lucid & Conscious', icon: '💎', desc: 'Awareness of dreaming with conscious control over reality' },
  { id: 'shadow', label: '🌑 Shadow & Nightmarish', icon: '🦇', desc: 'Confronting fears, pursuing figures, or unresolved emotional tension' },
  { id: 'prophetic', label: '🔮 Prophetic & Premonitory', icon: '🕯️', desc: 'Déjà vu sensations, future glimpses, or heightened intuition' },
  { id: 'recurring', label: '🌀 Recurring Loop', icon: '⏳', desc: 'Repeated themes, familiar settings, or persistent soul messages' },
  { id: 'flying', label: '🦅 Flying & Euphoric', icon: '🕊️', desc: 'Weightlessness, soaring above landscapes, and boundless freedom' },
  { id: 'peaceful', label: '🌿 Peaceful & Nurturing', icon: '🌸', desc: 'Deep sanctuary, comforting reunions, and gentle soul rest' }
];

export const DREAM_SYMBOLS_LEXICON = {
  water: {
    name: 'Water / Ocean / Rivers',
    icon: '🌊',
    category: 'Elemental & Subconscious',
    keywords: ['Emotions', 'Subconscious', 'Cleansing', 'Flow', 'Depth'],
    archetype: 'The Subconscious Ocean (Great Mother)',
    meaning: 'Water represents the raw flow of your emotional subconscious. Clear water indicates intuitive clarity and peace, while turbulent waves or tsunamis point to deep emotional currents seeking conscious expression and cathartic release.',
    shadowWarning: 'Avoid repressing overwhelming feelings; allow them to be felt and surrendered.',
    astrologyLink: 'Resonates with Water signs (Cancer, Scorpio, Pisces) and Moon transits.'
  },
  flying: {
    name: 'Flying / Levitation',
    icon: '🦅',
    category: 'Spiritual & Transcendent',
    keywords: ['Liberation', 'Higher Perspective', 'Transcendence', 'Astral Travel'],
    archetype: 'The Winged Soul / Icarus-Ascent',
    meaning: 'Flying symbolizes rising above earthly limitations and gaining higher perspective on waking life challenges. It reflects spiritual sovereignty, expanding consciousness, and the desire to break free from heavy daily routines.',
    shadowWarning: 'Ensure you remain grounded in physical reality so your visionary insights can be anchored.',
    astrologyLink: 'Resonates with Air signs (Gemini, Libra, Aquarius) and Uranus breakthroughs.'
  },
  falling: {
    name: 'Falling / Sinking',
    icon: '🍂',
    category: 'Ego & Grounding',
    keywords: ['Surrender', 'Releasing Control', 'Fear of Failure', 'Grounding'],
    archetype: 'The Descent into the Underworld',
    meaning: 'Falling is an invitation to release rigid control and surrender to life\'s natural currents. It frequently occurs during times of major life transition when old structures are dissolving to make room for new foundations.',
    shadowWarning: 'Notice where you are clinging to obsolete expectations or fear of losing status.',
    astrologyLink: 'Resonates with Earth signs (Taurus, Virgo, Capricorn) and Saturn boundaries.'
  },
  snake: {
    name: 'Snake / Serpent / Ouroboros',
    icon: '🐍',
    category: 'Alchemical & Kundalini',
    keywords: ['Transformation', 'Kundalini', 'Healing', 'Shedding Skin', 'Wisdom'],
    archetype: 'The Alchemical Ouroboros & Caduceus',
    meaning: 'The serpent is one of the most powerful ancient symbols of spiritual rebirth, healing, and primal kundalini life-force. Shedding old skin signifies outgrowing a former identity, shedding toxic habits, and stepping into sovereign power.',
    shadowWarning: 'Be mindful of deceptive self-illusions or unexpressed primal passions.',
    astrologyLink: 'Resonates with Scorpio, Pluto, and Chiron the Wounded Healer.'
  },
  teeth: {
    name: 'Teeth Falling / Cracking',
    icon: '🦷',
    category: 'Persona & Vitality',
    keywords: ['Self-Worth', 'Loss of Control', 'Vulnerability', 'Power of Expression'],
    archetype: 'The Molting of the Persona',
    meaning: 'Teeth in dreams are linked to how you project authority, bite into life, and communicate truth. Teeth loosening or falling reflects temporary anxiety around self-worth, aging, or speaking your unvarnished truth.',
    shadowWarning: 'Strengthen your throat chakra; stop swallowing words that deserve to be spoken.',
    astrologyLink: 'Resonates with Mercury communication and Saturn structure.'
  },
  house: {
    name: 'House / Hidden Rooms',
    icon: '🏰',
    category: 'Psyche & Architecture',
    keywords: ['The Self', 'Inner Architecture', 'Unexplored Talents', 'Ancestral Memory'],
    archetype: 'The Castle of the Soul',
    meaning: 'A house represents your total psyche. The attic signifies higher intellect and spiritual aspirations, the ground floor represents daily consciousness, and basements or secret rooms represent hidden talents and repressed memories waiting to be unlocked.',
    shadowWarning: 'Do not ignore neglected basements or locked doors in your inner life.',
    astrologyLink: 'Resonates with the 4th House (Roots) and Cancer home sanctuary.'
  },
  mirror: {
    name: 'Mirror / Reflections',
    icon: '🪞',
    category: 'Shadow & Self-Recognition',
    keywords: ['True Self', 'Shadow Integration', 'Twin Flame Mirror', 'Illusion vs Truth'],
    archetype: 'The Sacred Speculum & Mirror of Truth',
    meaning: 'Looking into a mirror in a dream reflects self-examination and confronting your authentic essence beneath societal masks. If the reflection shifts, it signifies internal alchemy and meeting an unintegrated dimension of the Self.',
    shadowWarning: 'Release judgment when meeting your shadow; love all facets of your being.',
    astrologyLink: 'Resonates with Sun-Moon cross aspects and Ascendant-Descendant axis.'
  },
  chased: {
    name: 'Being Chased / Pursued',
    icon: '🏃',
    category: 'Shadow & Avoidance',
    keywords: ['Avoidance', 'Shadow Confrontation', 'Urgency', 'Courage'],
    archetype: 'The Pursuing Shadow',
    meaning: 'Whatever pursues you in a dream is an aspect of your own strength, emotional wound, or unlived potential trying to catch your conscious attention. Turning around to face your pursuer immediately dissolves fear into empowerment.',
    shadowWarning: 'Stop running from uncomfortable truths; face them with sovereign grace.',
    astrologyLink: 'Resonates with Mars drive and 8th House transformations.'
  },
  death: {
    name: 'Death / Rebirth / Funerals',
    icon: '⚰️',
    category: 'Alchemical Transformation',
    keywords: ['End of a Cycle', 'Ego Dissolution', 'Resurrection', 'New Life Phase'],
    archetype: 'The Phoenix / Major Arcana XIII Death',
    meaning: 'Dream death almost never signifies physical mortality; it is the ultimate symbol of psychic graduation. An old chapter, relationship dynamic, or limiting self-image has died to clear fertile ground for a miraculous new beginning.',
    shadowWarning: 'Grieve what was with gratitude, but do not cling to the empty tomb.',
    astrologyLink: 'Resonates with Pluto rebirth and 8th/12th House completions.'
  },
  angel: {
    name: 'Angel / Spirit Guide / Celestial Being',
    icon: '👼',
    category: 'Higher Guidance & Divinity',
    keywords: ['Divine Message', 'Protection', 'Higher Self', 'Spiritual Awakening'],
    archetype: 'The Divine Messenger / Higher Self',
    meaning: 'Direct visitation from guides or radiant beings confirms that your spiritual antennas are clear. Pay strict attention to the telepathic words, symbols, or emotional impressions given during the encounter.',
    shadowWarning: 'Trust your own inner authority; do not give your spiritual sovereignty away.',
    astrologyLink: 'Resonates with Neptune, Jupiter, and 9th/12th House spiritual realms.'
  },
  fire: {
    name: 'Fire / Flames / Inferno',
    icon: '🔥',
    category: 'Passion & Purification',
    keywords: ['Purification', 'Creative Passion', 'Sacred Rage', 'Alchemical Heat'],
    archetype: 'The Sacred Hearth & Alchemical Crucible',
    meaning: 'Fire consumes the non-essential, leaving behind only indestructible gold. A warming fire indicates passion, creativity, and vitality; a wildfire indicates intense anger or revolutionary transformation sweeping through your life.',
    shadowWarning: 'Channel intense passion constructively so it illuminates rather than consumes.',
    astrologyLink: 'Resonates with Fire signs (Aries, Leo, Sagittarius) and Mars.'
  },
  key: {
    name: 'Key / Door / Threshold',
    icon: '🗝️',
    category: 'Initiation & Discovery',
    keywords: ['Initiation', 'Secret Knowledge', 'New Opportunities', 'Threshold Guardian'],
    archetype: 'The Keeper of the Mysteries',
    meaning: 'Finding a key or discovering a golden door signals that you have completed a spiritual trial and are now granted access to new levels of wisdom, financial abundance, or creative mastery.',
    shadowWarning: 'Step through the threshold boldly; hesitation stems from obsolete fear.',
    astrologyLink: 'Resonates with North Node destiny and Jupiter expansion.'
  },
  wolf: {
    name: 'Wolf / Owl / Totem Animals',
    icon: '🐺',
    category: 'Animal Totems & Instinct',
    keywords: ['Primal Instinct', 'Soul Tribe', 'Intuition', 'Fierce Loyalty'],
    archetype: 'The Wild Self & Shamanic Guide',
    meaning: 'Totem animals bring messages from the deep instinctual realm. A wolf honors fierce loyalty and trusting your gut; an owl brings nocturnal clairvoyance; a butterfly signals complete metamorphic evolution.',
    shadowWarning: 'Honor your physical body and primal instincts; do not over-intellectualize.',
    astrologyLink: 'Resonates with Moon instincts and Chiron natural medicine.'
  },
  baby: {
    name: 'Baby / Pregnancy / Birth',
    icon: '👶',
    category: 'Creation & New Chapters',
    keywords: ['New Project', 'Creative Conception', 'Purity', 'Vulnerability', 'Fresh Start'],
    archetype: 'The Divine Child (Puer Aeternus)',
    meaning: 'Dreaming of a baby or pregnancy signifies that you are gestating a powerful new idea, enterprise, creative masterpiece, or spiritual identity. It requires nurturing, patience, and protective care.',
    shadowWarning: 'Protect your delicate beginnings from premature criticism or cynicism.',
    astrologyLink: 'Resonates with 5th House creation and Venusian fertility.'
  },
  time: {
    name: 'Clocks / Time Distortions / Space',
    icon: '⌛',
    category: 'Cosmic & Dimensional',
    keywords: ['Divine Timing', 'Urgency', 'Quantum Jumps', 'Higher Dimensions'],
    archetype: 'Chronos & The Quantum Stargate',
    meaning: 'Time slowing down or stopping in dreams indicates you have slipped into the timeless 5D astral plane. Clocks ticking fast urge you to align with your soul destiny without further delay.',
    shadowWarning: 'Release anxiety around earthly deadlines; align with divine cosmic rhythm.',
    astrologyLink: 'Resonates with Saturn time and Uranus quantum leaps.'
  }
};

// Detect symbols mentioned in dream text
export function detectDreamSymbols(dreamText) {
  const lower = (dreamText || '').toLowerCase();
  const detected = [];

  const searchMap = {
    water: ['water', 'ocean', 'sea', 'river', 'lake', 'tsunami', 'wave', 'drowning', 'swim', 'rain', 'flood'],
    flying: ['flying', 'fly', 'flight', 'levitating', 'floating', 'soar', 'wings', 'sky', 'clouds'],
    falling: ['falling', 'fall', 'dropped', 'cliff', 'sink', 'sinking', 'pit', 'abyss'],
    snake: ['snake', 'serpent', 'cobra', 'python', 'reptile', 'shed', 'scales'],
    teeth: ['teeth', 'tooth', 'dentist', 'mouth', 'bite', 'jaw'],
    house: ['house', 'room', 'mansion', 'building', 'door', 'attic', 'basement', 'hallway', 'castle'],
    mirror: ['mirror', 'reflection', 'glass', 'looking glass'],
    chased: ['chased', 'chase', 'running', 'run', 'monster', 'pursued', 'stalker', 'escape', 'hide', 'hiding'],
    death: ['death', 'died', 'dying', 'dead', 'funeral', 'grave', 'coffin', 'cemetery', 'corpse'],
    angel: ['angel', 'guide', 'god', 'goddess', 'deity', 'alien', 'star being', 'spirit', 'light being'],
    fire: ['fire', 'flame', 'burning', 'inferno', 'smoke', 'ash', 'bonfire'],
    key: ['key', 'lock', 'unlocked', 'portal', 'stargate', 'doorway'],
    wolf: ['wolf', 'owl', 'lion', 'bear', 'butterfly', 'tiger', 'eagle', 'dog', 'cat', 'animal'],
    baby: ['baby', 'pregnant', 'pregnancy', 'birth', 'child', 'infant', 'toddler'],
    time: ['clock', 'time', 'watch', 'hour', 'space', 'galaxy', 'future', 'past', 'loop']
  };

  Object.entries(searchMap).forEach(([symKey, keywords]) => {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(DREAM_SYMBOLS_LEXICON[symKey]);
    }
  });

  // Default to water and house if none detected
  if (detected.length === 0) {
    detected.push(DREAM_SYMBOLS_LEXICON.water, DREAM_SYMBOLS_LEXICON.house);
  }

  return detected;
}

// Generate Complete Multi-Domain Dream Interpretation
export function interpretDream(dreamText, vibeId = 'mystical', profile, astroData = null) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astro = astroData || calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  
  const moonSign = astro.planets.Moon.zodiac.sign;
  const moonElem = astro.planets.Moon.zodiac.element;
  const neptuneSign = astro.planets.Neptune.zodiac.sign;
  const sunSign = astro.planets.Sun.zodiac.sign;

  const vibe = DREAM_VIBES.find(v => v.id === vibeId) || DREAM_VIBES[0];
  const detectedSymbols = detectDreamSymbols(dreamText);

  // Determine Primary Archetype
  let primaryArchetype = "The Shadow & Awakening Self";
  let archetypalTheme = "Subconscious Integration & Spiritual Metamorphosis";
  let solfeggioHz = 528;
  let binauralBeat = "Theta Lucid Dreaming (4.5 Hz)";

  if (vibeId === 'mystical' || vibeId === 'prophetic') {
    primaryArchetype = "The Transcendent Oracle & Higher Self";
    archetypalTheme = "Cosmic Vision & Akashic Intuition";
    solfeggioHz = 963;
    binauralBeat = "Gamma Pineal Activation (40.0 Hz)";
  } else if (vibeId === 'lucid' || vibeId === 'flying') {
    primaryArchetype = "The Sovereign Creator & Astral Traveler";
    archetypalTheme = "Conscious Reality Mastery & Spiritual Sovereignty";
    solfeggioHz = 741;
    binauralBeat = "Alpha Flow State (10.0 Hz)";
  } else if (vibeId === 'shadow') {
    primaryArchetype = "The Unintegrated Shadow & The Sacred Threshold";
    archetypalTheme = "Fear Transmutation & Alchemical Rebirth";
    solfeggioHz = 396;
    binauralBeat = "Delta Deep Healing (2.0 Hz)";
  } else if (vibeId === 'peaceful') {
    primaryArchetype = "The Great Mother & Soul Sanctuary";
    archetypalTheme = "Emotional Rejuvenation & Ancestral Blessing";
    solfeggioHz = 639;
    binauralBeat = "Schumann Earth Grounding (7.83 Hz)";
  }

  // Core Decoding Synthesis
  const userName = profile?.name || 'Soul Traveler';
  const firstSymbol = detectedSymbols[0] || DREAM_SYMBOLS_LEXICON.water;
  const secondSymbol = detectedSymbols[1] || detectedSymbols[0] || DREAM_SYMBOLS_LEXICON.house;
  const synthesisMessage = `This dream occurred as a direct dialogue between ${userName}'s conscious waking ego (${sunSign} solar will) and deep subconscious inner sanctuary (${moonSign} lunar psyche).

${vibe.desc}. The presence of ${firstSymbol.name} and ${secondSymbol.name} indicates that your soul is currently processing major themes around ${firstSymbol.keywords.slice(0, 3).join(', ')} and ${secondSymbol.keywords.slice(0, 3).join(', ')}.

Your subconscious is encouraging you to embrace ${firstSymbol.meaning.split('.')[0]}. Rather than viewing this dream as a random neurological firing, recognize it as an alchemical recalibration of your astral body.`;

  // Astrological Resonance breakdown
  const astrologicalInsight = `With your natal Moon in ${moonSign} (${moonElem} element), your subconscious processes spiritual impressions through ${moonElem === 'Water' ? 'deep emotional clairvoyance and psychic empathy' : moonElem === 'Air' ? 'conceptual symbolism, mental dialogue, and telepathic ideas' : moonElem === 'Fire' ? 'vivid catalytic imagery, sacred passion, and heroic quests' : 'tangible physical sensations, grounded spatial structures, and ancestral memory'}. Neptune in ${neptuneSign} acts as your mystical astral gateway, attuning your dream state to higher spiritual downloads.`;

  // Actionable Lucid Waking Ritual
  const wakingRitual = `1. **Anchor the Wisdom**: Write down the dominant emotion of the dream before getting out of bed.
2. **Solfeggio Integration**: Listen to ${solfeggioHz} Hz with ${binauralBeat} for 10 minutes while visualizing the dream symbols dissolving into golden light.
3. **Waking Reality Check**: Whenever you encounter ${firstSymbol.name.toLowerCase()} in your physical day, pause and ask yourself: "Am I dreaming right now?"`;

  const dreamMantra = `I honor the sacred intelligence of my dreams. I integrate my shadow, awaken my intuition, and walk in sovereign clarity.`;

  return {
    id: `dream_${Date.now()}`,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dreamText,
    vibe,
    primaryArchetype,
    archetypalTheme,
    detectedSymbols,
    synthesisMessage,
    astrologicalInsight,
    wakingRitual,
    dreamMantra,
    prescription: {
      hz: solfeggioHz,
      binauralBeat,
      chakra: solfeggioHz === 963 ? 'Crown Chakra' : solfeggioHz === 741 ? 'Third Eye' : solfeggioHz === 528 ? 'Solar Plexus / DNA' : solfeggioHz === 639 ? 'Heart Chakra' : 'Root Chakra'
    }
  };
}

export const LUCID_DREAMING_GUIDE = [
  {
    title: '1. Mnemonic Induction (MILD)',
    desc: 'Before falling asleep, repeat your intention: "Tonight, the next scene I see will be a dream, and I will remember I am dreaming."'
  },
  {
    title: '2. Physical Reality Checks',
    desc: 'Perform 5 reality checks throughout the day: Look at your hands, check digital clocks twice, and attempt to push your finger through your palm.'
  },
  {
    title: '3. Wake-Back-To-Bed (WBTB)',
    desc: 'Set an alarm for 5 hours after sleeping. Stay awake for 20 minutes reading your dream journal, then return to sleep with lucid intention.'
  },
  {
    title: '4. Sacred Acoustic Entrainment',
    desc: 'Play 4.5 Hz Theta or 40 Hz Gamma binaural beats through headphones on low volume to bridge conscious awareness into REM sleep.'
  }
];
