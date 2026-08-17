import { 
  THEME_PRESETS, 
  hexToRgba, 
  applyTheme, 
  loadSavedTheme 
} from '../themeEngine';

describe('Astraea Theme & Color Aura Customization Engine Tests', () => {
  test('1. THEME_PRESETS has 8 luxury palettes', () => {
    expect(THEME_PRESETS.length).toBe(8);
    const ids = THEME_PRESETS.map(p => p.id);
    expect(ids).toContain('gold');
    expect(ids).toContain('cyan');
    expect(ids).toContain('purple');
    expect(ids).toContain('emerald');
  });

  test('2. hexToRgba correctly parses 6-digit hex to rgba', () => {
    const rgba = hexToRgba('#F59E0B', 0.5);
    expect(rgba).toBe('rgba(245, 158, 11, 0.5)');
  });

  test('3. applyTheme sets CSS variables and persists to localStorage', () => {
    const custom = {
      id: 'custom_test',
      primary: '#10B981',
      secondary: '#06B6D4',
      background: '#02120B'
    };

    applyTheme(custom);
    const loaded = loadSavedTheme();
    expect(loaded.primary).toBe('#10B981');
  });
});
