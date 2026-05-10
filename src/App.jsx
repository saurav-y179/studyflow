import { motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from './components/Header';
import { MomentumBar } from './components/MomentumBar';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
import { AuthModals } from './components/layout/AuthModals';
import { useStudyFlow } from './hooks/useStudyFlow';
import { logout } from './utils/storage';

function AppWithVideo({ currentVersion, onSwitchVersion }) {
  const {
    user,
    entries,
    streak,
    momentum,
    isLoading,
    registerUser,
    refreshEntries,
  } = useStudyFlow();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveSettings = (userData) => {
    registerUser(userData);
    setIsSettingsOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#040814' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#152ad1', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: '#a1aaed' }}>Loading StudyFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#040814' }}>
      {/* San Marino Blue Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ background: '#040510' }}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.25, filter: 'brightness(0.7) saturate(1.4) hue-rotate(220deg)' }}
          src="https://cdn.pixabay.com/video/2022/06/21/121261-724696832_large.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, #040510 80%)', opacity: 0.85 }} />
        <div className="absolute top-0 left-0 right-0 h-[400px]" style={{ background: 'linear-gradient(to bottom, rgba(21,42,209,0.12), transparent)', mixBlendMode: 'screen' }} />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'rgba(21,42,209,0.06)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full" style={{ background: 'rgba(68,85,218,0.06)', filter: 'blur(120px)', mixBlendMode: 'screen' }} />
      </div>

      <AuthModals
        user={user}
        isSettingsOpen={isSettingsOpen}
        onRegister={registerUser}
        onSaveSettings={handleSaveSettings}
        onCloseSettings={() => setIsSettingsOpen(false)}
      />

      {user && (
        <>
          {/* San Marino Blue Header */}
          <header
            className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6"
            style={{
              background: 'linear-gradient(135deg, rgba(21,42,209,0.1) 0%, rgba(8,12,26,0.55) 50%, rgba(21,42,209,0.08) 100%)',
              backdropFilter: 'blur(32px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
              borderBottom: '1px solid rgba(21,42,209,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl" style={{
                background: 'rgba(21,42,209,0.2)',
                border: '1px solid rgba(68,85,218,0.3)',
              }}>
                <svg className="w-5 h-5" style={{ color: '#737fe3' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div className="absolute inset-0 rounded-xl animate-pulse" style={{ background: 'rgba(68,85,218,0.15)' }} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">
                StudyFlow
              </span>
            </div>

            <motion.div
              className="flex items-center gap-2.5 px-5 py-2 rounded-full"
              style={{
                background: 'rgba(21,42,209,0.15)',
                border: '1px solid rgba(68,85,218,0.25)',
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <span className="text-xl">🔥</span>
              <span className="font-bold font-mono text-lg" style={{ color: '#737fe3' }}>
                {streak.current}
              </span>
              <span className="text-sm font-medium" style={{ color: '#a1aaed' }}>day streak</span>
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Version Switcher */}
              <div>
                <button
                  onClick={() => onSwitchVersion && onSwitchVersion(currentVersion === 'app' ? 'v3' : currentVersion === 'v3' ? 'v1' : 'app')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="text-sm font-bold text-white font-mono">T1</span>
                </button>
              </div>

              {/* User Menu */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
                style={{ background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(21,42,209,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{
                  background: 'linear-gradient(135deg, #152ad1, #4455da)',
                  boxShadow: '0 4px 15px rgba(21,42,209,0.3)',
                }}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">{user?.name}</span>
              </button>
            </div>
          </header>

          {/* San Marino Blue Momentum Bar */}
          <div
            className="fixed top-16 left-0 right-0 h-16 z-40 flex items-center px-6"
            style={{
              background: 'linear-gradient(135deg, rgba(21,42,209,0.08) 0%, rgba(8,12,26,0.5) 50%, rgba(21,42,209,0.06) 100%)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              borderBottom: '1px solid rgba(21,42,209,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#4a5c80' }}>
                  Energy
                </span>
                <span className="text-xl font-bold tabular-nums text-white">
                  {Math.round(momentum.momentum)}<span className="text-sm" style={{ color: '#4a5c80' }}>%</span>
                </span>
              </div>

              <div className="flex-1 h-4 rounded-full relative shadow-inner" style={{ background: 'rgba(21,42,209,0.15)' }}>
                <motion.div
                  className="h-full rounded-full relative shadow-[0_0_15px_rgba(21,42,209,0.3)]"
                  style={{
                    background: momentum.momentum > 60
                      ? 'linear-gradient(90deg, #152ad1, #737fe3, #00ffb2)'
                      : momentum.momentum > 30
                        ? 'linear-gradient(90deg, #152ad1, #737fe3)'
                        : 'linear-gradient(90deg, #1a2240, #2a3660)',
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${momentum.momentum}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                </motion.div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#4a5c80' }}>
                  Streak
                </span>
                <span className="text-xl font-bold" style={{ color: '#737fe3' }}>
                  {streak.current} <span className="text-sm">🔥</span>
                </span>
              </div>
            </div>
          </div>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 pt-32 pb-12 px-6 md:px-10 lg:px-16 max-w-[1600px] mx-auto"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-6">
                <Dashboard entries={entries} streak={streak} />
                <DailySubmission onEntriesChange={refreshEntries} />
                <ContributionGrid entries={entries} />
              </div>

              <div className="xl:col-span-4 space-y-6">
                <History entries={entries} />
              </div>
            </div>
          </motion.main>
        </>
      )}

      <LLMAssistant entries={entries} streak={streak} />
    </div>
  );
}

export default AppWithVideo;
