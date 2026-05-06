import { motion, AnimatePresence } from 'framer-motion';
import { useStudyFlow } from '../hooks/useStudyFlow';
import { VersionSwitcher } from '../components/VersionSwitcher';
import { BackgroundV2 } from './components/BackgroundV2';
import { HeaderV2 } from './components/HeaderV2';
import { DashboardV2 } from './components/DashboardV2';
import { RabbitAssistantV2 } from './components/RabbitAssistantV2';
import { useEffect, useState } from 'react';

export default function AppV2({ currentVersion, onSwitchVersion }) {
  const { user, entries, streak, momentum, isLoading, registerUser, refreshEntries } = useStudyFlow();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden relative font-sans selection:bg-[#10b981]/30">
      {/* Background System */}
      <BackgroundV2 mousePosition={mousePosition} />
      
      {/* Soft cursor glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.05), transparent 50%)`
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <HeaderV2 user={user} onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />
        
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-12 pt-24 pb-32">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mb-24"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-white/60">System Online</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white/90">
              Build Momentum <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#34d399]">That Lasts.</span>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-[#ea580c]/20 -z-10 origin-left"
                />
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-white/40 max-w-2xl font-light leading-relaxed">
              Transform tasks into streaks. Build discipline through momentum and AI-guided consistency.
            </p>
          </motion.div>

          {/* Cards & Content Grid */}
          <DashboardV2 entries={entries} streak={streak} momentum={momentum} refreshEntries={refreshEntries} />
        </main>
      </div>

      <RabbitAssistantV2 entries={entries} streak={streak} />
    </div>
  );
}
