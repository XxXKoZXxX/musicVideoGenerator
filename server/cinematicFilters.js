// server/cinematicFilters.js — FFmpeg filter builders for the cinematic master pipeline.
// Pure functions, unit-tested in server/tests/cinematicFilters.test.js

// ---------------------------------------------------------------------------
// COLOR LOOKS (grade presets applied per scene segment)
// ---------------------------------------------------------------------------
const COLOR_LOOKS = {
  standard: { label: 'Standard (True Color)', filter: '' },
  cinematic: {
    label: 'Cinematic Teal & Orange',
    filter: 'eq=contrast=1.12:saturation=0.94:brightness=-0.015,curves=r=0/0 0.25/0.22 0.75/0.8 1/1:b=0/0.04 0.5/0.48 1/0.98',
  },
  vintage: {
    label: 'Vintage 8mm Fade',
    filter: 'eq=contrast=0.94:saturation=0.68:brightness=0.03:gamma=1.12,hue=s=0.75,curves=m=0/0.05 0.5/0.52 1/0.92',
  },
  neon: {
    label: 'Neon Hyper-Saturate',
    filter: 'eq=saturation=1.55:contrast=1.18:brightness=0.01',
  },
  noir: {
    label: 'Noir B&W High-Contrast',
    filter: 'hue=s=0,eq=contrast=1.3:brightness=-0.03:gamma=0.95',
  },
  dreamy: {
    label: 'Dreamy Soft Glow',
    filter: 'eq=brightness=0.055:saturation=1.15:gamma=1.06,gblur=sigma=0.8',
  },
  vivid: {
    label: 'Vivid Pop',
    filter: 'eq=saturation=1.3:contrast=1.12:brightness=0.012',
  },
};

/**
 * Returns the ffmpeg filter string for a color look (empty string for standard).
 */
function buildLookFilter(lookId = 'standard') {
  const look = COLOR_LOOKS[lookId];
  return look ? look.filter : '';
}

/**
 * Safe id list for UI pickers.
 */
function lookIds() {
  return Object.keys(COLOR_LOOKS);
}

function lookLabel(lookId) {
  const look = COLOR_LOOKS[lookId];
  return look ? look.label : 'Standard';
}

// ---------------------------------------------------------------------------
// ATMOSPHERE OVERLAYS
// ---------------------------------------------------------------------------

/**
 * Vignette overlay (subtle cinema edge darkening).
 */
function buildVignetteFilter(strength = 'PI/4.5') {
  return `vignette=angle=${strength}`;
}

/**
 * Temporal film grain overlay. amount 0-30 (higher = grainer).
 */
function buildGrainFilter(amount = 10) {
  const amt = Math.max(1, Math.min(30, Number(amount) || 10));
  return `noise=alls=${amt}:allf=t+u`;
}

// ---------------------------------------------------------------------------
// TRANSITIONS & BEAT FX (per scene segment)
// ---------------------------------------------------------------------------

/**
 * Fade in/out filter pair for a segment of the given duration.
 */
function buildFadeFilter(segmentDuration, fadeSeconds = 0.35) {
  const d = Math.min(fadeSeconds, Math.max(0.1, segmentDuration / 3));
  const outStart = Math.max(0, segmentDuration - d);
  return `fade=t=in:st=0:d=${d.toFixed(2)},fade=t=out:st=${outStart.toFixed(2)}:d=${d.toFixed(2)}`;
}

/**
 * Beat-drop flash: the segment opens on a solid color frame that fades into
 * the scene over `flashDuration` seconds — a punchy white flash on the drop.
 * (Uses the `fade` filter's color source, which is fully supported by the
 * bundled FFmpeg, unlike a runtime-animated drawbox alpha.)
 */
function buildBeatFlashFilter(color = 'white', flashDuration = 0.22) {
  const dur = Math.max(0.08, Math.min(0.6, Number(flashDuration) || 0.22));
  return `fade=t=in:st=0:d=${dur.toFixed(2)}:color=${color}`;
}

// ---------------------------------------------------------------------------
// GRAPHIC OVERLAYS (final pass)
// ---------------------------------------------------------------------------

/**
 * Bottom-right watermark text (small, semi-transparent).
 */
function buildWatermarkFilter(text, fontfile, { x = 'w-tw-16', y = 'h-th-12', fontsize = 20, alpha = 0.55 } = {}) {
  if (!text) return '';
  const safe = String(text)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/;/g, '\\;');
  return (
    `drawtext=text='${safe}':fontfile=${fontfile}:fontsize=${fontsize}` +
    `:fontcolor=white@${alpha}:x=${x}:y=${y}`
  );
}

/**
 * Top-right running timecode overlay (HH:MM:SS:FF style via pts:hms).
 */
function buildTimecodeFilter(fontfile, { x = 'w-tw-16', y = '14', fontsize = 18, alpha = 0.7 } = {}) {
  return (
    `drawtext=text='%{pts\\:hms}':fontfile=${fontfile}:fontsize=${fontsize}` +
    `:fontcolor=white@${alpha}:box=1:boxcolor=black@0.35:boxborderw=6:x=${x}:y=${y}`
  );
}

// ---------------------------------------------------------------------------
// CHAPTERS (MP4 chapter metadata from song structure sections)
// ---------------------------------------------------------------------------

/**
 * Builds an FFmpeg .ffmeta chapters file from song-structure sections.
 * Returns '' when there is nothing to write.
 */
function buildChaptersMeta(sections = [], totalDuration = 0) {
  const valid = (Array.isArray(sections) ? sections : [])
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start && s.end <= totalDuration + 0.001)
    .sort((a, b) => a.start - b.start);

  if (valid.length === 0) return '';

  let meta = '';
  valid.forEach((s, i) => {
    const title = String(s.type || s.label || `Section ${i + 1}`).replace(/[\r\n\[\]=:;#]/g, ' ').replace(/\s+/g, ' ').trim();
    meta += '[CHAPTER]\n';
    meta += 'TIMEBASE=1/1000000\n';
    meta += `START=${Math.floor(s.start * 1000000)}\n`;
    meta += `END=${Math.floor(s.end * 1000000)}\n`;
    meta += `title=${title}\n`;
  });
  return meta;
}

/**
 * Suggests a color look from a song structure's energy profile.
 */
function suggestLook(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return 'cinematic';
  const avg = sections.reduce((acc, s) => acc + (Number(s.energy) || 50), 0) / sections.length;
  const drops = sections.filter((s) => s.isDrop).length;
  if (drops >= 2 || avg >= 80) return 'neon';
  if (avg <= 45) return 'dreamy';
  if (avg >= 65) return 'vivid';
  return 'cinematic';
}

module.exports = {
  COLOR_LOOKS,
  lookIds,
  lookLabel,
  buildLookFilter,
  buildVignetteFilter,
  buildGrainFilter,
  buildFadeFilter,
  buildBeatFlashFilter,
  buildWatermarkFilter,
  buildTimecodeFilter,
  buildChaptersMeta,
  suggestLook,
};
