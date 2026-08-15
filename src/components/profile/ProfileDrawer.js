import React, { useState } from 'react';
import { User, Plus, Trash2, Check, X, Download, Upload } from 'lucide-react';

export default function ProfileDrawer({ profiles, activeProfile, onSelectProfile, onCreateNew, onDeleteProfile, onImportProfiles, onClose }) {
  const [importStatus, setImportStatus] = useState('');

  const handleExportProfiles = () => {
    const dataStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Astraea_Profiles_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setImportStatus('Exported profiles backup!');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          if (onImportProfiles) {
            onImportProfiles(parsed);
            setImportStatus(`Successfully imported ${parsed.length} profiles!`);
            setTimeout(() => setImportStatus(''), 3000);
          }
        } else {
          setImportStatus('Invalid JSON profiles format.');
          setTimeout(() => setImportStatus(''), 3000);
        }
      } catch (err) {
        setImportStatus('Error reading profile JSON file.');
        setTimeout(() => setImportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="profile-drawer-backdrop" onClick={onClose}>
      <div className="profile-drawer-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="header-title">
            <User className="w-5 h-5 text-gold mr-2" />
            <h3>Cosmic Profiles Manager</h3>
          </div>
          <button onClick={onClose} className="drawer-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export / Import Data Actions */}
        <div className="profile-data-actions p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between gap-2 mt-2">
          <button 
            onClick={handleExportProfiles}
            className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1"
            title="Export all profiles to JSON"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>Export JSON</span>
          </button>

          <label className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan" />
            <span>Import JSON</span>
            <input 
              type="file" 
              accept=".json,application/json" 
              className="hidden"
              onChange={handleImportFile}
            />
          </label>
        </div>

        {importStatus && (
          <div className="p-2 bg-gold/15 text-gold text-xs text-center rounded-lg mt-2 font-semibold">
            {importStatus}
          </div>
        )}

        <div className="drawer-profiles-list mt-3">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile?.id;
            return (
              <div 
                key={p.id}
                className={`drawer-profile-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectProfile(p);
                  onClose();
                }}
              >
                <div className="item-info">
                  <div className="item-name">
                    {p.name} {isActive && <span className="active-tag"><Check className="w-3 h-3 inline" /> Active</span>}
                  </div>
                  <div className="item-details">
                    Born {p.birthMonth}/{p.birthDay}/{p.birthYear} • {p.cityName} • <span className="tag-pill">{p.tag}</span>
                  </div>
                </div>

                {profiles.length > 1 && (
                  <button 
                    className="delete-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(p.id);
                    }}
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="drawer-footer mt-4">
          <button 
            className="btn btn-primary-glow w-full"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
          >
            <Plus className="w-5 h-5 mr-2" /> Add New Profile
          </button>
        </div>
      </div>
    </div>
  );
}
