// server/happyhorseEngine.js — optional AI-video engine backed by the
// HappyHorse CLI (Alibaba HappyHorse 1.0: text-to-video / image-to-video with
// native synchronized audio, 2–15s clips, up to 1080p).
//
// The CLI is NOT bundled and is NOT required: this engine detects it at
// runtime (`happyhorse` on PATH or HH_CLI_PATH env). When present, the AI
// Director can render real AI-model footage per song section, mux the
// original/composed soundtrack over it and burn the lyrics. When absent —
// or if anything fails — the caller falls back to the procedural engine.
//
// Windows install (user's machine, NOT this sandbox):
//   irm https://happyhorse-cli-releases.oss-accelerate.aliyuncs.com/happyhorse-cli/install.ps1 | iex
// Manual / custom location:
//   set HH_CLI_PATH=C:\path\to\happyhorse.exe
//
// The exact generate subcommand varies between CLI versions. Override it with
// HH_GEN_ARGS if needed, e.g.:
//   HH_GEN_ARGS="generate --prompt {prompt} --duration {duration} --resolution {resolution} --output {output}"

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { ffmpegPath, ffprobePath } = require('./ffmpegPaths');

const DEFAULT_GEN_TEMPLATE =
  'generate --prompt {prompt} --duration {duration} --resolution {resolution} --output {output}';

let cachedStatus = null;
let cachedStatusAt = 0;

function run(cmd, args, timeoutMs) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, windowsHide: true, encoding: 'utf8' }, (err, stdout, stderr) => {
      resolve({ err, stdout: String(stdout || ''), stderr: String(stderr || '') });
    });
  });
}

function candidatePaths() {
  const list = [];
  if (process.env.HH_CLI_PATH) list.push(process.env.HH_CLI_PATH);
  list.push('happyhorse');
  const home = os.homedir();
  list.push(path.join(home, '.happyhorse', 'bin', 'happyhorse'));
  list.push(path.join(home, 'happyhorse', 'happyhorse.exe'));
  return list;
}

/** Detect the HappyHorse CLI and its version (cached for 30s). */
async function getStatus(force = false) {
  if (!force && cachedStatus && Date.now() - cachedStatusAt < 30000) return cachedStatus;
  let status = { available: false, version: null, path: null, source: null };
  for (const candidate of candidatePaths()) {
    const isPathLike = /[\\/]/.test(candidate);
    const res = await run(candidate, ['--version'], 8000);
    const out = (res.stdout || '').trim();
    if (!res.err && out) {
      status = {
        available: true,
        version: out.split('\n')[0].slice(0, 80),
        path: isPathLike ? candidate : candidate,
        source: process.env.HH_CLI_PATH && candidate === process.env.HH_CLI_PATH ? 'HH_CLI_PATH' : isPathLike ? 'install-location' : 'PATH',
      };
      break;
    }
  }
  cachedStatus = status;
  cachedStatusAt = Date.now();
  return status;
}

function genTemplate() {
  return process.env.HH_GEN_ARGS || DEFAULT_GEN_TEMPLATE;
}

