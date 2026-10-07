// server/opusAgent.js — Real autonomous agent runtime ("Opus Agent").
//
// A genuine agentic loop, fully offline (no API key required):
//   user message ──► planner (intent + parameters) ──► ordered tool plan
//                ──► executor runs real tools with a live transcript:
//                    • write_lyrics          — original songwriting engine
//                    • analyze_lyrics        — lyric intelligence brief
//                    • render_original_video — AI Director full render
//                    • monitor_render        — live progress babysitting
//                    • production_bible      — real shot list from analysis
//                    • suggest_concepts      — creative pitches
//                    • list_renders / get_render_status / cancel_render
//                ──► final answer with inline artifacts (video, lyrics…)
//
// Sessions keep full transcripts so the UI can replay + resume.
// If ANTHROPIC_API_KEY is set, the planner can be upgraded to Claude
// (structured JSON plan) — everything falls back to the local brain.

const crypto = require('crypto');
const fs = require('fs');

const { analyzeLyrics } = require('./lyricsAnalysis');
const { writeLyrics } = require('./lyricWriter');
const { createAgentJob, getAgentJob, cancelAgentJob } = require('./agentVideoEngine');
const { listCompletedRenders } = require('./renderEngine');

const sessions = new Map();
const MAX_EVENTS = 400;

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------
function newSession(message) {
  const id = crypto.randomBytes(8).toString('hex');
  const session = {
    id,
    status: 'working', // working | idle | error
    createdAt: new Date().toISOString(),
    updatedAt: Date.now(),
    events: [],
    plan: [],
    artifacts: { lyrics: null, analysis: null, lastRenderJobId: null, lastVideo: null },
    context: {
      genre: null, captionStyle: null, aspectRatio: null, quality: null,
      title: null, artistName: null, duration: null,
    },
  };
  sessions.set(id, session);
  // opportunistic cleanup of very old sessions (keep 40)
  const ids = [...sessions.entries()].sort((a, b) => String(b[1].createdAt).localeCompare(String(a[1].createdAt)));
  for (const [oldId] of ids.slice(40)) sessions.delete(oldId);
  return session;
}

function emit(session, event) {
  event.ts = Date.now();
  session.events.push(event);
  if (session.events.length > MAX_EVENTS) session.events.splice(0, session.events.length - MAX_EVENTS);
  session.updatedAt = Date.now();
}
const thought = (session, text) => emit(session, { type: 'thought', text });
const say = (session, text) => emit(session, { type: 'assistant', text });

function getSession(id) {
  return sessions.get(id) || null;
}

// ---------------------------------------------------------------------------
// Planner — turns a message into an ordered plan of tool calls.
// ---------------------------------------------------------------------------
const GENRES = ['pop', 'edm', 'trap', 'lofi', 'rock', 'cinematic', 'synthwave', 'rnb'];
const CAPTION_STYLES = ['karaoke', 'kinetic', 'impact', 'neon', 'typewriter', 'minimal'];

function extractQuoted(text) {
  const m = text.match(/[“"]([\s\S]{20,2000})[”"]/) || text.match(/[“”«»]([\s\S]{20,2000})[“”«»]/);
  return m ? m[1].trim() : null;
}

