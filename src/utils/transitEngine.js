// Real-Time Planetary Transit Calculation Engine

import { calculatePlanetaryPositions } from './astrologyEngine';

export function calculateDailyTransits(profile) {
  const natalDate = new Date(profile.birthYear, profile.birthMonth - 1, profile.birthDay);
  const natalAstro = calculatePlanetaryPositions(natalDate, profile.birthHour || 12, profile.birthMinute || 0, profile.lat, profile.lng);

  const today = new Date();
  const transitAstro = calculatePlanetaryPositions(today, 12, 0, profile.lat, profile.lng);

  const activeTransits = [];
  const transitingPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const natalPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Ascendant", "Midheaven"];

  transitingPlanets.forEach(tKey => {
    natalPlanets.forEach(nKey => {
      const tPlanet = transitAstro.planets[tKey];
      const nPlanet = natalAstro.planets[nKey];

      if (!tPlanet || !nPlanet) return;

      let diff = Math.abs(tPlanet.longitude - nPlanet.longitude);
      if (diff > 180) diff = 360 - diff;

      // Aspect detection
      const aspectsList = [
        { name: "Conjunction", symbol: "☌", angle: 0, orb: 6, impact: "High Fusion", color: "#F59E0B" },
        { name: "Sextile", symbol: "⚹", angle: 60, orb: 5, impact: "Opportunity Window", color: "#38BDF8" },
        { name: "Square", symbol: "□", angle: 90, orb: 6, impact: "Dynamic Growth Challenge", color: "#EF4444" },
        { name: "Trine", symbol: "△", angle: 120, orb: 6, impact: "Harmonious Flow & Luck", color: "#10B981" },
        { name: "Opposition", symbol: "☍", angle: 180, orb: 6, impact: "Karmic Awareness Peak", color: "#8B5CF6" }
      ];

      aspectsList.forEach(asp => {
        const orbDelta = Math.abs(diff - asp.angle);
        if (orbDelta <= asp.orb) {
          activeTransits.push({
            transitPlanet: tPlanet.name,
            transitSymbol: tPlanet.symbol,
            transitSign: tPlanet.zodiac.sign,
            aspect: asp.name,
            aspectSymbol: asp.symbol,
            natalPlanet: nPlanet.name,
            natalSymbol: nPlanet.symbol,
            natalSign: nPlanet.zodiac.sign,
            orb: orbDelta.toFixed(1),
            impact: asp.impact,
            color: asp.color,
            summary: `Transit ${tPlanet.name} in ${tPlanet.zodiac.sign} ${asp.name} Natal ${nPlanet.name} in ${nPlanet.zodiac.sign}`
          });
        }
      });
    });
  });

  return {
    todayFormatted: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    transits: activeTransits,
    transitSun: transitAstro.planets.Sun.zodiac.sign,
    transitMoon: transitAstro.planets.Moon.zodiac.sign
  };
}
