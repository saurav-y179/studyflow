// @deprecated Use ChatPanel from v3/components/ChatPanel instead.
// LLMAssistant is preserved for backward compatibility with T1/T2 layouts.
// ChatPanel supports 3 LLM modes (local/cloud/basic), settings, and history sync.

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';

const LLM_API = 'http://localhost:8000';

export const LLMAssistant = ({ entries, streak, isFloating, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Pika pika! I'm here to help you focus. What's the plan today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Simplified local fallback response
  const callLLM = async (userMessage) => {
    try {
      const response = await fetch(`${LLM_API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            recentEntries: entries.slice(0, 3),
            currentStreak: streak.current,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.warn('LLM API failed, using fallback.', error);
      return "Pika! Focus on your tasks, you can do this!";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await callLLM(userMessage);
    
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If used in the old inline mode
  if (!isFloating) {
    return (
      <div className="bg-[var(--card-bg-70)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-[var(--card-surface-40)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-alt)]/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h3 className="text-body font-bold text-[var(--text-bright)]">Pikachu Coach</h3>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-alt-2)] animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 text-body leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-[var(--card-surface)] rounded-2xl rounded-tr-sm font-medium'
                    : 'bg-[var(--input-bg)] text-[var(--text-bright)] border-[var(--card-border)] rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-[var(--input-bg)] border-[var(--card-border)] rounded-2xl rounded-tl-sm p-3 flex gap-1.5">
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[var(--card-surface-40)] border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Pikachu..."
              rows={1}
              className="flex-1 bg-[var(--input-bg-10)] border-[var(--card-border-10)] rounded-xl px-3 py-2 text-body text-[var(--text-bright)] placeholder:text-[var(--text-muted2)] focus:outline-none focus:border-[var(--accent-alt)] resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[var(--accent-alt)] text-[var(--card-surface)] flex items-center justify-center hover:bg-[var(--accent-alt)] transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating variant for the FAB modal
  return (
    <div className="flex flex-col h-full bg-[var(--card-bg-95)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-[var(--card-surface-60)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-alt)]/20 flex items-center justify-center text-xl shadow-[0_0_15px_var(--accent-alt-icon-shadow)]">
            ⚡
          </div>
          <div>
            <h3 className="text-body font-bold text-[var(--text-bright)]">Pikachu Coach</h3>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-alt-2)] animate-pulse" />
              Online
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-muted)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 text-body leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-[var(--card-surface)] rounded-2xl rounded-tr-sm font-medium'
                  : 'bg-[var(--input-bg)] text-[var(--text-bright)] border-[var(--card-border)] rounded-2xl rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[var(--input-bg)] border-[var(--card-border)] rounded-2xl rounded-tl-sm p-3 flex gap-1.5">
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[var(--card-surface-60)] border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Pikachu..."
            rows={1}
            className="flex-1 bg-[var(--input-bg-10)] border-[var(--card-border-10)] rounded-xl px-3 py-2 text-body text-[var(--text-bright)] placeholder:text-[var(--text-muted2)] focus:outline-none focus:border-[var(--accent-alt)] resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-[var(--accent-alt)] text-[var(--card-surface)] flex items-center justify-center hover:bg-[var(--accent-alt)] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
