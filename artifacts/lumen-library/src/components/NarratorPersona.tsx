import { motion, useAnimationFrame } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NarratorPersonaProps {
  isPlaying: boolean;
  isSpeakingWord: boolean;
}

type Viseme = "rest" | "aa" | "ih" | "ou" | "ee" | "oh";

const MOUTH_PATHS: Record<Viseme, { d: string; fill: string; stroke?: string; strokeWidth?: number }> = {
  rest: { d: "M 92 122 Q 100 125 108 122", fill: "none", stroke: "#9a4a66", strokeWidth: 2.2 },
  aa:   { d: "M 92 120 Q 100 134 108 120 Q 104 128 96 128 Z", fill: "#a04a66" },          // open wide
  ih:   { d: "M 90 122 Q 100 127 110 122 Q 105 124 95 124 Z", fill: "#a04a66" },          // wide thin
  ou:   { d: "M 96 120 Q 100 130 104 120 Q 102 126 98 126 Z", fill: "#a04a66" },          // pursed o
  ee:   { d: "M 90 121 Q 100 124 110 121 Q 105 123 95 123 Z", fill: "#a04a66" },          // small smile
  oh:   { d: "M 95 119 Q 100 132 105 119 Q 102 128 98 128 Z", fill: "#a04a66" },          // tall o
};

const VISEMES: Viseme[] = ["aa", "ih", "ou", "ee", "oh"];

