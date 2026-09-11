# MusicVid Pro — Feature Enhancements (v1.2)

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
  track's song structure (verse/chorus/drop) — drops get a white flash pulse.
- Each render exports **SRT + LRC subtitle files**, a gallery thumbnail and an
  **animated GIF preview**, and writes **MP4 chapters** from the song structure.
- Endpoints: `POST /api/server-render/create`, `GET /api/server-render/status/:id`,
  `GET /api/server-render/list`, `GET /api/server-render/download/:file`,
  `DELETE /api/server-render/file/:file`, `POST /api/server-render/gif`.

### 2. Cinematic Master Controls (Step 4 + render server)
Everything in the "Cinematic Controls" panel is rendered server-side with FFmpeg:
| Control | What it does |
|---|---|
| **Platform presets** | TikTok/Reels 9:16, Instagram 1:1, YouTube 16:9, X 720p, Cinema 21:9, Story 4:5 |
| **Color grade (7 looks)** | Standard, Cinematic teal-orange, Vintage 8mm, Neon, Noir B&W, Dreamy, Vivid |
| **Auto-Grade** | Picks the look from the song's energy/drop profile automatically |
| **Fade transitions** | Cross-fade in/out between every scene cut |
| **Beat-drop flash** | White flash on the first frames of every drop section |
| **Cinema vignette** | Subtle edge darkening for a theatrical look |
| **Film grain** | Temporal grain overlay for a 35mm feel |
| **Watermark / corner tag** | Your artist name burned bottom-right |
| **Running timecode** | HH:MM:SS:FF counter overlay top-right |
| **Loudness normalize** | `loudnorm` to -14 LUFS for consistent loudness |
| **MP4 chapters** | Chapter markers per song section (visible in players) |
| **Export GIF** | Palette-optimized animated GIF preview (8s, 480px) for sharing |

### 3. OPUS-style layout & navigation
- **Sidebar studio shell** (`StandaloneMusicVideoApp.js`):
  - Studios: Create Video, Timeline DAW, **Render Library**, Voice Cloner,
    Character Studio, Gap Filler & Stitcher, Model Hub
  - Assist: Opus Director Agent (drawer), ⚡Auto Singing Cut, ⚡Auto Story Cut,
    🔥AI Features lab
  - **Recent Projects** — last 6 saved projects in the sidebar with one-click
    resume + delete, plus a New Blank Project button
  - Live **render-server status chip** (online/offline) in the sidebar footer
  - Top bar with project title editing, artist pill, autosave indicator and a
    **⚡ Render Master** one-click quick render
- Floating quick-render card with live stage/progress from the server.
- **Render Library** view (`RendersGalleryView.js`): grid of your renders with
  hover video preview, **search + sort (newest/oldest/largest/title)**,
  MP4/SRT/LRC/**GIF** downloads, **copy streamable link**, delete,
  lyric-line count, resolution/aspect chips.
- **Autosave**: project persists to localStorage (blobs stripped safely), with a
  resume banner that prompts re-dropping the audio file after a reload.

### 4. Smart BPM detection
- New `src/services/BeatDetector.js` — onset-strength envelope + autocorrelation
  with half/double-tempo disambiguation (70–180 BPM window).
- Runs automatically on every audio upload (replacing the old raw autocorrelation
  estimator) so scene cuts, auto-timed lyrics and beat flashes land on real beats.
- Fully unit-tested with synthesized kick patterns at 90 / 128 / 150 BPM.

### 5. freebeat.ai / OPUS feature parity + extras
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
| **Server MP4 master with burned-in synced lyrics** | 🆕 v1.1 |
| **Render library with subtitle (SRT/LRC) + GIF exports, search & sort** | 🆕 |
| **LRC file import + auto-time-to-BPM in the lyrics tab** | 🆕 v1.1 |
| **AI scene frames from lyric lines (fal.ai flux/sdxl + curated fallback)** | 🆕 v1.1 (`POST /api/ai-image/generate`) |
| **Beat-drop-synced scene cuts in the render engine** | 🆕 v1.1 |
| **Cinematic controls: 7 color grades, vignette, grain, fades, flash, watermark, timecode, loudness, chapters** | 🆕 v1.2 |
| **Animated GIF export from any master** | 🆕 v1.2 |
| **Platform presets (TikTok/Reels/IG/YouTube/X/Cinema/Story)** | 🆕 v1.2 |
| **Recent projects + resume + new-project in the sidebar** | 🆕 v1.2 |
| **Onset-based BPM detection with tempo disambiguation** | 🆕 v1.2 |
| **Keyboard: Space = play/pause live monitor** | 🆕 v1.2 |
| **Relative-URL backend + dev proxy (works from any host/preview)** | 🆕 v1.1 |

### 6. AI scene frames from lyrics
- `POST /api/ai-image/generate` paints a frame per scene from its lyric/directive
  prompt (fal.ai `flux` / `fast-sdxl`, automatic curated fallback when the AI key
  is unavailable).
- Step 3 has an **AI Scene Frames** button that fills every scene's artwork
  with a fresh image derived from that scene's lyric line.

## 🧪 Testing (all green)
- **Client (Jest)**: 154 tests / 29 suites — includes suites for the OPUS shell
  (navigation, quick render, autosave), Render Library, backend URLs,
  cinematic presets, and the beat detector (synthetic 90/128/150 BPM kicks).
- **Server (node:test)**: 28 tests — lyrics parser, cinematic filter builders
  (looks/overlays/fades/flash/chapters), and a full **integration render
  pipeline** test covering the base render, a fully-loaded cinematic render
  (vintage + vignette + grain + fades + flash + watermark + timecode + loudness +
  chapters) and GIF export.
- **Manual E2E**: rendered real MP4s through the dev-server proxy —
  neon/karaoke/glitch/bold styles, 16:9 / 9:16 / 1:1 / 21:9, cinematic options
  verified frame-by-frame (watermark + timecode + lyric burn-in), GIF export
  verified (GIF8 header, streamable via proxy).

```bash
npm test                 # client suite (154 tests)
npm run test:server      # server suite (28 tests, incl. integration renders)
npm run test:all         # both
npm run video-server     # render server on :4000
npm run start:web        # studio on :3220 (proxies /api + /renders)
```
