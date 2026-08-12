// VideoGenerator.js - Professional AI Music Video Compositor & Rendering Engine with Multi-Style Aesthetics
import { LyricsEngine } from './LyricsEngine';
import { lipSyncEngine } from './LipSyncEngine';
import { StoryDirector, SINGER_PORTRAITS } from './StoryDirector';
import { getRenderStyleById } from './RenderStyles';
import { atmosphereEngine, ATMOSPHERE_MODES } from './AtmosphereEngine';

export { ATMOSPHERE_MODES };

export const RESOLUTION_PRESETS = {
  '480p': { height: 480, label: '480p (Fast Draft)' },
  '720p': { height: 720, label: '720p (HD Web)' },
  '1080p': { height: 1080, label: '1080p (Full HD Master)' },
  '1440p': { height: 1440, label: '1440p (2K Ultra)' },
  '2160p': { height: 2160, label: '2160p (4K Cinema)' },
};

export const ASPECT_RATIOS = {
  '16:9': { ratio: 16 / 9, label: '16:9 (YouTube / Cinema)' },
  '9:16': { ratio: 9 / 16, label: '9:16 (TikTok / Reels / Shorts)' },
  '1:1': { ratio: 1, label: '1:1 (Spotify Canvas / Square)' },
  '4:5': { ratio: 4 / 5, label: '4:5 (Instagram Portrait)' },
  '21:9': { ratio: 21 / 9, label: '21:9 (Ultrawide Scope)' },
};

export const VISUALIZER_STYLES = [
  { id: 'radial', name: 'Radial Neon Ring', desc: 'Pulsing circular audio spectrum' },
  { id: 'ribbon', name: 'Neon Wave Ribbon', desc: 'Smooth flowing audio waveform' },
  { id: 'particles', name: 'Bass Explosions', desc: 'Particles bursting on kick drops' },
  { id: 'bars', name: 'Cyber Equalizer', desc: 'Mirrored spectrum equalizer bars' },
  { id: 'tunnel', name: 'Starfield Warp', desc: 'Audio-reactive warp speed rays' },
  { id: 'none', name: 'None (Clean View)', desc: 'No visualizer overlay' },
];

export const IMAGE_TO_VIDEO_MODES = [
  { id: '3d-parallax', name: '3D Depth Parallax (Runway Gen-3)', desc: 'Simulates 3D depth camera movement and focal tilt from 2D images' },
  { id: 'fluid-warp', name: 'Audio Fluid Wave (Kling / Luma AI)', desc: 'Dynamic AI wave motion and organic pulse warping synced to beat drops' },
  { id: 'hyper-zoom', name: 'Hyper Speed Vertigo Push (Sora AI)', desc: 'Accelerated forward camera push with motion blur acceleration' },
  { id: 'cinematic-pan', name: 'Widescreen Film Tracking (Pika Labs)', desc: 'Smooth horizontal and vertical tracking shot motion' },
  { id: 'orbit-360', name: '360° Orbital Camera Spin (Kaiber AI)', desc: 'Continuous smooth orbital camera rotation around focal subject' },
  { id: 'kinetic-beat', name: 'Sub-Surface Kinetic Pulse (DomoAI)', desc: 'Audio-reactive micro-vibrations and focal depth pulses' },
];

export const COLOR_LUTS = {
  none: { name: 'Standard (Clean)', filter: '' },
  cyberpunk: { name: 'Cyberpunk Neon', filter: 'hue-rotate(280deg) saturate(1.8) contrast(1.2)' },
  vhs: { name: '90s MTV VHS', filter: 'contrast(1.15) saturate(1.3) sepia(0.15)' },
  cinema35: { name: '35mm Film Gold', filter: 'sepia(0.25) saturate(1.25) contrast(1.1)' },
  darkgothic: { name: 'Dark Gothic', filter: 'grayscale(0.7) contrast(1.4) brightness(0.9)' },
  acidprism: { name: 'Acid Psychedelic', filter: 'hue-rotate(90deg) saturate(2.5) contrast(1.3)' },
  retrosunset: { name: '80s Synthwave', filter: 'hue-rotate(320deg) saturate(2) contrast(1.25)' },
  noir: { name: 'Classic Noir B&W', filter: 'grayscale(1) contrast(1.4)' },
};

