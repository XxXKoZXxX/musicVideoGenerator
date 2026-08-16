// Dynamic Theme, Color & Typography Customization Engine for Astraea

export const THEME_PRESETS = [
  {
    id: 'gold',
    name: 'Celestial Gold',
    icon: '✨',
    desc: 'Original ancient alchemy & solar radiance',
    primary: '#F59E0B',
    secondary: '#06B6D4',
    glow: 'rgba(245, 158, 11, 0.4)',
    background: '#060814',
    panelBg: 'rgba(10, 15, 30, 0.88)',
    panelBorder: 'rgba(245, 158, 11, 0.28)',
    accentGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  },
  {
    id: 'cyan',
    name: 'Cosmic Cyan',
    icon: '🌌',
    desc: 'Electric neon starlight & deep space',
    primary: '#06B6D4',
    secondary: '#A855F7',
    glow: 'rgba(6, 182, 212, 0.45)',
    background: '#030712',
    panelBg: 'rgba(8, 20, 38, 0.88)',
    panelBorder: 'rgba(6, 182, 212, 0.3)',
    accentGradient: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)'
  },
  {
    id: 'purple',
    name: 'Royal Amethyst',
    icon: '🔮',
    desc: 'Third-eye mystic violet & crown chakra',
    primary: '#A855F7',
    secondary: '#EC4899',
    glow: 'rgba(168, 85, 247, 0.45)',
    background: '#090314',
    panelBg: 'rgba(20, 10, 36, 0.88)',
    panelBorder: 'rgba(168, 85, 247, 0.3)',
    accentGradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)'
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    icon: '💖',
    desc: 'Unconditional love & heart chakra velvet',
    primary: '#F43F5E',
    secondary: '#F59E0B',
    glow: 'rgba(244, 63, 94, 0.45)',
    background: '#10040A',
    panelBg: 'rgba(30, 10, 20, 0.88)',
    panelBorder: 'rgba(244, 63, 94, 0.3)',
    accentGradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
  },
  {
    id: 'emerald',
    name: 'Emerald Alchemist',
    icon: '🌿',
    desc: 'Sacred healing green & Gaia vitality',
    primary: '#10B981',
    secondary: '#06B6D4',
    glow: 'rgba(16, 185, 129, 0.45)',
    background: '#02120B',
    panelBg: 'rgba(6, 26, 18, 0.88)',
    panelBorder: 'rgba(16, 185, 129, 0.3)',
    accentGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    icon: '🔥',
    desc: 'Fiery amber prana & sunset passion',
    primary: '#FB923C',
    secondary: '#F43F5E',
    glow: 'rgba(251, 146, 60, 0.45)',
    background: '#120602',
    panelBg: 'rgba(28, 12, 6, 0.88)',
    panelBorder: 'rgba(251, 146, 60, 0.3)',
    accentGradient: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)'
  },
  {
    id: 'sapphire',
    name: 'Sapphire Ocean',
    icon: '🌊',
    desc: 'Deep lunar water & intuitive tranquility',
    primary: '#3B82F6',
    secondary: '#06B6D4',
    glow: 'rgba(59, 130, 246, 0.45)',
    background: '#020B1A',
    panelBg: 'rgba(8, 20, 44, 0.88)',
    panelBorder: 'rgba(59, 130, 246, 0.3)',
    accentGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
  },
  {
    id: 'monochrome',
    name: 'Obsidian Silver',
    icon: '💎',
    desc: 'Platinum minimalism & pure obsidian void',
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    glow: 'rgba(226, 232, 240, 0.35)',
    background: '#040508',
    panelBg: 'rgba(15, 18, 26, 0.88)',
    panelBorder: 'rgba(226, 232, 240, 0.25)',
    accentGradient: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)'
  }
];

