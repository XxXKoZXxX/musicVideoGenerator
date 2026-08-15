import React, { useState } from 'react';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import { calculateLifePath } from '../../utils/numerologyEngine';
import { getSecretLanguageProfile } from '../../data/secretLanguageData';
import { 
  Sparkles, Compass, HeartHandshake, 
  Radio, Film, MessageSquare, Headphones, Zap, Key, BookOpen, 
  Share2, Smartphone, Copy, Check, Eye, Calculator, FileText, ArrowRight, Palette,
  Edit3, UserPlus, MapPin, Calendar, Clock, User, Flame, Moon
} from 'lucide-react';
import { shareCosmicContent } from '../../utils/mobileShare';

const STUDIO_COLLECTIONS = [
  {
    category: '🪐 Astrology & Celestial Sky',
    desc: 'Explore your natal blueprint, real-time planetary transits, and karmic destiny.',
    studios: [
      { id: 'astrology', title: 'Birth Chart Wheel', desc: 'Exact planetary placements, zodiac degrees & house aspects.', icon: <Compass className="w-6 h-6 text-gold" />, tag: 'Core Sky' },
      { id: 'secretLanguage', title: 'Secret Language Archetypes', desc: '366 Day personality traits, daily meditations & decan cusps.', icon: <BookOpen className="w-6 h-6 text-amber-400" />, tag: 'Archetypes' },
      { id: 'transits', title: 'Transits Radar', desc: 'Real-time live cosmic sky transits interacting with your chart.', icon: <Zap className="w-6 h-6 text-gold" />, tag: 'Live Radar' },
      { id: 'karma', title: 'Past-Life Karma & Destiny', desc: 'North Node soul destination & Chiron wounded healer gifts.', icon: <Key className="w-6 h-6 text-purple-400" />, tag: 'Destiny' }
    ]
  },
  {
    category: '🔮 Grimoire & Esoteric Divination',
    desc: 'Ancient philosophy, spellcraft recipes, dream decoding, and Tarot divination.',
    studios: [
      { id: 'grimoire', title: 'Grand Occult Grimoire', desc: '10 Portals: Philosophy, Spells, Spirit Box ITC & Pranayama pacer.', icon: <Flame className="w-6 h-6 text-gold" />, tag: 'Grimoire' },
      { id: 'dream', title: 'Astral Dream Sanctuary', desc: 'Jungian archetypes, subconscious Moon synthesis & 50+ symbol dictionary.', icon: <Moon className="w-6 h-6 text-cyan" />, tag: 'Dream Oracle' },
      { id: 'tarot', title: 'Interactive Tarot Spreads', desc: 'Past / Present / Future 3-card divination spreads & soul cards.', icon: <Eye className="w-6 h-6 text-purple-400" />, tag: 'Divination' },
      { id: 'tarotLibrary', title: '78-Card Tarot Encyclopedia', desc: 'Complete searchable deck with Major and Minor Arcana symbolism.', icon: <BookOpen className="w-6 h-6 text-cyan" />, tag: 'Reference' }
    ]
  },
  {
    category: '🎙️ Audio, Media & AI Oracle',
    desc: 'Conversational audio readings, 60 FPS video animations, and AI divination.',
    studios: [
      { id: 'podcast', title: 'Dual-Host Voice Podcast', desc: 'Atlas & Luna interactive conversational audio reading with 432 Hz music.', icon: <Radio className="w-6 h-6 text-rose-400" />, tag: 'Audio LM' },
      { id: 'video', title: 'Motion Video Studio', desc: '60 FPS animated cosmic forecast video with real-time MP4 export.', icon: <Film className="w-6 h-6 text-emerald-400" />, tag: 'Video 60FPS' },
      { id: 'oracleChat', title: 'AI Oracle & Notebook', desc: 'Contextual AI Q&A, dynamic 3-card Tarot spreads & spiritual journal.', icon: <MessageSquare className="w-6 h-6 text-cyan" />, tag: 'AI Assistant' },
      { id: 'soundscape', title: 'Solfeggio & Sound Sanctuary', desc: '20+ healing frequencies, 7 sacred geometry visualizers & breath pacer.', icon: <Headphones className="w-6 h-6 text-cyan" />, tag: '60 FPS Sound' }
    ]
  },
  {
    category: '🔢 Numerology & Relationship Synastry',
    desc: 'Pythagorean vibrational numbers and deep dual-person compatibility tests.',
    studios: [
      { id: 'numerology', title: 'Pythagorean Numerology Matrix', desc: 'Life Path, Expression, Soul Urge, and Birthday vibrational numbers.', icon: <Calculator className="w-6 h-6 text-gold" />, tag: 'Numbers' },
      { id: 'synastry', title: 'Dual Comparison Matrix', desc: '10-subject side-by-side comparison & Twin Flame diagnostic quiz.', icon: <HeartHandshake className="w-6 h-6 text-pink-400" />, tag: 'Dual Slots' }
    ]
  },
  {
    category: '📜 Identity, Profile & Master Dossier',
    desc: 'Manage your personal birth coordinates and export printable dossier documents.',
    studios: [
      { id: 'editProfile', title: 'My Birth Details & Settings', desc: 'View, edit, or enter exact birth name, date, time & city location.', icon: <Edit3 className="w-6 h-6 text-gold" />, tag: 'Identity' },
      { id: 'report', title: 'Master Dossier Report', desc: 'Complete high-resolution printable comprehensive blueprint.', icon: <FileText className="w-6 h-6 text-gold" />, tag: 'Printable' }
    ]
  }
];

