// src/services/AIDirectorService.js — client for the original generative
// lyrics→video engine (/api/agent-video/*). Same-origin via CRA proxy.

import BACKEND_URL from './backendUrl';

const base = (p) => `${BACKEND_URL}${p}`;

/**
 * Ask the director engine to analyze lyrics without rendering.
 * Returns { genre, bpm, mood, lineCount, worlds, palette }.
 */
export async function previewAnalysis(payload) {
  const res = await fetch(base('/api/agent-video/preview'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');
  return data.analysis;
}

/** Kick off a fully original lyrics→video render. Returns { jobId }. */
export async function createOriginalVideo(request) {
  const res = await fetch(base('/api/agent-video/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Could not start the AI Director');
  return data;
}

/** Poll job status — resolves with the full job (agentLog, progress, videoUrl…). */
export async function getOriginalVideoStatus(jobId) {
  const res = await fetch(base(`/api/agent-video/status/${jobId}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Status check failed');
  return data.job;
}

export async function cancelOriginalVideo(jobId) {
  try {
    await fetch(base(`/api/agent-video/cancel/${jobId}`), { method: 'POST' });
  } catch (_) {}
}

export function subscribeToJob(jobId, onUpdate, intervalMs = 700) {
  let stopped = false;
  let timer = null;
  const tick = async () => {
    if (stopped) return;
    try {
      const job = await getOriginalVideoStatus(jobId);
      if (stopped) return;
      onUpdate(job);
      if (job.status === 'COMPLETED' || job.status === 'FAILED') { stopped = true; return; }
    } catch (_) {}
    timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

/** Read a File/Blob as a base64 data URI (for audio upload to the director). */
export function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
