import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Download,
  Wand2,
  Zap,
  Flame,
  Save,
  FolderOpen,
  Trash2,
  Crown,
  Cloud,
  X,
} from 'lucide-react';
import StudioInspectorPanel from './StudioInspectorPanel';
import MultiTrackTimeline from './MultiTrackTimeline';
import FreebeatAutoDirectorModal from '../common/FreebeatAutoDirectorModal';
import FeatureStudioModal from './FeatureStudioModal';
import OpusAgentAssistantDrawer from '../common/OpusAgentAssistantDrawer';
import VideoParamsForm from '../ui/VideoParamsForm';
import LoadingOverlay from '../ui/LoadingOverlay';
import { VideoGenerator } from '../../services/VideoGenerator';
import {
  generateAllSceneVideos,
  pollAllScenesUntilDone,
  AI_VIDEO_GEN_MODELS,
  generateCustomVideo,
  getVideoJobStatus,
} from '../../services/AIVideoGenerationService';
import { renderVideoOnServer, triggerBrowserDownload, checkVideoServerHealth } from '../../services/LocalServerRenderService';
import { audioEngine } from '../../services/AudioEngine';
import { SongStructureAnalyzer } from '../../services/SongStructureAnalyzer';
import { ProjectStorage, formatRelativeSaveTime } from '../../services/ProjectStorage';
import { useProjectSync } from '../../hooks/useProjectSync';
import '../../styles/ModernStudioWorkstation.css';

// Aspect ratio -> sensible per-platform export defaults (resolution/quality).
const PLATFORM_EXPORT_PRESETS = {
  '16:9': { resolution: '1080p', exportQuality: 'high', label: 'YouTube / Cinema' },
  '9:16': { resolution: '1080p', exportQuality: 'high', label: 'TikTok / Reels / Shorts' },
  '1:1': { resolution: '1080p', exportQuality: 'high', label: 'Spotify Canvas / Square' },
  '4:5': { resolution: '1080p', exportQuality: 'high', label: 'Instagram Portrait' },
  '21:9': { resolution: '1440p', exportQuality: 'ultra', label: 'Ultrawide Scope' },
};

