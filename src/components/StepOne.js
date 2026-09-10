import React, { useState } from 'react';
import { Upload, X, Sparkles, Check, Layers, UserCheck, Mic2, Palette, Video } from 'lucide-react';
import { CURATED_VISUAL_ASSETS, CINEMATIC_STOCK_VIDEOS, TRANSITION_EFFECTS } from '../data/templates';
import { SINGER_PORTRAITS } from '../services/StoryDirector';
import { RENDER_STYLES, getRenderStyleById } from '../services/RenderStyles';
import { ATMOSPHERE_MODES } from '../services/AtmosphereEngine';
import { CHARACTER_PERSONAS } from '../services/CharacterLockEngine';
import FreebeatAutoDirectorModal from './common/FreebeatAutoDirectorModal';
import '../styles/Step.css';

export default function StepOne({ onNext, project, onNavigate }) {
  const [renderStyle, setRenderStyle] = useState(project.renderStyle || 'photoreal');
  const [singerImageUrl, setSingerImageUrl] = useState(
    project.singerImageUrl || SINGER_PORTRAITS[0].url
  );
  const [images, setImages] = useState(
    project.images && project.images.length > 0
      ? project.images
      : [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
        ]
  );
  const [tab, setTab] = useState('styles');
  const [artistName, setArtistName] = useState(project.artistName || 'NEON ARTIST');
  const [transition, setTransition] = useState(project.transition || 'zoom');
  const [motionMode, setMotionMode] = useState(project.motionMode || '3d-parallax');
  const [motionIntensity, setMotionIntensity] = useState(project.motionIntensity || 100);
  const [atmosphereMode, setAtmosphereMode] = useState(project.atmosphereMode || 'rain');
  const [enableTvBroadcastGraphic, setEnableTvBroadcastGraphic] = useState(
    project.enableTvBroadcastGraphic ?? true
  );
  const [characterPerformance, setCharacterPerformance] = useState(
    project.characterPerformance ?? true
  );
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isCharacterLockEnabled, setIsCharacterLockEnabled] = useState(
    project.isCharacterLockEnabled ?? true
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    project.characterLockPersona?.id || 'cyber-vocalist'
  );
  const [customFaceRefUrl, setCustomFaceRefUrl] = useState(
    project.customFaceRefUrl || null
  );

  const handleSelectRenderStyle = (styleId) => {
    setRenderStyle(styleId);
    const styleObj = getRenderStyleById(styleId);
    if (styleObj) {
      if (styleObj.defaultSinger) setSingerImageUrl(styleObj.defaultSinger);
      if (styleObj.defaultScenes && styleObj.defaultScenes.length > 0) {
        setImages(styleObj.defaultScenes);
      }
    }
  };

  const handleSingerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSingerImageUrl(url);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newUrls]);
    }
  };

  const handleSelectElectronImages = async () => {
    if (window.electron?.selectImages) {
      const imagePaths = await window.electron.selectImages();
      if (imagePaths?.length) {
        const electronRead = window.electron.readFileAsDataUrl || window.electron.readFileDataUrl;
        const resolvedUrls = [];
        for (const filePath of imagePaths) {
          if (electronRead) {
            try {
              const res = await electronRead(filePath);
              if (res?.dataUrl) {
                resolvedUrls.push(res.dataUrl);
                continue;
              }
            } catch (err) {
              console.warn('Electron read file error:', err);
            }
          }
          resolvedUrls.push(filePath);
        }
        setImages((prev) => [...prev, ...resolvedUrls]);
      }
    }
  };

  const addCuratedAsset = (url) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderImage = (fromIdx, toIdx) => {
    const newImages = [...images];
    [newImages[fromIdx], newImages[toIdx]] = [newImages[toIdx], newImages[fromIdx]];
    setImages(newImages);
  };

  const handleNext = () => {
    if (images.length > 0) {
      const styleObj = getRenderStyleById(renderStyle);
      const persona = CHARACTER_PERSONAS.find((p) => p.id === selectedPersonaId) || CHARACTER_PERSONAS[0];
      onNext({
        renderStyle,
        recommendedLut: styleObj.lutId || 'cinema35',
        recommendedVisualizer: styleObj.visualizerStyle || 'radial',
        singerImageUrl,
        images,
        artistName,
        motionMode,
        motionIntensity,
        atmosphereMode,
        enableTvBroadcastGraphic,
        transition,
        characterPerformance,
        isCharacterLockEnabled,
        characterLockPersona: persona,
        customFaceRefUrl,
      });
    } else {
      alert('Please select or upload at least one visual asset for your music video.');
    }
  };

  const activeStyleObj = getRenderStyleById(renderStyle);

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-badge">🎨 Vibe Check & Style Drop</span>
        <h2>Pick Your Visual Aesthetic & Story World</h2>
        <p>
          Select your art direction (Hollywood 8K Cinema, Japanese Anime, 2D Cartoon, Cyberpunk, 90s VHS),
          load your lead singer for lip-sync, and pick visual scene assets!
        </p>
      </div>

      <div className="step-content">
        {/* FREEBEAT 1-CLICK AUTO DIRECTOR PROMPT BANNER */}
        <div className="glass-panel p-4 mb-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-purple-500/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Freebeat 1-Click Fast Music Video Generator</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                  AUTO MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Instantly analyze track beats, lock consistent character identity, and generate a full 4K music video with 1 click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAutoModalOpen(true)}
            className="btn btn-primary-glow py-2 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 whitespace-nowrap shadow-lg shadow-amber-400/20"
          >
            Launch 1-Click Auto Director ⚡
          </button>
        </div>

        {/* TOP: ACTIVE RENDERING STYLE STRIP */}
        <div className="render-style-hero-card">
          <div className="style-hero-info">
            <Palette size={22} color="#06b6d4" />
            <div>
              <div className="hero-title-row">
                <h3>Video Rendering Style: <strong>{activeStyleObj.name}</strong></h3>
                <span className="style-pill-badge">{activeStyleObj.badge}</span>
              </div>
              <p>{activeStyleObj.tagline}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setTab('styles')}>
            Change Aesthetic
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="mode-tabs">
          <button
            className={`tab-btn ${tab === 'styles' ? 'active' : ''}`}
            onClick={() => setTab('styles')}
          >
            <Palette size={18} /> Video Rendering Aesthetics ({RENDER_STYLES.length})
          </button>
          <button
            className={`tab-btn ${tab === 'characterLock' ? 'active' : ''}`}
            onClick={() => setTab('characterLock')}
          >
            <UserCheck size={18} /> Character Consistency Lock ({CHARACTER_PERSONAS.length})
          </button>
          <button
            className={`tab-btn ${tab === 'singer' ? 'active' : ''}`}
            onClick={() => setTab('singer')}
          >
            <Mic2 size={18} /> Lead Singer (Lip-Sync Performer)
          </button>
          <button
            className={`tab-btn ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            <Sparkles size={18} /> Story World Visuals
          </button>
          <button
            className={`tab-btn ${tab === 'videos' ? 'active' : ''}`}
            onClick={() => setTab('videos')}
          >
            <Video size={18} /> Cinematic Video Clips & Loops ({CINEMATIC_STOCK_VIDEOS.length})
          </button>
          <button
            className={`tab-btn ${tab === 'upload' ? 'active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Upload size={18} /> Upload Custom Media (Images & Videos)
          </button>
        </div>

        {/* TAB 1: RENDERING STYLES GRID */}
        {tab === 'styles' && (
          <div className="render-styles-panel">
            <div className="render-styles-grid">
              {RENDER_STYLES.map((style) => {
                const isSelected = renderStyle === style.id;
                return (
                  <div
                    key={style.id}
                    className={`render-style-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectRenderStyle(style.id)}
                  >
                    <div className="style-card-top">
                      <span className="style-category-tag">{style.category}</span>
                      <span className="style-badge-tag">{style.badge}</span>
                    </div>
                    <h4>{style.name}</h4>
                    <p>{style.tagline}</p>
                    <div className="style-card-footer">
                      {isSelected ? (
                        <span className="style-applied-tag">
                          <Check size={12} /> Active Aesthetic
                        </span>
                      ) : (
                        <span className="style-select-btn">Select Style</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: CHARACTER CONSISTENCY LOCK (FREEBEAT AI ANTI-DRIFT) */}
        {tab === 'characterLock' && (
          <div className="character-lock-panel glass-panel p-6 rounded-3xl border border-amber-400/30 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Freebeat Character Consistency Lock</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40 uppercase">
                    Anti-Drift Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Locks the artist's face, facial bone structure, hairstyle, and wardrobe across all video cuts to prevent AI character drifting.
                </p>
              </div>

              {/* Character Lock Toggle */}
              <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-slate-300">Lock Consistency:</span>
                <button
                  type="button"
                  onClick={() => setIsCharacterLockEnabled(!isCharacterLockEnabled)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    isCharacterLockEnabled
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCharacterLockEnabled ? 'LOCKED ON' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* Custom Face Reference Anchor Upload */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {customFaceRefUrl ? (
                  <img
                    src={customFaceRefUrl}
                    alt="Custom Face Lock Anchor"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-dashed border-amber-400/50 flex items-center justify-center text-amber-400 text-xs font-bold">
                    FACE
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">Custom Face Reference Anchor</h4>
                  <p className="text-[11px] text-slate-400">
                    Upload your own photo or custom avatar to lock your personal likeness throughout the entire music video.
                  </p>
                </div>
              </div>

              <label className="btn btn-secondary btn-sm whitespace-nowrap cursor-pointer" htmlFor="custom-face-ref-input">
                <Upload size={14} className="mr-1.5" />
                {customFaceRefUrl ? 'Change Reference Face' : 'Upload Face Photo'}
                <input
                  id="custom-face-ref-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCustomFaceRefUrl(url);
                      setSingerImageUrl(url);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* PERSONAS GRID */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Or Choose Curated Artist Persona
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CHARACTER_PERSONAS.map((p) => {
                const isSelected = selectedPersonaId === p.id && !customFaceRefUrl;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPersonaId(p.id);
                      setCustomFaceRefUrl(null);
                      setSingerImageUrl(p.avatarUrl);
                      setArtistName(p.name);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/10'
                        : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
                    }`}
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                        {isSelected && <Check size={12} className="text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-amber-300 font-semibold truncate">{p.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.genre}</p>
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {p.voiceType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SINGER SELECTION */}
        {tab === 'singer' && (
          <div className="singer-selection-panel">
            <div className="panel-intro-row">
              <div>
                <h3>Select Vocalist for Real-Time Lip-Syncing</h3>
                <p className="tab-hint">
                  The AI LipSyncEngine warps the singer's mouth, jaw, and facial features in real
                  time matching the vocal track.
                </p>
              </div>
              <label className="btn btn-secondary btn-sm" htmlFor="singer-upload-input">
                <Upload size={14} /> Upload Custom Singer Photo
                <input
                  id="singer-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSingerUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="singer-portraits-grid">
              {SINGER_PORTRAITS.map((p) => {
                const isSelected = singerImageUrl === p.url;
                return (
                  <div
                    key={p.id}
                    className={`singer-portrait-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSingerImageUrl(p.url)}
                  >
                    <img src={p.url} alt={p.name} />
                    <div className="singer-portrait-overlay">
                      <span className="singer-tag">{p.mood}</span>
                      <h4>{p.name}</h4>
                      {isSelected ? (
                        <span className="active-singer-badge">
                          <Check size={12} /> Active Performer
                        </span>
                      ) : (
                        <span className="select-singer-badge">Select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CURATED STORY WORLD VISUALS */}
        {tab === 'gallery' && (
          <div className="curated-section">
            <p className="tab-hint">
              Select visual environments for your music video narrative scenes.
            </p>
            <div className="curated-grid">
              {CURATED_VISUAL_ASSETS.map((asset) => {
                const isSelected = images.includes(asset.url);
                return (
                  <div
                    key={asset.id}
                    className={`curated-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => addCuratedAsset(asset.url)}
                  >
                    <img src={asset.url} alt={asset.title} />
                    <div className="curated-overlay">
                      <span className="asset-tag">{asset.category}</span>
                      <h4>{asset.title}</h4>
                      {isSelected ? (
                        <span className="check-badge">
                          <Check size={14} /> Added
                        </span>
                      ) : (
                        <span className="add-badge">+ Add Scene</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CINEMATIC STOCK VIDEO CLIPS */}
        {tab === 'videos' && (
          <div className="curated-gallery-panel">
            <p className="tab-hint">
              Select motion video clips and looping B-roll to composite directly into your music video.
            </p>
            <div className="curated-grid">
              {CINEMATIC_STOCK_VIDEOS.map((clip) => {
                const isSelected = images.includes(clip.url);
                return (
                  <div
                    key={clip.id}
                    className={`curated-card video-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => addCuratedAsset(clip.url)}
                  >
                    <img src={clip.thumbnail} alt={clip.title} />
                    <div className="video-card-badge">
                      <Video size={12} /> VIDEO LOOP
                    </div>
                    <div className="curated-overlay">
                      <span className="asset-tag">{clip.category}</span>
                      <h4>{clip.title}</h4>
                      {isSelected ? (
                        <span className="check-badge">
                          <Check size={14} /> Added to Timeline
                        </span>
                      ) : (
                        <span className="add-badge">+ Add Video Clip</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: UPLOAD CUSTOM MEDIA (IMAGES & VIDEOS) */}
        {tab === 'upload' && (
          <div className="upload-section">
            {/* AI CLIP GAP FILLER BANNER */}
            <div className="glass-panel p-4 mb-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-purple-500/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">AI Clip Inbetweener & Seamless Gap Filler</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                      NEW FEATURE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Upload multiple video clips and have AI automatically synthesize the missing in-between scenes to look like the exact same video!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('clip-gap-filler')}
                className="btn btn-primary-glow py-2 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 whitespace-nowrap shadow-lg shadow-amber-400/20 hover:brightness-110 transition-all"
              >
                Launch Clip Inbetweener ⚡
              </button>
            </div>

            <label className="upload-box" htmlFor="media-file-input">
              <Upload size={36} />
              <h3>Drop or Upload Custom Videos & Images</h3>
              <p>Supports MP4, WEBM, MOV, PNG, JPG (HD & 4K recommended)</p>
              <input
                id="media-file-input"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (window.electron) handleSelectElectronImages();
                  else document.getElementById('media-file-input').click();
                }}
              >
                Browse Files
              </button>
            </label>
          </div>
        )}

        {/* Active Music Video Timeline Storyboard */}
        <div className="storyboard-timeline-section">
          <div className="storyboard-header">
            <div className="storyboard-title">
              <Layers size={20} />
              <h3>Cinematic Scene Sequence ({images.length} Scenes)</h3>
            </div>
            <p className="storyboard-hint">Drag or use arrows to rearrange scene order</p>
          </div>

          <div className="scenes-horizontal-strip">
            {images.map((item, idx) => {
              const isVideo = typeof item === 'string' && (
                item.includes('.mp4') || item.includes('.webm') || item.includes('.mov') || item.startsWith('data:video')
              );

              return (
                <div key={idx} className="scene-thumbnail-card">
                  {isVideo ? (
                    <video src={item} muted autoPlay loop playsInline className="timeline-video-thumb" />
                  ) : (
                    <img src={item} alt={`scene-${idx}`} />
                  )}
                  <div className="scene-badge">
                    {isVideo ? '🎬 Video ' : 'Scene '}{idx + 1}
                  </div>
                  <div className="scene-hover-controls">
                    <div className="reorder-group">
                      {idx > 0 && (
                        <button
                          className="move-btn"
                          onClick={() => reorderImage(idx, idx - 1)}
                          title="Move Left"
                        >
                          ←
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          className="move-btn"
                          onClick={() => reorderImage(idx, idx + 1)}
                          title="Move Right"
                        >
                          →
                        </button>
                      )}
                    </div>
                    <button
                      className="scene-remove-btn"
                      onClick={() => removeImage(idx)}
                      title="Remove Scene"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motion & Performance Settings Bar */}
        <div className="motion-quick-bar">
          <div className="motion-setting">
            <label>Image-to-Video Motion Engine:</label>
            <select value={motionMode} onChange={(e) => setMotionMode(e.target.value)}>
              <option value="3d-parallax">3D Depth Parallax Video (Simulate 3D Depth & Tilt)</option>
              <option value="fluid-warp">Audio-Reactive Fluid Motion (Organic Wave Pulsations)</option>
              <option value="hyper-zoom">Hyper Speed Zoom & Push (Accelerated Depth Push)</option>
              <option value="cinematic-pan">Widescreen Film Tracking (Smooth Camera Tracking)</option>
            </select>
          </div>

          <div className="motion-setting">
            <label>Motion Speed & Depth ({motionIntensity}%):</label>
            <input
              type="range"
              min="30"
              max="200"
              value={motionIntensity}
              onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
            />
          </div>

          <div className="motion-setting">
            <label>Scene Transition Style:</label>
            <select value={transition} onChange={(e) => setTransition(e.target.value)}>
              {TRANSITION_EFFECTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.description})
                </option>
              ))}
            </select>
          </div>

          <div className="motion-setting">
            <label>Environmental Atmosphere Shaders:</label>
            <select value={atmosphereMode} onChange={(e) => setAtmosphereMode(e.target.value)}>
              {ATMOSPHERE_MODES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="motion-setting">
            <label>Artist / Performer Name (MTV/VEVO Card):</label>
            <input
              type="text"
              className="text-input-field"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. THE NEON PROTOCOL"
            />
          </div>

          <div className="performance-toggle-card">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={enableTvBroadcastGraphic}
                onChange={(e) => setEnableTvBroadcastGraphic(e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
            <div className="toggle-info">
              <span className="toggle-label">
                📺 MTV / VEVO 4K Broadcast Graphic
              </span>
              <p className="toggle-sub">
                Displays cinematic MTV/VEVO artist credits overlay at video intro & outro
              </p>
            </div>
          </div>

          <div className="performance-toggle-card">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={characterPerformance}
                onChange={(e) => setCharacterPerformance(e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
            <div className="toggle-info">
              <span className="toggle-label">
                <UserCheck size={16} /> Viseme Lip-Sync & Face Morphing
              </span>
              <p className="toggle-sub">
                Mouth deformation, vowel shaping, jaw drop, and natural eye blinking
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn btn-primary btn-large" onClick={handleNext}>
          Lock In Vibe & Drop The Beat →
        </button>
      </div>

      {/* FREEBEAT 1-CLICK AUTO DIRECTOR MODAL */}
      <FreebeatAutoDirectorModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        onAutoGenerateComplete={(autoProject) => {
          onNext(autoProject);
        }}
        project={project}
      />
    </div>
  );
}
