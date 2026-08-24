import React, { useState, useRef } from 'react';
import {
  Music,
  User,
  Palette,
  Camera,
  Cpu,
  Upload,
  Link,
  Zap,
  Sliders,
  CheckCircle,
  FolderOpen,
} from 'lucide-react';
import { BUILT_IN_TRACKS, audioEngine } from '../../services/AudioEngine';
import { CHARACTER_PERSONAS } from '../../services/CharacterLockEngine';
import { RENDER_STYLES } from '../../services/RenderStyles';
import { AI_VIDEO_MODELS } from '../../data/aiModels';
import { ExternalAudioImportService } from '../../services/ExternalAudioImportService';
import { SongStructureAnalyzer } from '../../services/SongStructureAnalyzer';

export default function StudioInspectorPanel({
  project,
  onUpdateProject = () => {},
  onLoadAudioTrack = () => {},
  onOpenFeatureModal = () => {},
}) {
  const [activeTab, setActiveTab] = useState('audio');
  const [externalUrl, setExternalUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const fileInputRef = useRef(null);

  // Handle URL import (Suno / Udio / Spotify / YouTube / direct link)
  const handleExternalImport = async () => {
    if (!externalUrl.trim()) return;
    setIsImporting(true);
    setImportStatus(null);

    try {
      const result = await ExternalAudioImportService.importAudioFromUrl(externalUrl);
      onLoadAudioTrack(result);
      onUpdateProject({
        audioTitle: result.title,
        bpm: result.bpm,
        duration: result.duration,
        songStructure: result.structure,
        audioBlobUrl: result.blobUrl,
        waveformPeaks: result.peaks,
      });
      setImportStatus({
        type: 'success',
        message: `Successfully imported "${result.title}" (${result.bpm} BPM)!`,
      });
      setExternalUrl('');
    } catch (e) {
      console.error('Import error:', e);
      setImportStatus({
        type: 'error',
        message: 'Could not parse audio link. Please try a valid MP3/WAV link or file upload.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle local user file upload (MP3, WAV, FLAC, M4A, etc.)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus(null);

    try {
      const audioData = await audioEngine.loadUserAudio(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      const structure = SongStructureAnalyzer.analyzeSongStructure(
        audioData.duration,
        audioData.bpm,
        project.renderStyle || 'photoreal'
      );

      const trackPayload = {
        title,
        bpm: audioData.bpm,
        duration: audioData.duration,
        blobUrl: audioData.blobUrl,
        peaks: audioData.peaks,
        structure,
      };

      onLoadAudioTrack(trackPayload);
      onUpdateProject({
        audioTitle: title,
        bpm: audioData.bpm,
        duration: audioData.duration,
        audioBlobUrl: audioData.blobUrl,
        waveformPeaks: audioData.peaks,
        songStructure: structure,
      });

      setImportStatus({
        type: 'success',
        message: `Loaded "${title}" (${audioData.duration}s · ${audioData.bpm} BPM)!`,
      });
    } catch (err) {
      console.error('File upload failed:', err);
      setImportStatus({
        type: 'error',
        message: 'Failed to decode audio file. Please upload standard MP3, WAV, or AAC audio.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Native Electron Audio Picker if available
  const handleSelectElectronAudio = async () => {
    if (window.electron?.selectAudio) {
      const filePath = await window.electron.selectAudio();
      if (filePath) {
        try {
          const dataUrl = await window.electron.readFileAsDataUrl(filePath);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const audioData = await audioEngine.loadUserAudio(blob);
          const fileName = filePath.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, '') || 'Custom Audio';
          const structure = SongStructureAnalyzer.analyzeSongStructure(
            audioData.duration,
            audioData.bpm,
            project.renderStyle || 'photoreal'
          );

          onLoadAudioTrack({
            title: fileName,
            bpm: audioData.bpm,
            duration: audioData.duration,
            blobUrl: dataUrl,
            peaks: audioData.peaks,
            structure,
          });

          onUpdateProject({
            audioTitle: fileName,
            bpm: audioData.bpm,
            duration: audioData.duration,
            audioBlobUrl: dataUrl,
            waveformPeaks: audioData.peaks,
            songStructure: structure,
          });

          setImportStatus({
            type: 'success',
            message: `Loaded "${fileName}"!`,
          });
        } catch (e) {
          console.error(e);
        }
      }
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <aside className="studio-inspector">
      {/* QUICK LAUNCH: HOT & FREE FEATURES SUITE */}
      <div className="p-2.5 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border-b border-white/10 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenFeatureModal('music_video')}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 rounded-lg text-[10px] font-bold text-rose-200 flex items-center gap-1 shrink-0"
            title="Music Video Generator (Hot)"
          >
            <span>🔥 Music Video</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenFeatureModal('ai_video')}
            className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-lg text-[10px] font-bold text-cyan-200 flex items-center gap-1 shrink-0"
            title="AI Text/Image to Video (Hot)"
          >
            <span>⚡ AI Video</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenFeatureModal('dance')}
            className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-lg text-[10px] font-bold text-purple-200 flex items-center gap-1 shrink-0"
            title="Dance Animation (Beta)"
          >
            <span>💃 Dance</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenFeatureModal('stock_media')}
            className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-[10px] font-bold text-blue-200 flex items-center gap-1 shrink-0"
            title="100k+ Stock Media (Free)"
          >
            <span>🎁 Stock (100k)</span>
          </button>
        </div>
      </div>

      {/* INSPECTOR TABS */}
      <div className="inspector-nav-tabs">
        <button
          type="button"
          className={`inspector-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Music className="w-4 h-4" />
          <span>Audio/Stems</span>
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeTab === 'actor' ? 'active' : ''}`}
          onClick={() => setActiveTab('actor')}
        >
          <User className="w-4 h-4" />
          <span>Actor Lock</span>
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          <Palette className="w-4 h-4" />
          <span>Styles</span>
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <Camera className="w-4 h-4" />
          <span>Camera FX</span>
        </button>
        <button
          type="button"
          className={`inspector-tab-btn ${activeTab === 'engine' ? 'active' : ''}`}
          onClick={() => setActiveTab('engine')}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Engine</span>
        </button>
      </div>

      {/* INSPECTOR CONTENT PANELS */}
      <div className="inspector-tab-content space-y-4">
        {/* ======================================================== */}
        {/* TAB 1: AUDIO & STEM SEPARATION & UPLOAD */}
        {/* ======================================================== */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {/* 1. LOCAL AUDIO FILE UPLOADER */}
            <div className="p-3 bg-gradient-to-r from-cyan-950/40 to-slate-900/80 rounded-xl border border-cyan-500/30">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Local Audio (MP3/WAV/M4A)</span>
                </span>
              </h4>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleSelectElectronAudio}
                disabled={isImporting}
                className="w-full py-2.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl text-cyan-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <FolderOpen className="w-4 h-4 text-cyan-300" />
                <span>{isImporting ? 'Decoding Audio...' : 'Choose MP3 / WAV Song File'}</span>
              </button>
            </div>

            {/* 2. EXTERNAL URL INGESTION */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-cyan-400" />
                <span>Import Suno / Udio / Spotify / YouTube</span>
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Suno, Udio, Spotify, or audio link..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExternalImport()}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleExternalImport}
                  disabled={isImporting || !externalUrl.trim()}
                  className="px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1"
                >
                  {isImporting ? '...' : 'Import'}
                </button>
              </div>
            </div>

            {/* STATUS NOTIFICATION */}
            {importStatus && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {importStatus.message}
              </div>
            )}

            {/* 3. SOUNDTRACK LIBRARY */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Curated Soundtrack Library
              </h4>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {BUILT_IN_TRACKS.map((track) => {
                  const isSelected = (project?.selectedTrackId || 'cyberpunk-neon') === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        const trackData = audioEngine.createSynthesizedTrack(track.id);
                        const structure = SongStructureAnalyzer.analyzeSongStructure(
                          trackData.duration,
                          trackData.bpm,
                          track.genre
                        );
                        onLoadAudioTrack({
                          title: track.title,
                          bpm: trackData.bpm,
                          duration: trackData.duration,
                          blobUrl: trackData.blobUrl,
                          peaks: trackData.peaks,
                          structure,
                        });
                        onUpdateProject({
                          selectedTrackId: track.id,
                          audioTitle: track.title,
                          bpm: track.bpm,
                          duration: track.duration,
                          audioBlobUrl: trackData.blobUrl,
                          waveformPeaks: trackData.peaks,
                          songStructure: structure,
                        });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{track.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {track.genre} · {track.bpm} BPM · {track.duration}s
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stem Levels Simulation */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" /> AI Stem Separator Levels
              </h4>
              <div className="space-y-1.5 text-[10px] text-slate-400">
                <div className="flex justify-between">
                  <span>Lead Vocals:</span> <span className="text-cyan-300">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Kick & Drums (Beat Sync):</span> <span className="text-emerald-300">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sub-Bass & Synths:</span> <span className="text-purple-300">95%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ACTOR & CHARACTER IDENTITY LOCK */}
        {/* ======================================================== */}
        {activeTab === 'actor' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-400/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-300">Character Face Lock (Anti-Drift)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold">LOCKED</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Guarantees zero facial morphing across all camera cut scenes.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Curated Performer Archetypes
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {CHARACTER_PERSONAS.map((persona) => {
                  const isSelected = (project?.characterLockPersona?.id || 'cyber-vocalist') === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => onUpdateProject({ characterLockPersona: persona })}
                      className={`p-2 rounded-xl border cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={persona.avatarUrl}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full object-cover border border-amber-400/50"
                      />
                      <div className="font-bold text-[11px] text-slate-200 line-clamp-1">{persona.name}</div>
                      <div className="text-[9px] text-amber-300/80">{persona.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Face Anchor Upload */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
              <label className="cursor-pointer block">
                <Upload className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                <span className="text-xs font-bold text-slate-300 block">Upload Custom Face Anchor</span>
                <span className="text-[10px] text-slate-500 block">PNG/JPG lead actor reference</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        onUpdateProject({
                          customFaceAnchor: evt.target.result,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ART DIRECTION & CINEMA LUTS */}
        {/* ======================================================== */}
        {activeTab === 'style' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              12 Cinema Art Directions
            </h4>
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {RENDER_STYLES.map((style) => {
                const isSelected = (project?.renderStyle || 'photoreal') === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => onUpdateProject({ renderStyle: style.id })}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-fuchsia-500/15 border-fuchsia-400 text-white'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{style.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-fuchsia-300">
                          {style.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{style.description}</div>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-fuchsia-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CAMERA RIG & PIKA BEAT FX */}
        {/* ======================================================== */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Higgsfield DoP Cinematic Camera Rigs</span>
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'higgsfield-orbit-360', name: '360° Hyper Orbit' },
                  { id: 'higgsfield-dolly-zoom', name: 'Vertigo Dolly Zoom' },
                  { id: 'bullet-time-3d', name: '3D Bullet Time' },
                  { id: 'fpv-drone-dive', name: 'FPV Action Drone' },
                  { id: 'crash-zoom-in', name: 'Beat Crash Zoom' },
                  { id: 'slow-cinematic-pan', name: 'Slow Anamorphic Pan' },
                ].map((cam) => {
                  const isSelected = (project?.motionMode || 'higgsfield-orbit-360') === cam.id;
                  return (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => onUpdateProject({ motionMode: cam.id })}
                      className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cam.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Pika 2.0 Beat Drop FX</span>
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'pika-melt', name: 'Melt & Liquify' },
                  { id: 'pika-explode', name: 'Explode Transients' },
                  { id: 'pika-strobe', name: 'Strobe Flash' },
                  { id: 'pika-squish', name: 'Bass Squish & Bounce' },
                  { id: 'pika-glitch', name: 'Cyber Glitch' },
                  { id: 'pika-dissolve', name: 'Neon Dissolve' },
                ].map((fx) => {
                  const isSelected = (project?.pikaFx || 'pika-strobe') === fx.id;
                  return (
                    <button
                      key={fx.id}
                      type="button"
                      onClick={() => onUpdateProject({ pikaFx: fx.id })}
                      className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fx.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cut Pacing / Beat Sync Density */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Cut Pacing / Beat Sync Density</span>
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { beats: 4, name: '4 Beats · Tight Cuts' },
                  { beats: 8, name: '8 Beats · Fast' },
                  { beats: 16, name: '16 Beats · Balanced' },
                  { beats: 32, name: '32 Beats · Cinematic' },
                  { beats: 64, name: '64 Beats · Sustained' },
                ].map((pace) => {
                  const isSelected = (project?.pacingBeatsPerCut || 4) === pace.beats;
                  return (
                    <button
                      key={pace.beats}
                      type="button"
                      onClick={() => onUpdateProject({ pacingBeatsPerCut: pace.beats })}
                      className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pace.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Motion Intensity:</span>
                <span className="font-bold text-cyan-400">{project?.motionIntensity || 100}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={project?.motionIntensity || 100}
                onChange={(e) => onUpdateProject({ motionIntensity: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: AI ENGINE BACKEND */}
        {/* ======================================================== */}
        {activeTab === 'engine' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Top Video Generation Models
            </h4>
            <div className="space-y-1.5">
              {AI_VIDEO_MODELS.map((model) => {
                const isSelected = (project?.selectedVideoModel || 'higgsfield_dop') === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => onUpdateProject({ selectedVideoModel: model.id })}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 text-white'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{model.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                          {model.latency}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{model.description}</div>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
