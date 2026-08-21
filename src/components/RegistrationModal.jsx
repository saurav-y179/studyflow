import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const RegistrationModal = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('4');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onRegister({ name: name.trim(), email: email.trim(), dailyGoal: goal });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md glass-strong rounded-2xl p-8 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
              <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Welcome to StudyFlow
              </h1>
              <p className="text-text-tertiary text-sm mt-0.5">
                Build consistent daily habits
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-text-secondary text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-text-secondary text-sm font-medium mb-2">
                Email <span className="text-text-tertiary">(optional)</span>
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="reg-goal" className="block text-text-secondary text-sm font-medium mb-2">
                Daily Study Goal
              </label>
              <select
                id="reg-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/20 text-background font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};