import React, { useState, useEffect } from 'react';
import { resolveLocation, getAllCities, WORLD_CITIES } from '../../data/citiesData';
import { User, Calendar, Clock, MapPin, Sparkles, Sliders, Search, BookOpen, Quote } from 'lucide-react';

export default function ProfileForm({ onSaveProfile, initialData = null, onCancel = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [birthYear, setBirthYear] = useState(initialData?.birthYear || 1995);
  const [birthMonth, setBirthMonth] = useState(initialData?.birthMonth || 7);
  const [birthDay, setBirthDay] = useState(initialData?.birthDay || 15);
  
  const [unknownTime, setUnknownTime] = useState(initialData?.unknownTime || false);
  const [birthHour, setBirthHour] = useState(initialData?.birthHour ?? 12);
  const [birthMinute, setBirthMinute] = useState(initialData?.birthMinute ?? 0);
  const [amPm, setAmPm] = useState(initialData?.amPm || 'PM');

  const [cityName, setCityName] = useState(initialData?.cityName || "Newton, NJ, USA");
  const [lat, setLat] = useState(initialData?.lat || 41.0582);
  const [lng, setLng] = useState(initialData?.lng || -74.7529);
  const [showCustomCoords, setShowCustomCoords] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allCities, setAllCities] = useState([]);
  
  const [tag, setTag] = useState(initialData?.tag || 'Self');
  const [soulNotes, setSoulNotes] = useState(initialData?.soulNotes || '');
  const [motto, setMotto] = useState(initialData?.motto || '');

  const handleCitySelect = (cityObj) => {
    setCityName(cityObj.name);
    setLat(cityObj.lat);
    setLng(cityObj.lng);
    setIsDropdownOpen(false);
    setCitySearchQuery('');
  };

  const handleCustomCityInput = (val) => {
    setCityName(val);
    setCitySearchQuery(val);
    setIsDropdownOpen(true);

    const resolved = resolveLocation(val);
    if (resolved) {
      setLat(resolved.lat);
      setLng(resolved.lng);
    }
  };

  const filteredCities = (allCities.length > 0 ? allCities : WORLD_CITIES).filter(c => 
    c.name.toLowerCase().includes((citySearchQuery || cityName).toLowerCase())
  ).slice(0, 8);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let hour24 = parseInt(birthHour, 10);
    if (amPm === 'PM' && hour24 < 12) hour24 += 12;
    if (amPm === 'AM' && hour24 === 12) hour24 = 0;

    const profileData = {
      id: initialData?.id || `profile_${Date.now()}`,
      name: name.trim(),
      birthYear: parseInt(birthYear, 10),
      birthMonth: parseInt(birthMonth, 10),
      birthDay: parseInt(birthDay, 10),
      unknownTime,
      birthHour: unknownTime ? 12 : hour24,
      birthMinute: unknownTime ? 0 : parseInt(birthMinute, 10),
      amPm,
      cityName: cityName.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      tag,
      soulNotes: soulNotes.trim(),
      motto: motto.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString()
    };

    onSaveProfile(profileData);
  };

  // Load full city dataset on mount
  useEffect(() => {
    getAllCities().then(setAllCities).catch(() => setAllCities(WORLD_CITIES));
  }, []);

  return (
    <div className="profile-form-card glass-panel">
      <div className="form-header">
        <div className="header-icon-glow">
          <Sparkles className="w-6 h-6 text-gold" />
        </div>
        <h2>{initialData ? 'Edit Cosmic Profile' : 'Cast Your Cosmic Identity'}</h2>
        <p>Enter exact birth details to unlock your Secret Language, Astrological Chart, Twin Flame & Numerology</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Name */}
        <div className="form-group">
          <label><User className="inline-icon" /> Full Birth Name</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="input-field"
          />
        </div>

        {/* Birth Date */}
        <div className="form-group">
          <label><Calendar className="inline-icon" /> Exact Birth Date</label>
          <div className="form-row date-selectors">
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="input-field">
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>

            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="input-field">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <input 
              type="number" 
              min="1900" 
              max="2099" 
              value={birthYear} 
              onChange={(e) => setBirthYear(e.target.value)} 
              className="input-field year-field"
            />
          </div>
        </div>

        {/* Exact Birth Time */}
        <div className="form-group">
          <div className="label-with-toggle">
            <label><Clock className="inline-icon" /> Exact Birth Time</label>
            <label className="toggle-unknown">
              <input 
                type="checkbox" 
                checked={unknownTime} 
                onChange={(e) => setUnknownTime(e.target.checked)} 
              />
              <span>Time Unknown (Defaults to 12:00 PM)</span>
            </label>
          </div>

          {!unknownTime && (
            <div className="form-row time-selectors">
              <select value={birthHour} onChange={(e) => setBirthHour(e.target.value)} className="input-field">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              <select value={birthMinute} onChange={(e) => setBirthMinute(e.target.value)} className="input-field">
                {Array.from({ length: 60 }, (_, i) => i).map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>

              <select value={amPm} onChange={(e) => setAmPm(e.target.value)} className="input-field">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          )}
        </div>

        {/* Birth Location Search */}
        <div className="form-group location-search-container">
          <div className="label-with-toggle">
            <label><MapPin className="inline-icon" /> Birth City (All US Cities & Towns Supported)</label>
            <button 
              type="button" 
              className="toggle-coords-btn"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
            >
              <Sliders className="w-3 h-3 inline mr-1" />
              {showCustomCoords ? 'Hide Lat/Lng' : 'Edit Lat/Lng'}
            </button>
          </div>

          <div className="city-search-input-box">
            <Search className="city-search-icon" />
            <input 
              type="text" 
              placeholder="Search or type any city/town (e.g. Newton NJ, Austin TX, Chicago IL)"
              value={cityName}
              onChange={(e) => handleCustomCityInput(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="input-field city-search-field"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && filteredCities.length > 0 && (
            <div className="cities-autocomplete-dropdown glass-panel">
              {filteredCities.map((city, idx) => (
                <div 
                  key={idx}
                  className="city-dropdown-item"
                  onClick={() => handleCitySelect(city)}
                >
                  <MapPin className="w-4 h-4 text-gold mr-2 inline" />
                  <span className="city-item-name">{city.name}</span>
                  <span className="city-item-coords">({city.lat > 0 ? `${city.lat.toFixed(2)}°N` : `${Math.abs(city.lat).toFixed(2)}°S`}, {city.lng > 0 ? `${city.lng.toFixed(2)}°E` : `${Math.abs(city.lng).toFixed(2)}°W`})</span>
                </div>
              ))}
            </div>
          )}

          {showCustomCoords && (
            <div className="form-row coords-edit-row mt-2">
              <div className="flex-1">
                <label className="text-xs">Latitude (°)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={lat} 
                  onChange={(e) => setLat(e.target.value)} 
                  className="input-field text-xs" 
                />
              </div>
              <div className="flex-1">
                <label className="text-xs">Longitude (°)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={lng} 
                  onChange={(e) => setLng(e.target.value)} 
                  className="input-field text-xs" 
                />
              </div>
            </div>
          )}

          <div className="coordinates-badge mt-1">
            📍 Coordinates: {lat > 0 ? `${parseFloat(lat).toFixed(4)}° N` : `${Math.abs(parseFloat(lat)).toFixed(4)}° S`}, {lng > 0 ? `${parseFloat(lng).toFixed(4)}° E` : `${Math.abs(parseFloat(lng)).toFixed(4)}° W`}
          </div>
        </div>

        {/* Profile Tag */}
        <div className="form-group">
          <label>Profile Connection Tag</label>
          <div className="tag-selector flex flex-wrap gap-1.5">
            {['Self', 'Partner', 'Twin Flame', 'Soulmate', 'Family', 'Friend', 'Muse'].map(t => (
              <button 
                type="button" 
                key={t}
                className={`tag-btn ${tag === t ? 'active' : ''}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Soul Notes & Intentions */}
        <div className="form-group">
          <label><BookOpen className="inline-icon" /> Private Soul Notes & Birth Intentions (Optional)</label>
          <textarea 
            rows={3}
            placeholder="Add personal life themes, spiritual insights, or custom notes for this profile..."
            value={soulNotes}
            onChange={(e) => setSoulNotes(e.target.value)}
            className="input-field text-xs w-full p-2.5"
          />
        </div>

        {/* Living Creed / Personal Motto */}
        <div className="form-group">
          <label><Quote className="inline-icon" /> Personal Creed / Motto (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. 'I create my reality through unwavering vision and love.'"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            className="input-field text-xs w-full py-2.5 px-3"
          />
        </div>

        {/* Submit */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary-glow">
            <Sparkles className="w-5 h-5 mr-2" /> Save & Calculate Cosmic Profile
          </button>
        </div>
      </form>
    </div>
  );
}
