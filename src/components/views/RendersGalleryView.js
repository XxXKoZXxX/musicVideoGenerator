import React, { useCallback, useEffect, useState } from 'react';
import {
  Clapperboard,
  Download,
  Film,
  Loader2,
  RefreshCw,
  Subtitles,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Search,
  Link2,
  Sparkles,
} from 'lucide-react';
import {
  listServerVideos,
  deleteServerRenderFile,
  checkVideoServerHealth,
  triggerBrowserDownload,
} from '../../services/LocalServerRenderService';
import BACKEND_URL from '../../services/backendUrl';
import '../RendersGallery.css';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch (_) {
    return '';
  }
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'largest', label: 'Largest file' },
  { id: 'title', label: 'Title A→Z' },
];

export default function RendersGalleryView({ onNavigate, highlightJobId }) {
  const [renders, setRenders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedKey, setCopiedKey] = useState(null);
  const [gifState, setGifState] = useState({}); // fileName -> 'working' | 'done' | 'error'

  const visibleRenders = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? renders.filter(
          (r) =>
            (r.title || '').toLowerCase().includes(q) ||
            (r.fileName || '').toLowerCase().includes(q)
        )
      : [...renders];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'largest':
          return (b.size || 0) - (a.size || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    return list;
  }, [renders, query, sortBy]);

  const handleCopyLink = async (r) => {
    const url = /^https?:\/\//.test(r.videoUrl || '')
      ? r.videoUrl
      : `${window.location.origin}${r.videoUrl}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (_) {
      // Clipboard API can be unavailable in non-secure contexts — fall back
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedKey(r.fileName);
    setTimeout(() => setCopiedKey((k) => (k === r.fileName ? null : k)), 1600);
  };

  const handleExportGif = async (r) => {
    setGifState((prev) => ({ ...prev, [r.fileName]: 'working' }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/server-render/gif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: r.fileName, maxSeconds: 8, width: 480 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'GIF export failed');
      setGifState((prev) => ({ ...prev, [r.fileName]: 'done' }));
      triggerBrowserDownload(`${BACKEND_URL}${data.gifUrl}`, data.fileName);
    } catch (e) {
      setGifState((prev) => ({ ...prev, [r.fileName]: 'error' }));
      alert('GIF export failed: ' + e.message);
    }
  };

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [online, list] = await Promise.all([checkVideoServerHealth(), listServerVideos()]);
      setIsOnline(online);
      setRenders(list);
    } catch (e) {
      setError(e.message || 'Failed to load render library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Delete "${fileName}" from the render library?`)) return;
    setDeleting(fileName);
    try {
      await deleteServerRenderFile(fileName);
      await refresh();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="renders-gallery">
      <div className="gallery-header">
        <div className="gallery-title-block">
          <div className="gallery-icon-badge">
            <HardDrive size={22} />
          </div>
          <div>
            <h2>Render Library</h2>
            <p>
              Every master video rendered on your local render server — stream, download MP4 and
              export synced SRT / LRC lyric files.
            </p>
          </div>
        </div>
        <div className="gallery-actions">
          {isOnline === false && (
            <span className="gallery-status offline">
              <AlertTriangle size={13} /> Render server offline
            </span>
          )}
          {isOnline === true && (
            <span className="gallery-status online">
              <CheckCircle2 size={13} /> Render server online
            </span>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('wizard')}
          >
            <Film size={14} /> New Video
          </button>
        </div>

        {renders.length > 1 && (
          <div className="gallery-toolbar">
            <div className="gallery-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search your renders…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="gallery-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="gallery-count">
              {visibleRenders.length} / {renders.length} masters
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="gallery-empty">
          <Loader2 size={30} className="spin-icon text-cyan" />
          <p>Scanning render server…</p>
        </div>
      ) : error ? (
        <div className="gallery-empty">
          <AlertTriangle size={30} className="text-rose-400" />
          <p>{error}</p>
          <p className="hint">Make sure the video server is running (npm run video-server).</p>
        </div>
      ) : renders.length === 0 ? (
        <div className="gallery-empty">
          <Clapperboard size={34} className="text-slate-500" />
          <h3>No renders yet</h3>
          <p>
            Upload any song, paste its lyrics, hit <strong>Render Master</strong> — your finished
            MP4 with burned-in synced lyrics will appear here.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate && onNavigate('wizard')}>
            <Clapperboard size={16} /> Start Creating
          </button>
        </div>
      ) : visibleRenders.length === 0 ? (
        <div className="gallery-empty">
          <Search size={30} className="text-slate-500" />
          <h3>No renders match "{query}"</h3>
          <p>Try a different search term, or clear the filter to see all {renders.length} masters.</p>
          <button type="button" className="btn btn-secondary" onClick={() => setQuery('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {visibleRenders.map((r) => {
            const isHighlight = r.fileName.includes(highlightJobId || '') && highlightJobId;
            const gifStatus = gifState[r.fileName];
            return (
              <div key={r.fileName} className={`gallery-card ${isHighlight ? 'highlight' : ''}`}>
                <div className="gallery-card-media">
                  {r.thumbnailUrl ? (
                    <img src={r.thumbnailUrl} alt={r.title} loading="lazy" />
                  ) : (
                    <div className="gallery-card-placeholder">
                      <Film size={28} className="text-slate-500" />
                    </div>
                  )}
                  <video
                    src={r.videoUrl}
                    className="gallery-card-video"
                    controls
                    preload="none"
                    playsInline
                  />
                  <span className="gallery-card-badge">{r.resolution}</span>
                  <span className="gallery-card-badge ratio">{r.aspectRatio}</span>
                </div>

                <div className="gallery-card-body">
                  <h4 title={r.title}>{r.title}</h4>
                  <div className="gallery-card-meta">
                    {r.duration ? <span>{Math.round(r.duration)}s</span> : null}
                    <span>{formatBytes(r.size)}</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="gallery-card-lyrics">
                    <Subtitles size={13} />
                    <span>
                      {r.lyricLines > 0
                        ? `${r.lyricLines} lyric lines burned in (${r.lyricsStyle || 'neon'})`
                        : 'No lyric overlay'}
                    </span>
                  </div>

                  <div className="gallery-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => triggerBrowserDownload(r.downloadUrl, r.fileName)}
                    >
                      <Download size={13} /> MP4
                    </button>
                    {r.srtUrl && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => triggerBrowserDownload(r.srtUrl, r.fileName.replace(/\.mp4$/, '.srt'))}
                        title="Export subtitles (SRT)"
                      >
                        <Subtitles size={13} /> SRT
                      </button>
                    )}
                    {r.lrcUrl && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => triggerBrowserDownload(r.lrcUrl, r.fileName.replace(/\.mp4$/, '.lrc'))}
                        title="Export time-coded lyrics (LRC)"
                      >
                        <Subtitles size={13} /> LRC
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExportGif(r)}
                      disabled={gifStatus === 'working'}
                      title="Export a shareable animated GIF preview"
                    >
                      {gifStatus === 'working' ? (
                        <Loader2 size={13} className="spin-icon" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      GIF
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopyLink(r)}
                      title="Copy streamable link to this master"
                    >
                      {copiedKey === r.fileName ? (
                        <CheckCircle2 size={13} style={{ color: '#34d399' }} />
                      ) : (
                        <Link2 size={13} />
                      )}
                      {copiedKey === r.fileName ? 'Copied' : 'Link'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost-danger btn-sm"
                      onClick={() => handleDelete(r.fileName)}
                      disabled={deleting === r.fileName}
                      title="Delete render"
                    >
                      {deleting === r.fileName ? (
                        <Loader2 size={13} className="spin-icon" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
