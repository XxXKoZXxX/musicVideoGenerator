// src/components/views/ClipInbetweenerStudioView.js - AI Clip Inbetweener & Gap Filling Studio
import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Download,
  Sliders,
  SlidersHorizontal,
  CheckCircle,
  AlertCircle,
  Layers,
  Palette,
  Music,
  Clock,
} from 'lucide-react';
import {
  COLOR_GRADE_PRESETS,
  TRANSITION_STYLES,
  INBETWEEN_ENGINES,
  SAMPLE_CLIP_SETS,
  startClipGapFilling,
  pollClipGapFillingStatus,
  extractClipKeyframes,
  uploadClipFile,
} from '../../services/ClipInbetweenerService';
import '../../styles/ClipInbetweenerStudioView.css';

export default function ClipInbetweenerStudioView({
  project = {},
  onNavigate = () => {},
  onApplyMasterToProject = () => {},
}) {
  // Sequence of video clips to connect
  const [clips, setClips] = useState(() => {
    // Default to the first sample set so the user sees a populated timeline ready to test
    const defaultSet = SAMPLE_CLIP_SETS[0];
    return defaultSet.clips.map((c, i) => ({
      id: `clip_${Date.now()}_${i}`,
      title: c.title,
      url: c.url,
      thumbnail: c.thumbnail,
      duration: c.duration || 15,
    }));
  });

  // Gap filling & transition controls
  const [gapDuration, setGapDuration] = useState(3.0);
  const [selectedEngine, setSelectedEngine] = useState('local_neural_flow');
  const [colorGrade, setColorGrade] = useState('hollywood35');
  const [transitionStyle, setTransitionStyle] = useState('smoothleft');
  const [transitionPrompt, setTransitionPrompt] = useState(
    'Continuous camera glide forward, matching scene lighting, fluid subject motion into opening frame'
  );
  const [aspectRatio, setAspectRatio] = useState(project.aspectRatio || '16:9');
  const [resolution, setResolution] = useState(project.resolution || '1080p');

  // Background Soundtrack Audio Bed
  const [audioMode, setAudioMode] = useState('project'); // 'project' | 'custom' | 'none'
  const [customAudioUrl, setCustomAudioUrl] = useState(null);

  // Processing & Job State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [renderedMaster, setRenderedMaster] = useState(null);
  const [error, setError] = useState(null);

  // Boundary Keyframe previews
  const [boundaryKeyframes, setBoundaryKeyframes] = useState([]);
  const [isLoadingKeyframes, setIsLoadingKeyframes] = useState(false);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const masterVideoRef = useRef(null);

  // Automatically extract keyframes when clips change
  useEffect(() => {
    if (clips.length >= 2) {
      let isMounted = true;
      setIsLoadingKeyframes(true);
      extractClipKeyframes(clips)
        .then((res) => {
          if (isMounted && res && res.keyframes) {
            setBoundaryKeyframes(res.keyframes);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingKeyframes(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setBoundaryKeyframes([]);
    }
  }, [clips]);

  // Handle Video Clip Uploads with browser thumbnail/duration extraction and backend stream upload
  const handleClipUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const initialClips = files.map((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: `custom_${Date.now()}_${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: blobUrl,
        blob: file,
        path: file.path || null,
        duration: 5,
        thumbnail: null,
        isUploading: true,
      };
    });

    setClips((prev) => [...prev, ...initialClips]);
    setError(null);

    // Concurrently extract accurate video metadata/thumbnails and upload to backend
    initialClips.forEach(async (initialClip) => {
      const file = initialClip.blob;
      if (!file) return;

      // Extract accurate duration and thumbnail in browser
      try {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        v.playsInline = true;
        v.src = initialClip.url;

        v.onloadedmetadata = () => {
          const dur = Math.max(1, Math.round(v.duration || 5));
          v.currentTime = Math.min(1.0, dur * 0.1);
        };

        v.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(480, v.videoWidth || 480);
            canvas.height = Math.round(canvas.width * ((v.videoHeight || 270) / (v.videoWidth || 480)));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.7);

            setClips((prev) =>
              prev.map((c) =>
                c.id === initialClip.id
                  ? { ...c, duration: Math.max(1, Math.round(v.duration || c.duration)), thumbnail: thumb }
                  : c
              )
            );
          } catch (_) {}
        };
      } catch (_) {}

      // Upload file directly to backend to get local server path
      try {
        const uploadRes = await uploadClipFile(file);
        if (uploadRes && uploadRes.path) {
          setClips((prev) =>
            prev.map((c) =>
              c.id === initialClip.id
                ? {
                    ...c,
                    path: uploadRes.path,
                    duration: uploadRes.duration || c.duration,
                    thumbnail: c.thumbnail || uploadRes.thumbnail,
                    isUploading: false,
                  }
                : c
            )
          );
        } else {
          setClips((prev) =>
            prev.map((c) => (c.id === initialClip.id ? { ...c, isUploading: false } : c))
          );
        }
      } catch (_) {
        setClips((prev) =>
          prev.map((c) => (c.id === initialClip.id ? { ...c, isUploading: false } : c))
        );
      }
    });
  };

  // Handle Custom Audio Upload
  const handleCustomAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setCustomAudioUrl(blobUrl);
      setAudioMode('custom');
    }
  };

  // Reorder Clips
  const handleMoveClip = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= clips.length) return;
    const updated = [...clips];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setClips(updated);
  };

  // Remove Clip
  const handleRemoveClip = (id) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  // Load Preset Sample Clips
  const handleLoadSampleSet = (sampleSet) => {
    const mapped = sampleSet.clips.map((c, i) => ({
      id: `sample_${sampleSet.id}_${i}`,
      title: c.title,
      url: c.url,
      thumbnail: c.thumbnail,
      duration: c.duration || 15,
    }));
    setClips(mapped);
    setError(null);
    setRenderedMaster(null);
  };

  // Start the Inbetweening & Gap Filling Pipeline
  const handleFillGapsAndStitch = async () => {
    if (clips.length < 2) {
      setError('Please upload or load at least 2 video clips to fill in the missing parts between them.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressPercent(5);
    setProgressStage('Initializing gap filling & video harmonization pipeline...');
    setRenderedMaster(null);

    try {
      const audioToUse =
        audioMode === 'custom'
          ? customAudioUrl
          : audioMode === 'project'
          ? project.audioBlobUrl || project.audioUrl || project.audioDataUrl
          : null;

      const payload = {
        clips,
        gapDuration,
        engine: selectedEngine,
        colorGrade,
        transitionStyle,
        transitionPrompt,
        aspectRatio,
        resolution,
        audioUrl: audioToUse,
        audioBlobUrl: audioToUse,
        fps: 30,
      };

      const initResponse = await startClipGapFilling(payload);
      if (!initResponse.success) {
        throw new Error(initResponse.error || 'Failed to initialize gap filling job');
      }

      setActiveJobId(initResponse.jobId);
      setProgressStage('Ingesting video clips & extracting boundary frames...');
      setProgressPercent(15);

      // Poll until finished
      const result = await pollClipGapFillingStatus(initResponse.jobId, (statusData) => {
        if (statusData.progress) setProgressPercent(statusData.progress);
        if (statusData.stage) setProgressStage(statusData.stage);
        if (statusData.extractedKeyframes) setBoundaryKeyframes(statusData.extractedKeyframes);
      });

      setRenderedMaster(result);
      setProgressPercent(100);
      setProgressStage('Seamless Video Render Complete!');

      setTimeout(() => {
        masterVideoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

      if (onApplyMasterToProject) {
        onApplyMasterToProject({
          stitchedVideoUrl: result.videoUrl,
          images: [result.videoUrl, ...clips.map((c) => c.url)],
        });
      }
    } catch (err) {
      console.error('[ClipInbetweenerStudio] Gap filling execution failed:', err);
      setError(err.message || 'An error occurred during clip inbetweening.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total original duration vs total filled duration
  const totalOriginalDuration = clips.reduce((acc, c) => acc + (c.duration || 5), 0);
  const totalGapsDuration = Math.max(0, clips.length - 1) * gapDuration;
  const estimatedTotalMasterDuration = totalOriginalDuration + totalGapsDuration;

  return (
    <div className="clip-inbetweener-studio animate-in fade-in duration-300">
      {/* TOP HEADER */}
      <header className="inbetweener-header">
        <div className="inbetweener-title-group">
          <div className="inbetweener-icon-wrapper">
            <Film className="w-6 h-6" />
          </div>
          <div className="inbetweener-title-text">
            <h2>
              AI Clip Inbetweener & Gap Filler
              <span className="inbetweener-pill">FIRST & LAST FRAME CONTINUITY</span>
            </h2>
            <p>
              Upload distinct video clips. AI analyzes boundary frames and generates the missing in-between parts to form one continuous, seamless video.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="sample-presets-bar">
          <span className="text-xs text-slate-400 font-bold mr-1">Load Demo Action Clips:</span>
          {SAMPLE_CLIP_SETS.map((set) => (
            <button
              key={set.id}
              type="button"
              className="sample-preset-btn"
              onClick={() => handleLoadSampleSet(set)}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{set.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* COMPLETED MASTER BANNER */}
      {renderedMaster && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                Seamless Master Video Ready!
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  {renderedMaster.totalDuration || estimatedTotalMasterDuration.toFixed(0)}s MP4
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                All video clips have been patched together and harmonized into one seamless master video.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              onClick={() => masterVideoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              <Film className="w-3.5 h-3.5" /> Watch Video
            </button>
            <a
              href={renderedMaster.downloadUrl || renderedMaster.videoUrl}
              download="seamless_master.mp4"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              style={{ textDecoration: 'none' }}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Download MP4
            </a>
          </div>
        </div>
      )}

      {/* ERROR NOTICE */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE GRID */}
      <div className="inbetweener-workspace-grid">
        {/* LEFT: CLIPS TIMELINE & MISSING GAPS STREAM */}
        <section className="sequence-workspace-card">
          <div className="sequence-header-row">
            <h3>
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Clips Sequence & In-Between Gaps ({clips.length} Clips · {Math.max(0, clips.length - 1)} Gaps)</span>
            </h3>

            <div className="flex items-center gap-3">
              {isLoadingKeyframes && (
                <span className="text-xs text-amber-400 flex items-center gap-1 font-medium animate-pulse">
                  <Sparkles className="w-3 h-3" /> Analyzing frames...
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                Original: <strong>{totalOriginalDuration}s</strong> + Bridges: <strong>{totalGapsDuration.toFixed(1)}s</strong> = Master: <strong>{estimatedTotalMasterDuration.toFixed(1)}s</strong>
              </span>

              {clips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setClips([])}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* DRAG & DROP UPLOAD BOX */}
          <div
            className="clip-upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={handleClipUpload}
            />
            <div className="dropzone-content">
              <div className="dropzone-icon">
                <Upload className="w-6 h-6" />
              </div>
              <h4>Drop Video Clips Here or Click to Browse</h4>
              <p>Supports MP4, WebM, QuickTime MOV. Upload 2 or more clips to automatically generate seamless bridging scenes.</p>
            </div>
          </div>

          {/* CLIPS STREAM WITH INTERLEAVED GAP FILLER CONNECTORS */}
          <div className="clips-sequence-stream">
            {clips.map((clip, idx) => {
              const kfHead = boundaryKeyframes[idx]?.headThumbnail || clip.thumbnail;
              const kfTail = boundaryKeyframes[idx]?.tailThumbnail || clip.thumbnail;
              const nextClip = clips[idx + 1];

              return (
                <div key={clip.id} className="clip-card-container">
                  {/* Clip Card */}
                  <div className="clip-stream-card">
                    <div className="clip-index-badge">{idx + 1}</div>

                    <div className="clip-thumbnail-wrapper">
                      {kfHead ? (
                        <img src={kfHead} alt={clip.title} />
                      ) : (
                        <video src={clip.url} preload="metadata" muted />
                      )}
                    </div>

                    <div className="clip-info-meta">
                      <div className="clip-title-text">{clip.title}</div>
                      <div className="clip-tags-row">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {clip.duration || 5}s
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">Source Video {idx + 1}</span>
                      </div>
                    </div>

                    <div className="clip-actions-group">
                      <button
                        type="button"
                        className="clip-tool-btn"
                        onClick={() => handleMoveClip(idx, -1)}
                        disabled={idx === 0}
                        title="Move Clip Up"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="clip-tool-btn"
                        onClick={() => handleMoveClip(idx, 1)}
                        disabled={idx === clips.length - 1}
                        title="Move Clip Down"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="clip-tool-btn danger"
                        onClick={() => handleRemoveClip(clip.id)}
                        title="Delete Clip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* VISUAL GAP CONNECTOR (Rendered between consecutive clips) */}
                  {nextClip && (
                    <div className="gap-bridge-connector">
                      <div className="gap-bridge-top-row">
                        <div className="gap-label-pill">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>⚡ MISSING PART TO FILL (Bridge {idx + 1} → {idx + 2})</span>
                        </div>
                        <span className="gap-duration-pill">
                          +{gapDuration.toFixed(1)}s Seamless AI Bridge
                        </span>
                      </div>

                      {/* Boundary Keyframes Visualizer */}
                      <div className="gap-keyframe-preview-row">
                        <div className="boundary-frame-box">
                          <div className="boundary-frame-thumb">
                            {kfTail ? (
                              <img src={kfTail} alt="Clip Tail Frame" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                                Tail Frame
                              </div>
                            )}
                          </div>
                          <div className="boundary-frame-meta">
                            <span>Clip {idx + 1} Out-Frame</span>
                            <small>Ending frame</small>
                          </div>
                        </div>

                        <div className="bridge-motion-arrow">
                          <span>━━━━▶</span>
                          <span>{transitionStyle}</span>
                          <span>━━━━▶</span>
                        </div>

                        <div className="boundary-frame-box">
                          <div className="boundary-frame-thumb">
                            {boundaryKeyframes[idx + 1]?.headThumbnail || nextClip.thumbnail ? (
                              <img
                                src={
                                  boundaryKeyframes[idx + 1]?.headThumbnail ||
                                  nextClip.thumbnail
                                }
                                alt="Next Clip Head Frame"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                                Head Frame
                              </div>
                            )}
                          </div>
                          <div className="boundary-frame-meta">
                            <span>Clip {idx + 2} In-Frame</span>
                            <small>Opening frame</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* MASTER RESULT DISPLAY (WHEN COMPLETED) */}
          {renderedMaster && (
            <div className="master-result-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-base text-white">
                    Stitched Seamless Video Master Ready!
                  </h3>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono font-bold">
                  {renderedMaster.totalDuration || estimatedTotalMasterDuration.toFixed(0)}s Master MP4
                </span>
              </div>

              {/* Master Video Player */}
              <div className="master-player-container">
                <video
                  ref={masterVideoRef}
                  src={renderedMaster.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  onError={(e) => {
                    console.warn('[ClipInbetweenerStudio] Video player load notice:', e);
                    if (e.target.src && !e.target.src.includes(':4000') && renderedMaster.videoUrl) {
                      const cleanPath = renderedMaster.videoUrl.startsWith('/') ? renderedMaster.videoUrl : `/${renderedMaster.videoUrl}`;
                      e.target.src = `http://localhost:4000${cleanPath}`;
                    } else if (e.target.src && e.target.src.includes(':4000') && renderedMaster.videoUrl) {
                      const filename = renderedMaster.videoUrl.split('/').pop();
                      e.target.src = `/renders/${filename}`;
                    }
                  }}
                />
              </div>

              {/* Master Actions */}
              <div className="master-export-actions">
                <a
                  href={renderedMaster.downloadUrl || renderedMaster.videoUrl}
                  download="seamless_master.mp4"
                  className="master-action-btn primary"
                >
                  <Download className="w-4 h-4" /> Download Stitched MP4 Master
                </a>

                <button
                  type="button"
                  className="master-action-btn secondary"
                  onClick={() => onNavigate('musicvid-studio')}
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Send to Multi-Track Timeline DAW
                </button>

                <button
                  type="button"
                  className="master-action-btn secondary"
                  onClick={() => onNavigate('musicvid-wizard')}
                >
                  <Film className="w-4 h-4 text-cyan-400" />
                  Open in 4-Step Video Creator
                </button>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: DIRECTORIAL GAP FILLING & HARMONIZATION CONTROLS */}
        <aside className="inbetweener-controls-sidebar">
          {/* CONTROL CARD 1: GAP DURATION */}
          <div className="control-card-panel">
            <h4>
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Missing Gap Duration</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Duration of the synthesized in-between scenes connecting each consecutive clip pair.
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-bold">Bridge Length:</span>
              <span className="text-sm font-mono font-black text-amber-400">
                {gapDuration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={gapDuration}
              onChange={(e) => setGapDuration(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1s (Snappy)</span>
              <span>3s (Cinematic)</span>
              <span>8s (Extended Story)</span>
            </div>
          </div>

          {/* CONTROL CARD 2: INBETWEENING GENERATION ENGINE */}
          <div className="control-card-panel">
            <h4>
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Inbetweening Engine</span>
            </h4>
            <div className="engine-select-group">
              {INBETWEEN_ENGINES.map((eng) => (
                <div
                  key={eng.id}
                  className={`engine-option-pill ${selectedEngine === eng.id ? 'active' : ''}`}
                  onClick={() => setSelectedEngine(eng.id)}
                >
                  <div className="engine-pill-title">
                    <span className="flex items-center gap-1.5">
                      <span>{eng.icon}</span>
                      <span>{eng.name}</span>
                    </span>
                    <span className="engine-pill-badge">{eng.badge}</span>
                  </div>
                  <div className="engine-pill-desc">{eng.tagline}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL CARD 3: COLOR SCIENCE & VISUAL HARMONY */}
          <div className="control-card-panel">
            <h4>
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Color Science Harmonizer</span>
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              Apply unified color science across all clips and bridges so they look like the same camera setup.
            </p>
            <div className="color-grade-grid">
              {COLOR_GRADE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`color-grade-card ${colorGrade === preset.id ? 'active' : ''}`}
                  onClick={() => setColorGrade(preset.id)}
                >
                  <div className="color-grade-header">
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </div>
                  <div className="color-grade-desc">{preset.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL CARD 4: TRANSITION MOTION & CAMERA CONTINUITY */}
          <div className="control-card-panel">
            <h4>
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>Motion & Transition Style</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {TRANSITION_STYLES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTransitionStyle(t.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                    transitionStyle === t.id
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold text-slate-300 mb-1">
              Continuity Prompt (Directorial guidance):
            </label>
            <input
              type="text"
              value={transitionPrompt}
              onChange={(e) => setTransitionPrompt(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
              placeholder="e.g. Smooth camera glide forward, matching scene lighting"
            />
          </div>

          {/* CONTROL CARD 5: AUDIO SOUNDTRACK BED */}
          <div className="control-card-panel">
            <h4>
              <Music className="w-4 h-4 text-fuchsia-400" />
              <span>Audio Soundtrack Bed</span>
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              Continuous music track over the seamless master video.
            </p>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAudioMode('project')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  audioMode === 'project'
                    ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                Project Song
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioMode('custom');
                  audioInputRef.current?.click();
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  audioMode === 'custom'
                    ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                {customAudioUrl ? 'Custom Loaded' : 'Upload MP3'}
              </button>
              <button
                type="button"
                onClick={() => setAudioMode('none')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  audioMode === 'none'
                    ? 'bg-slate-800 border-white/30 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-500'
                }`}
              >
                None
              </button>
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleCustomAudioUpload}
            />
          </div>

          {/* CONTROL CARD 6: MASTER OUTPUT FORMAT */}
          <div className="control-card-panel">
            <h4>
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Master Output Format</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['16:9', '9:16', '1:1'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                        aspectRatio === ratio
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Resolution</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['720p', '1080p', '4k'].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                        resolution === res
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LIVE PROGRESS STATUS WHEN PROCESSING */}
          {isProcessing && (
            <div className="inbetweener-progress-card">
              <div className="progress-stage-title">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{progressStage}</span>
              </div>
              <div className="progress-track-bar">
                <div
                  className="progress-fill-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{activeJobId ? `Job ${activeJobId.slice(0, 10)}...` : 'Rendering Seamless Master'}</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          )}

          {/* VIEW MASTER BUTTON (WHEN READY) */}
          {renderedMaster && !isProcessing && (
            <button
              type="button"
              className="w-full py-3 mb-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              onClick={() => masterVideoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              <Film className="w-4 h-4" />
              <span>🎬 View Stitched Master ({renderedMaster.totalDuration || estimatedTotalMasterDuration.toFixed(0)}s)</span>
            </button>
          )}

          {/* PRIMARY EXECUTION ACTION BUTTON */}
          <button
            type="button"
            className="fill-gaps-launch-btn"
            disabled={isProcessing || clips.length < 2}
            onClick={handleFillGapsAndStitch}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>
              {isProcessing
                ? 'Synthesizing & Stitching...'
                : '⚡ Fill Missing Parts & Stitch Video'}
            </span>
          </button>
        </aside>
      </div>
    </div>
  );
}
