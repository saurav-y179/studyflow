import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyFlow } from '../hooks/useStudyFlow';
import { logout } from '../utils/storage';
import { AuthModals } from '../components/layout/AuthModals';
import { Sidebar } from './components/Sidebar';
import { EnergyBar } from './components/EnergyBar';
import { StatsRow } from './components/StatsRow';
import { TodayTasksCard } from './components/TodayTasksCard';
import { TomorrowPlanCard } from './components/TomorrowPlanCard';
import { ProductivityOverview } from './components/ProductivityOverview';
import { HistoryPanel } from './components/HistoryPanel';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { ChatPanel } from './components/ChatPanel';

function AppV3({ currentVersion, onSwitchVersion }) {
  const {
    user,
    entries,
    streak,
    momentum,
    isLoading,
    registerUser,
    refreshEntries,
  } = useStudyFlow();

  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const SIDEBAR_WIDTH = isSidebarMinimized ? 48 : 200;

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
      <div className="min-h-screen bg-[#040814] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#152ad1] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#a1aaed] text-sm">Loading StudyFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040814]">
      {/* Background Video */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040510]">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-30 filter brightness-75 saturate-125"
          src="https://cdn.pixabay.com/video/2022/06/21/121261-724696832_large.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#040510_80%)] opacity-80" />
        <div className="absolute top-0 left-[200px] right-0 h-[400px] bg-gradient-to-b from-[#152ad1]/10 to-transparent mix-blend-screen" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#152ad1]/5 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#4455da]/5 rounded-full blur-[120px] mix-blend-screen" />
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
          {/* Left Sidebar */}
          <Sidebar 
            activeNav={activeNav} 
            onNavChange={setActiveNav}
            onPikachuClick={() => setIsChatOpen(true)}
            recentActivity={entries.reduce((s, e) => s + (e.todayTasks?.filter(t => t.completed).length || 0), 0)}
            isMinimized={isSidebarMinimized}
            onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          />

          {/* Main Content Area */}
          <div className="relative z-10 min-h-screen flex flex-col transition-[margin] duration-300" style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}>
            {/* Unified Control Bar (was TopBar + EnergyBar) */}
            <EnergyBar
              streak={streak}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onSwitchVersion={onSwitchVersion}
              currentVersion={currentVersion}
              user={user}
              onLogout={handleLogout}
            />

            {/* Stats Row */}
            <StatsRow entries={entries} streak={streak} />

            {/* Main Content Areas based on activeNav */}
            {activeNav === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="px-6 pb-20"
              >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Left Column: Tasks, Plan, and Heatmap (8 cols) */}
                  <div className="xl:col-span-8 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TodayTasksCard onEntriesChange={refreshEntries} />
                      <TomorrowPlanCard onEntriesChange={refreshEntries} />
                    </div>
                    {/* Heatmap sits right under tasks to fill the empty space */}
                    <ActivityHeatmap entries={entries} />
                  </div>

                  {/* Right Column: Analytics & History (4 cols) */}
                  <div className="xl:col-span-4 flex flex-col gap-4">
                    <ProductivityOverview entries={entries} streak={streak} />
                    <HistoryPanel entries={entries} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeNav === 'tasks' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-5 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <TodayTasksCard onEntriesChange={refreshEntries} />
                </div>
                <div>
                  <TomorrowPlanCard onEntriesChange={refreshEntries} />
                </div>
              </motion.div>
            )}

            {activeNav === 'plan' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-5 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TomorrowPlanCard onEntriesChange={refreshEntries} />
                </div>
                <div>
                  <HistoryPanel entries={entries} />
                </div>
              </motion.div>
            )}

            {activeNav === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-5 pb-16 space-y-6">
                <div className="w-full">
                  <ProductivityOverview entries={entries} streak={streak} />
                </div>
                <div className="w-full overflow-x-auto">
                  <ActivityHeatmap entries={entries} />
                </div>
              </motion.div>
            )}


          </div>

          {/* Red Bottom Status Strip */}
          <div
            className="fixed bottom-0 right-0 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 transition-[left] duration-300 h-12"
            style={{
              left: `${SIDEBAR_WIDTH}px`,
              background: 'linear-gradient(90deg, #e53e3e 0%, #c53030 50%, #e53e3e 100%)',
              borderTop: '1px solid rgba(0,0,0,0.15)',
              boxShadow: '0 -2px 12px rgba(229,62,62,0.25)',
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#1a1a1a', boxShadow: '0 0 6px rgba(0,0,0,0.4)' }}
            />
            <span
              className="font-mono text-xs uppercase tracking-wider font-semibold hidden sm:inline"
              style={{ color: '#0a0a0a' }}
            >
              System Active
            </span>
            <span className="hidden sm:inline" style={{ color: 'rgba(0,0,0,0.3)' }}>•</span>
            <span
              className="font-mono text-xs uppercase tracking-wider font-bold"
              style={{ color: '#0a0a0a' }}
            >
              {streak.current} Day Streak
            </span>
            <span style={{ color: 'rgba(0,0,0,0.3)' }}>•</span>
            <span
              className="font-mono text-xs uppercase tracking-wider font-semibold"
              style={{ color: '#0a0a0a' }}
            >
              Momentum {Math.round(momentum.momentum)}%
            </span>
            <div className="flex-1" />
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-bold hidden md:inline"
              style={{ color: 'rgba(0,0,0,0.5)' }}
            >
              StudyFlow v3
            </span>
          </div>
          
          <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} entries={entries} sidebarWidth={SIDEBAR_WIDTH} user={user} />
        </>
      )}

      {/* LLM Assistant (hidden on sidebar-based layout since we have sidebar chat) */}
      {/* <LLMAssistant entries={entries} streak={streak} /> */}
    </div>
  );
}

export default AppV3;
