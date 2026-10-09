// Vercel serverless: live lyrics analysis for the AI Director composer.
// Pure JS (lyricsAnalysis) — fully functional without the render server.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST only' });
  try {
    const request = req.body || {};
    const lyrics = String(request.lyrics || '').trim();
    if (!lyrics) return res.status(400).json({ success: false, error: 'Lyrics are required.' });
    const { analyzeLyrics } = require('../../server/lyricsAnalysis');
    const analysis = analyzeLyrics(lyrics, { genre: request.genre, mood: request.mood, duration: request.duration || 60 });
    res.status(200).json({
      success: true,
      analysis: {
        genre: analysis.genre,
        bpm: analysis.bpm,
        mood: analysis.summary.mood,
        lineCount: analysis.summary.lineCount,
        chorusLines: analysis.summary.chorusCount,
        worlds: analysis.summary.topEnvs,
        palette: analysis.palette,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Analysis failed' });
  }
};
