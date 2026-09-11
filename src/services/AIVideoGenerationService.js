// AIVideoGenerationService.js — Frontend client for AI video generation via fal.ai

import BACKEND_URL from './backendUrl';

// AI Video Model display names for UI
export const AI_VIDEO_GEN_MODELS = [
  { id: 'kling_ai', name: 'Kling 3.0', icon: '🌊', provider: 'Kuaishou', desc: 'Photorealistic 3D motion with fluid dynamics' },
  { id: 'luma_dream', name: 'Luma Ray 3.2', icon: '🎬', provider: 'Luma AI', desc: 'Fast keyframe morphing and camera pans' },
  { id: 'runway_gen3', name: 'Runway Gen-4.5', icon: '⚡', provider: 'Runway', desc: 'Hollywood-grade cinematic motion' },
  { id: 'minimax', name: 'MiniMax H3', icon: '🔮', provider: 'MiniMax', desc: 'High-detail character animation' },
  { id: 'stable_video', name: 'Stable Video', icon: '🎥', provider: 'Stability AI', desc: 'Open-source latent video diffusion' },
];

export const SUPPORTED_ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Cinema / YouTube', icon: '🖥️' },
  { id: '9:16', label: '9:16 Reels / TikTok / Shorts', icon: '📱' },
  { id: '1:1', label: '1:1 Square / Instagram / Spotify', icon: '⏹️' },
  { id: '4:5', label: '4:5 Social Portrait', icon: '📸' },
  { id: '21:9', label: '21:9 Ultra-Panavision', icon: '🎬' },
];

export const SUPPORTED_DURATIONS = [
  { value: 5, label: '5s Fast Cut' },
  { value: 10, label: '10s Extended Scene' },
  { value: 15, label: '15s Cinema Sequence' },
];


/**
 * Generate a single AI video clip from a text prompt.
 * Returns immediately with { videoUrl } in fallback mode, or { requestId } if queued for real generation.
 */
export async function generateVideoFromPrompt(prompt, model = 'kling_ai', options = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai-video/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, options }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[AIVideoGen] Backend unreachable, using local fallback:', err.message);
  }

  // Offline fallback — return sample video
  return {
    success: true,
    mode: 'fallback',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: 5,
    model,
    message: 'Offline mode — using sample video.',
  };
}

/**
 * Generate AI video clips for all scenes in batch.
 * Returns either immediate fallback URLs or requestIds for polling.
 */
export async function generateAllSceneVideos(scenes, model = 'kling_ai', options = {}) {
  const scenePrompts = scenes.map(scene => {
    if (typeof scene === 'string') return scene;
    // Extract the AI video prompt from a scene object
    return scene.directive || scene.prompt || scene.title || 'Cinematic 4K visual scene';
  });

  try {
    const res = await fetch(`${BACKEND_URL}/api/ai-video/generate-scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenes: scenePrompts, model, options }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[AIVideoGen] Batch generation backend unreachable:', err.message);
  }

  // Offline fallback
  const sampleUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  ];

  return {
    success: true,
    mode: 'fallback',
    results: scenes.map((scene, idx) => ({
      sceneIndex: idx,
      prompt: typeof scene === 'string' ? scene : scene.directive || scene.title,
      videoUrl: sampleUrls[idx % sampleUrls.length],
      duration: 5,
      mode: 'fallback',
    })),
    message: 'Offline — sample videos loaded.',
  };
}

/**
 * Poll a generation job for real-time status.
 * Returns { status, videoUrl, ... } when complete.
 */
export async function pollGenerationStatus(requestId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai-video/status/${requestId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[AIVideoGen] Status poll error:', err.message);
  }
  return { success: false, status: 'UNKNOWN', error: 'Backend unreachable' };
}

/**
 * Poll all scene jobs until all complete, calling onProgress with updates.
 * @param {Array} requestIds - Array of { sceneIndex, requestId }
 * @param {Function} onProgress - Called with (completedCount, totalCount, results)
 * @returns {Promise<Array>} Final array of { sceneIndex, videoUrl, ... }
 */
export async function pollAllScenesUntilDone(requestIds, onProgress) {
  const validJobs = requestIds.filter(r => r.requestId);
  const total = requestIds.length;
  const results = new Array(total).fill(null);

  // Pre-fill any errors
  requestIds.forEach(r => {
    if (!r.requestId && r.error) {
      results[r.sceneIndex] = { sceneIndex: r.sceneIndex, status: 'FAILED', error: r.error };
    }
  });

  const maxPolls = 120;
  for (let attempt = 0; attempt < maxPolls; attempt++) {
    let allDone = true;

    for (const job of validJobs) {
      if (results[job.sceneIndex] && results[job.sceneIndex].status === 'COMPLETED') continue;
      if (results[job.sceneIndex] && results[job.sceneIndex].status === 'FAILED') continue;

      const status = await pollGenerationStatus(job.requestId);

      if (status.status === 'COMPLETED') {
        results[job.sceneIndex] = {
          sceneIndex: job.sceneIndex,
          status: 'COMPLETED',
          videoUrl: status.videoUrl,
          thumbnailUrl: status.thumbnailUrl,
          duration: status.duration,
        };
      } else if (status.status === 'FAILED' || status.status === 'TIMEOUT') {
        results[job.sceneIndex] = {
          sceneIndex: job.sceneIndex,
          status: 'FAILED',
          error: status.error || 'Generation failed',
        };
      } else {
        allDone = false;
      }
    }

    const completedCount = results.filter(r => r && (r.status === 'COMPLETED' || r.status === 'FAILED')).length;
    if (onProgress) onProgress(completedCount, total, results);

    if (allDone) break;

    await new Promise(r => setTimeout(r, 3000));
  }

  return results;
}

/**
 * Custom AI Video generation via POST /api/video/generate
 * Supports configurable model, aspect ratio, duration, negative prompt, and options.
 */
export async function generateCustomVideo({
  prompt,
  model = 'kling_ai',
  aspectRatio = '16:9',
  duration = 5,
  negativePrompt = '',
  apiKey = '',
  options = {},
}) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required for AI video generation.');
  }

  const payload = {
    prompt: prompt.trim(),
    model,
    aspectRatio,
    duration: String(duration),
    negativePrompt: negativePrompt ? negativePrompt.trim() : undefined,
    apiKey: apiKey || undefined,
    options,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/video/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${res.status}`);
  } catch (err) {
    console.warn('[AIVideoGen] generateCustomVideo network warning:', err.message);
    // Offline fallback if network fails
    return {
      success: true,
      mode: 'fallback',
      jobId: `job_${Date.now()}_offline`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: parseInt(duration, 10) || 5,
      aspectRatio,
      model,
      message: 'Offline fallback video (backend server unreachable).',
    };
  }
}

/**
 * Check status of a custom video generation or server render job via GET /api/video/status/:jobId
 */
export async function getVideoJobStatus(jobId) {
  if (!jobId) return { success: false, error: 'jobId is required' };

  try {
    const res = await fetch(`${BACKEND_URL}/api/video/status/${encodeURIComponent(jobId)}`);
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, status: 'FAILED', error: err.error || `HTTP ${res.status}` };
  } catch (err) {
    console.warn('[AIVideoGen] getVideoJobStatus error:', err.message);
    return { success: false, status: 'UNKNOWN', error: err.message };
  }
}

