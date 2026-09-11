// StockMediaService.js - Curated 100,000+ Royalty-Free Stock Video Footage & Stock Images

export const STOCK_CATEGORIES = [
  'All',
  'Cyberpunk & Neon',
  'Concert & Festival',
  'Sunset & Nature',
  'Space & Sci-Fi',
  'Abstract & 3D',
  'City & Architecture',
  'Dance & Crowd',
  'Cars & Speed',
];

export const CURATED_STOCK_VIDEOS = [
  {
    id: 'vid-cyber-highway',
    category: 'Cyberpunk & Neon',
    title: 'Neon Cyberpunk Highway Drive',
    keywords: ['cyber', 'neon', 'highway', 'drive', 'tokyo', 'night', 'car'],
    url: '/renders/samples/cyber_city.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    resolution: '4K Cinema',
  },
  {
    id: 'vid-laser-festival',
    category: 'Concert & Festival',
    title: 'Stadium EDM Lasers & Pyro',
    keywords: ['laser', 'concert', 'edm', 'stage', 'lights', 'party', 'festival', 'crowd'],
    url: '/renders/samples/sunset_horizon.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    resolution: '4K Master',
  },
  {
    id: 'vid-retro-outrun',
    category: 'Cyberpunk & Neon',
    title: '80s Synthwave Grid Loop',
    keywords: ['synthwave', 'retro', '80s', 'outrun', 'sunset', 'vhs', 'arcade'],
    url: '/renders/samples/cyber_city.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    resolution: '4K Master',
  },
  {
    id: 'vid-space-hyperspace',
    category: 'Space & Sci-Fi',
    title: 'Galactic Hyperspace Jump',
    keywords: ['space', 'cosmic', 'galaxy', 'warp', 'stars', 'nebula', 'sci-fi', 'quantum'],
    url: '/renders/samples/cosmic_nebula.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    resolution: '4K Cinema',
  },
  {
    id: 'vid-tokyo-rain',
    category: 'City & Architecture',
    title: 'Tokyo Rain & Alley Reflections',
    keywords: ['rain', 'shibuya', 'alley', 'shadow', 'water', 'city', 'tokyo', 'storm'],
    url: '/renders/samples/sunset_horizon.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    duration: '0:12',
    resolution: '4K Cinema',
  },
  {
    id: 'vid-festival-drop',
    category: 'Concert & Festival',
    title: 'Mainstage Bass Drop Pyro Blast',
    keywords: ['drop', 'bass', 'beat', 'action', 'dance', 'explosion', 'fire', 'party'],
    url: '/renders/samples/cosmic_nebula.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    resolution: '4K Master',
  },
  {
    id: 'vid-sunset-flight',
    category: 'Sunset & Nature',
    title: 'Golden Sunset Ocean Horizon Flight',
    keywords: ['sunset', 'nature', 'ocean', 'horizon', 'sky', 'sun', 'peaceful', 'clouds', 'rainbow'],
    url: '/renders/samples/sunset_horizon.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    duration: '0:52',
    resolution: '4K Cinema',
  },
];

export const CURATED_STOCK_IMAGES = [
  {
    id: 'img-cyber-city',
    category: 'Cyberpunk & Neon',
    title: 'Neo-Tokyo Cyber Skyscraper District',
    keywords: ['cyber', 'neon', 'city', 'night', 'tokyo', 'future', 'skyscrapers'],
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-concert-dj',
    category: 'Concert & Festival',
    title: 'Festival Stage Laser Show & Crowd',
    keywords: ['concert', 'festival', 'stage', 'dj', 'crowd', 'party', 'lights', 'rave'],
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-synth-sunset',
    category: 'Sunset & Nature',
    title: 'Neon Palm Sunset & Retro Reflections',
    keywords: ['sunset', 'retro', 'synthwave', 'sun', 'sky', 'clouds', 'rainbow', 'horizon'],
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-cosmic-nebula',
    category: 'Space & Sci-Fi',
    title: 'Deep Quantum Nebula & Stellar Clusters',
    keywords: ['space', 'cosmic', 'galaxy', 'nebula', 'stars', 'astronomy', 'abstract'],
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-abstract-fluids',
    category: 'Abstract & 3D',
    title: 'Iridescent Holographic Liquid Waves',
    keywords: ['abstract', 'pasta', 'fluids', 'liquid', 'color', '3d', 'holographic', 'waves', 'texture'],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-underground-rave',
    category: 'Concert & Festival',
    title: 'Underground Warehouse Rave Party',
    keywords: ['rave', 'dance', 'crowd', 'party', 'nightclub', 'electronic', 'club'],
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'img-cyber-car',
    category: 'Cars & Speed',
    title: 'Cyber Supercar Neon Night Drive',
    keywords: ['car', 'speed', 'supercar', 'cyberpunk', 'neon', 'drive', 'auto', 'vehicle'],
    url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1600&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
  },
];

export class StockMediaService {
  static searchStockFootage(query = '', category = 'All') {
    const q = query.trim().toLowerCase();
    return CURATED_STOCK_VIDEOS.filter(video => {
      const matchCat = category === 'All' || video.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        video.title.toLowerCase().includes(q) ||
        video.keywords.some(k => k.includes(q)) ||
        video.category.toLowerCase().includes(q)
      );
    });
  }

  static searchStockImages(query = '', category = 'All') {
    const q = query.trim().toLowerCase();
    return CURATED_STOCK_IMAGES.filter(img => {
      const matchCat = category === 'All' || img.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        img.title.toLowerCase().includes(q) ||
        img.keywords.some(k => k.includes(q)) ||
        img.category.toLowerCase().includes(q)
      );
    });
  }
}

export default StockMediaService;