function shellSplit(template) {
  // split on spaces but keep "quoted strings" together
  const out = [];
  let cur = '';
  let q = null;
  for (const ch of template) {
    if (q) {
      if (ch === q) q = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      q = ch;
    } else if (ch === ' ') {
      if (cur) { out.push(cur); cur = ''; }
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Generate one AI clip with the HappyHorse CLI.
 * @returns {Promise<{path:string}>} absolute path to a playable video file
 */
async function generateClip({ prompt, durationSec = 10, resolution = '720p', outPath, timeoutMs = 10 * 60 * 1000, onLog = () => {} }) {
  const status = await getStatus(true); // fresh detection: cheap, and immune to stale caches
  if (!status.available) throw new Error('HappyHorse CLI not found (set HH_CLI_PATH or install it — see README)');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const tpl = genTemplate()
    .replace('{prompt}', String(prompt).replace(/["\n]/g, ' ').slice(0, 600))
    .replace('{duration}', String(Math.max(2, Math.min(15, Math.round(durationSec)))))
    .replace('{resolution}', String(resolution))
    .replace('{output}', outPath);
  const args = shellSplit(tpl);

  onLog(`HappyHorse: generating ${Math.round(durationSec)}s ${resolution} clip…`);
  const res = await run(status.path, args, timeoutMs);
  if (res.err && !fs.existsSync(outPath)) {
    // Some versions print a URL to fetch instead of writing the file
    const urlMatch = (res.stdout || '').match(/https?:\/\/\S+\.(?:mp4|mov|webm)\S*/i);
    if (urlMatch) {
      onLog('HappyHorse: downloading clip from returned URL…');
      const r = await fetch(urlMatch[0]);
      if (!r.ok) throw new Error(`Clip download failed (HTTP ${r.status})`);
      fs.writeFileSync(outPath, Buffer.from(await r.arrayBuffer()));
    } else {
      const detail = (res.stderr || res.stdout || res.err.message || '').trim().split('\n').slice(-3).join(' | ').slice(0, 300);
      throw new Error(`HappyHorse CLI failed: ${detail || 'no output'}. If the generate syntax differs, set HH_GEN_ARGS (see README).`);
    }
  }
  if (!fs.existsSync(outPath)) throw new Error('HappyHorse CLI reported success but no clip file was found');
  return { path: outPath };
}

/** Probe duration of a media file (seconds). */
function probeDuration(file) {
  return new Promise((resolve) => {
    execFile(ffprobePath, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
      { timeout: 20000, windowsHide: true }, (err, stdout) => {
        const v = parseFloat(String(stdout || '').trim());
        resolve(err || Number.isNaN(v) ? null : v);
      });
  });
}

/** Normalize any clip to exact length/res/fps so concat + mux are safe. */
async function fitClipToSection(inPath, targetSec, W, H, outPath) {
  const t = Math.max(1, targetSec);
  await new Promise((resolve, reject) => {
    execFile(ffmpegPath, [
      '-y', '-loglevel', 'error', '-i', inPath,
      '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=${Math.ceil(t) + 1}`,
      '-t', String(t), '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
      outPath,
    ], { timeout: 5 * 60 * 1000, windowsHide: true }, (err, stdout, stderr) => {
      if (err) reject(new Error(`clip fit failed: ${String(stderr || err.message).slice(0, 200)}`));
      else resolve();
    });
  });
  return outPath;
}

/** Build a music-video prompt for a section of the song. */
function buildPrompt(analysis, sectionTypes, lyricExcerpt) {
  const env = (analysis.summary.topEnvs && analysis.summary.topEnvs[0]) || 'cinematic';
  const mood = (analysis.summary && analysis.summary.mood) || 'cinematic';
  return [
    'Cinematic music video scene,', `${env} world,`, `${mood} mood,`,
    sectionTypes ? `${sectionTypes} energy,` : '',
    lyricExcerpt ? `inspired by the line "${String(lyricExcerpt).slice(0, 90)}",` : '',
    'photorealistic, dynamic camera movement, dramatic music-video lighting, film grain, 4k detail',
  ].filter(Boolean).join(' ');
}

/** Group song sections into ≤ cap windows of ≤ 15s each (model clip limit). */
function buildWindows(sections, duration, cap) {
  const secs = (sections && sections.length ? sections : [{ type: 'song', start: 0, end: duration }])
    .map((s) => ({ type: s.type || 'song', start: Math.max(0, s.start), end: Math.min(duration, s.end) }))
    .filter((s) => s.end > s.start);
  // merge adjacent sections into at most `cap` windows
  const windows = [];
  const per = Math.ceil(secs.length / cap);
  for (let i = 0; i < secs.length; i += per) {
    const group = secs.slice(i, i + per);
    let w = {
      type: group[0].type,
      start: group[0].start,
      end: group[group.length - 1].end,
      types: group.map((g) => g.type).join('+'),
    };
    // clip limit: split windows longer than 15s (tail becomes hold-frame coverage)
    if (w.end - w.start > 15) w.end = w.start + 15;
    windows.push(w);
  }
  return windows;
}

function escapeSubtitlesPath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

/**
 * Full alternate render pipeline: AI clips per section + soundtrack + lyrics.
 * Returns a result shaped like renderOriginalVideo's so the job plumbing is shared.
 */
async function renderHappyHorseVideo(analysis, audioInfo, opts, job, RENDERS_DIR, hhOpts = {}) {
  const { onLog = (m) => job && job.agentLog.push({ t: Date.now(), msg: m }) } = hhOpts;
  const duration = audioInfo.duration;
  const quality = opts.quality || 'standard';
  const DIMS = { draft: [854, 480], standard: [1280, 720], master: [1920, 1080] };
  const [W, H] = DIMS[quality] || DIMS.standard;
  const caps = { draft: 4, standard: 6, master: 8 };
  const cap = caps[quality] || 6;

  const windows = buildWindows(audioInfo.sections, duration, cap);
  const coverage = windows.reduce((s, w) => s + (w.end - w.start), 0);
  onLog(`HappyHorse engine: ${windows.length} AI clip${windows.length > 1 ? 's' : ''} planned (${Math.round(coverage)}s of ${Math.round(duration)}s${coverage < duration ? `, final shot holds for the rest` : ''})`);

  const jobTemp = path.resolve(RENDERS_DIR, '..', 'temp', `hh_${job ? job.id : Date.now()}`);
  fs.mkdirSync(jobTemp, { recursive: true });

  // lyric line nearest each window start, for prompts
  const lineAt = (t) => {
    let best = null;
    for (const l of analysis.lines) {
      if (l.time != null && l.time <= t + 0.5 && (!best || l.time > best.time)) best = l;
    }
    return best ? best.text : '';
  };

  const segments = [];
  for (let i = 0; i < windows.length; i++) {
    if (job && job.cancelRequested) throw new Error('Render cancelled');
    const w = windows[i];
    const prompt = buildPrompt(analysis, w.types, lineAt(w.start));
    const rawClip = path.join(jobTemp, `raw_${i}.mp4`);
    await generateClip({
      prompt,
      durationSec: w.end - w.start,
      resolution: quality === 'master' ? '1080p' : '720p',
      outPath: rawClip,
      onLog,
    });
    const seg = path.join(jobTemp, `seg_${i}.mp4`);
    await fitClipToSection(rawClip, w.end - w.start, W, H, seg);
    segments.push(seg);
    onLog(`HappyHorse: clip ${i + 1}/${windows.length} ready (${w.type})`);
    if (job) job.progress = Math.min(88, 12 + Math.round(((i + 1) / windows.length) * 70));
  }

  // concat segments (identical codecs after fit)
  const listFile = path.join(jobTemp, 'concat.txt');
  fs.writeFileSync(listFile, segments.map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join('\n'));
  const concatPath = path.join(jobTemp, 'concat.mp4');
  await new Promise((resolve, reject) => {
    execFile(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', concatPath],
      { timeout: 10 * 60 * 1000, windowsHide: true }, (err, stdout, stderr) => {
        if (err) reject(new Error(`concat failed: ${String(stderr || err.message).slice(0, 200)}`));
        else resolve();
      });
  });

  // hold last frame if AI coverage is shorter than the song
  let visualPath = concatPath;
  if (coverage < duration - 0.5) {
    const heldPath = path.join(jobTemp, 'held.mp4');
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-loglevel', 'error', '-i', concatPath,
        '-vf', `tpad=stop_mode=clone:stop_duration=${Math.ceil(duration)}`, '-t', String(duration), '-an',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', heldPath],
        { timeout: 10 * 60 * 1000, windowsHide: true }, (err, stdout, stderr) => {
          if (err) reject(new Error(`hold-frame extend failed: ${String(stderr || err.message).slice(0, 200)}`));
          else resolve();
        });
    });
    visualPath = heldPath;
  }

  // mux the soundtrack
  const muxedPath = path.join(jobTemp, 'muxed.mp4');
  if (audioInfo.path && fs.existsSync(audioInfo.path)) {
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-loglevel', 'error', '-i', visualPath, '-i', audioInfo.path,
        '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', muxedPath],
        { timeout: 10 * 60 * 1000, windowsHide: true }, (err, stdout, stderr) => {
          if (err) reject(new Error(`audio mux failed: ${String(stderr || err.message).slice(0, 200)}`));
          else resolve();
        });
    });
  } else {
    fs.copyFileSync(visualPath, muxedPath);
  }

  // burn lyrics (subtitles filter); if the ffmpeg build lacks libass, ship un-burned + SRT sidecar
  let finalPath = muxedPath;
  let lyricsBurned = false;
  try {
    const { toSrt } = require('./lyricsParser');
    const srtPath = path.join(jobTemp, 'burn.srt');
    fs.writeFileSync(srtPath, toSrt(analysis.lines || []));
    const burnedPath = path.join(jobTemp, 'burned.mp4');
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-loglevel', 'error', '-i', muxedPath,
        '-vf', `subtitles='${escapeSubtitlesPath(srtPath)}':force_style='FontSize=18,Outline=1,Bold=1'`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'copy', burnedPath],
        { timeout: 10 * 60 * 1000, windowsHide: true }, (err) => (err ? reject(err) : resolve()));
    });
    finalPath = burnedPath;
    lyricsBurned = true;
  } catch (_) { /* libass unavailable or empty lines — sidecar still delivered */ }

  // ship to renders dir
  const outName = job && job.outputFileName ? job.outputFileName : `happyhorse_${Date.now()}.mp4`;
  const outPath = path.resolve(RENDERS_DIR, outName);
  fs.mkdirSync(RENDERS_DIR, { recursive: true });
  fs.copyFileSync(finalPath, outPath);

  // poster from real AI footage
  let posterUrl = null;
  try {
    const posterName = outName.replace(/\.mp4$/, '_poster.png');
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-loglevel', 'error', '-ss', String(Math.min(3, duration * 0.3)), '-i', outPath,
        '-frames:v', '1', path.join(RENDERS_DIR, posterName)],
        { timeout: 60000, windowsHide: true }, (err) => (err ? reject(err) : resolve()));
    });
    posterUrl = `/renders/${posterName}`;
  } catch (_) { /* poster optional */ }

  const dur = (await probeDuration(outPath)) || duration;
  if (job) {
    if (posterUrl) job.posterUrl = posterUrl;
    job.progress = 96;
  }

  // cleanup big temps
  try { fs.rmSync(jobTemp, { recursive: true, force: true }); } catch (_) {}

  const fps = 30;
  return {
    engine: 'happyhorse',
    totalFrames: Math.round(dur * fps),
    fps,
    W,
    H,
    scenes: windows,
    lyricsBurned,
    duration: dur,
  };
}

module.exports = {
  getStatus,
  generateClip,
  fitClipToSection,
  buildPrompt,
  buildWindows,
  renderHappyHorseVideo,
  probeDuration,
};
