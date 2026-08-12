import React, { useState } from 'react';
import { Layers, Music, Film, Video, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import './App.css';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import StepFour from './components/StepFour';
import { SINGER_PORTRAITS } from './services/StoryDirector';
import { getRenderStyleById } from './services/RenderStyles';

const STEP_LABELS = [
  { step: 1, title: 'Style & Storyboard', sub: 'STAGE 01', icon: Layers },
  { step: 2, title: 'Soundtrack & Beat Lab', sub: 'STAGE 02', icon: Music },
  { step: 3, title: 'Screenplay & Lyrics', sub: 'STAGE 03', icon: Film },
  { step: 4, title: 'Studio Monitor & Master', sub: 'STAGE 04', icon: Video },
];

const MASTER_PRESETS = [
  {
    id: 'cyberpunk',
    name: '⚡ Cyberpunk 2077',
    renderStyle: 'cyberpunk',
    audioTitle: 'Cyberpunk 2077 Night Drive',
    bpm: 128,
    duration: 32,
    artistName: 'KIRIKO NEON',
    atmosphereMode: 'rain',
    motionMode: '3d-parallax',
  },
  {
    id: 'anime',
    name: '🌸 Anime J-Rock',
    renderStyle: 'anime',
    audioTitle: 'Starlight Festival Drop',
    bpm: 150,
    duration: 32,
    artistName: 'HIKARI SHONEN',
    atmosphereMode: 'sakura',
    motionMode: 'hyper-zoom',
  },
  {
    id: 'cgi_3d',
    name: '✨ 3D Pixar CGI',
    renderStyle: 'cgi_3d',
    audioTitle: 'Cosmic Horizon Odyssey',
    bpm: 95,
    duration: 32,
    artistName: 'NOVA POP',
    atmosphereMode: 'godrays',
    motionMode: 'fluid-warp',
  },
  {
    id: 'vhs',
    name: '📼 90s MTV VHS',
    renderStyle: 'vhs_retro',
    audioTitle: 'Neon Sunset 1984',
    bpm: 120,
    duration: 32,
    artistName: 'RETRO WAVE 84',
    atmosphereMode: 'none',
    motionMode: 'cinematic-pan',
  },
  {
    id: 'trap',
    name: '🔥 808 Trap District',
    renderStyle: 'photoreal',
    audioTitle: 'Sub-Bass 808 District',
    bpm: 140,
    duration: 32,
    artistName: 'METRO DRILL',
    atmosphereMode: 'embers',
    motionMode: '3d-parallax',
  },
];

export default function App() {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState({
    renderStyle: 'photoreal',
    atmosphereMode: 'rain',
    motionMode: '3d-parallax',
    motionIntensity: 100,
    artistName: 'NEON ARTIST',
    enableTvBroadcastGraphic: true,
    singerImageUrl: SINGER_PORTRAITS[0].url,
    directorMode: 'hybrid',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    ],
    audio: null,
    audioTitle: 'Cyberpunk 2077 Night Drive',
    bpm: 128,
    duration: 32,
    transition: 'zoom',
    characterPerformance: true,
    lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
    lyricsStyle: 'neon',
    recommendedLut: 'cinema35',
    recommendedVisualizer: 'ribbon',
  });

  const handleNext = (updates) => {
    setProject((prev) => ({ ...prev, ...updates }));
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleDirectStepJump = (targetStep) => {
    setStep(targetStep);
  };

  const handleApplyPreset = (preset) => {
    const styleObj = getRenderStyleById(preset.renderStyle);
    setProject((prev) => ({
      ...prev,
      renderStyle: preset.renderStyle,
      audioTitle: preset.audioTitle,
      bpm: preset.bpm,
      duration: preset.duration,
      artistName: preset.artistName,
      atmosphereMode: preset.atmosphereMode,
      motionMode: preset.motionMode,
      singerImageUrl: styleObj.defaultSinger || prev.singerImageUrl,
      images: styleObj.defaultScenes || prev.images,
      recommendedLut: styleObj.lutId || 'cinema35',
      recommendedVisualizer: styleObj.visualizerStyle || 'radial',
    }));
  };

  const handleResetProject = () => {
    if (window.confirm('Start a fresh music video project?')) {
      setStep(1);
      setProject({
        renderStyle: 'photoreal',
        atmosphereMode: 'rain',
        motionMode: '3d-parallax',
        motionIntensity: 100,
        artistName: 'NEON ARTIST',
        enableTvBroadcastGraphic: true,
        singerImageUrl: SINGER_PORTRAITS[0].url,
        directorMode: 'hybrid',
        images: [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
        ],
        audio: null,
        audioTitle: 'Cyberpunk 2077 Night Drive',
        bpm: 128,
        duration: 32,
        transition: 'zoom',
        characterPerformance: true,
        lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
        lyricsStyle: 'neon',
        recommendedLut: 'cinema35',
        recommendedVisualizer: 'ribbon',
      });
    }
  };

  return (
    <div className="app-shell">
      {/* Master Glassmorphic Header */}
      <header className="app-header">
        <div className="header-branding">
          <div className="logo-glow-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="title-row">
              <h1>MusicVid Studio</h1>
              <span className="pro-badge">ULTRA 4K</span>
            </div>
            <p>AI Music Video Director & Viseme Lip-Syncing Engine</p>
          </div>
        </div>

        {/* 1-Click Master Presets Quick Bar */}
        <div className="header-presets-bar">
          <span className="preset-bar-label">
            <Wand2 size={13} color="#06b6d4" /> Quick Presets:
          </span>
          {MASTER_PRESETS.map((p) => (
            <button
              key={p.id}
              className="preset-pill-btn"
              onClick={() => handleApplyPreset(p)}
              title={`Load ${p.name} style, character, and track`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button className="header-reset-btn" onClick={handleResetProject} title="New Project">
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </header>

      {/* Interactive Direct-Click Milestone Stepper Bar */}
      <div className="stepper-container">
        <div className="stepper-bar">
          {STEP_LABELS.map((item, index) => {
            const isCurrent = step === item.step;
            const isCompleted = step > item.step;

            return (
              <React.Fragment key={item.step}>
                <div
                  className={`stepper-node ${isCurrent ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                  onClick={() => handleDirectStepJump(item.step)}
                  title={`Jump to Stage ${item.step}: ${item.title}`}
                >
                  <div className="stepper-num">{isCompleted ? '✓' : item.step}</div>
                  <div className="stepper-text">
                    <span className="stepper-sub">{item.sub}</span>
                    <span className="stepper-title">{item.title}</span>
                  </div>
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div className={`stepper-connector ${isCompleted ? 'filled' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Steps Viewport */}
      <main className="steps-viewport">
        {step === 1 && <StepOne onNext={handleNext} project={project} />}
        {step === 2 && <StepTwo onNext={handleNext} onBack={handleBack} project={project} />}
        {step === 3 && <StepThree onNext={handleNext} onBack={handleBack} project={project} />}
        {step === 4 && <StepFour onBack={handleBack} project={project} />}
      </main>
    </div>
  );
}
