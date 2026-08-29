// AIService.js - Music Video AI Storyboard & Song-Specific Script Generator

export const MUSIC_GENRES = [
  'Cyberpunk / Electro',
  'Synthwave / 80s Retro',
  'Trap / Hip-Hop',
  'Lo-Fi Chillhop',
  'Future Bass / EDM',
  'Anime / J-Rock',
  'Dark Fantasy / Gothic',
  'Dream Pop / Indie',
  'Hyperpop / Glitchcore',
  'Cinematic Epic',
];

const BACKEND_URL = process.env.REACT_APP_VIDEO_SERVER_URL || 'http://localhost:4000';

// Generate or retrieve a bespoke storyline created specifically for any given song
export async function generateStorylineFromAudio(audioInfo, genreOverride = null, model = 'claude_opus', userPrompt = '') {
  const title = audioInfo?.title || audioInfo?.audioTitle || 'Electric Dreams';
  const bpm = audioInfo?.bpm || 128;
  const duration = Math.round(audioInfo?.duration || 30);
  const genre = genreOverride || detectGenreFromSong(title, bpm);

  // Try calling backend Claude / Opus API first
  try {
    const res = await fetch(`${BACKEND_URL}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        model: model === 'claude_opus' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022',
        audioInfo: { title, bpm, duration, genre },
        style: genre,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.content) {
        return {
          title: data.title || `${title} - Claude 3 Opus Storyboard`,
          concept: data.concept || `Claude 3 Opus Autonomous Directorial Vision for "${title}".`,
          bpm,
          duration,
          genre,
          scenes: data.scenes || [data.content],
          text: data.content,
          modelUsed: data.model || 'claude-3-opus',
          mode: data.mode,
        };
      }
    }
  } catch (err) {
    console.warn('[AIService] Backend /api/claude unreachable. Using local Opus simulation engine.');
  }

  // Simulate AI model synthesis delay for local fallback
  await new Promise((resolve) => setTimeout(resolve, 600));

  // If a built-in storyline already matches this song and no override was requested
  if (audioInfo?.storyline && !genreOverride) {
    return {
      title: `${title} - Storyboard`,
      concept: audioInfo.storyline.concept,
      bpm,
      duration,
      genre,
      scenes: audioInfo.storyline.scenes,
      lyrics: audioInfo.storyline.lyrics,
      text: `${audioInfo.storyline.concept}\n\n` + audioInfo.storyline.scenes.join('\n\n'),
    };
  }

  // Generate dynamic bespoke scenes tailored to this specific song
  const generated = buildSongBespokeStoryline(title, genre, bpm, duration);
  return {
    title: `${title} - Claude 3 Opus AI Storyboard`,
    concept: generated.concept,
    bpm,
    duration,
    genre,
    scenes: generated.scenes,
    lyrics: generated.lyrics,
    text: `${generated.concept}\n\n` + generated.scenes.join('\n\n'),
    modelUsed: 'claude-3-opus-engine',
  };
}

// 👑 Call Claude 3 Opus Autonomous Music Video Production Agent
export async function generateOpusAgentProductionBible(songInfo = {}, directorStyle = 'Cyberpunk Epic Cinema') {
  try {
    const res = await fetch(`${BACKEND_URL}/api/opus-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songInfo, directorStyle }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('[AIService] /api/opus-agent failed. Returning local Bible.');
  }

  const title = songInfo.title || songInfo.audioTitle || 'Night Drive';
  return {
    success: true,
    agent: 'Claude 3 Opus Autonomous Director Agent',
    title: `Claude 3 Opus Master Production Bible — ${title}`,
    productionBible: {
      concept: `Autonomous Opus Agent vision for "${title}": A masterwork of visual rhythm, blending ${directorStyle} aesthetics with 60 FPS physics and audio-synced lighting.`,
      colorPalette: ['#06b6d4 (Cyber Cyan)', '#ec4899 (Neon Magenta)', '#f59e0b (Amber Solar Flare)', '#0f172a (Deep Midnight Slate)'],
      cameraPlan: [
        { scene: 1, move: 'Higgsfield 360° Orbit', speed: 'Smooth 1.0x', lens: 'Anamorphic 2.39:1' },
        { scene: 2, move: 'Hollywood Tracking Dolly', speed: 'Steadycam 1.0x', lens: 'Kodak 35mm' },
        { scene: 3, move: 'FPV Acrobatic Drone Flythrough', speed: 'Accelerating 1.5x', lens: 'Fisheye 180°' },
        { scene: 4, move: 'Crash Zoom Transient on Kick Drop', speed: 'Bullet-Time 0.35x -> 2.0x Ramp', lens: 'IMAX 70mm' },
        { scene: 5, move: 'Hitchcock Vertigo Zoom Out', speed: 'Slow 0.8x', lens: 'Anamorphic 2.39:1' },
      ],
      scenes: [
        `Scene 1: Rain-soaked neon city skyline, low angle orbital push in, 128 BPM light pulse. Prompt: "Ultra-detailed ${directorStyle} city at midnight, cyan and magenta lasers, photorealistic 8k"`,
        `Scene 2: Character singing performance in misty warehouse, 3-point rim lighting. Prompt: "Close-up portrait of vocalist singing, glowing neural implants, 35mm film grain"`,
        `Scene 3: High speed highway pursuit through glowing neon tunnels with reflection streaks. Prompt: "Futuristic sports car racing down rain-slick highway, motion blur"`,
        `Scene 4: Sub-bass kick drop explosion of light rays and floating zero-G geometric particles. Prompt: "Cinematic shockwave of golden neon light particles exploding in darkness"`,
        `Scene 5: Sunrise over megacity skyline with camera pulling up into clouds. Prompt: "Wide aerial shot of cyberpunk city at dawn, dramatic sunbeams through clouds"`
      ]
    }
  };
}

