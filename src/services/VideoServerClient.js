export async function fetchVideoGenerators() {
  try {
    const response = await fetch('http://localhost:4000/api/generators');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.generators || [];
  } catch (err) {
    console.warn('Video server not reachable, using default generators', err);
    return ['ai-neural', 'runway'];
  }
}

export async function generateVideo(payload) {
  const response = await fetch('http://localhost:4000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Video generation failed');
  return response.json();
}
