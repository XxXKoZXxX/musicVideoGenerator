# 🎬 MusicVid Studio Pro

> **The Ultimate AI Music Video Workstation & Real-Time Viseme Lip-Sync Engine**  
> Transform your music tracks and imagery into cinematic, beat-synchronized, full-length music videos with AI camera motion, live lip-syncing, 8 rendering aesthetics, and 4K cinema master rendering.

---

## 🌟 Overview & Standout Capabilities

MusicVid Studio Pro brings together the gold-standard capabilities of leading AI video and animation generators (**Runway Gen-3, Luma Dream Machine, Pika Labs, Kaiber AI, Sora, CapCut Pro, and Topaz Video AI**) into a unified studio DAW interface.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MUSICVID STUDIO PRO                                   │
│  [ Stage 1: Style & Visuals ] -> [ Stage 2: Audio & Stems ] -> [ Stage 3: Screenplay ]  │
│                                           │                                              │
│                                           ▼                                              │
│                         [ Stage 4: Live 60FPS Studio Monitor ]                           │
│              (Viseme Lip-Sync + Atmosphere Shaders + MTV Overlay + 4K Export)            │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🎤 Real-Time Viseme Lip-Syncing & Face Performance

- **Audio Formant Extraction (F1/F2)**: Analyzes vocal frequencies in real-time and dynamically shapes vowels (`AA`, `OH`, `EE`, `OO`, `M/B/P`, `REST`).
- **Anatomical Face Deformation**: Renders open mouth cavity, upper/lower teeth, and tongue depth dynamically mapped to singing vocals.
- **Natural Biological Motion**: Automatic eyelid blinks every 3–5 seconds and on vocal pauses.
- **Rhythmic Head Sway & Breathing**: Head tilt, subtle horizontal sway, and chest breathing synchronized to the song tempo (BPM).
- **Vocal Luminescence Aura**: Audio-reactive singing aura around the artist responding to vocal power.

### 2. 🎨 8 Distinct Cinematic Video Rendering Aesthetics

1. **Hyper-Realistic Cinema 8K** (`photoreal`): 35mm Hollywood film color grading, anamorphic blue lens flares, and shallow depth of field bokeh.
2. **Japanese Anime / Manga** (`anime`): Cel-shading edge contours, pastel skies, and explosive **radial action speed lines** bursting on kick drops.
3. **3D CGI Animated** (`cgi_3d`): Soft volumetric subsurface bloom (Pixar/DreamWorks style), vibrant cartoon saturation, and character luminescence.
4. **Cyberpunk Unreal Engine 5** (`cyberpunk`): Raytraced volumetric neon bloom, **digital holographic HUD target reticles & grid lines**, and cyber code rain.
5. **90s Vintage MTV VHS Tape** (`vhs_retro`): Analog magnetic tape tracking distortion, scanline mesh, RGB color bleed fringing, and REC timestamp watermark.
6. **Psychedelic Acid Dream** (`acid_dream`): Kaleidoscopic prism warping, audio-reactive color cycle trails, and wireframe horizon grid.
7. **Dark Gothic / Film Noir** (`gothic_noir`): High-contrast chiaroscuro shadows, monochromatic silver tone with selective crimson/cyan highlights.
8. **Lo-Fi Watercolor & Paper** (`lofi_art`): Textured handmade paper grain, warm painterly brush blooms, and vinyl dust particles.

### 3. 🌧️ Environmental Atmosphere & Particle Physics Engine

- 🌧️ **Cinematic Rain & Lens Droplets**: Dynamic falling rain streaks with glass condensation droplets and refractions on kick drops.
- 🔥 **Fire Embers & Sparks**: Glowing physics embers rising and scattering outward on 808 sub-bass kicks.
- 🌸 **Sakura Cherry Blossoms**: Soft floating anime flower petals with natural rotational drift and stardust glow.
- 💻 **Cyberpunk Matrix Digital Code Rain**: Streams of glowing cyan and emerald digital glyphs cascading down the screen.
- ☀️ **Volumetric God Rays & Light Leaks**: Sweeping warm golden sun rays + chromatic film burns across scene cuts.

### 4. 🎥 Image-to-Video Multi-Axis Camera Motion

- `3D Depth Parallax (Runway Gen-3)`: Simulates 3D focal depth camera movement, tilt tracking, and separate foreground bokeh layers from 2D images.
- `Audio Fluid Wave (Kling / Luma AI)`: Organic AI wave pulse motion and fluid distortion synced to the music tempo.
- `Hyper Speed Vertigo Push (Sora AI)`: Accelerated forward camera push with dynamic motion blur.
- `Widescreen Film Tracking (Pika Labs)`: Smooth horizontal and vertical cinematic tracking shot motion.
- `360° Orbital Camera Spin (Kaiber AI)`: Continuous smooth orbital camera rotation around focal subject.
- `Sub-Surface Kinetic Pulse (DomoAI)`: Audio-reactive micro-vibrations and focal depth pulses.

### 5. 📺 MTV & VEVO 4K Broadcast Lower-Third Graphic

- Sleek glassmorphic broadcast credits card at video intro & outro with:
  - Custom Artist Name & Track Title
  - Director & Record Label credits (`DIR. MUSICVID AI · STUDIO RECORDS / VEVO 4K MASTER`)
  - Metallic VEVO 4K accent badge

