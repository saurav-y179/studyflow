import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Settings, ArrowLeft, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { getMiniBrainResponse } from '../utils/pikachuBrain';

export const ChatPanel = ({ isOpen, onClose, entries, streak, sidebarWidth = 200, user, connections }) => {
  const panelTransition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.75 };
  const viewTransition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Pikachu, your Flow AI assistant. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmMode, setLlmMode] = useState(() => localStorage.getItem('flow_llmMode') || 'local');
  const [localHost, setLocalHost] = useState(() => localStorage.getItem('flow_localHost') || 'http://localhost:8000');
  // API key stored in sessionStorage (cleared when browser closes) - more secure than localStorage
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('flow_apiKey') || '');

  // Persist settings (apiKey goes to sessionStorage, others to localStorage)
  useEffect(() => {
    localStorage.setItem('flow_llmMode', llmMode);
    localStorage.setItem('flow_localHost', localHost);
    sessionStorage.setItem('flow_apiKey', apiKey);
  }, [llmMode, localHost, apiKey]);

  // Persist chat history in localStorage (no server dependency)
  useEffect(() => {
    let isCancelled = false;

    const historyKey = `flow_chat_${user?.id || 'guest'}`;
    queueMicrotask(() => {
      if (!isCancelled) {
        try {
          const saved = localStorage.getItem(historyKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) {
              setMessages(parsed);
            }
          }
        } catch { /* ignore parse errors */ }
        setIsHistoryLoaded(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // Save chat history to localStorage
  useEffect(() => {
    if (isHistoryLoaded && messages.length > 0) {
      const historyKey = `flow_chat_${user?.id || 'guest'}`;
      try {
        localStorage.setItem(historyKey, JSON.stringify(messages));
      } catch { /* quota exceeded or storage unavailable */ }
    }
  }, [messages, user?.id, isHistoryLoaded]);

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm Pikachu, your Flow AI assistant. How can I help you today?",
    }]);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || isSettingsOpen) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, isSettingsOpen]);

  const getContext = () => {
    if (!entries || entries.length === 0) return 'No activity yet.';
    const currentStreak = streak?.current || 0;
    const longestStreak = streak?.longest || 0;
    const recentEntries = entries.slice(-7);
    const today = entries.find(
      (e) => e.date === new Date().toISOString().slice(0, 10)
    );
    const todayTasks = today?.todayTasks || [];
    const todayPct = todayTasks.length
      ? Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100)
      : 0;

    return `Today's Completion: ${todayPct}%
Current Streak: ${currentStreak} days
Longest Streak: ${longestStreak} days
Recent Activity:
${recentEntries.map((e) => {
    const tasks = e.todayTasks || [];
    const done = tasks.filter((t) => t.completed).length;
    return `- ${e.date}: ${done}/${tasks.length} tasks complete`;
  }).join('\n')}`.trim();
  };

  const callLLM = async (userMessage, onStream) => {
    let todayPct = 0;
    let currentStreak = streak?.current || 0;
    if (entries && entries.length > 0) {
      const today = entries.find(e => e.date === new Date().toISOString().slice(0, 10));
      const todayTasks = today?.todayTasks || [];
      if (todayTasks.length > 0) {
        todayPct = Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100);
      }
    }

    try {
      if (llmMode === 'basic') {
        await new Promise(r => setTimeout(r, 600));
        return { text: getMiniBrainResponse(userMessage, todayPct, currentStreak), isFallback: false };
      }

      const context = getContext();
      const connectionsContext = connections && connections.length > 0
        ? `\nExternal Connections:\n${connections.map(c => `- ${c.label} (${c.platform}): ${c.stats ? Object.values(c.stats).map(s => `${s.label}: ${s.value}`).join(', ') : 'No stats'}`).join('\n')}`
        : '';
      const systemPrompt = `You are Pikachu, a highly motivating, energetic, and helpful productivity AI assistant for StudyFlow. You love helping students stay focused. Occasionally use Pikachu expressions like 'Pika!' or 'Pika pika!'. You have access to the user's productivity data:\n\n${context}\nStreak: ${currentStreak} days${connectionsContext}\n\nAnswer the user's message concisely and energetically (2-3 sentences max).`;

      const reqMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ];

      const endpoint = llmMode === 'api' ? 'https://api.groq.com/openai/v1/chat/completions' : `${localHost}/v1/chat/completions`;
      const headers = { 'Content-Type': 'application/json' };
      
      if (llmMode === 'api' && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: llmMode === 'api' ? 'llama-3.3-70b-versatile' : 'llama-3.2-1b',
          messages: reqMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onStream?.(fullText);
              }
            } catch { /* ignore malformed JSON chunks */ }
          }
        }
      }

      return { text: fullText.trim(), isFallback: false };
    } catch (error) {
      console.error('LLM error, falling back to Mini-Brain:', error);
      return { text: getMiniBrainResponse(userMessage, todayPct, currentStreak), isFallback: true };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const assistantIndex = messages.length + 1;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: '', isStreaming: true }]);
    setIsLoading(true);

    const response = await callLLM(userMessage, (text) => {
      setMessages((prev) => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = { ...next[assistantIndex], content: text };
        }
        return next;
      });
    });
    
    setMessages((prev) => {
      const next = [...prev];
      if (next[assistantIndex]) {
        next[assistantIndex] = { role: 'assistant', content: response.text, isFallback: response.isFallback };
      }
      return next;
    });
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const viewVariants = {
    enter: (direction) => ({ opacity: 0, x: direction * 18, filter: 'blur(3px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (direction) => ({ opacity: 0, x: direction * -18, filter: 'blur(3px)' }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Flow AI Pikachu chat"
          initial={{ opacity: 0, x: -38, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -26, y: 8 }}
          transition={panelTransition}
          className="fixed left-3 right-3 bottom-12 lg:left-[var(--chat-left)] lg:right-auto lg:w-96 h-[min(620px,calc(100dvh-4rem))] lg:h-[600px] z-[70] flex flex-col overflow-hidden rounded-3xl shadow-2xl lg:transition-[left] lg:duration-300"
          style={{
            '--chat-left': `${sidebarWidth + 10}px`,
            background: 'linear-gradient(170deg, rgba(189,245,22,0.12) 0%, rgba(100,233,134,0.1) 40%, rgba(144,238,144,0.08) 70%, rgba(152,255,152,0.1) 100%)',
            backdropFilter: 'blur(28px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            border: '1px solid rgba(189,245,22,0.18)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(189,245,22,0.1)',
            transformOrigin: 'left bottom',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(189,245,22,0.1) 0%, rgba(100,233,134,0.08) 100%)',
              borderBottom: '1px solid rgba(189,245,22,0.12)',
            }}
          >
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait" initial={false}>
                {isSettingsOpen ? (
                  <motion.button
                    key="back"
                    initial={{ opacity: 0, rotate: -20, scale: 0.88 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 20, scale: 0.88 }}
                    transition={viewTransition}
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="sparkles"
                    initial={{ opacity: 0, rotate: 20, scale: 0.88 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -20, scale: 0.88 }}
                    transition={viewTransition}
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #BDF516, #64E986)',
                      boxShadow: '0 4px 14px rgba(189,245,22,0.3)',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-[#1a3300]" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence mode="wait" initial={false}>
                {!isSettingsOpen ? (
                  <motion.div
                    key="chat-title"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={viewTransition}
                  >
                    <h3 className="text-white font-bold text-sm tracking-wide">
                      Flow AI <span style={{ color: '#BDF516' }}>Pikachu</span>
                    </h3>
                    <p className="text-micro uppercase tracking-wider" style={{ color: '#90EE90' }}>Active</p>
                  </motion.div>
                ) : (
                  <motion.h3
                    key="settings-title"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={viewTransition}
                    className="text-white font-bold text-sm tracking-wide"
                  >
                    AI Settings
                  </motion.h3>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-1.5">
              {!isSettingsOpen && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(189,245,22,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" style={{ color: '#90EE90' }} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(189,245,22,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X className="w-4 h-4" style={{ color: '#90EE90' }} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <AnimatePresence mode="wait" initial={false} custom={isSettingsOpen ? 1 : -1}>
          {isSettingsOpen ? (
            <motion.div
              key="settings"
              custom={1}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={viewTransition}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              {/* Docs Links */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <a 
                  href="/docs/ai-setup.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-[#BDF516]/10 border border-[#BDF516]/30 rounded-xl text-[#BDF516] hover:bg-[#BDF516]/20 transition-colors cursor-pointer text-center"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-micro font-bold uppercase tracking-wider">Web Guide</span>
                </a>
                <a 
                  href="/docs/ai-setup.txt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 bg-white/5 border border-white/20 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-center"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-micro font-bold uppercase tracking-wider">Notepad Guide</span>
                </a>
              </div>

              {/* Local Option */}
              <div 
                className={`p-4 rounded-xl border transition-all ${llmMode === 'local' ? 'border-[#BDF516] bg-white/10' : 'border-white/10 bg-black/20'}`}
                onClick={() => setLlmMode('local')}
              >
                <div className="flex items-center justify-between mb-2 cursor-pointer">
                  <h4 className={`font-bold ${llmMode === 'local' ? 'text-[#BDF516]' : 'text-white'}`}>Local LLM Inference</h4>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${llmMode === 'local' ? 'border-[#BDF516]' : 'border-white/30'}`}>
                    {llmMode === 'local' && <div className="w-2 h-2 bg-[#BDF516] rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-3 leading-relaxed">
                  Runs entirely on your machine. Quality and speed depend on your local model and hardware.
                </p>
                {llmMode === 'local' && (
                  <div className="space-y-2 mt-2" onClick={e => e.stopPropagation()}>
                    <label className="text-micro font-bold uppercase tracking-wider text-white/50">Host Address</label>
                    <input 
                      type="text" 
                      value={localHost} 
                      onChange={e => setLocalHost(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BDF516]/50"
                    />
                  </div>
                )}
              </div>

              {/* API Option */}
              <div 
                className={`p-4 rounded-xl border transition-all ${llmMode === 'api' ? 'border-[#BDF516] bg-white/10' : 'border-white/10 bg-black/20'}`}
                onClick={() => setLlmMode('api')}
              >
                <div className="flex items-center justify-between mb-2 cursor-pointer">
                  <h4 className={`font-bold ${llmMode === 'api' ? 'text-[#BDF516]' : 'text-white'}`}>Cloud API (e.g. Groq)</h4>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${llmMode === 'api' ? 'border-[#BDF516]' : 'border-white/30'}`}>
                    {llmMode === 'api' && <div className="w-2 h-2 bg-[#BDF516] rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-3 leading-relaxed">
                  Connects to an external provider. Get a free API key from Groq for blazing fast responses.
                </p>
                {llmMode === 'api' && (
                  <div className="space-y-3 mt-2" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-1 block">Groq API Key</label>
                      <input 
                        type="password" 
                        value={apiKey} 
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="gsk_..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BDF516]/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Fallback Option */}
              <div 
                className={`p-4 rounded-xl border transition-all ${llmMode === 'basic' ? 'border-[#BDF516] bg-white/10' : 'border-white/10 bg-black/20'}`}
                onClick={() => setLlmMode('basic')}
              >
                <div className="flex items-center justify-between mb-2 cursor-pointer">
                  <h4 className={`font-bold ${llmMode === 'basic' ? 'text-[#BDF516]' : 'text-white'}`}>Basic Responses</h4>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${llmMode === 'basic' ? 'border-[#BDF516]' : 'border-white/30'}`}>
                    {llmMode === 'basic' && <div className="w-2 h-2 bg-[#BDF516] rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  If you don't want to use AI, choose this. Uses existing pre-written generic responses of lower quality.
                </p>
              </div>
              
              <div className="p-3 bg-[#BDF516]/10 border border-[#BDF516]/20 rounded-xl mt-2">
                <p className="text-[11px] text-[#BDF516]/80 leading-relaxed font-medium">
                  <span className="font-bold">Auto-Fallback Active:</span> If Local or Cloud API fails to connect, Pikachu will automatically fall back to Basic Responses so you never see an error!
                </p>
              </div>

              {/* Clear Chat Button */}
              <button 
                onClick={clearChat}
                className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Clear Chat History</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              custom={-1}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={viewTransition}
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-1.5 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                    message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                  style={
                    message.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(189,245,22,0.25), rgba(100,233,134,0.2))',
                          color: '#fff',
                          border: '1px solid rgba(189,245,22,0.2)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }
                  }
                >
                  <p>{message.content}</p>
                </div>
                {message.isFallback && (
                  <div className="flex items-center gap-1.5 text-[9px] text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 max-w-[85%] mb-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>Connection failed. Switched to offline Mini-Brain.</span>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (!messages[messages.length - 1]?.content) && (
              <div className="flex justify-start">
                <div
                  className="px-5 py-3.5 rounded-2xl rounded-bl-sm flex gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#BDF516' }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#64E986' }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#90EE90' }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

              {/* Quick suggestion pills */}
              {messages.length <= 1 && !isLoading && (
                <div className="px-5 pb-2 flex flex-wrap gap-1.5">
                  {[
                    'How am I doing today?',
                    'Motivate me!',
                    'Analyze my streak',
                    'Study tips?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => {
                          setInput('');
                          const fakeEvent = { key: 'Enter', shiftKey: false, preventDefault: () => {} };
                          // Directly call handleSend with the suggestion
                          setMessages((prev) => [...prev, { role: 'user', content: suggestion }, { role: 'assistant', content: '', isStreaming: true }]);
                          setIsLoading(true);
                          callLLM(suggestion, (text) => {
                            setMessages((prev) => {
                              const next = [...prev];
                              const idx = next.length - 1;
                              if (next[idx]) next[idx] = { ...next[idx], content: text };
                              return next;
                            });
                          }).then((response) => {
                            setMessages((prev) => {
                              const next = [...prev];
                              const idx = next.length - 1;
                              if (next[idx]) next[idx] = { role: 'assistant', content: response.text, isFallback: response.isFallback };
                              return next;
                            });
                            setIsLoading(false);
                          });
                        }, 0);
                      }}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all hover:scale-105"
                      style={{
                        background: 'rgba(189,245,22,0.08)',
                        border: '1px solid rgba(189,245,22,0.15)',
                        color: '#BDF516',
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div
                className="p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(189,245,22,0.08) 0%, rgba(100,233,134,0.06) 100%)',
                  borderTop: '1px solid rgba(189,245,22,0.12)',
                }}
              >
                <div className="flex items-center gap-2 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Pikachu..."
                    className="flex-1 px-5 py-3.5 rounded-2xl text-white text-sm shadow-inner transition-colors"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(189,245,22,0.15)',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(189,245,22,0.35)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(189,245,22,0.15)'}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #BDF516, #64E986)',
                      boxShadow: '0 4px 14px rgba(189,245,22,0.25)',
                    }}
                  >
                    <Send className="w-4 h-4 text-[#0a1a00]" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
