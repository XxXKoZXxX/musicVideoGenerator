import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Upload, Sparkles, Volume2, Activity, Zap } from 'lucide-react';
import { audioEngine, BUILT_IN_TRACKS } from '../services/AudioEngine';
import { generateStorylineFromAudio } from '../services/AIService';
import '../styles/Step.css';

export default function StepTwo({ onNext, onBack, project }) {
  const [selectedTrackId, setSelectedTrackId] = useState(
    project.selectedTrackId || 'cyberpunk-neon'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(32);
  const [bpm, setBpm] = useState(128);
  const [audioBlobUrl, setAudioBlobUrl] = useState(project.audioBlobUrl || null);
  const [waveformPeaks, setWaveformPeaks] = useState([]);
  const [audioBoost, setAudioBoost] = useState(project.audioBoost || 100);
  const [trackTitle, setTrackTitle] = useState(project.audioTitle || 'Cyberpunk 2077 Night Drive');
  const [isCustomAudio, setIsCustomAudio] = useState(false);

  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize synthesized audio track if none selected
  useEffect(() => {
    if (!audioBlobUrl) {
      loadSynthesizedTrack(selectedTrackId);
    } else if (audioRef.current) {
      // Re-entering Step 2 with existing audio — restore the source
      audioRef.current.src = audioBlobUrl;
    }
    const audioEl = audioRef.current;
    const animFrame = animFrameRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
      if (animFrame) {
        cancelAnimationFrame(animFrame);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [trackStoryline, setTrackStoryline] = useState(project.aiStoryboard || null);
  const [recommendedLut, setRecommendedLut] = useState(project.recommendedLut || 'cyberpunk');
  const [recommendedVisualizer, setRecommendedVisualizer] = useState(project.recommendedVisualizer || 'radial');

  const loadSynthesizedTrack = (trackId) => {
    try {
      const trackData = audioEngine.createSynthesizedTrack(trackId);
      setAudioBlobUrl(trackData.blobUrl);
      setDuration(trackData.duration);
      setBpm(trackData.bpm);
      setWaveformPeaks(trackData.peaks);
      setTrackTitle(trackData.title);
      setSelectedTrackId(trackId);
      setTrackStoryline(trackData.storyline);
      setRecommendedLut(trackData.recommendedLut || 'cyberpunk');
      setRecommendedVisualizer(trackData.recommendedVisualizer || 'radial');
      setIsCustomAudio(false);
      setIsPlaying(false);
      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.src = trackData.blobUrl;
        audioRef.current.currentTime = 0;
      }
    } catch (err) {
      console.error('Failed to create synthesized audio:', err);
    }
  };

  const handleCustomAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const audioData = await audioEngine.loadUserAudio(file);
      // Revoke previous blob URL to prevent memory leaks
      if (audioBlobUrl && audioBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioBlobUrl);
      }
      const blobUrl = URL.createObjectURL(file);
      setAudioBlobUrl(blobUrl);
      setDuration(audioData.duration);
      setBpm(audioData.bpm);
      setWaveformPeaks(audioData.peaks);
      setTrackTitle(file.name);
      setIsCustomAudio(true);
      setSelectedTrackId(null);
      setIsPlaying(false);
      setCurrentTime(0);

      project.audio = blobUrl;
      project.audioBlobUrl = blobUrl;
      project.audioTitle = file.name;
      project.bpm = audioData.bpm;
      project.duration = audioData.duration;
      project.waveformPeaks = audioData.peaks;

      if (audioRef.current) {
        audioRef.current.src = blobUrl;
        audioRef.current.currentTime = 0;
      }

      // Generate custom bespoke AI storyline for uploaded song
      generateStorylineFromAudio({
        title: file.name,
        bpm: audioData.bpm,
        duration: audioData.duration,
      }).then((customStory) => {
        setTrackStoryline(customStory);
        project.aiStoryboard = customStory;
        if (customStory?.lyrics) {
          project.lyrics = customStory.lyrics;
        }
      });
    } catch (err) {
      alert('Error decoding audio file: ' + err.message);
    }
  };

  const handleSelectElectronAudio = async () => {
    if (!window.electron?.selectAudio) return;
    try {
      const audioPath = await window.electron.selectAudio();
      if (!audioPath) return;

      const result = await window.electron.readFileAsDataUrl(audioPath);
      if (!result?.dataUrl) return;

      const response = await fetch(result.dataUrl);
      const blob = await response.blob();
      const filename = audioPath.split(/[\\/]/).pop() || 'Custom Track';
      const file = new File([blob], filename, { type: blob.type || 'audio/mpeg' });

      const audioData = await audioEngine.loadUserAudio(file);
      setAudioBlobUrl(result.dataUrl);
      setDuration(audioData.duration);
      setBpm(audioData.bpm);
      setWaveformPeaks(audioData.peaks);
      setTrackTitle(filename);
      setIsCustomAudio(true);
      setSelectedTrackId(null);
      setIsPlaying(false);
      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.src = result.dataUrl;
        audioRef.current.currentTime = 0;
      }

      generateStorylineFromAudio({
        title: filename,
        bpm: audioData.bpm,
        duration: audioData.duration,
      }).then((customStory) => {
        setTrackStoryline(customStory);
      });
    } catch (err) {
      alert('Error decoding audio file: ' + err.message);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      audioEngine.getAudioContext();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        updatePlaybackProgress();
      }).catch((e) => console.warn(e));
    }
  };

  const updatePlaybackProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused && !audioRef.current.ended) {
        animFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
      } else if (audioRef.current.ended) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleNext = () => {
    if (audioRef.current) audioRef.current.pause();
    onNext({
      audio: audioBlobUrl,
      audioBlobUrl,
      audioTitle: trackTitle,
      selectedTrackId,
      bpm,
      duration,
      waveformPeaks,
      audioBoost,
      aiStoryboard: trackStoryline,
      lyrics: trackStoryline?.lyrics,
      recommendedLut,
      recommendedVisualizer,
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-badge">🎵 Drop The Track & Audio Engine</span>
        <h2>Drop Your Song & Detect Audio Beats</h2>
        <p>
          Pick a curated genre anthem or upload your custom song! We automatically detect BPM,
          sub-bass 808 kick drops, and vocal frequencies for lip-syncing.
        </p>
      </div>

      <div className="step-content">
        {/* Hidden Audio element for player */}
        <audio
          ref={audioRef}
          src={audioBlobUrl || ''}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />

        {/* Royalty-Free Track Library */}
        <div className="soundtrack-library">
          <div className="library-header">
            <Sparkles size={18} />
            <h3>Royalty-Free Music Library (Synthesized Master Quality)</h3>
          </div>

          <div className="track-cards-grid">
            {BUILT_IN_TRACKS.map((track) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`track-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => loadSynthesizedTrack(track.id)}
                  style={{ borderLeftColor: track.color }}
                >
                  <div className="track-card-top">
                    <div className="track-icon-wrapper" style={{ background: `${track.color}25` }}>
                      <Music size={20} color={track.color} />
                    </div>
                    <div className="track-meta">
                      <h4>{track.title}</h4>
                      <span className="track-genre">{track.genre}</span>
                    </div>
                  </div>

                  <div className="track-badges">
                    <span className="badge bpm-badge">
                      <Activity size={12} /> {track.bpm} BPM
                    </span>
                    <span className="badge duration-badge">{track.duration}s</span>
                    <span className="badge mood-badge">{track.mood}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Audio Upload Drop Area */}
        <div className="audio-upload-container">
          <div className="audio-upload-box" onClick={(e) => {
            // Only trigger if not clicking the button directly
            if (e.target.closest('button')) return;
            if (window.electron?.selectAudio) {
              handleSelectElectronAudio();
            } else {
              document.getElementById('audio-file-input').click();
            }
          }}>
            <Upload size={28} />
            <div className="upload-text">
              <h4>Upload Your Own Song (MP3, WAV, AAC, FLAC)</h4>
              <p>Instant BPM detection and full-song waveform peak analysis</p>
            </div>
            <input
              id="audio-file-input"
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (window.electron?.selectAudio) {
                  handleSelectElectronAudio();
                } else {
                  document.getElementById('audio-file-input').click();
                }
              }}
            >
              Choose Audio File
            </button>
          </div>
        </div>

        {/* Live Audio Deck & Waveform Analyzer */}
        <div className="audio-deck-panel">
          <div className="deck-header">
            <div className="deck-info">
              <span className="now-playing-tag">ACTIVE SOUNDTRACK</span>
              <h3>{trackTitle}</h3>
              <div className="deck-stats">
                <span className="stat-pill bpm-pill">
                  <Zap size={14} /> {bpm} BPM (Detected)
                </span>
                <span className="stat-pill">Duration: {formatTime(duration)}</span>
                {isCustomAudio && <span className="stat-pill custom-pill">Custom Audio</span>}
              </div>
            </div>

            <button className="play-button-deck" onClick={togglePlay} title="Play/Pause Preview">
              {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
            </button>
          </div>

          {/* Interactive Waveform Display */}
          <div className="waveform-container" onClick={handleSeek}>
            <div
              className="waveform-playhead"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div className="waveform-bars">
              {waveformPeaks.length > 0
                ? waveformPeaks.map((peak, idx) => {
                    const isPassed = idx / waveformPeaks.length <= currentTime / (duration || 1);
                    return (
                      <div
                        key={idx}
                        className={`waveform-bar ${isPassed ? 'passed' : ''}`}
                        style={{ height: `${Math.max(12, peak * 100)}%` }}
                      />
                    );
                  })
                : Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{ height: `${Math.sin(i * 0.2) * 35 + 40}%` }}
                    />
                  ))}
            </div>
          </div>

          <div className="deck-footer">
            <span className="time-display font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="audio-equalizer-strip">
              <div className="volume-slider-group">
                <Volume2 size={16} />
                <label>Audio Gain:</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={audioBoost}
                  onChange={(e) => setAudioBoost(parseInt(e.target.value))}
                />
                <span className="boost-val font-mono">{audioBoost}%</span>
              </div>
            </div>
          </div>

          {/* AI Audio Stem & Transient Breakdown */}
          <div className="audio-stems-card">
            <div className="stem-item">
              <div className="stem-icon-dot kick-dot" />
              <div>
                <span className="stem-name">808 Sub-Bass & Kick Drops</span>
                <p className="stem-desc">Drives camera shake, zoom pulsations, and particle explosions</p>
              </div>
              <span className="stem-active-pill">ACTIVE</span>
            </div>

            <div className="stem-item">
              <div className="stem-icon-dot vocal-dot" />
              <div>
                <span className="stem-name">Lead Vocals & Formants</span>
                <p className="stem-desc">Drives real-time lip-sync mouth deformation, teeth/jaw, and vocal glow</p>
              </div>
              <span className="stem-active-pill">LIP-SYNC READY</span>
            </div>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Vibes
        </button>
        <button className="btn btn-primary btn-large" onClick={handleNext}>
          Unleash AI Storyboard →
        </button>
      </div>
    </div>
  );
}
