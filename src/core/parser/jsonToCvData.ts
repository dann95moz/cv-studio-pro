import { CVData, CVSection, ProfilePhotoConfig } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { extractCandidateName } from './metadataExtractor';
import { inferDocumentLanguage } from './skillNormalizer';
import { cleanCvData, cleanSummary } from './cvSanitizers';
import { sanitizeJsonString } from './jsonSanitizer';
import { parseMarkdownToCvData } from './markdownToCvData';
import {
  parseJsonContacts,
  parseJsonSkills,
  parseJsonExperience,
  parseJsonProjects,
  parseJsonEducationAndLanguages,
  parseJsonLegalDetails,
} from './jsonEntityParsers';

// Re-export for backward compatibility
export { sanitizeJsonString } from './jsonSanitizer';

export interface RawJsonCvInput {
  name?: string;
  fullName?: string;
  candidateName?: string;
  title?: string;
  role?: string;
  targetRole?: string;
  headline?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  location?: string;
  city?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  summary?: string;
  profile?: string;
  about?: string;
  extracto?: string;
  detectedLanguage?: string;
  language?: string;
  contacts?: unknown;
  contact?: unknown;
  skills?: unknown;
  skillGroups?: unknown;
  technicalSkills?: unknown;
  experience?: unknown;
  workExperience?: unknown;
  employment?: unknown;
  career?: unknown;
  projects?: unknown;
  featuredProjects?: unknown;
  education?: unknown;
  studies?: unknown;
  certifications?: unknown;
  certificates?: unknown;
  languages?: unknown;
  languageSkills?: unknown;
  nationality?: string;
  workPermit?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
  availability?: string;
  civilStatus?: string;
  placeOfOrigin?: string;
  references?: string;
  photo?: string | ProfilePhotoConfig;
  avatar?: string;
  cvData?: RawJsonCvInput;
  cv?: RawJsonCvInput;
  resume?: RawJsonCvInput;
  data?: RawJsonCvInput;
  gapReport?: {
    targetCompany?: string;
    targetRole?: string;
    estimatedScore?: number;
    estimatedMatchScore?: number;
    criticalKeywords?: string[];
    criticalIntegratedKeywords?: string[];
    narrative?: string;
    gaps?: string;
  };
  gapAnalysis?: {
    targetCompany?: string;
    targetRole?: string;
    estimatedScore?: number;
    estimatedMatchScore?: number;
    criticalKeywords?: string[];
    criticalIntegratedKeywords?: string[];
    narrative?: string;
    gaps?: string;
  };
}

/**
 * Parses raw JSON output from external AI or direct JSON input into strongly-typed CVData.
 * Resilient to LLM formatting variations (nested keys, flat skill arrays, contacts objects, unescaped newlines).
 */
