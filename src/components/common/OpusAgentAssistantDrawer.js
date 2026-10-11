// src/components/common/OpusAgentAssistantDrawer.js — REAL agent console.
// Talks to the offline agent runtime (/api/opus/agent) which plans multi-step
// work and executes actual tools: writing original lyrics, analyzing songs,
// launching AI Director renders, monitoring them live, and delivering
// playable masters inline — a true agent experience, no canned responses.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Send, X, Sparkles, Loader2, CheckCircle2, AlertTriangle,
  Download, Film, PenLine, ListMusic, BarChart3, BookOpen, Lightbulb,
  FolderOpen, Activity, Plus,
} from 'lucide-react';
import { startAgentTurn, subscribeAgentSession } from '../../services/OpusAgentClient';
import '../../styles/OpusAgentDrawer.css';

const SESSION_KEY = 'opus_agent_session_v1';

const QUICK_CHIPS = [
  { icon: PenLine, label: 'Write + film a song', msg: 'Write an original synthwave song about neon rain, then make the music video in 1080p' },
  { icon: Lightbulb, label: 'Pitch me concepts', msg: 'Pitch me three music video concepts' },
  { icon: BarChart3, label: 'Render status', msg: 'What’s the status of my render?' },
  { icon: FolderOpen, label: 'My renders', msg: 'Show my renders' },
];

function mdLite(text) {
  // minimal markdown: **bold**, *italic*, bullet lines, line breaks
  const lines = String(text).split('\n');
  return lines.map((line, li) => {
    const bullet = /^\s*[•*-]\s+/.test(line);
    const content = line.replace(/^\s*[•*-]\s+/, '');
    const parts = [];
    let rest = content;
    let key = 0;
    const segRe = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0, m;
    while ((m = segRe.exec(rest))) {
      if (m.index > last) parts.push(rest.slice(last, m.index));
      if (m[1]) parts.push(<strong key={`b${li}-${key++}`}>{m[1]}</strong>);
      else parts.push(<em key={`i${li}-${key++}`}>{m[2]}</em>);
      last = m.index + m[0].length;
    }
    if (last < rest.length) parts.push(rest.slice(last));
    return bullet
      ? <div key={li} className="oa-li"><span className="oa-bullet">•</span><span>{parts}</span></div>
      : <div key={li} className="oa-line">{parts}</div>;
  });
}

function ToolCard({ ev }) {
  const icons = {
    write_lyrics: PenLine, analyze_lyrics: BarChart3, render_original_video: Film,
    monitor_render: Activity, get_render_status: Activity, list_renders: FolderOpen,
    cancel_render: X, suggest_concepts: Lightbulb, production_bible: BookOpen,
    set_preferences: Sparkles, request_lyrics: ListMusic, capabilities: Bot, smalltalk: Bot,
  };
  const Icon = icons[ev.name] || Sparkles;
  const done = ev.status === 'done';
  const failed = ev.status === 'error';
  return (
    <div className={`oa-tool ${done ? 'done' : ''} ${failed ? 'error' : ''}`}>
      <span className="oa-tool-icon">{failed ? <AlertTriangle size={13} /> : done ? <CheckCircle2 size={13} /> : <Loader2 size={13} className="oa-spin" />}</span>
      <Icon size={13} className="oa-tool-glyph" />
      <span className="oa-tool-label">{ev.label || ev.name}</span>
      {ev.args && Object.keys(ev.args).length > 0 && (
        <span className="oa-tool-args">
          {Object.entries(ev.args).slice(0, 3).map(([k, v]) => <em key={k}>{k}: {String(v)}</em>)}
        </span>
      )}
    </div>
  );
}

function VideoCard({ ev }) {
  return (
    <div className="oa-video-card">
      <video src={ev.videoUrl} controls poster={ev.posterUrl || undefined} playsInline preload="metadata" />
      <div className="oa-video-meta">
        <span className="oa-badge-ok"><CheckCircle2 size={11} /> MASTER READY</span>
        {ev.stats && ev.stats.resolution && (
          <span className="oa-dim">{ev.stats.resolution} · {ev.stats.fps}fps · {ev.stats.bpm} BPM · {ev.stats.scenes} scenes · {ev.stats.originalTrack ? 'original score ♪' : 'custom track ♪'}</span>
        )}
      </div>
      <div className="oa-video-actions">
        <a className="oa-btn" href={ev.downloadUrl || ev.videoUrl} download><Download size={12} /> Download MP4</a>
      </div>
    </div>
  );
}

