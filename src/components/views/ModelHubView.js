import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  DollarSign,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  CheckCircle,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import { AI_VIDEO_MODELS, AI_STORYLINE_GENERATORS } from '../../data/aiModels';

export default function ModelHubView({ project = {}, onUpdateProject = () => {} }) {
  const [apiKeys, setApiKeys] = useState(() => ({
    openai: localStorage.getItem('byok_openai_key') || '',
    runway: localStorage.getItem('byok_runway_key') || '',
    kling: localStorage.getItem('byok_kling_key') || '',
    gemini: localStorage.getItem('byok_gemini_key') || '',
    replicate: localStorage.getItem('byok_replicate_key') || '',
    pexels: localStorage.getItem('pexels_api_key') || '',
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleKeyChange = (provider, value) => {
    const updated = { ...apiKeys, [provider]: value };
    setApiKeys(updated);
    localStorage.setItem(`byok_${provider}_key`, value);
    if (provider === 'pexels') localStorage.setItem('pexels_api_key', value);
  };

  const handleSaveKeys = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="model-hub-page max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="view-header glass-panel flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="view-title flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl shadow-lg shadow-cyan-500/10">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Video Engine Hub & Wholesale BYOK Architecture
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% UNLIMITED / ZERO MARKUP
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Save 90%+ compared to expensive SaaS credit plans with unlimited free local rendering + direct wholesale API pass-through
            </p>
          </div>
        </div>

        <button onClick={handleSaveKeys} className="btn btn-primary-glow text-xs flex items-center gap-2">
          {savedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Key className="w-4 h-4" />}
          {savedSuccess ? 'Keys Saved to Local Storage!' : 'Save Direct API Keys'}
        </button>
      </div>

      {/* COST COMPARISON CALLOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Other Video Apps</div>
          <div className="text-2xl font-black text-white mb-2">$30 - $95 / month</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Rigid credit meters, expensive watermarked subscriptions, and 10x–20x marked up GPU fees.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-transparent">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Astraea Free Local Tier</div>
          <div className="text-2xl font-black text-white mb-2">$0.00 Forever</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Client-side 60 FPS WebGL / Canvas2D compositor, audio-reactive visemes, 3D parallax & free Pexels stock.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Astraea Direct BYOK Tier</div>
          <div className="text-2xl font-black text-white mb-2">~$0.01 - $0.05 / video</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct wholesale pass-through to Sora, Runway, Kling, Gemini & Luma with zero markups or middleman fees.
          </p>
        </div>
      </div>

      {/* MODEL MATRIX */}
      <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        Supported AI Video Generation Engines
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {AI_VIDEO_MODELS.map((model) => (
          <div key={model.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{model.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {model.badge}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">{model.name}</h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{model.tagline}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Max: {model.maxResolution}</span>
              <span className="text-cyan-400 font-semibold">{model.provider}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BYOK API KEY MANAGER */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Direct Wholesale API Key Configuration (Optional BYOK)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Your keys are stored 100% locally in your browser/desktop app and never pass through any middleman servers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">OpenAI API Key (Sora AI / GPT-4o)</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKeys.openai}
              onChange={(e) => handleKeyChange('openai', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">RunwayML API Key (Gen-3 Alpha)</label>
            <input
              type="password"
              placeholder="rw_..."
              value={apiKeys.runway}
              onChange={(e) => handleKeyChange('runway', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Google Gemini API Key (1.5 Flash - Free Tier)</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeys.gemini}
              onChange={(e) => handleKeyChange('gemini', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Pexels Free Video API Key</label>
            <input
              type="password"
              placeholder="563492ad6f91700001000001..."
              value={apiKeys.pexels}
              onChange={(e) => handleKeyChange('pexels', e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
