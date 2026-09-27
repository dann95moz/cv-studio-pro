import React from 'react';
import { ThemeId } from '../types/cv';
import { CVTemplateProps, TemplateMetadata } from './types';
import { ModernTechTemplate } from './ModernTechTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { MinimalAtsTemplate } from './MinimalAtsTemplate';
import { TwoColumnTemplate } from './TwoColumnTemplate';
import { DesignerUiuxTemplate } from './DesignerUiuxTemplate';
import { FormalLegalTemplate } from './FormalLegalTemplate';
import { AcademicResearchTemplate } from './AcademicResearchTemplate';
import { EuropassTemplate } from './EuropassTemplate';
import { EuroModernTemplate } from './EuroModernTemplate';
import { SwissModernTemplate } from './SwissModernTemplate';

const TEMPLATE_REGISTRY: Record<ThemeId, React.FC<CVTemplateProps>> = {
  'modern-tech': ModernTechTemplate,
  'executive': ExecutiveTemplate,
  'minimal-ats': MinimalAtsTemplate,
  'two-column': TwoColumnTemplate,
  'designer-uiux': DesignerUiuxTemplate,
  'formal-legal': FormalLegalTemplate,
  'academic-research': AcademicResearchTemplate,
  'europass': EuropassTemplate,
  'euro-modern': EuroModernTemplate,
  'swiss-modern': SwissModernTemplate,
};

const TEMPLATE_METADATA: Record<ThemeId, TemplateMetadata> = {
  'swiss-modern': {
    id: 'swiss-modern',
    name: 'Swiss Standard (Romandie / DACH)',
    category: 'European & International',
    recommendedFor: 'Suisse Romande (Genève, Lausanne), Zurich, DACH, Multinationales & PME helvétiques',
    description: 'Format suisse avec permis de travail (B/C/G), statut de séjour, langues CECR, références et photo',
    layout: 'two-column',
    defaultMaxPages: 2,
    supportsPhoto: true,
    icon: '🇨🇭'
  },
  'europass': {
    id: 'europass',
    name: 'Europass Official (EU)',
    category: 'European & International',
    recommendedFor: 'European Public Sector, EU Institutions, Academic Programs, Government & NGO Applications',
    description: 'Official European Commission CV structure with CEFR language assessment grid and EU Blue branding',
    layout: 'single-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '🇪🇺'
  },
  'euro-modern': {
    id: 'euro-modern',
    name: 'Euro Modern (DACH / EU)',
    category: 'European & International',
    recommendedFor: 'European Tech Companies, Germany (DACH), France, Nordics, International Roles',
    description: 'Contemporary European corporate style with photo support, personal metadata, and CEFR language indicators',
    layout: 'two-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '🌍'
  },
  'executive': {
    id: 'executive',
    name: 'Corporate Top Banner',
    category: 'Executive & Leadership',
    recommendedFor: 'C-Level, VP of Engineering, Directors, Management Consultants',
    description: 'Full-width colored banner with initials monogram box and 2-column executive flow',
    layout: 'two-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '🏛️'
  },
  'two-column': {
    id: 'two-column',
    name: 'Modern Contrast Sidebar',
    category: 'General & Operations',
    recommendedFor: 'Software Engineers, Full-Stack Devs, Consultants, Technical Leaders',
    description: 'Solid colored right sidebar with geometric emblem card and bold modern display',
    layout: 'two-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '📐'
  },
  'designer-uiux': {
    id: 'designer-uiux',
    name: 'Editorial Pastel Card',
    category: 'Design & Creative',
    recommendedFor: 'Product Designers, UI/UX Specialists, Frontend Devs, Creatives',
    description: 'Soft pastel tinted card header with clean editorial asymmetric columns',
    layout: 'two-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '🎨'
  },
  'academic-research': {
    id: 'academic-research',
    name: 'Executive Dual-Tone',
    category: 'Academic & Research',
    recommendedFor: 'Research Scientists, Engineering Managers, Directors, Consultants',
    description: 'Dark charcoal left sidebar with monogram avatar and right soft accent header',
    layout: 'two-column',
    defaultMaxPages: 1,
    supportsPhoto: true,
    icon: '👔'
  },
  'modern-tech': {
    id: 'modern-tech',
    name: 'Modern Tech',
    category: 'Tech & Engineering',
    recommendedFor: 'Software Engineers, Full-Stack Devs, Cloud/DevOps, Tech Leads',
    description: 'Stripe/Linear aesthetic with monospace badges and high-density tech stack',
    layout: 'single-column',
    defaultMaxPages: 1,
    supportsPhoto: false,
    icon: '💻'
  },
  'minimal-ats': {
    id: 'minimal-ats',
    name: 'Minimal ATS',
    category: 'Tech & Engineering',
    recommendedFor: 'Strict enterprise ATS systems (Workday, Taleo, Greenhouse), universal screening',
    description: 'Zero-distraction linear monochrome for guaranteed 100% ATS parser extraction',
    layout: 'ats-linear',
    defaultMaxPages: 1,
    supportsPhoto: false,
    icon: '🛡️'
  },
  'formal-legal': {
    id: 'formal-legal',
    name: 'Formal Classic',
    category: 'Legal & Finance',
    recommendedFor: 'Attorneys, Corporate Counsel, Investment Bankers, Compliance Directors',
    description: 'Classical prestigious serif styling, formal header rule, case volume and bar admissions',
    layout: 'single-column',
    defaultMaxPages: 1,
    supportsPhoto: false,
    icon: '⚖️'
  },
};

/**
 * List of theme identifiers that support user profile headshot / photo rendering
 */
export const PHOTO_SUPPORTED_THEMES: readonly ThemeId[] = [
  'swiss-modern',
  'europass',
  'euro-modern',
  'executive',
  'two-column',
  'designer-uiux',
  'academic-research',
];

/**
 * Check if a given theme supports profile photos
 */
export function themeSupportsPhoto(themeId: ThemeId = 'modern-tech'): boolean {
  return PHOTO_SUPPORTED_THEMES.includes(themeId);
}

/**
 * Resolves the corresponding Template Component by Theme ID
 */
export function getTemplate(themeId: ThemeId = 'modern-tech'): React.FC<CVTemplateProps> {
  return TEMPLATE_REGISTRY[themeId] || ModernTechTemplate;
}

/**
 * Returns metadata for a given template
 */
export function getTemplateMetadata(themeId: ThemeId = 'modern-tech'): TemplateMetadata {
  return TEMPLATE_METADATA[themeId] || TEMPLATE_METADATA['modern-tech'];
}

/**
 * Returns all available templates
 */
export function getAllTemplates(): TemplateMetadata[] {
  return Object.values(TEMPLATE_METADATA);
}

