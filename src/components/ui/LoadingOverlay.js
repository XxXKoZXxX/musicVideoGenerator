import React from 'react';
import { Film, Sparkles, AlertCircle } from 'lucide-react';

/**
 * LoadingOverlay — Premium glassmorphism dark-mode overlay for video generation & rendering.
 *
 * @param {boolean} isOpen - Whether the overlay is visible.
 * @param {string} title - Primary heading (e.g. "Synthesizing AI Video").
 * @param {string} stage - Current stage or operation name.
 * @param {number} progress - Progress percentage (0 - 100).
 * @param {string} error - Optional error message to display.
 * @param {Function} onCancel - Optional cancel / close callback.
 */
export default function LoadingOverlay({
  isOpen,
  title = 'Synthesizing AI Video',
  stage = 'Submitting to Neural Pipeline...',
  progress = null,
  error = null,
  onCancel = null,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 7, 18, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="glass-panel-studio"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px hsla(42, 95%, 52%, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient background pill */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '100px',
            background: error
              ? 'radial-gradient(circle, hsla(340, 82%, 58%, 0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsla(42, 95%, 52%, 0.35) 0%, hsla(188, 86%, 53%, 0.2) 60%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* Orbiting Spinner Icon */}
        <div
          style={{
            position: 'relative',
            width: '76px',
            height: '76px',
            margin: '0 auto 1.5rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!error && (
            <div
              className="animate-spin-slow"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px dashed hsla(42, 95%, 52%, 0.6)',
                boxShadow: '0 0 15px hsla(42, 95%, 52%, 0.3)',
              }}
            />
          )}

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: error
                ? 'hsla(340, 82%, 58%, 0.15)'
                : 'linear-gradient(135deg, hsla(42, 95%, 52%, 0.2) 0%, hsla(188, 86%, 53%, 0.15) 100%)',
              border: `1px solid ${error ? 'hsla(340, 82%, 58%, 0.5)' : 'hsla(42, 95%, 52%, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: error ? 'hsl(340, 82%, 58%)' : 'hsl(42, 95%, 52%)',
            }}
          >
            {error ? (
              <AlertCircle size={28} />
            ) : (
              <Film size={26} style={{ filter: 'drop-shadow(0 0 6px hsla(42, 95%, 52%, 0.5))' }} />
            )}
          </div>
        </div>

        {/* Title & Stage */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'hsl(220, 20%, 96%)',
            marginBottom: '0.4rem',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {!error && <Sparkles size={18} color="hsl(42, 95%, 52%)" />}
          {title}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: error ? 'hsl(340, 82%, 68%)' : 'hsl(220, 15%, 70%)',
            marginBottom: '1.25rem',
            lineHeight: 1.4,
          }}
        >
          {error || stage}
        </p>

        {/* Progress Bar (if provided) */}
        {typeof progress === 'number' && !error && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'hsl(220, 10%, 60%)',
                marginBottom: '0.35rem',
              }}
            >
              <span>Pipeline Progress</span>
              <span style={{ fontWeight: 600, color: 'hsl(42, 95%, 52%)' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'hsla(230, 25%, 15%, 0.8)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background: 'linear-gradient(90deg, hsl(42, 95%, 52%), hsl(188, 86%, 53%))',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease-out',
                  boxShadow: '0 0 10px hsla(42, 95%, 52%, 0.5)',
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="studio-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
          >
            {error ? 'Close' : 'Cancel Generation'}
          </button>
        )}
      </div>
    </div>
  );
}
