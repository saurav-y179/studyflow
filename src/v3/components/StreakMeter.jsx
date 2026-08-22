import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const STREAK_GOAL = 30;

const MILESTONES = [
  { days: 7, label: '1 WEEK STREAK', sub: 'Seven straight days. The engine is warm.' },
  { days: 14, label: '2 WEEKS STRONG', sub: 'Fourteen days. You are the habit now.' },
  { days: 21, label: '3 WEEKS ON FIRE', sub: 'Twenty-one days. Unstoppable momentum.' },
  { days: 30, label: 'FULL CHARGE', sub: 'Thirty days. Legendary consistency.' },
];

// Seamless repeating sine wave: one full wavelength per 100 units across 1200.
const WAVE_PATH = (() => {
  let d = 'M0 32';
  for (let x = 0; x < 1200; x += 100) {
    d += ` Q ${x + 25} 20 ${x + 50} 32 T ${x + 100} 32`;
  }
  return `${d} V60 H0 Z`;
})();

const CONFETTI_COLORS = ['#FFD24A', '#FF5C6B', '#2EE6D8', '#A78BFA', '#4ADE80'];

// Deterministic pseudo-random generator — pure during render, unique per milestone
const makeRng = (seed) => {
  let s = seed * 7919 + 17;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};

// ── Liquid fill with two wave layers riding the surface ──────────────
const FluidFill = ({ pct, gradient }) => (
  <motion.div
    className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
    style={{ background: gradient }}
    initial={{ width: 0 }}
    animate={{ width: `${pct}%` }}
    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* Wave surface — clipped by the fill so crests ride the liquid edge */}
    <div
      className="absolute left-0"
      style={{
        top: '-9px',
        height: '18px',
        width: '200%',
        animation: 'wave-slide 3.4s linear infinite',
      }}
    >
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-full">
        <path d={WAVE_PATH} fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
    <div
      className="absolute left-0"
      style={{
        top: '-9px',
        height: '18px',
        width: '200%',
        animation: 'wave-slide 5.6s linear infinite reverse',
        opacity: 0.55,
      }}
    >
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-full">
        <path d={WAVE_PATH} fill="rgba(255,255,255,0.22)" />
      </svg>
    </div>

    {/* Rising bubbles */}
    {[
      { l: 24, s: 4, d: 0 },
      { l: 52, s: 3, d: 0.9 },
      { l: 76, s: 5, d: 1.7 },
    ].map((b, i) => (
      <span
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${b.l}%`,
          bottom: '2px',
          width: `${b.s}px`,
          height: `${b.s}px`,
          background: 'rgba(255,255,255,0.45)',
          animation: `bubble-rise 2.6s linear ${b.d}s infinite`,
        }}
      />
    ))}
  </motion.div>
);

// ── Over-the-top milestone celebration ────────────────────────────────
const MilestoneBurst = ({ milestone }) => {
  const shouldReduceMotion = useReducedMotion();

  const pieces = useMemo(() => {
    const rand = makeRng(milestone.days);
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      delay: rand() * 0.5,
      duration: 1.9 + rand() * 1.3,
      rotate: rand() * 720 - 360,
      drift: rand() * 60 - 30,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 5 + rand() * 6,
    }));
  }, [milestone]);

  return (
    <AnimatePresence>
      <motion.div
        key={milestone.days}
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Screen flash */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(255,210,74,0.22), transparent 65%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, times: [0, 0.25, 1] }}
          />
        )}

        {/* Confetti rain */}
        {!shouldReduceMotion &&
          pieces.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-[2px]"
              style={{
                left: `${p.x}%`,
                top: '-4vh',
                width: `${p.w}px`,
                height: `${p.w * 0.45}px`,
                background: p.color,
              }}
              initial={{ y: 0, x: 0, rotate: 0, opacity: 0 }}
              animate={{ y: '112vh', x: p.drift, rotate: p.rotate, opacity: [0, 1, 1, 0.6] }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
            />
          ))}

        {/* Center banner */}
        <motion.div
          className="relative text-center px-8 py-6 rounded-3xl"
          style={{
            background: 'rgba(10,14,24,0.92)',
            border: '2px solid rgba(255,210,74,0.5)',
            boxShadow: '0 0 80px rgba(255,180,67,0.35), inset 0 0 40px rgba(255,210,74,0.08)',
          }}
          initial={{ scale: shouldReduceMotion ? 1 : 0.4, y: shouldReduceMotion ? 0 : 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: shouldReduceMotion ? 1 : [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-2"
          >
            🔥
          </motion.div>
          <h2
            className="text-3xl font-black tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
              background: 'linear-gradient(135deg, #FFD24A, #FF9F43)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 18px rgba(255,180,67,0.45))',
            }}
          >
            {milestone.label}
          </h2>
          <p className="mt-1.5 text-sm font-medium" style={{ color: '#AAB4C4' }}>
            {milestone.sub}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Public: fluid capsule meter shown in the top bar ─────────────────
export const StreakMeter = ({ streak }) => {
  const shouldReduceMotion = useReducedMotion();
  const current = streak?.current || 0;
  const pct = Math.min(Math.max((current / STREAK_GOAL) * 100, 0), 100);
  const [celebration, setCelebration] = useState(null);

  // Fire each milestone exactly once (persisted across reloads)
  useEffect(() => {
    if (!current) return undefined;
    let store = {};
    try {
      store = JSON.parse(localStorage.getItem('studyflow_celebrated') || '{}');
    } catch {
      store = {};
    }
    const hit = MILESTONES.find((m) => current >= m.days && !store[m.days]);
    if (!hit) return undefined;

    store[hit.days] = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem('studyflow_celebrated', JSON.stringify(store));
    } catch {
      /* non-fatal */
    }

    // Defer state updates out of the synchronous effect body
    const show = setTimeout(() => setCelebration(hit), 30);
    const hide = setTimeout(() => setCelebration(null), 3430);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [current]);

  const gradient =
    pct >= 66
      ? 'linear-gradient(180deg, #FFC94A, #F59E0B)'
      : pct >= 33
      ? 'linear-gradient(180deg, #2EE6D8, #0891B2)'
      : 'linear-gradient(180deg, #34D399, #059669)';

  return (
    <>
      <div className="flex-1 relative flex items-center gap-3 min-w-[100px]">
        <div className="flex-1 relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-overline" style={{ color: '#8B95A5', fontSize: '0.5625rem' }}>
              Streak Goal
            </span>
            <span className="text-micro font-semibold tabular-nums" style={{ color: '#2EE6D8' }}>
              {current}
              <span style={{ color: '#5B6574' }}>/{STREAK_GOAL}</span>
            </span>
          </div>

          {/* Fluid capsule */}
          <div
            className="w-full rounded-full overflow-hidden relative"
            style={{
              height: '18px',
              background: '#0A101C',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {pct > 0 &&
              (shouldReduceMotion ? (
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${pct}%`, background: gradient }}
                />
              ) : (
                <FluidFill pct={pct} gradient={gradient} />
              ))}

            {/* Milestone ticks */}
            {MILESTONES.map((m) => {
              const pos = (m.days / STREAK_GOAL) * 100;
              const reached = current >= m.days;
              return (
                <div
                  key={m.days}
                  className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full z-10"
                  style={{
                    left: `${pos}%`,
                    background: reached ? '#FFD24A' : 'rgba(255,255,255,0.18)',
                    boxShadow: reached ? '0 0 6px rgba(255,210,74,0.8)' : 'none',
                  }}
                  title={`${m.days} days`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {celebration && <MilestoneBurst milestone={celebration} />}
    </>
  );
};
