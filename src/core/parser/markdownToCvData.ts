import { CVData, CVSection, ContactItem, ExperienceItem, SkillCategory } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { extractCandidateName, extractTargetRole, cleanHumanText } from './metadataExtractor';
import { parseJsonToCvData } from './jsonToCvData';
import { parseContactsLine, isLikelyContactLine } from './contactParser';
import { parseExperienceBlocks } from './experienceParser';
import { parseLegalMetadata, LegalMetadataResult } from './legalMetadataParser';
import { inferDocumentLanguage, normalizeSkillCategory } from './skillNormalizer';
import {
  cleanCvData,
  cleanSummary,
  cleanBulletText,
  cleanSkillItem,
  cleanSkillCategory,
  cleanEducationItem,
  cleanLanguageItem,
} from './cvSanitizers';

// Re-export helpers for backward compatibility across the codebase
export {
  inferDocumentLanguage,
  normalizeSkillCategory,
  cleanCvData,
  cleanSummary,
  cleanBulletText,
  cleanSkillItem,
  cleanSkillCategory,
  cleanEducationItem,
  cleanLanguageItem,
};

/**
 * Parses skills categories from markdown bullets with robust regex and localization.
 */
function parseSkillGroups(content: string, lang: SupportedLanguage): SkillCategory[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const groups: SkillCategory[] = [];
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ') || line.startsWith('+ ')) {
      const clean = line.replace(/^[-*•·+]\s+/, '').trim();
      const catMatch = clean.match(/^\*{0,2}(.*?)(?::\*{0,2}|\*{0,2}:)\s*(.+)$/);

      if (catMatch) {
        const rawCategory = catMatch[1].trim();
        const category = cleanSkillCategory(normalizeSkillCategory(rawCategory, lang));
        const skills = catMatch[2]
          .split(/[,|•·;]/)
          .map((s) => cleanSkillItem(s))
          .filter(Boolean);
        groups.push({ category, skills });
      } else {
        const skill = cleanSkillItem(clean);
        if (skill) {
          if (groups.length > 0) {
            groups[groups.length - 1].skills.push(skill);
          } else {
            const fallbackCategory = langDef.sections.skills;
            groups.push({ category: fallbackCategory, skills: [skill] });
          }
        }
      }
    }
  }

  return groups;
}

/**
 * Parses bullet list items (education, certifications, languages)
 * Supports non-bullet entries and indented sub-bullets (descriptions).
 */
function parseBulletList(content: string): string[] {
  const lines = content.split('\n').map((l) => l.trimEnd());
  const items: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('---') || line.startsWith('===')) continue;

    const isBullet = /^[-*•·+]\s+/.test(line);
    const isIndented = /^(\s{2,}|\t)[-*•·+]?\s*/.test(rawLine);

    if (isBullet) {
      items.push(line.replace(/^[-*•·+]\s+/, '').trim());
    } else if (isIndented && items.length > 0) {
      items[items.length - 1] += `\n  - ${line.replace(/^[-*•·+]\s+/, '').trim()}`;
    } else if (/^\*\*[^*]+\*\*/.test(line) || /^[A-Za-z0-9]/.test(line)) {
      items.push(line);
    }
  }

  return items.filter(Boolean);
}

/**
 * Parses a standardized CV Markdown string back into a complete, strongly typed CVData model.
 * Inverts serializeCvDataToMarkdown with full multilingual section awareness.
 */
