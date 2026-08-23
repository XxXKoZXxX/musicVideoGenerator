// package-standalone-musicvid.js - Automated Packager for Standalone Music Video & Vocal Studio App
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const buildDir = path.join(rootDir, 'build');
const publicZipPath = path.join(rootDir, 'public', 'Astraea_MusicVideo_Studio.zip');
const buildZipPath = path.join(buildDir, 'Astraea_MusicVideo_Studio.zip');

console.log('🎬 Packaging Astraea Standalone Music Video & Vocal Studio App (.zip)...');

// Verify build exists
if (!fs.existsSync(buildDir)) {
  console.log('⚠️ Build directory not found. Running react-scripts build first...');
  execSync('npm run react-build', { stdio: 'inherit', cwd: rootDir });
}

try {
  const stagingDir = path.join(rootDir, '.temp_musicvid_stage');
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  // Copy build contents excluding any existing .zip files
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.name.endsWith('.zip')) continue;

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursive(buildDir, stagingDir);

  if (fs.existsSync(publicZipPath)) fs.unlinkSync(publicZipPath);

  const psCmd = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${publicZipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit', cwd: rootDir });

  if (fs.existsSync(buildDir)) {
    fs.copyFileSync(publicZipPath, buildZipPath);
  }

  fs.rmSync(stagingDir, { recursive: true, force: true });

  const stats = fs.statSync(publicZipPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Astraea_MusicVideo_Studio.zip generated successfully (${sizeMb} MB) in:`);
  console.log(`   - public/Astraea_MusicVideo_Studio.zip`);
  console.log(`   - build/Astraea_MusicVideo_Studio.zip`);
} catch (err) {
  console.error('❌ Failed to package Standalone Music Video App zip:', err);
  process.exit(1);
}
