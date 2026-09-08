# 🎬 Connecting ChatGPT to MusicVid Studio AI Video Generator

This guide explains how to connect ChatGPT (via a **Custom GPT Action**) to your local/networked **MusicVid Studio Video Generator**, enabling ChatGPT to autonomously design music video scenes, trigger video generation, execute terminal commands, and inspect/modify codebase files directly on your connected Antigravity workspace.

---

## ⚡ Quick Connect URLs

When your server or tunnel is running, your live OpenAPI 3.1 schema and Bearer token are automatically hosted at:

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

- **Bearer API Key (Token)**:
  Generated securely on your machine. Inspect your local `chatgpt_token.txt` file or open the Studio's Share Modal under **🤖 ChatGPT Action** to copy your secret key (keep it private and do not share in public chats).

---

## 🛠️ Step-by-Step: Setting Up Custom GPT in ChatGPT

### Step 1: Create a Custom GPT

1. Log in to [ChatGPT](https://chatgpt.com).
2. On the left sidebar, click **Explore GPTs**.
3. Click **+ Create** (top right) to open the GPT Builder.
4. Switch from the *Create* tab to the **Configure** tab.

### Step 2: Configure GPT Profile

- **Name**: `MusicVid Studio AI Director & Terminal Engineer`
- **Description**: `Directly connected to MusicVid Studio to generate videos (Sora, Kling, Runway), run terminal commands, and inspect/modify code.`
- **Instructions**:

  ```markdown
  You are the Lead Music Video Director & Remote Engineering Assistant connected to MusicVid Studio's local engine and Antigravity workspace.

  Your capabilities:
  1. Video Generation: Use `listGenerators` to inspect AI video models, `generateVideo` to dispatch multi-scene video generation, and `renderLyricsVideo` for synchronized kinetic lyric videos.
  2. Terminal Execution: Use `executeCommand` to run powershell commands directly on the project machine (e.g., `npm test`, `git status`, `git diff`, `npm run react-build`). Always inspect exit codes and stderr.
  3. Workspace Inspection: Use `listFiles` to discover repository structure, `readFile` to examine source files, and `writeFile` to propose or make code adjustments.
  4. Status Polling: Use `getJobStatus` to check rendering progress and return streaming and download links.

  Always verify tests pass after making any code adjustments.
  ```

### Step 3: Add the Custom Action

1. Scroll down to the **Actions** section and click **Create new action**.
2. Under **Schema**, click the **Import from URL** button.
3. Paste your active OpenAPI endpoint:

   ```text
   https://quick-camels-show.loca.lt/openapi.json
   ```

4. Click **Import**.
5. ChatGPT will parse the schema and display the available actions:
   - `listGenerators` (`GET /api/chatgpt/generators`)
   - `generateVideo` (`POST /api/chatgpt/generate-video`)
   - `renderLyricsVideo` (`POST /api/chatgpt/render-lyrics`)
   - `getJobStatus` (`GET /api/chatgpt/status/{jobId}`)
   - `executeCommand` (`POST /api/chatgpt/terminal/exec`)
   - `listFiles` (`GET /api/chatgpt/workspace/files`)
   - `readFile` (`POST /api/chatgpt/workspace/read-file`)
   - `writeFile` (`POST /api/chatgpt/workspace/write-file`)
6. **Authentication**: Select **API Key** &rarr; Auth Type: **Bearer** &rarr; paste the secret token from your local `chatgpt_token.txt` file (or Studio Share Modal).
7. **Privacy Policy**: Enter your tunnel domain (e.g. `https://postcard-teaching-reaction-disabilities.trycloudflare.com`).

### Step 4: Save and Test

1. In the top right, click **Save** (or **Update**) and choose *Only me* or *Anyone with a link*.
2. In the preview chat window, try these prompts:
   - *"Run `npm test` on the connected studio and show me the results."*
   - *"List the files in the `src/services` directory."*
   - *"Inspect `src/services/VideoGenerator.js` and explain how video rendering works."*
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
| `/api/chatgpt/terminal/exec` | `POST` | Remote command line execution in the project repository shell (PowerShell) |
| `/api/chatgpt/workspace/files` | `GET` | Directory listing and file discovery in the Antigravity workspace |
| `/api/chatgpt/workspace/read-file` | `POST` | Reads source code and config file contents from the workspace |
| `/api/chatgpt/workspace/write-file` | `POST` | Writes or updates source code files directly in the workspace |
| `/v1/chat/completions` | `POST` | OpenAI API chat completion emulation for LLM agents |

---

## 🖥️ Server Architecture

```text
[ ChatGPT Custom Action ]
           │
           ▼ (HTTPS with Bearer Token)
 [ Cloudflare Tunnel ] ───► [ Web & Proxy Server (Port 3210) ]
                                      │ (Reverse Proxy)
                                      ▼ (HTTP)
                         [ Video Generator & Terminal Engine (Port 4000) ]
                           ├── /openapi.json
                           ├── /api/chatgpt/terminal/exec
                           ├── /api/chatgpt/workspace/*
                           ├── /api/chatgpt/generate-video
                           ├── /renders/*
                           └── /api/ai-video/*
```

- **Backend Generator & Terminal Engine**: Runs on port `4000` via `npm run server` or `node server/index.js`.
- **Web App & Reverse Proxy**: Runs on port `3210` via `node serve.js` or `node share.js`. All `/api/`, `/renders/`, `/v1/`, and `/openapi.json` requests are automatically proxied to port `4000`.
