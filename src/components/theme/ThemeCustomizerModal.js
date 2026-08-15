import React, { useState } from 'react';
import { 
  THEME_PRESETS, 
  FONT_STYLE_PRESETS, 
  FONT_SIZE_PRESETS, 
  LINE_HEIGHT_PRESETS, 
  applyTheme, 
  hexToRgba 
} from '../../utils/themeEngine';
import { Palette, X, Sparkles, Check, RefreshCw, Sliders, Type, SlidersHorizontal, Eye } from 'lucide-react';

export default function ThemeCustomizerModal({ isOpen, onClose, currentTheme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'typography'
  
  // Color State
  const [selectedPresetId, setSelectedPresetId] = useState(currentTheme?.id || 'gold');
  const [customPrimary, setCustomPrimary] = useState(currentTheme?.primary || '#F59E0B');
  const [customSecondary, setCustomSecondary] = useState(currentTheme?.secondary || '#06B6D4');
  const [customBg, setCustomBg] = useState(currentTheme?.background || '#060814');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Typography State
  const [fontStyleId, setFontStyleId] = useState(currentTheme?.fontStyleId || 'royal');
  const [fontSizeId, setFontSizeId] = useState(currentTheme?.fontSizeId || 'standard');
  const [lineHeightId, setLineHeightId] = useState(currentTheme?.lineHeightId || 'relaxed');

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
      fontStyleId,
      fontSizeId,
      lineHeightId,
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

  const handleSelectFont = (fId) => {
    setFontStyleId(fId);
    triggerThemeUpdate({ fontStyleId: fId });
  };

  const handleSelectSize = (sId) => {
    setFontSizeId(sId);
    triggerThemeUpdate({ fontSizeId: sId });
  };

  const handleSelectLineHeight = (lId) => {
    setLineHeightId(lId);
    triggerThemeUpdate({ lineHeightId: lId });
  };

  const handleResetDefault = () => {
    setSelectedPresetId('gold');
    setCustomPrimary('#F59E0B');
    setCustomSecondary('#06B6D4');
    setCustomBg('#060814');
    setIsCustomMode(false);
    setFontStyleId('royal');
    setFontSizeId('standard');
    setLineHeightId('relaxed');

    const defaultTheme = {
      ...THEME_PRESETS[0],
      fontStyleId: 'royal',
      fontSizeId: 'standard',
      lineHeightId: 'relaxed'
    };
    applyTheme(defaultTheme);
    if (onThemeChange) onThemeChange(defaultTheme);
  };

  const currentFontObj = FONT_STYLE_PRESETS.find(f => f.id === fontStyleId) || FONT_STYLE_PRESETS[0];

  return (
    <div className="theme-modal-backdrop no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="theme-modal-sheet glass-panel w-full max-w-2xl bg-slate-950/98 border border-gold/40 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Drag Handle for Mobile */}
        <div className="sheet-drag-handle-bar flex justify-center pb-2">
          <div className="sheet-drag-handle w-12 h-1.5 rounded-full bg-white/20"></div>
        </div>

        {/* Modal Header */}
        <div className="theme-modal-header flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white leading-tight">Cosmic Aesthetics & Typography</h3>
              <p className="text-xs text-slate-300">Customize color glow, reading fonts & text scale</p>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Colors vs Typography) */}
        <div className="theme-modal-tabs flex gap-2 pt-3 pb-1">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'colors' 
                ? 'bg-gold text-slate-950 shadow-md shadow-gold/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Palette className="w-4 h-4" /> Color Aura & Glow
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'typography' 
                ? 'bg-gold text-slate-950 shadow-md shadow-gold/30' 
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Type className="w-4 h-4" /> Typography & Text Style
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="theme-modal-content-scroll flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
          {activeTab === 'colors' ? (
            <>
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
            </>
          ) : (
            <>
              {/* ============================================================ */}
              {/* 🔤 Typography & Font Style Suite */}
              {/* ============================================================ */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">
                    1. Choose Font Family & Heading Aesthetic
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FONT_STYLE_PRESETS.map((font) => {
                      const isSelected = fontStyleId === font.id;
                      return (
                        <button
                          key={font.id}
                          className={`p-3.5 rounded-2xl glass-panel text-left flex items-start gap-3 transition-all ${
                            isSelected 
                              ? 'border-gold bg-gold/20 shadow-lg shadow-gold/20' 
                              : 'border-white/10 hover:border-gold/40 bg-slate-900/60'
                          }`}
                          onClick={() => handleSelectFont(font.id)}
                        >
                          <span className="text-xl flex-shrink-0">{font.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-sm text-white" style={{ fontFamily: font.headingFont }}>
                                {font.name}
                              </strong>
                              {isSelected && <Check className="w-4 h-4 text-gold flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-snug" style={{ fontFamily: font.bodyFont }}>
                              {font.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size Scaling */}
                <div>
                  <span className="text-xs font-bold text-cyan uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> 2. Reading Text Size Scaling
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_SIZE_PRESETS.map((size) => {
                      const isSelected = fontSizeId === size.id;
                      return (
                        <button
                          key={size.id}
                          onClick={() => handleSelectSize(size.id)}
                          className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                            isSelected 
                              ? 'bg-cyan/20 border-cyan text-white font-bold shadow-md shadow-cyan/20' 
                              : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-cyan/40'
                          }`}
                        >
                          <span className="text-xs block">{size.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{size.sizePx}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Line-Height Spacing */}
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                    3. Reading Line Spacing (Paragraph Air)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {LINE_HEIGHT_PRESETS.map((line) => {
                      const isSelected = lineHeightId === line.id;
                      return (
                        <button
                          key={line.id}
                          onClick={() => handleSelectLineHeight(line.id)}
                          className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                            isSelected 
                              ? 'bg-purple-500/20 border-purple-400 text-white font-bold shadow-md shadow-purple-500/20' 
                              : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-purple-400/40'
                          }`}
                        >
                          <span className="text-xs block">{line.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* ✨ Live Interactive Preview Box */}
          {/* ============================================================ */}
          <div className="live-theme-preview p-5 rounded-3xl glass-panel border border-gold/30 bg-slate-950/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Aesthetic & Font Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentFontObj.name} • {fontSizeId}
              </span>
            </div>

            <div>
              <h4 
                className="text-lg font-bold text-white tracking-wide"
                style={{ fontFamily: currentFontObj.headingFont }}
              >
                The Hermetic Principle of Polarity & Cosmic Destiny
              </h4>
              <p 
                className="text-slate-300 mt-2 leading-relaxed"
                style={{ fontFamily: currentFontObj.bodyFont }}
              >
                "Everything is dual; everything has poles; everything has its pair of opposites; like and unlike are the same; opposites are identical in nature, but different in degree."
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold bg-gold text-slate-950">
                <Sparkles className="w-3.5 h-3.5" /> Primary Action
              </button>
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-cyan border border-cyan/30">
                Transits Active
              </div>
              <span className="text-xs text-slate-300 font-medium">
                432 Hz Solfeggio Resonator
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="theme-modal-footer pt-4 border-t border-white/10 flex justify-between items-center">
          <button 
            onClick={handleResetDefault}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-white/5"
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
