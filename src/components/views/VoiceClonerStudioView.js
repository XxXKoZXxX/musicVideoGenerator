import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Sparkles,
  Volume2,
  Sliders,
  Download,
  CheckCircle,
  RefreshCw,
  Wand2,
  Film,
  Music,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import {
  vocalClonerEngine,
  VOCAL_PRESETS,
} from '../../services/VocalClonerEngine';
import '../../styles/CharacterStudio.css';

export default function VoiceClonerStudioView({
  project = {},
  onNavigate = () => {},
  onApplyVocalToProject = () => {},
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(
    project.vocalPreset || 'celestial-oracle'
  );
  const [testLyric, setTestLyric] = useState(
    'I hear the starlight calling through the neon night'
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [clonedVocalData, setClonedVocalData] = useState(
    vocalClonerEngine.clonedProfile
  );
  const [pitchShift, setPitchShift] = useState(0);
  const [vocalSpeed, setVocalSpeed] = useState(1.0);
  const [vocalVibrato, setVocalVibrato] = useState(5.5);
  const [vocalBrightness, setVocalBrightness] = useState(1.2);
  const [audioUrl, setAudioUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const recordIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawVisualizer = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      const numBars = 48;
      const barWidth = canvas.width / numBars - 2;

      ctx.save();
      for (let i = 0; i < numBars; i++) {
        const time = Date.now() * 0.003;
        const wave = isPlayingPreview || isRecording || isSynthesizing
          ? Math.sin(time + i * 0.25) * 0.5 + 0.5
          : 0.15 + Math.sin(time * 0.5 + i * 0.1) * 0.08;

        const barHeight = wave * (canvas.height * 0.8);
        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(drawVisualizer);
    };

    drawVisualizer();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingPreview, isRecording, isSynthesizing]);

  // Handle Live Microphone Recording for Voice Clone
  const handleToggleRecording = async () => {
    if (isRecording) {
      clearInterval(recordIntervalRef.current);
      setIsRecording(false);
      setStatusMessage('Extracting vocal formants & cloning acoustic timbre...');
      try {
        const profile = await vocalClonerEngine.stopRecordingAndClone();
        setClonedVocalData(profile);
        setStatusMessage('✨ Voice successfully cloned! Ready to synthesize singing.');
      } catch (err) {
        setStatusMessage('Cloning error: ' + err.message);
      }
    } else {
      try {
        setStatusMessage('Listening to vocal frequencies (speak or sing for 3-5 seconds)...');
        await vocalClonerEngine.startRecording();
        setIsRecording(true);
        setRecordDuration(0);
        recordIntervalRef.current = setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        setStatusMessage('Microphone access error: ' + err.message);
      }
    }
  };

  // Handle Custom Audio File Upload for Voice Clone
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(`Analyzing "${file.name}" vocal harmonics...`);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const profile = await vocalClonerEngine.cloneFromBuffer(audioBuffer, file.name);
      setClonedVocalData(profile);
      setAudioUrl(URL.createObjectURL(file));
      setStatusMessage(`✨ Voice cloned from "${file.name}"! Fundamental: ${Math.round(profile.f0)} Hz`);
    } catch (err) {
      setStatusMessage('Audio decoding error: ' + err.message);
    }
  };

  // Synthesize Test Vocal Phrase
  const handleSynthesizeVocal = async () => {
    setIsSynthesizing(true);
    setIsPlayingPreview(true);
    setStatusMessage('Synthesizing neural vocal timbre...');

    try {
      await vocalClonerEngine.synthesizeVocalPhrase(testLyric, selectedPreset, {
        pitchShift,
        speed: vocalSpeed,
        vibratoRate: vocalVibrato,
        timbreBrightness: vocalBrightness,
      });
      setStatusMessage('✨ Singing performance rendered successfully!');
    } catch (err) {
      setStatusMessage('Synthesis error: ' + err.message);
    } finally {
      setIsSynthesizing(false);
      setTimeout(() => setIsPlayingPreview(false), 3000);
    }
  };

  // Apply Cloned Voice to Video Project
  const handleApplyToVideoStudio = () => {
    if (onApplyVocalToProject) {
      onApplyVocalToProject({
        clonedVocal: clonedVocalData,
        vocalPreset: selectedPreset,
        testLyric,
      });
    }
    onNavigate('wizard');
  };

  return (
    <div className="vocal-cloner-studio-page">
      {/* HEADER */}
      <div className="view-header glass-panel flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="view-title flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/40 rounded-2xl shadow-lg shadow-fuchsia-500/10">
            <Mic className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Voice Cloner & Vocal Synthesizer
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO DSP ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Clone any singing voice or speech sample with formant matching & zero cloud costs
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyToVideoStudio}
            className="btn btn-primary-glow text-xs flex items-center gap-2"
          >
            <Film className="w-4 h-4" /> Use Voice in Video Studio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: VOICE CLONER & SAMPLE INPUT (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* MICROPHONE & AUDIO UPLOAD CARD */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              1. Capture or Upload Voice Sample
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Speak or sing for 3-5 seconds. Our local formant engine captures your pitch, timbre, and harmonic brightness.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleToggleRecording}
                className={`py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 fill-current" /> Stop & Clone ({recordDuration}s)
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> Record Microphone Sample
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 font-semibold my-1">OR</div>

              <label className="py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                Upload Vocal Audio (MP3 / WAV)
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* STATUS / NOTIFICATION BADGE */}
            {statusMessage && (
              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* EXTRACTED ACOUSTIC PROFILE CARD */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              2. Extracted Vocal Formants
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Fundamental Pitch (F0)</span>
                <span className="font-bold text-cyan-400 text-sm">{Math.round(clonedVocalData.f0 || 220)} Hz</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Timbre Brightness</span>
                <span className="font-bold text-fuchsia-400 text-sm">{(clonedVocalData.timbreBrightness || 1.2).toFixed(2)}x</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Formant F1 / F2</span>
                <span className="font-bold text-amber-400 text-sm">{clonedVocalData.formants ? `${clonedVocalData.formants[0]} / ${clonedVocalData.formants[1]} Hz` : '700 / 1220 Hz'}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Natural Vibrato</span>
                <span className="font-bold text-emerald-400 text-sm">{clonedVocalData.vibratoRate || 5.5} Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRESETS, DSP TUNING & LIVE SYNTHESIZER (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* VOCAL PRESET STYLE SELECTOR */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              3. Vocal DSP Style & FX Rig
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {VOCAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedPreset === preset.id
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-1">{preset.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{preset.tagline}</div>
                </button>
              ))}
            </div>

            {/* DSP FINE TUNING SLIDERS */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Pitch Shift (Semitones)
                </span>
                <span className="font-mono text-cyan-400 font-bold">{pitchShift > 0 ? `+${pitchShift}` : pitchShift} st</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchShift}
                onChange={(e) => setPitchShift(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-fuchsia-400" /> Timbre Brightness / Formant Lift
                </span>
                <span className="font-mono text-fuchsia-400 font-bold">{vocalBrightness.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={vocalBrightness}
                onChange={(e) => setVocalBrightness(Number(e.target.value))}
                className="w-full accent-fuchsia-400"
              />

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> Vibrato Speed (Hz)
                </span>
                <span className="font-mono text-amber-400 font-bold">{vocalVibrato.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="9.0"
                step="0.1"
                value={vocalVibrato}
                onChange={(e) => setVocalVibrato(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* LIVE SYNTHESIS & WAVEFORM PLAYER */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              4. Live Vocal Phrase Synthesizer
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={testLyric}
                onChange={(e) => setTestLyric(e.target.value)}
                placeholder="Enter song lyrics or vocal phrase..."
                className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSynthesizeVocal}
                disabled={isSynthesizing}
                className="btn btn-primary-glow px-6 text-xs font-bold flex items-center gap-2"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Singing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Sing Phrase
                  </>
                )}
              </button>
            </div>

            {/* REAL-TIME AUDIO WAVEFORM CANVAS */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <canvas
                ref={canvasRef}
                width={560}
                height={100}
                className="w-full h-24 block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
