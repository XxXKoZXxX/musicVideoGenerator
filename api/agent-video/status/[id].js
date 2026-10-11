// Vercel serverless: renders complete synchronously inside POST
// /api/agent-video/create (the finished video ships in that response). There
// is no cross-request job store between lambdas, so a status poll for an
// unknown id reports a tolerant expired state rather than a hard failure.
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    job: {
      id: req.query && req.query.id,
      status: 'EXPIRED',
      progress: 100,
      stage: 'Serverless render result is returned with the create call',
      error: null,
      agentLog: [],
      hint: 'On Vercel, renders complete inside the create request — the UI already has your video. For a persistent render library, run the local/desktop render server.',
    },
  });
};
