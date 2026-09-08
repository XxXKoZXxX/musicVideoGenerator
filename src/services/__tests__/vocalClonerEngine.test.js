// vocalClonerEngine.test.js - Unit tests for VocalClonerEngine
import { VocalClonerEngine, VOCAL_PRESETS, vocalClonerEngine } from '../VocalClonerEngine';

describe('VocalClonerEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new VocalClonerEngine();
  });

  test('VOCAL_PRESETS contains 6 unique vocal timbre and autotune profiles', () => {
    expect(VOCAL_PRESETS.length).toBeGreaterThanOrEqual(6);
    const presetIds = VOCAL_PRESETS.map((p) => p.id);
    expect(presetIds).toContain('celestial-oracle');
    expect(presetIds).toContain('cyber-android');
    expect(presetIds).toContain('trap-autotune');
    expect(presetIds).toContain('ethereal-siren');
    expect(presetIds).toContain('hyper-pop');
    expect(presetIds).toContain('vintage-tube');
  });

  test('each vocal preset has defined pitchShift, formantShift, and valid hex color', () => {
    VOCAL_PRESETS.forEach((preset) => {
      expect(typeof preset.pitchShift).toBe('number');
      expect(typeof preset.formantShift).toBe('number');
      expect(preset.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('singleton vocalClonerEngine instance is exported with initial cloned profile', () => {
    expect(vocalClonerEngine).toBeDefined();
    expect(vocalClonerEngine.clonedProfile).toBeDefined();
    expect(vocalClonerEngine.clonedProfile.f0).toBe(220);
    expect(Array.isArray(vocalClonerEngine.clonedProfile.formants)).toBe(true);
    expect(vocalClonerEngine.clonedProfile.formants.length).toBe(3);
  });

  test('synthesizeSingingLyrics handles singing invocation without error', () => {
    let visemeCaptured = null;
    expect(() => {
      engine.synthesizeSingingLyrics(
        'Astraea celestial vocal test',
        'celestial-oracle',
        (vData) => {
          visemeCaptured = vData;
        }
      );
    }).not.toThrow();
    expect(visemeCaptured).not.toBeNull();
  });
});
