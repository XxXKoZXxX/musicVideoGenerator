// Generates a sample render so the Render Library isn't empty on first launch.
const { execSync } = require('child_process');
const fs = require('fs');
const FFMPEG = require('@ffmpeg-installer/ffmpeg').path;
const sh = (c) => execSync(c, { timeout: 120000 }).toString().trim();

(async () => {
  const wav = '/tmp/sample_song.wav';
  const img = '/tmp/sample_frame.jpg';
  sh(`"${FFMPEG}" -y -f lavfi -i "sine=frequency=349:duration=8" -ac 2 -ar 44100 "${wav}"`);
  sh(`"${FFMPEG}" -y -f lavfi -i "testsrc2=s=1280x720:rate=1" -frames:v 1 "${img}"`);

  const project = {
    audioTitle: 'Midnight Frequencies (Sample)',
    artistName: 'MusicVid Pro',
    audioDataUrl: 'data:audio/wav;base64,' + fs.readFileSync(wav).toString('base64'),
    images: [img],
    duration: 8,
    bpm: 130,
    aspectRatio: '16:9',
    resolution: '720p',
    lyricsStyle: 'neon',
    showLyrics: true,
    lyrics:
      '[00:00.50] This is a sample render from your local studio\n' +
      '[00:04.00] Upload your own song and lyrics to make yours',
  };

  const r = await fetch('http://localhost:4000/api/server-render/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, options: { resolution: '720p' } }),
  });
  const d = await r.json();
  for (let i = 0; i < 120; i++) {
    await new Promise((res) => setTimeout(res, 2000));
    const j = (await (await fetch(`http://localhost:4000/api/server-render/status/${d.jobId}`)).json()).job;
    if (j.status === 'COMPLETED') {
      console.log('SAMPLE READY:', j.outputFileName, '| lyric lines:', j.lyricLines);
      return;
    }
    if (j.status === 'FAILED') throw new Error(j.error);
  }
  throw new Error('timeout');
})().catch((e) => {
  console.error('sample failed:', e.message);
  process.exit(1);
});
