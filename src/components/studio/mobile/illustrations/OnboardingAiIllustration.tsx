import React from 'react';
import { IllustrationProps } from './OnboardingProfileIllustration';

export const OnboardingAiIllustration: React.FC<IllustrationProps> = ({
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
        {/* Soft Ambient Core Glow Filter */}
        <filter id="aiCoreGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Specular Glint Filter */}
        <filter id="aiGlint" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Luminous Golden / Amber Heart Core */}
        <radialGradient id="aiGoldenCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        {/* 3D Glass Card Gradient */}
        <linearGradient id="vacancyGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#f0f7ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.65" />
        </linearGradient>

        {/* AI Crystal Facet Gradient A (Cyan to Royal Blue) */}
        <linearGradient id="aiFacetA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0038ff" stopOpacity="0.85" />
        </linearGradient>

        {/* AI Crystal Facet Gradient B (Amber to Rose) */}
        <linearGradient id="aiFacetB" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.75" />
        </linearGradient>

        {/* AI Crystal Facet Gradient C (Pure Refraction Ice) */}
        <linearGradient id="aiFacetC" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.85" />
        </linearGradient>

        {/* Chrome Torus Ring Gradient */}
        <linearGradient id="chromeOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#64748b" stopOpacity="0.4" />
          <stop offset="85%" stopColor="#0038ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>

        {/* ATS Score 98% Pill Gradient */}
        <linearGradient id="scorePillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0038ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Ambient Celestial Glow */}
      <circle cx="170" cy="140" r="90" fill="url(#aiGoldenCore)" filter="url(#aiCoreGlow)" opacity="0.85" />

      {/* --- LEFT: 3D FLOATING GLASS TARGET JOB VACANCY CARD --- */}
      <g filter="drop-shadow(0 14px 28px rgba(15, 23, 42, 0.14))" transform="translate(85, 135) rotate(-8) translate(-85, -135)">
        <rect
          x="35"
          y="65"
          width="105"
          height="145"
          rx="16"
          fill="url(#vacancyGlassGrad)"
          stroke="#ffffff"
          strokeWidth="1.6"
        />
        {/* Card Header: "JOB OFFER" Badge */}
        <rect x="47" y="78" width="54" height="7" rx="3.5" fill="#0038ff" opacity="0.8" />
        <circle cx="122" cy="81.5" r="3" fill="#38bdf8" />

        {/* Matched ATS Keyword Chips */}
        <rect x="47" y="98" width="80" height="14" rx="7" fill="#0038ff" fillOpacity="0.08" stroke="#0038ff" strokeWidth="0.8" />
        <circle cx="55" cy="105" r="3" fill="#10b981" />
        <rect x="62" y="103" width="55" height="4" rx="2" fill="#0038ff" />

        <rect x="47" y="118" width="70" height="14" rx="7" fill="#38bdf8" fillOpacity="0.12" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="55" cy="125" r="3" fill="#0038ff" />
        <rect x="62" y="123" width="45" height="4" rx="2" fill="#0284c7" />

        <rect x="47" y="138" width="80" height="14" rx="7" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="0.8" />
        <circle cx="55" cy="145" r="3" fill="#f59e0b" />
        <rect x="62" y="143" width="58" height="4" rx="2" fill="#d97706" />

        {/* Bottom Placeholder */}
        <rect x="47" y="165" width="55" height="6" rx="3" fill="#94a3b8" opacity="0.5" />
      </g>

      {/* --- CONNECTING CALIBRATION BEAM (Vacancy to AI Nexus) --- */}
      <path
        d="M125 130 C145 125 155 135 170 140"
        stroke="url(#aiFacetA)"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* --- CHROME ORBIT RING (Back Half) --- */}
      <ellipse
        cx="180"
        cy="138"
        rx="82"
        ry="34"
        fill="none"
        stroke="url(#chromeOrbit)"
        strokeWidth="3"
        strokeDasharray="130 160"
        transform="rotate(-15 180 138)"
        opacity="0.75"
      />

      {/* --- CENTER: FACETED AI CRYSTAL DIAMOND STARBURST --- */}
      <g filter="drop-shadow(0 14px 28px rgba(0, 56, 255, 0.25))">
        {/* Top Crystal Apex */}
        <polygon points="180,68 162,118 198,118" fill="url(#aiFacetC)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="180,68 198,118 180,138" fill="url(#aiFacetA)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Top-Right Facets */}
        <polygon points="234,94 198,118 206,152" fill="url(#aiFacetB)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="234,94 180,138 198,118" fill="url(#aiFacetC)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Right Facets */}
        <polygon points="248,140 206,152 195,176" fill="url(#aiFacetA)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="248,140 180,138 206,152" fill="url(#aiFacetB)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Bottom-Right Facets */}
        <polygon points="214,204 195,176 162,182" fill="url(#aiFacetC)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="214,204 180,138 195,176" fill="url(#aiFacetA)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Bottom Apex */}
        <polygon points="180,218 162,182 145,176" fill="url(#aiFacetB)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="180,218 180,138 162,182" fill="url(#aiFacetC)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Left Facets */}
        <polygon points="130,200 145,176 135,145" fill="url(#aiFacetA)" stroke="#ffffff" strokeWidth="1" />
        <polygon points="130,200 180,138 145,176" fill="url(#aiFacetB)" stroke="#ffffff" strokeWidth="0.8" />

        {/* Center Brilliant Core Diamond */}
        <polygon points="180,120 194,134 180,146 166,134" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.2" />
        <circle cx="180" cy="134" r="5" fill="#ffffff" />
      </g>

      {/* --- CHROME ORBIT RING (Front Half) --- */}
      <ellipse
        cx="180"
        cy="138"
        rx="82"
        ry="34"
        fill="none"
        stroke="url(#chromeOrbit)"
        strokeWidth="3"
        strokeDasharray="160 130"
        transform="rotate(-15 180 138)"
        opacity="0.95"
      />

      {/* --- RIGHT: FLOATING 3D GLASS ATS 98% MATCH BADGE --- */}
      <g filter="drop-shadow(0 10px 24px rgba(0, 56, 255, 0.35))" transform="translate(205, 145) rotate(4)">
        {/* Pill Outer Glass Container */}
        <rect x="0" y="0" width="88" height="38" rx="19" fill="url(#scorePillGrad)" stroke="#ffffff" strokeWidth="1.8" />
        {/* Trend Up Icon */}
        <circle cx="20" cy="19" r="10" fill="#ffffff" fillOpacity="0.2" />
        <path d="M15 22L18.5 16L22.5 19.5L26 14" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* ATS Score 98% Text */}
        <text x="36" y="24" fill="#ffffff" fontSize="14" fontWeight="800" fontFamily="sans-serif">98%</text>
      </g>

      {/* Floating Spatial Micro-Crystals & Starbursts */}
      <g opacity="0.8">
        <polygon points="262,75 272,85 260,90" fill="url(#aiFacetA)" stroke="#ffffff" strokeWidth="0.8" />
        <polygon points="105,70 114,80 102,84" fill="url(#aiFacetB)" stroke="#ffffff" strokeWidth="0.8" />
        <polygon points="270,195 280,205 268,210" fill="url(#aiFacetC)" stroke="#ffffff" strokeWidth="0.8" />
        <path d="M180 115V153M161 134H199" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      </g>
    </svg>
  );
};
