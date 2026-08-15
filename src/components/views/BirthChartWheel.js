import React, { useState } from 'react';
import { ZODIAC_SIGNS } from '../../utils/astrologyEngine';

export default function BirthChartWheel({ astroData }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!astroData || !astroData.planets) return null;

  const size = 600;
  const center = size / 2;
  const outerRadius = 260;
  const innerRadius = 200;
  const houseRadius = 140;
  const centerRadius = 50;

  const ascDeg = astroData.planets.Ascendant.longitude;

  // Convert zodiac degree to SVG angle, placing Ascendant at 9 o'clock (180 deg SVG angle)
  const degToAngle = (deg) => {
    let diff = (deg - ascDeg + 360) % 360;
    // Map so Ascendant (diff=0) is at 180° (left) and rotates counter-clockwise
    let angleRad = (180 + diff) * (Math.PI / 180);
    return angleRad;
  };

  const getXY = (deg, radius) => {
    const rad = degToAngle(deg);
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  const planetsList = Object.values(astroData.planets);

  return (
    <div className="birth-chart-wheel-container glass-panel">
      <div className="wheel-header">
        <h3>Interactive Birth Chart Wheel</h3>
        <p>Ascendant positioned at 9 o'clock. Hover over planets & aspect lines for details.</p>
      </div>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="chart-svg">
          {/* Outer Zodiac Ring */}
          <circle cx={center} cy={center} r={outerRadius} className="ring-outer" />
          <circle cx={center} cy={center} r={innerRadius} className="ring-inner" />
          <circle cx={center} cy={center} r={houseRadius} className="ring-house" />
          <circle cx={center} cy={center} r={centerRadius} className="ring-center" />

          {/* Zodiac Sign Divisions (12x 30° sectors) */}
          {ZODIAC_SIGNS.map((sign, idx) => {
            const startDeg = sign.startDeg;
            const midDeg = startDeg + 15;

            const p1 = getXY(startDeg, innerRadius);
            const p2 = getXY(startDeg, outerRadius);
            const labelPos = getXY(midDeg, (outerRadius + innerRadius) / 2);

            return (
              <g key={sign.name} className="zodiac-sector">
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="zodiac-divider" />
                <text 
                  x={labelPos.x} 
                  y={labelPos.y} 
                  className="zodiac-symbol" 
                  dominantBaseline="central" 
                  textAnchor="middle"
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}

          {/* House Lines & Numbers */}
          {astroData.houses.map((h) => {
            const lineP1 = getXY(h.cuspDeg, centerRadius);
            const lineP2 = getXY(h.cuspDeg, innerRadius);

            const nextCusp = astroData.houses[h.houseNumber % 12].cuspDeg;
            let midCusp = (h.cuspDeg + ((nextCusp - h.cuspDeg + 360) % 360) / 2) % 360;
            const textPos = getXY(midCusp, (houseRadius + centerRadius) / 2);

            return (
              <g key={`house_${h.houseNumber}`}>
                <line 
                  x1={lineP1.x} 
                  y1={lineP1.y} 
                  x2={lineP2.x} 
                  y2={lineP2.y} 
                  className={`house-line ${h.houseNumber === 1 || h.houseNumber === 10 ? 'axis-line' : ''}`} 
                />
                <text 
                  x={textPos.x} 
                  y={textPos.y} 
                  className="house-number" 
                  dominantBaseline="central" 
                  textAnchor="middle"
                >
                  {h.houseNumber}
                </text>
              </g>
            );
          })}

          {/* Aspect Lines between Planets */}
          {astroData.aspects.map((asp, i) => {
            const p1 = astroData.planets[asp.p1];
            const p2 = astroData.planets[asp.p2];
            if (!p1 || !p2) return null;

            const pos1 = getXY(p1.longitude, centerRadius);
            const pos2 = getXY(p2.longitude, centerRadius);

            const isHovered = hoveredItem && hoveredItem.type === 'aspect' && hoveredItem.data.summary === asp.summary;

            return (
              <line 
                key={`asp_${i}`}
                x1={pos1.x} 
                y1={pos1.y} 
                x2={pos2.x} 
                y2={pos2.y}
                stroke={asp.color}
                strokeWidth={isHovered ? 3 : 1}
                strokeDasharray={asp.aspect === 'Square' || asp.aspect === 'Opposition' ? '3,3' : 'none'}
                opacity={isHovered ? 1 : 0.45}
                className="aspect-line"
                onMouseEnter={() => setHoveredItem({ type: 'aspect', data: asp })}
                onMouseLeave={() => setHoveredItem(null)}
              />
            );
          })}

          {/* Planet Markers */}
          {planetsList.map((p) => {
            const planetPos = getXY(p.longitude, (innerRadius + houseRadius) / 2);
            const isHovered = hoveredItem && hoveredItem.type === 'planet' && hoveredItem.data.id === p.id;

            return (
              <g 
                key={p.id} 
                className="planet-group"
                onMouseEnter={() => setHoveredItem({ type: 'planet', data: p })}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle 
                  cx={planetPos.x} 
                  cy={planetPos.y} 
                  r={isHovered ? 16 : 13} 
                  fill="#0B0C10"
                  stroke={p.color}
                  strokeWidth={2}
                  className="planet-node"
                />
                <text 
                  x={planetPos.x} 
                  y={planetPos.y} 
                  fill={p.color} 
                  className="planet-symbol" 
                  dominantBaseline="central" 
                  textAnchor="middle"
                >
                  {p.symbol}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip display */}
      <div className="wheel-tooltip-panel">
        {hoveredItem ? (
          hoveredItem.type === 'planet' ? (
            <div className="tooltip-content">
              <span className="tooltip-badge" style={{ color: hoveredItem.data.color }}>
                {hoveredItem.data.symbol} {hoveredItem.data.name}
              </span>
              <p><strong>Placement:</strong> {hoveredItem.data.zodiac.formatted} in House {hoveredItem.data.house}</p>
              <p className="tooltip-desc">{hoveredItem.data.description}</p>
            </div>
          ) : (
            <div className="tooltip-content">
              <span className="tooltip-badge" style={{ color: hoveredItem.data.color }}>
                {hoveredItem.data.p1Symbol} {hoveredItem.data.aspect} {hoveredItem.data.p2Symbol}
              </span>
              <p><strong>Aspect Summary:</strong> {hoveredItem.data.summary}</p>
              <p className="tooltip-desc">{hoveredItem.data.nature}</p>
            </div>
          )
        ) : (
          <div className="tooltip-placeholder">
            <span>✨ Hover over any celestial body or aspect line in the wheel for deep reading</span>
          </div>
        )}
      </div>
    </div>
  );
}
