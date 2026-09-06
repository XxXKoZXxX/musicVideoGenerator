# 🎬 Connecting ChatGPT to MusicVid Studio AI Video Generator

This guide explains how to connect ChatGPT (via a **Custom GPT Action**) to your local/networked **MusicVid Studio Video Generator**, enabling ChatGPT to autonomously design music video scenes and trigger video generation directly on your connected engine.

---

## ⚡ Quick Connect URLs

When your server or tunnel is running, your live OpenAPI 3.1 schema is automatically hosted at:

- **Public Cloudflare Tunnel URL (Recommended for ChatGPT Actions)**:

  ```text
  https://postcard-teaching-reaction-disabilities.trycloudflare.com/openapi.json
  ```

  *(Note: If you restart the tunnel in `share.js`, the active public domain is saved in `public_url.txt` and accessible in the Studio's Share Modal under **🤖 ChatGPT Action**).*

- **Local Network / Development URL**:

  ```text
  http://localhost:4000/openapi.json
  http://localhost:3210/openapi.json
  ```

---

## 🛠️ Step-by-Step: Setting Up Custom GPT in ChatGPT

### Step 1: Create a Custom GPT

1. Log in to [ChatGPT](https://chatgpt.com).
2. On the left sidebar, click **Explore GPTs**.
3. Click **+ Create** (top right) to open the GPT Builder.
4. Switch from the *Create* tab to the **Configure** tab.

### Step 2: Configure GPT Profile

- **Name**: `MusicVid Studio AI Director & Generator`
- **Description**: `Directly connected to MusicVid Studio to generate cinematic music videos with Sora, Kling, Runway, and Higgsfield DoP.`
- **Instructions**:

  ```markdown
  You are the Lead Music Video Director & Production Assistant connected to MusicVid Studio's generation engine.

  Your capabilities:
  1. Use `listGenerators` to inspect the available AI video models (such as Sora, Kling 1.5, Runway Gen-3 Alpha, Higgsfield Cinema DoP, Luma Dream Machine, and Canvas 2D).
  2. Plan cinematic, scene-by-scene visual narratives tailored to the user's song title, tempo (BPM), and musical genre.
  3. Call `generateMusicVideo` to dispatch generation jobs to the connected video studio with specific scene prompts, camera motion vectors, and aspect ratios.
  4. Call `renderLyricVideo` if the user wants synchronized kinetic lyric animations.
  5. Use `getJobStatus` to check rendering progress and return the direct video preview/download link to the user when finished.

  Always confirm the visual direction, generator model (default to 'sora' or 'kling' for cinematic shots), and camera movement before dispatching generation.
  ```

### Step 3: Add the Custom Action

1. Scroll down to the **Actions** section and click **Create new action**.
2. Under **Schema**, click the **Import from URL** button.
3. Paste your active OpenAPI endpoint:

   ```text
   https://postcard-teaching-reaction-disabilities.trycloudflare.com/openapi.json
   ```

4. Click **Import**.
5. ChatGPT will parse the schema and display the available actions:
   - `listGenerators` (`GET /api/chatgpt/generators`)
   - `generateMusicVideo` (`POST /api/chatgpt/generate-video`)
   - `renderLyricVideo` (`POST /api/chatgpt/render-lyrics`)
   - `getJobStatus` (`GET /api/chatgpt/status/{jobId}`)
6. **Authentication**: Set to `None` (Public action endpoint).
7. **Privacy Policy**: Enter your tunnel domain (e.g. `https://postcard-teaching-reaction-disabilities.trycloudflare.com`).

### Step 4: Save and Test

1. In the top right, click **Save** (or **Update**) and choose *Only me* or *Anyone with a link*.
2. In the preview chat window, try these prompts:
   - *"What video generator models are available in the connected studio?"*
   - *"Generate a 5-scene music video for my song 'Cyberpunk City' using the Sora video engine."*

---

## 🔌 Available Endpoints & Capabilities

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/openapi.json` | `GET` | Live OpenAPI 3.1.0 specification with active server URL |
| `/.well-known/ai-plugin.json` | `GET` | OpenAI AI Plugin manifest |
| `/api/chatgpt/generators` | `GET` | Returns list of all 11 supported generators, feature sets, and best-use guidance |
| `/api/chatgpt/generate-video` | `POST` | Dispatches multi-scene video generation (Sora, Kling, Runway, Higgsfield, etc.) |
| `/api/chatgpt/render-lyrics` | `POST` | Renders synchronized typography / lyric video MP4 on the local compositor engine |
| `/api/chatgpt/status/:jobId` | `GET` | Polls progress and returns video streaming/download URLs upon completion |
| `/v1/chat/completions` | `POST` | OpenAI API chat completion emulation for LLM agents |

---

## 🖥️ Server Architecture

```text
[ ChatGPT Custom Action ]
           │
           ▼ (HTTPS)
 [ Cloudflare Tunnel ] ───► [ Web & Proxy Server (Port 3210) ]
                                      │ (Reverse Proxy)
                                      ▼ (HTTP)
                         [ Video Generator Engine (Port 4000) ]
                           ├── /openapi.json
                           ├── /api/chatgpt/*
                           ├── /renders/*
                           └── /api/ai-video/*
```

- **Backend Generator Engine**: Runs on port `4000` via `npm run server` or `node server/index.js`.
- **Web App & Reverse Proxy**: Runs on port `3210` via `node serve.js` or `node share.js`. All `/api/`, `/renders/`, `/v1/`, and `/openapi.json` requests are automatically proxied to port `4000`.
