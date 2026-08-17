import React, { useState, useEffect, useRef } from 'react';
import { 
  getWordOfTheDay, 
  MASTER_QUOTES, 
  PLANETARY_METALS, 
  MAGNUM_OPUS_STAGES,
  SOUL_CONNECTION_TYPES,
  TANTRIC_ENERGY_POLARITIES,
  SPELLCRAFT_ENCYCLOPEDIA,
  GODS_AND_GODDESSES,
  SPIRIT_REALM_GUIDES,
  SPIRITUAL_PROTECTION_GRIMOIRE,
  PALMISTRY_LINES,
  REFLEXOLOGY_ZONES,
  PRANAYAMA_BREATHWORK_SUITE,
  SOUL_TYPES_AND_STARSEEDS,
  calculateVitalityMatrix,
  SPIRITUAL_BANISHING_SUITE,
  SUPERSTITIONS_ENCYCLOPEDIA
} from '../../utils/grimoireEngine';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { 
  BookOpen, Sparkles, Flame, Heart, Radio, 
  Sun, Copy, Check, Play, Square, 
  Zap, Feather, Shield, CheckCircle2, Info, Eye
} from 'lucide-react';

export default function GrimoireView({ profile, onNavigate }) {
  const [activePortal, setActivePortal] = useState('philosophy'); 
  // 'philosophy' | 'spells' | 'alchemy' | 'soulmates' | 'pantheons' | 'guides' | 'spiritbox' | 'palmistry' | 'kundalini' | 'vitality'

  const [copiedId, setCopiedId] = useState(null);

  // Word of the Day & Quotes
  const wordOfTheDay = getWordOfTheDay();

  // Astrology Data for Vitality Matrix
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astroData = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const vitality = calculateVitalityMatrix(profile, astroData);

  // -------------------------------------------------------------
  // Spirit Box ITC Audio Synthesizer State
  // -------------------------------------------------------------
  const [isSpiritBoxActive, setIsSpiritBoxActive] = useState(false);
  const sweepSpeed = 150; // ms per sweep
  const [spiritLog, setSpiritLog] = useState([
    { time: 'System Ready', message: 'Spirit Box frequency scanner attuned to 432 Hz carrier wave.' }
  ]);
  const audioCtxRef = useRef(null);
  const sweepTimerRef = useRef(null);

  const startSpiritBox = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      setIsSpiritBoxActive(true);

      const spiritPhrases = [
        "Light guides the way...", "Ancestors present...", "Unconditional love...", 
        "Release fear...", "432 Hz aligned...", "The door is open...", "Soul harmony..."
      ];

      sweepTimerRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;

        // White noise static pulse
        const bufferSize = audioCtxRef.current.sampleRate * 0.08;
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtxRef.current.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 200 + Math.random() * 3000;
        filter.Q.value = 3;

        const gain = audioCtxRef.current.createGain();
        gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        noise.start();

        // Random psychic spirit hit
        if (Math.random() < 0.18) {
          const hit = spiritPhrases[Math.floor(Math.random() * spiritPhrases.length)];
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setSpiritLog(prev => [{ time: now, message: `📡 [Signal Match]: "${hit}"` }, ...prev.slice(0, 8)]);
        }
      }, sweepSpeed);
    } catch (e) {
      console.error("AudioContext error:", e);
    }
  };

  const stopSpiritBox = () => {
    setIsSpiritBoxActive(false);
    if (sweepTimerRef.current) clearInterval(sweepTimerRef.current);
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
    }
  };

  useEffect(() => {
    return () => {
      if (sweepTimerRef.current) clearInterval(sweepTimerRef.current);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // -------------------------------------------------------------
  // Pranayama Breathwork Timer State
  // -------------------------------------------------------------
  const [activeBreath, setActiveBreath] = useState(PRANAYAMA_BREATHWORK_SUITE[0]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale (4s)');
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    let timer = null;
    if (isBreathing) {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              if (curr.startsWith('Inhale')) return 'Hold (4s)';
              if (curr.startsWith('Hold') && curr.includes('4s')) return 'Exhale (4s)';
              if (curr.startsWith('Exhale')) return 'Hold Empty (4s)';
              return 'Inhale (4s)';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathing]);

  const [banishingTab, setBanishingTab] = useState('methods'); // 'methods' | 'chants'
  const [superstitionFilter, setSuperstitionFilter] = useState('all'); // 'all' | 'false' | 'practical' | 'energetic'

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const portals = [
    { id: 'philosophy', label: '🏛️ Philosophy & Quotes', desc: 'Socrates, Buddha, Jung, Freud & Daily Word' },
    { id: 'banishing', label: '🛡️ Spirit Banishing & Chants', desc: '6 Eviction Methods, Black Salt & Chants' },
    { id: 'superstitions', label: '🧿 Superstitions & Reality', desc: 'Origins, Truth Likelihood vs Debunked Myths' },
    { id: 'spells', label: '🔮 Spellcraft & Jars', desc: 'Spell Jars, Honey Bottles, Poppets & Candles' },
    { id: 'alchemy', label: '💫 Manifestation & Alchemy', desc: '369 Method, 7 Planetary Metals & Magnum Opus' },
    { id: 'soulmates', label: '🧬 Soulmates & Tantra', desc: 'Twin Flames, Red String & Kama Sutra Polarities' },
    { id: 'pantheons', label: '🌌 Pantheons & Deities', desc: 'Greek, Egyptian, Norse & Celtic Myths' },
    { id: 'guides', label: '🕊️ Angels & Spirit Animals', desc: 'Archangels, Ancestor Altars & Totems' },
    { id: 'spiritbox', label: '📻 Spirit Box & Wards', desc: 'ITC Audio Scanner & Demonology Protections' },
    { id: 'palmistry', label: '✋ Palmistry & Reflexology', desc: 'Hand Lines, Reflexology & Hot Stones' },
    { id: 'kundalini', label: '🐍 Kundalini & Breathwork', desc: 'Pranayama Pacer, Chakras & Yoga' },
    { id: 'vitality', label: '⏳ Starseeds & Vitality', desc: 'Soul Types, Life Path & Vitality Matrix' }
  ];

  return (
    <div className="grimoire-super-page space-y-6">
      {/* Header */}
      <div className="view-header glass-panel">
        <div className="view-title">
          <BookOpen className="title-icon text-gold animate-pulse" />
          <div>
            <h2>Grand Esoteric Grimoire & Occult Super-Encyclopedia</h2>
            <p>12 Portals of Ancient Wisdom: Spirit Banishing, Superstition Matrix, Philosophy, Spellcraft, Alchemy, Deities & Kundalini</p>
          </div>
        </div>

        {/* 12-Portal Scrollable Navigation Bar */}
        <div className="tab-pill-nav flex flex-wrap gap-1.5 mt-3">
          {portals.map(p => (
            <button
              key={p.id}
              className={`tab-btn ${activePortal === p.id ? 'active' : ''}`}
              onClick={() => setActivePortal(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* PORTAL 1: PHILOSOPHY, JUNG, BUDDHA & WORD OF THE DAY         */}
      {/* ============================================================ */}
      {activePortal === 'philosophy' && (
        <div className="space-y-6">
          {/* Word of the Day Card */}
          <div className="glass-panel p-6 rounded-2xl border border-gold/40 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-black/80">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-xs font-bold text-gold uppercase tracking-wider">Daily Esoteric Word of the Day</span>
              </div>
              <span className="text-xs font-mono text-cyan bg-cyan/10 px-2.5 py-0.5 rounded-full border border-cyan/20">
                {wordOfTheDay.origin}
              </span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-white mb-1">{wordOfTheDay.word}</h3>
            <p className="text-xs text-silver font-mono mb-3">Pronunciation: /{wordOfTheDay.pronunciation}/</p>
            <p className="text-sm text-slate-100 leading-relaxed mb-4">{wordOfTheDay.meaning}</p>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-amber-200 flex items-center gap-2">
              <Feather className="w-4 h-4 text-gold flex-shrink-0" />
              <span><strong>Daily Soul Practice:</strong> {wordOfTheDay.practice}</span>
            </div>
          </div>

          {/* Master Philosophers Library */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan" /> Library of the Masters: Socrates, Buddha, Jung, Freud & Aristotle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MASTER_QUOTES.map((q, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-gold/40 transition-all">
                  <div>
                    <span className="text-[10px] text-cyan uppercase font-bold px-2 py-0.5 rounded-full bg-cyan/10">
                      {q.category}
                    </span>
                    <p className="text-sm text-white font-serif italic mt-3 leading-relaxed">"{q.quote}"</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <strong className="text-gold">— {q.author}</strong>
                    <button 
                      onClick={() => handleCopy(`quote_${idx}`, `"${q.quote}" — ${q.author}`)}
                      className="text-silver hover:text-gold"
                    >
                      {copiedId === `quote_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL: SPIRIT BANISHING, ENTITY REMOVAL & PROTECTIVE CHANTS */}
      {/* ============================================================ */}
      {activePortal === 'banishing' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-slate-900/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white mb-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" /> Sacred Entity Banishing, Warding & Protective Chants Suite
                </h3>
                <p className="text-xs text-silver leading-relaxed">
                  Time-tested ceremonial methods to cleanse hostile spirits, sever psychic cords, seal spatial boundaries, and speak sovereign protection incantations.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBanishingTab('methods')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    banishingTab === 'methods' 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                      : 'bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
                >
                  🌿 6 Banishing Protocols
                </button>
                <button
                  onClick={() => setBanishingTab('chants')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    banishingTab === 'chants' 
                      ? 'bg-gold text-slate-950 shadow-lg shadow-gold/30' 
                      : 'bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:text-amber-300 hover:bg-amber-400/10'
                  }`}
                >
                  📜 Protective Chants & Spells
                </button>
              </div>
            </div>
          </div>

          {/* Banishing Methods Tab */}
          {banishingTab === 'methods' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SPIRITUAL_BANISHING_SUITE.methods.map(m => (
                <div key={m.id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                      <span className="text-lg">{m.icon}</span> {m.title}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {m.potency}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-300">
                    <strong>🔑 Key Ingredients / Tools:</strong> {m.herbs}
                  </div>

                  <div className="space-y-1 text-xs text-slate-200">
                    <strong className="text-gold text-[11px] uppercase tracking-wider block">Step-by-Step Ritual Protocol:</strong>
                    <p className="whitespace-pre-line text-slate-300 text-xs leading-relaxed pl-2 border-l-2 border-rose-500/30">
                      {m.protocol}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-cyan flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span><strong>Esoteric Mechanism:</strong> {m.mechanism}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Protective Chants & Incantations Tab */}
          {banishingTab === 'chants' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SPIRITUAL_BANISHING_SUITE.chants.map(c => (
                  <div key={c.id} className="glass-panel p-5 rounded-2xl border border-gold/30 bg-slate-950/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-cyan uppercase font-bold px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20">
                          {c.tradition}
                        </span>
                        <button
                          onClick={() => handleCopy(c.id, c.text)}
                          className="flex items-center gap-1 text-xs text-slate-300 hover:text-amber-300 transition-colors px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/60"
                          title="Copy Chant to Clipboard"
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 text-[10px]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Copy Spoken Chant</span>
                            </>
                          )}
                        </button>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-gold mb-1">{c.title}</h4>
                      <p className="text-[11px] text-silver mb-3 italic">🎯 Purpose: {c.purpose}</p>
                      
                      <div className="p-4 rounded-xl bg-black/60 border border-gold/20 text-slate-100 font-serif text-xs leading-relaxed whitespace-pre-line italic">
                        "{c.text}"
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Speak aloud 3 times with steady breath & unwavering authority.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL: SUPERSTITIONS, HISTORICAL ORIGINS & REALITY MATRIX   */}
      {/* ============================================================ */}
      {activePortal === 'superstitions' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyan/30 bg-slate-900/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white mb-1 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan" /> Superstitions & Folklore: Historical Origins & Reality Matrix
                </h3>
                <p className="text-xs text-silver leading-relaxed">
                  Discover where famous superstitions originated in ancient history, and explore the objective truth: which are debunked myths versus which are rooted in genuine physical safety, psychology, or subtle energetics.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All (12)' },
                  { id: 'false', label: '❌ Proven False' },
                  { id: 'practical', label: '🔬 Practical & Safety Truth' },
                  { id: 'energetic', label: '✨ Subtle Energetic / Psych' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSuperstitionFilter(f.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      superstitionFilter === f.id
                        ? 'bg-cyan text-slate-950 shadow-md shadow-cyan/20'
                        : 'bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Superstitions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SUPERSTITIONS_ENCYCLOPEDIA
              .filter(s => {
                if (superstitionFilter === 'false') return s.statusBadge === 'PROVEN FALSE';
                if (superstitionFilter === 'practical') return s.statusBadge.includes('PRACTICAL') || s.statusBadge.includes('HYGIENIC');
                if (superstitionFilter === 'energetic') return s.statusBadge.includes('ENERGETIC') || s.statusBadge.includes('PSYCHOLOGICAL') || s.statusBadge.includes('ALCHEMICAL') || s.statusBadge.includes('NEUROLOGICAL');
                return true;
              })
              .map(s => (
                <div key={s.id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan/40 transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                        <span className="text-xl">{s.icon}</span> {s.name}
                      </h4>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                        {s.statusBadge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic">"{s.summary}"</p>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1">
                      <strong className="text-gold text-[11px] uppercase tracking-wider block">🏛️ Historical & Cultural Origin:</strong>
                      <p className="text-slate-300 leading-relaxed">{s.origin}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan/20 text-xs text-cyan-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-cyan text-[11px] uppercase tracking-wider">🔬 Modern Reality & Scientific Verdict:</strong>
                        <span className="text-[10px] text-amber-300 font-mono font-bold">Likelihood: {s.truthLikelihood}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{s.verdict}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 2: SPELLCRAFT, SPELL JARS, POPPETS & FOLK MAGIC       */}
      {/* ============================================================ */}
      {activePortal === 'spells' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyan/30 bg-slate-900/80">
            <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-gold" /> Traditional Spellcraft, Jars, Mojo Bags & Poppet Grimoire
            </h3>
            <p className="text-xs text-silver leading-relaxed">
              Ancient sympathetic magic, herbal alchemy, candle dressing, and protective poppets honoring the principle: <em>"As you weave, so the universe weaves around you."</em>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPELLCRAFT_ENCYCLOPEDIA.map((spell) => (
              <div key={spell.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-serif font-bold text-gold">{spell.name}</h4>
                  <span className="text-[10px] text-cyan uppercase font-mono px-2 py-0.5 rounded-full bg-cyan/10">
                    {spell.type}
                  </span>
                </div>

                <div className="text-[11px] text-silver font-mono">
                  ⏱️ <strong>Best Timing:</strong> {spell.timing}
                </div>

                <div>
                  <strong className="text-xs text-white block mb-1">🌿 Required Ingredients:</strong>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                    {spell.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-200">
                  <strong className="text-cyan block mb-1">📜 Ritual Instructions:</strong>
                  <p className="text-[11px] leading-relaxed">{spell.instructions}</p>
                </div>

                <div className="text-[10px] text-emerald-400 font-semibold">
                  🛡️ {spell.ethics}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 3: MANIFESTATION, TRANSMUTATION & 7 PLANETARY METALS  */}
      {/* ============================================================ */}
      {activePortal === 'alchemy' && (
        <div className="space-y-6">
          {/* Manifestation Formulas */}
          <div className="glass-panel p-6 rounded-2xl border border-gold/30 space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold" /> Master Manifestation & Sexual Energy Transmutation Formulas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <strong className="text-gold text-sm block">⚡ 3-6-9 Tesla Method</strong>
                <p className="text-slate-300">Write your manifestation 3 times in the morning, 6 times in the afternoon, and 9 times before sleep for 33 consecutive days.</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <strong className="text-cyan text-sm block">👁️ Neville's Law of Assumption</strong>
                <p className="text-slate-300">Assume the feeling of the wish fulfilled in the State Akin To Sleep (SATS) until it hardens into 3D physical reality.</p>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <strong className="text-rose-400 text-sm block">🔥 Sexual Energy Transmutation</strong>
                <p className="text-slate-300">Channel primal creative kundalini energy upward from the sacral chakra into artistic genius, business empire, or spiritual illumination.</p>
              </div>
            </div>
          </div>

          {/* 7 Planetary Metals */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider">
              🪙 The 7 Sacred Planetary Metals & Esoteric Correspondence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PLANETARY_METALS.map((m, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-sm text-gold font-serif">{m.metal}</strong>
                    <span className="text-[10px] text-cyan font-bold">{m.planet}</span>
                  </div>
                  <span className="text-[11px] text-silver block">{m.chakra}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Magnum Opus 4 Stages */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan uppercase tracking-wider">
              🦅 Magnum Opus: The 4 Stages of the Great Alchemical Work
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {MAGNUM_OPUS_STAGES.map((st, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-gold block">{st.stage}</span>
                  <span className="text-[11px] text-cyan block">{st.symbol}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{st.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 4: SOULMATES, TWIN FLAMES, RED STRING & TANTRA         */}
      {/* ============================================================ */}
      {activePortal === 'soulmates' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-pink-500/30 space-y-3">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Types of Soul Connections & The Red String of Fate
            </h3>
            <p className="text-xs text-silver">
              Exploring the sacred spectrum of human soul resonance: Twin Flames, Karmics, Companion Soulmates, and the mythical Red String of Fate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOUL_CONNECTION_TYPES.map((sc, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-serif font-bold text-gold">{sc.type}</h4>
                  <span className="text-[10px] text-rose-300 font-mono px-2 py-0.5 rounded-full bg-rose-500/10">
                    {sc.frequency}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{sc.desc}</p>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] text-cyan">
                  🎯 <strong>Soul Purpose:</strong> {sc.purpose}
                </div>
              </div>
            ))}
          </div>

          {/* Tantric & Kama Sutra Polarities */}
          <div className="glass-panel p-6 rounded-2xl border border-purple/30 space-y-4">
            <h3 className="text-sm font-bold text-purple uppercase tracking-wider flex items-center gap-2">
              🔥 Kama Sutra & Sacred Tantric Energy Polarities (Shiva & Shakti)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TANTRIC_ENERGY_POLARITIES.map((tp, idx) => (
                <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                  <strong className="text-xs text-gold block">{tp.title}</strong>
                  <span className="text-[10px] text-cyan uppercase block">{tp.element}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{tp.principle}</p>
                  <div className="text-[11px] text-rose-300 font-medium pt-2 border-t border-white/5">
                    ✨ <strong>Practice:</strong> {tp.practice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 5: PANTHEONS, GODS & GODDESSES                       */}
      {/* ============================================================ */}
      {activePortal === 'pantheons' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyan/30">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-gold" /> Universal Pantheons: Greek, Egyptian, Norse & Celtic Deities
            </h3>
            <p className="text-xs text-silver mt-1">
              Ancient archetypal deities and sacred myths representing cosmic laws, divine virtues, and psychological powers within the human spirit.
            </p>
          </div>

          <div className="space-y-6">
            {GODS_AND_GODDESSES.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-sm font-serif font-bold text-gold tracking-wide">{group.pantheon}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.deities.map((d, dIdx) => (
                    <div key={dIdx} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-sm text-white font-serif">{d.name}</strong>
                        <span className="text-[10px] text-cyan font-mono">{d.symbols}</span>
                      </div>
                      <span className="text-xs text-gold block font-semibold">{d.role}</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{d.myth}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 6: ANGELS, ANCESTORS & SPIRIT ANIMALS                */}
      {/* ============================================================ */}
      {activePortal === 'guides' && (
        <div className="space-y-6">
          {/* Archangels */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              👼 The 4 Supreme Archangels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SPIRIT_REALM_GUIDES.archangels.map((ang, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
                  <strong className="text-sm text-gold block">{ang.name}</strong>
                  <span className="text-[11px] text-cyan block">{ang.ray}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{ang.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ancestor Veneration Altar */}
          <div className="glass-panel p-6 rounded-2xl border border-purple/30 space-y-3">
            <h3 className="text-sm font-bold text-purple uppercase tracking-wider flex items-center gap-2">
              🕯️ Ancestral Veneration & Lineage Altar Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-xs text-white block mb-2">Altar Sacred Elements:</strong>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {SPIRIT_REALM_GUIDES.ancestorVeneration.altalElements || SPIRIT_REALM_GUIDES.ancestorVeneration.altarElements.map((el, i) => (
                    <li key={i}>{el}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-200">
                <strong className="text-gold block mb-1">Ancestral Blessing Invocational Words:</strong>
                <p className="text-[11px] leading-relaxed italic">{SPIRIT_REALM_GUIDES.ancestorVeneration.ritual}</p>
              </div>
            </div>
          </div>

          {/* Spirit Animals */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan uppercase tracking-wider">
              🐾 30+ Spirit Animal Totems & Messages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SPIRIT_REALM_GUIDES.spiritAnimals.map((sa, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-1.5">
                  <strong className="text-sm text-gold block">{sa.animal}</strong>
                  <span className="text-[11px] text-cyan block font-semibold">{sa.power}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{sa.lesson}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 7: SPIRIT BOX ITC & DEMONOLOGY WARDS                 */}
      {/* ============================================================ */}
      {activePortal === 'spiritbox' && (
        <div className="space-y-6">
          {/* Virtual Spirit Box ITC Scanner */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/40 bg-black/90 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <Radio className="w-6 h-6 text-cyan animate-pulse" />
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Instrumental Transcommunication (Spirit Box) Simulator</h3>
                  <p className="text-xs text-silver">Live 432 Hz carrier wave with static sweep and intuitive speech synthesizer</p>
                </div>
              </div>

              <button
                onClick={isSpiritBoxActive ? stopSpiritBox : startSpiritBox}
                className={`text-xs py-2.5 px-6 rounded-xl font-bold flex items-center gap-2 ${isSpiritBoxActive ? 'bg-rose-500 text-white' : 'btn-gold'}`}
              >
                {isSpiritBoxActive ? <><Square className="w-4 h-4" /> Stop Scanner</> : <><Play className="w-4 h-4" /> Start Spirit Box</>}
              </button>
            </div>

            {/* Live Signal Feed */}
            <div className="p-4 bg-slate-950 rounded-xl border border-cyan/30 font-mono text-xs text-cyan space-y-1.5 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between text-silver border-b border-white/10 pb-1 text-[10px]">
                <span>Status: {isSpiritBoxActive ? 'SCANNING (150ms Sweep)' : 'OFFLINE'}</span>
                <span>Carrier: 432 Hz Harmonic</span>
              </div>
              {spiritLog.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-silver">[{log.time}]</span>
                  <span className="text-emerald-400">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spiritual Protection & LBRP Grimoire */}
          <div className="glass-panel p-6 rounded-2xl border border-gold/30 space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              🛡️ The Lesser Banishing Ritual of the Pentagram (LBRP) & Demonology Protection Wards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SPIRITUAL_PROTECTION_GRIMOIRE.lbrpSteps.map((st, idx) => (
                <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1.5">
                  <strong className="text-xs text-gold block">{st.step}</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">{st.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 8: PALMISTRY, REFLEXOLOGY & HOT STONES               */}
      {/* ============================================================ */}
      {activePortal === 'palmistry' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gold/30">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              ✋ Palmistry (Chiromancy), Reflexology & Hot Stone Therapy
            </h3>
            <p className="text-xs text-silver mt-1">
              Decoding the sacred lines of destiny on your palms and restoring vital body meridians through somatic zone reflexology.
            </p>
          </div>

          {/* Palm Lines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider">🖐️ Major Palm Lines & Clairvoyant Marks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PALMISTRY_LINES.map((pl, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
                  <strong className="text-xs text-cyan block">{pl.line}</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">{pl.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reflexology & Hot Stones */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-cyan uppercase tracking-wider">🦶 Foot Reflexology Zones & Basalt Hot Stones</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {REFLEXOLOGY_ZONES.map((rz, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-1.5">
                  <strong className="text-xs text-gold block">{rz.zone}</strong>
                  <span className="text-[10px] text-silver block">{rz.location}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{rz.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 9: KUNDALINI, BREATHWORK PRANAYAMA & YOGA            */}
      {/* ============================================================ */}
      {activePortal === 'kundalini' && (
        <div className="space-y-6">
          {/* Interactive Breathwork Pacer */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/40 bg-slate-900/90 text-center space-y-4">
            <div className="max-w-md mx-auto">
              <span className="text-xs font-bold text-cyan uppercase tracking-wider block mb-1">
                🌬️ Guided Sacred Pranayama Breathwork Pacer
              </span>
              <h3 className="text-xl font-serif font-bold text-white">{activeBreath.name}</h3>
              <p className="text-xs text-silver mt-1">{activeBreath.target}</p>
            </div>

            {/* Visual Breath Circle */}
            <div className="w-44 h-44 rounded-full mx-auto flex flex-col items-center justify-center border-4 border-cyan/40 bg-cyan-950/20 shadow-2xl shadow-cyan/20 animate-pulse">
              <span className="text-lg font-serif font-bold text-white">{breathPhase}</span>
              <span className="text-3xl font-mono text-gold font-bold mt-1">{breathCount}s</span>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className="btn-gold text-xs py-2.5 px-6 rounded-xl font-bold flex items-center gap-1.5"
              >
                {isBreathing ? <><Square className="w-4 h-4" /> Pause Breathing</> : <><Play className="w-4 h-4" /> Start Breathwork</>}
              </button>
            </div>
          </div>

          {/* 4 Pranayama Techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRANAYAMA_BREATHWORK_SUITE.map((pr, idx) => (
              <div 
                key={idx} 
                onClick={() => { setActiveBreath(pr); setIsBreathing(false); }}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${activeBreath.name === pr.name ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-cyan/40'}`}
              >
                <strong className="text-sm font-serif text-gold block mb-1">{pr.name}</strong>
                <span className="text-[11px] text-cyan block mb-2">{pr.target}</span>
                <p className="text-xs text-slate-200 leading-relaxed mb-2">{pr.steps}</p>
                <div className="text-[11px] text-emerald-400 font-medium">✨ {pr.benefits}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PORTAL 10: STARSEEDS, SOUL TYPES & VITALITY MATRIX          */}
      {/* ============================================================ */}
      {activePortal === 'vitality' && (
        <div className="space-y-6">
          {/* Vitality Matrix Card */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 to-slate-900/90 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  🧬 {profile.name}'s Cellular Vitality & Life Expectancy Matrix
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  Estimated Sovereign Vitality Span: <span className="text-gold">{vitality.estimatedSpan} Years</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-silver block">Vitality Quotient:</span>
                <strong className="text-2xl text-emerald-400 font-mono">{vitality.vitalityScore} / 100</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {vitality.vitalityPillars.map((pil, idx) => (
                <div key={idx} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-white">{pil.pillar}</strong>
                    <span className="text-[10px] text-emerald-400 font-mono">{pil.rating}</span>
                  </div>
                  <p className="text-xs text-slate-300">{pil.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Starseed Origins & Soul Types */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider">
              ✨ Starseed Origins & Types of Souls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SOUL_TYPES_AND_STARSEEDS.map((st, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-serif font-bold text-gold">{st.type}</h4>
                    <span className="text-[10px] text-cyan font-mono">{st.origin}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{st.traits}</p>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] text-cyan">
                    🎯 <strong>Mission:</strong> {st.mission}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="dream" 
          prevLabel="Dream Sanctuary" 
          nextView="soundscape" 
          nextLabel="Sacred Frequencies" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
