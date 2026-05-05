import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CursorEffect = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const largeSpringConfig = { damping: 40, stiffness: 100, mass: 0.8 };
  const largeSmoothX = useSpring(cursorX, largeSpringConfig);
  const largeSmoothY = useSpring(cursorY, largeSpringConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100]"
        style={{
          x: smoothX,
          y: smoothY,
          background: 'radial-gradient(circle, rgba(0,153,212,0.5) 0%, rgba(0,153,212,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[99]"
        style={{
          x: largeSmoothX,
          y: largeSmoothY,
          marginLeft: '-48px',
          marginTop: '-48px',
          background: 'radial-gradient(circle, rgba(170,255,0,0.10) 0%, rgba(170,255,0,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
};
