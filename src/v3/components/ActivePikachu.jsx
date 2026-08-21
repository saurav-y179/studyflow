import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── GlossyShine ──────────────────────────────────────────────────────────────
// Premium sticker-shine effect with zero cursor lag.
// Bypasses React state entirely for position updates — writes directly to the
// DOM overlay element so the GPU composite happens every frame with no re-render.
// Three gradient layers:
//   1. Tight specular hot-spot  (the bright lens-flare core)
//   2. Wide soft bloom halo     (the ambient illumination bleed)
//   3. Warm Fresnel rim glow    (counter-glow on the opposite side, like backlighting)
const GlossyShine = ({ containerRef }) => {
  const overlayRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) return;

    const buildGradient = (x, y) => {
      // Fresnel counter-glow sits opposite the cursor
      const rx = 100 - x;
      const ry = 100 - y;
      return `
        radial-gradient(
          circle 26px at ${x}% ${y}%,
          rgba(255,255,255,0.95) 0%,
          rgba(255,255,255,0.65) 20%,
          rgba(255,255,255,0.18) 55%,
          transparent 100%
        ),
        radial-gradient(
          circle 72px at ${x}% ${y}%,
          rgba(255,255,255,0.22) 0%,
          rgba(255,255,255,0.08) 50%,
          transparent 100%
        ),
        radial-gradient(
          circle 60px at ${rx}% ${ry}%,
          rgba(255,220,80,0.14) 0%,
          rgba(255,180,60,0.06) 50%,
          transparent 100%
        )
      `;
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Direct DOM write — no React re-render, no lag
      overlay.style.background = buildGradient(x, y);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [containerRef]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 10,
        borderRadius: '8px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        mixBlendMode: 'screen',
        willChange: 'background, opacity',
        // Initial gradient centred — replaced on first mousemove
        background: buildGradientStatic(50, 50),
      }}
    />
  );
};

// Helper used only for the initial static render (before any mouse event)
function buildGradientStatic(x, y) {
  const rx = 100 - x;
  const ry = 100 - y;
  return `
    radial-gradient(circle 26px at ${x}% ${y}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 20%, rgba(255,255,255,0.18) 55%, transparent 100%),
    radial-gradient(circle 72px at ${x}% ${y}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 50%, transparent 100%),
    radial-gradient(circle 60px at ${rx}% ${ry}%, rgba(255,220,80,0.14) 0%, rgba(255,180,60,0.06) 50%, transparent 100%)
  `;
}

// Ordered for natural motion: sit → wave → jump → turn → loop
const POSES = [
  { src: '/pikachu-transparent-32591.png', alt: 'Pikachu sitting' },
  { src: '/pikachu-transparent-32576.png', alt: 'Pikachu waving' },
  { src: '/pikachu-transparent-32575.png', alt: 'Pikachu jumping' },
  { src: '/pikachu-transparent-32599.png', alt: 'Pikachu turning' },
];

const IDLE_CYCLE_MS = 10000;
const INTERACTION_PAUSE_MS = 30000;

const SPARKS = [
  { delay: 0, left: 25, duration: 2.2, y: -33, x: [-3, 8] },
  { delay: 0.7, left: 58, duration: 1.9, y: -41, x: [4, -7] },
  { delay: 1.4, left: 72, duration: 2.4, y: -29, x: [-5, 10] },
  { delay: 2.0, left: 38, duration: 2.1, y: -38, x: [2, -9] },
];

// Tiny electric spark particle
const Spark = ({ delay, left, duration, y, x }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: '3px',
      height: '3px',
      left: `${left}%`,
      bottom: '35%',
      background: delay > 1 ? '#60A5FA' : '#FDE047',
      boxShadow: `0 0 5px ${delay > 1 ? '#60A5FA' : '#FDE047'}`,
    }}
    animate={{
      y: [0, y],
      x,
      opacity: [0, 0.9, 0],
      scale: [0.4, 1.2, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export const ActivePikachu = ({ recentActivity }) => {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const lastInteraction = useRef(0);
  const prevActivity = useRef(null);
  const shineContainerRef = useRef(null);

  // Preload images
  useEffect(() => {
    POSES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Greet on first load: wave for 2.5s then settle
  useEffect(() => {
    const t = setTimeout(() => setCurrentIndex(0), 2500);
    return () => clearTimeout(t);
  }, []);

  // Auto-cycle when idle
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastInteraction.current > INTERACTION_PAUSE_MS) {
        setCurrentIndex((p) => (p + 1) % POSES.length);
      }
    }, IDLE_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  // Context-aware: react to activity changes
  useEffect(() => {
    if (prevActivity.current !== null && recentActivity !== prevActivity.current) {
      setCurrentIndex(2); // jumping = excited
      lastInteraction.current = Date.now();
      const t = setTimeout(() => setCurrentIndex(0), 3000);
      prevActivity.current = recentActivity;
      return () => clearTimeout(t);
    }
    prevActivity.current = recentActivity;
  }, [recentActivity]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    lastInteraction.current = Date.now();
    setCurrentIndex((p) => (p + 1) % POSES.length);
  }, []);

  return (
    <div className="relative mx-auto mb-2 flex flex-col items-center">
      <motion.div
        ref={shineContainerRef}
        animate={shouldReduceMotion ? {} : { y: [0, -3, 0] }}
        transition={shouldReduceMotion ? {} : { y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: '140px', height: '150px' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.7 : 0.35,
            background: 'radial-gradient(ellipse at center, rgba(253,224,71,0.3) 0%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Electric sparks */}
        {!shouldReduceMotion && SPARKS.map((s, i) => (
          <Spark key={i} {...s} />
        ))}

        {/* Image crossfade */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={POSES[currentIndex].src}
              alt={POSES[currentIndex].alt}
              draggable={false}
              className="absolute inset-0 w-full h-full select-none"
              style={{
                objectFit: 'contain',
                filter: isHovered
                  ? 'drop-shadow(0 4px 16px rgba(253,224,71,0.4)) brightness(1.1)'
                  : 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'filter 0.3s ease, transform 0.3s ease',
              }}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
              transition={{
                duration: shouldReduceMotion ? 0.15 : 0.2,
                ease: 'easeOut',
              }}
            />
          </AnimatePresence>

          {/* Glossy sticker-shine spotlight */}
          <GlossyShine containerRef={shineContainerRef} />
        </div>

        {/* Floor glow */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '70px',
            height: '10px',
            background: 'radial-gradient(ellipse, rgba(253,224,71,0.2) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
      </motion.div>


    </div>
  );
};
