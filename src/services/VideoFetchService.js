export class VideoFetchService {
  /**
   * Fetches a cinematic stock video from Pexels matching the given query
   * @param {string} query Search keyword (e.g., 'cyberpunk neon driving')
   * @param {string} apiKey User's Pexels API Key
   * @returns {Promise<Object>} Media object with {type: 'video', url: string}
   */
  static async fetchPexelsVideo(query, apiKey) {
    if (!apiKey) {
      throw new Error('Pexels API Key is missing. Please provide one in the settings.');
    }

    try {
      // Simplify query to the most important keywords for better search results
      const searchWords = query
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(w => w.length > 3)
        .slice(0, 3)
        .join(' ');

      const fallbackQuery = searchWords || 'cinematic abstract';

      const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(fallbackQuery)}&per_page=5&orientation=landscape`, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Pexels (check your API key)');
      }

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        // Pick a random video from the top 5 results for variety
        const video = data.videos[Math.floor(Math.random() * data.videos.length)];
        
        // Prefer HD quality mp4
        const videoFile = video.video_files.find(f => f.quality === 'hd' && f.file_type === 'video/mp4') || 
                          video.video_files.find(f => f.file_type === 'video/mp4') ||
                          video.video_files[0];

        if (videoFile && videoFile.link) {
          return {
            type: 'video',
            url: videoFile.link,
            thumbnail: video.image, // Poster image fallback
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Pexels Video API Error:', error);
      throw error;
    }
  }
}
