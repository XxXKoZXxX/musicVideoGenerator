export class VideoFetchService {
  /**
   * Fetches a cinematic stock video from Pexels matching the given query
   * @param {string} query Search keyword (e.g., 'cyberpunk neon driving')
   * @param {string} apiKey User's Pexels API Key
   * @returns {Promise<Object>} Media object with {type: 'video', url: string}
   */
  static getApiKey(overrideKey) {
    return (
      overrideKey ||
      process.env.REACT_APP_PEXELS_API_KEY ||
      localStorage.getItem('pexels_api_key') ||
      ''
    );
  }

  static async fetchPexelsVideo(query, apiKeyOverride) {
    const apiKey = this.getApiKey(apiKeyOverride);

    // HD Stock Video Fallback Pool
    const fallbacks = [
      { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' },
      { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
      { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
      { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80' },
      { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80' },
    ];

    if (!apiKey) {
      // Return high quality stock fallback video if no key is configured
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    try {
      const searchWords = query
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter((w) => w.length > 3)
        .slice(0, 3)
        .join(' ');

      const fallbackQuery = searchWords || 'cinematic abstract';

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(fallbackQuery)}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!response.ok) {
        console.warn('Pexels API request failed, using stock video fallback.');
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const video = data.videos[Math.floor(Math.random() * data.videos.length)];
        const videoFile =
          video.video_files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4') ||
          video.video_files.find((f) => f.file_type === 'video/mp4') ||
          video.video_files[0];

        if (videoFile && videoFile.link) {
          return {
            type: 'video',
            url: videoFile.link,
            thumbnail: video.image,
          };
        }
      }

      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } catch (error) {
      console.warn('Pexels Video API Error, using fallback:', error);
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }
}
