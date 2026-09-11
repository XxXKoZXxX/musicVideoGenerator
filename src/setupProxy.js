// src/setupProxy.js — CRA dev-server proxy to the local video/render backend.
// Lets the browser use same-origin relative URLs (/api/*, /renders/*, /health)
// so the app works from any preview host, not just localhost.
const { createProxyMiddleware } = require('http-proxy-middleware');

const TARGET = process.env.REACT_APP_VIDEO_SERVER_URL || 'http://localhost:4000';

module.exports = function setupProxy(app) {
  ['/api', '/renders', '/health'].forEach((ctx) => {
    app.use(
      ctx,
      createProxyMiddleware({
        target: TARGET,
        changeOrigin: true,
        logLevel: 'warn',
        onError: (err, req, res) => {
          // If the backend isn't running, fail fast with a clean JSON error
          if (res && !res.headersSent && res.writeHead) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: `Video backend unreachable at ${TARGET}` }));
          }
        },
      })
    );
  });
};
