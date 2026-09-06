/**
 * CV Studio Pro - Core CV Data Models
 * 
 * Domain-specific type definitions for CV structure, sections,
 * contact information, and parsed entries.
 * Re-exports sub-domain types to maintain full backward compatibility.
 */

export type SectionType = 
  | 'summary' 
  | 'skills' 
  | 'experience' 
  | 'projects' 
  | 'education' 
  | 'languages' 
  | 'generic'
  | 'custom';

export type ContactType = 
  | 'email' 
  | 'phone' 
  | 'location' 
  | 'linkedin' 
  | 'github' 
  | 'globe' 
  | 'calendar' 
  | 'text';

export interface ContactItem {
  type: ContactType;
  label: string;
  url?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  company: string;
  location?: string;
  role?: string;
  date?: string;
  bullets: string[];
  demoUrl?: string;
  repoUrl?: string;
}

export interface ProjectItem {
  name: string;
  links?: { label: string; url: string }[];
  bullets: string[];
  stack?: string[];
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  rawContent?: string;
}

import { ProfilePhotoConfig } from './theme';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

export interface LanguageItem {
  name: string;
  level: CEFRLevel;
  displayLevel?: string;
  raw?: string;
}

export type CustomSectionPresetType = 
  | 'certifications' 
  | 'awards' 
  | 'publications' 
  | 'volunteering' 
  | 'conferences' 
  | 'custom';

export interface CustomSection {
  id: string;
  title: string;
  presetType?: CustomSectionPresetType;
  items: string[];
}

import { SupportedLanguage } from '../constants/languages';

export interface CVData {
  name: string;
  title: string;
  contacts: ContactItem[];
  sections: CVSection[];
  language?: SupportedLanguage;
  summary?: string;
  skillGroups?: SkillCategory[];
  experience?: ExperienceItem[];
  projects?: ExperienceItem[];
  education?: string[];
  certifications?: string[];
  languages?: string[];
  languageItems?: LanguageItem[];
  customSections?: CustomSection[];
  sectionTitles?: Partial<Record<SectionType | string, string>>;
  photo?: ProfilePhotoConfig | null;

  nationality?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
}


// Re-export domain-specific types for seamless backward compatibility
export * from './theme';
export * from './ai';
export * from './audit';
export * from './studio';
export * from './components';