function extractParams(message, session) {
  const t = message.toLowerCase();
  const p = {};

  const genreMatch = t.match(/\b(pop|edm|trap|lofi|lo-fi|rock|cinematic|synthwave|rnb|r&b)\b/);
  if (genreMatch) p.genre = genreMatch[1] === 'lo-fi' ? 'lofi' : genreMatch[1] === 'r&b' ? 'rnb' : genreMatch[1];

  // caption styles must be anchored to captions/lyrics/style words so lyric
  // content like "neon streets" never flips a setting by accident
  const styleMatch = t.match(/\b(karaoke|kinetic|impact|typewriter|minimal|neon)\b[- ](?:style|captions?|lyrics?)/) || t.match(/(?:captions?|lyrics?|style)\b[^.]{0,12}\b(karaoke|kinetic|impact|typewriter|minimal|neon)\b/);
  if (styleMatch) p.captionStyle = styleMatch[1];
  else if (t.includes('no lyrics') || t.includes('without lyrics') || t.includes('captions off')) p.captionStyle = 'off';

  if (t.includes('vertical') || t.includes('portrait') || t.includes('tiktok') || t.includes('shorts') || t.includes('reels') || t.includes('9:16')) p.aspectRatio = '9:16';
  else if (t.includes('square') || t.includes('instagram feed') || t.includes('1:1')) p.aspectRatio = '1:1';
  else if (t.includes('2.39') || t.includes('cinemascope') || t.includes('anamorphic')) p.aspectRatio = '2.39:1';
  else if (t.includes('16:9') || t.includes('widescreen') || t.includes('youtube')) p.aspectRatio = '16:9';

  if (t.includes('1080') || t.includes('master') || t.includes('highest quality') || t.includes('best quality')) p.quality = 'master';
  else if (t.includes('480') || t.includes('draft') || t.includes('quick')) p.quality = 'draft';
  else if (t.includes('720') || t.includes('standard')) p.quality = 'standard';

  const dur = t.match(/(\d+)\s*(seconds?|secs?|s\b|minutes?|mins?|m\b)/);
  if (dur) {
    const n = parseInt(dur[1], 10);
    p.duration = /min/.test(dur[2]) ? n * 60 : n;
  }

  const titled = message.match(/titled\s+[“"]([^”"]{1,80})[”"]|titled\s+([A-Za-z0-9 '’!?]{1,60})/i);
  if (titled) p.title = (titled[1] || titled[2]).trim();

  const by = message.match(/\bby\s+([A-Z][\w'’]*(?:\s+[A-Z][\w'’]*){0,3})/);
  if (by && !/by the way|by me/i.test(by[0])) p.artistName = by[1].trim();

  const about = message.match(/\babout\s+([^.!?\n]{3,80})/i);
  if (about) p.about = about[1].trim();

  return p;
}

