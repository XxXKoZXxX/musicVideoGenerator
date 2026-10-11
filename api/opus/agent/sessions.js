// Vercel serverless: sessions known to this warm instance.
const { listSessions } = require('../../../server/opusAgent');

module.exports = (req, res) => {
  res.status(200).json({ success: true, sessions: listSessions() });
};
