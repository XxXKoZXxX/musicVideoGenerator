// server/lyricsParser.js — Server-side synced-lyrics toolkit.
//
// Parses LRC-timed or plain-text lyrics, exports SRT/LRC sidecars, and builds
// FFmpeg `drawtext` filter chains so the render engine can burn synced lyrics
// directly into the exported MP4 master (works for ANY uploaded song).

const LRC_REGEX = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)]/g;

/**
 * Parse lyrics text.
 *  - LRC lines: `[mm:ss.xx] text` (multiple timestamps per line supported)
 *  - Plain text: lines are evenly distributed across `totalDuration`.
 *
 * @returns {Array<{time:number, duration:number, text:string, words:string[]}>}
 */
function parseLyrics(text, totalDuration = 30) {
  if (!text || typeof text !== 'string') return [];

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('[') && !/^[\[\]\w\s:=\-]+$/.test(l) || /\]\s*\S/.test(l));

  const timedLines = [];
  let hasTimestamps = false;

  rawLines.forEach((line) => {
    const matches = [...line.matchAll(LRC_REGEX)];
    matches.forEach((m, k) => {
      hasTimestamps = true;
      const minutes = parseInt(m[1], 10);
      const seconds = parseFloat(m[2]);
      const time = minutes * 60 + seconds;
      // Content runs from this timestamp up to the next one (or end of line)
      const start = m.index + m[0].length;
      const end = k + 1 < matches.length ? matches[k + 1].index : line.length;
      const content = line.slice(start, end).trim();
      if (content) {
        timedLines.push({ time, text: content });
      }
    });
  });

  if (hasTimestamps && timedLines.length > 0) {
    timedLines.sort((a, b) => a.time - b.time);
    const out = [];
    for (let i = 0; i < timedLines.length; i++) {
      const cur = timedLines[i];
      // Collapse exact duplicates (some LRC files repeat lines)
      if (out.length > 0 && out[out.length - 1].text === cur.text && Math.abs(out[out.length - 1].time - cur.time) < 0.35) {
        continue;
      }
      const nextTime = i < timedLines.length - 1 ? timedLines[i + 1].time : totalDuration;
      out.push({
        time: Math.max(0, cur.time),
        duration: Math.max(1.2, Math.min(nextTime, totalDuration) - cur.time),
        text: cur.text,
        words: cur.text.split(/\s+/).filter(Boolean),
      });
    }
    return out;
  }

  // Plain text — distribute evenly across the track.
  const lines = rawLines.length > 0 ? rawLines : text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const count = lines.length;
  if (count === 0) return [];
  const timePerLine = totalDuration / count;
  return lines.map((content, idx) => ({
    time: idx * timePerLine,
    duration: timePerLine,
    text: content,
    words: content.split(/\s+/).filter(Boolean),
  }));
}

/** Active lyric (with word progress) at a given time — mirrors browser LyricsEngine. */
function getActiveLyric(lyrics, elapsed) {
  if (!lyrics || lyrics.length === 0) return null;
  for (let i = 0; i < lyrics.length; i++) {
    const item = lyrics[i];
    if (elapsed >= item.time && elapsed <= item.time + item.duration) {
      const progress = (elapsed - item.time) / item.duration;
      const wordIndex = Math.min(item.words.length - 1, Math.floor(progress * item.words.length));
      return { ...item, progress, wordIndex, isActive: true };
    }
  }
  return null;
}

function fmtSrtTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t - Math.floor(t)) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function fmtLrcTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t - Math.floor(t)) * 100);
  return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}]`;
}

/** Export lyrics as an SRT subtitle document. */
function toSrt(lyrics) {
  if (!lyrics || lyrics.length === 0) return '';
  return lyrics
    .map((l, i) => `${i + 1}\n${fmtSrtTime(l.time)} --> ${fmtSrtTime(l.time + l.duration)}\n${l.text}`)
    .join('\n\n');
}

/** Export lyrics back to LRC (time-coded) document. */
function toLrc(lyrics) {
  if (!lyrics || lyrics.length === 0) return '';
  return lyrics.map((l) => `${fmtLrcTime(l.time)} ${l.text}`).join('\n');
}

/**
 * Escape a string for use inside an FFmpeg drawtext `text=` parameter.
 * drawtext escaping (inside filtergraph): \, ', :, ;, , and [ ] need care.
 */
function escapeDrawtext(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#');
}

/**
 * Build the FFmpeg `drawtext` filter chain for burning synced lyrics into video.
 *
 * Each lyric line becomes one drawtext with an `enable='between(t,start,end)'`
 * window and a short fade-in/out via the `alpha` expression for a smooth
 * kinetic-typography feel.
 *
 * @param {Array} lyrics parsed lyric items {time, duration, text}
 * @param {Object} opts { width, height, style, fontfile, position, fontSizeScale }
 * @returns {string[]} array of drawtext filter strings (to join with ',' in -vf)
 */
function buildDrawtextFilters(lyrics, opts = {}) {
  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const style = opts.style || 'neon';
  const fontfile = opts.fontfile || '';
  const position = opts.position || 'bottom'; // 'top' | 'center' | 'bottom'
  const baseSize = Math.max(28, Math.round(width * 0.038));
  const fontSize = Math.round(baseSize * (opts.fontSizeScale || 1));

  const palette = {
    neon: { main: '#FFFFFF', glow: '#06B6D4', sub: '#EC4899' },
    karaoke: { main: '#FDE68A', glow: '#F59E0B', sub: '#38BDF8' },
    cinema: { main: '#FEF9C3', glow: '#000000', sub: '#000000' },
    glitch: { main: '#FFFFFF', glow: '#00F0FF', sub: '#FF0050' },
    bold: { main: '#FFFFFF', glow: '#8B5CF6', sub: '#EC4899' },
  }[style] || { main: '#FFFFFF', glow: '#06B6D4', sub: '#EC4899' };

  const yExpr =
    position === 'top'
      ? 'h*0.14'
      : position === 'center'
        ? '(h-text_h)/2'
        : 'h*0.80';

  const out = [];

  for (const line of lyrics || []) {
    const start = Math.max(0, line.time);
    const end = Math.min(line.time + line.duration, (opts.duration || start + line.duration) + 0.2);
    if (end <= 0) continue;
    const fadeIn = Math.min(0.25, (end - start) * 0.3);
    const alphaExpr = `min(min(1,(t-${start.toFixed(3)})/${fadeIn.toFixed(3)}),1)*min(min(1,(${end.toFixed(3)}-t)/${fadeIn.toFixed(3)}),1)`;

    let filters = [];

    if (style === 'glitch') {
      // RGB split channels
      filters.push(
        `drawtext=fontfile=${fontfile}:text='${escapeDrawtext(line.text)}':fontcolor=${palette.sub}@0.8:fontsize=${fontSize}:x=(w-text_w)/2-4:y='${yExpr}':enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`,
        `drawtext=fontfile=${fontfile}:text='${escapeDrawtext(line.text)}':fontcolor=${palette.glow}@0.8:fontsize=${fontSize}:x=(w-text_w)/2+4:y='${yExpr}':enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`
      );
    } else if (style !== 'cinema') {
      // Glow pass (blurred shadow color) + bright core
      filters.push(
        `drawtext=fontfile=${fontfile}:text='${escapeDrawtext(line.text)}':fontcolor=${palette.glow}:fontsize=${fontSize + 6}:borderw=10:bordercolor=${palette.glow}@0.55:alpha='${alphaExpr}':x=(w-text_w)/2:y='${yExpr}':enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`
      );
    }

    filters.push(
      `drawtext=fontfile=${fontfile}:text='${escapeDrawtext(line.text)}':fontcolor=${palette.main}:fontsize=${fontSize}:borderw=3:bordercolor=black@0.85:alpha='${alphaExpr}':x=(w-text_w)/2:y='${yExpr}':enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'`
    );

    out.push(...filters);
  }

  return out;
}

/** Locate a usable TTF font for drawtext (DejaVu ships with most systems). */
function findFontfile() {
  const candidates = [
    process.env.LYRIC_FONT_PATH,
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    'C:\\Windows\\Fonts\\arialbd.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (require('fs').existsSync(c)) return c;
    } catch (_) {
      /* ignore */
    }
  }
  return '';
}

module.exports = {
  parseLyrics,
  getActiveLyric,
  toSrt,
  toLrc,
  buildDrawtextFilters,
  escapeDrawtext,
  findFontfile,
};
