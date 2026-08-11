import React, { useState } from 'react';
import { Upload, X, Sparkles, Check, Layers, UserCheck, Mic2, Palette } from 'lucide-react';
import { CURATED_VISUAL_ASSETS, TRANSITION_EFFECTS } from '../data/templates';
import { SINGER_PORTRAITS } from '../services/StoryDirector';
import { RENDER_STYLES, getRenderStyleById } from '../services/RenderStyles';
import { ATMOSPHERE_MODES } from '../services/AtmosphereEngine';
import '../styles/Step.css';

export default function StepOne({ onNext, project }) {
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
        setImages((prev) => [...prev, ...imagePaths]);
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
      });
    } else {
      alert('Please select or upload at least one visual asset for your music video.');
    }
  };

  const activeStyleObj = getRenderStyleById(renderStyle);

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-badge">Rendering Styles & Performer Studio</span>
        <h2>Step 1: Choose Video Rendering Style & Assets</h2>
        <p>
          Select your visual aesthetic (Realistic, Japanese Anime, 3D CGI, Cyberpunk, 90s VHS),
          choose your lead singer for lip-syncing, and curate storyline scenes.
        </p>
      </div>

      <div className="step-content">
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
            className={`tab-btn ${tab === 'singer' ? 'active' : ''}`}
            onClick={() => setTab('singer')}
          >
            <Mic2 size={18} /> Lead Singer (Lip-Sync Performer)
          </button>
          <button
            className={`tab-btn ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            <Sparkles size={18} /> Cinematic Story World Visuals
          </button>
          <button
            className={`tab-btn ${tab === 'upload' ? 'active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Upload size={18} /> Upload Custom Frames
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

        {/* TAB 4: UPLOAD CUSTOM FRAMES */}
        {tab === 'upload' && (
          <div className="upload-section">
            <label className="upload-box" htmlFor="image-file-input">
              <Upload size={36} />
              <h3>Drop or Upload Custom Scene Images</h3>
              <p>Supports PNG, JPG, WEBP (HD & 4K recommended)</p>
              <input
                id="image-file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (window.electron) handleSelectElectronImages();
                  else document.getElementById('image-file-input').click();
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
            {images.map((img, idx) => (
              <div key={idx} className="scene-thumbnail-card">
                <img src={img} alt={`scene-${idx}`} />
                <div className="scene-badge">Scene {idx + 1}</div>
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
            ))}
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
          Next: Choose Audio Track →
        </button>
      </div>
    </div>
  );
}