export class VideoGenerator {
  constructor(project, settings, progressCallback) {
    this.project = project || {};
    const initialRenderStyle = getRenderStyleById(project.renderStyle || 'photoreal');

    this.settings = {
      renderStyle: project.renderStyle || 'photoreal',
      resolution: '1080p',
      aspectRatio: '16:9',
      fps: 30,
      quality: 'high',
      format: 'mp4',
      speed: 1.0,
      transition: 'zoom',
      transitionDuration: 0.8,
      visualizerStyle: initialRenderStyle.visualizerStyle || 'radial',
      visualizerColor: initialRenderStyle.visualizerColor || '#06b6d4',
      visualizerIntensity: 100,
      cameraShake: true,
      shakeIntensity: 50,
      flashOnBeat: true,
      directorMode: 'hybrid', // 'hybrid', 'story', 'performance'
      lipSyncSensitivity: 1.2,
      characterPerformance: true,
      colorLut: initialRenderStyle.lutId || 'cinema35',
      enableSpeedLines: true,
      enableAnamorphicFlares: true,
      enableHoloHud: true,
      enableTvBroadcastGraphic: project.enableTvBroadcastGraphic ?? true,
      enableStageSpotlights: true,
      atmosphereMode: project.atmosphereMode || 'rain',
      enableMotionBlur: true,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      audioBoost: 100,
      lyricsStyle: 'neon',
      ...settings,
    };
    this.progressCallback = progressCallback || (() => {});
    this.cancelled = false;

    // Particle pool for bass explosions
    this.particles = [];
    this.initParticles(300);

    // Screenplay reference
    this.screenplay =
      this.project.screenplay ||
      StoryDirector.generateScreenplay(this.project, this.project.images || []);
  }

