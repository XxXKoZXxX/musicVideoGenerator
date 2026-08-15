import React, { useState, useEffect } from 'react';
import { 
  DREAM_VIBES, 
  DREAM_SYMBOLS_LEXICON, 
  interpretDream, 
  LUCID_DREAMING_GUIDE 
} from '../../utils/dreamInterpreterEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { 
  Moon, Sparkles, BookOpen, Compass, Eye, 
  Search, Copy, Check, Bookmark, 
  Trash2, Plus, Headphones, Sun
} from 'lucide-react';

export default function DreamInterpreterView({ profile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('interpret'); // 'interpret' | 'journal' | 'lexicon' | 'lucid'
  const [dreamText, setDreamText] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('mystical');
  const [isDecoding, setIsDecoding] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchLexicon, setSearchLexicon] = useState('');

  // Dream Journal Storage
  const [savedDreams, setSavedDreams] = useState(() => {
    try {
      const saved = localStorage.getItem(`astraea_dreams_${profile.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`astraea_dreams_${profile.id}`, JSON.stringify(savedDreams));
    } catch (e) {}
  }, [savedDreams, profile.id]);

  const handleDecodeDream = () => {
    if (!dreamText.trim()) return;

    setIsDecoding(true);
    setCurrentResult(null);

    setTimeout(() => {
      const result = interpretDream(dreamText.trim(), selectedVibe, profile);
      setCurrentResult(result);
      setIsDecoding(false);

      // Auto-add to dream journal
      setSavedDreams(prev => [result, ...prev]);
    }, 750);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteDream = (id) => {
    setSavedDreams(prev => prev.filter(d => d.id !== id));
  };

  const filteredSymbols = Object.values(DREAM_SYMBOLS_LEXICON).filter(sym => 
    sym.name.toLowerCase().includes(searchLexicon.toLowerCase()) ||
    sym.keywords.some(k => k.toLowerCase().includes(searchLexicon.toLowerCase())) ||
    sym.meaning.toLowerCase().includes(searchLexicon.toLowerCase())
  );

  return (
    <div className="dream-interpreter-page">
      {/* Header */}
      <div className="view-header glass-panel">
        <div className="view-title">
          <Moon className="title-icon text-cyan animate-pulse" />
          <div>
            <h2>Astral Dream Sanctuary & Esoteric Dream Decoder</h2>
            <p>Jungian Archetypal Analysis, Subconscious Moon Synthesis, Solfeggio Prescriptions & Symbol Encyclopedia</p>
          </div>
        </div>

        {/* 4-Tab Navigation */}
        <div className="tab-pill-nav flex flex-wrap gap-1.5">
          <button 
            className={`tab-btn ${activeTab === 'interpret' ? 'active' : ''}`}
            onClick={() => setActiveTab('interpret')}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Dream Decoder
          </button>
          <button 
            className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            <Bookmark className="w-3.5 h-3.5 inline mr-1 text-gold" /> Dream Journal ({savedDreams.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lexicon' ? 'active' : ''}`}
            onClick={() => setActiveTab('lexicon')}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1 text-cyan" /> Symbol Lexicon
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lucid' ? 'active' : ''}`}
            onClick={() => setActiveTab('lucid')}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1 text-purple" /> Lucid Guide
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: INTERACTIVE DREAM DECODER & EXPLAINER                 */}
      {/* ============================================================ */}
      {activeTab === 'interpret' && (
        <div className="dream-decoder-container mt-6 space-y-6">
          {/* Input Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan/30 bg-slate-900/80">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-cyan" /> Record & Decode Your Dream:
            </h3>
            <p className="text-xs text-silver mb-4">
              Describe what you saw, felt, or encountered in your dream. Astraea will decode the Jungian archetypes, subconscious lunar messages, and Solfeggio acoustic remedies.
            </p>

            {/* Vibe Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-silver block mb-2">Select Dream Emotional Vibe:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DREAM_VIBES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVibe(v.id)}
                    className={`p-2.5 rounded-xl text-xs text-center border transition-all flex flex-col items-center justify-center gap-1 ${selectedVibe === v.id ? 'bg-cyan/20 border-cyan text-white font-bold shadow-lg shadow-cyan/20' : 'bg-black/40 border-white/5 text-slate-300 hover:bg-white/5'}`}
                    title={v.desc}
                  >
                    <span className="text-base">{v.icon}</span>
                    <span className="text-[11px] truncate w-full">{v.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dream Text Area */}
            <div className="mb-4">
              <label className="text-xs font-bold text-silver block mb-1">Your Dream Memory / Story:</label>
              <textarea 
                rows={5}
                placeholder="e.g. I was flying over an ancient ocean at sunset. A golden snake appeared from the water and guided me through a locked door in a stone castle. I felt zero fear, only profound peace..."
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                className="input-field text-xs w-full p-4 font-sans"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-silver">
                💡 Analyzing with {profile.name}'s natal chart & subconscious Moon placement.
              </span>

              <button
                disabled={!dreamText.trim() || isDecoding}
                onClick={handleDecodeDream}
                className={`btn-gold text-xs py-3 px-8 rounded-xl font-bold flex items-center gap-2 ${!dreamText.trim() || isDecoding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDecoding ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-cyan" />
                    <span>Decoding Astral Plane...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize & Decode Dream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Decoded Results Card */}
          {currentResult && (
            <div className="dream-results-card glass-panel p-6 rounded-2xl border border-gold/40 bg-gradient-to-b from-slate-900/90 to-black/90 space-y-6 animate-fade-in">
              {/* Result Header */}
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold uppercase px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30">
                      {currentResult.primaryArchetype}
                    </span>
                    <span className="text-xs text-silver font-mono">{currentResult.date} • {currentResult.time}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mt-1.5">{currentResult.archetypalTheme}</h3>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopy(currentResult.id, `${currentResult.archetypalTheme}\n\n${currentResult.synthesisMessage}\n\nAstrological Insight:\n${currentResult.astrologicalInsight}\n\nWaking Ritual:\n${currentResult.wakingRitual}`)}
                    className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 text-silver hover:text-gold"
                  >
                    {copiedId === currentResult.id ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Analysis</>}
                  </button>
                </div>
              </div>

              {/* Core Decoding Synthesis */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-cyan uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Core Subconscious Decoding:
                </h4>
                <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line">{currentResult.synthesisMessage}</p>
              </div>

              {/* Astrological Resonance */}
              <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan/30">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-gold" /> Natal Moon & Astral Resonance:
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">{currentResult.astrologicalInsight}</p>
              </div>

              {/* Detected Dream Symbols */}
              <div>
                <h4 className="text-xs font-bold text-silver uppercase tracking-wider mb-3">
                  🗝️ Key Dream Symbols Decoded:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentResult.detectedSymbols.map((sym, idx) => (
                    <div key={idx} className="p-4 bg-black/50 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-serif font-bold text-gold flex items-center gap-1.5">
                          <span>{sym.icon}</span> {sym.name}
                        </span>
                        <span className="text-[10px] text-cyan uppercase px-2 py-0.5 rounded-full bg-cyan/10">
                          {sym.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{sym.meaning}</p>
                      <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300 font-medium">
                        ⚠️ <strong>Shadow Advice:</strong> {sym.shadowWarning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acoustic & Solfeggio Prescription */}
              <div className="p-4 bg-purple-950/20 rounded-xl border border-purple/40 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-xs font-bold text-purple uppercase tracking-wider block">
                    🎧 Recommended Dream Integration Frequency:
                  </span>
                  <strong className="text-base font-serif text-white block mt-0.5">
                    {currentResult.prescription.hz} Hz • {currentResult.prescription.chakra}
                  </strong>
                  <span className="text-xs text-silver block">Layer: {currentResult.prescription.binauralBeat}</span>
                </div>

                <button 
                  onClick={() => onNavigate && onNavigate('soundscape')}
                  className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                >
                  <Headphones className="w-4 h-4" /> Open Sound Sanctuary
                </button>
              </div>

              {/* Waking Ritual & Lucid Intention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    🌿 Waking Integration Ritual:
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{currentResult.wakingRitual}</p>
                </div>

                <div className="p-4 bg-gold/10 rounded-xl border border-gold/30 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">
                      ✨ Lucid Dream Affirmation:
                    </h4>
                    <p className="text-xs text-slate-100 font-serif italic leading-relaxed">"{currentResult.dreamMantra}"</p>
                  </div>
                  <span className="text-[10px] text-silver mt-2">Repeat 3 times before sleeping tonight.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ASTRAL DREAM JOURNAL HISTORY                          */}
      {/* ============================================================ */}
      {activeTab === 'journal' && (
        <div className="dream-journal-container mt-6 space-y-4">
          <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold" /> {profile.name}'s Astral Dream Journal
              </h3>
              <p className="text-xs text-silver">Chronological record of your decoded dream memories and subconscious shifts.</p>
            </div>

            <button 
              onClick={() => setActiveTab('interpret')} 
              className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Decode New Dream
            </button>
          </div>

          {savedDreams.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl">
              <Moon className="w-12 h-12 text-silver/40 mx-auto mb-3" />
              <h4 className="text-base font-serif text-white">Your Dream Journal is Empty</h4>
              <p className="text-xs text-silver mt-1 mb-4">Record and decode your first dream in the Dream Decoder tab to start tracking your subconscious evolution.</p>
              <button onClick={() => setActiveTab('interpret')} className="btn-gold text-xs py-2 px-6 rounded-xl">
                Record First Dream
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDreams.map((dream) => (
                <div key={dream.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-cyan/40 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-gold uppercase px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30">
                        {dream.vibe?.label || 'Mystical'}
                      </span>
                      <span className="text-[11px] text-silver font-mono">{dream.date} • {dream.time}</span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-white mb-2">{dream.archetypalTheme}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-3 mb-3">"{dream.dreamText}"</p>

                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-200">
                      <span className="text-[10px] font-bold text-cyan uppercase block mb-1">Subconscious Insight:</span>
                      <p className="text-[11px] line-clamp-3">{dream.synthesisMessage}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                    <button 
                      onClick={() => handleCopy(dream.id, `${dream.archetypalTheme}\n\n${dream.dreamText}\n\n${dream.synthesisMessage}`)}
                      className="text-xs text-silver hover:text-gold flex items-center gap-1"
                    >
                      {copiedId === dream.id ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>

                    <button 
                      onClick={() => handleDeleteDream(dream.id)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10"
                      title="Delete Dream Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: 50+ DREAM SYMBOL ENCYCLOPEDIA & LEXICON              */}
      {/* ============================================================ */}
      {activeTab === 'lexicon' && (
        <div className="dream-lexicon-container mt-6 space-y-4">
          <div className="glass-panel p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold" /> Esoteric & Jungian Dream Symbol Encyclopedia
              </h3>
              <p className="text-xs text-silver">Search ancient alchemical symbols, animal totems, and archetypal motifs.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-silver" />
              <input 
                type="text" 
                placeholder="Search symbols (e.g. snake, water, falling, key)..."
                value={searchLexicon}
                onChange={(e) => setSearchLexicon(e.target.value)}
                className="input-field text-xs pl-9 pr-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSymbols.map((sym, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-base">{sym.icon}</span>
                    <span className="text-[10px] text-cyan uppercase px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20">
                      {sym.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-serif font-bold text-white mb-1">{sym.name}</h4>
                  <span className="text-[11px] font-serif text-gold block mb-2">{sym.archetype}</span>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{sym.meaning}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
                  <div className="text-amber-300">
                    ⚠️ <strong>Shadow Warning:</strong> {sym.shadowWarning}
                  </div>
                  <div className="text-silver">
                    🌌 <strong>Astrology:</strong> {sym.astrologyLink}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: LUCID DREAMING MASTERCLASS & PROTOCOLS                */}
      {/* ============================================================ */}
      {activeTab === 'lucid' && (
        <div className="lucid-masterclass-container mt-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-purple/40 bg-gradient-to-r from-purple-950/30 to-slate-900/80">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple" /> The Art of Conscious Astral Awakening & Lucid Dreaming
            </h3>
            <p className="text-xs text-silver mt-1 leading-relaxed max-w-3xl">
              Lucid dreaming is the ancient art of becoming conscious while asleep. By bridging the waking ego with the 5D astral field, you can heal emotional trauma, converse with spirit guides, and practice skills in quantum space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LUCID_DREAMING_GUIDE.map((guide, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-white mb-2">{guide.title}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{guide.desc}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-purple">
                  <span>Lucid Protocol</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="oracleChat" 
          prevLabel="AI Oracle & Notebook" 
          nextView="soundscape" 
          nextLabel="Sacred Frequencies" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
