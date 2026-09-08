import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import VideoParamsForm from '../VideoParamsForm';
import LoadingOverlay from '../LoadingOverlay';

describe('VideoParamsForm Component', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      if (root) root.unmount();
    });
    if (container) container.remove();
    container = null;
    root = null;
  });

  test('renders prompt textarea, aspect ratio select, and generate button', () => {
    act(() => {
      root.render(<VideoParamsForm onSubmit={() => {}} />);
    });

    const textarea = container.querySelector('#video-prompt-input');
    expect(textarea).not.toBeNull();

    const select = container.querySelector('#video-aspect-ratio-select');
    expect(select).not.toBeNull();

    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).not.toBeNull();
    expect(submitBtn.textContent).toContain('Generate AI Video Clip');
  });

  test('shows error message if prompt is submitted empty', () => {
    const handleSubmit = jest.fn();
    act(() => {
      root.render(<VideoParamsForm onSubmit={handleSubmit} />);
    });

    const form = container.querySelector('form');
    act(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Please provide a visual description / prompt.');
  });

  test('calls onSubmit with parameters when prompt is filled', () => {
    const handleSubmit = jest.fn();
    act(() => {
      root.render(
        <VideoParamsForm
          onSubmit={handleSubmit}
          initialValues={{
            prompt: 'Cosmic nebula galaxy',
            model: 'luma_dream',
            aspectRatio: '9:16',
            duration: 10,
          }}
        />
      );
    });

    const form = container.querySelector('form');
    act(() => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submitted = handleSubmit.mock.calls[0][0];
    expect(submitted.prompt).toBe('Cosmic nebula galaxy');
    expect(submitted.model).toBe('luma_dream');
    expect(submitted.aspectRatio).toBe('9:16');
    expect(submitted.duration).toBe(10);
  });
});

describe('LoadingOverlay Component', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      if (root) root.unmount();
    });
    if (container) container.remove();
    container = null;
    root = null;
  });

  test('does not render when isOpen is false', () => {
    act(() => {
      root.render(<LoadingOverlay isOpen={false} />);
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  test('renders title, stage and progress bar when isOpen is true', () => {
    act(() => {
      root.render(
        <LoadingOverlay
          isOpen={true}
          title="Synthesizing AI Video"
          stage="Rendering Neural Frames"
          progress={65}
        />
      );
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(container.textContent).toContain('Synthesizing AI Video');
    expect(container.textContent).toContain('Rendering Neural Frames');
    expect(container.textContent).toContain('65%');
  });

  test('renders error state and cancel button', () => {
    const handleCancel = jest.fn();
    act(() => {
      root.render(
        <LoadingOverlay
          isOpen={true}
          error="Network timeout"
          onCancel={handleCancel}
        />
      );
    });

    expect(container.textContent).toContain('Network timeout');
    const closeBtn = container.querySelector('button');
    expect(closeBtn.textContent).toBe('Close');

    act(() => {
      closeBtn.click();
    });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
