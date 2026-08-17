import React from 'react';
import { Sparkles, Compass, Flame, User, LayoutGrid } from 'lucide-react';

export default function MobileNavBar({ currentView, onNavigate, onOpenStudios }) {
  const tabs = [
    { id: 'overview', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'editProfile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'astrology', label: 'Sky Chart', icon: <Compass className="w-5 h-5" /> },
    { id: 'grimoire', label: 'Grimoire', icon: <Flame className="w-5 h-5" /> }
  ];

  return (
    <nav className="mobile-bottom-nav glass-panel no-print" aria-label="Mobile Navigation">
      <div className="mobile-nav-items flex items-center justify-around w-full py-1">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              className={`mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${isActive ? 'active text-amber-300 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => onNavigate(tab.id)}
            >
              <div className={`tab-icon-box p-1 rounded-xl transition-all ${isActive ? 'bg-amber-400/20 text-amber-300 shadow-sm border border-amber-400/40' : 'text-slate-400'}`}>
                {tab.icon}
              </div>
              <span className={`tab-label text-[11px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* All Studios Mega Drawer Trigger */}
        <button
          className={`mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all ${!tabs.some(t => t.id === currentView) ? 'active text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={onOpenStudios}
          title="Browse All 16 Studios"
        >
          <div className={`tab-icon-box p-1 rounded-xl transition-all ${!tabs.some(t => t.id === currentView) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-cyan-500/10 text-cyan-400'}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className={`tab-label text-[11px] font-bold mt-0.5 tracking-tight ${!tabs.some(t => t.id === currentView) ? 'text-cyan-300' : 'text-cyan-400'}`}>
            Studios
          </span>
        </button>
      </div>
    </nav>
  );
}