function stripInstructionLines(message) {
  const out = String(message).split(/\r?\n/).filter((line) => {
    const l = line.toLowerCase().trim();
    if (!l) return true;
    if (l.includes('?')) return false;
    if (/^(what|how|whats|what's|analyze|analyse|read|break down|review|genre|bpm|mood|please|can you|could you)\b/.test(l)) return false;
    return true;
  });
  return out.join('\n').trim();
}

function planFromMessage(message, session) {
  const t = message.toLowerCase();
  const plan = [];
  const has = (...words) => words.some((w) => t.includes(w));

  const quotedLyrics = extractQuoted(message);
  const looksLikeLyricsBlock = quotedLyrics && quotedLyrics.split(/\r?\n/).filter((l) => l.trim()).length >= 3;
  // Also accept raw multi-line lyric payloads pasted into chat (no quotes)
  const rawLines = message.split(/\r?\n/).filter((l) => l.trim()).length;
  const pastedLyrics = rawLines >= 4 && !has('status', 'list', 'cancel', 'idea', 'concept', 'help', 'bible');
  const cleanedMessage = stripInstructionLines(message);

  const ctxLyrics = session.artifacts.lyrics;

  const wantsWrite = has('write', 'draft', 'pen ', 'compose', 'songwriting') && has('lyric', 'song', 'verse', 'chorus', 'hook');
  const wantsRender = /\b(render|film|shoot|produce)\b/.test(t)
    || (has('make', 'create', 'generate') && has('video', 'music video', 'visual', 'visuals', 'clip', 'master', 'film'))
    || looksLikeLyricsBlock || pastedLyrics;
  const wantsAnalyze = has('analyze', 'analyse', 'break down', 'read my', 'review') && has('lyric', 'song') || (has('what') && has('genre', 'bpm', 'mood', 'world'));
  const wantsBible = has('bible', 'storyboard', 'shot list', 'screenplay', 'shot plan', 'production plan');
  const wantsConcepts = has('idea', 'concept', 'pitch', 'suggest', 'brainstorm', 'inspire');
  const wantsStatus = has('status', 'progress', 'how far', 'how is it going', 'how’s it going', 'done yet', 'still working');
  const wantsList = has('list', 'library', 'gallery', 'show my', 'my videos', 'my renders', 'my clips');
  const wantsCancel = has('cancel', 'stop the render', 'abort', 'kill the render');
  const wantsHelp = has('help', 'what can you do', 'who are you', 'how does this work', 'capabilities');

  if (wantsCancel) {
    plan.push({ tool: 'cancel_render', args: { jobId: session.artifacts.lastRenderJobId } });
    return plan;
  }
  if (wantsHelp) {
    plan.push({ tool: 'capabilities', args: {} });
    return plan;
  }
  if (wantsStatus) {
    plan.push({ tool: 'get_render_status', args: { jobId: session.artifacts.lastRenderJobId } });
    return plan;
  }
  if (wantsList) {
    plan.push({ tool: 'list_renders', args: {} });
    return plan;
  }
  if (wantsConcepts) {
    plan.push({ tool: 'suggest_concepts', args: { about: extractParams(message, session).about || '' } });
    return plan;
  }

  if (wantsWrite) {
    const p = extractParams(message, session);
    plan.push({
      tool: 'write_lyrics',
      args: { about: p.about || '', genre: p.genre || session.context.genre || undefined, length: has('short') ? 'short' : 'standard' },
    });
  }

  const explicitLyrics = looksLikeLyricsBlock ? quotedLyrics : pastedLyrics ? cleanedMessage : null;
  const lyricsForRender = explicitLyrics || (ctxLyrics && wantsRender ? ctxLyrics : null);
  const renderExplicit = wantsRender && !wantsWrite;
  if (wantsRender && !wantsAnalyze && (lyricsForRender || wantsWrite || ctxLyrics)) {
    const p = extractParams(message, session);
    plan.push({
      tool: 'render_original_video',
      args: {
        lyrics: explicitLyrics || undefined,
        useSessionLyrics: !explicitLyrics,
        title: p.title || session.context.title || undefined,
        artistName: p.artistName || session.context.artistName || undefined,
        genre: p.genre || session.context.genre || undefined,
        captionStyle: p.captionStyle || session.context.captionStyle || undefined,
        aspectRatio: p.aspectRatio || session.context.aspectRatio || undefined,
        quality: p.quality || session.context.quality || undefined,
        duration: p.duration || session.context.duration || undefined,
      },
    });
    plan.push({ tool: 'monitor_render', args: {} });
    return plan;
  }

  if (renderExplicit && !ctxLyrics && !looksLikeLyricsBlock && !pastedLyrics && !wantsAnalyze) {
    // asked to render but no lyrics anywhere — ask for them
    plan.push({ tool: 'request_lyrics', args: {} });
    return plan;
  }

  if (pastedLyrics || looksLikeLyricsBlock) {
    plan.push({ tool: 'analyze_lyrics', args: { lyrics: looksLikeLyricsBlock ? quotedLyrics : cleanedMessage } });
    if (wantsBible) plan.push({ tool: 'production_bible', args: {} });
    return plan;
  }

  if (wantsAnalyze && ctxLyrics) {
    plan.push({ tool: 'analyze_lyrics', args: { lyrics: ctxLyrics } });
    return plan;
  }
  if (wantsBible) {
    plan.push({ tool: 'analyze_lyrics', args: { lyrics: ctxLyrics || undefined } });
    plan.push({ tool: 'production_bible', args: {} });
    return plan;
  }

  // parameter-only tweak ("make it lofi", "vertical please", "1080p next time")
  const p = extractParams(message, session);
  if (plan.length === 0 && Object.keys(p).length > 0 && message.split(/\s+/).length <= 12) {
    plan.push({ tool: 'set_preferences', args: p });
    return plan;
  }
  if (plan.length > 0) return plan; // already handled (e.g. write_lyrics)

  // No clear intent — offer capabilities gracefully
  plan.push({ tool: 'smalltalk', args: { message } });
  return plan;
}

// ---------------------------------------------------------------------------
// Tool implementations — every tool does REAL work.
// ---------------------------------------------------------------------------
function worldLabel(env) {
  return ({ neonCity: 'Neon City', synthwave: 'Retro Sunset Grid', cosmos: 'Deep Cosmos', ocean: 'Moonlit Ocean', storm: 'Electric Storm', embers: 'Fire & Embers', forest: 'Enchanted Forest', snowfall: 'Winter Aurora', desert: 'Golden Desert', cyberGrid: 'Cyber Tunnel', underwater: 'Underwater Dream', hearts: 'Golden Hour Love' })[env] || env;
}

const TOOLS = {
  async write_lyrics(session, args) {
    thought(session, 'Composing original lyrics with the songwriting engine…');
    const written = writeLyrics({ about: args.about || '', genre: args.genre, length: args.length || 'standard' });
    session.artifacts.lyrics = written.lyrics;
    if (!session.context.title) session.context.title = written.title;
    emit(session, {
      type: 'lyrics',
      title: written.title,
      theme: written.themeLabel,
      hook: written.hook,
      lineCount: written.lineCount,
      lyrics: written.lyrics,
    });
    say(session, `I wrote **“${written.title}”** — an original ${written.lineCount}-line track in the *${written.themeLabel}* world. Hook: *“${written.hook}.”*\n\nWant me to film it? Say **“make the video”** (or “make it lo-fi, vertical, 1080p”).`);
    return { ok: true, title: written.title };
  },

  async analyze_lyrics(session, args) {
    const lyrics = args.lyrics || session.artifacts.lyrics;
    if (!lyrics) { say(session, 'Paste your lyrics (or ask me to write some first) and I’ll break them down.'); return { ok: false }; }
    thought(session, 'Running lyric intelligence — structure, imagery, emotion, BPM…');
    const analysis = analyzeLyrics(lyrics, { duration: session.context.duration || 60, genre: session.context.genre || undefined });
    session.artifacts.lyrics = lyrics;
    session.artifacts.analysis = analysis;
    session.context.genre = session.context.genre || analysis.genre;
    emit(session, {
      type: 'analysis',
      genre: analysis.genre,
      bpm: analysis.bpm,
      mood: analysis.summary.mood,
      lineCount: analysis.summary.lineCount,
      chorusLines: analysis.summary.chorusCount,
      worlds: analysis.summary.topEnvs,
      palette: analysis.palette,
    });
    say(session, `Analysis complete: **${analysis.genre}** @ **${analysis.bpm} BPM**, mood **${analysis.summary.mood}**, ${analysis.summary.lineCount} lines (${analysis.summary.chorusCount} chorus). Visual world: **${analysis.summary.topEnvs.join(' → ')}**.`);
    return { ok: true, analysis };
  },

  async render_original_video(session, args) {
    let lyrics = args.lyrics;
    if (!lyrics && args.useSessionLyrics) lyrics = session.artifacts.lyrics;
    if (!lyrics) { say(session, 'I need lyrics to film — paste them, or ask me to *write a song* first.'); return { ok: false }; }

    // Merge context: explicit args > session context
    const ctx = session.context;
    const request = {
      lyrics,
      title: args.title || ctx.title || '',
      artistName: args.artistName || ctx.artistName || '',
      genre: args.genre || ctx.genre || undefined,
      captionStyle: args.captionStyle || ctx.captionStyle || 'karaoke',
      aspectRatio: args.aspectRatio || ctx.aspectRatio || '16:9',
      quality: args.quality || ctx.quality || 'standard',
      duration: args.duration || ctx.duration || undefined,
      autoTrack: true,
    };
    if (args.genre) ctx.genre = args.genre;
    if (args.captionStyle) ctx.captionStyle = args.captionStyle;
    if (args.aspectRatio) ctx.aspectRatio = args.aspectRatio;
    if (args.quality) ctx.quality = args.quality;
    if (args.duration) ctx.duration = args.duration;
    ctx.title = request.title; ctx.artistName = request.artistName;

    thought(session, `Configuring the AI Director — ${request.genre || 'auto genre'}, ${request.aspectRatio}, ${request.quality}, captions: ${request.captionStyle}…`);
    const job = createAgentJob(request);
    session.artifacts.lastRenderJobId = job.id;
    emit(session, { type: 'tool', name: 'render_original_video', label: 'AI Director render started', status: 'running', data: { jobId: job.id } });
    say(session, `🎬 Render **${job.id}** launched — I’ll monitor it and hand you the master when it’s done.`);
    return { ok: true, jobId: job.id };
  },

  async monitor_render(session) {
    const jobId = session.artifacts.lastRenderJobId;
    if (!jobId) return { ok: false };
    const milestones = new Set([15, 35, 55, 75, 90]);
    let finalStatus = null;
    for (let i = 0; i < 900; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const job = getAgentJob(jobId);
      if (!job) { say(session, 'Render job vanished — the server may have restarted.'); return { ok: false }; }
      if (job.status === 'FAILED') {
        finalStatus = 'failed';
        emit(session, { type: 'error', text: job.error || 'Render failed' });
        say(session, `⚠️ The render failed: ${job.error || 'unknown error'}. Want me to retry at draft quality?`);
        return { ok: false };
      }
      for (const m of [...milestones]) {
        if (job.progress >= m) {
          milestones.delete(m);
          thought(session, `Render ${job.progress}% — ${job.stage}`);
        }
      }
      if (job.status === 'COMPLETED') { finalStatus = 'completed'; break; }
    }
    const job = getAgentJob(jobId);
    if (finalStatus === 'completed' && job) {
      session.artifacts.lastVideo = { videoUrl: job.videoUrl, posterUrl: job.posterUrl, stats: job.stats };
      emit(session, {
        type: 'video',
        jobId,
        videoUrl: job.videoUrl,
        posterUrl: job.posterUrl,
        downloadUrl: job.downloadUrl,
        srtUrl: job.srtUrl,
        stats: job.stats || {},
      });
      const s = job.stats || {};
      say(session, `★ **That’s a wrap!** Your original music video is ready — ${s.resolution || ''} · ${s.fps || 30}fps · ${s.bpm || '—'} BPM · ${s.originalTrack ? 'original composed score' : 'your track'}. Stream it below or download the MP4 master.`);
    } else if (!finalStatus) {
      say(session, `Render ${jobId} is still painting frames (${getAgentJob(jobId).progress}%). Ask me “status” anytime.`);
    }
    return { ok: finalStatus === 'completed' };
  },

  async get_render_status(session, args) {
    const jobId = args.jobId || session.artifacts.lastRenderJobId;
    if (!jobId) { say(session, 'No render in flight for this session. Ask me to make a video first.'); return { ok: false }; }
    const job = getAgentJob(jobId);
    if (!job) { say(session, `I can’t find job ${jobId} — it may have been cleaned up after a server restart.`); return { ok: false }; }
    emit(session, {
      type: 'status',
      jobId,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      stats: job.stats || null,
    });
    if (job.status === 'COMPLETED') {
      emit(session, { type: 'video', jobId, videoUrl: job.videoUrl, posterUrl: job.posterUrl, downloadUrl: job.downloadUrl, srtUrl: job.srtUrl, stats: job.stats || {} });
      say(session, `✅ **${jobId}** is complete — ${job.stats ? `${job.stats.resolution}, ${job.stats.scenes} scenes` : 'master ready'}. Player below.`);
    } else if (job.status === 'FAILED') {
      say(session, `⚠️ **${jobId}** failed: ${job.error}. I can retry — say “try again”.`);
    } else {
      say(session, `**${jobId}** is ${job.status} at **${job.progress}%** — ${job.stage}`);
    }
    return { ok: true, status: job.status, progress: job.progress };
  },

  async list_renders(session) {
    thought(session, 'Scanning the render library…');
    const renders = listCompletedRenders().slice(0, 8);
    emit(session, { type: 'renders', items: renders });
    if (renders.length === 0) {
      say(session, 'The library is empty — no masters yet. Give me lyrics and I’ll film something original.');
    } else {
      say(session, `You have **${renders.length}** recent master${renders.length > 1 ? 's' : ''} in the library (newest first) — streamed below. Open **Render Library** in the sidebar for the full gallery.`);
    }
    return { ok: true };
  },

  async cancel_render(session, args) {
    const jobId = args.jobId || session.artifacts.lastRenderJobId;
    if (!jobId) { say(session, 'Nothing to cancel.'); return { ok: false }; }
    cancelAgentJob(jobId);
    say(session, `🛑 Cancelled **${jobId}**. Want to start a different one?`);
    return { ok: true };
  },

  async suggest_concepts(session, args) {
    thought(session, 'Brainstorming with the imagery lexicon…');
    const about = args.about || '';
    const seeds = [
      { title: 'Neon Rain Odyssey', pitch: 'A rain-slicked midnight city where every chorus ignites the skyline; verses drift through glowing traffic. Worlds: Neon City → Cyber Tunnel drops.' },
      { title: 'Letters to the Tide', pitch: 'Moonlit ocean vignettes — bioluminescent waves breathe with the kick; the bridge sinks underwater as the vocals hush.' },
      { title: 'Stardust Anthem', pitch: 'A cosmic rise: verses float through nebulae, choruses explode into shooting stars and ringed planets. Finale: a supernova on the last drop.' },
      { title: 'Golden Hour Goodbye', pitch: 'Sunburst love-story silhouettes with glowing hearts rising like lanterns; the outro fades to amber dusk.' },
      { title: 'Wildfire Waltz', pitch: 'Embers and flame-tongues pulse to the beat; the final chorus turns the whole frame into a controlled burn of gold.' },
    ];
    const themed = about ? seeds.sort((a, b) => (b.pitch.toLowerCase().includes(about.split(' ')[0]) ? 1 : 0) - (a.pitch.toLowerCase().includes(about.split(' ')[0]) ? 1 : 0)) : seeds;
    const items = themed.slice(0, 3);
    emit(session, { type: 'concepts', items });
    say(session, 'Three directions I’d love to shoot — tap **Film this** on any of them and I’ll write the lyrics and roll cameras:');
    return { ok: true };
  },

  async production_bible(session) {
    const analysis = session.artifacts.analysis || (session.artifacts.lyrics ? analyzeLyrics(session.artifacts.lyrics, { duration: session.context.duration || 60 }) : null);
    if (!analysis) { say(session, 'I need lyrics first — paste them or ask me to write a song.'); return { ok: false }; }
    thought(session, 'Building the production bible from the real analysis…');
    const dur = session.context.duration || 60;
    const sections = [
      { type: 'Intro', start: 0, end: dur * 0.1, world: analysis.summary.topEnvs[0] || 'Deep Cosmos', energy: 'low' },
      { type: 'Verse 1', start: dur * 0.1, end: dur * 0.3, world: analysis.summary.topEnvs[1] || analysis.summary.topEnvs[0] || 'Neon City', energy: 'building' },
      { type: 'Chorus 1', start: dur * 0.3, end: dur * 0.48, world: analysis.summary.topEnvs[0] || 'Neon City', energy: 'drop' },
      { type: 'Verse 2', start: dur * 0.48, end: dur * 0.64, world: analysis.summary.topEnvs[2] || analysis.summary.topEnvs[1] || 'Moonlit Ocean', energy: 'building' },
      { type: 'Final Chorus', start: dur * 0.64, end: dur * 0.92, world: analysis.summary.topEnvs[0] || 'Neon City', energy: 'drop' },
      { type: 'Outro', start: dur * 0.92, end: dur, world: analysis.summary.topEnvs[analysis.summary.topEnvs.length - 1] || 'Deep Cosmos', energy: 'fade' },
    ];
    const cameraByEnergy = { low: 'Slow push-in, 24mm feel', building: 'Lateral drift + parallax', drop: 'Crash-zoom on the downbeat, beat-flash cuts', fade: 'Crane rise, long dissolve' };
    const bible = {
      title: session.context.title || 'Untitled',
      genre: analysis.genre,
      bpm: analysis.bpm,
      mood: analysis.summary.mood,
      palette: analysis.palette,
      sections: sections.map((s) => ({
        ...s,
        worldLabel: worldLabel(Object.keys(({ neonCity: 1, synthwave: 1, cosmos: 1, ocean: 1, storm: 1, embers: 1, forest: 1, snowfall: 1, desert: 1, cyberGrid: 1, underwater: 1, hearts: 1 })))[0] ? s.world : s.world,
        camera: cameraByEnergy[s.energy],
      })),
      lyricShots: analysis.lines.slice(0, 8).map((l, i) => ({
        n: i + 1,
        time: `${Math.floor(l.time / 60)}:${String(Math.floor(l.time % 60)).padStart(2, '0')}`,
        line: l.text,
        world: worldLabel(analysis.rankedEnvs[i % analysis.rankedEnvs.length]) || 'Neon City',
      })),
    };
    emit(session, { type: 'bible', bible });
    say(session, `📖 Production bible ready — ${analysis.genre} @ ${analysis.bpm} BPM, six timed acts, world assignments per section, camera plan and a lyric-to-shot table. Say **“make the video”** and I’ll execute it.`);
    return { ok: true };
  },

  async set_preferences(session, args) {
    Object.assign(session.context, args);
    const pretty = Object.entries(args).map(([k, v]) => `${k}: ${v}`).join(', ');
    say(session, `Locked in — ${pretty}. Tell me to **make the video** whenever you’re ready.`);
    return { ok: true };
  },

  async request_lyrics(session) {
    say(session, 'I can film this — I just need lyrics. Paste them here, or say **“write me a song about …”** and I’ll write an original one first.');
    return { ok: true };
  },

  async capabilities(session) {
    say(session, [
      'I’m your autonomous video director. Everything I do is **real** — I call the actual engines:',
      '• ✍️ **Write original lyrics** — “write a lo-fi song about midnight rain”',
      '• 🔍 **Analyze lyrics** — paste them and ask “what genre/bpm/world is this?”',
      '• 🎬 **Render original music videos** — “make the video” / “make it 1080p vertical with karaoke captions”',
      '• 📖 **Production bibles** — “give me a shot list”',
      '• 💡 **Concepts** — “pitch me ideas for a breakup anthem”',
      '• 📊 **Status & library** — “status?”, “show my renders”, “cancel the render”',
      'Chain me: *“write a song about stars, then film it in cinematic 1080p.”*',
    ].join('\n'));
    return { ok: true };
  },

  async smalltalk(session, args) {
    const m = String(args.message || '').toLowerCase();
    if (m.match(/\b(hi|hello|hey|yo|sup)\b/)) {
      say(session, 'Hey. I’m your director agent — I can write original lyrics, analyze songs, and render fully original music videos. What are we making today?');
    } else if (m.includes('thank')) {
      say(session, 'Anytime. Say the word when you want the next one.');
    } else {
      say(session, 'I didn’t quite catch a task in that. Try: *“write a synthwave song about neon rain and make the video”* — or say **help** for everything I can do.');
    }
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------
async function runSession(session, message) {
  try {
    session.status = 'working';
    emit(session, { type: 'user', text: message });
    thought(session, 'Understanding the request & drafting a plan…');

    const plan = planFromMessage(message, session);
    session.plan = plan.map((p) => p.tool);
    emit(session, { type: 'plan', steps: plan.map((p) => ({ tool: p.tool, label: toolLabel(p.tool) })) });
    thought(session, `Plan: ${plan.map((p) => toolLabel(p.tool)).join(' → ')}`);

    for (const step of plan) {
      const tool = TOOLS[step.tool];
      if (!tool) continue;
      emit(session, { type: 'tool', name: step.tool, label: toolLabel(step.tool), status: 'running', args: summarizeArgs(step.args) });
      try {
        await tool(session, step.args || {});
        const last = session.events[session.events.length - 1];
        const lastTool = [...session.events].reverse().find((e) => e.type === 'tool' && e.name === step.tool && e.status === 'running');
        if (lastTool) lastTool.status = 'done';
      } catch (err) {
        console.error(`[OpusAgent] tool ${step.tool} failed:`, err);
        const lastTool = [...session.events].reverse().find((e) => e.type === 'tool' && e.name === step.tool && e.status === 'running');
        if (lastTool) lastTool.status = 'error';
        emit(session, { type: 'error', text: err.message });
        say(session, `Hit a snag running **${toolLabel(step.tool)}**: ${err.message}`);
      }
    }
    session.status = 'idle';
  } catch (err) {
    console.error('[OpusAgent] session crashed:', err);
    session.status = 'error';
    emit(session, { type: 'error', text: err.message });
  }
}

function toolLabel(tool) {
  return ({
    write_lyrics: '✍️ Writing original lyrics',
    analyze_lyrics: '🔍 Analyzing lyrics',
    render_original_video: '🎬 Launching AI Director render',
    monitor_render: '📡 Monitoring render',
    get_render_status: '📊 Checking render status',
    list_renders: '🗂 Scanning render library',
    cancel_render: '🛑 Cancelling render',
    suggest_concepts: '💡 Pitching concepts',
    production_bible: '📖 Building production bible',
    set_preferences: '🎛 Updating preferences',
    request_lyrics: '✋ Requesting lyrics',
    capabilities: '🧭 Listing capabilities',
    smalltalk: '💬 Thinking',
  })[tool] || tool;
}

function summarizeArgs(args) {
  if (!args) return {};
  const out = {};
  for (const [k, v] of Object.entries(args)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === 'string' && v.length > 60 ? v.slice(0, 60) + '…' : v;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function startAgentTurn(message, sessionId) {
  let session = sessionId ? sessions.get(sessionId) : null;
  if (!session) session = newSession(message);
  // async: the HTTP call returns immediately with the session id; the client
  // polls the transcript — a real agent-feel with live tool cards.
  setImmediate(() => runSession(session, message));
  return session;
}

function sessionView(session) {
  return {
    id: session.id,
    status: session.status,
    createdAt: session.createdAt,
    events: session.events,
    plan: session.plan,
    context: session.context,
    artifacts: {
      lastRenderJobId: session.artifacts.lastRenderJobId,
      lastVideo: session.artifacts.lastVideo,
      hasLyrics: Boolean(session.artifacts.lyrics),
    },
  };
}

function listSessions(limit = 12) {
  return [...sessions.values()]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit)
    .map((s) => ({ id: s.id, createdAt: s.createdAt, status: s.status, turns: s.events.filter((e) => e.type === 'user').length, lastVideo: s.artifacts.lastVideo ? s.artifacts.lastVideo.videoUrl : null }));
}

/**
 * Run a turn to completion and return the final assistant text (legacy chat
 * API). Render plans are trimmed of long monitoring so replies stay snappy —
 * the reply includes the sessionId for follow-up polling.
 */
async function runTurnSync(message, sessionId) {
  let session = sessionId ? sessions.get(sessionId) : null;
  if (!session) session = newSession(message);
  const plan = planFromMessage(message, session).filter((s) => s.tool !== 'monitor_render');
  for (const step of plan) {
    const tool = TOOLS[step.tool];
    if (!tool) continue;
    try { await tool(session, step.args || {}); } catch (err) { console.error('[OpusAgent] sync tool failed:', err); }
  }
  session.status = 'idle';
  const lastSay = [...session.events].reverse().find((e) => e.type === 'assistant');
  return { reply: lastSay ? lastSay.text : 'Done.', sessionId: session.id };
}

module.exports = { startAgentTurn, getSession, sessionView, listSessions, planFromMessage, TOOLS, runTurnSync };
