// server/ensureSampleClips.js - Generates guaranteed local sample video clips for instant testing
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SAMPLES_DIR = path.join(__dirname, 'renders', 'samples');

function ensureSampleClips() {
  try {
    if (!fs.existsSync(SAMPLES_DIR)) {
      fs.mkdirSync(SAMPLES_DIR, { recursive: true });
    }

    const s1 = path.join(SAMPLES_DIR, 'cyber_city.mp4');
    const s2 = path.join(SAMPLES_DIR, 'sunset_horizon.mp4');
    const s3 = path.join(SAMPLES_DIR, 'cosmic_nebula.mp4');

    if (!fs.existsSync(s1) || fs.statSync(s1).size < 1000) {
      execSync(`ffmpeg -f lavfi -i "testsrc2=size=1280x720:rate=30" -t 4 -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${s1}" -y`, { stdio: 'ignore' });
    }

    if (!fs.existsSync(s2) || fs.statSync(s2).size < 1000) {
      execSync(`ffmpeg -f lavfi -i "mandelbrot=size=1280x720:rate=30" -t 4 -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${s2}" -y`, { stdio: 'ignore' });
    }

    if (!fs.existsSync(s3) || fs.statSync(s3).size < 1000) {
      execSync(`ffmpeg -f lavfi -i "life=size=1280x720:rate=30" -t 4 -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${s3}" -y`, { stdio: 'ignore' });
    }

    const publicSamplesDir = path.join(__dirname, '..', 'public', 'renders', 'samples');
    if (!fs.existsSync(publicSamplesDir)) {
      try { fs.mkdirSync(publicSamplesDir, { recursive: true }); } catch (_) {}
    }
    for (const f of [s1, s2, s3]) {
      const dest = path.join(publicSamplesDir, path.basename(f));
      if (fs.existsSync(f) && (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(f).size)) {
        try { fs.copyFileSync(f, dest); } catch (_) {}
      }
    }

    return [s1, s2, s3];
  } catch (err) {
    console.warn('[SampleClips] Notice generating sample video clips:', err.message);
    return [];
  }
}

module.exports = {
  SAMPLES_DIR,
  ensureSampleClips,
};
