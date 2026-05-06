import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ActiveRabbit } from '../../components/ActiveRabbit';

export const RabbitAssistantV2 = ({ entries, streak }) => {
  const [insight, setInsight] = useState(null);
  const [rabbitState, setRabbitState] = useState('idle');
  
  useEffect(() => {
    // Simulated AI insight loop
    const fetchInsight = () => {
      setRabbitState('thinking');
      setTimeout(() => {
        setInsight("System momentum stabilized. Optimal output predicted for next cycle.");
        setRabbitState('speaking');
        setTimeout(() => {
          setInsight(null);
          setRabbitState('idle');
        }, 8000);
      }, 1000);
    };
    
    const timer = setTimeout(() => {
      fetchInsight();
      setInterval(fetchInsight, 45000);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-end gap-6 pointer-events-none">
      <div 
        className="pointer-events-auto cursor-pointer"
        onMouseEnter={() => setRabbitState(prev => prev === 'idle' ? 'hover' : prev)}
        onMouseLeave={() => setRabbitState(prev => prev === 'hover' ? 'idle' : prev)}
      >
        <ActiveRabbit state={rabbitState} colorMode="dark" />
      </div>

      <AnimatePresence>
        {insight && (
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 max-w-[280px] p-5 rounded-2xl bg-[#0a0a0c]/80 border border-white/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden pointer-events-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/5 to-transparent" />
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
               <span className="text-[9px] font-bold tracking-widest uppercase text-white/40">System AI</span>
            </div>
            <p className="relative z-10 text-[13px] text-white/80 font-light leading-relaxed tracking-wide">
              {insight}
            </p>
            <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-[#10b981] to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
