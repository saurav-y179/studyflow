import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { VersionSwitcher } from '../../components/VersionSwitcher';

export const EnergyBar = ({ streak, onSettingsClick, onSwitchVersion, currentVersion, user, onLogout }) => {
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

  const currentStreakValue = streak?.current || 0;
  const streakGoal = 30;
  const pct = Math.min(Math.max((currentStreakValue / streakGoal) * 100, 0), 100);

  return (
    <div className="px-6 pt-4 pb-4">
      <div className="bg-[#111219] border border-white/5 rounded-2xl flex items-center px-4 py-3 shadow-lg shadow-black/20 gap-4 relative z-50">
        {/* 30-day streak progress meter */}
        <div
          className="flex-1 relative rounded-full overflow-hidden flex-shrink min-w-[100px]"
          style={{
            height: '14px',
            background: 'linear-gradient(180deg, #18100b 0%, #24120a 52%, #100805 100%)',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.85), inset 0 -1px 2px rgba(255,156,48,0.12), 0 0 12px rgba(255,94,0,0.16)',
            border: '1px solid rgba(255,112,31,0.32)',
          }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #ff2a00 0%, #ff6a00 22%, #ffb000 45%, #ff4b00 68%, #ff8a00 100%)',
              backgroundSize: '280% 100%',
              boxShadow: '0 0 18px rgba(255,97,0,0.7), inset 0 2px 3px rgba(255,255,255,0.46), inset 0 -3px 6px rgba(104,21,0,0.55)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%`, backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ width: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }, backgroundPosition: { duration: 4.2, repeat: Infinity, ease: 'linear' } }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 18% 50%, rgba(255,255,210,0.9) 0 7%, transparent 18%), radial-gradient(circle at 52% 35%, rgba(255,244,120,0.75) 0 5%, transparent 16%), radial-gradient(circle at 80% 60%, rgba(255,255,230,0.75) 0 6%, transparent 18%), linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent)',
                backgroundSize: '56% 100%, 62% 100%, 58% 100%, 45% 100%',
                mixBlendMode: 'screen',
              }}
              animate={{ backgroundPosition: ['-60% 0%, 130% 0%, -20% 0%, -45% 0%', '145% 0%, -55% 0%, 125% 0%, 145% 0%'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
            />
            <div
              className="absolute top-0 left-0 right-0 rounded-full"
              style={{ height: '4px', background: 'linear-gradient(90deg, rgba(255,255,255,0.58), rgba(255,223,126,0.36), rgba(255,255,255,0.5))' }}
            />
          </motion.div>
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)' }}
          />
          {pct > 0 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `calc(${pct}% - 10px)`,
                width: '20px',
                height: '20px',
                background: 'radial-gradient(circle, rgba(255,255,190,1) 0%, rgba(255,145,0,0.9) 38%, rgba(255,50,0,0.35) 62%, transparent 74%)',
                filter: 'blur(3px)',
              }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.35, 0.9] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* ── Right-side controls ── */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-2">

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <span className="text-white font-bold text-[13px] tabular-nums leading-none">{currentStreakValue}</span>
            <span className="text-sm leading-none">🔥</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 hidden sm:block" />

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-[#a1aaed] hover:text-white transition-colors" />
          </button>

          {/* Version Switcher T1/T2/T3 */}
          <div className="scale-90 origin-right">
            <VersionSwitcher onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />
          </div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e2338] hover:bg-[#282d45] border border-white/10 transition-all duration-200"
            >
              <span className="text-white text-xs font-bold uppercase">
                {user?.name?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
              </span>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-52 bg-[#152ad1]/20 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-[#4455da]/30"
                >
                  <div className="p-4 border-b border-[#4455da]/30">
                    <p className="text-white font-semibold text-sm truncate">{user?.name || 'User'}</p>
                    <p className="text-[#a1aaed] text-xs mt-0.5 truncate">{user?.email || 'No email set'}</p>
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
        </div>

      </div>
    </div>
  );
};
