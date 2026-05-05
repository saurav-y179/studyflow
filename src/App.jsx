import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { MomentumBar } from './components/MomentumBar';
import { RegistrationModal } from './components/RegistrationModal';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
import { CursorEffect } from './components/CursorEffect';
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

  const handleRegister = (userData) => {
    registerUser(userData);
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
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <CursorEffect />
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {!user && <RegistrationModal key="register" onRegister={handleRegister} />}
      </AnimatePresence>

      {user && (
        <>
          <Header user={user} streak={streak} onLogout={handleLogout} />
          <MomentumBar momentum={momentum.momentum} color={momentum.color} streak={streak} />

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 pt-40 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            <div className="space-y-8">
              <Dashboard entries={entries} streak={streak} />
              
              <DailySubmission onEntriesChange={refreshEntries} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-8 border-t border-glass-border/30">
                <ContributionGrid entries={entries} />
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