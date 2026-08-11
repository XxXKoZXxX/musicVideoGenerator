import React, { useState } from 'react';
import { STORYLINE_TEMPLATES } from '../../data/templates';

export default function TemplateStoryline({ onSelected }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (selectedTemplate) {
    return (
      <div className="template-detail">
        <button
          className="back-link"
          onClick={() => setSelectedTemplate(null)}
        >
          ← Back to Templates
        </button>

        <h3>{selectedTemplate.name}</h3>
        <p className="template-mood">Mood: {selectedTemplate.mood}</p>

        <div className="template-preview">
          <h4>Story:</h4>
          <p>{selectedTemplate.description}</p>

          <h4 style={{ marginTop: '20px' }}>Timeline:</h4>
          <ul className="timeline">
            {selectedTemplate.scenes.map((scene, idx) => (
              <li key={idx}>
                <strong>Scene {idx + 1}:</strong> {scene}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="btn btn-primary btn-large"
          onClick={() => onSelected({ type: 'template', template: selectedTemplate })}
        >
          Use This Template
        </button>
      </div>
    );
  }

  return (
    <div className="templates-grid">
      {STORYLINE_TEMPLATES.map((template, idx) => (
        <button
          key={idx}
          className="template-card"
          onClick={() => setSelectedTemplate(template)}
        >
          <div className="template-header">
            <h4>{template.name}</h4>
            <span className="mood-badge">{template.mood}</span>
          </div>
          <p>{template.description.substring(0, 80)}...</p>
          <div className="scene-count">{template.scenes.length} scenes</div>
        </button>
      ))}
    </div>
  );
}
