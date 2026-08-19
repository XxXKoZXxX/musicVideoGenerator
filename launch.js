const { spawn } = require('child_process');
const path = require('path');

// Start the web server (serve.js on port 3210)
const web = spawn('node', ['serve.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Start the video API server (server/index.js on port 4000)
const video = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

web.on('error', (err) => console.error('Web server error:', err));
video.on('error', (err) => console.error('Video server error:', err));

process.on('SIGINT', () => {
  web.kill();
  video.kill();
  process.exit();
});

console.log('🚀 Launching Astraea Cosmic Studio...');
console.log('   Web UI:    http://localhost:3210');
console.log('   Video API: http://localhost:4000');
