export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bottom box — teal */}
      <rect
        x="4"
        y="18"
        width="14"
        height="11"
        rx="2.5"
        fill="#0d9488"
        stroke="#0f766e"
        strokeWidth="1"
      />
      {/* Right box — amber */}
      <rect
        x="15"
        y="12"
        width="14"
        height="11"
        rx="2.5"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="1"
      />
      {/* Top box — violet */}
      <rect
        x="6"
        y="3"
        width="14"
        height="11"
        rx="2.5"
        fill="#8b5cf6"
        stroke="#7c3aed"
        strokeWidth="1"
      />
    </svg>
  );
}
