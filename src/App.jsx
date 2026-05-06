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
import { AmbientBackground } from './components/layout/AmbientBackground';
import { useStudyFlow } from './hooks/useStudyFlow';

function App() {
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
    localStorage.clear();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-tertiary text-sm">Loading StudyFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AmbientBackground />

      <AuthModals
        user={user}
        isSettingsOpen={isSettingsOpen}
        onRegister={registerUser}
        onSaveSettings={handleSaveSettings}
        onCloseSettings={() => setIsSettingsOpen(false)}
      />

      {user && (
        <>
          <Header user={user} streak={streak} onLogout={handleLogout} onSettingsClick={() => setIsSettingsOpen(true)} />
          <MomentumBar momentum={momentum.momentum} color={momentum.color} />

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 pt-32 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Dashboard entries={entries} streak={streak} />
                <DailySubmission onEntriesChange={refreshEntries} />
                <ContributionGrid entries={entries} />
              </div>

              <div className="space-y-6">
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

export default App;
