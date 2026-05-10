import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Generates a jagged lightning path from top to bottom
const generateLightningPath = (startX, startY, endY, segments) => {
  let path = `M ${startX} ${startY}`;
  let currentX = startX;
  let currentY = startY;
  const segmentHeight = (endY - startY) / segments;

  for (let i = 1; i <= segments; i++) {
    // Random zigzag horizontally
    currentX += (Math.random() - 0.5) * 300;
    currentY += segmentHeight + (Math.random() - 0.5) * 50;
    path += ` L ${currentX} ${currentY}`;
  }
  return path;
};

export const GlobalLightning = () => {
  const [flashes, setFlashes] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  useEffect(() => {
    // Update dimensions on mount and resize
    const updateDims = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    // Randomly trigger a giant lightning strike across the screen
    const interval = setInterval(() => {
      // 30% chance to strike every 4 seconds
      if (Math.random() > 0.7) {
        const id = Date.now();
        setFlashes((prev) => [...prev, id]);
        
        // Remove it after animation finishes
        setTimeout(() => {
          setFlashes((prev) => prev.filter(f => f !== id));
        }, 1500);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {flashes.map((id) => {
          const startX1 = Math.random() * dimensions.width;
          const startX2 = Math.random() * dimensions.width;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.1, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, times: [0, 0.05, 0.1, 0.15, 1] }}
              className="absolute inset-0"
            >
              {/* Screen flash */}
              <div className="absolute inset-0 bg-[#737fe3] mix-blend-screen opacity-10" />
              
              {/* SVG Lightning Bolts */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Main Bolt 1 */}
                <motion.path
                  d={generateLightningPath(startX1, -50, dimensions.height + 50, 10)}
                  fill="none"
                  stroke="#737fe3"
                  strokeWidth="5"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                
                {/* Main Bolt 2 */}
                <motion.path
                  d={generateLightningPath(startX2, -50, dimensions.height + 50, 12)}
                  fill="none"
                  stroke="#ffff00"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                />

                {/* Branching Bolt */}
                <motion.path
                  d={generateLightningPath(startX1 + 100, dimensions.height * 0.3, dimensions.height, 8)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
