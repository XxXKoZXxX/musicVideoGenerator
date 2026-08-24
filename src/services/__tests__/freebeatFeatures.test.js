import { SongStructureAnalyzer, SECTION_TYPES } from '../SongStructureAnalyzer';
import { CharacterLockEngine, CHARACTER_PERSONAS } from '../CharacterLockEngine';
import { ExternalAudioImportService } from '../ExternalAudioImportService';

describe('Freebeat.ai Core Features', () => {
  describe('SongStructureAnalyzer', () => {
    test('analyzes 32s track into music-aware sections with beat drops', () => {
      const structure = SongStructureAnalyzer.analyzeSongStructure(32, 128, 'Cyberpunk / Darksynth');
      expect(structure.sections.length).toBeGreaterThanOrEqual(4);
      expect(structure.bpm).toBe(128);
      expect(structure.duration).toBe(32);

      const hasDrop = structure.sections.some((s) => s.isDrop);
      expect(hasDrop).toBe(true);

      const chorus = structure.sections.find((s) => s.type === SECTION_TYPES.CHORUS);
      expect(chorus).toBeDefined();
      expect(chorus.energy).toBeGreaterThan(80);
    });

    test('getSectionAtTime returns correct section during playback', () => {
      const structure = SongStructureAnalyzer.analyzeSongStructure(32, 128);
      const introSec = SongStructureAnalyzer.getSectionAtTime(structure, 1);
      expect(introSec.type).toBe(SECTION_TYPES.INTRO);

      const dropSec = SongStructureAnalyzer.getSectionAtTime(structure, 18);
      expect(dropSec).toBeDefined();
      expect(dropSec.energy).toBeGreaterThanOrEqual(50);
    });

    test('isBeatDownbeat accurately checks downbeat intervals', () => {
      expect(SongStructureAnalyzer.isBeatDownbeat(0, 128)).toBe(true);
    });
  });

  describe('CharacterLockEngine (Anti-Drift)', () => {
    test('initializes with character personas and lock enabled', () => {
      const engine = new CharacterLockEngine();
      expect(engine.isCharacterLockEnabled).toBe(true);
      expect(CHARACTER_PERSONAS.length).toBeGreaterThanOrEqual(5);
    });

    test('generates consistency prompt preserving persona traits', () => {
      const engine = new CharacterLockEngine();
      engine.setPersona('kpop-star');
      const prompt = engine.generateConsistencyPrompt('Dancing on neon stage', 'sora_ai');
      expect(prompt).toContain('character consistency lock');
      expect(prompt).toContain('Min-Seo');
    });

    test('supports custom face reference anchor', () => {
      const engine = new CharacterLockEngine();
      engine.setCustomFace('https://custom.face/photo.jpg');
      const prompt = engine.generateConsistencyPrompt('Singing in rain', 'higgsfield_dop');
      expect(prompt).toContain('Face Reference Anchor');
    });
  });

  describe('ExternalAudioImportService', () => {
    test('parses Suno, Udio, and Spotify links', () => {
      const suno = ExternalAudioImportService.parseExternalLink('https://suno.com/song/12345');
      expect(suno.platform).toBe('suno');

      const udio = ExternalAudioImportService.parseExternalLink('https://udio.com/songs/67890');
      expect(udio.platform).toBe('udio');

      const spotify = ExternalAudioImportService.parseExternalLink('https://open.spotify.com/track/abc');
      expect(spotify.platform).toBe('spotify');
    });

    test('imports audio from link with structure and stem analysis', async () => {
      const result = await ExternalAudioImportService.importAudioFromUrl('https://suno.ai/song/neon-pulse');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.bpm).toBeGreaterThan(0);
      expect(result.structure).toBeDefined();
      expect(result.structure.sections.length).toBeGreaterThan(0);
    });
  });
});