  initParticles(count = 300) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.004,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#06b6d4' : '#ec4899',
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  }

  cancel() {
    this.cancelled = true;
    if (this.recorder && this.recorder.state === 'recording') this.recorder.stop();
    if (this.audioElement) this.audioElement.pause();
  }

  getFrameSize() {
    const height = RESOLUTION_PRESETS[this.settings.resolution]?.height || 1080;
    const ratio = ASPECT_RATIOS[this.settings.aspectRatio]?.ratio || 16 / 9;
    const width = Math.round((height * ratio) / 2) * 2;
    return { width, height };
  }

  async loadImages() {
    const renderStyleObj = getRenderStyleById(this.settings.renderStyle);
    let sources = [];
    if (this.project.screenplay && this.project.screenplay.scenes) {
      sources = this.project.screenplay.scenes.map(s => s.imageUrl);
    } else if (this.project.images && this.project.images.length > 0) {
      sources = this.project.images;
    } else {
      sources = renderStyleObj.defaultScenes || [
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      ];
    }

    const loaded = [];
    for (let i = 0; i < sources.length; i++) {
      if (this.cancelled) throw new Error('Cancelled');
      try {
        const media = await this.loadMedia(sources[i]);
        loaded.push(media);
      } catch (err) {
        console.warn('Failed to load media asset:', sources[i], err);
      }
      this.progressCallback(Math.round(((i + 1) / sources.length) * 15));
    }

    // Load Singer Portrait Image
    const singerUrl = this.project.singerImageUrl || renderStyleObj.defaultSinger || SINGER_PORTRAITS[0].url;
    try {
      this.singerImage = await this.loadMedia(singerUrl);
    } catch {
      this.singerImage = loaded[0];
    }

    return loaded.length > 0 ? loaded : [this.singerImage];
  }

  async loadMedia(source) {
    const src = typeof source === 'string' ? source : (source?.url || '');
    const isVideo = src.includes('.mp4') || src.includes('.webm') || src.includes('.mov') || src.startsWith('data:video') || (source && source.type && source.type.startsWith('video/'));

    if (isVideo) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = 'auto';
        video.src = src;

        const onReady = () => {
          video.onloadeddata = null;
          video.oncanplay = null;
          resolve(video);
        };

        video.onloadeddata = onReady;
        video.oncanplay = onReady;
        video.onerror = () => {
          this.loadImage(src).then(resolve).catch(() => resolve(video));
        };

        setTimeout(onReady, 4000);
      });
    }

    return this.loadImage(src);
  }

  loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${source}`));
      img.src = source;
    });
  }

  async loadAudio() {
    const audioSource = this.project.audioBlobUrl || this.project.audio;
    if (!audioSource) return null;

    try {
      const element = new Audio();
      element.crossOrigin = 'anonymous';
      element.preload = 'auto';
      element.src = audioSource;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => resolve(), 5000);
        element.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
        element.oncanplaythrough = () => { clearTimeout(timeout); resolve(); };
        element.onerror = () => { clearTimeout(timeout); reject(new Error('Audio load error')); };
      });

      const duration = Number.isFinite(element.duration) ? element.duration : (this.project.duration || 30);
      this.audioElement = element;
      return { element, duration };
    } catch {
      return null;
    }
  }

  // Master Render & Export Pipeline
  async generate() {
    const images = await this.loadImages();
    const audio = await this.loadAudio();
    const lyrics = LyricsEngine.parseLyrics(
      this.project.lyrics || '',
      audio ? audio.duration : images.length * 4
    );

    return this.recordVideo(images, audio, lyrics);
  }

  recordVideo(images, audio, lyrics) {
    const { width, height } = this.getFrameSize();
    const fps = this.settings.fps || 30;
    const duration = audio ? audio.duration : Math.max(12, images.length * (3.5 / this.settings.speed));
    const secondsPerImage = duration / images.length;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const stream = canvas.captureStream(fps);
    let audioContext = null;
    let analyser = null;
    let bassAnalyser = null;
    let midsAnalyser = null;

    if (audio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      const sourceNode = audioContext.createMediaElementSource(audio.element);
      const gain = audioContext.createGain();
      gain.gain.value = (this.settings.audioBoost || 100) / 100;

      // Master Analyser
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Bass Filter & Analyser
      const filterBass = audioContext.createBiquadFilter();
      filterBass.type = 'lowpass';
      filterBass.frequency.value = 140;
      bassAnalyser = audioContext.createAnalyser();
      bassAnalyser.fftSize = 64;

      // Mids Filter & Analyser
      const filterMids = audioContext.createBiquadFilter();
      filterMids.type = 'bandpass';
      filterMids.frequency.value = 1200;
      midsAnalyser = audioContext.createAnalyser();
      midsAnalyser.fftSize = 64;

      sourceNode.connect(gain);
      gain.connect(analyser);
      gain.connect(filterBass);
      gain.connect(filterMids);
      filterBass.connect(bassAnalyser);
      filterMids.connect(midsAnalyser);

      const destination = audioContext.createMediaStreamDestination();
      gain.connect(destination);
      destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }

    const mimeCandidates = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let selectedMime = '';
    let ext = 'webm';

    for (const cand of mimeCandidates) {
      if (MediaRecorder.isTypeSupported(cand)) {
        selectedMime = cand;
        ext = cand.includes('mp4') ? 'mp4' : 'webm';
        break;
      }
    }

    const bitrate =
      this.settings.quality === 'ultra'
        ? 18_000_000
        : this.settings.quality === 'high'
        ? 10_000_000
        : 5_000_000;

    const recorder = new MediaRecorder(stream, {
      ...(selectedMime ? { mimeType: selectedMime } : {}),
      videoBitsPerSecond: bitrate,
    });
    this.recorder = recorder;

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      const spectrum = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(64);
      const bassData = bassAnalyser ? new Uint8Array(bassAnalyser.frequencyBinCount) : new Uint8Array(32);
      const midsData = midsAnalyser ? new Uint8Array(midsAnalyser.frequencyBinCount) : new Uint8Array(32);
      let startTime = 0;
      let frameHandle = null;

      const cleanup = () => {
        if (frameHandle) cancelAnimationFrame(frameHandle);
        if (audio) audio.element.pause();
        if (audioContext) audioContext.close();
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.onerror = (e) => {
        cleanup();
        reject(new Error(e.error?.message || 'Recording failed.'));
      };

      recorder.onstop = () => {
        cleanup();
        if (this.cancelled) {
          reject(new Error('Cancelled'));
          return;
        }
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        this.progressCallback(100);
        resolve({
          blob,
          extension: ext,
          mimeType: blob.type,
          duration,
          width,
          height,
          url: URL.createObjectURL(blob),
        });
      };

      const drawLoop = () => {
        if (this.cancelled) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }

        const elapsed = (performance.now() - startTime) / 1000;

        let masterEnergy = 0;
        let subBass = 0;
        let mids = 0;

        if (analyser) {
          analyser.getByteFrequencyData(spectrum);
          masterEnergy = spectrum.reduce((sum, v) => sum + v, 0) / spectrum.length / 255;
        }
        if (bassAnalyser) {
          bassAnalyser.getByteFrequencyData(bassData);
          subBass = bassData.reduce((sum, v) => sum + v, 0) / bassData.length / 255;
        }
        if (midsAnalyser) {
          midsAnalyser.getByteFrequencyData(midsData);
          mids = midsData.reduce((sum, v) => sum + v, 0) / midsData.length / 255;
        }

        const audioMetrics = {
          masterEnergy,
          subBass,
          mids,
          isKick: subBass > 0.65,
          spectrum,
        };

        this.renderCompositedFrame(
          ctx,
          images,
          lyrics,
          elapsed,
          duration,
          secondsPerImage,
          audioMetrics,
          width,
          height
        );

        this.progressCallback(Math.min(99, 15 + Math.round((elapsed / duration) * 84)));

        if (elapsed >= duration) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }
        frameHandle = requestAnimationFrame(drawLoop);
      };

      const startRecording = () => {
        startTime = performance.now();
        recorder.start(1000);
        frameHandle = requestAnimationFrame(drawLoop);
      };

      if (audio) {
        audio.element.currentTime = 0;
        audio.element.play().then(startRecording, () => startRecording());
      } else {
        startRecording();
      }
    });
  }

  // Core Multi-Style Compositing Pipeline
  renderCompositedFrame(
    ctx,
    images,
    lyrics,
    elapsed,
    duration,
    secondsPerImage,
    audioMetrics,
    width,
    height
  ) {
    const { subBass = 0, isKick = false } = audioMetrics;
    const renderStyleObj = getRenderStyleById(this.settings.renderStyle);

    // Director Decision: Determine if this shot is Lip-Sync Singer or Narrative Story Scene
    const directorCut = StoryDirector.evaluateDirectorShot(
      this.screenplay,
      elapsed,
      this.settings.directorMode || 'hybrid',
      audioMetrics
    );

    // Use Director Cut timing if screenplay exists, otherwise fallback to simple uniform timing
    let index = 0;
    let nextIndex = 0;
    let withinImage = 0;

    if (this.screenplay?.scenes?.length) {
      index = directorCut.sceneIndex;
      nextIndex = Math.min(index + 1, images.length - 1);
      withinImage = directorCut.sceneProgress || 0;
    } else {
      const position = elapsed / secondsPerImage;
      index = Math.floor(position) % images.length;
      nextIndex = (index + 1) % images.length;
      withinImage = position - Math.floor(position);
    }

    // Force index bounds
    index = Math.min(index, images.length - 1);
    nextIndex = Math.min(nextIndex, images.length - 1);

    const transitionSec = Math.min(this.settings.transitionDuration || 0.8, secondsPerImage * 0.45);
    let transitionStart = 1 - transitionSec / secondsPerImage;
    if (this.screenplay?.scenes?.length && directorCut.scene) {
      const sceneDur = directorCut.scene.endTime - directorCut.scene.startTime;
      transitionStart = 1 - Math.min(transitionSec, sceneDur * 0.4) / sceneDur;
    }

    const blend = withinImage > transitionStart ? (withinImage - transitionStart) / (1 - transitionStart) : 0;

    // Camera Shake on Sub-Bass Kicks
    ctx.save();
    let shakeX = 0;
    let shakeY = 0;
    if (this.settings.cameraShake && isKick) {
      const shakePower = ((this.settings.shakeIntensity || 50) / 100) * 16;
      shakeX = (Math.random() - 0.5) * shakePower;
      shakeY = (Math.random() - 0.5) * shakePower;
      ctx.translate(shakeX, shakeY);
    }

    // Black background
    ctx.fillStyle = '#05070d';
    ctx.fillRect(-20, -20, width + 40, height + 40);

    // Apply Style Filters & Color LUT
    ctx.filter = this.getCombinedFilterString(renderStyleObj);

    // 1. Render Active Shot: Lip-Sync Singer OR Narrative Story Scene
    const zoomPulse = 1 + (this.settings.cameraShake ? subBass * 0.08 : 0);
    const activeMedia = images[index];
    const isVideo = activeMedia instanceof HTMLVideoElement;

    if (directorCut.isSingerShot && this.singerImage && !isVideo) {
      // SINGER PERFORMANCE SHOT WITH AUDIO-REACTIVE LIP-SYNCING
      lipSyncEngine.renderLipSyncFace(
        ctx,
        this.singerImage,
        audioMetrics,
        elapsed,
        this.project.bpm || 128,
        width,
        height,
        {
          sensitivity: this.settings.lipSyncSensitivity || 1.2,
          showVocalGlow: true,
          zoom: zoomPulse,
        }
      );
    } else {
      // CINEMATIC STORY WORLD SHOT
      this.paintDynamicScene(
        ctx,
        images[index],
        withinImage,
        1,
        zoomPulse,
        blend,
        width,
        height,
        false,
        directorCut.cameraMove
      );

      if (blend > 0 && images.length > 1) {
        this.paintDynamicScene(
          ctx,
          images[nextIndex],
          0,
          blend,
          zoomPulse,
          blend,
          width,
          height,
          true,
          directorCut.cameraMove
        );
      }
    }
    ctx.restore();

    // 2. Specialized Style Shaders (Anime Speed Lines, Anamorphic Flares, Hologram HUD, Lo-Fi Paper)
    this.paintStyleShaders(ctx, renderStyleObj, audioMetrics, elapsed, isKick, width, height);

    // 3. Audio-Reactive Visualizers Overlay
    this.paintVisualizer(ctx, audioMetrics, elapsed, width, height);

    // 4. Kinetic Synced Lyrics Overlay
    const activeLyric = LyricsEngine.getActiveLyric(lyrics, elapsed);
    if (activeLyric) {
      LyricsEngine.drawLyrics(
        ctx,
        activeLyric,
        this.settings.lyricsStyle || 'neon',
        width,
        height,
        audioMetrics
      );
    }

    // 5. Environmental Atmosphere Physics (Rain, Embers, Matrix Rain, Sakura, God Rays)
    if (this.settings.atmosphereMode && this.settings.atmosphereMode !== 'none') {
      atmosphereEngine.renderAtmosphere(
        ctx,
        this.settings.atmosphereMode,
        audioMetrics,
        elapsed,
        width,
        height
      );
    }

    // 6. Stage Spotlights & Arena Lasers
    if (this.settings.enableStageSpotlights !== false) {
      this.paintStageSpotlights(ctx, elapsed, audioMetrics, width, height);
    }

    // 7. Cinematic Post-FX Shaders (VHS, Film Grain, Light Flare, White Strobe Cut)
    this.paintPostEffects(ctx, elapsed, isKick, blend, width, height);

    // 8. Television Broadcast Lower-Third Graphic (MTV / VEVO 4K Graphic)
    if (this.settings.enableTvBroadcastGraphic !== false) {
      this.paintTvBroadcastOverlay(ctx, elapsed, duration, width, height);
    }
  }

  getCombinedFilterString(renderStyleObj) {
    const { brightness = 100, contrast = 100, saturation = 100, colorLut } = this.settings;
    const activeLut = colorLut || renderStyleObj?.lutId || 'cinema35';
    const lutFilter = COLOR_LUTS[activeLut]?.filter || '';
    const styleFilter = renderStyleObj?.filter || '';

    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${styleFilter} ${lutFilter}`.trim();
  }

  paintStyleShaders(ctx, renderStyleObj, audioMetrics, elapsed, isKick, width, height) {
    const { subBass = 0, masterEnergy = 0 } = audioMetrics;
    const styleId = this.settings.renderStyle;

    ctx.save();

    // SHADER A: Japanese Anime Radial Action Speed Lines (on beat drops / kick)
    if (
      (styleId === 'anime' || renderStyleObj.hasSpeedLines) &&
      this.settings.enableSpeedLines !== false &&
      (isKick || subBass > 0.45)
    ) {
      const centerX = width / 2;
      const centerY = height / 2;
      const linesCount = 48;
      const power = isKick ? 1 : (subBass - 0.45) * 1.8;

      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, width * 0.002);
      ctx.globalAlpha = Math.min(0.85, power * 0.9);

      for (let i = 0; i < linesCount; i++) {
        const angle = (i / linesCount) * Math.PI * 2 + Math.sin(elapsed * 12 + i) * 0.05;
        const innerR = Math.min(width, height) * 0.38 * (1 - power * 0.2);
        const outerR = Math.max(width, height) * 0.85;

        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.stroke();
      }
      ctx.restore();
    }

    // SHADER B: Anamorphic Cinema Blue/Cyan Lens Flare (for Photoreal 8K & Cyberpunk)
    if (
      (styleId === 'photoreal' || renderStyleObj.hasAnamorphicFlares) &&
      this.settings.enableAnamorphicFlares !== false &&
      masterEnergy > 0.3
    ) {
      const flareY = height * 0.48;
      const flareGrad = ctx.createLinearGradient(0, flareY, width, flareY);
      flareGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      flareGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.15)');
      flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
      flareGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.15)');
      flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = flareGrad;
      ctx.globalAlpha = (masterEnergy - 0.3) * 0.7;
      ctx.fillRect(0, flareY - 3, width, 6);
      ctx.restore();
    }

    // SHADER C: Cyberpunk Holographic HUD Grid & Crosshairs
    if (styleId === 'cyberpunk' && this.settings.enableHoloHud !== false) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = 'screen';

      // Crosshair corners
      const pad = 36;
      const len = 24;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad); ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - pad - len, pad); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad, pad + len); ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(pad, height - pad - len); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + len, height - pad); ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - pad - len, height - pad); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad, height - pad - len); ctx.stroke();

      // Cyber HUD Center Reticle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width * 0.08, 0, Math.PI * 2);
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.restore();
    }

    // SHADER D: Lo-Fi Textured Watercolor Paper Grain
    if (styleId === 'lofi_art' || renderStyleObj.hasPaperGrain) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#fef3c7';
      for (let i = 0; i < 300; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, 3, 3);
      }
      ctx.restore();
    }

    // SHADER E: 3D CGI Volumetric Bloom
    if (styleId === 'cgi_3d' || renderStyleObj.hasVolumetricBloom) {
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.6);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.restore();
  }

  paintDynamicScene(
    ctx,
    image,
    progress,
    alpha,
    zoomPulse,
    blend,
    width,
    height,
    isIncoming,
    cameraMove = 'zoom'
  ) {
    if (!image) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    const motionMode = this.settings.motionMode || '3d-parallax';
    const motionIntensity = (this.settings.motionIntensity || 100) / 100;

    let scale = zoomPulse;
    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;

    // Advanced 3D Depth & Camera Motion Modes (Simulating Image-to-Video Animation)
    if (motionMode === 'fluid-warp') {
      const wavePhase = progress * Math.PI * 4;
      offsetX = Math.sin(wavePhase) * (width * 0.025) * motionIntensity;
      offsetY = Math.cos(wavePhase * 0.7) * (height * 0.02) * motionIntensity;
      scale = zoomPulse * (1 + Math.sin(wavePhase * 0.5) * 0.05 * motionIntensity);
    } else if (motionMode === 'hyper-zoom' || cameraMove === 'hyper-zoom') {
      const accelProgress = Math.pow(progress, 1.4);
      scale = zoomPulse * (1 + accelProgress * 0.35 * motionIntensity);
    } else if (motionMode === 'cinematic-pan' || cameraMove === 'tracking-shot' || cameraMove === 'pan') {
      offsetX = isIncoming ? (1 - blend) * -width * 0.4 : (progress - 0.5) * width * 0.18 * motionIntensity;
      offsetY = Math.sin(progress * Math.PI) * (height * 0.03) * motionIntensity;
      scale = zoomPulse * 1.1;
    } else if (motionMode === 'orbit-360') {
      const orbitAngle = progress * Math.PI * 0.35 * motionIntensity;
      rotation = isIncoming ? (1 - blend) * 0.2 : orbitAngle - 0.15;
      scale = zoomPulse * (1.1 + Math.sin(progress * Math.PI) * 0.08 * motionIntensity);
      offsetX = Math.cos(orbitAngle) * (width * 0.03) * motionIntensity;
      offsetY = Math.sin(orbitAngle) * (height * 0.03) * motionIntensity;
    } else if (motionMode === 'kinetic-beat') {
      const pulseFreq = progress * Math.PI * 8;
      scale = zoomPulse * (1 + Math.abs(Math.sin(pulseFreq)) * 0.06 * motionIntensity);
      offsetX = (Math.random() - 0.5) * (width * 0.008) * motionIntensity;
      offsetY = (Math.random() - 0.5) * (height * 0.008) * motionIntensity;
    } else {
      // 3D Parallax & Tilt Tracking (Default)
      scale = zoomPulse * (1 + progress * 0.15 * motionIntensity);
      offsetX = Math.sin(progress * Math.PI * 2) * (width * 0.015) * motionIntensity;
      offsetY = (progress - 0.5) * (height * 0.06) * motionIntensity;
      rotation = Math.sin(progress * Math.PI) * 0.015 * motionIntensity;
    }

    if (cameraMove === 'whip-pan') {
      offsetX += isIncoming ? (1 - blend) * width : -blend * width * 1.2;
      scale *= (1 + blend * 0.25);
    } else if (cameraMove === 'vortex') {
      rotation += isIncoming ? (1 - blend) * Math.PI * 0.5 : progress * 0.15;
      scale *= (0.8 + blend * 0.2 + progress * 0.08);
    } else if (cameraMove === 'crane-pullout') {
      scale *= (1.25 - progress * 0.2);
      offsetY += progress * height * 0.06;
    }

    // Cover Fit Image/Video calculation
    const mediaWidth = image.videoWidth || image.naturalWidth || image.width || width;
    const mediaHeight = image.videoHeight || image.naturalHeight || image.height || height;
    const frameRatio = width / height;
    const imageRatio = (mediaWidth && mediaHeight) ? (mediaWidth / mediaHeight) : frameRatio;
    let drawWidth = width;
    let drawHeight = height;

    if (imageRatio > frameRatio) {
      drawWidth = height * imageRatio;
    } else {
      drawHeight = width / imageRatio;
    }

    drawWidth *= scale;
    drawHeight *= scale;

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    ctx.translate(centerX, centerY);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    // If media is a video element, trigger play to update frames
    if (image instanceof HTMLVideoElement && image.duration) {
      if (image.paused) {
        image.play().catch(() => {});
      }
    }

    // 1. Draw Main Dynamic Motion Scene (Video or Image)
    ctx.drawImage(
      image,
      centerX - drawWidth / 2,
      centerY - drawHeight / 2,
      drawWidth,
      drawHeight
    );

    // 2. Simulated Depth Parallax Foreground Glow/Rays layer for realistic Video Depth
    if (motionMode === '3d-parallax' && alpha > 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.12 * motionIntensity;

      // Subtle enlarged depth blur overlay
      const depthScale = 1.06;
      ctx.drawImage(
        image,
        centerX - (drawWidth * depthScale) / 2,
        centerY - (drawHeight * depthScale) / 2,
        drawWidth * depthScale,
        drawHeight * depthScale
      );
      ctx.restore();
    }

    ctx.restore();
  }

  paintVisualizer(ctx, audioMetrics, elapsed, width, height) {
    const style = this.settings.visualizerStyle || 'radial';
    if (style === 'none') return;

    const { masterEnergy = 0, subBass = 0, spectrum = [] } = audioMetrics;
    const color = this.settings.visualizerColor || '#06b6d4';
    const intensity = (this.settings.visualizerIntensity || 100) / 100;

    ctx.save();

    if (style === 'radial') {
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.22 * (1 + subBass * 0.15);
      const bins = Math.min(64, spectrum.length);
      const angleStep = (Math.PI * 2) / bins;

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(3, width * 0.0035);
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 * intensity;

      for (let i = 0; i < bins; i++) {
        const val = (spectrum[i] / 255) * intensity;
        const barHeight = val * (height * 0.16);
        const angle = i * angleStep + elapsed * 0.2;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else if (style === 'ribbon') {
      const centerY = height * 0.72;
      const points = 60;
      const step = width / points;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20 * intensity;

      for (let i = 0; i <= points; i++) {
        const specVal = (spectrum[i % spectrum.length] || 0) / 255;
        const wave = Math.sin(i * 0.25 + elapsed * 6) * 20 * masterEnergy;
        const y = centerY - (specVal * height * 0.18 + wave) * intensity;
        const x = i * step;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (style === 'particles') {
      const burst = subBass > 0.65 ? subBass * 0.025 : 0.002;

      for (const p of this.particles) {
        p.x += p.vx * (1 + burst * 20);
        p.y += p.vy * (1 + burst * 20);

        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * intensity;
        ctx.globalAlpha = p.alpha * (0.4 + subBass * 0.6);

        ctx.beginPath();
        ctx.arc(
          p.x * width,
          p.y * height,
          p.size * (1 + subBass * 1.5),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else if (style === 'bars') {
      const numBars = 48;
      const barWidth = (width / numBars) * 0.7;
      const gap = (width / numBars) * 0.3;
      const bottomY = height * 0.95;

      const grad = ctx.createLinearGradient(0, bottomY - height * 0.3, 0, bottomY);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, color);

      ctx.fillStyle = grad;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * intensity;

      for (let i = 0; i < numBars; i++) {
        const val = (spectrum[i % spectrum.length] / 255) * intensity;
        const barH = val * height * 0.28;
        const x = i * (barWidth + gap) + gap / 2;

        ctx.fillRect(x, bottomY - barH, barWidth, barH);
      }
    } else if (style === 'tunnel') {
      const centerX = width / 2;
      const centerY = height / 2;
      const numRays = 36;

      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14 * intensity;

      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + elapsed * 0.4;
        const specVal = (spectrum[i % spectrum.length] / 255) * intensity;
        const r1 = 30 + masterEnergy * 40;
        const r2 = Math.min(width, height) * 0.65 * (0.4 + specVal);

        ctx.lineWidth = 1 + specVal * 4;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * r1, centerY + Math.sin(angle) * r1);
        ctx.lineTo(centerX + Math.cos(angle) * r2, centerY + Math.sin(angle) * r2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  paintPostEffects(ctx, elapsed, isKick, blend, width, height) {
    const lut = this.settings.colorLut || 'cyberpunk';
    const styleId = this.settings.renderStyle;

    ctx.save();

    // 1. Flash On Beat / Drop Transition
    if (this.settings.flashOnBeat && isKick) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.14;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Cinematic Edge Vignette Shading (Hollywood 35mm Depth)
    const vignetteGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.max(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');

    ctx.save();
    ctx.fillStyle = vignetteGrad;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 3. VHS 90s MTV Effects
    if (lut === 'vhs' || styleId === 'vhs_retro') {
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#000000';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 2);
      }

      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffffff';
      const trackY = ((elapsed * 90) % (height + 100)) - 50;
      ctx.fillRect(0, trackY, width, 24);

      ctx.globalAlpha = 0.85;
      ctx.font = `700 ${Math.max(14, width * 0.02)}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#fef08a';
      ctx.fillText('REC ● [SP]', 32, 40);
      ctx.fillText(`00:${Math.floor(elapsed).toString().padStart(2, '0')}:24`, width - 140, 40);
    }

    // 4. Cinema 35mm Letterbox
    if (lut === 'cinema35' || styleId === 'photoreal' || this.settings.aspectRatio === '21:9') {
      const barH = height * 0.06;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barH);
      ctx.fillRect(0, height - barH, width, barH);
    }

    // 5. Film Grain
    if (lut === 'vhs' || lut === 'cinema35' || lut === 'noir' || styleId === 'photoreal' || styleId === 'gothic_noir') {
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 350; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
      }
    }

    ctx.restore();
  }

  paintTvBroadcastOverlay(ctx, elapsed, duration, width, height) {
    let alpha = 0;
    if (elapsed < 7) {
      if (elapsed < 1) alpha = elapsed;
      else if (elapsed > 6) alpha = 7 - elapsed;
      else alpha = 1;
    } else if (elapsed > duration - 5) {
      const remaining = duration - elapsed;
      if (remaining > 4) alpha = 5 - remaining;
      else if (remaining < 1) alpha = remaining;
      else alpha = 1;
    }

    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

    const title = this.project.title || this.project.audioTitle || 'CYBER ODYSSEY';
    const artist = this.project.artistName || 'NEON ARTIST';
    const director = 'DIR. MUSICVID AI';
    const label = 'STUDIO RECORDS / VEVO 4K MASTER';

    const cardX = width * 0.04;
    const cardY = height * 0.72;
    const cardW = Math.min(width * 0.45, 420);
    const cardH = 108;

    // Glassmorphic dark backdrop card
    ctx.fillStyle = 'rgba(6, 8, 16, 0.85)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cardX, cardY, cardW, cardH, [10]);
    } else {
      ctx.rect(cardX, cardY, cardW, cardH);
    }
    ctx.fill();
    ctx.stroke();

    // Accent left vertical bar
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(cardX + 4, cardY + 12, 5, cardH - 24);

    // Text details
    const textX = cardX + 22;

    // Artist Name (Line 1)
    ctx.font = `800 ${Math.max(14, width * 0.016)}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(artist.toUpperCase(), textX, cardY + 32);

    // Track Title (Line 2)
    ctx.font = `700 ${Math.max(16, width * 0.019)}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`"${title.toUpperCase()}"`, textX, cardY + 58);

    // Metadata (Line 3)
    ctx.font = `600 ${Math.max(10, width * 0.011)}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${director} · ${label}`, textX, cardY + 84);

    // VEVO / MTV 4K Badge (Right corner of card)
    ctx.fillStyle = '#ec4899';
    ctx.font = `800 10px 'Outfit', sans-serif`;
    ctx.fillText('VEVO 4K', cardX + cardW - 65, cardY + 30);

    ctx.restore();
  }

  paintStageSpotlights(ctx, elapsed, audioMetrics, width, height) {
    const { masterEnergy = 0, subBass = 0 } = audioMetrics;
    if (masterEnergy < 0.15) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const numBeams = 4;
    for (let i = 0; i < numBeams; i++) {
      const angleOffset = (i - (numBeams - 1) / 2) * 0.35;
      const sweep = Math.sin(elapsed * 1.5 + i * 1.2) * 0.3 + angleOffset;
      const startX = width * (0.2 + i * 0.2);
      const startY = 0;
      const targetX = width * (0.5 + sweep * 0.8);
      const targetY = height;

      const beamGrad = ctx.createLinearGradient(startX, startY, targetX, targetY);
      const color = i % 2 === 0 ? 'rgba(6, 182, 212, ' : 'rgba(236, 72, 153, ';
      beamGrad.addColorStop(0, color + (0.35 + subBass * 0.2) + ')');
      beamGrad.addColorStop(0.7, color + (0.1 + subBass * 0.1) + ')');
      beamGrad.addColorStop(1, color + '0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(startX - 8, startY);
      ctx.lineTo(startX + 8, startY);
      const beamSpread = width * 0.12 * (1 + subBass * 0.4);
      ctx.lineTo(targetX + beamSpread, targetY);
      ctx.lineTo(targetX - beamSpread, targetY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

export default VideoGenerator;
