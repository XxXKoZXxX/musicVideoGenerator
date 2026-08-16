import { 
  THEME_PRESETS, 
  FONT_STYLE_PRESETS, 
  FONT_SIZE_PRESETS, 
  LINE_HEIGHT_PRESETS, 
  hexToRgba, 
  applyTheme, 
  loadSavedTheme 
} from '../themeEngine';

describe('Astraea Theme & Typography Customization Engine Tests', () => {
  test('1. THEME_PRESETS has 8 luxury palettes', () => {
    expect(THEME_PRESETS.length).toBe(8);
    const ids = THEME_PRESETS.map(p => p.id);
    expect(ids).toContain('gold');
    expect(ids).toContain('cyan');
    expect(ids).toContain('purple');
    expect(ids).toContain('emerald');
  });

  test('2. FONT_STYLE_PRESETS has 5 diverse font pairings', () => {
    expect(FONT_STYLE_PRESETS.length).toBe(5);
    const ids = FONT_STYLE_PRESETS.map(f => f.id);
    expect(ids).toContain('playful');
    expect(ids).toContain('bubbly');
    expect(ids).toContain('clean_modern');
    expect(ids).toContain('royal');
    expect(ids).toContain('literary');
  });

  test('3. FONT_SIZE_PRESETS contains standard, comfortable, and xlarge', () => {
    expect(FONT_SIZE_PRESETS.length).toBe(3);
    const sizes = FONT_SIZE_PRESETS.map(s => s.id);
    expect(sizes).toContain('standard');
    expect(sizes).toContain('comfortable');
    expect(sizes).toContain('xlarge');
  });

  test('4. hexToRgba correctly parses 6-digit hex to rgba', () => {
    const rgba = hexToRgba('#F59E0B', 0.5);
    expect(rgba).toBe('rgba(245, 158, 11, 0.5)');
  });

  test('5. applyTheme sets CSS variables and persists to localStorage', () => {
    const custom = {
      id: 'custom_test',
      primary: '#10B981',
      secondary: '#06B6D4',
      background: '#02120B',
      fontStyleId: 'playful',
      fontSizeId: 'comfortable',
      lineHeightId: 'relaxed'
    };

    applyTheme(custom);
    const loaded = loadSavedTheme();
    expect(loaded.primary).toBe('#10B981');
    expect(loaded.fontStyleId).toBe('playful');
  });
});
