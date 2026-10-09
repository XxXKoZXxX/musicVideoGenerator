// src/components/views/AIDirectorView.js — "Original AI Video" studio.
// Paste lyrics → the AI Director composes an original soundtrack (or uses your
// upload), paints every video frame procedurally, and burns kinetic lyrics —
// a fully original music video, no stock footage, no external APIs.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, Wand2, Square, Download, Music, Mic2, Film,
  Gauge, Palette, Type, Ratio, Loader2, CheckCircle2, AlertTriangle,
  Terminal, RefreshCw, Music4, Eye, Users,
} from 'lucide-react';
import {
  previewAnalysis,
  createOriginalVideo,
  subscribeToJob,
  cancelOriginalVideo,
  fileToDataUri,
} from '../../services/AIDirectorService';
import '../../styles/AIDirectorView.css';

const GENRES = [
  { id: '', label: 'Auto-detect', hint: 'AI reads your lyrics' },
  { id: 'pop', label: 'Pop' },
  { id: 'edm', label: 'EDM' },
  { id: 'trap', label: 'Trap' },
  { id: 'lofi', label: 'Lo-Fi' },
  { id: 'rock', label: 'Rock' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'synthwave', label: 'Synthwave' },
  { id: 'rnb', label: 'R&B' },
];

const CAPTION_STYLES = [
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'kinetic', label: 'Kinetic Pop' },
  { id: 'impact', label: 'Impact Rap' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'off', label: 'No Lyrics' },
];

const AI_MODELS = [
  { id: 'procedural', label: 'Original engine', hint: 'offline, always works' },
  { id: 'happyhorse', label: 'HappyHorse AI video', hint: 'real AI footage · needs CLI' },
];

const STORY_MODES = [
  { id: 'story', label: 'Story + lip-sync', hint: 'cast & narrative' },
  { id: 'performance', label: 'Performance', hint: 'artist closeups' },
  { id: 'visuals-only', label: 'Visuals only', hint: 'no cast' },
];

const CAST_SIZES = [
  { id: 'auto', label: 'Auto cast', hint: 'fits the song' },
  { id: 'solo', label: 'Solo artist', hint: 'one lead' },
  { id: 'duo', label: 'Duo', hint: 'two leads' },
];

const RATIOS = [
  { id: '16:9', label: '16:9', hint: 'YouTube' },
  { id: '9:16', label: '9:16', hint: 'Shorts/TikTok' },
  { id: '1:1', label: '1:1', hint: 'Feed' },
];

const QUALITIES = [
  { id: 'standard', label: '720p', hint: 'fast' },
  { id: 'master', label: '1080p', hint: 'master' },
  { id: 'draft', label: '480p', hint: 'draft' },
];

const SAMPLE_LYRICS = `[Verse]
City lights are calling out my name
Midnight rain on neon streets tonight
Every shadow knows the words I hide

[Chorus]
We are electric, we are the fire
Burning like stars in a wireless sky
Dancing forever, hearts on a wire
We are electric, never gonna die

[Verse 2]
Ocean waves are whispering your dream
Moon above the water shines so deep

[Chorus]
We are electric, we are the fire
Burning like stars in a wireless sky

[Bridge]
Hold me closer, don't let go

[Outro]
We are electric`;

const DEFAULT_PROJECT = {
  lyrics: '',
  title: '',
  artistName: '',
  genre: '',
  mood: '',
  aspectRatio: '16:9',
  quality: 'standard',
  captionStyle: 'karaoke',
  storyMode: 'story',
  castSize: 'auto',
  aiModel: 'procedural',
  autoTrack: true,
  audioFile: null,
  audioName: '',
  duration: 60,
  filmGrain: true,
};

let _hhCache;
async function fetchHappyHorseStatus() {
  if (!_hhCache) {
    _hhCache = fetch('/api/happyhorse/status').then((r) => r.json()).catch(() => ({ available: false }));
  }
  return _hhCache;
}

