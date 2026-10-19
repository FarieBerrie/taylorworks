export function Skyline() {
  return (
    <svg
      viewBox="0 0 1200 280"
      className="h-40 w-full text-primary sm:h-52"
      role="img"
      aria-label="Wide sky over a low Abilene street"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7eb4d4" />
          <stop offset="55%" stopColor="#f3d7b0" />
          <stop offset="100%" stopColor="#e7d3b4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="280" fill="url(#sky)" />
      <circle cx="980" cy="78" r="36" fill="#f4b46a" />
      <path d="M0 190 C 180 160 260 210 420 188 C 560 168 640 150 820 176 C 980 198 1080 160 1200 176 L 1200 280 L 0 280 Z" fill="#c4a27a" />
      <path d="M0 210 C 200 190 340 230 520 208 C 760 180 900 214 1200 200 L 1200 280 L 0 280 Z" fill="#8ea37a" />
      <g fill="#243246">
        <rect x="70" y="150" width="90" height="80" />
        <rect x="180" y="128" width="70" height="102" />
        <rect x="270" y="158" width="120" height="72" />
        <polygon points="270,158 330,124 390,158" />
        <rect x="430" y="140" width="54" height="90" />
        <rect x="500" y="164" width="140" height="66" />
        <rect x="680" y="132" width="46" height="98" />
        <rect x="746" y="156" width="110" height="74" />
        <rect x="760" y="118" width="16" height="40" />
        <circle cx="768" cy="112" r="10" />
      </g>
      <g fill="#f7f2e8" opacity="0.85">
        <rect x="86" y="168" width="16" height="18" />
        <rect x="114" y="168" width="16" height="18" />
        <rect x="196" y="146" width="14" height="16" />
        <rect x="218" y="146" width="14" height="16" />
        <rect x="196" y="172" width="14" height="16" />
        <rect x="218" y="172" width="14" height="16" />
        <rect x="292" y="176" width="22" height="28" />
        <rect x="446" y="156" width="12" height="14" />
        <rect x="466" y="156" width="12" height="14" />
      </g>
    </svg>
  );
}
