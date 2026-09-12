import { LyricsEngine } from './LyricsEngine';
import { lipSyncEngine } from './LipSyncEngine';
import { StoryDirector, SINGER_PORTRAITS } from './StoryDirector';
import { getRenderStyleById } from './RenderStyles';
import { atmosphereEngine, ATMOSPHERE_MODES } from './AtmosphereEngine';
import { characterCreationEngine } from './CharacterCreationEngine';
import { SongStructureAnalyzer } from './SongStructureAnalyzer';
import { aiDanceEngine } from './AIDanceEngine';
import { aiSpecialEffectsEngine } from './AISpecialEffectsEngine';

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
  { id: 'higgsfield-orbit-360', name: '360° Subject Orbit (Higgsfield DoP)', desc: 'Full 360-degree orbital camera rotation with dynamic depth parallax around focal subject' },
  { id: 'higgsfield-vertigo-dolly', name: 'Hitchcock Vertigo Zoom (Higgsfield DoP)', desc: 'Simultaneous dolly push and optical wide zoom out for dramatic focal tension' },
  { id: 'higgsfield-fpv-drone', name: 'FPV Acrobatic Drone (Higgsfield DoP)', desc: 'High-speed cinematic flythrough with 45° banking rolls and velocity punches' },
  { id: 'higgsfield-crane-pedestal', name: 'Crane Pedestal Sweep (Higgsfield DoP)', desc: 'Dramatic high-to-low vertical crane sweep with focal tilt' },
  { id: 'higgsfield-crash-zoom', name: 'Crash Zoom Transient (Higgsfield DoP)', desc: 'Explosive forward punch zoom snapping directly to audio transients & kick drops' },
  { id: 'higgsfield-bullet-time', name: '120 FPS Bullet-Time (Higgsfield DoP)', desc: 'Slow-motion time freeze with continuous orbital camera panning' },
  { id: 'higgsfield-speed-ramp', name: 'Action Speed Ramp (Higgsfield DoP)', desc: 'Slow-motion breakdown ramping up to 2x hyper-speed on drops' },
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

// Global Memory Cache for Instant Canvas Drawing & Zero-Lag Playback
const GLOBAL_IMAGE_CACHE = new Map();

export function getCachedImage(source) {
  if (!source) return null;
  if (typeof source !== 'string') return source;

  if (GLOBAL_IMAGE_CACHE.has(source)) {
    const cached = GLOBAL_IMAGE_CACHE.get(source);
    if (cached) return cached;
  }

  if (typeof Image === 'undefined') return null;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    GLOBAL_IMAGE_CACHE.set(source, img);
  };
  img.onerror = () => {
    const fallbackImg = new Image();
    fallbackImg.onload = () => {
      GLOBAL_IMAGE_CACHE.set(source, fallbackImg);
    };
    fallbackImg.src = source;
  };
  img.src = source;
  GLOBAL_IMAGE_CACHE.set(source, img);
  return img;
}

