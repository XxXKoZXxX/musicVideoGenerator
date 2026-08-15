import React, { useState } from 'react';
import { 
  calculateFullDualComparison, 
  TWIN_FLAME_DIAGNOSTIC_QUESTIONS, 
  evaluateTwinFlameTest 
} from '../../utils/synastryEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { 
  Heart, Sparkles, ShieldAlert, ArrowLeftRight, UserPlus, 
  Layers, Compass, Hash, Award, MessageCircle, Flame, 
  Home, Zap, CheckCircle2, RotateCcw, HelpCircle
} from 'lucide-react';

const COMPARISON_SUBJECTS = [
  { id: 'all', label: 'All Subjects (Complete Matrix)', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'twinFlame', label: '🔥 Twin Flame & Soul Contract', icon: <Flame className="w-3.5 h-3.5 text-rose-400" /> },
  { id: 'quiz', label: '🧪 Twin Flame Diagnostic Quiz', icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> },
  { id: 'houseOverlays', label: '🏠 House Overlays & Field', icon: <Home className="w-3.5 h-3.5 text-emerald-400" /> },
  { id: 'composite', label: '⚡ Composite Field & Shadow Work', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
  { id: 'astrology', label: '☀️ Planetary Placements & Aspects', icon: <Compass className="w-3.5 h-3.5 text-gold" /> },
  { id: 'secretLanguage', label: '📜 Secret Language Archetypes', icon: <Sparkles className="w-3.5 h-3.5 text-gold" /> },
  { id: 'numerology', label: '🔢 Numerology Matrix', icon: <Hash className="w-3.5 h-3.5 text-cyan" /> },
  { id: 'tarot', label: '🃏 Tarot Birth Cards', icon: <Award className="w-3.5 h-3.5 text-purple" /> },
  { id: 'karma', label: '🗝️ Past-Life Karma & Destiny', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> }
];

export default function SynastryView({ profiles, activeProfile, onNavigate, onAddProfile }) {
  // Slot A (Person 1)
  const [slotAId, setSlotAId] = useState(activeProfile.id);

  // Slot B (Person 2)
  const [slotBId, setSlotBId] = useState(
    profiles.find(p => p.id !== activeProfile.id)?.id || 'custom'
  );

  // Custom Inline Second Person (if user doesn't have 2 saved profiles)
  const [customPersonB, setCustomPersonB] = useState({
    id: 'custom_b',
    name: 'Partner / Friend',
    birthYear: 1994,
    birthMonth: 7,
    birthDay: 22,
    birthHour: 14,
    birthMinute: 30,
    cityName: 'New York, NY, USA',
    lat: 40.7128,
    lng: -74.0060,
    tag: 'Partner'
  });

  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [activeSubject, setActiveSubject] = useState('all');

  // Interactive Diagnostic Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Resolve Profile A and Profile B
  const profileA = profiles.find(p => p.id === slotAId) || activeProfile;
  let profileB = profiles.find(p => p.id === slotBId);
  if (!profileB || slotBId === 'custom' || slotBId === slotAId) {
    profileB = customPersonB;
  }

  const handleSelectSlotA = (newId) => {
    setSlotAId(newId);
    if (newId === slotBId) {
      const other = profiles.find(p => p.id !== newId);
      setSlotBId(other ? other.id : 'custom');
    }
  };

  const handleSelectSlotB = (newId) => {
    if (newId === slotAId) {
      const other = profiles.find(p => p.id !== newId);
      if (other) {
        setSlotAId(other.id);
        setSlotBId(newId);
      } else {
        setSlotBId('custom');
      }
    } else {
      setSlotBId(newId);
    }
  };

  // Swap Slot A and Slot B
  const handleSwapSlots = () => {
    if (slotBId !== 'custom') {
      const prevA = slotAId;
      setSlotAId(slotBId);
      setSlotBId(prevA);
    } else {
      // If Slot B is custom, swap the custom profile with Slot A's data
      const prevCustom = { ...customPersonB };
      setCustomPersonB({
        id: 'custom_b',
        name: profileA.name,
        birthYear: profileA.birthYear,
        birthMonth: profileA.birthMonth,
        birthDay: profileA.birthDay,
        birthHour: profileA.birthHour,
        birthMinute: profileA.birthMinute,
        cityName: profileA.cityName,
        lat: profileA.lat,
        lng: profileA.lng,
        tag: profileA.tag || 'Partner'
      });
      if (onAddProfile) {
        onAddProfile({ ...prevCustom, id: `profile_${Date.now()}` });
      }
    }
  };

  const comparison = calculateFullDualComparison(profileA, profileB);
  const quizEvaluation = quizSubmitted ? evaluateTwinFlameTest(quizAnswers, comparison) : null;

  const handleAnswerQuiz = (qId, points) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: points }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="synastry-page">
      {/* Header */}
      <div className="view-header glass-panel">
        <div className="view-title">
          <Heart className="title-icon text-rose-400 animate-pulse" />
          <div>
            <h2>Dual-Person Cosmic Comparison, House Overlays & Twin Flame Studio</h2>
            <p>Comprehensive Bi-Directional Synastry, House Domiciles, Composite Charts & Interactive Soul Diagnostic Test</p>
          </div>
        </div>
      </div>

      {/* Dual Slots Selector Bar */}
      <div className="glass-panel dual-slots-panel mt-6 p-4">
        <div className="dual-slots-grid">
          {/* Slot A: Person 1 */}
          <div className="slot-box slot-a">
            <div className="slot-badge text-xs font-bold text-gold mb-1">PERSON 1 (SLOT A)</div>
            <select 
              value={slotAId} 
              onChange={(e) => handleSelectSlotA(e.target.value)}
              className="input-field w-full font-serif font-bold text-white"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tag})</option>
              ))}
            </select>
            <span className="text-xs text-silver mt-1 block">
              Born: {profileA.birthMonth}/{profileA.birthDay}/{profileA.birthYear} • {profileA.cityName}
            </span>
          </div>

          {/* Swap Button */}
          <div className="slot-swap-col flex items-center justify-center">
            <button 
              onClick={handleSwapSlots} 
              className="btn-swap-slots" 
              title="Swap Person 1 and Person 2"
            >
              <ArrowLeftRight className="w-5 h-5 text-gold" />
            </button>
          </div>

          {/* Slot B: Person 2 */}
          <div className="slot-box slot-b">
            <div className="slot-badge text-xs font-bold text-cyan mb-1">PERSON 2 (SLOT B)</div>
            <div className="flex gap-2">
              <select 
                value={slotBId} 
                onChange={(e) => handleSelectSlotB(e.target.value)}
                className="input-field w-full font-serif font-bold text-white"
              >
                {profiles.filter(p => p.id !== slotAId).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.tag})</option>
                ))}
                <option value="custom">✨ {customPersonB.name} (Custom / Second Person)</option>
              </select>
              <button 
                onClick={() => setShowCustomEditor(!showCustomEditor)} 
                className={`btn-control p-2 ${showCustomEditor ? 'active' : ''}`}
                title="Edit Person 2 Birth Details"
              >
                <UserPlus className="w-4 h-4 text-cyan" />
              </button>
            </div>
            <span className="text-xs text-silver mt-1 block">
              Born: {profileB.birthMonth}/{profileB.birthDay}/{profileB.birthYear} • {profileB.cityName}
            </span>
          </div>
        </div>

        {/* Custom Person 2 Inline Quick Editor */}
        {showCustomEditor && (
          <div className="custom-person-editor mt-4 p-4 glass-panel border border-cyan/30 rounded-xl">
            <h4 className="text-xs font-bold text-cyan mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Enter Second Person Birth Details for Instant Dual Comparison:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-silver block mb-1">Name</label>
                <input 
                  type="text" 
                  value={customPersonB.name}
                  onChange={(e) => setCustomPersonB({ ...customPersonB, name: e.target.value })}
                  className="input-field text-xs w-full"
                />
              </div>
              <div>
                <label className="text-xs text-silver block mb-1">Birth Date (M/D/Y)</label>
                <div className="flex gap-1">
                  <input 
                    type="number" min="1" max="12"
                    value={customPersonB.birthMonth}
                    onChange={(e) => setCustomPersonB({ ...customPersonB, birthMonth: parseInt(e.target.value, 10) })}
                    className="input-field text-xs w-12"
                  />
                  <input 
                    type="number" min="1" max="31"
                    value={customPersonB.birthDay}
                    onChange={(e) => setCustomPersonB({ ...customPersonB, birthDay: parseInt(e.target.value, 10) })}
                    className="input-field text-xs w-12"
                  />
                  <input 
                    type="number" min="1900" max="2099"
                    value={customPersonB.birthYear}
                    onChange={(e) => setCustomPersonB({ ...customPersonB, birthYear: parseInt(e.target.value, 10) })}
                    className="input-field text-xs flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-silver block mb-1">Birth City</label>
                <input 
                  type="text" 
                  value={customPersonB.cityName}
                  onChange={(e) => setCustomPersonB({ ...customPersonB, cityName: e.target.value })}
                  className="input-field text-xs w-full"
                />
              </div>
              <div>
                <label className="text-xs text-silver block mb-1">Connection Tag</label>
                <select 
                  value={customPersonB.tag}
                  onChange={(e) => setCustomPersonB({ ...customPersonB, tag: e.target.value })}
                  className="input-field text-xs w-full"
                >
                  <option value="Partner">Partner</option>
                  <option value="Twin Flame">Twin Flame</option>
                  <option value="Soulmate">Soulmate</option>
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Subject Filter Tabs */}
      <div className="subject-filter-tabs-row mt-6 flex flex-wrap gap-2">
        {COMPARISON_SUBJECTS.map((sub) => (
          <button
            key={sub.id}
            className={`sub-tab-btn ${activeSubject === sub.id ? 'active' : ''}`}
            onClick={() => setActiveSubject(sub.id)}
          >
            {sub.icon}
            <span>{sub.label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SUBJECT 1: TWIN FLAME & SOUL CONTRACT HERO MATRIX            */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'twinFlame') && (
        <div className="twin-flame-studio-section mt-6 glass-panel p-6 rounded-2xl border border-rose-500/30">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
                <h3 className="text-xl font-serif font-bold text-white">{comparison.twinFlame.archetype}</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{comparison.twinFlame.desc}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-silver block">Twin Flame Resonance:</span>
              <span className="text-3xl font-serif font-bold text-rose-400">{comparison.twinFlame.score}%</span>
            </div>
          </div>

          {/* Indices Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-black/40 rounded-xl border border-rose-500/20 text-center">
              <span className="text-xs text-silver block">Telepathic Empathy Index</span>
              <strong className="text-lg text-rose-300 font-serif">{comparison.twinFlame.telepathyIndex}%</strong>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-cyan/20 text-center">
              <span className="text-xs text-silver block">Energetic Mirror Index</span>
              <strong className="text-lg text-cyan font-serif">{comparison.twinFlame.mirrorIndex}%</strong>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-gold/20 text-center">
              <span className="text-xs text-silver block">Harmonic Life Path Sync</span>
              <strong className="text-lg text-gold font-serif">{comparison.numerology.lifePathHarmony}%</strong>
            </div>
          </div>

          {/* 6 Key Twin Flame Alignment Markers */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">
              ✨ 6 Sacred Alignment Markers Verified:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {comparison.twinFlame.markers.map((marker, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${marker.status ? 'bg-rose-950/20 border-rose-500/30' : 'bg-black/30 border-white/5 opacity-80'}`}
                >
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${marker.status ? 'text-rose-400' : 'text-silver'}`} />
                  <div>
                    <strong className={`text-xs block ${marker.status ? 'text-white' : 'text-slate-300'}`}>{marker.title}</strong>
                    <span className="text-[11px] text-silver leading-snug block mt-0.5">{marker.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 2: INTERACTIVE TWIN FLAME & SOUL DIAGNOSTIC QUIZ     */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'quiz') && (
        <div className="diagnostic-quiz-section mt-6 glass-panel p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/80">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif font-bold text-white">Interactive Twin Flame & Soul Alignment Diagnostic Test</h3>
              </div>
              <p className="text-xs text-silver mt-1">Answer 5 experiential resonance questions to determine your live Stage of Union & Energetic Action Plan.</p>
            </div>
            {quizSubmitted && (
              <button 
                onClick={handleResetQuiz}
                className="btn-secondary text-xs py-1 px-3 rounded-lg flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Test
              </button>
            )}
          </div>

          {/* Questions Stream */}
          {!quizSubmitted ? (
            <div className="quiz-questions-space space-y-4">
              {TWIN_FLAME_DIAGNOSTIC_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider block mb-1">
                    Question {idx + 1} of {TWIN_FLAME_DIAGNOSTIC_QUESTIONS.length}
                  </span>
                  <h4 className="text-sm font-semibold text-white mb-3">{q.question}</h4>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === opt.points;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerQuiz(q.id, opt.points)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between border ${isSelected ? 'bg-gold/20 border-gold text-white font-semibold' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-3">
                <button
                  disabled={Object.keys(quizAnswers).length < TWIN_FLAME_DIAGNOSTIC_QUESTIONS.length}
                  onClick={() => setQuizSubmitted(true)}
                  className={`btn-gold text-xs py-3 px-8 rounded-xl font-bold flex items-center gap-2 ${Object.keys(quizAnswers).length < TWIN_FLAME_DIAGNOSTIC_QUESTIONS.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Sparkles className="w-4 h-4" /> Calculate Diagnostic Soul Verdict
                </button>
              </div>
            </div>
          ) : (
            /* Diagnostic Results Card */
            <div className="quiz-results-card p-5 bg-black/50 rounded-xl border border-gold/40 animate-fade-in space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-gold uppercase font-bold tracking-wider">Diagnostic Soul Verdict</span>
                  <h4 className="text-xl font-serif font-bold text-white mt-0.5">{quizEvaluation?.stage}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-silver block">Combined Alignment Score:</span>
                  <span className="text-3xl font-serif font-bold text-gold">{quizEvaluation?.score}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-silver block mb-1">Stage Characteristics & Soul Dynamics:</span>
                <p className="text-xs text-slate-200 leading-relaxed">{quizEvaluation?.stageDesc}</p>
              </div>

              <div className="p-3.5 bg-gold/10 rounded-xl border border-gold/30">
                <strong className="text-xs text-gold block mb-1">🎯 Recommended Action Step & Evolutionary Prescription:</strong>
                <p className="text-xs text-emerald-300">{quizEvaluation?.prescription}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 3: HOUSE OVERLAYS & PLANETARY DOMICILES              */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'houseOverlays') && (
        <div className="house-overlays-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-serif font-bold text-white">House Overlays & Field Projection</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person A into Person B */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-gold">
              <h4 className="text-sm font-bold text-gold mb-3">🏠 Where {profileA.name}'s Planets Fall in {profileB.name}'s Chart:</h4>
              <div className="space-y-2.5">
                {comparison.houseOverlays.aInB.map((h, i) => (
                  <div key={i} className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-white">{h.title}</strong>
                      <span className="text-[10px] text-gold uppercase px-2 py-0.5 bg-gold/10 rounded-full">{h.theme}</span>
                    </div>
                    <p className="text-[11px] text-silver mt-1">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Person B into Person A */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan">
              <h4 className="text-sm font-bold text-cyan mb-3">🏠 Where {profileB.name}'s Planets Fall in {profileA.name}'s Chart:</h4>
              <div className="space-y-2.5">
                {comparison.houseOverlays.bInA.map((h, i) => (
                  <div key={i} className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-white">{h.title}</strong>
                      <span className="text-[10px] text-cyan uppercase px-2 py-0.5 bg-cyan/10 rounded-full">{h.theme}</span>
                    </div>
                    <p className="text-[11px] text-silver mt-1">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 4: COMPOSITE FIELD & SHADOW RESOLUTION PROTOCOL       */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'composite') && (
        <div className="composite-section mt-6 space-y-4">
          <div className="section-title-badge flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-serif font-bold text-white">Composite Energy Field & Shadow Resolution Protocols</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Composite Field Card */}
            <div className="glass-panel p-5 rounded-2xl border border-yellow-400/30">
              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">⚡ The Third Entity (Composite Field)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-3">
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-[10px] text-silver block">Composite Sun</span>
                  <strong className="text-xs text-white">{comparison.compositeChart.sunSign}</strong>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-[10px] text-silver block">Composite Moon</span>
                  <strong className="text-xs text-white">{comparison.compositeChart.moonSign}</strong>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-[10px] text-silver block">Composite Rising</span>
                  <strong className="text-xs text-white">{comparison.compositeChart.risingSign}</strong>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-[10px] text-silver block">Joint Life Path</span>
                  <strong className="text-xs text-gold font-serif">{comparison.compositeChart.compositeLifePath}</strong>
                </div>
              </div>
              <p className="text-xs text-slate-200 mt-2 leading-relaxed">{comparison.compositeChart.coreMission}</p>
            </div>

            {/* Conflict & Shadow De-escalation */}
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/30">
              <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2">🛡️ Shadow Alchemy & De-Escalation</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-rose-300 font-bold block">⚠️ Potential Friction Trigger:</span>
                  <p className="text-slate-300 mt-0.5">{comparison.conflictProtocol.trigger}</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-emerald-400 font-bold block">🌿 Harmonic Antidote & Resolution:</span>
                  <p className="text-slate-200 mt-0.5">{comparison.conflictProtocol.antidote}</p>
                </div>
                <span className="text-[10px] text-silver block pt-1 font-mono">{comparison.conflictProtocol.aspectNote}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 5: PLANETARY PLACEMENTS & ASPECTS TABLE              */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'astrology') && (
        <div className="subject-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-serif font-bold text-white">Full Planetary Placements & Cross-Aspects Matrix</h3>
          </div>

          <div className="dual-side-by-side-grid">
            {/* Person A Astrology Card */}
            <div className="dual-col glass-panel p-5">
              <h4 className="text-sm font-bold text-gold mb-3">☀️ {profileA.name}'s Planetary Placements</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">☀️ Sun:</span>
                  <strong className="text-gold">{comparison.astrology.personA.sun.zodiac.sign} ({comparison.astrology.personA.sun.zodiac.degrees || 0}° {comparison.astrology.personA.sun.zodiac.minutes || 0}')</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">🌙 Moon:</span>
                  <strong className="text-white">{comparison.astrology.personA.moon.zodiac.sign} ({comparison.astrology.personA.moon.zodiac.degrees || 0}° {comparison.astrology.personA.moon.zodiac.minutes || 0}')</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">🧭 Ascendant (Rising):</span>
                  <strong className="text-cyan">{comparison.astrology.personA.ascendant.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">☿ Mercury (Mind):</span>
                  <strong className="text-white">{comparison.astrology.personA.mercury.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♀ Venus (Love):</span>
                  <strong className="text-rose-400">{comparison.astrology.personA.venus.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♂ Mars (Drive):</span>
                  <strong className="text-amber-400">{comparison.astrology.personA.mars.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♃ Jupiter (Luck):</span>
                  <strong className="text-emerald-400">{comparison.astrology.personA.jupiter.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♄ Saturn (Karma):</span>
                  <strong className="text-purple">{comparison.astrology.personA.saturn.zodiac.sign}</strong>
                </div>
              </div>
            </div>

            {/* Person B Astrology Card */}
            <div className="dual-col glass-panel p-5">
              <h4 className="text-sm font-bold text-cyan mb-3">☀️ {profileB.name}'s Planetary Placements</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">☀️ Sun:</span>
                  <strong className="text-gold">{comparison.astrology.personB.sun.zodiac.sign} ({comparison.astrology.personB.sun.zodiac.degrees || 0}° {comparison.astrology.personB.sun.zodiac.minutes || 0}')</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">🌙 Moon:</span>
                  <strong className="text-white">{comparison.astrology.personB.moon.zodiac.sign} ({comparison.astrology.personB.moon.zodiac.degrees || 0}° {comparison.astrology.personB.moon.zodiac.minutes || 0}')</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">🧭 Ascendant (Rising):</span>
                  <strong className="text-cyan">{comparison.astrology.personB.ascendant.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">☿ Mercury (Mind):</span>
                  <strong className="text-white">{comparison.astrology.personB.mercury.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♀ Venus (Love):</span>
                  <strong className="text-rose-400">{comparison.astrology.personB.venus.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♂ Mars (Drive):</span>
                  <strong className="text-amber-400">{comparison.astrology.personB.mars.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♃ Jupiter (Luck):</span>
                  <strong className="text-emerald-400">{comparison.astrology.personB.jupiter.zodiac.sign}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-silver">♄ Saturn (Karma):</span>
                  <strong className="text-purple">{comparison.astrology.personB.saturn.zodiac.sign}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bi-Directional Cross Aspects Table */}
          <div className="aspects-table-container glass-panel mt-4 p-4 rounded-xl overflow-x-auto">
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">
              ⚡ Bi-Directional Cross-Planetary Aspects:
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-silver">
                  <th className="pb-2">Planetary Pair</th>
                  <th className="pb-2">Aspect</th>
                  <th className="pb-2">Orb</th>
                  <th className="pb-2">Relational Dynamic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparison.astrology.aspects.map((asp, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-2.5 font-medium text-white">{asp.pair}</td>
                    <td className="py-2.5">
                      <span className="font-bold text-gold mr-1">{asp.symbol}</span>
                      <span className="text-slate-300">{asp.aspect}</span>
                    </td>
                    <td className="py-2.5 text-silver font-mono">{asp.orb}°</td>
                    <td className="py-2.5 text-slate-300">{asp.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 6: SECRET LANGUAGE ARCHETYPES                        */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'secretLanguage') && (
        <div className="subject-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-serif font-bold text-white">Secret Language Archetype Comparison</h3>
          </div>

          <div className="dual-side-by-side-grid">
            <div className="dual-col glass-panel p-5">
              <span className="text-xs font-bold text-gold uppercase">{profileA.name}'s Archetype</span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">"{comparison.secretLanguage.personA.title}"</h4>
              <span className="text-xs text-silver block mt-0.5">{comparison.secretLanguage.personA.period} • {comparison.secretLanguage.personA.element}</span>
              <p className="text-xs text-slate-300 mt-2">{comparison.secretLanguage.personA.lifeTheme}</p>
            </div>

            <div className="dual-col glass-panel p-5">
              <span className="text-xs font-bold text-cyan uppercase">{profileB.name}'s Archetype</span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">"{comparison.secretLanguage.personB.title}"</h4>
              <span className="text-xs text-silver block mt-0.5">{comparison.secretLanguage.personB.period} • {comparison.secretLanguage.personB.element}</span>
              <p className="text-xs text-slate-300 mt-2">{comparison.secretLanguage.personB.lifeTheme}</p>
            </div>
          </div>

          <div className="glass-panel mt-4 p-4 rounded-xl border border-gold/30">
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">📜 Archetype Synergy Synthesis:</h4>
            <p className="text-xs text-slate-200 leading-relaxed">{comparison.secretLanguage.synthesis}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 7: NUMEROLOGY MATRIX                                 */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'numerology') && (
        <div className="subject-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-cyan" />
            <h3 className="text-lg font-serif font-bold text-white">Pythagorean Numerology Matrix Comparison</h3>
          </div>

          <div className="dual-side-by-side-grid">
            <div className="dual-col glass-panel p-5">
              <h4 className="text-sm font-bold text-gold mb-3">🔢 {profileA.name}'s Numbers</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Life Path:</span>
                  <strong className="text-gold font-serif text-base">{comparison.numerology.personA.lifePath}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Expression (Destiny):</span>
                  <strong className="text-white font-serif">{comparison.numerology.personA.expression}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Soul Urge (Heart):</span>
                  <strong className="text-rose-400 font-serif">{comparison.numerology.personA.soulUrge}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Personality Number:</span>
                  <strong className="text-purple font-serif">{comparison.numerology.personA.personality}</strong>
                </div>
              </div>
            </div>

            <div className="dual-col glass-panel p-5">
              <h4 className="text-sm font-bold text-cyan mb-3">🔢 {profileB.name}'s Numbers</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Life Path:</span>
                  <strong className="text-cyan font-serif text-base">{comparison.numerology.personB.lifePath}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Expression (Destiny):</span>
                  <strong className="text-white font-serif">{comparison.numerology.personB.expression}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Soul Urge (Heart):</span>
                  <strong className="text-rose-400 font-serif">{comparison.numerology.personB.soulUrge}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-silver">Personality Number:</span>
                  <strong className="text-purple font-serif">{comparison.numerology.personB.personality}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel mt-4 p-4 rounded-xl border border-cyan/30">
            <h4 className="text-xs font-bold text-cyan uppercase tracking-wider mb-1">🔢 Life Path Harmonic Family:</h4>
            <p className="text-xs text-slate-200">{comparison.numerology.lifePathNote}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 8: TAROT BIRTH CARDS                                 */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'tarot') && (
        <div className="subject-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-purple" />
            <h3 className="text-lg font-serif font-bold text-white">Tarot Soul Contract & Birth Cards Comparison</h3>
          </div>

          <div className="dual-side-by-side-grid">
            <div className="dual-col glass-panel p-5">
              <span className="text-xs font-bold text-gold uppercase">{profileA.name}'s Birth Card</span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">{comparison.tarot.personA.personalityCard.name}</h4>
              <span className="text-xs text-silver block mt-0.5">{comparison.tarot.personA.personalityCard.element}</span>
              <p className="text-xs text-slate-300 mt-2">{comparison.tarot.personA.personalityCard.upright}</p>
            </div>

            <div className="dual-col glass-panel p-5">
              <span className="text-xs font-bold text-cyan uppercase">{profileB.name}'s Birth Card</span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">{comparison.tarot.personB.personalityCard.name}</h4>
              <span className="text-xs text-silver block mt-0.5">{comparison.tarot.personB.personalityCard.element}</span>
              <p className="text-xs text-slate-300 mt-2">{comparison.tarot.personB.personalityCard.upright}</p>
            </div>
          </div>

          <div className="glass-panel mt-4 p-4 rounded-xl border border-purple/30">
            <h4 className="text-xs font-bold text-purple uppercase tracking-wider mb-1">🃏 Collective Major Arcana Mission:</h4>
            <p className="text-xs text-slate-200">{comparison.tarot.reading}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBJECT 9: KARMA & DESTINY                                   */}
      {/* ============================================================ */}
      {(activeSubject === 'all' || activeSubject === 'karma') && (
        <div className="subject-section mt-6">
          <div className="section-title-badge flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-serif font-bold text-white">Past-Life Karma & North Node Evolutionary Destiny</h3>
          </div>

          <div className="dual-side-by-side-grid">
            <div className="dual-col glass-panel p-5 border-l-4 border-l-gold">
              <h4 className="text-sm font-bold text-gold mb-2">{profileA.name}'s Soul Contract</h4>
              <p className="text-xs text-slate-300"><strong>North Node:</strong> In {comparison.karma.personA.northNode.zodiac.sign} (House {comparison.karma.personA.northNode.house})</p>
              <p className="text-xs text-slate-300 mt-1"><strong>Chiron Sacred Wound:</strong> In {comparison.karma.personA.chiron.zodiac.sign}</p>
            </div>

            <div className="dual-col glass-panel p-5 border-l-4 border-l-cyan">
              <h4 className="text-sm font-bold text-cyan mb-2">{profileB.name}'s Soul Contract</h4>
              <p className="text-xs text-slate-300"><strong>North Node:</strong> In {comparison.karma.personB.northNode.zodiac.sign} (House {comparison.karma.personB.northNode.house})</p>
              <p className="text-xs text-slate-300 mt-1"><strong>Chiron Sacred Wound:</strong> In {comparison.karma.personB.chiron.zodiac.sign}</p>
            </div>
          </div>

          <div className="glass-panel mt-4 p-4 rounded-xl border border-amber-500/30">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">🗝️ Soul Contract Verdict:</h4>
            <p className="text-xs text-slate-200">{comparison.karma.soulContract}</p>
          </div>
        </div>
      )}

      {/* Communication Tip Banner */}
      <div className="communication-banner glass-panel mt-6 p-4 flex items-center gap-3 border border-cyan/30">
        <MessageCircle className="w-6 h-6 text-cyan flex-shrink-0" />
        <div>
          <span className="text-xs font-bold text-cyan block">💡 Pro Communication & Intimacy Tip:</span>
          <p className="text-xs text-silver mt-0.5">{comparison.communicationTip}</p>
        </div>
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="numerology" 
          prevLabel="Numerology Matrix" 
          nextView="report" 
          nextLabel="Master Dossier Report" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
