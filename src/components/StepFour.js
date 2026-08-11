import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Settings2,
  Zap,
  RefreshCw,
  Video,
  CheckCircle,
  Clapperboard,
  Mic2,
  Activity,
  Palette,
} from 'lucide-react';
import {
  VideoGenerator,
  RESOLUTION_PRESETS,
  ASPECT_RATIOS,
  VISUALIZER_STYLES,
  COLOR_LUTS,
  IMAGE_TO_VIDEO_MODES,
} from '../services/VideoGenerator';
import { audioEngine } from '../services/AudioEngine';
import { LyricsEngine } from '../services/LyricsEngine';
import { lipSyncEngine } from '../services/LipSyncEngine';
import { StoryDirector, DIRECTOR_MODES } from '../services/StoryDirector';
import { RENDER_STYLES, getRenderStyleById } from '../services/RenderStyles';
import '../styles/Step.css';

export default function StepFour({ onBack, project }) {
  // Live Studio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentShotInfo, setCurrentShotInfo] = useState({ isSingerShot: true, viseme: 'REST' });
  const duration = project.duration || 32;

  // Settings State
  const [settings, setSettings] = useState({
    renderStyle: project.renderStyle || 'photoreal',
    resolution: '1080p',
    aspectRatio: project.aspectRatio || '16:9',
    fps: 30,
    quality: 'high',
    speed: 1.0,
    transition: project.transition || 'zoom',
    transitionDuration: 0.8,
    motionMode: project.motionMode || '3d-parallax',
    motionIntensity: project.motionIntensity || 100,
    directorMode: project.directorMode || 'hybrid',
    lipSyncSensitivity: 1.2,
    enableSpeedLines: true,
    enableAnamorphicFlares: true,
    enableHoloHud: true,
    visualizerStyle: project.recommendedVisualizer || 'radial',
    visualizerColor: '#06b6d4',
    visualizerIntensity: 100,
    cameraShake: true,
    shakeIntensity: 60,
    flashOnBeat: true,
    characterPerformance: project.characterPerformance ?? true,
    colorLut: project.recommendedLut || 'cyberpunk',
    brightness: 100,
    contrast: 105,
    saturation: 110,
    audioBoost: project.audioBoost || 100,
    lyricsStyle: project.lyricsStyle || 'neon',
  });

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [videoResult, setVideoResult] = useState(null);
  const [error, setError] = useState(null);

  // DOM & Engine Refs
  const canvasRef = useRef(null);
  const liveAudioRef = useRef(null);
  const generatorRef = useRef(null);
  const liveAnimFrameRef = useRef(null);
  const loadedImagesRef = useRef([]);
  const parsedLyricsRef = useRef([]);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Preload Images, Size Canvas, and Parse Lyrics on Mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = ASPECT_RATIOS[settings.aspectRatio]?.ratio || 16 / 9;
      const baseHeight = 460;
      canvas.width = Math.round(baseHeight * ratio);
      canvas.height = baseHeight;
    }

    const generator = new VideoGenerator(project, settings);
    generator.loadImages().then((imgs) => {
      loadedImagesRef.current = imgs;
      drawPreviewFrame(0);
    });

    const parsed = LyricsEngine.parseLyrics(project.lyrics || '', duration);
    parsedLyricsRef.current = parsed;

    return () => {
      stopLivePlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas size when aspect ratio changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = ASPECT_RATIOS[settings.aspectRatio]?.ratio || 16 / 9;
    const baseHeight = 460;
    const baseWidth = Math.round(baseHeight * ratio);

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    drawPreviewFrame(currentTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.aspectRatio]);

  // Redraw preview frame when settings change
  useEffect(() => {
    if (!isPlaying) {
      drawPreviewFrame(currentTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Live Canvas Frame Drawer
  const drawPreviewFrame = (elapsedTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const images = loadedImagesRef.current;
    if (!images || images.length === 0) return;

    const generator = new VideoGenerator(project, settingsRef.current);
    const audioMetrics = audioEngine.getAudioMetrics();
    const secondsPerImage = duration / images.length;

    const shot = StoryDirector.evaluateDirectorShot(
      generator.screenplay,
      elapsedTime,
      settingsRef.current.directorMode || 'hybrid',
      audioMetrics
    );
    const viseme = lipSyncEngine.extractViseme(audioMetrics);
    setCurrentShotInfo({
      isSingerShot: shot.isSingerShot,
      viseme: viseme.viseme,
      energy: Math.round(audioMetrics.mids * 100),
    });

    generator.renderCompositedFrame(
      ctx,
      images,
      parsedLyricsRef.current,
      elapsedTime,
      duration,
      secondsPerImage,
      audioMetrics,
      canvas.width,
      canvas.height
    );
  };

  // Live Playback Loop (60 FPS)
  const startLivePlayback = () => {
    if (!liveAudioRef.current) return;

    audioEngine.setupAnalysers(liveAudioRef.current, settings.audioBoost);

    liveAudioRef.current.play().then(() => {
      setIsPlaying(true);
      const loop = () => {
        if (liveAudioRef.current && !liveAudioRef.current.paused) {
          const t = liveAudioRef.current.currentTime;
          setCurrentTime(t);
          drawPreviewFrame(t);
          liveAnimFrameRef.current = requestAnimationFrame(loop);
        } else {
          setIsPlaying(false);
        }
      };
      liveAnimFrameRef.current = requestAnimationFrame(loop);
    }).catch((e) => console.warn(e));
  };

  const stopLivePlayback = () => {
    if (liveAudioRef.current) {
      liveAudioRef.current.pause();
    }
    if (liveAnimFrameRef.current) {
      cancelAnimationFrame(liveAnimFrameRef.current);
    }
    setIsPlaying(false);
  };

  const toggleLivePlay = () => {
    if (isPlaying) {
      stopLivePlayback();
    } else {
      startLivePlayback();
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = pos * duration;

    setCurrentTime(seekTime);
    if (liveAudioRef.current) {
      liveAudioRef.current.currentTime = seekTime;
    }
    drawPreviewFrame(seekTime);
  };

  const handleStartExport = async () => {
    stopLivePlayback();
    setIsExporting(true);
    setError(null);
    setExportProgress(0);

    const videoGen = new VideoGenerator(project, settings, (p) => setExportProgress(p));
    generatorRef.current = videoGen;

    try {
      const result = await videoGen.generate();
      setVideoResult(result);
    } catch (err) {
      if (err.message !== 'Cancelled') setError(err.message);
    } finally {
      generatorRef.current = null;
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    generatorRef.current?.cancel();
  };

  const handleDownloadVideo = async () => {
    if (!videoResult) return;
    const filename = `MusicVid_${settings.renderStyle}_${settings.resolution}_${settings.aspectRatio.replace(':', 'x')}.${videoResult.extension}`;

    if (window.electron?.saveVideo) {
      const bytes = new Uint8Array(await videoResult.blob.arrayBuffer());
      await window.electron.saveVideo({ videoBuffer: bytes, filename });
      return;
    }

    const link = document.createElement('a');
    link.href = videoResult.url;
    link.download = filename;
    link.click();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const activeStyleObj = getRenderStyleById(settings.renderStyle);

  return (
    <div className="step-container step-four-container">
      <div className="step-header">
        <span className="step-badge">Live Studio & Multi-Style Master Export</span>
        <h2>Step 4: Live Studio Monitor & Master Render</h2>
        <p>
          Preview your AI music video at 60 FPS in real time with audio-reactive viseme lip-syncing,
          multi-style rendering aesthetics, and 4K master rendering.
        </p>
      </div>

      <div className="studio-layout-grid">
        {/* LEFT COLUMN: LIVE STUDIO MONITOR */}
        <div className="studio-monitor-column">
          <div className="monitor-card">
            {/* Hidden Audio Tag for Live Audio Context */}
            <audio
              ref={liveAudioRef}
              src={project.audioBlobUrl || project.audio || ''}
              onEnded={() => setIsPlaying(false)}
              preload="auto"
            />

            <div className="monitor-top-bar">
              <div className="monitor-status">
                <span className={`status-dot ${isPlaying ? 'live' : ''}`} />
                <span className="status-text">{isPlaying ? 'LIVE 60 FPS' : 'PAUSED'}</span>
                <span className="style-pill-badge" style={{ marginLeft: 8 }}>
                  {activeStyleObj.badge}
                </span>
              </div>
              <div className="aspect-pill-group">
                {Object.keys(ASPECT_RATIOS).map((ratioKey) => (
                  <button
                    key={ratioKey}
                    className={`aspect-pill ${settings.aspectRatio === ratioKey ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, aspectRatio: ratioKey })}
                  >
                    {ratioKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="canvas-viewport">
              <canvas ref={canvasRef} className="live-studio-canvas" />
            </div>

            {/* Live Shot & Lip-Sync Status Strip */}
            <div className="live-shot-status-strip">
              <div className="shot-indicator">
                {currentShotInfo.isSingerShot ? (
                  <span className="live-pill singer-live-pill">
                    <Mic2 size={13} /> SINGER LIP-SYNC ACTIVE
                  </span>
                ) : (
                  <span className="live-pill story-live-pill">
                    <Clapperboard size={13} /> STORY NARRATIVE SCENE
                  </span>
                )}
              </div>

              <div className="viseme-meter">
                <span className="viseme-tag">Viseme: <strong>{currentShotInfo.viseme || 'REST'}</strong></span>
                <span className="vocal-energy-tag">
                  <Activity size={12} /> Vocal: {currentShotInfo.energy || 0}%
                </span>
              </div>
            </div>

            {/* Transport & Timeline Scrubber */}
            <div className="transport-controls">
              <button
                className="transport-play-btn"
                onClick={toggleLivePlay}
                title={isPlaying ? 'Pause' : 'Play Live'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
              </button>

              <div className="studio-timeline-scrub" onClick={handleSeek}>
                <div
                  className="timeline-fill"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
                <div
                  className="timeline-handle"
                  style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>

              <div className="timecode-display font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="export-action-card">
            {isExporting ? (
              <div className="export-rendering-state">
                <div className="render-spinner">
                  <RefreshCw size={28} className="spin-icon" />
                </div>
                <div className="render-info">
                  <h4>Rendering Master Music Video...</h4>
                  <div className="render-progress-bar">
                    <div className="render-progress-fill" style={{ width: `${exportProgress}%` }} />
                  </div>
                  <span className="render-percent font-mono">{exportProgress}% Complete</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleCancelExport}>
                  Cancel
                </button>
              </div>
            ) : videoResult ? (
              <div className="export-completed-state">
                <CheckCircle size={32} color="#10b981" />
                <div className="completed-info">
                  <h4>Master Video Ready for Download!</h4>
                  <p>
                    {videoResult.width}×{videoResult.height} · {Math.round(videoResult.duration)}s ·{' '}
                    {videoResult.extension.toUpperCase()} High Bitrate
                  </p>
                </div>
                <button className="btn btn-primary btn-large" onClick={handleDownloadVideo}>
                  <Download size={20} /> Download Master Video
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-large btn-master-render"
                onClick={handleStartExport}
              >
                <Video size={24} /> Render Master Music Video ({settings.resolution})
              </button>
            )}

            {error && <div className="export-error-msg">❌ {error}</div>}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE VISUALIZER, LIP-SYNC & FX RACK */}
        <div className="studio-rack-column">
          <div className="rack-panel">
            {/* VIDEO RENDERING STYLE & AESTHETICS */}
            <div className="rack-section-header">
              <Palette size={18} />
              <h4>Video Rendering Aesthetic Engine</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Rendering Aesthetic:</label>
                <select
                  value={settings.renderStyle}
                  onChange={(e) => {
                    const nextStyle = e.target.value;
                    const stObj = getRenderStyleById(nextStyle);
                    setSettings({
                      ...settings,
                      renderStyle: nextStyle,
                      colorLut: stObj.lutId || settings.colorLut,
                      visualizerColor: stObj.visualizerColor || settings.visualizerColor,
                      visualizerStyle: stObj.visualizerStyle || settings.visualizerStyle,
                    });
                  }}
                >
                  {RENDER_STYLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Aesthetic-Specific Shader Toggles */}
              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableSpeedLines}
                    onChange={(e) =>
                      setSettings({ ...settings, enableSpeedLines: e.target.checked })
                    }
                  />
                  <span>Anime Action Speed Lines</span>
                </label>
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableAnamorphicFlares}
                    onChange={(e) =>
                      setSettings({ ...settings, enableAnamorphicFlares: e.target.checked })
                    }
                  />
                  <span>Anamorphic Cinema Blue Lens Flares</span>
                </label>
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableHoloHud}
                    onChange={(e) =>
                      setSettings({ ...settings, enableHoloHud: e.target.checked })
                    }
                  />
                  <span>Cyberpunk Holographic HUD Grid</span>
                </label>
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableTvBroadcastGraphic !== false}
                    onChange={(e) =>
                      setSettings({ ...settings, enableTvBroadcastGraphic: e.target.checked })
                    }
                  />
                  <span>TV Broadcast Lower-Third Graphic (MTV / VEVO 4K)</span>
                </label>
              </div>
            </div>

            {/* IMAGE-TO-VIDEO MOTION ENGINE */}
            <div className="rack-section-header" style={{ marginTop: 20 }}>
              <Video size={18} />
              <h4>Image-to-Video Motion Engine</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Motion Simulation Mode:</label>
                <select
                  value={settings.motionMode}
                  onChange={(e) => setSettings({ ...settings, motionMode: e.target.value })}
                >
                  {IMAGE_TO_VIDEO_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Motion Speed & Depth Intensity ({settings.motionIntensity || 100}%):</label>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={settings.motionIntensity || 100}
                  onChange={(e) =>
                    setSettings({ ...settings, motionIntensity: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* DIRECTOR CUT MODE & LIP-SYNC */}
            <div className="rack-section-header" style={{ marginTop: 20 }}>
              <Clapperboard size={18} />
              <h4>Director Cut & Lip-Sync Controls</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Director Cut Mode:</label>
                <select
                  value={settings.directorMode}
                  onChange={(e) => setSettings({ ...settings, directorMode: e.target.value })}
                >
                  {DIRECTOR_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Lip-Sync Mouth Motion Sensitivity:</label>
                <div className="slider-with-val">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={Math.round((settings.lipSyncSensitivity || 1.2) * 100)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        lipSyncSensitivity: parseInt(e.target.value) / 100,
                      })
                    }
                  />
                  <span className="font-mono">
                    {Math.round((settings.lipSyncSensitivity || 1.2) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* AUDIO VISUALIZER & SHADERS */}
            <div className="rack-section-header" style={{ marginTop: 20 }}>
              <Zap size={18} />
              <h4>Audio Visualizer & Shaders</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Visualizer Style:</label>
                <select
                  value={settings.visualizerStyle}
                  onChange={(e) => setSettings({ ...settings, visualizerStyle: e.target.value })}
                >
                  {VISUALIZER_STYLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-row">
                <div className="rack-field flex-1">
                  <label>Glow Color:</label>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={settings.visualizerColor}
                    onChange={(e) =>
                      setSettings({ ...settings, visualizerColor: e.target.value })
                    }
                  />
                </div>
                <div className="rack-field flex-2">
                  <label>Intensity ({settings.visualizerIntensity}%):</label>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={settings.visualizerIntensity}
                    onChange={(e) =>
                      setSettings({ ...settings, visualizerIntensity: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="rack-field">
                <label>Cinematic Color LUT & Mood:</label>
                <select
                  value={settings.colorLut}
                  onChange={(e) => setSettings({ ...settings, colorLut: e.target.value })}
                >
                  {Object.entries(COLOR_LUTS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.cameraShake}
                    onChange={(e) => setSettings({ ...settings, cameraShake: e.target.checked })}
                  />
                  <span>Camera Shake on 808 / Kick</span>
                </label>
                {settings.cameraShake && (
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.shakeIntensity}
                    onChange={(e) =>
                      setSettings({ ...settings, shakeIntensity: parseInt(e.target.value) })
                    }
                    style={{ width: 90 }}
                  />
                )}
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.flashOnBeat}
                    onChange={(e) => setSettings({ ...settings, flashOnBeat: e.target.checked })}
                  />
                  <span>Strobe Flash on Drop Transitions</span>
                </label>
              </div>

              <div className="rack-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableStageSpotlights !== false}
                    onChange={(e) => setSettings({ ...settings, enableStageSpotlights: e.target.checked })}
                  />
                  <span>Arena Stage Spotlights & Sweeping Lasers</span>
                </label>
              </div>
            </div>

            {/* MASTER EXPORT SETTINGS */}
            <div className="rack-section-header" style={{ marginTop: 20 }}>
              <Settings2 size={18} />
              <h4>Master Output Settings</h4>
            </div>

            <div className="rack-content">
              <div className="rack-row">
                <div className="rack-field flex-1">
                  <label>Resolution:</label>
                  <select
                    value={settings.resolution}
                    onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
                  >
                    {Object.entries(RESOLUTION_PRESETS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rack-field flex-1">
                  <label>Frame Rate:</label>
                  <select
                    value={settings.fps}
                    onChange={(e) => setSettings({ ...settings, fps: parseInt(e.target.value) })}
                  >
                    <option value="24">24 FPS (Cinema)</option>
                    <option value="30">30 FPS (Smooth)</option>
                    <option value="60">60 FPS (Ultra Smooth)</option>
                  </select>
                </div>
              </div>

              <div className="rack-field">
                <label>Encoding Bitrate & Quality:</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
                >
                  <option value="ultra">Ultra (18 Mbps Master)</option>
                  <option value="high">High (10 Mbps Web Master)</option>
                  <option value="medium">Medium (5 Mbps Fast)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn btn-secondary" onClick={onBack} disabled={isExporting}>
          ← Back to Storyboard
        </button>
      </div>
    </div>
  );
}