export default function ModernStudioWorkstation({
  project: initialProject,
  onNavigate,
}) {
  const [project, setProject] = useState(() => ({
    artistName: 'Astraea Cosmic',
    renderStyle: 'photoreal',
    rendererEngine: 'ai-neural',
    selectedVideoModel: 'higgsfield_dop',
    selectedStoryGenerator: 'claude_opus',
    motionMode: 'higgsfield-orbit-360',
    lensProfile: 'anamorphic-239',
    lightingRig: 'volumetric-fog',
    velocityPreset: 'speed-ramp',
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
    ...initialProject,
  }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isAutoDirectorOpen, setIsAutoDirectorOpen] = useState(false);
  const [isOpusAgentOpen, setIsOpusAgentOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [featureModalTab, setFeatureModalTab] = useState('music_video');
  const [isGeneratingAIVideo, setIsGeneratingAIVideo] = useState(false);
  const [aiVideoProgress, setAiVideoProgress] = useState({ completed: 0, total: 0, status: '' });
  const [aiVideoModel, setAiVideoModel] = useState('kling_ai');
  const [isServerRendering, setIsServerRendering] = useState(false);
  const [serverRenderProgress, setServerRenderProgress] = useState({
    progress: 0,
    stage: 'Initializing',
    status: 'QUEUED',
    videoUrl: null,
    downloadUrl: null,
    error: null,
  });
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState(() => ProjectStorage.list());
  const [saveStatus, setSaveStatus] = useState(null);
  const [isVideoParamsModalOpen, setIsVideoParamsModalOpen] = useState(false);
  const [isCustomVideoLoading, setIsCustomVideoLoading] = useState(false);
  const [customVideoStatus, setCustomVideoStatus] = useState({ stage: '', progress: null, error: null });
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const probe = async () => {
      const ok = await checkVideoServerHealth();
      if (isMounted) setIsServerOnline(ok);
    };
    probe();
    const interval = setInterval(probe, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Cloud Sync Integration via Firebase Firestore
  const { syncStatus, lastSyncedAt, syncToCloud, isFirebaseConfigured } = useProjectSync(
    project.artistName || 'astraea_project',
    project,
    false
  );

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const generatorRef = useRef(null);
  const animFrameRef = useRef(null);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);
  const lastUiUpdateTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const projectRef = useRef(project);
  projectRef.current = project;
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  // Compute music-aware song structure (memoized to avoid new object references every render)
  const songStructure = useMemo(() => {
    return SongStructureAnalyzer.analyzeSongStructure(
      project.duration || 32,
      project.bpm || 128,
      project.renderStyle
    );
  }, [project.duration, project.bpm, project.renderStyle]);

  const songStructureRef = useRef(songStructure);
  songStructureRef.current = songStructure;

  // Initialize Video Generator on mount or project changes
  useEffect(() => {
    if (canvasRef.current) {
      generatorRef.current = new VideoGenerator(canvasRef.current, {
        ...project,
        songStructure,
      });
      generatorRef.current.loadImages().then(() => {
        if (generatorRef.current) {
          generatorRef.current.renderFrame(currentTime, {
            energy: 0.6,
            bass: 0.5,
            subBass: 0.5,
            mids: 0.5,
            highs: 0.4,
            isKick: false,
            isDrop: false,
          });
        }
      }).catch(() => {});
      generatorRef.current.renderFrame(currentTime, {
        energy: 0.6,
        bass: 0.5,
        subBass: 0.5,
        mids: 0.5,
        highs: 0.4,
        isKick: false,
        isDrop: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.aspectRatio, project.renderStyle, project.characterLockPersona, project.selectedVideoModel, project.pacingBeatsPerCut, project.motionIntensity]);

  // Main 60 FPS animation loop decoupled from React state thrashing
  const runFrame = useCallback(() => {
    if (!isPlayingRef.current) return;

    const now = performance.now() / 1000;
    const elapsed = now - playbackStartTimeRef.current + playbackStartOffsetRef.current;
    const dur = projectRef.current.duration || 32;

    if (elapsed >= dur) {
      setCurrentTime(0);
      currentTimeRef.current = 0;
      setIsPlaying(false);
      playbackStartOffsetRef.current = 0;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // Throttle React state update for scrubber to ~15 FPS (~66ms) so React doesn't re-render 60x/sec,
    // while canvas render runs at full 60 FPS
    if (now - lastUiUpdateTimeRef.current >= 0.066) {
      lastUiUpdateTimeRef.current = now;
      setCurrentTime(elapsed);
      currentTimeRef.current = elapsed;
    }

    // Feed audio spectrum and Freebeat structure metrics into canvas renderer at 60 FPS
    const currentStructure = songStructureRef.current;
    const currentSec = SongStructureAnalyzer.getSectionAtTime(currentStructure, elapsed);
    const isDrop = currentSec?.isDrop || false;
    const bpm = projectRef.current.bpm || 128;
    const beatPhase = (elapsed * (bpm / 60)) % 1;
    const vocalPulsing = Math.abs(Math.sin(elapsed * 4.5));

    if (generatorRef.current) {
      generatorRef.current.renderFrame(elapsed, {
        energy: isDrop ? 0.95 : 0.5 + Math.sin(elapsed * 2) * 0.2,
        bass: isDrop ? 0.9 : 0.4 + (1 - beatPhase) * 0.4,
        subBass: isDrop ? 0.88 : (beatPhase < 0.2 ? 0.75 : 0.3),
        mids: 0.35 + vocalPulsing * 0.55, // Drives vocal viseme lip-sync phonemes
        highs: 0.3 + Math.abs(Math.cos(elapsed * 3)) * 0.4,
        isKick: beatPhase < 0.18 || isDrop,
        isDrop,
        sectionName: currentSec?.name,
      });
    }

    animFrameRef.current = requestAnimationFrame(runFrame);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playbackStartTimeRef.current = performance.now() / 1000;
      playbackStartOffsetRef.current = currentTime;
      lastUiUpdateTimeRef.current = 0;
      if (audioRef.current && project.audioBlobUrl) {
        audioRef.current.currentTime = currentTime;
        audioRef.current.play().catch(() => {});
      }
      animFrameRef.current = requestAnimationFrame(runFrame);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) audioRef.current.pause();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, runFrame]);

  const togglePlay = () => {
    if (!isPlaying) {
      audioEngine.getAudioContext();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    currentTimeRef.current = newTime;
    playbackStartOffsetRef.current = newTime;
    playbackStartTimeRef.current = performance.now() / 1000;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (generatorRef.current) {
      const currentSec = SongStructureAnalyzer.getSectionAtTime(songStructure, newTime);
      generatorRef.current.renderFrame(newTime, {
        energy: currentSec?.isDrop ? 0.9 : 0.5,
        bass: 0.6,
        isDrop: currentSec?.isDrop || false,
        sectionName: currentSec?.name,
      });
    }
  };

  const handleExportVideo = async () => {
    if (!generatorRef.current) return;
    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    try {
      await generatorRef.current.exportVideo(
        project.duration || 32,
        (progress) => setExportProgress(Math.round(progress * 100)),
        (blobUrl) => {
          setIsExporting(false);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${project.artistName.replace(/\s+/g, '_')}_Master_Music_Video_${project.aspectRatio}.webm`;
          a.click();
        }
      );
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  const handleServerRender = async () => {
    setIsPlaying(false);
    setIsServerRendering(true);
    setServerRenderProgress({
      progress: 5,
      stage: 'Contacting local render engine...',
      status: 'QUEUED',
      videoUrl: null,
      downloadUrl: null,
      error: null,
    });

    try {
      const result = await renderVideoOnServer(
        project,
        {
          resolution: project.resolution || '1080p',
          fps: 30,
        },
        (progressUpdate) => {
          setServerRenderProgress((prev) => ({
            ...prev,
            ...progressUpdate,
          }));
        }
      );

      if (result.downloadUrl) {
        triggerBrowserDownload(result.downloadUrl, `${project.artistName.replace(/\s+/g, '_')}_Server_Master.mp4`);
      }
    } catch (err) {
      console.error('[ServerRender] Render error:', err);
      setServerRenderProgress((prev) => ({
        ...prev,
        status: 'FAILED',
        error: err.message || 'Server rendering failed.',
      }));
    }
  };

  const handleGenerateAIVideo = async () => {
    setIsPlaying(false);
    setIsGeneratingAIVideo(true);
    setAiVideoProgress({ completed: 0, total: 0, status: 'Preparing scenes...' });

    // Build scene prompts from screenplay or project images
    const scenes = project.screenplay?.scenes?.length > 0
      ? project.screenplay.scenes.map(s => s.directive || s.title || 'Cinematic 4K visual scene')
      : project.images.map((_, idx) => `Scene ${idx + 1}: Cinematic 4K music video shot, volumetric lighting, photorealistic, 60 FPS`);

    setAiVideoProgress({ completed: 0, total: scenes.length, status: 'Submitting to AI...' });

    try {
      const result = await generateAllSceneVideos(scenes, aiVideoModel, {
        aspectRatio: project.aspectRatio || '16:9',
        duration: '5',
      });

      if (result.mode === 'fallback') {
        // Immediate fallback — load sample videos
        const newImages = result.results.map(r => r.videoUrl);
        setProject(prev => ({
          ...prev,
          images: newImages,
          generatedVideoClips: result.results,
        }));
        setAiVideoProgress({ completed: scenes.length, total: scenes.length, status: 'Complete (sample videos)' });
      } else if (result.mode === 'generating') {
        // Real generation — poll for results
        setAiVideoProgress({ completed: 0, total: scenes.length, status: 'Generating...' });
        const finalResults = await pollAllScenesUntilDone(
          result.requestIds,
          (completed, total) => {
            setAiVideoProgress({ completed, total, status: `Generating scene ${completed}/${total}...` });
          }
        );

        const newImages = finalResults.map(r =>
          r?.videoUrl || project.images[r?.sceneIndex] || project.images[0]
        );
        setProject(prev => ({
          ...prev,
          images: newImages,
          generatedVideoClips: finalResults,
        }));
        setAiVideoProgress({ completed: scenes.length, total: scenes.length, status: 'All scenes complete!' });
      }
    } catch (err) {
      console.error('[AI Video Generation Error]:', err);
      setAiVideoProgress(prev => ({ ...prev, status: `Error: ${err.message}` }));
    }

    setTimeout(() => setIsGeneratingAIVideo(false), 2000);
  };

  const handleSaveProject = () => {
    ProjectStorage.save(project.artistName, project);
    setSavedProjects(ProjectStorage.list());
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleCloudSync = async () => {
    setSaveStatus('Cloud Syncing...');
    try {
      const res = await syncToCloud(project.artistName || 'astraea_project', project);
      if (res.success) {
        setSaveStatus(isFirebaseConfigured ? 'Synced to Cloud!' : 'Saved to Local Cache!');
      } else {
        setSaveStatus('Sync Failed');
      }
    } catch (e) {
      setSaveStatus('Sync Error');
    }
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleCustomVideoGenerate = async (params) => {
    setIsCustomVideoLoading(true);
    setCustomVideoStatus({ stage: `Connecting to ${params.model}...`, progress: 15, error: null });

    try {
      const res = await generateCustomVideo(params);

      if (res.mode === 'fallback') {
        setCustomVideoStatus({ stage: 'Applying high-fidelity video asset...', progress: 90, error: null });
        setProject((prev) => ({
          ...prev,
          aspectRatio: params.aspectRatio,
          images: [res.videoUrl, ...(prev.images || []).slice(1)],
          activeVideoClip: res.videoUrl,
        }));
        setTimeout(() => {
          setIsCustomVideoLoading(false);
          setIsVideoParamsModalOpen(false);
        }, 800);
      } else if (res.mode === 'generating' && res.jobId) {
        setCustomVideoStatus({
          stage: 'Task queued with fal.ai cluster. Polling status...',
          progress: 30,
          error: null,
        });

        let pollCount = 0;
        const interval = setInterval(async () => {
          pollCount++;
          const statusRes = await getVideoJobStatus(res.jobId);

          if (statusRes.status === 'COMPLETED') {
            clearInterval(interval);
            setCustomVideoStatus({ stage: 'Video clip generated!', progress: 100, error: null });
            const finalUrl = statusRes.videoUrl || res.videoUrl;
            setProject((prev) => ({
              ...prev,
              aspectRatio: params.aspectRatio,
              images: [finalUrl, ...(prev.images || []).slice(1)],
              activeVideoClip: finalUrl,
            }));
            setTimeout(() => {
              setIsCustomVideoLoading(false);
              setIsVideoParamsModalOpen(false);
            }, 1000);
          } else if (statusRes.status === 'FAILED' || pollCount > 100) {
            clearInterval(interval);
            setCustomVideoStatus({
              stage: 'Generation failed',
              progress: null,
              error: statusRes.error || 'Video generation timed out or failed.',
            });
          } else {
            setCustomVideoStatus({
              stage: `Rendering frames (${statusRes.status || 'IN_PROGRESS'})...`,
              progress: Math.min(95, 30 + pollCount * 3),
              error: null,
            });
          }
        }, 3000);
      }
    } catch (err) {
      console.error('[ModernStudio] Custom video generation error:', err);
      setCustomVideoStatus({
        stage: 'Generation Error',
        progress: null,
        error: err.message,
      });
    }
  };

  const handleLoadProject = (id) => {
    const entry = ProjectStorage.load(id);
    if (entry) {
      setProject(entry.project);
      setIsProjectsMenuOpen(false);
    }
  };

  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    ProjectStorage.remove(id);
    setSavedProjects(ProjectStorage.list());
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modern-studio-container">
      {/* 1. TOP DIRECTORIAL TOOLBAR */}
      <header className="studio-top-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="project-title-input"
            value={project.artistName}
            onChange={(e) => setProject((prev) => ({ ...prev, artistName: e.target.value }))}
            placeholder="Artist / Track Project Name"
          />
          <div className="aspect-ratio-selector">
            {Object.entries(PLATFORM_EXPORT_PRESETS).map(([ratio, preset]) => (
              <button
                key={ratio}
                type="button"
                className={`ratio-btn ${project.aspectRatio === ratio ? 'active' : ''}`}
                title={`${preset.label} · exports at ${preset.resolution}`}
                onClick={() => setProject((prev) => ({
                  ...prev,
                  aspectRatio: ratio,
                  resolution: preset.resolution,
                  exportQuality: preset.exportQuality,
                }))}
              >
                {ratio}
              </button>
            ))}
          </div>

          <div className="projects-menu-wrapper">
            <button
              type="button"
              className="toolbar-quick-btn projects-toggle"
              onClick={() => setIsProjectsMenuOpen((v) => !v)}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Projects ({savedProjects.length})</span>
            </button>
            <button
              type="button"
              className="toolbar-quick-btn save-project-btn"
              onClick={handleSaveProject}
              title="Save current project"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveStatus || 'Save'}</span>
            </button>
            <button
              type="button"
              className="toolbar-quick-btn cloud-sync-btn"
              onClick={handleCloudSync}
              title={`Cloud Sync (${isFirebaseConfigured ? 'Firestore' : 'Local Cache'}) - Last: ${lastSyncedAt || 'Never'}`}
              style={{
                color: syncStatus === 'synced' ? 'hsl(140, 80%, 55%)' : syncStatus === 'syncing' ? 'hsl(42, 95%, 52%)' : 'inherit',
              }}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Cloud Synced' : 'Cloud Sync'}</span>
            </button>

            {isProjectsMenuOpen && (
              <>
                <div className="projects-menu-backdrop" onClick={() => setIsProjectsMenuOpen(false)} />
                <div className="projects-dropdown">
                  {savedProjects.length === 0 ? (
                    <div className="projects-dropdown-empty">No saved projects yet.</div>
                  ) : (
                    savedProjects.map((entry) => (
                      <div
                        key={entry.id}
                        className="projects-dropdown-item"
                        onClick={() => handleLoadProject(entry.id)}
                      >
                        <div className="projects-dropdown-item-info">
                          <span className="projects-dropdown-item-name">{entry.name}</span>
                          <span className="projects-dropdown-item-time">{formatRelativeSaveTime(entry.savedAt)}</span>
                        </div>
                        <button
                          type="button"
                          className="projects-dropdown-delete"
                          title="Delete saved project"
                          onClick={(e) => handleDeleteProject(entry.id, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="toolbar-center">
          <button
            type="button"
            className="toolbar-quick-btn opus-agent-btn bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
            onClick={() => setIsOpusAgentOpen(true)}
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>🤖 Claude 3 Opus Director</span>
          </button>

          <button
            type="button"
            className="toolbar-quick-btn hot-features"
            onClick={() => {
              setFeatureModalTab('music_video');
              setIsFeatureModalOpen(true);
            }}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>🔥 AI Features Suite</span>
          </button>

          <button
            type="button"
            className="toolbar-quick-btn auto-director"
            onClick={() => setIsAutoDirectorOpen(true)}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>1-Click Auto Director ⚡</span>
          </button>
        </div>

        <div className="toolbar-right">
          <select
            value={aiVideoModel}
            onChange={(e) => setAiVideoModel(e.target.value)}
            title="Select AI Video Model"
            style={{
              background: '#0f172a',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {AI_VIDEO_GEN_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="toolbar-quick-btn studio-btn-primary"
            onClick={() => setIsVideoParamsModalOpen(true)}
            style={{ fontWeight: 800, padding: '4px 10px', fontSize: '11px' }}
            title="Custom AI Video Generation Studio (Model, Prompt, Aspect Ratio, Duration)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Studio Generator</span>
          </button>
          <button
            type="button"
            className="toolbar-quick-btn"
            onClick={handleGenerateAIVideo}
            disabled={isGeneratingAIVideo}
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', fontWeight: 800, border: 'none' }}
          >
            <Film className="w-3.5 h-3.5" />
            <span>🎬 Batch AI Video</span>
          </button>
          <button
            type="button"
            className="toolbar-quick-btn"
            onClick={handleServerRender}
            disabled={isServerRendering}
            style={{
              background: isServerOnline ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #334155, #1e293b)',
              color: '#fff',
              fontWeight: 800,
              border: isServerOnline ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title={isServerOnline ? "Local Express & FFmpeg 8.1 master engine is connected and ready" : "Local render server on port 4000 (connecting...)"}
          >
            <Zap className={`w-3.5 h-3.5 ${isServerOnline ? 'text-white' : 'text-slate-400'}`} />
            <span>{isServerOnline ? '🟢 Server Render (FFmpeg)' : '🖥️ Server Render'}</span>
          </button>
          <button
            type="button"
            className="export-master-btn"
            onClick={handleExportVideo}
            disabled={isExporting}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 4K Master</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER WORKSPACE */}
      <div className="studio-main-workspace">
        {/* Left Inspector Tools */}
        <StudioInspectorPanel
          project={project}
          onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
          onOpenFeatureModal={(tab) => {
            setFeatureModalTab(tab);
            setIsFeatureModalOpen(true);
          }}
          onLoadAudioTrack={(trackData) => {
            setProject((prev) => ({
              ...prev,
              duration: trackData.duration,
              bpm: trackData.bpm,
              audioTitle: trackData.title,
              audioBlobUrl: trackData.blobUrl,
              waveformPeaks: trackData.peaks,
              songStructure: trackData.structure,
            }));
          }}
        />

        {/* Center Live 60 FPS Viewport Player */}
        <main className="studio-center-viewport">
          {/* Hidden audio element for synchronous music playback */}
          <audio
            ref={audioRef}
            src={project.audioBlobUrl || ''}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            preload="auto"
          />

          <div className={`viewport-canvas-wrapper ratio-${project.aspectRatio.replace(':', '-')}`}>
            <canvas
              ref={canvasRef}
              width={project.aspectRatio === '9:16' ? 720 : 1280}
              height={project.aspectRatio === '9:16' ? 1280 : 720}
              className="studio-main-canvas"
            />

            {/* Live HUD Badges */}
            <div className="viewport-overlay-hud">
              <div className="hud-pill">
                <span className="hud-live-dot" />
                <span>60 FPS CINEMA</span>
              </div>
              <div className="hud-pill">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{project.bpm} BPM · {SongStructureAnalyzer.getSectionAtTime(songStructure, currentTime)?.name}</span>
              </div>
            </div>
          </div>

          {/* Floating Transport Controls */}
          <div className="viewport-floating-transport">
            <button
              type="button"
              className="transport-btn"
              onClick={() => handleSeek(0)}
              title="Return to Start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="transport-btn play-master"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <span className="timecode-display">
              {formatTime(currentTime)} / {formatTime(project.duration || 32)}
            </span>
          </div>
        </main>
      </div>

      {/* 3. BOTTOM MULTI-TRACK DAW TIMELINE */}
      <MultiTrackTimeline
        project={project}
        songStructure={songStructure}
        currentTime={currentTime}
        duration={project.duration || 32}
        onSeek={handleSeek}
        onAddScene={() => {
          setProject((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
            ],
          }));
        }}
        onReorderScene={(fromIdx, toIdx) => {
          setProject((prev) => {
            const imgs = [...prev.images];
            [imgs[fromIdx], imgs[toIdx]] = [imgs[toIdx], imgs[fromIdx]];
            return { ...prev, images: imgs };
          });
        }}
        onRemoveScene={(idx) => {
          setProject((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== idx),
          }));
        }}
      />

      {/* 4. MODALS */}
      {isFeatureModalOpen && (
        <FeatureStudioModal
          isOpen={isFeatureModalOpen}
          initialTab={featureModalTab}
          onClose={() => setIsFeatureModalOpen(false)}
          project={project}
          onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
          onLoadAudioTrack={(trackData) => {
            setProject((prev) => ({
              ...prev,
              duration: trackData.duration,
              bpm: trackData.bpm,
              audioTitle: trackData.title,
              audioBlobUrl: trackData.blobUrl,
              waveformPeaks: trackData.peaks,
              songStructure: trackData.structure,
            }));
          }}
          onAddScene={(newScene) => {
            setProject((prev) => ({
              ...prev,
              images: [...prev.images, newScene.imageUrl || newScene],
            }));
          }}
        />
      )}

      {isAutoDirectorOpen && (
        <FreebeatAutoDirectorModal
          isOpen={isAutoDirectorOpen}
          onClose={() => setIsAutoDirectorOpen(false)}
          onAutoGenerateComplete={(autoProject) => {
            setProject(autoProject);
            setIsAutoDirectorOpen(false);
            setIsPlaying(true);
          }}
          project={project}
        />
      )}

      {isOpusAgentOpen && (
        <OpusAgentAssistantDrawer
          isOpen={isOpusAgentOpen}
          onClose={() => setIsOpusAgentOpen(false)}
          project={project}
          onUpdateProject={(updates) => setProject((prev) => ({ ...prev, ...updates }))}
          onApplyScenes={(scenes) => {
            setProject((prev) => ({
              ...prev,
              images: scenes.map((s) => s.imageUrl || s),
              screenplay: {
                title: 'Claude 3 Opus Production Bible',
                duration: prev.duration || 32,
                bpm: prev.bpm || 128,
                scenes,
              },
            }));
          }}
        />
      )}

      {/* Exporting Progress Modal */}
      {isExporting && (
        <div className="studio-modal-backdrop">
          <div className="studio-modal-box" style={{ textAlign: 'center' }}>
            <div className="export-modal-icon">
              <Film className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="export-modal-title" style={{ marginTop: 16 }}>Rendering 4K Master Video...</h3>
            <p className="export-modal-sub" style={{ marginTop: 6, marginBottom: 16 }}>
              Applying 60 FPS motion blur, beat drop shockwaves, and LUT color grading.
            </p>
            <div className="export-progress-track">
              <div
                className="export-progress-fill"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="export-modal-pct" style={{ marginTop: 10 }}>{exportProgress}% Complete</div>
          </div>
        </div>
      )}

      {/* AI Video Generation Progress Modal */}
      {isGeneratingAIVideo && (
        <div className="studio-modal-backdrop">
          <div className="studio-modal-box" style={{ textAlign: 'center' }}>
            <div className="export-modal-icon">
              <Film className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="export-modal-title" style={{ marginTop: 16 }}>
              🎬 Generating AI Video Clips
            </h3>
            <p className="export-modal-sub" style={{ marginTop: 6, marginBottom: 8, color: '#94a3b8' }}>
              {aiVideoProgress.status}
            </p>
            <p className="export-modal-sub" style={{ marginBottom: 16, fontSize: '11px', color: '#64748b' }}>
              Model: {AI_VIDEO_GEN_MODELS.find(m => m.id === aiVideoModel)?.name || aiVideoModel}
            </p>
            <div className="export-progress-track">
              <div
                className="export-progress-fill"
                style={{
                  width: aiVideoProgress.total > 0
                    ? `${Math.round((aiVideoProgress.completed / aiVideoProgress.total) * 100)}%`
                    : '15%',
                  background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                }}
              />
            </div>
            <div className="export-modal-pct" style={{ marginTop: 10 }}>
              {aiVideoProgress.total > 0
                ? `${aiVideoProgress.completed} / ${aiVideoProgress.total} scenes`
                : 'Initializing...'}
            </div>
          </div>
        </div>
      )}

      {/* Local Backend Server Video Rendering Progress Modal */}
      {isServerRendering && (
        <div className="studio-modal-backdrop">
          <div className="studio-modal-box" style={{ textAlign: 'center', maxWidth: 480 }}>
            <div
              className="export-modal-icon"
              style={{
                background: serverRenderProgress.status === 'FAILED'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(16, 185, 129, 0.2)',
                borderColor: serverRenderProgress.status === 'FAILED'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(16, 185, 129, 0.4)',
              }}
            >
              <Zap
                className="w-6 h-6"
                style={{
                  color: serverRenderProgress.status === 'FAILED' ? '#ef4444' : '#10b981',
                }}
              />
            </div>
            <h3 className="export-modal-title" style={{ marginTop: 16 }}>
              {serverRenderProgress.status === 'COMPLETED'
                ? '✅ Server Video Render Complete!'
                : serverRenderProgress.status === 'FAILED'
                ? '⚠️ Render Encountered An Issue'
                : '🖥️ Local Server Video Rendering...'}
            </h3>
            <p className="export-modal-sub" style={{ marginTop: 6, marginBottom: 12, color: '#94a3b8' }}>
              {serverRenderProgress.error || serverRenderProgress.stage}
            </p>

            {serverRenderProgress.status !== 'FAILED' && (
              <div className="export-progress-track" style={{ marginBottom: 12 }}>
                <div
                  className="export-progress-fill"
                  style={{
                    width: `${serverRenderProgress.progress}%`,
                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  }}
                />
              </div>
            )}

            <div className="export-modal-pct" style={{ marginBottom: 16 }}>
              {serverRenderProgress.progress}% Complete
            </div>

            {serverRenderProgress.videoUrl && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <video
                  src={serverRenderProgress.videoUrl}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12 }}>
              {serverRenderProgress.downloadUrl && (
                <a
                  href={serverRenderProgress.downloadUrl}
                  download
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  style={{ textDecoration: 'none' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master File</span>
                </a>
              )}
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-white/10"
                onClick={() => setIsServerRendering(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom AI Video Generation Studio Modal */}
      {isVideoParamsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI Video Generation Studio"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(5, 7, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel-studio"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '1.75rem',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(220, 20%, 96%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wand2 size={20} color="hsl(42, 95%, 52%)" />
                  AI Video Generation Studio
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'hsl(220, 15%, 70%)', marginTop: '0.2rem' }}>
                  Generate custom music video clips with configurable neural models, aspect ratios & negative prompts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoParamsModalOpen(false)}
                className="studio-btn-secondary"
                style={{ padding: '0.35rem 0.6rem' }}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <VideoParamsForm
              initialValues={{
                model: aiVideoModel,
                aspectRatio: project.aspectRatio || '16:9',
                duration: 5,
                prompt: project.images && project.images.length > 0 ? '' : 'Cinematic 4K cosmic music video visualizer',
              }}
              isLoading={isCustomVideoLoading}
              onSubmit={handleCustomVideoGenerate}
              onCancel={() => setIsVideoParamsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        isOpen={isCustomVideoLoading}
        title="Synthesizing AI Video"
        stage={customVideoStatus.stage}
        progress={customVideoStatus.progress}
        error={customVideoStatus.error}
        onCancel={() => setIsCustomVideoLoading(false)}
      />
    </div>
  );
}
