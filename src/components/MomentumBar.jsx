import { motion } from 'framer-motion';

export const MomentumBar = ({ momentum, color }) => {
  return (
    <div className="fixed top-16 left-0 right-0 h-12 bg-surface/80 backdrop-blur border-b border-primary/15 z-40 flex items-center px-6">
      <div className="flex items-center gap-4 flex-1">
        <span className="text-text-secondary text-sm font-medium w-24">Momentum</span>
        <div className="flex-1 h-3 bg-background rounded-full overflow-hidden border border-primary/20">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${momentum}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-text-primary font-mono font-semibold w-12" style={{ color }}>
          {Math.round(momentum)}%
        </span>
      </div>
    </div>
  );
};