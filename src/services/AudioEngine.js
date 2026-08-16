// AudioEngine.js - Multi-Band Audio Analyzer, Beat Detection & Music Generation Engine

export const BUILT_IN_TRACKS = [
  {
    id: 'cyberpunk-neon',
    title: 'Cyberpunk 2077 Night Drive',
    artist: 'MusicVid AI',
    genre: 'Cyberpunk / Darksynth',
    bpm: 128,
    duration: 32,
    mood: 'High Energy & Dark',
    color: '#06b6d4',
    recommendedLut: 'cyberpunk',
    recommendedVisualizer: 'radial',
    storyline: {
      concept: 'A renegade cyber-hacker races across rain-slicked skyscrapers of Neo-Tokyo, evading surveillance drones during a midnight data extraction.',
      scenes: [
        'Scene 1 [Intro - Slow Dolly In]: Raindrops glisten on glowing neon billboards as shadows move across an alleyway in Neo-Tokyo.',
        'Scene 2 [Verse 1 - Low Angle Pan]: The protagonist activates their holographic visor, reflecting streams of glowing digital code.',
        'Scene 3 [Pre-Chorus - Whip Pan]: Security drones hover overhead, sweeping crimson laser grids across the wet asphalt.',
        'Scene 4 [Drop / Chorus - Hyper Zoom]: A massive energy burst pulses through the city skyline as neon light trails explode in vibrant cyan and magenta.',
        'Scene 5 [Bridge - Vortex Spin]: Glitching reality bends as digital holograms shatter into floating geometric light particles.',
        'Scene 6 [Outro - Crane Pull Out]: Standing on the rooftop edge overlooking the glowing mega-city at dawn, victorious.',
      ],
      lyrics: `[00:00.00] Rain falling down on the neon street\n[00:06.00] Chasing the ghost in the machine's heartbeat\n[00:12.00] We break through the firewall tonight\n[00:18.00] Caught in the pulse of the laser light\n[00:24.00] Fade into the digital sunrise`,
    },
  },
  {
    id: 'synthwave-horizon',
    title: 'Neon Sunset 1984',
    artist: 'MusicVid AI',
    genre: 'Synthwave / Retro',
    bpm: 120,
    duration: 32,
    mood: 'Nostalgic & Uplifting',
    color: '#ec4899',
    recommendedLut: 'retrosunset',
    recommendedVisualizer: 'ribbon',
    storyline: {
      concept: 'An outrun sports car cruising towards a giant wireframe sunset on an endless grid highway into the retro-future.',
      scenes: [
        'Scene 1 [Intro - Static Glow]: Chrome cassette tape spinning on a glowing dashboard in the midnight purple mist.',
        'Scene 2 [Verse 1 - Tracking Shot]: Red taillights streak across a glistening highway reflecting palm trees and neon arcade signs.',
        'Scene 3 [Pre-Chorus - Cockpit View]: Revving the turbo engine as the speedometer surges past 120 MPH.',
        'Scene 4 [Drop / Chorus - Dynamic Pan]: The giant chrome sun on the horizon pulses with laser beam rays across the wireframe grid.',
        'Scene 5 [Bridge - Dreamy Slow-Mo]: Flying through clouds of pink star dust and retro grid mountains.',
        'Scene 6 [Outro - Fade to Sunset]: The car accelerates into the radiant horizon of 1984.',
      ],
      lyrics: `[00:00.00] Midnight radio playing our song\n[00:06.00] We've been driving this road for so long\n[00:12.00] Chasing the sun on a neon line\n[00:18.00] Running out of words, running out of time\n[00:24.00] Forever 1984`,
    },
  },
  {
    id: 'lofi-midnight',
    title: 'Midnight Coffee Lo-Fi',
    artist: 'MusicVid AI',
    genre: 'Lo-Fi Chillhop',
    bpm: 85,
    duration: 30,
    mood: 'Mellow & Relaxed',
    color: '#8b5cf6',
    recommendedLut: 'vhs',
    recommendedVisualizer: 'bars',
    storyline: {
      concept: 'A cozy midnight bedroom with rain tapping gently on the glass, steaming coffee, vintage turntable, and distant blurry streetlights.',
      scenes: [
        'Scene 1 [Intro - Soft Focus]: Warm desk lamp illuminating a steaming cup of coffee and a spinning vintage vinyl record.',
        'Scene 2 [Verse 1 - Gentle Pan]: Drawing in a worn sketchbook while rain streams down the window glass.',
        'Scene 3 [Pre-Chorus - Slow Zoom]: A sleepy cat curled up on the windowsill watching distant car headlights through the mist.',
        'Scene 4 [Chorus - Atmospheric Bokeh]: City skyline blurred into soft glowing circles of golden and lavender light.',
        'Scene 5 [Outro - Slow Dissolve]: Midnight thoughts drifting away as soft dawn light gently fills the quiet room.',
      ],
      lyrics: `[00:00.00] Midnight coffee, quiet room\n[00:06.00] Rain outside washing away the gloom\n[00:12.00] Soft melodies floating on the breeze\n[00:18.00] Finding peace beneath the city trees\n[00:24.00] In the warmth of midnight memories`,
    },
  },
  {
    id: 'trap-808-heat',
    title: 'Sub-Bass 808 District',
    artist: 'MusicVid AI',
    genre: 'Trap / Hip-Hop',
    bpm: 140,
    duration: 28,
    mood: 'Aggressive & Heavy',
    color: '#f59e0b',
    recommendedLut: 'cinema35',
    recommendedVisualizer: 'particles',
    storyline: {
      concept: 'Underground street performance under harsh cinematic stadium floodlights, chrome luxury cars, and heavy sub-bass atmospheric smoke.',
      scenes: [
        'Scene 1 [Intro - Low Angle Wide]: Heavy smoke billows from sewer grates under flashing red stadium spotlights.',
        'Scene 2 [Verse 1 - Fast Whip Pan]: Artist standing before high-contrast shadows with iced-out chrome chains glinting.',
        'Scene 3 [Pre-Chorus - Dutch Angle]: Street racers gather around glowing LED headlights in an industrial warehouse.',
        'Scene 4 [Drop / Chorus - Bass Shake Zoom]: Massive 808 drops trigger camera shake and laser flashes across the crowd.',
        'Scene 5 [Bridge - Strobe Glitch]: Black and white high-contrast cuts with intense rhythm strobe pulses.',
        'Scene 6 [Outro - Pull Out]: Stepping into the center spotlight with a crown of golden stage light overhead.',
      ],
      lyrics: `[00:00.00] Sub-bass hitting like a freight train\n[00:06.00] Running this empire through the rain\n[00:12.00] All eyes watching from the top floor\n[00:18.00] We came back to take it all and more\n[00:23.00] Unstoppable tonight`,
    },
  },
  {
    id: 'future-bass-drop',
    title: 'Starlight Festival Drop',
    artist: 'MusicVid AI',
    genre: 'Future Bass / EDM',
    bpm: 150,
    duration: 32,
    mood: 'Euphoric & Vibrant',
    color: '#10b981',
    recommendedLut: 'acidprism',
    recommendedVisualizer: 'particles',
    storyline: {
      concept: 'A colossal holographic festival stage suspended in the night sky with 100,000 fans jumping to synchronized laser storms and confetti.',
      scenes: [
        'Scene 1 [Intro - Deep Bass Ambient]: Giant holographic stage glows in the dark as festival lights slowly warm up.',
        'Scene 2 [Verse 1 - Wide Crowd Pan]: Ocean of glowing wristbands waving in unison under starry sky.',
        'Scene 3 [Build-Up - Speed Ramp]: Drum snare roll accelerates with blinding white strobe bursts.',
        'Scene 4 [THE DROP - Hyper Zoom]: Euphoric saw synth explodes as massive laser cannons erupt in cyan and gold.',
        'Scene 5 [Bridge - Zero Gravity Float]: Dancers floating weightlessly through swirling holographic particle nebulae.',
        'Scene 6 [Outro - Sky Fireworks]: Giant celestial fireworks fill the night as festival chords reverberate into dawn.',
      ],
      lyrics: `[00:00.00] Feel the energy rising high\n[00:06.00] We are starlight in the sky\n[00:12.00] When the bass drops feel the sound\n[00:18.00] Lifting us up off the ground\n[00:24.00] Alive in the festival light`,
    },
  },
  {
    id: 'cinematic-odyssey',
    title: 'Cosmic Horizon Odyssey',
    artist: 'MusicVid AI',
    genre: 'Cinematic Epic',
    bpm: 95,
    duration: 34,
    mood: 'Atmospheric & Grand',
    color: '#3b82f6',
    recommendedLut: 'darkgothic',
    recommendedVisualizer: 'tunnel',
    storyline: {
      concept: 'An interstellar astronaut navigates ancient cosmic wormholes and rings of luminous planets on a voyage to the edge of the universe.',
      scenes: [
        'Scene 1 [Intro - Cosmic Silence]: Spaceship cockpit drifting silently past the iridescent glowing rings of Saturn.',
        'Scene 2 [Verse 1 - Slow Parallax]: Giant celestial nebula swirls in deep violet and sapphire stellar dust.',
        'Scene 3 [Pre-Chorus - Warp Charge]: Energy rings charge around the spacecraft as hyper-drive coordinates lock in.',
        'Scene 4 [Chorus / Climax - Warp Speed]: The ship accelerates through a brilliant tunnel of relativistic starlight.',
        'Scene 5 [Bridge - Planet Arrival]: Emerging above a breathtaking crystalline world with twin radiant suns.',
        'Scene 6 [Outro - Cosmic Majesty]: The explorer steps onto the uncharted planetary surface looking into infinity.',
      ],
      lyrics: `[00:00.00] Across the ocean of the stars\n[00:06.00] Leaving behind what once was ours\n[00:12.00] Through the wormhole into the deep\n[00:18.00] Secrets that the cosmos keep\n[00:24.00] A new horizon begins`,
    },
  },
];

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.currentSource = null;
    this.gainNode = null;
    this.analyserMaster = null;
    this.analyserBass = null;
    this.analyserMids = null;
    this.analyserHighs = null;
    this.filterBass = null;
    this.filterMids = null;
    this.filterHighs = null;
    this.audioBuffer = null;
    this.waveformPeaks = [];
    this.isSynthesized = false;
    this.trackBlobUrl = null;
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Generate high quality procedural musical audio buffer for instant creation
  createSynthesizedTrack(trackId) {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;
    const trackInfo = BUILT_IN_TRACKS.find((t) => t.id === trackId) || BUILT_IN_TRACKS[0];
    const duration = trackInfo.duration;
    const bpm = trackInfo.bpm;
    const totalSamples = Math.floor(sampleRate * duration);
    const audioBuffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);

    const secondsPerBeat = 60 / bpm;
    const samplesPerBeat = Math.floor(sampleRate * secondsPerBeat);

    // Procedural synthesis based on genre
    for (let i = 0; i < totalSamples; i++) {
      const time = i / sampleRate;
      const beatProgress = (i % samplesPerBeat) / samplesPerBeat;
      const beatIndex = Math.floor(i / samplesPerBeat);
      const barIndex = Math.floor(beatIndex / 4);

      let sampleL = 0;
      let sampleR = 0;

      if (trackInfo.genre.includes('Cyberpunk') || trackInfo.genre.includes('Darksynth')) {
        // Kick on every beat
        const kickEnv = Math.exp(-beatProgress * 22);
        const kickPitch = 120 * Math.exp(-beatProgress * 28) + 42;
        const kick = Math.sin(2 * Math.PI * kickPitch * (beatProgress * secondsPerBeat)) * kickEnv;

        // Snare / Clap on beat 2 & 4
        let snare = 0;
        if (beatIndex % 2 === 1) {
          const snareEnv = Math.exp(-beatProgress * 15);
          const noise = (Math.random() * 2 - 1) * 0.6;
          const tone = Math.sin(2 * Math.PI * 220 * (beatProgress * secondsPerBeat)) * 0.4;
          snare = (noise + tone) * snareEnv;
        }

        // Bassline 16th notes
        const sixteenth = (i % Math.floor(samplesPerBeat / 4)) / Math.floor(samplesPerBeat / 4);
        const bassEnv = Math.exp(-sixteenth * 12);
        const notes = [55, 55, 65.41, 55, 49, 49, 58.27, 49];
        const bassFreq = notes[beatIndex % notes.length];
        const saw = (2 * ((bassFreq * time) % 1) - 1) * bassEnv * 0.45;

        // Arpeggiated neon lead
        const arpNotes = [440, 523.25, 659.25, 783.99, 880, 659.25];
        const arpStep = Math.floor(time * 8) % arpNotes.length;
        const arpEnv = Math.exp(-((time * 8) % 1) * 6);
        const arp = Math.sin(2 * Math.PI * arpNotes[arpStep] * time) * arpEnv * 0.2;

        sampleL = kick * 0.8 + snare * 0.5 + saw * 0.6 + arp * 0.4;
        sampleR = kick * 0.8 + snare * 0.5 + saw * 0.6 - arp * 0.4;
      } else if (trackInfo.genre.includes('Lo-Fi')) {
        // Vinyl crackle texture
        const crackle = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.08 : 0;

        // Soft boom-bap kick
        let kick = 0;
        if (beatIndex % 4 === 0 || (beatIndex % 4 === 2 && beatProgress < 0.5)) {
          const env = Math.exp(-beatProgress * 14);
          kick = Math.sin(2 * Math.PI * 65 * time) * env * 0.7;
        }

        // Soft rim snare on 2 & 4
        let snare = 0;
        if (beatIndex % 2 === 1) {
          const env = Math.exp(-beatProgress * 18);
          snare = (Math.random() * 2 - 1) * env * 0.35;
        }

        // Jazzy electric piano chords
        const chordFreqs = [
          [261.63, 329.63, 392.0, 493.88],
          [220.0, 261.63, 329.63, 392.0],
          [174.61, 220.0, 261.63, 329.63],
          [196.0, 246.94, 293.66, 349.23],
        ];
        const currentChord = chordFreqs[barIndex % chordFreqs.length];
        let chord = 0;
        for (const freq of currentChord) {
          chord += Math.sin(2 * Math.PI * freq * time) * 0.08;
        }

        sampleL = kick + snare + chord + crackle;
        sampleR = kick + snare + chord * 0.95 + crackle * 0.8;
      } else if (trackInfo.genre.includes('Trap')) {
        // Heavy 808 Sub-bass Kick
        const kickEnv = Math.exp(-beatProgress * 8);
        const pitchBend = 70 * Math.exp(-beatProgress * 15) + 38;
        const kick = Math.sin(2 * Math.PI * pitchBend * (beatProgress * secondsPerBeat)) * kickEnv * 0.9;

        // Crisp Trap Clap on beat 3
        let clap = 0;
        if (beatIndex % 4 === 2) {
          const clapEnv = Math.exp(-beatProgress * 20);
          clap = (Math.random() * 2 - 1) * clapEnv * 0.6;
        }

        // Fast Hi-Hats with rolls
        const hatSpeed = beatIndex % 4 === 3 ? 16 : 8;
        const hatPhase = (time * hatSpeed) % 1;
        const hatEnv = Math.exp(-hatPhase * 30);
        const hat = (Math.random() * 2 - 1) * hatEnv * 0.25;

        // Dark bell melody
        const bells = [587.33, 659.25, 698.46, 880.0];
        const bellNote = bells[Math.floor(time * 2) % bells.length];
        const bell = Math.sin(2 * Math.PI * bellNote * time) * Math.exp(-((time * 2) % 1) * 3) * 0.2;

        sampleL = kick + clap + hat + bell;
        sampleR = kick + clap - hat + bell;
      } else if (trackInfo.genre.includes('Cinematic')) {
        // Cinematic deep drum & orchestral pads
        const drumEnv = Math.exp(-beatProgress * 10);
        const drum = Math.sin(2 * Math.PI * 45 * time) * drumEnv * 0.85;

        // Grand ethereal pads
        const padFreqs = [196.0, 246.94, 293.66, 392.0];
        let pad = 0;
        for (const freq of padFreqs) {
          pad += Math.sin(2 * Math.PI * freq * time) * 0.1;
        }

        sampleL = drum + pad;
        sampleR = drum + pad * 0.98;
      } else {
        // High Energy Future Bass / Synthwave default
        const kickEnv = Math.exp(-beatProgress * 20);
        const kick = Math.sin(2 * Math.PI * 90 * Math.exp(-beatProgress * 25) * time) * kickEnv * 0.8;

        let snare = 0;
        if (beatIndex % 2 === 1) {
          snare = (Math.random() * 2 - 1) * Math.exp(-beatProgress * 16) * 0.5;
        }

        // Sidechained SuperSaw Chords
        const sawChordFreqs = [330, 392, 494, 659];
        let sawChords = 0;
        const sidechain = Math.min(1, Math.max(0.1, beatProgress * 3));
        for (const freq of sawChordFreqs) {
          const s = 2 * ((freq * time) % 1) - 1 + (2 * ((freq * 1.01 * time) % 1) - 1);
          sawChords += s * 0.08;
        }
        sawChords *= sidechain;

        sampleL = kick + snare + sawChords;
        sampleR = kick + snare + sawChords;
      }

      // Soft limiter / saturation
      left[i] = Math.tanh(sampleL * 1.1) * 0.85;
      right[i] = Math.tanh(sampleR * 1.1) * 0.85;
    }

    this.audioBuffer = audioBuffer;
    this.waveformPeaks = this.extractPeaks(audioBuffer, 200);
    this.isSynthesized = true;
    this.trackBlobUrl = this.bufferToWaveBlob(audioBuffer);

    return {
      audioBuffer,
      duration,
      bpm,
      peaks: this.waveformPeaks,
      blobUrl: this.trackBlobUrl,
      title: trackInfo.title,
      storyline: trackInfo.storyline,
      recommendedLut: trackInfo.recommendedLut,
      recommendedVisualizer: trackInfo.recommendedVisualizer,
      genre: trackInfo.genre,
    };
  }

  // Convert AudioBuffer to WAV Blob URL so HTML Audio Elements can play/record it seamlessly
  bufferToWaveBlob(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    function setUint16(data) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF identifier
    out.setUint8(pos++, 82); out.setUint8(pos++, 73); out.setUint8(pos++, 70); out.setUint8(pos++, 70);
    setUint32(length - 8);
    // WAVE identifier
    out.setUint8(pos++, 87); out.setUint8(pos++, 65); out.setUint8(pos++, 86); out.setUint8(pos++, 69);
    // fmt subchunk
    out.setUint8(pos++, 102); out.setUint8(pos++, 109); out.setUint8(pos++, 116); out.setUint8(pos++, 32);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    // data subchunk
    out.setUint8(pos++, 100); out.setUint8(pos++, 97); out.setUint8(pos++, 116); out.setUint8(pos++, 97);
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < abuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    const blob = new Blob([out.buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Load and decode any user audio file (Blob, File, or URL)
  async loadUserAudio(source) {
    const ctx = this.getAudioContext();
    let arrayBuffer;

    if (source instanceof File || source instanceof Blob) {
      arrayBuffer = await source.arrayBuffer();
    } else if (typeof source === 'string') {
      const response = await fetch(source);
      arrayBuffer = await response.arrayBuffer();
    } else {
      throw new Error('Unsupported audio source');
    }

    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.audioBuffer = decodedBuffer;
    this.waveformPeaks = this.extractPeaks(decodedBuffer, 200);
    this.isSynthesized = false;

    // Estimate BPM
    const bpm = this.estimateBPM(decodedBuffer);

    return {
      audioBuffer: decodedBuffer,
      duration: decodedBuffer.duration,
      bpm,
      peaks: this.waveformPeaks,
    };
  }

  // Extract normalized waveform peaks for visual timeline
  extractPeaks(buffer, numPeaks = 200) {
    const channelData = buffer.getChannelData(0);
    const step = Math.floor(channelData.length / numPeaks);
    const peaks = [];

    for (let i = 0; i < numPeaks; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(start + step, channelData.length);
      for (let j = start; j < end; j += 10) {
        const val = Math.abs(channelData[j]);
        if (val > max) max = val;
      }
      peaks.push(Math.min(1, max));
    }
    return peaks;
  }

  // Fast auto-correlation BPM estimator
  estimateBPM(buffer) {
    try {
      const data = buffer.getChannelData(0);
      const sampleRate = buffer.sampleRate;
      const downsampleFactor = Math.floor(sampleRate / 4000);
      const downsampledLength = Math.floor(data.length / downsampleFactor);
      const downsampled = new Float32Array(downsampledLength);

      for (let i = 0; i < downsampledLength; i++) {
        downsampled[i] = Math.abs(data[i * downsampleFactor]);
      }

      const minInterval = Math.floor((60 / 180) * 4000);
      const maxInterval = Math.floor((60 / 70) * 4000);

      let bestCorrelation = 0;
      let bestInterval = Math.floor((60 / 120) * 4000);

      for (let interval = minInterval; interval <= maxInterval; interval += 4) {
        let correlation = 0;
        const maxIndex = Math.min(downsampledLength - interval, 4000 * 15);
        for (let i = 0; i < maxIndex; i += 8) {
          correlation += downsampled[i] * downsampled[i + interval];
        }
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestInterval = interval;
        }
      }

      const calculatedBPM = Math.round((60 * 4000) / bestInterval);
      return Math.min(180, Math.max(70, calculatedBPM));
    } catch {
      return 120;
    }
  }

  // Setup real-time audio routing and multi-band frequency analysers
  setupAnalysers(mediaElement, audioBoost = 100) {
    const ctx = this.getAudioContext();

    // If already set up for this element, just update gain and return
    if (this.currentMediaElement === mediaElement && this.gainNode && this.analyserMaster) {
      this.gainNode.gain.value = (audioBoost || 100) / 100;
      return {
        master: this.analyserMaster,
        bass: this.analyserBass,
        mids: this.analyserMids,
        highs: this.analyserHighs,
      };
    }

    // Disconnect previous source if switching elements
    if (this.currentSource) {
      try { this.currentSource.disconnect(); } catch (e) { /* already disconnected */ }
    }
    if (this.gainNode) {
      try { this.gainNode.disconnect(); } catch (e) { /* ok */ }
    }

    this.currentMediaElement = mediaElement;
    if (!mediaElement.__sourceNode) {
      mediaElement.__sourceNode = ctx.createMediaElementSource(mediaElement);
    }
    this.currentSource = mediaElement.__sourceNode;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = (audioBoost || 100) / 100;

    // 1. Master Analyser (Full spectrum for visualizer)
    this.analyserMaster = ctx.createAnalyser();
    this.analyserMaster.fftSize = 256;
    this.analyserMaster.smoothingTimeConstant = 0.8;

    // 2. Sub-Bass Filter & Analyser (20Hz - 120Hz for kick/camera shake)
    this.filterBass = ctx.createBiquadFilter();
    this.filterBass.type = 'lowpass';
    this.filterBass.frequency.value = 140;
    this.analyserBass = ctx.createAnalyser();
    this.analyserBass.fftSize = 64;
    this.analyserBass.smoothingTimeConstant = 0.5;

    // 3. Mids Filter & Analyser (300Hz - 3000Hz for vocals/melody)
    this.filterMids = ctx.createBiquadFilter();
    this.filterMids.type = 'bandpass';
    this.filterMids.frequency.value = 1200;
    this.filterMids.Q.value = 1.0;
    this.analyserMids = ctx.createAnalyser();
    this.analyserMids.fftSize = 64;
    this.analyserMids.smoothingTimeConstant = 0.7;

    // 4. Highs Filter & Analyser (4000Hz - 16000Hz for sparkles/particles)
    this.filterHighs = ctx.createBiquadFilter();
    this.filterHighs.type = 'highpass';
    this.filterHighs.frequency.value = 4000;
    this.analyserHighs = ctx.createAnalyser();
    this.analyserHighs.fftSize = 64;
    this.analyserHighs.smoothingTimeConstant = 0.6;

    // Routing
    this.currentSource.connect(this.gainNode);

    this.gainNode.connect(this.analyserMaster);
    this.gainNode.connect(this.filterBass);
    this.gainNode.connect(this.filterMids);
    this.gainNode.connect(this.filterHighs);

    this.filterBass.connect(this.analyserBass);
    this.filterMids.connect(this.analyserMids);
    this.filterHighs.connect(this.analyserHighs);

    // Connect to speaker output for live preview playback
    this.gainNode.connect(ctx.destination);

    return {
      master: this.analyserMaster,
      bass: this.analyserBass,
      mids: this.analyserMids,
      highs: this.analyserHighs,
    };
  }

  // Get current live frequency energy metrics across bands (0.0 to 1.0)
  getAudioMetrics() {
    if (!this.analyserMaster) {
      return {
        masterEnergy: 0,
        subBass: 0,
        mids: 0,
        highs: 0,
        isKick: false,
        spectrum: new Uint8Array(64),
      };
    }

    const masterData = new Uint8Array(this.analyserMaster.frequencyBinCount);
    this.analyserMaster.getByteFrequencyData(masterData);

    const bassData = new Uint8Array(this.analyserBass.frequencyBinCount);
    this.analyserBass.getByteFrequencyData(bassData);

    const midsData = new Uint8Array(this.analyserMids.frequencyBinCount);
    this.analyserMids.getByteFrequencyData(midsData);

    const highsData = new Uint8Array(this.analyserHighs.frequencyBinCount);
    this.analyserHighs.getByteFrequencyData(highsData);

    const calcAverage = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length / 255;

    const masterEnergy = calcAverage(masterData);
    const subBass = calcAverage(bassData);
    const mids = calcAverage(midsData);
    const highs = calcAverage(highsData);
    const isKick = subBass > 0.65;

    return {
      masterEnergy,
      subBass,
      mids,
      highs,
      isKick,
      spectrum: masterData,
    };
  }
}

export const audioEngine = new AudioEngine();
export default AudioEngine;
