import React, { useState } from 'react';
import {
  Wand2,
  Sliders,
  Sparkles,
  Key,
  RotateCcw,
} from 'lucide-react';
import {
  AI_VIDEO_GEN_MODELS,
  SUPPORTED_ASPECT_RATIOS,
  SUPPORTED_DURATIONS,
} from '../../services/AIVideoGenerationService';

/**
 * VideoParamsForm — Isolated, reactive control component for AI video generation.
 *
 * @param {Function} onSubmit - Called with ({ prompt, model, aspectRatio, duration, negativePrompt, apiKey })
 * @param {boolean} isLoading - Whether generation is currently running
 * @param {Object} initialValues - Default values for prompt, model, etc.
 * @param {Function} onCancel - Optional cancel handler
 */
export default function VideoParamsForm({
  onSubmit,
  isLoading = false,
  initialValues = {},
  onCancel = null,
}) {
  const [prompt, setPrompt] = useState(initialValues.prompt || '');
  const [model, setModel] = useState(initialValues.model || 'kling_ai');
  const [aspectRatio, setAspectRatio] = useState(initialValues.aspectRatio || '16:9');
  const [duration, setDuration] = useState(initialValues.duration || 5);
  const [negativePrompt, setNegativePrompt] = useState(
    initialValues.negativePrompt || 'blurry, low quality, artifacts, watermark, jitter, distorted face'
  );
  const [apiKey, setApiKey] = useState(initialValues.apiKey || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formError, setFormError] = useState('');

  const PROMPT_PRESETS = [
    'Cinematic 35mm film shot of cosmic vocalist under neon aurora borealis, volumetric lighting, slow motion',
    'Cyberpunk Tokyo night highway pursuit, reflections on rain-slicked asphalt, anamorphic lens flare 2.39:1',
    'Ethereal golden hour portrait with fluttering silk fabric in zero gravity, award-winning cinematography',
    'Sub-bass drop explosion with shockwave particles and liquid crystal geometry pulsating in dark void',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setFormError('Please provide a visual description / prompt.');
      return;
    }
    setFormError('');
    if (onSubmit) {
      onSubmit({
        prompt: prompt.trim(),
        model,
        aspectRatio,
        duration: Number(duration),
        negativePrompt: negativePrompt.trim(),
        apiKey: apiKey.trim(),
      });
    }
  };

  const handleReset = () => {
    setPrompt('');
    setModel('kling_ai');
    setAspectRatio('16:9');
    setDuration(5);
    setNegativePrompt('blurry, low quality, artifacts, watermark, jitter');
    setApiKey('');
    setFormError('');
  };

  return (
    <form onSubmit={handleSubmit} className="video-params-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Model Selection Grid */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'hsl(42, 95%, 52%)',
            marginBottom: '0.5rem',
          }}
        >
          AI Video Engine
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {AI_VIDEO_GEN_MODELS.map((m) => {
            const isSelected = model === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setModel(m.id)}
                className="glass-card"
                style={{
                  padding: '0.65rem',
                  textAlign: 'left',
                  borderRadius: '10px',
                  border: isSelected
                    ? '1px solid hsl(42, 95%, 52%)'
                    : '1px solid hsla(230, 20%, 30%, 0.35)',
                  background: isSelected
                    ? 'linear-gradient(135deg, hsla(42, 95%, 52%, 0.15) 0%, hsla(230, 30%, 15%, 0.7) 100%)'
                    : 'hsla(230, 30%, 10%, 0.6)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isSelected ? 'hsl(42, 95%, 52%)' : 'hsl(220, 20%, 92%)',
                    }}
                  >
                    {m.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(220, 10%, 60%)' }}>{m.provider}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label
            htmlFor="video-prompt-input"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'hsl(220, 20%, 90%)',
            }}
          >
            Scene Visual Prompt
          </label>
          <span style={{ fontSize: '0.72rem', color: 'hsl(220, 10%, 55%)' }}>
            Be descriptive about lighting, subject & camera motion
          </span>
        </div>

        <textarea
          id="video-prompt-input"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (formError) setFormError('');
          }}
          placeholder="e.g. Cyberpunk street in Tokyo with purple volumetric laser fog, slow motion camera dolly..."
          rows={3}
          className="studio-textarea"
          style={{ resize: 'vertical' }}
        />

        {/* Prompt Inspiration Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
          {PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(preset)}
              style={{
                fontSize: '0.7rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'hsla(230, 25%, 16%, 0.6)',
                border: '1px solid hsla(230, 20%, 28%, 0.5)',
                color: 'hsl(220, 15%, 75%)',
                cursor: 'pointer',
              }}
              title={preset}
            >
              <Sparkles size={10} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio & Duration Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label
            htmlFor="video-aspect-ratio-select"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'hsl(220, 20%, 90%)',
              marginBottom: '0.4rem',
            }}
          >
            Aspect Ratio
          </label>
          <select
            id="video-aspect-ratio-select"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="studio-select"
          >
            {SUPPORTED_ASPECT_RATIOS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.icon} {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'hsl(220, 20%, 90%)',
              marginBottom: '0.4rem',
            }}
          >
            Clip Duration
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {SUPPORTED_DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: duration === d.value ? 700 : 500,
                  borderRadius: '8px',
                  border: duration === d.value
                    ? '1px solid hsl(42, 95%, 52%)'
                    : '1px solid hsla(230, 20%, 30%, 0.4)',
                  background: duration === d.value
                    ? 'hsla(42, 95%, 52%, 0.2)'
                    : 'hsla(230, 30%, 12%, 0.6)',
                  color: duration === d.value ? 'hsl(42, 95%, 52%)' : 'hsl(220, 20%, 85%)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {d.value}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Advanced Controls (Negative Prompt & API Key) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: 'hsl(42, 95%, 52%)',
            cursor: 'pointer',
            padding: '0.25rem 0',
          }}
        >
          <Sliders size={13} />
          {showAdvanced ? 'Hide Advanced Tuning' : 'Show Advanced Tuning (Negative Prompt & API Key)'}
        </button>

        {showAdvanced && (
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '0.85rem',
              background: 'hsla(230, 30%, 8%, 0.6)',
              borderRadius: '10px',
              border: '1px solid hsla(230, 20%, 25%, 0.4)',
            }}
          >
            <div>
              <label
                htmlFor="video-negative-prompt"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'hsl(220, 15%, 80%)',
                  marginBottom: '0.25rem',
                }}
              >
                Negative Prompt (Elements to avoid)
              </label>
              <textarea
                id="video-negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                className="studio-textarea"
                style={{ fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label
                htmlFor="video-api-key-input"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'hsl(220, 15%, 80%)',
                  marginBottom: '0.25rem',
                }}
              >
                Optional fal.ai API Key Override
              </label>
              <div style={{ position: 'relative' }}>
                <Key
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(220, 10%, 50%)',
                  }}
                />
                <input
                  id="video-api-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Defaults to server FAL_KEY if omitted"
                  className="studio-input"
                  style={{ paddingLeft: '2.1rem', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {formError && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'hsl(340, 82%, 65%)',
            background: 'hsla(340, 82%, 58%, 0.12)',
            border: '1px solid hsla(340, 82%, 58%, 0.3)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
          }}
        >
          {formError}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={isLoading}
          className="studio-btn-primary"
          style={{ flex: 2, padding: '0.75rem 1rem' }}
        >
          <Wand2 size={16} />
          {isLoading ? 'Synthesizing...' : 'Generate AI Video Clip'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="studio-btn-secondary"
          style={{ flex: 1 }}
          title="Reset form"
        >
          <RotateCcw size={15} />
          Reset
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="studio-btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
