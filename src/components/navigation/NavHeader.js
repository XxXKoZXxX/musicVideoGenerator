import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, Plus, Sparkles, Compass, BookOpen, 
  Radio, Film, MessageSquare, Eye, Headphones, 
  Calculator, Heart, FileText, Zap, Key, 
  Search, ArrowLeft, Palette, Moon, Edit3, X, Flame, ChevronRight, Rocket, Share2
} from 'lucide-react';

export const CATEGORY_HUBS = [
  {
    id: 'identity_hub',
    label: '🌟 My Identity',
    shortLabel: 'Identity',
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    defaultView: 'overview',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300',
    views: [
      { id: 'overview', label: 'Home Dashboard', icon: <Sparkles className="w-4 h-4 text-amber-400" />, desc: 'Cosmic identity, daily weather & quick links', tag: 'Home' },
      { id: 'editProfile', label: 'My Birth Details', icon: <Edit3 className="w-4 h-4 text-amber-400" />, desc: 'Edit name, birth date, time & city location', tag: 'Profile' },
      { id: 'report', label: 'Master Dossier Report', icon: <FileText className="w-4 h-4 text-amber-400" />, desc: 'Comprehensive printable birth blueprint', tag: 'Printable' }
    ]
  },
  {
    id: 'astrology_hub',
    label: '🪐 Sky & Stars',
    shortLabel: 'Astrology',
    icon: <Compass className="w-4 h-4 text-cyan-400" />,
    defaultView: 'astrology',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
    views: [
      { id: 'astrology', label: 'Birth Chart Wheel', icon: <Compass className="w-4 h-4 text-cyan-400" />, desc: 'Interactive celestial natal chart wheel & houses', tag: 'Chart' },
      { id: 'secretLanguage', label: 'Secret Language', icon: <BookOpen className="w-4 h-4 text-amber-400" />, desc: '366 Day archetypes, meditations & decans', tag: 'Archetypes' },
      { id: 'transits', label: 'Transits Radar', icon: <Zap className="w-4 h-4 text-yellow-400" />, desc: 'Live current cosmic aspects & daily sky', tag: 'Live' },
      { id: 'karma', label: 'Past-Life Karma', icon: <Key className="w-4 h-4 text-purple-400" />, desc: 'North Node destiny & Chiron sacred healing', tag: 'Destiny' }
    ]
  },
  {
    id: 'grimoire_hub',
    label: '🔮 Magic & Tarot',
    shortLabel: 'Grimoire',
    icon: <Flame className="w-4 h-4 text-rose-400" />,
    defaultView: 'grimoire',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-300',
    views: [
      { id: 'grimoire', label: 'Grand Occult Grimoire', icon: <Flame className="w-4 h-4 text-amber-400" />, desc: '10 Portals: Philosophy, Spells, Spirit Box & Breathwork', tag: 'Grimoire' },
      { id: 'dream', label: 'Astral Dream Sanctuary', icon: <Moon className="w-4 h-4 text-cyan-400" />, desc: 'Jungian dream decoder & 50+ symbol dictionary', tag: 'Dreams' },
      { id: 'tarot', label: 'Tarot Card Spreads', icon: <Eye className="w-4 h-4 text-purple-400" />, desc: 'Past / Present / Future 3-card divination spreads', tag: 'Tarot' },
      { id: 'tarotLibrary', label: '78-Card Encyclopedia', icon: <BookOpen className="w-4 h-4 text-amber-400" />, desc: 'Complete Major & Minor Arcana database', tag: 'Library' }
    ]
  },
  {
    id: 'media_hub',
    label: '🎙️ Media & AI',
    shortLabel: 'Media',
    icon: <Radio className="w-4 h-4 text-emerald-400" />,
    defaultView: 'podcast',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    views: [
      { id: 'podcast', label: 'Dual-Host Voice Podcast', icon: <Radio className="w-4 h-4 text-rose-400" />, desc: 'Atlas & Luna conversational voice audio reading', tag: 'Podcast' },
      { id: 'video', label: 'AI Music Video Studio', icon: <Film className="w-4 h-4 text-emerald-400" />, desc: '4-Step Studio with Higgsfield, Sora, Runway & 60 FPS Export', tag: 'AI Studio' },
      { id: 'characterStudio', label: 'AI Character & Vocal Cloner', icon: <Sparkles className="w-4 h-4 text-amber-400" />, desc: 'Sculpt 3D lead singer avatars and clone vocal formant profiles', tag: 'Vocal Cloner' },
      { id: 'oracleChat', label: 'Hermetic Oracle Chat', icon: <MessageSquare className="w-4 h-4 text-cyan-400" />, desc: 'Stream chat with Alexandria mystical AI oracle', tag: 'AI Chat' },
      { id: 'soundscape', label: 'Sacred Frequencies', icon: <Headphones className="w-4 h-4 text-cyan-400" />, desc: '20+ Solfeggio frequencies & sacred visualizer', tag: 'Sound' }
    ]
  },
  {
    id: 'numerology_hub',
    label: '💖 Love & Numbers',
    shortLabel: 'Love',
    icon: <Calculator className="w-4 h-4 text-pink-400" />,
    defaultView: 'numerology',
    color: 'from-pink-500/20 to-purple-500/10 border-pink-500/40 text-pink-300',
    views: [
      { id: 'personalityTest', label: 'Soul Personality Test', icon: <Sparkles className="w-4 h-4 text-purple-400" />, desc: 'Elemental archetype quiz & ideal partner compatibility', tag: 'Personality' },
      { id: 'synastry', label: 'Dual Partner Alignment', icon: <Heart className="w-4 h-4 text-pink-400" />, desc: '10-subject side-by-side comparison, green/red flags & longevity', tag: 'Partner Match' },
      { id: 'numerology', label: 'Numerology Matrix', icon: <Calculator className="w-4 h-4 text-amber-400" />, desc: 'Life Path, Expression, Soul Urge & Birthday numbers', tag: 'Numbers' }
    ]
  }
];

