# MusicVid Studio - System Architecture

## 🏗 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MUSICVID STUDIO DESKTOP APP                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         ELECTRON MAIN PROCESS (public/electron.js)      │   │
│  │  - Manages window lifecycle                             │   │
│  │  - IPC communication bridge                             │   │
│  │  - File dialogs (image/audio selection)                 │   │
│  │  - Video file export                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↑                                                         │
│         │ IPC (preload.js)                                       │
│         ↓                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │     REACT FRONTEND (src/App.js & Components)           │   │
│  │  - 4-step workflow UI                                   │   │
│  │  - State management for project data                    │   │
│  │  - Component hierarchy                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                         │
│         ├─ STEPS/COMPONENTS                                      │
│         │  ├── StepOne: Image Selection                         │
│         │  ├── StepTwo: Audio Selection                         │
│         │  ├── StepThree: Storyline Selection                   │
│         │  │   ├── AIStoryline (AI-generated)                   │
│         │  │   ├── TemplateStoryline (predefined)               │
│         │  │   └── CustomStoryline (user-written)               │
│         │  └── StepFour: Video Generation                       │
│         │                                                        │
│         └─ SERVICES                                              │
│            ├── AIService (Claude API)                           │
│            └── VideoGenerator (FFmpeg orchestration)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │
         ├─ HTTP/REST (for AI)
         │   ↓
         │  ┌──────────────────┐
         │  │  BACKEND SERVER  │
         │  ├──────────────────┤
         │  │ /api/claude      │ → Anthropic API
         │  │ /api/generate    │ → FFmpeg
         │  └──────────────────┘
         │
         └─ FILE SYSTEM (local rendering)
             ↓
            FFmpeg (video composition)
```

## 📊 Data Flow

### Step 1: Image Selection
```
User clicks "Add Images"
    ↓
Electron dialog (selectImage)
    ↓
File system (local images)
    ↓
React state: project.images = [path1, path2, ...]
    ↓
UI updates with grid of thumbnails
```

### Step 2: Audio Selection
```
User clicks "Select Audio"
    ↓
Electron dialog (selectAudio)
    ↓
File system (MP3, WAV, etc.)
    ↓
React state: project.audio = path
    ↓
UI displays audio file info
```

### Step 3a: AI-Generated Storyline
```
User selects "AI-Generated" mode
    ↓
AIService.generateStorylineFromAudio(audioPath)
    ↓
HTTP POST /api/claude with audio metadata
    ↓
Backend analyzes audio characteristics
    ↓
Claude API generates 5-scene storyline
    ↓
React state: project.storyline = generated_text
    ↓
UI displays with edit capability
```

### Step 3b: Template Selection
```
User selects template (e.g., "Love Story")
    ↓
TemplateStoryline loads from data/templates.js
    ↓
React state: project.storyline = template_object
    ↓
UI confirms selection
```

### Step 3c: Custom Story
```
User writes 5 scenes manually
    ↓
CustomStoryline captures scene texts
    ↓
React state: project.storyline = { type: 'custom', scenes: [...] }
    ↓
User clicks "Continue"
```

### Step 4: Video Generation
```
VideoGenerator.generate(project, settings, progressCallback)
    ↓
1. analyzeAudio(audioPath)
   - Extract: duration, format, beats, silence markers
   - Returns: audio metadata
   ↓
2. calculateImageTimings(images, duration)
   - Distribute images evenly across audio duration
   - Account for transitions (0.5-1.0s each)
   - Returns: timing array
   ↓
3. generateLipSyncFrames(images, audioAnalysis)
   - Detect faces in images
   - Extract mouth regions
   - Create animation frames matching phonemes
   - Composite back to original images
   - Returns: processed images with animation data
   ↓
4. composeVideo(processedImages, timings, audioPath)
   - Use FFmpeg to create video:
     a. Create image sequence from frames
     b. Apply transitions between images
     c. Calculate cross-fade timing
     d. Apply effects based on storyline mood
     e. Mix audio track
     f. Encode to MP4
   - Returns: video buffer
   ↓
progressCallback(100) - Done!
```

## 🔄 Component Hierarchy

```
App (main orchestrator)
├── Header
│   ├── Title: "🎬 MusicVid Studio"
│   └── Subtitle
│
├── ProgressBar
│   ├── Step 1 ●○○○
│   ├── Step 2 ○●○○
│   ├── Step 3 ○○●○
│   └── Step 4 ○○○●
│
└── StepsContainer
    ├── StepOne (if step === 1)
    │   ├── UploadButton
    │   ├── ImageGrid
    │   │   ├── ImageCard
    │   │   ├── ImageCard
    │   │   └── ImageCard
    │   └── NavigationButtons
    │
    ├── StepTwo (if step === 2)
    │   ├── SelectAudioButton
    │   ├── AudioFileDisplay
    │   └── NavigationButtons
    │
    ├── StepThree (if step === 3)
    │   ├── ModeSelector
    │   │   ├── AIGeneratedCard
    │   │   ├── TemplateCard
    │   │   └── CustomCard
    │   │
    │   └── StorylineMode (one of):
    │       ├── AIStoryline
    │       │   ├── GenerateButton
    │       │   └── StorylineEditor
    │       │
    │       ├── TemplateStoryline
    │       │   ├── TemplateGrid
    │       │   │   ├── TemplateCard
    │       │   │   ├── TemplateCard
    │       │   │   └── ...
    │       │   └── TemplateDetail
    │       │       ├── StoryPreview
    │       │       ├── ScenesList
    │       │       └── SelectButton
    │       │
    │       └── CustomStoryline
    │           ├── OverallStoryInput
    │           ├── SceneInputList
    │           │   ├── SceneInput
    │           │   ├── SceneInput
    │           │   └── SceneInput
    │           └── AddSceneButton
    │
    └── StepFour (if step === 4)
        ├── SettingsPanel
        │   ├── FPSSelector
        │   ├── TransitionSelector
        │   ├── SpeedSelector
        │   └── QualitySelector
        │
        ├── GenerateButton
        │
        ├── ProgressBar (if generating)
        │   └── ProgressPercentage
        │
        └── ExportButton (if ready)
            └── SaveDialog
