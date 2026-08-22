// atmosphereEngine.test.js - Unit tests for AtmosphereEngine
import { atmosphereEngine, ATMOSPHERE_MODES } from '../AtmosphereEngine';

describe('AtmosphereEngine', () => {
  test('ATMOSPHERE_MODES lists all environmental particle modes', () => {
    expect(ATMOSPHERE_MODES.length).toBeGreaterThanOrEqual(6);
    const modeIds = ATMOSPHERE_MODES.map(m => m.id);
    expect(modeIds).toContain('rain');
    expect(modeIds).toContain('embers');
    expect(modeIds).toContain('matrix');
    expect(modeIds).toContain('sakura');
    expect(modeIds).toContain('godrays');
  });

  test('atmosphereEngine initializes particle pools for each mode', () => {
    expect(atmosphereEngine).toBeDefined();
    expect(atmosphereEngine.rainDrops.length).toBeGreaterThan(0);
    expect(atmosphereEngine.embers.length).toBeGreaterThan(0);
    expect(atmosphereEngine.sakuraPetals.length).toBeGreaterThan(0);
  });
});
