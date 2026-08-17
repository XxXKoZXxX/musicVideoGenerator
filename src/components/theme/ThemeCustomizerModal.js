import React, { useState } from 'react';
import { 
  THEME_PRESETS, 
  applyTheme, 
  hexToRgba 
} from '../../utils/themeEngine';
import { X, Sparkles, Check, RefreshCw, Sliders, Eye } from 'lucide-react';

export default function ThemeCustomizerModal({ isOpen, onClose, currentTheme, onThemeChange }) {
  // Color State
  const [selectedPresetId, setSelectedPresetId] = useState(currentTheme?.id || 'gold');
  const [customPrimary, setCustomPrimary] = useState(currentTheme?.primary || '#F59E0B');
  const [customSecondary, setCustomSecondary] = useState(currentTheme?.secondary || '#06B6D4');
  const [customBg, setCustomBg] = useState(currentTheme?.background || '#060814');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const triggerThemeUpdate = (updates) => {
    const updatedTheme = {
      ...(currentTheme || THEME_PRESETS[0]),
      id: selectedPresetId,
      primary: customPrimary,
      secondary: customSecondary,
      background: customBg,
      glow: hexToRgba(customPrimary, 0.45),
      panelBg: hexToRgba(customBg === '#000000' ? '#0a0a0a' : '#0a0f1e', 0.88),
      panelBorder: hexToRgba(customPrimary, 0.28),
      ...updates
    };

    applyTheme(updatedTheme);
    if (onThemeChange) onThemeChange(updatedTheme);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCustomPrimary(preset.primary);
    setCustomSecondary(preset.secondary);
    setCustomBg(preset.background);
    setIsCustomMode(false);

    triggerThemeUpdate({
      id: preset.id,
      name: preset.name,
      primary: preset.primary,
      secondary: preset.secondary,
      background: preset.background,
      glow: preset.glow,
      panelBg: preset.panelBg,
      panelBorder: preset.panelBorder
    });
  };

  const handleCustomColorChange = (primary, secondary, bg) => {
    setCustomPrimary(primary);
    setCustomSecondary(secondary);
    setCustomBg(bg);
    setIsCustomMode(true);
    setSelectedPresetId('custom');

    triggerThemeUpdate({
      id: 'custom',
      primary,
      secondary,
      background: bg
    });
  };

  const handleResetDefault = () => {
    setSelectedPresetId('gold');
    setCustomPrimary('#F59E0B');
    setCustomSecondary('#06B6D4');
    setCustomBg('#060814');
    setIsCustomMode(false);

    const defaultTheme = {
      ...THEME_PRESETS[0]
    };
    applyTheme(defaultTheme);
    if (onThemeChange) onThemeChange(defaultTheme);
  };

  return (
    <div className="theme-modal-backdrop no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="theme-modal-sheet glass-panel w-full max-w-2xl bg-slate-950/98 border border-gold/40 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div className="sheet-drag-handle-bar pt-3 pb-1 flex justify-center">
          <div className="sheet-drag-handle w-12 h-1.5 rounded-full bg-slate-700"></div>
        </div>

        {/* Header */}
        <div className="theme-modal-header flex items-center justify-between pb-3 border-b border-amber-400/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-100 leading-tight">Cosmic Aesthetics & Aura Colors</h3>
              <p className="text-xs text-slate-300">Personalize your color palette, glows & cosmic visual theme</p>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 hover:bg-amber-400/10" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="theme-modal-content-scroll flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
          {/* Preset Palettes Grid */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 8 Curated Luxury Color Palettes
              </span>
              <button 
                onClick={handleResetDefault} 
                className="text-[11px] text-slate-300 hover:text-gold flex items-center gap-1 font-semibold"
                title="Reset to Celestial Gold"
              >
                <RefreshCw className="w-3 h-3" /> Reset Default
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !isCustomMode;
                return (
                  <button
                    key={preset.id}
                    className={`theme-preset-card p-3 rounded-2xl glass-panel text-left flex flex-col justify-between transition-all ${
                      isSelected ? 'active border-gold bg-gold/15 shadow-lg' : 'border-white/10 hover:border-gold/40'
                    }`}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      borderColor: isSelected ? preset.primary : undefined
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base">{preset.icon}</span>
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: preset.secondary }} />
                      </div>
                    </div>
                    <div>
                      <strong className="text-xs text-white block">{preset.name}</strong>
                      <span className="text-[10px] text-slate-400 block truncate">{preset.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Mixer */}
          <div className="custom-color-mixer p-4 glass-panel rounded-2xl border border-white/10 bg-slate-900/60">
            <span className="text-xs font-bold text-cyan uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sliders className="w-3.5 h-3.5" /> Custom Hex Color Mixer
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Color Picker */}
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Primary Accent Color</label>
                <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                  <input 
                    type="color" 
                    value={customPrimary}
                    onChange={(e) => handleCustomColorChange(e.target.value, customSecondary, customBg)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={customPrimary}
                    onChange={(e) => handleCustomColorChange(e.target.value, customSecondary, customBg)}
                    className="text-xs text-white font-mono uppercase bg-transparent outline-none w-full font-bold"
                  />
                </div>
              </div>

              {/* Secondary Color Picker */}
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Secondary Accent Color</label>
                <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/10">
                  <input 
                    type="color" 
                    value={customSecondary}
                    onChange={(e) => handleCustomColorChange(customPrimary, e.target.value, customBg)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={customSecondary}
                    onChange={(e) => handleCustomColorChange(customPrimary, e.target.value, customBg)}
                    className="text-xs text-white font-mono uppercase bg-transparent outline-none w-full font-bold"
                  />
                </div>
              </div>

              {/* Background Darkness Selector */}
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Background Canvas</label>
                <select
                  value={customBg}
                  onChange={(e) => handleCustomColorChange(customPrimary, customSecondary, e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl text-xs py-2.5 px-3 w-full outline-none focus:border-gold"
                >
                  <option value="#060814">Midnight Obsidian (#060814)</option>
                  <option value="#030712">Deep Cosmic Space (#030712)</option>
                  <option value="#090314">Velvet Purple Dark (#090314)</option>
                  <option value="#000000">Pure Pitch Black (#000000)</option>
                  <option value="#020b1a">Deep Oceanic Navy (#020b1a)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✨ Live Interactive Preview Box */}
          <div className="live-theme-preview p-5 rounded-3xl glass-panel border border-gold/30 bg-slate-950/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Aesthetic Aura Preview
              </span>
            </div>

            <div>
              <h4 className="text-lg font-serif font-bold text-white tracking-wide">
                The Hermetic Principle of Polarity & Cosmic Destiny
              </h4>
              <p className="text-slate-300 mt-2 leading-relaxed text-sm">
                "Everything is dual; everything has poles; everything has its pair of opposites; like and unlike are the same; opposites are identical in nature, but different in degree."
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold bg-gold text-slate-950">
                <Sparkles className="w-3.5 h-3.5" /> Primary Action
              </button>
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-cyan/40 text-cyan">
                Transits Active
              </div>
              <span className="text-xs text-slate-300 font-medium">
                432 Hz Solfeggio Resonator
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="theme-modal-footer pt-4 border-t border-amber-400/20 flex justify-between items-center">
          <button 
            onClick={handleResetDefault}
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/60 hover:bg-amber-400/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Original
          </button>
          <button 
            onClick={onClose} 
            className="btn-gold text-xs py-2.5 px-6 rounded-2xl flex items-center gap-2 font-bold bg-gold text-slate-950 shadow-lg shadow-gold/20"
          >
            <Check className="w-4 h-4" /> Save & Apply Aesthetic
          </button>
        </div>
      </div>
    </div>
  );
}
