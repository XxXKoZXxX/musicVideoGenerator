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
  // Generate a complete 4-Act screenplay for the song
  static generateScreenplay(songInfo = {}, visualAssets = []) {
    const title = songInfo.title || songInfo.audioTitle || 'Cyber Odyssey';
    const bpm = songInfo.bpm || 128;
    const duration = Math.round(songInfo.duration || 32);

    const assetList = visualAssets.length > 0 ? visualAssets : [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    ];

    const sceneDuration = duration / 6;

    const scenes = [
      {
        id: 'scene-1',
        act: 'Act I: The Setup',
        title: 'Establish The World',
        directive: 'Raindrops glisten on glowing neon towers as shadows move across the alleyways.',
        cameraMove: 'slow-dolly',
        imageUrl: assetList[0 % assetList.length],
        startTime: 0,
        endTime: sceneDuration,
        isSingerCut: false,
      },
      {
        id: 'scene-2',
        act: 'Act II: Rising Tension (Verse 1)',
        title: 'Vocalist Infiltration',
        directive: 'The artist initiates neural link, streaming cyan digital code across the visor.',
        cameraMove: 'tracking-shot',
        imageUrl: assetList[1 % assetList.length],
        startTime: sceneDuration,
        endTime: sceneDuration * 2,
        isSingerCut: true, // Singer performs verse 1
      },
      {
        id: 'scene-3',
        act: 'Act II: The Pursuit (Pre-Chorus)',
        title: 'Drone Laser Sweep',
        directive: 'Crimson security sirens flash as drones sweep laser searchlights across the wet asphalt.',
        cameraMove: 'whip-pan',
        imageUrl: assetList[2 % assetList.length],
        startTime: sceneDuration * 2,
        endTime: sceneDuration * 3,
        isSingerCut: false, // Story action shot
      },
      {
        id: 'scene-4',
        act: 'Act III: THE DROP (Chorus)',
        title: 'Supernova Energy Climax',
        directive: 'Massive explosive energy pulse shatters reality with vibrant cyan & magenta light waves.',
        cameraMove: 'hyper-zoom',
        imageUrl: assetList[3 % assetList.length],
        startTime: sceneDuration * 3,
        endTime: sceneDuration * 4.5,
        isSingerCut: true, // Singer performs chorus with maximum power
      },
      {
        id: 'scene-5',
        act: 'Act III: Quantum Distortion (Bridge)',
        title: 'Zero Gravity Light Rift',
        directive: 'Holographic fragments dissolve into floating geometric stardust in zero gravity.',
        cameraMove: 'vortex',
        imageUrl: assetList[4 % assetList.length],
        startTime: sceneDuration * 4.5,
        endTime: sceneDuration * 5.2,
        isSingerCut: false, // Story psychedelic distortion
      },
      {
        id: 'scene-6',
        act: 'Act IV: Resolution (Outro)',
        title: 'Radiant Cyber Dawn',
        directive: 'Standing victorious atop the mega-city looking into the infinite horizon.',
        cameraMove: 'crane-pullout',
        imageUrl: assetList[0 % assetList.length],
        startTime: sceneDuration * 5.2,
        endTime: duration,
        isSingerCut: true, // Final vocalist close-up & fade
      },
    ];

    return {
      title: `${title} - Screenplay`,
      duration,
      bpm,
      actsCount: 4,
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
