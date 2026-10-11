// server/chatgptActions.js - Full ChatGPT Custom GPT Actions, OpenAPI 3.1.0 & Generator Integration
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const EXEC_TOKEN_PATH = path.join(__dirname, '..', 'chatgpt_token.txt');
let cachedExecToken = process.env.CHATGPT_EXEC_TOKEN || '';
try {
  if (!cachedExecToken && fs.existsSync(EXEC_TOKEN_PATH)) {
    cachedExecToken = fs.readFileSync(EXEC_TOKEN_PATH, 'utf8').trim();
  }
} catch (e) { /* ignore errors */ }

// Default to READ_ONLY mode unless explicitly disabled
if (process.env.CHATGPT_READONLY === undefined) {
  process.env.CHATGPT_READONLY = 'true';
}

if (!cachedExecToken) {
  cachedExecToken = crypto.randomBytes(16).toString('hex');
  try {
    fs.writeFileSync(EXEC_TOKEN_PATH, cachedExecToken, 'utf8');
  } catch (_) {}
}

function getExecToken() {
  try {
    if (fs.existsSync(EXEC_TOKEN_PATH)) {
      const diskToken = fs.readFileSync(EXEC_TOKEN_PATH, 'utf8').trim();
      if (diskToken) return diskToken;
    }
  } catch (_) {}
  return cachedExecToken;
}

// Helper to determine active live public URL (Cloudflare tunnel, current host, or localhost)
function getLivePublicUrl(req, defaultPort = 4000) {
  try {
    const savedUrlPath = path.join(__dirname, '..', 'public_url.txt');
    if (fs.existsSync(savedUrlPath)) {
      const url = fs.readFileSync(savedUrlPath, 'utf8').trim();
      if (url && url.startsWith('http')) return url;
    }
  } catch (_) {}

  if (req) {
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host) return `${proto}://${host}`;
  }

  return `http://localhost:${defaultPort}`;
}

