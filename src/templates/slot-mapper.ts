import { CVData, ContactItem, SectionType, SkillCategory } from '../types/cv';
import { 
  CVSlotMap, 
  HeaderSlotData, 
  SummarySlotData, 
  SkillsSlotData, 
  ExperienceSlotData, 
  ListSlotData, 
  GenericSlotData 
} from './types';
import { LANGUAGE_DEFINITIONS, SupportedLanguage, DetectedLanguage } from '../constants/languages';
import { normalizeSkillCategory } from '../core/parser/markdownToCvData';
import { resolveContactDisplay } from '../utils/sanitize';

/**
 * Normalizes contact item labels to clean human-friendly badges/handles (LinkedIn, GitHub, Portfolio)
 * while ensuring valid fully qualified URLs (https://, mailto:, tel:).
 */
function cleanContactDisplayLabel(c: ContactItem): ContactItem {
  const resolved = resolveContactDisplay(c);
  return {
    ...c,
    label: resolved.displayLabel,
    url: resolved.url || c.url
  };
}

export function isStandardDefaultSectionTitle(clean: string): boolean {
  return (
    /^(?:PROFESSIONAL\s+SUMMARY(?:\s*&\s*PITCH)?|SUMMARY(?:\s*&\s*OBJECTIVE)?|RESUMEN\s+PROFESIONAL|ZUSAMMENFASSUNG|RÉSUMÉ\s+PROFESSIONNEL|PROFIL\s+PROFESSIONNEL|SOMMARIO\s+PROFESSIONALE|PROFILO\s+PROFESSIONALE|KURZPROFIL)$/i.test(clean) ||
    /^(?:(?:CORE\s+)?SKILLS(?:\s*&\s*(?:COMPETENCIES|EXPERTISE))?|TECHNICAL\s+SKILLS|HABILIDADES\s+TÉCNICAS|KENNTNISSE|IT-KENNTNISSE(?:\s*&\s*FÄHIGKEITEN)?|COMPÉTENCES(?:\s+CL[ÉE]S|\s+TECHNIQUES)?|COMPETENZE(?:\s+TECNICHE)?)$/i.test(clean) ||
    /^(?:(?:CAREER\s+HISTORY|WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE)(?:\s*&\s*KEY\s*ACHIEVEMENTS)?|EXPERIENCE|EXPERIENCIA\s+LABORAL|BERUFSERFAHRUNG|BERUFLICHER\s+WERDEGANG|EXPÉRIENCE(?:\s+PROFESSIONNELLE)?|ESPERIENZA(?:\s+PROFESSIONALE)?)$/i.test(clean) ||
    /^(?:(?:FEATURED\s+)?PROJECTS(?:\s*&\s*EXTRAS)?|PROJECTS|PROYECTOS(?:\s+DESTACADOS)?|PROJEKTE|AUSGEWÄHLTE\s+PROJEKTE|PROJETS(?:\s+NOTABLES)?|PROGETTI(?:\s+PRINCIPALI)?)$/i.test(clean) ||
    /^(?:EDUCATION(?:\s*&\s*CERTIFICATIONS)?|ACADEMIC\s+BACKGROUND|EDUCACIÓN(?:\s*Y\s*CERTIFICACIONES)?|AUSBILDUNG(?:\s*&\s*ZERTIFIZIERUNGEN)?|FORMATION(?:\s*&\s*DIPLÔMES|\s*&\s*CERTIFICATIONS)?|ISTRUZIONE(?:\s*E\s*CERTIFICAZIONI)?)$/i.test(clean) ||
    /^(?:LANGUAGES?|IDIOMAS?|SPRACHEN?|SPRACHKENNTNISSE|LANGUES?|LINGUE?)$/i.test(clean) ||
    /^(?:WEBSITES(?:,\s*PORTFOLIOS)?(?:,\s*PROFILES)?|SITIOS\s+WEB(?:\s+Y\s+PERFILES)?|PORTFOLIOS?|PROFILES?|SITES\s+WEB|WEBSITES\s*&\s*PROFILE|SITI\s+WEB)$/i.test(clean) ||
    /^(?:REFERENCES?|R[ÉE]F[ÉE]RENCES?|REFERENZEN|REFERENCIAS|REFERENZE)$/i.test(clean)
  );
}

