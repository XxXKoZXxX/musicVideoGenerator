import React, { useState, useEffect, useRef } from 'react';
import { 
  SolfeggioSynthesizer, 
  FREQUENCIES_DATABASE, 
  SOUND_CATEGORIES, 
  BINAURAL_BEAT_PRESETS 
} from '../../utils/soundscapeEngine';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import SacredVisualizerCanvas from '../soundscape/SacredVisualizerCanvas';
import { 
  Headphones, Play, Pause, Volume2, Sparkles, Clock, 
  Brain, Filter, CheckCircle2, Music, Upload, Trash2
} from 'lucide-react';

const SUGGESTED_GOALS = [
  { id: 'all', label: 'All Needs', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'sleep', label: '😴 Sleep & Insomnia', matchHz: [174, 432, 210.42, 136.1], desc: 'Deep delta relaxation and lunar peace' },
  { id: 'focus', label: '🎯 Focus & Studying', matchHz: [10, 40, 141.27, 432], desc: 'Alpha flow state and Mercury intellect' },
  { id: 'anxiety', label: '🧘 Anxiety & Stress', matchHz: [432, 396, 136.1, 174], desc: 'Nervous system reset & Schumann grounding' },
  { id: 'pain', label: '🩹 Pain & Muscle Healing', matchHz: [174, 285, 50, 111], desc: 'Natural acoustic analgesic & tissue repair' },
  { id: 'heart', label: '❤️ Love & Relationships', matchHz: [528, 639, 221.23, 136.1], desc: 'Heart chakra opening & Venusian harmony' },
  { id: 'meditation', label: '👁️ Third Eye & Intuition', matchHz: [741, 852, 963, 111], desc: 'Pineal activation & cosmic consciousness' },
  { id: 'energy', label: '⚡ Motivation & Vitality', matchHz: [528, 126.22, 40], desc: 'Solar willpower & DNA rejuvenation' }
];

