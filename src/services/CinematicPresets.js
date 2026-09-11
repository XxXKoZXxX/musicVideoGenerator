// src/services/CinematicPresets.js — Platform presets, color looks & auto-grade logic
// for the server MP4 master pipeline (server/cinematicFilters.js implements the
// matching FFmpeg filters).

export const PLATFORM_PRESETS = [
  {
    id: 'tiktok',
    name: 'TikTok / Reels',
    icon: '📱',
    aspectRatio: '9:16',
    resolution: '1080p',
    hint: 'Vertical 1080×1920 — first 3 seconds matter',
  },
  {
    id: 'instagram',
    name: 'Instagram Feed',
    icon: '📸',
    aspectRatio: '1:1',
    resolution: '1080p',
    hint: 'Square 1080×1080 feed post',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    aspectRatio: '16:9',
    resolution: '1080p',
    hint: 'Standard 1920×1080 horizontal',
  },
  {
    id: 'x',
    name: 'X / Twitter',
    icon: '🐦',
    aspectRatio: '16:9',
    resolution: '720p',
    hint: 'Lightweight 1280×720 for fast embedding',
  },
  {
    id: 'cinematic',
    name: 'Cinema 21:9',
    icon: '🎬',
    aspectRatio: '21:9',
    resolution: '1080p',
    hint: 'Ultrawide theatrical crop',
  },
  {
    id: 'story',
    name: 'Story 4:5',
    icon: '🖼️',
    aspectRatio: '4:5',
    resolution: '1080p',
    hint: 'Portrait 1080×1350 feed story',
  },
];

export const COLOR_LOOKS = [
  { id: 'standard', name: 'Standard (True Color)', icon: '⚪' },
  { id: 'cinematic', name: 'Cinematic Teal & Orange', icon: '🎞️' },
  { id: 'vintage', name: 'Vintage 8mm Fade', icon: '📼' },
  { id: 'neon', name: 'Neon Hyper-Saturate', icon: '💜' },
  { id: 'noir', name: 'Noir B&W High-Contrast', icon: '🌑' },
  { id: 'dreamy', name: 'Dreamy Soft Glow', icon: '🌸' },
  { id: 'vivid', name: 'Vivid Pop', icon: '🌈' },
];

/**
 * Suggests a color look from a song-structure energy profile.
 * (Mirrors server/cinematicFilters.js suggestLook for instant UI feedback.)
 */
export function suggestLook(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return 'cinematic';
  const avg = sections.reduce((acc, s) => acc + (Number(s.energy) || 50), 0) / sections.length;
  const drops = sections.filter((s) => s.isDrop).length;
  if (drops >= 2 || avg >= 80) return 'neon';
  if (avg <= 45) return 'dreamy';
  if (avg >= 65) return 'vivid';
  return 'cinematic';
}

/**
 * Builds the render options object the server engine understands, from
 * StepFour settings state.
 */
export function buildServerRenderOptions(settings = {}, project = {}) {
  const sections = project.songStructure?.sections || [];
  return {
    resolution: settings.resolution || '1080p',
    fps: settings.fps || 30,
    colorLook: settings.colorLook || 'standard',
    vignette: Boolean(settings.cineVignette),
    filmGrain: Boolean(settings.cineGrain),
    transitions: settings.cineTransitions ? 'fade' : 'none',
    beatFlash: settings.cineBeatFlash !== false,
    watermarkText: typeof settings.watermarkText === 'string' ? settings.watermarkText : '',
    timecode: Boolean(settings.cineTimecode),
    loudnessNormalize: Boolean(settings.cineLoudness),
    chapters: sections.length > 0,
  };
}

/**
 * Default cinematic settings for a new project (sensible toggles on).
 */
export function defaultCinematicSettings(project = {}) {
  return {
    colorLook: project.colorLook || 'standard',
    cineVignette: project.cineVignette !== false,
    cineGrain: false,
    cineTransitions: project.cineTransitions !== false,
    cineBeatFlash: project.cineBeatFlash !== false,
    cineTimecode: false,
    cineLoudness: project.cineLoudness !== false,
    watermarkText: project.watermarkText || '',
  };
}