/**
 * Resolves section title, converting untranslated English default titles to the active document language
 * while stripping informal emojis to guarantee clean, professional, ATS-compliant section headers.
 */
function resolveSectionTitle(
  type: SectionType,
  explicitCustom: string | undefined,
  rawTitle: string | undefined,
  langDef: DetectedLanguage
): string {
  const candidate = (explicitCustom && explicitCustom.trim()) || (rawTitle && rawTitle.trim()) || '';
  const defaultText = langDef.sections[type as keyof typeof langDef.sections] || type.toUpperCase();

  if (!candidate) {
    return defaultText;
  }

  // Strip any leading emojis, pictographs, symbols (#, _, -, bullet points)
  const cleanTitle = candidate.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s*#_\-–—|•·:]+/u, '').trim();

  // If candidate is a known default/standard section title, render in the active language
  if (isStandardDefaultSectionTitle(cleanTitle)) {
    return defaultText;
  }

  // User entered a truly custom section title - preserve it without leading emojis
  return cleanTitle || defaultText;
}

/**
 * Normalizes and heals skill groups, repairing any unparsed categories or comma-split bullets
 */
function cleanSkillGroups(groups: SkillCategory[], lang: SupportedLanguage): SkillCategory[] {
  const result: SkillCategory[] = [];
  for (const group of groups) {
    const rawCat = (group.category || '').trim();
    const hasColonItems = group.skills.some((s) => /:\s*/.test(s));
    const isGenericCat = /^(?:CORE\s*)?SKILLS|HABILIDADES(?:\s*TÉCNICAS)?$/i.test(rawCat.replace(/[*_`:]/g, '').trim());

    if (isGenericCat && hasColonItems) {
      let currentCat = normalizeSkillCategory(rawCat, lang);
      let currentSkills: string[] = [];

      for (const skill of group.skills) {
        const colonMatch = skill.match(/^\*{0,2}(.*?)(?::\*{0,2}|\*{0,2}:)\s*(.+)$/);
        if (colonMatch) {
          const combinedCat =
            currentSkills.length > 0 && currentSkills.every((s) => s.length < 35)
              ? [...currentSkills, colonMatch[1]].join(', ')
              : colonMatch[1];
          currentCat = normalizeSkillCategory(combinedCat, lang);
          currentSkills = [];
          const subSkills = colonMatch[2]
            .split(/[,|•·;]/)
            .map((s) => s.replace(/[*_`]/g, '').trim())
            .filter(Boolean);
          currentSkills.push(...subSkills);
        } else {
          currentSkills.push(skill.replace(/[*_`]/g, '').trim());
        }
      }
      if (currentSkills.length > 0) {
        result.push({ category: currentCat, skills: currentSkills });
      }
    } else {
      result.push({
        ...group,
        category: normalizeSkillCategory(rawCat, lang),
        skills: group.skills.map((s) => s.replace(/[*_`]/g, '').trim()).filter(Boolean),
      });
    }
  }
  return result;
}

/**
 * Maps raw CVData into a strongly-typed, structured Slot Map with full language synchronization
 */
