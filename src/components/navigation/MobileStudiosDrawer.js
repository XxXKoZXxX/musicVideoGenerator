import React, { useState } from 'react';
import { 
  X, Sparkles, Compass, BookOpen, Zap, Key, Eye, Headphones, 
  Calculator, HeartHandshake, Radio, Film, MessageSquare, FileText, Palette, ChevronRight, Moon, Flame, Search, Edit3
} from 'lucide-react';

export const ALL_STUDIO_MODULES = [
  { id: 'overview', title: 'Dashboard', desc: 'At-a-glance cosmic triad & daily guidance', icon: <Sparkles className="w-5 h-5 text-gold" />, category: 'Dashboard & Identity' },
  { id: 'editProfile', title: 'My Birth Details', desc: 'Enter & edit name, birth date, time & place', icon: <Edit3 className="w-5 h-5 text-gold" />, category: 'Dashboard & Identity' },
  { id: 'report', title: 'Master Dossier Report', desc: 'Comprehensive printable birth report', icon: <FileText className="w-5 h-5 text-gold" />, category: 'Dashboard & Identity' },

  { id: 'astrology', title: 'Birth Chart Wheel', desc: 'Full natal chart with 12 houses & aspects', icon: <Compass className="w-5 h-5 text-cyan" />, category: 'Astrology & Sky' },
  { id: 'secretLanguage', title: 'Secret Language', desc: '366 Day archetypes with daily meditations', icon: <BookOpen className="w-5 h-5 text-amber-400" />, category: 'Astrology & Sky' },
  { id: 'transits', title: 'Transits Radar', desc: 'Today\'s sky planets vs your natal placements', icon: <Zap className="w-5 h-5 text-gold" />, category: 'Astrology & Sky' },
  { id: 'karma', title: 'Past-Life Karma', desc: 'North Node destiny & Chiron sacred wound', icon: <Key className="w-5 h-5 text-purple-400" />, category: 'Astrology & Sky' },
  
  { id: 'grimoire', title: 'Grand Occult Grimoire', desc: 'Philosophy, Spells, Alchemy, Spirit Box & Palmistry', icon: <Flame className="w-5 h-5 text-gold" />, category: 'Grimoire & Divination' },
  { id: 'dream', title: 'Dream Sanctuary & Oracle', desc: 'Jungian archetypes & 50+ symbol encyclopedia', icon: <Moon className="w-5 h-5 text-cyan" />, category: 'Grimoire & Divination' },
  { id: 'tarot', title: 'Tarot Card Spreads', desc: 'Past / Present / Future readings', icon: <Eye className="w-5 h-5 text-purple-400" />, category: 'Grimoire & Divination' },
  { id: 'tarotLibrary', title: '78-Card Encyclopedia', desc: 'Complete card meanings & symbolism', icon: <BookOpen className="w-5 h-5 text-cyan" />, category: 'Grimoire & Divination' },

  { id: 'podcast', title: 'Dual-Host Podcast', desc: 'NotebookLM conversational audio reading', icon: <Radio className="w-5 h-5 text-rose-400" />, category: 'Media & AI' },
  { id: 'video', title: 'Motion Video Studio', desc: '60 FPS animated forecast video generator', icon: <Film className="w-5 h-5 text-emerald-400" />, category: 'Media & AI' },
  { id: 'oracleChat', title: 'AI Oracle & Notebook', desc: 'Interactive esoteric Q&A assistant', icon: <MessageSquare className="w-5 h-5 text-cyan" />, category: 'Media & AI' },
  { id: 'soundscape', title: 'Solfeggio & Frequencies', desc: 'Harmonic binaural & sacred geometry visualizer', icon: <Headphones className="w-5 h-5 text-cyan" />, category: 'Media & AI' },

  { id: 'personalityTest', title: 'Soul Personality Test', desc: 'Elemental archetype quiz & ideal partner compatibility', icon: <Sparkles className="w-5 h-5 text-purple-400" />, category: 'Numerology & Love' },
  { id: 'synastry', title: 'Dual Partner Alignment', desc: '10-subject comparison, green/red flags & longevity', icon: <HeartHandshake className="w-5 h-5 text-pink-400" />, category: 'Numerology & Love' },
  { id: 'numerology', title: 'Numerology Matrix', desc: 'Life Path, Expression & Soul Urge numbers', icon: <Calculator className="w-5 h-5 text-gold" />, category: 'Numerology & Love' }
];

export default function MobileStudiosDrawer({ currentView, onNavigate, onClose, onOpenTheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [
    'Dashboard & Identity', 
    'Astrology & Sky', 
    'Grimoire & Divination', 
    'Media & AI', 
    'Numerology & Love'
  ];

  const filteredModules = ALL_STUDIO_MODULES.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mobile-studios-backdrop no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end" onClick={onClose}>
      <div 
        className="mobile-studios-sheet glass-panel bg-slate-950/98 rounded-t-3xl border-t border-gold/40 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div className="sheet-drag-handle-bar pt-3 pb-1 flex justify-center">
          <div className="sheet-drag-handle w-12 h-1.5 rounded-full bg-slate-700"></div>
        </div>

        {/* Sheet Header */}
        <div className="sheet-header px-4 py-2 flex items-center justify-between border-b border-amber-400/20">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-100">All 16 Cosmic Studios</h3>
            <p className="text-xs text-slate-300">Tap any studio to launch directly</p>
          </div>
          <button className="sheet-close-btn p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 hover:bg-amber-400/10" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Theme Quick Bar */}
        <div className="p-3 bg-slate-900/60 border-b border-amber-400/20 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700/60">
            <Search className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search studios & tools..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-400 outline-none w-full font-medium"
            />
          </div>

          <button 
            className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 flex items-center gap-1 text-xs font-bold"
            onClick={() => {
              onOpenTheme();
              onClose();
            }}
            title="App Theme"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>

        {/* Modules List by Category */}
        <div className="sheet-content-scroll flex-1 overflow-y-auto p-4 space-y-4 pb-8">
          {searchQuery ? (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Search Results ({filteredModules.length})</span>
              <div className="grid grid-cols-1 gap-2">
                {filteredModules.map(mod => {
                  const isActive = currentView === mod.id;
                  return (
                    <button
                      key={mod.id}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isActive ? 'bg-amber-400/20 border-amber-400' : 'bg-slate-900/80 border-slate-700/60 hover:border-amber-400/50'
                      }`}
                      onClick={() => {
                        onNavigate(mod.id);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                          {mod.icon}
                        </div>
                        <div>
                          <strong className="text-sm text-white block">{mod.title}</strong>
                          <span className="text-xs text-slate-300 block line-clamp-1">{mod.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat} className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">{cat}</span>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_STUDIO_MODULES.filter(m => m.category === cat).map((mod) => {
                    const isActive = currentView === mod.id;
                    return (
                      <button
                        key={mod.id}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isActive ? 'bg-amber-400/20 border-amber-400 shadow-md' : 'bg-slate-900/80 border-slate-700/60 hover:border-amber-400/50'
                        }`}
                        onClick={() => {
                          onNavigate(mod.id);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                            {mod.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm text-white">{mod.title}</strong>
                              {isActive && <span className="text-[9px] font-bold text-amber-400 bg-amber-400/20 px-1.5 py-0.2 rounded-full">Active</span>}
                            </div>
                            <span className="text-xs text-slate-300 block line-clamp-1">{mod.desc}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