export function parseMarkdownToCvData(markdown: string, language?: SupportedLanguage): CVData {
  if (!markdown || !markdown.trim()) {
    return {
      name: '',
      title: '',
      contacts: [],
      sections: [],
    };
  }

  // If input is JSON (from external AI or direct JSON paste), parse via parseJsonToCvData
  const trimmed = markdown.trim();
  if (
    trimmed.startsWith('{') ||
    trimmed.includes('"cvData"') ||
    trimmed.includes('"experience"') ||
    trimmed.includes('"skills"') ||
    /```(?:json)?\s*\{/i.test(trimmed)
  ) {
    const jsonCv = parseJsonToCvData(trimmed);
    if (jsonCv && (jsonCv.name || jsonCv.experience?.length || jsonCv.skillGroups?.length || jsonCv.summary)) {
      return jsonCv;
    }
  }

  const rawNormalized = markdown.replace(/\r\n/g, '\n');

  // If document omits ## on known section titles (e.g. LLM returns "PROFIL PROFESSIONNEL" directly), prefix with ##
  const hashCount = (rawNormalized.match(/^##\s+/gm) || []).length;
  const normalized = hashCount < 2
    ? rawNormalized.replace(
        /(^|\n)(?:[#*_\s]*)(PROFIL\s+PROFESSIONNEL|R[ÉE]SUM[ÉE]\s+PROFESSIONNEL|PROFESSIONAL\s+SUMMARY|SUMMARY|RESUMEN\s+PROFESIONAL|ZUSAMMENFASSUNG|SOMMARIO\s+PROFESSIONALE|COMP[ÉE]TENCES\s+TECHNIQUES|COMP[ÉE]TENCES(?:\s+CL[ÉE]S)?|TECHNICAL\s+SKILLS|SKILLS|COMPETENCIES|CORE\s+SKILLS|HABILIDADES\s+T[ÉE]CNICAS|HABILIDADES|KENNTNISSE|COMPETENZE\s+TECNICHE|COMPETENZE|EXP[ÉE]RIENCE\s+PROFESSIONNELLE|EXP[ÉE]RIENCE|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|CAREER\s+HISTORY|EXPERIENCIA\s+LABORAL|EXPERIENCIA\s+PROFESIONAL|EXPERIENCIA|BERUFSERFAHRUNG|ESPERIENZA\s+PROFESSIONALE|ESPERIENZA|PROJETS?\s+PERSONNELS?|PROJETS?\s+NOTABLES?|PROJETS?|FEATURED\s+PROJECTS|PROJECTS|PROYECTOS?\s+DESTACADOS?|PROYECTOS?\s+PERSONALES?|PROYECTOS?|PROJEKTE?|PROGETTI\s+PRINCIPALI|PROGETTI|FORMATION\s*&\s*CERTIFICATIONS|FORMATION\s*&\s*DIPL[ÔO]MES|FORMATION|EDUCATION\s*&\s*CERTIFICATIONS|EDUCATION|ACADEMIC\s+BACKGROUND|EDUCACI[OÓ]N\s*Y\s*CERTIFICACIONES|EDUCACI[OÓ]N|AUSBILDUNG|ISTRUZIONE\s*&\s*CERTIFICAZIONI|ISTRUZIONE|LANGUES|LANGUAGES|IDIOMAS|SPRACHEN|LINGUE|R[ÉE]F[ÉE]RENCES|REFERENCES|REFERENCIAS|REFERENZEN|REFERENZE)(?:[:*_\s]*)(?=\n|$)/gi,
        '$1## $2\n'
      )
    : rawNormalized;

  const lines = normalized.split('\n');
  const lang: SupportedLanguage = language || inferDocumentLanguage(markdown);
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  let name = '';
  let title = '';
  const contacts: ContactItem[] = [];
  const legalDetails: LegalMetadataResult = {};

  // 1. Parse Preamble (before the first ##)
  let preambleEndIndex = lines.findIndex((l) => l.startsWith('## '));
  if (preambleEndIndex === -1) preambleEndIndex = lines.length;

  const preambleLines = lines.slice(0, preambleEndIndex).map((l) => l.trim()).filter(Boolean);

  for (const pLine of preambleLines) {
    const parsedLegal = parseLegalMetadata(pLine);
    if (parsedLegal) {
      if (parsedLegal.key === 'nationality' && legalDetails.nationality) {
        legalDetails.nationality = `${legalDetails.nationality} • ${parsedLegal.value}`;
      } else {
        legalDetails[parsedLegal.key] = parsedLegal.value;
      }
      continue;
    }

    if (pLine.startsWith('# ')) {
      const candidateHeader = cleanHumanText(pLine.replace(/^#\s+/, ''));
      if (
        candidateHeader &&
        !/^(?:master\s+data|master\s+profile|perfil\s+profesional|curriculum|resume|cv|datos\s+maestros|ejemplo)/i.test(candidateHeader)
      ) {
        name = candidateHeader;
      }
    } else if (isLikelyContactLine(pLine)) {
      const parsedContacts = parseContactsLine(pLine);
      for (const item of parsedContacts) {
        if (!contacts.some((c) => c.type === item.type && c.label === item.label)) {
          contacts.push(item);
        }
      }
    } else if (!pLine.startsWith('---') && !pLine.startsWith('===') && !pLine.startsWith('>')) {
      const cleanLine = cleanHumanText(pLine);
      if (
        cleanLine &&
        cleanLine.length < 100 &&
        !cleanLine.toLowerCase().includes('http') &&
        !cleanLine.toLowerCase().includes('@')
      ) {
        if (!name) {
          name = cleanLine;
        } else if (!title) {
          title = cleanLine;
        }
      }
    }
  }

  if (!name) {
    name = extractCandidateName(markdown, 'Candidate');
  }

  if (!title) {
    title = cleanHumanText(extractTargetRole(markdown, markdown));
  }

  // 2. Parse Sections by '## '
  const sectionSplitRegex = /(?=^##\s+)/m;
  const rawSections = normalized.split(sectionSplitRegex).filter((s) => s.trim().startsWith('## '));

  let summary = '';
  let skillGroups: SkillCategory[] = [];
  let experience: ExperienceItem[] = [];
  let projects: ExperienceItem[] = [];
  let education: string[] = [];
  let certifications: string[] = [];
  let languages: string[] = [];
  const sections: CVSection[] = [];

  for (const rawSec of rawSections) {
    const secLines = rawSec.split('\n');
    const headerLine = secLines[0].replace(/^##\s+/, '').trim();
    const content = secLines.slice(1).join('\n').replace(/^---\s*$/gm, '').trim();

    // Clean emojis, decorative prefixes, and strip accents from section title
    const cleanHeaderUpper = headerLine
      .replace(/^[^\w\s]+/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();

    if (/SUMMARY|RESUMEN|PROFILE|PERFIL|PITCH|PROFIL|ZUSAMMENFASSUNG|SOMMARIO/.test(cleanHeaderUpper)) {
      summary = content;
      sections.push({ id: 'summary', type: 'summary', title: langDef.sections.summary, rawContent: content });
    } else if (/SKILL|COMPETENC|HABILIDAD|TECH STACK|FÄHIGKEIT|KENNTNISSE/.test(cleanHeaderUpper)) {
      skillGroups = parseSkillGroups(content, lang);
      sections.push({ id: 'skills', type: 'skills', title: langDef.sections.skills, rawContent: content });
    } else if (/EXPERIENCE|EXPERIENCIA|CAREER|HISTORIAL|LABORAL|WERDEGANG|BERUFSERFAHRUNG|PARCOURS|ESPERIENZA/.test(cleanHeaderUpper)) {
      experience = parseExperienceBlocks(content, contacts);
      sections.push({ id: 'experience', type: 'experience', title: langDef.sections.experience, rawContent: content });
    } else if (/PROJECT|PROYECT|PROJEKT|PROGETT|PROJET/.test(cleanHeaderUpper)) {
      projects = parseExperienceBlocks(content, contacts);
      const titleCandidate = cleanHumanText(headerLine);
      sections.push({ id: 'projects', type: 'projects', title: titleCandidate || langDef.sections.projects, rawContent: content });
    } else if (/(?:CERTIFIC|LICEN[CS])/.test(cleanHeaderUpper) && !/(?:EDUCATION|EDUCACI|FORMATION|AUSBILDUNG|STUDIUM|ISTRUZIONE)/.test(cleanHeaderUpper)) {
      certifications = parseBulletList(content);
      sections.push({ id: 'certifications', type: 'education', title: headerLine, rawContent: content });
    } else if (/EDUCATION|EDUCACI|FORMATION|AUSBILDUNG|STUDIUM|ISTRUZIONE/.test(cleanHeaderUpper)) {
      education = parseBulletList(content);
      sections.push({ id: 'education', type: 'education', title: langDef.sections.education, rawContent: content });
    } else if (/LANGUAGE|IDIOMA|SPRACH|LANGUE|LINGU/.test(cleanHeaderUpper)) {
      languages = parseBulletList(content);
      sections.push({ id: 'languages', type: 'languages', title: langDef.sections.languages, rawContent: content });
    } else if (/REFERENCE|REFERENZ|REFERENCIA/.test(cleanHeaderUpper)) {
      if (!legalDetails.references) {
        legalDetails.references = content.replace(/^[-*•]\s*/, '').trim();
      }
      const secId = `custom_references`;
      sections.push({ id: secId, type: 'custom', title: headerLine, rawContent: content });
    } else if (/CONTACT|PERSONAL/.test(cleanHeaderUpper)) {
      const contactLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
      for (const cLine of contactLines) {
        if (isLikelyContactLine(cLine)) {
          const parsed = parseContactsLine(cLine);
          for (const item of parsed) {
            if (!contacts.some((c) => c.type === item.type && c.label === item.label)) {
              contacts.push(item);
            }
          }
        }
      }
    } else {
      const secId = `custom_${Math.random().toString(36).substring(2, 7)}`;
      sections.push({ id: secId, type: 'custom', title: headerLine, rawContent: content });
    }
  }

  return cleanCvData({
    name,
    title,
    contacts,
    sections,
    language: lang,
    sectionTitles: {
      summary: langDef.sections.summary,
      skills: langDef.sections.skills,
      experience: langDef.sections.experience,
      projects: langDef.sections.projects,
      education: langDef.sections.education,
      languages: langDef.sections.languages,
      websites: langDef.sections.websites,
    },
    summary,
    skillGroups: skillGroups.length > 0 ? skillGroups : undefined,
    experience: experience.length > 0 ? experience : undefined,
    projects: projects.length > 0 ? projects : undefined,
    education: education.length > 0 ? education : undefined,
    certifications: certifications.length > 0 ? certifications : undefined,
    languages: languages.length > 0 ? languages : undefined,
    ...legalDetails,
  });
}
