// package-mobile.js - Automated Packager for Standalone Mobile Web / PWA Zip
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const buildDir = path.join(rootDir, 'build');
const publicZipPath = path.join(rootDir, 'public', 'Astraea_Mobile_App.zip');
const buildZipPath = path.join(buildDir, 'Astraea_Mobile_App.zip');

console.log('📦 Packaging Astraea Standalone Mobile Web App (.zip)...');

// Verify build exists
if (!fs.existsSync(buildDir)) {
  console.log('⚠️ Build directory not found. Running build:mobile first...');
  execSync('npm run build:mobile', { stdio: 'inherit', cwd: rootDir });
}

try {
  // Temporary staging folder without recursive zip
  const stagingDir = path.join(rootDir, '.temp_mobile_stage');
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

  // Use PowerShell Compress-Archive on Windows
  if (fs.existsSync(publicZipPath)) fs.unlinkSync(publicZipPath);
  
  const psCmd = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${publicZipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit', cwd: rootDir });

  // Copy to build folder as well
  if (fs.existsSync(buildDir)) {
    fs.copyFileSync(publicZipPath, buildZipPath);
  }

  // Cleanup staging
  fs.rmSync(stagingDir, { recursive: true, force: true });

  const stats = fs.statSync(publicZipPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Astraea_Mobile_App.zip generated successfully (${sizeMb} MB) in:`);
  console.log(`   - public/Astraea_Mobile_App.zip`);
  console.log(`   - build/Astraea_Mobile_App.zip`);
} catch (err) {
  console.error('❌ Error packaging mobile app zip:', err);
  process.exit(1);
}
