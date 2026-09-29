import { CVData } from '../../types/cv';
import { SupportedLanguage } from '../../constants/languages';
import { getLocalizedReferences } from '../../constants/legalPresets';
import { sanitizeLegalMetadata, cleanPlaceOfOrigin } from '../parser/cvSanitizers';

/**
 * Default ATS section titles synchronized across all 5 supported locales.
 */
const DEFAULT_SECTION_TITLES: Record<SupportedLanguage, {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  languages: string;
}> = {
  fr: {
    summary: 'PROFIL PROFESSIONNEL',
    skills: 'COMPÉTENCES TECHNIQUES',
    experience: 'EXPÉRIENCE PROFESSIONNELLE',
    projects: 'PROJETS & RÉALISATIONS',
    education: 'FORMATION & CERTIFICATIONS',
    languages: 'LANGUES',
  },
  es: {
    summary: 'PERFIL PROFESIONAL',
    skills: 'HABILIDADES TÉCNICAS',
    experience: 'EXPERIENCIA PROFESIONAL',
    projects: 'PROYECTOS DESTACADOS',
    education: 'EDUCACIÓN Y CERTIFICACIONES',
    languages: 'IDIOMAS',
  },
  en: {
    summary: 'PROFESSIONAL SUMMARY',
    skills: 'CORE SKILLS & TECHNICAL COMPETENCIES',
    experience: 'PROFESSIONAL EXPERIENCE',
    projects: 'FEATURED PROJECTS',
    education: 'EDUCATION & CERTIFICATIONS',
    languages: 'LANGUAGES',
  },
  de: {
    summary: 'KURZPROFIL',
    skills: 'FACHLICHE KOMPETENZEN',
    experience: 'BERUFSERFAHRUNG',
    projects: 'PROJEKTE & ERFOLGE',
    education: 'AUSBILDUNG & QUALIFIKATIONEN',
    languages: 'SPRACHKENNTNISSE',
  },
  it: {
    summary: 'PROFILO PROFESSIONALE',
    skills: 'COMPETENZE TECNICHE',
    experience: 'ESPERIENZA PROFESSIONALE',
    projects: 'PROGETTI PRINCIPALI',
    education: 'ISTRUZIONE E FORMAZIONE',
    languages: 'COMPETENZE LINGUISTICHE',
  },
};

/**
 * Resolves the section title for plain-text ATS export respecting user customizations and language.
 */
function resolveExportTitle(
  data: CVData,
  type: 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'languages',
  lang: SupportedLanguage
): string {
  const explicit = data.sectionTitles?.[type];
  if (explicit && explicit.trim()) {
    return stripMarkdownFormatting(explicit).toUpperCase();
  }

  const matchingSection = data.sections?.find((s) => s.type === type || s.id === type);
  if (matchingSection?.title && matchingSection.title.trim()) {
    const cleanTitle = stripMarkdownFormatting(matchingSection.title).trim();
    const isEnglishDefault = /^(?:PROFESSIONAL\s*SUMMARY|CORE\s*SKILLS|PROFESSIONAL\s*EXPERIENCE|FEATURED\s*PROJECTS|EDUCATION|LANGUAGES)$/i.test(cleanTitle);
    if (!isEnglishDefault || lang === 'en') {
      return cleanTitle.toUpperCase();
    }
  }

  const langTitles = DEFAULT_SECTION_TITLES[lang] || DEFAULT_SECTION_TITLES.en;
  return langTitles[type];
}

/**
 * Strips inline markdown formatting (**bold**, *italic*, [link](url), `code`) from a string.
 */
export function stripMarkdownFormatting(text: string): string {
  if (!text) return '';
  return text
    // Remove HTML comments <!-- ... -->
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace markdown links [label](url) with "label (url)" or just label if same
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      if (label.trim().toLowerCase() === url.trim().toLowerCase()) return label.trim();
      return `${label.trim()} (${url.trim()})`;
    })
    // Remove bold and italics
    .replace(/(\*\*|\*|__|_)(.*?)\1/g, '$2')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Clean up excessive whitespace
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Generates an ATS-compliant Plain Text (.txt) resume representation.
 * Designed for direct copy-pasting into legacy and modern ATS input boxes
 * (Workday, Taleo, Greenhouse, Lever, SAP SuccessFactors) and invisible PDF text layer.
 */
