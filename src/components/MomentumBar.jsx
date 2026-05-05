import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

export const MomentumBar = ({ momentum, color, streak }) => {
  const controls = useAnimation();
  const prevStreak = useRef(streak?.current || 0);

  // Pulse animation when streak increases
  useEffect(() => {
    if (streak?.current > prevStreak.current) {
      controls.start({
        scale: [1, 1.05, 1],
        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
        transition: { duration: 0.8, ease: 'easeOut' }
      });
    }
    prevStreak.current = streak?.current || 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak?.current, controls]);

  const getGradient = () => {
    if (momentum > 60) return `linear-gradient(90deg, #001F3F, #0099D4, #AAFF00)`;
    if (momentum > 30) return `linear-gradient(90deg, #001020, #0099D4, #33BFFF)`;
    return `linear-gradient(90deg, #060D14, #142030, #0C1620)`; // Muted for low
  };

  const currentStreakValue = streak?.current || 0;
  const glowOpacity = Math.min(0.2 + (currentStreakValue * 0.05), 0.8);
  const glowBlur = Math.min(10 + (currentStreakValue * 2), 40);

  return (
    <div className="fixed top-16 left-0 right-0 h-16 glass-strong z-40 flex items-center px-6 border-b border-glass-border shadow-2xl bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
        <div className="flex flex-col">
          <span className="text-text-tertiary text-xs font-bold uppercase tracking-[0.2em]">
            Energy
          </span>
          <span className="text-text-primary text-xl font-bold tabular-nums">
            {Math.round(momentum)}<span className="text-sm text-text-tertiary">%</span>
          </span>
        </div>
        
        <div className="flex-1 h-4 bg-background/80 rounded-full relative shadow-inner">
          {/* Shimmer background */}
          <div className="absolute inset-0 animate-shimmer rounded-full mix-blend-overlay opacity-30" />
          
          {/* Glow backdrop based on streak */}
          <div 
            className="absolute inset-0 rounded-full transition-all duration-1000"
            style={{ 
              background: getGradient(), 
              opacity: glowOpacity,
              filter: `blur(${glowBlur}px)`,
              width: `${momentum}%`
            }}
          />

          <motion.div
            animate={controls}
            className="h-full rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            style={{ background: getGradient() }}
            initial={{ width: 0 }}
            whileInView={{ width: `${momentum}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40 rounded-full" />
            
            {momentum > 60 && (
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow mix-blend-screen"
                style={{ background: getGradient(), filter: 'blur(6px)', opacity: 0.8 }}
              />
            )}
          </motion.div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-text-tertiary text-xs font-bold uppercase tracking-[0.2em]">
            Streak
          </span>
          <span className="text-xl font-bold" style={{ color }}>
            {currentStreakValue} <span className="text-sm">🔥</span>
          </span>
        </div>
      </div>
    </div>
  );
};