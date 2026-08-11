# 🎬 MusicVid Studio

AI-powered music video generation app that transforms your images into lip-synced videos with dynamic storylines based on your song.

## Features

### Core Capabilities
- **Image Upload**: Add multiple images that will be used as frames
- **Audio Import**: Import your music tracks (MP3, WAV, AAC, FLAC)
- **Three Storyline Modes**:
  - **AI-Generated**: Claude analyzes your song and creates a unique storyline
  - **Template-Based**: Choose from 8+ predefined storyline templates
  - **Custom Story**: Write your own narrative scene by scene
- **Lip-Sync Animation**: Automatically animate faces in images to match audio
- **Video Composition**: Generate MP4 videos with professional transitions
- **Customizable Settings**: FPS, transitions (fade/pan/zoom/slide), playback speed, quality

### Storyline Templates
- Love Story (Romantic)
- Empowerment & Victory (Uplifting)
- Heartbreak & Healing (Melancholic)
- Celebration & Party (High Energy)
- Self-Discovery Journey (Inspirational)
- Nature & Connection (Peaceful)
- Rebellion & Defiance (Bold)
- Nostalgia & Memories (Reflective)

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **Desktop**: Electron 27
- **Video Processing**: FFmpeg (local rendering)
- **AI**: Claude API (for storyline generation)
- **Styling**: CSS Grid + Gradient UI

### Project Structure
```
musicvid-studio/
├── src/
│   ├── components/
│   │   ├── StepOne.js (image selection)
│   │   ├── StepTwo.js (audio selection)
│   │   ├── StepThree.js (storyline selection)
│   │   ├── StepFour.js (generation & export)
│   │   └── storylines/
│   │       ├── AIStoryline.js
│   │       ├── TemplateStoryline.js
│   │       └── CustomStoryline.js
│   ├── services/
│   │   ├── AIService.js (Claude API integration)
│   │   └── VideoGenerator.js (video composition)
│   ├── data/
│   │   └── templates.js (storyline templates)
│   ├── styles/
│   │   └── Step.css (component styles)
│   ├── App.js (main orchestrator)
│   └── index.js
├── public/
│   ├── electron.js (main Electron process)
│   ├── preload.js (security bridge)
│   └── index.html
└── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- FFmpeg (for video rendering)
- Anthropic API key (for AI storyline generation)

### Install FFmpeg
**Windows**:
```bash
# Using chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Mac**:
```bash
brew install ffmpeg
```

**Linux**:
```bash
sudo apt-get install ffmpeg
```

### Installation
```bash
cd C:\Users\User\musicvid-studio
npm install
```

### Environment Setup
Create `.env` in the project root:
```
REACT_APP_ANTHROPIC_API_KEY=your-api-key-here
```

## Development

### Start Dev Server
```bash
npm start
```

This runs both:
- React dev server on http://localhost:3000
- Electron app (waits for React server)

### Build Desktop App
```bash
npm run build
```

Creates standalone Electron app in `dist/` directory.

## Workflow (4-Step Process)

### Step 1: Select Images
- Click "Add Images" to select image files
- Add multiple images for your video
- Images will be displayed in sequence with lip-sync animation

### Step 2: Select Audio
- Import your music track
- Supported formats: MP3, WAV, AAC, FLAC
- Audio duration determines total video length

### Step 3: Choose Storyline
**Option A - AI Generated**:
- Claude analyzes audio characteristics
- Generates unique 5-scene storyline
- Edit and customize the generated story

**Option B - Template**:
- Browse 8+ pre-built storyline templates
- Each template has 5 themed scenes
- Instant selection and use

**Option C - Custom**:
- Write your own overall narrative (optional)
- Add individual scene descriptions
- One scene per image

### Step 4: Generate & Export
- Configure video settings (FPS, transitions, speed, quality)
- Click "Generate Video"
- Monitor progress bar (0-100%)
- Export finished MP4 to your desired location

## How It Works

### Image Processing
1. Images are analyzed for facial features
2. Mouth regions are extracted and processed
3. Lip-sync animation frames are generated to match audio phonemes

### Audio Analysis
1. FFmpeg extracts audio metadata (duration, sample rate)
2. Beat detection for timing synchronization
3. Silence detection for pacing

### Video Composition
1. Images displayed according to timing calculations
2. Transitions applied between each image
3. Lip-sync animation composited over images
4. Storyline elements influence visual effects/mood
5. Audio track mixed in
6. Final render to MP4

### Storyline Integration
- AI-generated stories inform visual mood and pacing
- Template selection determines transition style
- Custom stories provide narrative structure for scene ordering

## Advanced Features (Planned)

- [ ] Face detection & automatic lip-sync animation
- [ ] Beat-synced transitions (changes on music beats)
- [ ] Text overlay with storyline narration
- [ ] Music analysis (mood, tempo, genre auto-detection)
- [ ] Voice-over generation (TTS)
- [ ] Effect library (glow, particles, color grading)
- [ ] Batch video generation
- [ ] Cloud rendering option
- [ ] Video preview player
- [ ] Export quality options (1080p, 4K)

## API Integration

### Claude API (For AI Storylines)
The app calls Claude to generate context-aware storylines:

```javascript
// Backend endpoint would look like:
POST /api/claude
{
  "prompt": "Create a 5-scene music video storyline for a song with mood: [mood]"
}
// Returns generated storyline text
```

### FFmpeg Commands
Used for video composition:
```bash
# Image sequence to video
ffmpeg -framerate 24 -i image_%d.png -c:v libx264 -pix_fmt yuv420p output.mp4

# Add audio
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest output_with_audio.mp4
```

## Keyboard Shortcuts

- `→` or `Space` — Next step
- `←` or `Esc` — Back/Previous step
- `Ctrl+O` — Open file dialog
- `Ctrl+S` — Save/Export

## Troubleshooting

### FFmpeg Not Found
Ensure FFmpeg is installed and in system PATH:
```bash
ffmpeg -version  # Should print version info
```

### API Key Not Working
Check `.env` file and ensure key is valid:
```bash
echo $REACT_APP_ANTHROPIC_API_KEY
```

### Electron Won't Start
Kill any existing processes:
```bash
pkill -f electron
npm start
```

### Video Export Issues
- Ensure audio file is not corrupted
- Check disk space
- Try lower quality setting

## Performance Tips

- **Large Images**: Keep under 5MB each; app will auto-resize
- **Long Audio**: 5+ minute files may take longer to render
- **Quality**: Set to "Medium" for faster generation; "High"/"Ultra" for final export
- **Transitions**: "Fade" is fastest; "Zoom"/"Pan" more CPU-intensive

## File Size Estimates

| Duration | Quality | Est. Size |
|----------|---------|-----------|
| 3 min    | Low     | 30-50 MB  |
| 3 min    | Medium  | 60-100 MB |
| 3 min    | High    | 150-250 MB|
| 3 min    | Ultra   | 400-600 MB|

## License

Private project - not for distribution

## Roadmap

### v0.1 (Current - Prototype)
- Basic UI and step-by-step workflow
- Template and custom storylines
- Placeholder video generation

### v0.2 (Next)
- Real FFmpeg integration
- Lip-sync animation engine
- Claude API integration for AI storylines
- Audio analysis (beat detection, tempo)

### v0.3
- Face detection and automatic lip-sync
- Beat-synced transitions
- Effects library
- Performance optimizations

### v1.0
- Cloud rendering support
- Batch processing
- Advanced audio analysis
- Video preview player
- Export presets

## Support & Feedback

This is an experimental prototype. For issues or feature requests, consult the development team.

---

**Made with ♦ and AI** | MusicVid Studio v0.1.0
