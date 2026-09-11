# MusicVid Pro — Feature Enhancements (v1.1)

This release brings the studio to full parity with the top tools in the category
(OPUS agent, freebeat.ai) and adds extras they don't have. The core promise:
**upload any song, type or upload its lyrics, and get a real MP4 with your lyrics
burned in — synced to the music.**

## 🎬 What's new

### 1. Server-side MP4 rendering with burned-in synced lyrics (the big one)
- `server/renderEngine.js` now renders a **real MP4 (h264 + AAC)** with the local
  bundled FFmpeg (`@ffmpeg-installer`) — no system install needed.
- Every lyric line is burned in as **kinetic typography**, time-matched to the song:
  - **LRC files** (`[mm:ss.xx] line`) and raw `.txt` (auto-timed to BPM/duration)
  - 5 typography styles: Neon glow, Karaoke word-by-word, Cinema, Glitch RGB-split, Bold
- **Beat-synced scene cuts**: scene duration, motion and cuts are derived from the
  track's song structure (verse/chorus/drop) — drops get kinetic pulses.
- Each render exports **SRT + LRC subtitle files** and a gallery thumbnail.
- Endpoints: `POST /api/server-render/create`, `GET /api/server-render/status/:id`,
  `GET /api/server-render/list`, `GET /api/server-render/download/:file`,
  `DELETE /api/server-render/file/:file`.

### 2. OPUS-style layout & navigation
- New **sidebar studio shell** (`StandaloneMusicVideoApp.js`):
  - Studios: Create Video, Timeline DAW, **Render Library**, Voice Cloner,
    Character Studio, Gap Filler & Stitcher, Model Hub
  - Assist: Opus Director Agent (drawer), ⚡Auto Singing Cut, ⚡Auto Story Cut,
    🔥AI Features lab
  - Live **render-server status chip** (online/offline) in the sidebar footer
  - Top bar with project title editing, artist pill, autosave indicator and a
    **⚡ Render Master** one-click quick render
- Floating quick-render card with live stage/progress from the server.
- **Render Library** view (`RendersGalleryView.js`): grid of your renders with
  hover video preview, MP4/SRT/LRC downloads, delete, lyric-line count,
  resolution/aspect chips.
- **Autosave**: project persists to localStorage (blobs stripped safely), with a
  resume banner that prompts re-dropping the audio file after a reload.

### 3. freebeat.ai / OPUS feature parity + extras
| Feature | Status |
|---|---|
| 4-step wizard (track → design → scenes → render) | ✅ existing |
| Timeline DAW workstation (multi-track, inspector) | ✅ existing |
| Story Director (singing / storytelling modes, Freebeat Auto Director) | ✅ existing |
| Opus Director Agent (chat + production bible → scenes) | ✅ existing |
| AI lyric video / AI video clip generation per scene | ✅ existing |
| Higgsfield-style DoP controls (lens, film stock, DND, grain, light) | ✅ existing |
| Vocal cloner studio | ✅ existing |
| Character creator | ✅ existing |
| AI clip gap filler / inbetweener | ✅ existing |
| **Server MP4 master with burned-in synced lyrics** | 🆕 |
| **Render library with subtitle (SRT/LRC) exports** | 🆕 |
| **LRC file import + auto-time-to-BPM in the lyrics tab** | 🆕 |
| **AI scene frames from lyric lines (fal.ai flux/sdxl + curated fallback)** | 🆕 (`POST /api/ai-image/generate`) |
| **Beat-drop-synced scene cuts in the render engine** | 🆕 |
| **Relative-URL backend + dev proxy (works from any host/preview)** | 🆕 |

### 4. AI scene frames from lyrics
- `POST /api/ai-image/generate` paints a frame per scene from its lyric/directive
  prompt (fal.ai `flux` / `fast-sdxl`, automatic curated fallback when the AI key
  is unavailable).
- Step 3 has an **AI Scene Frames** button that fills every scene's artwork
  with a fresh image derived from that scene's lyric line.

## 🧪 Testing (all green)
- **Client (Jest)**: 142 tests / 27 suites — includes new suites for the OPUS
  shell (navigation, quick render, autosave), the Render Library, and backend URLs.
- **Server (node:test)**: 16 tests — lyrics parser (LRC/plain/multi-timestamp/
  escaping/SRT/LRC/drawtext filters) and a full **integration render pipeline**
  test (uploaded song + lyrics → MP4 with A/V streams, SRT/LRC sidecars,
  thumbnail, library listing, deletion).
- **Manual E2E**: rendered real MP4s through the dev-server proxy —
  neon/karaoke/glitch/bold styles, 16:9 / 9:16 / 1:1, with/without lyrics.

```bash
npm test                 # client suite
npm run test:server      # server suite (unit + integration render)
npm run test:all         # both
npm run video-server     # render server on :4000
npm run start:web        # studio on :3220 (proxies /api + /renders)
```
