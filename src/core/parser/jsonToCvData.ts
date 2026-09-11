import { CVData, CVSection, ContactItem, ContactType, ExperienceItem, SkillCategory } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { extractCandidateName, cleanHumanText } from './metadataExtractor';
import {
  inferDocumentLanguage,
  normalizeSkillCategory,
  cleanCvData,
  cleanSummary,
  cleanBulletText,
  cleanSkillItem,
  cleanSkillCategory,
  cleanEducationItem,
  cleanLanguageItem,
  parseMarkdownToCvData
} from './markdownToCvData';
import { APP_LINKS } from '../../constants/links';

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
 * Robustly sanitizes a raw JSON string from external AI models (ChatGPT, Claude, DeepSeek).
 * - Strips Markdown code blocks (```json ... ```)
 * - Isolates outer JSON curly braces
 * - Strips // and /* comments outside strings (preserving URLs like https:// inside strings)
 * - Removes trailing commas before } or ]
 * - Escapes unescaped literal newlines and control characters inside double-quoted strings
 */
export function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find outer braces
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Single-pass scanner:
  // 1. Ignores // and /* */ comments outside strings, but preserves them inside strings (e.g. https://...)
  // 2. Escapes unescaped newlines, tabs, and carriage returns inside strings
  let inString = false;
  let isEscaped = false;
  let inLineComment = false;
  let inBlockComment = false;
  let result = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = i + 1 < cleaned.length ? cleaned[i + 1] : '';

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip /
      }
      continue;
    }

    if (!inString) {
      if (char === '/' && nextChar === '/') {
        inLineComment = true;
        i++; // skip next /
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++; // skip next *
        continue;
      }
      if (char === '"') {
        inString = true;
        result += char;
        continue;
      }
      result += char;
    } else {
      if (char === '"' && !isEscaped) {
        inString = false;
        result += char;
      } else if (char === '\\') {
        isEscaped = !isEscaped;
        result += char;
      } else if (char === '\n') {
        result += '\\n';
        isEscaped = false;
      } else if (char === '\r') {
        isEscaped = false;
      } else if (char === '\t') {
        result += '\\t';
        isEscaped = false;
      } else {
        result += char;
        isEscaped = false;
      }
    }
  }

  // Remove trailing commas before } or ]
  result = result.replace(/,\s*([}\]])/g, '$1');

  return result;
}

/**
 * Detects contact type from label or URL
 */
