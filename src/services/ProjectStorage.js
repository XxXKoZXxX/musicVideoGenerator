const STORAGE_KEY = 'astraea_musicvid_projects';
const MAX_PROJECTS = 20;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeAll(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    // localStorage full/unavailable — caller just won't see the save persist
  }
}

export const ProjectStorage = {
  list() {
    return readAll().sort((a, b) => b.savedAt - a.savedAt);
  },

  save(name, project) {
    const projects = readAll();
    const entry = {
      id: `proj-${Date.now()}`,
      name: name || project.artistName || 'Untitled Project',
      savedAt: Date.now(),
      project,
    };
    writeAll([entry, ...projects].slice(0, MAX_PROJECTS));
    return entry;
  },

  load(id) {
    return readAll().find((p) => p.id === id) || null;
  },

  remove(id) {
    writeAll(readAll().filter((p) => p.id !== id));
  },
};

export function formatRelativeSaveTime(timestamp) {
  const diffSec = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
