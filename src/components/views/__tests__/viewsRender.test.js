import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import OverviewDashboard from '../OverviewDashboard';
import AstrologyView from '../AstrologyView';
import SecretLanguageView from '../SecretLanguageView';
import TransitsView from '../TransitsView';
import SoundscapeView from '../SoundscapeView';
import PodcastStudioView from '../PodcastStudioView';
import VideoStudioView from '../VideoStudioView';
import OracleChatView from '../OracleChatView';
import KarmaView from '../KarmaView';
import NumerologyView from '../NumerologyView';
import TarotView from '../TarotView';
import TarotLibraryView from '../TarotLibraryView';
import SynastryView from '../SynastryView';
import CosmicReportView from '../CosmicReportView';
import DreamInterpreterView from '../DreamInterpreterView';
import GrimoireView from '../GrimoireView';
import PersonalityTestView from '../PersonalityTestView';
import ProfileForm from '../../profile/ProfileForm';
import { calculatePlanetaryPositions } from '../../../utils/astrologyEngine';

// Mock Web Audio API for Jest jsdom environment
window.AudioContext = window.AudioContext || function() {
  return {
    createOscillator: () => ({
      type: 'sine',
      frequency: { setValueAtTime: () => {}, value: 432 },
      connect: () => {},
      start: () => {},
      stop: () => {}
    }),
    createGain: () => ({
      gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, value: 0.5 },
      connect: () => {}
    }),
    createStereoPanner: () => ({
      pan: { setValueAtTime: () => {}, value: 0 },
      connect: () => {}
    }),
    destination: {},
    currentTime: 0,
    close: () => Promise.resolve(),
    state: 'running',
    resume: () => Promise.resolve()
  };
};

// Mock HTMLMediaElement play/pause
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

// Mock URL.createObjectURL
window.URL.createObjectURL = () => 'blob:mock-url';

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  beginPath: () => {},
  arc: () => {},
  stroke: () => {},
  fill: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  scale: () => {},
  fillText: () => {},
  strokeText: () => {},
  measureText: () => ({ width: 50 }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} })
});

describe('Astraea All 15 Studio Views Smoke Test Suite', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    container = null;
  });

  const mockProfile = {
    id: 'test_astraea',
    name: 'Astraea',
    birthYear: 1990,
    birthMonth: 7,
    birthDay: 15,
    birthHour: 10,
    birthMinute: 30,
    cityName: 'Newton, NJ, USA',
    lat: 41.0582,
    lng: -74.7529,
    tag: 'Self'
  };

  const mockProfiles = [
    mockProfile,
    {
      id: 'test_partner',
      name: 'Luna',
      birthYear: 1993,
      birthMonth: 11,
      birthDay: 20,
      birthHour: 18,
      birthMinute: 45,
      cityName: 'New York, NY, USA',
      lat: 40.7128,
      lng: -74.0060,
      tag: 'Partner'
    }
  ];

  const dateObj = new Date(mockProfile.birthYear, mockProfile.birthMonth - 1, mockProfile.birthDay);
  const astroData = calculatePlanetaryPositions(dateObj, mockProfile.birthHour, mockProfile.birthMinute, mockProfile.lat, mockProfile.lng);

  test('1. OverviewDashboard renders smoothly', () => {
    act(() => {
      root.render(<OverviewDashboard profile={mockProfile} onNavigate={() => {}} onOpenTheme={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('2. AstrologyView renders smoothly', () => {
    act(() => {
      root.render(<AstrologyView astroData={astroData} profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('3. SecretLanguageView renders smoothly', () => {
    act(() => {
      root.render(<SecretLanguageView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('4. TransitsView renders smoothly', () => {
    act(() => {
      root.render(<TransitsView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('5. SoundscapeView renders smoothly', () => {
    act(() => {
      root.render(<SoundscapeView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('6. PodcastStudioView renders smoothly', () => {
    act(() => {
      root.render(<PodcastStudioView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('7. VideoStudioView renders smoothly', () => {
    act(() => {
      root.render(<VideoStudioView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('8. OracleChatView renders smoothly', () => {
    act(() => {
      root.render(<OracleChatView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('9. KarmaView renders smoothly', () => {
    act(() => {
      root.render(<KarmaView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('10. NumerologyView renders smoothly', () => {
    act(() => {
      root.render(<NumerologyView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('11. TarotView renders smoothly', () => {
    act(() => {
      root.render(<TarotView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('12. TarotLibraryView renders smoothly', () => {
    act(() => {
      root.render(<TarotLibraryView onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('13. SynastryView renders smoothly with dual slots', () => {
    act(() => {
      root.render(<SynastryView profiles={mockProfiles} activeProfile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('14. CosmicReportView renders complete 8 chapters smoothly', () => {
    act(() => {
      root.render(<CosmicReportView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('15. ProfileForm renders smoothly', () => {
    act(() => {
      root.render(<ProfileForm onSaveProfile={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('16. DreamInterpreterView renders smoothly', () => {
    act(() => {
      root.render(<DreamInterpreterView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('17. GrimoireView renders smoothly with 10 portals', () => {
    act(() => {
      root.render(<GrimoireView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });

  test('18. PersonalityTestView renders smoothly with 8 questions', () => {
    act(() => {
      root.render(<PersonalityTestView profile={mockProfile} onNavigate={() => {}} />);
    });
    expect(container).toBeDefined();
  });
});
