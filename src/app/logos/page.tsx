import { Logo } from "@/components/logo";

function LogoCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col items-center gap-4">
      <div className="flex items-center justify-center size-32">{children}</div>
      <div className="flex items-center gap-3">
        <div className="size-8">{children}</div>
        <span className="text-lg font-semibold">The Stuff</span>
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function CurrentLogo() {
  return <Logo className="size-full" />;
}

function GlitchBoxes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="glitch">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#glitch)">
        <rect x="4" y="18" width="14" height="11" rx="2" fill="#0d9488" />
        <rect x="15" y="12" width="14" height="11" rx="2" fill="#f59e0b" />
        <rect x="6" y="3" width="14" height="11" rx="2" fill="#8b5cf6" />
      </g>
      <rect x="3" y="17" width="6" height="1.5" rx="0.5" fill="#ff0040" opacity="0.6" />
      <rect x="18" y="8" width="8" height="1.5" rx="0.5" fill="#00ffff" opacity="0.5" />
      <rect x="8" y="25" width="5" height="1.5" rx="0.5" fill="#ff0040" opacity="0.4" />
    </svg>
  );
}

function TerminalStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="2" width="28" height="28" rx="4" fill="#1a1a2e" stroke="#333" strokeWidth="1" />
      <rect x="2" y="2" width="28" height="7" rx="4" fill="#16213e" />
      <rect x="2" y="5" width="28" height="4" fill="#16213e" />
      <circle cx="6" cy="5.5" r="1.2" fill="#ff5f57" />
      <circle cx="10" cy="5.5" r="1.2" fill="#febc2e" />
      <circle cx="14" cy="5.5" r="1.2" fill="#28c840" />
      <text x="5" y="15" fontFamily="monospace" fontSize="4" fill="#0d9488" fontWeight="bold">&gt;_</text>
      <rect x="5" y="17" width="10" height="3" rx="1" fill="#8b5cf6" opacity="0.8" />
      <rect x="7" y="21" width="14" height="3" rx="1" fill="#f59e0b" opacity="0.8" />
      <rect x="5" y="25" width="18" height="3" rx="1" fill="#0d9488" opacity="0.8" />
    </svg>
  );
}

function CurlyBraceStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="2" y="26" fontFamily="monospace" fontSize="28" fontWeight="bold" fill="#8b5cf6" opacity="0.3">{"{"}</text>
      <text x="20" y="26" fontFamily="monospace" fontSize="28" fontWeight="bold" fill="#8b5cf6" opacity="0.3">{"}"}</text>
      <rect x="9" y="7" width="14" height="4" rx="1.5" fill="#8b5cf6" />
      <rect x="9" y="14" width="14" height="4" rx="1.5" fill="#f59e0b" />
      <rect x="9" y="21" width="14" height="4" rx="1.5" fill="#0d9488" />
    </svg>
  );
}

function NeonBoxes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="neon-teal">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-amber">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-violet">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="4" y="18" width="14" height="11" rx="2.5" fill="none" stroke="#0d9488" strokeWidth="1.5" filter="url(#neon-teal)" />
      <rect x="15" y="12" width="14" height="11" rx="2.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" filter="url(#neon-amber)" />
      <rect x="6" y="3" width="14" height="11" rx="2.5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" filter="url(#neon-violet)" />
    </svg>
  );
}

function PixelCubes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bottom cube - teal */}
      <polygon points="6,24 16,29 26,24 16,19" fill="#0d9488" />
      <polygon points="6,24 16,29 16,25 6,20" fill="#0f766e" />
      <polygon points="26,24 16,29 16,25 26,20" fill="#14b8a6" />

      {/* Middle cube - amber */}
      <polygon points="6,18 16,23 26,18 16,13" fill="#f59e0b" />
      <polygon points="6,18 16,23 16,19 6,14" fill="#d97706" />
      <polygon points="26,18 16,23 16,19 26,14" fill="#fbbf24" />

      {/* Top cube - violet */}
      <polygon points="6,12 16,17 26,12 16,7" fill="#8b5cf6" />
      <polygon points="6,12 16,17 16,13 6,8" fill="#7c3aed" />
      <polygon points="26,12 16,17 16,13 26,8" fill="#a78bfa" />
    </svg>
  );
}

function CircuitStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Circuit traces */}
      <line x1="2" y1="8" x2="7" y2="8" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="8" x2="30" y2="8" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="16" x2="7" y2="16" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="16" x2="30" y2="16" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="24" x2="7" y2="24" stroke="#0d9488" strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="24" x2="30" y2="24" stroke="#0d9488" strokeWidth="1" opacity="0.5" />
      {/* Connection dots */}
      <circle cx="2" cy="8" r="1" fill="#8b5cf6" />
      <circle cx="30" cy="8" r="1" fill="#8b5cf6" />
      <circle cx="2" cy="16" r="1" fill="#f59e0b" />
      <circle cx="30" cy="16" r="1" fill="#f59e0b" />
      <circle cx="2" cy="24" r="1" fill="#0d9488" />
      <circle cx="30" cy="24" r="1" fill="#0d9488" />
      {/* Chip boxes */}
      <rect x="7" y="3" width="18" height="10" rx="2" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="0.8" />
      <rect x="7" y="11" width="18" height="10" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
      <rect x="7" y="19" width="18" height="10" rx="2" fill="#0d9488" stroke="#0f766e" strokeWidth="0.8" />
      {/* Chip details */}
      <rect x="10" y="5.5" width="4" height="1" rx="0.5" fill="white" opacity="0.4" />
      <rect x="10" y="7.5" width="6" height="1" rx="0.5" fill="white" opacity="0.3" />
      <rect x="10" y="13.5" width="4" height="1" rx="0.5" fill="white" opacity="0.4" />
      <rect x="10" y="15.5" width="6" height="1" rx="0.5" fill="white" opacity="0.3" />
      <rect x="10" y="21.5" width="4" height="1" rx="0.5" fill="white" opacity="0.4" />
      <rect x="10" y="23.5" width="6" height="1" rx="0.5" fill="white" opacity="0.3" />
    </svg>
  );
}

function MatrixStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#0a0a0a" />
      {/* Falling characters */}
      <text x="4" y="8" fontFamily="monospace" fontSize="3.5" fill="#0d9488" opacity="0.3">01</text>
      <text x="14" y="6" fontFamily="monospace" fontSize="3.5" fill="#0d9488" opacity="0.2">10</text>
      <text x="24" y="9" fontFamily="monospace" fontSize="3.5" fill="#0d9488" opacity="0.25">11</text>
      <text x="8" y="11" fontFamily="monospace" fontSize="3.5" fill="#0d9488" opacity="0.15">00</text>
      {/* Stack items */}
      <rect x="6" y="13" width="20" height="4" rx="1" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
      <text x="8" y="16.2" fontFamily="monospace" fontSize="3" fill="#8b5cf6">task_01</text>
      <rect x="6" y="18.5" width="20" height="4" rx="1" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
      <text x="8" y="21.7" fontFamily="monospace" fontSize="3" fill="#f59e0b">task_02</text>
      <rect x="6" y="24" width="20" height="4" rx="1" fill="none" stroke="#0d9488" strokeWidth="0.8" />
      <text x="8" y="27.2" fontFamily="monospace" fontSize="3" fill="#0d9488">task_03</text>
    </svg>
  );
}

function HexStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top hexagon - violet */}
      <polygon points="16,2 23,6 23,13 16,17 9,13 9,6" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="0.8" />
      {/* Bottom left hexagon - teal */}
      <polygon points="10,15 17,19 17,26 10,30 3,26 3,19" fill="#0d9488" stroke="#0f766e" strokeWidth="0.8" />
      {/* Bottom right hexagon - amber */}
      <polygon points="22,15 29,19 29,26 22,30 15,26 15,19" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
    </svg>
  );
}

function BracketStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Square bracket left */}
      <path d="M5 3 L3 3 L3 29 L5 29" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Square bracket right */}
      <path d="M27 3 L29 3 L29 29 L27 29" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Stacked bars */}
      <rect x="7" y="5" width="18" height="5" rx="1.5" fill="#8b5cf6" />
      <rect x="7" y="13.5" width="18" height="5" rx="1.5" fill="#f59e0b" />
      <rect x="7" y="22" width="18" height="5" rx="1.5" fill="#0d9488" />
      {/* Comma */}
      <text x="14" y="13" fontFamily="monospace" fontSize="4" fill="#777">,</text>
      <text x="14" y="21.5" fontFamily="monospace" fontSize="4" fill="#777">,</text>
    </svg>
  );
}

function RetroStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shadow */}
      <rect x="5" y="5" width="24" height="24" rx="2" fill="#000" opacity="0.15" />
      {/* Background */}
      <rect x="3" y="3" width="24" height="24" rx="2" fill="#1a1a2e" stroke="#333" strokeWidth="0.5" />
      {/* Scanlines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="3" y1={5 + i * 2} x2="27" y2={5 + i * 2} stroke="white" strokeWidth="0.3" opacity="0.05" />
      ))}
      {/* Stacked items with retro colors */}
      <rect x="6" y="6" width="8" height="6" rx="1" fill="#e040fb" opacity="0.9" />
      <rect x="16" y="6" width="8" height="6" rx="1" fill="#00e5ff" opacity="0.9" />
      <rect x="6" y="14" width="8" height="6" rx="1" fill="#76ff03" opacity="0.9" />
      <rect x="16" y="14" width="8" height="6" rx="1" fill="#ffea00" opacity="0.9" />
      <rect x="6" y="22" width="18" height="3" rx="1" fill="#ff1744" opacity="0.8" />
    </svg>
  );
}

