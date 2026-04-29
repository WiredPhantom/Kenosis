interface KawaiiMascotProps {
  className?: string;
  size?: number;
}

/**
 * A tiny pastel bunny librarian mascot — holding a little book.
 * SVG only, no external assets.
 */
export default function KawaiiMascot({ className = "", size = 120 }: KawaiiMascotProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * (220 / 200)}
      className={className}
      role="img"
      aria-label="Lumi the bunny librarian"
    >
      <defs>
        <radialGradient id="cheekGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffb1c8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffb1c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bowGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f59ec0" />
          <stop offset="100%" stopColor="#e07ba6" />
        </linearGradient>
        <linearGradient id="bookGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c8e6c2" />
          <stop offset="100%" stopColor="#9ed1a8" />
        </linearGradient>
      </defs>

      {/* Soft halo */}
      <ellipse cx="100" cy="200" rx="64" ry="9" fill="#f4a3bf" opacity="0.18" />

      {/* Ears - back fill */}
      <ellipse cx="62" cy="40" rx="14" ry="34" fill="#fff5f6" stroke="#e9b3c4" strokeWidth="2" transform="rotate(-12 62 40)" />
      <ellipse cx="138" cy="40" rx="14" ry="34" fill="#fff5f6" stroke="#e9b3c4" strokeWidth="2" transform="rotate(12 138 40)" />
      {/* Ear inner pink */}
      <ellipse cx="62" cy="44" rx="6" ry="22" fill="#ffc6d6" transform="rotate(-12 62 44)" />
      <ellipse cx="138" cy="44" rx="6" ry="22" fill="#ffc6d6" transform="rotate(12 138 44)" />

      {/* Body / dress */}
      <path
        d="M55 165 Q 100 145 145 165 L 152 205 Q 100 218 48 205 Z"
        fill="#fff5f6"
        stroke="#e9b3c4"
        strokeWidth="2"
      />
      {/* Apron */}
      <path d="M82 158 L 118 158 L 122 205 L 78 205 Z" fill="#ffe9ee" stroke="#e9b3c4" strokeWidth="1.5" opacity="0.95" />

      {/* Head */}
      <ellipse cx="100" cy="105" rx="58" ry="55" fill="#fffafb" stroke="#e9b3c4" strokeWidth="2.5" />

      {/* Cheeks */}
      <circle cx="68" cy="118" r="11" fill="url(#cheekGrad)" />
      <circle cx="132" cy="118" r="11" fill="url(#cheekGrad)" />

      {/* Bangs / fringe */}
      <path
        d="M52 92 Q 70 70 100 72 Q 130 70 148 92 Q 138 86 122 90 Q 110 86 100 92 Q 90 86 78 90 Q 62 86 52 92 Z"
        fill="#fff0c8"
        stroke="#e3c388"
        strokeWidth="1.5"
      />
      <path d="M70 88 Q 78 80 88 86" fill="none" stroke="#e3c388" strokeWidth="1.2" />
      <path d="M115 86 Q 124 80 134 90" fill="none" stroke="#e3c388" strokeWidth="1.2" />

      {/* Eyes - closed kawaii style ^_^ */}
      <path d="M76 112 Q 82 105 88 112" fill="none" stroke="#5a3a4a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M112 112 Q 118 105 124 112" fill="none" stroke="#5a3a4a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Tiny mouth ω */}
      <path d="M94 130 Q 97 134 100 131 Q 103 134 106 130" fill="none" stroke="#5a3a4a" strokeWidth="1.8" strokeLinecap="round" />

      {/* Pink bow on left ear */}
      <g transform="translate(54 18) rotate(-15)">
        <path d="M-10 0 Q -5 -8 0 0 Q -5 8 -10 0 Z" fill="url(#bowGrad)" />
        <path d="M10 0 Q 5 -8 0 0 Q 5 8 10 0 Z" fill="url(#bowGrad)" />
        <circle cx="0" cy="0" r="2.6" fill="#c5618a" />
      </g>

      {/* Tiny book in arms */}
      <g transform="translate(85 168) rotate(-8)">
        <rect x="0" y="0" width="34" height="24" rx="2" fill="url(#bookGrad)" stroke="#6a8a6e" strokeWidth="1.2" />
        <line x1="17" y1="2" x2="17" y2="22" stroke="#6a8a6e" strokeWidth="1" />
        <line x1="4" y1="7" x2="14" y2="7" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
        <line x1="4" y1="11" x2="14" y2="11" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
        <line x1="20" y1="7" x2="30" y2="7" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
        <line x1="20" y1="11" x2="30" y2="11" stroke="#fff" strokeWidth="0.8" opacity="0.7" />
      </g>

      {/* Sparkles */}
      <g fill="#ffd96b" opacity="0.85">
        <path d="M30 70 l1.5 3 3 1.5-3 1.5L30 80l-1.5-3-3-1.5 3-1.5z" />
        <path d="M170 90 l1.2 2.4 2.4 1.2-2.4 1.2L170 97.2l-1.2-2.4-2.4-1.2 2.4-1.2z" />
        <path d="M40 175 l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      </g>
    </svg>
  );
}