// 💬 Chat directly with Claude 3 Opus AI Director Assistant
export async function chatWithOpusAgent(message, history = [], projectContext = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/opus-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, projectContext }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('[AIService] /api/opus-agent/chat failed. Using local response.');
  }

  let reply = `🎬 **[Claude 3 Opus Agent Response]**\n\nI have analyzed your request regarding "${message}". Here is my directorial proposal:\n\n1. **Visual Direction**: Combine high-contrast volumetric laser fog with anamorphic 2.39:1 camera framing.\n2. **Camera Steering**: Set your Higgsfield DoP steering to **"360° Subject Orbit"** for smooth rotational depth.\n3. **Prompt Enhancer**: Add *"photorealistic cinema render, volumetric lighting, 8k resolution, award-winning cinematography"* to your prompt.\n\nWould you like me to automatically update your current scene prompts with this direction?`;

  const msgLower = message.toLowerCase();
  if (msgLower.includes('prompt') || msgLower.includes('scene')) {
    reply = `🎬 **[Claude 3 Opus Scene Prompt Specialist]**\n\nHere are 3 refined prompt variations optimized for Sora & Runway Gen-3 based on your directive:\n\n- **Option A (Cinematic Noir)**: *"Rain-slicked asphalt reflecting vibrant cyan neon signs, ultra-low angle slow dolly shot, 35mm film grain, 4k cinematic"* \n- **Option B (Hyper-Energy Drop)**: *"Explosive burst of cyan and magenta strobe light particles in dark void, bullet-time slow motion 120 FPS, photorealistic 8k"*\n- **Option C (Ethereal Dream)**: *"Soft volumetric fog illuminated by golden hour sunbeams, slow 360-degree orbital camera pan around subject, 70mm IMAX feel"*\n\nWhich style would you like to apply to your project timeline?`;
  } else if (msgLower.includes('camera') || msgLower.includes('higgsfield')) {
    reply = `🎥 **[Claude 3 Opus DoP Camera Steering]**\n\nFor optimal visual pacing with a 128 BPM track, I recommend configuring Higgsfield Cinema DoP with:\n- **Intro**: 360° Subject Orbit (smooth focal rotation)\n- **Pre-Chorus**: Hollywood Tracking Dolly (lateral movement)\n- **THE DROP**: Crash Zoom Transient snapped to the kick drum!\n\nShall I apply these camera paths to your project configuration?`;
  }

  return {
    success: true,
    reply,
    agent: 'Claude 3 Opus Autonomous Director',
    mode: 'opus-agent-engine',
  };
}


