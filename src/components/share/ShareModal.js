import React, { useState, useEffect } from 'react';
import {
  X, Share2, Copy, Check, Smartphone, Globe,
  Send, Sparkles, ShieldCheck, Wifi, Bot,
  Terminal, Key, FileCode
} from 'lucide-react';
import { generateQRCodeSVG } from '../../utils/qrGenerator';

const DEFAULT_APP_NAME = 'Astraea Cosmic Studio';
const DEFAULT_INVITE_TEMPLATES = {
  general: {
    label: '🌟 General',
    title: '🌟 General Test Invitation',
    text: (url) => `✨ Hey! I'm testing Astraea — an interactive Secret Language of Birthdays, Astrology Birth Chart, Occult Grimoire & Tarot app. Try it out here:\n👉 ${url}`,
  },
  synastry: {
    label: '💖 Love Match',
    title: '💖 Compatibility & Match Test',
    text: (url) => `🔮 Hey! Enter your birthday into Astraea to test our Twin Flame & Cosmic Compatibility side-by-side:\n👉 ${url}`,
  },
  secretLanguage: {
    label: '📜 Birthday',
    title: '📜 366 Day Archetype & Fortune',
    text: (url) => `✨ Check out what your exact birthdate means in the Secret Language of Birthdays on Astraea:\n👉 ${url}`,
  },
};

