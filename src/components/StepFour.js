import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Zap,
  RefreshCw,
  Video,
  CheckCircle,
  Clapperboard,
  Mic2,
  Activity,
  Palette,
  Monitor,
  RotateCcw,
  HardDrive,
  Subtitles,
  Loader2,
  Type,
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
import { renderVideoOnServer, triggerBrowserDownload } from '../services/LocalServerRenderService';
import {
  PLATFORM_PRESETS,
  COLOR_LOOKS,
  suggestLook,
  buildServerRenderOptions,
  defaultCinematicSettings,
} from '../services/CinematicPresets';
import BACKEND_URL from '../services/backendUrl';
import { LyricsEngine } from '../services/LyricsEngine';
import { lipSyncEngine } from '../services/LipSyncEngine';
import { StoryDirector } from '../services/StoryDirector';
import { RENDER_STYLES, getRenderStyleById } from '../services/RenderStyles';
import { ATMOSPHERE_MODES } from '../services/AtmosphereEngine';
import { AI_VIDEO_MODELS } from '../data/aiModels';
import { RENDERER_ENGINES, getRendererEngineById } from '../data/rendererEngines';
import SongStructureTimeline from './common/SongStructureTimeline';
import HiggsfieldDoPControls from './HiggsfieldDoPControls';
import '../styles/Step.css';


