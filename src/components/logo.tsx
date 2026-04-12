export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bottom cube — teal */}
      <polygon points="6,24 16,29 26,24 16,19" fill="#0d9488" />
      <polygon points="6,24 16,29 16,25 6,20" fill="#0f766e" />
      <polygon points="26,24 16,29 16,25 26,20" fill="#14b8a6" />

      {/* Middle cube — amber */}
      <polygon points="6,18 16,23 26,18 16,13" fill="#f59e0b" />
      <polygon points="6,18 16,23 16,19 6,14" fill="#d97706" />
      <polygon points="26,18 16,23 16,19 26,14" fill="#fbbf24" />

      {/* Top cube — violet */}
      <polygon points="6,12 16,17 26,12 16,7" fill="#8b5cf6" />
      <polygon points="6,12 16,17 16,13 6,8" fill="#7c3aed" />
      <polygon points="26,12 16,17 16,13 26,8" fill="#a78bfa" />
    </svg>
  );
}
