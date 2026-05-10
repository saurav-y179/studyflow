import { Sparkles, Settings, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VersionSwitcher } from './VersionSwitcher';

export const Header = ({ user, streak, onLogout, onSettingsClick, onSwitchVersion, currentVersion }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-strong z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 bg-primary/20 rounded-xl border border-primary/30">
          <Sparkles className="w-5 h-5 text-primary-glow" />
          <div className="absolute inset-0 bg-primary-glow/20 rounded-xl animate-pulse-glow" />
        </div>
        <span className="text-xl font-semibold text-text-primary tracking-tight">
          StudyFlow
        </span>
      </div>

      <motion.div
        className="flex items-center gap-2.5 px-5 py-2 rounded-full glass border border-accent/20"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <span className="text-xl">🔥</span>
        <span className="text-accent-glow font-bold font-mono text-lg">
          {streak.current}
        </span>
        <span className="text-text-secondary text-sm font-medium">day streak</span>
      </motion.div>

      <VersionSwitcher onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-elevated/50 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-text-primary text-sm font-medium hidden sm:block">
            {user?.name}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <div className="p-4 border-b border-glass-border">
                <p className="text-text-primary font-semibold">{user?.name}</p>
                <p className="text-text-tertiary text-xs mt-0.5">{user?.email || 'No email set'}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => {
                    onSettingsClick?.();
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-text-secondary hover:bg-surface-elevated hover:text-text-primary rounded-lg transition-all duration-150 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-error hover:bg-error/10 rounded-lg transition-all duration-150 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};