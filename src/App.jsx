import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from './components/Header';
import { MomentumBar } from './components/MomentumBar';
import { RegistrationModal } from './components/RegistrationModal';
import { SettingsModal } from './components/SettingsModal';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
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
      {/* Ambient background video */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75 saturate-100"
          src="https://cdn.pixabay.com/video/2022/06/21/121261-724696832_large.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,8,16,0.5)_50%,_rgba(5,8,16,0.95)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,8,16,0.3)] via-[rgba(5,8,16,0.1)] to-[rgba(5,8,16,1)]" />
      </div>

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