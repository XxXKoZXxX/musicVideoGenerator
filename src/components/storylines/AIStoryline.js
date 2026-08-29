import React, { useState } from 'react';
import { Sparkles, RefreshCw, Bot, Crown, Wand2 } from 'lucide-react';
import { generateStorylineFromAudio } from '../../services/AIService';
import { AI_STORYLINE_GENERATORS, OPUS_DIRECTOR_PRESETS } from '../../data/aiModels';

export default function AIStoryline({ audio, onGenerated }) {
  const [selectedModel, setSelectedModel] = useState('claude_opus');
  const [userPrompt, setUserPrompt] = useState('High-octane cyberpunk narrative with volumetric neon laser fog and emotional arc');
  const [selectedPreset, setSelectedPreset] = useState('opus-cyber-epic');
  const [storylineObj, setStorylineObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editedText, setEditedText] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const presetObj = OPUS_DIRECTOR_PRESETS.find(p => p.id === selectedPreset);
      const generated = await generateStorylineFromAudio(
        audio,
        presetObj?.style || null,
        selectedModel,
        userPrompt
      );
      setStorylineObj(generated);
      setEditedText(typeof generated === 'string' ? generated : (generated.text || generated.concept || ''));
    } catch (err) {
      alert('Failed to generate storyline: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onGenerated({
      type: 'ai-generated',
      modelUsed: selectedModel,
      content: editedText || storylineObj?.text || storylineObj,
      original: storylineObj,
      scenes: storylineObj?.scenes || [],
    });
  };

  return (
    <div className="storyline-container space-y-6">
      {!storylineObj ? (
        <div className="generate-section space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-400/40 text-amber-300 mb-3 shadow-lg shadow-amber-500/20 animate-pulse">
              <Crown size={40} />
            </div>
            <h3 className="text-xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
              Claude 3 Opus Autonomous AI Director
            </h3>
            <p className="text-xs text-slate-300 max-w-md mt-1">
              Select your generator model and directorial vision. Claude 3 Opus will analyze audio BPM & lyrics to orchestrate 4K video scenes.
            </p>
          </div>

          {/* MODEL SELECTION MATRIX */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select AI Director Model:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_STORYLINE_GENERATORS.map((gen) => (
                <div
                  key={gen.id}
                  onClick={() => setSelectedModel(gen.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedModel === gen.id
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-950/50'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                      <span>{gen.icon}</span> {gen.name}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      {gen.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{gen.tagline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OPUS DIRECTORIAL PRESETS */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Directorial Vision Preset:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {OPUS_DIRECTOR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedPreset === p.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="line-clamp-1">{p.name}</div>
                  <div className="text-[9px] opacity-80 line-clamp-1">{p.style}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM PROMPT DIRECTIVE */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Custom Prompt Directive / Story Concept:
            </label>
            <textarea
              rows={2}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Dark cyberpunk narrative with neon lasers, rain-slick streets, and high energy drops..."
              className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-transform active:scale-95"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Claude 3 Opus Agent Orchestrating Production...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Claude 3 Opus Screenplay</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="storyline-view space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-xs text-white">
                {storylineObj?.title || 'Claude 3 Opus Directorial Screenplay'}
              </span>
            </div>
            <button
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 border border-amber-400/30"
              onClick={handleGenerate}
            >
              <RefreshCw size={14} /> Regenerate
            </button>
          </div>

          <div className="edit-section space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Edit & Customize Claude 3 Opus Screenplay:
            </h4>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={12}
              className="w-full bg-slate-900 border border-white/15 rounded-2xl p-4 text-xs font-mono text-slate-200 outline-none focus:border-amber-400 leading-relaxed shadow-inner"
            />
          </div>

          <button
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            onClick={handleContinue}
          >
            <Wand2 className="w-4 h-4" />
            <span>Continue with Opus Director Screenplay</span>
          </button>
        </div>
      )}
    </div>
  );
}

