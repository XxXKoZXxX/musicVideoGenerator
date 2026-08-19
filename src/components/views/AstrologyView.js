import React, { useState } from 'react';
import BirthChartWheel from './BirthChartWheel';
import ChapterPagination from '../navigation/ChapterPagination';
import { calculatePlanetaryPositions } from '../../utils/astrologyEngine';
import { Sparkles, Flame, Globe, Wind, Droplets } from 'lucide-react';
const getHouseDomainFocus = (hNum) => {
  const domains = {
    1: "Self-Identity, Physical Appearance, Vitality & First Impressions",
    2: "Personal Wealth, Possessions, Values & Material Security",
    3: "Mind, Communication, Siblings, Short Travels & Learning",
    4: "Home, Family Roots, Inner Sanctuary & Ancestral Ancestry",
    5: "Creative Expression, Romance, Joy, Children & Play",
    6: "Daily Routines, Wellness, Work Habits & Service",
    7: "Committed Relationships, Marriage, Contracts & Partnerships",
    8: "Transformation, Shared Wealth, Intimacy & Rebirth",
    9: "Higher Philosophy, Long Journeys, Wisdom & Belief Systems",
    10: "Career Vocation, Public Reputation, Mastery & Legacy",
    11: "Community, Hopes, Social Circles & Collective Dreams",
    12: "Subconscious Realm, Mysticism, Karma & Spiritual Renewal"
  };
  return domains[hNum] || "";
};

