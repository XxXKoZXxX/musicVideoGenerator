const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const PORT = 3210;
const BUILD_DIR = path.join(__dirname, 'build');
const CLOUDFLARED_BIN = path.join(__dirname, 'cloudflared.exe');

let currentTunnelUrl = 'https://wonder-lobby-chelsea-enters.trycloudflare.com';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.zip': 'application/zip'
};

// 1. Static Web Server
const server = http.createServer((req, res) => {
  try {
    let reqPath = req.url.split('?')[0];

    // API endpoint for real-time live tunnel detection
    if (reqPath === '/active_url.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      return res.end(JSON.stringify({ url: currentTunnelUrl, status: 'online' }));
    }

    let filePath = path.join(BUILD_DIR, reqPath);

    // Normalize and prevent directory traversal
    if (!filePath.startsWith(BUILD_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // SPA fallback
    if (!fs.existsSync(filePath)) {
      filePath = path.join(BUILD_DIR, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end('Not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n===================================================================`);
  console.log(`  ✨ Astraea Server running locally on port ${PORT}...`);
  console.log(`  🌐 Connecting to Cloudflare Tunnel for Public Sharing...`);
  console.log(`===================================================================\n`);
  
  startTunnel();
});

// 2. Cloudflare Tunnel Manager
function startTunnel() {
  if (!fs.existsSync(CLOUDFLARED_BIN)) {
    console.log(`[!] cloudflared.exe not found. Running in local network mode only.`);
    console.log(`    Local:  http://localhost:${PORT}`);
    console.log(`    Wi-Fi:  http://192.168.86.210:${PORT}\n`);
    return;
  }

  const tunnel = spawn(CLOUDFLARED_BIN, [
    'tunnel',
    '--url', `http://localhost:${PORT}`,
    '--protocol', 'http2',
    '--edge-ip-version', '4'
  ]);

  let captured = false;

  const handleLog = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !captured) {
      captured = true;
      currentTunnelUrl = match[0];
      
      // Save link to file
      try {
        fs.writeFileSync(path.join(__dirname, 'public_url.txt'), currentTunnelUrl);
        fs.writeFileSync(path.join(BUILD_DIR, 'active_url.json'), JSON.stringify({ url: currentTunnelUrl, status: 'online' }));
      } catch (e) {}

      // Copy to clipboard on Windows
      exec(`powershell -Command "Set-Clipboard -Value '${currentTunnelUrl}'"`, () => {});

      console.log(`\n===================================================================`);
      console.log(`  ✨ ASTRAEA LIVE SHARE & TESTER LINK IS ACTIVE! ✨`);
      console.log(`===================================================================`);
      console.log(`\n  👉 Send this link to anyone to test (iPhone, Android, PC):`);
      console.log(`     \x1b[33m\x1b[1m${currentTunnelUrl}\x1b[0m\n`);
      console.log(`  📋 Copied to Windows Clipboard! Just press Ctrl+V to paste.`);
      console.log(`  📱 Home Wi-Fi link: http://192.168.86.210:${PORT}`);
      console.log(`  💻 Local Machine:   http://localhost:${PORT}\n`);
      console.log(`  (Keep this window open while testers are using the app)`);
      console.log(`===================================================================\n`);
    }
  };

  tunnel.stdout.on('data', handleLog);
  tunnel.stderr.on('data', handleLog);

  tunnel.on('close', (code) => {
    console.log(`[!] Cloudflare Tunnel disconnected (code ${code}). Reconnecting in 5s...`);
    setTimeout(startTunnel, 5000);
  });
}
