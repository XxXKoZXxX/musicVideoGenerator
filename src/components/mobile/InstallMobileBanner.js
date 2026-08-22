import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, QrCode, Copy, Check, FileArchive, ShieldCheck, Wifi, Globe } from 'lucide-react';
import { generateQRCodeSVG } from '../../utils/qrGenerator';

export default function InstallMobileBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('astraea_hide_install_banner') === 'true';
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' | 'ios' | 'android' | 'zip'
  const [urlType, setUrlType] = useState('public'); // 'public' | 'wifi' | 'local'

  // Network State
  const [networkInfo, setNetworkInfo] = useState({
    publicUrl: 'https://postcard-teaching-reaction-disabilities.trycloudflare.com',
    wifiUrl: 'http://192.168.86.21:3210',
    localhostUrl: 'http://localhost:3210',
  });

  // Dynamic URL Resolution (from /active_url.json or electron IPC)
  useEffect(() => {
    let isMounted = true;

    // Check Electron IPC first
    if (window.electron?.getSharingUrls) {
      window.electron.getSharingUrls().then((res) => {
        if (isMounted && res) {
          setNetworkInfo((prev) => ({
            ...prev,
            publicUrl: res.publicUrl || prev.publicUrl,
            wifiUrl: res.wifiUrl || prev.wifiUrl,
            localhostUrl: res.localhostUrl || prev.localhostUrl,
          }));
        }
      }).catch(() => {});
    }

    // Fetch from web server endpoint
    fetch('/active_url.json')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setNetworkInfo((prev) => ({
            ...prev,
            publicUrl: data.publicUrl || data.url || prev.publicUrl,
            wifiUrl: data.wifiUrl || prev.wifiUrl,
          }));
        }
      })
      .catch(() => {});

    // Check if running on web (use origin if remote)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setNetworkInfo((prev) => ({
          ...prev,
          publicUrl: window.location.origin,
        }));
      }
    }

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(!!isStandaloneMode);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) setActiveTab('ios');

    // Listen for Android / Chrome install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Selected Active URL to encode & copy
  const activeUrl = urlType === 'wifi'
    ? networkInfo.wifiUrl
    : urlType === 'local'
    ? networkInfo.localhostUrl
    : (networkInfo.publicUrl || networkInfo.wifiUrl);

  const qrCodeSvgDataUri = generateQRCodeSVG(activeUrl, {
    size: 240,
    color: '#F59E0B',
    bgColor: '#060814',
  });

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleCopyUrl = (urlToCopy) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy || activeUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('astraea_hide_install_banner', 'true');
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="install-mobile-banner glass-panel no-print">
        <div className="install-banner-content">
          <div className="install-icon-box">
            <Smartphone className="w-5 h-5 text-gold" />
          </div>
          <div className="install-text-box">
            <strong>Install Astraea Mobile App</strong>
            <span>Add to your iPhone or Android Home Screen, or download standalone package</span>
          </div>
        </div>

        <div className="install-actions-box">
          <button onClick={handleInstallClick} className="btn btn-primary-glow install-cta-btn">
            <Download className="w-4 h-4 mr-1.5" /> Download / Install Mobile App
          </button>
          <button onClick={handleDismiss} className="install-dismiss-btn" title="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comprehensive Download / Install Mobile App Modal */}
      {showInstallModal && (
        <div className="modal-backdrop no-print" onClick={() => setShowInstallModal(false)}>
          <div className="modal-content glass-panel install-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-gold" />
                <h3>Download & Install Mobile App</h3>
              </div>
              <button onClick={() => setShowInstallModal(false)} className="sheet-close-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="modal-tab-nav mt-3">
              <button 
                className={`modal-tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
                onClick={() => setActiveTab('phone')}
              >
                <QrCode className="w-4 h-4 mr-1.5" /> Scan QR / Phone
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'ios' ? 'active' : ''}`}
                onClick={() => setActiveTab('ios')}
              >
                🍏 iPhone (iOS)
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'android' ? 'active' : ''}`}
                onClick={() => setActiveTab('android')}
              >
                🤖 Android
              </button>
              <button 
                className={`modal-tab-btn ${activeTab === 'zip' ? 'active' : ''}`}
                onClick={() => setActiveTab('zip')}
              >
                💾 Direct File (.zip)
              </button>
            </div>

            {/* Tab 1: QR Code & Direct Link for Phone */}
            {activeTab === 'phone' && (
              <div className="tab-content-box mt-4 text-center">
                {/* Network URL Mode Selector Pills */}
                <div className="flex justify-center gap-2 mb-3">
                  <button
                    onClick={() => setUrlType('public')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      urlType === 'public'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> 🌐 Public Web
                  </button>
                  <button
                    onClick={() => setUrlType('wifi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      urlType === 'wifi'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" /> 📶 Local Wi-Fi
                  </button>
                </div>

                <div className="https-badge mb-2 flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" /> {urlType === 'public' ? 'Secure HTTPS Public Link (Works on Cellular & Wi-Fi)' : 'High-Speed Home Wi-Fi Network Link'}
                </div>
                <p className="text-sm text-silver mb-3">
                  Open your <strong>iPhone Camera</strong> or <strong>Android QR Scanner</strong> and scan this code to launch Astraea on your phone:
                </p>

                {/* Instant Offline Vector QR Code */}
                <div className="qr-container glass-panel inline-block p-3 rounded-2xl border border-amber-400/30">
                  <img 
                    src={qrCodeSvgDataUri} 
                    alt="Astraea Mobile QR Code" 
                    className="qr-image mx-auto rounded-xl"
                    width={200}
                    height={200}
                  />
                </div>

                <div className="url-copy-box mt-3 flex items-center justify-between glass-panel p-2">
                  <div className="text-left flex-1 px-2 overflow-hidden">
                    <span className="text-xs text-silver block">{urlType === 'public' ? 'Public Mobile Link:' : 'Local Wi-Fi Link:'}</span>
                    <strong className="text-xs text-gold truncate block">{activeUrl}</strong>
                  </div>
                  <button onClick={() => handleCopyUrl(activeUrl)} className="btn btn-secondary text-xs py-1.5 px-3">
                    {copiedUrl ? <><Check className="w-3.5 h-3.5 text-emerald-400 mr-1 inline" /> Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1 inline" /> Copy Link</>}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: iPhone / iOS Safari Steps */}
            {activeTab === 'ios' && (
              <div className="tab-content-box mt-4 text-left">
                <div className="ios-instructions">
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">1</div>
                    <div className="text-sm">
                      On your iPhone or iPad, open Safari and visit:
                      <div className="mt-1">
                        <strong className="text-gold select-all">{activeUrl}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">2</div>
                    <div className="text-sm">
                      Tap the <Share2 className="w-4 h-4 inline text-cyan" /> <strong>Share</strong> button in Safari's bottom toolbar.
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">3</div>
                    <div className="text-sm">
                      Scroll down and tap <PlusSquare className="w-4 h-4 inline text-gold" /> <strong>Add to Home Screen</strong>.
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3">
                    <div className="step-circle">4</div>
                    <div className="text-sm">
                      Tap <strong>Add</strong> in the top right. The <strong>Astraea</strong> gold star app icon is now on your iPhone home screen!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Android / Chrome Steps */}
            {activeTab === 'android' && (
              <div className="tab-content-box mt-4 text-left">
                <div className="ios-instructions">
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">1</div>
                    <div className="text-sm">
                      Open <strong>Google Chrome</strong> on your phone and go to:
                      <div className="mt-1">
                        <strong className="text-gold select-all">{activeUrl}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">2</div>
                    <div className="text-sm">
                      Tap the <strong>3 dots menu (⋮)</strong> in the top-right corner of Chrome.
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3 mb-3">
                    <div className="step-circle">3</div>
                    <div className="text-sm">
                      Tap <Download className="w-4 h-4 inline text-gold" /> <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </div>
                  </div>
                  <div className="ios-step-row flex items-center gap-3">
                    <div className="step-circle">4</div>
                    <div className="text-sm">
                      Tap <strong>Install</strong>. Astraea installs directly to your Android app drawer!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Direct Offline ZIP Download */}
            {activeTab === 'zip' && (
              <div className="tab-content-box mt-4 text-center">
                <FileArchive className="w-12 h-12 text-gold mx-auto mb-2" />
                <h4 className="text-gold">Download Standalone Offline App (.zip)</h4>
                <p className="text-sm text-silver mt-1 mb-4">
                  Download the complete standalone offline mobile web package (12 MB). You can unzip and host or open it anywhere.
                </p>

                <a 
                  href="/Astraea_Mobile_App.zip" 
                  download="Astraea_Mobile_App.zip"
                  className="btn btn-primary-glow inline-flex items-center gap-2 py-3 px-6 text-sm cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Astraea_Mobile_App.zip (12 MB)
                </a>

                <div className="glass-panel p-3 mt-4 text-left text-xs text-silver">
                  <strong>💡 Building Native APK with Capacitor:</strong>
                  <p className="mt-1">
                    To build a native Android APK on your machine:
                    <br />
                    1. Double-click <code>build-mobile.bat</code> in the project folder.
                    <br />
                    2. Run <code>npm run mobile:android</code> to open the Android Studio project.
                  </p>
                </div>
              </div>
            )}

            <div className="modal-footer mt-5">
              <button onClick={() => setShowInstallModal(false)} className="btn btn-secondary w-full">
                Close & Return to App
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