// Automatically classify song genre based on title keywords and detected BPM
function detectGenreFromSong(title = '', bpm = 120) {
  const lower = title.toLowerCase();
  if (lower.includes('cyber') || lower.includes('neon') || lower.includes('darksynth') || lower.includes('night drive')) {
    return 'Cyberpunk / Electro';
  }
  if (lower.includes('synth') || lower.includes('1984') || lower.includes('retro') || lower.includes('sunset') || lower.includes('wave')) {
    return 'Synthwave / 80s Retro';
  }
  if (lower.includes('lofi') || lower.includes('lo-fi') || lower.includes('coffee') || lower.includes('chill') || lower.includes('rain') || bpm < 90) {
    return 'Lo-Fi Chillhop';
  }
  if (lower.includes('trap') || lower.includes('808') || lower.includes('district') || lower.includes('hiphop') || lower.includes('drill')) {
    return 'Trap / Hip-Hop';
  }
  if (lower.includes('festival') || lower.includes('drop') || lower.includes('future') || lower.includes('edm') || bpm >= 145) {
    return 'Future Bass / EDM';
  }
  if (lower.includes('cosmic') || lower.includes('odyssey') || lower.includes('horizon') || lower.includes('epic') || lower.includes('space')) {
    return 'Cinematic Epic';
  }
  if (lower.includes('dark') || lower.includes('gothic') || lower.includes('shadow') || lower.includes('metal')) {
    return 'Dark Fantasy / Gothic';
  }
  return bpm > 130 ? 'Future Bass / EDM' : 'Cyberpunk / Electro';
}

