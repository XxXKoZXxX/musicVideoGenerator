import React, { useState, useEffect } from 'react';
import NavHeader from './components/navigation/NavHeader';
import FloatingCosmicDock from './components/navigation/FloatingCosmicDock';
import MobileNavBar from './components/navigation/MobileNavBar';
import MobileStudiosDrawer from './components/navigation/MobileStudiosDrawer';
import ProfileDrawer from './components/profile/ProfileDrawer';
import ProfileForm from './components/profile/ProfileForm';
import ThemeCustomizerModal from './components/theme/ThemeCustomizerModal';
import ShareModal from './components/share/ShareModal';
import InstallMobileBanner from './components/mobile/InstallMobileBanner';

// Views
import OverviewDashboard from './components/views/OverviewDashboard';
import AstrologyView from './components/views/AstrologyView';
import SecretLanguageView from './components/views/SecretLanguageView';
import TransitsView from './components/views/TransitsView';
import KarmaView from './components/views/KarmaView';
import GrimoireView from './components/views/GrimoireView';
import DreamInterpreterView from './components/views/DreamInterpreterView';
import TarotView from './components/views/TarotView';
import TarotLibraryView from './components/views/TarotLibraryView';
import PodcastStudioView from './components/views/PodcastStudioView';
import VideoStudioView from './components/views/VideoStudioView';
import OracleChatView from './components/views/OracleChatView';
import SoundscapeView from './components/views/SoundscapeView';
import NumerologyView from './components/views/NumerologyView';
import SynastryView from './components/views/SynastryView';
import PersonalityTestView from './components/views/PersonalityTestView';
import CosmicReportView from './components/views/CosmicReportView';

import { loadSavedTheme } from './utils/themeEngine';
import './App.css';

