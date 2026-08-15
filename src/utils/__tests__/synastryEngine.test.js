import {
  getAspect,
  getNumerologyHarmonicScore,
  getElementalAlchemy,
  getHouseFromAscendant,
  calculateHouseOverlays,
  generateCommunicationAndIntimacyAdvice,
  generateConflictResolutionProtocol,
  calculateCompositeChart,
  evaluateTwinFlameTest,
  calculateFullDualComparison,
  TWIN_FLAME_DIAGNOSTIC_QUESTIONS
} from '../synastryEngine';

describe('Dual-Person Synastry & Twin Flame Calculation Engine', () => {
  const mockProfileA = {
    id: 'user_a',
    name: 'Patrice',
    birthYear: 1990,
    birthMonth: 7,
    birthDay: 15,
    birthHour: 10,
    birthMinute: 30,
    cityName: 'Newton, NJ, USA',
    lat: 41.0582,
    lng: -74.7529,
    tag: 'Self'
  };

  const mockProfileB = {
    id: 'user_b',
    name: 'Luna',
    birthYear: 1993,
    birthMonth: 11,
    birthDay: 20,
    birthHour: 18,
    birthMinute: 45,
    cityName: 'New York, NY, USA',
    lat: 40.7128,
    lng: -74.0060,
    tag: 'Partner'
  };

  test('1. Aspect calculations compute exact angles and classifications', () => {
    const conj = getAspect(10, 12);
    expect(conj.type).toBe('conjunction');
    expect(conj.bonus).toBe(28);

    const opp = getAspect(0, 180);
    expect(opp.type).toBe('magnetic');
    expect(opp.name).toContain('Opposition');

    const trine = getAspect(30, 150);
    expect(trine.type).toBe('harmonious');
    expect(trine.name).toContain('Trine');

    const square = getAspect(0, 90);
    expect(square.type).toBe('challenging');
    expect(square.name).toContain('Square');

    const sextile = getAspect(10, 70);
    expect(sextile.type).toBe('harmonious');
    expect(sextile.name).toContain('Sextile');
  });

  test('2. Numerology harmonic families calculate correct resonance', () => {
    // Identical life paths
    const twinLp = getNumerologyHarmonicScore(7, 7);
    expect(twinLp.score).toBe(98);

    // Master numbers
    const masterLp = getNumerologyHarmonicScore(11, 4);
    expect(masterLp.score).toBe(94);

    // Mind family (1-5-7)
    const mindFam = getNumerologyHarmonicScore(1, 5);
    expect(mindFam.score).toBe(92);
  });

  test('3. Elemental alchemy pairs compute correct synergy', () => {
    const fireAir = getElementalAlchemy('Fire', 'Air');
    expect(fireAir.score).toBe(96);

    const earthWater = getElementalAlchemy('Earth', 'Water');
    expect(earthWater.score).toBe(95);

    const twinWater = getElementalAlchemy('Water', 'Water');
    expect(twinWater.score).toBe(95);
  });

  test('4. House overlay calculations project planets into equal houses accurately', () => {
    // 0 deg planet with 0 deg ascendant -> 1st house
    expect(getHouseFromAscendant(0, 0)).toBe(1);
    // 35 deg planet with 0 deg ascendant -> 2nd house
    expect(getHouseFromAscendant(35, 0)).toBe(2);
    // 185 deg planet with 0 deg ascendant -> 7th house
    expect(getHouseFromAscendant(185, 0)).toBe(7);
  });

  test('5. Communication and Intimacy advice differentiates two distinct people clearly', () => {
    const advice = generateCommunicationAndIntimacyAdvice('Patrice', 'Virgo', 'Cancer', 'Luna', 'Gemini', 'Pisces');
    expect(advice).toContain('Patrice');
    expect(advice).toContain('Luna');
    expect(advice).toContain('Virgo');
    expect(advice).toContain('Gemini');
    expect(advice).toContain('Cancer');
    expect(advice).toContain('Pisces');
    expect(advice).not.toBe('');
  });

  test('6. Conflict resolution protocol produces clear triggers and antidotes', () => {
    const comparison = calculateFullDualComparison(mockProfileA, mockProfileB);
    expect(comparison.conflictProtocol.trigger).toBeDefined();
    expect(comparison.conflictProtocol.antidote).toBeDefined();
    expect(comparison.conflictProtocol.aspectNote).toBeDefined();
  });

  test('7. Composite chart calculates midpoint signs and composite life path', () => {
    const comparison = calculateFullDualComparison(mockProfileA, mockProfileB);
    expect(comparison.compositeChart.sunSign).toBeDefined();
    expect(comparison.compositeChart.moonSign).toBeDefined();
    expect(comparison.compositeChart.risingSign).toBeDefined();
    expect(comparison.compositeChart.compositeLifePath).toBeGreaterThanOrEqual(1);
    expect(comparison.compositeChart.compositeLifePath).toBeLessThanOrEqual(9);
  });

  test('8. Interactive Twin Flame Diagnostic Quiz evaluates correctly', () => {
    const comparison = calculateFullDualComparison(mockProfileA, mockProfileB);
    const mockAnswers = {
      telepathy: 25,
      synchronicities: 25,
      shadowMirror: 25,
      kundaliniEnergy: 25,
      soulMission: 25
    };

    const evaluation = evaluateTwinFlameTest(mockAnswers, comparison);
    expect(evaluation.score).toBeGreaterThanOrEqual(85);
    expect(evaluation.stage).toBeDefined();
    expect(evaluation.prescription).toBeDefined();
    expect(TWIN_FLAME_DIAGNOSTIC_QUESTIONS.length).toBe(5);
  });

  test('9. Complete dual comparison returns all multi-subject data and 6 markers', () => {
    const comparison = calculateFullDualComparison(mockProfileA, mockProfileB);
    
    // Scores
    expect(comparison.scores.overall).toBeGreaterThanOrEqual(50);
    expect(comparison.scores.twinFlame).toBeGreaterThanOrEqual(50);
    expect(comparison.twinFlame.markers.length).toBe(6);

    // House overlays
    expect(comparison.houseOverlays.aInB.length).toBeGreaterThan(0);
    expect(comparison.houseOverlays.bInA.length).toBeGreaterThan(0);

    // Cross aspects
    expect(comparison.astrology.aspects.length).toBeGreaterThanOrEqual(7);

    // Secret language & numerology
    expect(comparison.secretLanguage.personA).toBeDefined();
    expect(comparison.secretLanguage.personB).toBeDefined();
    expect(comparison.numerology.personA).toBeDefined();
    expect(comparison.numerology.personB).toBeDefined();
    expect(comparison.tarot.personA).toBeDefined();
    expect(comparison.karma.personA).toBeDefined();
  });
});
