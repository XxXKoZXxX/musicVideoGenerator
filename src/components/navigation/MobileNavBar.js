import React from 'react';
import { Sparkles, Compass, Flame, Wand2, LayoutGrid } from 'lucide-react';

export default function MobileNavBar({ currentView, onNavigate, onOpenStudios }) {
  const primaryTabs = [
    { id: 'overview', label: 'Home', icon: Sparkles },
    { id: 'astrology', label: 'Sky Chart', icon: Compass },
    { id: 'grimoire', label: 'Grimoire', icon: Flame },
    { id: 'video', label: 'AI Studio', icon: Wand2 }
  ];

  const isPrimaryActive = primaryTabs.some(tab => tab.id === currentView);

  return (
    <nav className="mobile-bottom-nav glass-panel no-print" aria-label="Mobile Navigation">
      <div className="mobile-nav-items flex items-center justify-around w-full">
        {primaryTabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-all ${
                isActive 
                  ? 'active text-amber-300 font-bold' 
                  : 'text-slate-300 hover:text-white'
              }`}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
            >
              <div 
                className={`tab-icon-box p-1.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-400/25 text-amber-300 shadow-lg shadow-amber-400/20 border border-amber-400/50 scale-105' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`tab-label text-[11px] font-semibold mt-0.5 tracking-tight ${isActive ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* All Studios Drawer Launcher */}
        <button
          className={`mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-all ${
            !isPrimaryActive ? 'active text-cyan-300 font-bold' : 'text-slate-300 hover:text-white'
          }`}
          onClick={onOpenStudios}
          aria-label="Browse All 16 Studios"
        >
          <div 
            className={`tab-icon-box p-1.5 rounded-xl transition-all duration-200 ${
              !isPrimaryActive 
                ? 'bg-cyan-500/25 text-cyan-300 shadow-lg shadow-cyan-500/20 border border-cyan-400/50 scale-105' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className={`tab-label text-[11px] font-semibold mt-0.5 tracking-tight ${!isPrimaryActive ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
            Studios
          </span>
        </button>
      </div>
    </nav>
  );
}

