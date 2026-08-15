// Astronomical and Astrological Calculation Engine for Astraea

export const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars", startDeg: 0 },
  { name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus", startDeg: 30 },
  { name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury", startDeg: 60 },
  { name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon", startDeg: 90 },
  { name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun", startDeg: 120 },
  { name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury", startDeg: 150 },
  { name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus", startDeg: 180 },
  { name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Pluto / Mars", startDeg: 210 },
  { name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter", startDeg: 240 },
  { name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn", startDeg: 270 },
  { name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Uranus / Saturn", startDeg: 300 },
  { name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Neptune / Jupiter", startDeg: 330 },
];

export const PLANETS_META = {
  Sun: { name: "Sun", symbol: "☉", color: "#F59E0B", description: "Core Identity, Vitality, Ego & Willpower" },
  Moon: { name: "Moon", symbol: "☽", color: "#E2E8F0", description: "Emotional Inner World, Instincts & Subconscious" },
  Mercury: { name: "Mercury", symbol: "☿", color: "#38BDF8", description: "Intellectual Mind, Communication & Learning Style" },
  Venus: { name: "Venus", symbol: "♀", color: "#EC4899", description: "Love, Relationships, Values, Aesthetics & Pleasure" },
  Mars: { name: "Mars", symbol: "♂", color: "#EF4444", description: "Drive, Ambition, Passion, Action & Instinctive Force" },
  Jupiter: { name: "Jupiter", symbol: "♃", color: "#10B981", description: "Expansion, Wisdom, Good Fortune & Higher Truths" },
  Saturn: { name: "Saturn", symbol: "♄", color: "#F97316", description: "Karma, Discipline, Structure, Lessons & Boundaries" },
  Uranus: { name: "Uranus", symbol: "♅", color: "#06B6D4", description: "Innovation, Sudden Breakthroughs, Rebellion & Genius" },
  Neptune: { name: "Neptune", symbol: "♆", color: "#8B5CF6", description: "Dreams, Mysticism, Intuition, Art & Imagination" },
  Pluto: { name: "Pluto", symbol: "♇", color: "#D946EF", description: "Rebirth, Transformation, Power & Deep Evolution" },
  Chiron: { name: "Chiron", symbol: "⚷", color: "#A855F7", description: "The Wounded Healer, Core Soul Vulnerability & Mastery" },
  NorthNode: { name: "North Node", symbol: "☊", color: "#EAB308", description: "Karmic Purpose, Future Growth & Soul Destiny" },
  Ascendant: { name: "Ascendant (Rising)", symbol: "Asc", color: "#F43F5E", description: "Outer Persona, First Impression & Physical Vitality" },
  Midheaven: { name: "Midheaven (MC)", symbol: "MC", color: "#6366F1", description: "Public Reputation, Vocation & Life Ambitions" }
};

export function degreeToZodiac(deg) {
  let normalized = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDeg = normalized % 30;
  const degInt = Math.floor(signDeg);
  const minInt = Math.floor((signDeg - degInt) * 60);
  const sign = ZODIAC_SIGNS[signIndex];
  
  // Decan
  let decanNum = Math.floor(signDeg / 10) + 1;
  let decanDesc = `${decanNum}${decanNum === 1 ? 'st' : decanNum === 2 ? 'nd' : 'rd'} Decan`;

  return {
    rawDeg: normalized,
    sign: sign.name,
    symbol: sign.symbol,
    element: sign.element,
    modality: sign.modality,
    ruler: sign.ruler,
    degrees: degInt,
    minutes: minInt,
    formatted: `${degInt}° ${minInt}' ${sign.name}`,
    decan: decanDesc,
    decanNumber: decanNum
  };
}

// Convert Date & Time & Coordinates to Julian Day Number
export function getJulianDay(dateObj, hour = 12, minute = 0, timezoneOffsetHours = 0) {
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  
  let utHour = hour + minute / 60.0 - timezoneOffsetHours;
  
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = utHour / 24.0;
  
  const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + B - 1524.5;
  return JD;
}

// Approximate Planetary Ecliptic Longitude Calculations
export function calculatePlanetaryPositions(dateObj, hour = 12, minute = 0, lat = 40.7128, lng = -74.0060) {
  // Timezone offset estimation from lng (15 deg per hr)
  const tzOffset = lng / 15.0;
  const JD = getJulianDay(dateObj, hour, minute, tzOffset);
  const d = JD - 2451545.0; // days since J2000.0

  // 1. Sun
  let L_sun = (280.466 + 0.98564736 * d) % 360;
  let g_sun = ((357.528 + 0.9856003 * d) % 360) * (Math.PI / 180);
  let sunLong = L_sun + 1.915 * Math.sin(g_sun) + 0.020 * Math.sin(2 * g_sun);
  sunLong = (sunLong + 360) % 360;

  // 2. Moon
  let L_moon = (218.316 + 13.176396 * d) % 360;
  let M_moon = ((134.963 + 13.064993 * d) % 360) * (Math.PI / 180);
  let moonLong = L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(M_moon - 2 * g_sun) + 0.658 * Math.sin(2 * g_sun);
  moonLong = (moonLong + 360) % 360;

  // 3. Mercury
  let mercuryLong = (sunLong + 18.2 * Math.sin((d * 0.041 + 1.5)) + 12 * Math.cos((d * 0.02 + 0.5))) % 360;
  mercuryLong = (mercuryLong + 360) % 360;

  // 4. Venus
  let venusLong = (sunLong + 26.5 * Math.sin((d * 0.016 + 2.1)) + 15 * Math.sin((d * 0.008))) % 360;
  venusLong = (venusLong + 360) % 360;

  // 5. Mars
  let N_mars = (49.557 + 0.00002761 * d) % 360;
  let marsLong = (sunLong + 45.0 * Math.sin((d * 0.00524 + 0.8)) + N_mars * 0.1) % 360;
  marsLong = (marsLong + 360) % 360;

  // 6. Jupiter
  let jupiterLong = (34.35 + 0.08309 * d + 4.5 * Math.sin(d * 0.001)) % 360;
  jupiterLong = (jupiterLong + 360) % 360;

  // 7. Saturn
  let saturnLong = (50.08 + 0.03346 * d + 3.2 * Math.cos(d * 0.0005)) % 360;
  saturnLong = (saturnLong + 360) % 360;

  // 8. Uranus
  let uranusLong = (314.05 + 0.01173 * d) % 360;
  uranusLong = (uranusLong + 360) % 360;

  // 9. Neptune
  let neptuneLong = (304.35 + 0.00598 * d) % 360;
  neptuneLong = (neptuneLong + 360) % 360;

  // 10. Pluto
  let plutoLong = (238.9 + 0.00397 * d) % 360;
  plutoLong = (plutoLong + 360) % 360;

  // 11. Chiron
  let chironLong = (110.5 + 0.0195 * d) % 360;
  chironLong = (chironLong + 360) % 360;

  // 12. North Node (Mean Node retrogrades)
  let nodeLong = (125.04 - 0.05295 * d) % 360;
  nodeLong = (nodeLong + 360) % 360;

  // Ascendant and Midheaven (RAMC & Local Sidereal Time)
  let GMST = (280.46061837 + 360.98564736629 * d) % 360;
  let LST = (GMST + lng) % 360; // Local Sidereal Time in degrees
  
  let radLST = LST * (Math.PI / 180);
  let radLat = lat * (Math.PI / 180);
  let eps = 23.439 * (Math.PI / 180); // Obliquity of Ecliptic

  // MC calculation
  let mcRad = Math.atan2(Math.sin(radLST), Math.cos(radLST) * Math.cos(eps));
  let mcDeg = (mcRad * (180 / Math.PI) + 360) % 360;

  // Ascendant calculation
  let ascRad = Math.atan2(-Math.cos(radLST), Math.sin(radLST) * Math.cos(eps) + Math.tan(radLat) * Math.sin(eps));
  let ascDeg = (ascRad * (180 / Math.PI) + 360) % 360;

  const rawPositions = {
    Sun: sunLong,
    Moon: moonLong,
    Mercury: mercuryLong,
    Venus: venusLong,
    Mars: marsLong,
    Jupiter: jupiterLong,
    Saturn: saturnLong,
    Uranus: uranusLong,
    Neptune: neptuneLong,
    Pluto: plutoLong,
    Chiron: chironLong,
    NorthNode: nodeLong,
    Ascendant: ascDeg,
    Midheaven: mcDeg
  };

  // Build House Cusps (12 Equal / Placidus-like starting from Ascendant)
  const houses = [];
  for (let h = 0; h < 12; h++) {
    let houseCuspDeg = (ascDeg + h * 30) % 360;
    houses.push({
      houseNumber: h + 1,
      cuspDeg: houseCuspDeg,
      zodiac: degreeToZodiac(houseCuspDeg)
    });
  }

  // Format planetary items
  const planetsFormatted = {};
  Object.keys(rawPositions).forEach(planetKey => {
    const rawDeg = rawPositions[planetKey];
    const zodiacInfo = degreeToZodiac(rawDeg);
    
    // Find house placement
    let houseNumber = 1;
    for (let i = 0; i < 12; i++) {
      let currentCusp = houses[i].cuspDeg;
      let nextCusp = houses[(i + 1) % 12].cuspDeg;
      
      let inHouse = false;
      if (currentCusp < nextCusp) {
        inHouse = rawDeg >= currentCusp && rawDeg < nextCusp;
      } else {
        inHouse = rawDeg >= currentCusp || rawDeg < nextCusp;
      }
      
      if (inHouse) {
        houseNumber = i + 1;
        break;
      }
    }

    planetsFormatted[planetKey] = {
      id: planetKey,
      ...PLANETS_META[planetKey],
      longitude: rawDeg,
      zodiac: zodiacInfo,
      house: houseNumber
    };
  });

  // Calculate Elemental & Modality Breakdown
  const elementsCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalitiesCount = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  
  const mainBodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant"];
  mainBodies.forEach(key => {
    let p = planetsFormatted[key];
    elementsCount[p.zodiac.element] = (elementsCount[p.zodiac.element] || 0) + 1;
    modalitiesCount[p.zodiac.modality] = (modalitiesCount[p.zodiac.modality] || 0) + 1;
  });

  const totalPoints = mainBodies.length;
  const elementsPct = {
    Fire: Math.round((elementsCount.Fire / totalPoints) * 100),
    Earth: Math.round((elementsCount.Earth / totalPoints) * 100),
    Air: Math.round((elementsCount.Air / totalPoints) * 100),
    Water: Math.round((elementsCount.Water / totalPoints) * 100)
  };

  const modalitiesPct = {
    Cardinal: Math.round((modalitiesCount.Cardinal / totalPoints) * 100),
    Fixed: Math.round((modalitiesCount.Fixed / totalPoints) * 100),
    Mutable: Math.round((modalitiesCount.Mutable / totalPoints) * 100)
  };

  // Aspects Calculation
  const aspects = calculatePlanetaryAspects(planetsFormatted);

  return {
    jd: JD,
    planets: planetsFormatted,
    houses: houses,
    elements: elementsPct,
    modalities: modalitiesPct,
    aspects: aspects
  };
}

// Aspect Definitions with Orbs
const ASPECT_TYPES = [
  { name: "Conjunction", symbol: "☌", angle: 0, orb: 8, nature: "Harmonious / Intensely Blended", color: "#F59E0B" },
  { name: "Sextile", symbol: "⚹", angle: 60, orb: 6, nature: "Harmonious Opportunity", color: "#38BDF8" },
  { name: "Square", symbol: "□", angle: 90, orb: 7, nature: "Dynamic Tension & Growth Challenge", color: "#EF4444" },
  { name: "Trine", symbol: "△", angle: 120, orb: 8, nature: "Flowing Gift & Natural Talent", color: "#10B981" },
  { name: "Opposition", symbol: "☍", angle: 180, orb: 8, nature: "Polarity & Awareness Balance", color: "#8B5CF6" }
];

export function calculatePlanetaryAspects(planets) {
  const aspectList = [];
  const planetKeys = Object.keys(planets).filter(k => k !== "Ascendant" && k !== "Midheaven");

  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const p1 = planets[planetKeys[i]];
      const p2 = planets[planetKeys[j]];

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      ASPECT_TYPES.forEach(asp => {
        const delta = Math.abs(diff - asp.angle);
        if (delta <= asp.orb) {
          aspectList.push({
            p1: p1.name,
            p1Symbol: p1.symbol,
            p2: p2.name,
            p2Symbol: p2.symbol,
            aspect: asp.name,
            aspectSymbol: asp.symbol,
            nature: asp.nature,
            color: asp.color,
            exactAngle: asp.angle,
            actualDiff: diff.toFixed(1),
            orb: delta.toFixed(1),
            summary: `${p1.name} in ${p1.zodiac.sign} ${asp.name} ${p2.name} in ${p2.zodiac.sign} (${delta.toFixed(1)}° orb)`
          });
        }
      });
    }
  }

  return aspectList;
}
