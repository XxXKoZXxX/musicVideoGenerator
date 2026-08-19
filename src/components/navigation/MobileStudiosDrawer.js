import React, { useState } from 'react';
import { 
  X, Sparkles, Compass, BookOpen, Zap, Key, Eye, Headphones, 
  Calculator, HeartHandshake, Radio, Film, MessageSquare, FileText, Palette, ChevronRight, Moon, Flame, Search, Edit3, Share2
} from 'lucide-react';

export const ALL_STUDIO_MODULES = [
  { id: 'overview', title: 'Dashboard', desc: 'Cosmic triad & daily weather', icon: <Sparkles className="w-5 h-5 text-amber-400" />, category: 'Identity', catId: 'identity', tag: 'Daily' },
  { id: 'editProfile', title: 'My Birth Details', desc: 'Name, date, time & city location', icon: <Edit3 className="w-5 h-5 text-amber-400" />, category: 'Identity', catId: 'identity', tag: 'Profile' },
  { id: 'report', title: 'Master Dossier', desc: 'Comprehensive printable birth blueprint', icon: <FileText className="w-5 h-5 text-amber-400" />, category: 'Identity', catId: 'identity', tag: 'Printable' },

  { id: 'astrology', title: 'Birth Chart Wheel', desc: '12 Houses, aspects & degrees', icon: <Compass className="w-5 h-5 text-cyan-400" />, category: 'Sky & Stars', catId: 'astrology', tag: 'Chart' },
  { id: 'secretLanguage', title: 'Secret Language', desc: '366 Day archetypes & meditations', icon: <BookOpen className="w-5 h-5 text-amber-400" />, category: 'Sky & Stars', catId: 'astrology', tag: 'Archetype' },
  { id: 'transits', title: 'Transits Radar', desc: 'Live current cosmic aspects today', icon: <Zap className="w-5 h-5 text-yellow-400" />, category: 'Sky & Stars', catId: 'astrology', tag: 'Live' },
  { id: 'karma', title: 'Past-Life Karma', desc: 'North Node destiny & Chiron wound', icon: <Key className="w-5 h-5 text-purple-400" />, category: 'Sky & Stars', catId: 'astrology', tag: 'Destiny' },
  
  { id: 'grimoire', title: 'Grand Grimoire', desc: 'Philosophy, Spells, Spirit Box & Palmistry', icon: <Flame className="w-5 h-5 text-rose-400" />, category: 'Magic & Tarot', catId: 'grimoire', tag: 'Grimoire' },
  { id: 'dream', title: 'Dream Sanctuary', desc: 'Jungian archetypes & 50+ symbol dictionary', icon: <Moon className="w-5 h-5 text-cyan-400" />, category: 'Magic & Tarot', catId: 'grimoire', tag: 'Dreams' },
  { id: 'tarot', title: 'Tarot Card Spreads', desc: 'Past / Present / Future 3-card readings', icon: <Eye className="w-5 h-5 text-purple-400" />, category: 'Magic & Tarot', catId: 'grimoire', tag: 'Divination' },
  { id: 'tarotLibrary', title: '78-Card Library', desc: 'Complete Arcana meanings & symbolism', icon: <BookOpen className="w-5 h-5 text-cyan-400" />, category: 'Magic & Tarot', catId: 'grimoire', tag: 'Encyclopedia' },

  { id: 'podcast', title: 'Dual-Host Podcast', desc: 'Conversational audio reading with 432 Hz music', icon: <Radio className="w-5 h-5 text-rose-400" />, category: 'Media & AI', catId: 'media', tag: 'Voice' },
  { id: 'video', title: 'AI Video Studio', desc: '4-Step Studio with Sora, Runway & 60 FPS Export', icon: <Film className="w-5 h-5 text-emerald-400" />, category: 'Media & AI', catId: 'media', tag: 'Video AI' },
  { id: 'oracleChat', title: 'AI Oracle & Journal', desc: 'Interactive esoteric Q&A assistant', icon: <MessageSquare className="w-5 h-5 text-cyan-400" />, category: 'Media & AI', catId: 'media', tag: 'AI Chat' },
  { id: 'soundscape', title: 'Sacred Frequencies', desc: 'Harmonic Solfeggio & cymatic visualizer', icon: <Headphones className="w-5 h-5 text-cyan-400" />, category: 'Media & AI', catId: 'media', tag: 'Sound' },

  { id: 'personalityTest', title: 'Soul Personality Quiz', desc: 'Elemental archetype & ideal partner matching', icon: <Sparkles className="w-5 h-5 text-purple-400" />, category: 'Love & Numbers', catId: 'love', tag: 'Quiz' },
  { id: 'synastry', title: 'Dual Partner Alignment', desc: '10-subject comparison & longevity flags', icon: <HeartHandshake className="w-5 h-5 text-pink-400" />, category: 'Love & Numbers', catId: 'love', tag: 'Match' },
  { id: 'numerology', title: 'Numerology Matrix', desc: 'Life Path, Expression & Soul Urge', icon: <Calculator className="w-5 h-5 text-amber-400" />, category: 'Love & Numbers', catId: 'love', tag: 'Numbers' }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Studios (16)' },
  { id: 'identity', label: '🌟 Identity' },
  { id: 'astrology', label: '🪐 Sky & Stars' },
  { id: 'grimoire', label: '🔮 Grimoire' },
  { id: 'media', label: '🎙️ Media & AI' },
  { id: 'love', label: '💖 Love & Numbers' }
];

