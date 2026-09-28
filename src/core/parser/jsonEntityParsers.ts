import { ContactItem, ContactType, ExperienceItem, SkillCategory, CVData } from '../../types/cv';
import { SupportedLanguage } from '../../constants/languages';
import { APP_LINKS } from '../../constants/links';
import { cleanHumanText } from './metadataExtractor';
import {
  cleanBulletText,
  cleanSkillCategory,
  cleanSkillItem,
  cleanEducationItem,
  cleanLanguageItem,
} from './cvSanitizers';
import { normalizeSkillCategory } from './skillNormalizer';
import { inferContactType, normalizeContactUrl } from './contactParser';
import { cleanTrackingAndSearchUrl } from '../../utils/sanitize';
import { RawJsonCvInput } from './jsonToCvData';

/**
 * Extracts and normalizes contacts from raw JSON inputs, falling back to top-level fields
 * and master data enrichment.
 */
export function parseJsonContacts(
  root: RawJsonCvInput,
  fallbackCv?: CVData | null
): ContactItem[] {
  const contacts: ContactItem[] = [];
  const rawContacts = root.contacts || root.contact;

  if (Array.isArray(rawContacts)) {
    for (const c of rawContacts) {
      if (typeof c === 'string' && c.trim()) {
        const text = c.trim();
        if (!text.includes('[candidate') && !text.includes('[+1 (555)')) {
          const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            const label = linkMatch[1].trim();
            const rawUrl = linkMatch[2].trim();
            const type = inferContactType(label, rawUrl);
            contacts.push({ type, label, url: normalizeContactUrl(type, label, rawUrl) });
          } else {
            const type = inferContactType(text);
            contacts.push({ type, label: text, url: normalizeContactUrl(type, text) });
          }
        }
      } else if (c && typeof c === 'object') {
        const itemObj = c as { type?: ContactType; label?: string; value?: string; url?: string };
        const label = String(itemObj.label || itemObj.value || itemObj.url || '').trim();
        if (label && !label.includes('[candidate') && !label.includes('[+1 (555)')) {
          const type = itemObj.type || inferContactType(label, itemObj.url);
          contacts.push({
            type,
            label,
            url: normalizeContactUrl(type, label, itemObj.url),
          });
        }
      }
    }
  } else if (rawContacts && typeof rawContacts === 'object') {
    for (const [key, val] of Object.entries(rawContacts)) {
      if (typeof val === 'string' && val.trim()) {
        const k = key.toLowerCase();
        let type: ContactType = 'globe';
        if (k.includes('email') || k.includes('mail')) type = 'email';
        else if (k.includes('phone') || k.includes('tel') || k.includes('mobile') || k.includes('cel')) type = 'phone';
        else if (k.includes('loc') || k.includes('city') || k.includes('ubic')) type = 'location';
        else if (k.includes('linkedin')) type = 'linkedin';
        else if (k.includes('github')) type = 'github';
        else type = inferContactType(val);

        if (!val.includes('[candidate') && !val.includes('[+1 (555)')) {
          contacts.push({ type, label: val.trim(), url: normalizeContactUrl(type, val) });
        }
      }
    }
  }

  // Fallback to top-level contact fields
  if (!contacts.some((c) => c.type === 'email') && root.email && typeof root.email === 'string') {
    const cleanMail = cleanTrackingAndSearchUrl(root.email.trim());
    contacts.push({ type: 'email', label: cleanMail, url: `mailto:${cleanMail}` });
  }
  if (!contacts.some((c) => c.type === 'phone') && (root.phone || root.mobile)) {
    const cleanPhone = String(root.phone || root.mobile).trim();
    contacts.push({ type: 'phone', label: cleanPhone, url: `tel:${cleanPhone.replace(/[^\d+]/g, '')}` });
  }
  if (!contacts.some((c) => c.type === 'location') && (root.location || root.city)) {
    contacts.push({ type: 'location', label: String(root.location || root.city).trim() });
  }
  if (!contacts.some((c) => c.type === 'linkedin') && root.linkedin && typeof root.linkedin === 'string') {
    const cleanL = cleanTrackingAndSearchUrl(root.linkedin.trim());
    contacts.push({
      type: 'linkedin',
      label: cleanL,
      url: cleanL.startsWith('http') ? cleanL : `https://${cleanL}`,
    });
  }
  if (!contacts.some((c) => c.type === 'github') && root.github && typeof root.github === 'string') {
    const cleanG = cleanTrackingAndSearchUrl(root.github.trim());
    contacts.push({
      type: 'github',
      label: cleanG,
      url: cleanG.startsWith('http') ? cleanG : `https://${cleanG}`,
    });
  }
  if (!contacts.some((c) => c.type === 'globe') && (root.website || root.portfolio)) {
    const cleanW = cleanTrackingAndSearchUrl(String(root.website || root.portfolio).trim());
    contacts.push({
      type: 'globe',
      label: cleanW,
      url: cleanW.startsWith('http') ? cleanW : `https://${cleanW}`,
    });
  }

  // Collect project URLs to ensure project links never pollute candidate contacts
  const projectUrls = new Set<string>();
  const addProjectUrl = (u?: unknown) => {
    if (!u || typeof u !== 'string') return;
    const clean = u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (clean) projectUrls.add(clean);
  };
  const rawRoot = root as Record<string, unknown>;
  const rawProjList = root.projects || rawRoot.project || rawRoot.featuredProjects;
  if (Array.isArray(rawProjList)) {
    for (const p of rawProjList) {
      if (p && typeof p === 'object') {
        const pObj = p as Record<string, unknown>;
        addProjectUrl(pObj.demoUrl || pObj.website || pObj.liveUrl || pObj.url || pObj.link);
        addProjectUrl(pObj.repoUrl || pObj.github || pObj.repository || pObj.codeUrl || pObj.sourceUrl);
      }
    }
  }
  if (fallbackCv?.projects) {
    for (const fp of fallbackCv.projects) {
      addProjectUrl(fp.demoUrl);
      addProjectUrl(fp.repoUrl);
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

  // Enrich missing contacts from fallbackCv
  if (fallbackCv?.contacts && fallbackCv.contacts.length > 0) {
    for (const fc of fallbackCv.contacts) {
      if (isProjectUrl(fc)) continue;
      const existing = contacts.find((c) => c.type === fc.type);
      if (!existing) {
        contacts.push(fc);
      } else if (!existing.url && fc.url) {
        existing.url = fc.url;
      }
    }
  }

  return contacts.filter((c) => !isProjectUrl(c));
}

/**
 * Extracts and localizes skill categories from raw JSON.
 */
export function parseJsonSkills(rawSkills: unknown, detectedLang: SupportedLanguage): SkillCategory[] {
  const skillGroups: SkillCategory[] = [];

  if (Array.isArray(rawSkills)) {
    if (rawSkills.length > 0 && typeof rawSkills[0] === 'string') {
      skillGroups.push({
        category: cleanSkillCategory(detectedLang === 'es' ? 'Habilidades Principales' : 'Core Skills'),
        skills: rawSkills.map((s) => cleanSkillItem(String(s))).filter(Boolean),
      });
    } else {
      for (const sg of rawSkills) {
        if (sg && typeof sg === 'object') {
          const groupObj = sg as { category?: string; name?: string; group?: string; skills?: unknown };
          const rawCat = groupObj.category || groupObj.name || groupObj.group || '';
          const category = cleanSkillCategory(normalizeSkillCategory(rawCat.trim(), detectedLang));
          const sks = Array.isArray(groupObj.skills)
            ? groupObj.skills.map((s) => cleanSkillItem(String(s))).filter(Boolean)
            : typeof groupObj.skills === 'string'
            ? groupObj.skills.split(/[,•|]/).map(cleanSkillItem).filter(Boolean)
            : [];
          if (category || sks.length > 0) {
            skillGroups.push({ category, skills: sks });
          }
        }
      }
    }
  } else if (rawSkills && typeof rawSkills === 'object') {
    for (const [cat, sks] of Object.entries(rawSkills)) {
      const category = cleanSkillCategory(normalizeSkillCategory(cat.trim(), detectedLang));
      const items = Array.isArray(sks)
        ? sks.map((s) => cleanSkillItem(String(s))).filter(Boolean)
        : typeof sks === 'string'
        ? sks.split(/[,•|]/).map(cleanSkillItem).filter(Boolean)
        : [];
      if (items.length > 0) {
        skillGroups.push({ category, skills: items });
      }
    }
  }

  return skillGroups;
}

/**
 * Extracts experience items from raw JSON.
 */
export function parseJsonExperience(rawExp: unknown): ExperienceItem[] {
  const experience: ExperienceItem[] = [];
  if (!Array.isArray(rawExp)) return experience;

  for (const exp of rawExp) {
    if (!exp || typeof exp !== 'object') continue;
    const expObj = exp as {
      company?: string;
      organization?: string;
      employer?: string;
      name?: string;
      role?: string;
      title?: string;
      position?: string;
      date?: string;
      dates?: string;
      period?: string;
      duration?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      city?: string;
      bullets?: unknown;
      responsibilities?: unknown;
      achievements?: unknown;
      highlights?: unknown;
      tasks?: unknown;
      description?: string;
      disabledBullets?: unknown;
    };

    const company = cleanHumanText(
      expObj.company || expObj.organization || expObj.employer || expObj.name || 'Organization'
    );
    const role = cleanHumanText(expObj.role || expObj.title || expObj.position || 'Specialist');
    const date = cleanHumanText(
      expObj.date ||
        expObj.dates ||
        expObj.period ||
        expObj.duration ||
        (expObj.startDate ? `${expObj.startDate} – ${expObj.endDate || 'Present'}` : '')
    );
    const location = expObj.location
      ? cleanHumanText(expObj.location)
      : expObj.city
      ? cleanHumanText(expObj.city)
      : '';

    let bullets: string[] = [];
    const rawBullets =
      expObj.bullets || expObj.responsibilities || expObj.achievements || expObj.highlights || expObj.tasks;
    if (Array.isArray(rawBullets)) {
      bullets = rawBullets.map((b) => cleanBulletText(String(b))).filter(Boolean);
    } else if (typeof expObj.description === 'string' && expObj.description.trim()) {
      bullets = expObj.description
        .split(/\n+/)
        .map((b) => cleanBulletText(b.replace(/^[-*•]\s*/, '')))
        .filter(Boolean);
    }

    const disabledBullets = Array.isArray(expObj.disabledBullets)
      ? (expObj.disabledBullets as number[]).filter((n) => typeof n === 'number')
      : undefined;

    experience.push({ company, role, date, location, bullets, disabledBullets });
  }

  return experience;
}

/**
 * Extracts project items with demo/repo URLs and restores missing data from master data.
 */
export function parseJsonProjects(rawProjects: unknown, fallbackCv?: CVData | null): ExperienceItem[] {
  const projects: ExperienceItem[] = [];

  if (Array.isArray(rawProjects)) {
    for (const proj of rawProjects) {
      if (!proj || typeof proj !== 'object') continue;
      const projObj = proj as {
        company?: string;
        name?: string;
        title?: string;
        role?: string;
        demoUrl?: string;
        url?: string;
        link?: string;
        website?: string;
        liveUrl?: string;
        repoUrl?: string;
        github?: string;
        repository?: string;
        codeUrl?: string;
        sourceUrl?: string;
        date?: string;
        location?: string;
        bullets?: unknown;
        highlights?: unknown;
        tasks?: unknown;
        description?: string;
        disabledBullets?: unknown;
      };

      const company = cleanHumanText(projObj.company || projObj.name || projObj.title || 'Project');
      const role = projObj.role ? cleanHumanText(projObj.role) : '';

      let rawDemo = projObj.demoUrl || projObj.website || projObj.liveUrl || projObj.url || projObj.link;
      let demoUrl = rawDemo && typeof rawDemo === 'string' && rawDemo.trim() ? cleanTrackingAndSearchUrl(rawDemo.trim()) : undefined;
      if (demoUrl && !demoUrl.startsWith('http')) {
        demoUrl = `https://${demoUrl}`;
      }

      let rawRepo = projObj.repoUrl || projObj.github || projObj.repository || projObj.codeUrl || projObj.sourceUrl;
      let repoUrl = rawRepo && typeof rawRepo === 'string' && rawRepo.trim() ? cleanTrackingAndSearchUrl(rawRepo.trim()) : undefined;
      if (repoUrl && !repoUrl.startsWith('http')) {
        repoUrl = `https://${repoUrl}`;
      }

      const rawLoc = projObj.location ? cleanHumanText(projObj.location) : '';
      if (!repoUrl && rawLoc.includes('github.com')) {
        repoUrl = rawLoc.startsWith('http') ? rawLoc : `https://${rawLoc}`;
      } else if (!demoUrl && (rawLoc.startsWith('http') || rawLoc.includes('.vercel.app') || rawLoc.includes('.netlify.app'))) {
        demoUrl = rawLoc.startsWith('http') ? rawLoc : `https://${rawLoc}`;
      }

      const compLower = company.toLowerCase();
      if (compLower.includes('cv studio') || compLower.includes('tailor engine')) {
        if (!demoUrl) demoUrl = APP_LINKS.DEMO_URL;
        if (!repoUrl) repoUrl = APP_LINKS.GITHUB_REPO;
      }

      const date = projObj.date ? cleanHumanText(projObj.date) : '';
      const location = (rawLoc.startsWith('http') || rawLoc.includes('github.com')) ? '' : rawLoc;

      let bullets: string[] = [];
      const rawBullets = projObj.bullets || projObj.highlights || projObj.tasks;
      if (Array.isArray(rawBullets)) {
        bullets = rawBullets.map((b) => cleanBulletText(String(b))).filter(Boolean);
      } else if (typeof projObj.description === 'string' && projObj.description.trim()) {
        bullets = projObj.description
          .split(/\n+/)
          .map((b) => cleanBulletText(b.replace(/^[-*•]\s*/, '')))
          .filter(Boolean);
      }

      const disabledBullets = Array.isArray(projObj.disabledBullets)
        ? (projObj.disabledBullets as number[]).filter((n) => typeof n === 'number')
        : undefined;

      projects.push({ company, role, demoUrl, repoUrl, date, location, bullets, disabledBullets });
    }
  }

  // Enrich projects from fallbackCv
  if (fallbackCv?.projects && fallbackCv.projects.length > 0) {
    if (projects.length === 0) {
      projects.push(...fallbackCv.projects);
    } else {
      for (const proj of projects) {
        const match = fallbackCv.projects.find(
          (fp) => fp.company && proj.company && (
            fp.company.toLowerCase().trim() === proj.company.toLowerCase().trim() ||
            fp.company.toLowerCase().includes(proj.company.toLowerCase()) ||
            proj.company.toLowerCase().includes(fp.company.toLowerCase())
          )
        );
        if (match) {
          if (!proj.demoUrl && match.demoUrl) proj.demoUrl = match.demoUrl;
          if (!proj.repoUrl && match.repoUrl) proj.repoUrl = match.repoUrl;
        }
      }
    }
  }

  return projects;
}

/**
 * Extracts education, certifications, and languages from raw JSON.
 */
export function parseJsonEducationAndLanguages(
  root: RawJsonCvInput,
  fallbackCv?: CVData | null
): { education: string[]; certifications: string[]; languages: string[] } {
  const rawEdu = root.education || root.studies;
  const education: string[] = [];

  if (Array.isArray(rawEdu)) {
    for (const item of rawEdu) {
      if (typeof item === 'string') {
        const cleanedItem = cleanEducationItem(item);
        if (cleanedItem) education.push(cleanedItem);
      } else if (item && typeof item === 'object') {
        const eduObj = item as {
          degree?: string;
          title?: string;
          major?: string;
          course?: string;
          institution?: string;
          school?: string;
          university?: string;
          year?: string | number;
          date?: string;
          period?: string;
        };
        const deg = eduObj.degree || eduObj.title || eduObj.major || eduObj.course || '';
        const inst = eduObj.institution || eduObj.school || eduObj.university || '';
        const yr = eduObj.year || eduObj.date || eduObj.period || '';
        const parts = [deg ? `**${deg}**` : '', inst, yr ? String(yr) : ''].filter(Boolean);
        if (parts.length > 0) {
          education.push(parts.join(' – '));
        }
      }
    }
  }

  const rawCerts = root.certifications || root.certificates;
  const certifications: string[] = [];

  if (Array.isArray(rawCerts)) {
    for (const item of rawCerts) {
      if (typeof item === 'string') {
        const cleanedItem = cleanEducationItem(item);
        if (cleanedItem) certifications.push(cleanedItem);
      } else if (item && typeof item === 'object') {
        const certObj = item as {
          name?: string;
          title?: string;
          certification?: string;
          issuer?: string;
          organization?: string;
          institution?: string;
          year?: string | number;
          date?: string;
        };
        const certName = certObj.name || certObj.title || certObj.certification || '';
        const issuer = certObj.issuer || certObj.organization || certObj.institution || '';
        const yr = certObj.year || certObj.date || '';
        const parts = [certName ? `**${certName}**` : '', issuer, yr ? String(yr) : ''].filter(Boolean);
        if (parts.length > 0) {
          certifications.push(parts.join(' – '));
        }
      }
    }
  }

  const rawLangs = root.languages || root.languageSkills;
  const languages: string[] = [];

  if (Array.isArray(rawLangs)) {
    for (const item of rawLangs) {
      if (typeof item === 'string') {
        const cleanedItem = cleanLanguageItem(item);
        if (cleanedItem) languages.push(cleanedItem);
      } else if (item && typeof item === 'object') {
        const langObj = item as {
          language?: string;
          name?: string;
          level?: string;
          proficiency?: string;
          fluency?: string;
        };
        const lang = langObj.language || langObj.name || '';
        const lvl = langObj.level || langObj.proficiency || langObj.fluency || '';
        if (lang) {
          languages.push(lvl ? `**${lang}:** ${lvl}` : lang);
        }
      }
    }
  }

  // Fallback recovery
  if (fallbackCv) {
    if (education.length === 0 && fallbackCv.education && fallbackCv.education.length > 0) {
      education.push(...fallbackCv.education);
    }
    if (certifications.length === 0 && fallbackCv.certifications && fallbackCv.certifications.length > 0) {
      certifications.push(...fallbackCv.certifications);
    }
    if (languages.length === 0 && fallbackCv.languages && fallbackCv.languages.length > 0) {
      languages.push(...fallbackCv.languages);
    }
  }

  return { education, certifications, languages };
}

/**
 * Extracts European & Swiss personal and legal details from JSON.
 */
export function parseJsonLegalDetails(
  root: RawJsonCvInput,
  fallbackCv?: CVData | null
): {
  workPermit?: string;
  nationality?: string;
  placeOfOrigin?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
  availability?: string;
  civilStatus?: string;
  references?: string;
} {
  const rootRec = root as Record<string, unknown>;
  const rawWorkPermit = root.workPermit || rootRec.permit || rootRec.visa;
  let workPermit = typeof rawWorkPermit === 'string' && rawWorkPermit.trim() ? cleanHumanText(rawWorkPermit) : undefined;

  const rawNationality = root.nationality || rootRec.citizenship;
  let nationality = typeof rawNationality === 'string' && rawNationality.trim() ? cleanHumanText(rawNationality) : undefined;

  const rawOrigin = root.placeOfOrigin || rootRec.origin || rootRec.canton || rootRec.heimatort;
  let placeOfOrigin = typeof rawOrigin === 'string' && rawOrigin.trim() ? cleanHumanText(rawOrigin) : undefined;

  const rawDob = root.dateOfBirth || rootRec.birthDate || rootRec.dob;
  let dateOfBirth = typeof rawDob === 'string' && rawDob.trim() ? cleanHumanText(rawDob) : undefined;

  const rawDriving = root.drivingLicense || rootRec.license || rootRec.driverLicense;
  let drivingLicense = typeof rawDriving === 'string' && rawDriving.trim() ? cleanHumanText(rawDriving) : undefined;

  const rawAvailability = root.availability || rootRec.noticePeriod;
  let availability = typeof rawAvailability === 'string' && rawAvailability.trim() ? cleanHumanText(rawAvailability) : undefined;

  const rawCivil = root.civilStatus || rootRec.maritalStatus;
  let civilStatus = typeof rawCivil === 'string' && rawCivil.trim() ? cleanHumanText(rawCivil) : undefined;

  const rawRef = root.references || rootRec.reference;
  let references = typeof rawRef === 'string' && rawRef.trim() ? cleanHumanText(rawRef) : undefined;

  if (fallbackCv) {
    if (!nationality && fallbackCv.nationality) nationality = fallbackCv.nationality;
    if (!workPermit && fallbackCv.workPermit) workPermit = fallbackCv.workPermit;
    if (!placeOfOrigin && fallbackCv.placeOfOrigin) placeOfOrigin = fallbackCv.placeOfOrigin;
    if (!dateOfBirth && fallbackCv.dateOfBirth) dateOfBirth = fallbackCv.dateOfBirth;
    if (!drivingLicense && fallbackCv.drivingLicense) drivingLicense = fallbackCv.drivingLicense;
    if (!availability && fallbackCv.availability) availability = fallbackCv.availability;
    if (!civilStatus && fallbackCv.civilStatus) civilStatus = fallbackCv.civilStatus;
    if (!references && fallbackCv.references) references = fallbackCv.references;
  }

  return {
    workPermit,
    nationality,
    placeOfOrigin,
    dateOfBirth,
    drivingLicense,
    availability,
    civilStatus,
    references,
  };
}