function inferContactType(text: string, url?: string): ContactType {
  const combined = `${text} ${url || ''}`.toLowerCase();
  if (combined.includes('@')) return 'email';
  if (combined.includes('linkedin.com') || combined.includes('/in/')) return 'linkedin';
  if (combined.includes('github.com')) return 'github';
  if (
    combined.includes('http://') ||
    combined.includes('https://') ||
    combined.includes('www.') ||
    combined.includes('.dev') ||
    combined.includes('.io') ||
    combined.includes('.me')
  ) {
    return 'globe';
  }
  if (/^[\s+0-9().-]{7,}$/.test(text.trim())) return 'phone';
  return 'location';
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

  // 2. Name & Title
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

  // 3. Contacts
  const contacts: ContactItem[] = [];
  const rawContacts = root.contacts || root.contact;

  const normalizeUrl = (type: ContactType, val: string, existingUrl?: string): string | undefined => {
    if (existingUrl && existingUrl.trim()) {
      const u = existingUrl.trim();
      if (type === 'email' && !u.startsWith('mailto:')) return `mailto:${u}`;
      if ((type === 'linkedin' || type === 'github' || type === 'globe') && !u.startsWith('http')) return `https://${u}`;
      return u;
    }
    const clean = val.trim();
    if (!clean) return undefined;
    if (type === 'email') return `mailto:${clean.replace(/^mailto:/i, '')}`;
    if (type === 'linkedin' || type === 'github' || type === 'globe') {
      return clean.startsWith('http') ? clean : `https://${clean}`;
    }
    return undefined;
  };

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
            contacts.push({ type, label, url: normalizeUrl(type, label, rawUrl) });
          } else {
            const type = inferContactType(text);
            contacts.push({ type, label: text, url: normalizeUrl(type, text) });
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
            url: normalizeUrl(type, label, itemObj.url),
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
          contacts.push({ type, label: val.trim(), url: normalizeUrl(type, val) });
        }
      }
    }
  }

  // Fallback to top-level contact fields
  if (!contacts.some((c) => c.type === 'email') && root.email && typeof root.email === 'string') {
    const cleanMail = root.email.trim();
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
    const cleanL = root.linkedin.trim();
    contacts.push({
      type: 'linkedin',
      label: cleanL,
      url: cleanL.startsWith('http') ? cleanL : `https://${cleanL}`,
    });
  }
  if (!contacts.some((c) => c.type === 'github') && root.github && typeof root.github === 'string') {
    const cleanG = root.github.trim();
    contacts.push({
      type: 'github',
      label: cleanG,
      url: cleanG.startsWith('http') ? cleanG : `https://${cleanG}`,
    });
  }
  if (!contacts.some((c) => c.type === 'globe') && (root.website || root.portfolio)) {
    const cleanW = String(root.website || root.portfolio).trim();
    contacts.push({
      type: 'globe',
      label: cleanW,
      url: cleanW.startsWith('http') ? cleanW : `https://${cleanW}`,
    });
  }

  // Enrich missing contacts from fallbackMasterData (preserves LinkedIn, GitHub, etc. if user had them)
  if (fallbackMasterData && fallbackMasterData.trim()) {
    try {
      const fallbackCv = parseMarkdownToCvData(fallbackMasterData);
      if (fallbackCv.contacts && fallbackCv.contacts.length > 0) {
        for (const fc of fallbackCv.contacts) {
          const existing = contacts.find((c) => c.type === fc.type);
          if (!existing) {
            contacts.push(fc);
          } else if (!existing.url && fc.url) {
            existing.url = fc.url;
          }
        }
      }
    } catch {
      // Non-critical contact enrichment
    }
  }


  // 4. Summary
  const summaryRaw =
    typeof root.summary === 'string'
      ? root.summary
      : typeof root.profile === 'string'
      ? root.profile
      : typeof root.about === 'string'
      ? root.about
      : '';
  const summary = cleanSummary(summaryRaw);

  // 5. Skills
  const rawSkills = root.skills || root.skillGroups || root.technicalSkills;
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

  // 6. Experience
  const rawExp = root.experience || root.workExperience || root.employment || root.career;
  const experience: ExperienceItem[] = [];

  if (Array.isArray(rawExp)) {
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

      experience.push({ company, role, date, location, bullets });
    }
  }

  // 7. Projects
  const rawProjects = root.projects || root.featuredProjects;
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
      };

      const company = cleanHumanText(projObj.company || projObj.name || projObj.title || 'Project');
      const role = projObj.role ? cleanHumanText(projObj.role) : '';

      let rawDemo = projObj.demoUrl || projObj.website || projObj.liveUrl || projObj.url || projObj.link;
      let demoUrl = rawDemo && typeof rawDemo === 'string' && rawDemo.trim() ? rawDemo.trim() : undefined;
      if (demoUrl && !demoUrl.startsWith('http')) {
        demoUrl = `https://${demoUrl}`;
      }

      let rawRepo = projObj.repoUrl || projObj.github || projObj.repository || projObj.codeUrl || projObj.sourceUrl;
      let repoUrl = rawRepo && typeof rawRepo === 'string' && rawRepo.trim() ? rawRepo.trim() : undefined;
      if (repoUrl && !repoUrl.startsWith('http')) {
        repoUrl = `https://${repoUrl}`;
      }

      // Check location if demoUrl or repoUrl not yet set
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

      projects.push({ company, role, demoUrl, repoUrl, date, location, bullets });
    }
  }

  // Enrich projects from fallbackMasterData (restores projects or missing demoUrl/repoUrl)
  if (fallbackMasterData && fallbackMasterData.trim()) {
    try {
      const fallbackCv = parseMarkdownToCvData(fallbackMasterData);
      if (fallbackCv.projects && fallbackCv.projects.length > 0) {
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
    } catch {
      // Non-critical project enrichment
    }
  }

  // 8. Education
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

  // 9. Certifications
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

  // 10. Languages
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

  // 11. Assemble sections
  const sections: CVSection[] = [];
  if (summary) sections.push({ id: 'summary', type: 'summary', title: langDef.sections.summary });
  if (skillGroups.length > 0) sections.push({ id: 'skills', type: 'skills', title: langDef.sections.skills });
  if (experience.length > 0) sections.push({ id: 'experience', type: 'experience', title: langDef.sections.experience });
  if (projects.length > 0) sections.push({ id: 'projects', type: 'projects', title: langDef.sections.projects });
  if (education.length > 0 || certifications.length > 0) {
    sections.push({ id: 'education', type: 'education', title: langDef.sections.education });
  }
  if (languages.length > 0) sections.push({ id: 'languages', type: 'languages', title: langDef.sections.languages });

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
  };

  return cleanCvData(rawCvData);
}
