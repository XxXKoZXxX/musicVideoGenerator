require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// List of supported video generators (renderer back‑ends)
const GENERATORS = [
  'ai-neural', // existing Pexels/AI renderer
  'runway',    // RunwayML
  'openai',    // OpenAI DALL‑E video
  'deepbrain', // DeepBrain AI
  'stable-diffusion', // Stable Diffusion Video
];

app.get('/api/generators', (req, res) => {
  res.json({ generators: GENERATORS });
});

// Mock generation endpoint – replace with real API calls as needed
app.post('/api/generate', async (req, res) => {
  const { renderer, payload } = req.body;
  console.log('Generation request for:', renderer);
  // Simulate async processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: `Mock video generated using ${renderer}`,
      videoUrl: `http://localhost:${PORT}/mock-${renderer}.webm`,
    });
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`🚀 Video generation server listening on http://localhost:${PORT}`);
});
