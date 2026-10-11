// src/__tests__/standaloneAppShell.test.js — OPUS-style app shell behavior
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import StandaloneMusicVideoApp from '../StandaloneMusicVideoApp';
import { renderVideoOnServer } from '../services/LocalServerRenderService';

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

function localStorageClear() {
  window.localStorage.clear();
}

describe('StandaloneMusicVideoApp (OPUS shell)', () => {
  beforeEach(() => {
    localStorageClear();
    jest.clearAllMocks();
  });

  test('renders the simplified sidebar navigation', () => {
    render(<StandaloneMusicVideoApp />);
    [
      'Home',
      'Create Video',
      'AI Agent',
      'Library',
      'Cast Designer',
      'Clip Bridge',
    ].forEach((label) => {
      // Nav item + topbar crumb may both carry the label — at least one must exist
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
    // Removed toys must NOT be advertised anywhere in the shell
    ['Timeline DAW', 'Voice Cloner', 'Model Hub', '4-Step Studio'].forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
    // Server status chip
    expect(screen.getAllByText(/Render server online|Checking server/).length).toBeGreaterThanOrEqual(1);
  });

  test('sidebar navigation switches the active view', async () => {
    render(<StandaloneMusicVideoApp />);
    // Home is the default view (hero + recent masters wall)
    expect(screen.getByText(/original music video/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('AI Agent'));
    // The agent workspace console opens with hint chips + the message console
    expect(await screen.findByText(/write a synthwave song about neon rain/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Library')[0]);
    expect(await screen.findByTestId('renders-view')).toBeInTheDocument();
  });

  test('opening the Opus Director Agent drawer shows the assistant', async () => {
    render(<StandaloneMusicVideoApp />);
    expect(screen.queryByTestId('opus-drawer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Director Agent'));
    expect(await screen.findByTestId('opus-drawer')).toBeInTheDocument();
  });

  test('top bar project title input updates the shared project', async () => {
    render(<StandaloneMusicVideoApp />);
    const input = screen.getByDisplayValue('Cyberpunk 2077 Night Drive');
    fireEvent.change(input, { target: { value: 'My Own Anthem' } });
    // The autosave persists the new title into the shared project
    await waitFor(() => {
      expect(window.localStorage.getItem('musicvid_project_v2')).toContain('My Own Anthem');
    }, { timeout: 4000 });
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
