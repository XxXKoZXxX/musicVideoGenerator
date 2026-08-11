import React, { useState } from 'react';
import { Layers, Music, Film, Video, Sparkles, RefreshCw } from 'lucide-react';
import './App.css';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import StepFour from './components/StepFour';

import { SINGER_PORTRAITS } from './services/StoryDirector';

const STEP_LABELS = [
  { step: 1, title: 'Visuals & Storyboard', icon: Layers },
  { step: 2, title: 'Soundtrack & Beat Lab', icon: Music },
  { step: 3, title: 'Narrative & Lyrics', icon: Film },
  { step: 4, title: 'Studio Monitor & Master', icon: Video },
];

export default function App() {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState({
    singerImageUrl: SINGER_PORTRAITS[0].url,
    directorMode: 'hybrid',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    ],
    audio: null,
    audioTitle: 'Cyberpunk 2077 Night Drive',
    bpm: 128,
    duration: 32,
    transition: 'zoom',
    characterPerformance: true,
    lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
    lyricsStyle: 'neon',
    recommendedLut: 'cyberpunk',
    recommendedVisualizer: 'radial',
  });

  const handleNext = (updates) => {
    setProject((prev) => ({ ...prev, ...updates }));
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleResetProject = () => {
    if (window.confirm('Start a new music video project?')) {
      setStep(1);
    }
  };

  return (
    <div className="app">
      {/* Studio Master Header */}
      <header className="app-header">
        <div className="header-branding">
          <div className="logo-glow-icon">
            <Sparkles size={22} color="#06b6d4" />
          </div>
          <div>
            <div className="title-row">
              <h1>MusicVid Studio Pro</h1>
              <span className="pro-badge">AI MUSIC VIDEO GENERATOR</span>
            </div>
            <p>Beat-Synchronized AI Storyboards · Kinetic Lyrics · 60FPS Live Studio Engine</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-icon-header" onClick={handleResetProject} title="New Project">
            <RefreshCw size={16} /> New Project
          </button>
        </div>
      </header>

      <div className="app-container">
        {/* Step Progress Stepper Bar */}
        <div className="stepper-bar">
          {STEP_LABELS.map(({ step: sNum, title, icon: Icon }) => {
            const isActive = sNum === step;
            const isDone = sNum < step;
            return (
              <div
                key={sNum}
                className={`stepper-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => {
                  if (isDone || sNum <= step) setStep(sNum);
                }}
              >
                <div className="stepper-circle">
                  <Icon size={18} />
                </div>
                <div className="stepper-text">
                  <span className="step-count">STAGE 0{sNum}</span>
                  <span className="step-name">{title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Studio Stage View */}
        <main className="steps-viewport">
          {step === 1 && <StepOne onNext={handleNext} project={project} />}
          {step === 2 && <StepTwo onNext={handleNext} onBack={handleBack} project={project} />}
          {step === 3 && <StepThree onNext={handleNext} onBack={handleBack} project={project} />}
          {step === 4 && <StepFour onBack={handleBack} project={project} />}
        </main>
      </div>
    </div>
  );
}