export default function SoundscapeView({ profile, onNavigate }) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astro = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const sunElem = astro.planets.Sun.zodiac.element;

  // Determine recommended frequency based on element
  const elemFreqMap = { Fire: 528, Earth: 432, Air: 639, Water: 741 };
  const recommendedHz = elemFreqMap[sunElem] || 432;

  const [activeHz, setActiveHz] = useState(recommendedHz);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedBeatPreset, setSelectedBeatPreset] = useState('schumann'); // 7.83 Hz
  const [timerMinutes, setTimerMinutes] = useState(0); // 0 = continuous
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);

  // Custom Audio Track State
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [customAudioName, setCustomAudioName] = useState('');
  const [isCustomAudioPlaying, setIsCustomAudioPlaying] = useState(false);
  const [customAudioVolume, setCustomAudioVolume] = useState(0.7);
  const [showCustomAudioUploader, setShowCustomAudioUploader] = useState(false);

  const synthRef = useRef(null);
  const customAudioRef = useRef(null);

  useEffect(() => {
    const synth = new SolfeggioSynthesizer();
    synthRef.current = synth;

    return () => {
      if (synth) {
        synth.stop();
      }
    };
  }, []);

  const getActiveBeatHz = () => {
    const preset = BINAURAL_BEAT_PRESETS.find(p => p.id === selectedBeatPreset);
    return preset ? preset.hz : 0;
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.stop();
      setIsPlaying(false);
      if (customAudioRef.current) {
        customAudioRef.current.pause();
        setIsCustomAudioPlaying(false);
      }
    } else {
      synthRef.current.play(activeHz, getActiveBeatHz());
      if (timerMinutes > 0) {
        synthRef.current.setTimer(timerMinutes, () => {
          setIsPlaying(false);
          if (customAudioRef.current) {
            customAudioRef.current.pause();
            setIsCustomAudioPlaying(false);
          }
        });
      }
      setIsPlaying(true);
      if (customAudioUrl && customAudioRef.current) {
        customAudioRef.current.play();
        setIsCustomAudioPlaying(true);
      }
    }
  };

  const handleSelectHz = (hz) => {
    setActiveHz(hz);
    if (isPlaying && synthRef.current) {
      synthRef.current.play(hz, getActiveBeatHz());
    }
  };

  const handleSelectBeatPreset = (presetId) => {
    setSelectedBeatPreset(presetId);
    const preset = BINAURAL_BEAT_PRESETS.find(p => p.id === presetId);
    const beatHz = preset ? preset.hz : 0;
    if (synthRef.current) {
      synthRef.current.setBinauralBeat(beatHz);
    }
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
    if (synthRef.current) {
      synthRef.current.setVolume(v);
    }
  };

  const handleCustomAudioVolumeChange = (v) => {
    setCustomAudioVolume(v);
    if (customAudioRef.current) {
      customAudioRef.current.volume = v;
    }
  };

  const handleToggleCustomAudioPlay = () => {
    if (!customAudioRef.current) return;
    if (isCustomAudioPlaying) {
      customAudioRef.current.pause();
      setIsCustomAudioPlaying(false);
    } else {
      customAudioRef.current.play();
      setIsCustomAudioPlaying(true);
    }
  };

  const handleTimerChange = (mins) => {
    setTimerMinutes(mins);
    if (isPlaying && synthRef.current) {
      synthRef.current.setTimer(mins, () => {
        setIsPlaying(false);
        if (customAudioRef.current) {
          customAudioRef.current.pause();
          setIsCustomAudioPlaying(false);
        }
      });
    }
  };

  // Filter frequencies by category and selected goal
  const filteredFrequencies = Object.values(FREQUENCIES_DATABASE).filter(f => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory || 
      (selectedCategory === 'chakras' && f.chakra && f.chakra !== 'Physical Skeletal System');
    
    let matchesGoal = true;
    if (selectedGoal !== 'all') {
      const goal = SUGGESTED_GOALS.find(g => g.id === selectedGoal);
      matchesGoal = goal && goal.matchHz ? goal.matchHz.includes(f.hz) : true;
    }

    return matchesCat && matchesGoal;
  });

  const activeMeta = FREQUENCIES_DATABASE[activeHz] || FREQUENCIES_DATABASE[432];
  const activeBeat = BINAURAL_BEAT_PRESETS.find(p => p.id === selectedBeatPreset);

  return (
    <div className="soundscape-page">
      {/* Header */}
      <div className="view-header glass-panel">
        <div className="view-title">
          <Headphones className="title-icon text-gold animate-pulse" />
          <div>
            <h2>Sacred Sound Sanctuary & Binaural Beat Synthesizer</h2>
            <p>Clinical Solfeggio Tones, Planetary Octaves, Custom Audio Track Player & Sacred Geometry</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowCustomAudioUploader(!showCustomAudioUploader)} 
            className={`btn ${customAudioUrl ? 'btn-gold' : 'btn-secondary'} text-xs flex items-center gap-1.5`}
          >
            <Music className="w-4 h-4 text-cyan" />
            <span>{customAudioUrl ? 'Custom Track Loaded' : 'Upload Custom Song / Audio'}</span>
          </button>
        </div>
      </div>

      {/* Custom Audio Uploader Bar */}
      {showCustomAudioUploader && (
        <div className="custom-audio-panel glass-panel mt-4 p-4 rounded-2xl border border-cyan/40 bg-gradient-to-r from-cyan-950/30 to-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Custom Audio / Solfeggio Song Player</h4>
                <p className="text-xs text-silver">Upload any MP3, WAV, or meditation song to blend with the live healing frequency synthesizer.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="btn-gold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Audio File</span>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCustomAudioUrl(url);
                      setCustomAudioName(file.name);
                      setIsCustomAudioPlaying(false);
                    }
                  }}
                />
              </label>
              {customAudioUrl && (
                <button 
                  onClick={() => {
                    if (customAudioRef.current) customAudioRef.current.pause();
                    setCustomAudioUrl(null);
                    setCustomAudioName('');
                    setIsCustomAudioPlaying(false);
                  }}
                  className="btn-secondary text-xs p-2 text-rose-400"
                  title="Remove Custom Audio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Hidden Audio Element */}
          {customAudioUrl && (
            <audio 
              ref={customAudioRef} 
              src={customAudioUrl} 
              loop 
              onEnded={() => setIsCustomAudioPlaying(false)}
            />
          )}

          {/* Active Custom Track Controls */}
          {customAudioUrl && (
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleToggleCustomAudioPlay}
                  className="w-8 h-8 rounded-full bg-cyan text-black flex items-center justify-center font-bold"
                >
                  {isCustomAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <strong className="text-white truncate max-w-xs">{customAudioName}</strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-silver">Track Volume:</span>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={customAudioVolume}
                  onChange={(e) => handleCustomAudioVolumeChange(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-cyan font-bold">{Math.round(customAudioVolume * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Sound Synthesizer Studio Panel */}
      <div className="glass-panel player-panel mt-6">
        <div className="player-hero-grid">
          {/* Visualizer Dial */}
          <div className="sound-visualizer-col text-center">
            <div className="freq-wheel-card">
              <div className="freq-glow-halo animate-pulse"></div>
              <div className="active-hz-number font-serif">{activeHz}</div>
              <div className="active-hz-unit">HERTZ (Hz)</div>
            </div>

            <div className="player-main-controls mt-4">
              <button 
                onClick={handleTogglePlay} 
                className={`btn-control main-play-btn mx-auto ${isPlaying ? 'playing' : ''}`}
                title={isPlaying ? "Pause Soundscape" : "Play Soundscape"}
              >
                {isPlaying ? <Pause className="w-8 h-8 text-dark" /> : <Play className="w-8 h-8 text-dark ml-1" />}
              </button>
            </div>
          </div>

          {/* Active Tone Detailed Intel */}
          <div className="tone-details-col">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="pill-tag text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderColor: '#F59E0B' }}>
                {activeMeta.category.toUpperCase()}
              </span>
              {activeMeta.chakra && (
                <span className="pill-tag text-xs" style={{ background: 'rgba(56,189,248,0.15)', color: '#38BDF8', borderColor: '#38BDF8' }}>
                  🌈 {activeMeta.chakra}
                </span>
              )}
              {activeMeta.element && (
                <span className="pill-tag text-xs" style={{ background: 'rgba(168,85,247,0.15)', color: '#C084FC', borderColor: '#C084FC' }}>
                  ✨ {activeMeta.element} Element
                </span>
              )}
            </div>

            <h3 className="text-gold text-xl font-serif">{activeMeta.title}</h3>
            <p className="text-sm font-semibold text-white/90 mt-1">{activeMeta.subtitle}</p>
            <p className="text-xs text-silver mt-2">{activeMeta.description}</p>

            {/* Recommendations / What it helps with */}
            <div className="recommend-box mt-3 p-3 glass-panel">
              <span className="text-xs font-bold text-gold block mb-1">🎯 Best For / Recommended Uses:</span>
              <p className="text-xs text-emerald-400 font-medium">{activeMeta.recommendedFor}</p>
            </div>

            {/* Core Benefits */}
            <div className="benefits-list mt-3">
              <span className="text-xs font-bold text-silver block mb-1">Key Physiological & Esoteric Benefits:</span>
              <ul className="text-xs text-silver space-y-1">
                {activeMeta.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Binaural Beat Layer & Controls Bar */}
        <div className="player-subcontrols mt-6 pt-4 border-t border-white/10">
          <div className="subcontrols-grid">
            {/* Binaural Beat Layer Selector */}
            <div className="binaural-selector-box">
              <label className="text-xs font-bold text-gold flex items-center gap-1.5 mb-2">
                <Brain className="w-4 h-4 text-cyan" /> Layer Binaural Brainwave Beat:
              </label>
              <div className="binaural-preset-pills flex flex-wrap gap-1.5">
                {BINAURAL_BEAT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`preset-pill ${selectedBeatPreset === preset.id ? 'active' : ''}`}
                    onClick={() => handleSelectBeatPreset(preset.id)}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-silver mt-1.5">
                💡 Active: <strong className="text-cyan">{activeBeat.desc}</strong> (Use headphones for true stereo binaural entrainment).
              </p>
            </div>

            {/* Volume & Session Timer */}
            <div className="volume-timer-box">
              {/* Volume */}
              <div className="volume-slider-box mb-3">
                <div className="flex justify-between text-xs text-silver mb-1">
                  <span>Synthesizer Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-silver" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume} 
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="slider w-full"
                  />
                </div>
              </div>

              {/* Session Meditation Timer */}
              <div className="timer-box">
                <div className="flex justify-between text-xs text-silver mb-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> Auto-Off Timer</span>
                  <span>{timerMinutes === 0 ? 'Endless' : `${timerMinutes} min`}</span>
                </div>
                <div className="timer-pills flex gap-1">
                  {[0, 5, 15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleTimerChange(mins)}
                      className={`timer-pill ${timerMinutes === mins ? 'active' : ''}`}
                    >
                      {mins === 0 ? '∞' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 60 FPS Sacred Geometry Visualizer & Custom Background Video Canvas */}
      <div className="mt-6">
        <SacredVisualizerCanvas 
          activeHz={activeHz} 
          isPlaying={isPlaying} 
          element={activeMeta.element || 'Earth'} 
        />
      </div>

      {/* Intention & Goal Filter Chips */}
      <div className="goals-filter-card glass-panel mt-6 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-cyan" />
          <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
            Quick Intention & Healing Goals:
          </h4>
        </div>
        <div className="goals-chips-row flex flex-wrap gap-2">
          {SUGGESTED_GOALS.map((goal) => (
            <button
              key={goal.id}
              className={`goal-chip ${selectedGoal === goal.id ? 'active' : ''}`}
              onClick={() => setSelectedGoal(goal.id)}
              title={goal.desc}
            >
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="category-tabs-row mt-6 flex flex-wrap gap-2">
        {SOUND_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Frequencies Grid Cards */}
      <div className="frequencies-grid mt-4">
        {filteredFrequencies.map((f) => {
          const isCurrentActive = activeHz === f.hz;
          return (
            <div 
              key={f.hz}
              className={`freq-card glass-panel ${isCurrentActive ? 'active-freq' : ''}`}
              onClick={() => handleSelectHz(f.hz)}
            >
              <div className="freq-card-header flex justify-between items-start">
                <div className="hz-badge-large font-serif">{f.hz} <span className="text-xs font-sans">Hz</span></div>
                {isCurrentActive && isPlaying && (
                  <span className="live-playing-badge animate-pulse">🔊 Playing</span>
                )}
              </div>

              <h4 className="freq-name font-serif text-white mt-2">{f.title}</h4>
              <p className="freq-sub text-xs text-silver mt-0.5">{f.subtitle}</p>

              <div className="freq-rec-tag mt-2 p-2 bg-black/40 rounded border border-white/5">
                <span className="text-xs text-silver block"><strong>Helps With:</strong> {f.recommendedFor}</span>
              </div>

              <div className="freq-tags-row mt-3 flex flex-wrap gap-1.5">
                {f.chakra && <span className="tag-chip text-xs">🌈 {f.chakra}</span>}
                {f.element && <span className="tag-chip text-xs">✨ {f.element}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="oracleChat" 
          prevLabel="AI Oracle & Notebook" 
          nextView="tarot" 
          nextLabel="Tarot Card Spreads" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
