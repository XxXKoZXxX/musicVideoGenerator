// src/services/LocalServerRenderService.js - Client for dedicated local backend video rendering server
import { saveProjectToCloud } from '../firebase.config';

import BACKEND_URL from './backendUrl';


/**
 * Converts a browser blob: URL to a Base64 data URI so the backend server can read and persist it.
 */
export async function blobToDataUri(blobUrl) {
  if (!blobUrl || typeof blobUrl !== 'string' || !blobUrl.startsWith('blob:')) {
    return blobUrl;
  }
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('[LocalServerRenderService] Failed to convert blob URL to data URI:', err);
    return blobUrl;
  }
}

/**
 * Prepares project assets (audio track and custom images) for server-side ingestion by converting local blob: URLs to data URIs.
 */
export async function prepareProjectForServerRender(project) {
  if (!project) return project;
  const cloned = { ...project };

  // Convert audio blob if present
  if (cloned.audioBlobUrl && typeof cloned.audioBlobUrl === 'string' && cloned.audioBlobUrl.startsWith('blob:')) {
    const audioDataUri = await blobToDataUri(cloned.audioBlobUrl);
    cloned.audioBlobUrl = audioDataUri;
    cloned.audioDataUrl = audioDataUri;
  }

  // Convert image blobs if present
  if (Array.isArray(cloned.images) && cloned.images.length > 0) {
    const convertedImages = await Promise.all(
      cloned.images.map(async (img) => {
        if (typeof img === 'string' && img.startsWith('blob:')) {
          return await blobToDataUri(img);
        }
        return img;
      })
    );
    cloned.images = convertedImages;
  }

  return cloned;
}

/**
 * Quick health probe to verify if local video rendering server is running.
 */
export async function checkVideoServerHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (_) {
    return false;
  }
}

/**
 * Retrieves detailed server runtime status (uptime, memory, active rendering jobs).
 */
export async function getVideoServerStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/server-status`);
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (_) {
    return { online: false };
  }
}

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
  if (onProgress) {
    onProgress({
      status: 'PREPARING_ASSETS',
      stage: 'Preparing audio and visual assets for high-speed render...',
      progress: 2,
    });
  }

  const preparedProject = await prepareProjectForServerRender(project);
  const initResult = await startServerRender(preparedProject, options);
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
        const completedResult = {
          ...job,
          videoUrl: fullVideoUrl,
          downloadUrl: fullDownloadUrl,
        };

        // Persist project metadata and rendered video URL to cloud
        try {
          const syncId = project.id || project.artistName || `render_${jobId}`;
          saveProjectToCloud(syncId, {
            title: project.audioTitle || project.artistName || 'Astraea Video Render',
            videoUrl: fullVideoUrl,
            downloadUrl: fullDownloadUrl,
            options,
            status: 'COMPLETED',
            renderedAt: new Date().toISOString(),
          }).catch(() => {});
        } catch (syncErr) {
          console.warn('[LocalServerRenderService] Cloud metadata save notice:', syncErr.message);
        }

        return completedResult;
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
 * Deletes a rendered video file (and its thumbnail / subtitle sidecars) from the server.
 */
export async function deleteServerRenderFile(fileName) {
  const res = await fetch(`${BACKEND_URL}/api/server-render/file/${encodeURIComponent(fileName)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Delete failed: HTTP ${res.status}`);
  }
  return res.json();
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
