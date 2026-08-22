import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── GlossyShine ──────────────────────────────────────────────────────────────
// Sticker-gloss spotlight that eases toward the cursor instead of teleporting.
// Two pre-built radial-gradient layers are positioned with `transform` only
// (GPU-composited) inside one requestAnimationFrame loop — no per-event
// background rebuilds, no CPU repaints, no React state churn.
const GlossyShine = ({ containerRef, instant = false }) => {
  const coreRef = useRef(null);
  const bloomRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: 0.5, y: 0.5 });     // eased position (0..1 of box)
  const target = useRef({ x: 0.5, y: 0.5 });  // raw cursor position

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    let raf = 0;
    let rect = null;
    let dirty = true;

    const apply = () => {
      const w = rect ? rect.width : 1;
      const h = rect ? rect.height : 1;
      const px = (pos.current.x - 0.5) * w;
      const py = (pos.current.y - 0.5) * h;
      const t = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
      if (coreRef.current) coreRef.current.style.transform = t;
      if (bloomRef.current) bloomRef.current.style.transform = t;
    };

    const loop = () => {
      const k = instant ? 1 : 0.16;
      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;
      if (Math.abs(dx) > 0.0004 || Math.abs(dy) > 0.0004 || dirty) {
        pos.current.x += dx * k;
        pos.current.y += dy * k;
        apply();
        dirty = false;
      }
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };

    const updateTarget = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      target.current.x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      target.current.y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    };

    const onMove = (e) => updateTarget(e);
    const onEnter = (e) => {
      rect = el.getBoundingClientRect();
      updateTarget(e);
      dirty = true;
      setVisible(true);
      startLoop();
    };
    const onLeave = () => {
      setVisible(false);
      stopLoop();
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      stopLoop();
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [containerRef, instant]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[8px]" style={{ zIndex: 10 }}>
      <div
        className="absolute inset-0"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
          mixBlendMode: 'screen',
        }}
      >
        {/* Wide soft bloom */}
        <div
          ref={bloomRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: '120px',
            height: '120px',
            marginLeft: '-60px',
            marginTop: '-60px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,244,214,0.05) 45%, transparent 68%)',
          }}
        />
        {/* Tight specular core */}
        <div
          ref={coreRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: '36px',
            height: '36px',
            marginLeft: '-18px',
            marginTop: '-18px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.16) 45%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

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
        // Bob pauses while hovered so it never fights the hover pop
        animate={shouldReduceMotion || isHovered ? { y: 0 } : { y: [0, -3, 0] }}
        transition={shouldReduceMotion || isHovered
          ? { duration: 0.3, ease: 'easeOut' }
          : { y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
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
            opacity: isHovered ? 0.55 : 0.3,
            background: 'radial-gradient(ellipse at center, rgba(253,224,71,0.28) 0%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Electric sparks */}
        {!shouldReduceMotion && SPARKS.map((s, i) => (
          <Spark key={i} {...s} />
        ))}

        {/* Image crossfade (simultaneous dissolve — no blank-frame blink) */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={POSES[currentIndex].src}
              alt={POSES[currentIndex].alt}
              draggable={false}
              className="absolute inset-0 w-full h-full select-none"
              style={{
                objectFit: 'contain',
                filter: isHovered
                  ? 'drop-shadow(0 4px 14px rgba(253,224,71,0.35)) brightness(1.08)'
                  : 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                transition: 'filter 0.3s ease',
              }}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.88 }}
              // Framer Motion solely owns transform — hover scale included
              animate={{ opacity: 1, scale: isHovered && !shouldReduceMotion ? 1.06 : 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </AnimatePresence>

          {/* Glossy sticker-shine spotlight */}
          <GlossyShine containerRef={shineContainerRef} instant={shouldReduceMotion} />
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
