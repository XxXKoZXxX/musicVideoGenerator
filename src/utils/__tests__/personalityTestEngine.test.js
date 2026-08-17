import { 
  PERSONALITY_QUESTIONS, 
  PERSONALITY_ARCHETYPES, 
  calculatePersonalityResult 
} from '../personalityTestEngine';

describe('Astraea Personality & Soul Archetype Engine Tests', () => {
  test('1. PERSONALITY_QUESTIONS has 8 comprehensive questions', () => {
    expect(PERSONALITY_QUESTIONS.length).toBe(8);
    PERSONALITY_QUESTIONS.forEach(q => {
      expect(q.options.length).toBe(4);
      expect(q.question.length).toBeGreaterThan(10);
    });
  });

  test('2. PERSONALITY_ARCHETYPES contains all 4 elemental archetypes', () => {
    expect(PERSONALITY_ARCHETYPES.fire_primary).toBeDefined();
    expect(PERSONALITY_ARCHETYPES.water_primary).toBeDefined();
    expect(PERSONALITY_ARCHETYPES.air_primary).toBeDefined();
    expect(PERSONALITY_ARCHETYPES.earth_primary).toBeDefined();
  });

  test('3. calculatePersonalityResult accurately computes fire primary archetype', () => {
    // Select fire (option 0) for all questions
    const answers = {};
    PERSONALITY_QUESTIONS.forEach(q => {
      answers[q.id] = 0; // fire option
    });

    const result = calculatePersonalityResult(answers);
    expect(result.primaryElement).toBe('fire');
    expect(result.archetype.id).toBe('solar_alchemist');
    expect(result.percentages.fire).toBeGreaterThan(50);
  });

  test('4. calculatePersonalityResult accurately computes water primary archetype', () => {
    // Select water (option 1) for all questions
    const answers = {};
    PERSONALITY_QUESTIONS.forEach(q => {
      answers[q.id] = 1; // water option
    });

    const result = calculatePersonalityResult(answers);
    expect(result.primaryElement).toBe('water');
    expect(result.archetype.id).toBe('mystic_oracle');
    expect(result.percentages.water).toBeGreaterThan(50);
  });
});
