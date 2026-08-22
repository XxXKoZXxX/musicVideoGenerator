// lipSyncEngine.test.js - Unit tests for LipSyncEngine
import { LipSyncEngine, lipSyncEngine } from '../LipSyncEngine';

describe('LipSyncEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new LipSyncEngine();
  });

  test('extractViseme returns REST when there is no vocal energy', () => {
    const metrics = { masterEnergy: 0.02, mids: 0.04, highs: 0.02, subBass: 0.1 };
    const visemeData = engine.extractViseme(metrics);

    expect(visemeData.viseme).toBe('REST');
    expect(visemeData.openness).toBeLessThan(0.1);
  });

  test('extractViseme returns active visemes (AA/EE/OH/CONSONANT) during high vocal power', () => {
    const vocalMetrics = {
      masterEnergy: 0.45,
      mids: 0.55,
      highs: 0.35,
      subBass: 0.4,
    };
    const visemeData = engine.extractViseme(vocalMetrics);

    expect(['AA', 'EE', 'OH', 'CONSONANT']).toContain(visemeData.viseme);
    expect(visemeData.openness).toBeGreaterThan(0.2);
    expect(visemeData.widthScale).toBeGreaterThan(0.7);
  });

  test('getBlinkFactor computes smooth natural eyelid blink factor between 0.0 and 1.0', () => {
    const blink0 = engine.getBlinkFactor(0);
    expect(blink0).toBeGreaterThanOrEqual(0.0);
    expect(blink0).toBeLessThanOrEqual(1.0);

    const blink10 = engine.getBlinkFactor(10);
    expect(blink10).toBeGreaterThanOrEqual(0.0);
    expect(blink10).toBeLessThanOrEqual(1.0);
  });

  test('singleton lipSyncEngine instance is exported and functional', () => {
    expect(lipSyncEngine).toBeDefined();
    expect(typeof lipSyncEngine.extractViseme).toBe('function');
  });
});
