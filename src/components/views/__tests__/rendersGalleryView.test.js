// src/components/views/__tests__/rendersGalleryView.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RendersGalleryView from '../RendersGalleryView';

jest.mock('../../../services/LocalServerRenderService', () => ({
  listServerVideos: jest.fn(),
  deleteServerRenderFile: jest.fn(),
  checkVideoServerHealth: jest.fn(),
  triggerBrowserDownload: jest.fn(),
}));

import {
  listServerVideos,
  checkVideoServerHealth,
  deleteServerRenderFile,
  triggerBrowserDownload,
} from '../../../services/LocalServerRenderService';

const FAKE_RENDERS = [
  {
    fileName: 'render_abc_123.mp4',
    videoUrl: 'http://localhost:4000/renders/render_abc_123.mp4',
    downloadUrl: 'http://localhost:4000/api/server-render/download/render_abc_123.mp4',
    size: 1234567,
    createdAt: '2026-09-11T10:00:00.000Z',
    title: 'Neon Nights',
    resolution: '1080p',
    aspectRatio: '16:9',
    duration: 32,
    lyricLines: 5,
    lyricsStyle: 'neon',
    thumbnailUrl: '/renders/render_abc_123_thumb.jpg',
    srtUrl: '/renders/subtitles/render_abc_123_lyrics.srt',
    lrcUrl: '/renders/subtitles/render_abc_123_lyrics.lrc',
  },
];

describe('RendersGalleryView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkVideoServerHealth.mockResolvedValue(true);
    listServerVideos.mockResolvedValue(FAKE_RENDERS);
    deleteServerRenderFile.mockResolvedValue({ success: true });
  });

  test('renders the library grid with lyric + subtitle actions', async () => {
    render(<RendersGalleryView onNavigate={jest.fn()} />);

    expect(await screen.findByText('Neon Nights')).toBeInTheDocument();
    expect(screen.getByText('Render server online')).toBeInTheDocument();
    expect(screen.getByText(/5 lyric lines burned in/)).toBeInTheDocument();
    // SRT + LRC + MP4 download actions
    expect(screen.getAllByText('SRT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('LRC').length).toBeGreaterThanOrEqual(1);
  });

  test('shows offline status when the render server is unreachable', async () => {
    checkVideoServerHealth.mockResolvedValue(false);
    listServerVideos.mockResolvedValue([]);
    render(<RendersGalleryView onNavigate={jest.fn()} />);
    expect(await screen.findByText('Render server offline')).toBeInTheDocument();
  });

  test('empty state offers to start creating', async () => {
    listServerVideos.mockResolvedValue([]);
    const onNavigate = jest.fn();
    render(<RendersGalleryView onNavigate={onNavigate} />);
    expect(await screen.findByText('No renders yet')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Start Creating'));
    expect(onNavigate).toHaveBeenCalledWith('wizard');
  });

  test('delete calls the service and refreshes the list', async () => {
    window.confirm = jest.fn(() => true);
    render(<RendersGalleryView onNavigate={jest.fn()} />);
    await screen.findByText('Neon Nights');

    fireEvent.click(screen.getByTitle('Delete render'));

    await waitFor(() => {
      expect(deleteServerRenderFile).toHaveBeenCalledWith('render_abc_123.mp4');
    });
    expect(listServerVideos).toHaveBeenCalled();
  });

  test('MP4 download triggers browser download with the file name', async () => {
    render(<RendersGalleryView onNavigate={jest.fn()} />);
    await screen.findByText('Neon Nights');

    fireEvent.click(screen.getByText('MP4'));
    expect(triggerBrowserDownload).toHaveBeenCalledWith(
      'http://localhost:4000/api/server-render/download/render_abc_123.mp4',
      'render_abc_123.mp4'
    );
  });
});
