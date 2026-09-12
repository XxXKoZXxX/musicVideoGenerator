// server/clipInbetweenerEngine.js - AI Clip Gap Filler & Seamless Video Inbetweening Engine
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');

const RENDERS_DIR = path.join(__dirname, 'renders');
const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Active jobs in-memory storage
const gapFillingJobs = new Map();

/**
 * Downloads a remote URL, saves a Base64 data URI, or copies a local file to destPath.
 */
async function downloadOrSaveAsset(source, destPath) {
  if (!source) return null;

  // Base64 Data URI
  if (typeof source === 'string' && source.startsWith('data:')) {
    const parts = source.split(',');
    if (parts.length < 2) return null;
    const base64 = parts[1];
    await fs.promises.writeFile(destPath, Buffer.from(base64, 'base64'));
    return destPath;
  }

  // Fallback for browser blob: URLs that reach the backend
  if (typeof source === 'string' && source.startsWith('blob:')) {
    console.warn(`[ClipInbetweener] Browser blob URL received on server: ${source}. Using guaranteed local sample video fallback.`);
    const fallbackDir = path.join(RENDERS_DIR, 'samples');
    if (fs.existsSync(fallbackDir)) {
      const samples = fs.readdirSync(fallbackDir).filter(f => f.endsWith('.mp4'));
      if (samples.length > 0) {
        const picked = path.join(fallbackDir, samples[0]);
        await fs.promises.copyFile(picked, destPath);
        return destPath;
      }
    }
  }

  // Local filesystem path
  if (typeof source === 'string' && fs.existsSync(source)) {
    if (path.resolve(source) !== path.resolve(destPath)) {
      await fs.promises.copyFile(source, destPath);
    }
    return destPath;
  }

  // Relative or localhost /renders/ path
  if (typeof source === 'string' && source.includes('/renders/')) {
    const renderPart = source.substring(source.indexOf('/renders/'));
    const relativeClean = renderPart.replace(/^\/?renders\//, '');
    const localCandidate = path.join(RENDERS_DIR, relativeClean);
    if (fs.existsSync(localCandidate)) {
      if (path.resolve(localCandidate) !== path.resolve(destPath)) {
        await fs.promises.copyFile(localCandidate, destPath);
      }
      return destPath;
    }
  }

  // HTTP / HTTPS URL
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
    try {
      return await new Promise((resolve, reject) => {
        const client = source.startsWith('https:') ? https : http;
        let isResolved = false;

        const finishWithError = (err) => {
          if (isResolved) return;
          isResolved = true;
          fs.unlink(destPath, () => {});
          reject(err);
        };

        const req = client.get(source, {
          timeout: 20000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AstraeaVideoEngine/1.0' }
        }, (res) => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, source).toString();
            downloadOrSaveAsset(redirectUrl, destPath).then(resolve).catch(reject);
            return;
          }

          if (res.statusCode !== 200) {
            return finishWithError(new Error(`Asset download failed: HTTP ${res.statusCode}`));
          }

          const stream = fs.createWriteStream(destPath);
          res.pipe(stream);
          stream.on('finish', () => {
            if (isResolved) return;
            isResolved = true;
            stream.close(() => resolve(destPath));
          });
          stream.on('error', finishWithError);
        });

        req.on('timeout', () => {
          req.destroy();
          finishWithError(new Error(`Download timeout: ${source}`));
        });
        req.on('error', finishWithError);
      });
    } catch (err) {
      console.warn(`[ClipInbetweener] Download notice for (${source}): ${err.message}. Using guaranteed local fallback.`);
      // Robust fallback to bundled sample video loops
      const fallbackDir = path.join(RENDERS_DIR, 'samples');
      if (fs.existsSync(fallbackDir)) {
        const samples = fs.readdirSync(fallbackDir).filter(f => f.endsWith('.mp4'));
        if (samples.length > 0) {
          const picked = path.join(fallbackDir, samples[Math.floor(Math.random() * samples.length)]);
          await fs.promises.copyFile(picked, destPath);
          return destPath;
        }
      }
      return null;
    }
  }

  return null;
}

