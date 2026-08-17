import React, { useState } from 'react';
import { 
  PERSONALITY_QUESTIONS, 
  calculatePersonalityResult 
} from '../../utils/personalityTestEngine';
import { 
  Sparkles, CheckCircle2, RotateCcw, Share2, Heart, Shield, 
  Zap, ArrowRight, ArrowLeft, Compass, Copy, Check
} from 'lucide-react';
import { shareCosmicContent } from '../../utils/mobileShare';

export default function PersonalityTestView({ profile, onNavigate }) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentQ = PERSONALITY_QUESTIONS[currentQuestionIdx];
  const progressPercent = Math.round(((currentQuestionIdx) / PERSONALITY_QUESTIONS.length) * 100);

  const handleSelectOption = (optIdx) => {
    const updated = { ...answers, [currentQ.id]: optIdx };
    setAnswers(updated);

    if (currentQuestionIdx < PERSONALITY_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setIsCompleted(false);
  };

  const result = isCompleted ? calculatePersonalityResult(answers) : null;
  const archetype = result?.archetype;

  const handleShare = () => {
    if (!archetype) return;
    shareCosmicContent({
      title: `${profile.name}'s Soul Personality Archetype | Astraea`,
      text: `✨ I took the Astraea Personality Test!\n👑 My Soul Archetype: ${archetype.name} (${archetype.icon} ${archetype.element})\n⚡ Superpower: ${archetype.superpower}\n💖 Ideal Partner Match: ${archetype.soulmateMatch}`
    });
  };

  const handleCopySummary = () => {
    if (!archetype) return;
    const text = `✨ ${profile.name}'s Soul Archetype: ${archetype.name} (${archetype.element})\n⚡ Superpower: ${archetype.superpower}\n💖 Ideal Match: ${archetype.soulmateMatch}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="personality-test-page space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-slate-950/98 via-purple-950/20 to-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Archetypal & Elemental Psychology</span>
            </div>
            <h1 className="text-2xl md:text-4xl text-white font-extrabold tracking-tight">
              Soul Personality & Alignment Test ✨
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Discover your core elemental soul archetype, psychological superpower, shadow triggers, and ideal partner compatibility.
            </p>
          </div>

          <button
            onClick={() => onNavigate('synastry')}
            className="btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 text-pink-300 border-pink-500/40 hover:bg-pink-500/15 transition-all flex-shrink-0"
          >
            <Heart className="w-3.5 h-3.5" /> Partner Synastry Matrix
          </button>
        </div>
      </div>

      {!isCompleted ? (
        /* ============================================================ */
        /* 📝 Active Quiz Flow                                         */
        /* ============================================================ */
        <div className="quiz-card glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl space-y-6">
          {/* Progress Bar & Header */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-purple-300 uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {PERSONALITY_QUESTIONS.length}
              </span>
              <span className="text-slate-400 font-mono">
                {progressPercent}% Completed
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / PERSONALITY_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h2 className="text-lg md:text-2xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* 4 Interactive Option Buttons */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 md:p-5 rounded-2xl border text-left flex items-start gap-4 transition-all hover:scale-[1.01] ${
                    isSelected 
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-slate-900/80 border-white/10 hover:border-purple-400/50 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-purple-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm md:text-base font-medium leading-relaxed flex-1">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-amber-400/20">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIdx === 0}
              className={`text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 font-bold transition-all ${
                currentQuestionIdx === 0 
                  ? 'opacity-40 cursor-not-allowed text-slate-500' 
                  : 'text-slate-300 hover:text-amber-300 bg-slate-900 border border-slate-700/60 hover:bg-amber-400/10 hover:border-amber-400/30'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Previous Question
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Select an answer to advance
            </span>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* 👑 Test Results & Archetype Profile Card                     */
        /* ============================================================ */
        <div className="results-wrapper space-y-6">
          {/* Main Soul Archetype Hero Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-950/98 via-slate-900/90 to-amber-950/20 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-amber-400/40 flex items-center justify-center text-4xl shadow-xl">
                  {archetype.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    ✨ Your Soul Personality Archetype
                  </span>
                  <h2 className="text-2xl md:text-4xl text-white font-extrabold">
                    {archetype.name}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 font-medium mt-0.5">
                    {archetype.tagline}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleShare}
                  className="btn-gold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 font-bold bg-amber-400 text-slate-950 shadow-md"
                >
                  <Share2 className="w-4 h-4" /> Share Result
                </button>
                <button
                  onClick={handleCopySummary}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-amber-300 hover:bg-amber-400/10 transition-all text-xs font-bold flex items-center gap-1"
                  title="Copy Summary"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Archetype Essence Summary */}
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
              {archetype.summary}
            </p>

            {/* 4-Element Energy Composition Bar */}
            <div className="p-4 rounded-2xl bg-black/50 border border-amber-400/20 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>🔥 Fire: {result.percentages.fire}%</span>
                <span>🌊 Water: {result.percentages.water}%</span>
                <span>💨 Air: {result.percentages.air}%</span>
                <span>🌿 Earth: {result.percentages.earth}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 flex overflow-hidden border border-slate-750">
                <div style={{ width: `${result.percentages.fire}%` }} className="bg-amber-500 h-full" title="Fire" />
                <div style={{ width: `${result.percentages.water}%` }} className="bg-cyan-500 h-full" title="Water" />
                <div style={{ width: `${result.percentages.air}%` }} className="bg-purple-500 h-full" title="Air" />
                <div style={{ width: `${result.percentages.earth}%` }} className="bg-emerald-500 h-full" title="Earth" />
              </div>
            </div>

            {/* Superpower vs Shadow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Soul Superpower</strong>
                </div>
                <p className="text-sm text-white font-bold">{archetype.superpower}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400">
                  <Shield className="w-4 h-4" />
                  <strong className="text-xs font-bold uppercase tracking-wider">Shadow Trigger & Growth Edge</strong>
                </div>
                <p className="text-sm text-white font-bold">{archetype.shadow}</p>
              </div>
            </div>

            {/* Ideal Partner Alignment & Love Style */}
            <div className="p-5 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Heart className="w-4 h-4 fill-current" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Ideal Partner Alignment & Love Style</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                {archetype.loveStyle}
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-pink-500/20">
                <span className="text-[11px] text-pink-300 font-bold uppercase block mb-1">
                  💖 Cosmic Soulmate Archetype Match:
                </span>
                <strong className="text-sm text-white block">{archetype.soulmateMatch}</strong>
              </div>

              <div className="pt-1">
                <span className="text-xs font-bold text-slate-300 block mb-1.5">What You Need in a Partner:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  {archetype.idealPartnerTraits.map((trait, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Daily Vitality & Alignment Ritual */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
              <Compass className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Daily Alignment Habit
                </strong>
                <p className="text-xs md:text-sm text-slate-300 mt-0.5 leading-relaxed">
                  {archetype.dailyRitual}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleRetake}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/60 hover:bg-amber-400/10 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Test
              </button>

              <button
                onClick={() => onNavigate('synastry')}
                className="btn-gold text-xs py-2.5 px-6 rounded-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-pink-500 to-amber-400 text-slate-950 shadow-lg"
              >
                <Heart className="w-4 h-4" /> Compare with Partner in Synastry Matrix <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
