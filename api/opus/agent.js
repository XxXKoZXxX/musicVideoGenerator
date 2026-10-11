// Vercel serverless: the Opus agent runs SYNCHRONOUSLY here (serverless has
// no background between requests), using runTurnSync. Sessions live in the
// lambda instance's memory — warm requests reuse them; a cold start starts a
// fresh session automatically (runTurnSync creates one when the id is unknown).
const { runTurnSync } = require('../../server/opusAgent');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'POST only' });
  try {
    const { message, sessionId } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }
    const result = await runTurnSync(String(message).trim(), sessionId || null);
    res.status(200).json({ success: true, sessionId: result.sessionId, reply: result.reply });
  } catch (err) {
    console.error('[OpusAgent:vercel] turn failed:', err);
    res.status(500).json({ success: false, error: err.message || 'Agent turn failed' });
  }
};
