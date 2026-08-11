// LyricsEngine.js - Synced Lyrics Parser & Kinetic Typography Canvas Renderer

export class LyricsEngine {
  // Parse lyrics either with LRC timestamps [mm:ss.xx] or plain lines
  static parseLyrics(text, totalDuration = 30) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const lrcRegex = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;
    const timedLines = [];

    let hasTimestamps = false;

    lines.forEach((line) => {
      const match = line.match(lrcRegex);
      if (match) {
        hasTimestamps = true;
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        const content = match[3].trim();
        if (content) {
          timedLines.push({ time, text: content });
        }
      }
    });

    if (hasTimestamps && timedLines.length > 0) {
      timedLines.sort((a, b) => a.time - b.time);
      for (let i = 0; i < timedLines.length; i++) {
        const nextTime = i < timedLines.length - 1 ? timedLines[i + 1].time : totalDuration;
        timedLines[i].duration = Math.max(1.5, nextTime - timedLines[i].time);
        timedLines[i].words = timedLines[i].text.split(' ');
      }
      return timedLines;
    }

    // Distribute evenly if no timestamps provided
    const count = lines.length;
    if (count === 0) return [];

    const timePerLine = totalDuration / count;
    return lines.map((content, idx) => ({
      time: idx * timePerLine,
      duration: timePerLine,
      text: content,
      words: content.split(' '),
    }));
  }

  // Get active lyric at elapsed playback time
  static getActiveLyric(lyrics, elapsed) {
    if (!lyrics || lyrics.length === 0) return null;

    for (let i = 0; i < lyrics.length; i++) {
      const item = lyrics[i];
      if (elapsed >= item.time && elapsed <= item.time + item.duration) {
        const progress = (elapsed - item.time) / item.duration;
        const wordIndex = Math.min(
          item.words.length - 1,
          Math.floor(progress * item.words.length)
        );
        return {
          ...item,
          progress,
          wordIndex,
          isActive: true,
        };
      }
    }
    return null;
  }

  // Render kinetic typography onto canvas frame
  static drawLyrics(ctx, lyric, style = 'neon', width, height, audioMetrics = {}) {
    if (!lyric || !lyric.text) return;

    const { masterEnergy = 0, subBass = 0 } = audioMetrics;
    const progress = lyric.progress || 0;

    ctx.save();

    // Responsive font sizing based on canvas width
    const baseFontSize = Math.max(22, Math.round(width * 0.038));
    const fontScale = 1 + (subBass > 0.6 ? 0.05 : 0);
    const fontSize = baseFontSize * fontScale;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const posX = width / 2;
    const posY = height * 0.82; // Lower third positioning

    // Animation styles
    if (style === 'neon') {
      ctx.font = `700 ${fontSize}px 'Outfit', sans-serif`;

      // Neon Glow background pass
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18 + masterEnergy * 25;
      ctx.fillStyle = '#ec4899';
      ctx.fillText(lyric.text, posX, posY);

      // Bright Core text
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lyric.text, posX, posY);
    } else if (style === 'karaoke') {
      ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`;

      const words = lyric.words || [];
      const currentWordIdx = lyric.wordIndex || 0;

      // Measure total text width to position individual words
      const wordMetrics = words.map((w) => ctx.measureText(w + ' ').width);
      const totalWidth = wordMetrics.reduce((sum, w) => sum + w, 0);
      let currentX = posX - totalWidth / 2;

      words.forEach((word, idx) => {
        const isHighlighted = idx <= currentWordIdx;
        const isCurrent = idx === currentWordIdx;

        ctx.save();
        if (isCurrent) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#fbbf24';
          ctx.translate(currentX + wordMetrics[idx] / 2, posY);
          ctx.scale(1.15, 1.15);
          ctx.fillText(word, 0, 0);
        } else if (isHighlighted) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(word, currentX + wordMetrics[idx] / 2, posY);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 0;
          ctx.fillText(word, currentX + wordMetrics[idx] / 2, posY);
        }
        ctx.restore();

        currentX += wordMetrics[idx];
      });
    } else if (style === 'kinetic') {
      // Pop in and spring movement
      ctx.font = `900 ${fontSize * 1.08}px 'Outfit', sans-serif`;
      const popScale = Math.sin(progress * Math.PI) * 0.15 + 1;

      ctx.translate(posX, posY);
      ctx.scale(popScale, popScale);

      // Bold Stroke
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 6;
      ctx.strokeText(lyric.text, 0, 0);

      // Vibrant Gradient Fill
      const grad = ctx.createLinearGradient(-width / 4, 0, width / 4, 0);
      grad.addColorStop(0, '#ec4899');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.fillText(lyric.text, 0, 0);
    } else if (style === 'glitch') {
      ctx.font = `800 ${fontSize}px 'JetBrains Mono', monospace`;

      const glitchOffset = subBass > 0.65 ? (Math.random() - 0.5) * 12 : 2;

      // Red channel
      ctx.fillStyle = 'rgba(255, 0, 80, 0.85)';
      ctx.fillText(lyric.text, posX - glitchOffset, posY);

      // Cyan channel
      ctx.fillStyle = 'rgba(0, 255, 240, 0.85)';
      ctx.fillText(lyric.text, posX + glitchOffset, posY);

      // White main
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lyric.text, posX, posY);
    } else if (style === 'perspective') {
      // 3D Perspective angle
      ctx.font = `700 ${fontSize * 1.15}px 'Space Grotesk', sans-serif`;
      ctx.save();
      ctx.translate(posX, posY);
      ctx.transform(1, -0.08, 0.08, 1, 0, 0);

      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lyric.text, 0, 0);
      ctx.restore();
    } else {
      // Classic Cinema Subtitle
      ctx.font = `600 ${fontSize}px 'Outfit', sans-serif`;

      // Soft letterbox background pill
      const textWidth = ctx.measureText(lyric.text).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(
        posX - textWidth / 2 - 20,
        posY - fontSize * 0.7,
        textWidth + 40,
        fontSize * 1.4,
        8
      );
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(lyric.text, posX, posY);
    }

    ctx.restore();
  }
}

export default LyricsEngine;
