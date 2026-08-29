import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Bot,
  Crown,
} from 'lucide-react';
import StudioInspectorPanel from './StudioInspectorPanel';
import MultiTrackTimeline from './MultiTrackTimeline';
import FreebeatAutoDirectorModal from '../common/FreebeatAutoDirectorModal';
import FeatureStudioModal from './FeatureStudioModal';
import OpusAgentAssistantDrawer from '../common/OpusAgentAssistantDrawer';
import { VideoGenerator } from '../../services/VideoGenerator';
import { generateAllSceneVideos, pollAllScenesUntilDone, AI_VIDEO_GEN_MODELS } from '../../services/AIVideoGenerationService';
import { audioEngine } from '../../services/AudioEngine';
import { SongStructureAnalyzer } from '../../services/SongStructureAnalyzer';
import { ProjectStorage, formatRelativeSaveTime } from '../../services/ProjectStorage';
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
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState(() => ProjectStorage.list());
  const [saveStatus, setSaveStatus] = useState(null);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const generatorRef = useRef(null);
  const animFrameRef = useRef(null);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);

  // Compute music-aware song structure
  const songStructure = SongStructureAnalyzer.analyzeSongStructure(
    project.duration || 32,
    project.bpm || 128,
    project.renderStyle
  );

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

  // Main 60 FPS animation loop
  const updateLoop = useCallback(() => {
    if (!isPlaying) return;

    const now = performance.now() / 1000;
    const elapsed = now - playbackStartTimeRef.current + playbackStartOffsetRef.current;
    const dur = project.duration || 32;

    if (elapsed >= dur) {
      setCurrentTime(0);
      setIsPlaying(false);
      playbackStartOffsetRef.current = 0;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    setCurrentTime(elapsed);

    // Feed audio spectrum and Freebeat structure metrics into canvas renderer
    const currentSec = SongStructureAnalyzer.getSectionAtTime(songStructure, elapsed);
    const isDrop = currentSec?.isDrop || false;
    const beatPhase = (elapsed * (project.bpm / 60)) % 1;
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

    animFrameRef.current = requestAnimationFrame(updateLoop);
  }, [isPlaying, project.duration, project.bpm, songStructure]);

  useEffect(() => {
    if (isPlaying) {
      playbackStartTimeRef.current = performance.now() / 1000;
      playbackStartOffsetRef.current = currentTime;
      if (audioRef.current && project.audioBlobUrl) {
        audioRef.current.currentTime = currentTime;
        audioRef.current.play().catch(() => {});
      }
      animFrameRef.current = requestAnimationFrame(updateLoop);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) audioRef.current.pause();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, updateLoop]);

  const togglePlay = () => {
    if (!isPlaying) {
      audioEngine.getAudioContext();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
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
          <button
            type="button"
            className="toolbar-quick-btn"
            onClick={handleGenerateAIVideo}
            disabled={isGeneratingAIVideo}
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', fontWeight: 800, border: 'none' }}
          >
            <Film className="w-3.5 h-3.5" />
            <span>🎬 Generate AI Video</span>
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
    </div>
  );
}
