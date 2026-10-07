// server/tests/opusAgent.test.js — tests for the real Opus agent runtime:
// planner intents, original lyric writer, session tools, and an end-to-end
// agent-driven render.
const test = require('node:test');
const assert = require('node:assert');

const { planFromMessage, TOOLS, getSession } = require('../opusAgent');
const { writeLyrics, detectTheme } = require('../lyricWriter');

function freshSession() {
  return {
    id: 'test', status: 'working', events: [], plan: [],
    artifacts: { lyrics: null, analysis: null, lastRenderJobId: null, lastVideo: null },
    context: {},
  };
}

test('planner: write + render chain', () => {
  const s = freshSession();
  const plan = planFromMessage('Write a lo-fi song about midnight rain and make the music video vertical 1080p', s);
  const tools = plan.map((p) => p.tool);
  assert.ok(tools.includes('write_lyrics'), 'writes lyrics');
  assert.ok(tools.includes('render_original_video'), 'renders video');
  assert.ok(tools.includes('monitor_render'), 'monitors render');
  const render = plan.find((p) => p.tool === 'render_original_video');
  assert.strictEqual(render.args.genre, 'lofi');
  assert.strictEqual(render.args.aspectRatio, '9:16');
  assert.strictEqual(render.args.quality, 'master');
});

test('planner: status / list / cancel / concepts / help', () => {
  const s = freshSession();
  assert.strictEqual(planFromMessage('what is the status of my render?', s)[0].tool, 'get_render_status');
  assert.strictEqual(planFromMessage('show my renders', s)[0].tool, 'list_renders');
  assert.strictEqual(planFromMessage('cancel the render', s)[0].tool, 'cancel_render');
  assert.strictEqual(planFromMessage('pitch me some concepts', s)[0].tool, 'suggest_concepts');
  assert.strictEqual(planFromMessage('what can you do?', s)[0].tool, 'capabilities');
});

test('planner: pasted lyrics trigger the paste-to-film pipeline', () => {
  const s = freshSession();
  const lyrics = 'City lights are calling out my name\nMidnight rain on neon streets tonight\nEvery shadow knows the words I hide\nWe are electric tonight';
  const plan = planFromMessage(lyrics, s);
  const tools = plan.map((p) => p.tool);
  assert.ok(tools.includes('render_original_video'), 'paste-to-film: renders pasted lyrics');
  assert.ok(tools.includes('monitor_render'), 'monitors the render');
  const render = plan.find((p) => p.tool === 'render_original_video');
  assert.ok(render.args.lyrics && render.args.lyrics.includes('City lights'), 'lyrics carried through');
  assert.ok(!render.args.captionStyle, 'lyric imagery must not flip caption settings');
});

test('planner: bare render request without lyrics asks for them', () => {
  const s = freshSession();
  const plan = planFromMessage('make the video please', s);
  assert.strictEqual(plan[0].tool, 'request_lyrics');
});

test('planner: session lyrics satisfy a follow-up "make the video"', () => {
  const s = freshSession();
  s.artifacts.lyrics = 'Verse line one\nVerse line two\nChorus line';
  const plan = planFromMessage('make the video', s);
  const render = plan.find((p) => p.tool === 'render_original_video');
  assert.ok(render, 'render planned from session lyrics');
  assert.strictEqual(render.args.useSessionLyrics, true);
});

test('planner: preference-only message sets context', () => {
  const s = freshSession();
  const plan = planFromMessage('make it trap 1080p', s);
  assert.strictEqual(plan[0].tool, 'set_preferences');
  assert.strictEqual(plan[0].args.genre, 'trap');
  assert.strictEqual(plan[0].args.quality, 'master');
});

test('lyric writer: structured, rhymed, theme-aware original lyrics', () => {
  const w = writeLyrics({ about: 'midnight rain in the neon city', length: 'standard', seed: 42 });
  assert.ok(w.title.length > 2, 'has title');
  assert.ok(w.lineCount >= 14, `enough lines (${w.lineCount})`);
  assert.ok(w.lyrics.includes('[Verse 1]'), 'section tags present');
  assert.ok(w.lyrics.includes('[Chorus]'), 'chorus present');
  assert.ok(w.lyrics.includes('[Bridge]'), 'bridge present');
  // deterministic with same seed
  const w2 = writeLyrics({ about: 'midnight rain in the neon city', length: 'standard', seed: 42 });
  assert.strictEqual(w.lyrics, w2.lyrics);
  // different seed → different lyrics
  const w3 = writeLyrics({ about: 'midnight rain in the neon city', length: 'standard', seed: 99 });
  assert.notStrictEqual(w.lyrics, w3.lyrics);
  // theme detection
  assert.strictEqual(detectTheme('a galaxy of silver starlight'), 'cosmos');
  assert.strictEqual(detectTheme('burning flames'), 'fire');
});

test('tools: capabilities + write_lyrics run against a live session', async () => {
  const s = freshSession();
  await TOOLS.capabilities(s, {});
  assert.ok(s.events.some((e) => e.type === 'assistant'), 'assistant replied');
  s.events.length = 0;
  await TOOLS.write_lyrics(s, { about: 'ocean waves', seed: 7 });
  assert.ok(s.artifacts.lyrics, 'lyrics stored in session');
  assert.ok(s.events.some((e) => e.type === 'lyrics'), 'lyrics event emitted');
});

test('end-to-end: agent writes lyrics then renders + monitors a full video', { timeout: 300000 }, async () => {
  const s = freshSession();
  const write = await TOOLS.write_lyrics(s, { about: 'stars and the ocean', length: 'short', seed: 5 });
  assert.ok(write.ok);
  const render = await TOOLS.render_original_video(s, { useSessionLyrics: true, quality: 'draft', duration: 12, title: 'Agent E2E' });
  assert.ok(render.ok, 'render started');
  assert.ok(s.artifacts.lastRenderJobId, 'job id stored');
  const monitored = await TOOLS.monitor_render(s, {});
  assert.strictEqual(monitored.ok, true, 'monitor reported success');
  const job = getSessionJob(s.artifacts.lastRenderJobId);
  assert.strictEqual(job.status, 'COMPLETED');
  assert.ok(job.videoUrl.startsWith('/renders/'), 'video url exists');
  console.log('   ✓ agent-delivered render:', job.videoUrl);
});

// tiny helper — getAgentJob lives in agentVideoEngine
function getSessionJob(jobId) {
  const { getAgentJob } = require('../agentVideoEngine');
  return getAgentJob(jobId);
}
