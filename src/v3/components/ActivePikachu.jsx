import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

// Ordered for natural motion: sit → wave → jump → turn → loop
const POSES = [
  { src: '/pikachu-transparent-32591.png', alt: 'Pikachu sitting' },
  { src: '/pikachu-transparent-32576.png', alt: 'Pikachu waving' },
  { src: '/pikachu-transparent-32575.png', alt: 'Pikachu jumping' },
  { src: '/pikachu-transparent-32599.png', alt: 'Pikachu turning' },
];

const IDLE_CYCLE_MS = 10000;
const INTERACTION_PAUSE_MS = 30000;

// Tiny electric spark particle
const Spark = ({ delay, left, duration }) => (
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
      y: [0, -25 - Math.random() * 20],
      x: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 22],
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const lastInteraction = useRef(0);
  const prevActivity = useRef(null);

  // Preload images
  useEffect(() => {
    POSES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Greet on first load: wave for 2.5s then settle
  useEffect(() => {
    setCurrentIndex(1);
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

  const sparks = useRef([
    { delay: 0, left: 25, duration: 2.2 },
    { delay: 0.7, left: 58, duration: 1.9 },
    { delay: 1.4, left: 72, duration: 2.4 },
    { delay: 2.0, left: 38, duration: 2.1 },
  ]).current;

  return (
    <div className="relative mx-auto mb-2 flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
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
        {sparks.map((s, i) => (
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
              initial={{ opacity: 0, scale: 0.88, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.88, rotate: 3 }}
              transition={{
                opacity: { duration: 0.2, ease: 'easeInOut' },
                scale: { type: 'spring', stiffness: 350, damping: 22 },
                rotate: { duration: 0.2 },
              }}
            />
          </AnimatePresence>
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
