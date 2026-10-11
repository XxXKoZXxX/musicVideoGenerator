// src/components/views/AgentWorkspaceView.js — full-page Opus Agent
// workspace (same console as the drawer, Opus-Pro style page layout).

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import OpusAgentAssistantDrawer from '../common/OpusAgentAssistantDrawer';
import '../../styles/OpusAgentDrawer.css';
import '../../styles/AgentWorkspace.css';

export default function AgentWorkspaceView({ project, onUpdateProject, onApplyScenes, onNavigate }) {
  return (
    <div className="agent-workspace">
      <div className="aw-head">
        <div className="aw-title">
          <span className="aw-orb"><Bot size={18} /></span>
          <div>
            <h2>Opus Agent <em>Workspace</em></h2>
            <p>
              <Sparkles size={11} /> An autonomous director with real tools — it writes original lyrics,
              renders original videos, monitors jobs and delivers masters. Everything it says, it does.
            </p>
          </div>
        </div>
        <div className="aw-hints">
          <span>“write a synthwave song about neon rain and make the video”</span>
          <span>“vertical 1080p karaoke captions”</span>
          <span>“show my renders”</span>
        </div>
      </div>

      <div className="aw-console-wrap">
        <OpusAgentAssistantDrawer
          isOpen
          variant="page"
          onClose={() => {}}
          project={project}
          onUpdateProject={onUpdateProject}
          onApplyScenes={onApplyScenes}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
