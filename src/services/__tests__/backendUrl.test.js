// src/services/__tests__/backendUrl.test.js
import BACKEND_URL, { withBackend } from '../backendUrl';

describe('backendUrl', () => {
  test('defaults to same-origin (relative) URLs so dev proxy + preview hosts work', () => {
    // Without REACT_APP_VIDEO_SERVER_URL set in the test env, it must be relative
    expect(BACKEND_URL).toBe('');
    expect(withBackend('/api/server-render/create')).toBe('/api/server-render/create');
    expect(withBackend('/renders/sample.mp4')).toBe('/renders/sample.mp4');
  });

  test('never hard-codes localhost:4000 by default (browser on a preview host cannot reach it)', () => {
    expect(BACKEND_URL).not.toContain('localhost');
  });
});
