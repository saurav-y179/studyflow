import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { RegistrationModal } from './components/RegistrationModal';
import { SettingsModal } from './components/SettingsModal';
import { DailySubmission } from './components/DailySubmission';
import { ContributionGrid } from './components/ContributionGrid';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { LLMAssistant } from './components/LLMAssistant';
import { useStudyFlow } from './hooks/useStudyFlow';

// ── Noise canvas (brutalist dither texture) ──
function NoiseCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, w, h;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    function render() {
      if (!ctx || !canvas) return;
      const imgData = ctx.createImageData(w, h);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i+1] = v;
        imgData.data[i+2] = v;
        imgData.data[i+3] = 6;
      }
      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(render);
    }
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      className="h-full w-full pointer-events-none fixed inset-0"
      style={{ mixBlendMode: 'multiply', zIndex: 101, opacity: 0.15 }}
    />
  );
}

const electricBlue = '#0033FF';

function AppV1({ onSwitchVersion }) {
  const {
    user,
    entries,
    streak,
    isLoading,
    registerUser,
    refreshEntries,
    switchActiveProfile,
    clearActiveProfile,
  } = useStudyFlow();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleRegister = useCallback((userData) => {
    registerUser(userData);
  }, [registerUser]);

  const handleSaveSettings = useCallback((userData) => {
    registerUser(userData);
    setIsSettingsOpen(false);
  }, [registerUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
        <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: electricBlue }}>
          Loading StudyFlow...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-mono uppercase antialiased theme-light" style={{
      background: '#fff',
      color: electricBlue,
      transition: 'background 0.3s, color 0.3s',
    }}>
      {/* Blue ambient glow */}
      <div className="pointer-events-none fixed inset-0" style={{
        background: 'radial-gradient(ellipse at 100% 0%, transparent 40%, rgba(0,51,255,0.06) 100%)',
        zIndex: 97,
      }} />
      {/* Noise canvas */}
      <NoiseCanvas />

      <AnimatePresence>
        {!user && <RegistrationModal key="register" onRegister={handleRegister} />}
        {user && isSettingsOpen && (
          <SettingsModal
            key="settings"
            user={user}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
            onSwitchProfile={switchActiveProfile}
            onCreateNewProfile={clearActiveProfile}
          />
        )}
      </AnimatePresence>

      {user && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* ── Header ── */}
          <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-8 pt-4 lg:pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-12 items-center border"
              style={{
                borderColor: 'rgba(0,51,255,0.15)',
                borderBottom: 'none',
              }}
            >
              <a className="col-span-3 p-4 flex items-center gap-3 transition-colors"
                style={{
                  borderRight: '1px solid rgba(0,51,255,0.15)',
                }}
                href="#"
              >
                <div className="w-7 h-7 flex items-center justify-center" style={{
                  background: electricBlue,
                  border: `1px solid rgba(0,51,255,0.3)`,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-[0.15em]" style={{
                  color: electricBlue,
                }}>
                  StudyFlow
                </span>
              </a>
              <div className="hidden lg:flex col-span-6 items-center"
                style={{
                  borderRight: '1px solid rgba(0,51,255,0.15)',
                }}
              >
                {['dashboard', 'tasks', 'plan', 'analytics'].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-4 text-[11px] font-semibold tracking-[0.15em] transition-all duration-200 relative`}
                    style={{
                      color: activeTab === tab
                        ? electricBlue
                        : 'rgba(0,51,255,0.45)',
                      background: activeTab === tab
                        ? `rgba(0,51,255,0.04)`
                        : 'transparent',
                      borderRight: i < 3 ? '1px solid rgba(0,51,255,0.15)' : 'none',
                      boxShadow: activeTab === tab ? `inset 0 -2px 0 ${electricBlue}` : 'none',
                    }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-4 right-4 h-px" style={{ background: electricBlue }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="col-span-2 flex items-center gap-2 justify-end p-4 lg:pl-4 lg:pr-0">
                <button onClick={() => setIsSettingsOpen(true)}
                  className="text-[10px] tracking-[0.15em] px-2.5 py-1.5 border transition-colors"
                  style={{
                    borderColor: electricBlue,
                    color: electricBlue,
                  }}
                >
                  ⚙️
                </button>
                <button onClick={() => onSwitchVersion('v3')}
                  className="text-[10px] tracking-[0.15em] px-2.5 py-1.5 border transition-colors hover:bg-[rgba(0,51,255,0.06)]"
                  title="Switch to Pikachu Blue layout"
                  style={{
                    borderColor: electricBlue,
                    color: electricBlue,
                  }}
                >
                  PIKACHU BLUE
                </button>
              </div>
            </div>

            {/* Mobile nav */}
            <div className="flex lg:hidden border-x border-b"
              style={{ borderColor: 'rgba(0,51,255,0.15)' }}
            >
              {['dash', 'tasks', 'plan', 'anl'].map((tab, i) => {
                const key = tab === 'dash' ? 'dashboard' : tab === 'anl' ? 'analytics' : tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(key)}
                    className={`flex-1 py-3 text-[10px] font-semibold tracking-[0.15em] transition-all duration-200`}
                    style={{
                      color: activeTab === key
                        ? electricBlue
                        : 'rgba(0,51,255,0.45)',
                      background: activeTab === key
                        ? `rgba(0,51,255,0.04)`
                        : 'transparent',
                      borderRight: i < 3 ? '1px solid rgba(0,51,255,0.15)' : 'none',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Cover / Hero ── */}
          <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 border-x border-b"
              style={{ borderColor: 'rgba(0,51,255,0.15)' }}
            >
              <div className="lg:col-span-7 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r"
                style={{ borderColor: 'rgba(0,51,255,0.15)' }}
              >
                <p className="text-[10px] tracking-[0.25em] font-semibold mb-6" style={{
                  color: electricBlue,
                  mixBlendMode: 'normal',
                }}>
                  Issue 001 · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                </p>
                <h1 className="font-bold leading-[0.95] tracking-tighter mb-6" style={{
                  fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                  color: electricBlue,
                  mixBlendMode: 'normal',
                }}>
                  {user?.name || 'StudyFlow'}
                </h1>
                <p className="text-sm leading-relaxed max-w-lg" style={{
                  fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
                  color: 'rgba(0,51,255,0.55)',
                }}>
                  Every session compounds. Every streak builds momentum.{' '}
                  <span style={{
                    color: electricBlue,
                    fontWeight: 600,
                  }}>
                    This is your study story.
                  </span>
                </p>
              </div>
              <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between" style={{ background: 'rgba(0,51,255,0.02)' }}>
                {[
                  { label: 'Streak', value: streak.current, cls: 'text-4xl font-bold' },
                  { label: 'Best', value: streak.longest, cls: 'text-2xl font-semibold' },
                  { label: 'Days', value: entries.filter(e => e.todayTasks?.length > 0).length, cls: 'text-2xl font-semibold' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between mt-4 first:mt-0">
                    <span className="text-[10px] tracking-[0.2em]" style={{
                      color: 'rgba(0,51,255,0.5)',
                    }}>
                      {row.label}
                    </span>
                    <span className={`tabular-nums ${row.cls}`} style={{
                      color: electricBlue,
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-8 flex-1 flex flex-col pb-12">
            <div className="flex-1 border-x p-6 lg:p-8"
              style={{ borderColor: 'rgba(0,51,255,0.15)' }}
            >
              {/* Section label */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[10px] font-semibold tracking-[0.25em]" style={{ color: electricBlue }}>
                  {activeTab === 'tasks' ? 'Tasks' : activeTab === 'plan' ? 'Plan' : activeTab === 'analytics' ? 'Analytics' : 'Dashboard'}
                </span>
                <div className="h-px flex-1" style={{
                  background: `linear-gradient(90deg, ${electricBlue}40, transparent)`,
                }} />
              </div>

              <div className="flex gap-6">
                <div className="flex-1 flex flex-col gap-6">
                  {activeTab === 'dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                      <Dashboard entries={entries} streak={streak} />
                      <ContributionGrid entries={entries} />
                    </motion.div>
                  )}
                  {activeTab === 'tasks' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <DailySubmission onEntriesChange={refreshEntries} />
                    </motion.div>
                  )}
                  {activeTab === 'plan' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2"><DailySubmission onEntriesChange={refreshEntries} /></div>
                      <div><History entries={entries} /></div>
                    </motion.div>
                  )}
                  {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                      <Dashboard entries={entries} streak={streak} />
                      <ContributionGrid entries={entries} />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-x border-b px-6 lg:px-8 py-4"
              style={{ borderColor: 'rgba(0,51,255,0.15)' }}
            >
              <div className="flex items-center justify-between text-[10px] tracking-[0.2em]" style={{
                color: 'rgba(0,51,255,0.45)',
              }}>
                <span>StudyFlow · Matte Blue</span>
                <span>{entries.length} entries · {streak.current} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{String.raw`
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(0,51,255,0.3); }
          70% { box-shadow: 0 0 0 12px rgba(0,51,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,51,255,0); }
        }

        :root {
          --card-bg: rgba(0,51,255,0.04);
          --card-bg-solid: rgba(0,51,255,0.04);
          --card-bg-80: rgba(0,51,255,0.04);
          --card-bg-90: rgba(0,51,255,0.05);
          --card-bg-95: rgba(0,51,255,0.06);
          --card-alt: rgba(0,51,255,0.06);
          --card-surface: rgba(0,51,255,0.02);
          --card-surface-40: rgba(0,51,255,0.02);
          --card-surface-60: rgba(0,51,255,0.03);
          --input-bg: rgba(0,51,255,0.06);
          --input-bg-10: rgba(0,51,255,0.1);
          --card-border: rgba(0,51,255,0.08);
          --card-border-10: rgba(0,51,255,0.12);
          --text-muted: rgba(0,51,255,0.55);
          --text-muted2: rgba(0,51,255,0.5);
          --text-bright: #0033FF;
          --accent: #0033FF;
          --accent-alt: #0033FF;
          --accent-alt-2: #0033FF;
          --ring-bg: rgba(0,51,255,0.02);
          --hover-bg: rgba(0,51,255,0.06);
          --accent-shadow: rgba(0,51,255,0.15);
          --accent-dim-bg: rgba(0,51,255,0.07);
          --accent-dim-color: rgba(0,51,255,0.45);
          --accent-dim-shadow: 0 0 22px rgba(0,51,255,0.12);
          --accent-alt-dim-bg: rgba(0,51,255,0.07);
          --accent-alt-dim-color: rgba(0,51,255,0.45);
          --accent-alt-dim-shadow: 0 0 22px rgba(0,51,255,0.12);
          --accent-alt-icon-shadow: 0 0 15px rgba(0,51,255,0.3);
        }
        .theme-light .text-white\/50,
        .theme-light .text-white\/60,
        .theme-light .text-white\/30 {
          color: rgba(0,51,255,0.55) !important;
        }
        .theme-light .text-white {
          color: #0033FF !important;
        }
        .theme-light .border-white\/10 {
          border-color: rgba(0,51,255,0.12) !important;
        }
        .theme-light .bg-white\/5 {
          background-color: rgba(0,51,255,0.06) !important;
        }
        .theme-light .from-\[\#10b981\] {
          --tw-gradient-from: #0033FF !important;
        }
        .theme-light .text-\[\#10b981\] {
          color: #0033FF !important;
        }
        .theme-light .text-\[\#10b981\]\/70 {
          color: rgba(0,51,255,0.7) !important;
        }
        .theme-light .bg-\[\#10b981\]\/20 {
          background-color: rgba(0,51,255,0.2) !important;
        }
        .theme-light .hover\:bg-white\/10:hover {
          background-color: rgba(0,51,255,0.1) !important;
        }
        .theme-light .bg-\[\#0a0a0c\]\/90 {
          background-color: rgba(0,51,255,0.06) !important;
        }
      `}</style>
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        style={{
          background: electricBlue,
          border: '1px solid transparent',
          boxShadow: 'inset -1px -1px 0 0 rgba(0,0,0,0.15), inset 1px 1px 0 0 rgba(255,255,255,0.3)',
          animation: 'pulse-blue 3s ease-in-out infinite',
          color: '#fff',
        }}
        title="Ask Pikachu for help!"
      >
        <span className="text-lg">⚡</span>
      </button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-6 w-80 max-w-[calc(100vw-2rem)] h-[480px] z-50 overflow-hidden"
            style={{
              background: '#fff',
              border: '1px solid rgba(0,51,255,0.15)',
            }}
          >
            <LLMAssistant entries={entries} streak={streak} isFloating onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppV1;