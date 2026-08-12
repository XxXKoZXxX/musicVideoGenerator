// StoryDirector.js - Cinematic 4-Act Screenplay Director & Production Cut Sequencer

export const DIRECTOR_MODES = [
  {
    id: 'hybrid',
    name: "Director's Cut (Story + Lip-Sync)",
    desc: 'Cinematic narrative intercut with the lip-syncing singer on vocal verses & beat drops',
    badge: 'RECOMMENDED',
  },
  {
    id: 'story',
    name: 'Cinematic Storyline Film',
    desc: '100% focus on narrative world storyline, dramatic scene actions, and 3D camera angles',
    badge: 'STORY FOCUS',
  },
  {
    id: 'performance',
    name: 'Artist Lip-Sync Performance',
    desc: '100% focus on the singer with audio-reactive facial performance, stage lighting, and vocal aura',
    badge: 'VOCAL FOCUS',
  },
];

export const SINGER_PORTRAITS = [
  {
    id: 'singer-neon-cyber',
    name: 'Cyberpunk Vocalist (Female)',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
    mood: 'Cyberpunk / Neon',
  },
  {
    id: 'singer-synth-pop',
    name: 'Synthwave Pop Artist (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
    mood: 'Retro / Pop',
  },
  {
    id: 'singer-trap-drill',
    name: 'Street Trap Rapper (Male)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=80',
    mood: 'Trap / Hip-Hop',
  },
  {
    id: 'singer-lofi-indie',
    name: 'Lo-Fi Indie Singer (Female)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000&auto=format&fit=crop&q=80',
    mood: 'Lo-Fi / Acoustic',
  },
];

export class StoryDirector {
  // Generate a complete screenplay dynamically mapping all visual assets and parsing lyrics line-by-line
  static generateScreenplay(songInfo = {}, visualAssets = []) {
    const title = songInfo.title || songInfo.audioTitle || 'Cyber Odyssey';
    const bpm = songInfo.bpm || 128;
    const duration = Math.round(songInfo.duration || 32);
    
    // Fallback assets if none provided
    const assetList = visualAssets.length > 0 ? visualAssets : [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
    ];

    const cameraMoves = ['slow-dolly', 'tracking-shot', 'whip-pan', 'hyper-zoom', 'vortex', 'crane-pullout', '3d-tilt', 'orbit-360'];
    const scenes = [];
    
    // Parse lyrics to generate scenes
    const rawLyrics = songInfo.lyrics || songInfo.aiStoryboard?.lyrics;
    let lyricLines = [];
    
    if (rawLyrics) {
      const lines = rawLyrics.split('\\n').filter(l => l.trim().length > 0);
      lyricLines = lines.map(line => {
        // Parse [mm:ss.xx] timestamp if exists
        const match = line.match(/^\\[(\\d{2}):(\\d{2}(?:\\.\\d+)?)\\]\\s*(.*)/);
        if (match) {
          const mins = parseInt(match[1]);
          const secs = parseFloat(match[2]);
          return { time: mins * 60 + secs, text: match[3] };
        }
        return { time: -1, text: line };
      });
    }

    if (lyricLines.length > 3) {
      // Create a scene for each lyric line
      for (let i = 0; i < lyricLines.length; i++) {
        const line = lyricLines[i];
        const nextLine = lyricLines[i + 1];
        
        let startTime = line.time;
        let endTime = nextLine ? nextLine.time : -1;
        
        // Auto-distribute timestamps if missing
        if (startTime === -1) startTime = (i / lyricLines.length) * duration;
        if (endTime === -1) endTime = ((i + 1) / lyricLines.length) * duration;
        if (endTime <= startTime) endTime = Math.min(duration, startTime + 3);
        
        const isSinger = i % 3 === 0 || i === lyricLines.length - 1; // Singer appears every 3 scenes and at the end
        
        // Determine Act based on time
        let act = 'Act I: Intro';
        if (startTime > duration * 0.25) act = 'Act II: Verse';
        if (startTime > duration * 0.5) act = 'Act III: Chorus';
        if (startTime > duration * 0.75) act = 'Act IV: Outro';
        
        // Try to find a matching video from visualAssets based on lyrics, or use round-robin
        let selectedAsset = assetList[i % assetList.length];
        
        // If it's a generated video (contains object with type 'video'), prefer it
        if (songInfo.aiGeneratedVideos && songInfo.aiGeneratedVideos[i]) {
          selectedAsset = songInfo.aiGeneratedVideos[i];
        }

        scenes.push({
          id: `scene-${i + 1}`,
          act: act,
          title: isSinger ? `Vocal Cut: "${line.text}"` : `Narrative: "${line.text}"`,
          directive: isSinger
            ? `Singer performs "${line.text}" with dynamic facial expressions and real-time lip-sync.`
            : `Cinematic sequence mapping to: "${line.text}".`,
          cameraMove: cameraMoves[i % cameraMoves.length],
          imageUrl: selectedAsset?.url || selectedAsset,
          media: selectedAsset, // Full object in case it's a video
          startTime: Math.round(startTime * 10) / 10,
          endTime: Math.round(endTime * 10) / 10,
          isSingerCut: isSinger,
          lyricText: line.text
        });
      }
    } else {
      // Fallback: 20 procedural scenes if no lyrics
      const numScenes = 20;
      const sceneDuration = duration / numScenes;
      for (let i = 0; i < numScenes; i++) {
        const actIdx = Math.min(3, Math.floor((i / numScenes) * 4));
        const acts = ['Act I: Establishment & World Setup', 'Act II: Rising Vocal Tension', 'Act III: THE BASS DROP (Chorus)', 'Act IV: Climax & Resolution'];
        const isSinger = i % 2 === 1 || i === numScenes - 1;
        
        let selectedAsset = assetList[i % assetList.length];
        if (songInfo.aiGeneratedVideos && songInfo.aiGeneratedVideos[i]) {
          selectedAsset = songInfo.aiGeneratedVideos[i];
        }

        scenes.push({
          id: `scene-${i + 1}`,
          act: acts[actIdx],
          title: isSinger ? `Vocal Performance Shot #${Math.ceil((i + 1) / 2)}` : `Narrative World Scene #${Math.ceil((i + 1) / 2)}`,
          directive: isSinger
            ? `Singer performs high-energy vocals with real-time lip-sync visemes and dynamic stage lighting.`
            : `Cinematic 3D camera pan across scene visual environment with audio-reactive parallax depth.`,
          cameraMove: cameraMoves[i % cameraMoves.length],
          imageUrl: selectedAsset?.url || selectedAsset,
          media: selectedAsset,
          startTime: Math.round(i * sceneDuration * 10) / 10,
          endTime: Math.round((i + 1) * sceneDuration * 10) / 10,
          isSingerCut: isSinger,
        });
      }
    }

    return {
      title: `${title} - ${scenes.length}-Cut Production Screenplay`,
      duration,
      bpm,
      actsCount: 4,
      scenesCount: scenes.length,
      scenes,
    };
  }

