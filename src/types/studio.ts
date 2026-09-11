/**
 * CV Studio Pro - Studio Workspace & Navigation Types
 * 
 * Domain-specific type definitions for studio tabs, wizard steps,
 * preview modes, nav rail panels, and historical version records.
 */

import { ThemeId, PaletteId, ProfilePhotoConfig } from './theme';
import { CVData } from './cv';

export type WizardStep = 
  | 'profile' 
  | 'target' 
  | 'tailor' 
  | 'preview';

export type StudioTab = 
  | 'landing'
  | 'wizard'
  | 'editor' 
  | 'preview' 
  | 'audit' 
  | 'gap' 
  | 'history'
  | 'settings';

export type PreviewViewMode = 'tailored' | 'generic' | 'compare';

export type PreviewSidePanelType = 'templates' | 'design' | 'audit' | 'linkedin' | 'compare';

export interface StepMeta {
  id: WizardStep;
  number: number;
  label: string;
  shortLabel?: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export interface CvTranslationVariant {
  language: string; // 'en' | 'es' | 'de' | 'fr' | 'it'
  languageLabel: string;
  cvMarkdown: string;
  cvData?: CVData;
  updatedAt: string; // ISO string
  isOutdated?: boolean;
  baseMarkdownHash?: string;
  outdatedSections?: string[];
}

export interface GeneratedCvVersion {
  id: string;
  createdAt: string; // ISO string
  candidateName: string;
  companyName: string;
  targetRole: string;
  matchScore: number;
  qualityScore: number;
  theme: ThemeId;
  palette: PaletteId;
  pageBudget: 1 | 2;
  cvMarkdown: string;
  cvData?: CVData;
  gapMarkdown?: string;
  targetJobSnippet?: string;
  photo?: ProfilePhotoConfig | null;
  baseLanguage?: string;
  translations?: Record<string, CvTranslationVariant>;
  activeLanguage?: string;
  isGeneric?: boolean;
  isPinned?: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  isTerminal?: boolean;
}

export type ApplicationContactChannel =
  | 'linkedin'
  | 'whatsapp'
  | 'email'
  | 'referral'
  | 'headhunter'
  | 'portal'
  | 'direct'
  | 'other';

export interface ApplicationItem {
  id: string;
  companyName: string;
  targetRole: string;
  columnId: string;
  appliedVersionId?: string;
  selectedLanguage?: string;
  isExternalCv?: boolean;
  externalCvTitle?: string;
  contactChannel?: ApplicationContactChannel | string;
  contactPerson?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  appliedDate?: string;
  matchScore: number;
  qualityScore?: number;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
}

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'applied', title: 'Applied', color: '#3b82f6' },
  { id: 'interview', title: 'Interview', color: '#8b5cf6' },
  { id: 'tech_test', title: 'Technical Assessment', color: '#f59e0b' },
  { id: 'offer', title: 'Offer Received', color: '#10b981', isTerminal: true },
  { id: 'rejected', title: 'Rejected', color: '#ef4444', isTerminal: true },
];

export interface MarkdownFileItem {
  name: string;
  path: string;
  content: string;
}

