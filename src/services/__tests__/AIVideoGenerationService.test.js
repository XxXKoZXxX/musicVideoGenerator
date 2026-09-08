import {
  generateCustomVideo,
  getVideoJobStatus,
  AI_VIDEO_GEN_MODELS,
  SUPPORTED_ASPECT_RATIOS,
  SUPPORTED_DURATIONS,
} from '../AIVideoGenerationService';

describe('AIVideoGenerationService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('exports models, aspect ratios, and durations lists', () => {
    expect(Array.isArray(AI_VIDEO_GEN_MODELS)).toBe(true);
    expect(AI_VIDEO_GEN_MODELS.length).toBeGreaterThan(0);
    expect(Array.isArray(SUPPORTED_ASPECT_RATIOS)).toBe(true);
    expect(SUPPORTED_ASPECT_RATIOS.some(r => r.id === '16:9')).toBe(true);
    expect(Array.isArray(SUPPORTED_DURATIONS)).toBe(true);
  });

  test('generateCustomVideo throws error on empty prompt', async () => {
    await expect(generateCustomVideo({ prompt: '' })).rejects.toThrow(
      'Prompt is required for AI video generation.'
    );
    await expect(generateCustomVideo({ prompt: '   ' })).rejects.toThrow(
      'Prompt is required for AI video generation.'
    );
  });

  test('generateCustomVideo submits payload to /api/video/generate and returns response', async () => {
    const mockResponse = {
      success: true,
      mode: 'generating',
      jobId: 'job_test_123',
      model: 'runway_gen3',
      aspectRatio: '9:16',
      duration: '10',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await generateCustomVideo({
      prompt: 'Cinematic neon samurai in Tokyo rain',
      model: 'runway_gen3',
      aspectRatio: '9:16',
      duration: 10,
      negativePrompt: 'blurry, low quality',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = global.fetch.mock.calls[0];
    expect(calledUrl).toContain('/api/video/generate');
    expect(calledOptions.method).toBe('POST');
    const sentBody = JSON.parse(calledOptions.body);
    expect(sentBody.prompt).toBe('Cinematic neon samurai in Tokyo rain');
    expect(sentBody.model).toBe('runway_gen3');
    expect(sentBody.aspectRatio).toBe('9:16');
    expect(sentBody.duration).toBe('10');
    expect(sentBody.negativePrompt).toBe('blurry, low quality');
    expect(result.jobId).toBe('job_test_123');
  });

  test('generateCustomVideo returns offline fallback when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network offline'));

    const result = await generateCustomVideo({
      prompt: 'Astraea cosmic portal',
      model: 'kling_ai',
      aspectRatio: '16:9',
      duration: 5,
    });

    expect(result.success).toBe(true);
    expect(result.mode).toBe('fallback');
    expect(result.videoUrl).toBeDefined();
    expect(result.jobId).toMatch(/job_\d+_offline/);
  });

  test('getVideoJobStatus returns status data when fetch succeeds', async () => {
    const mockStatus = {
      success: true,
      jobId: 'job_456',
      status: 'COMPLETED',
      videoUrl: 'https://storage.googleapis.com/test.mp4',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockStatus),
    });

    const result = await getVideoJobStatus('job_456');
    expect(result.status).toBe('COMPLETED');
    expect(result.videoUrl).toBe('https://storage.googleapis.com/test.mp4');
  });

  test('getVideoJobStatus handles missing jobId', async () => {
    const result = await getVideoJobStatus('');
    expect(result.success).toBe(false);
    expect(result.error).toBe('jobId is required');
  });
});
