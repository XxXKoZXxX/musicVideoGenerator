import React, { useState } from 'react';
import { calculateBirthTarotCards, getRandomTarotCards } from '../../utils/tarotEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Sparkles, RefreshCw, Eye } from 'lucide-react';

export default function TarotView({ profile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('birthCards');
  
  // Birth Cards
  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const birthCards = calculateBirthTarotCards(dateObj);

  const [dailyCard, setDailyCard] = useState(null);

  // 3-Card Spread State
  const [threeCardSpread, setThreeCardSpread] = useState(null);
  const [revealedCards, setRevealedCards] = useState([false, false, false]);

  const handleDrawDaily = () => {
    const card = getRandomTarotCards(1)[0];
    setDailyCard(card);
  };

  const handleDrawThreeCard = () => {
    const cards = getRandomTarotCards(3);
    setThreeCardSpread(cards);
    setRevealedCards([false, false, false]);
  };

  const flipThreeCard = (index) => {
    const updated = [...revealedCards];
    updated[index] = true;
    setRevealedCards(updated);
  };

  return (
    <div className="tarot-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Eye className="title-icon text-gold" />
          <div>
            <h2>Tarot & Oracle Studio</h2>
            <p>Esoteric 78-Card Deck Readings & Birth Tarot Archetypes</p>
          </div>
        </div>

        <div className="tab-pill-nav">
          <button 
            className={`tab-btn ${activeTab === 'birthCards' ? 'active' : ''}`}
            onClick={() => setActiveTab('birthCards')}
          >
            Birth Tarot Cards
          </button>
          <button 
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Tarot Draw
          </button>
          <button 
            className={`tab-btn ${activeTab === 'threeCard' ? 'active' : ''}`}
            onClick={() => setActiveTab('threeCard')}
          >
            3-Card Spread
          </button>
        </div>
      </div>

      {/* 1. Birth Cards View */}
      {activeTab === 'birthCards' && (
        <div className="tarot-content-area mt-6">
          <div className="birth-cards-grid">
            {/* Personality Card */}
            <div className="glass-panel tarot-card-display">
              <div className="card-badge-label">Personality Card</div>
              <div className="tarot-visual-box">
                <span className="arcana-num">{birthCards.personalityCard.name.split('.')[0]}</span>
                <h3 className="card-title">{birthCards.personalityCard.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h3>
                <span className="card-meta">{birthCards.personalityCard.element} • {birthCards.personalityCard.astrology}</span>
              </div>
              <div className="card-details">
                <div className="keywords-row">
                  {birthCards.personalityCard.keywords.map((kw, i) => (
                    <span key={i} className="kw-badge">{kw}</span>
                  ))}
                </div>
                <p className="meaning-text"><strong>Upright Meaning:</strong> {birthCards.personalityCard.upright}</p>
                <p className="symbolism-text"><strong>Symbolism:</strong> {birthCards.personalityCard.symbolism}</p>
              </div>
            </div>

            {/* Soul Card */}
            <div className="glass-panel tarot-card-display">
              <div className="card-badge-label soul">Soul Card</div>
              <div className="tarot-visual-box soul">
                <span className="arcana-num">{birthCards.soulCard.name.split('.')[0]}</span>
                <h3 className="card-title">{birthCards.soulCard.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h3>
                <span className="card-meta">{birthCards.soulCard.element} • {birthCards.soulCard.astrology}</span>
              </div>
              <div className="card-details">
                <div className="keywords-row">
                  {birthCards.soulCard.keywords.map((kw, i) => (
                    <span key={i} className="kw-badge">{kw}</span>
                  ))}
                </div>
                <p className="meaning-text"><strong>Upright Meaning:</strong> {birthCards.soulCard.upright}</p>
                <p className="symbolism-text"><strong>Symbolism:</strong> {birthCards.soulCard.symbolism}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Daily Draw View */}
      {activeTab === 'daily' && (
        <div className="tarot-content-area mt-6 text-center">
          <div className="daily-draw-container glass-panel">
            {!dailyCard ? (
              <div className="draw-prompt">
                <div className="card-back-stack">🂠</div>
                <h3>Draw Your Card of the Day</h3>
                <p>Focus your intent and tap below to reveal today's cosmic guidance.</p>
                <button onClick={handleDrawDaily} className="btn btn-primary-glow mt-4">
                  <Sparkles className="w-5 h-5 mr-2" /> Shuffle & Draw Daily Card
                </button>
              </div>
            ) : (
              <div className="daily-card-result">
                <div className={`tarot-visual-box ${dailyCard.isReversed ? 'reversed' : ''}`}>
                  <span className="arcana-num">{dailyCard.name.split('.')[0]}</span>
                  <h3 className="card-title">{dailyCard.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h3>
                  <span className="card-orientation">{dailyCard.isReversed ? 'Reversed ↺' : 'Upright ☀️'}</span>
                </div>
                <div className="result-text mt-4">
                  <p className="meaning-text">
                    {dailyCard.isReversed ? dailyCard.reversed : dailyCard.upright}
                  </p>
                  <button onClick={handleDrawDaily} className="btn btn-secondary mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" /> Draw Another Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Three Card Spread View */}
      {activeTab === 'threeCard' && (
        <div className="tarot-content-area mt-6">
          <div className="spread-header glass-panel text-center mb-6">
            <h3>Past • Present • Future 3-Card Spread</h3>
            <p>Select cards to flip and reveal your timeline orientation.</p>
            {!threeCardSpread && (
              <button onClick={handleDrawThreeCard} className="btn btn-primary-glow mt-4">
                <Sparkles className="w-5 h-5 mr-2" /> Deal 3-Card Spread
              </button>
            )}
          </div>

          {threeCardSpread && (
            <div className="three-cards-row">
              {['Past Influences', 'Present State', 'Future Path'].map((positionTitle, idx) => {
                const card = threeCardSpread[idx];
                const isFlipped = revealedCards[idx];

                return (
                  <div key={idx} className="spread-card-slot glass-panel">
                    <div className="slot-title">{positionTitle}</div>
                    {!isFlipped ? (
                      <div className="card-back-clickable" onClick={() => flipThreeCard(idx)}>
                        <span>✨ Tap to Reveal</span>
                      </div>
                    ) : (
                      <div className="flipped-card-body">
                        <h4 className="card-title">{card.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h4>
                        <span className="card-meta">{card.element} • {card.isReversed ? 'Reversed' : 'Upright'}</span>
                        <p className="card-desc mt-2">{card.isReversed ? card.reversed : card.upright}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="soundscape" 
          prevLabel="Sacred Frequencies" 
          nextView="tarotLibrary" 
          nextLabel="78-Card Encyclopedia" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
