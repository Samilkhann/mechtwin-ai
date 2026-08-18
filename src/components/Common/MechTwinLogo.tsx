/**
 * MECHTWIN AI - Custom Industrial Engineering Logo & Brand Mark
 * Combines: Mechanical Structure + Digital Twin Dual Symmetry + AI Nodes
 * Created & Engineered by Samil Khan
 */

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon-only' | 'compact' | 'hero';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const MechTwinLogo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  }[size];

  const descriptorSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 1. Geometric Twin Logo Mark: Mechanical Lattice + Twin Hex + AI Core */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]"
        >
          <defs>
            {/* Cyan to Electric Sky gradient */}
            <linearGradient id="mt-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Twin Secondary Gradient */}
            <linearGradient id="mt-twin-grad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Laser Core Gradient */}
            <radialGradient id="mt-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Structural Grid Lines */}
          <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="32" stroke="#0ea5e9" strokeOpacity="0.2" strokeWidth="1" />

          {/* Left Mechanical Twin Hexagon Shell */}
          <path
            d="M 50 14 L 22 30 L 22 62 L 50 78 L 50 68 L 30 56 L 30 36 L 50 24 Z"
            fill="url(#mt-cyan-grad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Digital Twin Hexagon Shell (Symmetrical Mirror) */}
          <path
            d="M 50 22 L 70 34 L 70 54 L 50 66 L 50 76 L 78 60 L 78 28 L 50 12 Z"
            fill="url(#mt-twin-grad)"
            stroke="#00e5ff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Central AI Quantum Core / Mechanical Shaft Axis */}
          <circle cx="50" cy="50" r="14" fill="url(#mt-core-glow)" />
          <polygon
            points="50,38 60,45 60,55 50,62 40,55 40,45"
            fill="#090d16"
            stroke="#00e5ff"
            strokeWidth="1.8"
          />

          {/* Precision Crosshair Ticks */}
          <line x1="50" y1="4" x2="50" y2="10" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="90" x2="50" y2="96" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="50" x2="10" y2="50" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="90" y1="50" x2="96" y2="50" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />

          {/* Central Neural Node */}
          <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
          <circle cx="50" cy="50" r="2" fill="#00e5ff" />
        </svg>
      </div>

      {/* 2. Wordmark Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-mono tracking-wider">
            <span className={`font-black text-slate-100 uppercase tracking-widest ${textSize}`}>
              MECHTWIN
            </span>
            <span className={`font-black text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40 text-[10px] tracking-normal font-sans shadow-sm shadow-cyan-950 ${textSize === 'text-2xl' ? 'text-xs' : 'text-[10px]'}`}>
              AI
            </span>
          </div>

          <span className={`font-mono text-slate-400 font-medium tracking-tight uppercase ${descriptorSize}`}>
            Intelligent Digital Twin Platform
          </span>

          {showTagline && (
            <span className="text-[11px] text-cyan-400/90 font-serif italic mt-0.5">
              &ldquo;Engineering Intelligence for Every Machine.&rdquo;
            </span>
          )}
        </div>
      )}
    </div>
  );
};