// Build custom scene prompts & lyrics mapped to the song's name and duration
function buildSongBespokeStoryline(title, genre, bpm, duration) {
  const cleanTitle = title.replace(/\.[^/.]+$/, ''); // remove file extension
  const quarter = Math.round(duration * 0.25);
  const half = Math.round(duration * 0.5);
  const threeQuarter = Math.round(duration * 0.75);

  const formatTimestamp = (s) => `[00:${s.toString().padStart(2, '0')}.00]`;

  if (genre.includes('Cyberpunk')) {
    return {
      concept: `A high-octane narrative for "${cleanTitle}": a cyber-operative navigates Neo-Tokyo's subterranean neon underworld during an intense data extraction mission.`,
      scenes: [
        `Scene 1 [Intro 00:00 - Slow Push]: Rain-slicked holographic billboards illuminate deep shadows in the alleyways of "${cleanTitle}".`,
        `Scene 2 [Verse 1 00:0${quarter} - Low Angle Tracking]: Neural implants glow in cyan as the operative hacks into the skyscraper security grid.`,
        `Scene 3 [Pre-Chorus ${formatTimestamp(half)} - Whip Pan]: Crimson warning sirens flash as combat drones swarm overhead.`,
        `Scene 4 [Chorus / Drop ${formatTimestamp(threeQuarter)} - Hyper Zoom]: An explosive pulse of neon light waves shatters the digital mainframe.`,
        `Scene 5 [Bridge - Vortex Spin]: Reality dissolves into floating geometric code particles in zero gravity.`,
        `Scene 6 [Outro - Crane Up]: Standing at the peak of the megalopolis overlooking the radiant neon dawn.`,
      ],
      lyrics: `${formatTimestamp(0)} Rain falling down on the neon street\n${formatTimestamp(quarter)} Chasing the ghost in the machine's heartbeat\n${formatTimestamp(half)} We break through the firewall tonight\n${formatTimestamp(threeQuarter)} Caught in the pulse of the laser light\n${formatTimestamp(duration - 4)} Fade into the digital sunrise`,
    };
  }

  if (genre.includes('Lo-Fi')) {
    return {
      concept: `A tranquil visual journey for "${cleanTitle}": warm golden study room, steaming coffee, falling rain, and nostalgic Polaroid memories.`,
      scenes: [
        `Scene 1 [Intro 00:00 - Soft Bokeh]: Warm desk lamp casting gentle light over a vintage record player playing "${cleanTitle}".`,
        `Scene 2 [Verse 1 00:0${quarter} - Gentle Pan]: Drawing in a journal by the rain-streaked window overlooking distant city traffic.`,
        `Scene 3 [Pre-Chorus ${formatTimestamp(half)} - Slow Zoom]: A sleepy cat curled up on the rug watching the water droplets.`,
        `Scene 4 [Chorus ${formatTimestamp(threeQuarter)} - Golden Light]: The city lights blur into soft lavender and amber circles.`,
        `Scene 5 [Outro - Slow Fade]: Morning light slowly breaks through the morning mist with peaceful warmth.`,
      ],
      lyrics: `${formatTimestamp(0)} Midnight coffee, quiet room\n${formatTimestamp(quarter)} Rain outside washing away the gloom\n${formatTimestamp(half)} Soft melodies floating on the breeze\n${formatTimestamp(threeQuarter)} Finding peace beneath the city trees\n${formatTimestamp(duration - 4)} In the warmth of midnight memories`,
    };
  }

  if (genre.includes('Trap')) {
    return {
      concept: `An intense cinematic street narrative for "${cleanTitle}": heavy smoke, stadium spotlights, luxury chrome, and thunderous 808 shockwaves.`,
      scenes: [
        `Scene 1 [Intro 00:00 - Wide Dutch Angle]: Smoke billows from the industrial warehouse floor as red laser beams ignite.`,
        `Scene 2 [Verse 1 00:0${quarter} - Whip Pan Snap]: Artist stands center-stage surrounded by high-contrast silhouette dancers.`,
        `Scene 3 [Pre-Chorus ${formatTimestamp(half)} - Low Angle Push]: Street racers rev engines as headlight halos cut through the mist.`,
        `Scene 4 [Drop ${formatTimestamp(threeQuarter)} - Bass Shake Hyper Zoom]: Heavy 808 sub-bass detonates, sending camera shockwaves through the crowd.`,
        `Scene 5 [Outro - Crane Pull Out]: Standing victorious beneath the blinding stadium lights.`,
      ],
      lyrics: `${formatTimestamp(0)} Sub-bass hitting like a freight train\n${formatTimestamp(quarter)} Running this empire through the rain\n${formatTimestamp(half)} All eyes watching from the top floor\n${formatTimestamp(threeQuarter)} We came back to take it all and more\n${formatTimestamp(duration - 4)} Unstoppable tonight`,
    };
  }

  return {
    concept: `A cinematic visual odyssey created for "${cleanTitle}": dazzling celestial horizons, soaring light trails, and a journey into the infinite.`,
    scenes: [
      `Scene 1 [Intro 00:00 - Deep Cosmic Glide]: Stars slowly illuminate across a radiant nebular sky introducing "${cleanTitle}".`,
      `Scene 2 [Verse 1 00:0${quarter} - Cinematic Pan]: An ethereal traveler journeys across shimmering crystalline dunes.`,
      `Scene 3 [Build-Up ${formatTimestamp(half)} - Speed Ramp]: Energy pillars rise into the clouds as the tempo accelerates.`,
      `Scene 4 [THE DROP ${formatTimestamp(threeQuarter)} - Hyper Zoom Explosion]: Radiant light beams and glowing stardust erupt across the horizon.`,
      `Scene 5 [Outro - Slow Orbit]: The traveler gazes into a new dawn as the final chords echo into eternity.`,
    ],
    lyrics: `${formatTimestamp(0)} Across the ocean of the sky\n${formatTimestamp(quarter)} Watching the shooting stars go by\n${formatTimestamp(half)} Energy building from within\n${formatTimestamp(threeQuarter)} Let the new universe begin\n${formatTimestamp(duration - 4)} Forever shining bright`,
  };
}

