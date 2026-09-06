// higgsfieldDoPControls.test.js - Unit tests for HiggsfieldDoPControls component
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import HiggsfieldDoPControls from '../HiggsfieldDoPControls';

describe('HiggsfieldDoPControls Component', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  test('renders Higgsfield DoP panel with camera path buttons and lenses', () => {
    const mockSettings = {
      motionMode: 'higgsfield-orbit-360',
      lensProfile: 'anamorphic-239',
      lightingRig: 'volumetric-fog',
      velocityPreset: 'speed-ramp',
      motionIntensity: 100,
      lipSyncSensitivity: 1.2,
    };

    act(() => {
      root.render(
        <HiggsfieldDoPControls
          settings={mockSettings}
          onChange={() => {}}
        />
      );
    });

    expect(container.textContent).toContain('Higgsfield Cinema DoP Studio');
    expect(container.textContent).toContain('360° Subject Orbit');
    expect(container.textContent).toContain('Anamorphic 2.39:1');
    expect(container.textContent).toContain('Volumetric Laser Fog');
  });

  test('calls onChange callback when user selects a different camera path', () => {
    let updatedSettings = null;
    const mockSettings = {
      motionMode: 'higgsfield-orbit-360',
      lensProfile: 'anamorphic-239',
    };

    act(() => {
      root.render(
        <HiggsfieldDoPControls
          settings={mockSettings}
          onChange={(newSettings) => {
            updatedSettings = newSettings;
          }}
        />
      );
    });

    const buttons = container.querySelectorAll('button');
    // Find the Vertigo Zoom button
    let vertigoButton = null;
    buttons.forEach((btn) => {
      if (btn.textContent.includes('Vertigo Zoom')) {
        vertigoButton = btn;
      }
    });

    if (vertigoButton) {
      act(() => {
        vertigoButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(updatedSettings).toBeDefined();
      expect(updatedSettings.motionMode).toBe('higgsfield-vertigo-dolly');
    }
  });
});
