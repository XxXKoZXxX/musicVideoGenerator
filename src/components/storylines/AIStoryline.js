import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateStorylineFromAudio } from '../../services/AIService';

export default function AIStoryline({ audio, onGenerated }) {
  const [storyline, setStoryline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editedText, setEditedText] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generateStorylineFromAudio(audio);
      setStoryline(generated);
      setEditedText(generated);
    } catch (err) {
      alert('Failed to generate storyline: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    handleGenerate();
  };

  const handleContinue = () => {
    onGenerated({
      type: 'ai-generated',
      content: editedText || storyline,
      original: storyline,
    });
  };

  return (
    <div className="storyline-container">
      {!storyline ? (
        <div className="generate-section">
          <div className="generate-icon">
            <Sparkles size={48} />
          </div>
          <h3>Generate AI Storyline</h3>
          <p>Claude will analyze your audio and create a unique, compelling storyline</p>
          <button
            className="btn btn-primary btn-large"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Storyline'}
          </button>
        </div>
      ) : (
        <div className="storyline-view">
          <div className="storyline-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleRegenerate}>
              <RefreshCw size={16} />
              Regenerate
            </button>
          </div>

          <div className="storyline-preview">
            <h4>Generated Storyline:</h4>
            <div className="original-text">{storyline}</div>
          </div>

          <div className="edit-section">
            <h4>Edit & Customize:</h4>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="You can edit the storyline here..."
              className="storyline-textarea"
            />
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleContinue}
          >
            Continue with This Storyline
          </button>
        </div>
      )}
    </div>
  );
}
