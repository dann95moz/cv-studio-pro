import { CVData } from '../../types/cv';
import { cleanHumanText } from './metadataExtractor';
import { APP_LINKS } from '../../constants/links';

/**
 * Strips raw markdown headers (e.g. "## Professional Summary"), label prefixes ("**Summary:**"),
 * dividers, and markdown formatting wrappers from summary text.
 */
export function cleanSummary(summary: string): string {
  if (!summary) return '';
  let clean = summary.trim();

  // Strip markdown headers like "## Summary", "### Resumen Profesional"
  clean = clean.replace(/^#{1,6}\s+[^\n]*\n+/gm, '').trim();

  // Strip label prefixes like "**Summary:**", "**Summary**:", "**Resumen:**", "Summary:"
  clean = clean.replace(/^\*{0,2}(?:Resumen(?:\s+Profesional|\s+Ejecutivo)?|Professional\s+Summary|Executive\s+Summary|Perfil(?:\s+Profesional)?|Summary|Profil|Zusammenfassung|Sommario)(?::\*{0,2}|\*{0,2}:)\s*(\r?\n)?/i, '').trim();

  // Strip divider lines "---" or "==="
  clean = clean.replace(/^[-=_]{3,}\s*$/gm, '').trim();

  // Strip outer and inline markdown bolding, italics, and code markers
  clean = clean
    .replace(/\\([\[\]+*`_~\\-])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\[\]]/g, '');

  // Strip any leftover leading asterisks, bullets, or headers
  clean = clean.replace(/^[*_`#\s]+/, '').replace(/[*_`\s]+$/, '').trim();

  return clean;
}

/**
 * Strips leading bullet characters (- , * , • , · , + , or 1. ) and markdown bolding from bullet text.
 */
export function cleanBulletText(bullet: string): string {
  if (!bullet) return '';
  return bullet
    .replace(/^(?:[-*•·+]|\d+\.)\s+/, '')
    .replace(/\\([\[\]+*`_~\\-])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\[\]]/g, '')
    .trim();
}

/**
 * Cleans individual skill tag (stripping *, _, `, brackets, leading bullet dashes).
 */
export function cleanSkillItem(skill: string): string {
  if (!skill) return '';
  return skill
    .replace(/^[-*•·+]\s*/, '')
    .replace(/[*_`]/g, '')
    .replace(/[\[\]]/g, '')
    .trim();
}

/**
 * Cleans skill category title (stripping *, _, `, #, brackets, leading bullet dashes, trailing colons).
 */
export function cleanSkillCategory(category: string): string {
  if (!category) return '';
  return category
    .replace(/^[-*•·+]\s*/, '')
    .replace(/[*_`#]/g, '')
    .replace(/[\[\]]/g, '')
    .replace(/[:\s]+$/, '')
    .trim();
}

/**
 * Cleans education / certification item string into pure human-readable text.
 */
export function cleanEducationItem(item: string): string {
  if (!item) return '';
  let clean = item.replace(/^(?:[-–—•·+]|\*(?!\*))\s*/, '').trim();
  clean = clean.replace(/\[([^\]]+)\](?!\()/g, '$1');
  clean = clean
    .replace(/\\([\[\]+*`_~\\-])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\[\]]/g, '')
    .trim();
  return clean;
}

/**
 * Cleans language item string into pure human-readable text (Language: Level).
 */
export function cleanLanguageItem(item: string): string {
  if (!item) return '';
  let clean = item.replace(/^(?:[-–—•·+]|\*(?!\*))\s*/, '').trim();
  clean = clean.replace(/\[([^\]]+)\](?!\()/g, '$1');
  clean = clean
    .replace(/\\([\[\]+*`_~\\-])/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\[\]]/g, '')
    .trim();
  return clean;
}

/**
 * Normalizes all fields of CVData to ensure clean human-readable text
 * with no rogue underscores, clean monograms, and consistent structure.
 */
export function cleanCvData(data: CVData): CVData {
  if (!data) return data;

  // Collect project URLs to prevent project live demos from leaking into candidate personal contacts
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

  const isProjectUrl = (c: { url?: string; label?: string }): boolean => {
    const rawUrl = (c.url || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const rawLabel = (c.label || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (projectUrls.has(rawUrl) || projectUrls.has(rawLabel)) return true;
    for (const pUrl of projectUrls) {
      if (rawUrl && (rawUrl === pUrl || rawUrl.includes(pUrl) || pUrl.includes(rawUrl))) return true;
      if (rawLabel && (rawLabel === pUrl || rawLabel.includes(pUrl) || pUrl.includes(rawLabel))) return true;
    }
    return false;
  };

  return {
    ...data,
    name: cleanHumanText(data.name || ''),
    title: cleanHumanText(data.title || ''),
    summary: cleanSummary(data.summary || ''),
    contacts: data.contacts
      ?.filter((c) => !isProjectUrl(c))
      .map((c) => {
        let resolvedUrl = c.url?.trim();
        const rawLbl = (c.label || '').trim();
        if (!resolvedUrl) {
          if (c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') {
            if (rawLbl.includes('.') || rawLbl.startsWith('http')) {
              resolvedUrl = rawLbl.startsWith('http') ? rawLbl : `https://${rawLbl.replace(/^https?:\/\//, '')}`;
            }
          } else if (c.type === 'email' && rawLbl.includes('@')) {
            resolvedUrl = rawLbl.startsWith('mailto:') ? rawLbl : `mailto:${rawLbl.replace(/^mailto:/i, '')}`;
          }
        } else if ((c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') && !resolvedUrl.startsWith('http')) {
          resolvedUrl = `https://${resolvedUrl}`;
        }
        return {
          ...c,
          label: c.type === 'location' || c.type === 'phone' || c.type === 'text'
            ? cleanHumanText(c.label || '')
            : cleanHumanText(c.label || '').replace(/\s+/g, c.type === 'email' ? '' : ' '),
          url: resolvedUrl,
        };
      }),
    skillGroups: data.skillGroups?.map((group) => ({
      ...group,
      category: cleanSkillCategory(group.category),
      skills: (group.skills || []).map(cleanSkillItem).filter(Boolean),
    })),
    experience: data.experience?.map((exp) => ({
      ...exp,
      company: cleanHumanText(exp.company || ''),
      role: cleanHumanText(exp.role || ''),
      location: exp.location ? cleanHumanText(exp.location) : exp.location,
      date: exp.date ? cleanHumanText(exp.date) : exp.date,
      bullets: (exp.bullets || []).map(cleanBulletText).filter(Boolean),
    })),
    projects: data.projects?.map((proj) => {
      let demoUrl = proj.demoUrl?.trim();
      let repoUrl = proj.repoUrl?.trim();

      if (!demoUrl && proj.location) {
        const demoM = proj.location.match(/\[(?:Live\s*Demo|Demo|Sitio|Web)[^\]]*\]\(([^)]+)\)/i) ||
                      proj.location.match(/https?:\/\/(?!github\.com)[^\s)\]•|]+/i);
        if (demoM) demoUrl = (demoM[1] || demoM[0]).trim();
      }
      if (!repoUrl && proj.location) {
        const repoM = proj.location.match(/\[(?:GitHub(?:\s*Repository)?|Repo|Source)[^\]]*\]\(([^)]+)\)/i) ||
                      proj.location.match(/https?:\/\/github\.com\/[^\s)\]•|]+/i);
        if (repoM) repoUrl = (repoM[1] || repoM[0]).trim();
      }

      const compLower = (proj.company || '').toLowerCase();
      if (compLower.includes('cv studio') || compLower.includes('tailor engine')) {
        if (!demoUrl) demoUrl = APP_LINKS.DEMO_URL;
        if (!repoUrl) repoUrl = APP_LINKS.GITHUB_REPO;
      }

      let cleanLoc = proj.location ? cleanHumanText(proj.location) : '';
      if (
        cleanLoc.includes('Live Demo') ||
        cleanLoc.includes('GitHub Repository') ||
        cleanLoc.startsWith('http') ||
        cleanLoc.includes('github.com') ||
        cleanLoc === 'Demo' ||
        cleanLoc === 'Repo'
      ) {
        cleanLoc = cleanLoc
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '')
          .replace(/Live\s*Demo/gi, '')
          .replace(/GitHub(?:\s*Repository)?/gi, '')
          .replace(/https?:\/\/[^\s]+/g, '')
          .replace(/[•|·+–—/]/g, '')
          .trim();
      }
      if (/^[•|·+–—/\s]+$/.test(cleanLoc) || cleanLoc === '+' || cleanLoc === '-') {
        cleanLoc = '';
      }

      return {
        ...proj,
        company: cleanHumanText(proj.company || ''),
        role: cleanHumanText(proj.role || ''),
        location: cleanLoc || undefined,
        date: proj.date ? cleanHumanText(proj.date) : proj.date,
        demoUrl: demoUrl || undefined,
        repoUrl: repoUrl || undefined,
        bullets: (proj.bullets || []).map(cleanBulletText).filter(Boolean),
      };
    }),
    education: data.education?.map(cleanEducationItem).filter(Boolean),
    certifications: data.certifications?.map(cleanEducationItem).filter(Boolean),
    languages: data.languages?.map(cleanLanguageItem).filter(Boolean),
    customSections: data.customSections?.map((sec) => ({
      ...sec,
      title: cleanHumanText(sec.title),
      items: (sec.items || []).map(cleanBulletText).filter(Boolean),
    })),
  };
}
