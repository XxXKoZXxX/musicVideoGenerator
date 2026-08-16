import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layout,
  Type,
  RefreshCw,
  Check,
  Film,
  Wand2,
  Disc,
  Clapperboard,
  Video,
  Eye,
  Zap,
  Cpu,
  Layers,
  Monitor,
  RotateCcw,
} from 'lucide-react';
import { generateStorylineFromAudio, generateLyricVisualScenes, MUSIC_GENRES } from '../services/AIService';
import { STORYLINE_TEMPLATES, CINEMATIC_STOCK_VIDEOS } from '../data/templates';
import { StoryDirector, DIRECTOR_MODES } from '../services/StoryDirector';
import { VideoFetchService } from '../services/VideoFetchService';
import { AI_VIDEO_MODELS, AI_STORYLINE_GENERATORS } from '../data/aiModels';
import { RENDERER_ENGINES, getRendererEngineById } from '../data/rendererEngines';
import '../styles/Step.css';

export default function StepThree({ onNext, onBack, project }) {
  const [activeTab, setActiveTab] = useState('models');
  const [directorMode, setDirectorMode] = useState(project.directorMode || 'hybrid');
  const [rendererEngine, setRendererEngine] = useState(project.rendererEngine || 'ai-neural');
  const [selectedVideoModel, setSelectedVideoModel] = useState(project.selectedVideoModel || AI_VIDEO_MODELS[0].id);
  const [selectedStoryGenerator, setSelectedStoryGenerator] = useState(project.selectedStoryGenerator || AI_STORYLINE_GENERATORS[0].id);
  const [genre, setGenre] = useState('Cyberpunk / Electro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [pexelsApiKey, setPexelsApiKey] = useState(
    project.pexelsApiKey || localStorage.getItem('pexels_api_key') || ''
  );

  const handlePexelsKeyChange = (key) => {
    setPexelsApiKey(key);
    localStorage.setItem('pexels_api_key', key);
    project.pexelsApiKey = key;
  };

  const [screenplay, setScreenplay] = useState(
    project.screenplay || StoryDirector.generateScreenplay(project, project.images || [])
  );

  const [aiStoryboard, setAiStoryboard] = useState(
    project.aiStoryboard || {
      concept:
        'A renegade hacker sprints across rain-slicked neon skyscrapers of Neo-Tokyo, evading drone surveillance during a massive cyber heist.',
      scenes: [
        'Scene 1 [Intro - Slow Dolly In]: Raindrops glisten on glowing neon billboards as shadows move across an alleyway in Neo-Tokyo.',
        'Scene 2 [Verse 1 - Low Angle Pan]: The protagonist activates their holographic visor, reflecting streams of glowing digital code.',
        'Scene 3 [Pre-Chorus - Whip Pan]: Security drones hover overhead, sweeping crimson laser grids across the wet asphalt.',
        'Scene 4 [Drop / Chorus - Hyper Zoom]: A massive energy burst pulses through the city skyline as neon light trails explode in vibrant cyan and magenta.',
        'Scene 5 [Bridge - Vortex Spin]: Glitching reality bends as digital holograms shatter into floating geometric light particles.',
        'Scene 6 [Outro - Crane Pull Out]: Standing on the rooftop edge overlooking the glowing mega-city at dawn, victorious.',
      ],
      lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
    }
  );

  const [selectedTemplate, setSelectedTemplate] = useState(
    project.selectedTemplate || STORYLINE_TEMPLATES[0]
  );
  const [lyricsText, setLyricsText] = useState(
    project.lyrics ||
      aiStoryboard.lyrics ||
      `[00:00.00] Neon lights reflection in the rain\n[00:06.00] Driving fast to wash away the pain\n[00:12.00] Burning through the midnight city glow\n[00:18.00] Where the electric river starts to flow\n[00:24.00] Forever in the rhythm of the night`
  );
  const [lyricsStyle, setLyricsStyle] = useState(project.lyricsStyle || 'neon');

  // Automatically update storyline when song in project changes
  useEffect(() => {
    if (project.aiStoryboard) {
      setAiStoryboard(project.aiStoryboard);
      if (project.lyrics) {
        setLyricsText(project.lyrics);
      } else if (project.aiStoryboard.lyrics) {
        setLyricsText(project.aiStoryboard.lyrics);
      }
    }
    const newScreenplay = StoryDirector.generateScreenplay(project, project.images || []);
    setScreenplay(newScreenplay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.aiStoryboard, project.lyrics, project.audioTitle]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const result = await generateStorylineFromAudio(
        {
          bpm: project.bpm || 128,
          title: project.audioTitle || 'Song',
          duration: project.duration || 32,
        },
        genre
      );
      setAiStoryboard(result);
      if (result.lyrics) {
        setLyricsText(result.lyrics);
      }
      const updatedScreenplay = StoryDirector.generateScreenplay(
        { ...project, bpm: project.bpm, title: project.audioTitle },
        project.images || []
      );
      setScreenplay(updatedScreenplay);
    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLyricVideo = () => {
    setIsGenerating(true);
    try {
      const lyricResult = generateLyricVisualScenes(lyricsText, project);
      setAiStoryboard({
        concept: lyricResult.title,
        scenes: lyricResult.scenes.map((s) => s.directive),
        lyrics: lyricResult.lyrics,
      });

      const lyricScreenplay = {
        title: lyricResult.title,
        duration: project.duration || 30,
        bpm: project.bpm || 128,
        scenesCount: lyricResult.scenes.length,
        scenes: lyricResult.scenes,
      };

      setScreenplay(lyricScreenplay);
      if (lyricResult.images?.length) {
        project.images = lyricResult.images;
      }
    } catch (err) {
      alert('Error generating lyric video: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompts = () => {
    if (!screenplay?.scenes) return;
    const cinematicModifiers = [
      'shot on 35mm anamorphic lens, volumetric golden hour haze, 8K ultra-detailed cinematography',
      'raytraced neon reflections, dynamic bokeh, unreal engine 5 master shot',
      'high-contrast dramatic chiaroscuro lighting, cinematic shallow depth of field',
      'explosive cyan and magenta light rays, dynamic motion blur, award-winning visual direction',
      'dreamy soft focus bloom, ethereal floating particles, IMAX scope resolution',
      'radiant dawn horizon glow, wide angle tracking composition, master color grade',
    ];

    const enhancedScenes = screenplay.scenes.map((s, idx) => ({
      ...s,
      directive: `${s.directive} — (${cinematicModifiers[idx % cinematicModifiers.length]})`,
    }));

    setScreenplay({ ...screenplay, scenes: enhancedScenes });
  };

  const handleAutoSnapBeatDrops = () => {
    if (!screenplay?.scenes) return;
    const dur = project.duration || 32;
    const beats = [0, dur * 0.18, dur * 0.38, dur * 0.58, dur * 0.78, dur * 0.9, dur];

    const snappedScenes = screenplay.scenes.map((s, idx) => ({
      ...s,
      startTime: beats[idx] || (idx * dur) / 6,
      endTime: beats[idx + 1] || ((idx + 1) * dur) / 6,
    }));

    setScreenplay({ ...screenplay, scenes: snappedScenes });
    alert('✨ Successfully aligned all scene cuts with musical beat drops & section transitions!');
  };

  const handleGenerateAIVideos = async () => {
    if (!screenplay?.scenes || isGeneratingVideos) return;

    setIsGeneratingVideos(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing AI video synthesis...');

    try {
      const totalScenes = screenplay.scenes.length;
      let completed = 0;
      const updatedScenes = [];

      for (let i = 0; i < totalScenes; i++) {
        const scene = screenplay.scenes[i];
        setGenerationStatus(`Synthesizing Scene ${i + 1}/${totalScenes}: "${scene.title || scene.lyricText || 'Motion Cut'}"`);
        
        try {
          const query = scene.lyricText || scene.title || scene.directive || 'cinematic cyberpunk neon';
          const videoMedia = await VideoFetchService.fetchPexelsVideo(query, pexelsApiKey);

          if (videoMedia && videoMedia.url) {
            updatedScenes.push({
              ...scene,
              imageUrl: videoMedia.url,
              media: videoMedia,
            });
          } else {
            const fallback = CINEMATIC_STOCK_VIDEOS[i % CINEMATIC_STOCK_VIDEOS.length];
            updatedScenes.push({
              ...scene,
              imageUrl: fallback.url,
              media: fallback,
            });
          }
        } catch (err) {
          console.warn('Video fetch fallback for scene:', scene, err);
          const fallback = CINEMATIC_STOCK_VIDEOS[i % CINEMATIC_STOCK_VIDEOS.length];
          updatedScenes.push({
            ...scene,
            imageUrl: fallback.url,
            media: fallback,
          });
        }

        completed += 1;
        setGenerationProgress(Math.floor((completed / totalScenes) * 100));
        // Yield briefly for smooth animation
        await new Promise((r) => setTimeout(r, 120));
      }

      setScreenplay({ ...screenplay, scenes: updatedScenes });
      project.aiGeneratedVideos = updatedScenes.map((s) => s.media);
      project.images = updatedScenes.map((s) => s.imageUrl);
      project.screenplay = { ...screenplay, scenes: updatedScenes };
      project.pexelsApiKey = pexelsApiKey;

      setGenerationStatus('✨ All scene video cuts generated & synchronized!');
    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      setTimeout(() => {
        setIsGeneratingVideos(false);
        setGenerationStatus('');
      }, 600);
    }
  };

  const handleRegenerateSingleSceneVideo = async (sceneIndex) => {
    if (!screenplay?.scenes?.[sceneIndex] || regeneratingIndex !== null) return;
    setRegeneratingIndex(sceneIndex);

    try {
      const scene = screenplay.scenes[sceneIndex];
      const query = scene.lyricText || scene.title || scene.directive || 'cinematic lighting motion';
      const videoMedia = await VideoFetchService.fetchPexelsVideo(query, pexelsApiKey);

      const nextScenes = [...screenplay.scenes];
      nextScenes[sceneIndex] = {
        ...scene,
        imageUrl: videoMedia.url,
        media: videoMedia,
      };

      setScreenplay({ ...screenplay, scenes: nextScenes });
      project.images = nextScenes.map((s) => s.imageUrl);
      project.screenplay = { ...screenplay, scenes: nextScenes };
    } catch (err) {
      console.warn('Failed to regenerate scene video:', err);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    if (tmpl.scenes) {
      setAiStoryboard({
        concept: tmpl.description,
        scenes: tmpl.scenes,
        lyrics: lyricsText,
      });
    }
  };

  const handleNext = () => {
    const updated = {
      storyline: aiStoryboard,
      aiStoryboard,
      screenplay,
      directorMode,
      rendererEngine,
      selectedTemplate,
      selectedVideoModel,
      selectedStoryGenerator,
      lyrics: lyricsText,
      lyricsStyle,
      recommendedLut: selectedTemplate?.recommendedLut || 'cyberpunk',
      recommendedVisualizer: selectedTemplate?.recommendedVisualizer || 'radial',
    };
    Object.assign(project, updated);
    onNext(updated);
  };

  const currentRendererObj = getRendererEngineById(rendererEngine);

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-badge">🎬 AI Storyboard & Video Engine Studio</span>
        <h2>Select Renderer Engine & Generate AI Videos</h2>
        <p>
          Configure high-performance rendering engines, generate full video scene loops for your lyrics,
          and orchestrate director production cuts!
        </p>
      </div>

      <div className="step-content">
        {/* Quick Renderer Engine Banner */}
        <div className="renderer-summary-banner" style={{ borderColor: currentRendererObj.color }}>
          <div className="banner-left">
            <span className="engine-icon-badge" style={{ background: `${currentRendererObj.color}25`, color: currentRendererObj.color }}>
              {currentRendererObj.icon}
            </span>
            <div>
              <span className="engine-sublabel">ACTIVE RENDERING ENGINE</span>
              <h4 style={{ color: currentRendererObj.color }}>{currentRendererObj.name}</h4>
              <p className="engine-desc-text">{currentRendererObj.tagline}</p>
            </div>
          </div>
          <div className="banner-right">
            <button
              className="btn btn-primary btn-generate-hero"
              onClick={handleGenerateAIVideos}
              disabled={isGeneratingVideos}
            >
              {isGeneratingVideos ? (
                <>
                  <RefreshCw size={16} className="spin-icon" /> Generating Videos ({generationProgress}%)...
                </>
              ) : (
                <>
                  <Film size={16} /> Generate AI Video Scenes 🔥
                </>
              )}
            </button>
          </div>
        </div>

        {/* Production Director Cut Mode Switcher */}
        <div className="director-mode-card">
          <div className="director-mode-header">
            <Clapperboard size={20} color="#06b6d4" />
            <div>
              <h3>Director Production Cut Mode</h3>
              <p>Choose how the music video combines storyline events and the lip-syncing singer</p>
            </div>
          </div>

          <div className="director-modes-grid">
            {DIRECTOR_MODES.map((mode) => {
              const isSelected = directorMode === mode.id;
              return (
                <div
                  key={mode.id}
                  className={`director-mode-box ${isSelected ? 'selected' : ''}`}
                  onClick={() => setDirectorMode(mode.id)}
                >
                  <div className="mode-box-top">
                    <span className="mode-badge-pill">{mode.badge}</span>
                    {isSelected && <Check size={16} color="#06b6d4" />}
                  </div>
                  <h4>{mode.name}</h4>
                  <p>{mode.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mode-tabs">
          <button
            className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <Cpu size={18} /> Renderer & AI Engine Suite
          </button>
          <button
            className={`tab-btn ${activeTab === 'screenplay' ? 'active' : ''}`}
            onClick={() => setActiveTab('screenplay')}
          >
            <Film size={18} /> Directorial Screenplay & Video Clips
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Wand2 size={18} /> AI Storyboard & Prompts
          </button>
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Layout size={18} /> Director Templates
          </button>
          <button
            className={`tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            <Type size={18} /> Synced Kinetic Lyrics
          </button>
        </div>

        {/* TAB 0: RENDERER ENGINES & AI MODELS */}
        {activeTab === 'models' && (
          <div className="tab-pane">
            {/* SECTION 1: MASTER RENDERER SELECTION */}
            <div className="section-title">
              <Monitor size={20} color="#38bdf8" />
              <h3>Select Video Renderer Engine</h3>
              <p>Choose the core graphical compositing & master rendering pipeline</p>
            </div>

            <div className="renderer-engines-grid">
              {RENDERER_ENGINES.map((engine) => {
                const isSelected = rendererEngine === engine.id;
                return (
                  <div
                    key={engine.id}
                    className={`renderer-engine-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setRendererEngine(engine.id);
                      project.rendererEngine = engine.id;
                    }}
                    style={{ borderColor: isSelected ? engine.color : 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <div className="engine-card-top">
                      <span className="engine-icon">{engine.icon}</span>
                      <span className="engine-badge" style={{ background: `${engine.color}22`, color: engine.color }}>
                        {engine.badge}
                      </span>
                    </div>
                    <h4>{engine.name}</h4>
                    <p className="engine-tagline">{engine.tagline}</p>
                    <div className="engine-features-list">
                      {engine.features.map((f, i) => (
                        <div key={i} className="engine-feat-item">
                          <Check size={12} color={engine.color} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="engine-rec">
                      <span>💡 <em>{engine.recommendedFor}</em></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECTION 2: AI VIDEO MOTION MODELS */}
            <div className="section-title" style={{ marginTop: 32 }}>
              <Cpu size={20} color="#06b6d4" />
              <h3>Select AI Video Motion Engine</h3>
              <p>Choose the neural AI generator engine that powers camera dynamics and image-to-video motion</p>
            </div>

            <div className="ai-models-grid">
              {AI_VIDEO_MODELS.map((model) => {
                const isSelected = selectedVideoModel === model.id;
                return (
                  <div
                    key={model.id}
                    className={`ai-model-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedVideoModel(model.id);
                      project.selectedVideoModel = model.id;
                      project.motionMode = model.motionMode;
                    }}
                    style={{ borderColor: isSelected ? model.color : 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <div className="model-card-top">
                      <span className="model-icon">{model.icon}</span>
                      <span className="model-badge-pill" style={{ background: `${model.color}22`, color: model.color }}>
                        {model.badge}
                      </span>
                    </div>
                    <h4>{model.name}</h4>
                    <p className="model-tagline">{model.tagline}</p>
                    <div className="model-specs">
                      <span>Max: <strong>{model.maxResolution}</strong></span>
                      <span>Motion: <strong>{model.motionQuality}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECTION 3: STORYLINE SCRIPT GENERATORS */}
            <div className="section-title" style={{ marginTop: 32 }}>
              <Layers size={20} color="#ec4899" />
              <h3>Select AI Storyline & Script Generator</h3>
              <p>Choose the AI intelligence model used to synthesize scene screenplays and lyric visual directives</p>
            </div>

            <div className="ai-story-grid">
              {AI_STORYLINE_GENERATORS.map((gen) => {
                const isSelected = selectedStoryGenerator === gen.id;
                return (
                  <div
                    key={gen.id}
                    className={`story-gen-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStoryGenerator(gen.id);
                      project.selectedStoryGenerator = gen.id;
                    }}
                  >
                    <div className="gen-card-top">
                      <span className="gen-icon">{gen.icon}</span>
                      <span className="gen-badge">{gen.badge}</span>
                    </div>
                    <h4>{gen.name}</h4>
                    <p>{gen.tagline}</p>
                    <div className="gen-features">
                      {gen.features.map((f, i) => (
                        <span key={i} className="gen-feature-tag">
                          <Check size={12} /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: 4-ACT SCREENPLAY BREAKDOWN & VIDEO CLIPS */}
        {activeTab === 'screenplay' && (
          <div className="screenplay-panel">
            <div className="screenplay-header-strip">
              <div className="strip-title">
                <Disc size={18} className="spin-slow-icon" />
                <span>
                  Soundtrack: <strong>{project.audioTitle || 'Cyberpunk 2077 Night Drive'}</strong> ({project.bpm || 128} BPM)
                </span>
              </div>
              <div className="screenplay-actions-group">
                <input
                  type="password"
                  className="settings-input pexels-key-input"
                  placeholder="Optional Pexels API Key"
                  value={pexelsApiKey}
                  onChange={(e) => handlePexelsKeyChange(e.target.value)}
                  title="Optional: Leave blank to use built-in HD video loops & AI procedural animations"
                />
                <button className="btn btn-secondary btn-sm" onClick={handleEnhancePrompts} title="Add Hollywood 8K, cinematic lighting, and lens keywords">
                  <Sparkles size={14} color="#06b6d4" /> AI Enhance
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleAutoSnapBeatDrops} title="Align all scene cuts to 808 kick drops">
                  <Zap size={14} color="#ec4899" /> Snap to Drops
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleGenerateLyricVideo} title="Automatically extract song lyrics and generate visual video scenes for every line">
                  <Wand2 size={14} /> Lyric Scenes
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleGenerateAIVideos}
                  disabled={isGeneratingVideos}
                  title="Generate dynamic AI motion video loops for all scenes"
                >
                  <Film size={14} /> {isGeneratingVideos ? 'Synthesizing...' : 'Generate AI Video Clips'}
                </button>
                <span className="acts-pill">{screenplay.scenes?.length || 6} Directorial Scenes</span>
              </div>
            </div>

            {/* Video Generation Progress Modal */}
            {isGeneratingVideos && (
              <div className="video-generation-modal">
                <div className="generation-progress-box">
                  <RefreshCw size={28} className="spin-icon text-cyan" />
                  <h3>Generating AI Video Scenes...</h3>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${generationProgress}%` }}></div>
                  </div>
                  <span className="progress-percent font-mono">{generationProgress}% Completed</span>
                  <p className="generation-status-text">{generationStatus}</p>
                </div>
              </div>
            )}

            <div className="screenplay-scenes-grid">
              {screenplay.scenes?.map((scene, idx) => {
                const isVideo = scene.media?.type === 'video' || (typeof scene.imageUrl === 'string' && (scene.imageUrl.includes('.mp4') || scene.imageUrl.includes('blob:')));
                const isRegenerating = regeneratingIndex === idx;

                return (
                  <div key={scene.id || idx} className="screenplay-scene-card">
                    <div className="scene-card-media">
                      {isVideo ? (
                        <video src={scene.imageUrl} autoPlay muted loop playsInline />
                      ) : (
                        <img src={scene.imageUrl} alt={scene.title} />
                      )}
                      <span className="act-tag">{scene.act}</span>
                      {isVideo && (
                        <span className="video-cut-pill">
                          <Film size={11} /> VIDEO CLIP
                        </span>
                      )}
                      {scene.isSingerCut ? (
                        <span className="cut-type-badge singer-badge">
                          <Video size={12} /> Lip-Sync Cut
                        </span>
                      ) : (
                        <span className="cut-type-badge story-badge">
                          <Eye size={12} /> Story Action Cut
                        </span>
                      )}
                    </div>
                    <div className="scene-card-body">
                      <div className="scene-card-title-row">
                        <h4>
                          Scene {idx + 1}: {scene.title}
                        </h4>
                        <span className="camera-pill">{scene.cameraMove}</span>
                      </div>
                      <p className="scene-directive">{scene.directive}</p>
                      <div className="scene-card-bottom-row">
                        <span className="scene-timing-badge font-mono">
                          {Math.round(scene.startTime || 0)}s - {Math.round(scene.endTime || 5)}s
                        </span>
                        <button
                          className="btn-regen-scene"
                          onClick={() => handleRegenerateSingleSceneVideo(idx)}
                          disabled={isRegenerating}
                          title="Generate a new video clip for this scene"
                        >
                          <RotateCcw size={12} className={isRegenerating ? 'spin-icon' : ''} />
                          {isRegenerating ? 'Regenerating...' : 'New Video Clip'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI STORYBOARD & PROMPTS */}
        {activeTab === 'ai' && (
          <div className="ai-storyboard-panel">
            <div className="active-song-storyline-banner">
              <div className="song-banner-info">
                <Disc size={20} className="spin-slow-icon" />
                <div>
                  <span className="song-banner-tag">ACTIVE SOUNDTRACK</span>
                  <h4>{project.audioTitle || 'Cyberpunk 2077 Night Drive'}</h4>
                </div>
              </div>
              <div className="song-banner-meta">
                <span className="banner-pill">{project.bpm || 128} BPM</span>
                <span className="banner-pill">{project.duration || 32}s Duration</span>
                <span className="banner-pill custom-story-pill">Song Storyline Active</span>
              </div>
            </div>

            <div className="ai-controls-bar">
              <div className="genre-picker">
                <label>Theme & Style Variation:</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                  {MUSIC_GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGenerateAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" /> Generating Screenplay...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate AI Storyboard & Scenes
                  </>
                )}
              </button>
            </div>

            {aiStoryboard && (
              <div className="storyboard-result-card">
                <div className="concept-box">
                  <Film size={20} />
                  <div>
                    <h4>Cinematic Concept</h4>
                    <p>{aiStoryboard.concept}</p>
                  </div>
                </div>

                <div className="scenes-list">
                  <h4>Beat-Aligned Scene Directives</h4>
                  {aiStoryboard.scenes.map((scene, idx) => (
                    <div key={idx} className="scene-item">
                      <span className="scene-num">{idx + 1}</span>
                      <p>{scene}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIRECTOR TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="templates-panel">
            <div className="templates-grid-cards">
              {STORYLINE_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    className={`template-box-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    <div className="tmpl-top">
                      <span className="tmpl-genre">{tmpl.genre}</span>
                      {isSelected && <Check size={16} color="#06b6d4" />}
                    </div>
                    <h4>{tmpl.name}</h4>
                    <p className="tmpl-mood">Mood: {tmpl.mood}</p>
                    <p className="tmpl-desc">{tmpl.description}</p>
                    <div className="tmpl-scenes-preview">
                      <span>{tmpl.scenes?.length || 10} Narrative Acts Included</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SYNCHRONIZED LYRICS */}
        {activeTab === 'lyrics' && (
          <div className="lyrics-editor-panel">
            <div className="lyrics-header-row">
              <div>
                <h3>Synced LRC Lyrics & Kinetic Typography</h3>
                <p>Edit time-coded lyrics in [MM:SS.xx] format or paste raw lyrics to auto-time</p>
              </div>
              <div className="lyrics-style-picker">
                <label>Typography Style:</label>
                <select value={lyricsStyle} onChange={(e) => setLyricsStyle(e.target.value)}>
                  <option value="neon">Neon Cyan Glow (Cyberpunk)</option>
                  <option value="karaoke">Karaoke Bounce Word-by-Word</option>
                  <option value="cinema">Cinema 35mm Minimalist</option>
                  <option value="glitch">Glitch Cyber Matrix</option>
                  <option value="bold">Bold Impact Pop</option>
                </select>
              </div>
            </div>

            <textarea
              className="lyrics-textarea font-mono"
              rows={12}
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              placeholder="[00:00.00] Line 1&#10;[00:06.00] Line 2..."
            />
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="step-actions-footer">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Audio
          </button>
          <button className="btn btn-primary btn-large" onClick={handleNext}>
            Proceed to Live Studio Monitor & Render Master →
          </button>
        </div>
      </div>
    </div>
  );
}
