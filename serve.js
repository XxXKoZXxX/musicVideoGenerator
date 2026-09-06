const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3210;
const BUILD_DIR = path.join(__dirname, 'build');

function getLocalIpAddress() {
  const ifaces = os.networkInterfaces();
  for (const dev in ifaces) {
    for (const details of ifaces[dev]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIpAddress();
const LOCAL_WIFI_URL = `http://${LOCAL_IP}:${PORT}`;

let currentTunnelUrl = '';
try {
  const savedUrlPath = path.join(__dirname, 'public_url.txt');
  if (fs.existsSync(savedUrlPath)) {
    currentTunnelUrl = fs.readFileSync(savedUrlPath, 'utf8').trim();
  }
} catch (e) {}

let currentExecToken = '';
try {
  const tokenPath = path.join(__dirname, 'chatgpt_token.txt');
  if (fs.existsSync(tokenPath)) {
    currentExecToken = fs.readFileSync(tokenPath, 'utf8').trim();
  }
} catch (e) {}

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
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.zip': 'application/zip'
};

const VIDEO_SERVER_PORT = process.env.VIDEO_PORT || 4000;

function shouldProxyToVideoServer(reqPath) {
  return (
    reqPath.startsWith('/api/') ||
    reqPath.startsWith('/renders/') ||
    reqPath.startsWith('/v1/') ||
    reqPath.startsWith('/.well-known/') ||
    reqPath === '/openapi.json' ||
    reqPath === '/openapi.yaml'
  );
}

function proxyToVideoServer(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    return res.end();
  }

  const options = {
    hostname: '127.0.0.1',
    port: VIDEO_SERVER_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${VIDEO_SERVER_PORT}`,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'] || (currentTunnelUrl.startsWith('https') ? 'https' : 'http'),
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers, 'Access-Control-Allow-Origin': '*' };
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy] Error connecting to video server at :${VIDEO_SERVER_PORT}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Video generator backend server is offline. Please ensure npm run server (port 4000) is running.',
        details: err.message
      }));
    }
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = req.url.split('?')[0];

    // Proxy video generator, API, OpenAPI and ChatGPT action endpoints to backend server
    if (shouldProxyToVideoServer(reqPath)) {
      return proxyToVideoServer(req, res);
    }

    // API endpoint for real-time live network info
    if (reqPath === '/active_url.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      return res.end(JSON.stringify({
        url: currentTunnelUrl || LOCAL_WIFI_URL,
        publicUrl: currentTunnelUrl,
        wifiUrl: LOCAL_WIFI_URL,
        localIp: LOCAL_IP,
        port: PORT,
        execToken: currentExecToken,
        status: 'online'
      }));
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
  console.log(`✨ Astraea Mobile App Server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Wi-Fi:   ${LOCAL_WIFI_URL}`);
  if (currentTunnelUrl) {
    console.log(`   - Public:  ${currentTunnelUrl}`);
  }
});
