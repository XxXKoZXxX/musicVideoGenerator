import React, { useState } from 'react';
import { calculatePlanetaryPositions, PLANETS_META } from '../../utils/astrologyEngine';
import { calculateLifePath, calculateNameNumerology } from '../../utils/numerologyEngine';
import { getSecretLanguageProfile } from '../../data/secretLanguageData';
import { calculateBirthTarotCards } from '../../utils/tarotEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { 
  Printer, Sparkles, Star, Share2, Compass, BookOpen, 
  Hash, Award, Key, Headphones, Check, Copy, Flame, 
  Droplets, Wind, Mountain, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { shareCosmicContent } from '../../utils/mobileShare';

const DOSSIER_CHAPTERS = [
  { id: 'chap_trinity', title: 'I. Big Three Trinity', icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'chap_planets', title: 'II. 10-Planet Matrix', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'chap_elements', title: 'III. Elements & Modalities', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'chap_secret', title: 'IV. Secret Language Archetype', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'chap_numerology', title: 'V. Numerology Matrix', icon: <Hash className="w-3.5 h-3.5" /> },
  { id: 'chap_tarot', title: 'VI. Tarot Soul Blueprint', icon: <Award className="w-3.5 h-3.5" /> },
  { id: 'chap_karma', title: 'VII. Karma & Chiron', icon: <Key className="w-3.5 h-3.5" /> },
  { id: 'chap_sound', title: 'VIII. Acoustic Prescription', icon: <Headphones className="w-3.5 h-3.5" /> }
];