function StackOverflow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shadow layers creating depth */}
      <rect x="8" y="22" width="16" height="3" rx="1" fill="#0d9488" opacity="0.3" />
      <rect x="7" y="20" width="16" height="3" rx="1" fill="#0d9488" opacity="0.4" />
      <rect x="6" y="18" width="16" height="3" rx="1" fill="#0d9488" opacity="0.6" />
      <rect x="5" y="16" width="16" height="3" rx="1" fill="#0d9488" />

      <rect x="13" y="14" width="16" height="3" rx="1" fill="#f59e0b" opacity="0.4" />
      <rect x="12" y="12" width="16" height="3" rx="1" fill="#f59e0b" opacity="0.6" />
      <rect x="11" y="10" width="16" height="3" rx="1" fill="#f59e0b" />

      <rect x="8" y="6" width="16" height="3" rx="1" fill="#8b5cf6" opacity="0.5" />
      <rect x="7" y="4" width="16" height="3" rx="1" fill="#8b5cf6" />
    </svg>
  );
}

function DiamondStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Three rotated squares stacked */}
      <g transform="translate(16, 24) rotate(45)">
        <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#0d9488" stroke="#0f766e" strokeWidth="0.8" />
      </g>
      <g transform="translate(16, 16) rotate(45)">
        <rect x="-5.5" y="-5.5" width="11" height="11" rx="1.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
      </g>
      <g transform="translate(16, 8) rotate(45)">
        <rect x="-5" y="-5" width="10" height="10" rx="1.5" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

function AsciiLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="3" fill="#0f0f0f" />
      <text x="4" y="8" fontFamily="monospace" fontSize="3.2" fill="#8b5cf6" fontWeight="bold">┌───┐</text>
      <text x="4" y="12" fontFamily="monospace" fontSize="3.2" fill="#8b5cf6" fontWeight="bold">│ S │</text>
      <text x="4" y="16" fontFamily="monospace" fontSize="3.2" fill="#f59e0b" fontWeight="bold">├───┤</text>
      <text x="4" y="20" fontFamily="monospace" fontSize="3.2" fill="#f59e0b" fontWeight="bold">│ T │</text>
      <text x="4" y="24" fontFamily="monospace" fontSize="3.2" fill="#0d9488" fontWeight="bold">├───┤</text>
      <text x="4" y="28" fontFamily="monospace" fontSize="3.2" fill="#0d9488" fontWeight="bold">└───┘</text>
    </svg>
  );
}

export default function LogosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Logo Proposals</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Fun, creative, and a little hackerish — pick your favorite!
          </p>
        </div>

        {/* Current logo for reference */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Current Logo
          </h2>
          <div className="grid grid-cols-1 max-w-xs">
            <LogoCard title="Stacked Boxes" description="Current logo — three overlapping colored boxes">
              <CurrentLogo />
            </LogoCard>
          </div>
        </div>

        {/* New proposals */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Proposals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LogoCard
            title="Glitch Boxes"
            description="Current boxes with a cyberpunk glitch effect — digital artifact vibes"
          >
            <GlitchBoxes className="size-full" />
          </LogoCard>

          <LogoCard
            title="Terminal Stack"
            description="A terminal window with stacked task bars — dev-centric and hackerish"
          >
            <TerminalStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Curly Brace Stack"
            description="Code braces wrapping stacked items — the stuff lives in your codebase"
          >
            <CurlyBraceStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Neon Wireframe"
            description="Glowing neon outlines of the stacked boxes — retro cyberpunk feel"
          >
            <NeonBoxes className="size-full" />
          </LogoCard>

          <LogoCard
            title="Isometric Cubes"
            description="3D isometric stacked cubes — depth and dimension like a game engine"
          >
            <PixelCubes className="size-full" />
          </LogoCard>

          <LogoCard
            title="Circuit Chips"
            description="Stacked circuit board chips with traces — hardware meets software"
          >
            <CircuitStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Matrix Tasks"
            description="Dark terminal with code rain and task entries — hacker aesthetic"
          >
            <MatrixStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Hex Cluster"
            description="Honeycomb hexagons in the signature colors — organic and modular"
          >
            <HexStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Array Literal"
            description="Square brackets with comma-separated blocks — it's literally an array of stuff"
          >
            <BracketStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Retro CRT Grid"
            description="Old-school CRT display with colorful grid blocks and scanlines"
          >
            <RetroStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="Cascading Layers"
            description="Stacked layers with depth shadows — stuff piling up elegantly"
          >
            <StackOverflow className="size-full" />
          </LogoCard>

          <LogoCard
            title="Diamond Stack"
            description="Rotated squares stacked vertically — playful geometric twist"
          >
            <DiamondStack className="size-full" />
          </LogoCard>

          <LogoCard
            title="ASCII Box"
            description="Terminal box-drawing characters spelling S-T — pure hacker aesthetic"
          >
            <AsciiLogo className="size-full" />
          </LogoCard>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All logos use the signature color palette: violet, amber, and teal.</p>
          <p className="mt-1">
            <a href="/" className="underline hover:text-foreground">
              ← Back to The Stuff
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
