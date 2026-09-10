import {
  COLOR_GRADE_PRESETS,
  TRANSITION_STYLES,
  INBETWEEN_ENGINES,
  SAMPLE_CLIP_SETS,
  prepareClipsForSubmission,
  startClipGapFilling,
  pollClipGapFillingStatus,
  extractClipKeyframes,
} from '../ClipInbetweenerService';

describe('ClipInbetweenerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('exports required presets and configuration matrices', () => {
    expect(COLOR_GRADE_PRESETS.length).toBeGreaterThanOrEqual(5);
    expect(COLOR_GRADE_PRESETS.some((p) => p.id === 'hollywood35')).toBe(true);
    expect(COLOR_GRADE_PRESETS.some((p) => p.id === 'cyberpunk')).toBe(true);

    expect(TRANSITION_STYLES.length).toBeGreaterThanOrEqual(4);
    expect(TRANSITION_STYLES.some((t) => t.id === 'smoothleft')).toBe(true);

    expect(INBETWEEN_ENGINES.length).toBeGreaterThanOrEqual(3);
    expect(INBETWEEN_ENGINES.some((e) => e.id === 'local_neural_flow')).toBe(true);

    expect(SAMPLE_CLIP_SETS.length).toBeGreaterThanOrEqual(2);
    expect(SAMPLE_CLIP_SETS[0].clips.length).toBeGreaterThanOrEqual(2);
  });

  test('prepareClipsForSubmission maps clip items and formats', async () => {
    const rawClips = [
      { url: 'https://example.com/clip1.mp4', title: 'Scene 1', duration: 10 },
      'https://example.com/clip2.mp4',
    ];

    const prepared = await prepareClipsForSubmission(rawClips);
    expect(prepared.length).toBe(2);
    expect(prepared[0].url).toBe('https://example.com/clip1.mp4');
    expect(prepared[0].title).toBe('Scene 1');
    expect(prepared[1].url).toBe('https://example.com/clip2.mp4');
    expect(prepared[1].title).toBe('Video Clip');
  });

  test('startClipGapFilling makes POST request to backend or falls back', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        jobId: 'job_test_123',
        status: 'QUEUED',
        stage: 'Job Initialized',
        clipsCount: 2,
        gapsCount: 1,
        gapDuration: 3.5,
        videoUrl: '/renders/seamless_master_test.mp4',
      }),
    });

    const res = await startClipGapFilling({
      clips: ['https://example.com/c1.mp4', 'https://example.com/c2.mp4'],
      gapDuration: 3.5,
      engine: 'local_neural_flow',
      colorGrade: 'hollywood35',
    });

    expect(res.success).toBe(true);
    expect(res.jobId).toBe('job_test_123');
    expect(res.gapsCount).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/clips/fill-gaps'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('startClipGapFilling falls back gracefully on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Offline'));

    const res = await startClipGapFilling({
      clips: ['https://example.com/c1.mp4', 'https://example.com/c2.mp4'],
      gapDuration: 4.0,
    });

    expect(res.success).toBe(true);
    expect(res.mode).toBe('mock');
    expect(res.jobId).toMatch(/^mock_/);
  });

  test('pollClipGapFillingStatus handles mock simulation', async () => {
    const progressUpdates = [];
    const result = await pollClipGapFillingStatus('mock_12345', (step) => {
      progressUpdates.push(step);
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPLETED');
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100);
  });

  test('extractClipKeyframes calls backend endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        keyframes: [
          { clipIndex: 0, headThumbnail: 'data:image/jpeg;base64,...', tailThumbnail: 'data:image/jpeg;base64,...' },
        ],
      }),
    });

    const res = await extractClipKeyframes(['https://example.com/c1.mp4']);
    expect(res.success).toBe(true);
    expect(res.keyframes.length).toBe(1);
  });
});