```

## 🔌 API Endpoints (To Implement)

### Claude AI Integration
```
POST /api/claude
Content-Type: application/json

{
  "prompt": "Generate a music video storyline...",
  "audioMetadata": {
    "duration": 180,
    "mood": "melancholic",
    "tempo": "slow",
    "genre": "indie-pop"
  }
}

Response:
{
  "success": true,
  "storyline": "Scene 1: ...\nScene 2: ...",
  "mood": "reflective",
  "themes": ["loss", "healing", "hope"]
}
```

### Video Generation
```
POST /api/video/generate
Content-Type: application/json

{
  "images": ["/path/to/img1.jpg", "/path/to/img2.jpg", ...],
  "audio": "/path/to/audio.mp3",
  "settings": {
    "fps": 24,
    "transition": "fade",
    "speed": 1.0,
    "quality": "high"
  },
  "storyline": {
    "type": "ai-generated",
    "content": "Scene 1: ..."
  }
}

Response (Streamed):
{
  "progress": 45,
  "status": "composing-video",
  "message": "Adding transitions..."
}

Final Response:
{
  "success": true,
  "videoPath": "/tmp/music-video-xyz.mp4",
  "duration": 180,
  "fileSize": "125MB"
}
```

## 🗂 Service Layer Details

### AIService (src/services/AIService.js)

**Methods:**
- `generateStorylineFromAudio(audioPath)` → Promise<string>
  - Analyzes audio file
  - Calls /api/claude endpoint
  - Returns generated storyline text
  
- `callClaudeAPI(prompt)` → Promise<string>
  - Generic Claude API caller
  - Sends prompt to backend
  - Returns response text

**Dependencies:**
- `axios` for HTTP calls
- Backend API endpoint

### VideoGenerator (src/services/VideoGenerator.js)

**Constructor:**
```javascript
new VideoGenerator(project, settings, progressCallback)
```

**Methods:**
- `generate()` → Promise<Buffer>
  - Main orchestration method
  - Calls all sub-methods in sequence
  - Updates progress via callback
  - Returns video buffer

- `analyzeAudio(audioPath)` → Promise<AudioMetadata>
  - Uses FFprobe to extract metadata
  - Analyzes beats, silence
  - Returns duration, sample rate, beat markers

- `calculateImageTimings(images, totalDuration)` → TimingArray
  - Distributes images across duration
  - Accounts for transitions
  - Returns start/end times per image

- `generateLipSyncFrames(images, audioAnalysis)` → ProcessedImages
  - Detects faces in images
  - Creates mouth animation frames
  - Composites frames into images
  - Returns processed image data

- `composeVideo(processedImages, timings, audioPath)` → Buffer
  - Creates FFmpeg command
  - Adds transitions
  - Adds audio
  - Renders to MP4
  - Returns video buffer

## 🎨 Styling Architecture

```
App.css
├── Theme variables (colors, fonts)
├── Global layouts (flexbox containers)
└── Header, footer styles

Step.css
├── .step-container (main layout)
├── .upload-btn (CTA buttons)
├── .image-card (thumbnail grid)
├── .mode-card (option cards)
├── .btn (all buttons with variants)
├── .progress-bar (progress indicator)
└── .settings-panel (form controls)

Storylines.css
├── .generate-section (AI prompt area)
├── .template-grid (template selection)
├── .template-card (individual templates)
├── .storyline-textarea (text input)
├── .scene-input (custom scene fields)
└── Animation keyframes (@keyframes pulse)
```

## 🔐 Security Considerations

1. **IPC Communication (Electron)**
   - Use `contextIsolation: true`
   - Only expose necessary APIs via preload.js
   - Validate file paths server-side

2. **API Keys**
   - Store ANTHROPIC_API_KEY in backend .env
   - Never expose in frontend code
   - Call via backend endpoint (/api/claude)

3. **File Handling**
   - Validate file types before processing
   - Sanitize file paths
   - Implement file size limits
   - Secure temp file cleanup

4. **User Data**
   - All video generation happens locally
   - No cloud storage of user images
   - No tracking of user projects

## ⚡ Performance Optimization

### Frontend
- React.memo for expensive components
- Lazy loading of templates
- Image preview compression
- Virtual scrolling for large grids

### Video Generation
- Stream processing (not loading full video to RAM)
- Parallel image processing
- Optimized FFmpeg encoding settings
- Hardware acceleration (H.264 with CUDA if available)

### Memory Management
- Clean up temp files after export
- Release processed image buffers
- Cancel ongoing operations on unmount

## 🧪 Testing Strategy

```
Unit Tests (Jest)
├── AIService.test.js
├── VideoGenerator.test.js
├── Components (*.test.js)
└── Utils

Integration Tests (Cypress)
├── Full workflow
├── File dialogs
├── Error handling
└── Export

E2E Tests
└── Desktop app (Spectron)
    ├── Window management
    ├── IPC communication
    └── File operations
```

## 📦 Build & Deployment

### Development
```bash
npm start  # Runs React dev server + Electron
```

### Production Build
```bash
npm run build  # Builds React app
npm run electron-build  # Packages desktop app
```

### Distribution
- **Windows**: NSIS installer
- **macOS**: DMG file
- **Linux**: AppImage or Snap

---

This architecture supports a modular, scalable approach where each layer is independent and testable.
