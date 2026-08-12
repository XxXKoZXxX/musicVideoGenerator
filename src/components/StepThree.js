import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layout,
  Type,
  RefreshCw,
  Check,
  Film,
  Music2,
  Wand2,
  Disc,
  Clapperboard,
  Video,
  Eye,
  Zap,
} from 'lucide-react';
import { generateStorylineFromAudio, MUSIC_GENRES } from '../services/AIService';
import { STORYLINE_TEMPLATES, CINEMATIC_STOCK_VIDEOS } from '../data/templates';
import { StoryDirector, DIRECTOR_MODES } from '../services/StoryDirector';
import '../styles/Step.css';

export default function StepThree({ onNext, onBack, project }) {
  const [activeTab, setActiveTab] = useState('screenplay');
  const [directorMode, setDirectorMode] = useState(project.directorMode || 'hybrid');
  const [genre, setGenre] = useState('Cyberpunk / Electro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

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

  const handleGenerateAIVideos = () => {
    if (!screenplay?.scenes || isGeneratingVideos) return;
    setIsGeneratingVideos(true);
    setGenerationProgress(0);
    
    // Simulate generation time per scene
    const totalScenes = screenplay.scenes.length;
    let completed = 0;
    
    const interval = setInterval(() => {
      completed += 1;
      setGenerationProgress(Math.floor((completed / totalScenes) * 100));
      
      if (completed >= totalScenes) {
        clearInterval(interval);
        
        // Convert static images to generated video motion
        const updatedScenes = screenplay.scenes.map((scene, idx) => {
          const matchingVideo = CINEMATIC_STOCK_VIDEOS[idx % CINEMATIC_STOCK_VIDEOS.length];
          return {
            ...scene,
            imageUrl: matchingVideo.url,
            media: matchingVideo
          };
        });
        
        setScreenplay({ ...screenplay, scenes: updatedScenes });
        // Also update project state if needed so it passes down to StepFour
        project.aiGeneratedVideos = updatedScenes.map(s => s.media);
        
        setTimeout(() => setIsGeneratingVideos(false), 500);
      }
    }, 250); // 250ms simulated rendering time per scene
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
    onNext({
      storyline: aiStoryboard,
      aiStoryboard,
      screenplay,
      directorMode,
      selectedTemplate,
      lyrics: lyricsText,
      lyricsStyle,
      recommendedLut: selectedTemplate?.recommendedLut || 'cyberpunk',
      recommendedVisualizer: selectedTemplate?.recommendedVisualizer || 'radial',
    });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-badge">Cinematic Story & Director Studio</span>
        <h2>Step 3: Direct Storyline & Lip-Sync Performance</h2>
        <p>
          Configure the 4-Act screenplay, select the production cut mode (Hybrid Story + Lip-Sync),
          and customize beat-synchronized kinetic typography.
        </p>
      </div>

      <div className="step-content">
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
            className={`tab-btn ${activeTab === 'screenplay' ? 'active' : ''}`}
            onClick={() => setActiveTab('screenplay')}
          >
            <Film size={18} /> 4-Act Screenplay Breakdown
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

        {/* TAB 1: 4-ACT SCREENPLAY BREAKDOWN */}
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
                <button className="btn btn-secondary btn-sm" onClick={handleEnhancePrompts} title="Add Hollywood 8K, cinematic lighting, and lens keywords">
                  <Sparkles size={14} color="#06b6d4" /> AI Enhance
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleAutoSnapBeatDrops} title="Align all scene cuts to 808 kick drops">
                  <Zap size={14} color="#ec4899" /> Snap to Drops
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleGenerateAIVideos()} title="Generate AI motion video loops for all scenes">
                  <Film size={14} /> {isGeneratingVideos ? 'Rendering...' : 'Generate AI Videos'}
                </button>
                <span className="acts-pill">{screenplay.scenes?.length || 6} Directorial Scenes</span>
              </div>
            </div>

            {isGeneratingVideos && (
              <div className="video-generation-modal">
                <div className="generation-progress-box">
                  <RefreshCw size={24} className="spin-icon text-cyan" />
                  <h3>Synthesizing {screenplay.scenes?.length} AI Video Scenes...</h3>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${generationProgress}%` }}></div>
                  </div>
                  <p>Running Luma / Gen-3 simulation rendering... Please wait.</p>
                </div>
              </div>
            )}

            <div className="screenplay-scenes-grid">
              {screenplay.scenes?.map((scene, idx) => {
                const isVideo = scene.media?.type === 'video' || scene.imageUrl?.includes('.mp4');
                return (
                  <div key={scene.id || idx} className="screenplay-scene-card">
                    <div className="scene-card-media">
                      {isVideo ? (
                        <video src={scene.imageUrl} autoPlay muted loop playsInline />
                      ) : (
                        <img src={scene.imageUrl} alt={scene.title} />
                      )}
                      <span className="act-tag">{scene.act}</span>
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
                    <div className="scene-timing-bar">
                      <span className="font-mono">
                        {Math.round(scene.startTime)}s - {Math.round(scene.endTime)}s
                      </span>
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
                    <div className="template-box-top">
                      <h4>{tmpl.name}</h4>
                      <span className="mood-tag">{tmpl.mood}</span>
                    </div>
                    <p className="template-desc">{tmpl.description}</p>
                    <div className="template-meta-strip">
                      <span className="meta-genre">{tmpl.genre}</span>
                      {isSelected ? (
                        <span className="applied-pill">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="apply-btn-pill">Apply Template</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: KINETIC LYRICS STUDIO */}
        {activeTab === 'lyrics' && (
          <div className="lyrics-panel">
            <div className="lyrics-editor-grid">
              <div className="lyrics-input-column">
                <div className="column-header">
                  <Music2 size={18} />
                  <h4>Song Lyrics (Timed LRC or Plain Text)</h4>
                </div>
                <textarea
                  className="lyrics-textarea"
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  rows={8}
                  placeholder={`[00:00.00] Line 1...\n[00:06.00] Line 2...`}
                />
                <p className="lyrics-hint">
                  Tip: Include [mm:ss.xx] timestamps for millisecond precision, or enter plain lines
                  for auto-timed pacing.
                </p>
              </div>

              <div className="lyrics-style-column">
                <h4>Kinetic Typography Visual Style</h4>
                <div className="style-options-grid">
                  {[
                    {
                      id: 'neon',
                      name: 'Neon Glow Pulse',
                      desc: 'Cyberpunk glowing cyan/magenta aura',
                    },
                    {
                      id: 'karaoke',
                      name: 'Karaoke Word Highlight',
                      desc: 'Live word-by-word progressive color fill',
                    },
                    {
                      id: 'kinetic',
                      name: 'Kinetic Pop & Spring',
                      desc: 'Explosive scale-pop synchronized to beats',
                    },
                    {
                      id: 'glitch',
                      name: 'Chromatic RGB Glitch',
                      desc: 'Digital color split on sub-bass kicks',
                    },
                    {
                      id: 'perspective',
                      name: '3D Perspective Warp',
                      desc: 'Angled cinematic typography fly-in',
                    },
                    {
                      id: 'cinema',
                      name: 'Classic Cinema Subtitle',
                      desc: 'Golden film subtitles with soft letterbox pill',
                    },
                  ].map((st) => (
                    <div
                      key={st.id}
                      className={`style-card ${lyricsStyle === st.id ? 'active' : ''}`}
                      onClick={() => setLyricsStyle(st.id)}
                    >
                      <h5>{st.name}</h5>
                      <p>{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="step-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="btn btn-primary btn-large" onClick={handleNext}>
          Next: Live Studio & Master Export →
        </button>
      </div>
    </div>
  );
}
