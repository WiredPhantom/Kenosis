import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface NarratorPersonaProps {
  isPlaying: boolean;
  isSpeakingWord: boolean;
}

export default function NarratorPersona({ isPlaying, isSpeakingWord }: NarratorPersonaProps) {
  // Randomize idle movements
  const [blink, setBlink] = useState(false);
  const [sway, setSway] = useState(0);

  useEffect(() => {
    // Blinking logic
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        // Sometimes double blink
        if (Math.random() > 0.7) {
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
          }, 300);
        }
      }
    }, 4000);

    // Head sway logic
    const swayInterval = setInterval(() => {
      setSway(Math.random() * 4 - 2); // -2 to 2 degrees
    }, 3000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(swayInterval);
    };
  }, []);

  // Determine mouth state based on speaking
  // In a real app, you'd map visemes to exact phonemes, here we just flap
  const mouthScaleY = isPlaying && isSpeakingWord ? (Math.random() * 0.8 + 0.4) : 0.1;
  const mouthScaleX = isPlaying && isSpeakingWord ? (Math.random() * 0.4 + 0.8) : 1;

  // Breathing animation for chest
  const breathingVariants = {
    idle: { scaleY: [1, 1.02, 1], y: [0, -2, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
    speaking: { scaleY: [1, 1.01, 1], y: [0, -1, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
  };

  // Arm gestures when speaking
  const leftArmVariants = {
    idle: { rotate: 0, x: 0, y: 0 },
    speaking: { 
      rotate: [0, 5, -2, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const rightArmVariants = {
    idle: { rotate: 0, x: 0, y: 0 },
    speaking: { 
      rotate: [0, -8, 4, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
    }
  };

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl flex items-end justify-center">
      {/* 
        Persona SVG: Aria
        Uses a soft, clay-like 3D feel via gradients and overlapping shapes.
      */}
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="skin" cx="50%" cy="40%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#fad0b4" />
            <stop offset="80%" stopColor="#e8a87c" />
            <stop offset="100%" stopColor="#c3835b" />
          </radialGradient>
          <radialGradient id="shirt" cx="50%" cy="30%" r="70%" fx="30%" fy="20%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a3b32" />
            <stop offset="100%" stopColor="#2c1e16" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Chest / Shoulders */}
        <motion.g 
          variants={breathingVariants}
          animate={isPlaying ? "speaking" : "idle"}
          transformOrigin="100px 200px"
        >
          <path d="M 50 200 C 50 140, 150 140, 150 200 Z" fill="url(#shirt)" filter="url(#shadow)" />
          
          {/* Collar */}
          <path d="M 85 155 C 100 165, 115 155, 115 155" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Left Arm */}
        <motion.g variants={leftArmVariants} animate={isPlaying ? "speaking" : "idle"} transformOrigin="60px 160px">
          <path d="M 55 160 Q 30 180, 40 210" fill="none" stroke="url(#shirt)" strokeWidth="18" strokeLinecap="round" filter="url(#shadow)" />
        </motion.g>

        {/* Right Arm */}
        <motion.g variants={rightArmVariants} animate={isPlaying ? "speaking" : "idle"} transformOrigin="140px 160px">
          <path d="M 145 160 Q 170 180, 160 210" fill="none" stroke="url(#shirt)" strokeWidth="18" strokeLinecap="round" filter="url(#shadow)" />
        </motion.g>

        {/* Head & Neck Wrapper */}
        <motion.g 
          animate={{ 
            rotate: sway,
            y: isPlaying ? [0, -1, 0, 1, 0] : 0 
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 0.5 }
          }}
          transformOrigin="100px 140px"
        >
          {/* Neck */}
          <path d="M 90 120 L 90 160 L 110 160 L 110 120 Z" fill="url(#skin)" />
          <path d="M 90 135 C 100 145, 110 135, 110 135" fill="none" stroke="#c3835b" strokeWidth="1" opacity="0.5" />

          {/* Back Hair */}
          <path d="M 65 80 C 60 120, 70 140, 80 150 C 90 140, 110 140, 120 150 C 130 140, 140 120, 135 80 Z" fill="url(#hair)" />

          {/* Face */}
          <circle cx="100" cy="95" r="35" fill="url(#skin)" filter="url(#shadow)" />
          
          {/* Blush */}
          <circle cx="80" cy="105" r="8" fill="#ff9b9b" opacity="0.3" filter="blur(2px)" />
          <circle cx="120" cy="105" r="8" fill="#ff9b9b" opacity="0.3" filter="blur(2px)" />

          {/* Brows */}
          <motion.g
            animate={{ y: isPlaying && isSpeakingWord ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <path d="M 75 80 Q 82 75, 90 80" fill="none" stroke="#2c1e16" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 125 80 Q 118 75, 110 80" fill="none" stroke="#2c1e16" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>

          {/* Eyes */}
          <g>
            {blink ? (
              <>
                <path d="M 78 92 Q 83 94, 88 92" fill="none" stroke="#2c1e16" strokeWidth="2" strokeLinecap="round" />
                <path d="M 122 92 Q 117 94, 112 92" fill="none" stroke="#2c1e16" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="83" cy="92" r="4.5" fill="#2c1e16" />
                <circle cx="117" cy="92" r="4.5" fill="#2c1e16" />
                {/* Catchlights */}
                <circle cx="84" cy="90" r="1.5" fill="white" />
                <circle cx="118" cy="90" r="1.5" fill="white" />
              </>
            )}
          </g>

          {/* Nose */}
          <path d="M 100 95 Q 102 105, 98 107" fill="none" stroke="#d49268" strokeWidth="2" strokeLinecap="round" />

          {/* Mouth */}
          <motion.g
            animate={{ 
              scaleY: mouthScaleY,
              scaleX: mouthScaleX
            }}
            transition={{ type: "spring", stiffness: 800, damping: 30 }}
            transformOrigin="100px 115px"
          >
            {isPlaying ? (
              <path d="M 92 115 Q 100 125, 108 115 Z" fill="#8c3a3a" />
            ) : (
              <path d="M 94 116 Q 100 119, 106 116" fill="none" stroke="#8c3a3a" strokeWidth="2" strokeLinecap="round" />
            )}
          </motion.g>

          {/* Front Hair / Bangs */}
          <path d="M 65 85 C 65 60, 80 55, 100 55 C 120 55, 135 60, 135 85 C 125 65, 110 65, 100 70 C 90 65, 75 65, 65 85 Z" fill="url(#hair)" filter="url(#shadow)" />
          {/* Hair highlight */}
          <path d="M 80 65 Q 100 60, 120 65" fill="none" stroke="#7a6252" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </motion.g>

      </svg>
    </div>
  );
}
