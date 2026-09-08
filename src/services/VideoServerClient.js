const SERVER_URL = process.env.REACT_APP_VIDEO_SERVER_URL || (
  typeof window !== 'undefined' && (window.location.port === '3210' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))
    ? ''
    : 'http://localhost:4000'
);

export async function fetchVideoGenerators() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${SERVER_URL}/api/generators`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.generators || ['ai-neural', 'runway', 'sora', 'kling', 'master-4k'];
  } catch (err) {
    console.warn('Video server not reachable, using default generator options', err);
    return ['ai-neural', 'runway', 'sora', 'kling', 'luma', 'stable-diffusion', 'webgl-gpu', 'canvas-2d', 'master-4k'];
  }
}

export async function generateVideo(payload) {
  const response = await fetch(`${SERVER_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Video generation failed');
  return response.json();
}