function LyricsCard({ ev, onFilm, onOpenDirector }) {
  return (
    <div className="oa-lyrics-card">
      <div className="oa-lyrics-head">
        <ListMusic size={14} />
        <div>
          <b>“{ev.title}”</b>
          <span className="oa-dim"> {ev.theme} · {ev.lineCount} lines · hook: “{ev.hook}”</span>
        </div>
      </div>
      <pre className="oa-lyrics-body">{ev.lyrics}</pre>
      <div className="oa-lyrics-actions">
        <button type="button" className="oa-btn" onClick={onFilm}><Film size={12} /> Film it now</button>
        {onOpenDirector && (
          <button type="button" className="oa-btn ghost" onClick={onOpenDirector}><Sparkles size={12} /> Open in AI Director</button>
        )}
      </div>
    </div>
  );
}

export default function OpusAgentAssistantDrawer({
  isOpen,
  onClose,
  project = {},
  onUpdateProject = () => {},
  onApplyScenes = () => {},
  onNavigate,
  variant = 'drawer', // 'drawer' | 'page'
}) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || null);
  const [session, setSession] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [unsub, setUnsub] = useState(null);
  const scrollRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = session;

  // Reattach to persisted session when opened
  useEffect(() => {
    if (isOpen && sessionId && !session) {
      import('../../services/OpusAgentClient').then(({ getAgentSession }) => {
        getAgentSession(sessionId).then((s) => {
          if (!sessionRef.current) setSession(s);
        }).catch(() => {
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
        });
      });
    }
  }, [isOpen, sessionId, session]);

  // Live subscription
  useEffect(() => {
    if (!sessionId || !isOpen) return undefined;
    const stop = subscribeAgentSession(sessionId, (s) => setSession(s), 800);
    setUnsub(() => stop);
    return stop;
  }, [sessionId, isOpen]);

  useEffect(() => () => { if (unsub) unsub(); }, [unsub]);

  const eventCount = session && session.events ? session.events.length : 0;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [eventCount, isOpen]);

  const send = useCallback(async (text) => {
    const msg = String(text || '').trim();
    if (!msg || sending) return;
    setError(null);
    setSending(true);
    setInput('');
    // optimistic user bubble
    setSession((prev) => ({
      ...(prev || { id: sessionId, status: 'working', plan: [], context: {}, artifacts: {}, createdAt: new Date().toISOString() }),
      events: [...((prev && prev.events) || []), { type: 'user', text: msg, ts: Date.now() }],
      status: 'working',
    }));
    try {
      const { sessionId: sid } = await startAgentTurn(msg, sessionId);
      localStorage.setItem(SESSION_KEY, sid);
      setSessionId(sid);
    } catch (e) {
      setError(e.message || 'The agent is unreachable — is the render backend running?');
    } finally {
      setSending(false);
    }
  }, [sending, sessionId]);

  const newSession = () => {
    if (unsub) unsub();
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setSession(null);
    setError(null);
  };

  const handleFilmWrittenLyrics = () => send('Make the music video with those lyrics');

  const handleOpenInDirector = (ev) => {
    if (ev && ev.lyrics) {
      onUpdateProject({ lyrics: ev.lyrics, audioTitle: ev.title || project.audioTitle, artistName: project.artistName });
    }
    onClose();
    if (onNavigate) onNavigate('ai-director');
  };

  const working = session && session.status === 'working';
  const events = (session && session.events) || [];

  if (!isOpen) return null;

  const consoleBody = (
    <>
      <header className="oa-header">
        <div className="oa-agent-ident">
          <span className="oa-agent-avatar"><Bot size={17} /></span>
          <div>
            <b>Opus Agent</b>
            <span className={`oa-status-pill ${working ? 'busy' : 'idle'}`}>
              {working ? <><Loader2 size={10} className="oa-spin" /> working</> : <><span className="oa-dot" /> idle</>}
            </span>
          </div>
        </div>
        <div className="oa-header-actions">
          <button type="button" className="oa-icon-btn" onClick={newSession} title="New session"><Plus size={15} /></button>
          {variant !== 'page' && (
            <button type="button" className="oa-icon-btn" onClick={onClose} title="Close"><X size={16} /></button>
          )}
        </div>
      </header>

      <div className="oa-transcript" ref={scrollRef}>
        {events.length === 0 && (
          <div className="oa-welcome">
            <div className="oa-welcome-orb"><Sparkles size={22} /></div>
            <h4>Your autonomous video director</h4>
            <p>
              I execute <b>real</b> work with real engines — no canned replies:
            </p>
            <ul>
              <li>✍️ <b>Write original lyrics</b> on any theme</li>
              <li>🔍 <b>Analyze</b> songs (genre · BPM · visual world)</li>
              <li>🎬 <b>Render fully original music videos</b> and monitor them live</li>
              <li>📖 <b>Production bibles</b>, concepts, status, library, cancel</li>
            </ul>
            <p className="oa-dim">Try: <i>“Write a lo-fi song about midnight rain and make the video, vertical 1080p.”</i></p>
          </div>
        )}

        {events.map((ev, i) => {
          switch (ev.type) {
            case 'user':
              return <div key={i} className="oa-msg user">{ev.text}</div>;
            case 'thought':
              return <div key={i} className="oa-thought"><span className="oa-thought-caret" />{ev.text}</div>;
            case 'plan':
              return (
                <div key={i} className="oa-plan">
                  {ev.steps.map((s, k) => <span key={k} className="oa-plan-step">{k + 1}. {s.label}</span>)}
                </div>
              );
            case 'tool':
              return <ToolCard key={i} ev={ev} />;
            case 'assistant':
              return <div key={i} className="oa-msg agent">{mdLite(ev.text)}</div>;
            case 'lyrics':
              return <LyricsCard key={i} ev={ev} onFilm={handleFilmWrittenLyrics} onOpenDirector={() => handleOpenInDirector(ev)} />;
            case 'analysis':
              return (
                <div key={i} className="oa-analysis-card">
                  <div className="oa-analysis-grid">
                    <div><span>Genre</span><b>{ev.genre}</b></div>
                    <div><span>BPM</span><b>{ev.bpm}</b></div>
                    <div><span>Mood</span><b>{ev.mood}</b></div>
                    <div><span>Lines</span><b>{ev.lineCount}</b></div>
                  </div>
                  {ev.worlds && <div className="oa-dim oa-worlds">Worlds: {ev.worlds.join(' → ')}</div>}
                  {ev.palette && (
                    <div className="oa-palette">
                      {[ev.palette.primary, ev.palette.secondary, ev.palette.glow, ev.palette.deep].map((c, k) => <span key={k} style={{ background: c }} />)}
                    </div>
                  )}
                </div>
              );
            case 'video':
              return <VideoCard key={i} ev={ev} />;
            case 'concepts':
              return (
                <div key={i} className="oa-concepts">
                  {ev.items.map((c, k) => (
                    <button key={k} type="button" className="oa-concept" onClick={() => send(`Write a song about ${c.title} and make the music video`)}>
                      <b>{c.title}</b>
                      <span>{c.pitch}</span>
                      <em>Film this →</em>
                    </button>
                  ))}
                </div>
              );
            case 'renders':
              return (
                <div key={i} className="oa-renders">
                  {ev.items.map((r, k) => (
                    <div key={k} className="oa-render-row">
                      <Film size={12} />
                      <span className="oa-render-name">{(r.title || r.fileName || '').slice(0, 40)}</span>
                      <a href={r.videoUrl} target="_blank" rel="noreferrer">open</a>
                    </div>
                  ))}
                </div>
              );
            case 'status':
              return (
                <div key={i} className="oa-status-card">
                  <div className="oa-status-line"><b>{ev.jobId}</b><span>{ev.status} · {ev.progress}%</span></div>
                  <div className="oa-progress"><div style={{ width: `${ev.progress}%` }} /></div>
                  <div className="oa-dim">{ev.stage}</div>
                </div>
              );
            case 'error':
              return <div key={i} className="oa-msg agent oa-error"><AlertTriangle size={12} /> {ev.text}</div>;
            default:
              return null;
          }
        })}

        {sending && (
          <div className="oa-thought"><Loader2 size={11} className="oa-spin" /> waking the agent…</div>
        )}
      </div>

      {error && <div className="oa-error-banner"><AlertTriangle size={13} /> {error}</div>}

      <div className="oa-chips">
        {QUICK_CHIPS.map((c) => (
          <button key={c.label} type="button" className="oa-chip" onClick={() => send(c.msg)}>
            <c.icon size={11} /> {c.label}
          </button>
        ))}
      </div>

      <footer className="oa-composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          placeholder="Tell the agent what to make… (Enter to send)"
          rows={1}
        />
        <button type="button" className="oa-send" onClick={() => send(input)} disabled={sending || !input.trim()}>
          {sending ? <Loader2 size={15} className="oa-spin" /> : <Send size={15} />}
        </button>
      </footer>
    </>
  );

  if (variant === 'page') {
    return (
      <div className="oa-drawer oa-page" role="region" aria-label="Opus Agent workspace">
        {consoleBody}
      </div>
    );
  }

  return (
    <div className="oa-drawer-root" role="dialog" aria-label="Opus Agent console">
      <button type="button" className="oa-backdrop" onClick={onClose} aria-label="Close agent" />
      <aside className="oa-drawer">{consoleBody}</aside>
    </div>
  );
}
