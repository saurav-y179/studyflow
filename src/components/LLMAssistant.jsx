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
      <div className="bg-[#151A23]/70 backdrop-blur-[16px] border border-white/5 rounded-[20px] overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0B0E14]/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFB443]/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#E9EDF2]">Pikachu Coach</h3>
              <p className="text-[11px] text-[#8B95A5] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
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
                className={`max-w-[85%] p-3 text-[14px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#2EE6D8] text-[#0B0E14] rounded-2xl rounded-tr-sm font-medium'
                    : 'bg-white/5 text-[#E9EDF2] border border-white/5 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-3 flex gap-1.5">
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#0B0E14]/40 border-t border-white/5">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Pikachu..."
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[14px] text-[#E9EDF2] placeholder:text-[#5B6574] focus:outline-none focus:border-[#FFB443] resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#FFB443] text-[#0B0E14] flex items-center justify-center hover:bg-[#ffbe60] transition-colors disabled:opacity-50"
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
    <div className="flex flex-col h-full bg-[#151A23]/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0B0E14]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FFB443]/20 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(255,180,67,0.3)]">
            ⚡
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#E9EDF2]">Pikachu Coach</h3>
            <p className="text-[11px] text-[#8B95A5] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              Online
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-[#8B95A5] transition-colors">
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
              className={`max-w-[85%] p-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#2EE6D8] text-[#0B0E14] rounded-2xl rounded-tr-sm font-medium'
                  : 'bg-white/5 text-[#E9EDF2] border border-white/5 rounded-2xl rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-3 flex gap-1.5">
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 bg-[#8B95A5] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#0B0E14]/60 border-t border-white/5">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Pikachu..."
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[14px] text-[#E9EDF2] placeholder:text-[#5B6574] focus:outline-none focus:border-[#FFB443] resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-[#FFB443] text-[#0B0E14] flex items-center justify-center hover:bg-[#ffbe60] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
