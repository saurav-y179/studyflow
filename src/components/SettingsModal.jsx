import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, X } from 'lucide-react';

export const SettingsModal = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [goal, setGoal] = useState(user?.dailyGoal || '4');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ ...user, name: name.trim(), email: email.trim(), dailyGoal: goal });
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md glass-strong rounded-2xl p-8 shadow-2xl shadow-black/40"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-surface-elevated flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                Settings
              </h1>
              <p className="text-text-tertiary text-sm mt-0.5">
                Update your personal details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Email <span className="text-text-tertiary">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Daily Study Goal
              </label>
              <select
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
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/20 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
