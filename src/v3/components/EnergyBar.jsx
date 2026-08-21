import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, User as UserIcon, Download } from 'lucide-react';
import { VersionSwitcher } from '../../components/VersionSwitcher';

const exportData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // Include studyflow_* (user data) and flow_* (chat settings) keys
    if (!key.startsWith('studyflow_') && !key.startsWith('flow_') && !key.startsWith('app_version')) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

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
      <div className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[16px] flex items-center px-5 py-2.5 shadow-lg shadow-black/30 gap-4 relative z-50">
        {/* 30-day streak progress meter — clean glass style */}
        <div className="flex-1 relative flex items-center gap-3 min-w-[100px]">
          <div className="flex-1 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-overline" style={{ color: '#8B95A5', fontSize: '0.5625rem' }}>Streak Goal</span>
              <span className="text-micro font-semibold" style={{ color: '#2EE6D8' }}>{currentStreakValue}<span style={{ color: '#5B6574' }}>/30</span></span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden relative"
              style={{
                height: '5px',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: pct > 60
                    ? 'linear-gradient(90deg, #2EE6D8, #FFB443)'
                    : pct > 30
                    ? 'linear-gradient(90deg, #2EE6D8, #1CC9B8)'
                    : 'linear-gradient(90deg, #1CC9B8, #0FAF9E)',
                  boxShadow: `0 0 12px ${
                    pct > 60 ? 'rgba(46,230,216,0.3)' : pct > 30 ? 'rgba(46,230,216,0.25)' : 'rgba(15,175,158,0.2)'
                  }`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {pct > 5 && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: pct > 60 ? '#2EE6D8' : '#1CC9B8',
                      boxShadow: `0 0 6px ${pct > 60 ? 'rgba(46,230,216,0.6)' : 'rgba(28,201,184,0.6)'}`,
                    }}
                  />
                )}
              </motion.div>

              {/* Milestone markers */}
              {[7, 14, 21, 30].map(milestone => {
                const pos = (milestone / 30) * 100;
                const reached = currentStreakValue >= milestone;
                return (
                  <div
                    key={milestone}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                    style={{
                      left: `${pos}%`,
                      background: reached ? '#FFB443' : 'rgba(255,255,255,0.1)',
                      boxShadow: reached ? '0 0 4px rgba(255,180,67,0.5)' : 'none',
                    }}
                    title={`${milestone} days`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right-side controls ── */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-2">

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-[10px] border border-white/5">
            <span className="text-body font-bold leading-none tabular-nums" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>{currentStreakValue}</span>
            <span className={`text-sm leading-none ${currentStreakValue > 0 ? 'animate-fire' : ''}`}>🔥</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 hidden sm:block" />

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-[#8B95A5] hover:text-[#E9EDF2] transition-colors" />
          </button>

          {/* Export */}
          <button
            onClick={exportData}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
            title="Export data"
          >
            <Download className="w-4 h-4 text-[#8B95A5] hover:text-[#E9EDF2] transition-colors" />
          </button>

          {/* Version Switcher T1/T2/T3 */}
          <div>
            <VersionSwitcher onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />
          </div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1E2530] hover:bg-[#282d45] border border-white/10 transition-all duration-200"
            >
              <span className="text-caption font-bold uppercase" style={{ color: '#E9EDF2' }}>
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
                  className="absolute right-0 top-full mt-3 w-52 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
                  style={{ background: 'var(--card-bg-solid)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-body font-semibold truncate" style={{ color: '#E9EDF2' }}>{user?.name || 'User'}</p>
                    <p className="text-caption mt-0.5 truncate" style={{ color: '#5B6574' }}>{user?.email || 'No email set'}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { onSettingsClick?.(); setShowDropdown(false); }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-[#8B95A5] hover:bg-white/5 hover:text-[#E9EDF2] rounded-lg transition-all duration-150 text-sm"
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
