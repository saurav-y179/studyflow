import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: 'Pomodoro', work: 25 * 60, break_: 5 * 60, icon: '🍅' },
  { label: 'Deep Focus', work: 50 * 60, break_: 10 * 60, icon: '🧠' },
  { label: 'Sprint', work: 15 * 60, break_: 3 * 60, icon: '⚡' },
  { label: 'Study Block', work: 45 * 60, break_: 15 * 60, icon: '📚' },
];

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const FocusTimer = () => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const presetsRef = useRef(null);

  const preset = PRESETS[presetIdx];
  const totalTime = mode === 'work' ? preset.work : preset.break_;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  // SVG ring params
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  const accentColor = mode === 'work' ? '#2EE6D8' : '#FFB443';
  const glowColor = mode === 'work' ? 'rgba(46,230,216,0.3)' : 'rgba(255,180,67,0.3)';

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Auto-switch between work and break
            if (mode === 'work') {
              setSessions(s => s + 1);
              setMode('break');
              setIsRunning(false);
              return preset.break_;
            } else {
              setMode('work');
              setIsRunning(false);
              return preset.work;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, preset]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(preset.work);
  }, [preset]);

  const switchPreset = useCallback((idx) => {
    setPresetIdx(idx);
    setIsRunning(false);
    setMode('work');
    setTimeLeft(PRESETS[idx].work);
    setShowPresets(false);
  }, []);

  // Close presets on outside click
  useEffect(() => {
    if (!showPresets) return;
    const handler = (e) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPresets]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card-accent p-5 flex flex-col items-center"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-overline" style={{ color: 'var(--text-secondary)', fontSize: '0.625rem' }}>
            Focus Timer
          </span>
        </div>

        {/* Preset Selector */}
        <div className="relative" ref={presetsRef}>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-caption font-bold uppercase tracking-wider transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-muted)',
            }}
          >
            <span>{preset.icon}</span>
            <span>{preset.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPresets && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden shadow-2xl z-20"
                style={{ background: 'var(--card-bg-95)', border: '1px solid var(--card-border-10)' }}
              >
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => switchPreset(i)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-caption transition-colors hover:bg-white/5"
                    style={{ color: i === presetIdx ? accentColor : 'var(--text-secondary)' }}
                  >
                    <span>{p.icon}</span>
                    <span className="font-medium">{p.label}</span>
                      <span className="ml-auto text-micro" style={{ color: 'var(--text-muted)' }}>
                      {p.work / 60}m
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="timer-ring">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="timer-ring-bg"
            strokeWidth={strokeWidth}
          />
          {/* Glow ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="timer-ring-glow"
            stroke={accentColor}
            strokeWidth={strokeWidth + 6}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="timer-ring-progress"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>
            {formatTime(timeLeft)}
          </span>
          <span
            className="text-micro font-bold uppercase tracking-wider mt-1 flex items-center gap-1"
            style={{ color: accentColor }}
          >
            {mode === 'work' ? (
              <>
                <Brain className="w-3 h-3" /> Focus
              </>
            ) : (
              <>
                <Coffee className="w-3 h-3" /> Break
              </>
            )}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
          }}
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning(!isRunning)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${mode === 'work' ? '#1CC9B8' : '#E6A030'})`,
            boxShadow: `0 4px 14px ${glowColor}`,
            color: '#0B0E14',
          }}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </motion.button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          title="Sessions completed"
        >
          <span className="text-micro font-bold tabular-nums" style={{ color: accentColor }}>{sessions}</span>
        </div>
      </div>

      {/* Session dots */}
      {sessions > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 500, damping: 25 }}
              className="w-2 h-2 rounded-full"
              style={{ background: accentColor, boxShadow: `0 0 6px ${glowColor}` }}
            />
          ))}
          {sessions > 8 && (
            <span className="text-[9px] ml-1" style={{ color: 'var(--text-muted)' }}>+{sessions - 8}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};