export default function MobileStudiosDrawer({ currentView, onNavigate, onClose, onOpenTheme, onOpenShare }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredModules = ALL_STUDIO_MODULES.filter(m => {
    const matchesSearch = !searchQuery || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'all' || m.catId === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mobile-studios-backdrop no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end" onClick={onClose}>
      <div 
        className="mobile-studios-sheet glass-panel bg-slate-950/98 rounded-t-3xl border-t border-amber-400/40 max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div className="sheet-drag-handle-bar pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="sheet-drag-handle w-12 h-1.5 rounded-full bg-slate-600"></div>
        </div>

        {/* Sheet Header */}
        <div className="sheet-header px-4 py-2.5 flex items-center justify-between border-b border-amber-400/20">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>All 16 Cosmic Studios</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">16 Tools</span>
            </h3>
            <p className="text-xs text-slate-300">Tap any studio to launch directly</p>
          </div>
          <button 
            className="sheet-close-btn p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-amber-300 hover:bg-amber-400/10 transition-colors" 
            onClick={onClose}
            aria-label="Close Studios"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Shortcuts Bar */}
        <div className="quick-actions-bar px-4 py-2 bg-slate-900/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              onNavigate('editProfile');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold whitespace-nowrap hover:bg-amber-400/25 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Details
          </button>

          {onOpenTheme && (
            <button
              onClick={() => {
                onOpenTheme();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold whitespace-nowrap hover:bg-purple-500/25 transition-all"
            >
              <Palette className="w-3.5 h-3.5" /> App Themes
            </button>
          )}

          {onOpenShare && (
            <button
              onClick={() => {
                onOpenShare();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold whitespace-nowrap hover:bg-cyan-500/25 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share App
            </button>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="p-3 bg-slate-900/80 border-b border-amber-400/20 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus-within:border-amber-400 transition-colors">
            <Search className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search by name, category, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs md:text-sm text-white placeholder-slate-400 outline-none w-full font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-0.5"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="category-filter-chips px-4 py-2 bg-slate-950/70 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map(cat => {
            const isSelected = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (searchQuery) setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Modules Grid */}
        <div className="sheet-content-scroll flex-1 overflow-y-auto p-4 space-y-2 pb-12">
          {filteredModules.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <p className="text-sm font-semibold">No studios match "{searchQuery}"</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs text-amber-300 underline font-bold"
              >
                View all 16 studios
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredModules.map((mod) => {
                const isActive = currentView === mod.id;
                return (
                  <button
                    key={mod.id}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'bg-amber-400/20 border-amber-400 shadow-md shadow-amber-400/15' 
                        : 'bg-slate-900/85 border-slate-700/60 hover:border-amber-400/50 hover:bg-slate-900 active:scale-[0.98]'
                    }`}
                    onClick={() => {
                      onNavigate(mod.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700/70 flex items-center justify-center flex-shrink-0 shadow-inner">
                        {mod.icon}
                      </div>
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-sm text-white font-bold truncate block">{mod.title}</strong>
                          {isActive && (
                            <span className="text-[9px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.2 rounded-md">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-300 block line-clamp-1 mt-0.5">{mod.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

