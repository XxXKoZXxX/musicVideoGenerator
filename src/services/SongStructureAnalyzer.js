// SongStructureAnalyzer.js - Music-Aware Structure, Beat Detection & Energy Segmentation

export const SECTION_TYPES = {
  INTRO: 'Intro',
  VERSE: 'Verse',
  PRE_CHORUS: 'Pre-Chorus',
  CHORUS: 'Chorus / Drop',
  VERSE_2: 'Verse 2',
  BRIDGE: 'Bridge',
  CLIMAX: 'Climax / Final Drop',
  OUTRO: 'Outro',
};

export const SECTION_COLORS = {
  [SECTION_TYPES.INTRO]: '#64748b',
  [SECTION_TYPES.VERSE]: '#3b82f6',
  [SECTION_TYPES.PRE_CHORUS]: '#8b5cf6',
  [SECTION_TYPES.CHORUS]: '#f43f5e',
  [SECTION_TYPES.VERSE_2]: '#0ea5e9',
  [SECTION_TYPES.BRIDGE]: '#d946ef',
  [SECTION_TYPES.CLIMAX]: '#ff0055',
  [SECTION_TYPES.OUTRO]: '#6b7280',
};

export class SongStructureAnalyzer {
  /**
   * Generates a structured musical breakdown of a track based on duration, BPM, and genre
   */
  static analyzeSongStructure(duration = 32, bpm = 128, genre = 'Cyberpunk / Electro') {
    let sections = [];

    if (duration <= 20) {
      // Short preview (15-20s)
      sections = [
        {
          id: 'sec-1',
          type: SECTION_TYPES.INTRO,
          start: 0,
          end: Math.round(duration * 0.25 * 10) / 10,
          energy: 35,
          cameraDirective: 'Slow Dolly In / Ambient Establishing Shot',
          visualEffect: 'Subtle Fog & Soft Glow',
          isDrop: false,
          mood: 'Anticipation',
        },
        {
          id: 'sec-2',
          type: SECTION_TYPES.CHORUS,
          start: Math.round(duration * 0.25 * 10) / 10,
          end: Math.round(duration * 0.75 * 10) / 10,
          energy: 95,
          cameraDirective: 'Rapid Dynamic Zoom & Bass Shake Pulse',
          visualEffect: 'Strobe Flash & Audio-Reactive Lasers',
          isDrop: true,
          mood: 'Peak Energy',
        },
        {
          id: 'sec-3',
          type: SECTION_TYPES.OUTRO,
          start: Math.round(duration * 0.75 * 10) / 10,
          end: duration,
          energy: 40,
          cameraDirective: 'Crane Pull-Out & Soft Dissolve',
          visualEffect: 'Floating Particles & Gradient Fade',
          isDrop: false,
          mood: 'Resolution',
        },
      ];
    } else if (duration <= 35) {
      // Standard studio track (30-35s)
      const t1 = Math.round(duration * 0.15 * 10) / 10;
      const t2 = Math.round(duration * 0.35 * 10) / 10;
      const t3 = Math.round(duration * 0.50 * 10) / 10;
      const t4 = Math.round(duration * 0.75 * 10) / 10;
      const t5 = Math.round(duration * 0.88 * 10) / 10;

      sections = [
        {
          id: 'sec-1',
          type: SECTION_TYPES.INTRO,
          start: 0,
          end: t1,
          duration: t1,
          energy: 30,
          cameraDirective: 'Slow Dolly In / Atmospheric Establishing',
          visualEffect: 'Volumetric Smoke & Soft Bokeh',
          isDrop: false,
          mood: 'Atmospheric Hook',
        },
        {
          id: 'sec-2',
          type: SECTION_TYPES.VERSE,
          start: t1,
          end: t2,
          duration: Math.round((t2 - t1) * 10) / 10,
          energy: 55,
          cameraDirective: 'Medium Character Tracking Pan / Lip-Sync Focus',
          visualEffect: 'Neon Rim Lighting & Edge Glow',
          isDrop: false,
          mood: 'Story & Character Intimacy',
        },
        {
          id: 'sec-3',
          type: SECTION_TYPES.PRE_CHORUS,
          start: t2,
          end: t3,
          duration: Math.round((t3 - t2) * 10) / 10,
          energy: 75,
          cameraDirective: 'Rising Low-Angle Pan & Dutch Tilt Buildup',
          visualEffect: 'Accelerating Speed Lines & Light Streaks',
          isDrop: false,
          mood: 'Tension & Acceleration',
        },
        {
          id: 'sec-4',
          type: SECTION_TYPES.CHORUS,
          start: t3,
          end: t4,
          duration: Math.round((t4 - t3) * 10) / 10,
          energy: 98,
          cameraDirective: 'Hyper Zoom In + Bass Shake + 360 Orbit',
          visualEffect: 'Explosive Particle Bursts & Laser Sweeps',
          isDrop: true,
          mood: 'Maximum Climax & Beat Sync',
        },
        {
          id: 'sec-5',
          type: SECTION_TYPES.BRIDGE,
          start: t4,
          end: t5,
          duration: Math.round((t5 - t4) * 10) / 10,
          energy: 60,
          cameraDirective: 'Dreamy Slow-Motion Glide / Close-Up Expression',
          visualEffect: 'Holographic Distortion & Anamorphic Flares',
          isDrop: false,
          mood: 'Emotional Transition',
        },
        {
          id: 'sec-6',
          type: SECTION_TYPES.OUTRO,
          start: t5,
          end: duration,
          duration: Math.round((duration - t5) * 10) / 10,
          energy: 35,
          cameraDirective: 'High Drone Pull-Back & Fade to Black',
          visualEffect: 'Starfield Rain & Dissolving Silhouette',
          isDrop: false,
          mood: 'Cinematic Finale',
        },
      ];
    } else {
      // Extended track (45-120s+)
      const secCount = 7;
      const step = duration / secCount;
      const types = [
        SECTION_TYPES.INTRO,
        SECTION_TYPES.VERSE,
        SECTION_TYPES.PRE_CHORUS,
        SECTION_TYPES.CHORUS,
        SECTION_TYPES.VERSE_2,
        SECTION_TYPES.CLIMAX,
        SECTION_TYPES.OUTRO,
      ];
      const energies = [30, 55, 75, 95, 65, 100, 35];

      sections = types.map((type, i) => {
        const start = Math.round(i * step * 10) / 10;
        const end = Math.round((i + 1) * step * 10) / 10;
        const isDrop = type === SECTION_TYPES.CHORUS || type === SECTION_TYPES.CLIMAX;
        return {
          id: `sec-${i + 1}`,
          type,
          start,
          end: i === secCount - 1 ? duration : end,
          duration: Math.round(((i === secCount - 1 ? duration : end) - start) * 10) / 10,
          energy: energies[i] || 50,
          cameraDirective: isDrop
            ? 'Hyper-Dynamic Orbit & Beat Drop Punch'
            : 'Smooth Tracking Glide & Character Sync',
          visualEffect: isDrop
            ? 'Strobe Flash, Bass Shockwave & Laser Grid'
            : 'Volumetric Haze & Cyber Rim Lights',
          isDrop,
          mood: isDrop ? 'Peak Excitement' : 'Narrative & Melody',
        };
      });
    }

    const drops = sections.filter((s) => s.isDrop);
    const dropCuePoints = drops.map((d) => d.start);

    return {
      duration,
      bpm,
      genre,
      sections,
      dropCuePoints,
      averageEnergy: Math.round(sections.reduce((a, b) => a + b.energy, 0) / sections.length),
    };
  }

  /**
   * Given current timestamp, find the active song section
   */
  static getSectionAtTime(structure, time = 0) {
    if (!structure?.sections || structure.sections.length === 0) {
      return {
        type: SECTION_TYPES.CHORUS,
        energy: 80,
        cameraDirective: 'Dynamic Motion',
        isDrop: false,
      };
    }
    const found = structure.sections.find((s) => time >= s.start && time < s.end);
    return found || structure.sections[structure.sections.length - 1];
  }

  /**
   * Determine if current timestamp coincides with a beat downbeat or drop pulse
   */
  static isBeatDownbeat(time, bpm = 128, tolerance = 0.05) {
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;
    const timeInBar = time % barDuration;
    return timeInBar < tolerance || Math.abs(timeInBar - barDuration) < tolerance;
  }
}

export default SongStructureAnalyzer;
