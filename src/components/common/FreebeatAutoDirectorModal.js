import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  CheckCircle,
  Film,
  Mic,
  X,
} from 'lucide-react';
import { CHARACTER_PERSONAS, characterLockEngine } from '../../services/CharacterLockEngine';
import { BUILT_IN_TRACKS, audioEngine } from '../../services/AudioEngine';
import { SongStructureAnalyzer } from '../../services/SongStructureAnalyzer';

export default function FreebeatAutoDirectorModal({
  isOpen,
  onClose,
  onAutoGenerateComplete,
  project,
  initialVideoMode,
}) {
  const [selectedPersonaId, setSelectedPersonaId] = useState('cyber-vocalist');
  const [selectedGenreTrack, setSelectedGenreTrack] = useState('cyberpunk-neon');
  const [videoMode, setVideoMode] = useState(initialVideoMode || 'singing'); // 'singing' | 'storytelling'
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  if (!isOpen) return null;

  const handleRunAutoDirector = async () => {
    setIsGenerating(true);

    try {
      setGenerationStep('Analyzing audio waveform, BPM & beat drops...');
      await new Promise((r) => setTimeout(r, 400));

      const persona = CHARACTER_PERSONAS.find((p) => p.id === selectedPersonaId) || CHARACTER_PERSONAS[0];
      const baseTrack = BUILT_IN_TRACKS.find((t) => t.id === selectedGenreTrack) || BUILT_IN_TRACKS[0];

      setGenerationStep('Detecting song structure (Intro, Verse, Chorus Drop, Outro)...');
      const trackData = audioEngine.createSynthesizedTrack(baseTrack.id);
      const songStructure = SongStructureAnalyzer.analyzeSongStructure(
        trackData.duration,
        trackData.bpm,
        baseTrack.genre
      );
      await new Promise((r) => setTimeout(r, 400));

      setGenerationStep('Locking character identity & facial anchors...');
      characterLockEngine.setPersona(persona.id);
      characterLockEngine.isCharacterLockEnabled = true;
      await new Promise((r) => setTimeout(r, 400));

      setGenerationStep('Assembling Higgsfield camera rigs & beat cut scenes...');
      await new Promise((r) => setTimeout(r, 400));

      const autoProject = {
        ...project,
        artistName: persona.name,
        renderStyle: baseTrack.recommendedLut || 'photoreal',
        rendererEngine: 'ai-neural',
        selectedVideoModel: 'higgsfield_dop',
        selectedStoryGenerator: 'gemini_flash',
        singerImageUrl: persona.avatarUrl,
        leadActor: {
          name: persona.name,
          archetype: persona.role,
          avatarUrl: persona.avatarUrl,
        },
        characterLockPersona: persona,
        isCharacterLockEnabled: true,
        selectedTrackId: baseTrack.id,
        audioTitle: baseTrack.title,
        bpm: trackData.bpm,
        duration: trackData.duration,
        audioBlobUrl: trackData.blobUrl,
        waveformPeaks: trackData.peaks,
        songStructure,
        aspectRatio,
        freebeatMode: videoMode,
        characterPerformance: videoMode === 'singing',
        enableTvBroadcastGraphic: true,
        images: [
          persona.avatarUrl,
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
        ],
        motionMode: 'higgsfield-orbit-360',
        motionIntensity: 100,
        pikaFx: 'pika-strobe',
      };

      setIsGenerating(false);
      onAutoGenerateComplete(autoProject);
      onClose();
    } catch (err) {
      console.error('Auto generation failed:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-amber-400/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto bg-slate-950 text-white">
        <button
          type="button"
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Freebeat 1-Click Auto Director</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40 uppercase">
                AI Fast Track
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Instantly analyze music, lock character identity, and generate a fully synced music video in 1 click.
            </p>
          </div>
        </div>

        {/* 1. CHOOSE CREATION MODE */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
            1. Select AI Video Generation Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVideoMode('singing')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                videoMode === 'singing'
                  ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/30 text-white'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-300 mb-1">
                <Mic className="w-4 h-4" /> Singing Mode (Lip-Sync)
              </div>
              <p className="text-[11px] text-slate-300">
                Avatar performs with phonetic lip-sync, dynamic spotlighting, and camera tracking.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVideoMode('storytelling')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                videoMode === 'storytelling'
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30 text-white'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
                <Film className="w-4 h-4" /> Storytelling Mode
              </div>
              <p className="text-[11px] text-slate-300">
                Builds a multi-scene cinematic story arc matching the track's emotional tension.
              </p>
            </button>
          </div>
        </div>

        {/* 2. CHOOSE CHARACTER LOCK PERSONA */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase text-slate-300">
              2. Lock Character Identity (Anti-Drift)
            </label>
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Character Lock Active
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CHARACTER_PERSONAS.map((p) => {
              const isSelected = selectedPersonaId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPersonaId(p.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400/50 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover mb-1 border border-white/20"
                  />
                  <span className="text-[11px] font-bold truncate w-full">{p.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 truncate w-full">{p.genre.split('/')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CHOOSE MUSIC STYLE / SONG */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
            3. Choose Track & Beat Grid
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUILT_IN_TRACKS.map((t) => {
              const isSelected = selectedGenreTrack === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedGenreTrack(t.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/40 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{t.title}</div>
                  <div className="text-[10px] text-cyan-300 flex items-center justify-between mt-1">
                    <span>{t.bpm} BPM</span>
                    <span>{t.genre.split('/')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CHOOSE ASPECT RATIO */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
            4. Target Video Format & Aspect Ratio
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { ratio: '16:9', label: '16:9 YouTube / 4K' },
              { ratio: '9:16', label: '9:16 TikTok / Reels' },
              { ratio: '1:1', label: '1:1 Spotify Canvas' },
              { ratio: '4:5', label: '4:5 Social Feed' },
            ].map(({ ratio, label }) => {
              const isSelected = aspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{ratio}</div>
                  <div className="text-[9px] text-slate-400 truncate">{label.split(' ')[1]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROGRESS BANNER */}
        {isGenerating && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>{generationStep}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 via-cyan-400 to-fuchsia-500 h-full animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-slate-800 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRunAutoDirector}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-500 hover:from-amber-400 hover:to-blue-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate Full Music Video (1-Click)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