export class VideoGenerator {
  constructor(arg1, arg2, arg3) {
    let canvas = null;
    let project = arg1;
    let settings = arg2;
    let progressCallback = arg3;

    if (arg1 && typeof arg1.getContext === 'function') {
      canvas = arg1;
      project = arg2 || {};
      settings = arg3 || {};
      progressCallback = () => {};
    }

    this.canvas = canvas;
    this.project = project || {};
    const initialRenderStyle = getRenderStyleById(this.project.renderStyle || 'photoreal');

    this.settings = {
      rendererEngine: this.project.rendererEngine || 'ai-neural',
      renderStyle: this.project.renderStyle || 'photoreal',
      resolution: this.project.resolution || '1080p',
      aspectRatio: this.project.aspectRatio || '16:9',
      fps: 30,
      quality: this.project.exportQuality || 'high',
      format: 'mp4',
      speed: 1.0,
      transition: 'zoom',
      transitionDuration: 0.8,
      motionIntensity: this.project.motionIntensity || 100,
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
      enableTvBroadcastGraphic: this.project.enableTvBroadcastGraphic ?? true,
      enableStageSpotlights: true,
      atmosphereMode: this.project.atmosphereMode || 'rain',
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
    this.loadedImages = [];

    // Preload singer portrait and scene assets immediately
    this.preloadAllAssets();

    // Particle pool for bass explosions
    this.particles = [];
    this.initParticles(300);

    // Screenplay reference
    this.screenplay =
      this.project.screenplay ||
      StoryDirector.generateScreenplay(this.project, this.project.images || []);
  }

  preloadAllAssets() {
    const singerUrl =
      this.project.characterLockPersona?.avatarUrl ||
      this.project.customFaceAnchor ||
      this.project.singerImageUrl ||
      this.project.singerImage ||
      SINGER_PORTRAITS[0].url;
    this.singerImage = getCachedImage(singerUrl);

    const styleScenes = getRenderStyleById(this.settings.renderStyle).defaultScenes || [];
    const allSources = [
      ...(this.project.images || []),
      ...(this.project.screenplay?.scenes?.map(s => s.imageUrl) || []),
      ...styleScenes,
    ];

    allSources.forEach(src => {
      if (typeof src === 'string') getCachedImage(src);
    });
  }

  // Real-time canvas frame rendering for interactive DAW viewport
  renderFrame(elapsed = 0, audioMetrics = {}) {
    if (!this.canvas) {
      if (typeof document !== 'undefined') {
        this.canvas = document.createElement('canvas');
      } else {
        return;
      }
    }
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const width = this.canvas.width || 1280;
    const height = this.canvas.height || 720;
    const duration = this.project.duration || 32;

    // Resolve singer portrait
    if (!this.singerImage || (typeof this.singerImage === 'string')) {
      const singerUrl =
        this.project.characterLockPersona?.avatarUrl ||
        this.project.customFaceAnchor ||
        this.project.singerImageUrl ||
        this.project.singerImage ||
        SINGER_PORTRAITS[0].url;
      this.singerImage = getCachedImage(singerUrl);
    }

    // Resolve scene images
    const rawImages = (this.loadedImages && this.loadedImages.length > 0)
      ? this.loadedImages
      : ((this.project.images && this.project.images.length > 0)
          ? this.project.images
          : (getRenderStyleById(this.settings.renderStyle).defaultScenes || []));

    const resolvedImages = rawImages.map(src => getCachedImage(src)).filter(Boolean);
    const imagesToDraw = resolvedImages.length > 0 ? resolvedImages : (this.singerImage ? [this.singerImage] : []);
    const secondsPerImage = imagesToDraw.length > 0 ? duration / imagesToDraw.length : duration;

    try {
      this.renderCompositedFrame(
        ctx,
        imagesToDraw,
        this.project.lyrics || '',
        elapsed,
        duration,
        secondsPerImage,
        audioMetrics,
        width,
        height
      );
    } catch (e) {
      // Gracefully handle un-decoded image objects in test / mock environments
    }
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
    const resKey = this.settings?.resolution || this.project?.resolution || '1080p';
    const ratioKey = this.settings?.aspectRatio || this.project?.aspectRatio || '16:9';

    const baseHeight = RESOLUTION_PRESETS[resKey]?.height || 1080;
    const ratio = ASPECT_RATIOS[ratioKey]?.ratio || (16 / 9);

    let width;
    let height;

    if (ratio >= 1) {
      height = baseHeight;
      width = Math.round(height * ratio);
    } else {
      width = Math.min(baseHeight, 1080);
      height = Math.round(width / ratio);
    }

    // Video encoders require even dimensions
    width = width % 2 === 0 ? width : width + 1;
    height = height % 2 === 0 ? height : height + 1;

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
    const singerUrl =
      this.project.singerImage ||
      this.project.singerImageUrl ||
      renderStyleObj.defaultSinger ||
      SINGER_PORTRAITS[0].url;
    try {
      this.singerImage = await this.loadMedia(singerUrl);
    } catch {
      this.singerImage = loaded[0];
    }

    return loaded.length > 0 ? loaded : [this.singerImage];
  }

  async loadMedia(source) {
    let src = typeof source === 'string' ? source : (source?.url || '');

    // Convert local file paths to Data URLs in Electron desktop mode
    if (typeof src === 'string' && (src.includes(':\\') || (src.startsWith('/') && !src.startsWith('//')))) {
      const electronRead = window.electron?.readFileAsDataUrl || window.electron?.readFileDataUrl;
      if (electronRead) {
        try {
          const res = await electronRead(src);
          if (res?.dataUrl) {
            src = res.dataUrl;
          }
        } catch (e) {
          console.warn('Electron read file error:', e);
        }
      }
    }

    let isVideo =
      src.includes('.mp4') ||
      src.includes('.webm') ||
      src.includes('.mov') ||
      src.includes('.m4v') ||
      src.includes('.mkv') ||
      src.startsWith('data:video') ||
      src.includes('/renders/samples/') ||
      Boolean(source && (source.isVideo || (source.type && source.type.startsWith('video/'))));

    // If source is a blob: URL without an explicit video extension, probe if it is a playable video
    if (!isVideo && typeof src === 'string' && src.startsWith('blob:')) {
      if (source && (source.type?.startsWith('video/') || source.name?.match(/\.(mp4|webm|mov|m4v|mkv)$/i))) {
        isVideo = true;
      } else {
        try {
          const isPlayable = await new Promise((resolve) => {
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.onloadedmetadata = () => resolve(true);
            v.onerror = () => resolve(false);
            v.src = src;
            setTimeout(() => resolve(false), 500);
          });
          if (isPlayable) isVideo = true;
        } catch (_) {}
      }
    }

    if (isVideo) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        if (typeof src === 'string' && !src.startsWith('blob:') && !src.startsWith('data:')) {
          video.crossOrigin = 'anonymous';
        }
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = 'auto';
        video.src = src;

        const onReady = () => {
          video.onloadeddata = null;
          video.oncanplay = null;
          GLOBAL_IMAGE_CACHE.set(source, video);
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
      if (GLOBAL_IMAGE_CACHE.has(source)) {
        const cached = GLOBAL_IMAGE_CACHE.get(source);
        if (cached && (cached.naturalWidth || cached.width)) {
          return resolve(cached);
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        GLOBAL_IMAGE_CACHE.set(source, img);
        resolve(img);
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          GLOBAL_IMAGE_CACHE.set(source, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${source}`));
        fallbackImg.src = source;
      };
      img.src = source;
    });
  }

  async loadAudio() {
    const audioSource = this.project.audioBlobUrl || this.project.audio;
    if (!audioSource) return null;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const tempCtx = new AudioCtx();
      let audioBuffer = null;

      try {
        const response = await fetch(audioSource);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      } catch (decodeErr) {
        console.warn('Direct audio decode failed, falling back to Audio element:', decodeErr);
      }

      const element = new Audio();
      if (typeof audioSource === 'string' && !audioSource.startsWith('blob:')) {
        element.crossOrigin = 'anonymous';
      }
      element.preload = 'auto';
      element.src = audioSource;

      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 4000);
        element.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
        element.oncanplaythrough = () => { clearTimeout(timeout); resolve(); };
        element.onerror = () => { clearTimeout(timeout); resolve(); };
      });

      const duration = audioBuffer?.duration || 
        (Number.isFinite(element.duration) && element.duration > 0 ? element.duration : (this.project.duration || 30));

      this.audioElement = element;
      return { element, audioBuffer, duration };
    } catch (err) {
      console.warn('Audio loading error fallback:', err);
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

  // Convenience wrapper used by the Studio DAW export button: takes an
  // explicit duration plus (progress: 0-1) and (blobUrl) callbacks instead
  // of generate()'s constructor-bound progressCallback and result object.
  async exportVideo(duration, onProgress, onComplete) {
    if (duration) {
      this.project = { ...this.project, duration };
    }
    this.progressCallback = (percent) => {
      if (onProgress) onProgress(percent / 100);
    };

    const result = await this.generate();
    if (onComplete) onComplete(result.url);
    return result;
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
    let bufferSource = null;

    if (audio) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

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

        if (audio.audioBuffer) {
          bufferSource = audioContext.createBufferSource();
          bufferSource.buffer = audio.audioBuffer;
          bufferSource.connect(gain);
        } else if (audio.element) {
          try {
            const sourceNode = audioContext.createMediaElementSource(audio.element);
            sourceNode.connect(gain);
          } catch (e) {
            console.warn('Audio element source connection warning:', e);
          }
        }

        gain.connect(analyser);
        gain.connect(filterBass);
        gain.connect(filterMids);
        filterBass.connect(bassAnalyser);
        filterMids.connect(midsAnalyser);

        const destination = audioContext.createMediaStreamDestination();
        gain.connect(destination);
        destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch (err) {
        console.warn('MediaStream audio routing fallback:', err);
      }
    }

    const mimeCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
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
        if (frameHandle) {
          cancelAnimationFrame(frameHandle);
          clearTimeout(frameHandle);
        }
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', onVisibilityChange);
        }
        if (bufferSource) {
          try { bufferSource.stop(); } catch (e) {}
        }
        if (audio && audio.element) audio.element.pause();
        if (audioContext) {
          try { audioContext.close(); } catch (e) {}
        }
        stream.getTracks().forEach((t) => t.stop());
      };

      const scheduleNextFrame = () => {
        if (this.cancelled) return;
        if (typeof document !== 'undefined' && document.hidden) {
          frameHandle = setTimeout(drawLoop, Math.max(16, Math.floor(1000 / fps)));
        } else {
          frameHandle = requestAnimationFrame(drawLoop);
        }
      };

      const onVisibilityChange = () => {
        if (recorder.state === 'recording') {
          if (frameHandle) {
            cancelAnimationFrame(frameHandle);
            clearTimeout(frameHandle);
          }
          scheduleNextFrame();
        }
      };

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibilityChange);
      }

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
        scheduleNextFrame();
      };

      const startRecording = () => {
        startTime = performance.now();
        if (bufferSource) {
          try { bufferSource.start(0); } catch (e) {}
        }
        recorder.start(1000);
        scheduleNextFrame();
      };

      if (audio && audio.element && !audio.audioBuffer) {
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

    if (this.project.freebeatMode === 'dance') {
      // 1A. BEAT-SYNCED DANCE PERFORMANCE MODE (BETA)
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
        'slow-cinematic-pan'
      );

      const dancePose = aiDanceEngine.constructor.calculateDancePose(
        elapsed,
        this.project.bpm || 128,
        this.project.danceStyle || 'hip-hop',
        audioMetrics
      );

      aiDanceEngine.constructor.renderDanceFrame(
        ctx,
        width,
        height,
        this.singerImage,
        dancePose
      );
    } else if (directorCut.isSingerShot && (this.project.leadActor?.isProceduralActor || this.singerImage) && !isVideo) {
      if (this.project.leadActor?.isProceduralActor) {
        // PROCEDURAL CUSTOM 3D/2D AVATAR SINGER RIGGING
        const visemeData = lipSyncEngine.extractViseme(audioMetrics, {
          sensitivity: this.settings.lipSyncSensitivity || 1.2,
        });
        const blink = lipSyncEngine.getBlinkFactor(elapsed);
        characterCreationEngine.renderCharacterFrame(ctx, width, height, {
          viseme: visemeData.viseme,
          openness: visemeData.openness,
          widthScale: visemeData.widthScale,
          blinkFactor: blink,
          audioMetrics,
          elapsed,
        });
      } else {
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
      }
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

    // 2. Specialized Style Shaders & AI Special Effects Presets
    this.paintStyleShaders(ctx, renderStyleObj, audioMetrics, elapsed, isKick, width, height);

    if (this.project.pikaFx || this.settings.pikaFx) {
      aiSpecialEffectsEngine.constructor.applySpecialEffect(
        ctx,
        this.project.pikaFx || this.settings.pikaFx,
        elapsed,
        audioMetrics,
        width,
        height
      );
    }

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
    const selectedModel = this.project.selectedVideoModel || this.settings.selectedVideoModel;

    ctx.save();

    // AI Model Engine Active HUD Badge Overlay (First 4 Seconds)
    if (selectedModel && elapsed < 4) {
      const modelLabels = {
        higgsfield_dop: 'HIGGSFIELD AI · CINEMA DoP 6-AXIS 120FPS',
        sora_ai: 'SORA AI · WORLD SIMULATOR 60FPS',
        runway_gen3: 'RUNWAY GEN-3 ALPHA · CINEMA MOTION',
        kling_ai: 'KLING 1.5 AI · PHOTOREAL FLUID DYNAMICS',
        luma_dream: 'LUMA DREAM MACHINE · 3D KEYFRAME MORPH',
        pika_20: 'PIKA 2.0 ENGINE · STYLIZED ANIMATION',
        kaiber_ai: 'KAIBER AI · AUDIO-REACTIVE ORBIT',
        domo_ai: 'DOMOAI · JAPANESE ANIME CEL-SHADING',
        stable_video: 'STABLE VIDEO DIFFUSION · LATENT VORTEX',
      };

      const label = modelLabels[selectedModel] || `${selectedModel.toUpperCase()} ENGINE`;
      const fadeAlpha = elapsed > 3 ? (4 - elapsed) : Math.min(1, elapsed * 2);

      ctx.save();
      ctx.globalAlpha = fadeAlpha * 0.85;
      ctx.fillStyle = 'rgba(6, 11, 25, 0.75)';
      ctx.strokeStyle = selectedModel === 'higgsfield_dop' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1;
      const rectW = 310;
      const rectH = 26;
      ctx.beginPath();
      ctx.roundRect(width - rectW - 20, 20, rectW, rectH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 10px "Space Grotesk", sans-serif';
      ctx.fillStyle = selectedModel === 'higgsfield_dop' ? '#fbbf24' : '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(label, width - rectW / 2 - 20, 37);
      ctx.restore();
    }

    // Music-Aware Song Structure HUD (Freebeat.ai Style Active Section Indicator)
    if (this.project.songStructure?.sections) {
      const activeSec = SongStructureAnalyzer.getSectionAtTime(this.project.songStructure, elapsed);
      if (activeSec) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = activeSec.isDrop ? 'rgba(225, 29, 72, 0.85)' : 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = activeSec.isDrop ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = 1;

        const hudText = activeSec.isDrop
          ? `🔥 ${activeSec.type.toUpperCase()} · ${this.project.bpm || 128} BPM`
          : `♪ ${activeSec.type.toUpperCase()} · ${this.project.bpm || 128} BPM`;
        
        ctx.font = '700 11px "Outfit", sans-serif';
        const textMetrics = ctx.measureText(hudText);
        const hudW = textMetrics.width + 24;
        const hudH = 24;

        ctx.beginPath();
        ctx.roundRect(20, 20, hudW, hudH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(hudText, 32, 36);
        ctx.restore();
      }
    }

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

    // SHADER F: 2D Cartoon Ink Contours & Animated Pop Stars
    if (
      styleId === 'cartoon_2d' ||
      styleId === 'chibi_anime' ||
      renderStyleObj.hasCartoonInk ||
      this.settings.enableCartoonInk
    ) {
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, width * 0.005);
      ctx.globalAlpha = 0.85;

      // Draw hand-drawn comic ink outline border
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Bouncing Animated Cartoon Sparkles & Pop Stars
      const starCount = 14;
      const bpm = this.project.bpm || 128;
      const secPerBeat = 60 / bpm;
      const bounce = Math.abs(Math.sin((elapsed / secPerBeat) * Math.PI)) * 14;

      ctx.fillStyle = styleId === 'chibi_anime' ? '#ec4899' : '#f59e0b';
      for (let i = 0; i < starCount; i++) {
        const starX = width * 0.08 + ((i * 147) % (width * 0.84));
        const starY = height * 0.12 + Math.sin(elapsed * 3.5 + i) * 28 - bounce;
        const size = 5 + (i % 4) * 4;

        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, Math.PI * 2);
        ctx.fill();
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

    const selectedModel = this.project.selectedVideoModel || this.settings.selectedVideoModel || 'sora_ai';
    let motionMode = this.settings.motionMode || '3d-parallax';

    // Auto-map AI Video Models to their signature camera dynamics if selected
    if (selectedModel === 'higgsfield_dop') motionMode = this.settings.motionMode || 'higgsfield-orbit-360';
    else if (selectedModel === 'sora_ai') motionMode = 'hyper-zoom';
    else if (selectedModel === 'runway_gen3') motionMode = '3d-parallax';
    else if (selectedModel === 'kling_ai') motionMode = 'fluid-warp';
    else if (selectedModel === 'luma_dream') motionMode = 'cinematic-pan';
    else if (selectedModel === 'pika_20') motionMode = 'orbit-360';
    else if (selectedModel === 'kaiber_ai') motionMode = 'kinetic-beat';
    else if (selectedModel === 'domo_ai') motionMode = 'fluid-warp';
    else if (selectedModel === 'stable_video') motionMode = 'hyper-zoom';

    const motionIntensity = (this.settings.motionIntensity || 100) / 100;

    let scale = zoomPulse;
    let offsetX = 0;
    let offsetY = 0;
    let rotation = 0;

    // Advanced Higgsfield AI & Multi-Engine Directorial Camera Paths
    if (motionMode === 'higgsfield-orbit-360' || motionMode === 'orbit-360' || cameraMove === '360-orbit') {
      // 360° Subject Orbit with continuous focal parallax & depth tilt
      const orbitAngle = progress * Math.PI * 2 * 0.35 * motionIntensity;
      rotation = isIncoming ? (1 - blend) * 0.15 : Math.sin(orbitAngle) * 0.08 * motionIntensity;
      scale = zoomPulse * (1.18 + Math.cos(orbitAngle) * 0.12 * motionIntensity);
      offsetX = Math.sin(orbitAngle) * (width * 0.07) * motionIntensity;
      offsetY = Math.sin(orbitAngle * 2) * (height * 0.03) * motionIntensity;
    } else if (motionMode === 'higgsfield-vertigo-dolly' || cameraMove === 'vertigo-zoom') {
      // Hitchcock Vertigo Dolly Zoom (forward camera push with optical perspective compression)
      const vertigoFactor = Math.pow(progress, 1.2);
      scale = zoomPulse * (1.05 + vertigoFactor * 0.45 * motionIntensity);
      offsetX = Math.sin(progress * Math.PI * 4) * (width * 0.015) * (1 - progress);
      offsetY = (progress - 0.5) * (height * 0.05) * motionIntensity;
    } else if (motionMode === 'higgsfield-fpv-drone' || cameraMove === 'fpv-drone') {
      // Acrobatic FPV Drone Flythrough with 35° banking tilt roll & velocity punches
      const flightCurve = Math.sin(progress * Math.PI * 2);
      rotation = flightCurve * 0.14 * motionIntensity;
      offsetX = Math.cos(progress * Math.PI * 3) * (width * 0.06) * motionIntensity;
      offsetY = (progress - 0.5) * (height * 0.12) * motionIntensity;
      scale = zoomPulse * (1.15 + Math.abs(flightCurve) * 0.18 * motionIntensity);
    } else if (motionMode === 'higgsfield-crane-pedestal' || cameraMove === 'crane-sweep') {
      // Dramatic High-to-Low Studio Crane Pedestal Sweep
      offsetY = (0.5 - progress) * (height * 0.22) * motionIntensity;
      rotation = (0.5 - progress) * -0.04 * motionIntensity;
      scale = zoomPulse * (1.12 + Math.sin(progress * Math.PI) * 0.08);
    } else if (motionMode === 'higgsfield-crash-zoom' || cameraMove === 'crash-zoom') {
      // Explosive Crash Zoom Punch snapping to beat drops
      const snapProgress = progress > 0.85 ? (progress - 0.85) / 0.15 : progress * 0.2;
      scale = zoomPulse * (1.0 + snapProgress * 0.5 * motionIntensity);
      offsetX = (Math.random() - 0.5) * (width * 0.01) * motionIntensity;
    } else if (motionMode === 'higgsfield-bullet-time' || cameraMove === 'bullet-time') {
      // 120 FPS Ultra Slow-Mo Bullet Time Freeze
      const slowOrbit = progress * Math.PI * 0.5 * motionIntensity;
      rotation = Math.sin(slowOrbit) * 0.05;
      scale = zoomPulse * (1.2 + Math.sin(slowOrbit * 2) * 0.06);
      offsetX = Math.cos(slowOrbit) * (width * 0.04);
      offsetY = Math.sin(slowOrbit) * (height * 0.02);
    } else if (motionMode === 'higgsfield-speed-ramp' || cameraMove === 'speed-ramp') {
      // Velocity Speed Ramping (slow in verse, accelerating on beat drops)
      const rampProgress = Math.sin(progress * Math.PI);
      scale = zoomPulse * (1.08 + rampProgress * 0.28 * motionIntensity);
      offsetX = Math.sin(progress * Math.PI * 4) * (width * 0.03) * rampProgress;
    } else if (motionMode === 'fluid-warp' || selectedModel === 'kling_ai') {
      const wavePhase = progress * Math.PI * 4;
      offsetX = Math.sin(wavePhase) * (width * 0.035) * motionIntensity;
      offsetY = Math.cos(wavePhase * 0.7) * (height * 0.025) * motionIntensity;
      scale = zoomPulse * (1 + Math.sin(wavePhase * 0.5) * 0.08 * motionIntensity);
    } else if (motionMode === 'hyper-zoom' || cameraMove === 'hyper-zoom' || selectedModel === 'sora_ai') {
      const accelProgress = Math.pow(progress, 1.4);
      scale = zoomPulse * (1 + accelProgress * 0.42 * motionIntensity);
    } else if (motionMode === 'cinematic-pan' || cameraMove === 'tracking-shot' || cameraMove === 'pan' || selectedModel === 'luma_dream') {
      offsetX = isIncoming ? (1 - blend) * -width * 0.4 : (progress - 0.5) * width * 0.22 * motionIntensity;
      offsetY = Math.sin(progress * Math.PI) * (height * 0.04) * motionIntensity;
      scale = zoomPulse * 1.12;
    } else if (motionMode === 'kinetic-beat' || selectedModel === 'pika_20') {
      const pulseFreq = progress * Math.PI * 8;
      scale = zoomPulse * (1 + Math.abs(Math.sin(pulseFreq)) * 0.08 * motionIntensity);
      offsetX = (Math.random() - 0.5) * (width * 0.012) * motionIntensity;
      offsetY = (Math.random() - 0.5) * (height * 0.012) * motionIntensity;
    } else {
      // Runway Gen-3 3D Parallax & Hollywood Tracking (Default)
      scale = zoomPulse * (1 + progress * 0.18 * motionIntensity);
      offsetX = Math.sin(progress * Math.PI * 2) * (width * 0.02) * motionIntensity;
      offsetY = (progress - 0.5) * (height * 0.07) * motionIntensity;
      rotation = Math.sin(progress * Math.PI) * 0.02 * motionIntensity;
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
    let mediaItem = image;
    if (typeof mediaItem === 'string') {
      mediaItem = getCachedImage(mediaItem);
    }

    const mediaWidth = mediaItem?.videoWidth || mediaItem?.naturalWidth || mediaItem?.width || width;
    const mediaHeight = mediaItem?.videoHeight || mediaItem?.naturalHeight || mediaItem?.height || height;
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
    if (mediaItem instanceof HTMLVideoElement && mediaItem.duration) {
      mediaItem.muted = true;
      if (mediaItem.paused) {
        mediaItem.play().catch(() => {});
      }
    }

    // 1. Draw Main Dynamic Motion Scene (Video or Image)
    let drawnSuccessfully = false;

    if (mediaItem && (mediaItem.naturalWidth || mediaItem.width || mediaItem.videoWidth)) {
      try {
        ctx.drawImage(
          mediaItem,
          centerX - drawWidth / 2,
          centerY - drawHeight / 2,
          drawWidth,
          drawHeight
        );
        drawnSuccessfully = true;

        // 2. Simulated Depth Parallax Foreground Glow/Rays layer for realistic Video Depth
        if (motionMode === '3d-parallax' && alpha > 0.5) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = alpha * 0.12 * motionIntensity;

          // Subtle enlarged depth blur overlay
          const depthScale = 1.06;
          ctx.drawImage(
            mediaItem,
            centerX - (drawWidth * depthScale) / 2,
            centerY - (drawHeight * depthScale) / 2,
            drawWidth * depthScale,
            drawHeight * depthScale
          );
          ctx.restore();
        }
      } catch (drawErr) {
        drawnSuccessfully = false;
      }
    }

    if (!drawnSuccessfully) {
      // High-Definition Procedural Cinematic Story Scene
      const cx = width / 2;

      // Deep atmospheric environment gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.5, '#0c1a30');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Perspective Cyber Floor Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;
      const horizonY = height * 0.58;

      // Horizontal grid lines
      for (let y = horizonY; y < height; y += (y - horizonY + 12) * 0.4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing perspective rays
      for (let x = -width * 0.5; x <= width * 1.5; x += width * 0.1) {
        ctx.beginPath();
        ctx.moveTo(cx, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // Atmospheric Horizon Neon Glow
      const glowGrad = ctx.createRadialGradient(cx, horizonY, 10, cx, horizonY, width * 0.45);
      glowGrad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, horizonY - 120, width, 240);

      // Futuristic Scene Architecture Silhouette
      ctx.fillStyle = '#050a14';
      ctx.beginPath();
      ctx.moveTo(cx - 220, horizonY);
      ctx.lineTo(cx - 180, horizonY - 140);
      ctx.lineTo(cx - 120, horizonY - 140);
      ctx.lineTo(cx - 80, horizonY);
      ctx.lineTo(cx + 80, horizonY);
      ctx.lineTo(cx + 120, horizonY - 190);
      ctx.lineTo(cx + 180, horizonY - 190);
      ctx.lineTo(cx + 220, horizonY);
      ctx.closePath();
      ctx.fill();
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
