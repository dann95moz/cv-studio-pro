/**
 * Curated Professional Palettes for CV Studio Pro.
 * CRITICAL RULE: These palettes are applied to accents, headers, sidebars, badges, tags and lines.
 * Body text ALWAYS remains deep charcoal/black (#0f172a / #1e293b / #000000)
 * to guarantee 100% ATS readability and optimal contrast.
 */

import { PaletteId } from '../types/cv';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  accentLight: string;
  accentBorder: string;
  accentHover: string;
  headerBg: string;
  sidebarBg: string;
  badgeBg: string;
  badgeText: string;
  previewColor: string;
}

export function hexToRgba(hex: string, alpha = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(29, 78, 216, ${alpha})`;
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
    return `rgba(29, 78, 216, ${alpha})`;
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createCustomPalette(hexColor: string): PaletteConfig {
  const clean = hexColor?.trim() || '#1d4ed8';
  const primary = clean.startsWith('#') ? clean : `#${clean}`;
  return {
    id: 'custom',
    name: 'Custom Brand Color',
    description: 'Bespoke custom hex color code selected by user',
    primaryColor: primary,
    accentColor: primary,
    accentLight: hexToRgba(primary, 0.08),
    accentBorder: hexToRgba(primary, 0.24),
    accentHover: hexToRgba(primary, 0.85),
    headerBg: primary,
    sidebarBg: primary,
    badgeBg: hexToRgba(primary, 0.09),
    badgeText: primary,
    previewColor: primary,
  };
}

export const CURATED_PALETTES: Record<Exclude<PaletteId, 'custom'>, PaletteConfig> = {
  'corporate-blue': {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Trusted executive standard for tech, engineering & enterprise',
    primaryColor: '#1d4ed8',
    accentColor: '#1d4ed8', // Royal / Cobalt Blue
    accentLight: 'rgba(29, 78, 216, 0.08)',
    accentBorder: 'rgba(29, 78, 216, 0.22)',
    accentHover: '#1e40af',
    headerBg: '#1e3a5f',
    sidebarBg: '#1e3a5f',
    badgeBg: '#eff6ff',
    badgeText: '#1e40af',
    previewColor: '#2563eb',
  },
  'accent-teal': {
    id: 'accent-teal',
    name: 'Accent Teal',
    description: 'Modern, fresh & dynamic for fintech, product & growth',
    primaryColor: '#0f766e',
    accentColor: '#0f766e', // Deep Emerald Teal
    accentLight: 'rgba(15, 118, 110, 0.08)',
    accentBorder: 'rgba(15, 118, 110, 0.22)',
    accentHover: '#115e59',
    headerBg: '#0f4c47',
    sidebarBg: '#0f4c47',
    badgeBg: '#f0fdfa',
    badgeText: '#0f766e',
    previewColor: '#0d9488',
  },
  'editorial-black': {
    id: 'editorial-black',
    name: 'Editorial Black',
    description: 'High-contrast monochrome, understated, timeless & 100% ATS clean',
    primaryColor: '#0f172a',
    accentColor: '#0f172a', // Deep Onyx
    accentLight: 'rgba(15, 23, 42, 0.06)',
    accentBorder: 'rgba(15, 23, 42, 0.2)',
    accentHover: '#1e293b',
    headerBg: '#0f172a',
    sidebarBg: '#0f172a',
    badgeBg: '#f8fafc',
    badgeText: '#0f172a',
    previewColor: '#0f172a',
  },
  'minimal-slate': {
    id: 'minimal-slate',
    name: 'Minimal Slate',
    description: 'Refined and subtle with cool steel grayscale balance',
    primaryColor: '#475569',
    accentColor: '#475569', // Slate Steel
    accentLight: 'rgba(71, 85, 105, 0.08)',
    accentBorder: 'rgba(71, 85, 105, 0.2)',
    accentHover: '#334155',
    headerBg: '#334155',
    sidebarBg: '#334155',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    previewColor: '#64748b',
  },
  'modern-indigo': {
    id: 'modern-indigo',
    name: 'Modern Indigo',
    description: 'Linear & Stripe inspired, engineered for software and startups',
    primaryColor: '#4338ca',
    accentColor: '#4338ca', // Deep Indigo
    accentLight: 'rgba(67, 56, 202, 0.08)',
    accentBorder: 'rgba(67, 56, 202, 0.22)',
    accentHover: '#3730a3',
    headerBg: '#312e81',
    sidebarBg: '#312e81',
    badgeBg: '#eef2ff',
    badgeText: '#4338ca',
    previewColor: '#6366f1',
  },
  'executive-burgundy': {
    id: 'executive-burgundy',
    name: 'Executive Burgundy',
    description: 'Distinguished tone for leadership, consulting, finance & C-Suite',
    primaryColor: '#881337',
    accentColor: '#881337', // Deep Crimson Rose
    accentLight: 'rgba(136, 19, 55, 0.07)',
    accentBorder: 'rgba(136, 19, 55, 0.22)',
    accentHover: '#701a31',
    headerBg: '#4c0519',
    sidebarBg: '#4c0519',
    badgeBg: '#fff1f2',
    badgeText: '#881337',
    previewColor: '#9f1239',
  },
  'forest-green': {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Grounding, authoritative & organic tone for sustainability, life sciences & health',
    primaryColor: '#15803d',
    accentColor: '#15803d', // Forest Emerald
    accentLight: 'rgba(21, 128, 61, 0.08)',
    accentBorder: 'rgba(21, 128, 61, 0.22)',
    accentHover: '#166534',
    headerBg: '#14532d',
    sidebarBg: '#14532d',
    badgeBg: '#f0fdf4',
    badgeText: '#15803d',
    previewColor: '#16a34a',
  },
  'warm-amber': {
    id: 'warm-amber',
    name: 'Warm Amber',
    description: 'Warm gold tone for hospitality, client relationships, marketing & media',
    primaryColor: '#b45309',
    accentColor: '#b45309', // Warm Bronze
    accentLight: 'rgba(180, 83, 9, 0.08)',
    accentBorder: 'rgba(180, 83, 9, 0.22)',
    accentHover: '#92400e',
    headerBg: '#78350f',
    sidebarBg: '#78350f',
    badgeBg: '#fffbeb',
    badgeText: '#b45309',
    previewColor: '#d97706',
  },
  'creative-coral': {
    id: 'creative-coral',
    name: 'Creative Coral',
    description: 'Vibrant, warm accent for design, content creators & modern product teams',
    primaryColor: '#c2410c',
    accentColor: '#c2410c', // Coral Terra
    accentLight: 'rgba(194, 65, 12, 0.08)',
    accentBorder: 'rgba(194, 65, 12, 0.22)',
    accentHover: '#9a3412',
    headerBg: '#7c2d12',
    sidebarBg: '#7c2d12',
    badgeBg: '#fff7ed',
    badgeText: '#c2410c',
    previewColor: '#ea580c',
  },
};

export const DEFAULT_PALETTE_ID: Exclude<PaletteId, 'custom'> = 'corporate-blue';

export function getPaletteConfig(id: PaletteId = DEFAULT_PALETTE_ID, customHex?: string): PaletteConfig {
  if (id === 'custom') {
    return createCustomPalette(customHex || '#1d4ed8');
  }
  const key = id as Exclude<PaletteId, 'custom'>;
  return CURATED_PALETTES[key] || CURATED_PALETTES[DEFAULT_PALETTE_ID];
}

export function getAllPalettes(): PaletteConfig[] {
  return Object.values(CURATED_PALETTES);
}
