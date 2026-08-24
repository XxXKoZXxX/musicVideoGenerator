import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ModernStudioWorkstation from '../ModernStudioWorkstation';
import MultiTrackTimeline from '../MultiTrackTimeline';
import StudioInspectorPanel from '../StudioInspectorPanel';

describe('ModernStudioWorkstation & Components', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  const mockProject = {
    artistName: 'Cyber Star',
    aspectRatio: '16:9',
    bpm: 130,
    duration: 32,
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    ],
  };

  test('MultiTrackTimeline renders all 5 DAW track headers', () => {
    act(() => {
      root.render(
        <MultiTrackTimeline
          project={mockProject}
          currentTime={10}
          duration={32}
          onSeek={() => {}}
        />
      );
    });

    expect(container.textContent).toContain('V1 Video Clips');
    expect(container.textContent).toContain('V2 Actor/Lip-Sync');
    expect(container.textContent).toContain('A1 Audio Master');
    expect(container.textContent).toContain('FX Beat Drops');
    expect(container.textContent).toContain('T1 Subtitles');
  });

  test('StudioInspectorPanel renders and provides toolkit tabs', () => {
    act(() => {
      root.render(<StudioInspectorPanel project={mockProject} />);
    });

    expect(container.textContent).toContain('Audio/Stems');
    expect(container.textContent).toContain('Actor Lock');
    expect(container.textContent).toContain('Styles');
    expect(container.textContent).toContain('Camera FX');
    expect(container.textContent).toContain('AI Engine');
  });

  test('ModernStudioWorkstation renders toolbar, viewport, inspector and timeline', () => {
    act(() => {
      root.render(<ModernStudioWorkstation project={mockProject} />);
    });

    expect(container.textContent).toContain('Export 4K Master');
    expect(container.textContent).toContain('1-Click Auto Director ⚡');
    expect(container.textContent).toContain('Multi-Track Timeline');
  });
});
