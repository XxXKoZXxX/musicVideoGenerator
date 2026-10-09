// Vercel serverless: health probe (mirrors server/index.js /health).
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', runtime: 'vercel-serverless', timestamp: new Date().toISOString() });
};
