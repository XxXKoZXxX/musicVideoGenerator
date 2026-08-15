import React, { useState, useEffect, useRef } from 'react';
import { generatePodcastScript, PodcastAudioPlayer, getAvailableNaturalVoices } from '../../utils/podcastGenerator';
import ChapterPagination from '../navigation/ChapterPagination';
import { Play, Pause, Square, Mic, Radio, Download, FastForward, Sliders, Volume2, Sparkles } from 'lucide-react';

export default function PodcastStudioView({ profile, onNavigate }) {
  const [script, setScript] = useState([]);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.92);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedMaleVoice, setSelectedMaleVoice] = useState('');
  const [selectedFemaleVoice, setSelectedFemaleVoice] = useState('');
  const [ambientAudio, setAmbientAudio] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const playerRef = useRef(null);

  useEffect(() => {
    const generated = generatePodcastScript(profile);
    setScript(generated);

    const player = new PodcastAudioPlayer();
    player.onLineChange = (index) => setActiveLineIdx(index);
    player.onStateChange = (playingState) => setIsPlaying(playingState);
    playerRef.current = player;

    // Load available natural browser voices
    const updateVoices = () => {
      const voices = getAvailableNaturalVoices();
      setAvailableVoices(voices);
      if (player.maleVoice) setSelectedMaleVoice(player.maleVoice.name);
      if (player.femaleVoice) setSelectedFemaleVoice(player.femaleVoice.name);
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, [profile]);

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      if (playerRef.current.synth && playerRef.current.synth.paused) {
        playerRef.current.resume();
      } else {
        playerRef.current.playScript(script, activeLineIdx);
      }
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      setActiveLineIdx(0);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setRate(speed);
    }
  };

  const handleMaleVoiceChange = (voiceName) => {
    setSelectedMaleVoice(voiceName);
    const found = availableVoices.find(v => v.name === voiceName);
    if (found && playerRef.current) {
      playerRef.current.setMaleVoice(found);
    }
  };

  const handleFemaleVoiceChange = (voiceName) => {
    setSelectedFemaleVoice(voiceName);
    const found = availableVoices.find(v => v.name === voiceName);
    if (found && playerRef.current) {
      playerRef.current.setFemaleVoice(found);
    }
  };

  const handleToggleAmbience = () => {
    const nextState = !ambientAudio;
    setAmbientAudio(nextState);
    if (playerRef.current) {
      playerRef.current.setAmbience(nextState);
    }
  };

  const handleExportScript = () => {
    const textContent = script.map(line => `[${line.speaker}]:\n${line.text}\n`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_Cosmic_Podcast_Script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="podcast-studio-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Radio className="title-icon text-gold animate-pulse" />
          <div>
            <h2>NotebookLM Deep Dive Cosmic Podcast</h2>
            <p>Natural Conversational Audio Overview for {profile.name} • {profile.cityName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowVoiceSettings(!showVoiceSettings)} 
            className="btn btn-secondary text-sm"
          >
            <Sliders className="w-4 h-4 mr-2" />
            {showVoiceSettings ? 'Hide Voice Settings' : 'Natural Voice Settings'}
          </button>
          <button onClick={handleExportScript} className="btn btn-secondary text-sm">
            <Download className="w-4 h-4 mr-2" /> Export Script
          </button>
        </div>
      </div>

      {/* Voice Tuning Settings Panel */}
      {showVoiceSettings && (
        <div className="glass-panel voice-settings-panel mt-4 p-4">
          <h4 className="text-gold mb-3"><Sparkles className="w-4 h-4 inline mr-1" /> Human Voice & Studio Settings</h4>
          <div className="voice-selectors-grid">
            <div className="voice-select-box">
              <label className="text-xs text-silver font-semibold">🎙️ Atlas (Host Voice - Male)</label>
              <select 
                value={selectedMaleVoice} 
                onChange={(e) => handleMaleVoiceChange(e.target.value)}
                className="input-field text-sm mt-1"
              >
                {availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} {/natural|neural|google|premium/i.test(v.name) ? '⭐ (Natural HD)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="voice-select-box">
              <label className="text-xs text-silver font-semibold">✨ Luna (Co-Host Voice - Female)</label>
              <select 
                value={selectedFemaleVoice} 
                onChange={(e) => handleFemaleVoiceChange(e.target.value)}
                className="input-field text-sm mt-1"
              >
                {availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} {/natural|neural|google|premium/i.test(v.name) ? '⭐ (Natural HD)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ambience-toggle-row mt-3 flex items-center justify-between">
            <span className="text-xs text-silver">
              <Volume2 className="w-4 h-4 inline mr-1 text-gold" />
              432 Hz Studio Ambience Pad (Eliminates dead silence during reading)
            </span>
            <button 
              onClick={handleToggleAmbience} 
              className={`tag-btn text-xs ${ambientAudio ? 'active' : ''}`}
            >
              {ambientAudio ? '✓ Ambient Pad Active' : 'Off'}
            </button>
          </div>
        </div>
      )}

      {/* Podcast Hosts Banner */}
      <div className="hosts-banner glass-panel mt-6">
        <div className="host-card male">
          <div className="host-avatar">🎙️</div>
          <div>
            <h4>Atlas</h4>
            <span>Astrology & Numbers Lead</span>
          </div>
        </div>

        <div className="podcast-vs-pulse">
          <Mic className="w-7 h-7 text-gold" />
        </div>

        <div className="host-card female">
          <div className="host-avatar">✨</div>
          <div>
            <h4>Luna</h4>
            <span>Intuitive Seer & Tarot Mystic</span>
          </div>
        </div>
      </div>

      {/* Audio Control Panel & Waveform */}
      <div className="glass-panel player-control-panel mt-6 text-center">
        {/* Animated Waveform Bars */}
        <div className={`waveform-container ${isPlaying ? 'playing' : ''}`}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${(i % 6) * 0.12}s` }}></div>
          ))}
        </div>

        {/* Controls */}
        <div className="player-buttons-row mt-4">
          <button onClick={handleStop} className="btn-control icon-btn" title="Stop">
            <Square className="w-5 h-5 text-rose-400" />
          </button>

          <button onClick={handleTogglePlay} className="btn-control main-play-btn" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-7 h-7 text-dark" /> : <Play className="w-7 h-7 text-dark ml-1" />}
          </button>

          {/* Speed Selector */}
          <div className="speed-selector">
            <FastForward className="w-4 h-4 text-silver mr-1" />
            {[0.85, 0.92, 1.0, 1.15].map(s => (
              <button 
                key={s} 
                className={`speed-btn ${playbackSpeed === s ? 'active' : ''}`}
                onClick={() => handleSpeedChange(s)}
              >
                {s === 0.92 ? 'Natural' : `${s}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="glass-panel transcript-panel mt-6">
        <h3>Live Audio Reading Transcript</h3>
        <p className="text-xs text-silver mt-1">Tap any line below to jump directly to that point in the podcast.</p>
        
        <div className="transcript-lines mt-4">
          {script.map((line, idx) => {
            const isActive = idx === activeLineIdx && isPlaying;
            return (
              <div 
                key={line.id} 
                className={`transcript-line ${line.gender} ${isActive ? 'active-speaking' : ''}`}
                onClick={() => {
                  setActiveLineIdx(idx);
                  if (playerRef.current) {
                    playerRef.current.playScript(script, idx);
                  }
                }}
              >
                <span className="speaker-name">{line.speaker}</span>
                <p className="speaker-text">{line.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="karma" 
          prevLabel="Past-Life Karma" 
          nextView="video" 
          nextLabel="Motion Video Studio" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