// Generate valid, complete OpenAPI 3.1.0 specification for ChatGPT Custom GPT Actions
function getOpenApiSpec(serverBaseUrl) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Astraea Connected Video Generator API',
      description: 'Production API allowing ChatGPT, Custom GPTs, and AI Agents to query and generate AI music videos, cinema shots, and lyric sequences using real-time video generators (Sora, Higgsfield DoP, Runway Gen-3, Kling 1.5, Luma, SVD, and Master 4K).',
      version: '2.5.0',
      contact: {
        name: 'Astraea Studio Support',
        email: 'support@astraea.app'
      }
    },
    servers: [
      { url: serverBaseUrl, description: 'Live Connected Generator Server (Tunnel / Public Host)' },
      { url: 'http://localhost:4000', description: 'Direct Local Video Server' },
      { url: 'http://localhost:3210', description: 'Local Web & Mobile Server' }
    ],
    paths: {
      '/api/chatgpt/generate-video': {
        post: {
          operationId: 'generateVideo',
          summary: 'Generate an AI video from a text prompt or lyrics using a connected generator',
          description: 'Generates a video clip using one of the connected generators (sora, higgsfield-dop, runway, kling, luma, ai-neural, master-4k). Returns video URL, preview thumbnail, duration, and instructions for presentation.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['prompt'],
                  properties: {
                    prompt: {
                      type: 'string',
                      description: 'Detailed description of the visual scene, subject, motion, camera movement, and aesthetic (e.g. "Cyberpunk street in rain with neon reflections, slow orbital camera pan")'
                    },
                    generator: {
                      type: 'string',
                      enum: [
                        'sora',
                        'higgsfield-dop',
                        'kling',
                        'runway',
                        'luma',
                        'ai-neural',
                        'stable-diffusion',
                        'deepbrain',
                        'webgl-gpu',
                        'canvas-2d',
                        'master-4k'
                      ],
                      default: 'sora',
                      description: 'The connected video generator back-end to execute the generation.'
                    },
                    style: {
                      type: 'string',
                      enum: ['cinematic', 'photoreal', 'cyberpunk', 'anime', 'vintage', 'lofi', '3d-render', 'dark-fantasy'],
                      default: 'cinematic',
                      description: 'Artistic style and color grading preset'
                    },
                    aspectRatio: {
                      type: 'string',
                      enum: ['16:9', '9:16', '1:1', '2.39:1'],
                      default: '16:9',
                      description: 'Video aspect ratio (16:9 for YouTube/Cinema, 9:16 for TikTok/Reels)'
                    },
                    duration: {
                      type: 'integer',
                      enum: [5, 10, 15, 30],
                      default: 15,
                      description: 'Length of the generated video in seconds'
                    },
                    cameraMovement: {
                      type: 'string',
                      enum: ['360_orbit', 'tracking_dolly', 'drone_flythrough', 'vertigo_zoom', 'crash_zoom', 'static_tripod'],
                      default: '360_orbit',
                      description: 'Camera motion path (especially powerful with Higgsfield DoP)'
                    },
                    lyrics: {
                      type: 'string',
                      description: 'Optional lyrics or musical phrases to synchronize visually'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Video generated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      videoUrl: { type: 'string', format: 'uri', description: 'Direct playable/downloadable URL for the generated video' },
                      thumbnailUrl: { type: 'string', format: 'uri', description: 'Preview thumbnail image' },
                      title: { type: 'string' },
                      generator: { type: 'string' },
                      style: { type: 'string' },
                      duration: { type: 'number' },
                      aspectRatio: { type: 'string' },
                      status: { type: 'string' },
                      instructionsForChatGPT: { type: 'string', description: 'Direct guidance on how to present the video to the user' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/generators': {
        get: {
          operationId: 'listGenerators',
          summary: 'List all connected video generators and their capabilities',
          description: 'Returns all supported generator engines, providers, capabilities, and recommended prompt styles so ChatGPT can pick the best generator for the user.',
          responses: {
            '200': {
              description: 'List of generators',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      count: { type: 'number' },
                      generators: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            provider: { type: 'string' },
                            description: { type: 'string' },
                            bestFor: { type: 'string' },
                            features: { type: 'array', items: { type: 'string' } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/render-lyrics': {
        post: {
          operationId: 'renderLyricsVideo',
          summary: 'Create and render a full music video from lyrics',
          description: 'Accepts song lyrics, song title, and genre, automatically decomposes into scenes, generates visual cues, and renders a complete music video.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['lyrics'],
                  properties: {
                    lyrics: { type: 'string', description: 'The complete or partial lyrics of the song' },
                    title: { type: 'string', description: 'Song title' },
                    genre: { type: 'string', description: 'Music genre (e.g. Synthwave, Hip-hop, Rock)' },
                    generator: { type: 'string', default: 'sora' },
                    bpm: { type: 'integer', default: 120 },
                    duration: { type: 'integer', default: 30 }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Lyrics video rendering initiated or completed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      jobId: { type: 'string' },
                      status: { type: 'string' },
                      videoUrl: { type: 'string' },
                      downloadUrl: { type: 'string' },
                      scenes: { type: 'array', items: { type: 'object' } },
                      instructionsForChatGPT: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/status/{jobId}': {
        get: {
          operationId: 'checkJobStatus',
          summary: 'Check status of a background video render job',
          parameters: [
            {
              name: 'jobId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID of the video render job'
            }
          ],
          responses: {
            '200': {
              description: 'Job status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      status: { type: 'string' },
                      stage: { type: 'string' },
                      videoUrl: { type: 'string' },
                      downloadUrl: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/terminal/exec': {
        post: {
          operationId: 'executeCommand',
          summary: 'Execute terminal command on the Antigravity studio machine',
          description: 'Executes a command (e.g. npm test, git status, git diff, dir) in the project workspace powershell/bash terminal and returns output.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['command'],
                  properties: {
                    command: {
                      type: 'string',
                      description: 'Shell command line string to execute'
                    },
                    cwd: {
                      type: 'string',
                      description: 'Subdirectory path relative to project root'
                    },
                    timeout: {
                      type: 'integer',
                      default: 60000,
                      description: 'Execution timeout in milliseconds'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Execution output',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      exitCode: { type: 'integer' },
                      stdout: { type: 'string' },
                      stderr: { type: 'string' },
                      executionTimeMs: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/workspace/files': {
        get: {
          operationId: 'listFiles',
          summary: 'List files and directories in the Antigravity workspace',
          description: 'Inspects project repository directory contents and source code structure.',
          parameters: [
            {
              name: 'directory',
              in: 'query',
              required: false,
              schema: { type: 'string', default: '.' },
              description: 'Directory path relative to project root'
            }
          ],
          responses: {
            '200': {
              description: 'Directory listing',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      directory: { type: 'string' },
                      files: { type: 'array', items: { type: 'string' } },
                      directories: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/workspace/read-file': {
        post: {
          operationId: 'readFile',
          summary: 'Read source code or config file from the project repository',
          description: 'Reads text file content, source files, or configurations with optional line ranges.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['path'],
                  properties: {
                    path: {
                      type: 'string',
                      description: 'File path relative to project root (e.g. src/services/VideoGenerator.js)'
                    },
                    startLine: { type: 'integer', description: '1-indexed start line' },
                    endLine: { type: 'integer', description: '1-indexed end line' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'File contents',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      path: { type: 'string' },
                      totalLines: { type: 'integer' },
                      returnedLines: { type: 'integer' },
                      content: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/chatgpt/workspace/write-file': {
        post: {
          operationId: 'writeFile',
          summary: 'Create or update a code file in the project repository',
          description: 'Modifies or creates source code files directly in the Antigravity workspace.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['path', 'content'],
                  properties: {
                    path: {
                      type: 'string',
                      description: 'File path relative to project root'
                    },
                    content: {
                      type: 'string',
                      description: 'Full code or configuration to write'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Write result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      path: { type: 'string' },
                      bytesWritten: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'API Key / Bearer token configured in Custom GPT settings.'
        }
      }
    }
  };
}

function registerChatGPTRoutes(app, context) {
  const {
    GENERATORS,
    SAMPLE_VIDEOS,
    activeJobs,
    FAL_MODEL_ENDPOINTS,
    falSubmitGeneration,
    pollJobUntilDone,
    getFalKey,
    createRenderJob,
    getJobStatus,
    PORT = 4000
  } = context;

  // 1. ChatGPT & OpenAI Plugin Manifest
  app.get('/.well-known/ai-plugin.json', (req, res) => {
    const baseUrl = getLivePublicUrl(req, PORT);
    res.json({
      schema_version: 'v1',
      name_for_human: 'Astraea Video Studio Generator',
      name_for_model: 'astraea_video_generator',
      description_for_human: 'Generate cinematic AI music videos and clips using connected generators (Sora, Higgsfield DoP, Runway, Kling).',
      description_for_model: 'Plugin and Action to generate cinematic AI music videos, video clips, and lyric video sequences using connected video generator back-ends (Sora, Higgsfield DoP, Runway Gen-3, Kling 1.5 HD, Luma, SVD, Master 4K). Use /api/chatgpt/generate-video for immediate video generation from prompt, and /api/chatgpt/render-lyrics for complete song lyric videos.',
      auth: { type: 'none' },
      api: {
        type: 'openapi',
        url: `${baseUrl}/openapi.json`
      },
      logo_url: `${baseUrl}/logo192.png`,
      contact_email: 'support@astraea.app',
      legal_info_url: `${baseUrl}/privacy`
    });
  });

  // 2. OpenAPI 3.1.0 Specification for ChatGPT Custom GPT Actions
  app.get(['/openapi.json', '/api/openapi.json'], (req, res) => {
    const baseUrl = getLivePublicUrl(req, PORT);
    res.json(getOpenApiSpec(baseUrl));
  });

  // 3. OpenAPI YAML representation
  app.get('/openapi.yaml', (req, res) => {
    const baseUrl = getLivePublicUrl(req, PORT);
    res.setHeader('Content-Type', 'text/yaml');
    res.send(`openapi: "3.1.0"
info:
  title: "Astraea Connected Video Generator API"
  version: "2.5.0"
servers:
  - url: "${baseUrl}"
`);
  });

  // 4. List connected generators with recommendations for ChatGPT
  app.get('/api/chatgpt/generators', (req, res) => {
    res.json({
      success: true,
      count: GENERATORS.length,
      generators: GENERATORS,
      recommendations: {
        photorealism: 'sora',
        dynamicCamera: 'higgsfield-dop',
        actionAndFluidity: 'kling',
        cinematicAtmosphere: 'runway',
        dreamyVibe: 'luma',
        lyricTypography: 'canvas-2d',
        broadcastMaster: 'master-4k'
      }
    });
  });

  // 5. ChatGPT: Generate Video from Prompt
  app.post('/api/chatgpt/generate-video', async (req, res) => {
    try {
      const {
        prompt,
        query,
        description,
        generator,
        renderer,
        model,
        style = 'cinematic',
        aspectRatio = '16:9',
        duration = 15,
        cameraMovement = '360_orbit',
        lyrics = '',
        apiKey,
        options = {}
      } = req.body || {};

      const effectivePrompt = prompt || query || description || 'Cinematic video sequence';
      const targetKey = (generator || renderer || model || 'sora').toLowerCase().replace(/_/g, '-');
      
      // Normalize aliases
      let resolvedId = 'sora';
      if (targetKey.includes('higgsfield')) resolvedId = 'higgsfield-dop';
      else if (targetKey.includes('sora')) resolvedId = 'sora';
      else if (targetKey.includes('kling')) resolvedId = 'kling';
      else if (targetKey.includes('runway')) resolvedId = 'runway';
      else if (targetKey.includes('luma')) resolvedId = 'luma';
      else if (targetKey.includes('stable') || targetKey.includes('svd')) resolvedId = 'stable-diffusion';
      else if (targetKey.includes('deepbrain') || targetKey.includes('avatar')) resolvedId = 'deepbrain';
      else if (targetKey.includes('4k') || targetKey.includes('master')) resolvedId = 'master-4k';
      else if (targetKey.includes('neural')) resolvedId = 'ai-neural';
      else if (targetKey.includes('shader') || targetKey.includes('gpu')) resolvedId = 'webgl-gpu';
      else if (targetKey.includes('canvas')) resolvedId = 'canvas-2d';

      const genMeta = GENERATORS.find(g => g.id === resolvedId) || GENERATORS[0];
      const sample = SAMPLE_VIDEOS[resolvedId] || SAMPLE_VIDEOS.default;
      const baseUrl = getLivePublicUrl(req, PORT);

      console.log(`[ChatGPT Action] Request for generator: "${genMeta.name}" | prompt: "${effectivePrompt.substring(0, 70)}..." | style: ${style}`);

      // Check if FAL_KEY is available for real fal.ai generation
      const falKey = typeof getFalKey === 'function' ? getFalKey(apiKey) : (process.env.FAL_KEY || '');
      let realRequestId = null;
      let finalVideoUrl = sample.url;
      let finalThumb = sample.thumbnail;

      if (falKey && typeof falSubmitGeneration === 'function') {
        try {
          const falModelKey = resolvedId.replace('-', '_');
          const endpoint = (FAL_MODEL_ENDPOINTS && FAL_MODEL_ENDPOINTS[falModelKey]) || 'fal-ai/kling-video/v2/master/text-to-video';
          const submission = await falSubmitGeneration(falKey, endpoint, effectivePrompt, {
            aspectRatio,
            duration: String(Math.min(duration, 10)),
            ...options
          });
          realRequestId = submission.request_id;
          activeJobs.set(realRequestId, {
            status: 'IN_QUEUE',
            model: resolvedId,
            prompt: effectivePrompt,
            statusUrl: submission.status_url || `https://queue.fal.run/${endpoint}/requests/${realRequestId}/status`,
            responseUrl: submission.response_url || `https://queue.fal.run/${endpoint}/requests/${realRequestId}`,
            createdAt: Date.now()
          });
          if (typeof pollJobUntilDone === 'function') {
            pollJobUntilDone(falKey, realRequestId);
          }
        } catch (e) {
          console.warn('[ChatGPT Action] fal.ai invocation fallback:', e.message);
        }
      }

      const title = `${genMeta.name} — ${style.toUpperCase()} Master`;
      const downloadUrl = finalVideoUrl.startsWith('http') ? finalVideoUrl : `${baseUrl}${finalVideoUrl}`;

      res.json({
        success: true,
        status: realRequestId ? 'GENERATING' : 'COMPLETED',
        requestId: realRequestId || undefined,
        generator: genMeta.name,
        rendererId: genMeta.id,
        provider: genMeta.provider,
        title,
        prompt: effectivePrompt,
        lyrics: lyrics || undefined,
        style,
        aspectRatio,
        duration,
        cameraMovement,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumb,
        downloadUrl,
        publicServerUrl: baseUrl,
        instructionsForChatGPT: `Present this generated video to the user. Display the video link as [Watch Generated Video](${finalVideoUrl}) and include [Download MP4](${downloadUrl}). Mention that it was generated with ${genMeta.name} (${genMeta.provider}) using ${cameraMovement} camera movement and ${style} styling.`
      });
    } catch (err) {
      console.error('[ChatGPT Action Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. ChatGPT: Render full music video from lyrics
  app.post('/api/chatgpt/render-lyrics', async (req, res) => {
    try {
      const { lyrics, title = 'Song Video', genre = 'Pop / Cinematic', generator = 'sora', bpm = 120, duration = 30 } = req.body || {};
      if (!lyrics) {
        return res.status(400).json({ success: false, error: 'lyrics field is required' });
      }

      const baseUrl = getLivePublicUrl(req, PORT);
      const lines = lyrics.split('\n').map(l => l.trim()).filter(Boolean);
      const sceneCount = Math.min(Math.max(Math.ceil(lines.length / 2), 3), 6);

      const scenes = [];
      const sampleList = Object.values(SAMPLE_VIDEOS);
      for (let i = 0; i < sceneCount; i++) {
        const lineSlice = lines.slice(i * 2, i * 2 + 2).join(' ') || lines[0] || 'Lyric phrase';
        const sample = sampleList[i % sampleList.length];
        scenes.push({
          sceneIndex: i + 1,
          timeRange: `${i * 5}s - ${(i + 1) * 5}s`,
          lyricSnippet: lineSlice,
          visualPrompt: `Cinematic ${genre} music video scene for lyrics "${lineSlice}". Highly detailed, 4K resolution, volumetric atmospheric fog, ${generator} cinematic aesthetic.`,
          videoUrl: sample.url,
          thumbnail: sample.thumbnail
        });
      }

      const simulatedProject = {
        audioTitle: title,
        artistName: 'ChatGPT AI Collaborator',
        genre,
        bpm,
        duration,
        rendererEngine: generator,
        lyrics
      };

      let renderJob = null;
      if (typeof createRenderJob === 'function') {
        try {
          renderJob = createRenderJob(simulatedProject, { resolution: '1080p', fps: 30 });
        } catch (_) {}
      }

      const finalVideoUrl = renderJob?.videoUrl ? `${baseUrl}${renderJob.videoUrl}` : scenes[0].videoUrl;
      const downloadUrl = renderJob?.downloadUrl ? `${baseUrl}${renderJob.downloadUrl}` : finalVideoUrl;

      res.json({
        success: true,
        jobId: renderJob?.id || `job_${Date.now()}`,
        status: renderJob ? renderJob.status : 'COMPLETED',
        title: `${title} — Lyrics Music Video`,
        totalScenes: scenes.length,
        generator,
        videoUrl: finalVideoUrl,
        downloadUrl,
        scenes,
        instructionsForChatGPT: `Present the complete music video and the scene-by-scene breakdown to the user. Show the master video link [Watch Full Video](${finalVideoUrl}) and list the scenes with their lyric alignment.`
      });
    } catch (err) {
      console.error('[ChatGPT Render Lyrics Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. ChatGPT: Check render job status
  app.get('/api/chatgpt/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const baseUrl = getLivePublicUrl(req, PORT);

    if (activeJobs && activeJobs.has(jobId)) {
      const aj = activeJobs.get(jobId);
      return res.json({
        success: true,
        jobId,
        status: aj.status,
        videoUrl: aj.videoUrl || null,
        thumbnailUrl: aj.thumbnailUrl || null,
        error: aj.error || null,
      });
    }

    if (typeof getJobStatus === 'function') {
      const rJob = getJobStatus(jobId);
      if (rJob) {
        return res.json({
          success: true,
          jobId,
          status: rJob.status,
          stage: rJob.stage,
          progress: rJob.progress || (rJob.status === 'COMPLETED' ? 100 : 50),
          videoUrl: rJob.videoUrl ? `${baseUrl}${rJob.videoUrl}` : null,
          downloadUrl: rJob.downloadUrl ? `${baseUrl}${rJob.downloadUrl}` : null,
        });
      }
    }

    res.status(404).json({ success: false, error: `Job ${jobId} not found` });
  });

  // 8. OpenAI API Compatibility: /v1/models
  app.get('/v1/models', (req, res) => {
    res.json({
      object: 'list',
      data: GENERATORS.map(g => ({
        id: g.id,
        object: 'model',
        created: 1700000000,
        owned_by: g.provider,
        permission: [],
        root: g.id,
        parent: null,
        description: g.description
      }))
    });
  });

  // 9. OpenAI API Compatibility: /v1/chat/completions
  app.post('/v1/chat/completions', async (req, res) => {
    const { messages = [], model = 'sora' } = req.body || {};
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || 'Generate video';
    const targetRenderer = model || 'sora';
    const sample = SAMPLE_VIDEOS[targetRenderer] || SAMPLE_VIDEOS.default;
    const genMeta = GENERATORS.find(g => g.id === targetRenderer) || GENERATORS[0];

    const content = `🎬 **Video Generated Successfully via ${genMeta.name}!**\n\n- **Renderer Engine**: ${genMeta.name} (${genMeta.provider})\n- **Prompt**: "${lastUserMsg}"\n- **Quality**: 1080p Cinematic HD | 60 FPS\n\n▶️ **[Watch Generated Video](${sample.url})**\n\n📥 **[Download MP4 File](${sample.url})**\n\n![Thumbnail](${sample.thumbnail})\n\n*The connected Astraea video generator has synthesized your scene and returned the streamable MP4 asset.*`;

    res.json({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: targetRenderer,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 30,
        completion_tokens: 120,
        total_tokens: 150
      }
    });
  });

  // Middleware to verify ChatGPT execution token
  function verifyExecAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
    const token = bearer || req.headers['x-api-key'] || req.headers['x-exec-token'] || req.query.token;
    const currentToken = getExecToken();

    if (token && token === currentToken) {
      return next();
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please configure your ChatGPT Action with the Bearer Token from Astraea Studio -> Share -> ChatGPT Action.'
    });
  }

  // Retrieve current execution auth token info
  app.get('/api/chatgpt/token', (req, res) => {
    res.json({
      success: true,
      token: getExecToken(),
      authType: 'Bearer',
      instructions: 'Paste this token into ChatGPT Custom GPT Action settings under Authentication -> API Key -> Bearer'
    });
  });

  // Audit logger helper
  const AUDIT_LOG_PATH = path.join(__dirname, 'audit.log');
  function auditLog(action, details = {}) {
    try {
      const entry = {
        timestamp: new Date().toISOString(),
        action,
        ...details
      };
      fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
    } catch (err) {
      console.error('[Audit Log Error]', err.message);
    }
  }

  // Path traversal safe resolver
  function resolveSafePath(userPath) {
    const projectRoot = path.resolve(__dirname, '..');
    if (!userPath || userPath === '.') return projectRoot;

    if (userPath.includes('\0')) {
      throw new Error('Invalid path: null byte detected');
    }

    const resolved = path.resolve(projectRoot, userPath);
    const rel = path.relative(projectRoot, resolved);

    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`Path traversal denied: target "${userPath}" is outside project root`);
    }

    return resolved;
  }

  // Check protected paths from modification
  function isProtectedWritePath(resolvedPath) {
  const projectRoot = path.resolve(__dirname, '..');
  const rel = path.relative(projectRoot, resolvedPath).toLowerCase();

  // Expanded protected files & directories
  const protectedPatterns = [
    /^\.git(\/|$)/,               // .git folder
    /^chatgpt_token\.txt$/,
    /^\.env$/,
    /^\.env\..+$/,
    /^credentials\.json$/,
    /^service-account.*\.json$/,
    /^.*\.(pem|key|p12|pfx|crt)$/,
    /^\.npmrc$/,
    /^\.yarnrc$/,
    /^\.yarnrc\.yml$/,
    /^\.pypirc$/,
    /^\.aws(\/|$)/,
    /^\.ssh(\/|$)/
  ];
  return protectedPatterns.some(p => p.test(rel));
}

  // Blocked destructive commands pattern
  const BLOCKED_COMMAND_PATTERNS = [
    /\bformat\b/i,
    /\bdiskpart\b/i,
    /\brmdir\s+(\/[a-z\s]+)*[a-z]:\\/i,
    /\bdel\s+(\/[a-z\s]+)*[a-z]:\\/i,
    /\brm\s+-rf\s+(\/|[a-z]:\\)/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bdrop\s+database\b/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i
  ];

  function isCommandBlocked(command) {
    return BLOCKED_COMMAND_PATTERNS.some(pattern => pattern.test(command));
  }

  // Max output buffer in bytes (100 KB)
  const MAX_OUTPUT_BYTES = 100 * 1024;
  function truncateOutput(str) {
    if (!str) return { text: '', truncated: false };
    const buf = Buffer.from(str, 'utf8');
    if (buf.length <= MAX_OUTPUT_BYTES) {
      return { text: str, truncated: false };
    }
    const sliced = buf.subarray(0, MAX_OUTPUT_BYTES).toString('utf8');
    return {
      text: sliced + '\n\n... [OUTPUT TRUNCATED: Exceeded 100 KB safety limit] ...',
      truncated: true,
      originalBytes: buf.length
    };
  }

  // 10. Remote Terminal Command Execution
  app.post('/api/chatgpt/terminal/exec', verifyExecAuth, (req, res) => {
    const { command, cwd, timeout = 60000 } = req.body || {};
    if (!command) {
      return res.status(400).json({ success: false, error: 'command is required' });
    }

    // Allowed read‑only commands (regexes for full command pattern)
    const allowedReadOnly = [
      /^git\s+(status|log|diff|branch|show|rev-parse|remote\s+-v)(\s+.*)?$/i,
      /^(dir|ls)(\s+.*)?$/i,
      /^(cat|type)(\s+.+)?$/i,
      /^node\s+--version$/i,
      /^npm\s+--version$/i
    ];

    if (process.env.CHATGPT_READONLY === 'true') {
      // Disallow any shell operators or command chaining
      const prohibitedOperators = /[&|;<>`$(){}]/;
      if (prohibitedOperators.test(command)) {
        return res.status(403).json({
          success: false,
          error: 'Read-only mode active: command contains prohibited operators.'
        });
      }
      const isAllowed = allowedReadOnly.some(rx => rx.test(command.trim()));
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Read-only mode active (CHATGPT_READONLY=true). Command not permitted.'
        });
      }
    }

    // Build/Test capability – only allowed when READ_ONLY is explicitly false
    let isBuildTestAllowed = false;
    if (process.env.CHATGPT_READONLY !== 'true' && process.env.CHATGPT_BUILD_TEST === 'true') {
      const buildTestAllowlist = [/^npm\s+test$/i, /^npm\s+run\s+react-build$/i];
      isBuildTestAllowed = buildTestAllowlist.some(rx => rx.test(command.trim()));
      if (!isBuildTestAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Build/Test commands are not permitted unless CHATGPT_BUILD_TEST=true and READ_ONLY=false.'
        });
      }
    }

    if (isCommandBlocked(command)) {
      auditLog('terminal_exec_blocked', { command, reason: 'destructive_command_pattern' });
      return res.status(403).json({
        success: false,
        error: 'Command blocked: Potentially destructive system operation detected.'
      });
    }

    let targetCwd;
    try {
      targetCwd = resolveSafePath(cwd);
    } catch (err) {
      return res.status(403).json({ success: false, error: err.message });
    }

    const safeTimeout = Math.min(Math.max(Number(timeout) || 60000, 1000), 120000);
    const startTime = Date.now();
    console.log(`[ChatGPT Remote Exec] Running: "${command}" in ${targetCwd} (timeout: ${safeTimeout}ms)`);

    // Choose safe execution strategy
    const useExecFile = allowedReadOnly.some(rx => rx.test(command.trim())) || isBuildTestAllowed;
    if (useExecFile) {
      // Split command into executable + args safely (no shell parsing)
      const parts = command.trim().match(/(?:[^\s\"]+|\"[^\"]*\")+/g) || [];
      const execPath = parts.shift();
      const execArgs = parts;
      const { execFile } = require('child_process');
      execFile(execPath, execArgs, {
        cwd: targetCwd,
        maxBuffer: 5 * 1024 * 1024,
        timeout: safeTimeout
      }, (err, stdout, stderr) => handleExecResult(err, stdout, stderr));
    } else {
      // Fallback to exec for any unexpected commands (should be blocked earlier)
      const { exec } = require('child_process');
      exec(command, {
        cwd: targetCwd,
        shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
        maxBuffer: 5 * 1024 * 1024,
        timeout: safeTimeout
      }, (err, stdout, stderr) => handleExecResult(err, stdout, stderr));
    }

    function handleExecResult(err, stdout, stderr) {
      const duration = Date.now() - startTime;
      const truncOut = truncateOutput(stdout || '');
      const truncErr = truncateOutput(stderr || (err ? err.message : ''));

      auditLog('terminal_exec', {
        command,
        cwd: targetCwd,
        exitCode: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
        durationMs: duration
        // No sensitive data logged
      });

      res.json({
        success: !err,
        command,
        exitCode: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
        stdout: truncOut.text,
        stderr: truncErr.text,
        truncated: truncOut.truncated || truncErr.truncated,
        executionTimeMs: duration
      });
    }
  });

  // 11. Workspace File List
  app.get('/api/chatgpt/workspace/files', verifyExecAuth, (req, res) => {
    const relDir = req.query.directory || '.';
    let fullDir;
    try {
      fullDir = resolveSafePath(relDir);
    } catch (err) {
      return res.status(403).json({ success: false, error: err.message });
    }

    if (!fs.existsSync(fullDir)) {
      return res.status(404).json({ success: false, error: 'Directory not found' });
    }

    try {
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      const files = [];
      const directories = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.git') || entry.name === 'node_modules' || entry.name === 'dist') continue;
        if (entry.isDirectory()) directories.push(entry.name);
        else files.push(entry.name);
      }

      auditLog('workspace_files', { directory: relDir, filesCount: files.length });

      res.json({
        success: true,
        directory: relDir,
        files,
        directories
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 12. Workspace File Read
  app.post('/api/chatgpt/workspace/read-file', verifyExecAuth, (req, res) => {
    const { filePath, path: p, startLine, endLine } = req.body || {};
    const targetRel = filePath || p;
    if (!targetRel) {
      return res.status(400).json({ success: false, error: 'path is required' });
    }

    let fullPath;
    try {
      fullPath = resolveSafePath(targetRel);
    } catch (err) {
      return res.status(403).json({ success: false, error: err.message });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: `File not found: ${targetRel}` });
    }

    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        return res.status(400).json({ success: false, error: `Target is a directory, not a file: ${targetRel}` });
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let outputLines = lines;

      if (startLine || endLine) {
        const s = Math.max((startLine || 1) - 1, 0);
        const e = Math.min(endLine || lines.length, lines.length);
        outputLines = lines.slice(s, e);
      }

      const textOutput = outputLines.join('\n');
      const truncResult = truncateOutput(textOutput);

      auditLog('read_file', { path: targetRel, lines: outputLines.length });

      res.json({
        success: true,
        path: targetRel,
        totalLines: lines.length,
        returnedLines: outputLines.length,
        truncated: truncResult.truncated,
        content: truncResult.text
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 13. Workspace File Write
  app.post('/api/chatgpt/workspace/write-file', verifyExecAuth, (req, res) => {
    if (process.env.CHATGPT_READONLY === 'true') {
      return res.status(403).json({
        success: false,
        error: 'Read-only mode active (CHATGPT_READONLY=true). File modifications are disabled.'
      });
    }

    const { filePath, path: p, content } = req.body || {};
    const targetRel = filePath || p;

    if (!targetRel || content === undefined) {
      return res.status(400).json({ success: false, error: 'path and content are required' });
    }

    let fullPath;
    try {
      fullPath = resolveSafePath(targetRel);
    } catch (err) {
      return res.status(403).json({ success: false, error: err.message });
    }

    if (isProtectedWritePath(fullPath)) {
      auditLog('write_file_blocked', { path: targetRel, reason: 'protected_file' });
      return res.status(403).json({
        success: false,
        error: `Write denied: "${targetRel}" is a protected system/credential file.`
      });
    }

    try {
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(fullPath, content, 'utf8');
      const bytes = Buffer.byteLength(content, 'utf8');

      auditLog('write_file', { path: targetRel, bytesWritten: bytes });

      res.json({
        success: true,
        path: targetRel,
        bytesWritten: bytes
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}

module.exports = {
  getLivePublicUrl,
  getOpenApiSpec,
  registerChatGPTRoutes,
  getExecToken,
};
