// renderStyles.test.js - Unit tests for RenderStyles
import { RENDER_STYLES, getRenderStyleById } from '../RenderStyles';

describe('RenderStyles Service', () => {
  test('RENDER_STYLES includes 10 rich visual aesthetics', () => {
    expect(RENDER_STYLES.length).toBeGreaterThanOrEqual(10);
    const styleIds = RENDER_STYLES.map(s => s.id);
    expect(styleIds).toContain('photoreal');
    expect(styleIds).toContain('anime');
    expect(styleIds).toContain('cyberpunk');
    expect(styleIds).toContain('vhs_retro');
    expect(styleIds).toContain('lofi_art');
    expect(styleIds).toContain('cgi_3d');
  });

  test('getRenderStyleById returns correct style object or photoreal fallback', () => {
    const cyberStyle = getRenderStyleById('cyberpunk');
    expect(cyberStyle).toBeDefined();
    expect(cyberStyle.id).toBe('cyberpunk');
    expect(cyberStyle.lutId).toBe('cyberpunk');

    const fallbackStyle = getRenderStyleById('non_existent_style_xyz');
    expect(fallbackStyle).toBeDefined();
    expect(fallbackStyle.id).toBe('photoreal');
  });

  test('each render style has defaultScenes and valid visualizer configuration', () => {
    RENDER_STYLES.forEach(style => {
      expect(Array.isArray(style.defaultScenes)).toBe(true);
      expect(style.defaultScenes.length).toBeGreaterThan(0);
      expect(style.visualizerStyle).toBeDefined();
      expect(style.visualizerColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
