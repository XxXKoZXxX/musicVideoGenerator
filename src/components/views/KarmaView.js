import React from 'react';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Key } from 'lucide-react';

export default function KarmaView({ profile, onNavigate }) {
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const astro = calculatePlanetaryPositions(dateObj, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);

  const northNode = astro.planets.NorthNode;
  const chiron = astro.planets.Chiron;
  const saturn = astro.planets.Saturn;

  return (
    <div className="karma-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Key className="title-icon text-gold" />
          <div>
            <h2>Karmic Past-Life & Soul Contract Decoder</h2>
            <p>Unlocking Past Life Instincts, Chiron Sacred Wound & Evolutionary Soul Mission</p>
          </div>
        </div>
      </div>

      <div className="karma-cards-grid mt-6">
        {/* North Node Destiny */}
        <div className="glass-panel karma-card">
          <div className="karma-badge north">North Node (Soul Destiny)</div>
          <h3>North Node in {northNode.zodiac.sign}</h3>
          <p className="karma-deg">{northNode.zodiac.formatted} • House {northNode.house}</p>
          <div className="karma-text mt-4">
            <p><strong>Evolutionary Soul Mission:</strong> Your North Node in {northNode.zodiac.sign} represents the uncharted territory your soul is calling you to embrace in this lifetime. Moving into {northNode.zodiac.element} energy expands your spiritual horizon.</p>
          </div>
        </div>

        {/* Chiron Wounded Healer */}
        <div className="glass-panel karma-card">
          <div className="karma-badge chiron">Chiron (Wounded Healer)</div>
          <h3>Chiron in {chiron.zodiac.sign}</h3>
          <p className="karma-deg">{chiron.zodiac.formatted} • House {chiron.house}</p>
          <div className="karma-text mt-4">
            <p><strong>Sacred Wound & Mastery Gift:</strong> Chiron in {chiron.zodiac.sign} pinpoints where you felt deep vulnerability early in life. By transforming this wound, you gain an extraordinary gift for healing and empowering others in House {chiron.house}.</p>
          </div>
        </div>

        {/* Saturn Karma */}
        <div className="glass-panel karma-card">
          <div className="karma-badge saturn">Saturn (Karmic Teacher)</div>
          <h3>Saturn in {saturn.zodiac.sign}</h3>
          <p className="karma-deg">{saturn.zodiac.formatted} • House {saturn.house}</p>
          <div className="karma-text mt-4">
            <p><strong>Lifetime Discipline & Mastery:</strong> Saturn in {saturn.zodiac.sign} reveals your major karmic exam. Through patience, structure, and integrity in House {saturn.house}, you build an unshakeable legacy.</p>
          </div>
        </div>
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="transits" 
          prevLabel="Transits Radar" 
          nextView="podcast" 
          nextLabel="Dual-Host Podcast" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