export const FONT_STYLE_PRESETS = [
  {
    id: 'playful',
    name: 'Playful & Friendly (Default)',
    icon: '✨',
    desc: 'Quicksand rounded bubbly headers + warm friendly Nunito body',
    headingFont: "'Quicksand', 'Nunito', sans-serif",
    bodyFont: "'Quicksand', 'Nunito', sans-serif"
  },
  {
    id: 'bubbly',
    name: 'Bubbly & Cheerful',
    icon: '🎈',
    desc: 'Fredoka soft playful headers + Comfortaa bouncy curves',
    headingFont: "'Fredoka', 'Comfortaa', cursive",
    bodyFont: "'Nunito', sans-serif"
  },
  {
    id: 'clean_modern',
    name: 'Modern & Vibrant',
    icon: '🌈',
    desc: 'Outfit modern geometric headers + Plus Jakarta Sans crisp body',
    headingFont: "'Outfit', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'royal',
    name: 'Royal Esoteric',
    icon: '👑',
    desc: 'Cinzel classical royal serif headers + Jakarta sans',
    headingFont: "'Cinzel', serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'literary',
    name: 'Classic Storybook',
    icon: '📚',
    desc: 'Lora literary book serif + friendly reading body',
    headingFont: "'Lora', serif",
    bodyFont: "'Nunito', sans-serif"
  }
];

export const FONT_SIZE_PRESETS = [
  { id: 'standard', name: 'Standard', sizePx: '15px', scale: '1' },
  { id: 'comfortable', name: 'Comfortable (17px)', sizePx: '17px', scale: '1.12' },
  { id: 'xlarge', name: 'Extra Large (19px)', sizePx: '19px', scale: '1.25' }
];

export const LINE_HEIGHT_PRESETS = [
  { id: 'compact', name: 'Compact (1.55)', value: '1.55' },
  { id: 'relaxed', name: 'Relaxed (1.75)', value: '1.75' },
  { id: 'spacious', name: 'Spacious (1.95)', value: '1.95' }
];

export function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;

  // Colors
  const primary = theme.primary || '#F59E0B';
  const secondary = theme.secondary || '#06B6D4';
  const glow = theme.glow || hexToRgba(primary, 0.4);
  const background = theme.background || '#060814';
  const panelBg = theme.panelBg || 'rgba(10, 15, 30, 0.88)';
  const panelBorder = theme.panelBorder || hexToRgba(primary, 0.28);

  root.style.setProperty('--gold', primary);
  root.style.setProperty('--gold-glow', glow);
  root.style.setProperty('--cyan', secondary);
  root.style.setProperty('--bg-dark', background);
  root.style.setProperty('--panel-bg', panelBg);
  root.style.setProperty('--panel-border', panelBorder);

  // Typography Settings
  const fontPreset = FONT_STYLE_PRESETS.find(f => f.id === theme.fontStyleId) || FONT_STYLE_PRESETS[0];
  const sizePreset = FONT_SIZE_PRESETS.find(s => s.id === theme.fontSizeId) || FONT_SIZE_PRESETS[0];
  const linePreset = LINE_HEIGHT_PRESETS.find(l => l.id === theme.lineHeightId) || LINE_HEIGHT_PRESETS[1];

  root.style.setProperty('--font-serif', fontPreset.headingFont);
  root.style.setProperty('--font-sans', fontPreset.bodyFont);
  root.style.setProperty('--base-font-size', sizePreset.sizePx);
  root.style.setProperty('--base-line-height', linePreset.value);

  // Apply to body directly
  document.body.style.fontFamily = fontPreset.bodyFont;
  document.body.style.fontSize = sizePreset.sizePx;
  document.body.style.lineHeight = linePreset.value;

  try {
    localStorage.setItem('astraea_theme_config', JSON.stringify(theme));
  } catch (e) {}
}

export function loadSavedTheme() {
  try {
    const saved = localStorage.getItem('astraea_theme_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      applyTheme(parsed);
      return parsed;
    }
  } catch (e) {}
  
  const defaultTheme = {
    ...THEME_PRESETS[0],
    fontStyleId: 'playful',
    fontSizeId: 'standard',
    lineHeightId: 'relaxed'
  };
  applyTheme(defaultTheme);
  return defaultTheme;
}
