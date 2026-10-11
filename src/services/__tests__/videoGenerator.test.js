import { VideoGenerator, RESOLUTION_PRESETS, ASPECT_RATIOS } from '../VideoGenerator';

describe('VideoGenerator Frame & Export Tests', () => {
  test('calculates correct even frame dimensions for 16:9 1080p', () => {
    const generator = new VideoGenerator(null, {
      resolution: '1080p',
      aspectRatio: '16:9',
    });

    const { width, height } = generator.getFrameSize();
    expect(width).toBe(1920);
    expect(height).toBe(1080);
    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });

  test('calculates correct even frame dimensions for 9:16 vertical video', () => {
    const generator = new VideoGenerator(null, {
      resolution: '1080p',
      aspectRatio: '9:16',
    });

    const { width, height } = generator.getFrameSize();
    expect(width).toBe(1080);
    expect(height).toBe(1920);
    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });

  test('calculates even dimensions for 1:1 square ratio', () => {
    const generator = new VideoGenerator(null, {
      resolution: '1080p',
      aspectRatio: '1:1',
    });

    const { width, height } = generator.getFrameSize();
    expect(width).toBe(1080);
    expect(height).toBe(1080);
    expect(width % 2).toBe(0);
    expect(height % 2).toBe(0);
  });

  test('calculates even dimensions for 4:5 and 21:9 across presets', () => {
    const ratios = Object.keys(ASPECT_RATIOS);
    const presets = Object.keys(RESOLUTION_PRESETS);

    for (const ratio of ratios) {
      for (const preset of presets) {
        const generator = new VideoGenerator(null, {
          resolution: preset,
          aspectRatio: ratio,
        });

        const { width, height } = generator.getFrameSize();
        expect(typeof width).toBe('number');
        expect(typeof height).toBe('number');
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(width % 2).toBe(0);
        expect(height % 2).toBe(0);
      }
    }
  });

  test('provides exportVideo method that does not crash on getFrameSize', () => {
    const generator = new VideoGenerator(null, {
      resolution: '720p',
      aspectRatio: '16:9',
    });

    expect(typeof generator.exportVideo).toBe('function');
    expect(typeof generator.getFrameSize).toBe('function');
  });
});
