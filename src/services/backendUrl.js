// src/services/backendUrl.js — Single source of truth for the video backend URL.
//
// Default is SAME-ORIGIN (relative) URLs. In development the CRA dev server proxies
// /api, /renders and /health to the local video server (see src/setupProxy.js),
// so the UI works from any host (localhost, LAN, preview tunnels) without CORS
// headaches or hard-coded localhost:4000.
//
// Override with REACT_APP_VIDEO_SERVER_URL to talk to a remote server directly.

export const BACKEND_URL = process.env.REACT_APP_VIDEO_SERVER_URL || '';

export function withBackend(p) {
  return `${BACKEND_URL}${p}`;
}

export default BACKEND_URL;
