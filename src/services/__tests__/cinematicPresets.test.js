// src/services/__tests__/cinematicPresets.test.js
import {
  PLATFORM_PRESETS,
  COLOR_LOOKS,
  suggestLook,
  buildServerRenderOptions,
  defaultCinematicSettings,
} from '../CinematicPresets';

describe('CinematicPresets', () => {
  test('platform presets cover the major social platforms with valid aspect ratios', () => {
    const ids = PLATFORM_PRESETS.map((p) => p.id);
    ['tiktok', 'instagram', 'youtube', 'x', 'cinematic'].forEach((id) => expect(ids).toContain(id));
    PLATFORM_PRESETS.forEach((p) => {
      expect(['16:9', '9:16', '1:1', '4:5', '21:9']).toContain(p.aspectRatio);
      expect(['720p', '1080p', '4K']).toContain(p.resolution);
      expect(p.name.length).toBeGreaterThan(0);
    });
    const tiktok = PLATFORM_PRESETS.find((p) => p.id === 'tiktok');
    expect(tiktok.aspectRatio).toBe('9:16');
  });

  test('color look catalog matches the server catalog', () => {
    const ids = COLOR_LOOKS.map((l) => l.id);
    ['standard', 'cinematic', 'vintage', 'neon', 'noir', 'dreamy', 'vivid'].forEach((id) =>
      expect(ids).toContain(id)
    );
    expect(ids.length).toBeGreaterThanOrEqual(7);
  });

  test('suggestLook mirrors the server logic', () => {
    expect(suggestLook([])).toBe('cinematic');
    expect(
      suggestLook([
        { energy: 95, isDrop: true },
        { energy: 92, isDrop: true },
      ])
    ).toBe('neon');
    expect(suggestLook([{ energy: 30 }, { energy: 40 }])).toBe('dreamy');
    expect(suggestLook([{ energy: 70 }, { energy: 72 }])).toBe('vivid');
    expect(suggestLook([{ energy: 55 }])).toBe('cinematic');
  });

  test('buildServerRenderOptions maps StepFour settings to server options', () => {
    const settings = {
      resolution: '1080p',
      fps: 30,
      colorLook: 'noir',
      cineVignette: true,
      cineGrain: false,
      cineTransitions: true,
      cineBeatFlash: false,
      cineTimecode: true,
      cineLoudness: true,
      watermarkText: 'My Band',
    };
    const project = {
      songStructure: { sections: [{ start: 0, end: 4 }, { start: 4, end: 8 }] },
    };
    const opts = buildServerRenderOptions(settings, project);
    expect(opts).toEqual({
      resolution: '1080p',
      fps: 30,
      colorLook: 'noir',
      vignette: true,
      filmGrain: false,
      transitions: 'fade',
      beatFlash: false,
      watermarkText: 'My Band',
      timecode: true,
      loudnessNormalize: true,
      chapters: true,
    });
    // No song structure → chapters off
    expect(buildServerRenderOptions(settings, {}).chapters).toBe(false);
  });

  test('defaultCinematicSettings keeps sensible defaults (vignette+transitions+loudness on)', () => {
    const d = defaultCinematicSettings({});
    expect(d.colorLook).toBe('standard');
    expect(d.cineVignette).toBe(true);
    expect(d.cineTransitions).toBe(true);
    expect(d.cineBeatFlash).toBe(true);
    expect(d.cineLoudness).toBe(true);
    expect(d.cineGrain).toBe(false);
    expect(d.cineTimecode).toBe(false);
    expect(d.watermarkText).toBe('');
    // Project overrides win
    expect(defaultCinematicSettings({ colorLook: 'neon' }).colorLook).toBe('neon');
  });
});
