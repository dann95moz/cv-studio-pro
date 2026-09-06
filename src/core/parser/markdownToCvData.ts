import { CVData, CVSection, ContactItem, SkillCategory, ExperienceItem, ContactType } from '../../types/cv';
import { extractCandidateName } from './metadataExtractor';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';

/**
 * Autonomously infers the primary natural language of the document.
 */
export function inferDocumentLanguage(text: string): SupportedLanguage {
  const lower = text.toLowerCase();
  let esScore = 0;
  let deScore = 0;
  let frScore = 0;
  let itScore = 0;
  let enScore = 0;

  // Domain-specific keyword indicators
  if (/(\bexperiencia\b|\bhabilidades\b|\beducaci[oó]n\b|\bidiomas\b|\bresumen\b|\bdesarrollador\b|\bproyectos\b|\bcertificaciones\b|\blaboral\b)/i.test(lower)) esScore += 4;
  if (/(\bberufserfahrung\b|\bausbildung\b|\bsprachen\b|\bkenntnisse\b|\bkurzprofil\b|\bprojekte\b)/i.test(lower)) deScore += 4;
  if (/(\bexp[eé]rience\b|\bformation\b|\blangues\b|\bcomp[eé]tences\b|\bprofil professionnel\b|\bprojets\b)/i.test(lower)) frScore += 4;
  if (/(\besperienza\b|\bistruzione\b|\blingue\b|\bcompetenze\b|\bprogetti\b)/i.test(lower)) itScore += 4;
  if (/(\bexperience\b|\bskills\b|\beducation\b|\blanguages\b|\bsummary\b|\bprojects\b)/i.test(lower)) enScore += 2;

  // Common syntax and grammatical markers
  if (/\b(de|en|con|para|por|los|las|del|una|un|años|trayectoria)\b/i.test(lower)) esScore += 2;
  if (/\b(und|der|die|das|mit|für|von|im|jahre)\b/i.test(lower)) deScore += 2;
  if (/\b(et|dans|pour|avec|des|les|une|ans)\b/i.test(lower)) frScore += 2;
  if (/\b(e|in|per|con|dei|le|un|anni)\b/i.test(lower)) itScore += 2;

  if (esScore > deScore && esScore > frScore && esScore > itScore && esScore >= enScore) return 'es';
  if (deScore > esScore && deScore > frScore && deScore > itScore && deScore >= enScore) return 'de';
  if (frScore > esScore && frScore > deScore && frScore > itScore && frScore >= enScore) return 'fr';
  if (itScore > esScore && itScore > deScore && itScore > frScore && itScore >= enScore) return 'it';
  return 'en';
}

/**
 * Normalizes and localizes standard technical skill category names into the target document language.
 */
