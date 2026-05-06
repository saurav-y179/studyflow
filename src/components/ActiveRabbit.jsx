import { motion } from 'framer-motion';

export const ActiveRabbit = ({ state = 'idle', colorMode = 'dark' }) => {
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isHovered = state === 'hover';
  
  // Theme colors
  const primaryColor = colorMode === 'dark' ? '#10b981' : '#c93e1e';
  const secondaryColor = colorMode === 'dark' ? '#047857' : '#8a2a10';
  const bgColor = colorMode === 'dark' ? '#050505' : '#ede8da';
  const eyeColor = colorMode === 'dark' ? '#ffffff' : '#0e0d0b';

  return (
    <motion.div
      animate={{ 
        y: isThinking ? [0, -8, 0] : isHovered ? -5 : [0, -3, 0],
        rotate: isHovered ? [0, -5, 5, -5, 0] : 0
      }}
      transition={{ 
        y: { duration: isThinking ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 0.5 }
      }}
      className="relative w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        border: `2px solid ${bgColor}`
      }}
    >
      {/* Left Ear */}
      <motion.div 
        className="absolute -top-6 left-2.5 w-3 h-8 rounded-t-full origin-bottom"
        style={{ background: primaryColor, border: `2px solid ${bgColor}` }}
        animate={{ 
          rotate: isThinking ? [0, -20, 0] : isSpeaking ? [-10, 10, -10] : isHovered ? -15 : [0, -5, 0] 
        }}
        transition={{ duration: isThinking ? 0.4 : isSpeaking ? 0.3 : 4, repeat: Infinity }}
      />
      {/* Right Ear */}
      <motion.div 
        className="absolute -top-6 right-2.5 w-3 h-8 rounded-t-full origin-bottom"
        style={{ background: primaryColor, border: `2px solid ${bgColor}` }}
        animate={{ 
          rotate: isThinking ? [0, 20, 0] : isSpeaking ? [10, -10, 10] : isHovered ? 15 : [0, 5, 0] 
        }}
        transition={{ duration: isThinking ? 0.4 : isSpeaking ? 0.3 : 4, repeat: Infinity, delay: 0.1 }}
      />
      
      {/* Face Base */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 z-10">
        {/* Eyes */}
        <div className="flex gap-3 mb-1">
          <motion.div 
            className="w-2 h-2.5 rounded-full"
            style={{ background: eyeColor }}
            animate={{ 
              scaleY: isThinking ? [1, 0.1, 1] : isSpeaking ? [1, 1.2, 1] : [1, 1, 0.1, 1, 1],
              scaleX: isHovered ? 1.2 : 1
            }} 
            transition={{ 
              scaleY: { repeat: Infinity, duration: isThinking ? 0.4 : 4, times: isThinking ? [0, 0.5, 1] : [0, 0.45, 0.5, 0.55, 1] } 
            }} 
          />
          <motion.div 
            className="w-2 h-2.5 rounded-full"
            style={{ background: eyeColor }}
            animate={{ 
              scaleY: isThinking ? [1, 0.1, 1] : isSpeaking ? [1, 1.2, 1] : [1, 1, 0.1, 1, 1],
              scaleX: isHovered ? 1.2 : 1
            }} 
            transition={{ 
              scaleY: { repeat: Infinity, duration: isThinking ? 0.4 : 4, times: isThinking ? [0, 0.5, 1] : [0, 0.45, 0.5, 0.55, 1] } 
            }} 
          />
        </div>
        
        {/* Nose / Mouth */}
        <motion.div 
          className="w-1.5 h-1.5 rounded-full bg-pink-400"
          animate={{ scale: isSpeaking ? [1, 1.5, 1] : 1 }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      </div>
      
      {/* Interactive Ripple/Glow on hover or thinking */}
      {isThinking && (
        <motion.div 
          className="absolute inset-0 rounded-3xl border-2 border-white mix-blend-overlay pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
