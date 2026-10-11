// Vercel serverless: session transcript. Sessions are per-warm-instance; if a
// cold start lost the session we say so plainly instead of a bare 404.
const { getSession, sessionView } = require('../../../../server/opusAgent');

module.exports = (req, res) => {
  const { id } = req.query;
  const session = id ? getSession(id) : null;
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found.',
      hint: 'Serverless instances restart and drop in-memory sessions — send a new message to start a fresh one.',
      reset: true,
    });
  }
  res.status(200).json({ success: true, session: sessionView(session) });
};
