import React from 'react';
import { Flame, Activity } from 'lucide-react';
import { SECTION_COLORS, SECTION_TYPES } from '../../services/SongStructureAnalyzer';

export default function SongStructureTimeline({
  structure,
  currentTime = 0,
  duration = 32,
  onSeek = () => {},
  isCompact = false,
}) {
  if (!structure?.sections || structure.sections.length === 0) {
    return null;
  }

  const sections = structure.sections;
  const currentPct = Math.min(100, Math.max(0, (currentTime / (duration || 32)) * 100));

  return (
    <div className={`song-structure-timeline-card glass-panel p-4 rounded-2xl border border-white/10 ${isCompact ? 'compact' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Music-Aware Song Structure & Beat Drops
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
            {structure.bpm} BPM
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </div>
      </div>

      {/* TIMELINE TRACK BARS */}
      <div className="relative w-full h-10 bg-slate-950/80 rounded-xl overflow-hidden flex border border-white/10">
        {sections.map((section, idx) => {
          const secWidthPct = ((section.end - section.start) / duration) * 100;
          const isSectionActive = currentTime >= section.start && currentTime < section.end;
          const color = SECTION_COLORS[section.type] || '#38bdf8';

          return (
            <button
              key={section.id || idx}
              type="button"
              onClick={() => onSeek(section.start)}
              title={`${section.type} (${section.start}s - ${section.end}s): Energy ${section.energy}%`}
              className={`relative h-full flex flex-col justify-center items-center transition-all cursor-pointer border-r border-slate-900/60 group ${
                isSectionActive ? 'ring-2 ring-white/80 z-10 brightness-125' : 'hover:brightness-110 opacity-85'
              }`}
              style={{
                width: `${secWidthPct}%`,
                backgroundColor: `${color}33`,
              }}
            >
              {/* Energy Level Bar Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 opacity-40 transition-all"
                style={{
                  height: `${section.energy}%`,
                  backgroundColor: color,
                }}
              />

              {/* Section Type Label */}
              <span className="relative z-10 text-[10px] font-extrabold uppercase tracking-tight text-white drop-shadow truncate px-1">
                {section.type === SECTION_TYPES.CHORUS ? '🔥 DROP' : section.type}
              </span>

              {/* Drop Flame Badge */}
              {section.isDrop && (
                <span className="absolute top-1 right-1 text-rose-400 animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}

        {/* Current Time Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-lg shadow-amber-400/80 pointer-events-none z-20 transition-all duration-75"
          style={{ left: `${currentPct}%` }}
        >
          <div className="w-2.5 h-2.5 -ml-[3px] -mt-1 bg-amber-400 rounded-full shadow-md" />
        </div>
      </div>

      {/* ACTIVE SECTION DIRECTORIAL HUD */}
      {!isCompact && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap justify-between items-center gap-2 text-xs">
          {(() => {
            const activeSec = sections.find((s) => currentTime >= s.start && currentTime < s.end) || sections[0];
            return (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Active Section:</span>
                  <span className="px-2 py-0.5 rounded-md font-bold text-white bg-slate-800 border border-white/10 flex items-center gap-1">
                    {activeSec.isDrop && <Flame className="w-3 h-3 text-rose-400" />}
                    {activeSec.type} ({activeSec.energy}% Energy)
                  </span>
                </div>
                <div className="text-slate-400 italic text-[11px] truncate max-w-xs">
                  🎬 {activeSec.cameraDirective}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
