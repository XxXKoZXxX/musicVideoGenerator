import React, { useState, useEffect } from 'react';
import { 
  X, Share2, Copy, Check, Smartphone, Globe, 
  Send, Sparkles, Heart, MessageCircle, ShieldCheck 
} from 'lucide-react';

export default function ShareModal({ isOpen, onClose, activeProfile }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedInviteTemplate, setSelectedInviteTemplate] = useState('general');
  const [activeShareUrl, setActiveShareUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin;
      }
    }
    return 'https://wonder-lobby-chelsea-enters.trycloudflare.com';
  });

  // Fetch real-time active tunnel URL if available from serve/share script
  useEffect(() => {
    let isMounted = true;
    fetch('/active_url.json')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data && data.url) {
          setActiveShareUrl(data.url);
        }
      })
      .catch(() => {
        // Fallback gracefully to default
      });
    return () => { isMounted = false; };
  }, []);

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=F59E0B&bgcolor=060814&data=${encodeURIComponent(activeShareUrl)}`;

  const inviteTemplates = {
    general: {
      title: '🌟 General Test Invitation',
      text: `✨ Hey! I'm testing Astraea — an interactive Secret Language of Birthdays, Astrology Birth Chart, Occult Grimoire & Tarot app. Try it out here:\n👉 ${activeShareUrl}`
    },
    synastry: {
      title: '💖 Compatibility & Match Test',
      text: `🔮 Hey! Enter your birthday into Astraea to test our Twin Flame & Cosmic Compatibility side-by-side:\n👉 ${activeShareUrl}`
    },
    secretLanguage: {
      title: '📜 366 Day Archetype & Fortune',
      text: `✨ Check out what your exact birthdate means in the Secret Language of Birthdays on Astraea:\n👉 ${activeShareUrl}`
    }
  };

  const currentMessageText = inviteTemplates[selectedInviteTemplate]?.text || inviteTemplates.general.text;

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
          title: `Astraea Cosmic Studio — Test & Explore`,
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
              <h3 className="font-serif text-lg font-bold text-white">Share App with Testers</h3>
              <p className="text-xs text-slate-300">Invite friends & testers on iPhone, Android or PC</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:bg-amber-400/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Link Copy Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Live Shareable Web Link
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> HTTPS Secure
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-400/30 rounded-2xl p-2">
            <input 
              type="text" 
              readOnly 
              value={activeShareUrl} 
              className="bg-transparent text-xs text-amber-300 font-mono font-bold w-full outline-none px-2 select-all truncate"
            />
            <button 
              onClick={handleCopyLink} 
              className="btn-gold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 font-bold bg-amber-400 text-slate-950 flex-shrink-0 hover:bg-amber-300 transition-all"
            >
              {copiedLink ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
            </button>
          </div>
        </div>

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
            <img src={qrCodeUrl} alt="Scan to test Astraea" width={110} height={110} className="rounded-xl" />
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
            {[
              { id: 'general', label: '🌟 General', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'synastry', label: '💖 Love Match', icon: <Heart className="w-3.5 h-3.5" /> },
              { id: 'secretLanguage', label: '📜 Birthday', icon: <MessageCircle className="w-3.5 h-3.5" /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedInviteTemplate(t.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  selectedInviteTemplate === t.id 
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.icon}
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
      </div>
    </div>
  );
}
