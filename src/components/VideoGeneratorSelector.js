import React, { useState, useEffect } from 'react';
import { fetchVideoGenerators } from '../services/VideoServerClient';
import { Sparkles } from 'lucide-react';

const ENGINE_LABELS = {
  'ai-neural': 'AI Neural Motion (Runway / Kling)',
  'runway': 'RunwayML Gen-3 Alpha',
  'sora': 'OpenAI Sora Video Engine',
  'kling': 'Kling 1.5 HD AI',
  'luma': 'Luma Dream Machine',
  'stable-diffusion': 'Stable Video Diffusion (SVD)',
  'deepbrain': 'DeepBrain AI Avatar',
  'webgl-gpu': 'WebGL GPU Shader Engine',
  'canvas-2d': 'Canvas 2D Ultra Compositor',
  'master-4k': 'Cinema Master 4K Studio Exporter',
};

export default function VideoGeneratorSelector({ selectedRenderer, onRendererSelect }) {
  const [options, setOptions] = useState([
    'ai-neural',
    'runway',
    'sora',
    'kling',
    'master-4k',
  ]);
  const [selected, setSelected] = useState(selectedRenderer || 'ai-neural');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRenderer) setSelected(selectedRenderer);
  }, [selectedRenderer]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchVideoGenerators()
      .then((list) => {
        if (isMounted && list && list.length > 0) {
          setOptions(list);
        }
      })
      .catch(() => {
        // Fallback default options already provided
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (onRendererSelect) onRendererSelect(val);
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
      className="video-generator-selector"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="#a855f7" />
        <label
          htmlFor="renderer-select"
          style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', cursor: 'pointer' }}
        >
          Active AI Video Generator Engine:
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          id="renderer-select"
          value={selected}
          onChange={handleChange}
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {ENGINE_LABELS[opt] || opt}
            </option>
          ))}
        </select>
        {loading && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Syncing...</span>}
      </div>
    </div>
  );
}
