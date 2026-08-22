import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Palette,
  RefreshCw,
  Film,
} from 'lucide-react';
import {
  characterCreationEngine,
  CHARACTER_ARCHETYPES,
  CHARACTER_EYE_COLORS,
  CHARACTER_HAIR_STYLES,
  CHARACTER_ACCESSORIES,
} from '../../services/CharacterCreationEngine';

import {
  vocalClonerEngine,
  VOCAL_PRESETS,
} from '../../services/VocalClonerEngine';
import { lipSyncEngine } from '../../services/LipSyncEngine';
import '../../styles/CharacterStudio.css';


export default function CharacterStudioView({
  project = {},
  onNavigate = () => {},
  onSelectCharacter = () => {},
}) {
  // Active Tab: 'character' | 'vocal' | 'preview'
  const [activeTab, setActiveTab] = useState('character');

  // Character Creator State
  const [characterName, setCharacterName] = useState(
    project.leadActor?.name || characterCreationEngine.character.name
  );
  const [archetype, setArchetype] = useState(
    project.leadActor?.archetype || characterCreationEngine.character.archetype
  );
  const [skinTone, setSkinTone] = useState(
    project.leadActor?.skinTone || characterCreationEngine.character.skinTone
  );
  const [hairColor, setHairColor] = useState(
    project.leadActor?.hairColor || characterCreationEngine.character.hairColor
  );
  const [hairStyle, setHairStyle] = useState(
    project.leadActor?.hairStyle || characterCreationEngine.character.hairStyle
  );
  const [eyeColor, setEyeColor] = useState(
    project.leadActor?.eyeColor || characterCreationEngine.character.eyeColor
  );
  const [auraColor, setAuraColor] = useState(
    project.leadActor?.auraColor || characterCreationEngine.character.auraColor
  );
  const [accessories, setAccessories] = useState(
    project.leadActor?.accessories || characterCreationEngine.character.accessories
  );

  // Vocal Cloner State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(
    project.vocalPreset || 'celestial-oracle'
  );
  const [testLyric, setTestLyric] = useState(
    'I hear the starlight calling through the cosmic void'
  );
  const [isSinging, setIsSinging] = useState(false);
  const [clonedVocalData, setClonedVocalData] = useState(
    vocalClonerEngine.clonedProfile
  );

  // Live 60 FPS Performance State
  const [currentViseme, setCurrentViseme] = useState({
    viseme: 'REST',
    openness: 0,
    widthScale: 1,
  });

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const recordIntervalRef = useRef(null);

  // Sync state to CharacterCreationEngine
  useEffect(() => {
    characterCreationEngine.updateCharacter({
      name: characterName,
      archetype,
      skinTone,
      hairColor,
      hairStyle,
      eyeColor,
      auraColor,
      accessories,
    });
  }, [
    characterName,
    archetype,
    skinTone,
    hairColor,
    hairStyle,
    eyeColor,
    auraColor,
    accessories,
  ]);

  // Handle Archetype Change with Smart Color Presets
  const handleSelectArchetype = (archId) => {
    setArchetype(archId);
    const archObj = CHARACTER_ARCHETYPES.find((a) => a.id === archId);
    if (archObj) {
      setSkinTone(archObj.defaultSkin);
      setHairColor(archObj.defaultHair);
      setAuraColor(archObj.defaultAura);
      if (archObj.halo) {
        if (!accessories.includes('cosmic-crown')) {
          setAccessories([...accessories, 'cosmic-crown']);
        }
      }
    }
  };

  // Toggle Accessories
  const toggleAccessory = (accId) => {
    if (accessories.includes(accId)) {
      setAccessories(accessories.filter((a) => a !== accId));
    } else {
      setAccessories([...accessories, accId]);
    }
  };

  // Start Mic Recording for Voice Clone
  const handleStartRecord = async () => {
    try {
      await vocalClonerEngine.startMicRecording();
      setIsRecording(true);
      setRecordDuration(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert(`Microphone Error: ${err.message}`);
    }
  };

  // Stop Mic Recording and Clone Voice
  const handleStopRecord = async () => {
    clearInterval(recordIntervalRef.current);
    setIsRecording(false);
    const analysis = await vocalClonerEngine.stopMicRecording();
    setClonedVocalData(analysis);
  };

  // Test Singing Synthesis
  const handleTestSinging = () => {
    setIsSinging(true);
    vocalClonerEngine.synthesizeSingingLyrics(
      testLyric,
      selectedPreset,
      (visemeData) => {
        setCurrentViseme(visemeData);
        if (visemeData.viseme === 'REST') {
          setIsSinging(false);
        }
      }
    );
  };

  // Apply Cloned Character and Vocal Profile to Music Video Project
  const handleApplyToMusicVideo = () => {
    const actorProfile = {
      name: characterName,
      archetype,
      skinTone,
      hairColor,
      hairStyle,
      eyeColor,
      auraColor,
      accessories,
      isProceduralActor: true,
    };

    project.leadActor = actorProfile;
    project.vocalPreset = selectedPreset;
    project.clonedVocal = clonedVocalData;
    project.characterPerformance = true;

    if (onSelectCharacter) {
      onSelectCharacter(actorProfile);
    }
    if (onNavigate) {
      onNavigate('video-studio');
    }
  };

  // 60 FPS Render Loop for the Live Character Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderLoop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const blink = lipSyncEngine.getBlinkFactor(elapsed);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark Cosmic Studio Gradient Background
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        20,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7
      );
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Procedural Character Frame
      characterCreationEngine.renderCharacterFrame(
        ctx,
        canvas.width,
        canvas.height,
        {
          viseme: currentViseme.viseme,
          openness: currentViseme.openness,
          widthScale: currentViseme.widthScale,
          blinkFactor: blink,
          audioMetrics: {
            subBass: isSinging ? 0.6 : 0.1,
            masterEnergy: isSinging ? 0.7 : 0.2,
          },
          elapsed,
        }
      );

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentViseme, isSinging]);

  return (
    <div className="character-studio-container">
      {/* Studio Header */}
      <div className="character-studio-header">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-2xl font-bold">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                AI Character & Vocal Cloner Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 uppercase">
                60 FPS Live Rig
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sculpt your lead singer avatar, clone vocal formant fingerprints, and deploy directly into music videos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={handleApplyToMusicVideo}
          >
            <Film className="w-4 h-4" /> Cast as Lead Singer in Video 🎬
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="character-studio-grid">
        {/* LEFT COLUMN: CHARACTER & VOCAL CONTROLS */}
        <div className="character-studio-sidebar">
          {/* Navigation Sub-Tabs */}
          <div className="studio-tabs-row">
            <button
              type="button"
              className={`studio-tab-btn ${activeTab === 'character' ? 'active' : ''}`}
              onClick={() => setActiveTab('character')}
            >
              <Palette className="w-4 h-4" /> 3D Actor Customizer
            </button>
            <button
              type="button"
              className={`studio-tab-btn ${activeTab === 'vocal' ? 'active' : ''}`}
              onClick={() => setActiveTab('vocal')}
            >
              <Mic className="w-4 h-4" /> AI Vocal Cloner
            </button>
          </div>

          {/* TAB 1: CHARACTER CUSTOMIZER */}
          {activeTab === 'character' && (
            <div className="studio-tab-content space-y-5">
              {/* Actor Name */}
              <div className="control-group">
                <label className="control-label">Lead Singer / Character Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="studio-input"
                  placeholder="e.g. Astraea Nova"
                />
              </div>

              {/* Archetype Selector */}
              <div className="control-group">
                <label className="control-label">Actor Archetype</label>
                <div className="grid grid-cols-1 gap-2">
                  {CHARACTER_ARCHETYPES.map((arch) => {
                    const isSelected = archetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => handleSelectArchetype(arch.id)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10 text-white'
                            : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs">{arch.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{arch.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Color & Style */}
              <div className="grid grid-cols-2 gap-3">
                <div className="control-group">
                  <label className="control-label">Hair Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{hairColor}</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">Aura Glow</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={auraColor}
                      onChange={(e) => setAuraColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{auraColor}</span>
                  </div>
                </div>
              </div>

              {/* Hairstyle */}
              <div className="control-group">
                <label className="control-label">Hairstyle & Rigging</label>
                <div className="grid grid-cols-2 gap-2">
                  {CHARACTER_HAIR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setHairStyle(style.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        hairStyle === style.id
                          ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                          : 'border-white/5 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>


              {/* Eye Color */}
              <div className="control-group">
                <label className="control-label">Eye Iris Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHARACTER_EYE_COLORS.map((eye) => (
                    <button
                      key={eye.id}
                      type="button"
                      onClick={() => setEyeColor(eye.hex)}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                        eyeColor === eye.hex
                          ? 'border-amber-400 bg-amber-400/20 text-white'
                          : 'border-white/5 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: eye.hex }}
                      />
                      {eye.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories & Augments */}
              <div className="control-group">
                <label className="control-label">Cosmic Accessories & Rigging</label>
                <div className="grid grid-cols-1 gap-2">
                  {CHARACTER_ACCESSORIES.map((acc) => {
                    const isChecked = accessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccessory(acc.id)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-900/60 border-white/5 text-slate-400'
                        }`}
                      >
                        <span>{acc.name}</span>
                        <span>{isChecked ? '✓ Active' : '+ Add'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI VOCAL CLONER */}
          {activeTab === 'vocal' && (
            <div className="studio-tab-content space-y-5">
              {/* Mic Recording Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Mic className="w-4 h-4" /> Live Microphone Vocal Cloner
                  </div>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-xs text-rose-400 font-mono animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> REC 00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Record 5 seconds of singing or speaking to clone your harmonic timbre, fundamental frequency, and formant resonance.
                </p>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-2"
                      onClick={handleStartRecord}
                    >
                      <Mic className="w-4 h-4" /> Start Vocal Sample Record
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                      onClick={handleStopRecord}
                    >
                      <Square className="w-4 h-4" /> Stop & Extract Formants
                    </button>
                  )}
                </div>

                {/* Cloned Metrics Readout */}
                {clonedVocalData && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                    <div className="bg-slate-950/60 p-2 rounded-lg text-center">
                      <span className="text-slate-500 block">Pitch (F0)</span>
                      <strong className="text-cyan-400">{clonedVocalData.f0 || 220} Hz</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg text-center">
                      <span className="text-slate-500 block">Formant F1</span>
                      <strong className="text-amber-400">{clonedVocalData.formants?.[0] || 700} Hz</strong>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg text-center">
                      <span className="text-slate-500 block">Formant F2</span>
                      <strong className="text-fuchsia-400">{clonedVocalData.formants?.[1] || 1220} Hz</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Vocal Preset Profiles */}
              <div className="control-group">
                <label className="control-label">Voice Timbre & Autotune Preset</label>
                <div className="grid grid-cols-1 gap-2">
                  {VOCAL_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-amber-400/20 border-amber-400 shadow-md text-white'
                            : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs" style={{ color: isSelected ? preset.color : undefined }}>
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.tagline}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Singing Test Lyric Synthesizer */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
                <label className="control-label">Test Lyric Singing Synthesizer</label>
                <input
                  type="text"
                  value={testLyric}
                  onChange={(e) => setTestLyric(e.target.value)}
                  className="studio-input"
                  placeholder="Enter lyrics for singing preview..."
                />
                <button
                  type="button"
                  onClick={handleTestSinging}
                  disabled={isSinging}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 py-2"
                >
                  {isSinging ? (
                    <>
                      <RefreshCw className="w-4 h-4 spin-icon" /> Singing Lyrics...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-emerald-400" /> Synthesize & Test Singing 🎵
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 60 FPS LIVE CHARACTER PERFORMANCE CANVAS */}
        <div className="character-canvas-column">
          <div className="character-canvas-card">
            <div className="canvas-header">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-400">60 FPS LIVE ACTOR MONITOR</span>
              </div>
              <div className="text-xs text-slate-400">
                Viseme: <strong className="text-amber-400">{currentViseme.viseme}</strong>
              </div>
            </div>

            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={540}
                height={540}
                className="character-live-canvas"
              />
            </div>

            {/* Expression & Viseme Quick-Test Trigger Bar */}
            <div className="p-4 bg-slate-950/80 border-t border-white/10 flex flex-wrap gap-2 justify-between items-center">
              <span className="text-xs font-bold text-slate-400">Manual Viseme Trigger:</span>
              <div className="flex gap-1.5">
                {['REST', 'AA', 'EE', 'OH', 'CONSONANT'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setCurrentViseme({
                        viseme: v,
                        openness: v === 'REST' ? 0.0 : 0.85,
                        widthScale: v === 'EE' ? 1.3 : 1.0,
                      })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      currentViseme.viseme === v
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
