/**
 * CV Studio Pro - Theme & Styling Types
 * 
 * Domain-specific type definitions for CV document themes, palettes,
 * font families, and density configurations.
 */

export type ThemeId = 
  | 'modern-tech' 
  | 'executive' 
  | 'minimal-ats' 
  | 'two-column'
  | 'designer-uiux'
  | 'formal-legal'
  | 'academic-research'
  | 'europass'
  | 'euro-modern'
  | 'swiss-modern';

export type PaletteId = 
  | 'corporate-blue' 
  | 'accent-teal' 
  | 'editorial-black' 
  | 'minimal-slate' 
  | 'modern-indigo' 
  | 'executive-burgundy' 
  | 'forest-green' 
  | 'warm-amber' 
  | 'creative-coral'
  | 'custom';

export type FontFamilyId = 'inter' | 'outfit' | 'serif' | 'mono';
export type SpacingDensity = 'compact' | 'standard' | 'spacious';
export type PageFormat = 'a4' | 'letter' | 'legal';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  accentColor: string;
  isTwoColumn?: boolean;
}

export interface ProfilePhotoCrop {
  x: number;
  y: number;
  zoom: number;
}

export interface ProfilePhotoConfig {
  url: string;
  crop: ProfilePhotoCrop;
  enabled: boolean;
  size?: number; // Display size in px (min: 44, max: 96, default: 64)
}
