import React from 'react';

export interface IllustrationProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const OnboardingProfileIllustration: React.FC<IllustrationProps> = ({
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
        {/* Ambient Soft Glow Filter */}
        <filter id="profileAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Specular Glint Filter */}
        <filter id="sheetGlint" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 3D Glass Sheet Base Gradient */}
        <linearGradient id="glassDocBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#f0f7ff" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#dbeafe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.75" />
        </linearGradient>

        {/* Prismatic Border Gradient */}
        <linearGradient id="prismaticBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#818cf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </linearGradient>

        {/* Floating Badge Gradient */}
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0047ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Ambient Radial Background Glow */}
        <radialGradient id="profileBackGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#eff6ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Celestial Glow */}
      <circle cx="170" cy="140" r="95" fill="url(#profileBackGlow)" filter="url(#profileAmbientGlow)" opacity="0.85" />

      {/* --- BACK SECONDARY GLASS CV CARD (Subtle Layer Depth) --- */}
      <g opacity="0.45" transform="translate(195, 125) rotate(10) translate(-195, -125)">
        <rect
          x="125"
          y="50"
          width="140"
          height="165"
          rx="16"
          fill="url(#glassDocBase)"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <rect x="145" y="70" width="60" height="8" rx="4" fill="#93c5fd" opacity="0.6" />
        <rect x="145" y="86" width="95" height="5" rx="2.5" fill="#cbd5e1" opacity="0.6" />
        <rect x="145" y="98" width="80" height="5" rx="2.5" fill="#cbd5e1" opacity="0.4" />
      </g>

      {/* --- PRIMARY 3D GLASS CV DOCUMENT SHEET --- */}
      <g filter="drop-shadow(0 18px 36px rgba(14, 165, 233, 0.22))" transform="translate(160, 135) rotate(-4) translate(-160, -135)">
        {/* Main Glass CV Surface */}
        <rect
          x="80"
          y="42"
          width="160"
          height="195"
          rx="18"
          fill="url(#glassDocBase)"
          stroke="url(#prismaticBorder)"
          strokeWidth="1.8"
        />

        {/* Specular Top-Edge Reflection Strip */}
        <path
          d="M84 56 C84 48 90 44 98 44 H222 C230 44 236 48 236 56 V60 H84 V56Z"
          fill="#ffffff"
          fillOpacity="0.45"
        />

        {/* 3D Glass Avatar Profile Pill */}
        <g transform="translate(100, 60)">
          {/* Avatar Ring */}
          <circle cx="16" cy="16" r="16" fill="#0038ff" fillOpacity="0.12" stroke="#0038ff" strokeWidth="1.8" />
          {/* Candidate Stylized Silhouette */}
          <circle cx="16" cy="11" r="5.5" fill="#0038ff" />
          <path d="M7 26 C7 20 11 18 16 18 C21 18 25 20 25 26" fill="#0038ff" />

          {/* Name & Role Glass Bars */}
          <rect x="42" y="6" width="65" height="8" rx="4" fill="#0038ff" />
          <rect x="42" y="18" width="45" height="5" rx="2.5" fill="#38bdf8" />
        </g>

        {/* Divider Glass Filament */}
        <line x1="98" y1="102" x2="222" y2="102" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />

        {/* 3D Visual Performance Charts / Metrics on CV */}
        <g transform="translate(98, 114)">
          {/* Section Label: "EXPERIENCE & IMPACT" */}
          <rect x="0" y="0" width="55" height="6" rx="3" fill="#0038ff" opacity="0.8" />

          {/* Mini Bar Chart Pillars */}
          <rect x="2" y="32" width="8" height="20" rx="3" fill="#0038ff" />
          <rect x="15" y="24" width="8" height="28" rx="3" fill="#0038ff" />
          <rect x="28" y="16" width="8" height="36" rx="3" fill="#38bdf8" />
          <rect x="41" y="22" width="8" height="30" rx="3" fill="#0038ff" />
          <rect x="54" y="12" width="8" height="40" rx="3" fill="#38bdf8" />
          <rect x="67" y="28" width="8" height="24" rx="3" fill="#0038ff" />

          {/* Baseline Trend Sparkline Curve */}
          <path
            d="M6 32 Q28 8 58 12 T71 28"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Skills Tag Pills on CV Bottom */}
        <g transform="translate(98, 185)">
          <rect x="0" y="0" width="36" height="13" rx="6.5" fill="#0038ff" fillOpacity="0.1" stroke="#0038ff" strokeWidth="0.9" />
          <rect x="5" y="4.5" width="26" height="4" rx="2" fill="#0038ff" />

          <rect x="42" y="0" width="42" height="13" rx="6.5" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="0.9" />
          <rect x="48" y="4.5" width="30" height="4" rx="2" fill="#0284c7" />

          <rect x="90" y="0" width="32" height="13" rx="6.5" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="0.9" />
          <rect x="96" y="4.5" width="20" height="4" rx="2" fill="#d97706" />
        </g>
      </g>

      {/* --- FLOATING 3D VERIFIED BADGE (Upper Right Depth) --- */}
      <g filter="drop-shadow(0 8px 20px rgba(0, 56, 255, 0.35))" transform="translate(216, 55)">
        {/* Outer Radiant Shield */}
        <circle cx="20" cy="20" r="22" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="2.2" />
        {/* Inner Luminous Ring */}
        <circle cx="20" cy="20" r="17" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
        {/* Verified Bold Checkmark */}
        <path
          d="M13 20.5 L17.5 25 L27 15"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* --- FLOATING 3D GLASS RATING PILL (Lower Left Depth) --- */}
      <g filter="drop-shadow(0 8px 18px rgba(15, 23, 42, 0.12))" transform="translate(42, 180) rotate(6)">
        <rect x="0" y="0" width="76" height="28" rx="14" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="7" fill="#10b981" />
        <path d="M11 14L13.5 16.5L17.5 11.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="27" y="11" width="38" height="6" rx="3" fill="#0038ff" />
      </g>

      {/* Floating Spatial Micro-Crystals & Refractions */}
      <g opacity="0.85">
        <polygon points="56,70 63,64 61,75" fill="#38bdf8" opacity="0.7" />
        <polygon points="280,185 288,192 282,198" fill="#f59e0b" opacity="0.8" />
        <circle cx="70" cy="130" r="3" fill="#818cf8" opacity="0.6" />
        <circle cx="275" cy="100" r="3.5" fill="#38bdf8" opacity="0.7" />
      </g>
    </svg>
  );
};
