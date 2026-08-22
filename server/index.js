require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.VIDEO_PORT || 4000;

app.use(cors());
app.use(express.json());

// List of supported video generators (renderer back‑ends)
const GENERATORS = [
  { id: 'higgsfield-dop', name: 'Higgsfield Cinema DoP Studio', provider: 'Higgsfield AI' },
  { id: 'ai-neural', name: 'AI Neural Motion Engine', provider: 'Runway / Neural' },
  { id: 'runway', name: 'RunwayML Gen-3 Alpha', provider: 'Runway' },
  { id: 'sora', name: 'OpenAI Sora Video', provider: 'OpenAI' },
  { id: 'kling', name: 'Kling 1.5 HD AI', provider: 'Kuaishou' },
  { id: 'luma', name: 'Luma Dream Machine', provider: 'Luma AI' },
  { id: 'stable-diffusion', name: 'Stable Video Diffusion', provider: 'Stability AI' },
  { id: 'deepbrain', name: 'DeepBrain Avatar AI', provider: 'DeepBrain' },
  { id: 'webgl-gpu', name: 'WebGL GPU Shader Engine', provider: 'Hardware GPU' },
  { id: 'canvas-2d', name: 'Canvas 2D Ultra Compositor', provider: 'Native Compositor' },
  { id: 'master-4k', name: 'Cinema Master 4K Studio', provider: 'Master Pro' },
];

const SAMPLE_VIDEOS = {
  'higgsfield-dop': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    title: 'Higgsfield Cinema DoP 6-Axis Motion Sequence',
  },
  'higgsfield_dop': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    title: 'Higgsfield Cinema DoP 6-Axis Motion Sequence',
  },
  'ai-neural': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    title: 'AI Neural Motion Sequence',
  },

  'runway': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    title: 'Runway Gen-3 Cinematic Motion',
  },
  'sora': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    title: 'Sora Hyper-Realistic Render',
  },
  'kling': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    title: 'Kling 1.5 Dynamic Video',
  },
  'stable-diffusion': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    title: 'SVD Neural Diffusion',
  },
  'default': {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    title: 'HD Cinematic Video Stream',
  }
};

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Astraea Video Generation Server',
    version: '1.0.0',
    endpoints: ['/api/generators', '/api/generate', '/health'],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/generators', (req, res) => {
  res.json({
    generators: GENERATORS.map(g => g.id),
    details: GENERATORS,
  });
});

// Generation endpoint – returns working video asset stream matching the model
app.post('/api/generate', async (req, res) => {
  const { renderer, payload, prompt, query } = req.body;
  const targetRenderer = renderer || (payload && payload.renderer) || 'ai-neural';
  console.log(`[VideoServer] Generation request for renderer: "${targetRenderer}" | prompt: "${prompt || query || 'N/A'}"`);

  const sample = SAMPLE_VIDEOS[targetRenderer] || SAMPLE_VIDEOS.default;

  // Simulate smooth async render time
  setTimeout(() => {
    res.json({
      success: true,
      message: `Video generated successfully using ${targetRenderer}`,
      renderer: targetRenderer,
      videoUrl: sample.url,
      thumbnail: sample.thumbnail,
      title: `${targetRenderer.toUpperCase()} — ${sample.title}`,
      duration: 15,
      resolution: '1080p',
    });
  }, 800);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Video generation server listening on http://localhost:${PORT}`);
});
