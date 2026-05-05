import { Sparkles, Settings, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = ({ user, streak, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur border-b border-primary/20 z-50 flex items-center justify-between px-6 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-xl">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xl font-semibold text-text-primary">StudyFlow</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/40 rounded-full shadow-[0_0_14px_rgba(0,240,255,0.25)]">
        <span className="text-xl">🔥</span>
        <span className="text-primary font-semibold font-mono">{streak.current}</span>
        <span className="text-text-secondary text-sm">day streak</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl overflow-hidden shadow-xl"
            >
              <div className="p-3 border-b border-border">
                <p className="text-text-primary font-medium">{user?.name}</p>
                <p className="text-text-tertiary text-sm">{user?.email}</p>
              </div>
              <button className="w-full px-3 py-2 flex items-center gap-3 text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 flex items-center gap-3 text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};