export const ALL_STUDIOS = CATEGORY_HUBS.flatMap(h => h.views);

export default function NavHeader({ currentView, onNavigate, activeProfile, onOpenProfiles, onCreateProfile, onOpenTheme, onOpenShare }) {
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Find which category hub contains the active currentView
  const currentHub = CATEGORY_HUBS.find(hub => hub.views.some(v => v.id === currentView)) || CATEGORY_HUBS[0];

  // Global Ctrl+K listener to trigger quick search palette
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
    <header className="nav-header-wrapper no-print mb-3 md:mb-4" role="banner">
      <div className="navbar-container glass-panel bg-slate-950/90 border border-amber-400/30 rounded-2xl md:rounded-3xl p-2.5 md:p-4 shadow-2xl flex items-center justify-between gap-2 md:gap-3">
        
        <div 
          className="nav-brand cursor-pointer flex items-center gap-2.5 select-none group" 
          onClick={() => onNavigate('overview')}
          title="Return to Home Dashboard"
        >
          <div className="brand-logo flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md md:shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-200">
            <Star className="logo-star w-5 h-5 md:w-6 md:h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="brand-title text-lg md:text-2xl font-extrabold tracking-normal text-white leading-none">
                Astraea <span className="text-amber-400">✨</span>
              </h1>
            </div>
            <span className="brand-tagline text-[10px] md:text-[11px] font-medium text-slate-300 hidden sm:block mt-0.5">
              Cosmic Oracle & Studios
            </span>
          </div>
        </div>

        <button 
          className="command-search-btn flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-amber-400/15 border border-amber-400/40 hover:bg-amber-400/25 text-amber-300 transition-all shadow-sm group"
          onClick={() => setIsCommandModalOpen(true)}
          title="Browse All 16 Studios (Ctrl + K)"
        >
          <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-xs md:text-sm font-bold block">
            <span className="hidden sm:inline">Explore </span>16 Studios
          </span>
          <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-amber-200/80 bg-black/40 rounded-lg border border-amber-400/30">
            Ctrl K
          </kbd>
        </button>

        <nav className="nav-category-menu hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-amber-400/20" aria-label="Category Hubs">
          {CATEGORY_HUBS.map(hub => {
            const isHubActive = hub.id === currentHub.id;
            return (
              <button 
                key={hub.id}
                className={`hub-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isHubActive 
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105' 
                    : 'bg-transparent text-slate-300 hover:text-amber-300 hover:bg-amber-400/10'
                }`}
                onClick={() => onNavigate(hub.defaultView)}
                title={`Open ${hub.label}`}
              >
                <span>{hub.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-profile-section flex items-center gap-1.5 md:gap-2">
          <button 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/40 text-amber-300 hover:scale-105 transition-all text-xs font-bold shadow-sm"
            onClick={() => {
              localStorage.setItem('app_mode', 'musicvid');
              window.location.search = '?app=musicvid';
            }}
            title="Open Standalone AI Music Video & Vocal Cloner App (Freebeat 4K Studio)"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Standalone Video Studio</span>
            <span className="xl:hidden">Video App</span>
          </button>

          <button 
            className="share-nav-btn hidden md:flex p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 transition-all shadow-sm"
            onClick={onOpenShare}
            title="Share App with Friends & Testers"
            aria-label="Share App"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button 
            className="theme-nav-btn p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 transition-all shadow-sm"
            onClick={onOpenTheme}
            title="Customize Theme, Colors & Text Style"
            aria-label="App Themes"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button 
            className="profile-active-btn flex items-center gap-2 px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-amber-400/15 border border-amber-400/40 hover:bg-amber-400/25 text-amber-300 transition-all shadow-sm group" 
            onClick={onOpenProfiles} 
            title="Click to Switch Profiles or Edit Details"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow">
              {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="profile-name-text text-xs font-bold text-slate-100 block max-w-[80px] truncate leading-tight">
                {activeProfile.name}
              </span>
              <span className="text-[10px] text-amber-300 font-semibold block leading-none">
                Profiles ▾
              </span>
            </div>
          </button>

          <button 
            className="add-profile-quick-btn hidden lg:flex p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 transition-all" 
            onClick={onCreateProfile}
            title="Add New Profile"
            aria-label="Add Profile"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentView !== 'overview' && (
        <div className="sub-view-bar-container glass-panel bg-slate-950/70 border border-amber-400/20 rounded-xl md:rounded-2xl flex justify-between items-center px-3 md:px-4 py-1.5 md:py-2 mt-2">
          <div className="sub-view-pills flex items-center gap-1.5 md:gap-2 overflow-x-auto py-1 w-full no-scrollbar">
            <button 
              onClick={() => onNavigate('overview')} 
              className="breadcrumb-back-btn text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 mr-1.5 pr-2.5 border-r border-amber-400/30 font-bold flex-shrink-0"
              title="Return to Home Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" /> Home
            </button>

            {currentHub.views.map(view => {
              const isViewActive = view.id === currentView;
              return (
                <button
                  key={view.id}
                  className={`sub-view-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg md:rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isViewActive 
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 scale-105' 
                      : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  onClick={() => onNavigate(view.id)}
                >
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🚀 Studios Directory & Command Palette Modal (All 16 Studios) */}
      {/* ============================================================ */}
      {isCommandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsCommandModalOpen(false)}>
          <div 
            className="command-modal-content glass-panel w-full max-w-2xl rounded-3xl border border-amber-400/40 bg-slate-950/98 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Live Search Bar */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/80">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search studios (e.g. Tarot, Grimoire, Twin Flame, Birth Chart)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-slate-400 outline-none w-full font-semibold"
                />
              </div>
              <button 
                onClick={() => setIsCommandModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Studio List */}
            <div className="command-modal-scroll max-h-[65vh] overflow-y-auto p-4 space-y-4">
              {searchQuery ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Search Results ({filteredStudios.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredStudios.map(studio => (
                      <div
                        key={studio.id}
                        onClick={() => {
                          onNavigate(studio.id);
                          setIsCommandModalOpen(false);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          currentView === studio.id 
                            ? 'bg-amber-400/20 border-amber-400 shadow-md' 
                            : 'bg-slate-900/80 border-white/10 hover:border-amber-400/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center flex-shrink-0">
                            {studio.icon}
                          </div>
                          <div>
                            <strong className="text-sm text-white block font-bold">{studio.label}</strong>
                            <span className="text-xs text-slate-300 block line-clamp-1">{studio.desc}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                CATEGORY_HUBS.map(hub => (
                  <div key={hub.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
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
                            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isActive 
                                ? 'bg-amber-400/20 border-amber-400 shadow-md' 
                                : 'bg-slate-900/70 border-white/10 hover:border-amber-400/50 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center flex-shrink-0">
                                {studio.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm text-white font-bold">{studio.label}</strong>
                                  {isActive && <span className="text-[10px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">Active</span>}
                                </div>
                                <span className="text-xs text-slate-300 block line-clamp-1">{studio.desc}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>✨ Tap any studio to launch right away</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-[10px] text-amber-300">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
