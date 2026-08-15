import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, Users, Plus, Sparkles, Compass, BookOpen, 
  Radio, Film, MessageSquare, Eye, Headphones, 
  Calculator, Heart, FileText, Zap, Key, 
  Search, ArrowLeft, Palette, Moon, Edit3, X, Flame, ChevronRight
} from 'lucide-react';

export const CATEGORY_HUBS = [
  {
    id: 'identity_hub',
    label: 'Dashboard & Profile',
    icon: <Sparkles className="w-4 h-4 text-gold" />,
    defaultView: 'overview',
    views: [
      { id: 'overview', label: 'Overview Dashboard', icon: <Sparkles className="w-4 h-4 text-gold" />, desc: 'Cosmic identity, daily weather & quick links', tag: 'Home' },
      { id: 'editProfile', label: 'My Birth Details', icon: <Edit3 className="w-4 h-4 text-gold" />, desc: 'Update name, date, time & location', tag: 'Identity' },
      { id: 'report', label: 'Master Dossier Report', icon: <FileText className="w-4 h-4 text-gold" />, desc: 'Comprehensive printable astrological dossier', tag: 'Printable' }
    ]
  },
  {
    id: 'astrology_hub',
    label: 'Astrology & Sky',
    icon: <Compass className="w-4 h-4 text-cyan" />,
    defaultView: 'astrology',
    views: [
      { id: 'astrology', label: 'Birth Chart Wheel', icon: <Compass className="w-4 h-4 text-cyan" />, desc: 'Planetary placements, houses & celestial chart', tag: 'Astrology' },
      { id: 'secretLanguage', label: 'Secret Language', icon: <BookOpen className="w-4 h-4 text-amber-400" />, desc: '366 Day archetypes, meditations & decans', tag: 'Archetypes' },
      { id: 'transits', label: 'Transits Radar', icon: <Zap className="w-4 h-4 text-gold" />, desc: 'Live current astrological aspects & weather', tag: 'Realtime' },
      { id: 'karma', label: 'Past-Life Karma', icon: <Key className="w-4 h-4 text-purple-400" />, desc: 'North Node destiny & Chiron sacred healing', tag: 'Destiny' }
    ]
  },
  {
    id: 'grimoire_hub',
    label: 'Grimoire & Divination',
    icon: <Flame className="w-4 h-4 text-rose-400" />,
    defaultView: 'grimoire',
    views: [
      { id: 'grimoire', label: 'Grand Occult Grimoire', icon: <Flame className="w-4 h-4 text-gold" />, desc: '10 Portals: Philosophy, Spells, Spirit Box & Pranayama', tag: 'Encyclopedia' },
      { id: 'dream', label: 'Astral Dream Sanctuary', icon: <Moon className="w-4 h-4 text-cyan" />, desc: 'Jungian dream decoder & 50+ symbol dictionary', tag: 'Subconscious' },
      { id: 'tarot', label: 'Tarot Card Spreads', icon: <Eye className="w-4 h-4 text-purple-400" />, desc: 'Past/Present/Future 3-card divination spreads', tag: 'Divination' },
      { id: 'tarotLibrary', label: '78-Card Encyclopedia', icon: <BookOpen className="w-4 h-4 text-gold" />, desc: 'Complete Major & Minor Arcana database', tag: 'Reference' }
    ]
  },
  {
    id: 'media_hub',
    label: 'Media & AI Oracle',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    defaultView: 'podcast',
    views: [
      { id: 'podcast', label: 'Dual-Host Voice Podcast', icon: <Radio className="w-4 h-4 text-rose-400" />, desc: 'Atlas & Luna conversational voice audio reading', tag: 'Audio LM' },
      { id: 'video', label: 'Motion Video Studio', icon: <Film className="w-4 h-4 text-emerald-400" />, desc: '60 FPS animated cosmic forecast video exporter', tag: 'Video 60FPS' },
      { id: 'oracleChat', label: 'AI Oracle & Notebook', icon: <MessageSquare className="w-4 h-4 text-cyan" />, desc: 'Contextual AI Q&A & saved spiritual journal', tag: 'AI Assistant' },
      { id: 'soundscape', label: 'Sacred Frequencies', icon: <Headphones className="w-4 h-4 text-cyan" />, desc: '20+ Solfeggio frequencies & sacred visualizer', tag: 'Soundscape' }
    ]
  },
  {
    id: 'numerology_hub',
    label: 'Numerology & Love',
    icon: <Calculator className="w-4 h-4 text-pink-400" />,
    defaultView: 'numerology',
    views: [
      { id: 'numerology', label: 'Numerology Matrix', icon: <Calculator className="w-4 h-4 text-gold" />, desc: 'Life Path, Expression, Soul Urge & Birthday numbers', tag: 'Vibrations' },
      { id: 'synastry', label: 'Dual Comparison Matrix', icon: <Heart className="w-4 h-4 text-pink-400" />, desc: '10-subject side-by-side comparison & Twin Flame quiz', tag: 'Compatibility' }
    ]
  }
];