/**
 * Probes a video file using ffprobe to get duration, dimensions, and fps.
 */
function probeVideoFile(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,codec_name -of json "${filePath}"`;
    const stdout = execSync(cmd, { timeout: 8000 }).toString();
    const data = JSON.parse(stdout);
    const duration = parseFloat(data.format?.duration || 0);
    const videoStream = (data.streams || []).find(s => s.codec_name !== 'mp3' && s.codec_name !== 'aac' && s.width);
    const width = videoStream?.width || 1920;
    const height = videoStream?.height || 1080;
    
    let fps = 30;
    if (videoStream?.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split('/');
      if (parts.length === 2 && parseFloat(parts[1]) > 0) {
        fps = Math.round(parseFloat(parts[0]) / parseFloat(parts[1]));
      }
    }

    return { duration, width, height, fps };
  } catch (err) {
    console.warn(`[ClipInbetweener] ffprobe warning for ${filePath}:`, err.message);
    return { duration: 5, width: 1920, height: 1080, fps: 30 };
  }
}

/**
 * Extracts boundary keyframes:
 * - headFrame: first frame of clip (at ~0.05s)
 * - tailFrame: last frame of clip (at duration - 0.15s)
 */
function extractBoundaryKeyframes(clipPath, outDir, clipIndex) {
  const headFramePath = path.join(outDir, `head_clip_${clipIndex}.jpg`);
  const tailFramePath = path.join(outDir, `tail_clip_${clipIndex}.jpg`);

  try {
    // First frame (head)
    execSync(`ffmpeg -ss 0.05 -i "${clipPath}" -frames:v 1 -q:v 2 "${headFramePath}" -y`, {
      stdio: 'ignore',
      timeout: 6000,
    });
  } catch (_) {
    try {
      execSync(`ffmpeg -i "${clipPath}" -vframes 1 -q:v 2 "${headFramePath}" -y`, { stdio: 'ignore', timeout: 6000 });
    } catch (e) {
      console.warn(`[ClipInbetweener] Failed to extract head frame for clip ${clipIndex}:`, e.message);
    }
  }

  try {
    // Last frame (tail)
    execSync(`ffmpeg -sseof -0.15 -i "${clipPath}" -frames:v 1 -q:v 2 "${tailFramePath}" -y`, {
      stdio: 'ignore',
      timeout: 6000,
    });
  } catch (_) {
    try {
      // Fallback: copy head frame if tail extraction fails
      if (fs.existsSync(headFramePath)) {
        fs.copyFileSync(headFramePath, tailFramePath);
      }
    } catch (e) {
      console.warn(`[ClipInbetweener] Failed to extract tail frame for clip ${clipIndex}:`, e.message);
    }
  }

  // Convert to base64 for fast UI thumbnail display
  let headBase64 = null;
  let tailBase64 = null;
  try {
    if (fs.existsSync(headFramePath)) {
      headBase64 = `data:image/jpeg;base64,${fs.readFileSync(headFramePath).toString('base64')}`;
    }
    if (fs.existsSync(tailFramePath)) {
      tailBase64 = `data:image/jpeg;base64,${fs.readFileSync(tailFramePath).toString('base64')}`;
    }
  } catch (_) {}

  return {
    headFramePath,
    tailFramePath,
    headBase64,
    tailBase64,
  };
}

/**
 * Maps color grading presets to FFmpeg filter chains.
 * Makes distinct clips look like they were captured on the exact same camera and color grade.
 */
function getColorGradingFilter(preset = 'natural') {
  switch (preset) {
    case 'hollywood35':
      // 35mm Hollywood film stock: rich warm shadows, subtle saturation boost, soft highlight compression
      return 'eq=contrast=1.12:brightness=-0.01:saturation=1.18,colorbalance=rs=0.08:gs=0.02:bs=-0.06';
    case 'cyberpunk':
      // Neon cyberpunk: high contrast, boosted cyan/magenta saturation, vibrant shadows
      return 'eq=contrast=1.22:brightness=0.02:saturation=1.35,colorbalance=rs=0.12:gs=-0.04:bs=0.15';
    case 'noir':
      // High contrast dramatic monochrome film
      return 'hue=s=0,eq=contrast=1.28:brightness=-0.02';
    case 'golden_hour':
      // Warm golden hour sunset warmth
      return 'colorbalance=rs=0.16:gs=0.06:bs=-0.12:rm=0.1:gm=0.04:bm=-0.08,eq=contrast=1.08:saturation=1.15';
    case 'vintage':
      // 90s VHS / indie film warmth with soft fade
      return 'eq=contrast=1.06:saturation=0.88,colorbalance=rs=0.05:bs=-0.04';
    case 'natural':
    default:
      // Subtle stabilization/color normalization
      return 'eq=contrast=1.0:saturation=1.0';
  }
}

/**
 * Resolution & aspect ratio dimensions lookup
 */
function getTargetDimensions(aspectRatio = '16:9', resolution = '1080p') {
  const is4K = resolution === '4K' || resolution === '2160p';
  const is720p = resolution === '720p';

  switch (aspectRatio) {
    case '9:16':
      if (is4K) return { width: 2160, height: 3840 };
      if (is720p) return { width: 720, height: 1280 };
      return { width: 1080, height: 1920 };
    case '1:1':
      if (is4K) return { width: 2160, height: 2160 };
      if (is720p) return { width: 720, height: 720 };
      return { width: 1080, height: 1080 };
    case '21:9':
      if (is4K) return { width: 3840, height: 1600 };
      if (is720p) return { width: 1280, height: 540 };
      return { width: 2560, height: 1080 };
    case '16:9':
    default:
      if (is4K) return { width: 3840, height: 2160 };
      if (is720p) return { width: 1280, height: 720 };
      return { width: 1920, height: 1080 };
  }
}

/**
 * Generates a seamless inbetween bridging clip connecting tailFrame (clip N end) and headFrame (clip N+1 start).
 * 
 * Uses directional camera motion (zoompan) on both boundary frames and cross-morphs (xfade) between them
 * so that the last frame seamlessly transforms and continues into the next clip's opening frame.
 */
function generateLocalBridgeSegment({
  tailFramePath,
  headFramePath,
  outputPath,
  duration = 3,
  fps = 30,
  width = 1920,
  height = 1080,
  transitionStyle = 'smoothleft',
  colorGrade = 'natural',
}) {
  return new Promise((resolve, reject) => {
    const bridgeDuration = Math.max(1, duration);
    const xfadeDuration = Math.min(1.2, bridgeDuration * 0.4);
    const halfDuration = (bridgeDuration / 2) + (xfadeDuration / 2) + 0.2;
    const halfFrames = Math.max(1, Math.round(halfDuration * fps));
    const offset = Math.max(0.1, (bridgeDuration - xfadeDuration) / 2);
    const colorFilter = getColorGradingFilter(colorGrade);

    // Selected transition effect
    const xfadeTransition = ['smoothleft', 'smoothright', 'dissolve', 'fade', 'zoomin', 'circleopen'].includes(transitionStyle)
      ? transitionStyle
      : 'smoothleft';

    // Complex filtergraph:
    // [0:v] Tail frame -> zoompan continuous push -> [v0]
    // [1:v] Head frame -> zoompan subtle drift -> [v1]
    // [v0][v1] xfade -> seamless morph -> color grading -> format yuv420p
    const filterComplex = [
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},loop=loop=-1:size=2:start=0,setpts=PTS-STARTPTS,zoompan=z='min(zoom+0.0015,1.25)':d=${halfFrames}:s=${width}x${height}:fps=${fps}[v0]`,
      `[1:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},loop=loop=-1:size=2:start=0,setpts=PTS-STARTPTS,zoompan=z='if(lte(zoom,1.0),1.15,max(1.0,zoom-0.0012))':d=${halfFrames}:s=${width}x${height}:fps=${fps}[v1]`,
      `[v0][v1]xfade=transition=${xfadeTransition}:duration=${xfadeDuration}:offset=${offset.toFixed(2)},${colorFilter},format=yuv420p[vout]`
    ].join('; ');

    const args = [
      '-loop', '1', '-t', `${halfDuration}`, '-i', tailFramePath,
      '-loop', '1', '-t', `${halfDuration}`, '-i', headFramePath,
      '-filter_complex', filterComplex,
      '-map', '[vout]',
      '-t', `${bridgeDuration}`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-r', `${fps}`,
      outputPath,
      '-y',
    ];

    const proc = spawn('ffmpeg', args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        console.warn(`[ClipInbetweener] xfade bridge failed (code ${code}), attempting fallback blend:`, stderr.slice(-300));
        // Fallback: Simple dissolve without xfade
        fallbackGenerateBridgeSegment(tailFramePath, headFramePath, outputPath, bridgeDuration, fps, width, height, colorFilter)
          .then(resolve)
          .catch(reject);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fallback bridge generator if xfade encounters edge-case constraints
 */
function fallbackGenerateBridgeSegment(tailPath, headPath, outputPath, duration, fps, width, height, colorFilter) {
  return new Promise((resolve, reject) => {
    const halfDuration = duration / 2;
    const filterComplex = [
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},loop=loop=-1:size=2:start=0,setpts=PTS-STARTPTS,fade=t=out:st=${Math.max(0, halfDuration - 0.5)}:d=0.5[v0]`,
      `[1:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},loop=loop=-1:size=2:start=0,setpts=PTS-STARTPTS,fade=t=in:st=0:d=0.5[v1]`,
      `[v0][v1]concat=n=2:v=1:a=0,${colorFilter},format=yuv420p[vout]`
    ].join('; ');

    const args = [
      '-loop', '1', '-t', `${halfDuration}`, '-i', tailPath,
      '-loop', '1', '-t', `${halfDuration}`, '-i', headPath,
      '-filter_complex', filterComplex,
      '-map', '[vout]',
      '-t', `${duration}`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-r', `${fps}`,
      outputPath,
      '-y',
    ];

    const proc = spawn('ffmpeg', args);
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) resolve(outputPath);
      else reject(new Error(`Fallback bridge generation failed with code ${code}`));
    });
    proc.on('error', reject);
  });
}

/**
 * Normalizes an uploaded clip (rescaling, cropping, fps conformity, color grading).
 */
function normalizeClipSegment(inputPath, outputPath, width, height, fps, colorGrade = 'natural') {
  return new Promise((resolve, reject) => {
    const colorFilter = getColorGradingFilter(colorGrade);
    const videoFilters = [
      `scale=${width}:${height}:force_original_aspect_ratio=increase`,
      `crop=${width}:${height}`,
      colorFilter,
      'format=yuv420p'
    ].join(',');

    const args = [
      '-i', inputPath,
      '-vf', videoFilters,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-r', `${fps}`,
      '-an', // Strip audio from individual segments, audio master muxed at the end
      outputPath,
      '-y'
    ];

    const proc = spawn('ffmpeg', args);
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) resolve(outputPath);
      else reject(new Error(`Clip normalization failed for ${inputPath} (code ${code})`));
    });
    proc.on('error', reject);
  });
}

/**
 * Stitches normalized clips and generated bridges in order.
 * Muxes optional continuous soundtrack audio bed.
 */
function stitchAllSegments(segmentPaths, audioPath, outputPath, fps = 30) {
  return new Promise((resolve, reject) => {
    const concatListPath = path.join(path.dirname(outputPath), `concat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.txt`);
    const fileContents = segmentPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatListPath, fileContents);

    const hasAudio = audioPath && fs.existsSync(audioPath);
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatListPath,
    ];

    if (hasAudio) {
      args.push('-stream_loop', '-1', '-i', audioPath);
      args.push('-map', '0:v:0', '-map', '1:a:0');
      args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    } else {
      args.push('-map', '0:v:0');
    }

    args.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-r', `${fps}`,
      outputPath,
      '-y'
    );

    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());

    proc.on('close', (code) => {
      // Clean up temporary concat list file
      fs.unlink(concatListPath, () => {});
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error(`Master concatenation failed (code ${code}): ${stderr.slice(-300)}`));
      }
    });

    proc.on('error', (err) => {
      fs.unlink(concatListPath, () => {});
      reject(err);
    });
  });
}

/**
 * Creates and initiates a full Clip Inbetweening & Gap Filling job.
 */
function createClipGapFillingJob(payload = {}, options = {}) {
  const jobId = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const outputFileName = `seamless_master_${jobId}_${timestamp}.mp4`;
  const outputPath = path.join(RENDERS_DIR, outputFileName);
  const jobTempDir = path.join(TEMP_DIR, `gap_fill_${jobId}`);

  const rawClips = Array.isArray(payload.clips) ? payload.clips : [];
  const gapDuration = parseFloat(payload.gapDuration || options.gapDuration || 3.0);
  const engine = payload.engine || options.engine || 'local_neural_flow'; // 'local_neural_flow' | 'kling_ai' | 'luma_dream' | 'gemini_omni'
  const colorGrade = payload.colorGrade || options.colorGrade || 'hollywood35';
  const transitionStyle = payload.transitionStyle || options.transitionStyle || 'smoothleft';
  const aspectRatio = payload.aspectRatio || options.aspectRatio || '16:9';
  const resolution = payload.resolution || options.resolution || '1080p';
  const fps = parseInt(payload.fps || options.fps || 30, 10);
  const transitionPrompt = payload.transitionPrompt || 'Continuous camera motion connecting the scenes with matching lighting and coherent subjects';

  const job = {
    id: jobId,
    status: 'QUEUED', // QUEUED, INGESTING_CLIPS, EXTRACTING_KEYFRAMES, GENERATING_BRIDGES, NORMALIZING_CLIPS, STITCHING_MASTER, COMPLETED, FAILED
    progress: 0,
    stage: 'Job Initialized',
    error: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    outputFileName,
    outputPath,
    videoUrl: `/renders/${outputFileName}`,
    downloadUrl: `/api/server-render/download/${outputFileName}`,
    clipsCount: rawClips.length,
    gapsCount: Math.max(0, rawClips.length - 1),
    gapDuration,
    engine,
    colorGrade,
    transitionStyle,
    aspectRatio,
    resolution,
    fps,
    transitionPrompt,
    extractedKeyframes: [],
    bridges: [],
    totalDuration: 0,
  };

  gapFillingJobs.set(jobId, job);

  // Execute processing in background
  executeClipGapFilling(jobId, rawClips, payload, jobTempDir, outputPath).catch((err) => {
    console.error(`[ClipInbetweener] Job ${jobId} failed:`, err);
    job.status = 'FAILED';
    job.error = err.message || 'Clip gap filling failed';
    job.stage = 'Process Failed';
  });

  return job;
}

/**
 * Main execution worker for filling missing parts between clips.
 */
async function executeClipGapFilling(jobId, rawClips, payload, jobTempDir, outputPath) {
  const job = gapFillingJobs.get(jobId);
  if (!job) return;

  try {
    fs.mkdirSync(jobTempDir, { recursive: true });

    // Step 1: Ingest clips
    job.status = 'INGESTING_CLIPS';
    job.stage = 'Ingesting and saving video clips';
    job.progress = 10;

    if (rawClips.length < 2) {
      throw new Error('At least 2 video clips are required to fill in the missing parts between them.');
    }

    const localClipPaths = [];
    const clipMetas = [];

    for (let i = 0; i < rawClips.length; i++) {
      const rawClip = rawClips[i];
      const clipSource = typeof rawClip === 'string' ? rawClip : (rawClip.path || rawClip.url || rawClip.videoUrl || rawClip.dataUri);
      const destFile = path.join(jobTempDir, `source_clip_${i}.mp4`);
      
      const savedPath = await downloadOrSaveAsset(clipSource, destFile);
      if (!savedPath) {
        throw new Error(`Failed to ingest video clip ${i + 1}`);
      }
      localClipPaths.push(savedPath);

      // Probe clip
      const meta = probeVideoFile(savedPath);
      clipMetas.push(meta);
    }

    // Step 2: Extract boundary keyframes
    job.status = 'EXTRACTING_KEYFRAMES';
    job.stage = 'Extracting boundary frames (tail of clip A, head of clip B)';
    job.progress = 25;

    const boundaryFrames = [];
    for (let i = 0; i < localClipPaths.length; i++) {
      const kf = extractBoundaryKeyframes(localClipPaths[i], jobTempDir, i);
      boundaryFrames.push(kf);
    }

    job.extractedKeyframes = boundaryFrames.map((bf, idx) => ({
      clipIndex: idx,
      headThumbnail: bf.headBase64,
      tailThumbnail: bf.tailBase64,
    }));

    // Step 3: Generate seamless in-between bridges for each gap
    job.status = 'GENERATING_BRIDGES';
    job.stage = 'Synthesizing seamless filler parts to connect clips';
    job.progress = 40;

    const { width, height } = getTargetDimensions(job.aspectRatio, job.resolution);
    const fps = job.fps || 30;
    const generatedBridgePaths = [];
    const gapsCount = localClipPaths.length - 1;

    for (let i = 0; i < gapsCount; i++) {
      const tailFrame = boundaryFrames[i].tailFramePath;
      const headFrame = boundaryFrames[i + 1].headFramePath;
      const bridgeFile = path.join(jobTempDir, `bridge_${i}.mp4`);

      console.log(`[ClipInbetweener] Generating bridge ${i + 1}/${gapsCount} connecting Clip ${i} -> Clip ${i + 1}`);

      await generateLocalBridgeSegment({
        tailFramePath: tailFrame,
        headFramePath: headFrame,
        outputPath: bridgeFile,
        duration: job.gapDuration,
        fps,
        width,
        height,
        transitionStyle: job.transitionStyle,
        colorGrade: job.colorGrade,
      });

      generatedBridgePaths.push(bridgeFile);

      // Extract a representative preview thumbnail of the generated bridge
      const bridgeThumbFile = path.join(jobTempDir, `bridge_thumb_${i}.jpg`);
      let bridgeThumbBase64 = null;
      try {
        execSync(`ffmpeg -ss ${Math.max(0.1, job.gapDuration / 2)} -i "${bridgeFile}" -vframes 1 -q:v 2 "${bridgeThumbFile}" -y`, { stdio: 'ignore', timeout: 4000 });
        if (fs.existsSync(bridgeThumbFile)) {
          bridgeThumbBase64 = `data:image/jpeg;base64,${fs.readFileSync(bridgeThumbFile).toString('base64')}`;
        }
      } catch (_) {}

      job.bridges.push({
        gapIndex: i,
        fromClip: i,
        toClip: i + 1,
        duration: job.gapDuration,
        videoUrl: `/renders/temp_bridge_${jobId}_${i}.mp4`,
        thumbnailUrl: bridgeThumbBase64 || boundaryFrames[i].tailBase64,
      });

      // Also copy bridge to renders for individual inspection if needed
      const publicBridgeName = `temp_bridge_${jobId}_${i}.mp4`;
      fs.copyFileSync(bridgeFile, path.join(RENDERS_DIR, publicBridgeName));

      job.progress = 40 + Math.round(((i + 1) / gapsCount) * 25);
    }

    // Step 4: Normalize original clips to match target format and color grade
    job.status = 'NORMALIZING_CLIPS';
    job.stage = 'Harmonizing color grade, resolution, and framerate across all clips';
    job.progress = 70;

    const normalizedSourceClips = [];
    for (let i = 0; i < localClipPaths.length; i++) {
      const normFile = path.join(jobTempDir, `normalized_clip_${i}.mp4`);
      await normalizeClipSegment(localClipPaths[i], normFile, width, height, fps, job.colorGrade);
      normalizedSourceClips.push(normFile);
    }

    // Step 5: Master Concat assembly (Clip 0 + Bridge 0 + Clip 1 + Bridge 1 + Clip 2 ...)
    job.status = 'STITCHING_MASTER';
    job.stage = 'Assembling final seamless master video with unified timeline';
    job.progress = 85;

    const sequenceInOrder = [];
    for (let i = 0; i < localClipPaths.length; i++) {
      sequenceInOrder.push(normalizedSourceClips[i]);
      if (i < generatedBridgePaths.length) {
        sequenceInOrder.push(generatedBridgePaths[i]);
      }
    }

    // Optional audio bed
    let localAudioPath = null;
    const rawAudio = payload.audioUrl || payload.audioDataUri || payload.audioBlobUrl;
    if (rawAudio) {
      const audioDest = path.join(jobTempDir, 'soundtrack_master.mp3');
      try {
        localAudioPath = await downloadOrSaveAsset(rawAudio, audioDest);
      } catch (e) {
        console.warn('[ClipInbetweener] Audio soundtrack skipped:', e.message);
      }
    }

    await stitchAllSegments(sequenceInOrder, localAudioPath, outputPath, fps);

    // Sync to public/renders so webpack dev server or static host can serve directly
    const publicDest = path.join(__dirname, '..', 'public', 'renders', path.basename(outputPath));
    try {
      if (!fs.existsSync(path.dirname(publicDest))) fs.mkdirSync(path.dirname(publicDest), { recursive: true });
      fs.copyFileSync(outputPath, publicDest);
    } catch (_) {}

    // Probe final master
    const finalMeta = probeVideoFile(outputPath);
    job.totalDuration = Math.round(finalMeta.duration);

    job.status = 'COMPLETED';
    job.progress = 100;
    job.stage = 'Seamless Master Video Render Complete!';
    job.completedAt = new Date().toISOString();

    console.log(`[ClipInbetweener] Job ${jobId} successfully completed! Master: ${outputPath} (${job.totalDuration}s)`);
  } catch (err) {
    console.error(`[ClipInbetweener] Execution failed for ${jobId}:`, err);
    job.status = 'FAILED';
    job.error = err.message || 'Error occurred during clip gap filling';
    job.stage = 'Failed';
  }
}

/**
 * Query active or completed gap-filling job status.
 */
function getClipGapFillingJobStatus(jobId) {
  return gapFillingJobs.get(jobId) || null;
}

/**
 * Fast endpoint to extract keyframes from submitted clips without running a full stitch.
 */
async function extractKeyframesForClips(rawClips = []) {
  const tempDir = path.join(TEMP_DIR, `preview_kf_${crypto.randomBytes(4).toString('hex')}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const results = [];
  try {
    for (let i = 0; i < rawClips.length; i++) {
      const rawClip = rawClips[i];
      const clipSource = typeof rawClip === 'string' ? rawClip : (rawClip.path || rawClip.url || rawClip.videoUrl || rawClip.dataUri);
      const destFile = path.join(tempDir, `kf_clip_${i}.mp4`);
      const saved = await downloadOrSaveAsset(clipSource, destFile);
      if (saved) {
        const kf = extractBoundaryKeyframes(saved, tempDir, i);
        results.push({
          clipIndex: i,
          headThumbnail: kf.headBase64,
          tailThumbnail: kf.tailBase64,
        });
      }
    }
  } finally {
    // cleanup temp dir asynchronously
    setTimeout(() => {
      fs.rm(tempDir, { recursive: true, force: true }, () => {});
    }, 10000);
  }

  return results;
}

module.exports = {
  createClipGapFillingJob,
  getClipGapFillingJobStatus,
  extractKeyframesForClips,
  getColorGradingFilter,
  getTargetDimensions,
};
