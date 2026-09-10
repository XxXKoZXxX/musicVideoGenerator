import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ClipInbetweenerStudioView from '../ClipInbetweenerStudioView';

describe('ClipInbetweenerStudioView Component', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, keyframes: [] }),
    });
  });

  afterEach(() => {
    act(() => {
      if (root) root.unmount();
    });
    if (container) container.remove();
    container = null;
    jest.clearAllMocks();
  });

  test('renders AI Clip Inbetweener & Gap Filler header and title', async () => {
    await act(async () => {
      root.render(<ClipInbetweenerStudioView project={{}} />);
    });

    expect(container.textContent).toContain('AI Clip Inbetweener & Gap Filler');
    expect(container.textContent).toContain('FIRST & LAST FRAME CONTINUITY');
  });

  test('renders dropzone, default sample clips, and missing gap indicator', async () => {
    await act(async () => {
      root.render(<ClipInbetweenerStudioView project={{}} />);
    });

    expect(container.textContent).toContain('Drop Video Clips Here or Click to Browse');
    expect(container.textContent).toContain('MISSING PART TO FILL');
    expect(container.textContent).toContain('Seamless AI Bridge');
  });

  test('renders engine options and color science presets', async () => {
    await act(async () => {
      root.render(<ClipInbetweenerStudioView project={{}} />);
    });

    expect(container.textContent).toContain('Inbetweening Engine');
    expect(container.textContent).toContain('Local Neural Flow');
    expect(container.textContent).toContain('Color Science Harmonizer');
    expect(container.textContent).toContain('Hollywood 35mm Cinema');
    expect(container.textContent).toContain('Cyberpunk Neon Glow');
  });

  test('renders primary action button to fill missing parts', async () => {
    await act(async () => {
      root.render(<ClipInbetweenerStudioView project={{}} />);
    });

    const button = container.querySelector('.fill-gaps-launch-btn');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Fill Missing Parts & Stitch Video');
  });
});