export default function AstrologyView({ astroData: propAstroData, profile, onNavigate = () => {} }) {
  const [activeTab, setActiveTab] = useState('placements');

  const resolvedAstroData = propAstroData || (() => {
    if (!profile) return null;
    const dateObj = new Date(profile.birthYear, (profile.birthMonth || 1) - 1, profile.birthDay || 1);
    return calculatePlanetaryPositions(
      dateObj, 
      profile.birthHour || 12, 
      profile.birthMinute || 0, 
      profile.lat || 41.0582, 
      profile.lng || -74.7529
    );
  })();

  if (!resolvedAstroData) return null;

  const astroData = resolvedAstroData;
  const planets = Object.values(astroData.planets);


  return (
    <div className="astrology-view-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Sparkles className="title-icon text-gold" />
          <div>
            <h2>Astrological Birth Chart Dossier</h2>
            <p>Calculated for {profile.name} • {profile.cityName}</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="tab-pill-nav">
          <button 
            className={`tab-btn ${activeTab === 'placements' ? 'active' : ''}`}
            onClick={() => setActiveTab('placements')}
          >
            Planetary Placements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'wheel' ? 'active' : ''}`}
            onClick={() => setActiveTab('wheel')}
          >
            Interactive Wheel
          </button>
          <button 
            className={`tab-btn ${activeTab === 'houses' ? 'active' : ''}`}
            onClick={() => setActiveTab('houses')}
          >
            12 Houses
          </button>
          <button 
            className={`tab-btn ${activeTab === 'aspects' ? 'active' : ''}`}
            onClick={() => setActiveTab('aspects')}
          >
            Aspects Matrix
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="astro-summary-grid">
        <div className="summary-card glass-panel">
          <span className="card-label">Sun Sign</span>
          <h3 className="card-val text-gold">{astroData.planets.Sun.zodiac.symbol} {astroData.planets.Sun.zodiac.sign}</h3>
          <p className="card-sub">{astroData.planets.Sun.zodiac.formatted}</p>
        </div>

        <div className="summary-card glass-panel">
          <span className="card-label">Moon Sign</span>
          <h3 className="card-val text-silver">{astroData.planets.Moon.zodiac.symbol} {astroData.planets.Moon.zodiac.sign}</h3>
          <p className="card-sub">{astroData.planets.Moon.zodiac.formatted}</p>
        </div>

        <div className="summary-card glass-panel">
          <span className="card-label">Rising (Ascendant)</span>
          <h3 className="card-val text-cyan">{astroData.planets.Ascendant.zodiac.symbol} {astroData.planets.Ascendant.zodiac.sign}</h3>
          <p className="card-sub">{astroData.planets.Ascendant.zodiac.formatted}</p>
        </div>

        <div className="summary-card glass-panel">
          <span className="card-label">Midheaven (MC)</span>
          <h3 className="card-val text-purple">{astroData.planets.Midheaven.zodiac.symbol} {astroData.planets.Midheaven.zodiac.sign}</h3>
          <p className="card-sub">{astroData.planets.Midheaven.zodiac.formatted}</p>
        </div>
      </div>

      {/* Elements & Modalities Balance */}
      <div className="balance-grid">
        <div className="glass-panel balance-card">
          <h4>Elemental Balance</h4>
          <div className="element-bars">
            <div className="bar-row">
              <span className="elem-label"><Flame className="w-4 h-4 text-red-500" /> Fire ({astroData.elements.Fire}%)</span>
              <div className="bar-track"><div className="bar-fill fire" style={{ width: `${astroData.elements.Fire}%` }}></div></div>
            </div>
            <div className="bar-row">
              <span className="elem-label"><Globe className="w-4 h-4 text-emerald-500" /> Earth ({astroData.elements.Earth}%)</span>
              <div className="bar-track"><div className="bar-fill earth" style={{ width: `${astroData.elements.Earth}%` }}></div></div>
            </div>
            <div className="bar-row">
              <span className="elem-label"><Wind className="w-4 h-4 text-sky-400" /> Air ({astroData.elements.Air}%)</span>
              <div className="bar-track"><div className="bar-fill air" style={{ width: `${astroData.elements.Air}%` }}></div></div>
            </div>
            <div className="bar-row">
              <span className="elem-label"><Droplets className="w-4 h-4 text-blue-500" /> Water ({astroData.elements.Water}%)</span>
              <div className="bar-track"><div className="bar-fill water" style={{ width: `${astroData.elements.Water}%` }}></div></div>
            </div>
          </div>
        </div>

        <div className="glass-panel balance-card">
          <h4>Modality Balance</h4>
          <div className="element-bars">
            <div className="bar-row">
              <span className="elem-label">Cardinal ({astroData.modalities.Cardinal}%)</span>
              <div className="bar-track"><div className="bar-fill cardinal" style={{ width: `${astroData.modalities.Cardinal}%` }}></div></div>
            </div>
            <div className="bar-row">
              <span className="elem-label">Fixed ({astroData.modalities.Fixed}%)</span>
              <div className="bar-track"><div className="bar-fill fixed" style={{ width: `${astroData.modalities.Fixed}%` }}></div></div>
            </div>
            <div className="bar-row">
              <span className="elem-label">Mutable ({astroData.modalities.Mutable}%)</span>
              <div className="bar-track"><div className="bar-fill mutable" style={{ width: `${astroData.modalities.Mutable}%` }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="tab-content-area mt-6">
        {activeTab === 'placements' && (
          <div className="planets-grid">
            {planets.map((p) => (
              <div key={p.id} className="planet-card glass-panel">
                <div className="planet-card-header">
                  <span className="planet-icon-badge" style={{ borderColor: p.color, color: p.color }}>
                    {p.symbol}
                  </span>
                  <div>
                    <h4>{p.name}</h4>
                    <span className="house-tag">House {p.house}</span>
                  </div>
                </div>
                <div className="planet-card-body">
                  <p className="placement-deg">{p.zodiac.formatted}</p>
                  <p className="placement-decan">{p.zodiac.decan} • {p.zodiac.element} ({p.zodiac.modality})</p>
                  <p className="planet-desc">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wheel' && (
          <BirthChartWheel astroData={astroData} />
        )}

        {activeTab === 'houses' && (
          <div className="houses-table-container glass-panel">
            <h3>12 Astrological Houses Breakdown</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>House</th>
                  <th>Cusp Zodiac Sign</th>
                  <th>Exact Degree</th>
                  <th>Life Domain Focus</th>
                </tr>
              </thead>
              <tbody>
                {astroData.houses.map(h => (
                  <tr key={h.houseNumber}>
                    <td><span className="house-num-badge">House {h.houseNumber}</span></td>
                    <td>{h.zodiac.symbol} {h.zodiac.sign}</td>
                    <td>{h.zodiac.formatted}</td>
                    <td>{getHouseDomainFocus(h.houseNumber)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'aspects' && (
          <div className="aspects-table-container glass-panel">
            <h3>Planetary Aspects Matrix ({astroData.aspects.length} Active Connections)</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Planet 1</th>
                  <th>Aspect</th>
                  <th>Planet 2</th>
                  <th>Orb</th>
                  <th>Cosmic Nature</th>
                </tr>
              </thead>
              <tbody>
                {astroData.aspects.map((asp, idx) => (
                  <tr key={idx}>
                    <td>{asp.p1Symbol} {asp.p1}</td>
                    <td><span style={{ color: asp.color, fontWeight: 'bold' }}>{asp.aspectSymbol} {asp.aspect}</span></td>
                    <td>{asp.p2Symbol} {asp.p2}</td>
                    <td>{asp.orb}°</td>
                    <td>{asp.nature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="overview" 
          prevLabel="Dashboard" 
          nextView="secretLanguage" 
          nextLabel="Secret Language Archetype" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
