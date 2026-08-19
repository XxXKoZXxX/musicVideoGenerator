const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Astraea Cosmic Studio...');

const rootDir = path.resolve(__dirname);
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const appProcess = spawn(npmCmd, ['start'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

appProcess.on('error', (err) => {
  console.error('Failed to start process:', err);
});

appProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Process exited with code ${code}`);
  }
});
