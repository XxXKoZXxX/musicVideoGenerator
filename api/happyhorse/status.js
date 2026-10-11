// Vercel serverless: the HappyHorse CLI cannot exist on serverless — report honestly.
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    available: false,
    version: null,
    path: null,
    source: null,
    hint: 'The HappyHorse CLI runs on your own machine (render server / desktop app), not on Vercel.',
  });
};
