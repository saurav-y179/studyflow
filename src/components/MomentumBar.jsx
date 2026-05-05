import { motion } from 'framer-motion';

export const MomentumBar = ({ momentum, color }) => {
  const getGradient = () => {
    if (momentum > 60) return `linear-gradient(90deg, #7209B7, ${color}, #F72585)`;
    if (momentum > 30) return `linear-gradient(90deg, #480CA8, ${color}, #B5179E)`;
    return `linear-gradient(90deg, #3A0CA3, ${color}, #4361EE)`;
  };

  return (
    <div className="fixed top-16 left-0 right-0 h-12 glass z-40 flex items-center px-6">
      <div className="flex items-center gap-4 flex-1">
        <span className="text-text-tertiary text-xs font-semibold uppercase tracking-wider w-24">
          Momentum
        </span>
        <div className="flex-1 h-2 bg-background/60 rounded-full overflow-hidden relative">
          {/* Shimmer background */}
          <div className="absolute inset-0 animate-shimmer rounded-full" />
          <motion.div
            className="h-full rounded-full relative"
            style={{ background: getGradient() }}
            initial={{ width: 0 }}
            animate={{ width: `${momentum}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {momentum > 60 && (
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{ background: getGradient(), filter: 'blur(4px)' }}
              />
            )}
          </motion.div>
        </div>
        <span
          className="font-mono font-bold text-sm w-12 text-right tabular-nums"
          style={{ color }}
        >
          {Math.round(momentum)}%
        </span>
      </div>
    </div>
  );
};