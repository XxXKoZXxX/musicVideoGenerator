import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Camera,
  Film,
  Flame,
  Palette,
  Sliders,
  CheckCircle,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { chatWithOpusAgent, generateOpusAgentProductionBible } from '../../services/AIService';
import { OPUS_DIRECTOR_PRESETS } from '../../data/aiModels';

export default function OpusAgentAssistantDrawer({
  isOpen,
  onClose,
  project = {},
  onUpdateProject = () => {},
  onApplyScenes = () => {},
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: `👋 Greetings! I am **Claude 3 Opus Autonomous Director Agent**.\n\nI am your AI Music Video Director. I can orchestrate production bibles, write Sora/Runway prompts, optimize Higgsfield DoP camera angles, or auto-direct your entire music video. How can I assist your vision today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('opus-cyber-epic');
  const [productionBible, setProductionBible] = useState(null);
  const [generatingBible, setGeneratingBible] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customMsg = null) => {
    const textToSend = customMsg || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInputText('');
    setLoading(true);

    try {
      const res = await chatWithOpusAgent(textToSend, messages, project);
      const agentMsg = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: res.reply || res.content || 'Directorial adjustment logged.',
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: `⚠️ Opus Director network pulse interrupted: ${e.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProductionBible = async () => {
    setGeneratingBible(true);
    try {
      const presetObj = OPUS_DIRECTOR_PRESETS.find((p) => p.id === selectedPreset);
      const bibleRes = await generateOpusAgentProductionBible(
        project,
        presetObj?.style || 'Cyberpunk Epic Cinema'
      );
      setProductionBible(bibleRes.productionBible);

      const agentMsg = {
        id: `bible-msg-${Date.now()}`,
        sender: 'agent',
        text: `✨ **Claude 3 Opus Production Bible Generated!**\n\nI have structured a full directorial vision with color palettes, camera plans, and 5 AI video scene prompts. Click **"Apply Opus Production Bible"** below to load this into your timeline.`,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingBible(false);
    }
  };

  const handleApplyBibleToProject = () => {
    if (!productionBible) return;

    if (Array.isArray(productionBible.scenes)) {
      onApplyScenes(
        productionBible.scenes.map((sc, idx) => ({
          id: `opus-scene-${idx + 1}`,
          title: `Scene ${idx + 1} (Claude 3 Opus)`,
          directive: typeof sc === 'string' ? sc : sc.prompt || sc.directive,
          cameraMove: productionBible.cameraPlan?.[idx]?.move || '360-orbit',
          imageUrl:
            project.images?.[idx % (project.images?.length || 1)] ||
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
        }))
      );
    }

    onUpdateProject({
      selectedStoryGenerator: 'claude_opus',
      opusDirectorBible: productionBible,
      renderStyle: 'photoreal',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-950 border-l border-amber-500/30 w-full max-w-2xl h-full flex flex-col shadow-2xl text-white">
        {/* DRAWER HEADER */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
                  Claude 3 Opus AI Director Agent
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  FLAGSHIP AGENT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Music Video Director & Production Bible Orchestrator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRESET DIRECTORIAL STYLES BAR */}
        <div className="bg-slate-900/90 border-b border-white/10 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 shrink-0">
            <Palette className="w-3.5 h-3.5" /> Preset Visions:
          </span>
          {OPUS_DIRECTOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedPreset === preset.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                  : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* QUICK AGENT ACTIONS */}
        <div className="p-3 bg-slate-900/50 border-b border-white/10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerateProductionBible}
            disabled={generatingBible}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {generatingBible ? 'Orchestrating...' : '⚡ Generate Opus Production Bible'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Suggest optimal Higgsfield DoP camera angles for my song')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>DoP Camera Plan</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('Write 3 Sora 4K scene prompt variations for the beat drop')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-500/30"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Sora Drop Prompts</span>
          </button>
        </div>

        {/* PRODUCTION BIBLE PREVIEW CARD (IF GENERATED) */}
        {productionBible && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-lg text-xs space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4" /> Opus Production Bible Ready
              </span>
              <button
                type="button"
                onClick={handleApplyBibleToProject}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[11px]"
              >
                Apply to Project Timeline ✓
              </button>
            </div>
            <p className="text-slate-300 italic">{productionBible.concept}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {productionBible.colorPalette?.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-amber-200 border border-white/10"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-semibold rounded-br-none'
                    : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1 text-[11px]">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Claude 3 Opus Agent</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-amber-500/30 text-amber-300 rounded-2xl p-3 flex items-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Claude 3 Opus is analyzing visual vectors & directing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* CHAT INPUT FOOTER */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Opus Director to refine scenes, rewrite prompts, or adjust camera paths..."
              className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
