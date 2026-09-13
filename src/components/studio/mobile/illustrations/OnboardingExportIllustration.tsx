import React from 'react';
import { IllustrationProps } from './OnboardingProfileIllustration';

export const OnboardingExportIllustration: React.FC<IllustrationProps> = ({
  width = '100%',
  height = '100%',
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Soft Ambient Sync Glow Filter */}
        <filter id="syncAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Sync Beam Glow */}
        <filter id="beamGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 3D Glass Base Gradient */}
        <linearGradient id="glassChassis" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#f0f7ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.65" />
        </linearGradient>

        {/* Laptop Display Dark Glass Gradient */}
        <linearGradient id="laptopDisplayGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Luminous Sync Beam Gradient */}
        <linearGradient id="syncBeamDataGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#0038ff" />
        </linearGradient>

        {/* Ambient Pulse Glow */}
        <radialGradient id="syncBackPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#eff6ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Celestial Glow */}
      <circle cx="170" cy="140" r="95" fill="url(#syncBackPulse)" filter="url(#syncAmbientGlow)" opacity="0.85" />

      {/* --- RIGHT: 3D GLASS LAPTOP WITH HIGH-CONTRAST QR CODE --- */}
      <g filter="drop-shadow(0 16px 32px rgba(15, 23, 42, 0.16))" transform="translate(195, 125) rotate(-2) translate(-195, -125)">
        {/* Laptop Display Outer Glass Lid */}
        <rect
          x="135"
          y="50"
          width="155"
          height="115"
          rx="14"
          fill="url(#glassChassis)"
          stroke="#ffffff"
          strokeWidth="2"
        />
        {/* Laptop Web Camera Jewel */}
        <circle cx="212" cy="56" r="2.2" fill="#0038ff" />

        {/* Inner Laptop Screen Area */}
        <rect
          x="143"
          y="63"
          width="139"
          height="94"
          rx="8"
          fill="url(#laptopDisplayGlass)"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />

        {/* App Title Bar on Laptop Screen */}
        <rect x="143" y="63" width="139" height="15" rx="8" fill="#1e293b" />
        <circle cx="151" cy="70.5" r="2" fill="#ef4444" opacity="0.8" />
        <circle cx="157" cy="70.5" r="2" fill="#eab308" opacity="0.8" />
        <circle cx="163" cy="70.5" r="2" fill="#22c55e" opacity="0.8" />
        <rect x="175" y="67" width="65" height="7" rx="3.5" fill="#334155" />

        {/* High-Contrast Luminous QR Code on Laptop Screen */}
        <g transform="translate(182, 82)">
          {/* QR White Backing Plate for Maximum Contrast */}
          <rect x="0" y="0" width="58" height="58" rx="7" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.2" />

          {/* Top-Left Finder */}
          <rect x="5" y="5" width="16" height="16" rx="3" fill="none" stroke="#0038ff" strokeWidth="2.5" />
          <rect x="9" y="9" width="8" height="8" rx="1.5" fill="#0038ff" />

          {/* Top-Right Finder */}
          <rect x="37" y="5" width="16" height="16" rx="3" fill="none" stroke="#0038ff" strokeWidth="2.5" />
          <rect x="41" y="9" width="8" height="8" rx="1.5" fill="#0038ff" />

          {/* Bottom-Left Finder */}
          <rect x="5" y="37" width="16" height="16" rx="3" fill="none" stroke="#0038ff" strokeWidth="2.5" />
          <rect x="9" y="41" width="8" height="8" rx="1.5" fill="#0038ff" />

          {/* QR Data Matrix Pixels */}
          <rect x="25" y="9" width="5" height="5" rx="1" fill="#0f172a" />
          <rect x="25" y="19" width="5" height="5" rx="1" fill="#0038ff" />
          <rect x="11" y="25" width="5" height="5" rx="1" fill="#0f172a" />
          <rect x="25" y="29" width="8" height="5" rx="1" fill="#0038ff" />
          <rect x="37" y="25" width="5" height="5" rx="1" fill="#0f172a" />
          <rect x="46" y="29" width="5" height="5" rx="1" fill="#0038ff" />
          <rect x="25" y="41" width="6" height="5" rx="1" fill="#0f172a" />
          <rect x="37" y="43" width="6" height="6" rx="1" fill="#0038ff" />
        </g>

        {/* Laptop Keyboard Base & Opening Lip */}
        <path
          d="M120 165H300L310 185C311 187 309 189 306 189H114C111 189 109 187 110 185L120 165Z"
          fill="url(#glassChassis)"
          stroke="#ffffff"
          strokeWidth="1.8"
        />
        {/* Trackpad */}
        <rect x="190" y="171" width="40" height="12" rx="3" fill="#cbd5e1" fillOpacity="0.4" stroke="#ffffff" strokeWidth="1" />
      </g>

      {/* --- LEFT: 3D FLOATING GLASS SMARTPHONE SCANNER --- */}
      <g filter="drop-shadow(0 14px 28px rgba(0, 56, 255, 0.22))" transform="translate(70, 150) rotate(8) translate(-70, -150)">
        {/* Phone Glass Body */}
        <rect
          x="35"
          y="85"
          width="68"
          height="125"
          rx="18"
          fill="#ffffff"
          stroke="#0038ff"
          strokeWidth="2.2"
        />
        {/* Inner Phone Display Screen */}
        <rect
          x="40"
          y="92"
          width="58"
          height="111"
          rx="14"
          fill="#0f172a"
        />

        {/* Camera Reticle / Scanner Viewfinder Targeting the Laptop QR */}
        <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
          <path d="M48 115H54M48 115V121" />
          <path d="M90 115H84M90 115V121" />
          <path d="M48 165H54M48 165V159" />
          <path d="M90 165H84M90 165V159" />
          {/* Active Cyan Scanning Line */}
          <line x1="48" y1="140" x2="90" y2="140" stroke="#38bdf8" strokeWidth="2.2" />
        </g>

        {/* Phone Home Pill Indicator */}
        <rect x="56" y="197" width="26" height="3" rx="1.5" fill="#ffffff" opacity="0.8" />
      </g>

      {/* --- CENTER: LUMINOUS 3D SYNC WAVE & ATS PDF BADGE --- */}
      <g filter="url(#beamGlow)">
        {/* Dynamic Curved Sync Stream */}
        <path
          d="M95 145 C120 125 140 120 178 110"
          stroke="url(#syncBeamDataGrad)"
          strokeWidth="3"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      </g>

      {/* Floating 3D ATS PDF Master Document Stamp */}
      <g filter="drop-shadow(0 8px 20px rgba(0, 56, 255, 0.35))" transform="translate(108, 92) rotate(-6)">
        <rect x="0" y="0" width="76" height="38" rx="10" fill="#0038ff" stroke="#ffffff" strokeWidth="1.8" />
        {/* Mini Document Icon */}
        <rect x="9" y="8" width="13" height="20" rx="2" fill="#ffffff" />
        <rect x="12" y="12" width="7" height="2" fill="#0038ff" />
        <rect x="12" y="16" width="7" height="2" fill="#38bdf8" />
        <rect x="12" y="20" width="5" height="2" fill="#0038ff" />
        {/* Stamp Text */}
        <text x="28" y="19" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">ATS PDF</text>
        <text x="28" y="28" fill="#38bdf8" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">100% SYNC</text>
      </g>

      {/* Floating Spatial Micro-Crystals */}
      <g opacity="0.8">
        <polygon points="50,65 58,58 55,70" fill="#38bdf8" opacity="0.7" />
        <polygon points="285,65 295,74 282,78" fill="#0038ff" opacity="0.7" />
        <polygon points="290,195 300,205 288,210" fill="#f59e0b" opacity="0.8" />
      </g>
    </svg>
  );
};
