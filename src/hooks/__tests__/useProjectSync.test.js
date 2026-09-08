import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useProjectSync } from '../useProjectSync';

describe('useProjectSync hook', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    localStorage.clear();
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

  // Test Harness Component to test the hook
  function TestHarness({ projectId, onHookResult }) {
    const hookData = useProjectSync(projectId);
    React.useEffect(() => {
      if (onHookResult) onHookResult(hookData);
    }, [hookData, onHookResult]);
    return <div data-testid="sync-status">{hookData.syncStatus}</div>;
  }

  test('initializes with idle status and provides sync methods', () => {
    let hookResult = null;
    act(() => {
      root.render(
        <TestHarness
          projectId="test_proj_1"
          onHookResult={(data) => {
            hookResult = data;
          }}
        />
      );
    });

    expect(hookResult).not.toBeNull();
    expect(hookResult.syncStatus).toBe('idle');
    expect(typeof hookResult.syncToCloud).toBe('function');
    expect(typeof hookResult.fetchFromCloud).toBe('function');
  });

  test('syncToCloud saves to storage and sets status to synced', async () => {
    let hookResult = null;
    act(() => {
      root.render(
        <TestHarness
          projectId="test_proj_1"
          onHookResult={(data) => {
            hookResult = data;
          }}
        />
      );
    });

    let res;
    await act(async () => {
      res = await hookResult.syncToCloud('test_proj_1', {
        title: 'Cosmic Symphony',
        bpm: 128,
      });
    });

    expect(res.success).toBe(true);
    expect(hookResult.syncStatus).toBe('synced');
    expect(hookResult.lastSyncedAt).toBeDefined();

    // Verify localStorage fallback content
    const saved = JSON.parse(localStorage.getItem('cloud_sync_test_proj_1'));
    expect(saved.title).toBe('Cosmic Symphony');
    expect(saved.bpm).toBe(128);
  });

  test('fetchFromCloud loads previously saved project', async () => {
    // Pre-populate storage
    localStorage.setItem(
      'cloud_sync_test_proj_2',
      JSON.stringify({ title: 'Astraea Star', duration: 45 })
    );

    let hookResult = null;
    act(() => {
      root.render(
        <TestHarness
          projectId="test_proj_2"
          onHookResult={(data) => {
            hookResult = data;
          }}
        />
      );
    });

    let loadedData;
    await act(async () => {
      loadedData = await hookResult.fetchFromCloud('test_proj_2');
    });

    expect(loadedData).toBeDefined();
    expect(loadedData.title).toBe('Astraea Star');
    expect(loadedData.duration).toBe(45);
    expect(hookResult.syncStatus).toBe('synced');
  });
});