export default function OverviewDashboard({ profile, onNavigate, onOpenTheme }) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astroData = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);
  const lifePath = calculateLifePath(dateObj);
  const secData = getSecretLanguageProfile(profile.birthMonth, profile.birthDay);

  const handleShareBlueprint = () => {
    shareCosmicContent({
      title: `${profile.name}'s Cosmic Blueprint | Astraea`,
      text: `✨ ${profile.name}'s Cosmic Blueprint on Astraea:\n☀️ Sun in ${astroData.planets.Sun.zodiac.sign}\n☽ Moon in ${astroData.planets.Moon.zodiac.sign}\n🧭 ${astroData.planets.Ascendant.zodiac.sign} Rising\n🔢 Life Path ${lifePath}\n📜 Archetype: ${secData.title}`
    });
  };

  const [copiedPhone, setCopiedPhone] = useState(false);
  const phoneDirectUrl = typeof window !== 'undefined' && window.location.origin.includes('http') 
    ? window.location.origin 
    : 'http://localhost:3210';
  const qrDirect = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&color=F59E0B&bgcolor=060814&data=${encodeURIComponent(phoneDirectUrl)}`;

  const handleCopyPhoneLink = () => {
    navigator.clipboard.writeText(phoneDirectUrl).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    });
  };

  return (
    <div className="overview-dashboard-page space-y-8">
      {/* ============================================================ */}
      {/* 🌟 Luxurious Hero Welcome Banner */}
      {/* ============================================================ */}
      <div className="dash-hero glass-panel p-6 md:p-8 rounded-3xl border border-gold/40 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-amber-950/20 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="dash-hero-content max-w-2xl">
            <div className="cosmic-tag inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 
              <span>Sovereign Cosmic Dossier</span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-wide leading-tight">
              Welcome, <span className="text-gold">{profile.name}</span>
            </h1>
            <p className="dash-hero-sub text-slate-300 font-medium mt-2 text-sm md:text-base leading-relaxed">
              {secData.dateFormatted}, {profile.birthYear} • {profile.cityName} • <span className="text-cyan font-semibold">{secData.cusp}</span>
            </p>

            {/* Direct 1-Click Profile Action Buttons */}
            <div className="hero-profile-actions flex flex-wrap gap-3 mt-4">
              <button 
                onClick={() => onNavigate('editProfile')}
                className="btn-gold text-xs md:text-sm py-2.5 px-5 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-gold/25 hover:scale-105 transition-all bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950"
              >
                <Edit3 className="w-4 h-4" /> Enter / Edit Your Details
              </button>
              <button 
                onClick={() => onNavigate('newProfile')}
                className="btn-secondary text-xs md:text-sm py-2.5 px-5 rounded-2xl flex items-center gap-2 text-slate-200 hover:text-white bg-white/5 border border-white/10 hover:border-gold/50 transition-all font-semibold"
              >
                <UserPlus className="w-4 h-4 text-cyan" /> Add New Profile
              </button>
            </div>
          </div>

          {/* Quick Identity Badges */}
          <div className="hero-quick-badges flex flex-wrap gap-3 items-center">
            <div className="hero-badge p-3.5 rounded-2xl bg-slate-950/80 border border-gold/30 min-w-[90px] text-center shadow-md">
              <span className="badge-title text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Life Path</span>
              <span className="badge-value text-xl font-serif font-bold text-gold block mt-0.5">{lifePath}</span>
            </div>
            <div className="hero-badge p-3.5 rounded-2xl bg-slate-950/80 border border-cyan/30 min-w-[90px] text-center shadow-md">
              <span className="badge-title text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sun Sign</span>
              <span className="badge-value text-base font-serif font-bold text-cyan block mt-0.5 truncate">{astroData.planets.Sun.zodiac.symbol} {astroData.planets.Sun.zodiac.sign}</span>
            </div>
            <button 
              onClick={onOpenTheme}
              className="hero-badge p-3.5 rounded-2xl bg-slate-950/80 border border-purple-400/30 min-w-[90px] text-center hover:border-gold transition-all shadow-md group"
              title="Customize App Colors & Theme"
            >
              <Palette className="w-4 h-4 text-purple-400 group-hover:text-gold mx-auto mb-1 transition-colors" />
              <span className="badge-title text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Theme</span>
            </button>
            <button 
              onClick={handleShareBlueprint}
              className="hero-badge p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-400/30 min-w-[90px] text-center hover:border-gold transition-all shadow-md group"
              title="Share Cosmic Blueprint"
            >
              <Share2 className="w-4 h-4 text-emerald-400 group-hover:text-gold mx-auto mb-1 transition-colors" />
              <span className="badge-title text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🌟 Active Identity & Exact Birth Details Summary Card */}
      {/* ============================================================ */}
      <div className="glass-panel p-5 rounded-3xl border border-gold/30 bg-slate-950/90 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs md:text-sm w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Profile Name</span>
              <span className="text-white font-bold">{profile.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <div className="w-8 h-8 rounded-xl bg-cyan/15 flex items-center justify-center text-cyan flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Birth Date</span>
              <span className="text-white font-bold">{secData.dateFormatted}, {profile.birthYear}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <div className="w-8 h-8 rounded-xl bg-purple-400/15 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Birth Time</span>
              <span className="text-white font-bold">
                {profile.unknownTime ? 'Time Unknown' : `${profile.birthHour % 12 || 12}:${String(profile.birthMinute || 0).padStart(2, '0')} ${profile.amPm || (profile.birthHour >= 12 ? 'PM' : 'AM')}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Location</span>
              <span className="text-white font-bold truncate max-w-[140px] block">{profile.cityName}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('editProfile')}
          className="btn-secondary text-xs md:text-sm py-2 px-4 rounded-xl text-gold font-bold flex items-center gap-2 hover:bg-gold/15 border border-gold/40 transition-all flex-shrink-0 w-full md:w-auto justify-center"
        >
          <Edit3 className="w-4 h-4" /> Edit Birth Details
        </button>
      </div>

      {/* ============================================================ */}
      {/* 📱 Instant Phone QR & 1-Tap Mobile Access Bar */}
      {/* ============================================================ */}
      <div className="glass-panel p-5 rounded-3xl no-print border border-gold/30 bg-slate-950/80 shadow-lg">
        <div className="phone-access-content flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="phone-qr-mini flex-shrink-0 mx-auto sm:mx-0">
            <img src={qrDirect} alt="Scan to open on phone" width={90} height={90} className="rounded-xl border border-gold/40 shadow-xl" />
          </div>
          <div className="phone-access-text flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gold" />
              <h4 className="text-base font-bold text-white">Instant Phone & Mobile App Access</h4>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
              Scan this QR code with your iPhone or Android camera to launch Astraea instantly on your phone with touch navigation!
            </p>
            <div className="phone-link-row mt-3 flex flex-wrap items-center gap-2">
              <code className="text-xs text-gold font-mono font-bold bg-black/60 py-1.5 px-3 rounded-xl border border-gold/30 truncate max-w-full sm:max-w-md">
                {phoneDirectUrl}
              </code>
              <button onClick={handleCopyPhoneLink} className="btn-gold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 font-bold bg-gold text-slate-950">
                {copiedPhone ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Mobile Link</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🔮 Master Studios Directory (All 16 Studios Categorized) */}
      {/* ============================================================ */}
      <div className="studios-master-section space-y-8 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-wide">
              Cosmic Studios & Portals Directory
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Select any studio to launch interactive charts, audio readings, video animations & divination tools.
            </p>
          </div>
        </div>

        {STUDIO_COLLECTIONS.map((collection) => (
          <div key={collection.category} className="studio-collection-group space-y-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>{collection.category}</span>
              </h3>
              <p className="text-xs text-slate-400">{collection.desc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {collection.studios.map((studio) => (
                <div
                  key={studio.id}
                  onClick={() => onNavigate(studio.id)}
                  className="studio-card glass-panel p-5 rounded-3xl border border-white/10 bg-slate-950/85 hover:border-gold/60 hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-gold/40 transition-all shadow-md">
                        {studio.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 group-hover:border-gold/30 group-hover:text-gold transition-colors">
                        {studio.tag}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-gold transition-colors font-serif">
                      {studio.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {studio.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-gold transition-colors">
                    <span>Launch Studio</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