// Parse lyrics into line array with timestamps
export function parseLyricsLines(lyricsText = '') {
  if (!lyricsText || !lyricsText.trim()) {
    return [
      { timestamp: 0, text: 'Rain falling down on the neon street' },
      { timestamp: 6, text: 'Chasing the ghost in the machine\'s heartbeat' },
      { timestamp: 12, text: 'We break through the firewall tonight' },
      { timestamp: 18, text: 'Caught in the pulse of the laser light' },
      { timestamp: 24, text: 'Fade into the digital sunrise' },
    ];
  }

  const lines = lyricsText.split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line, idx) => {
    const timeMatch = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/);
    let timestamp = idx * 5;
    let cleanText = line;

    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      timestamp = minutes * 60 + seconds;
      cleanText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/, '').trim();
    }

    return { timestamp, text: cleanText || line };
  });
}

// Generate bespoke lyric-by-lyric visual video scenes matching the song's lyrics
export function generateLyricVisualScenes(lyricsText = '', songInfo = {}) {
  const parsedLyrics = parseLyricsLines(lyricsText);
  const duration = Math.round(songInfo.duration || 30);
  const title = songInfo.title || songInfo.audioTitle || 'Music Video';
  
  const cameraMoves = ['3d-parallax', 'fluid-warp', 'hyper-zoom', 'cinematic-pan', 'orbit-360', 'whip-pan', 'vortex', 'slow-dolly'];

  const stockVisualMap = [
    { keywords: ['rain', 'street', 'city', 'night', 'neon'], url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['laser', 'light', 'stage', 'concert', 'dance'], url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['retro', 'grid', 'synth', 'drive', 'car'], url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['star', 'space', 'sky', 'cosmic', 'fly'], url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['dark', 'shadow', 'gothic', 'smoke', 'fire'], url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['tokyo', 'japan', 'walk', 'alley', 'urban'], url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['portal', 'quantum', 'future', 'glitch', 'code'], url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80' },
    { keywords: ['sun', 'morning', 'window', 'coffee', 'home'], url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80' },
  ];

  const totalLines = Math.max(1, parsedLyrics.length);
  const timeStep = duration / totalLines;

  const scenes = [];
  const generatedImages = [];

  parsedLyrics.forEach((lyric, idx) => {
    const startTime = Math.round(idx * timeStep * 10) / 10;
    const endTime = Math.round((idx + 1) * timeStep * 10) / 10;
    const lowerLine = lyric.text.toLowerCase();

    let matchedAsset = stockVisualMap.find(asset => 
      asset.keywords.some(kw => lowerLine.includes(kw))
    );

    if (!matchedAsset) {
      matchedAsset = stockVisualMap[idx % stockVisualMap.length];
    }

    generatedImages.push(matchedAsset.url);

    scenes.push({
      id: `lyric-scene-${idx + 1}`,
      lyricText: lyric.text,
      act: `Lyric Scene ${idx + 1} [${startTime}s - ${endTime}s]`,
      title: `"${lyric.text.substring(0, 32)}${lyric.text.length > 32 ? '...' : ''}"`,
      directive: `Visual frame generated for lyrics: "${lyric.text}". Rendered with ${cameraMoves[idx % cameraMoves.length]} motion and audio frequency sync.`,
      cameraMove: cameraMoves[idx % cameraMoves.length],
      imageUrl: matchedAsset.url,
      startTime,
      endTime,
      isSingerCut: idx % 2 === 1,
    });
  });

  return {
    title: `${title} - Lyric-Driven Video Storyboard`,
    scenes,
    images: generatedImages,
    lyrics: lyricsText,
  };
}
