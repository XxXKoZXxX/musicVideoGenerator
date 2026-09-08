import React, { useState, useEffect } from 'react';
import ModernStudioWorkstation from './components/studio/ModernStudioWorkstation';
import VideoStudioView from './components/views/VideoStudioView';
import CharacterStudioView from './components/views/CharacterStudioView';
import VoiceClonerStudioView from './components/views/VoiceClonerStudioView';
import ModelHubView from './components/views/ModelHubView';
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
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import './styles/StandaloneMusicVideoApp.css';

export default function StandaloneMusicVideoApp() {
  // Modes: 'musicvid-studio' | 'musicvid-wizard' | 'vocal-cloner' | 'character-creator' | 'model-hub'
  const [currentMode, setCurrentMode] = useState('musicvid-wizard');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoModalMode, setAutoModalMode] = useState(undefined);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Global Project State for Video, Character & Vocal Engines
  const [project, setProject] = useState(() => ({
    artistName: 'Astraea Cosmic',
    renderStyle: 'photoreal',
    rendererEngine: 'ai-neural',
    selectedVideoModel: 'sora_ai',
    selectedStoryGenerator: 'gemini_flash',
    motionMode: '3d-parallax',
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
    } else if (target === 'vocal' || target === 'vocal-cloner') {
      setCurrentMode('vocal-cloner');
    } else if (target === 'wizard' || target === 'video') {
      setCurrentMode('musicvid-wizard');
    } else if (target === 'models' || target === 'hub') {
      setCurrentMode('model-hub');
    } else {
      setCurrentMode('musicvid-studio');
    }
  };

  const handleSwitchToCosmicStudio = () => {
    localStorage.setItem('app_mode', 'cosmic');
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'cosmic');
    window.location.href = url.toString();
  };

  return (
    <div className="standalone-musicvid-app">
      {/* TOP DIRECTORIAL HEADER */}
      <header className="standalone-header">
        <div className="header-left">
          <div className="app-brand-badge cursor-pointer" onClick={() => setCurrentMode('musicvid-wizard')}>
            <Film className="w-5 h-5 text-amber-400" />
            <span className="brand-title">MusicVid Pro & Voice Cloner</span>
            <span className="brand-pill">AI CINEMA 4K</span>
          </div>

          {/* Core Studio Navigation Tabs */}
          <nav className="header-mode-nav">
            <div className="header-nav-tabs">
              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'musicvid-wizard' ? 'active' : ''}`}
                onClick={() => setCurrentMode('musicvid-wizard')}
              >
                <Film className="w-4 h-4 text-cyan-400" />
                <span>AI Video Creator (4-Step Studio)</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'vocal-cloner' ? 'active' : ''}`}
                onClick={() => setCurrentMode('vocal-cloner')}
              >
                <Mic className="w-4 h-4 text-fuchsia-400" />
                <span>AI Voice Cloner</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'character-creator' ? 'active' : ''}`}
                onClick={() => setCurrentMode('character-creator')}
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Character & Face Lock</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'musicvid-studio' ? 'active' : ''}`}
                onClick={() => setCurrentMode('musicvid-studio')}
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Timeline DAW</span>
              </button>

              <button
                type="button"
                className={`nav-tab-pill ${currentMode === 'model-hub' ? 'active' : ''}`}
                onClick={() => setCurrentMode('model-hub')}
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Model Hub & $0 Free Tier</span>
              </button>
            </div>

            {/* Quick Auto-Director Actions */}
            <div className="header-automatic-group hidden xl:flex">
              <button
                type="button"
                className="automatic-mode-pill"
                onClick={() => {
                  setAutoModalMode('singing');
                  setIsAutoModalOpen(true);
                }}
              >
                <Mic className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>⚡ Auto Singing Cut</span>
              </button>
              <button
                type="button"
                className="automatic-mode-pill storytelling"
                onClick={() => {
                  setAutoModalMode('storytelling');
                  setIsAutoModalOpen(true);
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Auto Story Cut</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="header-right">
          <button
            type="button"
            className="toolbar-quick-btn hot-features"
            onClick={() => setIsFeatureModalOpen(true)}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>🔥 AI Features</span>
          </button>
          
          <button
            type="button"
            className="btn btn-ghost btn-sm header-action-btn"
            onClick={handleSwitchToCosmicStudio}
            title="Switch to Astraea Astrology & Tarot Studio"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Astraea Cosmic Suite</span>
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
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO VIEWPORT */}
      <main className="standalone-main-content">
        {currentMode === 'musicvid-wizard' && (
          <VideoStudioView
            profile={{ name: project.artistName }}
            onNavigate={handleNavigate}
          />
        )}

        {currentMode === 'vocal-cloner' && (
          <VoiceClonerStudioView
            project={project}
            onNavigate={handleNavigate}
            onApplyVocalToProject={(vocalData) => {
              setProject((prev) => ({
                ...prev,
                ...vocalData,
              }));
            }}
          />
        )}

        {currentMode === 'character-creator' && (
          <CharacterStudioView
            project={project}
            onNavigate={handleNavigate}
            onSelectCharacter={(actor) => {
              setProject((prev) => ({
                ...prev,
                leadActor: actor,
              }));
              setCurrentMode('musicvid-wizard');
            }}
          />
        )}

        {currentMode === 'musicvid-studio' && (
          <ModernStudioWorkstation
            project={project}
            onNavigate={handleNavigate}
          />
        )}

        {currentMode === 'model-hub' && (
          <ModelHubView
            project={project}
            onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
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
          appName="MusicVid Pro & Voice Cloner"
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
            setCurrentMode('musicvid-wizard');
          }}
          project={project}
        />
      )}
    </div>
  );
}
