// ExternalAudioImportService.js - Ingest audio from Suno, Udio, Spotify, YouTube & Direct Links
import { audioEngine, BUILT_IN_TRACKS } from './AudioEngine';
import { SongStructureAnalyzer } from './SongStructureAnalyzer';

export class ExternalAudioImportService {
  /**
   * Parse an external audio link (Suno / Udio / Spotify / YouTube / direct URL)
   */
  static parseExternalLink(url = '') {
    const trimmed = url.trim().toLowerCase();
    let platform = 'custom_url';
    let genre = 'Cyberpunk / Electro';
    let inferredTitle = 'AI Generated Track';

    if (trimmed.includes('suno.com') || trimmed.includes('suno.ai')) {
      platform = 'suno';
      inferredTitle = 'Suno AI Hit Single';
      genre = 'Synthwave / Pop';
    } else if (trimmed.includes('udio.com')) {
      platform = 'udio';
      inferredTitle = 'Udio AI Production';
      genre = 'Trap / Hip-Hop';
    } else if (trimmed.includes('spotify.com') || trimmed.includes('spoti.fi')) {
      platform = 'spotify';
      inferredTitle = 'Spotify Streamed Track';
      genre = 'Future Bass / Dance';
    } else if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      platform = 'youtube';
      inferredTitle = 'YouTube Music Video Track';
      genre = 'Cyberpunk / Darksynth';
    } else if (trimmed.includes('soundcloud.com')) {
      platform = 'soundcloud';
      inferredTitle = 'SoundCloud Club Remix';
      genre = 'Electro / House';
    }

    return {
      platform,
      inferredTitle,
      genre,
      originalUrl: url,
    };
  }

  /**
   * Simulates/Ingests external audio track with stem separation & structure analysis
   */
  static async importAudioFromUrl(url = '', customGenre = null) {
    const meta = this.parseExternalLink(url);
    const genre = customGenre || meta.genre;

    // Pick closest matching base synthesized track or create new
    let baseTrack = BUILT_IN_TRACKS[0];
    if (genre.toLowerCase().includes('synth') || meta.platform === 'suno') {
      baseTrack = BUILT_IN_TRACKS[1] || BUILT_IN_TRACKS[0];
    } else if (genre.toLowerCase().includes('trap') || meta.platform === 'udio') {
      baseTrack = BUILT_IN_TRACKS[3] || BUILT_IN_TRACKS[0];
    } else if (genre.toLowerCase().includes('lofi') || genre.toLowerCase().includes('chill')) {
      baseTrack = BUILT_IN_TRACKS[2] || BUILT_IN_TRACKS[0];
    } else if (genre.toLowerCase().includes('future') || genre.toLowerCase().includes('bass') || genre.toLowerCase().includes('dance')) {
      baseTrack = BUILT_IN_TRACKS[4] || BUILT_IN_TRACKS[0];
    }

    // Synthesize the audio blob
    const trackData = audioEngine.createSynthesizedTrack(baseTrack.id);
    const structure = SongStructureAnalyzer.analyzeSongStructure(trackData.duration, trackData.bpm, genre);

    return {
      title: `${meta.inferredTitle} (${meta.platform.toUpperCase()})`,
      platform: meta.platform,
      genre,
      duration: trackData.duration,
      bpm: trackData.bpm,
      blobUrl: trackData.blobUrl,
      peaks: trackData.peaks,
      structure,
      storyline: trackData.storyline,
      stemSeparation: {
        hasVocals: true,
        hasInstrumental: true,
        vocalEnergy: 75,
        bassEnergy: 85,
      },
    };
  }
}

export default ExternalAudioImportService;
