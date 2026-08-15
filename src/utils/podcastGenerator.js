// Ultra-Natural Conversational Voice Podcast Engine

import { calculatePlanetaryPositions } from './astrologyEngine';
import { calculateLifePath, calculateNameNumerology } from './numerologyEngine';
import { getSecretLanguageProfile } from '../data/secretLanguageData';
import { calculateBirthTarotCards } from './tarotEngine';
import { SolfeggioSynthesizer } from './soundscapeEngine';

// --- Natural Speech Preprocessing ---

/**
 * Preprocesses text to sound more natural when read aloud by a TTS engine.
 * - Inserts subtle pauses via SSML-compatible punctuation at natural breath points
 * - Expands abbreviations to spoken forms
 * - Adds slight emphasis markers around key astrological terms
 */
export function preprocessForNaturalSpeech(text) {
  let processed = text;

  // Replace common abbreviations with spoken forms
  processed = processed.replace(/\bvs\.?\b/gi, 'versus');
  processed = processed.replace(/\b&\b/g, 'and');
  processed = processed.replace(/\bw\//gi, 'with');
  processed = processed.replace(/\be\.g\.\b/gi, 'for example');
  processed = processed.replace(/\bi\.e\.\b/gi, 'that is');
  processed = processed.replace(/\bDr\.\b/g, 'Doctor');
  processed = processed.replace(/\bMr\.\b/g, 'Mister');
  processed = processed.replace(/\bMrs\.\b/g, 'Missus');
  processed = processed.replace(/\bSt\.\b/g, 'Saint');

  // Add subtle pauses (commas) at natural breath points:
  // After introductory words/phrases that precede a main clause
  processed = processed.replace(/\b(Well|So|Now|See|Look|Okay|Also|Plus|And then)\s/g, '$1, ');
  // Before conjunctions in longer sentences (only if no comma already present)
  processed = processed.replace(/([a-z]{4,})\s+(but|yet|however)\s+/gi, '$1, $2 ');

  // Add slight pauses (ellipses) around parenthetical asides for dramatic effect
  processed = processed.replace(/\s*\.\.\.\s*/g, '... ');

  // Add emphasis markers around key astrological terms
  const astroTerms = [
    'Sun', 'Moon', 'Rising', 'Ascendant', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    'Life Path', 'Expression', 'Tarot', 'Birth Chart'
  ];
  for (const term of astroTerms) {
    // Wrap term with slight pauses to let TTS emphasize them naturally
    const regex = new RegExp(`\\b(${term})\\b`, 'g');
    processed = processed.replace(regex, ', $1,');
  }

  // Clean up any double commas or leading/trailing commas introduced
  processed = processed.replace(/,\s*,/g, ',');
  processed = processed.replace(/^\s*,\s*/, '');
  processed = processed.replace(/\s*,\s*$/, '');
  // Remove comma directly after opening quote or before closing quote
  processed = processed.replace(/"\s*,\s*/g, '" ');
  processed = processed.replace(/\s*,\s*"/g, ' "');

  return processed;
}

// --- Voice Quality Indicator ---

/**
 * Returns a quality tier for a given SpeechSynthesisVoice object.
 * @param {SpeechSynthesisVoice} voice
 * @returns {'neural' | 'enhanced' | 'standard'}
 */
export function getVoiceQualityTier(voice) {
  if (!voice || !voice.name) return 'standard';
  const name = voice.name.toLowerCase();

  if (/neural|online|natural/i.test(name)) {
    return 'neural';
  }
  if (/enhanced|premium|google|siri/i.test(name)) {
    return 'enhanced';
  }
  return 'standard';
}

// --- Podcast Script Generation ---

export function generatePodcastScript(profile) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astro = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const lifePath = calculateLifePath(dateObj);
  const nameNum = calculateNameNumerology(profile.name);
  const secData = getSecretLanguageProfile(profile.birthMonth, profile.birthDay);
  const birthCards = calculateBirthTarotCards(dateObj);

  const sunSign = astro.planets.Sun.zodiac.sign;
  const moonSign = astro.planets.Moon.zodiac.sign;
  const ascSign = astro.planets.Ascendant.zodiac.sign;
  const personalityCardName = birthCards.personalityCard.name.replace(/^[0-9IVXLC]+\.\s*/, '');

  return [
    {
      id: 1,
      speaker: "Atlas (Astrologer)",
      gender: "male",
      text: `Hey everyone, welcome back to the Deep Dive Cosmic Podcast. Today, Luna and I are looking into a truly unique birth blueprint for ${profile.name}... born on ${secData.dateFormatted}, in ${profile.cityName}.`
    },
    {
      id: 2,
      speaker: "Luna (Mystic)",
      gender: "female",
      text: `Oh, I love this chart! Atlas, right off the bat, their Secret Language archetype is '${secData.title}'. That immediately tells me this is someone with profound determination and a very magnetic presence.`
    },
    {
      id: 3,
      speaker: "Atlas (Astrologer)",
      gender: "male",
      text: `Yes, exactly. And looking under the hood at the astrology... we have their Sun in ${sunSign}, Moon in ${moonSign}, and ${ascSign} Rising. That gives ${profile.name} an incredible mix of ${astro.planets.Sun.zodiac.element} drive, paired with deep ${astro.planets.Moon.zodiac.element} intuition.`
    },
    {
      id: 4,
      speaker: "Luna (Mystic)",
      gender: "female",
      text: `Mmm, yes! And check out their numerology... a Life Path ${lifePath}, working together with an Expression number of ${nameNum.expression}. It's a combination built for turning visionary ideas into real, tangible results.`
    },
    {
      id: 5,
      speaker: "Atlas (Astrologer)",
      gender: "male",
      text: `Absolutely, and you know what I find fascinating, Luna? The fact that ${profile.name} was born in ${profile.cityName}... that geographic energy actually colors the entire chart. The local meridian shapes how those planetary angles land.`
    },
    {
      id: 6,
      speaker: "Luna (Mystic)",
      gender: "female",
      text: `Right, that's such a great point! I mean, the birthplace is like the lens through which the whole cosmic blueprint gets focused. And speaking of focus... their core life meditation puts it beautifully: "${secData.meditation}".`
    },
    {
      id: 7,
      speaker: "Atlas (Astrologer)",
      gender: "male",
      text: `You know, Luna, what you just said about focus really ties into their ${sunSign} Sun energy. It's all about grounding that inner spark while walking your authentic path. That's the thread that connects every layer of this reading.`
    },
    {
      id: 8,
      speaker: "Luna (Mystic)",
      gender: "female",
      text: `Absolutely. And to bring it all together, their Birth Tarot card is ${personalityCardName}. It's a reminder to trust your inner compass and embrace your natural authority. You know, that card really echoes what Atlas was saying about the ${ascSign} Rising energy.`
    },
    {
      id: 9,
      speaker: "Atlas (Astrologer)",
      gender: "male",
      text: `I mean, when you stack the astrology, numerology, Secret Language, and Tarot all on top of each other like this... you can really see how ${profile.name}'s blueprint is wired for something extraordinary. It all points in the same direction.`
    },
    {
      id: 10,
      speaker: "Luna (Mystic)",
      gender: "female",
      text: `Such a powerful cosmic dossier. Thank you so much for listening to this Deep Dive overview on Astraea. Until next time, stay aligned, trust the stars, and keep shining!`
    }
  ];
}

// --- Voice Discovery & Assignment ---

// Find Natural & Neural Browser Voices
export function getAvailableNaturalVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices() || [];

  // Sort neural and natural voices first
  return voices.sort((a, b) => {
    const isNaturalA = /natural|neural|google|premium|enhanced|siri/i.test(a.name);
    const isNaturalB = /natural|neural|google|premium|enhanced|siri/i.test(b.name);
    if (isNaturalA && !isNaturalB) return -1;
    if (!isNaturalA && isNaturalB) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Enhanced Audio Player with Natural Voice Modulation and Ambient Studio Sound
export class PodcastAudioPlayer {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.utterance = null;
    this.isPlaying = false;
    this.currentLineIndex = 0;
    this.onLineChange = null;
    this.onStateChange = null;
    this.rate = 0.92; // Natural, relaxed human conversational pace
    this.maleVoice = null;
    this.femaleVoice = null;
    this.ambientSynth = new SolfeggioSynthesizer();
    this.ambientVolume = 0.08;
    this.useAmbience = true;

    this.assignBestNaturalVoices();
  }

  assignBestNaturalVoices() {
    if (!this.synth) return;
    const voices = getAvailableNaturalVoices();
    if (voices.length === 0) return;

    // Filter to English-only voices first
    const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    // Fallback chain helper: Neural > Google > Microsoft > Default
    const pickBest = (candidates) => {
      if (candidates.length === 0) return null;
      // Prefer Online / Natural / Neural tier
      const neural = candidates.find(v => /online|natural|neural/i.test(v.name));
      if (neural) return neural;
      // Next: Google voices
      const google = candidates.find(v => /google/i.test(v.name));
      if (google) return google;
      // Next: Microsoft voices
      const ms = candidates.find(v => /microsoft/i.test(v.name));
      if (ms) return ms;
      // Default: first available candidate
      return candidates[0];
    };

    // Best Male Voice for Atlas
    const maleCandidates = pool.filter(v =>
      /male|guy|david|george|daniel|alex|mark|christopher|james|john|google us english/i.test(v.name) &&
      !/female|jenny|zira|samantha|aria|karen|victoria/i.test(v.name)
    );
    this.maleVoice = pickBest(maleCandidates) || pickBest(pool);

    // Best Female Voice for Luna
    const femaleCandidates = pool.filter(v =>
      /female|jenny|aria|samantha|zira|karen|victoria|catherine|emma|susan/i.test(v.name)
    );
    this.femaleVoice = pickBest(femaleCandidates) || pool[1] || pool[0];
  }

  setMaleVoice(voiceObj) {
    this.maleVoice = voiceObj;
  }

  setFemaleVoice(voiceObj) {
    this.femaleVoice = voiceObj;
  }

  setAmbience(enabled) {
    this.useAmbience = enabled;
    if (!enabled && this.ambientSynth.isPlaying) {
      this.ambientSynth.stop();
    }
  }

  playScript(script, startIndex = 0) {
    if (!this.synth) return;
    this.stop();

    this.assignBestNaturalVoices();
    this.script = script;
    this.currentLineIndex = startIndex;
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true);

    // Start subtle ambient soundscape pad
    if (this.useAmbience) {
      this.ambientSynth.volume = this.ambientVolume;
      this.ambientSynth.play(432); // 432 Hz grounding pad
    }

    this.speakCurrentLine();
  }

  speakCurrentLine() {
    if (!this.isPlaying || !this.script || this.currentLineIndex >= this.script.length) {
      this.stop();
      return;
    }

    const line = this.script[this.currentLineIndex];
    if (this.onLineChange) this.onLineChange(this.currentLineIndex);

    // Apply natural speech preprocessing to the text before speaking
    const naturalText = preprocessForNaturalSpeech(line.text);

    this.utterance = new SpeechSynthesisUtterance(naturalText);

    // Vary rate slightly per line for natural cadence (±0.03 random variation)
    const rateVariation = (Math.random() - 0.5) * 0.06; // range: -0.03 to +0.03
    this.utterance.rate = this.rate + rateVariation;

    // Vary pitch slightly per line for natural cadence (±0.03 random variation)
    const pitchVariation = (Math.random() - 0.5) * 0.06; // range: -0.03 to +0.03

    // Apply voice assignments & warmth with per-line pitch variation
    if (line.gender === 'male') {
      if (this.maleVoice) this.utterance.voice = this.maleVoice;
      this.utterance.pitch = 0.95 + pitchVariation; // Warm natural pitch
    } else {
      if (this.femaleVoice) this.utterance.voice = this.femaleVoice;
      this.utterance.pitch = 1.08 + pitchVariation; // Expressive feminine pitch
    }

    // Configure utterance playback

    this.utterance.onend = () => {
      if (this.isPlaying) {
        const nextLine = this.currentLineIndex + 1 < this.script.length
          ? this.script[this.currentLineIndex + 1]
          : null;
        // Use shorter 200ms pause for same speaker's consecutive lines,
        // and a longer 650ms pause for inter-speaker transitions
        const nextIsSameSpeaker = nextLine && nextLine.speaker === line.speaker;
        const pauseMs = nextIsSameSpeaker ? 200 : 650;

        setTimeout(() => {
          if (this.isPlaying) {
            this.currentLineIndex++;
            this.speakCurrentLine();
          }
        }, pauseMs);
      }
    };

    this.utterance.onerror = (e) => {
      console.error("Speech error", e);
      this.stop();
    };

    this.synth.speak(this.utterance);
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
      this.isPlaying = false;
      if (this.ambientSynth.isPlaying) this.ambientSynth.stop();
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPlaying = true;
      if (this.useAmbience) this.ambientSynth.play(432);
      if (this.onStateChange) this.onStateChange(true);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      if (this.ambientSynth.isPlaying) this.ambientSynth.stop();
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  setRate(newRate) {
    this.rate = newRate;
    if (this.isPlaying) {
      this.speakCurrentLine();
    }
  }
}
