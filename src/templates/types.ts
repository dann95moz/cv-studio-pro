import { CVData, ThemeId, ContactItem, SkillCategory, ExperienceItem, ProfilePhotoConfig, LanguageItem } from '../types/cv';
import { SupportedLanguage } from '../constants/languages';

export interface HeaderSlotData {
  name: string;
  title?: string;
  contacts: ContactItem[];
  photo?: ProfilePhotoConfig | null;
  nationality?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
}

export interface SummarySlotData {
  title: string;
  rawContent: string;
}

export interface SkillsSlotData {
  title: string;
  skillGroups: SkillCategory[];
}

export interface ExperienceSlotData {
  title: string;
  items: ExperienceItem[];
  type: 'experience' | 'projects';
}

export interface ListSlotData {
  title: string;
  items: string[];
  type: 'education' | 'languages' | 'generic';
  languageItems?: LanguageItem[];
}

export interface GenericSlotData {
  id: string;
  title: string;
  rawContent: string;
}

export interface CVSlotMap {
  header: HeaderSlotData;
  summary?: SummarySlotData;
  skills?: SkillsSlotData;
  experience?: ExperienceSlotData;
  projects?: ExperienceSlotData;
  education?: ListSlotData;
  languages?: ListSlotData;
  genericSections: GenericSlotData[];
  photo?: ProfilePhotoConfig | null;
  websitesTitle?: string;
  language?: SupportedLanguage;
}

export interface CVTemplateProps {
  data: CVData;
  slots: CVSlotMap;
  theme: ThemeId;
  photo?: ProfilePhotoConfig | null;
}

export interface TemplateMetadata {
  id: ThemeId;
  name: string;
  category: 'Tech & Engineering' | 'Design & Creative' | 'Legal & Finance' | 'Executive & Leadership' | 'Academic & Research' | 'General & Operations' | 'European & International';
  recommendedFor: string;
  description: string;
  layout: 'single-column' | 'two-column' | 'ats-linear';
  defaultMaxPages: number;
  supportsPhoto?: boolean;
  icon?: string;
}


export interface HeaderSlotProps {
  data: HeaderSlotData;
  className?: string;
  showContactsInHeader?: boolean;
}

export interface SummarySlotProps {
  data: SummarySlotData;
  className?: string;
}

export interface SkillsSlotProps {
  data: SkillsSlotData;
  className?: string;
  variant?: 'pills' | 'inline' | 'compact';
}

export interface ExperienceSlotProps {
  data: ExperienceSlotData;
  className?: string;
  maxItems?: number;
}

export interface EducationSlotProps {
  data: ListSlotData;
  className?: string;
  maxItems?: number;
}

export interface LanguagesSlotProps {
  data: ListSlotData;
  className?: string;
}

export interface GenericSlotProps {
  data: GenericSlotData;
  className?: string;
}