export function parseJsonToCvData(
  rawText: string,
  fallbackMasterData: string = '',
  targetRole: string = ''
): CVData | null {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return null;
  }

  const cleaned = sanitizeJsonString(rawText);

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;

  const rootObj = parsed as RawJsonCvInput;
  const root =
    rootObj.cvData ||
    rootObj.cv ||
    rootObj.resume ||
    rootObj.data ||
    (rootObj.name || rootObj.experience || rootObj.skills || rootObj.summary || rootObj.skillGroups ? rootObj : null);

  if (!root || typeof root !== 'object') return null;

  // 1. Language detection
  const declaredLang = (
    rootObj.detectedLanguage ||
    root.detectedLanguage ||
    rootObj.language ||
    root.language ||
    ''
  ).toLowerCase();
  const inferred = inferDocumentLanguage(root.summary || root.profile || rawText);
  const detectedLang: SupportedLanguage = ['es', 'en', 'de', 'fr', 'it'].includes(declaredLang)
    ? (declaredLang as SupportedLanguage)
    : inferred;
  const langDef = LANGUAGE_DEFINITIONS[detectedLang] || LANGUAGE_DEFINITIONS.es;

  // 2. Parse Fallback Master Data once for enrichment
  let fallbackCv: CVData | null = null;
  if (fallbackMasterData && fallbackMasterData.trim()) {
    try {
      fallbackCv = parseMarkdownToCvData(fallbackMasterData);
    } catch {
      fallbackCv = null;
    }
  }

  // 3. Name & Title
  const rawName = (root.name || root.fullName || root.candidateName || '').replace(/_/g, ' ').trim();
  const isPlaceholder =
    !rawName ||
    rawName.includes('[') ||
    rawName.toLowerCase().includes('candidate full name') ||
    rawName.toLowerCase().includes('nombre del candidato') ||
    rawName.toLowerCase() === 'candidate';
  const name = !isPlaceholder
    ? rawName.replace(/\s+/g, ' ').trim()
    : extractCandidateName(fallbackMasterData, 'Candidate');
  const title = (root.title || root.role || root.targetRole || root.headline || targetRole || '').trim();

  // 4. Contacts
  const contacts = parseJsonContacts(root, fallbackCv);

  // 5. Summary
  const summaryRaw =
    typeof root.summary === 'string'
      ? root.summary
      : typeof root.profile === 'string'
      ? root.profile
      : typeof root.about === 'string'
      ? root.about
      : '';
  const summary = cleanSummary(summaryRaw);

  // 6. Skills
  const rawSkills = root.skills || root.skillGroups || root.technicalSkills;
  const skillGroups = parseJsonSkills(rawSkills, detectedLang);

  // 7. Experience & Projects
  const rawExp = root.experience || root.workExperience || root.employment || root.career;
  const experience = parseJsonExperience(rawExp);

  const rawProjects = root.projects || root.featuredProjects;
  const projects = parseJsonProjects(rawProjects, fallbackCv);

  // 8. Education, Certifications & Languages
  const { education, certifications, languages } = parseJsonEducationAndLanguages(root, fallbackCv);

  // 9. Personal & Swiss Legal Details
  const legalDetails = parseJsonLegalDetails(root, fallbackCv);

  // 10. Assemble sections
  const sections: CVSection[] = [];
  if (summary) sections.push({ id: 'summary', type: 'summary', title: langDef.sections.summary });
  if (skillGroups.length > 0) sections.push({ id: 'skills', type: 'skills', title: langDef.sections.skills });
  if (experience.length > 0) sections.push({ id: 'experience', type: 'experience', title: langDef.sections.experience });
  if (projects.length > 0) sections.push({ id: 'projects', type: 'projects', title: langDef.sections.projects });
  if (education.length > 0 || certifications.length > 0) {
    sections.push({ id: 'education', type: 'education', title: langDef.sections.education });
  }
  if (languages.length > 0) sections.push({ id: 'languages', type: 'languages', title: langDef.sections.languages });

  let parsedPhoto: ProfilePhotoConfig | null | undefined = fallbackCv?.photo || undefined;
  if (root.photo) {
    if (typeof root.photo === 'string' && root.photo.trim()) {
      parsedPhoto = {
        url: root.photo.trim(),
        enabled: true,
        size: 96,
        crop: { x: 0, y: 0, zoom: 1 },
      };
    } else if (typeof root.photo === 'object') {
      parsedPhoto = root.photo as ProfilePhotoConfig;
    }
  }

  const rawCvData: CVData = {
    name,
    title,
    contacts,
    sections,
    sectionTitles: {
      summary: langDef.sections.summary,
      skills: langDef.sections.skills,
      experience: langDef.sections.experience,
      projects: langDef.sections.projects,
      education: langDef.sections.education,
      languages: langDef.sections.languages,
      websites: langDef.sections.websites,
    },
    language: detectedLang,
    summary,
    skillGroups,
    experience,
    projects,
    education,
    certifications,
    languages,
    photo: parsedPhoto,
    ...legalDetails,
  };

  return cleanCvData(rawCvData);
}
