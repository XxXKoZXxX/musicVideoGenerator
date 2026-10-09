// Vercel serverless: renders live on the render server's disk. On Vercel the
// library is empty by design (nothing is rendered here).
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    renders: [],
    hint: 'Your rendered masters live on the render server (local/desktop). This deployment hosts the web companion.',
  });
};
