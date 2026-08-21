import { 
  detectDreamSymbols, 
  interpretDream
} from '../dreamInterpreterEngine';

describe('Astraea Astral Dream Interpreter Engine Tests', () => {
  const mockProfile = {
    id: 'test_patrice',
    name: 'Patrice',
    birthYear: 1990,
    birthMonth: 7,
    birthDay: 15,
    birthHour: 10,
    birthMinute: 30,
    cityName: 'Newton, NJ, USA',
    lat: 41.0582,
    lng: -74.7529
  };

  test('1. detectDreamSymbols identifies key esoteric symbols correctly', () => {
    const text = "I was flying over a vast ocean when a golden snake appeared near a stone castle door.";
    const symbols = detectDreamSymbols(text);

    expect(symbols.length).toBeGreaterThanOrEqual(3);
    const names = symbols.map(s => s.name);
    expect(names.some(n => n.includes('Flying'))).toBe(true);
    expect(names.some(n => n.includes('Water') || n.includes('Ocean'))).toBe(true);
    expect(names.some(n => n.includes('Snake'))).toBe(true);
  });

  test('2. detectDreamSymbols provides fallback if no symbols are mentioned', () => {
    const text = "Everything was blurry and strange.";
    const symbols = detectDreamSymbols(text);
    expect(symbols.length).toBeGreaterThanOrEqual(1);
  });

  test('3. interpretDream synthesizes complete analysis for Mystical dream', () => {
    const text = "I met a radiant star being in deep space who handed me a golden key.";
    const result = interpretDream(text, 'mystical', mockProfile);

    expect(result.id).toBeDefined();
    expect(result.primaryArchetype).toContain('Oracle');
    expect(result.prescription.hz).toBe(963);
    expect(result.synthesisMessage).toContain('Patrice');
    expect(result.astrologicalInsight).toContain('Moon in');
    expect(result.wakingRitual).toBeDefined();
    expect(result.dreamMantra).toBeDefined();
  });

  test('4. interpretDream handles Shadow & Nightmare vibes with 396 Hz Root Chakra remedy', () => {
    const text = "I was chased through dark woods and lost my teeth.";
    const result = interpretDream(text, 'shadow', mockProfile);

    expect(result.primaryArchetype).toContain('Shadow');
    expect(result.prescription.hz).toBe(396);
    expect(result.prescription.binauralBeat).toContain('Delta');
  });

  test('5. interpretDream handles Lucid & Conscious vibes with 741 Hz Third Eye remedy', () => {
    const text = "I realized I was dreaming and created a floating crystal city.";
    const result = interpretDream(text, 'lucid', mockProfile);

    expect(result.primaryArchetype).toContain('Sovereign');
    expect(result.prescription.hz).toBe(741);
  });
});
