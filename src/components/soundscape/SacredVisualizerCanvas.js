import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Minimize2, Wind, Palette, Sparkles, RefreshCw, Video, Upload, Trash2 } from 'lucide-react';

export const VISUALIZER_MODES = [
  { id: 'flowerOfLife', name: 'Flower of Life', icon: '🌸', desc: 'Sacred Phi Geometry & Creation Blueprint' },
  { id: 'metatronCube', name: "Metatron's Cube", icon: '✡️', desc: '13 Circles & 5 Platonic Solids Energy Shield' },
  { id: 'sriYantra', name: 'Sri Yantra', icon: '🔺', desc: '9 Interlocking Cosmic Triangles of Manifestation' },
  { id: 'cymatics', name: 'Cymatics Sound Wave', icon: '🌊', desc: 'Harmonic Chladni Acoustic Sand & Water Vibration' },
  { id: 'torusField', name: 'Hypnotic Torus Field', icon: '🌀', desc: 'Continuous Quantum Vortex & Toroidal Energy Circulation' },
  { id: 'chakraLotus', name: 'Chakra Breath Lotus', icon: '🧘', desc: 'Resonant 5.5s Breathing Guide & Lotus Mandala' },
  { id: 'cosmicNebula', name: 'Planetary Stargate', icon: '🪐', desc: 'Celestial Orbiting Bodies & Radiant Starlight' }
];

