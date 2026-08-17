import React, { useState, useEffect } from 'react';
import { fetchVideoGenerators } from '../services/VideoServerClient';

export default function VideoGeneratorSelector({ onRendererSelect }) {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState('ai-neural');

  useEffect(() => {
    // Fetch available renderer options from the local server
    fetchVideoGenerators()
      .then((list) => setOptions(list))
      .catch(() => setOptions(['ai-neural']));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (onRendererSelect) onRendererSelect(val);
  };

  return (
    <div className="video-generator-selector glass-panel p-4 mb-4 rounded-xl">
      <label className="text-sm font-medium mr-2" htmlFor="renderer-select">
        Video Generator Engine:
      </label>
      <select
        id="renderer-select"
        value={selected}
        onChange={handleChange}
        className="bg-gray-800 text-white rounded px-2 py-1"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