export default function AIDirectorView({ project, onNavigate, onApplyToProject }) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_PROJECT,
    lyrics: (project && project.lyrics) || '',
    title: (project && project.audioTitle) || '',
    artistName: (project && project.artistName) || '',
  }));
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hhAvailable, setHhAvailable] = useState(null); // null = unknown
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const unsubRef = useRef(null);
  const audioInputRef = useRef(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  // One-shot HappyHorse CLI detection for the Engine control hint
  useEffect(() => {
    let alive = true;
    fetchHappyHorseStatus().then((s) => { if (alive) setHhAvailable(Boolean(s.available)); });
    return () => { alive = false; };
  }, []);

  // Debounced live analysis preview
  useEffect(() => {
    const text = (form.lyrics || '').trim();
    if (text.length < 12) { setAnalysis(null); return undefined; }
    setAnalyzing(true);
    const t = setTimeout(async () => {
      try {
        const a = await previewAnalysis({
          lyrics: text,
          genre: form.genre || undefined,
          mood: form.mood || undefined,
          duration: Number(form.duration) || 60,
        });
        setAnalysis(a);
      } catch (_) {
        setAnalysis(null);
      } finally {
        setAnalyzing(false);
      }
    }, 550);
    return () => clearTimeout(t);
  }, [form.lyrics, form.genre, form.mood, form.duration]);

  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  const logLen = job && job.agentLog ? job.agentLog.length : 0;
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLen]);

  const handleAudioFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      setError('Audio file too large (max 40 MB for in-browser analysis).');
      return;
    }
    setError(null);
    const dataUri = await fileToDataUri(file);
    update({ audioFile: dataUri, audioName: file.name, autoTrack: false });
  };

  const handleGenerate = useCallback(async () => {
    if (busy) return;
    const lyrics = (form.lyrics || '').trim();
    if (!lyrics) {
      setError('Paste your lyrics first — the director films your words.');
      return;
    }
    setError(null);
    if (onApplyToProject) {
      onApplyToProject({ lyrics, audioTitle: form.title, artistName: form.artistName });
    }
    setBusy(true);
    setJob({
      id: null, status: 'QUEUED', progress: 0, stage: 'Waking the AI Director…',
      agentLog: [], videoUrl: null, posterUrl: null,
    });
    try {
      const { jobId } = await createOriginalVideo({
        lyrics,
        title: form.title,
        artistName: form.artistName,
        genre: form.genre || undefined,
        aspectRatio: form.aspectRatio,
        quality: form.quality,
        captionStyle: form.captionStyle,
        storyMode: form.storyMode,
        castSize: form.castSize,
        aiModel: form.aiModel,
        filmGrain: form.filmGrain,
        duration: form.audioFile ? undefined : Number(form.duration) || undefined,
        audioDataUrl: form.audioFile || undefined,
        autoTrack: !form.audioFile,
      });
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = subscribeToJob(jobId, (j) => {
        setJob(j);
        if (j.status === 'COMPLETED' || j.status === 'FAILED') setBusy(false);
      });
    } catch (err) {
      setError(err.message || 'The director could not start.');
      setBusy(false);
      setJob(null);
    }
  }, [form, busy, onApplyToProject]);

  const handleCancel = async () => {
    if (job && job.id) await cancelOriginalVideo(job.id);
    setBusy(false);
    setJob((j) => (j ? { ...j, status: 'FAILED', error: 'Cancelled by user', stage: 'Cancelled' } : j));
  };

  const isDone = job && job.status === 'COMPLETED';
  const isFailed = job && job.status === 'FAILED';

  return (
    <div className="aidirector-view">
      {/* ================= HEADER ================= */}
      <div className="aidirector-hero">
        <div className="aidirector-hero-copy">
          <span className="aidirector-badge"><Sparkles size={12} /> ORIGINAL GENERATIVE ENGINE</span>
          <h1>AI Director <em>Original Cut</em></h1>
          <p>
            Paste your lyrics — the director analyzes them, composes an <strong>original soundtrack</strong>,
            paints <strong>every frame from scratch</strong> (no stock footage, no external APIs), cuts on the beat
            and burns kinetic lyrics. A fully original music video, generated on this machine.
          </p>
        </div>
        {analysis && (
          <div className="analysis-panel" aria-live="polite">
            <div className="analysis-head">
              <Eye size={14} /> Live read of your lyrics {analyzing && <Loader2 size={12} className="spin-icon" />}
            </div>
            <div className="analysis-grid">
              <div className="an-stat"><span>World</span><b>{(analysis.worlds && analysis.worlds[0]) || '—'}</b></div>
              <div className="an-stat"><span>Genre</span><b>{analysis.genre}</b></div>
              <div className="an-stat"><span>BPM</span><b>{analysis.bpm}</b></div>
              <div className="an-stat"><span>Mood</span><b>{analysis.mood}</b></div>
              <div className="an-stat"><span>Lines</span><b>{analysis.lineCount}</b></div>
              <div className="an-stat"><span>Chorus</span><b>{analysis.chorusLines} lines</b></div>
            </div>
            {analysis.palette && (
              <div className="palette-strip">
                {[analysis.palette.primary, analysis.palette.secondary, analysis.palette.glow, analysis.palette.deep].map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="aidirector-grid">
        {/* ================= LEFT: COMPOSER ================= */}
        <div className="director-card composer-card">
          <div className="card-head">
            <Wand2 size={15} /> <h3>Your Lyrics</h3>
            <button type="button" className="mini-btn" onClick={() => update({ lyrics: SAMPLE_LYRICS, title: 'We Are Electric', artistName: 'Astraea Cosmic' })}>
              <RefreshCw size={11} /> Try sample
            </button>
          </div>
          <textarea
            className="lyrics-input"
            value={form.lyrics}
            onChange={(e) => update({ lyrics: e.target.value })}
            placeholder={'Paste your lyrics here…\n\nTip: use [Verse] / [Chorus] / [Bridge] tags — or just write, the AI finds the structure itself.'}
            spellCheck={false}
          />

          <div className="controls-grid">
            <label className="ctl">
              <span><Type size={11} /> Title</span>
              <input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Song title" />
            </label>
            <label className="ctl">
              <span><Mic2 size={11} /> Artist</span>
              <input value={form.artistName} onChange={(e) => update({ artistName: e.target.value })} placeholder="Artist name" />
            </label>
            <label className="ctl">
              <span><Music size={11} /> Genre</span>
              <select value={form.genre} onChange={(e) => update({ genre: e.target.value })}>
                {GENRES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </label>
            <label className="ctl">
              <span><Gauge size={11} /> Length</span>
              <select
                value={form.duration}
                disabled={Boolean(form.audioFile)}
                onChange={(e) => update({ duration: Number(e.target.value) })}
              >
                {[30, 45, 60, 90, 120, 180].map((d) => (
                  <option key={d} value={d}>{d < 60 ? `${d}s` : `${d / 60}min`}</option>
                ))}
              </select>
            </label>
            <label className="ctl">
              <span><Ratio size={11} /> Format</span>
              <select value={form.aspectRatio} onChange={(e) => update({ aspectRatio: e.target.value })}>
                {RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label} · {r.hint}</option>)}
              </select>
            </label>
            <label className="ctl">
              <span><Film size={11} /> Quality</span>
              <select value={form.quality} onChange={(e) => update({ quality: e.target.value })}>
                {QUALITIES.map((q) => <option key={q.id} value={q.id}>{q.label} · {q.hint}</option>)}
              </select>
            </label>
            <label className="ctl">
              <span><Sparkles size={11} /> Engine</span>
              <select value={form.aiModel} onChange={(e) => update({ aiModel: e.target.value })}>
                {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
              </select>
              {form.aiModel === 'happyhorse' && hhAvailable === false && (
                <span className="ctl-hint warn">HappyHorse CLI not detected — renders fall back to the original engine.</span>
              )}
            </label>
            <label className="ctl">
              <span><Users size={11} /> Video style</span>
              <select value={form.storyMode} onChange={(e) => update({ storyMode: e.target.value })}>
                {STORY_MODES.map((s) => <option key={s.id} value={s.id}>{s.label} · {s.hint}</option>)}
              </select>
            </label>
            {form.storyMode !== 'visuals-only' && (
              <label className="ctl">
                <span><Users size={11} /> Cast</span>
                <select value={form.castSize} onChange={(e) => update({ castSize: e.target.value })}>
                  {CAST_SIZES.map((c) => <option key={c.id} value={c.id}>{c.label} · {c.hint}</option>)}
                </select>
              </label>
            )}
            <label className="ctl">
              <span><Palette size={11} /> Lyrics style</span>
              <select value={form.captionStyle} onChange={(e) => update({ captionStyle: e.target.value })}>
                {CAPTION_STYLES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <div className="ctl audio-ctl">
              <span><Music4 size={11} /> Soundtrack</span>
              <div className="audio-actions">
                <button
                  type="button"
                  className={`chip ${form.autoTrack ? 'on' : ''}`}
                  onClick={() => update({ autoTrack: true, audioFile: null, audioName: '' })}
                >
                  ✨ Compose original
                </button>
                <button
                  type="button"
                  className={`chip ${form.audioFile ? 'on' : ''}`}
                  onClick={() => audioInputRef.current && audioInputRef.current.click()}
                >
                  {form.audioFile ? `♪ ${form.audioName.slice(0, 18)}` : 'Use my track'}
                </button>
                <input
                  ref={audioInputRef} type="file" accept="audio/*" hidden
                  onChange={handleAudioFile}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="director-error"><AlertTriangle size={14} /> {error}</div>
          )}

          <div className="generate-row">
            {!busy ? (
              <button type="button" className="generate-btn" onClick={handleGenerate}>
                <Sparkles size={17} /> Generate Original Video
              </button>
            ) : (
              <button type="button" className="generate-btn stop" onClick={handleCancel}>
                <Square size={15} /> Stop render
              </button>
            )}
            <span className="generate-note">
              {form.audioFile ? 'Beats will be synced to your upload' : 'Original soundtrack will be composed for you'}
              {' · rendered locally'}
            </span>
          </div>
        </div>

        {/* ================= RIGHT: LIVE DIRECTOR MONITOR ================= */}
        <div className="director-card monitor-card">
          <div className="card-head">
            <Terminal size={15} /> <h3>Director Monitor</h3>
            {job && (
              <span className={`job-status s-${String(job.status).toLowerCase()}`}>
                {job.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : busy ? <Loader2 size={12} className="spin-icon" /> : null}
                {String(job.status).replace('_', ' ')}
              </span>
            )}
          </div>

          {!job && (
            <div className="monitor-empty">
              <div className="empty-reel">🎬</div>
              <p><b>Ready when you are.</b></p>
              <p className="dim">
                The director will log every step here — lyric analysis, original composition,
                shot planning, frame painting and the final encode.
              </p>
            </div>
          )}

          {job && (
            <>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${job.progress || 0}%` }} />
              </div>
              <div className="progress-label">
                <span>{job.stage}</span><span>{job.progress || 0}%</span>
              </div>

              <div className="agent-log" ref={logRef}>
                {(job.agentLog || []).map((l, i) => (
                  <div key={i} className="log-line">
                    <span className="log-t">{(l.t / 1000).toFixed(1)}s</span>
                    <span className="log-msg">{l.msg}</span>
                  </div>
                ))}
              </div>

              {isFailed && (
                <div className="director-error"><AlertTriangle size={14} /> {job.error || 'Render failed'}</div>
              )}

              {isDone && job.videoUrl && (
                <div className="result-box">
                  <video src={job.videoUrl} controls poster={job.posterUrl || undefined} playsInline />
                  <div className="result-actions">
                    <a className="result-btn" href={job.videoUrl} download target="_blank" rel="noreferrer">
                      <Download size={14} /> Download MP4
                    </a>
                    {job.stats && (
                      <span className="result-meta">
                        {job.stats.resolution} · {job.stats.fps}fps · {job.stats.scenes} scenes ·{' '}
                        {job.stats.bpm} BPM · {job.stats.originalTrack ? 'original score ♪' : 'your track ♪'}
                      </span>
                    )}
                    <button type="button" className="result-btn ghost" onClick={handleGenerate}>
                      <RefreshCw size={13} /> Render again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div className="director-steps">
        {[
          { n: '01', t: 'Lyric intelligence', d: 'Structure, imagery, emotion & genre are extracted from your words — every metaphor maps to a visual world.' },
          { n: '02', t: 'Original soundtrack', d: 'A royalty-free track is composed from scratch (drums, bass, pads, leads) in your song’s key & BPM — or your upload is beat-mapped.' },
          { n: '03', t: 'Shot planning', d: 'Scenes are cut on section boundaries & beat drops. Choruses get signature worlds so the hook feels iconic.' },
          { n: '04', t: 'Frame-by-frame generation', d: 'Every frame is painted procedurally — particles, parallax, camera moves, beat flashes — then encoded to an MP4 master with kinetic lyrics.' },
        ].map((s) => (
          <div key={s.n} className="step-card">
            <span className="step-n">{s.n}</span>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
