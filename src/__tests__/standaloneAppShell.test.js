// src/__tests__/standaloneAppShell.test.js — OPUS-style app shell behavior
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the heavy studio views — the shell's navigation/state is what we test here.
// (JSX is not allowed inside jest.mock factories in this CRA setup, so we use createElement.)
jest.mock('../components/views/VideoStudioView', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: (props) =>
      R.createElement('div', { 'data-testid': 'wizard-view', 'data-title': (props.project && props.project.audioTitle) || '' }),
  };
});
jest.mock('../components/studio/ModernStudioWorkstation', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'studio-view' }) };
});
jest.mock('../components/views/VoiceClonerStudioView', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'vocal-view' }) };
});
jest.mock('../components/views/CharacterStudioView', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'character-view' }) };
});
jest.mock('../components/views/ModelHubView', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'model-hub-view' }) };
});
jest.mock('../components/views/ClipInbetweenerStudioView', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'gap-filler-view' }) };
});
jest.mock('../components/views/RendersGalleryView', () => {
  const R = require('react');
  return { __esModule: true, default: () => R.createElement('div', { 'data-testid': 'renders-view' }) };
});
jest.mock('../components/common/OpusAgentAssistantDrawer', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? R.createElement('div', { 'data-testid': 'opus-drawer' }) : null),
  };
});
jest.mock('../components/common/FreebeatAutoDirectorModal', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? R.createElement('div', { 'data-testid': 'auto-director' }) : null),
  };
});
jest.mock('../components/studio/FeatureStudioModal', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? R.createElement('div', { 'data-testid': 'feature-modal' }) : null),
  };
});
jest.mock('../components/share/ShareModal', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? R.createElement('div', { 'data-testid': 'share-modal' }) : null),
  };
});
jest.mock('../components/theme/ThemeCustomizerModal', () => {
  const R = require('react');
  return {
    __esModule: true,
    default: ({ isOpen }) => (isOpen ? R.createElement('div', { 'data-testid': 'theme-modal' }) : null),
  };
});
jest.mock('../utils/themeEngine', () => ({ loadSavedTheme: jest.fn() }));

jest.mock('../services/LocalServerRenderService', () => ({
  renderVideoOnServer: jest.fn(),
  checkVideoServerHealth: jest.fn(() => Promise.resolve(true)),
}));

import StandaloneMusicVideoApp from '../StandaloneMusicVideoApp';
import { renderVideoOnServer } from '../services/LocalServerRenderService';

function localStorageClear() {
  window.localStorage.clear();
}

describe('StandaloneMusicVideoApp (OPUS shell)', () => {
  beforeEach(() => {
    localStorageClear();
    jest.clearAllMocks();
  });

  test('renders the sidebar navigation with all studio sections', () => {
    render(<StandaloneMusicVideoApp />);
    [
      'Create Video',
      'Timeline DAW',
      'Render Library',
      'Voice Cloner',
      'Character Studio',
      'Gap Filler & Stitcher',
      'Model Hub',
      'Opus Director Agent',
    ].forEach((label) => {
      // Nav item + topbar crumb may both carry the label — at least one must exist
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
    // Server status chip
    expect(screen.getAllByText(/Render server online|Checking server/).length).toBeGreaterThanOrEqual(1);
  });

  test('sidebar navigation switches the active view', async () => {
    render(<StandaloneMusicVideoApp />);
    expect(screen.getByTestId('wizard-view')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Render Library'));
    expect(await screen.findByTestId('renders-view')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Voice Cloner'));
    expect(await screen.findByTestId('vocal-view')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Timeline DAW'));
    expect(await screen.findByTestId('studio-view')).toBeInTheDocument();
  });

  test('opening the Opus Director Agent drawer shows the assistant', async () => {
    render(<StandaloneMusicVideoApp />);
    expect(screen.queryByTestId('opus-drawer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Opus Director Agent'));
    expect(await screen.findByTestId('opus-drawer')).toBeInTheDocument();
  });

  test('top bar project title input updates the shared project (wizard sees it)', () => {
    render(<StandaloneMusicVideoApp />);
    const input = screen.getByDisplayValue('Cyberpunk 2077 Night Drive');
    fireEvent.change(input, { target: { value: 'My Own Anthem' } });
    // The wizard view receives the updated shared project
    const wizard = screen.getByTestId('wizard-view');
    expect(wizard).toHaveAttribute('data-title', 'My Own Anthem');
  });

  test('quick "Render Master" without lyrics warns and does not call the server', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<StandaloneMusicVideoApp />);
    fireEvent.click(screen.getByText('Render Master'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    expect(renderVideoOnServer).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  test('quick "Render Master" with lyrics submits a server render and completes', async () => {
    // Seed a saved project that contains lyrics (autoplayed into the shell)
    window.localStorage.setItem(
      'musicvid_project_v2',
      JSON.stringify({
        artistName: 'Test Artist',
        audioTitle: 'Lyric Song',
        lyrics: '[00:01.00] test lyric line',
        duration: 30,
        bpm: 120,
        images: [],
      })
    );

    renderVideoOnServer.mockImplementation(async (project, _opts, onProgress) => {
      onProgress &&
        onProgress({ jobId: 'jobX', status: 'ENCODING_VIDEO', stage: 'Burning synced lyrics', progress: 55 });
      return {
        id: 'jobX',
        status: 'COMPLETED',
        progress: 100,
        stage: 'Render Complete',
        videoUrl: '/renders/x.mp4',
        downloadUrl: '/api/server-render/download/x.mp4',
        outputFileName: 'x.mp4',
        srtUrl: '/renders/subtitles/x_lyrics.srt',
        lrcUrl: '/renders/subtitles/x_lyrics.lrc',
      };
    });

    render(<StandaloneMusicVideoApp />);
    // The shell seeded from localStorage should show 'Lyric Song' in the top bar
    expect(screen.getByDisplayValue('Lyric Song')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Render Master'));

    await waitFor(() => {
      expect(renderVideoOnServer).toHaveBeenCalledTimes(1);
    });
    const [submittedProject] = renderVideoOnServer.mock.calls[0];
    expect(submittedProject.lyrics).toBe('[00:01.00] test lyric line');
    expect(submittedProject.showLyrics).toBe(true);

    await screen.findByText((content) => content.includes('Master Video Ready'));
  });

  test('autosaves the project to localStorage (without heavy blobs)', async () => {
    render(<StandaloneMusicVideoApp />);
    const input = screen.getByDisplayValue('Cyberpunk 2077 Night Drive');
    fireEvent.change(input, { target: { value: 'Autosave Check' } });

    await waitFor(
      () => {
        const raw = window.localStorage.getItem('musicvid_project_v2');
        expect(raw).toBeTruthy();
        expect(raw).toContain('Autosave Check');
      },
      { timeout: 4000 }
    );

    // Session-only blob URLs must not be persisted
    const saved = JSON.parse(window.localStorage.getItem('musicvid_project_v2'));
    expect(saved.audioBlobUrl).toBeUndefined();
  });
});