export function normalizeSkillCategory(category: string, lang: SupportedLanguage): string {
  const clean = category.replace(/[*_`]/g, '').trim();
  const lower = clean.toLowerCase();
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  if (
    lower.includes('language') ||
    lower.includes('lenguaje') ||
    lower.includes('programmiersprache') ||
    lower.includes('fundamento') ||
    lower.includes('core web') ||
    lower.includes('core fundamental')
  ) {
    return langDef.skillsCategories.languages;
  }
  if (
    lower.includes('framework') ||
    lower.includes('architecture') ||
    lower.includes('arquitectura') ||
    lower.includes('ecosystem') ||
    lower.includes('ecosistema') ||
    lower.includes('ökosystem') ||
    lower.includes('écosystème')
  ) {
    return langDef.skillsCategories.frameworks;
  }
  if (
    lower.includes('tool') ||
    lower.includes('herramienta') ||
    lower.includes('ci/cd') ||
    lower.includes('testing') ||
    lower.includes('werkzeug') ||
    lower.includes('outil') ||
    lower.includes('strument')
  ) {
    return langDef.skillsCategories.tooling;
  }
  if (
    lower === 'core skills' ||
    lower === 'skills' ||
    lower === 'technical skills' ||
    lower === 'competencies' ||
    lower === 'habilidades' ||
    lower === 'habilidades técnicas'
  ) {
    return langDef.sections.skills;
  }

  return clean;
}

/**
 * Detects contact type from text or URL
 */
function inferContactType(text: string, url?: string): ContactType {
  const combined = `${text} ${url || ''}`.toLowerCase();
  if (combined.includes('@')) return 'email';
  if (combined.includes('linkedin.com') || combined.includes('/in/')) return 'linkedin';
  if (combined.includes('github.com')) return 'github';
  if (combined.includes('http://') || combined.includes('https://') || combined.includes('www.') || combined.includes('.dev') || combined.includes('.io') || combined.includes('.me')) return 'globe';
  if (/^[\s+0-9().-]{7,}$/.test(text.trim())) return 'phone';
  return 'location';
}

/**
 * Parses raw contacts line (e.g. "San Francisco, CA • [alex@example.com](mailto:...) • +1 415 555 0192 • [LinkedIn](...)")
 */
function parseContactsLine(line: string): ContactItem[] {
  const items = line.split(/[•|·]/).map((item) => item.trim()).filter(Boolean);
  const contacts: ContactItem[] = [];

  for (const item of items) {
    const linkMatch = item.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const label = linkMatch[1].trim();
      const url = linkMatch[2].trim();
      contacts.push({
        type: inferContactType(label, url),
        label,
        url,
      });
    } else {
      const clean = item.replace(/^[–\-*]\s*/, '').trim();
      if (clean) {
        contacts.push({
          type: inferContactType(clean),
          label: clean,
          url: clean.includes('@') ? `mailto:${clean}` : undefined,
        });
      }
    }
  }

  return contacts;
}

/**
 * Parses experience or project blocks under ###
 */
function parseExperienceBlocks(content: string): ExperienceItem[] {
  const blocks = content.split(/(?=^###\s+)/m).filter((b) => b.trim());
  const items: ExperienceItem[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let company = '';
    let location = '';
    let role = '';
    let date = '';
    const bullets: string[] = [];

    // Line 1: Header line (e.g. "### **Company** | Location" or "### Company | Location")
    const headerLine = lines[0].replace(/^###\s+/, '').trim();
    const headerParts = headerLine.split('|').map((p) => p.trim());
    company = headerParts[0].replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/, '$1').trim();
    if (headerParts.length > 1) {
      location = headerParts.slice(1).join(' | ').trim();
    }

    // Line 2: Subheader line (e.g. "*Role* | **Date**" or "Role | Date")
    let lineIdx = 1;
    if (lineIdx < lines.length && !lines[lineIdx].startsWith('-') && !lines[lineIdx].startsWith('* ')) {
      const subLine = lines[lineIdx];
      const subParts = subLine.split('|').map((p) => p.trim());
      role = subParts[0].replace(/[*_]/g, '').trim();
      if (subParts.length > 1) {
        date = subParts.slice(1).join(' | ').replace(/[*_]/g, '').trim();
      }
      lineIdx++;
    }

    // Remaining lines: Bullets
    for (; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        const bulletText = line.replace(/^[-*•]\s+/, '').trim();
        if (bulletText) bullets.push(bulletText);
      } else if (line.startsWith('---')) {
        continue;
      } else {
        if (bullets.length > 0) {
          bullets[bullets.length - 1] += ` ${line}`;
        } else {
          bullets.push(line);
        }
      }
    }

    if (company || role || bullets.length > 0) {
      items.push({
        company: company || 'Organization',
        role: role || 'Specialist',
        date,
        location,
        bullets,
      });
    }
  }

  return items;
}

/**
 * Parses skills categories from markdown bullets with robust regex and localization.
 */
function parseSkillGroups(content: string, lang: SupportedLanguage): SkillCategory[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const groups: SkillCategory[] = [];
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const clean = line.replace(/^[-*•]\s+/, '').trim();

      // Robust category match:
      // "**Languages & Core Fundamentals:** TypeScript, ..."
      // "**Languages & Core Fundamentals**: TypeScript, ..."
      // "Languages & Core Fundamentals: TypeScript, ..."
      const catMatch = clean.match(/^\*{0,2}(.*?)(?::\*{0,2}|\*{0,2}:)\s*(.+)$/);

      if (catMatch) {
        const rawCategory = catMatch[1].trim();
        const category = normalizeSkillCategory(rawCategory, lang);
        const skills = catMatch[2]
          .split(/[,|•·;]/)
          .map((s) => s.replace(/[*_`]/g, '').trim())
          .filter(Boolean);
        groups.push({ category, skills });
      } else {
        // Plain skills bullet: if a group already exists, append to the last group!
        const skill = clean.replace(/[*_`]/g, '').trim();
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
 */
function parseBulletList(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- ') || l.startsWith('* ') || l.startsWith('• '))
    .map((l) => l.replace(/^[-*•]\s+/, '').trim())
    .filter(Boolean);
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

  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const lang: SupportedLanguage = language || inferDocumentLanguage(markdown);
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  let name = '';
  let title = '';
  let contacts: ContactItem[] = [];

  // 1. Parse Preamble (before the first ## or ---)
  let preambleEndIndex = lines.findIndex((l) => l.startsWith('## ') || l.startsWith('---'));
  if (preambleEndIndex === -1) preambleEndIndex = lines.length;

  const preambleLines = lines.slice(0, preambleEndIndex).map((l) => l.trim()).filter(Boolean);

  for (const pLine of preambleLines) {
    if (pLine.startsWith('# ')) {
      name = pLine.replace(/^#\s+/, '').replace(/\*\*/g, '').trim();
    } else if (pLine.startsWith('**') && pLine.endsWith('**') && !title) {
      title = pLine.replace(/\*\*/g, '').trim();
    } else if (pLine.includes('•') || pLine.includes('@') || pLine.includes('http') || pLine.includes('|')) {
      contacts = parseContactsLine(pLine);
    }
  }

  if (!name) {
    name = extractCandidateName(markdown, 'Candidate');
  }

  // 2. Parse Sections by '## '
  const sectionSplitRegex = /(?=^##\s+)/m;
  const rawSections = normalized.split(sectionSplitRegex).filter((s) => s.trim().startsWith('## '));

  let summary = '';
  let skillGroups: SkillCategory[] = [];
  let experience: ExperienceItem[] = [];
  let projects: ExperienceItem[] = [];
  let education: string[] = [];
  let languages: string[] = [];
  const sections: CVSection[] = [];

  for (const rawSec of rawSections) {
    const secLines = rawSec.split('\n');
    const headerLine = secLines[0].replace(/^##\s+/, '').trim();
    const content = secLines.slice(1).join('\n').replace(/^---\s*$/gm, '').trim();

    // Clean emojis and decorative prefixes from section title
    const cleanHeaderUpper = headerLine.replace(/^[^\w\s]+/, '').trim().toUpperCase();

    if (/SUMMARY|RESUMEN|PROFILE|PERFIL|PITCH|PROFIL|ZUSAMMENFASSUNG|SOMMARIO/.test(cleanHeaderUpper)) {
      summary = content;
      sections.push({ id: 'summary', type: 'summary', title: langDef.sections.summary, rawContent: content });
    } else if (/SKILL|COMPETENC|HABILIDAD|TECH STACK|FÄHIGKEIT|KENNTNISSE/.test(cleanHeaderUpper)) {
      skillGroups = parseSkillGroups(content, lang);
      sections.push({ id: 'skills', type: 'skills', title: langDef.sections.skills, rawContent: content });
    } else if (/EXPERIENCE|EXPERIENCIA|CAREER|HISTORIAL|LABORAL|WERDEGANG|BERUFSERFAHRUNG|PARCOURS|ESPERIENZA/.test(cleanHeaderUpper)) {
      experience = parseExperienceBlocks(content);
      sections.push({ id: 'experience', type: 'experience', title: langDef.sections.experience, rawContent: content });
    } else if (/PROJECT|PROYECTO|PROJEKT|PROGETT/.test(cleanHeaderUpper)) {
      projects = parseExperienceBlocks(content);
      sections.push({ id: 'projects', type: 'projects', title: langDef.sections.projects, rawContent: content });
    } else if (/EDUCATION|EDUCACI|CERTIFIC|FORMATION|AUSBILDUNG|STUDIUM|ISTRUZIONE/.test(cleanHeaderUpper)) {
      education = parseBulletList(content);
      sections.push({ id: 'education', type: 'education', title: langDef.sections.education, rawContent: content });
    } else if (/LANGUAGE|IDIOMA|SPRACH|LANGUE|LINGU/.test(cleanHeaderUpper)) {
      languages = parseBulletList(content);
      sections.push({ id: 'languages', type: 'languages', title: langDef.sections.languages, rawContent: content });
    } else {
      const secId = `custom_${Math.random().toString(36).substring(2, 7)}`;
      sections.push({ id: secId, type: 'custom', title: headerLine, rawContent: content });
    }
  }

  return {
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
    languages: languages.length > 0 ? languages : undefined,
  };
}
