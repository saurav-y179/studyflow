import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
import { ConnectionsPanel } from './components/ConnectionsPanel';
import { Starfield } from './components/Starfield';
import { GreetingBanner } from './components/GreetingBanner';
import { FocusTimer } from './components/FocusTimer';
import { getConnections, saveConnection, removeConnection, refreshAllConnections, fetchConnectionStats } from '../utils/storage';

function AppV3({ currentVersion, onSwitchVersion }) {
  const shouldReduceMotion = useReducedMotion();
  const {
    user,
    entries,
    streak,
    momentum,
    isLoading,
    registerUser,
    refreshEntries,
    switchActiveProfile,
    clearActiveProfile,
  } = useStudyFlow();

  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [connections, setConnections] = useState(() => user ? getConnections() : []);

  // Re-read connections when user/profile changes + auto-refresh stats
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnections(getConnections());
      refreshAllConnections().then(() => {
        setConnections(getConnections());
      });
    }
  }, [user]);

  const handleAddConnection = (data) => {
    const updated = saveConnection(data);
    setConnections(updated);
  };

  const handleRemoveConnection = (connId) => {
    const updated = removeConnection(connId);
    setConnections(updated);
  };

  const handleRefreshConnection = async (connId) => {
    await fetchConnectionStats(connId);
    setConnections(getConnections());
  };

  // Auto-minimize sidebar on screens < 768px
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsSidebarMinimized(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const SIDEBAR_WIDTH = isSidebarMinimized ? 48 : 200;

  const pageTransition = shouldReduceMotion
    ? { duration: 0.2 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] };

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
        <div className="flex flex-col items-center gap-5">
          {/* Animated logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #152ad1 0%, #4455da 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 16px 48px rgba(21,42,209,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Glow pulse */}
            <div className="absolute inset-0 rounded-2xl animate-glow-pulse" style={{ background: 'rgba(21,42,209,0.3)', filter: 'blur(20px)' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-h2 font-semibold text-white/90">StudyFlow</span>
            <span className="text-caption uppercase tracking-wider text-[#8B95A5]">Loading your dashboard</span>
          </motion.div>

          {/* Shimmer bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-32 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="h-full rounded-full animate-shimmer" style={{
              background: 'linear-gradient(90deg, transparent, rgba(21,42,209,0.5), transparent)',
              backgroundSize: '200% 100%',
            }} />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040814]">
      {/* Background Video + Starfield */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#040510]">
        <Starfield reducedMotion={shouldReduceMotion} />
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
        onSwitchProfile={switchActiveProfile}
        onCreateNewProfile={clearActiveProfile}
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
          <div className="relative z-10 min-h-screen flex flex-col transition-[margin] duration-300 overflow-y-auto will-change-[margin]" style={{ marginLeft: `${SIDEBAR_WIDTH}px`, scrollBehavior: 'smooth' }}>
            {/* Unified Control Bar (was TopBar + EnergyBar) */}
            <EnergyBar
              streak={streak}
              onSettingsClick={() => setIsSettingsOpen(true)}
              onSwitchVersion={onSwitchVersion}
              currentVersion={currentVersion}
              user={user}
              onLogout={handleLogout}
            />

            {/* Greeting Banner */}
            <GreetingBanner user={user} entries={entries} streak={streak} />

            {/* Stats Row */}
            <StatsRow entries={entries} streak={streak} />

            {/* Main Content Areas - animated crossfade */}
            <div className="px-4 sm:px-6 pb-14">
              <AnimatePresence mode="wait">
                {activeNav === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={pageTransition}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                      <div className="xl:col-span-8 flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <TodayTasksCard onEntriesChange={refreshEntries} />
                          <TomorrowPlanCard onEntriesChange={refreshEntries} />
                        </div>
                        <ActivityHeatmap entries={entries} />
                      </div>
                      <div className="xl:col-span-4 flex flex-col gap-5">
                        <FocusTimer />
                        <ProductivityOverview entries={entries} streak={streak} />
                        <HistoryPanel entries={entries} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeNav === 'tasks' && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={pageTransition}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TodayTasksCard onEntriesChange={refreshEntries} />
                        <TomorrowPlanCard onEntriesChange={refreshEntries} />
                      </div>
                      <FocusTimer />
                    </div>
                  </motion.div>
                )}

                {activeNav === 'plan' && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={pageTransition}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <TomorrowPlanCard onEntriesChange={refreshEntries} />
                      </div>
                      <div className="flex flex-col gap-4">
                        <FocusTimer />
                        <HistoryPanel entries={entries} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeNav === 'connections' && (
                  <motion.div
                    key="connections"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={pageTransition}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <ConnectionsPanel
                      connections={connections}
                      onSave={handleAddConnection}
                      onRemove={handleRemoveConnection}
                      onRefreshStats={handleRefreshConnection}
                    />
                  </motion.div>
                )}

                {activeNav === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                    transition={pageTransition}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="space-y-6">
                      <ProductivityOverview entries={entries} streak={streak} />
                      <div className="overflow-x-auto">
                        <ActivityHeatmap entries={entries} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


          </div>

          {/* Status Strip — subtle glass */}
          <div
            className="fixed bottom-0 right-0 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 transition-[left] duration-300 h-9 will-change-[left]"
            style={{
              left: `${SIDEBAR_WIDTH}px`,
              background: 'rgba(11,14,20,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(46,230,216,0.08)',
            }}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: '#2EE6D8' }} />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: '#2EE6D8' }} />
            </span>
            <span className="text-overline font-mono hidden sm:inline" style={{ color: '#5B6574', fontSize: '0.5625rem' }}>
              Active
            </span>
            <span className="hidden sm:inline" style={{ color: 'rgba(91,101,116,0.4)' }}>·</span>
            <span className="text-overline font-mono font-bold" style={{ color: '#2EE6D8', fontSize: '0.5625rem' }}>
              {streak.current} Day Streak
            </span>
            <span style={{ color: 'rgba(91,101,116,0.4)' }}>·</span>
            <span className="text-overline font-mono" style={{ color: '#8B95A5', fontSize: '0.5625rem' }}>
              {Math.round(momentum.momentum)}%
            </span>
            <div className="flex-1" />
            <span className="text-overline font-mono hidden md:inline" style={{ color: '#5B6574', fontSize: '0.5625rem' }}>
              StudyFlow v3
            </span>
          </div>
          
          <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} entries={entries} streak={streak} sidebarWidth={SIDEBAR_WIDTH} user={user} connections={connections} />
        </>
      )}

      {/* LLM Assistant (hidden on sidebar-based layout since we have sidebar chat) */}
      {/* <LLMAssistant entries={entries} streak={streak} /> */}
    </div>
  );
}

export default AppV3;
