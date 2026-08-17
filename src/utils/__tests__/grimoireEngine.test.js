import { 
  getWordOfTheDay, 
  MASTER_QUOTES, 
  PLANETARY_METALS, 
  MAGNUM_OPUS_STAGES,
  SOUL_CONNECTION_TYPES,
  TANTRIC_ENERGY_POLARITIES,
  SPELLCRAFT_ENCYCLOPEDIA,
  GODS_AND_GODDESSES,
  SPIRIT_REALM_GUIDES,
  SPIRITUAL_PROTECTION_GRIMOIRE,
  PALMISTRY_LINES,
  REFLEXOLOGY_ZONES,
  PRANAYAMA_BREATHWORK_SUITE,
  SOUL_TYPES_AND_STARSEEDS,
  calculateVitalityMatrix,
  SPIRITUAL_BANISHING_SUITE,
  SUPERSTITIONS_ENCYCLOPEDIA
} from '../grimoireEngine';

describe('Astraea Grand Occult Grimoire Engine Tests', () => {
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

  test('1. getWordOfTheDay returns a valid esoteric term and daily practice', () => {
    const word = getWordOfTheDay();
    expect(word).toBeDefined();
    expect(word.word).toBeDefined();
    expect(word.meaning).toBeDefined();
    expect(word.practice).toBeDefined();
  });

  test('2. MASTER_QUOTES covers Socrates, Buddha, Jung, Freud, and Aristotle', () => {
    const authors = MASTER_QUOTES.map(q => q.author);
    expect(authors).toContain('Socrates');
    expect(authors).toContain('Gautama Buddha');
    expect(authors).toContain('Carl Jung');
    expect(authors).toContain('Sigmund Freud');
    expect(authors).toContain('Aristotle');
  });

  test('3. PLANETARY_METALS includes all 7 sacred metals', () => {
    expect(PLANETARY_METALS.length).toBe(7);
    const metals = PLANETARY_METALS.map(m => m.metal);
    expect(metals.some(m => m.includes('Gold'))).toBe(true);
    expect(metals.some(m => m.includes('Silver'))).toBe(true);
    expect(metals.some(m => m.includes('Lead'))).toBe(true);
  });

  test('4. SPELLCRAFT_ENCYCLOPEDIA includes spell jars, poppets, and mojo bags', () => {
    expect(SPELLCRAFT_ENCYCLOPEDIA.length).toBeGreaterThanOrEqual(4);
    const types = SPELLCRAFT_ENCYCLOPEDIA.map(s => s.type);
    expect(types.some(t => t.includes('Jar'))).toBe(true);
    expect(types.some(t => t.includes('Poppet'))).toBe(true);
    expect(types.some(t => t.includes('Mojo'))).toBe(true);
  });

  test('5. GODS_AND_GODDESSES covers Greek, Egyptian, and Norse pantheons', () => {
    expect(GODS_AND_GODDESSES.length).toBe(3);
    const names = GODS_AND_GODDESSES.flatMap(g => g.deities.map(d => d.name));
    expect(names.some(n => n.includes('Apollo'))).toBe(true);
    expect(names.some(n => n.includes('Isis'))).toBe(true);
    expect(names.some(n => n.includes('Odin'))).toBe(true);
  });

  test('6. calculateVitalityMatrix produces valid lifespan and vitality score', () => {
    const vitality = calculateVitalityMatrix(mockProfile, {
      planets: {
        Sun: { zodiac: { sign: 'Cancer', element: 'Water' } },
        Moon: { zodiac: { sign: 'Aries', element: 'Fire' } }
      }
    });

    expect(vitality.vitalityScore).toBeGreaterThanOrEqual(80);
    expect(vitality.estimatedSpan).toBeGreaterThanOrEqual(75);
    expect(vitality.vitalityPillars.length).toBe(3);
  });

  test('7. PRANAYAMA_BREATHWORK_SUITE contains 4 major breathing methods', () => {
    expect(PRANAYAMA_BREATHWORK_SUITE.length).toBe(4);
    const names = PRANAYAMA_BREATHWORK_SUITE.map(p => p.name);
    expect(names.some(n => n.includes('Nadi Shodhana'))).toBe(true);
    expect(names.some(n => n.includes('Kapalabhati'))).toBe(true);
    expect(names.some(n => n.includes('Box Breathing'))).toBe(true);
  });

  test('8. SPIRITUAL_BANISHING_SUITE contains 6 banishing protocols and 5 protective chants', () => {
    expect(SPIRITUAL_BANISHING_SUITE.methods.length).toBe(6);
    expect(SPIRITUAL_BANISHING_SUITE.chants.length).toBe(5);
    const methodIds = SPIRITUAL_BANISHING_SUITE.methods.map(m => m.id);
    expect(methodIds).toContain('smoke');
    expect(methodIds).toContain('salt');
    expect(methodIds).toContain('sound');
    expect(methodIds).toContain('candle');
  });

  test('9. SUPERSTITIONS_ENCYCLOPEDIA contains 12 superstitions with origins and reality verdicts', () => {
    expect(SUPERSTITIONS_ENCYCLOPEDIA.length).toBe(12);
    SUPERSTITIONS_ENCYCLOPEDIA.forEach(s => {
      expect(s.name).toBeDefined();
      expect(s.origin).toBeDefined();
      expect(s.verdict).toBeDefined();
      expect(s.truthLikelihood).toBeDefined();
    });
  });
});
