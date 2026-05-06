import { motion } from 'framer-motion';

export const BackgroundV2 = ({ mousePosition }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
      {/* Deep atmospheric fog/glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#10b981] blur-[150px] mix-blend-screen"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ea580c] blur-[150px] mix-blend-screen"
      />
      
      {/* Parallax energy trail (SVG) */}
      <motion.svg 
        className="absolute inset-0 w-full h-full opacity-40" 
        style={{ x: mousePosition.x * -0.015, y: mousePosition.y * -0.015 }}
        viewBox="0 0 100 100" preserveAspectRatio="none"
      >
        <motion.path 
          d="M0,50 Q25,20 50,50 T100,50" 
          fill="none" 
          stroke="url(#grad1)" 
          strokeWidth="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.path 
          d="M0,70 Q30,90 60,60 T100,70" 
          fill="none" 
          stroke="url(#grad2)" 
          strokeWidth="0.1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
        />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0" />
            <stop offset="50%" stopColor="#ea580c" stopOpacity="1" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Subtle dust particles */}
      <div className="absolute inset-0 opacity-10 mix-blend-screen transition-transform duration-1000 ease-out" style={{
        backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), transparent)',
        transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
      }} />
    </div>
  );
};
