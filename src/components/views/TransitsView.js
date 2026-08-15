import React from 'react';
import { calculateDailyTransits } from '../../utils/transitEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Compass } from 'lucide-react';

export default function TransitsView({ profile, onNavigate }) {
  const transitData = calculateDailyTransits(profile);

  return (
    <div className="transits-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Compass className="title-icon text-gold" />
          <div>
            <h2>Real-Time Planetary Transits Radar</h2>
            <p>Active Cosmic Transits for {profile.name} • {transitData.todayFormatted}</p>
          </div>
        </div>
      </div>

      {/* Today's Planetary Positions Banner */}
      <div className="glass-panel transit-banner mt-6 text-center">
        <div className="transit-hero-badges">
          <span className="badge-item">☀️ Today's Sun: <strong className="text-gold">{transitData.transitSun}</strong></span>
          <span className="badge-item">☽ Today's Moon: <strong className="text-cyan">{transitData.transitMoon}</strong></span>
        </div>
        <p className="mt-3 text-silver">Current sky transits evaluated against your natal chart placements.</p>
      </div>

      {/* Active Transits Table */}
      <div className="glass-panel transits-table-container mt-6">
        <h3>Active Personal Transits ({transitData.transits.length} Connections)</h3>
        {transitData.transits.length === 0 ? (
          <p className="p-4 text-silver">The planets are currently building quiet energy for your next major transit cycle.</p>
        ) : (
          <table className="custom-table mt-4">
            <thead>
              <tr>
                <th>Transit Sky Body</th>
                <th>Aspect</th>
                <th>Natal Chart Body</th>
                <th>Orb</th>
                <th>Cosmic Influence</th>
              </tr>
            </thead>
            <tbody>
              {transitData.transits.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.transitSymbol} Transit {t.transitPlanet} ({t.transitSign})</td>
                  <td><span style={{ color: t.color, fontWeight: 'bold' }}>{t.aspectSymbol} {t.aspect}</span></td>
                  <td>{t.natalSymbol} Natal {t.natalPlanet} ({t.natalSign})</td>
                  <td>{t.orb}°</td>
                  <td><span className="pill-tag" style={{ backgroundColor: `${t.color}25`, color: t.color, borderColor: t.color }}>{t.impact}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="secretLanguage" 
          prevLabel="Secret Language" 
          nextView="karma" 
          nextLabel="Past-Life Karma" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
