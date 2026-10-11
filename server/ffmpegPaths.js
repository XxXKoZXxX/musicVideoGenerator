// server/ffmpegPaths.js — Resolves working ffmpeg/ffprobe binaries.
//
// Preference order:
//   1. Explicit env override (FFMPEG_PATH / FFPROBE_PATH)
//   2. npm-installed static binaries (@ffmpeg-installer/ffmpeg, ffprobe-static)
//   3. System PATH (bare "ffmpeg" / "ffprobe")
const fs = require('fs');
const { execSync } = require('child_process');

function resolveFromNpm(moduleName) {
  try {
    const mod = require(moduleName);
    const p = typeof mod === 'string' ? mod : mod && mod.path;
    if (p && fs.existsSync(p)) return p;
  } catch (_) {
    /* module not installed — fall through */
  }
  return null;
}

function resolveBinary(envName, npmModule, bareName) {
  if (process.env[envName] && fs.existsSync(process.env[envName])) {
    return process.env[envName];
  }
  const fromNpm = resolveFromNpm(npmModule);
  if (fromNpm) return fromNpm;

  // Last resort: assume it is on PATH
  try {
    execSync(`${bareName} -version`, { stdio: 'ignore', timeout: 3000 });
    return bareName;
  } catch (_) {
    return null;
  }
}

const ffmpegPath = resolveBinary('FFMPEG_PATH', '@ffmpeg-installer/ffmpeg', 'ffmpeg');
const ffprobePath = resolveBinary('FFPROBE_PATH', 'ffprobe-static', 'ffprobe');

/**
 * Quick availability probe (used at boot so UIs can surface a helpful error).
 */
function probe() {
  let available = false;
  if (ffmpegPath) {
    try {
      execSync(`${ffmpegPath} -version`, { stdio: 'ignore', timeout: 5000 });
      available = true;
    } catch (_) {
      available = false;
    }
  }
  return {
    available,
    ffmpeg: ffmpegPath,
    ffprobe: ffprobePath || null,
    source: !available ? 'none' : ffmpegPath === 'ffmpeg' ? 'system-path' : 'bundled-npm',
  };
}

const info = probe();

module.exports = {
  ffmpegPath: info.ffmpeg,
  ffprobePath: info.ffprobe,
  isFFmpegAvailable: info.available,
  ffmpegSource: info.source,
  probe,
};
