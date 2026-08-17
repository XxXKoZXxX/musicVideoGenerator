import React, { useRef, useEffect, useState } from 'react';
import { VideoRenderEngine } from '../../utils/videoRenderEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Video, Film, Download, Play, Pause, Sparkles } from 'lucide-react';
import VideoGeneratorSelector from '../VideoGeneratorSelector';

export default function VideoStudioView({ profile, onNavigate }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [renderer, setRenderer] = useState('ai-neural');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  // UI: select video generator engine
  const handleRendererSelect = (val) => {
    setRenderer(val);
    console.log('Selected video renderer:', val);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new VideoRenderEngine(canvasRef.current, profile);
      engine.start();
      engineRef.current = engine;
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [profile]);

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

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(60); // 60 FPS
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideoUrl(videoUrl);
      setIsRecording(false);
    };

    mediaRecorder.start();

    // Record for 8 seconds (covers all 4 motion scenes)
    setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, 8000);
  };

  return (
    <div className="video-studio-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Film className="title-icon text-gold" />
          <div>
            <h2>Motion Video Forecast Studio</h2>
            <p>Generate & Export Animated Cosmic Forecast Video for {profile.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
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
      </div>

      <div className="mt-4">
        <VideoGeneratorSelector selectedRenderer={renderer} onRendererSelect={handleRendererSelect} />
      </div>

      {/* Video Canvas Container */}
      <div className="video-canvas-container glass-panel mt-6 text-center">
        <div className="canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            width={720} 
            height={480} 
            className="forecast-canvas"
          />
        </div>

        <div className="canvas-controls-row mt-4">
          <button onClick={togglePlay} className="btn btn-secondary">
            {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isPlaying ? 'Pause Animation' : 'Play Animation'}
          </button>
        </div>
      </div>

      {/* Download Video Banner if recorded */}
      {recordedVideoUrl && (
        <div className="glass-panel video-download-banner mt-6 text-center">
          <h3>🎉 Cosmic Forecast Video Ready!</h3>
          <p>Your 60 FPS WebM motion video was generated successfully.</p>
          
          <div className="video-preview-box mt-4">
            <video src={recordedVideoUrl} controls autoPlay loop className="recorded-video-player" />
          </div>

          <a 
            href={recordedVideoUrl} 
            download={`${profile.name.replace(/\s+/g, '_')}_Cosmic_Forecast_${renderer}.webm`} 
            className="btn btn-primary-glow mt-4 inline-flex"
          >
            <Download className="w-5 h-5 mr-2" /> Download Video File (.webm)
          </a>
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
