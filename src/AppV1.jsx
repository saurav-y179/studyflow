import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { RegistrationModal } from './components/RegistrationModal';
import { SettingsModal } from './components/SettingsModal';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
import { useStudyFlow } from './hooks/useStudyFlow';
import { logout } from './utils/storage';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleRegister = (userData) => {
    registerUser(userData);
  };

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
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <span className="font-sans text-[#8B95A5] text-sm uppercase tracking-widest font-semibold">Loading StudyFlow...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] font-sans text-[#E9EDF2]">
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
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col min-h-screen relative">
          
          {/* Top Navigation */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-lg font-bold text-[#E9EDF2] tracking-tight">StudyFlow</span>
            </div>

            <div className="flex items-center gap-2 bg-[#151A23]/50 backdrop-blur-md border border-white/5 p-1.5 rounded-full">
              {['dashboard', 'tasks', 'plan', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-[#2EE6D8] text-[#0B0E14] shadow-lg shadow-[#2EE6D8]/20' 
                      : 'text-[#8B95A5] hover:text-[#E9EDF2]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 rounded-full border border-white/5 bg-[#151A23]/70 backdrop-blur-md flex items-center justify-center text-[#E9EDF2] hover:border-[#2EE6D8] transition-colors"
                title="Settings"
              >
                ⚙️
              </button>
              {/* Version Switcher */}
              <button onClick={() => onSwitchVersion('v3')} className="text-xs text-[#8B95A5] hover:text-[#E9EDF2] border border-white/5 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5">Switch to T3</button>
            </div>
          </header>

          <main className="flex-1 py-6 flex flex-col gap-6">
            
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <DailySubmission onEntriesChange={refreshEntries} />
                </div>
                <Dashboard entries={entries} streak={streak} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ContributionGrid entries={entries} />
                  </div>
                  <div>
                    <History entries={entries} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DailySubmission onEntriesChange={refreshEntries} />
              </motion.div>
            )}

            {activeTab === 'plan' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DailySubmission onEntriesChange={refreshEntries} />
                <History entries={entries} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <Dashboard entries={entries} streak={streak} />
                <ContributionGrid entries={entries} />
              </motion.div>
            )}

          </main>

          {/* Floating Action Button for Pikachu */}
          <style>{`
            @keyframes pulse-amber {
              0% { box-shadow: 0 0 0 0 rgba(255,180,67,0.4); }
              70% { box-shadow: 0 0 0 15px rgba(255,180,67,0); }
              100% { box-shadow: 0 0 0 0 rgba(255,180,67,0); }
            }
          `}</style>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-[#FFB443] rounded-full flex items-center justify-center hover:scale-105 transition-transform z-50"
            style={{ animation: 'pulse-amber 3s ease-in-out infinite' }}
            title="Ask Pikachu for help!"
          >
            <span className="text-2xl">⚡</span>
          </button>

          {/* Chat Modal */}
          {isChatOpen && (
            <div className="fixed bottom-24 right-8 w-80 h-[500px] z-50 bg-[#151A23]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <LLMAssistant entries={entries} streak={streak} isFloating onClose={() => setIsChatOpen(false)} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default AppV1;
