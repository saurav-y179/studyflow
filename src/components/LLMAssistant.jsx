import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

const OLLAMA_API = 'http://localhost:8000';

export const LLMAssistant = ({ entries, streak }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your productivity assistant. I can analyze your study patterns and help you improve. What would you like to discuss?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    const recentEntries = entries.slice(-7);
    return `
Current Streak: ${streak.current} days
Longest Streak: ${streak.longest} days
Total Entries: ${entries.length}

Recent Activity:
${recentEntries.map(e => `- ${e.date}: ${e.completed?.slice(0, 50) || '(no details)'}`).join('\n')}
`.trim();
  };

  const callOllama = async (userMessage) => {
    try {
      const context = getContext();
      const systemPrompt = `You are StudyFlow, a helpful productivity assistant for students. You have access to the user's productivity data:

${context}

Provide concise, actionable feedback. Keep responses brief (2-3 sentences max).`;

      const response = await fetch(`${OLLAMA_API}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.2-1b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('API not available');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Ollama error:', error);
      return "Couldn't connect to local model. Make sure your llama.cpp server is running at localhost:8000.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await callOllama(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-secondary rounded-full shadow-lg shadow-secondary/30 flex items-center justify-center z-30"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-surface border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="text-text-primary font-semibold">AI Assistant</h3>
                  <p className="text-text-tertiary text-xs">Powered by local llama.cpp</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-elevated flex items-center justify-center"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-secondary text-white'
                        : 'bg-surface-elevated text-text-primary'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Bot className="w-4 h-4 text-secondary mb-2" />
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-elevated px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your progress..."
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-secondary text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};