import React, { useState } from 'react';
import { Film, Wand2, User, Zap } from 'lucide-react';

// 4-Step Professional Music Video Studio Components
import StepOne from '../StepOne';
import StepTwo from '../StepTwo';
import StepThree from '../StepThree';
import StepFour from '../StepFour';
import { SINGER_PORTRAITS } from '../../services/StoryDirector';
import '../../styles/Step.css';

export default function VideoStudioView({ profile, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Unified Project State across all 4 steps
  const [project, setProject] = useState(() => ({
    artistName: profile?.name || 'Astraea Cosmic',
    renderStyle: 'photoreal',
    rendererEngine: 'ai-neural',
    selectedVideoModel: 'sora_ai',
    selectedStoryGenerator: 'gemini_flash',
    singerImageUrl: SINGER_PORTRAITS[0].url,
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    ],
    transition: 'zoom',
    motionMode: '3d-parallax',
    motionIntensity: 100,
    atmosphereMode: 'rain',
    enableTvBroadcastGraphic: true,
    characterPerformance: true,
    selectedTrackId: 'cyberpunk-neon',
    audioTitle: 'Cyberpunk 2077 Night Drive',
    bpm: 128,
    duration: 32,
    resolution: '1080p',
    aspectRatio: '16:9',
    lyricsStyle: 'neon',
  }));

  const handleStepOneNext = (data) => {
    setProject((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepTwoNext = (data) => {
    setProject((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepThreeNext = (data) => {
    setProject((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="video-studio-page">
      {/* STUDIO MODE SWITCHER HEADER */}
      <div className="view-header glass-panel flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="view-title">
          <Film className="title-icon text-gold" />
          <div>
            <h2>AI Music Video & Cinema Studio</h2>
            <p>Generate Full AI Music Videos with Song Structure Beats, Character Lock, Lip-Sync, and 4K Renders</p>
          </div>
        </div>

        {/* Quick Studio Navigation Pills */}
        <div className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20"
          >
            <Wand2 className="w-4 h-4" /> 4-Step Music Video Studio
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('clip-gap-filler')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Clip Gap Filler & Inbetweener ⚡
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('characterStudio')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
          >
            <User className="w-4 h-4 text-amber-400" /> Character & Vocal Cloner 👤
          </button>
        </div>
      </div>

      {/* FULL 4-STEP AI MUSIC VIDEO CREATOR */}
      <div className="musicvid-wizard-wrapper">
        {/* STEPPER PROGRESS BAR */}
        <div className="stepper-nav mb-6">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`stepper-pill ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          >
            <span className="pill-badge">1</span>
            <span>Visuals & Character</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`stepper-pill ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          >
            <span className="pill-badge">2</span>
            <span>Audio & Beats</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`stepper-pill ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
          >
            <span className="pill-badge">3</span>
            <span>Storylines & Video Engines</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`stepper-pill ${currentStep === 4 ? 'active' : ''}`}
          >
            <span className="pill-badge">4</span>
            <span>Live Studio & 4K Render</span>
          </button>
        </div>

        {/* STEP CONTENT SWITCHER */}
        {currentStep === 1 && (
          <StepOne onNext={handleStepOneNext} project={project} onNavigate={onNavigate} />
        )}

        {currentStep === 2 && (
          <StepTwo 
            onNext={handleStepTwoNext} 
            onBack={() => setCurrentStep(1)} 
            project={project} 
          />
        )}

        {currentStep === 3 && (
          <StepThree 
            onNext={handleStepThreeNext} 
            onBack={() => setCurrentStep(2)} 
            project={project} 
          />
        )}

        {currentStep === 4 && (
          <StepFour 
            onBack={() => setCurrentStep(3)} 
            project={project} 
          />
        )}
      </div>
    </div>
  );
}