export const ALL_STUDIOS = CATEGORY_HUBS.flatMap(h => h.views);

export default function NavHeader({ currentView, onNavigate, activeProfile, onOpenProfiles, onCreateProfile, onOpenTheme }) {
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Find which category hub contains the active currentView
  const currentHub = CATEGORY_HUBS.find(hub => hub.views.some(v => v.id === currentView)) || CATEGORY_HUBS[0];
  const activeViewObj = ALL_STUDIOS.find(v => v.id === currentView) || ALL_STUDIOS[0];

  // Global Ctrl+K / Cmd+K listener to trigger quick search palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandModalOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isCommandModalOpen) {
        setIsCommandModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandModalOpen]);

  // Focus search input when command modal opens
  useEffect(() => {
    if (isCommandModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isCommandModalOpen]);

  const filteredStudios = ALL_STUDIOS.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.tag && s.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="nav-header-wrapper no-print" role="banner">
      {/* Top Main Glass Navigation Bar */}
      <div className="navbar-container glass-panel">
        {/* Brand Logo & Home Trigger */}
        <div 
          className="nav-brand cursor-pointer flex items-center gap-3 select-none" 
          onClick={() => onNavigate('overview')}
          title="Return to Home Dashboard"
        >
          <div className="brand-logo flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-gold/30 to-amber-600/10 border border-gold/40 shadow-lg shadow-gold/20">
            <Star className="logo-star w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="brand-title font-serif text-lg font-bold tracking-widest text-white leading-none">ASTRAEA</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">PRO</span>
            </div>
            <span className="brand-tagline text-[11px] text-slate-300 font-medium block mt-0.5">Secret Language & Esoteric Super Studio</span>
          </div>
        </div>

        {/* 🌟 Universal Studio Directory / Quick Command Button */}
        <button 
          className="command-search-btn flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-gold/30 hover:border-gold hover:bg-slate-800 transition-all text-left group shadow-sm"
          onClick={() => setIsCommandModalOpen(true)}
          title="Browse All 16 Studios (Ctrl + K)"
        >
          <Search className="w-4 h-4 text-gold group-hover:scale-110 transition-transform flex-shrink-0" />
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-white block leading-tight">Studios Directory</span>
            <span className="text-[10px] text-slate-400 block">16 Studios & Portals</span>
          </div>
          <kbd className="hidden lg:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 rounded border border-white/10">
            Ctrl K
          </kbd>
        </button>

        {/* 5 Main Categorized Navigation Hub Tabs */}
        <nav className="nav-category-menu hidden md:flex items-center gap-1.5" aria-label="Main Navigation Hubs">
          {CATEGORY_HUBS.map(hub => {
            const isHubActive = hub.id === currentHub.id;
            return (
              <button 
                key={hub.id}
                className={`hub-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isHubActive 
                    ? 'bg-gold/20 text-gold border border-gold/50 shadow-md shadow-gold/10' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => onNavigate(hub.defaultView)}
                title={`Open ${hub.label}`}
              >
                {hub.icon}
                <span>{hub.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile & Theme Actions */}
        <div className="nav-profile-section flex items-center gap-2">
          {/* Theme Customizer Button */}
          <button 
            className="theme-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/30 hover:border-gold hover:bg-gold/20 transition-all"
            onClick={onOpenTheme}
            title="Customize App Colors & Theme"
          >
            <Palette className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-white hidden xl:inline">Theme</span>
          </button>

          {/* Active Profile Pill / Direct Edit Trigger */}
          <button 
            className="profile-active-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-gold/40 hover:border-gold hover:bg-slate-800 transition-all shadow-sm" 
            onClick={() => onNavigate('editProfile')} 
            title="Click to View or Edit Your Birth Details"
          >
            <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold">
              {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="profile-name-text text-xs font-bold text-white block max-w-[90px] truncate leading-tight">{activeProfile.name}</span>
              <span className="text-[10px] text-cyan block font-mono leading-none">Edit Details</span>
            </div>
          </button>

          {/* Profile Switcher Drawer Trigger */}
          <button 
            className="profile-switch-btn p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan hover:bg-white/10 text-slate-300 transition-all" 
            onClick={onOpenProfiles} 
            title="Switch Between Saved Profiles"
          >
            <Users className="w-4 h-4 text-cyan" />
          </button>

          {/* Quick Add Profile */}
          <button 
            className="add-profile-quick-btn p-2 rounded-xl bg-gold/15 border border-gold/30 hover:border-gold hover:bg-gold/25 text-gold transition-all" 
            onClick={onCreateProfile}
            title="Add New Person / Twin Flame Profile"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-View Navigation Bar & Breadcrumb Trail */}
      <div className="sub-view-bar-container glass-panel flex justify-between items-center px-4 py-2 mt-2">
        <div className="sub-view-pills flex items-center gap-2 overflow-x-auto py-1">
          {currentView !== 'overview' && (
            <button 
              onClick={() => onNavigate('overview')} 
              className="breadcrumb-back-btn text-xs text-slate-300 hover:text-gold flex items-center gap-1.5 mr-2 pr-3 border-r border-white/10 font-bold flex-shrink-0"
              title="Return to Home Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gold" /> Dashboard
            </button>
          )}

          {/* Render sister views inside the current category */}
          {currentHub.views.map(view => {
            const isViewActive = view.id === currentView;
            return (
              <button
                key={view.id}
                className={`sub-view-pill flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isViewActive 
                    ? 'bg-gold text-slate-950 font-bold shadow-lg shadow-gold/30' 
                    : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
                onClick={() => onNavigate(view.id)}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Current Studio Active Status Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 pl-4 border-l border-white/10 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-serif font-bold">{activeViewObj.label}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🔮 Studio Directory & Command Palette Modal (Full 16 Studios) */}
      {/* ============================================================ */}
      {isCommandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsCommandModalOpen(false)}>
          <div 
            className="command-modal-content glass-panel w-full max-w-2xl rounded-3xl border border-gold/40 bg-slate-950/95 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Live Search Bar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/60">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-gold flex-shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search all 16 studios, astrology, grimoire, tarot..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-slate-400 outline-none w-full font-medium"
                />
              </div>
              <button 
                onClick={() => setIsCommandModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Studio List */}
            <div className="command-modal-scroll max-h-[65vh] overflow-y-auto p-4 space-y-4">
              {searchQuery ? (
                // Filtered Search Results
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">Search Results ({filteredStudios.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredStudios.map(studio => (
                      <div
                        key={studio.id}
                        onClick={() => {
                          onNavigate(studio.id);
                          setIsCommandModalOpen(false);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          currentView === studio.id 
                            ? 'bg-gold/20 border-gold shadow-md' 
                            : 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                            {studio.icon}
                          </div>
                          <div>
                            <strong className="text-sm text-white block">{studio.label}</strong>
                            <span className="text-xs text-slate-300 block line-clamp-1">{studio.desc}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Grouped by Category Hub
                CATEGORY_HUBS.map(hub => (
                  <div key={hub.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {hub.icon}
                      <span>{hub.label}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {hub.views.map(studio => {
                        const isActive = currentView === studio.id;
                        return (
                          <div
                            key={studio.id}
                            onClick={() => {
                              onNavigate(studio.id);
                              setIsCommandModalOpen(false);
                            }}
                            className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isActive 
                                ? 'bg-gold/20 border-gold shadow-md' 
                                : 'bg-slate-900/70 border-white/10 hover:border-gold/50 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center">
                                {studio.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm text-white">{studio.label}</strong>
                                  {isActive && <span className="text-[9px] font-bold text-gold bg-gold/20 px-1.5 py-0.2 rounded-full">Active</span>}
                                </div>
                                <span className="text-xs text-slate-300 block line-clamp-1">{studio.desc}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>💡 Tap any studio to launch immediately</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono text-[10px] text-white">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
