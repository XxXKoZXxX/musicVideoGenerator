import React, { useState, useEffect } from 'react';
import ModernStudioWorkstation from './components/studio/ModernStudioWorkstation';
import VideoStudioView from './components/views/VideoStudioView';
import CharacterStudioView from './components/views/CharacterStudioView';
import ShareModal from './components/share/ShareModal';
import ThemeCustomizerModal from './components/theme/ThemeCustomizerModal';
import FreebeatAutoDirectorModal from './components/common/FreebeatAutoDirectorModal';
import FeatureStudioModal from './components/studio/FeatureStudioModal';
import { loadSavedTheme } from './utils/themeEngine';
import {
  Film,
  User,
  Share2,
  Palette,
  Compass,
  Sliders,
  Flame,
  Mic,
} from 'lucide-react';
import './styles/StandaloneMusicVideoApp.css';


export default function StandaloneMusicVideoApp() {
  // Modes: 'musicvid-studio' | 'musicvid-wizard' | 'character-creator' | 'vocal-cloner'
  const [currentMode, setCurrentMode] = useState('musicvid-studio');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoModalMode, setAutoModalMode] = useState(undefined);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

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
    } else if (target === 'wizard') {
      setCurrentMode('musicvid-wizard');
    } else {
      setCurrentMode('musicvid-studio');
    }
  };

  const handleSwitchToCosmicStudio = () => {
    localStorage.removeItem('app_mode');
    const url = new URL(window.location.href);
    url.searchParams.delete('app');
    window.location.href = url.pathname;
  };

  return (
    <div className="standalone-musicvid-app">
      {/* TOP DIRECTORIAL HEADER */}
      <header className="standalone-header">
        <div className="header-left">
          <div className="app-brand-badge">
            <Film className="w-5 h-5 text-amber-400" />
            <span className="brand-title">Astraea Cinema & Vocal Studio</span>
            <span className="brand-pill">FREEBEAT 4K PRO</span>
          </div>

          {/* Core Studio Navigation Tabs — pure navigation, no feature-launch actions */}
          <nav className="header-mode-nav">
            <div className="header-nav-tabs">
              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'musicvid-studio' ? 'active' : ''}`}
                onClick={() => setCurrentMode('musicvid-studio')}
              >
                <Film className="w-4 h-4 text-cyan-400" />
                <span>Studio DAW & Timeline</span>
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'musicvid-wizard' ? 'active' : ''}`}
                onClick={() => setCurrentMode('musicvid-wizard')}
              >
                <Sliders className="w-4 h-4 text-fuchsia-400" />
                <span>4-Step Wizard</span>
              </button>
              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'character-creator' || currentMode === 'vocal-cloner' ? 'active' : ''}`}
                onClick={() => setCurrentMode('character-creator')}
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Character & Vocal Cloner</span>
              </button>
            </div>

            {/* Automatic mode — one-click entry points, reusing FreebeatAutoDirectorModal's
                existing Singing/Storytelling step rather than new modal plumbing */}
            <div className="header-automatic-group">
              <button
                type="button"
                className="automatic-mode-pill"
                onClick={() => {
                  setAutoModalMode('singing');
                  setIsAutoModalOpen(true);
                }}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>⚡ Automatic · Singing</span>
              </button>
              <button
                type="button"
                className="automatic-mode-pill storytelling"
                onClick={() => {
                  setAutoModalMode('storytelling');
                  setIsAutoModalOpen(true);
                }}
              >
                <Film className="w-3.5 h-3.5" />
                <span>⚡ Automatic · Storytelling</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Header Actions — feature launchers, not navigation */}
        <div className="header-right">
          <button
            type="button"
            className="toolbar-quick-btn hot-features"
            onClick={() => setIsFeatureModalOpen(true)}
          >
            <Flame className="w-4 h-4" />
            <span>🔥 Hot & Free AI Features</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm header-action-btn"
            onClick={handleSwitchToCosmicStudio}
            title="Switch to Astraea Astrology & Tarot Studio"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Cosmic Studio</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm header-action-btn"
            onClick={() => setIsThemeModalOpen(true)}
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Theme</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm header-action-btn"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Network Share & Mobile App</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO VIEWPORT */}
      <main className="standalone-main-content">
        {currentMode === 'musicvid-studio' && (
          <ModernStudioWorkstation
            project={project}
            onNavigate={handleNavigate}
          />
        )}

        {currentMode === 'musicvid-wizard' && (
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
      {isFeatureModalOpen && (
        <FeatureStudioModal
          isOpen={isFeatureModalOpen}
          onClose={() => setIsFeatureModalOpen(false)}
          project={project}
          onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
          onAddScene={(newScene) => {
            setProject((prev) => ({
              ...prev,
              images: [...prev.images, newScene.imageUrl || newScene],
            }));
          }}
        />
      )}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          appName="Astraea Cinema & Vocal Studio"
          inviteTemplates={{
            general: {
              label: '🌟 General',
              title: '🌟 General Test Invitation',
              text: (url) => `✨ Hey! I'm testing Astraea Cinema — an AI music video, character studio & vocal cloner. Try it out here:\n👉 ${url}`,
            },
            singing: {
              label: '🎤 Singing Mode',
              title: '🎤 AI Vocal Performance Test',
              text: (url) => `🎬 Check out this AI singer lip-sync demo I made on Astraea Cinema:\n👉 ${url}`,
            },
            storytelling: {
              label: '🎬 Storytelling',
              title: '🎬 Cinematic Story Mode Test',
              text: (url) => `🔥 I generated a cinematic AI music video on Astraea Cinema — take a look:\n👉 ${url}`,
            },
          }}
        />
      )}
      {isThemeModalOpen && (
        <ThemeCustomizerModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
      {isAutoModalOpen && (
        <FreebeatAutoDirectorModal
          isOpen={isAutoModalOpen}
          onClose={() => setIsAutoModalOpen(false)}
          initialVideoMode={autoModalMode}
          onAutoGenerateComplete={(autoProject) => {
            setProject(autoProject);
            setCurrentMode('musicvid-creator');
          }}
          project={project}
        />
      )}
    </div>
  );
}
