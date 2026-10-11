// src/services/OpusAgentClient.js — client for the real Opus agent runtime
// (/api/opus/agent/*). Sessions stream their transcript via polling so the UI
// can render live thinking, tool calls and artifacts.

import BACKEND_URL from './backendUrl';

const base = (p) => `${BACKEND_URL}${p}`;

/** Start (or continue) an agent turn. Resolves with { sessionId }. */
export async function startAgentTurn(message, sessionId) {
  const res = await fetch(base('/api/opus/agent'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: sessionId || undefined }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'The agent could not be reached');
  return data;
}

/** Fetch the full session transcript. */
export async function getAgentSession(sessionId) {
  const res = await fetch(base(`/api/opus/agent/session/${sessionId}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Session not found');
  return data.session;
}

/**
 * Poll a session until it goes idle (or error). Returns an unsubscribe fn.
 * Calls onUpdate(session) on every poll — including while working — so the
 * UI can stream thinking/tool events live.
 */
export function subscribeAgentSession(sessionId, onUpdate, intervalMs = 800) {
  let stopped = false;
  let timer = null;
  const tick = async () => {
    if (stopped) return;
    try {
      const session = await getAgentSession(sessionId);
      if (stopped) return;
      onUpdate(session);
      if (session.status !== 'working') {
        // one final short poll to catch trailing events, then stop
        timer = setTimeout(async () => {
          if (stopped) return;
          try { onUpdate(await getAgentSession(sessionId)); } catch (_) {}
        }, 1200);
        return;
      }
    } catch (_) {}
    timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

export function listAgentSessions() {
  try {
    return fetch(base('/api/opus/agent/sessions')).then((r) => r.json()).catch(() => ({ sessions: [] }));
  } catch (_) {
    return Promise.resolve({ sessions: [] });
  }
}
