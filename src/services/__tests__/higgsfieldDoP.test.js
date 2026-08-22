// higgsfieldDoP.test.js - Unit tests for Higgsfield AI Cinema DoP Studio & Camera Physics
import { 
  AI_VIDEO_MODELS, 
  HIGGSFIELD_CAMERA_PATHS, 
  HIGGSFIELD_LENSES, 
  HIGGSFIELD_LIGHTING_RIGS, 
  HIGGSFIELD_VELOCITY_PRESETS 
} from '../../data/aiModels';
import { StoryDirector } from '../StoryDirector';
import { VideoGenerator } from '../VideoGenerator';

describe('Higgsfield AI Cinema DoP Suite', () => {
  test('higgsfield_dop model is registered with Director of Photography badge', () => {
    const higgsfieldModel = AI_VIDEO_MODELS.find(m => m.id === 'higgsfield_dop');
    expect(higgsfieldModel).toBeDefined();
    expect(higgsfieldModel.badge).toBe('DIRECTOR OF PHOTOGRAPHY');
    expect(higgsfieldModel.provider).toBe('Higgsfield AI');
    expect(higgsfieldModel.motionMode).toBe('higgsfield-orbit-360');
  });

  test('all 6 core Higgsfield DoP camera paths are defined', () => {
    expect(HIGGSFIELD_CAMERA_PATHS.length).toBeGreaterThanOrEqual(6);
    const pathIds = HIGGSFIELD_CAMERA_PATHS.map(p => p.id);
    expect(pathIds).toContain('higgsfield-orbit-360');
    expect(pathIds).toContain('higgsfield-vertigo-dolly');
    expect(pathIds).toContain('higgsfield-fpv-drone');
    expect(pathIds).toContain('higgsfield-crane-pedestal');
    expect(pathIds).toContain('higgsfield-crash-zoom');
    expect(pathIds).toContain('higgsfield-tracking-dolly');
  });

  test('Higgsfield cinematic lenses are defined with valid filters and aspect ratios', () => {
    expect(HIGGSFIELD_LENSES.length).toBeGreaterThanOrEqual(4);
    const lensIds = HIGGSFIELD_LENSES.map(l => l.id);
    expect(lensIds).toContain('anamorphic-239');
    expect(lensIds).toContain('imax-70mm');
    expect(lensIds).toContain('kodak-35mm');
    expect(lensIds).toContain('fisheye-wide');

    HIGGSFIELD_LENSES.forEach(lens => {
      expect(lens.filter).toBeDefined();
      expect(lens.aspect).toBeDefined();
    });
  });

  test('Higgsfield studio lighting rigs are configured with hex colors', () => {
    expect(HIGGSFIELD_LIGHTING_RIGS.length).toBeGreaterThanOrEqual(4);
    HIGGSFIELD_LIGHTING_RIGS.forEach(rig => {
      expect(rig.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('Higgsfield motion velocity curves include bullet-time and speed-ramp', () => {
    const velocityIds = HIGGSFIELD_VELOCITY_PRESETS.map(v => v.id);
    expect(velocityIds).toContain('bullet-time');
    expect(velocityIds).toContain('speed-ramp');
    expect(velocityIds).toContain('audio-pulse');
  });

  test('StoryDirector incorporates Higgsfield camera moves into generated screenplays', () => {
    const songInfo = {
      title: 'Neon Horizon',
      bpm: 130,
      duration: 30,
      lyrics: '[00:00.00] Intro beat\\n[00:06.00] First verse line\\n[00:12.00] Chorus drop\\n[00:18.00] Final outro',
    };

    const screenplay = StoryDirector.generateScreenplay(songInfo, [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    ]);

    expect(screenplay).toBeDefined();
    expect(screenplay.scenes.length).toBeGreaterThanOrEqual(4);
    expect(screenplay.scenes[0].cameraMove).toBeDefined();
  });

  test('VideoGenerator initializes with Higgsfield DoP camera settings', () => {
    const project = {
      selectedVideoModel: 'higgsfield_dop',
      motionMode: 'higgsfield-vertigo-dolly',
      renderStyle: 'photoreal',
    };

    const generator = new VideoGenerator(project, {
      motionMode: 'higgsfield-vertigo-dolly',
      motionIntensity: 120,
    });

    expect(generator.settings.motionMode).toBe('higgsfield-vertigo-dolly');
    expect(generator.settings.motionIntensity).toBe(120);
  });
});