export default function StepFour({ onBack, project }) {
  // Live Studio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentShotInfo, setCurrentShotInfo] = useState({ isSingerShot: true, viseme: 'REST' });
  const duration = project.duration || 32;

  // Settings State
  const [settings, setSettings] = useState({
    rendererEngine: project.rendererEngine || 'ai-neural',
    renderStyle: project.renderStyle || 'photoreal',
    selectedVideoModel: project.selectedVideoModel || 'sora_ai',
    atmosphereMode: project.atmosphereMode || 'rain',
    enableMotionBlur: true,
    enableStageSpotlights: true,
    resolution: project.resolution || '1080p',
    aspectRatio: project.aspectRatio || '16:9',
    fps: 30,
    quality: 'high',
    speed: 1.0,
    transition: project.transition || 'zoom',
    transitionDuration: 0.8,
    directorMode: project.directorMode || 'hybrid',
    lipSyncSensitivity: 1.2,
    enableSpeedLines: true,
    enableAnamorphicFlares: true,
    enableHoloHud: true,
    enableTvBroadcastGraphic: project.enableTvBroadcastGraphic ?? true,
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
    // Cinematic master options (server FFmpeg pipeline)
    ...defaultCinematicSettings(project),
  });

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [videoResult, setVideoResult] = useState(null);
  const [error, setError] = useState(null);

  // Server MP4 Master (FFmpeg render with burned-in synced lyrics)
  const [isServerRendering, setIsServerRendering] = useState(false);
  const [serverRender, setServerRender] = useState({
    progress: 0,
    stage: '',
    status: '',
    videoUrl: null,
    downloadUrl: null,
    srtUrl: null,
    lrcUrl: null,
    gifUrl: null,
    fileName: null,
    error: null,
  });
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [cineOpen, setCineOpen] = useState(true);

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
    project.rendererEngine = settings.rendererEngine;
    project.renderStyle = settings.renderStyle;
  }, [settings, project]);

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

    liveAudioRef.current
      .play()
      .then(() => {
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
      })
      .catch((e) => console.warn(e));
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
    setVideoResult(null);

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
    const filename = `MusicVid_${settings.rendererEngine}_${settings.renderStyle}_${settings.resolution}_${settings.aspectRatio.replace(':', 'x')}.${videoResult.extension}`;

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

  // ---- Server MP4 Master render (FFmpeg + burned-in synced lyrics) ----
  const handleServerMasterRender = async () => {
    stopLivePlayback();
    setIsServerRendering(true);
    setServerRender({
      progress: 2,
      stage: 'Contacting local render server...',
      status: 'QUEUED',
      videoUrl: null,
      downloadUrl: null,
      srtUrl: null,
      lrcUrl: null,
      gifUrl: null,
      fileName: null,
      error: null,
    });

    try {
      const result = await renderVideoOnServer(
        {
          ...project,
          // Guarantee the lyric burn-in config travels with the job
          lyricsStyle: settings.lyricsStyle,
          showLyrics: true,
        },
        buildServerRenderOptions(settings, project),
        (update) => {
          setServerRender((prev) => ({ ...prev, ...update }));
        }
      );

      setServerRender((prev) => ({
        ...prev,
        progress: 100,
        status: 'COMPLETED',
        stage: 'Master MP4 rendered with burned-in synced lyrics',
        videoUrl: result.videoUrl,
        downloadUrl: result.downloadUrl,
        srtUrl: result.srtUrl,
        lrcUrl: result.lrcUrl,
        fileName: result.outputFileName || null,
      }));

      // Kick off the MP4 download automatically
      if (result.downloadUrl) {
        triggerBrowserDownload(
          result.downloadUrl,
          `${(project.artistName || 'MusicVid').replace(/\s+/g, '_')}_Server_MP4_Master.mp4`
        );
      }
    } catch (err) {
      setServerRender((prev) => ({
        ...prev,
        status: 'FAILED',
        error: err.message || 'Server render failed.',
      }));
    } finally {
      setIsServerRendering(false);
    }
  };

  // ---- Animated GIF preview export (shareable, palette-optimized) ----
  const handleExportGif = async () => {
    if (!serverRender.fileName) return;
    setIsExportingGif(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/server-render/gif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: serverRender.fileName, maxSeconds: 8, width: 480 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'GIF export failed');
      setServerRender((prev) => ({ ...prev, gifUrl: `${BACKEND_URL}${data.gifUrl}` }));
      triggerBrowserDownload(`${BACKEND_URL}${data.gifUrl}`, data.fileName);
    } catch (err) {
      alert('GIF export failed: ' + err.message);
    } finally {
      setIsExportingGif(false);
    }
  };

  // ---- Auto-grade: pick the cinematic look from the song's energy profile ----
  const handleAutoGrade = () => {
    const look = suggestLook(project.songStructure?.sections || []);
    setSettings((prev) => ({ ...prev, colorLook: look }));
    const lookName = (COLOR_LOOKS.find((l) => l.id === look) || {}).name || look;
    alert(`🎬 Auto-grade complete — applied "${lookName}" to match your track's energy profile.`);
  };

  // Space bar = play/pause the live studio monitor
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      const tag = (e.target && e.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      toggleLivePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTime]);

  const downloadSidecar = (url, label) => {
    if (!url) return;
    triggerBrowserDownload(url, label);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const activeStyleObj = getRenderStyleById(settings.renderStyle);
  const activeEngineObj = getRendererEngineById(settings.rendererEngine);

  return (
    <div className="step-container step-four-container">
      <div className="step-header">
        <span className="step-badge">🔥 Master Studio Monitor & 4K Render</span>
        <h2>Live Studio Monitor & Video Master Export</h2>
        <p>
          Preview your AI music video live at 60 FPS with audio-reactive viseme lip-syncing,
          switch renderer engines on the fly, and render your master video!
        </p>
      </div>

      {/* RENDERER SELECTION STRIP */}
      <div className="renderer-selector-strip">
        <div className="strip-label-col">
          <Monitor size={18} color="#06b6d4" />
          <span>Active Renderer:</span>
        </div>
        <div className="renderer-pills-row">
          {RENDERER_ENGINES.map((engine) => {
            const isSelected = settings.rendererEngine === engine.id;
            return (
              <button
                key={engine.id}
                className={`renderer-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, rendererEngine: engine.id })}
                style={{
                  borderColor: isSelected ? engine.color : 'transparent',
                  background: isSelected ? `${engine.color}20` : 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="pill-icon">{engine.icon}</span>
                <span className="pill-name">{engine.name}</span>
                <span className="pill-badge-tag" style={{ color: engine.color }}>
                  {engine.badge}
                </span>
              </button>
            );
          })}
        </div>
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
                <span
                  className="style-pill-badge engine-pill-badge"
                  style={{ marginLeft: 6, borderColor: activeEngineObj.color, color: activeEngineObj.color }}
                >
                  {activeEngineObj.icon} {activeEngineObj.badge}
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
                <span className="viseme-tag">
                  Viseme: <strong>{currentShotInfo.viseme || 'REST'}</strong>
                </span>
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

            {/* Freebeat Song Structure & Beat Drops Timeline */}
            {project.songStructure && (
              <div className="mt-3">
                <SongStructureTimeline
                  structure={project.songStructure}
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={(seekTime) => {
                    if (liveAudioRef.current) {
                      liveAudioRef.current.currentTime = seekTime;
                      setCurrentTime(seekTime);
                      drawPreviewFrame(seekTime);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Export Action Card */}
          <div className="export-action-card">
            {isExporting ? (
              <div className="export-rendering-state">
                <div className="render-spinner">
                  <RefreshCw size={28} className="spin-icon text-cyan" />
                </div>
                <div className="render-info">
                  <h4>Rendering Master Music Video ({settings.resolution})...</h4>
                  <div className="render-progress-bar">
                    <div className="render-progress-fill" style={{ width: `${exportProgress}%` }} />
                  </div>
                  <span className="render-percent font-mono">
                    {exportProgress}% Complete — {activeEngineObj.name}
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleCancelExport}>
                  Cancel
                </button>
              </div>
            ) : videoResult ? (
              <div className="export-completed-container">
                <div className="export-completed-header">
                  <div className="completed-title-row">
                    <CheckCircle size={26} color="#10b981" />
                    <div>
                      <h4>Master Video Rendered Successfully!</h4>
                      <p>
                        {videoResult.width}×{videoResult.height} ({settings.resolution}) · {settings.fps} FPS ·{' '}
                        {Math.round(videoResult.duration)}s · {videoResult.extension.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="completed-actions">
                    <button className="btn btn-primary btn-large" onClick={handleDownloadVideo}>
                      <Download size={20} /> Download Master Video
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setVideoResult(null)}
                      title="Render with different settings or renderer"
                    >
                      <RotateCcw size={15} /> Render Again
                    </button>
                  </div>
                </div>

                {/* Master Video Player Viewport */}
                <div className="master-player-box">
                  <video
                    src={videoResult.url}
                    controls
                    autoPlay
                    playsInline
                    className="master-video-element"
                  />
                </div>
              </div>
            ) : (
              <div className="render-cta-box">
                <button
                  className="btn btn-primary btn-large btn-master-render"
                  onClick={handleStartExport}
                >
                  <Video size={24} /> Render Master Music Video 🔥 ({settings.resolution} · {settings.fps} FPS)
                </button>
                <span className="render-cta-sub">
                  Powered by {activeEngineObj.name} · {settings.quality.toUpperCase()} Bitrate
                </span>
              </div>
            )}

            {error && <div className="export-error-msg">❌ {error}</div>}
          </div>

          {/* SERVER MP4 MASTER — FFmpeg render with burned-in synced lyrics */}
          <div className="server-master-card" style={{ marginTop: 16 }}>
            <div className="smc-header">
              <HardDrive size={17} style={{ color: '#34d399' }} />
              <div>
                <h4>Local Server MP4 Master (FFmpeg)</h4>
                <p>
                  Renders a real MP4 on your render server — scene cuts synced to beat drops and
                  your <strong>{LyricsEngine.parseLyrics(project.lyrics || '', duration).length} lyric lines</strong> burned
                  in as synced kinetic typography, plus SRT/LRC subtitle exports.
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm smc-collapse-btn"
                onClick={() => setCineOpen((v) => !v)}
              >
                {cineOpen ? '▾ Hide Cinematic Controls' : '▸ Cinematic Controls'}
              </button>
            </div>

            {/* CINEMATIC MASTER CONTROLS */}
            {cineOpen && (
              <div className="cine-controls">
                {/* Platform presets */}
                <div className="cine-section-label">
                  <Monitor size={13} /> Platform Presets
                </div>
                <div className="cine-pill-row">
                  {PLATFORM_PRESETS.map((p) => {
                    const active =
                      settings.aspectRatio === p.aspectRatio && settings.resolution === p.resolution;
                    return (
                      <button
                        key={p.id}
                        className={`cine-pill ${active ? 'active' : ''}`}
                        title={p.hint}
                        onClick={() =>
                          setSettings({ ...settings, aspectRatio: p.aspectRatio, resolution: p.resolution })
                        }
                      >
                        <span>{p.icon}</span> {p.name}
                        <span className="cine-pill-spec font-mono">{p.aspectRatio}·{p.resolution}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Color look + auto grade */}
                <div className="cine-section-label">
                  <Palette size={13} /> Color Grade & Finishing
                </div>
                <div className="cine-look-row">
                  <select
                    className="cine-look-select"
                    value={settings.colorLook}
                    onChange={(e) => setSettings({ ...settings, colorLook: e.target.value })}
                  >
                    {COLOR_LOOKS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.icon} {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleAutoGrade}
                    title="Pick the color look that matches your song's energy profile"
                  >
                    <Zap size={13} /> Auto-Grade
                  </button>
                </div>

                <div className="cine-toggle-grid">
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineTransitions}
                      onChange={(e) => setSettings({ ...settings, cineTransitions: e.target.checked })}
                    />
                    <span>Fade transitions between scenes</span>
                  </label>
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineBeatFlash}
                      onChange={(e) => setSettings({ ...settings, cineBeatFlash: e.target.checked })}
                    />
                    <span>⚡ White flash on beat drops</span>
                  </label>
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineVignette}
                      onChange={(e) => setSettings({ ...settings, cineVignette: e.target.checked })}
                    />
                    <span>Cinema vignette</span>
                  </label>
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineGrain}
                      onChange={(e) => setSettings({ ...settings, cineGrain: e.target.checked })}
                    />
                    <span>Film grain overlay</span>
                  </label>
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineTimecode}
                      onChange={(e) => setSettings({ ...settings, cineTimecode: e.target.checked })}
                    />
                    <span>Running timecode (top-right)</span>
                  </label>
                  <label className="cine-toggle">
                    <input
                      type="checkbox"
                      checked={settings.cineLoudness}
                      onChange={(e) => setSettings({ ...settings, cineLoudness: e.target.checked })}
                    />
                    <span>🔊 Loudness-normalize audio (-14 LUFS)</span>
                  </label>
                </div>

                <div className="cine-watermark-row">
                  <label>
                    <Type size={13} /> Watermark / corner tag:
                  </label>
                  <input
                    className="cine-watermark-input"
                    type="text"
                    maxLength={40}
                    placeholder={project.artistName || 'Your Artist Name'}
                    value={settings.watermarkText}
                    onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                  />
                </div>
              </div>
            )}

            {isServerRendering ? (
              <div className="smc-progress">
                <Loader2 size={20} className="spin-icon text-cyan" />
                <div className="smc-progress-body">
                  <span className="smc-stage">{serverRender.stage || serverRender.status}</span>
                  <div className="smc-bar">
                    <div className="smc-bar-fill" style={{ width: `${serverRender.progress}%` }} />
                  </div>
                  <span className="smc-pct font-mono">{serverRender.progress}%</span>
                </div>
              </div>
            ) : serverRender.status === 'COMPLETED' && serverRender.videoUrl ? (
              <div className="smc-done">
                <div className="smc-done-row">
                  <CheckCircle size={18} color="#34d399" />
                  <span>Master MP4 ready — synced lyrics burned in.</span>
                </div>
                <video
                  src={serverRender.videoUrl}
                  controls
                  playsInline
                  className="smc-preview-video"
                />
                <div className="smc-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => triggerBrowserDownload(serverRender.downloadUrl, 'Server_MP4_Master.mp4')}>
                    <Download size={14} /> Download MP4
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadSidecar(serverRender.srtUrl, 'lyrics.srt')}
                    disabled={!serverRender.srtUrl}
                  >
                    <Subtitles size={14} /> SRT
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadSidecar(serverRender.lrcUrl, 'lyrics.lrc')}
                    disabled={!serverRender.lrcUrl}
                  >
                    <Type size={14} /> LRC
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportGif}
                    disabled={!serverRender.fileName || isExportingGif}
                    title="Export a shareable animated GIF preview of the first 8 seconds"
                  >
                    {isExportingGif ? <Loader2 size={14} className="spin-icon" /> : <Video size={14} />}
                    {serverRender.gifUrl ? 'GIF ✓ (re-download)' : 'Export GIF'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleServerMasterRender}>
                    <RotateCcw size={14} /> Re-render
                  </button>
                </div>
              </div>
            ) : (
              <div className="smc-cta">
                <button className="btn btn-primary btn-large" onClick={handleServerMasterRender}>
                  <HardDrive size={18} /> Render Server MP4 with Synced Lyrics 🔥
                </button>
                <span className="smc-sub">
                  Outputs 16:9 / 9:16 / 1:1 / 4K MP4 · AAC audio · beat-synced cuts
                  {serverRender.error && (
                    <span className="smc-err"> — last attempt failed: {serverRender.error}</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* HIGGSFIELD CINEMA DoP STUDIO CONTROLS */}
          <div style={{ marginTop: 20 }}>
            <HiggsfieldDoPControls
              settings={settings}
              onChange={(newSettings) => {
                setSettings(newSettings);
                Object.assign(project, newSettings);
              }}
            />
          </div>
        </div>


        {/* RIGHT COLUMN: RENDERER SETTINGS & FX RACK */}
        <div className="studio-rack-column">
          <div className="rack-panel">
            {/* RENDERER ENGINE & OUTPUT RESOLUTION */}
            <div className="rack-section-header">
              <Monitor size={18} color="#06b6d4" />
              <h4>Renderer Engine & Output Master</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Renderer Engine:</label>
                <select
                  value={settings.rendererEngine}
                  onChange={(e) => setSettings({ ...settings, rendererEngine: e.target.value })}
                >
                  {RENDERER_ENGINES.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.icon} {eng.name} ({eng.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Master Resolution Presets:</label>
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

              <div className="rack-field">
                <label>Framerate (FPS):</label>
                <select
                  value={settings.fps}
                  onChange={(e) => setSettings({ ...settings, fps: Number(e.target.value) })}
                >
                  <option value={24}>24 FPS (Cinematic Film Standard)</option>
                  <option value={30}>30 FPS (Broadcast Standard)</option>
                  <option value={60}>60 FPS (Ultra-Fluid 4K Gaming / Web)</option>
                </select>
              </div>

              <div className="rack-field">
                <label>Encoding Bitrate Quality:</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
                >
                  <option value="standard">Standard (5 Mbps - Fast Share)</option>
                  <option value="high">High (10 Mbps - YouTube HD)</option>
                  <option value="ultra">Ultra Master (18 Mbps - 4K Cinema Master)</option>
                </select>
              </div>
            </div>

            {/* VIDEO RENDERING STYLE & AESTHETICS */}
            <div className="rack-section-header" style={{ marginTop: 24 }}>
              <Palette size={18} color="#ec4899" />
              <h4>Aesthetic Style & Color Grading</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>AI Video Generator Engine:</label>
                <select
                  value={settings.selectedVideoModel || project.selectedVideoModel || 'sora_ai'}
                  onChange={(e) => {
                    const modelId = e.target.value;
                    const modelObj = AI_VIDEO_MODELS.find((m) => m.id === modelId);
                    setSettings({
                      ...settings,
                      selectedVideoModel: modelId,
                      motionMode: modelObj?.motionMode || settings.motionMode,
                    });
                    project.selectedVideoModel = modelId;
                    if (modelObj?.motionMode) {
                      project.motionMode = modelObj.motionMode;
                    }
                  }}
                >
                  {AI_VIDEO_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name} ({m.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Rendering Aesthetic Style:</label>
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

              <div className="rack-field">
                <label>Cinematic 3D Camera Motion:</label>
                <select
                  value={settings.motionMode || project.motionMode || '3d-parallax'}
                  onChange={(e) => {
                    setSettings({ ...settings, motionMode: e.target.value });
                    project.motionMode = e.target.value;
                  }}
                >
                  {IMAGE_TO_VIDEO_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Color LUT Cinema Grading:</label>
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

              <div className="rack-field">
                <label>Environmental Atmosphere Physics:</label>
                <select
                  value={settings.atmosphereMode}
                  onChange={(e) => setSettings({ ...settings, atmosphereMode: e.target.value })}
                >
                  {ATMOSPHERE_MODES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shaders & Overlays Toggles */}
              <div className="rack-toggle-row">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableAnamorphicFlares}
                    onChange={(e) =>
                      setSettings({ ...settings, enableAnamorphicFlares: e.target.checked })
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span>Hollywood Anamorphic Lens Flares</span>
              </div>

              <div className="rack-toggle-row">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableHoloHud}
                    onChange={(e) =>
                      setSettings({ ...settings, enableHoloHud: e.target.checked })
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span>Holographic HUD & Cyber Grid</span>
              </div>

              <div className="rack-toggle-row">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableTvBroadcastGraphic}
                    onChange={(e) =>
                      setSettings({ ...settings, enableTvBroadcastGraphic: e.target.checked })
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span>VEVO / MTV Lower-Third Song Broadcast Tag</span>
              </div>

              <div className="rack-toggle-row">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.flashOnBeat}
                    onChange={(e) =>
                      setSettings({ ...settings, flashOnBeat: e.target.checked })
                    }
                  />
                  <span className="slider round"></span>
                </label>
                <span>808 Bass Kick Strobe Flash</span>
              </div>
            </div>

            {/* AUDIO-REACTIVE SPECTRUM & LYRICS */}
            <div className="rack-section-header" style={{ marginTop: 24 }}>
              <Zap size={18} color="#06b6d4" />
              <h4>Audio Reactive Spectrum & Viseme Lip-Sync</h4>
            </div>

            <div className="rack-content">
              <div className="rack-field">
                <label>Audio Spectrum Visualizer:</label>
                <select
                  value={settings.visualizerStyle}
                  onChange={(e) =>
                    setSettings({ ...settings, visualizerStyle: e.target.value })
                  }
                >
                  {VISUALIZER_STYLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rack-field">
                <label>Lip-Sync Viseme Sensitivity: {settings.lipSyncSensitivity}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.lipSyncSensitivity}
                  onChange={(e) =>
                    setSettings({ ...settings, lipSyncSensitivity: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="rack-field">
                <label>Audio Reactivity Boost: {settings.audioBoost}%</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.audioBoost}
                  onChange={(e) =>
                    setSettings({ ...settings, audioBoost: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="step-actions-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Storyboard & Cuts
        </button>
      </div>
    </div>
  );
}
