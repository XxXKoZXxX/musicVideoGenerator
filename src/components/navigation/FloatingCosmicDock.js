import React from 'react';
import { 
  Sparkles, Compass, BookOpen, Radio, Zap, Eye, Headphones, Calculator, Film,
  MessageSquare, Key, Heart, FileText, Moon, Flame, User
} from 'lucide-react';

export default function FloatingCosmicDock({ currentView, onNavigate }) {
  const dockItems = [
    { id: 'overview', label: 'Dashboard', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'editProfile', label: 'My Details', icon: <User className="w-5 h-5 text-gold" /> },
    { id: 'divider1', label: '', isDivider: true },
    { id: 'astrology', label: 'Birth Chart', icon: <Compass className="w-5 h-5" /> },
    { id: 'secretLanguage', label: 'Secret Language', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'transits', label: 'Transits Radar', icon: <Zap className="w-5 h-5" /> },
    { id: 'karma', label: 'Past Karma', icon: <Key className="w-5 h-5" /> },
    { id: 'divider2', label: '', isDivider: true },
    { id: 'grimoire', label: 'Grimoire', icon: <Flame className="w-5 h-5" /> },
    { id: 'dream', label: 'Dream Sanctuary', icon: <Moon className="w-5 h-5" /> },
    { id: 'tarot', label: 'Tarot Spreads', icon: <Eye className="w-5 h-5" /> },
    { id: 'divider3', label: '', isDivider: true },
    { id: 'podcast', label: 'Audio Podcast', icon: <Radio className="w-5 h-5" /> },
    { id: 'video', label: 'Motion Video', icon: <Film className="w-5 h-5" /> },
    { id: 'oracleChat', label: 'AI Oracle', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'soundscape', label: 'Soundscapes', icon: <Headphones className="w-5 h-5" /> },
    { id: 'divider4', label: '', isDivider: true },
    { id: 'numerology', label: 'Numerology', icon: <Calculator className="w-5 h-5" /> },
    { id: 'synastry', label: 'Dual Synastry', icon: <Heart className="w-5 h-5" /> },
    { id: 'report', label: 'Master Report', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <nav className="floating-cosmic-dock no-print hidden md:flex" aria-label="Quick Cosmic Navigation Dock">
      <div className="dock-container glass-panel bg-slate-950/90 border border-gold/30 shadow-2xl p-1.5 flex items-center gap-1 rounded-2xl">
        {dockItems.map(item => {
          if (item.isDivider) {
            return <div key={item.id} className="dock-divider w-px h-6 bg-white/10 mx-0.5" />;
          }
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`dock-btn relative p-2 rounded-xl transition-all ${
                isActive 
                  ? 'active bg-gold text-slate-950 shadow-lg shadow-gold/30 scale-110' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <div className="dock-icon-wrapper flex items-center justify-center">
                {item.icon}
              </div>
              <span className="dock-tooltip absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-950 border border-gold/40 text-[11px] font-bold text-white whitespace-nowrap opacity-0 pointer-events-none transition-opacity shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
