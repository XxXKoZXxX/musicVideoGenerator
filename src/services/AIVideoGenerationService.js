// AIVideoGenerationService.js — Frontend client for AI video generation via fal.ai

const BACKEND_URL = process.env.REACT_APP_VIDEO_SERVER_URL || 'http://localhost:4000';

// AI Video Model display names for UI
export const AI_VIDEO_GEN_MODELS = [
  { id: 'kling_ai', name: 'Kling 3.0', icon: '🌊', provider: 'Kuaishou', desc: 'Photorealistic 3D motion with fluid dynamics' },
  { id: 'luma_dream', name: 'Luma Ray 3.2', icon: '🎬', provider: 'Luma AI', desc: 'Fast keyframe morphing and camera pans' },
  { id: 'runway_gen3', name: 'Runway Gen-4.5', icon: '⚡', provider: 'Runway', desc: 'Hollywood-grade cinematic motion' },
  { id: 'minimax', name: 'MiniMax H3', icon: '🔮', provider: 'MiniMax', desc: 'High-detail character animation' },
  { id: 'stable_video', name: 'Stable Video', icon: '🎥', provider: 'Stability AI', desc: 'Open-source latent video diffusion' },
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
