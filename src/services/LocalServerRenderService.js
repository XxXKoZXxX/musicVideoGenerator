// src/services/LocalServerRenderService.js - Client for dedicated local backend video rendering server

const BACKEND_URL = process.env.REACT_APP_VIDEO_SERVER_URL || 'http://localhost:4000';

/**
 * Initiates a server-side video rendering job.
 */
export async function startServerRender(project, options = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/server-render/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, options }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[LocalServerRenderService] Start render failed:', err);
    throw err;
  }
}

/**
 * Polls the current status of a server render job.
 */
export async function pollServerRenderStatus(jobId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/server-render/status/${jobId}`);
    if (!res.ok) {
      throw new Error(`Status check failed: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.job;
  } catch (err) {
    console.warn(`[LocalServerRenderService] Status check error for ${jobId}:`, err.message);
    throw err;
  }
}

/**
 * Full orchestrator: Submits render job and polls until complete with progress updates.
 *
 * @param {Object} project - Project state containing images, audio, bpm, duration, etc.
 * @param {Object} options - Resolution, FPS, motion presets.
 * @param {Function} onProgress - Callback with ({ status, stage, progress, videoUrl, downloadUrl })
 * @returns {Promise<Object>} Completed job details
 */
export async function renderVideoOnServer(project, options = {}, onProgress = null) {
  const initResult = await startServerRender(project, options);
  const jobId = initResult.jobId;

  if (onProgress) {
    onProgress({
      jobId,
      status: initResult.status || 'QUEUED',
      stage: initResult.stage || 'Job Initialized',
      progress: 5,
      videoUrl: `${BACKEND_URL}${initResult.videoUrl}`,
      downloadUrl: `${BACKEND_URL}${initResult.downloadUrl}`,
    });
  }

  // Poll job status every 1.5 seconds until complete or failed
  const maxAttempts = 240; // up to 6 minutes max
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const job = await pollServerRenderStatus(jobId);

      const fullVideoUrl = job.videoUrl ? `${BACKEND_URL}${job.videoUrl}` : null;
      const fullDownloadUrl = job.downloadUrl ? `${BACKEND_URL}${job.downloadUrl}` : null;

      if (onProgress) {
        onProgress({
          jobId,
          status: job.status,
          stage: job.stage,
          progress: job.progress || 0,
          videoUrl: fullVideoUrl,
          downloadUrl: fullDownloadUrl,
          error: job.error,
        });
      }

      if (job.status === 'COMPLETED') {
        return {
          ...job,
          videoUrl: fullVideoUrl,
          downloadUrl: fullDownloadUrl,
        };
      }

      if (job.status === 'FAILED') {
        throw new Error(job.error || 'Server video rendering failed.');
      }
    } catch (err) {
      if (err.message.includes('failed')) {
        throw err;
      }
    }
  }

  throw new Error('Video rendering timed out after 6 minutes.');
}

/**
 * Lists all videos rendered and saved on the local server.
 */
export async function listServerVideos() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/server-render/list`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.renders || []).map((r) => ({
      ...r,
      videoUrl: `${BACKEND_URL}${r.videoUrl}`,
      downloadUrl: `${BACKEND_URL}${r.downloadUrl}`,
    }));
  } catch (err) {
    console.warn('[LocalServerRenderService] Failed to list server renders:', err.message);
    return [];
  }
}

/**
 * Helper to trigger automatic file download in the browser.
 */
export function triggerBrowserDownload(url, filename = 'master_video.mp4') {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
