import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function CustomStoryline({ onCustom }) {
  const [scenes, setScenes] = useState(['']);
  const [overallStory, setOverallStory] = useState('');

  const addScene = () => {
    setScenes([...scenes, '']);
  };

  const removeScene = (idx) => {
    if (scenes.length > 1) {
      setScenes(scenes.filter((_, i) => i !== idx));
    }
  };

  const updateScene = (idx, text) => {
    const newScenes = [...scenes];
    newScenes[idx] = text;
    setScenes(newScenes);
  };

  const handleContinue = () => {
    const filledScenes = scenes.filter((s) => s.trim());
    if (filledScenes.length === 0) {
      alert('Please write at least one scene');
      return;
    }

    onCustom({
      type: 'custom',
      overallStory,
      scenes: filledScenes,
    });
  };

  return (
    <div className="custom-storyline">
      <div className="story-section">
        <h4>Overall Story (optional)</h4>
        <textarea
          value={overallStory}
          onChange={(e) => setOverallStory(e.target.value)}
          placeholder="Describe the overall narrative, mood, or concept..."
          className="storyline-textarea"
          rows={4}
        />
      </div>

      <div className="scenes-section">
        <h4>Individual Scenes</h4>
        <p className="hint">Each scene will be paired with one of your images</p>

        {scenes.map((scene, idx) => (
          <div key={idx} className="scene-input">
            <label>Scene {idx + 1}</label>
            <div className="scene-field">
              <textarea
                value={scene}
                onChange={(e) => updateScene(idx, e.target.value)}
                placeholder={`Describe what happens in scene ${idx + 1}...`}
                className="scene-textarea"
                rows={3}
              />
              {scenes.length > 1 && (
                <button
                  className="remove-scene"
                  onClick={() => removeScene(idx)}
                  title="Remove scene"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="btn btn-secondary" onClick={addScene}>
          <Plus size={16} />
          Add Scene
        </button>
      </div>

      <button
        className="btn btn-primary btn-large"
        onClick={handleContinue}
      >
        Continue with Custom Story
      </button>
    </div>
  );
}