export function mapDataToSlots(data: CVData, language?: SupportedLanguage): CVSlotMap {
  const lang: SupportedLanguage = language || data.language || 'es';
  const langDef = LANGUAGE_DEFINITIONS[lang] || LANGUAGE_DEFINITIONS.es;

  // Collect all project live demos and repository URLs to ensure project links
  // never leak into the candidate's personal contact column
  const projectUrls = new Set<string>();
  const addProjectUrl = (u?: string) => {
    if (!u) return;
    const clean = u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (clean) projectUrls.add(clean);
  };

  for (const proj of data.projects || []) {
    addProjectUrl(proj.demoUrl);
    addProjectUrl(proj.repoUrl);
  }
  for (const exp of data.experience || []) {
    addProjectUrl(exp.demoUrl);
    addProjectUrl(exp.repoUrl);
  }
  for (const sec of data.sections || []) {
    if (sec.type === 'projects' && sec.rawContent) {
      const urls = sec.rawContent.match(/https?:\/\/[^\s)\]]+/g) || [];
      for (const u of urls) addProjectUrl(u);
    }
  }

  const isProjectUrl = (c: ContactItem): boolean => {
    const rawUrl = (c.url || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const rawLabel = (c.label || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (projectUrls.has(rawUrl) || projectUrls.has(rawLabel)) return true;
    for (const pUrl of projectUrls) {
      if (rawUrl && (rawUrl === pUrl || rawUrl.includes(pUrl) || pUrl.includes(rawUrl))) return true;
      if (rawLabel && (rawLabel === pUrl || rawLabel.includes(pUrl) || pUrl.includes(rawLabel))) return true;
    }
    return false;
  };

  const header: HeaderSlotData = {
    name: data.name || 'Candidate',
    title: data.title,
    contacts: (data.contacts || [])
      .filter((c) => !isProjectUrl(c))
      .map(cleanContactDisplayLabel),
    photo: data.photo,
    nationality: data.nationality,
    placeOfOrigin: data.placeOfOrigin,
    dateOfBirth: data.dateOfBirth,
    drivingLicense: data.drivingLicense,
    workPermit: data.workPermit,
    civilStatus: data.civilStatus,
    availability: data.availability,
    references: data.references,
    hiddenDetails: data.hiddenDetails || [],
  };

  let summary: SummarySlotData | undefined;
  let skills: SkillsSlotData | undefined;
  let experience: ExperienceSlotData | undefined;
  let projects: ExperienceSlotData | undefined;
  let education: ListSlotData | undefined;
  let languages: ListSlotData | undefined;
  const genericSections: GenericSlotData[] = [];

  const localizedSkillGroups = cleanSkillGroups(data.skillGroups || [], lang);

  for (const section of data.sections || []) {
    const sectionTitle = resolveSectionTitle(
      section.type,
      data.sectionTitles?.[section.type] || data.sectionTitles?.[section.id],
      section.title,
      langDef
    );
    switch (section.type) {
      case 'summary':
        summary = {
          title: sectionTitle,
          rawContent: data.summary || section.rawContent || ''
        };
        break;

      case 'skills':
        if (localizedSkillGroups.length > 0 && !skills) {
          skills = {
            title: sectionTitle,
            skillGroups: localizedSkillGroups
          };
        }
        break;

      case 'experience':
        if (data.experience && data.experience.length > 0) {
          experience = {
            title: sectionTitle,
            items: data.experience,
            type: 'experience'
          };
        } else if (section.rawContent) {
          genericSections.push({
            id: section.id,
            title: sectionTitle,
            rawContent: section.rawContent
          });
        }
        break;

      case 'projects':
        if (data.projects && data.projects.length > 0) {
          projects = {
            title: sectionTitle,
            items: data.projects,
            type: 'projects'
          };
        } else if (section.rawContent) {
          genericSections.push({
            id: section.id,
            title: sectionTitle,
            rawContent: section.rawContent
          });
        }
        break;

      case 'education':
        if (data.education && data.education.length > 0) {
          if (!education) {
            education = {
              title: sectionTitle,
              items: data.education,
              type: 'education'
            };
          }
        } else if (section.rawContent) {
          genericSections.push({
            id: section.id,
            title: sectionTitle,
            rawContent: section.rawContent
          });
        }
        break;

      case 'languages':
        if ((data.languageItems && data.languageItems.length > 0) || (data.languages && data.languages.length > 0)) {
          languages = {
            title: sectionTitle,
            items: data.languages || [],
            languageItems: data.languageItems,
            type: 'languages'
          };
        } else if (section.rawContent) {
          genericSections.push({
            id: section.id,
            title: sectionTitle,
            rawContent: section.rawContent
          });
        }
        break;

      default:
        if (/reference|r[ée]f[ée]rence/i.test(section.id) || /reference|r[ée]f[ée]rence/i.test(sectionTitle)) {
          break;
        }
        genericSections.push({
          id: section.id,
          title: sectionTitle,
          rawContent: section.rawContent || ''
        });
        break;
    }
  }

  // Resilient Fallbacks: If sections array was empty or omitted any domain section,
  // map directly from data properties (summary, skillGroups, experience, projects, education, languages)
  if (!summary && data.summary && data.summary.trim()) {
    summary = {
      title: resolveSectionTitle('summary', data.sectionTitles?.['summary'], undefined, langDef),
      rawContent: data.summary,
    };
  }

  if (!skills && localizedSkillGroups.length > 0) {
    skills = {
      title: resolveSectionTitle('skills', data.sectionTitles?.['skills'], undefined, langDef),
      skillGroups: localizedSkillGroups,
    };
  }

  if (!experience && data.experience && data.experience.length > 0) {
    experience = {
      title: resolveSectionTitle('experience', data.sectionTitles?.['experience'], undefined, langDef),
      items: data.experience,
      type: 'experience',
    };
  }

  if (!projects && data.projects && data.projects.length > 0) {
    projects = {
      title: resolveSectionTitle('projects', data.sectionTitles?.['projects'], undefined, langDef),
      items: data.projects,
      type: 'projects',
    };
  }

  if (!education && ((data.education && data.education.length > 0) || (data.certifications && data.certifications.length > 0))) {
    const combinedEdu = [
      ...(data.education || []),
      ...(data.certifications && data.certifications.length > 0 && !data.customSections?.some((c) => c.presetType === 'certifications') ? data.certifications : []),
    ];
    if (combinedEdu.length > 0) {
      education = {
        title: resolveSectionTitle('education', data.sectionTitles?.['education'], undefined, langDef),
        items: combinedEdu,
        type: 'education',
      };
    }
  } else if (education && data.certifications && data.certifications.length > 0 && !data.customSections?.some((c) => c.presetType === 'certifications')) {
    const existing = new Set(education.items);
    const newCerts = data.certifications.filter((c) => !existing.has(c));
    if (newCerts.length > 0) {
      education = {
        ...education,
        items: [...education.items, ...newCerts],
      };
    }
  }

  if (!languages && ((data.languageItems && data.languageItems.length > 0) || (data.languages && data.languages.length > 0))) {
    languages = {
      title: resolveSectionTitle('languages', data.sectionTitles?.['languages'], undefined, langDef),
      items: data.languages || [],
      languageItems: data.languageItems,
      type: 'languages',
    };
  }

  // Ensure live-edited customSections are mapped to genericSections without informal emojis
  if (data.customSections && data.customSections.length > 0) {
    const existingIds = new Set(genericSections.map(g => g.id));
    for (const custom of data.customSections) {
      if (!existingIds.has(custom.id) && custom.title && custom.items && custom.items.length > 0) {
        const cleanTitle = custom.title.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s*#_\-–—|•·:]+/u, '').trim();
        genericSections.push({
          id: custom.id,
          title: cleanTitle || custom.presetType?.toUpperCase() || 'SECTION',
          rawContent: custom.items.map(i => `- ${i}`).join('\n')
        });
      }
    }
  }

  const hidden = new Set(data.hiddenSections || []);

  return {
    header,
    summary: hidden.has('summary') ? undefined : summary,
    skills: hidden.has('skills') ? undefined : skills,
    experience: hidden.has('experience') ? undefined : experience,
    projects: hidden.has('projects') ? undefined : projects,
    education: hidden.has('education') ? undefined : education,
    languages: hidden.has('languages') ? undefined : languages,
    genericSections: genericSections.filter(g => !hidden.has(g.id) && !hidden.has(g.title?.toLowerCase())),
    photo: data.photo,
    websitesTitle: data.sectionTitles?.['websites'] || langDef.sections.websites,
    language: lang,
    hiddenSections: data.hiddenSections || [],
  };
}
