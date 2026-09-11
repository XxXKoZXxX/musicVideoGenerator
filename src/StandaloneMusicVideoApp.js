import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clapperboard,
  LayoutTemplate,
  HardDrive,
  Mic,
  User,
  Zap,
  Cpu,
  Bot,
  Palette,
  Share2,
  Compass,
  Menu,
  X,
  Check,
  Loader2,
  Radio,
  Music4,
  Sparkles,
  Flame,
  ChevronRight,
} from 'lucide-react';

import VideoStudioView from './components/views/VideoStudioView';
import ModernStudioWorkstation from './components/studio/ModernStudioWorkstation';
import VoiceClonerStudioView from './components/views/VoiceClonerStudioView';
import CharacterStudioView from './components/views/CharacterStudioView';
import ModelHubView from './components/views/ModelHubView';
import ClipInbetweenerStudioView from './components/views/ClipInbetweenerStudioView';
import RendersGalleryView from './components/views/RendersGalleryView';
import ShareModal from './components/share/ShareModal';
import ThemeCustomizerModal from './components/theme/ThemeCustomizerModal';
import OpusAgentAssistantDrawer from './components/common/OpusAgentAssistantDrawer';
import FreebeatAutoDirectorModal from './components/common/FreebeatAutoDirectorModal';
import FeatureStudioModal from './components/studio/FeatureStudioModal';
import { loadSavedTheme } from './utils/themeEngine';
import {
  renderVideoOnServer,
  checkVideoServerHealth,
} from './services/LocalServerRenderService';
import './styles/StandaloneMusicVideoApp.css';

const STORAGE_KEY = 'musicvid_project_v2';

/** Sidebar navigation definition (OPUS-agent style). */
const NAV_ITEMS = [
  { id: 'wizard', label: 'Create Video', icon: Clapperboard, tag: '4-Step Studio' },
  { id: 'studio', label: 'Timeline DAW', icon: LayoutTemplate, tag: 'Multi-Track' },
  { id: 'renders', label: 'Render Library', icon: HardDrive, tag: 'MP4 Masters' },
  { id: 'vocal-cloner', label: 'Voice Cloner', icon: Mic, tag: 'AI Vocals' },
  { id: 'character-creator', label: 'Character Studio', icon: User, tag: 'Face Lock' },
  { id: 'clip-gap-filler', label: 'Gap Filler & Stitcher', icon: Zap, tag: 'Inbetweening' },
  { id: 'model-hub', label: 'Model Hub', icon: Cpu, tag: 'Engines & $0 Tier' },
];

function stripHeavyFields(project) {
  const copy = { ...project };
  // Blob URLs are session-only; data URIs can be huge. Drop both, remember intent.
  if (typeof copy.audioBlobUrl === 'string' && copy.audioBlobUrl.startsWith('blob:')) {
    copy.needsAudioReattach = true;
    delete copy.audioBlobUrl;
    delete copy.audio;
  }
  if (Array.isArray(copy.images)) {
    copy.images = copy.images.filter((i) => typeof i === 'string' && !i.startsWith('data:') && !i.startsWith('blob:'));
    if (copy.images.length === 0) copy.needsImages = true;
  }
  delete copy.aiGeneratedVideos;
  return copy;
}

function loadSavedProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export default function StandaloneMusicVideoApp() {
  const savedProjectRef = useRef(null);
  if (savedProjectRef.current === null) {
    savedProjectRef.current = loadSavedProject();
  }
  const savedProject = savedProjectRef.current;

  const [currentMode, setCurrentMode] = useState('wizard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoModalMode, setAutoModalMode] = useState(undefined);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

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
    showLyrics: true,
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    ],
    ...(savedProject || {}),
  }));

  const [savedAt, setSavedAt] = useState(null);
  const [serverOnline, setServerOnline] = useState(null);

  // Quick-render state (floating progress card)
  const [quickRender, setQuickRender] = useState({
    active: false,
    progress: 0,
    stage: '',
    videoUrl: null,
    downloadUrl: null,
    jobId: null,
    error: null,
  });
  const [highlightJobId, setHighlightJobId] = useState(null);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  // ---- Server health polling ----
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const ok = await checkVideoServerHealth();
      if (!cancelled) setServerOnline(ok);
    };
    ping();
    const t = setInterval(ping, 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // ---- Project autosave (debounced, session-safe fields only) ----
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripHeavyFields(project)));
        setSavedAt(new Date());
      } catch (_) {}
    }, 800);
    return () => clearTimeout(t);
  }, [project]);

  const handleNavigate = useCallback((target) => {
    setSidebarOpen(false);
    if (target === 'characterStudio' || target === 'character') {
      setCurrentMode('character-creator');
    } else if (target === 'vocal' || target === 'vocal-cloner') {
      setCurrentMode('vocal-cloner');
    } else if (target === 'wizard' || target === 'video' || target === 'create') {
      setCurrentMode('wizard');
    } else if (target === 'inbetweener' || target === 'gap-filler' || target === 'clip-inbetweener' || target === 'clip-gap-filler') {
      setCurrentMode('clip-gap-filler');
    } else if (target === 'models' || target === 'hub') {
      setCurrentMode('model-hub');
    } else if (target === 'renders' || target === 'library' || target === 'render-library') {
      setCurrentMode('renders');
    } else if (target === 'studio' || target === 'daw' || target === 'timeline') {
      setCurrentMode('studio');
    } else {
      setCurrentMode('studio');
    }
    window.scrollTo({ top: 0 });
  }, []);

  const handleSwitchToCosmicStudio = () => {
    localStorage.setItem('app_mode', 'cosmic');
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'cosmic');
    window.location.href = url.toString();
  };

  // ---- Quick "Render Master" (server-side MP4 with burned-in lyrics) ----
  const handleQuickRender = async () => {
    if (quickRender.active) return;

    if (!project.lyrics || !String(project.lyrics).trim()) {
      setQuickRender({
        active: true,
        progress: 0,
        stage: 'No lyrics detected — adding plain-text auto-time alignment…',
        videoUrl: null,
        downloadUrl: null,
        jobId: null,
        error: null,
      });
      setTimeout(() => {
        alert(
          'Heads up: no lyrics found in this project yet.\n\n' +
          'The render will still run, but for a full lyric video open the Create Studio → ' +
          'Step 3 → "Synced Kinetic Lyrics" tab and paste (or upload an .lrc file with) your song lyrics, then render again.'
        );
        setQuickRender({ active: false, progress: 0, stage: '', videoUrl: null, downloadUrl: null, jobId: null, error: null });
      }, 10);
      return;
    }

    setQuickRender({
      active: true,
      progress: 2,
      stage: 'Submitting render job to local server…',
      videoUrl: null,
      downloadUrl: null,
      jobId: null,
      error: null,
    });

    try {
      const result = await renderVideoOnServer(
        { ...project, showLyrics: project.showLyrics !== false },
        { resolution: project.resolution || '1080p', fps: 30 },
        (p) => {
          setQuickRender((prev) => ({
            ...prev,
            progress: p.progress ?? prev.progress,
            stage: p.stage || prev.stage,
            videoUrl: p.videoUrl || prev.videoUrl,
            downloadUrl: p.downloadUrl || prev.downloadUrl,
            jobId: p.jobId || prev.jobId,
            error: p.error || null,
          }));
        }
      );
      setQuickRender((prev) => ({
        ...prev,
        active: false,
        progress: 100,
        stage: 'Render complete — open Render Library to stream or download.',
        videoUrl: result.videoUrl,
        downloadUrl: result.downloadUrl,
        jobId: result.id || prev.jobId,
        error: null,
      }));
      setHighlightJobId(result.outputFileName || null);
    } catch (err) {
      setQuickRender((prev) => ({
        ...prev,
        active: false,
        progress: 0,
        stage: '',
        videoUrl: null,
        downloadUrl: null,
        error: err.message || 'Render failed',
      }));
    }
  };

  const renderCardVisible = quickRender.active || quickRender.error || (quickRender.videoUrl && !quickRender.dismissed);

  const activeNav = NAV_ITEMS.find((n) => n.id === currentMode);

  return (
    <div className="opus-app">
      {/* ============ LEFT SIDEBAR (OPUS-style) ============ */}
      <aside className={`opus-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="opus-sidebar-brand" onClick={() => handleNavigate('wizard')}>
          <div className="brand-mark">
            <Clapperboard size={17} />
          </div>
          <div className="brand-text">
            <span className="brand-name">MusicVid Pro</span>
            <span className="brand-sub">AI CINEMA · 4K · v2.6</span>
          </div>
          <button
            type="button"
            className="sidebar-close mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="opus-sidebar-nav">
          <div className="nav-section-label">Studio</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
              >
                <Icon size={17} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <ChevronRight size={14} className="nav-caret" />}
              </button>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: 18 }}>
            Assist
          </div>

          <button
            type="button"
            className={`nav-item ${isAssistantOpen ? 'active' : ''}`}
            onClick={() => setIsAssistantOpen((v) => !v)}
          >
            <Bot size={17} className="nav-icon" />
            <span className="nav-label">Opus Director Agent</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setAutoModalMode('singing');
              setIsAutoModalOpen(true);
            }}
          >
            <Sparkles size={17} className="nav-icon" />
            <span className="nav-label">⚡ Auto Singing Cut</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setAutoModalMode('storytelling');
              setIsAutoModalOpen(true);
            }}
          >
            <Sparkles size={17} className="nav-icon" />
            <span className="nav-label">⚡ Auto Story Cut</span>
          </button>

          <button type="button" className="nav-item" onClick={() => setIsFeatureModalOpen(true)}>
            <Flame size={17} className="nav-icon" />
            <span className="nav-label">🔥 AI Features</span>
          </button>
        </nav>

        <div className="opus-sidebar-footer">
          <div className={`server-chip ${serverOnline ? 'online' : serverOnline === false ? 'offline' : 'checking'}`}>
            <Radio size={12} className={serverOnline ? 'pulse-dot' : ''} />
            <span>{serverOnline ? 'Render server online' : serverOnline === false ? 'Render server offline' : 'Checking server…'}</span>
          </div>

          <button type="button" className="nav-item" onClick={() => setIsThemeModalOpen(true)}>
            <Palette size={17} className="nav-icon" />
            <span className="nav-label">Theme & Aesthetics</span>
          </button>
          <button type="button" className="nav-item" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={17} className="nav-icon" />
            <span className="nav-label">Share App</span>
          </button>
          <button type="button" className="nav-item" onClick={handleSwitchToCosmicStudio}>
            <Compass size={17} className="nav-icon" />
            <span className="nav-label">Astraea Cosmic Suite</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}

      {/* ============ MAIN COLUMN ============ */}
      <div className="opus-main-wrap">
        {/* TOP BAR */}
        <header className="opus-topbar">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>

          <div className="topbar-context">
            <span className="topbar-crumb">
              {activeNav ? <activeNav.icon size={14} /> : <Clapperboard size={14} />}
              {activeNav ? activeNav.label : 'Studio'}
            </span>
            <div className="topbar-project" title="Project (autosaved)">
              <Music4 size={13} className="topbar-project-icon" />
              <input
                className="topbar-title-input"
                value={project.audioTitle || ''}
                placeholder="Untitled Music Video"
                onChange={(e) => setProject((p) => ({ ...p, audioTitle: e.target.value }))}
              />
              <span className="topbar-title-pill">{project.artistName || 'Unknown Artist'}</span>
            </div>
          </div>

          <div className="topbar-right">
            {savedAt && (
              <span className="topbar-saved" title={`Project autosaved ${savedAt.toLocaleTimeString()}`}>
                <Check size={12} /> Saved
              </span>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm topbar-ghost-btn"
              onClick={() => setIsAssistantOpen(true)}
            >
              <Bot size={15} />
              <span className="hide-mobile">Director Agent</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm topbar-render-btn"
              onClick={handleQuickRender}
              disabled={quickRender.active}
            >
              {quickRender.active ? (
                <>
                  <Loader2 size={15} className="spin-icon" /> Rendering {quickRender.progress}%
                </>
              ) : (
                <>
                  <Zap size={15} /> Render Master
                </>
              )}
            </button>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="opus-main-content">
          {savedProject?.needsAudioReattach && currentMode === 'wizard' && (
            <div className="resume-banner">
              <Music4 size={15} />
              <span>
                Project restored from your last session. Audio blobs don't survive reloads — re-drop
                your track in <strong>Step 2</strong> (lyrics, visuals and settings were kept).
              </span>
              <button type="button" onClick={() => localStorage.removeItem(STORAGE_KEY)}>
                Reset
              </button>
            </div>
          )}

          {currentMode === 'wizard' && (
            <VideoStudioView
              profile={{ name: project.artistName }}
              onNavigate={handleNavigate}
              project={project}
              onProjectChange={setProject}
            />
          )}

          {currentMode === 'vocal-cloner' && (
            <VoiceClonerStudioView
              project={project}
              onNavigate={handleNavigate}
              onApplyVocalToProject={(vocalData) => setProject((prev) => ({ ...prev, ...vocalData }))}
            />
          )}

          {currentMode === 'character-creator' && (
            <CharacterStudioView
              project={project}
              onNavigate={handleNavigate}
              onSelectCharacter={(actor) => {
                setProject((prev) => ({ ...prev, leadActor: actor }));
                setCurrentMode('wizard');
              }}
            />
          )}

          {currentMode === 'studio' && (
            <ModernStudioWorkstation project={project} onNavigate={handleNavigate} />
          )}

          {currentMode === 'clip-gap-filler' && (
            <ClipInbetweenerStudioView
              project={project}
              onNavigate={handleNavigate}
              onApplyMasterToProject={(masterData) => setProject((prev) => ({ ...prev, ...masterData }))}
            />
          )}

          {currentMode === 'model-hub' && (
            <ModelHubView
              project={project}
              onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {currentMode === 'renders' && (
            <RendersGalleryView onNavigate={handleNavigate} highlightJobId={highlightJobId} />
          )}
        </main>
      </div>

      {/* ============ FLOATING QUICK-RENDER CARD ============ */}
      {renderCardVisible && (
        <div className="quick-render-card">
          <div className="qrc-header">
            <span className="qrc-title">
              {quickRender.error ? (
                <>⚠️ Render Problem</>
              ) : quickRender.active ? (
                <>
                  <Loader2 size={14} className="spin-icon" /> Rendering on Local Server
                </>
              ) : (
                <>✅ Master Video Ready</>
              )}
            </span>
            <button type="button" className="qrc-close" onClick={() => setQuickRender({ active: false, progress: 0, stage: '', videoUrl: null, downloadUrl: null, jobId: null, error: null })}>
              <X size={13} />
            </button>
          </div>

          {quickRender.error ? (
            <p className="qrc-error">{quickRender.error}</p>
          ) : (
            <>
              {quickRender.stage && <p className="qrc-stage">{quickRender.stage}</p>}

              {!quickRender.active && (
                <div className="qrc-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleNavigate('renders');
                      setQuickRender({ active: false, progress: 0, stage: '', videoUrl: null, downloadUrl: null, jobId: null, error: null, dismissed: true });
                    }}
                  >
                    <HardDrive size={13} /> Open in Render Library
                  </button>
                  {quickRender.downloadUrl && (
                    <a
                      className="btn btn-secondary btn-sm"
                      href={quickRender.downloadUrl}
                      download={highlightJobId || 'master_video.mp4'}
                    >
                      <Zap size={13} /> Download MP4
                    </a>
                  )}
                </div>
              )}
            </>
          )}

          {quickRender.active && (
            <div className="qrc-progress">
              <div className="qrc-progress-fill" style={{ width: `${quickRender.progress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* ============ MODALS & DRAWERS ============ */}
      {isFeatureModalOpen && (
        <FeatureStudioModal
          isOpen={isFeatureModalOpen}
          onClose={() => setIsFeatureModalOpen(false)}
          project={project}
          onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
          onAddScene={(newScene) => {
            setProject((prev) => ({
              ...prev,
              images: [...(prev.images || []), newScene.imageUrl || newScene],
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
            setCurrentMode('wizard');
          }}
          project={project}
        />
      )}
      <OpusAgentAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        project={project}
        onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
        onApplyScenes={(scenes) => {
          setProject((prev) => ({
            ...prev,
            screenplay: {
              title: prev.audioTitle || 'Opus Scene Plan',
              duration: prev.duration || 32,
              bpm: prev.bpm || 128,
              scenesCount: scenes.length,
              scenes,
            },
          }));
        }}
      />
    </div>
  );
}
