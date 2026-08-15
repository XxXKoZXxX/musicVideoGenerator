import React, { useState } from 'react';
import { 
  calculateLifePath, 
  calculateNameNumerology, 
  calculatePersonalYear, 
  NUMEROLOGY_MEANINGS 
} from '../../utils/numerologyEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { Hash, Sparkles, Heart, User, Sun, Calculator } from 'lucide-react';

export default function NumerologyView({ profile, onNavigate }) {
  const [selectedNum, setSelectedNum] = useState(null);

  const dateObj = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const lifePath = calculateLifePath(dateObj);
  const nameNum = calculateNameNumerology(profile.name);
  const personalYear = calculatePersonalYear(profile.birthMonth, profile.birthDay);

  const numbersData = [
    {
      id: 'lifePath',
      label: 'Life Path Number',
      num: lifePath,
      icon: <Sparkles className="w-5 h-5 text-gold" />,
      color: '#F59E0B',
      desc: 'Your core lifetime blueprint, primary soul mission, and inherent talents.'
    },
    {
      id: 'expression',
      label: 'Expression / Destiny',
      num: nameNum.expression,
      icon: <Hash className="w-5 h-5 text-sky-400" />,
      color: '#38BDF8',
      desc: 'Derived from full birth name. Reveals how you express your potential into physical reality.'
    },
    {
      id: 'soulUrge',
      label: "Soul Urge (Heart's Desire)",
      num: nameNum.soulUrge,
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      color: '#EC4899',
      desc: 'Calculated from vowels in name. Represents quiet soul cravings and deepest internal desires.'
    },
    {
      id: 'personality',
      label: 'Personality Number',
      num: nameNum.personality,
      icon: <User className="w-5 h-5 text-emerald-400" />,
      color: '#10B981',
      desc: 'Calculated from consonants. Reflects the outer impression you project to the world.'
    },
    {
      id: 'personalYear',
      label: `Personal Year (${new Date().getFullYear()})`,
      num: personalYear,
      icon: <Sun className="w-5 h-5 text-purple-400" />,
      color: '#A855F7',
      desc: 'Your active 9-year cycle theme for the current solar year.'
    }
  ];

  const activeNumObj = selectedNum ? numbersData.find(n => n.id === selectedNum) : numbersData[0];
  const activeMeaning = NUMEROLOGY_MEANINGS[activeNumObj.num] || NUMEROLOGY_MEANINGS[1];

  return (
    <div className="numerology-page">
      <div className="view-header glass-panel">
        <div className="view-title">
          <Calculator className="title-icon text-gold" />
          <div>
            <h2>Pythagorean Numerology Matrix</h2>
            <p>Calculated for {profile.name} • Born {profile.birthMonth}/{profile.birthDay}/{profile.birthYear}</p>
          </div>
        </div>
      </div>

      {/* Grid of Core 5 Numbers */}
      <div className="num-cards-grid mt-6">
        {numbersData.map((item) => (
          <div 
            key={item.id}
            className={`num-card glass-panel ${activeNumObj.id === item.id ? 'active-num' : ''}`}
            onClick={() => setSelectedNum(item.id)}
            style={{ borderColor: activeNumObj.id === item.id ? item.color : 'transparent' }}
          >
            <div className="num-card-header">
              {item.icon}
              <span className="num-card-label">{item.label}</span>
            </div>
            <div className="num-display-badge" style={{ backgroundColor: item.color }}>
              {item.num}
            </div>
            <p className="num-card-sub">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Deep Interpretation Panel */}
      <div className="glass-panel num-deep-panel mt-6">
        <div className="panel-header-badge">
          <span className="big-num-pill" style={{ backgroundColor: activeNumObj.color }}>
            Number {activeNumObj.num}
          </span>
          <div>
            <h3>{activeNumObj.label}: {activeMeaning.title}</h3>
            <span className="archetype-sub">{activeMeaning.archetype}</span>
          </div>
        </div>

        <div className="num-details-content mt-4">
          <div className="detail-section">
            <h4>✨ Natural Gifts & Powers</h4>
            <p>{activeMeaning.gifts}</p>
          </div>

          <div className="detail-section">
            <h4>⚡ Growth Challenges</h4>
            <p>{activeMeaning.challenges}</p>
          </div>

          <div className="detail-section">
            <h4>🔮 Spiritual Soul Lesson</h4>
            <p>{activeMeaning.spiritualLesson}</p>
          </div>
        </div>

        {/* Letter Breakdown if Expression/Soul/Personality selected */}
        {(activeNumObj.id === 'expression' || activeNumObj.id === 'soulUrge' || activeNumObj.id === 'personality') && (
          <div className="letter-breakdown-box mt-6">
            <h4>Pythagorean Letter Conversion Table</h4>
            <div className="letters-row">
              {nameNum.breakdown.map((lb, idx) => (
                <div key={idx} className={`letter-chip ${lb.type.toLowerCase()}`}>
                  <span className="chip-char">{lb.char}</span>
                  <span className="chip-val">{lb.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="tarotLibrary" 
          prevLabel="78-Card Encyclopedia" 
          nextView="synastry" 
          nextLabel="Dual Comparison Matrix" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