export default function CosmicReportView({ profile, onNavigate }) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astroData = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const lifePath = calculateLifePath(dateObj);
  const nameNum = calculateNameNumerology(profile.name);
  const secData = getSecretLanguageProfile(profile.birthMonth, profile.birthDay);
  const birthCards = calculateBirthTarotCards(dateObj);

  const [copiedFull, setCopiedFull] = useState(false);
  const [activeChapter, setActiveChapter] = useState('all');

  const handlePrint = () => {
    window.print();
  };

  const handleShareDossier = () => {
    shareCosmicContent({
      title: `${profile.name}'s Complete Cosmic Dossier | Astraea`,
      text: `📜 ${profile.name}'s Master Dossier (${secData.dateFormatted}, ${profile.birthYear} in ${profile.cityName}):\n☀️ Sun in ${astroData.planets.Sun.zodiac.sign} (House ${astroData.planets.Sun.house})\n☽ Moon in ${astroData.planets.Moon.zodiac.sign} (House ${astroData.planets.Moon.house})\n🧭 ${astroData.planets.Ascendant.zodiac.sign} Rising\n🔢 Life Path ${lifePath} (Destiny ${nameNum.expression})\n📜 Archetype: "${secData.title}"\n🃏 Personality Tarot: ${birthCards.personalityCard.name}\n🗝️ North Node: ${astroData.planets.NorthNode.zodiac.sign}`
    });
  };

  const handleCopyFullText = () => {
    const fullText = `=====================================================
ASTRAEA SOVEREIGN MASTER COSMIC DOSSIER
Profile: ${profile.name}
Birth: ${secData.dateFormatted}, ${profile.birthYear} at ${profile.birthHour || 12}:${String(profile.birthMinute || 0).padStart(2, '0')}
Location: ${profile.cityName} (${profile.lat}°, ${profile.lng}°)
=====================================================

1. SACRED ASTROLOGICAL TRINITY:
• Sun Sign: ${astroData.planets.Sun.zodiac.sign} (${astroData.planets.Sun.zodiac.formatted}) - House ${astroData.planets.Sun.house}
• Moon Sign: ${astroData.planets.Moon.zodiac.sign} (${astroData.planets.Moon.zodiac.formatted}) - House ${astroData.planets.Moon.house}
• Ascendant (Rising): ${astroData.planets.Ascendant.zodiac.sign} (${astroData.planets.Ascendant.zodiac.formatted}) - House 1

2. PLANETARY PLACEMENT MATRIX:
• Mercury: ${astroData.planets.Mercury.zodiac.formatted} in House ${astroData.planets.Mercury.house}
• Venus: ${astroData.planets.Venus.zodiac.formatted} in House ${astroData.planets.Venus.house}
• Mars: ${astroData.planets.Mars.zodiac.formatted} in House ${astroData.planets.Mars.house}
• Jupiter: ${astroData.planets.Jupiter.zodiac.formatted} in House ${astroData.planets.Jupiter.house}
• Saturn: ${astroData.planets.Saturn.zodiac.formatted} in House ${astroData.planets.Saturn.house}
• Uranus: ${astroData.planets.Uranus.zodiac.formatted} in House ${astroData.planets.Uranus.house}
• Neptune: ${astroData.planets.Neptune.zodiac.formatted} in House ${astroData.planets.Neptune.house}
• Pluto: ${astroData.planets.Pluto.zodiac.formatted} in House ${astroData.planets.Pluto.house}
• Chiron: ${astroData.planets.Chiron.zodiac.formatted} in House ${astroData.planets.Chiron.house}
• North Node: ${astroData.planets.NorthNode.zodiac.formatted} in House ${astroData.planets.NorthNode.house}

3. ELEMENTAL & MODALITY BALANCE:
• Fire: ${astroData.elements.Fire}% | Earth: ${astroData.elements.Earth}% | Air: ${astroData.elements.Air}% | Water: ${astroData.elements.Water}%
• Cardinal: ${astroData.modalities.Cardinal}% | Fixed: ${astroData.modalities.Fixed}% | Mutable: ${astroData.modalities.Mutable}%

4. SECRET LANGUAGE OF BIRTHDAYS:
• Archetype: "${secData.title}" (${secData.cusp})
• Daily Meditation: "${secData.meditation}"
• Strengths: ${secData.strengths.join(', ')}
• Shadows: ${secData.weaknesses.join(', ')}

5. PYTHAGOREAN NUMEROLOGY:
• Life Path Number: ${lifePath}
• Expression / Destiny Number: ${nameNum.expression}
• Soul Urge Number: ${nameNum.soulUrge}
• Personality Number: ${nameNum.personality}

6. TAROT BIRTH BLUEPRINT:
• Personality Birth Card: ${birthCards.personalityCard.name} ("${birthCards.personalityCard.upright}")
• Soul Birth Card: ${birthCards.soulCard.name} ("${birthCards.soulCard.upright}")

7. PAST-LIFE KARMA & DESTINY:
• North Node in ${astroData.planets.NorthNode.zodiac.sign}: Soul evolution frontier
• Chiron in ${astroData.planets.Chiron.zodiac.sign}: Sacred wounded healer mastery
`;
    navigator.clipboard.writeText(fullText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2500);
  };

  const planetKeys = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode'];

  return (
    <div className="cosmic-report-page">
      {/* Top Action Bar */}
      <div className="report-actions-bar glass-panel no-print flex justify-between items-center p-4">
        <div>
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> Sovereign Master Cosmic Dossier
          </h2>
          <p className="text-xs text-silver">Comprehensive encyclopedic synthesis of {profile.name}'s cosmic identity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyFullText} className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5">
            {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFull ? 'Copied Full Dossier!' : 'Copy Dossier Text'}</span>
          </button>
          <button onClick={handleShareDossier} className="btn-secondary text-xs py-2 px-3 rounded-xl flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-gold" />
            <span>Share</span>
          </button>
          <button onClick={handlePrint} className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5">
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Chapter Quick Jump Tabs */}
      <div className="dossier-chapter-nav glass-panel mt-3 p-2 no-print flex flex-wrap gap-1.5">
        <button 
          className={`tab-btn text-xs py-1.5 px-3 ${activeChapter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveChapter('all')}
        >
          📖 Full Dossier (All 8 Chapters)
        </button>
        {DOSSIER_CHAPTERS.map(ch => (
          <button
            key={ch.id}
            className={`tab-btn text-xs py-1.5 px-2.5 flex items-center gap-1 ${activeChapter === ch.id ? 'active' : ''}`}
            onClick={() => setActiveChapter(ch.id)}
          >
            {ch.icon}
            <span>{ch.title}</span>
          </button>
        ))}
      </div>

      {/* Printable Master Report Document Container */}
      <div className="report-printable-document glass-panel mt-4 p-6 md:p-10 border border-gold/30">
        {/* Dossier Executive Header */}
        <div className="report-header text-center pb-6 border-b border-gold/30">
          <div className="dossier-seal-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Authentic Astraea Master Registration
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-wide">
            {profile.name}
          </h1>
          <p className="report-meta text-xs md:text-sm text-silver font-semibold mt-2">
            Born {secData.dateFormatted}, {profile.birthYear} at {profile.birthHour || 12}:{String(profile.birthMinute || 0).padStart(2, '0')} {profile.amPm || 'PM'}
          </p>
          <p className="text-xs text-gold/90 mt-1">
            📍 Coordinates: {profile.cityName} ({profile.lat?.toFixed(4)}° N, {profile.lng?.toFixed(4)}° W) • Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>

        {/* ============================================================ */}
        {/* CHAPTER 1: SACRED ASTROLOGICAL TRINITY                       */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_trinity') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Star className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                I. The Sacred Astrological Trinity (Big Three)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sun */}
              <div className="triad-box p-5 glass-panel rounded-2xl border-l-4 border-l-gold">
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">☀️ Conscious Identity</span>
                <h3 className="font-serif text-xl font-bold text-white">{astroData.planets.Sun.zodiac.symbol} {astroData.planets.Sun.zodiac.sign}</h3>
                <p className="text-xs text-silver mt-1 font-semibold">{astroData.planets.Sun.zodiac.formatted} • House {astroData.planets.Sun.house}</p>
                <div className="mt-3 text-xs text-slate-200 leading-relaxed">
                  Your Sun in {astroData.planets.Sun.zodiac.sign} ({astroData.planets.Sun.zodiac.element} / {astroData.planets.Sun.zodiac.modality}) gives you essential vitality, core purpose, and creative stamina. In House {astroData.planets.Sun.house}, your life shines brightest when taking sovereign charge of your personal sphere.
                </div>
              </div>

              {/* Moon */}
              <div className="triad-box p-5 glass-panel rounded-2xl border-l-4 border-l-slate-300">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">🌙 Subconscious Sanctuary</span>
                <h3 className="font-serif text-xl font-bold text-white">{astroData.planets.Moon.zodiac.symbol} {astroData.planets.Moon.zodiac.sign}</h3>
                <p className="text-xs text-silver mt-1 font-semibold">{astroData.planets.Moon.zodiac.formatted} • House {astroData.planets.Moon.house}</p>
                <div className="mt-3 text-xs text-slate-200 leading-relaxed">
                  Your Moon in {astroData.planets.Moon.zodiac.sign} ({astroData.planets.Moon.zodiac.element}) reveals your instinctive emotional needs and intuitive sanctuary. In House {astroData.planets.Moon.house}, you recharge through deep emotional truth and trusted intimacy.
                </div>
              </div>

              {/* Ascendant */}
              <div className="triad-box p-5 glass-panel rounded-2xl border-l-4 border-l-cyan">
                <span className="text-xs font-bold text-cyan uppercase tracking-wider block mb-1">🧭 The Sovereign Mask</span>
                <h3 className="font-serif text-xl font-bold text-white">{astroData.planets.Ascendant.zodiac.symbol} {astroData.planets.Ascendant.zodiac.sign}</h3>
                <p className="text-xs text-silver mt-1 font-semibold">{astroData.planets.Ascendant.zodiac.formatted} • House 1</p>
                <div className="mt-3 text-xs text-slate-200 leading-relaxed">
                  Your Ascendant in {astroData.planets.Ascendant.zodiac.sign} dictates your outward aura, physical carriage, and first impression. You project an authentic, magnetic energy that commands respect and natural curiosity.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 2: COMPLETE 10-PLANET NATAL MATRIX & ASPECTS         */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_planets') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Compass className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                II. Complete 10-Planet Placement Matrix & Houses
              </h2>
            </div>

            {/* Planets Table */}
            <div className="overflow-x-auto">
              <table className="report-table w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gold uppercase tracking-wider bg-white/5">
                    <th className="p-3">Celestial Body</th>
                    <th className="p-3">Zodiac Sign & Degrees</th>
                    <th className="p-3">House</th>
                    <th className="p-3">Element / Modality</th>
                    <th className="p-3">Esoteric Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {planetKeys.map(k => {
                    const p = astroData.planets[k];
                    const meta = PLANETS_META[k] || {};
                    return (
                      <tr key={k} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span style={{ color: meta.color || '#F59E0B' }}>{p.symbol}</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3 font-semibold text-white/90">{p.zodiac.formatted}</td>
                        <td className="p-3 text-cyan font-bold">House {p.house}</td>
                        <td className="p-3 text-silver">{p.zodiac.element} • {p.zodiac.modality}</td>
                        <td className="p-3 text-slate-300">{meta.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Major Planetary Aspects Summary */}
            {astroData.aspects && astroData.aspects.length > 0 && (
              <div className="aspects-summary-box mt-4 p-4 glass-panel rounded-2xl">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">⚡ Major Active Aspects in Chart:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {astroData.aspects.slice(0, 9).map((asp, idx) => (
                    <div key={idx} className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-xs">
                      <div className="flex justify-between">
                        <strong className="text-white">{asp.p1} {asp.aspectSymbol} {asp.p2}</strong>
                        <span className="text-gold text-[10px] font-bold">{asp.aspect}</span>
                      </div>
                      <span className="text-[11px] text-silver block mt-0.5">{asp.nature} ({asp.orb}° orb)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 3: ELEMENTAL & MODALITY ENERGETIC EQUILIBRIUM        */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_elements') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Flame className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                III. Elemental Distribution & Modality Dynamics
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Elements Progress Bars */}
              <div className="glass-panel p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">🔥 The 4 Classical Elements:</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-rose-400"><Flame className="w-3.5 h-3.5" /> Fire (Passion & Drive)</span>
                      <span className="text-rose-400 font-bold">{astroData.elements.Fire}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${astroData.elements.Fire}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-400"><Mountain className="w-3.5 h-3.5" /> Earth (Structure & Practicality)</span>
                      <span className="text-emerald-400 font-bold">{astroData.elements.Earth}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${astroData.elements.Earth}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-cyan"><Wind className="w-3.5 h-3.5" /> Air (Intellect & Communication)</span>
                      <span className="text-cyan font-bold">{astroData.elements.Air}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan rounded-full" style={{ width: `${astroData.elements.Air}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-blue-400"><Droplets className="w-3.5 h-3.5" /> Water (Emotion & Intuition)</span>
                      <span className="text-blue-400 font-bold">{astroData.elements.Water}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${astroData.elements.Water}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modalities */}
              <div className="glass-panel p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-cyan uppercase tracking-wider mb-3">⚖️ Modality Quadruplicities:</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-white">Cardinal (Initiating Action)</span>
                      <span className="text-gold font-bold">{astroData.modalities.Cardinal}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${astroData.modalities.Cardinal}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-white">Fixed (Sustained Focus & Stamina)</span>
                      <span className="text-cyan font-bold">{astroData.modalities.Fixed}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan rounded-full" style={{ width: `${astroData.modalities.Fixed}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-white">Mutable (Flexibility & Wisdom)</span>
                      <span className="text-purple font-bold">{astroData.modalities.Mutable}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple rounded-full" style={{ width: `${astroData.modalities.Mutable}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 4: SECRET LANGUAGE OF BIRTHDAYS ARCHETYPE            */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_secret') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <BookOpen className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                IV. Secret Language of Birthdays Comprehensive Archetype
              </h2>
            </div>

            <div className="report-callout glass-panel p-6 rounded-2xl border-l-4 border-l-gold">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Day Archetype</span>
                  <h3 className="font-serif text-2xl text-white font-bold mt-1">"{secData.title}"</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold">
                  {secData.cusp}
                </span>
              </div>

              <p className="text-xs text-silver mt-1"><strong>Date & Decan:</strong> {secData.dateFormatted} • {secData.rulerText}</p>
              
              <div className="personality-full-text text-xs text-slate-200 leading-relaxed mt-4 whitespace-pre-line">
                {secData.personalityText}
              </div>

              {/* Strengths & Shadows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">
                <div className="p-4 bg-black/40 rounded-xl border border-emerald-500/20">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Core Innate Strengths
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {secData.strengths.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-black/40 rounded-xl border border-rose-500/20">
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sacred Shadow & Growth Areas
                  </h5>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {secData.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-rose-400">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <blockquote className="report-quote mt-5 p-4 rounded-xl bg-gold/10 border-l-4 border-l-gold text-xs text-gold italic">
                <strong>✨ Sacred Day Meditation:</strong> "{secData.meditation}"
              </blockquote>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 5: PYTHAGOREAN NUMEROLOGY MATRIX                     */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_numerology') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Hash className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                V. Complete Pythagorean Numerology Matrix
              </h2>
            </div>

            <table className="report-table w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-gold uppercase tracking-wider bg-white/5">
                  <th className="p-3">Core Vibrational Number</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Metaphysical Significance & Life Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3 font-bold text-white">Life Path Number</td>
                  <td className="p-3 font-serif font-bold text-base text-gold">{lifePath}</td>
                  <td className="p-3 text-slate-200">The master vector of your lifetime incarnation. Dictates opportunities, primary life challenges, and leadership legacy.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Expression / Destiny Number</td>
                  <td className="p-3 font-serif font-bold text-base text-cyan">{nameNum.expression}</td>
                  <td className="p-3 text-slate-200">Calculated from full birth name. Reveals natural talents, vocational skills, and physical-world manifestation potential.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Soul Urge (Heart's Desire)</td>
                  <td className="p-3 font-serif font-bold text-base text-rose-400">{nameNum.soulUrge}</td>
                  <td className="p-3 text-slate-200">Derived from vowel frequencies. Unveils secret private cravings, romantic fulfillment needs, and spiritual motivations.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Personality Number</td>
                  <td className="p-3 font-serif font-bold text-base text-purple">{nameNum.personality}</td>
                  <td className="p-3 text-slate-200">Derived from consonant frequencies. Dictates how the outer world initially perceives you before intimate closeness.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Birthday Number</td>
                  <td className="p-3 font-serif font-bold text-base text-emerald-400">{profile.birthDay}</td>
                  <td className="p-3 text-slate-200">Innate natural gift bestowed at birth to assist in fulfilling your Life Path mission.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 6: TAROT SOUL CONTRACT & BIRTH CARDS                 */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_tarot') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Award className="w-5 h-5 text-purple" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                VI. Tarot Soul Contract & Major Arcana Blueprint
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="tarot-card-minibox p-5 glass-panel rounded-2xl border-l-4 border-l-gold">
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">🃏 Personality Card</span>
                <h4 className="font-serif text-lg font-bold text-white">{birthCards.personalityCard.name}</h4>
                <p className="text-xs text-cyan font-semibold mt-0.5">"{birthCards.personalityCard.keywords.join(' • ')}"</p>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">{birthCards.personalityCard.upright}</p>
                <div className="mt-3 text-[11px] text-silver pt-2 border-t border-white/10">
                  <strong>Symbolism:</strong> {birthCards.personalityCard.symbolism || 'Archetype of sovereign manifestation.'}
                </div>
              </div>

              <div className="tarot-card-minibox p-5 glass-panel rounded-2xl border-l-4 border-l-cyan">
                <span className="text-xs font-bold text-cyan uppercase tracking-wider block mb-1">✨ Soul Essence Card</span>
                <h4 className="font-serif text-lg font-bold text-white">{birthCards.soulCard.name}</h4>
                <p className="text-xs text-gold font-semibold mt-0.5">"{birthCards.soulCard.keywords.join(' • ')}"</p>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">{birthCards.soulCard.upright}</p>
                <div className="mt-3 text-[11px] text-silver pt-2 border-t border-white/10">
                  <strong>Soul Mission:</strong> Transcending worldly illusions into timeless wisdom.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 7: PAST-LIFE KARMA & CHIRON WOUNDED HEALER           */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_karma') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Key className="w-5 h-5 text-purple" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                VII. Past-Life Karma, North Node & Chiron Wounded Healer
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-gold">
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">☊ North Node in {astroData.planets.NorthNode.zodiac.sign}</span>
                <h4 className="font-serif text-base font-bold text-white">Your Evolutionary Soul Destiny</h4>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  Your North Node in {astroData.planets.NorthNode.zodiac.sign} (House {astroData.planets.NorthNode.house}) represents the uncharted spiritual frontier you incarnated to master. Moving away from past-life comfort zones towards {astroData.planets.NorthNode.zodiac.sign} themes unlocks monumental blessings and spiritual sovereignty.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple">
                <span className="text-xs font-bold text-purple uppercase tracking-wider block mb-1">⚷ Chiron in {astroData.planets.Chiron.zodiac.sign}</span>
                <h4 className="font-serif text-base font-bold text-white">The Sacred Wounded Healer Gift</h4>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  Chiron in {astroData.planets.Chiron.zodiac.sign} marks the area of soul vulnerability that transforms into your greatest medicine. By healing your own relationship with {astroData.planets.Chiron.zodiac.sign} themes, you become an empowering catalyst for others.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CHAPTER 8: ACOUSTIC PRESCRIPTION & SOVEREIGN CREED          */}
        {/* ============================================================ */}
        {(activeChapter === 'all' || activeChapter === 'chap_sound') && (
          <div className="report-section mt-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Headphones className="w-5 h-5 text-cyan" />
              <h2 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                VIII. Personal Soundscape & Acoustic Bio-Resonance Prescription
              </h2>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-gold font-bold block mb-1">🌿 Core Solfeggio Tone:</span>
                  <strong className="text-sm text-white block">
                    {astroData.planets.Sun.zodiac.element === 'Fire' ? '528 Hz (Miracle Transformation)' : 
                     astroData.planets.Sun.zodiac.element === 'Earth' ? '432 Hz (Universal Cosmic Peace)' :
                     astroData.planets.Sun.zodiac.element === 'Air' ? '639 Hz (Heart Harmony)' : '741 Hz (Detox & Intuition)'}
                  </strong>
                  <span className="text-silver text-[11px] block mt-1">Calibrated to your natal Sun in {astroData.planets.Sun.zodiac.sign}.</span>
                </div>

                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-cyan font-bold block mb-1">🧠 Recommended Brainwave Beat:</span>
                  <strong className="text-sm text-white block">Alpha 10.0 Hz / Schumann 7.83 Hz</strong>
                  <span className="text-silver text-[11px] block mt-1">Ideal for flow state study, stress relief, and nervous system reset.</span>
                </div>

                <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-purple font-bold block mb-1">🪐 Cosmic Octave Planet Tone:</span>
                  <strong className="text-sm text-white block">136.1 Hz (Sacred OM / Earth Year)</strong>
                  <span className="text-silver text-[11px] block mt-1">Dissolves mental chatter and anchors spiritual presence.</span>
                </div>
              </div>

              {/* Sovereign Creed */}
              <div className="sovereign-creed-box mt-6 p-5 rounded-2xl bg-gradient-to-r from-gold/10 via-slate-900/90 to-cyan/10 border border-gold/40 text-center">
                <h4 className="font-serif text-lg font-bold text-gold mb-2">📜 The Sovereign Living Creed for {profile.name}</h4>
                <p className="text-xs text-slate-200 max-w-2xl mx-auto italic leading-relaxed">
                  "I walk as a conscious sovereign creator of my reality. Grounded in my {astroData.planets.Sun.zodiac.sign} fire, guided by my {astroData.planets.Moon.zodiac.sign} intuition, and aligned with Life Path {lifePath}, I transmute all challenges into sacred wisdom."
                </p>
                <div className="mt-4 text-[11px] text-silver font-mono">
                  ASTRAEA VERIFIED • REGISTRATION ID: #{profile.id.toUpperCase().slice(0, 10)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="synastry" 
          prevLabel="Dual Comparison Matrix" 
          nextView="overview" 
          nextLabel="Dashboard Home" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
