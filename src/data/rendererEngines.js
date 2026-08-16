// rendererEngines.js - Master Video Renderer Engine Definitions

export const RENDERER_ENGINES = [
  {
    id: 'ai-neural',
    name: 'AI Neural Motion Engine',
    badge: 'NEURAL MOTION',
    icon: '🧠',
    color: '#06b6d4',
    tagline: 'Deep neural camera interpolation, 3D depth parallax, fluid wave warping, and audio-synced beat drop transients.',
    features: [
      '3D Depth Parallax (Runway Gen-3)',
      'Fluid Audio Waveform Morphing (Kling 1.5)',
      'Sub-bass Kinetic Beats & Camera Shake',
      'Continuous 360° Orbital Camera Spin',
    ],
    recommendedFor: 'Cinematic AI music videos, high-energy beat drops, and 3D visual storylines.',
  },
  {
    id: 'webgl-gpu',
    name: 'WebGL / GPU Accelerated Shader',
    badge: 'HARDWARE GPU',
    icon: '⚡',
    color: '#ec4899',
    tagline: 'Hardware-accelerated post-processing pipeline with volumetric bloom, anamorphic lens flares, and chromatic aberration.',
    features: [
      'Real-time Volumetric Bloom & Lens Flares',
      'Anamorphic 35mm Hollywood Shaders',
      'Dynamic Scanline & CRT Tape Wobble',
      'Subsurface Lighting & Particle Physics',
    ],
    recommendedFor: 'Cyberpunk, EDM stage lights, retro 90s VHS, and concert festival visuals.',
  },
  {
    id: 'canvas-2d',
    name: 'Canvas 2D Ultra Compositor',
    badge: 'ULTRA FAST 60 FPS',
    icon: '🚀',
    color: '#38bdf8',
    tagline: 'Lightweight, ultra-fast 60 FPS multi-layer compositor with kinetic typography, viseme lip-syncing, and zero latency.',
    features: [
      '60 FPS Real-time Multi-layer Compositing',
      'Full Audio-reactive Viseme Lip-syncing',
      'Kinetic Synchronized Typography Overlays',
      '100% Universal Device Compatibility',
    ],
    recommendedFor: 'Fast drafting, mobile devices, live audio playback, and instant exports.',
  },
  {
    id: 'master-4k',
    name: 'Cinema Master 4K Studio Exporter',
    badge: '4K PRO MASTER',
    icon: '🎬',
    color: '#8b5cf6',
    tagline: 'Broadcast-grade master video encoding engine capable of rendering 4K UHD 60 FPS at maximum bitrate.',
    features: [
      '4K UHD (3840×2160) Cinema Resolution',
      'High-bitrate Master Video Encoding',
      'VEVO & MTV Broadcast Lower-Third Graphics',
      'Frame-Accurate Audio & Video Synchronization',
    ],
    recommendedFor: 'Final release master files, YouTube 4K uploads, Spotify Canvas, and VEVO broadcasts.',
  },
];

export const getRendererEngineById = (id) => {
  return RENDERER_ENGINES.find((e) => e.id === id) || RENDERER_ENGINES[0];
};

export default RENDERER_ENGINES;
