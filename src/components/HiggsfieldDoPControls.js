import React from 'react';
import { 
  Camera, Sun, Gauge, RotateCw, Aperture, Zap, Shield 
} from 'lucide-react';

import { 
  HIGGSFIELD_CAMERA_PATHS, 
  HIGGSFIELD_LENSES, 
  HIGGSFIELD_LIGHTING_RIGS, 
  HIGGSFIELD_VELOCITY_PRESETS 
} from '../data/aiModels';

export default function HiggsfieldDoPControls({
  settings = {},
  onChange = () => {},
  compact = false
}) {
  const currentCameraPath = settings.motionMode || 'higgsfield-orbit-360';
  const currentLens = settings.lensProfile || 'anamorphic-239';
  const currentLighting = settings.lightingRig || 'volumetric-fog';
  const currentVelocity = settings.velocityPreset || 'speed-ramp';
  const motionIntensity = settings.motionIntensity ?? 100;
  const lipSyncSensitivity = settings.lipSyncSensitivity ?? 1.2;

  const handleUpdate = (key, value) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className={`higgsfield-dop-panel glass-panel p-5 rounded-3xl border border-amber-400/30 bg-slate-950/80 space-y-6 ${compact ? 'text-xs' : ''}`}>
      {/* Header with Higgsfield Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-400/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Higgsfield Cinema DoP Studio</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                6-Axis DoP Suite
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Direct multi-axis camera choreography, Hollywood lenses, studio lighting, and velocity physics.
            </p>
          </div>
        </div>

        {/* 120 FPS Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5" /> 60/120 FPS MOTION VECTOR
        </div>
      </div>

      {/* 1. CAMERA PATH DIRECTORY */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Director of Photography Camera Path
          </label>
          <span className="text-[11px] text-slate-400">
            Selected: <strong className="text-amber-300">{HIGGSFIELD_CAMERA_PATHS.find(p => p.id === currentCameraPath)?.name || currentCameraPath}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {HIGGSFIELD_CAMERA_PATHS.map((path) => {
            const isSelected = currentCameraPath === path.id;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => handleUpdate('motionMode', path.id)}
                className={`p-3 rounded-2xl text-left flex flex-col justify-between transition-all border ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 shadow-lg shadow-amber-400/20 text-white'
                    : 'bg-slate-900/70 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="text-xl mb-1">{path.icon}</div>
                <div>
                  <div className="font-bold text-xs leading-snug">{path.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{path.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. LENSES & OPTICS + STUDIO LIGHTING (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LENSES */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5">
          <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Aperture className="w-3.5 h-3.5 text-cyan-400" /> Cinematic Lens & Optical Profile
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HIGGSFIELD_LENSES.map((lens) => {
              const isSelected = currentLens === lens.id;
              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => handleUpdate('lensProfile', lens.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{lens.name}</div>
                  <div className="text-[10px] text-slate-400">{lens.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* LIGHTING RIGS */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Studio Lighting Rig
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HIGGSFIELD_LIGHTING_RIGS.map((rig) => {
              const isSelected = currentLighting === rig.id;
              return (
                <button
                  key={rig.id}
                  type="button"
                  onClick={() => handleUpdate('lightingRig', rig.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-white font-bold'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold" style={{ color: isSelected ? rig.color : undefined }}>
                    {rig.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{rig.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MOTION VELOCITY & ACTOR RIGGING SLIDERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Motion Velocity Presets & Intensity */}
        <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-fuchsia-400" /> Velocity Curve & Physics
            </label>
            <span className="text-xs font-mono font-bold text-fuchsia-300">{motionIntensity}%</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {HIGGSFIELD_VELOCITY_PRESETS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleUpdate('velocityPreset', v.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left truncate ${
                  currentVelocity === v.id
                    ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200 font-bold'
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="30"
            max="200"
            value={motionIntensity}
            onChange={(e) => handleUpdate('motionIntensity', parseInt(e.target.value))}
            className="w-full accent-fuchsia-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Character Consistency & Actor Rigging */}
        <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Actor Consistency & Lip-Sync
            </label>
            <span className="text-xs font-mono font-bold text-emerald-300">{lipSyncSensitivity.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdate('characterPerformance', !settings.characterPerformance)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                settings.characterPerformance !== false
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-950/40 border-white/5 text-slate-500'
              }`}
            >
              {settings.characterPerformance !== false ? '✓ Actor Facial Lock Active' : '✕ Actor Performance Off'}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Viseme Sensitivity</span>
              <span>Smooth Mouth Tracking</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={lipSyncSensitivity}
              onChange={(e) => handleUpdate('lipSyncSensitivity', parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
