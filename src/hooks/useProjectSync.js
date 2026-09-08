import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveProjectToCloud,
  loadProjectFromCloud,
  listCloudProjects,
  isFirebaseConfigured,
} from '../firebase.config';

/**
 * useProjectSync — Custom React hook for cloud persistence & synchronization via Firestore.
 *
 * @param {string} projectId - Project identifier
 * @param {Object} projectState - Current active project state in memory
 * @param {boolean} autoSync - Whether to auto-sync on state changes (debounced)
 */
export function useProjectSync(projectId, projectState = null, autoSync = false) {
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [cloudProjects, setCloudProjects] = useState([]);
  const debounceTimerRef = useRef(null);

  // Sync to Cloud
  const syncToCloud = useCallback(async (customId, customData) => {
    const targetId = customId || projectId;
    const targetData = customData || projectState;
    if (!targetId || !targetData) return { success: false, error: 'Missing id or data' };

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const res = await saveProjectToCloud(targetId, targetData);
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncedAt(new Date().toLocaleTimeString());
        return res;
      } else {
        setSyncStatus('error');
        setSyncError(res.error || 'Sync failed');
        return res;
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [projectId, projectState]);

  // Load from Cloud
  const fetchFromCloud = useCallback(async (targetId) => {
    const id = targetId || projectId;
    if (!id) return null;

    setSyncStatus('syncing');
    try {
      const res = await loadProjectFromCloud(id);
      if (res.success) {
        setSyncStatus('synced');
        setLastSyncedAt(new Date().toLocaleTimeString());
        return res.data;
      } else {
        setSyncStatus('idle');
        return null;
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return null;
    }
  }, [projectId]);

  // Refresh list of all projects
  const refreshCloudList = useCallback(async () => {
    try {
      const list = await listCloudProjects();
      setCloudProjects(list);
      return list;
    } catch (err) {
      console.warn('[useProjectSync] Failed to refresh list:', err.message);
      return [];
    }
  }, []);

  // Debounced auto-sync when projectState changes and autoSync is true
  useEffect(() => {
    if (!autoSync || !projectId || !projectState) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      syncToCloud(projectId, projectState);
    }, 4000); // 4-second debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [projectId, projectState, autoSync, syncToCloud]);

  return {
    syncStatus,
    lastSyncedAt,
    syncError,
    cloudProjects,
    isFirebaseConfigured,
    syncToCloud,
    fetchFromCloud,
    refreshCloudList,
  };
}

export default useProjectSync;
