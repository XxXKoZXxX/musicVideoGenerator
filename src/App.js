import React, { useState } from 'react';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import StepFour from './components/StepFour';
import { Sparkles, Music2, Film, Video, Wand2, CheckCircle2 } from 'lucide-react';
import RENDER_STYLES from './services/RenderStyles';
import './index.css';
import './styles/Step.css';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // Shared project state
  const [project, setProject] = useState({
    renderStyle: 'photoreal',
    images: RENDER_STYLES[0].defaultScenes || [],
    singerImage: RENDER_STYLES[0].defaultSinger || '',
    audioFile: null,
    audioUrl: null,
    audioTitle: 'Electric Dreams (Cyberpunk Mix)',
    audioBuffer: null,
    bpm: 128,
    duration: 30,
    lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
    lyricsStyle: 'neon',
    motionMode: '3d-parallax',
    directorMode: 'hybrid',
    pexelsApiKey: localStorage.getItem('pexels_api_key') || '',
  });

  const handleNext = (stepData) => {
    if (stepData && typeof stepData === 'object') {
      setProject((prev) => ({
        ...prev,
        ...stepData,
      }));
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepsInfo = [
    { number: 1, title: 'Visual Vibes', icon: Sparkles, desc: 'Style & Assets' },
    { number: 2, title: 'Audio & Beats', icon: Music2, desc: 'Track & Lyrics' },
    { number: 3, title: 'AI Storyboard', icon: Film, desc: 'Screenplay & Cuts' },
    { number: 4, title: 'Studio Monitor', icon: Video, desc: '60 FPS Render' },
  ];

  return (
    <div className="musicvid-app-container">
      {/* Sleek Dark Header & Interactive Stepper Navigation */}
      <header className="studio-top-nav">
        <div className="studio-brand">
          <div className="brand-logo-glow">
            <Wand2 size={24} className="logo-icon text-cyan" />
          </div>
          <div>
            <h1 className="brand-title">
              MusicVid <span className="text-pink">Studio Pro</span>
            </h1>
            <p className="brand-tagline">AI Music Video Generator & Storyboard Engine</p>
          </div>
        </div>

        {/* Interactive Top Stepper Nav */}
        <nav className="stepper-nav">
          {stepsInfo.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <button
                key={step.number}
                className={`stepper-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.number)}
              >
                <div className="pill-badge">
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <div className="pill-labels">
                  <span className="pill-step">STEP {step.number}</span>
                  <span className="pill-title">{step.title}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Studio Viewport */}
      <main className="studio-main-viewport">
        {currentStep === 1 && (
          <StepOne onNext={handleNext} project={project} />
        )}

        {currentStep === 2 && (
          <StepTwo onNext={handleNext} onBack={handleBack} project={project} />
        )}

        {currentStep === 3 && (
          <StepThree onNext={handleNext} onBack={handleBack} project={project} />
        )}

        {currentStep === 4 && (
          <StepFour onBack={handleBack} project={project} />
        )}
      </main>

      {/* Studio Footer */}
      <footer className="studio-footer">
        <p>⚡ MusicVid Studio Pro — AI Image-to-Video, Viseme Lip-Sync & Audio Visualizer Engine</p>
      </footer>
    </div>
  );
}
