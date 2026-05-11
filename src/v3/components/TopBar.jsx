import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { VersionSwitcher } from '../../components/VersionSwitcher';

export const TopBar = ({ user, onLogout, onSettingsClick, onSwitchVersion, currentVersion }) => {
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
    <header className="h-12 flex items-center justify-end px-6 pr-8 mb-1 relative z-50 gap-2">
        <VersionSwitcher onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#152ad1] to-[#4455da] rounded-full flex items-center justify-center shadow-lg shadow-[#152ad1]/30">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">
              {user?.name}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#a1aaed] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-[#152ad1]/20 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-[#4455da]/30"
              >
                <div className="p-4 border-b border-[#4455da]/30">
                  <p className="text-white font-semibold text-sm">{user?.name}</p>
                  <p className="text-[#a1aaed] text-xs mt-0.5">{user?.email || 'No email set'}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { onSettingsClick?.(); setShowDropdown(false); }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-[#a1aaed] hover:bg-white/5 hover:text-white rounded-lg transition-all duration-150 text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-[#ff4d6a] hover:bg-[#ff4d6a]/10 rounded-lg transition-all duration-150 text-sm"
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
