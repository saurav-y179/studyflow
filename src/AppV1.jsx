import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from './components/Header';
import { RegistrationModal } from './components/RegistrationModal';
import { SettingsModal } from './components/SettingsModal';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
import { useStudyFlow } from './hooks/useStudyFlow';

function AppV1({ currentVersion, onSwitchVersion }) {
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

  const handleRegister = (userData) => {
    registerUser(userData);
  };

  const handleSaveSettings = (userData) => {
    registerUser(userData);
    setIsSettingsOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <span className="font-mono text-muted text-sm uppercase tracking-widest">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-16">
      <AnimatePresence>
        {!user && <RegistrationModal key="register" onRegister={handleRegister} />}
        {user && isSettingsOpen && (
          <SettingsModal 
            key="settings" 
            user={user} 
            onSave={handleSaveSettings} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
      </AnimatePresence>

      {user && (
        <>
          <Header user={user} streak={streak} onLogout={handleLogout} onSettingsClick={() => setIsSettingsOpen(true)} onSwitchVersion={onSwitchVersion} />

          <main className="max-w-7xl mx-auto px-6 py-16">
            {/* Hero section */}
            <div className="mb-20">
              <h1 className="text-[5rem] leading-[0.95] font-serif text-ink">
                Master your <span className="italic">focus.</span><br />
                <span className="italic text-accent">Forge your legacy.</span>
              </h1>
              <p className="mt-8 text-[0.82rem] font-mono text-muted max-w-[520px]">
                Welcome to your daily record. Maintain discipline, document your progress, and build unbreakable momentum. The work speaks for itself.
              </p>
            </div>

            {/* Layout: Two-column grid separated by a 1px parchment border */}
            <div className="flex flex-col lg:flex-row border-t border-parchment pt-16">
              <div className="w-full lg:w-7/12 lg:border-r lg:border-parchment lg:pr-16 space-y-16">
                <Dashboard entries={entries} streak={streak} />
                <DailySubmission onEntriesChange={refreshEntries} />
                <ContributionGrid entries={entries} />
              </div>

              <div className="w-full lg:w-5/12 pt-16 lg:pt-0 lg:pl-16 space-y-16">
                <History entries={entries} />
                <LLMAssistant entries={entries} streak={streak} />
              </div>
            </div>
          </main>

          {/* Status bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-cream border-t border-parchment py-2 px-6 flex items-center gap-3 z-50">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="font-mono text-xs text-muted uppercase tracking-wider">
              System Active • {streak.current} Day Streak • Momentum {momentum.momentum}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default AppV1;
