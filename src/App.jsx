import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { MomentumBar } from './components/MomentumBar';
import { RegistrationModal } from './components/RegistrationModal';
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!user && <RegistrationModal key="register" onRegister={handleRegister} />}
      </AnimatePresence>

      {user && (
        <AnimatePresence>
          <Header key="header" user={user} streak={streak} onLogout={handleLogout} />
        </AnimatePresence>
      )}

      {user && (
        <AnimatePresence>
          <MomentumBar key="momentum" momentum={momentum.momentum} color={momentum.color} />
        </AnimatePresence>
      )}

      {user && (
        <main className="pt-28 pb-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Dashboard key="dashboard" entries={entries} streak={streak} />
              <DailySubmission key="dailysubmission" />
              <ContributionGrid key="contribution" entries={entries} />
            </div>

            <div className="space-y-6">
              <History key="history" entries={entries} />
            </div>
          </div>
        </main>
      )}

      <LLMAssistant key="assistant" entries={entries} streak={streak} />
    </div>
  );
}

export default App;