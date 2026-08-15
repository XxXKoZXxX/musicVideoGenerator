import React, { useState } from 'react';
import { TAROT_DECK } from '../../utils/tarotEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { BookOpen, Search, X } from 'lucide-react';

export default function TarotLibraryView({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuit, setSelectedSuit] = useState('All');
  const [activeCard, setActiveCard] = useState(null);

  const filteredCards = TAROT_DECK.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSuit = selectedSuit === 'All' ? true : 
                        selectedSuit === 'Major' ? c.arcana === 'Major' : c.suit === selectedSuit;

    return matchesSearch && matchesSuit;
  });

  return (
    <div className="tarot-library-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <BookOpen className="title-icon text-gold" />
          <div>
            <h2>Complete 78-Card Tarot Encyclopedia</h2>
            <p>Searchable Esoteric Deck Reference & Symbolism Guide</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel filter-bar mt-6">
        <div className="search-input-wrapper">
          <Search className="w-5 h-5 search-icon" />
          <input 
            type="text" 
            placeholder="Search cards, keywords (e.g. Joy, Transformation, Love)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field search-field"
          />
        </div>

        <div className="suit-filters">
          {['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'].map(suit => (
            <button 
              key={suit}
              className={`suit-btn ${selectedSuit === suit ? 'active' : ''}`}
              onClick={() => setSelectedSuit(suit)}
            >
              {suit}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="tarot-library-grid mt-6">
        {filteredCards.map(card => (
          <div 
            key={card.id} 
            className="tarot-lib-card glass-panel"
            onClick={() => setActiveCard(card)}
          >
            <div className="lib-card-frame">
              <span className="lib-card-num">{card.name.split('.')[0]}</span>
              <h4>{card.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h4>
              <span className="lib-card-suit">{card.suit} • {card.element}</span>
            </div>
            <p className="lib-card-desc">{card.upright}</p>
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      {activeCard && (
        <div className="modal-backdrop" onClick={() => setActiveCard(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeCard.name}</h3>
              <button onClick={() => setActiveCard(null)} className="drawer-close-btn">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="tarot-visual-box mb-4">
                <h3>{activeCard.name.replace(/^[0-9IVXLC]+\.\s*/, '')}</h3>
                <p>{activeCard.element} • {activeCard.astrology || activeCard.suit}</p>
              </div>

              <div className="keywords-row mb-4">
                {activeCard.keywords.map((kw, i) => (
                  <span key={i} className="kw-badge">{kw}</span>
                ))}
              </div>

              <p className="mb-2"><strong>☀️ Upright Meaning:</strong> {activeCard.upright}</p>
              <p className="mb-2"><strong>↺ Reversed Meaning:</strong> {activeCard.reversed}</p>
              {activeCard.symbolism && <p><strong>✨ Symbolism:</strong> {activeCard.symbolism}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="tarot" 
          prevLabel="Tarot Spreads" 
          nextView="numerology" 
          nextLabel="Numerology Matrix" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
