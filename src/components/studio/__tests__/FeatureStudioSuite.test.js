import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FeatureStudioModal from '../FeatureStudioModal';
import { AIDanceEngine, DANCE_STYLES } from '../../../services/AIDanceEngine';
import { SPECIAL_EFFECTS_PRESETS } from '../../../services/AISpecialEffectsEngine';
import { StockMediaService } from '../../../services/StockMediaService';

describe('Hot, Beta & Free Feature Studio Suite', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  test('1. AIDanceEngine computes dance keypoints & styles correctly', () => {
    expect(DANCE_STYLES.length).toBeGreaterThanOrEqual(6);
    const pose = AIDanceEngine.calculateDancePose(2.5, 128, 'hip-hop', { subBass: 0.8, isKick: true });
    expect(pose).toBeDefined();
    expect(pose.pelvisY).toBeGreaterThanOrEqual(0);
    expect(typeof pose.leftArmAngle).toBe('number');
  });

  test('2. AISpecialEffectsEngine has full effect presets', () => {
    expect(SPECIAL_EFFECTS_PRESETS.length).toBeGreaterThanOrEqual(7);
    const bloomEffect = SPECIAL_EFFECTS_PRESETS.find(p => p.id === 'bloom-magic');
    expect(bloomEffect).toBeDefined();
    expect(bloomEffect.name).toContain('Bloom Magic');
  });

  test('3. StockMediaService searches stock videos & stock images by keywords', () => {
    const videoMatches = StockMediaService.searchStockFootage('sunset');
    expect(videoMatches.length).toBeGreaterThanOrEqual(1);

    const imageMatches = StockMediaService.searchStockImages('abstract');
    expect(imageMatches.length).toBeGreaterThanOrEqual(1);
  });

  test('4. FeatureStudioModal renders Hot, Beta, and Free tabs correctly', () => {
    act(() => {
      root.render(
        <FeatureStudioModal
          isOpen={true}
          onClose={() => {}}
          initialTab="music_video"
          project={{ artistName: 'Test' }}
        />
      );
    });

    expect(container.textContent).toContain('Astraea AI Studio Suite');
    expect(container.textContent).toContain('Music Video');
    expect(container.textContent).toContain('AI Video');
    expect(container.textContent).toContain('AI FX Presets');
    expect(container.textContent).toContain('Subject Ref (1-3)');
    expect(container.textContent).toContain('Dance Generator');
    expect(container.textContent).toContain('AI Shorts (9:16)');
    expect(container.textContent).toContain('Synced Lyrics');
    expect(container.textContent).toContain('100k+ Stock Media');
  });
});
