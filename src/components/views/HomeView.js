// src/components/views/HomeView.js — freebeat.ai-style creation dashboard.
// Hero lyric input → one-tap jump into the AI Director with everything
// prefilled, plus a live wall of the user's real rendered masters.

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Wand2,
  ArrowRight,
  Play,
  Bot,
  Film,
  Zap,
  Clock,
  AlertTriangle,
  Music4,
  Type,
  Ratio,
  Loader2,
  User,
} from 'lucide-react';
import { listServerVideos } from '../../services/LocalServerRenderService';
import '../../styles/HomeView.css';

const GENRE_CHIPS = [
  { id: '', label: '✨ Auto', hint: 'AI decides' },
  { id: 'edm', label: '🎧 EDM' },
  { id: 'lofi', label: '🌙 Lo-Fi' },
  { id: 'pop', label: 'radio Pop' },
  { id: 'trap', label: '🔊 Trap' },
  { id: 'cinematic', label: '🎬 Cinematic' },
  { id: 'synthwave', label: '🌆 Synthwave' },
  { id: 'rock', label: '🎸 Rock' },
];

const SAMPLE = `[Verse]
City lights are calling out my name
Midnight rain on neon streets tonight
[Chorus]
We are electric, we are the fire
Burning like stars in a wireless sky`;

export default function HomeView({ project, onNavigate, onCreateFromLyrics, serverOnline }) {
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('');
  const [aspect, setAspect] = useState('16:9');
  const [recent, setRecent] = useState([]);
  const [recentState, setRecentState] = useState('loading');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const vids = await listServerVideos();
        if (!alive) return;
        setRecent((vids || []).slice(0, 8));
        setRecentState(vids && vids.length ? 'ready' : 'empty');
      } catch (_) {
        if (alive) setRecentState('empty');
      }
    };
    load();
    const t = setInterval(load, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const handleCreate = () => {
    const text = lyrics.trim() || SAMPLE;
    onCreateFromLyrics({ lyrics: text, genre: genre || undefined, aspectRatio: aspect });
  };

  return (
    <div className="home-view">
      {/* ============ HERO — freebeat-style creation box ============ */}
      <section className="home-hero">
        <div className="hero-glow g1" />
        <div className="hero-glow g2" />
        <span className="hero-badge"><Sparkles size={11} /> 100% ORIGINAL · NO STOCK FOOTAGE · RENDERS ON THIS MACHINE</span>
        <h1>
          Turn lyrics into an <em>original music video</em>
        </h1>
        <p className="hero-sub">
          Original soundtrack composed from scratch · every frame painted generatively ·
          beat-synced cuts & kinetic lyrics. Nothing downloaded — truly yours.
        </p>

        <div className="hero-composer">
          <div className="composer-top">
            <Type size={14} />
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={'Paste your lyrics here…\n\nNo lyrics? Leave it blank and the AI writes an original song for you.'}
              rows={4}
            />
          </div>
          <div className="composer-bottom">
            <div className="chip-row">
              {GENRE_CHIPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`chip ${genre === g.id ? 'on' : ''}`}
                  onClick={() => setGenre(g.id)}
                  title={g.hint || g.label}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="composer-actions">
              <label className="aspect-pick">
                <Ratio size={12} />
                <select value={aspect} onChange={(e) => setAspect(e.target.value)}>
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </select>
              </label>
              <button type="button" className="create-btn" onClick={handleCreate}>
                <Wand2 size={16} /> Create Original Video <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="hero-meta">
          <span><Music4 size={11} /> auto soundtrack</span>
          <span><Film size={11} /> 720p / 1080p MP4</span>
          <span><Clock size={11} /> ~60–120s render</span>
          <span><Zap size={11} /> works offline</span>
        </div>
      </section>

      {/* ============ RECENT RENDERS — real videos ============ */}
      <section className="home-section">
        <div className="section-head">
          <h3><Play size={14} /> Your recent masters</h3>
          <button type="button" className="link-btn" onClick={() => onNavigate('renders')}>
            Open library <ArrowRight size={12} />
          </button>
        </div>

        {recentState === 'loading' && (
          <div className="recent-empty"><Loader2 size={16} className="spin" /> Checking the render vault…</div>
        )}

        {recentState === 'empty' && (
          <div className="recent-empty">
            <div className="empty-art">🎬</div>
            <p><b>No renders yet.</b> Your finished music videos will appear here — create the first one above.</p>
          </div>
        )}

        <div className="recent-grid">
          {recent.map((r) => (
            <button
              key={r.fileName}
              type="button"
              className="recent-card"
              onClick={() => onNavigate('renders')}
              title={r.title || r.fileName}
            >
              <video
                src={r.videoUrl}
                poster={r.posterUrl || r.thumbnailUrl || undefined}
                muted
                preload="metadata"
                playsInline
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <span className="recent-title">{(r.title || r.fileName || '').replace(/\.mp4$/, '').slice(0, 34)}</span>
              <span className="recent-sub">{r.resolution || ''} {r.size ? `· ${(r.size / 1048576).toFixed(1)} MB` : ''}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="home-section">
        <div className="section-head"><h3>How it works</h3></div>
        <div className="how-grid">
          {[
            { n: '1', t: 'Paste lyrics', d: 'Or let the AI write an original song. Tags like [Chorus] help — plain text works too.' },
            { n: '2', t: 'AI directs', d: 'It reads your words, picks visual worlds, composes a soundtrack and plans beat-synced shots.' },
            { n: '3', t: 'Get the master', d: 'Every frame painted & encoded to a downloadable MP4 with burned-in kinetic lyrics.' },
          ].map((s) => (
            <div key={s.n} className="how-card">
              <span className="how-n">{s.n}</span>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TOOL CARDS ============ */}
      <section className="home-section">
        <div className="section-head"><h3>Studios</h3></div>
        <div className="tool-grid">
          <button type="button" className="tool-card accent" onClick={() => onNavigate('agent')}>
            <Bot size={20} />
            <div><h4>Opus Agent</h4><p>Chat director: “write a lofi song and make the video” — it executes for real.</p></div>
            <ArrowRight size={15} />
          </button>
          <button type="button" className="tool-card" onClick={() => onNavigate('ai-director')}>
            <Wand2 size={20} />
            <div><h4>AI Director</h4><p>Full control: quality, captions, format, upload your own track.</p></div>
            <ArrowRight size={15} />
          </button>
          <button type="button" className="tool-card" onClick={() => onNavigate('character-creator')}>
            <User size={20} />
            <div><h4>Cast Designer</h4><p>Design your artist — they star in every video with storylines & lip-sync.</p></div>
            <ArrowRight size={15} />
          </button>
          <button type="button" className="tool-card" onClick={() => onNavigate('clip-gap-filler')}>
            <Zap size={20} />
            <div><h4>Clip Bridge</h4><p>Stitch your own clips with generated transition bridges & grading.</p></div>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {serverOnline === false && (
        <div className="home-offline">
          <AlertTriangle size={13} /> Render backend offline — start it with <code>npm run video-server</code>
        </div>
      )}
    </div>
  );
}