// Default User Profile (Astraea from Newton, NJ)
const DEFAULT_PROFILE = {
  id: 'user_primary',
  name: 'Astraea',
  birthYear: 1993,
  birthMonth: 7,
  birthDay: 16,
  birthHour: 12,
  birthMinute: 0,
  amPm: 'PM',
  unknownTime: false,
  cityName: 'Newton, NJ, USA',
  lat: 41.0582,
  lng: -74.7529,
  tag: 'Self'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Astraea View Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 text-center m-6 rounded-3xl border border-rose-500/40">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Cosmic Alignment Notice</h2>
          <p className="text-sm text-silver mb-4">Something shifted in the celestial data flow.</p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="btn-gold py-2 px-6 rounded-xl font-bold text-xs bg-amber-400 text-slate-950"
          >
            Reconnect to Stream
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileStudiosOpen, setIsMobileStudiosOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(null);

  // Profiles State with LocalStorage Persistence and Patrice -> Astraea Migration
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('astraea_user_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => (p.name === 'Patrice' || !p.name ? { ...p, name: 'Astraea' } : p));
        }
      }
    } catch (e) {}
    return [DEFAULT_PROFILE];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      const savedId = localStorage.getItem('astraea_active_profile_id');
      if (savedId && profiles.some(p => p.id === savedId)) return savedId;
    } catch (e) {}
    return profiles[0]?.id || DEFAULT_PROFILE.id;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('astraea_user_profiles', JSON.stringify(profiles));
      localStorage.setItem('astraea_active_profile_id', activeProfileId);
    } catch (e) {}
  }, [profiles, activeProfileId]);

  // Load Saved Aesthetic Theme
  useEffect(() => {
    const loaded = loadSavedTheme();
    setCurrentTheme(loaded);
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILE;

  // Safe fallback profile to guarantee 0 crashes if properties are missing
  const safeProfile = {
    ...DEFAULT_PROFILE,
    ...activeProfile,
    birthMonth: Number(activeProfile?.birthMonth) || 7,
    birthDay: Number(activeProfile?.birthDay) || 16,
    birthYear: Number(activeProfile?.birthYear) || 1993,
    birthHour: Number(activeProfile?.birthHour) || 12,
    birthMinute: Number(activeProfile?.birthMinute) || 0,
    lat: Number(activeProfile?.lat) || 41.0582,
    lng: Number(activeProfile?.lng) || -74.7529,
    cityName: activeProfile?.cityName || 'Newton, NJ, USA',
    name: activeProfile?.name === 'Patrice' ? 'Astraea' : (activeProfile?.name || 'Astraea')
  };

  const handleSaveProfile = (newProfile) => {
    const existingIndex = profiles.findIndex(p => p.id === newProfile.id);
    if (existingIndex >= 0) {
      const updated = [...profiles];
      updated[existingIndex] = newProfile;
      setProfiles(updated);
    } else {
      setProfiles([...profiles, newProfile]);
    }
    setActiveProfileId(newProfile.id);
    setCurrentView('overview');
  };

  const handleDeleteProfile = (idToDelete) => {
    if (profiles.length <= 1) return;
    const filtered = profiles.filter(p => p.id !== idToDelete);
    setProfiles(filtered);
    if (activeProfileId === idToDelete) {
      setActiveProfileId(filtered[0].id);
    }
  };

  return (
    <div className="astraea-app-root">
      <div className="starfield-bg">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      {/* PWA & Mobile Install Banner */}
      <InstallMobileBanner />

      {/* 2-Tier Categorized Navigation Header */}
      <NavHeader 
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        activeProfile={safeProfile}
        onOpenProfiles={() => setIsDrawerOpen(true)}
        onCreateProfile={() => setCurrentView('newProfile')}
        onOpenTheme={() => setIsThemeModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      <main className="main-content-container">
        <ErrorBoundary>
          {currentView === 'newProfile' ? (
            <div className="form-center-wrapper">
              <ProfileForm 
                onSaveProfile={handleSaveProfile} 
                onCancel={() => setCurrentView('overview')} 
              />
            </div>
          ) : currentView === 'editProfile' ? (
            <div className="form-center-wrapper">
              <ProfileForm 
                initialData={safeProfile}
                onSaveProfile={handleSaveProfile} 
                onCancel={() => setCurrentView('overview')} 
              />
            </div>
          ) : (
            <>
              {currentView === 'overview' && (
                <OverviewDashboard 
                  profile={safeProfile} 
                  onNavigate={(view) => setCurrentView(view)} 
                  onOpenTheme={() => setIsThemeModalOpen(true)}
                  onOpenShare={() => setIsShareModalOpen(true)}
                />
              )}

              {currentView === 'astrology' && (
                <AstrologyView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'secretLanguage' && (
                <SecretLanguageView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'transits' && (
                <TransitsView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'karma' && (
                <KarmaView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'grimoire' && (
                <GrimoireView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'dream' && (
                <DreamInterpreterView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'tarot' && (
                <TarotView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'tarotLibrary' && (
                <TarotLibraryView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'podcast' && (
                <PodcastStudioView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'video' && (
                <VideoStudioView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'oracleChat' && (
                <OracleChatView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'soundscape' && (
                <SoundscapeView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'numerology' && (
                <NumerologyView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}

              {currentView === 'synastry' && (
                <SynastryView 
                  profile={safeProfile}
                  profiles={profiles} 
                  onNavigate={(view) => setCurrentView(view)} 
                  onAddProfile={() => setCurrentView('newProfile')}
                />
              )}

              {currentView === 'personalityTest' && (
                <PersonalityTestView 
                  profile={safeProfile} 
                  onNavigate={(view) => setCurrentView(view)} 
                />
              )}

              {currentView === 'report' && (
                <CosmicReportView profile={safeProfile} onNavigate={(view) => setCurrentView(view)} />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Floating Bottom Cosmic Dock (Desktop / Tablet) */}
      <FloatingCosmicDock 
        currentView={currentView} 
        onNavigate={(view) => setCurrentView(view)} 
      />

      {/* Mobile Native Bottom Navigation Bar */}
      <MobileNavBar 
        currentView={currentView} 
        onNavigate={(view) => setCurrentView(view)} 
        onOpenStudios={() => setIsMobileStudiosOpen(true)} 
        onOpenTheme={() => setIsThemeModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Mobile Studios Bottom Sheet Drawer */}
      {isMobileStudiosOpen && (
        <MobileStudiosDrawer 
          currentView={currentView} 
          onNavigate={(view) => setCurrentView(view)} 
          onClose={() => setIsMobileStudiosOpen(false)} 
          onOpenTheme={() => {
            setIsMobileStudiosOpen(false);
            setIsThemeModalOpen(true);
          }}
          onOpenShare={() => {
            setIsMobileStudiosOpen(false);
            setIsShareModalOpen(true);
          }}
        />
      )}

      {/* Profile Switcher Drawer */}
      {isDrawerOpen && (
        <ProfileDrawer 
          profiles={profiles}
          activeProfile={safeProfile}
          onSelectProfile={(p) => setActiveProfileId(p.id)}
          onCreateNew={() => setCurrentView('newProfile')}
          onDeleteProfile={handleDeleteProfile}
          onImportProfiles={(importedList) => {
            setProfiles(importedList);
            if (importedList[0]) setActiveProfileId(importedList[0].id);
          }}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* App Color & Theme Customizer Modal */}
      <ThemeCustomizerModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={(newTheme) => setCurrentTheme(newTheme)}
      />

      {/* Share with Friends & Testers Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeProfile={safeProfile}
      />
    </div>
  );
}
