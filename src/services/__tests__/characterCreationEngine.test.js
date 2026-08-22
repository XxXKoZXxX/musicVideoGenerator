// characterCreationEngine.test.js - Unit tests for CharacterCreationEngine
import {
  CharacterCreationEngine,
  characterCreationEngine,
  CHARACTER_ARCHETYPES,
  CHARACTER_EYE_COLORS,
  CHARACTER_HAIR_STYLES,
  CHARACTER_ACCESSORIES,
} from '../CharacterCreationEngine';

describe('CharacterCreationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new CharacterCreationEngine();
  });

  test('CHARACTER_ARCHETYPES defines 5 distinct cosmic character classes', () => {
    expect(CHARACTER_ARCHETYPES.length).toBe(5);
    const archIds = CHARACTER_ARCHETYPES.map((a) => a.id);
    expect(archIds).toContain('celestial-deity');
    expect(archIds).toContain('cyberpunk-android');
    expect(archIds).toContain('astral-sorceress');
    expect(archIds).toContain('urban-drill-rapper');
    expect(archIds).toContain('mythic-starlight-elf');
  });

  test('CHARACTER_EYE_COLORS and CHARACTER_ACCESSORIES are properly populated', () => {
    expect(CHARACTER_EYE_COLORS.length).toBeGreaterThanOrEqual(6);
    expect(CHARACTER_HAIR_STYLES.length).toBeGreaterThanOrEqual(5);
    expect(CHARACTER_ACCESSORIES.length).toBeGreaterThanOrEqual(5);
  });

  test('updateCharacter modifies character attributes', () => {
    engine.updateCharacter({
      name: 'Luna Astral',
      hairColor: '#ec4899',
      eyeColor: '#10b981',
    });

    expect(engine.character.name).toBe('Luna Astral');
    expect(engine.character.hairColor).toBe('#ec4899');
    expect(engine.character.eyeColor).toBe('#10b981');
  });

  test('renderCharacterFrame executes on canvas context without throwing', () => {
    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      beginPath: jest.fn(),
      arc: jest.fn(),
      ellipse: jest.fn(),
      rect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
    };

    expect(() => {
      engine.renderCharacterFrame(mockCtx, 500, 500, {
        viseme: 'AA',
        openness: 0.8,
        widthScale: 1.1,
        blinkFactor: 0.2,
        audioMetrics: { subBass: 0.5, masterEnergy: 0.6 },
        elapsed: 1.5,
      });
    }).not.toThrow();

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
