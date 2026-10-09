// Vercel serverless: lightweight server stats (mirrors /api/server-status).
const startedAt = Date.now();
module.exports = (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    uptime: Math.round((Date.now() - startedAt) / 1000),
    memory: { rss: memory.rss, heapUsed: memory.heapUsed },
    activeJobs: 0,
    runtime: 'vercel-serverless',
  });
};
