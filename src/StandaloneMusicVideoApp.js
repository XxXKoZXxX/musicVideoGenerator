import React, { useState } from 'react';
import VideoStudioView from './components/views/VideoStudioView';
import CharacterStudioView from './components/views/CharacterStudioView';
import ShareModal from './components/share/ShareModal';
import ThemeCustomizerModal from './components/theme/ThemeCustomizerModal';
import {
  Film,
  User,
  Share2,
  Palette,
} from 'lucide-react';
import './styles/StandaloneMusicVideoApp.css';


export default function StandaloneMusicVideoApp() {
  // Modes: 'musicvid-creator' | 'character-creator' | 'vocal-cloner' | 'forecast-animator'
  const [currentMode, setCurrentMode] = useState('musicvid-creator');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Global Project State for Video & Character Engine
  const [project, setProject] = useState(() => ({
    artistName: 'Astraea Cosmic',
    renderStyle: 'photoreal',
    rendererEngine: 'ai-neural',
    selectedVideoModel: 'higgsfield_dop',
    selectedStoryGenerator: 'gemini_flash',
    motionMode: 'higgsfield-orbit-360',
    lensProfile: 'anamorphic-239',
    lightingRig: 'volumetric-fog',
    velocityPreset: 'speed-ramp',
    motionIntensity: 100,
    lipSyncSensitivity: 1.2,
    characterPerformance: true,
    audioTitle: 'Cyberpunk 2077 Night Drive',
    bpm: 128,
    duration: 32,
    resolution: '1080p',
    aspectRatio: '16:9',
    lyricsStyle: 'neon',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    ],
  }));

  const handleNavigate = (target) => {
    if (target === 'characterStudio' || target === 'character') {
      setCurrentMode('character-creator');
    } else if (target === 'vocal') {
      setCurrentMode('vocal-cloner');
    } else {
      setCurrentMode('musicvid-creator');
    }
  };

  return (
    <div className="standalone-musicvid-app">
      {/* TOP DIRECTORIAL HEADER */}
      <header className="standalone-header">
        <div className="header-left">
          <div className="app-brand-badge">
            <Film className="w-5 h-5 text-amber-400" />
            <span className="brand-title">Astraea Cinema & Vocal Studio</span>
            <span className="brand-pill">STANDALONE 4K PRO</span>
          </div>

          {/* Core Studio Navigation Tabs */}
          <nav className="header-nav-tabs">
            <button
              type="button"
              className={`nav-tab-pill ${currentMode === 'musicvid-creator' ? 'active' : ''}`}
              onClick={() => setCurrentMode('musicvid-creator')}
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>AI Music Video Creator</span>
            </button>
            <button
              type="button"
              className={`nav-tab-pill ${currentMode === 'character-creator' || currentMode === 'vocal-cloner' ? 'active' : ''}`}
              onClick={() => setCurrentMode('character-creator')}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Character & Vocal Cloner</span>
            </button>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="header-right">
          <button
            type="button"
            className="btn btn-ghost btn-sm flex items-center gap-1.5"
            onClick={() => setIsThemeModalOpen(true)}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Theme</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Network Share & Mobile App</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO VIEWPORT */}
      <main className="standalone-main-content">
        {currentMode === 'musicvid-creator' && (
          <VideoStudioView
            profile={{ name: project.artistName }}
            onNavigate={handleNavigate}
          />
        )}

        {(currentMode === 'character-creator' || currentMode === 'vocal-cloner') && (
          <CharacterStudioView
            project={project}
            onNavigate={handleNavigate}
            onSelectCharacter={(actor) => {
              setProject((prev) => ({
                ...prev,
                leadActor: actor,
              }));
              setCurrentMode('musicvid-creator');
            }}
          />
        )}
      </main>

      {/* MODALS */}
      {isShareModalOpen && (
        <ShareModal onClose={() => setIsShareModalOpen(false)} />
      )}
      {isThemeModalOpen && (
        <ThemeCustomizerModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
    </div>
  );
}
