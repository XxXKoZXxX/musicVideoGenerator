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

// Generate or retrieve a bespoke storyline created specifically for any given song
export async function generateStorylineFromAudio(audioInfo, genreOverride = null) {
  // Simulate AI model synthesis delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const title = audioInfo?.title || audioInfo?.audioTitle || 'Electric Dreams';
  const bpm = audioInfo?.bpm || 128;
  const duration = Math.round(audioInfo?.duration || 30);
  const genre = genreOverride || detectGenreFromSong(title, bpm);

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
    title: `${title} - AI Music Video Storyboard`,
    concept: generated.concept,
    bpm,
    duration,
    genre,
    scenes: generated.scenes,
    lyrics: generated.lyrics,
    text: `${generated.concept}\n\n` + generated.scenes.join('\n\n'),
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