export const COLOR_THEMES = [
  { id: 'gold', name: 'Celestial Gold', primary: '#F59E0B', secondary: '#D97706', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'cyan', name: 'Cosmic Cyan', primary: '#06B6D4', secondary: '#0284C7', glow: 'rgba(6, 182, 212, 0.4)' },
  { id: 'purple', name: 'Crown Violet', primary: '#A855F7', secondary: '#7C3AED', glow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'emerald', name: 'Heart Emerald', primary: '#10B981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'rose', name: 'Love Rose', primary: '#F43F5E', secondary: '#E11D48', glow: 'rgba(244, 63, 94, 0.4)' },
  { id: 'rainbow', name: 'Chakra Prism', primary: '#F59E0B', secondary: '#8B5CF6', glow: 'rgba(236, 72, 153, 0.4)' }
];

export default function SacredVisualizerCanvas({ activeHz = 432, isPlaying = false, element = 'Earth' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [activeMode, setActiveMode] = useState('flowerOfLife');
  const [activeTheme, setActiveTheme] = useState('gold');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBreathPacer, setShowBreathPacer] = useState(true);
  const [breathText, setBreathText] = useState('Inhale...');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [customVideoUrl, setCustomVideoUrl] = useState(null);
  const [customVideoName, setCustomVideoName] = useState('');
  const [videoOpacity, setVideoOpacity] = useState(0.45);
  const [showVideoUploader, setShowVideoUploader] = useState(false);

  // Switch default theme based on active frequency/element
  useEffect(() => {
    if (activeHz === 528 || element === 'Fire') setActiveTheme('gold');
    else if (activeHz === 639 || activeHz === 136.1) setActiveTheme('emerald');
    else if (activeHz === 741 || element === 'Water') setActiveTheme('cyan');
    else if (activeHz === 852 || activeHz === 963) setActiveTheme('purple');
    else if (activeHz === 174 || activeHz === 285) setActiveTheme('rose');
  }, [activeHz, element]);

  // Breathing pacer cycle (5.5s resonant breathing)
  useEffect(() => {
    if (!isPlaying || !showBreathPacer) return;

    let timer;
    let step = 0;
    const cycle = () => {
      if (step === 0) {
        setBreathText('Inhale Slowly...');
        step = 1;
        timer = setTimeout(cycle, 4000);
      } else if (step === 1) {
        setBreathText('Hold Gently...');
        step = 2;
        timer = setTimeout(cycle, 3000);
      } else {
        setBreathText('Exhale & Release...');
        step = 0;
        timer = setTimeout(cycle, 5000);
      }
    };

    cycle();
    return () => clearTimeout(timer);
  }, [isPlaying, showBreathPacer]);

  const drawVisualizer = useCallback((ctx, width, height, t) => {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const minDim = Math.min(width, height);
    const radius = minDim * 0.38;

    const theme = COLOR_THEMES.find(th => th.id === activeTheme) || COLOR_THEMES[0];
    const basePulse = isPlaying ? Math.sin(t * 2 * speedMultiplier) * 0.06 + 1 : 1;
    const rot = t * 0.25 * speedMultiplier;

    ctx.save();
    ctx.translate(cx, cy);

    // Background Subtle Ambient Energy Aura
    const bgGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius * 1.5);
    bgGrad.addColorStop(0, theme.glow);
    bgGrad.addColorStop(0.5, 'rgba(6, 8, 20, 0.4)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-cx, -cy, width, height);

    ctx.strokeStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = isPlaying ? 15 : 6;
    ctx.lineWidth = 1.6;

    // Mode 1: FLOWER OF LIFE
    if (activeMode === 'flowerOfLife') {
      ctx.rotate(rot * 0.4);
      const r = (radius / 3) * basePulse;

      // Outer boundary circle
      ctx.beginPath();
      ctx.arc(0, 0, r * 3.05, 0, Math.PI * 2);
      ctx.arc(0, 0, r * 3.12, 0, Math.PI * 2);
      ctx.stroke();

      // Central circle
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Layer 1: 6 Inner Petal Circles
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Layer 2: 12 Outer Petal Circles
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * r * 2;
        const y = Math.sin(angle) * r * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        const angleMid = angle + Math.PI / 6;
        const xMid = Math.cos(angleMid) * r * Math.sqrt(3);
        const yMid = Math.sin(angleMid) * r * Math.sqrt(3);
        ctx.beginPath();
        ctx.arc(xMid, yMid, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner glowing core
      ctx.fillStyle = theme.secondary;
      ctx.beginPath();
      ctx.arc(0, 0, 4 + Math.sin(t * 4) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mode 2: METATRON'S CUBE
    else if (activeMode === 'metatronCube') {
      ctx.rotate(-rot * 0.3);
      const r = (radius * 0.42) * basePulse;
      const centers = [{ x: 0, y: 0 }];

      // 6 inner ring centers
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        centers.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      // 6 outer ring centers
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        centers.push({ x: Math.cos(a) * r * 1.732, y: Math.sin(a) * r * 1.732 });
      }

      // Draw all 78 connecting lines between the 13 nodes
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          ctx.beginPath();
          ctx.moveTo(centers[i].x, centers[i].y);
          ctx.lineTo(centers[j].x, centers[j].y);
          ctx.stroke();
        }
      }

      // Draw 13 Circles of Creation
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      centers.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, r * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = theme.glow;
        ctx.fill();
      });
    }

    // Mode 3: SRI YANTRA
    else if (activeMode === 'sriYantra') {
      const s = radius * 0.85 * basePulse;
      ctx.rotate(rot * 0.15);

      // Outer Square Gate (Bhupura)
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.strokeRect(-s * 0.95, -s * 0.95, s * 1.9, s * 1.9);

      // Circular Ring with 16 Lotus Petals
      const cr = s * 0.82;
      ctx.beginPath();
      ctx.arc(0, 0, cr, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        const px = Math.cos(a) * cr;
        const py = Math.sin(a) * cr;
        ctx.beginPath();
        ctx.arc(px, py, cr * 0.15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 9 Interlocking Upward and Downward Triangles
      const triLayers = [
        { h: s * 0.7, dir: 1, w: s * 0.65 },
        { h: s * 0.55, dir: -1, w: s * 0.6 },
        { h: s * 0.48, dir: 1, w: s * 0.52 },
        { h: s * 0.4, dir: -1, w: s * 0.48 },
        { h: s * 0.32, dir: 1, w: s * 0.38 },
        { h: s * 0.25, dir: -1, w: s * 0.32 },
        { h: s * 0.18, dir: 1, w: s * 0.24 },
        { h: s * 0.12, dir: -1, w: s * 0.18 },
        { h: s * 0.08, dir: 1, w: s * 0.12 }
      ];

      triLayers.forEach((tri, idx) => {
        ctx.beginPath();
        const topY = -tri.h * tri.dir;
        const botY = (tri.h * 0.5) * tri.dir;
        ctx.moveTo(0, topY);
        ctx.lineTo(-tri.w * 0.8, botY);
        ctx.lineTo(tri.w * 0.8, botY);
        ctx.closePath();
        ctx.stroke();
      });

      // Bindu (Central Cosmic Source Point)
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mode 4: CYMATICS SOUND HARMONIC (Chladni Plate)
    else if (activeMode === 'cymatics') {
      const freqFactor = (activeHz % 100) / 10 + 3;
      const numRays = Math.floor(freqFactor * 2) + 4;
      ctx.rotate(rot * 0.2);

      // Multiple harmonic resonant wave rings
      for (let rIdx = 1; rIdx <= 8; rIdx++) {
        const ringR = (radius / 8) * rIdx * basePulse;
        ctx.beginPath();
        const points = 180;
        for (let p = 0; p <= points; p++) {
          const theta = (p * Math.PI * 2) / points;
          const waveAmp = Math.sin(theta * numRays + t * 3) * (6 + rIdx * 1.5);
          const pr = ringR + waveAmp;
          const x = Math.cos(theta) * pr;
          const y = Math.sin(theta) * pr;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Nodal vibration sand particles
      ctx.fillStyle = theme.primary;
      for (let i = 0; i < 48; i++) {
        const a = (i * Math.PI * 2) / 48 + Math.sin(t + i) * 0.1;
        const dist = (radius * 0.7) * (0.5 + Math.sin(i * 3 + t * 2) * 0.5);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mode 5: HYPNOTIC TORUS FIELD & STARGATE
    else if (activeMode === 'torusField') {
      const numLines = 36;
      ctx.rotate(rot * 0.5);

      for (let i = 0; i < numLines; i++) {
        const theta = (i * Math.PI * 2) / numLines + rot;
        const majorR = radius * 0.65;
        const minorR = radius * 0.35 * basePulse;

        ctx.beginPath();
        const startX = Math.cos(theta) * (majorR - minorR);
        const startY = Math.sin(theta) * (majorR - minorR);
        const endX = Math.cos(theta + Math.PI / 2) * (majorR + minorR);
        const endY = Math.sin(theta + Math.PI / 2) * (majorR + minorR);

        // Curving bezier toroidal arc
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(0, 0, endX, endY);
        ctx.stroke();
      }

      // Torus center eye
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.18 * basePulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = theme.glow;
      ctx.fill();
    }

    // Mode 6: CHAKRA LOTUS & BREATH PACER
    else if (activeMode === 'chakraLotus') {
      const petals = 12;
      const petalLen = radius * 0.75 * basePulse;
      ctx.rotate(rot * 0.1);

      // Lotus Petals
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(petalLen * 0.3, petalLen * 0.4, petalLen * 0.4, petalLen * 0.8, 0, petalLen);
        ctx.bezierCurveTo(-petalLen * 0.4, petalLen * 0.8, -petalLen * 0.3, petalLen * 0.4, 0, 0);
        ctx.stroke();
        ctx.fillStyle = theme.glow;
        ctx.fill();
        ctx.restore();
      }

      // Inner pulsating breath orb
      const breathR = radius * 0.25 * (isPlaying ? (Math.sin(t * 1.5) * 0.18 + 1) : 1);
      ctx.beginPath();
      ctx.arc(0, 0, breathR, 0, Math.PI * 2);
      ctx.fillStyle = theme.secondary;
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.stroke();
    }

    // Mode 7: PLANETARY STARGATE
    else if (activeMode === 'cosmicNebula') {
      ctx.rotate(rot * 0.2);

      // Orbiting planetary rings
      const orbits = [0.3, 0.5, 0.7, 0.9];
      orbits.forEach((orbFrac, idx) => {
        const orbR = radius * orbFrac;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, orbR, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting planet body
        const orbSpeed = (4 - idx) * 0.6;
        const pAngle = t * orbSpeed + idx * 2;
        const px = Math.cos(pAngle) * orbR;
        const py = Math.sin(pAngle) * orbR;

        ctx.fillStyle = theme.primary;
        ctx.beginPath();
        ctx.arc(px, py, 5 + idx, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central radiant Sun/Star
      ctx.fillStyle = theme.primary;
      ctx.beginPath();
      ctx.arc(0, 0, 18 * basePulse, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [activeMode, activeTheme, activeHz, isPlaying, speedMultiplier]);

  // Main 60 FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let startTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (time) => {
      const elapsed = (time - startTime) / 1000;
      const rect = canvas.getBoundingClientRect();
      drawVisualizer(ctx, rect.width, rect.height, elapsed);
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [drawVisualizer]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className={`sacred-visualizer-wrapper glass-panel ${isFullscreen ? 'fullscreen-cinema' : ''}`}>
      {/* Visualizer Top Bar & Mode Selector */}
      <div className="vis-header-row flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-serif font-bold text-white">Sacred Geometry & Cymatic Visualizer</span>
          <span className="text-xs text-gold font-semibold ml-2">({activeHz} Hz Harmonic)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Breath Pacer Toggle */}
          <button 
            onClick={() => setShowBreathPacer(!showBreathPacer)} 
            className={`vis-btn-mini ${showBreathPacer ? 'active' : ''}`}
            title="Toggle Breathing Pacer"
          >
            <Wind className="w-3.5 h-3.5 inline mr-1" /> Breath Guide
          </button>

          {/* Custom Video Uploader Button */}
          <button 
            onClick={() => setShowVideoUploader(!showVideoUploader)} 
            className={`vis-btn-mini ${customVideoUrl ? 'active' : ''}`} 
            title="Upload Custom Background Video"
          >
            <Video className="w-3.5 h-3.5 inline mr-1" /> {customVideoUrl ? 'Custom Video ON' : 'Add Video'}
          </button>

          {/* Fullscreen Cinema Button */}
          <button onClick={toggleFullscreen} className="vis-btn-mini" title="Fullscreen Meditation Cinema">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Custom Background Video Uploader Bar */}
      {showVideoUploader && (
        <div className="custom-video-bar p-3 glass-panel mb-3 rounded-xl border border-cyan/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan" />
            <label className="btn-secondary text-[11px] py-1 px-2.5 rounded-lg cursor-pointer">
              Upload .MP4 / .WebM Video
              <input 
                type="file" 
                accept="video/mp4,video/webm" 
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setCustomVideoUrl(url);
                    setCustomVideoName(file.name);
                  }
                }}
              />
            </label>
            {customVideoName && <span className="text-[11px] text-white truncate max-w-[150px]">{customVideoName}</span>}
          </div>

          {customVideoUrl && (
            <div className="flex items-center gap-2">
              <span className="text-silver text-[11px]">Video Glow Opacity:</span>
              <input 
                type="range" min="0.1" max="1" step="0.05"
                value={videoOpacity}
                onChange={(e) => setVideoOpacity(parseFloat(e.target.value))}
                className="w-20"
              />
              <button 
                onClick={() => { setCustomVideoUrl(null); setCustomVideoName(''); }}
                className="text-rose-400 hover:text-rose-300 p-1"
                title="Remove Custom Video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Display with Breathing Overlay & Custom Background Video */}
      <div className="canvas-display-container relative overflow-hidden rounded-2xl">
        {/* Custom Background Video Element */}
        {customVideoUrl && (
          <video
            ref={videoRef}
            src={customVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300"
            style={{ opacity: videoOpacity }}
          />
        )}

        <canvas ref={canvasRef} className="sacred-canvas relative z-10" style={{ width: '100%', height: isFullscreen ? '78vh' : '360px' }} />

        {/* Floating Breath Pacer HUD */}
        {showBreathPacer && isPlaying && (
          <div className="breath-pacer-hud z-20">
            <div className="breath-circle-pulse">
              <span className="breath-text-label">{breathText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Symbol & Mode Picker Pills */}
      <div className="vis-mode-pills-row mt-3 flex flex-wrap gap-2 justify-center">
        {VISUALIZER_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`vis-mode-pill ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
            title={mode.desc}
          >
            <span className="mr-1.5">{mode.icon}</span>
            <span>{mode.name}</span>
          </button>
        ))}
      </div>

      {/* Color Palette & Speed Settings */}
      <div className="vis-footer-controls mt-3 pt-2.5 border-t border-white/10 flex flex-wrap justify-between items-center gap-3 text-xs text-silver">
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-gold" />
          <span>Aura Glow:</span>
          <div className="flex gap-1.5">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`theme-dot ${activeTheme === theme.id ? 'active' : ''}`}
                style={{ background: theme.primary }}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-cyan" />
          <span>Motion Speed:</span>
          {[0.5, 1, 1.5].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeedMultiplier(spd)}
              className={`speed-chip ${speedMultiplier === spd ? 'active' : ''}`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
