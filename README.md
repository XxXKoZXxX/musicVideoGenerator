# ✨ ASTRAEA — Sovereign Cosmic Studio & Esoteric Oracle

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-cyan.svg)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Live%20Production-emerald.svg)](http://localhost:3210)

---

## 🎬 AI DIRECTOR — 100% ORIGINAL VIDEO FROM LYRICS (new)

The flagship **AI Director — Original** studio turns raw lyrics into a completely original
music video — **no stock footage, no external AI APIs, nothing downloaded**:

1. **Lyric intelligence** — structure ([Verse]/[Chorus] tags or automatic detection),
   imagery→world mapping (12 generative environments), emotion/valence/energy arcs,
   genre & BPM estimation, HSL palette synthesis.
2. **Original soundtrack** — a royalty-free instrumental is *composed from scratch*
   (kick/snare/hats, 808/sub bass, pads, arps, lead motif — genre templates for Pop, EDM,
   Trap, Lo-Fi, Rock, Cinematic, Synthwave, R&B) in the song's key & BPM. Upload your own
   track instead and the beat detector (onset autocorrelation) locks the grid for you.
3. **Shot planning** — scenes are cut on section boundaries & beat drops; choruses get a
   signature world so the hook feels iconic. Camera moves (push/drift/sway), beat-punch
   zooms, shake, crossfades & drop flashes are all beat-reactive.
4. **Frame-by-frame generation** — every frame is painted procedurally on a Skia canvas
   (@napi-rs/canvas) and piped raw into ffmpeg → libx264 **MP4 master** with burned-in
   **kinetic lyrics** (Karaoke, Kinetic, Impact, Neon, Typewriter, Minimal), title card,
   film grain, vignette, poster frame and SRT/LRC sidecars.

Fire it from the sidebar: **AI Director — Original** (default view), or
`POST /api/agent-video/create { lyrics, ... }` and poll `/api/agent-video/status/:jobId`
for the live director log. Render completely offline.

## 🤖 OPUS AGENT — real autonomous director runtime (new)

The sidebar **Opus Director Agent** is now a *real* agent — no canned replies,
no API key needed. It plans multi-step work and executes actual tools with a
live transcript (thinking → tool cards → artifacts → reply):

- ✍️ **write_lyrics** — original songwriting engine (`server/lyricWriter.js`):
  theme detection (13 banks), rhyme families, verse/chorus/bridge structure,
  deterministic seeds for "regenerate" variations.
- 🔍 **analyze_lyrics** — the full lyric-intelligence brief.
- 🎬 **render_original_video** — launches the AI Director engine from chat.
- 📡 **monitor_render** — babysits the render, streaming progress milestones.
- 📖 **production_bible**, 💡 **suggest_concepts**, 📊 **get_render_status**,
  🗂 **list_renders**, 🛑 **cancel_render**, 🎛 **set_preferences**.

Chain commands naturally: *"Write a lo-fi song about midnight rain, then make
the video — vertical, 1080p, karaoke captions"* → it writes, renders, monitors
and hands you the playable master inline.

API: `POST /api/opus/agent {message, sessionId?}` then poll
`GET /api/opus/agent/session/:id` for the live transcript. The legacy
`/api/opus-agent/chat` route now runs through the same brain.

```bash
npm run video-server

```bash
npm run video-server        # backend :4000
npm run start:musicvid      # web app :3220 (proxies /api to :4000)
npm run test:server         # includes originalEngine.test.js (end-to-end MP4 render test)
```

> **Astraea** is a sovereign, standalone esoteric super-application integrating the **Secret Language of Birthdays (366 Day Archetypes)**, **Astrological Birth Chart & Planetary Transits**, **The Grand Occult Grimoire (10 Portals)**, **Astral Dream Sanctuary**, **Pythagorean Numerology Matrix**, **Dual-Person Relationship Synastry & Twin Flame Quiz**, **Interactive 3-Card Tarot Spreads**, **78-Card Tarot Encyclopedia**, **Dual-Host Conversational Voice Podcast (Atlas & Luna)**, **60 FPS Motion Video Forecast Studio**, and **20+ Solfeggio Sacred Frequencies**.

---

## 🌌 16 Sovereign Cosmic Studios

### 🌟 1. Identity & Overview Hub

- **🏠 Overview Dashboard**: Comprehensive cosmic triad (Sun, Moon, Ascendant, Life Path), real-time astrological weather, and quick studio launcher.
- **👤 My Birth Details & Settings**: Effortlessly enter or edit your Full Name, Exact Birth Date, Exact Birth Time (with AM/PM or Solar Noon toggle), and searchable City/State location (500+ preloaded cities with latitude & longitude).
- **📜 Master Dossier Report**: High-resolution, printable comprehensive cosmic dossier document for framing or export.

### 🪐 2. Astrology & Celestial Sky

- **🧭 Birth Chart Wheel**: Interactive SVG natal chart wheel featuring all 12 astrological houses, degree markers, planetary symbols, and house aspects.
- **📖 Secret Language Archetypes**: 366 Day personality archetypes, decan cusps, health dynamics, and daily soul meditations.
- **⚡ Transits Radar**: Live real-time sky planets interacting with your natal placements.
- **🔑 Past-Life Karma & Destiny**: North Node soul destiny compass and Chiron sacred wound healing.

### 🔮 3. Grimoire & Esoteric Divination

- **🔥 Grand Occult Grimoire**: 10 comprehensive portals of ancient wisdom:
  1. *Philosophy & Masters Library* (Socrates, Buddha, Jung, Freud, Aristotle, Marcus Aurelius, Rumi).
  2. *Spellcraft & Jars* (Money jars, honey jars, protection poppets, mojo bags, candle magic).
  3. *Manifestation & Alchemy* (3-6-9 Tesla method, Law of Assumption, 7 Planetary Metals, Magnum Opus).
  4. *Soul Connections & Tantra* (Twin Flames, Karmic Soulmates, Red String of Fate, Kama Sutra polarities).
  5. *Pantheons & Deities* (Greek, Egyptian, Norse/Celtic).
  6. *Archangels & Spirit Animals* (4 Archangels, Ancestor Veneration Altar, 30+ Totems).
  7. *Spirit Box ITC & Demonology* (Live Web Audio Spirit Box frequency scanner & LBRP warding).
  8. *Palmistry & Reflexology* (Hand destiny lines, Foot reflexology zones, Basalt hot stones).
  9. *Kundalini & Breathwork* (Guided Pranayama timer: Box Breathing, Nadi Shodhana, Kapalabhati, 4-7-8).
  10. *Starseeds & Vitality Matrix* (Pleiadian, Sirian, Arcturian, Gaian, Old Soul & Lifespan constitution).
- **🌙 Astral Dream Sanctuary**: Subconscious Moon synthesis, 50+ symbol dictionary, and Astral Dream Journal.
- **👁️ Tarot Spreads & Readings**: 3-card Past / Present / Future divination with interactive card flipping.
- **📚 78-Card Tarot Encyclopedia**: Complete searchable Major & Minor Arcana encyclopedia with upright & reversed meanings.

### 🎙️ 4. Audio, Media & AI Oracle

- **📻 Dual-Host Voice Podcast**: Conversational NotebookLM-style audio deep-dive hosted by Atlas & Luna with 432 Hz background frequencies.
- **🎬 Motion Video Studio**: 60 FPS animated cosmic forecast video generator with real-time MP4 recording.
- **💬 AI Oracle & Spiritual Notebook**: Contextual esoteric Q&A assistant with saved divination journal.
- **🎧 Sacred Frequencies & Sound Sanctuary**: 20+ Solfeggio frequencies, binaural beats, and 7 sacred geometry canvas visualizers.

### 🔢 5. Numerology & Relationship Synastry

- **🔢 Pythagorean Numerology Matrix**: Life Path, Expression, Soul Urge, and Birthday vibrational calculations.
- **❤️ Dual-Person Comparison Matrix**: Side-by-side multi-subject compatibility scoring and interactive 5-question Twin Flame Diagnostic Quiz.

---

## 🚀 Running Astraea Locally

```bash
# 1. Install dependencies
npm install

# 2. Run web development server
npm start

# 3. Build standalone production bundle
npm run build:mobile

# 4. Start production server
node serve.js
```

---

## 📱 Mobile App (PWA & Offline Capable)

- Access via your local network: `http://<your-ip>:3210`
- Access remotely via Cloudflare Tunnel.
- Add to Home Screen on iPhone (Safari $\rightarrow$ Share $\rightarrow$ Add to Home Screen) or Android (Chrome $\rightarrow$ Install App).

---

## 🎨 Theme Customizer

Includes **8 luxury presets** (*Royal Gold, Celestial Cyan, Amethyst Mystic, Emerald Alchemist, Rose Tantra, Solar Flame, Obsidian Midnight, Astral Silver*) plus a custom RGB/HEX color picker.

---

## 🎬 AI Video Generation & Cloud Sync API

### AI Video Generation Endpoint

- **`POST /api/video/generate`**: Generate AI video clips with configurable neural models (`kling_ai`, `luma_dream`, `runway_gen3`, `minimax`, `stable_video`), aspect ratio (`16:9`, `9:16`, `1:1`, `4:5`, `21:9`), duration (`5s`, `10s`, `15s`), and negative prompt filtering.
- **`GET /api/video/status/:jobId`**: Asynchronously poll the status of video generation or server rendering jobs.

```bash
# Example Video Generation Request
curl -X POST http://localhost:4000/api/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cinematic cosmic nebula with laser aurora",
    "model": "kling_ai",
    "aspectRatio": "16:9",
    "duration": "5",
    "negativePrompt": "blurry, low quality"
  }'
```

### Cloud Synchronization (Firebase Firestore)

Persist projects, video assets, and user presets seamlessly to Cloud Firestore with automatic local cache fallback:

- Configured via `REACT_APP_FIREBASE_*` environment variables in `.env`.
- Real-time cloud sync status indicator in the top directorial toolbar.
- Deploy security rules with `./scripts/deploy-firebase.sh`.

---

© 2026 Astraea Cosmic Studios. All rights reserved.