  // Get active shot & camera state for current timestamp
  static evaluateDirectorShot(screenplay, elapsed, directorMode = 'hybrid', audioMetrics = {}) {
    const scenes = screenplay?.scenes || [];
    if (!scenes.length) return { sceneIndex: 0, isSingerShot: directorMode === 'performance', scene: null };

    // Find matching scene by timestamp
    let currentScene = scenes[0];
    let sceneIndex = 0;

    for (let i = 0; i < scenes.length; i++) {
      if (elapsed >= scenes[i].startTime && elapsed <= scenes[i].endTime) {
        currentScene = scenes[i];
        sceneIndex = i;
        break;
      }
    }

    let isSingerShot = false;

    if (directorMode === 'performance') {
      isSingerShot = true;
    } else if (directorMode === 'story') {
      isSingerShot = false;
    } else {
      // Hybrid Director's Cut:
      // Singer appears on scenes marked as singer cuts OR when vocal energy is dominant and not an 808 drop
      const vocalDominant = audioMetrics.mids > 0.28;
      const isSubBassDrop = audioMetrics.isKick;

      if (isSubBassDrop) {
        // Fast dynamic cut to narrative world explosion on bass kick
        isSingerShot = false;
      } else if (currentScene.isSingerCut || vocalDominant) {
        isSingerShot = true;
      } else {
        isSingerShot = false;
      }
    }

    const sceneProgress = (elapsed - currentScene.startTime) / Math.max(0.1, currentScene.endTime - currentScene.startTime);

    return {
      sceneIndex,
      scene: currentScene,
      sceneProgress: Math.min(1, Math.max(0, sceneProgress)),
      isSingerShot,
      cameraMove: currentScene.cameraMove || 'hyper-zoom',
    };
  }
}

export default StoryDirector;
