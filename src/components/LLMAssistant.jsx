import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';

const LLM_API = 'http://localhost:8000';

const RabbitIcon = ({ state }) => {
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  
  return (
    <motion.div
      animate={{ y: isThinking ? [0, -4, 0] : [0, -2, 0] }}
      transition={{ duration: isThinking ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-50 ${
        state !== 'idle' 
          ? 'bg-secondary/10 border border-secondary/50 shadow-[0_0_20px_rgba(204,0,32,0.3)]' 
          : 'bg-surface-elevated border border-glass-border shadow-lg hover:shadow-xl hover:border-glass-border/80'
      } cursor-pointer`}
    >
      {/* Ears */}
      <motion.div 
        className={`absolute -top-5 left-2 w-2.5 h-7 rounded-t-full origin-bottom transition-colors duration-500 ${state !== 'idle' ? 'bg-secondary/20 border border-secondary/50' : 'bg-surface-elevated border border-glass-border'}`} 
        animate={{ rotate: isThinking ? [0, -15, 0] : isSpeaking ? [-5, 5, -5] : [0, -5, 0] }}
        transition={{ duration: isThinking ? 0.6 : isSpeaking ? 0.3 : 4, repeat: Infinity }}
      />
      <motion.div 
        className={`absolute -top-5 right-2 w-2.5 h-7 rounded-t-full origin-bottom transition-colors duration-500 ${state !== 'idle' ? 'bg-secondary/20 border border-secondary/50' : 'bg-surface-elevated border border-glass-border'}`} 
        animate={{ rotate: isThinking ? [0, 15, 0] : isSpeaking ? [5, -5, 5] : [0, 5, 0] }}
        transition={{ duration: isThinking ? 0.6 : isSpeaking ? 0.3 : 4, repeat: Infinity, delay: 0.1 }}
      />
      
      {/* Face/Eyes */}
      <div className="flex gap-2.5 relative z-10 mt-1">
        <motion.div 
          className={`w-1.5 h-2 rounded-full transition-colors duration-500 ${state !== 'idle' ? 'bg-secondary-glow' : 'bg-text-secondary'}`} 
          animate={{ scaleY: isThinking ? [1, 0.2, 1] : [1, 1, 0.1, 1, 1] }} 
          transition={{ repeat: Infinity, duration: isThinking ? 0.6 : 4, times: isThinking ? [0, 0.5, 1] : [0, 0.45, 0.5, 0.55, 1] }} 
        />
        <motion.div 
          className={`w-1.5 h-2 rounded-full transition-colors duration-500 ${state !== 'idle' ? 'bg-secondary-glow' : 'bg-text-secondary'}`} 
          animate={{ scaleY: isThinking ? [1, 0.2, 1] : [1, 1, 0.1, 1, 1] }} 
          transition={{ repeat: Infinity, duration: isThinking ? 0.6 : 4, times: isThinking ? [0, 0.5, 1] : [0, 0.45, 0.5, 0.55, 1] }} 
        />
      </div>
      
      {/* Nose */}
      <div className={`absolute bottom-3 w-1 h-1 rounded-full transition-colors duration-500 ${state !== 'idle' ? 'bg-primary' : 'bg-text-tertiary/50'}`} />
    </motion.div>
  );
};

export const LLMAssistant = ({ entries, streak }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rabbitState, setRabbitState] = useState('idle'); // idle, thinking, speaking
  const [insight, setInsight] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I'm analyzing your momentum. Click me to chat or wait for insights.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const getContext = () => {
    const recentEntries = entries.slice(-7);
    const today = entries.find(
      (e) => e.date === new Date().toISOString().slice(0, 10)
    );
    const todayTasks = today?.todayTasks || [];
    const todayPct = todayTasks.length
      ? Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100)
      : 0;

    return `Current Streak: ${streak.current} days
Today's Completion: ${todayPct}%
Recent Activity:
${recentEntries.map((e) => {
    const tasks = e.todayTasks || [];
    const done = tasks.filter((t) => t.completed).length;
    return `- ${e.date}: ${done}/${tasks.length} tasks complete`;
  }).join('\n')}`.trim();
  };

  const callLLM = async (userMessage, isInsight = false) => {
    try {
      const context = getContext();
      const systemPrompt = isInsight 
        ? `You are a sharp, minimalist productivity AI. Given the user's data: ${context}. Give ONE short, punchy insight (max 10 words) about their current momentum or consistency. Do not use quotes.`
        : `You are StudyFlow, a helpful productivity assistant for students. You have access to the user's productivity data:\n\n${context}\n\nAnalyze their consistency, suggest improvements, and detect patterns. Keep responses concise (2-3 sentences max).`;

      const reqMessages = isInsight 
        ? [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Give me a short insight." }
          ]
        : [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ];

      const response = await fetch(`${LLM_API}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.2-1b',
          messages: reqMessages,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('API not available');
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('LLM error:', error);
      return isInsight ? "Keep pushing forward." : "Couldn't connect to local model.";
    }
  };

  // Periodic insights
  useEffect(() => {
    if (isOpen) return; // Don't show insights while chatting

    const fetchInsight = async () => {
      setRabbitState('thinking');
      const newInsight = await callLLM('', true);
      setInsight(newInsight);
      setRabbitState('speaking');
      
      // Clear insight after 6 seconds
      setTimeout(() => {
        setInsight(null);
        setRabbitState('idle');
      }, 6000);
    };

    // First insight after 10s, then every 30s
    const initialTimer = setTimeout(() => {
      fetchInsight();
      const interval = setInterval(fetchInsight, 30000);
      return () => clearInterval(interval);
    }, 10000);

    return () => clearTimeout(initialTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, streak, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setRabbitState('thinking');

    const response = await callLLM(userMessage);
    
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
    setRabbitState('speaking');
    setTimeout(() => setRabbitState('idle'), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Rabbit Container */}
      <div className="fixed bottom-6 left-6 z-50 flex items-end gap-4">
        <div onClick={() => setIsOpen(!isOpen)}>
          <RabbitIcon state={rabbitState} />
        </div>

        {/* Insight Bubble */}
        <AnimatePresence>
          {insight && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              className="mb-2 max-w-[200px] glass-strong py-2.5 px-4 rounded-2xl rounded-bl-sm shadow-xl border border-primary/30 relative"
            >
              <p className="text-sm font-medium text-text-primary tracking-tight">{insight}</p>
              {/* Little speech tail */}
              <div className="absolute -left-2 bottom-0 w-4 h-4 glass-strong border-l border-b border-primary/30 transform skew-x-12" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-6 w-96 h-[520px] glass-strong rounded-3xl shadow-2xl shadow-black/60 z-50 flex flex-col overflow-hidden border border-glass-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary-glow" />
                </div>
                <div>
                  <h3 className="text-text-primary font-bold text-sm tracking-wide">Rabbit Link</h3>
                  <p className="text-text-tertiary text-[10px] uppercase tracking-wider">Local Inference</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-elevated flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'glass text-text-primary border border-glass-border rounded-bl-sm'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass border border-glass-border px-5 py-3.5 rounded-2xl rounded-bl-sm flex gap-1.5">
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glass-border bg-surface/30">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Rabbit..."
                  className="flex-1 px-5 py-3.5 bg-background/60 border border-glass-border rounded-2xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-secondary/50 text-sm shadow-inner transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 w-10 h-10 bg-secondary hover:bg-secondary-glow rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors shadow-lg"
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};