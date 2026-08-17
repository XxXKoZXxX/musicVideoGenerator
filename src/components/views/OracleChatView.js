import React, { useState } from 'react';
import { generateOracleResponse, ORACLE_SUGGESTIONS } from '../../utils/oracleIntelligenceEngine';
import ChapterPagination from '../navigation/ChapterPagination';
import { 
  MessageSquare, Send, Sparkles, User, Bot, BookOpen, 
  Bookmark, Copy, Check, Compass, Flame, FileText, 
  Upload, Plus, Trash2, ArrowRight
} from 'lucide-react';

export default function OracleChatView({ profile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notebook' | 'notes'
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [bookmarkedEntries, setBookmarkedEntries] = useState([]);

  // Custom PDF / Text Notes State
  const [customNotes, setCustomNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(`astraea_notes_${profile.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          title: `${profile.name}'s Birth Chart & Astrological Notes`,
          date: new Date().toLocaleDateString(),
          tags: ['Natal Chart', 'Astrology'],
          text: `Sun in ${profile.cityName ? profile.cityName : 'Birthplace'}. Life Path mission focused on creative leadership and sovereign mastery. North Node evolutionary growth.`
        }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Astrology');
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'oracle',
      title: 'Greetings & Welcome to Astraea AI Oracle',
      text: `Greetings, ${profile.name}! I am Astraea, your AI Cosmic Oracle and Esoteric Research Assistant. I have indexed your complete astrological chart, Pythagorean numerology matrix, Secret Language archetype, and Tarot birth cards.\n\nAsk me anything about your love life, career calling, shadow integration, past-life karma, or draw a 3-card Tarot reading below! You can also import custom PDF notes or birth readings in the Notes tab.`,
      tags: ['Astraea Oracle', 'Welcome']
    }
  ]);

  // Notebook Saved Entries / Journal
  const [notebookEntries, setNotebookEntries] = useState([
    {
      id: 101,
      category: 'Purpose & Calling',
      title: `Life Path ${profile.name ? profile.name : 'Your'} Vocation Blueprint`,
      icon: <Compass className="w-4 h-4 text-gold" />,
      content: `Your core soul mission unites sovereign authority with creative expression. As an evolving soul, you achieve peak fulfillment when building systems, enterprises, and art that empower others.`
    },
    {
      id: 102,
      category: 'Sacred Shadow Work',
      title: 'Transmuting Resistance & Building Self-Trust',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      content: `Whenever feelings of perfectionism or imposter syndrome arise, recognize them as obsolete defense mechanisms. Your soul chose this incarnation to pioneer boldly, not to remain hidden in safe comfort zones.`
    }
  ]);

  const handleSendMessage = (textToSend = null) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate intelligent oracle synthesis
    setTimeout(() => {
      const oracleData = generateOracleResponse(query, profile);
      const oracleMsg = {
        id: Date.now() + 1,
        sender: 'oracle',
        title: oracleData.title,
        readingType: oracleData.readingType,
        text: oracleData.answer,
        cards: oracleData.cards || null,
        tags: oracleData.tags || []
      };

      setMessages(prev => [...prev, oracleMsg]);
      setIsTyping(false);

      // Also add to notebook journal
      setNotebookEntries(prev => [
        {
          id: Date.now() + 2,
          category: oracleData.readingType || 'Oracle Query',
          title: oracleData.title,
          icon: <Sparkles className="w-4 h-4 text-cyan" />,
          content: oracleData.answer
        },
        ...prev
      ]);
    }, 700);
  };

  const handleSaveCustomNote = () => {
    if (!newNoteTitle.trim() || !newNoteText.trim()) return;

    const newNote = {
      id: Date.now(),
      title: newNoteTitle.trim(),
      date: new Date().toLocaleDateString(),
      tags: [newNoteTag],
      text: newNoteText.trim()
    };

    const updated = [newNote, ...customNotes];
    setCustomNotes(updated);
    try {
      localStorage.setItem(`astraea_notes_${profile.id}`, JSON.stringify(updated));
    } catch (e) {}

    setNewNoteTitle('');
    setNewNoteText('');
    setShowNoteEditor(false);
  };

  const handleDeleteCustomNote = (id) => {
    const filtered = customNotes.filter(n => n.id !== id);
    setCustomNotes(filtered);
    try {
      localStorage.setItem(`astraea_notes_${profile.id}`, JSON.stringify(filtered));
    } catch (e) {}
  };

  const handleAnalyzeNoteWithOracle = (note) => {
    setActiveTab('chat');
    handleSendMessage(`Analyze this esoteric reading & birth note for ${profile.name}:\n\nTitle: "${note.title}"\nContent: "${note.text}"\n\nPlease give a deep esoteric breakdown and actionable life advice.`);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (id) => {
    setBookmarkedEntries(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  return (
    <div className="oracle-chat-page">
      {/* Header */}
      <div className="view-header glass-panel">
        <div className="view-title">
          <MessageSquare className="title-icon text-cyan" />
          <div>
            <h2>Astraea AI Oracle & Esoteric Research Studio</h2>
            <p>Multi-Domain AI Divination, Research Journal & Custom PDF Notes Importer</p>
          </div>
        </div>

        {/* 3-Tab Navigator */}
        <div className="tab-pill-nav">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Bot className="w-3.5 h-3.5 inline mr-1" /> Interactive Oracle Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notebook' ? 'active' : ''}`}
            onClick={() => setActiveTab('notebook')}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Research Journal ({notebookEntries.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1 text-gold" /> Custom PDF & Birth Notes ({customNotes.length})
          </button>
        </div>
      </div>

      {/* 1. Interactive Chat View */}
      {activeTab === 'chat' && (
        <div className="oracle-chat-container mt-6 glass-panel p-4 md:p-6 rounded-2xl">
          {/* Quick Oracle Suggestion Pills */}
          <div className="oracle-suggestions-row flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
            <span className="text-xs font-bold text-gold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Queries:
            </span>
            {ORACLE_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                className="sug-pill text-xs py-1.5 px-3 rounded-full bg-slate-900/80 hover:bg-amber-400/15 border border-slate-700/60 hover:border-amber-400/40 text-slate-200 hover:text-amber-300 transition-all"
                onClick={() => handleSendMessage(sug.query)}
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-scroll space-y-4 max-h-[520px] overflow-y-auto pr-2 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrap flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`chat-bubble max-w-2xl p-4 rounded-2xl glass-panel ${msg.sender === 'user' ? 'bg-gold/15 border-gold/40 text-right' : 'bg-slate-900/85 border-amber-400/20'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {msg.sender === 'oracle' ? (
                      <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center text-cyan">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold ml-auto">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-gold">{msg.sender === 'oracle' ? (msg.title || 'Astraea Oracle') : profile.name}</span>
                  </div>

                  <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line text-left">{msg.text}</p>

                  {/* Tarot Cards Spread Render */}
                  {msg.cards && (
                    <div className="cards-spread-grid mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {msg.cards.map((c, i) => (
                        <div key={i} className="p-3 bg-black/40 rounded-xl border border-gold/20 text-left">
                          <span className="text-[10px] text-gold uppercase font-bold block">{c.position}</span>
                          <strong className="text-xs text-white block mt-0.5">{c.name}</strong>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">{c.meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags and Copy Button */}
                  {msg.sender === 'oracle' && (
                    <div className="mt-3 pt-2 border-t border-amber-400/20 flex justify-between items-center text-[11px] text-silver">
                      <div className="flex gap-1.5">
                        {msg.tags?.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-slate-900 border border-cyan/30 text-[10px] text-cyan">{t}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 text-silver hover:text-gold"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3.5 glass-panel rounded-2xl flex items-center gap-2 text-xs text-cyan">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Astraea is synthesizing your esoteric dimensions...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="chat-input-bar mt-4 pt-3 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything about love, vocation, karma, or request a 3-card Tarot spread..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="input-field text-xs py-3 px-4 w-full"
            />
            <button onClick={() => handleSendMessage()} className="btn-gold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              <span>Consult</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Research Notebook Journal View */}
      {activeTab === 'notebook' && (
        <div className="notebook-container mt-6 space-y-4">
          <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Esoteric Research Notebook & Saved Journal</h3>
              <p className="text-xs text-silver">Chronological record of your soul insights and oracle readings</p>
            </div>
            <button 
              onClick={() => setActiveTab('chat')} 
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Oracle Query
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notebookEntries.map((entry) => (
              <div key={entry.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-gold flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                      {entry.icon} {entry.category}
                    </span>
                    <button 
                      onClick={() => handleToggleBookmark(entry.id)}
                      className={`p-1 ${bookmarkedEntries.includes(entry.id) ? 'text-gold' : 'text-silver hover:text-white'}`}
                      title="Bookmark Insight"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-white mb-2">{entry.title}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{entry.content}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => handleCopy(entry.id, entry.content)}
                    className="text-xs text-silver hover:text-gold flex items-center gap-1"
                  >
                    {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Custom PDF & Birth Notes Importer View */}
      {activeTab === 'notes' && (
        <div className="custom-notes-container mt-6 space-y-4">
          <div className="glass-panel p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" /> Custom PDF & Astrological Notes Importer
              </h3>
              <p className="text-xs text-silver">Import, store, and analyze your private esoteric transcripts, PDF birth readings, and dream journals.</p>
            </div>
            <button 
              onClick={() => setShowNoteEditor(!showNoteEditor)} 
              className="btn-gold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showNoteEditor ? 'Close Editor' : 'Import New Note / PDF Text'}</span>
            </button>
          </div>

          {/* New Note Editor Drawer */}
          {showNoteEditor && (
            <div className="glass-panel p-5 rounded-2xl border border-gold/40 bg-slate-900/90 space-y-3">
              <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> Import or Paste Esoteric Reading:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-silver block mb-1">Note / Reading Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chiron 12th House Karmic Reading, Human Design Gate 34..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="input-field text-xs w-full py-2 px-3"
                  />
                </div>
                <div>
                  <label className="text-xs text-silver block mb-1">Category Tag</label>
                  <select 
                    value={newNoteTag} 
                    onChange={(e) => setNewNoteTag(e.target.value)}
                    className="input-field text-xs w-full py-2 px-3"
                  >
                    <option value="Astrology">Astrology & Transits</option>
                    <option value="Secret Language">Secret Language & Archetypes</option>
                    <option value="Numerology">Numerology Matrix</option>
                    <option value="Tarot">Tarot & Divination</option>
                    <option value="Karmic Nodes">Past-Life & Karmic Nodes</option>
                    <option value="Dream Journal">Dream & Meditation Journal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-silver block mb-1">Paste PDF Text / Transcript / Birth Notes</label>
                <textarea 
                  rows={5}
                  placeholder="Paste the text from your PDF, birth chart reading, or custom notes here..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="input-field text-xs w-full p-3 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setShowNoteEditor(false)}
                  className="btn-secondary text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCustomNote}
                  className="btn-gold text-xs py-2 px-6 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Note
                </button>
              </div>
            </div>
          )}

          {/* Notes List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customNotes.map((note) => (
              <div key={note.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-gold/40 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gold uppercase px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30">
                      {note.tags?.join(' • ') || 'Notes'}
                    </span>
                    <span className="text-[11px] text-silver font-mono">{note.date}</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-white mb-2">{note.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">{note.text}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <button 
                    onClick={() => handleAnalyzeNoteWithOracle(note)}
                    className="btn-gold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <span>Ask AI Oracle to Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => handleDeleteCustomNote(note.id)}
                    className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guided Chapter Flow */}
      {onNavigate && (
        <ChapterPagination 
          prevView="video" 
          prevLabel="Motion Video Studio" 
          nextView="soundscape" 
          nextLabel="Sacred Frequencies" 
          onNavigate={onNavigate} 
        />
      )}
    </div>
  );
}
