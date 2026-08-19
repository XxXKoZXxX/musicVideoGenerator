import React, { useState } from 'react';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import { calculateLifePath } from '../../utils/numerologyEngine';
import { getSecretLanguageProfile } from '../../data/secretLanguageData';
import { 
  Sparkles, Compass, HeartHandshake, 
  Radio, Film, MessageSquare, Headphones, Zap, Key, BookOpen, 
  Share2, Smartphone, Copy, Check, Eye, Calculator, FileText, ArrowRight, Palette,
  Edit3, UserPlus, MapPin, Calendar, Clock, User, Flame, Moon, Wand2
} from 'lucide-react';
import { shareCosmicContent } from '../../utils/mobileShare';

const STUDIO_COLLECTIONS = [
  {
    category: '🪐 Sky & Astrological Blueprints',
    icon: '🪐',
    color: 'border-cyan-500/30 bg-cyan-500/5',
    desc: 'Explore your natal placements, live daily transits, and karmic destiny.',
    studios: [
      { id: 'astrology', title: 'Birth Chart Wheel', desc: 'Interactive planetary placements, degrees & houses.', icon: <Compass className="w-6 h-6 text-cyan-400" />, tag: 'Chart' },
      { id: 'secretLanguage', title: 'Secret Language Archetypes', desc: '366 Day personality traits & daily meditations.', icon: <BookOpen className="w-6 h-6 text-amber-400" />, tag: 'Archetypes' },
      { id: 'transits', title: 'Transits Radar', desc: 'Live sky planets interacting with your natal chart.', icon: <Zap className="w-6 h-6 text-yellow-400" />, tag: 'Live Sky' },
      { id: 'karma', title: 'Past-Life Karma & Destiny', desc: 'North Node soul destination & Chiron sacred wound.', icon: <Key className="w-6 h-6 text-purple-400" />, tag: 'Destiny' }
    ]
  },
  {
    category: '🔮 Magic, Grimoire & Divination',
    icon: '🔮',
    color: 'border-rose-500/30 bg-rose-500/5',
    desc: 'Ancient philosophy, spellcraft recipes, dream decoding & Tarot divination.',
    studios: [
      { id: 'grimoire', title: 'Grand Occult Grimoire', desc: '10 Portals: Philosophy, Spells, Spirit Box & Pranayama.', icon: <Flame className="w-6 h-6 text-amber-400" />, tag: 'Grimoire' },
      { id: 'dream', title: 'Astral Dream Sanctuary', desc: 'Jungian archetypes & 50+ symbol dream dictionary.', icon: <Moon className="w-6 h-6 text-cyan-400" />, tag: 'Dreams' },
      { id: 'tarot', title: 'Interactive Tarot Spreads', desc: 'Past / Present / Future 3-card divination readings.', icon: <Eye className="w-6 h-6 text-purple-400" />, tag: 'Tarot' },
      { id: 'tarotLibrary', title: '78-Card Tarot Encyclopedia', desc: 'Complete searchable deck with Major & Minor Arcana.', icon: <BookOpen className="w-6 h-6 text-cyan-400" />, tag: 'Library' }
    ]
  },
  {
    category: '🎙️ Voice Podcast, Video & AI Oracle',
    icon: '🎙️',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    desc: 'Conversational audio readings, 60 FPS video animations & AI guidance.',
    studios: [
      { id: 'podcast', title: 'Dual-Host Voice Podcast', desc: 'Atlas & Luna conversational audio reading with 432 Hz music.', icon: <Radio className="w-6 h-6 text-rose-400" />, tag: 'Podcast' },
      { id: 'video', title: 'AI Music Video & Storyline Studio', desc: '4-Step Studio with Sora, Runway Gen-3, Kling, Storylines, Lip-Sync & 60 FPS Export.', icon: <Film className="w-6 h-6 text-emerald-400" />, tag: 'AI Studio' },
      { id: 'oracleChat', title: 'AI Oracle & Notebook', desc: 'Contextual AI Q&A & saved spiritual divination journal.', icon: <MessageSquare className="w-6 h-6 text-cyan-400" />, tag: 'AI Oracle' },
      { id: 'soundscape', title: 'Solfeggio Sound Sanctuary', desc: '20+ healing frequencies & sacred geometry visualizer.', icon: <Headphones className="w-6 h-6 text-cyan-400" />, tag: 'Frequencies' }
    ]
  },
  {
    category: '💖 Personality & Partner Alignment',
    icon: '💖',
    color: 'border-pink-500/30 bg-pink-500/5',
    desc: 'Archetypal personality testing, deep partner alignment & Pythagorean vibrational numbers.',
    studios: [
      { id: 'personalityTest', title: 'Soul Personality Test', desc: '8-Question elemental archetype test & ideal partner matching.', icon: <Sparkles className="w-6 h-6 text-purple-400" />, tag: 'Personality' },
      { id: 'synastry', title: 'Dual Partner Alignment', desc: '10-subject comparison, 5 longevity pillars & green/red flags.', icon: <HeartHandshake className="w-6 h-6 text-pink-400" />, tag: 'Partner Match' },
      { id: 'numerology', title: 'Pythagorean Numerology Matrix', desc: 'Life Path, Expression, Soul Urge & Birthday numbers.', icon: <Calculator className="w-6 h-6 text-amber-400" />, tag: 'Numbers' }
    ]
  },
  {
    category: '📜 Personal Identity & Master Dossier',
    icon: '📜',
    color: 'border-amber-500/30 bg-amber-500/5',
    desc: 'Manage your birth details and generate high-res printable documents.',
    studios: [
      { id: 'editProfile', title: 'My Birth Details & Settings', desc: 'Edit birth name, date, time & city location coordinates.', icon: <Edit3 className="w-6 h-6 text-amber-400" />, tag: 'Profile' },
      { id: 'report', title: 'Master Dossier Report', desc: 'Complete high-resolution printable comprehensive blueprint.', icon: <FileText className="w-6 h-6 text-amber-400" />, tag: 'Printable' }
    ]
  }
];

