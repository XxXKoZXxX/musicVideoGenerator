import React from 'react';
import { getSecretLanguageProfile } from '../../data/secretLanguageData';
import { TAROT_DECK } from '../../utils/tarotEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Sparkles, Heart, ShieldAlert, Activity, BookOpen, Quote, Share2 } from 'lucide-react';
import { shareCosmicContent } from '../../utils/mobileShare';

export default function SecretLanguageView({ profile, onNavigate }) {
  const secData = getSecretLanguageProfile(profile.birthMonth, profile.birthDay);
  const dayTarotCard = TAROT_DECK.find(c => c.number === secData.tarotCardNumber && c.arcana === "Major") || TAROT_DECK[0];

  const handleShareArchetype = () => {
    shareCosmicContent({
      title: `${profile.name}'s Secret Language Archetype: ${secData.title}`,
      text: `✨ ${profile.name}'s Secret Language Archetype: '${secData.title}' (${secData.dateFormatted})\n\n📜 Major Life Theme: ${secData.lifeTheme}\n\n🧘 Meditation: "${secData.meditation}"`
    });
  };

  return (
    <div className="secret-language-page">
      {/* Banner Card */}
      <div className="secret-hero glass-panel">
        <div className="flex justify-between items-center w-full">
          <div className="hero-badge-tag">{secData.dateFormatted} • {secData.cusp}</div>
          <button 
            onClick={handleShareArchetype} 
            className="btn btn-secondary text-xs flex items-center gap-1.5"
            title="Share Archetype"
          >
            <Share2 className="w-3.5 h-3.5 text-gold" />
            <span>Share</span>
          </button>
        </div>
        <h1 className="archetype-title text-gold mt-2">{secData.title}</h1>
        <p className="hero-subtitle">The Secret Language Profile for {profile.name}</p>
        
        <div className="meditation-box">
          <Quote className="quote-icon" />
          <p className="meditation-text">"{secData.meditation}"</p>
          <span className="meditation-label">Daily Meditation</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="sec-grid mt-6">
        {/* Personality Deep-Dive */}
        <div className="glass-panel sec-main-card">
          <div className="card-header-with-icon">
            <BookOpen className="w-6 h-6 text-cyan" />
            <h3>Core Psychological Profile</h3>
          </div>
          <p className="sec-text-body">{secData.personalityText}</p>

          <div className="life-theme-box">
            <h4>Major Life Theme</h4>
            <p>{secData.lifeTheme}</p>
          </div>

          <div className="health-box mt-4">
            <div className="card-header-with-icon">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h4>Health & Wellness Advice</h4>
            </div>
            <p>{secData.healthAdvice}</p>
          </div>
        </div>

        {/* Side Panel: Traits & Day Tarot */}
        <div className="sec-side-panel">
          {/* Strengths & Weaknesses */}
          <div className="glass-panel traits-card">
            <h4><Sparkles className="inline-icon text-gold" /> Key Character Traits</h4>
            
            <div className="trait-group mt-3">
              <span className="group-label text-emerald-400"><Heart className="w-4 h-4" /> Core Strengths</span>
              <div className="pill-tags">
                {secData.strengths.map((s, i) => (
                  <span key={i} className="pill-tag strength">{s}</span>
                ))}
              </div>
            </div>

            <div className="trait-group mt-4">
              <span className="group-label text-rose-400"><ShieldAlert className="w-4 h-4" /> Shadow Challenges</span>
              <div className="pill-tags">
                {secData.weaknesses.map((w, i) => (
                  <span key={i} className="pill-tag shadow">{w}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Day Tarot Card */}
          <div className="glass-panel day-tarot-card">
            <h4>Day Tarot Archetype</h4>
            <div className="tarot-mini-preview">
              <div className="mini-card-frame">
                <span className="mini-card-number">{dayTarotCard.name.split('.')[0]}</span>
                <h5>{dayTarotCard.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h5>
                <span className="mini-card-elem">{dayTarotCard.element} • {dayTarotCard.astrology}</span>
              </div>
              <p className="tarot-short-meaning">{dayTarotCard.upright}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="astrology" 
          prevLabel="Astrology Birth Chart" 
          nextView="transits" 
          nextLabel="Transits Radar" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
