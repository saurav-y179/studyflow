import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

const LLM_API = 'http://localhost:8000';

export const LLMAssistant = ({ entries, streak }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your productivity assistant. I can analyze your study patterns and help you improve. What would you like to discuss?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    const recentEntries = entries.slice(-7);
    const today = entries.find(
      (e) => e.date === new Date().toISOString().slice(0, 10)
    );
    const todayTasks = today?.todayTasks || [];
    const todayPct = todayTasks.length
      ? Math.round(
          (todayTasks.filter((t) => t.completed).length / todayTasks.length) *
            100
        )
      : 0;

    return `Current Streak: ${streak.current} days
Longest Streak: ${streak.longest} days
Today's Completion: ${todayPct}%
Total Entries: ${entries.length}

Recent Activity (last 7 days):
${recentEntries
  .map((e) => {
    const tasks = e.todayTasks || [];
    const done = tasks.filter((t) => t.completed).length;
    return `- ${e.date}: ${done}/${tasks.length} tasks complete`;
  })
  .join('\n')}`.trim();
  };

  const callLLM = async (userMessage) => {
    try {
      const context = getContext();
      const systemPrompt = `You are StudyFlow, a helpful productivity assistant for students. You have access to the user's productivity data:

${context}

Analyze their consistency, suggest improvements, and detect patterns (e.g., overplanning, low completion). Keep responses concise (2-3 sentences max).`;

      const response = await fetch(`${LLM_API}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.2-1b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('API not available');

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('LLM error:', error);
      return "Couldn't connect to local model. Make sure your llama.cpp server is running at localhost:8000.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await callLLM(userMessage);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: response },
    ]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-secondary to-secondary-glow rounded-full shadow-lg shadow-secondary/30 flex items-center justify-center z-30"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-96 h-[520px] glass-strong rounded-2xl shadow-2xl shadow-black/40 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary/15 rounded-xl flex items-center justify-center relative">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold text-sm">AI Assistant</h3>
                  <p className="text-text-tertiary text-[10px]">localhost:8000</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-elevated/50 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-secondary to-secondary-glow text-white'
                        : 'bg-surface-elevated/60 text-text-primary border border-glass-border'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Bot className="w-3.5 h-3.5 text-secondary mb-1.5" />
                    )}
                    <p>{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-elevated/60 border border-glass-border px-4 py-3 rounded-2xl">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glass-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your progress..."
                  className="flex-1 px-4 py-2.5 bg-background/40 border border-glass-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-secondary/40 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-secondary hover:bg-secondary-glow rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors"
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