export default function OverviewDashboard({ profile, onNavigate, onOpenTheme, onOpenShare }) {
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
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const phoneDirectUrl = isLocalHost 
    ? 'https://wonder-lobby-chelsea-enters.trycloudflare.com' 
    : (typeof window !== 'undefined' ? window.location.origin : 'https://wonder-lobby-chelsea-enters.trycloudflare.com');
  const wifiDirectUrl = 'http://192.168.86.210:3210';
  const qrDirect = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=F59E0B&bgcolor=060814&data=${encodeURIComponent(phoneDirectUrl)}`;

  const handleCopyPhoneLink = (url) => {
    navigator.clipboard.writeText(url || phoneDirectUrl).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    });
  };

  return (
    <div className="overview-dashboard-page space-y-8">
      {/* ============================================================ */}
      {/* 🌟 Playful & Cheerful Hero Greeting Banner */}
      {/* ============================================================ */}
      <div className="dash-hero glass-panel p-6 md:p-8 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-900/95 via-slate-950/98 to-amber-950/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="dash-hero-content max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> 
              <span>Your Sovereign Cosmic Blueprint</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{profile.name}</span>! ✨
            </h1>
            
            <p className="text-slate-200 font-medium mt-2 text-sm md:text-base leading-relaxed">
              Born on <strong className="text-white">{secData.dateFormatted}, {profile.birthYear}</strong> in <strong className="text-white">{profile.cityName}</strong> • <span className="text-cyan-300 font-bold bg-cyan-500/15 px-2.5 py-0.5 rounded-lg">{secData.cusp}</span>
            </p>

            {/* Direct Action Buttons */}
            <div className="hero-profile-actions flex flex-wrap gap-3 mt-4">
              <button 
                onClick={() => onNavigate('editProfile')}
                className="btn-gold text-xs md:text-sm py-2.5 px-5 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-amber-500/30 hover:scale-105 transition-all bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950"
              >
                <Edit3 className="w-4 h-4" /> Customize My Birth Info
              </button>
              <button 
                onClick={() => onNavigate('newProfile')}
                className="btn-secondary text-xs md:text-sm py-2.5 px-5 rounded-2xl flex items-center gap-2 text-slate-200 hover:text-amber-300 bg-slate-900/80 border border-slate-700/60 hover:border-amber-400/50 hover:bg-slate-800 transition-all font-semibold"
              >
                <UserPlus className="w-4 h-4 text-cyan-300" /> Add Another Person
              </button>
            </div>
          </div>

          {/* Playful Quick Capsules */}
          <div className="hero-quick-badges flex flex-wrap gap-2.5 items-center">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/40 min-w-[95px] text-center shadow-lg hover:scale-105 transition-transform">
              <span className="text-[11px] font-bold text-amber-300 block">Life Path</span>
              <span className="text-2xl font-black text-white block mt-0.5">{lifePath}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-400/40 min-w-[95px] text-center shadow-lg hover:scale-105 transition-transform">
              <span className="text-[11px] font-bold text-cyan-300 block">Sun Sign</span>
              <span className="text-base font-bold text-white block mt-0.5 truncate">{astroData.planets.Sun.zodiac.symbol} {astroData.planets.Sun.zodiac.sign}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-400/40 min-w-[95px] text-center shadow-lg hover:scale-105 transition-transform">
              <span className="text-[11px] font-bold text-purple-300 block">Moon Sign</span>
              <span className="text-base font-bold text-white block mt-0.5 truncate">{astroData.planets.Moon.zodiac.symbol} {astroData.planets.Moon.zodiac.sign}</span>
            </div>
            <button 
              onClick={onOpenTheme}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-pink-400/40 min-w-[90px] text-center hover:border-amber-400 hover:scale-105 transition-all shadow-lg group"
              title="Customize App Colors & Text Style"
            >
              <Palette className="w-5 h-5 text-pink-400 group-hover:text-amber-400 mx-auto mb-0.5 transition-colors" />
              <span className="text-[11px] font-bold text-pink-300 block">Aesthetics</span>
            </button>
            <button 
              onClick={handleShareBlueprint}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-400/40 min-w-[90px] text-center hover:border-amber-400 hover:scale-105 transition-all shadow-lg group"
              title="Share Cosmic Blueprint"
            >
              <Share2 className="w-5 h-5 text-emerald-400 group-hover:text-amber-400 mx-auto mb-0.5 transition-colors" />
              <span className="text-[11px] font-bold text-emerald-300 block">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🚀 Playful "Jump In" Quick Launch Bar (5 Top Studios) */}
      {/* ============================================================ */}
      <div className="quick-launch-bar space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
            Quick Launch Favorites
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { id: 'astrology', label: 'Birth Chart', icon: <Compass className="w-5 h-5 text-cyan-400" />, emoji: '🪐', color: 'hover:border-cyan-400 hover:bg-cyan-500/10' },
            { id: 'secretLanguage', label: 'Day Archetype', icon: <BookOpen className="w-5 h-5 text-amber-400" />, emoji: '📖', color: 'hover:border-amber-400 hover:bg-amber-500/10' },
            { id: 'grimoire', label: 'Occult Grimoire', icon: <Flame className="w-5 h-5 text-rose-400" />, emoji: '🔮', color: 'hover:border-rose-400 hover:bg-rose-500/10' },
            { id: 'dream', label: 'Dream Sanctuary', icon: <Moon className="w-5 h-5 text-cyan-400" />, emoji: '🌙', color: 'hover:border-cyan-400 hover:bg-cyan-500/10' },
            { id: 'synastry', label: 'Twin Flame Match', icon: <HeartHandshake className="w-5 h-5 text-pink-400" />, emoji: '💖', color: 'hover:border-pink-400 hover:bg-pink-500/10' }
          ].map(hub => (
            <button
              key={hub.id}
              onClick={() => onNavigate(hub.id)}
              className={`p-4 rounded-2xl glass-panel bg-slate-900/80 border border-slate-700/60 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-105 shadow-md ${hub.color}`}
            >
              <span className="text-2xl">{hub.emoji}</span>
              <strong className="text-xs md:text-sm font-bold text-white block">{hub.label}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🌟 Active Identity Details Card */}
      {/* ============================================================ */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-400/30 bg-slate-950/90 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs md:text-sm w-full md:w-auto">
          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 flex items-center justify-center text-amber-400 flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Profile</span>
              <span className="text-white font-bold">{profile.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="w-9 h-9 rounded-2xl bg-cyan-400/15 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Birth Date</span>
              <span className="text-white font-bold">{secData.dateFormatted}, {profile.birthYear}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="w-9 h-9 rounded-2xl bg-purple-400/15 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Birth Time</span>
              <span className="text-white font-bold">
                {profile.unknownTime ? 'Time Unknown' : `${profile.birthHour % 12 || 12}:${String(profile.birthMinute || 0).padStart(2, '0')} ${profile.amPm || (profile.birthHour >= 12 ? 'PM' : 'AM')}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="w-9 h-9 rounded-2xl bg-emerald-400/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
              <span className="text-white font-bold truncate max-w-[140px] block">{profile.cityName}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('editProfile')}
          className="btn-secondary text-xs md:text-sm py-2.5 px-4 rounded-2xl text-amber-300 font-bold flex items-center gap-2 hover:bg-amber-400/15 border border-amber-400/40 transition-all flex-shrink-0 w-full md:w-auto justify-center"
        >
          <Edit3 className="w-4 h-4" /> Edit Birth Details
        </button>
      </div>

      {/* ============================================================ */}
      {/* 📱 Instant Mobile QR Code Access Bar */}
      {/* ============================================================ */}
      <div className="glass-panel p-5 rounded-3xl no-print border border-amber-400/30 bg-slate-950/80 shadow-lg">
        <div className="phone-access-content flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="phone-qr-mini flex-shrink-0 mx-auto sm:mx-0">
            <img src={qrDirect} alt="Scan to open on phone" width={90} height={90} className="rounded-2xl border border-amber-400/40 shadow-xl" />
          </div>
          <div className="phone-access-text flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white">Instant Phone & Mobile App Access</h4>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
              Scan this QR code with your iPhone or Android camera to launch Astraea instantly with full touch controls!
            </p>
            <div className="phone-link-row mt-3 flex flex-wrap items-center gap-2">
              <code className="text-xs text-amber-300 font-mono font-bold bg-black/60 py-1.5 px-3 rounded-xl border border-amber-400/30 truncate max-w-full sm:max-w-md">
                {phoneDirectUrl}
              </code>
              <button onClick={() => handleCopyPhoneLink(phoneDirectUrl)} className="btn-gold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 font-bold bg-amber-400 text-slate-950">
                {copiedPhone ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
              </button>
              {onOpenShare && (
                <button 
                  onClick={onOpenShare} 
                  className="py-1.5 px-4 rounded-xl text-xs font-bold bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25 flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" /> Invite Testers & Custom Message
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              <span>Local Wi-Fi Alternative: <button onClick={() => handleCopyPhoneLink(wifiDirectUrl)} className="text-cyan-400 font-mono font-bold hover:underline">{wifiDirectUrl}</button></span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🔮 Master Studios Directory (All 16 Studios Categorized) */}
      {/* ============================================================ */}
      <div className="studios-master-section space-y-8 pt-2">
        <div>
          <h2 className="text-2xl md:text-3xl text-white font-extrabold tracking-tight">
            All 16 Cosmic Studios & Tools ✨
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Tap any studio below to jump in immediately.
          </p>
        </div>

        {STUDIO_COLLECTIONS.map((collection) => (
          <div key={collection.category} className="studio-collection-group space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{collection.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {collection.category}
                </h3>
                <p className="text-xs text-slate-400">{collection.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {collection.studios.map((studio) => (
                <div
                  key={studio.id}
                  onClick={() => onNavigate(studio.id)}
                  className="studio-card glass-panel p-5 rounded-3xl border border-amber-400/20 bg-slate-950/85 hover:border-amber-400/60 hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400/40 transition-all shadow-md">
                        {studio.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700/60 group-hover:border-amber-400/40 group-hover:text-amber-300 transition-colors">
                        {studio.tag}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {studio.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-medium">
                      {studio.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-400/10 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
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
