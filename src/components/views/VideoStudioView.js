import React, { useRef, useEffect, useState } from 'react';
import { VideoRenderEngine } from '../../utils/videoRenderEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Video, Film, Download, Play, Pause, Sparkles, Wand2 } from 'lucide-react';
import VideoGeneratorSelector from '../VideoGeneratorSelector';

// 4-Step Professional Music Video Studio Components
import StepOne from '../StepOne';
import StepTwo from '../StepTwo';
import StepThree from '../StepThree';
import StepFour from '../StepFour';
import { SINGER_PORTRAITS } from '../../services/StoryDirector';
import '../../styles/Step.css';

export default function VideoStudioView({ profile, onNavigate }) {
  // Studio Mode: 'musicvid-wizard' (4-Step AI Music Video Studio) vs 'forecast-animator' (Quick Cosmic Forecast)
  const [studioMode, setStudioMode] = useState('musicvid-wizard');
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

  // Cosmic Forecast Quick Animator State
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [renderer, setRenderer] = useState('ai-neural');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  useEffect(() => {
    if (studioMode === 'forecast-animator' && canvasRef.current) {
      const engine = new VideoRenderEngine(canvasRef.current, profile);
      engine.renderer = renderer;
      engine.start();
      engineRef.current = engine;
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [profile, renderer, studioMode]);

  const togglePlay = () => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
    } else {
      engineRef.current.start();
      setIsPlaying(true);
    }
  };

  const handleRecordVideo = () => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    setRecordedVideoUrl(null);

    try {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(60);

      const mimeCandidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];
      let selectedMime = '';
      for (const cand of mimeCandidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cand)) {
          selectedMime = cand;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        ...(selectedMime ? { mimeType: selectedMime } : {}),
        videoBitsPerSecond: 8_000_000,
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setIsRecording(false);
      };

      mediaRecorder.start(1000);

      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 8000);
    } catch (err) {
      console.error('Failed to record forecast video:', err);
      setIsRecording(false);
    }
  };


  return (
    <div className="video-studio-page">
      {/* STUDIO MODE SWITCHER HEADER */}
      <div className="view-header glass-panel flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="view-title">
          <Film className="title-icon text-gold" />
          <div>
            <h2>Astraea Video Generation Studio</h2>
            <p>Generate Full AI Music Videos with Storylines, Lip-Sync, and AI Video Engines</p>
          </div>
        </div>

        {/* Studio Mode Selector Pills */}
        <div className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setStudioMode('musicvid-wizard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              studioMode === 'musicvid-wizard'
                ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" /> AI Music Video Creator (4-Step Studio)
          </button>
          <button
            onClick={() => onNavigate && onNavigate('characterStudio')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Character & Vocal Cloner 👤
          </button>
          <button
            onClick={() => setStudioMode('forecast-animator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              studioMode === 'forecast-animator'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Quick Cosmic Forecast Video
          </button>
        </div>

      </div>

      {/* MODE 1: FULL 4-STEP AI MUSIC VIDEO CREATOR */}
      {studioMode === 'musicvid-wizard' && (
        <div className="musicvid-wizard-wrapper">
          {/* STEPPER PROGRESS BAR */}
          <div className="stepper-nav mb-6">
            <button
              onClick={() => setCurrentStep(1)}
              className={`stepper-pill ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
            >
              <span className="pill-badge">1</span>
              <span>Visuals & Character</span>
            </button>
            <button
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`stepper-pill ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
            >
              <span className="pill-badge">2</span>
              <span>Audio & Beats</span>
            </button>
            <button
              onClick={() => currentStep > 3 && setCurrentStep(3)}
              className={`stepper-pill ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
            >
              <span className="pill-badge">3</span>
              <span>Storylines & Video Engines</span>
            </button>
            <button
              onClick={() => currentStep >= 4 && setCurrentStep(4)}
              className={`stepper-pill ${currentStep === 4 ? 'active' : ''}`}
            >
              <span className="pill-badge">4</span>
              <span>Live Studio & 4K Render</span>
            </button>
          </div>

          {/* STEP CONTENT SWITCHER */}
          {currentStep === 1 && (
            <StepOne onNext={handleStepOneNext} project={project} />
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
      )}

      {/* MODE 2: QUICK COSMIC FORECAST ANIMATOR */}
      {studioMode === 'forecast-animator' && (
        <div className="forecast-animator-wrapper">
          <div className="flex justify-between items-center glass-panel p-4 mb-4">
            <VideoGeneratorSelector selectedRenderer={renderer} onRendererSelect={setRenderer} />
            <button 
              onClick={handleRecordVideo} 
              disabled={isRecording}
              className="btn btn-primary-glow"
            >
              {isRecording ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" /> Recording Video (8s)...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" /> Record & Export Video
                </>
              )}
            </button>
          </div>

          {/* Video Canvas Container */}
          <div className="video-canvas-container glass-panel text-center p-6 rounded-3xl">
            <div className="canvas-wrapper flex justify-center">
              <canvas 
                ref={canvasRef} 
                width={720} 
                height={480} 
                className="forecast-canvas rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <div className="canvas-controls-row mt-4 flex justify-center">
              <button onClick={togglePlay} className="btn btn-secondary">
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pause Animation' : 'Play Animation'}
              </button>
            </div>
          </div>

          {/* Download Video Banner if recorded */}
          {recordedVideoUrl && (
            <div className="glass-panel video-download-banner mt-6 text-center p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-cyan-400">🎉 Cosmic Forecast Video Ready!</h3>
              <p className="text-silver text-sm">Your 60 FPS WebM motion video was generated successfully.</p>
              
              <div className="video-preview-box mt-4 flex justify-center">
                <video src={recordedVideoUrl} controls autoPlay loop className="recorded-video-player rounded-xl max-w-lg shadow-xl" />
              </div>

              <a 
                href={recordedVideoUrl} 
                download={`${(profile?.name || 'Astraea').replace(/\s+/g, '_')}_Cosmic_Forecast_${renderer}.webm`} 
                className="btn btn-primary-glow mt-4 inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" /> Download Video File (.webm)
              </a>
            </div>
          )}
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="podcast" 
          prevLabel="Deep Dive Podcast" 
          nextView="oracleChat" 
          nextLabel="Oracle AI Chat" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
