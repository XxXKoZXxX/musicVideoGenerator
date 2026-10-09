// Vercel serverless: rendering needs ffmpeg + a writable disk + minutes of
// CPU, which serverless functions cannot provide. Fail honestly and point
// at the real renderer.
module.exports = (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Video rendering does not run on this Vercel deployment — the render engine needs ffmpeg, a writable disk and minutes of CPU.',
    hint: 'Run the studio locally (npm start — web on :3220, render server on :4000) or use the desktop app; the AI Director and agent will then render fully, offline.',
    useInstead: 'local-render-server',
  });
};