### 6. 🔦 Stage Arena Spotlights & Sweeping Lasers

- 4 sweeping volumetric cone spotlights and laser beams sweeping the stage during high-energy choruses and drops.

### 7. 🎬 4-Act Screenplay Director with AI Prompt Enhancer & Beat Snap

- **4-Act Screenplay Structure**: Setup/Intro -> Rising Tension/Verse -> Climax/Drop -> Resolution/Outro.
- **AI Cinematic Prompt Enhancer**: One-click Hollywood 8K, anamorphic lens 35mm, and volumetric lighting keyword injector for all scenes.
- **Snap Cuts to Beat Drops**: One-click automatic alignment of scene transitions with 808 kick drops and musical section transitions.
- **3 Production Cut Modes**: Hybrid Director's Cut (Story + Lip-Sync), Cinematic Storyline Film, and Artist Lip-Sync Performance.

### 8. 🎛️ Live 60 FPS Interactive Studio Monitor & Master Exporter

- Real-time 60 FPS canvas compositor with transport controls, scrub timeline bar, and timecode.
- Live Viseme & Shot Status strip showing active camera angle (`SINGER LIP-SYNC ACTIVE` vs `STORY NARRATIVE SCENE`), viseme phoneme shape, and vocal energy meter.
- **Studio FX Rack**: Live aesthetic switcher, atmosphere toggles, shutter motion blur, and color grading LUTs.
- **Master Video Exporter**: 4K Cinema, 2K, 1080p, 720p with clean WebAudio audio mixdown into playable MP4 / WebM video.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18 (Hooks, WebAudio API, HTML5 Canvas 2D Engine)
- **Audio Processing**: Custom multi-band FFT analyzer (Sub-bass, Mids, Highs, Formant extraction)
- **Video Rendering Engine**: Real-time 60 FPS Canvas compositor + MediaRecorder 4K Export Engine
- **Styling**: Vanilla CSS Glassmorphism 2.0 with Deep Space Obsidian mesh theme
- **Desktop Packaging**: Electron 27 (Cross-platform desktop runner)

```text
musicvid-studio/
├── src/
│   ├── components/
│   │   ├── StepOne.js        # Style & Performer Studio (8 Styles, Singer portraits, Storyboard)
│   │   ├── StepTwo.js        # Audio & Beat Lab (Soundtrack library, Waveform, Stem indicators)
│   │   ├── StepThree.js      # Screenplay & Director Studio (4-Act cards, AI prompt enhancer, Beat snap)
│   │   └── StepFour.js       # Live 60FPS Studio Monitor & 4K Master Exporter
│   ├── services/
│   │   ├── VideoGenerator.js # Core Compositing Engine, Motion Paths, MTV Lower-Third, Shaders
│   │   ├── LipSyncEngine.js  # Formant extraction, Viseme mouth deformation, Eye blinks, Sway
│   │   ├── AtmosphereEngine.js # Particle shaders (Rain, Embers, Matrix rain, Sakura, God rays)
│   │   ├── RenderStyles.js   # 8 Rendering Aesthetics & Post-FX presets
│   │   ├── StoryDirector.js  # 4-Act screenplay generator & Singer portrait definitions
│   │   ├── AudioEngine.js    # Multi-band frequency synthesis & audio analysis
│   │   ├── LyricsEngine.js   # Beat-synced kinetic typography
│   │   └── AIService.js      # Storyline generation & prompt enrichment
│   ├── data/
│   │   └── templates.js      # Curated visual assets, storyline templates, transition presets
│   ├── styles/
│   │   └── Step.css          # Component stylesheets & glassmorphic UI controls
│   ├── App.js                # Main orchestrator, Milestone stepper, 1-Click Master Presets
│   └── App.css               # Design system tokens & global layout
├── public/
│   ├── electron.js           # Electron main process
│   └── index.html
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 16+ or Node.js 18+
- npm or yarn

### 1. Installation

```bash
git clone https://github.com/XxXKoZXxX/musicVideoGenerator.git
cd musicvid-studio
npm install
```

### 2. Run Development Server

```bash
npm start
```

Starts the React development server on `http://localhost:3000` and opens the Electron desktop window.

### 3. Build Production Bundle

```bash
npm run react-build
```

Builds an optimized, production-ready bundle in the `build/` directory.

---

## 🪄 1-Click Master Presets

Click any preset in the top header toolbar to instantly configure a complete music video:

- ⚡ **Cyberpunk 2077 Night Drive** (UE5 Raytracing, Kiriko Neon, Neon Wave, Rain)
- 🌸 **Anime J-Rock Anthem** (Anime Cel-Shading, Hikari Shonen, Speed Lines, Sakura)
- ✨ **3D Pixar CGI Hit** (3D Subsurface Bloom, Nova Pop, Fluid Wave, God Rays)
- 📼 **90s MTV VHS Throwback** (Analog Tape Scanlines, Retro Wave 84, MTV VEVO Card)
- 🔥 **808 Trap District** (Photoreal 8K, Metro Drill Rapper, Bass Explosions, Embers)

---

## 📜 License

Private project. Created with ❤️ for AI Music Video Creators.