export function generatePlainTextCv(data: CVData): string {
  const lines: string[] = [];
  const divider = '============================================================';
  const subDivider = '------------------------------------------------------------';
  const lang: SupportedLanguage = data.language || 'es';

  // 1. Header (Candidate Name & Headline)
  if (data.name) {
    lines.push(data.name.toUpperCase());
  }
  if (data.title) {
    lines.push(stripMarkdownFormatting(data.title));
  }

  // 2. Contacts (Normalized without mailto duplication and preserving phone, LinkedIn, GitHub)
  if (data.contacts && data.contacts.length > 0) {
    const contactParts = data.contacts
      .map((c) => {
        const rawLabel = stripMarkdownFormatting(c.label || '').trim();
        const rawUrl = c.url?.trim() || '';

        if (c.type === 'email') {
          return rawLabel.replace(/^mailto:/i, '').trim() || rawUrl.replace(/^mailto:/i, '').trim();
        }

        if (c.type === 'phone') {
          return rawLabel.replace(/^tel:/i, '').trim();
        }

        if (c.type === 'linkedin') {
          const url = rawUrl.startsWith('http') ? rawUrl : rawUrl ? `https://${rawUrl}` : '';
          return url ? `LinkedIn: ${url}` : `LinkedIn: ${rawLabel}`;
        }

        if (c.type === 'github') {
          const url = rawUrl.startsWith('http') ? rawUrl : rawUrl ? `https://${rawUrl}` : '';
          return url ? `GitHub: ${url}` : `GitHub: ${rawLabel}`;
        }

        if (c.type === 'location') {
          return rawLabel;
        }

        if (c.type === 'globe') {
          const url = rawUrl.startsWith('http') ? rawUrl : rawUrl ? `https://${rawUrl}` : '';
          return url ? `Portfolio: ${url}` : rawLabel;
        }

        if (rawUrl) {
          const cleanU = rawUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
          const cleanL = rawLabel.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
          if (cleanL === cleanU || !rawLabel) {
            return rawUrl;
          }
          return `${rawLabel}: ${rawUrl}`;
        }

        return rawLabel;
      })
      .filter(Boolean);

    if (contactParts.length > 0) {
      lines.push(contactParts.join(' | '));
    }
  }

  // 3. Personal & Legal Details (Crucial for Swiss & European ATS parsing)
  const cleanData = sanitizeLegalMetadata(data);
  const personalDetails: string[] = [];

  const isSwissCitizen =
    /(suisse|swiss|schweiz|svizzera)/i.test(cleanData.nationality || '') ||
    Boolean(cleanData.placeOfOrigin) ||
    /(suisse|swiss|schweiz|svizzera|citoyen|citizen)/i.test(cleanData.workPermit || '');

  const isPermitRedundant =
    isSwissCitizen &&
    Boolean(cleanData.nationality && /(suisse|swiss|schweiz|svizzera)/i.test(cleanData.nationality)) &&
    /(citoyen|citizen|suisse|swiss|don['’]?t require|aucun permis|no\s*(?:work)?\s*permit|sans permis|keine\s*(?:arbeits)?bewilligung|sin permiso|nessun permesso)/i.test(cleanData.workPermit || '');

  if (cleanData.nationality) {
    const natLabel = lang === 'fr' ? 'Nationalité' : lang === 'es' ? 'Nacionalidad' : lang === 'de' ? 'Nationalität' : lang === 'it' ? 'Nazionalità' : 'Nationality';
    personalDetails.push(`${natLabel}: ${stripMarkdownFormatting(cleanData.nationality)}`);
  }
  if (cleanData.placeOfOrigin) {
    const originLabel = lang === 'fr' ? "Lieu d'origine" : lang === 'de' ? 'Heimatort' : lang === 'es' ? 'Lugar de origen' : lang === 'it' ? "Luogo d'origine" : 'Place of Origin';
    const cleanOrigin = cleanPlaceOfOrigin(stripMarkdownFormatting(cleanData.placeOfOrigin));
    if (cleanOrigin) {
      personalDetails.push(`${originLabel}: ${cleanOrigin}`);
    }
  }
  if (cleanData.workPermit && !isPermitRedundant) {
    const permitLabel = lang === 'fr' ? 'Permis de travail' : lang === 'es' ? 'Permiso de trabajo' : lang === 'de' ? 'Arbeitsbewilligung' : lang === 'it' ? 'Permesso di lavoro' : 'Work Permit';
    personalDetails.push(`${permitLabel}: ${stripMarkdownFormatting(cleanData.workPermit)}`);
  }
  if (cleanData.availability) {
    const availLabel = lang === 'fr' ? 'Disponibilité' : lang === 'es' ? 'Disponibilidad' : lang === 'de' ? 'Verfügbarkeit' : lang === 'it' ? 'Disponibilità' : 'Availability';
    personalDetails.push(`${availLabel}: ${stripMarkdownFormatting(cleanData.availability)}`);
  }
  if (cleanData.civilStatus) {
    const csLabel = lang === 'fr' ? 'État civil' : lang === 'es' ? 'Estado civil' : lang === 'de' ? 'Zivilstand' : lang === 'it' ? 'Stato civile' : 'Civil Status';
    personalDetails.push(`${csLabel}: ${stripMarkdownFormatting(cleanData.civilStatus)}`);
  }
  if (cleanData.drivingLicense) {
    const dlLabel = lang === 'fr' ? 'Permis de conduire' : lang === 'es' ? 'Licencia de conducir' : lang === 'de' ? 'Führerschein' : lang === 'it' ? 'Patente' : 'Driving License';
    personalDetails.push(`${dlLabel}: ${stripMarkdownFormatting(cleanData.drivingLicense)}`);
  }
  if (cleanData.dateOfBirth) {
    const dobLabel = lang === 'fr' ? 'Date de naissance' : lang === 'es' ? 'Fecha de nacimiento' : lang === 'de' ? 'Geburtsdatum' : lang === 'it' ? 'Data di nascita' : 'Date of Birth';
    personalDetails.push(`${dobLabel}: ${stripMarkdownFormatting(cleanData.dateOfBirth)}`);
  }

  if (personalDetails.length > 0) {
    lines.push(personalDetails.join(' | '));
  }

  // 4. Professional Summary
  if (data.summary && data.summary.trim()) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'summary', lang));
    lines.push(divider);
    lines.push(stripMarkdownFormatting(data.summary.trim()));
  }

  // 5. Skills
  if (data.skillGroups && data.skillGroups.length > 0) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'skills', lang));
    lines.push(divider);
    for (const group of data.skillGroups) {
      const cat = stripMarkdownFormatting(group.category || 'Competencies').replace(/[:*_\s]+$/, '');
      const skls = (group.skills || [])
        .map((s) => stripMarkdownFormatting(s).replace(/^[:*_\s]+/, '').replace(/[:*_\s]+$/, ''))
        .filter(Boolean)
        .join(', ');
      lines.push(`• ${cat}: ${skls}`);
    }
  }

  // 6. Professional Experience
  if (data.experience && data.experience.length > 0) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'experience', lang));
    lines.push(divider);

    data.experience.forEach((exp, idx) => {
      if (idx > 0) lines.push('');
      const comp = stripMarkdownFormatting(exp.company || 'Organization');
      const loc = exp.location ? ` | ${stripMarkdownFormatting(exp.location)}` : '';
      const role = stripMarkdownFormatting(exp.role || 'Specialist');
      const date = exp.date ? ` | ${stripMarkdownFormatting(exp.date)}` : '';

      lines.push(`${comp}${loc}`);
      lines.push(`${role}${date}`);
      lines.push(subDivider);

      for (const b of exp.bullets || []) {
        const cleanBullet = stripMarkdownFormatting(b.replace(/^[-*•]\s*/, ''));
        if (cleanBullet) {
          lines.push(`  • ${cleanBullet}`);
        }
      }
    });
  }

  // 7. Featured Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'projects', lang));
    lines.push(divider);

    data.projects.forEach((proj, idx) => {
      if (idx > 0) lines.push('');
      const name = stripMarkdownFormatting(proj.company || 'Project');
      const role = proj.role ? ` (${stripMarkdownFormatting(proj.role)})` : '';
      const links: string[] = [];
      if (proj.demoUrl) links.push(`Demo: ${proj.demoUrl}`);
      if (proj.repoUrl) links.push(`Repo: ${proj.repoUrl}`);
      const linkText = links.length > 0 ? ` [${links.join(' | ')}]` : '';

      lines.push(`${name}${role}${linkText}`);
      for (const b of proj.bullets || []) {
        const cleanBullet = stripMarkdownFormatting(b.replace(/^[-*•]\s*/, ''));
        if (cleanBullet) {
          lines.push(`  • ${cleanBullet}`);
        }
      }
    });
  }

  // 8. Education & Certifications
  if ((data.education && data.education.length > 0) || (data.certifications && data.certifications.length > 0)) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'education', lang));
    lines.push(divider);

    for (const edu of data.education || []) {
      const cleanEdu = stripMarkdownFormatting(edu.replace(/^[-*•]\s*/, ''));
      if (cleanEdu) lines.push(`• ${cleanEdu}`);
    }

    for (const cert of data.certifications || []) {
      const cleanCert = stripMarkdownFormatting(cert.replace(/^[-*•]\s*/, ''));
      if (cleanCert) lines.push(`• ${cleanCert}`);
    }
  }

  // 9. Languages
  if (data.languages && data.languages.length > 0) {
    lines.push('');
    lines.push(divider);
    lines.push(resolveExportTitle(data, 'languages', lang));
    lines.push(divider);
    for (const l of data.languages) {
      const cleanLang = stripMarkdownFormatting(l.replace(/^[-*•]\s*/, ''));
      if (cleanLang) lines.push(`• ${cleanLang}`);
    }
  }

  // 10. Custom or Additional Generic Sections
  const knownSectionTypes = new Set(['summary', 'skills', 'experience', 'projects', 'education', 'languages', 'references']);
  const hiddenSectionsSet = new Set(data.hiddenSections || []);
  const customSections = (data.sections || []).filter(
    (s) =>
      !knownSectionTypes.has(s.type) &&
      s.type !== 'references' &&
      !/reference|r[ée]f[ée]rence/i.test(s.id) &&
      !/reference|r[ée]f[ée]rence/i.test(s.title || '') &&
      !hiddenSectionsSet.has(s.id) &&
      !hiddenSectionsSet.has(s.type) &&
      s.rawContent?.trim()
  );

  for (const cSec of customSections) {
    lines.push('');
    lines.push(divider);
    lines.push(stripMarkdownFormatting(cSec.title || 'ADDITIONAL INFORMATION').toUpperCase());
    lines.push(divider);
    const cleanContent = stripMarkdownFormatting(cSec.rawContent || '').trim();
    if (cleanContent) {
      lines.push(cleanContent);
    }
  }

  // 11. References (Swiss & European standard)
  const isRefHidden = data.hiddenSections?.includes('references') || data.hiddenDetails?.includes('references');
  const refRaw = data.references || data.sections?.find((s) => s.type === 'references' || /reference|r[ée]f[ée]rence/i.test(s.id))?.rawContent;
  if (refRaw && !isRefHidden) {
    lines.push('');
    lines.push(divider);
    const refTitle = lang === 'fr' ? 'RÉFÉRENCES' : lang === 'de' ? 'REFERENZEN' : lang === 'es' ? 'REFERENCIAS' : lang === 'it' ? 'REFERENZE' : 'REFERENCES';
    lines.push(refTitle);
    lines.push(divider);
    const cleanRef = stripMarkdownFormatting(getLocalizedReferences(refRaw.replace(/^[-*•]\s*/, '').trim(), lang));
    if (cleanRef) {
      lines.push(`• ${cleanRef}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}