export default function ShareModal({
  isOpen,
  onClose,
  activeProfile,
  appName = DEFAULT_APP_NAME,
  inviteTemplates: customInviteTemplates,
}) {
  const inviteTemplateDefs = customInviteTemplates || DEFAULT_INVITE_TEMPLATES;
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedInviteTemplate, setSelectedInviteTemplate] = useState('general');
  const [urlType, setUrlType] = useState('public');

  const [networkInfo, setNetworkInfo] = useState({
    publicUrl: 'https://postcard-teaching-reaction-disabilities.trycloudflare.com',
    wifiUrl: 'http://192.168.86.21:3210',
    localhostUrl: 'http://localhost:3210',
    execToken: 'ea8bf63677b7a125a6b7a0f9ad8e38e5',
  });

  // Fetch real-time active tunnel URL & local network IP
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
      }).catch(() => { });
    }

    // Fetch from active_url.json API
    fetch('/active_url.json')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data) {
          setNetworkInfo(prev => ({
            ...prev,
            publicUrl: data.publicUrl || data.url || prev.publicUrl,
            wifiUrl: data.wifiUrl || prev.wifiUrl,
            execToken: data.execToken || prev.execToken,
          }));
        }
      })
      .catch(() => { });

    // Also fetch dedicated chatgpt token
    fetch('/api/chatgpt/token')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.token) {
          setNetworkInfo(prev => ({
            ...prev,
            execToken: data.token,
          }));
        }
      })
      .catch(() => { });

    // Check if running in browser with external origin
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setNetworkInfo(prev => ({
          ...prev,
          publicUrl: window.location.origin,
        }));
      }
    }

    return () => { isMounted = false; };
  }, []);

  if (!isOpen) return null;

  const publicBaseUrl = networkInfo.publicUrl || networkInfo.wifiUrl || 'http://localhost:3210';
  const openApiActionUrl = `${publicBaseUrl.replace(/\/+$/, '')}/openapi.json`;

  const activeShareUrl = urlType === 'wifi'
    ? networkInfo.wifiUrl
    : urlType === 'chatgpt'
      ? openApiActionUrl
      : (networkInfo.publicUrl || networkInfo.wifiUrl);

  const qrCodeSvgDataUri = generateQRCodeSVG(activeShareUrl, {
    size: 240,
    color: '#F59E0B',
    bgColor: '#060814',
  });

  const currentMessageText =
    inviteTemplateDefs[selectedInviteTemplate]?.text(activeShareUrl) ||
    inviteTemplateDefs.general.text(activeShareUrl);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentMessageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${appName} — Test & Explore`,
          text: currentMessageText,
          url: activeShareUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="modal-backdrop no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="modal-content glass-panel max-w-lg w-full bg-slate-950/95 border border-amber-400/40 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Share {appName} with Testers</h3>
              <p className="text-xs text-slate-300">Invite friends & testers on iPhone, Android or PC</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:bg-amber-400/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Type Selector */}
        <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setUrlType('public')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${urlType === 'public'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Globe className="w-3.5 h-3.5" /> 🌐 Public Web
          </button>
          <button
            onClick={() => setUrlType('wifi')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${urlType === 'wifi'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Wifi className="w-3.5 h-3.5" /> 📶 Wi-Fi
          </button>
          <button
            onClick={() => setUrlType('chatgpt')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${urlType === 'chatgpt'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Bot className="w-3.5 h-3.5" /> 🤖 ChatGPT Action
          </button>
        </div>

        {/* Live Link Copy Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              {urlType === 'chatgpt' ? (
                <><Bot className="w-3.5 h-3.5 text-emerald-400" /> ChatGPT Action Schema URL (OpenAPI 3.1)</>
              ) : urlType === 'public' ? (
                <><Globe className="w-3.5 h-3.5 text-cyan-400" /> Live Shareable Web Link</>
              ) : (
                <><Wifi className="w-3.5 h-3.5 text-cyan-400" /> Local Wi-Fi Link</>
              )}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {urlType === 'chatgpt' ? 'OpenAPI 3.1 Active' : urlType === 'public' ? 'HTTPS Secure' : 'Home Network'}
            </span>
          </div>

          <div className={`flex items-center gap-2 bg-slate-900/90 border ${urlType === 'chatgpt' ? 'border-emerald-500/40' : 'border-amber-400/30'} rounded-2xl p-2`}>
            <input
              type="text"
              readOnly
              value={activeShareUrl}
              className={`bg-transparent text-xs ${urlType === 'chatgpt' ? 'text-emerald-300' : 'text-amber-300'} font-mono font-bold w-full outline-none px-2 select-all truncate`}
            />
            <button
              onClick={handleCopyLink}
              className={`btn-gold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 font-bold ${urlType === 'chatgpt'
                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                } flex-shrink-0 transition-all`}
            >
              {copiedLink ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> {urlType === 'chatgpt' ? 'Copy Schema URL' : 'Copy Link'}</>}
            </button>
          </div>
        </div>

        {urlType === 'chatgpt' ? (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Remote Terminal & Workspace Execution Enabled</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                Live Powershell
              </span>
            </div>

            {/* Bearer Token Copy Box */}
            <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Action Bearer API Key (Token)
                </span>
                <span className="text-[10px] text-slate-400">Required for remote exec</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={networkInfo.execToken || ''}
                  className="bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono font-bold w-full outline-none px-2 py-1.5 rounded-lg select-all truncate"
                />
                <button
                  onClick={() => {
                    if (navigator.clipboard && networkInfo.execToken) {
                      navigator.clipboard.writeText(networkInfo.execToken);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2500);
                    }
                  }}
                  className="text-xs py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1 flex-shrink-0 transition-all"
                >
                  {copiedToken ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Key</>}
                </button>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>In ChatGPT, open <strong>Explore GPTs</strong> &rarr; click <strong>+ Create</strong> &rarr; go to <strong>Configure</strong>.</li>
              <li>Under <strong>Actions</strong> &rarr; click <strong>Create new action</strong>.</li>
              <li>Under <em>Schema</em>, click <strong>Import from URL</strong>, paste the OpenAPI Schema URL above, and click <strong>Import</strong>.</li>
              <li>Under <em>Authentication</em>, select <strong>API Key</strong> &rarr; Auth Type: <strong>Bearer</strong> &rarr; paste the <strong>Action Bearer Key</strong> above.</li>
              <li>ChatGPT can now run: <code className="text-emerald-400 text-[11px] bg-emerald-950/60 px-1 py-0.5 rounded">executeCommand</code>, <code className="text-emerald-400 text-[11px] bg-emerald-950/60 px-1 py-0.5 rounded">readFile</code>, <code className="text-emerald-400 text-[11px] bg-emerald-950/60 px-1 py-0.5 rounded">writeFile</code>, and <code className="text-emerald-400 text-[11px] bg-emerald-950/60 px-1 py-0.5 rounded">generateMusicVideo</code>!</li>
            </ol>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-emerald-500/30 text-[11px] space-y-1.5">
              <span className="text-emerald-400 font-bold block flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> Example Prompts to give ChatGPT:
              </span>
              <p className="italic text-slate-200">
                1. "Run <code className="text-amber-300 font-mono">npm test</code> on the connected studio and show me the test suite results."
              </p>
              <p className="italic text-slate-200">
                2. "Inspect <code className="text-amber-300 font-mono">src/services/VideoGenerator.js</code> and explain how the canvas rendering loop works."
              </p>
              <p className="italic text-slate-200">
                3. "Generate a 5-scene music video for my track 'Night Drive' using the Sora video generator."
              </p>
            </div>
          </div>
        ) : (
          <>

            {/* Native Web Share Button (Mobile/Safari/Chrome) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Send className="w-4 h-4" /> Send Invite via Messages / WhatsApp / AirDrop
              </button>
            )}

            {/* QR Code Section for In-Person Testing */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-slate-950 rounded-2xl border border-amber-400/40 shadow-md flex-shrink-0">
                <img src={qrCodeSvgDataUri} alt="Scan to test Astraea" width={110} height={110} className="rounded-xl" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Instant Camera Scan</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Have a friend point their iPhone or Android camera at this QR code to launch Astraea immediately without typing!
                </p>
              </div>
            </div>

            {/* Pre-written Invite Message Templates */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Custom Message Templates
              </span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(inviteTemplateDefs).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedInviteTemplate(id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${selectedInviteTemplate === id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={currentMessageText}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-medium resize-none outline-none"
                />
                <button
                  onClick={handleCopyMessage}
                  className="absolute bottom-3 right-3 text-xs py-1 px-3 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold hover:bg-amber-400/30 flex items-center gap-1"
                >
                  {copiedMessage ? <><Check className="w-3 h-3" /> Copied Text</> : <><Copy className="w-3 h-3" /> Copy Message</>}
                </button>
              </div>
            </div>

            {/* Tester Guidance Note */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Tester Tip:</strong> Testers can add their own birthday in <em>"My Birth Details"</em> or create a new profile to explore their unique astrological chart, day archetype, and tarot cards.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