export default function NarratorPersona({ isPlaying, isSpeakingWord }: NarratorPersonaProps) {
  const [blink, setBlink] = useState(false);
  const [sway, setSway] = useState(0);
  const [viseme, setViseme] = useState<Viseme>("rest");
  const [waveTrigger, setWaveTrigger] = useState(0);

  const visemeIndex = useRef(0);
  const lastVisemeChange = useRef(0);
  const lastWaveAt = useRef(0);

  // Blink loop — spontaneous + occasional double-blink
  useEffect(() => {
    let t1: number, t2: number, t3: number;
    const tick = () => {
      setBlink(true);
      t1 = window.setTimeout(() => setBlink(false), 130);
      // sometimes a second blink
      if (Math.random() > 0.7) {
        t2 = window.setTimeout(() => {
          setBlink(true);
          t3 = window.setTimeout(() => setBlink(false), 120);
        }, 280);
      }
    };
    const interval = window.setInterval(tick, 2800 + Math.random() * 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, []);

  // Idle head sway
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSway((Math.random() - 0.5) * 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Mouth viseme animation while speaking
  useAnimationFrame((time) => {
    if (!isPlaying) {
      if (viseme !== "rest") setViseme("rest");
      return;
    }
    // Advance the viseme on word boundaries OR every ~140ms
    const now = time;
    const cooldown = isSpeakingWord ? 110 : 180;
    if (now - lastVisemeChange.current >= cooldown) {
      visemeIndex.current = (visemeIndex.current + 1 + Math.floor(Math.random() * 2)) % VISEMES.length;
      setViseme(VISEMES[visemeIndex.current]);
      lastVisemeChange.current = now;
    }
    // Trigger an occasional little wave/gesture every ~3s while playing
    if (now - lastWaveAt.current > 3000 + Math.random() * 1500) {
      setWaveTrigger((v) => v + 1);
      lastWaveAt.current = now;
    }
  });

  const mouth = MOUTH_PATHS[viseme];

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-end justify-center">
      <svg
        viewBox="0 0 200 230"
        className="w-full h-full overflow-visible drop-shadow-[0_8px_20px_rgba(220,120,160,0.25)]"
      >
        <defs>
          <radialGradient id="bunnySkin" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fffafb" />
            <stop offset="100%" stopColor="#ffe9ee" />
          </radialGradient>
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb1c8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffb1c8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dressGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff5f6" />
            <stop offset="100%" stopColor="#ffd6e0" />
          </linearGradient>
          <linearGradient id="apronGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffe9ee" />
            <stop offset="100%" stopColor="#ffd0dc" />
          </linearGradient>
          <linearGradient id="bowGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f59ec0" />
            <stop offset="100%" stopColor="#e07ba6" />
          </linearGradient>
          <linearGradient id="bangs" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffe89c" />
            <stop offset="100%" stopColor="#f0c878" />
          </linearGradient>
          <radialGradient id="eyeShine" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#9b6ad0" />
            <stop offset="55%" stopColor="#5a3a8a" />
            <stop offset="100%" stopColor="#2a1c4a" />
          </radialGradient>
        </defs>

        {/* Soft halo on the floor */}
        <ellipse cx="100" cy="222" rx="62" ry="6" fill="#f4a3bf" opacity="0.22" />

        {/* ─── Body / dress (breathing) ─── */}
        <motion.g
          animate={isPlaying ? { scaleY: [1, 1.012, 1] } : { scaleY: [1, 1.02, 1] }}
          transition={{
            duration: isPlaying ? 2.4 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "100px 220px" }}
        >
          {/* dress */}
          <path
            d="M 56 178 Q 100 158 144 178 L 152 222 Q 100 232 48 222 Z"
            fill="url(#dressGrad)"
            stroke="#e9b3c4"
            strokeWidth="2"
          />
          {/* apron front */}
          <path
            d="M 82 174 L 118 174 L 122 222 L 78 222 Z"
            fill="url(#apronGrad)"
            stroke="#e9b3c4"
            strokeWidth="1.4"
          />
          {/* apron heart pocket */}
          <path d="M100 200 c -3 -4 -9 -4 -9 1 c 0 4 5 7 9 10 c 4 -3 9 -6 9 -10 c 0 -5 -6 -5 -9 -1 z" fill="#f59ec0" opacity="0.85" />
        </motion.g>

        {/* ─── Left arm + waving hand ─── */}
        <motion.g
          animate={
            isPlaying
              ? {
                  rotate: [-2, 8, -2],
                }
              : { rotate: [-2, 0, -2] }
          }
          transition={{
            duration: isPlaying ? 2.6 : 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "70px 178px" }}
        >
          {/* sleeve */}
          <path
            d="M 56 178 Q 42 196 50 218"
            fill="none"
            stroke="url(#dressGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* hand */}
          <motion.g
            key={`lh-${waveTrigger}`}
            animate={isPlaying ? { rotate: [0, -16, 0, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 220px" }}
          >
            <circle cx="50" cy="220" r="9" fill="url(#bunnySkin)" stroke="#e9b3c4" strokeWidth="1.6" />
            {/* little finger lines */}
            <path d="M 47 217 q 3 -4 6 0" fill="none" stroke="#d99cb3" strokeWidth="0.9" />
          </motion.g>
        </motion.g>

        {/* ─── Right arm + gesturing hand ─── */}
        <motion.g
          animate={
            isPlaying
              ? { rotate: [2, -10, 4, 2] }
              : { rotate: [2, 0, 2] }
          }
          transition={{
            duration: isPlaying ? 3 : 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{ transformOrigin: "130px 178px" }}
        >
          <path
            d="M 144 178 Q 158 196 150 218"
            fill="none"
            stroke="url(#dressGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <motion.g
            key={`rh-${waveTrigger}`}
            animate={isPlaying ? { rotate: [0, 14, 0, 8, 0], y: [0, -3, 0] } : { rotate: 0, y: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{ transformOrigin: "150px 220px" }}
          >
            <circle cx="150" cy="220" r="9" fill="url(#bunnySkin)" stroke="#e9b3c4" strokeWidth="1.6" />
            <path d="M 147 217 q 3 -4 6 0" fill="none" stroke="#d99cb3" strokeWidth="0.9" />
          </motion.g>
        </motion.g>

        {/* ─── Head + ears (head sway / nod) ─── */}
        <motion.g
          animate={{
            rotate: sway,
            y: isPlaying ? [0, -1.5, 0, 1.5, 0] : [0, -1, 0],
          }}
          transition={{
            y: { duration: isPlaying ? 2.2 : 4.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 1.2, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "100px 130px" }}
        >
          {/* ears - back */}
          <ellipse cx="62" cy="48" rx="14" ry="34" fill="#fff5f6" stroke="#e9b3c4" strokeWidth="2" transform="rotate(-12 62 48)" />
          <ellipse cx="138" cy="48" rx="14" ry="34" fill="#fff5f6" stroke="#e9b3c4" strokeWidth="2" transform="rotate(12 138 48)" />
          {/* ears - inner pink (subtle wiggle when speaking) */}
          <motion.g
            animate={isPlaying ? { scaleY: [1, 1.04, 1] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 60px" }}
          >
            <ellipse cx="62" cy="52" rx="6" ry="22" fill="#ffc6d6" transform="rotate(-12 62 52)" />
            <ellipse cx="138" cy="52" rx="6" ry="22" fill="#ffc6d6" transform="rotate(12 138 52)" />
          </motion.g>

          {/* big pink bow on left ear */}
          <g transform="translate(54 28) rotate(-15)">
            <path d="M-12 0 Q -6 -10 0 0 Q -6 10 -12 0 Z" fill="url(#bowGrad)" />
            <path d="M12 0 Q 6 -10 0 0 Q 6 10 12 0 Z" fill="url(#bowGrad)" />
            <circle cx="0" cy="0" r="3" fill="#c5618a" />
          </g>

          {/* face */}
          <ellipse cx="100" cy="115" rx="50" ry="50" fill="url(#bunnySkin)" stroke="#e9b3c4" strokeWidth="2" />

          {/* cheeks */}
          <circle cx="74" cy="124" r="9" fill="url(#cheekBlush)" />
          <circle cx="126" cy="124" r="9" fill="url(#cheekBlush)" />

          {/* bangs / fringe */}
          <path
            d="M 56 102 Q 72 78 100 80 Q 128 78 144 102 Q 134 96 120 100 Q 110 96 100 102 Q 90 96 80 100 Q 66 96 56 102 Z"
            fill="url(#bangs)"
            stroke="#caa45a"
            strokeWidth="1.5"
          />
          <path d="M 70 96 Q 78 88 88 94" fill="none" stroke="#caa45a" strokeWidth="1.1" />
          <path d="M 115 94 Q 124 88 132 98" fill="none" stroke="#caa45a" strokeWidth="1.1" />

          {/* ─── Eyebrows (lift slightly per word) ─── */}
          <motion.g
            animate={{ y: isPlaying && isSpeakingWord ? -1.5 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <path d="M 76 105 Q 82 102 88 106" fill="none" stroke="#9a6a3a" strokeWidth="2" strokeLinecap="round" />
            <path d="M 124 105 Q 118 102 112 106" fill="none" stroke="#9a6a3a" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          {/* ─── Eyes (sparkly anime + blink) ─── */}
          <g>
            {blink ? (
              <>
                <path d="M 76 118 Q 84 122 92 118" fill="none" stroke="#5a3a4a" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M 124 118 Q 116 122 108 118" fill="none" stroke="#5a3a4a" strokeWidth="2.4" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* whites */}
                <ellipse cx="84" cy="120" rx="6.5" ry="8.5" fill="#fff" stroke="#5a3a4a" strokeWidth="1.4" />
                <ellipse cx="116" cy="120" rx="6.5" ry="8.5" fill="#fff" stroke="#5a3a4a" strokeWidth="1.4" />
                {/* iris */}
                <circle cx="84" cy="121" r="5" fill="url(#eyeShine)" />
                <circle cx="116" cy="121" r="5" fill="url(#eyeShine)" />
                {/* pupils */}
                <circle cx="84" cy="121.5" r="2.4" fill="#1a0c2c" />
                <circle cx="116" cy="121.5" r="2.4" fill="#1a0c2c" />
                {/* big shiny catchlights */}
                <circle cx="86" cy="118.5" r="1.8" fill="#fff" />
                <circle cx="118" cy="118.5" r="1.8" fill="#fff" />
                <circle cx="82.5" cy="123" r="0.9" fill="#fff" opacity="0.85" />
                <circle cx="114.5" cy="123" r="0.9" fill="#fff" opacity="0.85" />
              </>
            )}
          </g>

          {/* tiny nose */}
          <path d="M 98 130 Q 100 132 102 130" fill="none" stroke="#d99cb3" strokeWidth="1.4" strokeLinecap="round" />

          {/* ─── Mouth (viseme-driven) ─── */}
          <motion.g
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            style={{ transformOrigin: "100px 124px" }}
          >
            <motion.path
              key={viseme}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.08 }}
              d={mouth.d}
              fill={mouth.fill}
              stroke={mouth.stroke}
              strokeWidth={mouth.strokeWidth}
              strokeLinecap="round"
            />
            {/* tiny tongue when wide open */}
            {(viseme === "aa" || viseme === "oh") && (
              <ellipse cx="100" cy="127" rx="3.5" ry="1.6" fill="#e07a90" />
            )}
          </motion.g>
        </motion.g>

        {/* ─── Sparkles around the head when speaking ─── */}
        {isPlaying && (
          <motion.g
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 110px" }}
          >
            <path d="M 36 70 l 1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" fill="#ffd96b" />
            <path d="M 168 88 l 1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2 z" fill="#ffd96b" />
            <path d="M 30 142 l 1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z" fill="#d4b8e8" />
            <path d="M 174 150 l 1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z" fill="#c8e6c2" />
          </motion.g>
        )}

        {/* music notes when speaking */}
        {isPlaying && (
          <motion.g
            animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <text x="40" y="100" fontSize="14" fill="#f59ec0">♪</text>
          </motion.g>
        )}
        {isPlaying && (
          <motion.g
            animate={{ y: [0, -12, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <text x="155" y="110" fontSize="14" fill="#a08ad0">♫</text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
