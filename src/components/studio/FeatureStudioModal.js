import React, { useState, useRef } from 'react';
import {
  Flame,
  Wrench,
  Gift,
  Film,
  Video,
  Sparkles,
  Users,
  Music,
  Maximize,
  Type,
  Search,
  Download,
  Plus,
  X,
  Upload,
  CheckCircle,
  Play,
} from 'lucide-react';
import { DANCE_STYLES } from '../../services/AIDanceEngine';
import { SPECIAL_EFFECTS_PRESETS } from '../../services/AISpecialEffectsEngine';
import { STOCK_CATEGORIES, StockMediaService } from '../../services/StockMediaService';
import { CHARACTER_PERSONAS } from '../../services/CharacterLockEngine';
import { RENDER_STYLES } from '../../services/RenderStyles';

export default function FeatureStudioModal({
  isOpen,
  onClose,
  initialTab = 'music_video',
  project = {},
  onUpdateProject = () => {},
  onLoadAudioTrack = () => {},
  onAddScene = () => {},
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Feature 1: Music Video (Hot)
  const [mvPrompt, setMvPrompt] = useState('Dark cinematic cyberpunk with explosive neon bass drops and neon skyline');
  const [mvStyle, setMvStyle] = useState('photoreal');

  // Feature 2: AI Video (Hot)
  const [videoPrompt, setVideoPrompt] = useState('Sunset timelapse over futuristic cyberpunk city with retro synthwave lighting');
  const [videoImageRef, setVideoImageRef] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Feature 3: AI Special Effects (Hot)
  const [selectedEffect, setSelectedEffect] = useState('bloom-magic');

  // Feature 4: Subject Reference Video (Hot)
  const [referenceImages, setReferenceImages] = useState([null, null, null]);

  // Feature 5: Dance (Beta)
  const [selectedDanceStyle, setSelectedDanceStyle] = useState('hip-hop');
  const [danceCharacter, setDanceCharacter] = useState(null);

  // Feature 6: AI Shorts (Beta)
  const [shortsIdea, setShortsIdea] = useState('Epic drop reveal with kinetic lyric hook for TikTok & Reels');
  const [shortsRatio, setShortsRatio] = useState('9:16');

  // Feature 7: Synced Lyrics (Free)
  const [lyricsInput, setLyricsInput] = useState(project?.lyrics || '[00:00.00] In the dead of night\\n[00:04.00] Neon city lights shine bright\\n[00:08.00] Feel the bass drop in the sky\\n[00:12.00] We will never die');
  const [lyricsStyle, setLyricsStyle] = useState('neon');

  // Feature 8 & 9: Stock Footage & Stock Images (Free)
  const [stockQuery, setStockQuery] = useState('');
  const [stockCategory, setStockCategory] = useState('All');
  const [stockMediaType, setStockMediaType] = useState('video'); // 'video' | 'image'

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRef3 = useRef(null);

  if (!isOpen) return null;

  // Handle reference image upload
  const handleRefImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const nextRefs = [...referenceImages];
        nextRefs[index] = evt.target.result;
        setReferenceImages(nextRefs);
        onUpdateProject({ subjectReferenceImages: nextRefs.filter(Boolean) });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Stock Item Addition
  const handleAddStockItem = (item) => {
    if (item.type === 'video' || stockMediaType === 'video') {
      onAddScene({
        imageUrl: item.thumbnail || item.url,
        videoUrl: item.url,
        type: 'video',
        title: item.title,
      });
    } else {
      onAddScene({
        imageUrl: item.url,
        title: item.title,
      });
    }
  };

  // Stock search results
  const stockVideos = StockMediaService.searchStockFootage(stockQuery, stockCategory);
  const stockImages = StockMediaService.searchStockImages(stockQuery, stockCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                Astraea AI Studio Suite · Hot & Free Features
              </h3>
              <p className="text-xs text-slate-400">
                Industry leading generative AI tools inspired by Freebeat.ai, Runway Gen-3 & Pika
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEATURE CATEGORY TABS */}
        <div className="flex border-b border-white/10 bg-slate-900/60 px-4 py-2 gap-2 overflow-x-auto">
          {/* 🔥 HOT GROUP */}
          <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded-xl">
            <span className="text-[11px] font-extrabold text-rose-400 flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> HOT:
            </span>
            {[
              { id: 'music_video', label: 'Music Video', icon: Film },
              { id: 'ai_video', label: 'AI Video', icon: Video },
              { id: 'special_effects', label: 'AI FX Presets', icon: Sparkles },
              { id: 'subject_ref', label: 'Subject Ref (1-3)', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 🛠 BETA GROUP */}
          <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-xl">
            <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1 mr-1">
              <Wrench className="w-3.5 h-3.5 text-amber-400" /> BETA:
            </span>
            {[
              { id: 'dance', label: 'Dance Generator', icon: Music },
              { id: 'shorts', label: 'AI Shorts (9:16)', icon: Maximize },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 🎁 FREE GROUP */}
          <div className="flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded-xl">
            <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1 mr-1">
              <Gift className="w-3.5 h-3.5 text-cyan-400" /> FREE:
            </span>
            {[
              { id: 'lyrics', label: 'Synced Lyrics', icon: Type },
              { id: 'stock_media', label: '100k+ Stock Media', icon: Search },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MODAL MAIN BODY */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[68vh]">
          
          {/* ======================================================== */}
          {/* 1. MUSIC VIDEO (HOT) */}
          {/* ======================================================== */}
          {activeTab === 'music_video' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-rose-950/40 to-slate-900/60 p-4 rounded-2xl border border-rose-500/30">
                <h4 className="text-sm font-bold text-rose-300 mb-1 flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-400" />
                  <span>Music Video Generator (Hot)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Create music videos with AI-generated scenes, themes, and effects synced to your audio waveform.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Describe How You Like It (Prompt / Aesthetic Directive):
                </label>
                <textarea
                  rows={3}
                  value={mvPrompt}
                  onChange={(e) => setMvPrompt(e.target.value)}
                  placeholder='e.g. "dark cinematic", "vibrant pop festival", "anime synthwave outrun"'
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Visual Style Theme:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {RENDER_STYLES.slice(0, 6).map(style => (
                    <div
                      key={style.id}
                      onClick={() => {
                        setMvStyle(style.id);
                        onUpdateProject({ renderStyle: style.id });
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        mvStyle === style.id
                          ? 'bg-rose-500/20 border-rose-400 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs">{style.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{style.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProject({
                      musicVideoPrompt: mvPrompt,
                      renderStyle: mvStyle,
                    });
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply & Sync Music Video Scenes</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. AI VIDEO (HOT) */}
          {/* ======================================================== */}
          {activeTab === 'ai_video' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-4 rounded-2xl border border-cyan-500/30">
                <h4 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>AI Video (Hot)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Generate videos from text prompts or reference images instantly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Text Prompt to Video:
                </label>
                <input
                  type="text"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g. sunset timelapse with synthwave music, neon cyberpunk street..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Optional Source Reference Image:
                </label>
                <label className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors bg-slate-900/40">
                  <Upload className="w-6 h-6 text-cyan-400 mb-2" />
                  <span className="text-xs font-bold text-slate-300">
                    {videoImageRef ? 'Reference Image Uploaded ✓' : 'Upload Image for Image-to-Video'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => setVideoImageRef(evt.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsGeneratingVideo(true);
                    setTimeout(() => {
                      setIsGeneratingVideo(false);
                      onAddScene({
                        imageUrl: videoImageRef || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
                        title: videoPrompt.slice(0, 30),
                      });
                      onClose();
                    }, 800);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                >
                  <Video className="w-4 h-4" />
                  <span>{isGeneratingVideo ? 'Generating AI Video Footage...' : 'Generate AI Video Clip'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. AI SPECIAL EFFECTS (HOT) */}
          {/* ======================================================== */}
          {activeTab === 'special_effects' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-fuchsia-950/40 to-slate-900/60 p-4 rounded-2xl border border-fuchsia-500/30">
                <h4 className="text-sm font-bold text-fuchsia-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span>AI Special Effects (Hot)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Add cinematic filters, animations, and camera effect presets (e.g. "Kissing", "Bloom Magic", "Melt", "Electrify").
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SPECIAL_EFFECTS_PRESETS.map(fx => (
                  <div
                    key={fx.id}
                    onClick={() => setSelectedEffect(fx.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedEffect === fx.id
                        ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-lg'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{fx.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-fuchsia-300">{fx.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{fx.description}</p>
                    </div>
                    {selectedEffect === fx.id && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-fuchsia-300 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Selected Preset
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProject({ pikaFx: selectedEffect });
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-fuchsia-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Effect to Video Pipeline</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. SUBJECT REFERENCE VIDEO (HOT) */}
          {/* ======================================================== */}
          {activeTab === 'subject_ref' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-amber-950/40 to-slate-900/60 p-4 rounded-2xl border border-amber-500/30">
                <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Subject Reference Video (Hot)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Upload 1–3 reference images; AI locks and maintains consistent character, face, object, and scene identity throughout final video production.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Upload 1 to 3 Subject Reference Photos:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Reference 1 (Front View)', ref: fileInputRef1 },
                    { label: 'Reference 2 (Angle / Profile)', ref: fileInputRef2 },
                    { label: 'Reference 3 (Action / Full Body)', ref: fileInputRef3 },
                  ].map((slot, idx) => (
                    <div
                      key={idx}
                      onClick={() => slot.ref.current?.click()}
                      className="border-2 border-dashed border-white/15 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors bg-slate-900/50 min-h-[140px] text-center"
                    >
                      <input
                        ref={slot.ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleRefImageUpload(idx, e)}
                      />
                      {referenceImages[idx] ? (
                        <div className="relative w-full h-full flex flex-col items-center">
                          <img
                            src={referenceImages[idx]}
                            alt={slot.label}
                            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 mb-1 shadow-md"
                          />
                          <span className="text-[10px] text-amber-300 font-bold">Image Locked ✓</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-amber-400 mb-1" />
                          <span className="text-xs font-bold text-slate-200">{slot.label}</span>
                          <span className="text-[10px] text-slate-500">Click to upload</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (referenceImages[0]) {
                      onUpdateProject({
                        customFaceAnchor: referenceImages[0],
                        subjectReferenceImages: referenceImages.filter(Boolean),
                      });
                    }
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Lock Subject Reference Consistency</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. DANCE (BETA) */}
          {/* ======================================================== */}
          {activeTab === 'dance' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 p-4 rounded-2xl border border-purple-500/30">
                <h4 className="text-sm font-bold text-purple-300 mb-1 flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>AI Dance Animation (Beta)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Auto-generate beat-synchronized dance choreographies synced to your music track.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Dance Choreography Style:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {DANCE_STYLES.map(style => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedDanceStyle(style.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDanceStyle === style.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs text-purple-200">{style.name}</div>
                      <div className="text-[10px] text-slate-400">{style.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Choose Dancer Character Performer:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CHARACTER_PERSONAS.slice(0, 4).map(persona => (
                    <div
                      key={persona.id}
                      onClick={() => setDanceCharacter(persona)}
                      className={`p-2 rounded-xl border cursor-pointer flex flex-col items-center text-center transition-all ${
                        (danceCharacter?.id || CHARACTER_PERSONAS[0].id) === persona.id
                          ? 'bg-purple-500/20 border-purple-400 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <img src={persona.avatarUrl} alt={persona.name} className="w-10 h-10 rounded-full object-cover mb-1" />
                      <div className="text-[11px] font-bold text-white line-clamp-1">{persona.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProject({
                      freebeatMode: 'dance',
                      danceStyle: selectedDanceStyle,
                      characterLockPersona: danceCharacter || CHARACTER_PERSONAS[0],
                    });
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  <Play className="w-4 h-4" />
                  <span>Render Beat-Synced Dance Animation</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. AI SHORTS (BETA) */}
          {/* ======================================================== */}
          {activeTab === 'shorts' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-4 rounded-2xl border border-emerald-500/30">
                <h4 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-emerald-400" />
                  <span>AI Shorts & Reels Creator (Beta)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Create high-retention vertical shorts (9:16) for TikTok, Instagram Reels, and YouTube Shorts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Shorts Idea & Hook Script:
                </label>
                <textarea
                  rows={3}
                  value={shortsIdea}
                  onChange={(e) => setShortsIdea(e.target.value)}
                  placeholder="Describe your short video hook, story arc, or visual drops..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Aspect Ratio:
                </label>
                <div className="flex gap-2">
                  {['9:16', '1:1', '16:9'].map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setShortsRatio(ratio)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        shortsRatio === ratio
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {ratio} {ratio === '9:16' ? '(TikTok/Reels)' : ratio === '1:1' ? '(Spotify Canvas)' : '(YouTube)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProject({
                      aspectRatio: shortsRatio,
                      shortsIdea,
                      lyricsStyle: 'neon',
                    });
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Social Shorts Master</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. LYRICS (FREE) */}
          {/* ======================================================== */}
          {activeTab === 'lyrics' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-4 rounded-2xl border border-cyan-500/30">
                <h4 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <Type className="w-4 h-4 text-cyan-400" />
                  <span>Animated Synced Lyrics (Free)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Create videos with word-by-word animated kinetic karaoke lyrics synchronized to the music.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Song Lyrics (with optional [mm:ss.xx] timestamps):
                </label>
                <textarea
                  rows={5}
                  value={lyricsInput}
                  onChange={(e) => setLyricsInput(e.target.value)}
                  placeholder="[00:00.00] First lyric line&#10;[00:04.00] Second lyric line..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Subtitle Kinetic Typography Style:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'neon', name: 'Cyber Neon Pulse' },
                    { id: 'karaoke', name: 'Karaoke Word Glow' },
                    { id: 'glitch', name: 'RGB Cyber Glitch' },
                    { id: 'minimal', name: 'Cinematic Minimal' },
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLyricsStyle(style.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        lyricsStyle === style.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProject({
                      lyrics: lyricsInput,
                      lyricsStyle,
                    });
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Sync Lyrics to Video Timeline</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8 & 9. STOCK FOOTAGE & STOCK IMAGES (FREE) */}
          {/* ======================================================== */}
          {activeTab === 'stock_media' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/60 p-4 rounded-2xl border border-blue-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-1 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span>100,000+ Royalty-Free Stock Media (Free)</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Search and access HD/4K royalty-free video footage and images. Add directly to your project timeline or download.
                  </p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 gap-1">
                  <button
                    type="button"
                    onClick={() => setStockMediaType('video')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      stockMediaType === 'video' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Stock Footage ({stockVideos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockMediaType('image')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      stockMediaType === 'image' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Stock Images ({stockImages.length})
                  </button>
                </div>
              </div>

              {/* SEARCH & CATEGORY FILTERS */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={stockQuery}
                    onChange={(e) => setStockQuery(e.target.value)}
                    placeholder='Search keywords like "rainbow", "sunset", "neon city", "crowd", "abstract"...'
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400"
                  />
                </div>
                <select
                  value={stockCategory}
                  onChange={(e) => setStockCategory(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-400"
                >
                  {STOCK_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* MEDIA GRID */}
              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {stockMediaType === 'video' ? (
                  stockVideos.map(video => (
                    <div key={video.id} className="bg-slate-900 rounded-xl overflow-hidden border border-white/5 flex flex-col group">
                      <div className="relative aspect-video bg-black">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300">
                          {video.duration} · {video.resolution}
                        </span>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-xs text-white line-clamp-1">{video.title}</div>
                          <div className="text-[10px] text-slate-400">{video.category}</div>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddStockItem(video)}
                            className="flex-1 py-1 px-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-[10px] font-bold text-blue-200 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add to Timeline
                          </button>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                            title="Download Stock Footage"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  stockImages.map(img => (
                    <div key={img.id} className="bg-slate-900 rounded-xl overflow-hidden border border-white/5 flex flex-col group">
                      <div className="relative aspect-video bg-black">
                        <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-xs text-white line-clamp-1">{img.title}</div>
                          <div className="text-[10px] text-slate-400">{img.category}</div>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddStockItem(img)}
                            className="flex-1 py-1 px-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-[10px] font-bold text-blue-200 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Scene
                          </button>
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                            title="Download Stock Image"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
