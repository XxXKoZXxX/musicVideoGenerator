import React, { useRef } from 'react';
import {
  Film,
  User,
  Music,
  Zap,
  Type,
  Plus,
  Flame,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { SECTION_COLORS } from '../../services/SongStructureAnalyzer';

export default function MultiTrackTimeline({
  project,
  songStructure,
  currentTime = 0,
  duration = 32,
  onSeek = () => {},
  onAddScene = () => {},
  onReorderScene = () => {},
  onRemoveScene = () => {},
}) {
  const lanesRef = useRef(null);

  const handleLaneClick = (e) => {
    if (!lanesRef.current) return;
    const rect = lanesRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(progress * (duration || 32));
  };

  const images = project?.images || [];
  const scenesCount = Math.max(images.length, 1);
  const sceneDuration = duration / scenesCount;
  const playheadPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const sections = songStructure?.sections || [
    { name: 'Intro', start: 0, end: duration * 0.2, isDrop: false },
    { name: 'Verse 1', start: duration * 0.2, end: duration * 0.45, isDrop: false },
    { name: '🔥 CHORUS / DROP', start: duration * 0.45, end: duration * 0.8, isDrop: true },
    { name: 'Outro', start: duration * 0.8, end: duration, isDrop: false },
  ];

  return (
    <div className="studio-bottom-timeline">
      {/* TIMELINE TOP BAR */}
      <div className="timeline-header-bar">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Track Timeline & Beat Grid</span>
          </span>
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-mono">
            {project?.bpm || 128} BPM · 4/4 Time
          </span>
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
            {sections.filter((s) => s.isDrop).length} Drops Detected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-[10px] font-bold flex items-center gap-1"
            onClick={onAddScene}
          >
            <Plus className="w-3 h-3" /> Add Scene
          </button>
        </div>
      </div>

      {/* TRACKS & LANES WORKSPACE */}
      <div className="timeline-tracks-container">
        {/* Left Track Names */}
        <div className="timeline-track-headers">
          <div className="track-header-row">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>V1 Video Clips</span>
          </div>
          <div className="track-header-row">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>V2 Actor/Lip-Sync</span>
          </div>
          <div className="track-header-row">
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>A1 Audio Master</span>
          </div>
          <div className="track-header-row">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>FX Beat Drops</span>
          </div>
          <div className="track-header-row">
            <Type className="w-3.5 h-3.5 text-purple-400" />
            <span>T1 Subtitles</span>
          </div>
        </div>

        {/* Right Timeline Lanes (Click to seek) */}
        <div
          className="timeline-lanes cursor-pointer"
          ref={lanesRef}
          onClick={handleLaneClick}
        >
          {/* Draggable Playhead */}
          <div
            className="timeline-scrub-playhead"
            style={{ left: `${playheadPercent}%` }}
          />

          {/* TRACK 1: Video Scene Clips */}
          <div className="track-lane-row bg-slate-950/40">
            {images.map((imgUrl, idx) => {
              const startPct = (idx * sceneDuration / duration) * 100;
              const widthPct = (sceneDuration / duration) * 100;
              return (
                <div
                  key={idx}
                  className="scene-clip-block"
                  style={{
                    left: `${startPct}%`,
                    width: `calc(${widthPct}% - 4px)`,
                    borderColor: '#38bdf8',
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`scene-${idx}`}
                    className="w-5 h-5 rounded object-cover"
                  />
                  <span>Scene {idx + 1} ({sceneDuration.toFixed(1)}s)</span>

                  <div className="scene-clip-controls">
                    <button
                      type="button"
                      className="scene-move-btn"
                      disabled={idx === 0}
                      title="Move Left"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderScene(idx, idx - 1);
                      }}
                    >
                      <ChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      className="scene-move-btn"
                      disabled={idx === images.length - 1}
                      title="Move Right"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderScene(idx, idx + 1);
                      }}
                    >
                      <ChevronRight size={10} />
                    </button>
                    <button
                      type="button"
                      className="scene-remove-btn"
                      title="Remove Scene"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveScene(idx);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TRACK 2: Character Actor & Lip-Sync */}
          <div className="track-lane-row bg-slate-900/30">
            <div
              className="timeline-block size-md actor-track-block"
              style={{ left: '0%', width: '100%' }}
            >
              <User className="w-3 h-3 text-amber-400" />
              <span>
                {project?.characterLockPersona?.name || 'Nyx Shadowcore'} · Lip-Sync & Formant Active
              </span>
            </div>
          </div>

          {/* TRACK 3: Audio Waveform & Song Structure */}
          <div className="track-lane-row bg-slate-950/60 flex items-center gap-1 px-1">
            {sections.map((sec, idx) => {
              const startPct = ((sec.start || 0) / duration) * 100;
              const widthPct = (((sec.end || duration) - (sec.start || 0)) / duration) * 100;
              const color = SECTION_COLORS[sec.type] || '#38bdf8';
              return (
                <div
                  key={idx}
                  className="timeline-block size-md section-track-block"
                  style={{
                    left: `${startPct}%`,
                    width: `calc(${widthPct}% - 3px)`,
                    background: sec.isDrop
                      ? 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)'
                      : color,
                    border: `1px solid ${sec.isDrop ? '#fda4af' : color}`,
                  }}
                >
                  <span className="truncate">{sec.name}</span>
                  {sec.isDrop && <Flame className="w-3 h-3 text-yellow-200 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* TRACK 4: Beat Drop FX & Shakes */}
          <div className="track-lane-row bg-slate-900/20">
            {sections.filter((s) => s.isDrop).map((drop, idx) => {
              const startPct = ((drop.start || 0) / duration) * 100;
              const widthPct = (((drop.end || duration) - (drop.start || 0)) / duration) * 100;
              return (
                <div
                  key={idx}
                  className="timeline-block size-sm fx-track-block"
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                >
                  <Zap className="w-2.5 h-2.5 text-yellow-300" />
                  <span>Strobe + Camera Shake Pulse</span>
                </div>
              );
            })}
          </div>

          {/* TRACK 5: Kinetic Lyrics / Subtitles */}
          <div className="track-lane-row bg-slate-950/40">
            <div
              className="timeline-block size-sm lyrics-track-block"
              style={{ left: '0%', width: '100%' }}
            >
              <Type className="w-2.5 h-2.5 text-purple-400" />
              <span>Kinetic Neon Lyric Word-by-Word Subtitles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
