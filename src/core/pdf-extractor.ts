import * as pdfjsLib from 'pdfjs-dist';
import { extractCandidateName } from './parser';
import { APP_LINKS } from '../constants/links';

// Polyfill Uint8Array.prototype.toHex if missing in current JavaScript engine / WebWorker
if (typeof Uint8Array !== 'undefined' && typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function () {
    return Array.from(this as Uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

// Polyfill Map.prototype.getOrInsertComputed for pdfjs-dist compatibility across older browsers and runtimes
if (typeof Map !== 'undefined' && typeof (Map.prototype as any).getOrInsertComputed !== 'function') {
  (Map.prototype as any).getOrInsertComputed = function (key: any, callback: () => any) {
    if (this.has(key)) return this.get(key);
    const value = callback();
    this.set(key, value);
    return value;
  };
}

// Configure pdfjs worker in browser environment
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
  }
}

export interface PdfImportResult {
  markdown: string;
  candidateName: string;
  usedAI: boolean;
  usedOcr?: boolean;
  rawText: string;
}

export type ProgressCallback = (message: string) => void;

/**
 * Strips rogue formatting symbols and markdown tags.
 */
function cleanFormatting(str: string): string {
  return str
    .replace(/[*_`#]/g, '')
    .replace(/^[|/\s*–—•·●◦▪>«»!+]+/, '')
    .replace(/^[il1|]\s+/i, '')
    .trim();
}

/**
 * Sanitizes and extracts a clean candidate name from file name or fallback string.
 */
function cleanCandidateFallback(fallback: string): string {
  const name = fallback
    .replace(/\.pdf$/i, '')
    .replace(/^(?:cv|resume|curriculum|dossier|hoja_de_vida)[_\s-]*/i, '')
    .replace(/[_\s-]*(?:hired|final|en|es|v\d+|\(\d+\))[_\s-]*$/i, '')
    .replace(/[_\s-]+/g, ' ')
    .trim();
  if (
    !name ||
    name.length < 2 ||
    /^(?:media|blob|document|untitled|candidate|file|download)[_\s0-9]*$/i.test(name)
  ) {
    return 'Candidate';
  }
  return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function isContinuationLine(clean: string): boolean {
  if (!clean) return false;
  if (/^[a-zà-ÿ]/.test(clean)) return true;
  if (/^(?:con|en|de|y|para|por|que|del|al|with|and|in|for|to|by|on|at|from|or|of|under|sobre)\b/i.test(clean)) return true;
  if (clean.endsWith('.') && clean.length > 50) return true;
  return false;
}

function isCompanyCandidate(clean: string): boolean {
  if (!clean || clean.length > 70) return false;
  if (isContinuationLine(clean)) return false;
  if (!/^[A-ZÁÉÍÓÚÄÖÜ0-9]/.test(clean)) return false;
  if (clean.endsWith('.')) return false;
  return true;
}

interface ProjectContext {
  extractedLinks?: string[];
  candidateGithub?: string;
  emailPrefix?: string;
}

/**
 * Groups unformatted experience lines into structured markdown blocks.
 */
function reconstructExperienceBlocks(
  lines: string[],
  isProjects = false,
  projectContext?: ProjectContext
): string {
  const blocks: Array<{
    company: string;
    role: string;
    location?: string;
    demoUrl?: string;
    repoUrl?: string;
    date?: string;
    bullets: string[];
  }> = [];

  let currentBlock: {
    company: string;
    role: string;
    location?: string;
    demoUrl?: string;
    repoUrl?: string;
    date?: string;
    bullets: string[];
  } | null = null;

  const flushBlock = () => {
    if (currentBlock && (currentBlock.company || currentBlock.role || currentBlock.bullets.length > 0)) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  const isBullet = (str: string) =>
    /^[-•·>*▪◦●»«+]\s*/.test(str) || str.startsWith('-') || /^[>»«]\s*/.test(str);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const clean = cleanFormatting(rawLine);
    if (!clean) continue;

    const bullet = isBullet(clean) || isBullet(rawLine.trim());

    // 1. Date line (e.g. "Frontend Developer Oct 2024 - Apr 2026")
    const dateMatch = clean.match(
      /(?:(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Abr|Ago|Dic)\b\.?\s*)?\b(?:19|20)\d{2}\b|\bPresente?|\bActualidad)\s*(?:-|–|to|al|a)\s*(?:(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Abr|Ago|Dic)\b\.?\s*)?\b(?:19|20)\d{2}\b|\bPresente?|\bActualidad)/i
    );

    if (dateMatch && !bullet) {
      const dateStr = dateMatch[0];
      const roleStr = clean.replace(dateStr, '').trim().replace(/^[|•-]\s*/, '').replace(/[|•-]\s*$/, '');
      if (currentBlock && !currentBlock.date && currentBlock.bullets.length === 0) {
        currentBlock.date = dateStr;
        if (roleStr && !currentBlock.role) currentBlock.role = roleStr;
      } else {
        flushBlock();
        currentBlock = { company: '', role: roleStr || 'Specialist', date: dateStr, bullets: [] };
      }
      continue;
    }

    // 2. Project links line standalone under company (e.g. "Live Demo • GitHub Repository")
    if (isProjects && currentBlock && currentBlock.bullets.length === 0 && !bullet && /\b(Live\s*Demo|GitHub(?:\s*Repository)?|Demo|Repo)\b/i.test(clean)) {
      const explicitGh = clean.match(/https?:\/\/github\.com\/[^\s)\]|•]+/i);
      const explicitDemo = clean.match(/https?:\/\/(?!github\.com|linkedin\.com)[^\s)\]|•]+/i);

      if (explicitGh) currentBlock.repoUrl = explicitGh[0];
      if (explicitDemo) currentBlock.demoUrl = explicitDemo[0];

      if (/\b(Live\s*Demo|Demo)\b/i.test(clean) && !currentBlock.demoUrl) {
        const found = projectContext?.extractedLinks?.find((l) => !l.includes('github.com') && !l.includes('linkedin.com'));
        if (found) currentBlock.demoUrl = found;
        else if (currentBlock.company.toLowerCase().includes('cv studio') || currentBlock.company.toLowerCase().includes('tailor engine')) {
          currentBlock.demoUrl = APP_LINKS.DEMO_URL;
        }
      }

      if (/\b(GitHub|Repo)\b/i.test(clean) && !currentBlock.repoUrl) {
        const found = projectContext?.extractedLinks?.find((l) => /github\.com\/[^/]+\/[^/]+/i.test(l));
        if (found) currentBlock.repoUrl = found;
        else if (currentBlock.company.toLowerCase().includes('cv studio') || currentBlock.company.toLowerCase().includes('tailor engine')) {
          currentBlock.repoUrl = APP_LINKS.GITHUB_REPO;
        } else if (projectContext?.candidateGithub) {
          const slug = currentBlock.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          if (slug) currentBlock.repoUrl = `${projectContext.candidateGithub}/${slug}`;
        } else if (projectContext?.emailPrefix) {
          const slug = currentBlock.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          if (slug) currentBlock.repoUrl = `https://github.com/${projectContext.emailPrefix}/${slug}`;
        }
      }
      continue;
    }

    // 3. Company / Title line: only if not a continuation line!
    if (!bullet && isCompanyCandidate(clean) && (currentBlock === null || currentBlock.bullets.length > 0)) {
      flushBlock();
      let company = clean;
      let loc = '';
      let demoUrl: string | undefined;
      let repoUrl: string | undefined;

      const locMatch = company.match(/\b(Bogot[aá],?\s*Colombia|Medell[ií]n|Cali|Madrid|Barcelona|Mexico|Remote|Remoto|New York|London|Paris|Berlin)\b.*$/i);
      if (locMatch) {
        loc = locMatch[0].trim();
        company = company.replace(loc, '').replace(/[|•,]\s*$/, '').trim();
      }

      const linksMatch = company.match(/\b(Live Demo|GitHub Repository|Demo|Repo|Preview)\b.*$/i);
      if (linksMatch) {
        const linkPart = linksMatch[0];
        company = company.replace(linkPart, '').replace(/[|•,«»]\s*$/, '').trim();
        if (!loc) loc = linkPart;
      }

      if (isProjects || linksMatch) {
        const explicitGh = clean.match(/https?:\/\/github\.com\/[^\s)\]|•]+/i);
        const explicitDemo = clean.match(/https?:\/\/(?!github\.com|linkedin\.com)[^\s)\]|•]+/i);

        if (explicitGh) repoUrl = explicitGh[0];
        if (explicitDemo) demoUrl = explicitDemo[0];

        if (/\b(Live\s*Demo|Demo)\b/i.test(clean) && !demoUrl) {
          const found = projectContext?.extractedLinks?.find((l) => !l.includes('github.com') && !l.includes('linkedin.com'));
          if (found) demoUrl = found;
          else if (company.toLowerCase().includes('cv studio') || company.toLowerCase().includes('tailor engine')) {
            demoUrl = APP_LINKS.DEMO_URL;
          }
        }

        if (/\b(GitHub|Repo)\b/i.test(clean) && !repoUrl) {
          const found = projectContext?.extractedLinks?.find((l) => /github\.com\/[^/]+\/[^/]+/i.test(l));
          if (found) repoUrl = found;
          else if (company.toLowerCase().includes('cv studio') || company.toLowerCase().includes('tailor engine')) {
            repoUrl = APP_LINKS.GITHUB_REPO;
          } else if (projectContext?.candidateGithub) {
            const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (slug) repoUrl = `${projectContext.candidateGithub}/${slug}`;
          } else if (projectContext?.emailPrefix) {
            const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (slug) repoUrl = `https://github.com/${projectContext.emailPrefix}/${slug}`;
          }
        }
      }

      currentBlock = { company: company || clean, role: '', location: loc, demoUrl, repoUrl, bullets: [] };
      continue;
    }

    // 4. Role line under company before bullets
    if (!bullet && currentBlock && !currentBlock.role && currentBlock.bullets.length === 0) {
      currentBlock.role = clean;
      continue;
    }

    // 5. Bullet text or bullet continuation
    const bulletText = clean.replace(/^[-•·>*▪◦●»«+]\s*/, '').trim();
    if (bulletText) {
      if (!currentBlock) {
        currentBlock = { company: 'Experience', role: 'Specialist', bullets: [] };
      }
      if (!bullet && currentBlock.bullets.length > 0 && isContinuationLine(clean)) {
        currentBlock.bullets[currentBlock.bullets.length - 1] += ' ' + bulletText;
      } else {
        currentBlock.bullets.push(bulletText);
      }
    }
  }

  flushBlock();

  if (blocks.length === 0) {
    return lines.map((l) => (l.startsWith('-') ? l : `- ${l}`)).join('\n');
  }

  return blocks
    .map((b) => {
      let compHeader: string;
      if (isProjects || b.demoUrl || b.repoUrl) {
        const links: string[] = [];
        if (b.demoUrl) {
          const d = b.demoUrl.startsWith('http') ? b.demoUrl : `https://${b.demoUrl}`;
          links.push(`[Live Demo](${d})`);
        }
        if (b.repoUrl) {
          const r = b.repoUrl.startsWith('http') ? b.repoUrl : `https://${b.repoUrl}`;
          links.push(`[GitHub Repository](${r})`);
        }
        const cleanLoc = (b.location || '')
          .replace(/Live\s*Demo/gi, '')
          .replace(/GitHub(?:\s*Repository)?/gi, '')
          .replace(/https?:\/\/[^\s]+/g, '')
          .replace(/[•|·+–—/]/g, '')
          .trim();
        const meta = [cleanLoc, ...links].filter(Boolean).join(' • ');
        compHeader = b.company
          ? (meta ? `### **${b.company}** | ${meta}` : `### **${b.company}**`)
          : (meta ? `### ${meta}` : '### Featured Project');
      } else {
        compHeader = b.company
          ? (b.location ? `### **${b.company}** | ${b.location}` : `### **${b.company}**`)
          : (b.location ? `### ${b.location}` : '### Experience');
      }
      const roleLine = b.date
        ? (b.role ? `*${b.role}* | **${b.date}**` : `**${b.date}**`)
        : (b.role ? `*${b.role}*` : '');
      const bullets = b.bullets.map((bullet) => `- ${bullet}`).join('\n');
      return [compHeader, roleLine, bullets].filter(Boolean).join('\n');
    })
    .join('\n\n---\n\n');
}

/**
 * Restructures unformatted raw or OCR text into structured Master Profile Markdown.
 */
export function formatPdfRawTextToMarkdown(
  rawText: string,
  fallbackName = 'Candidate',
  extractedLinks: string[] = []
): string {
  // If the document already contains structured Master Markdown headings, keep as-is
  if (/#+\s*(?:Personal|Contact|Career|Experience|Education|Skills|Languages)/i.test(rawText)) {
    return rawText;
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Extract contact items via RegEx
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';
  const emailPrefix = email ? email.split('@')[0] : '';

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // LinkedIn
  let linkedin = extractedLinks.find((l) => l.toLowerCase().includes('linkedin.com')) || '';
  if (!linkedin) {
    const m = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (m) linkedin = m[0].startsWith('http') ? m[0] : `https://${m[0]}`;
  }
  if (!linkedin && /\blinkedin\b/i.test(rawText)) {
    if (emailPrefix) linkedin = `https://linkedin.com/in/${emailPrefix}`;
  }

  // GitHub
  let github = extractedLinks.find((l) => l.toLowerCase().includes('github.com')) || '';
  if (!github) {
    const m = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (m) github = m[0].startsWith('http') ? m[0] : `https://${m[0]}`;
  }
  if (!github && /\bgithub\b/i.test(rawText)) {
    if (emailPrefix) github = `https://github.com/${emailPrefix}`;
  }

  // Location
  let location = '';
  const locationMatch = rawText.match(
    /(?:^|\n)\s*[-*•]?\s*(?:Location|Ubicación|Ubicacion|City|Ciudad|Ort|Lieu|Località)(?:\s*\/[^*:]*)?[:]\s*(.+)$/im
  );
  if (locationMatch) {
    location = cleanFormatting(locationMatch[1]);
  } else {
    const cityMatch = rawText.match(/\b([A-ZÁÉÍÓÚÄÖÜ][a-záéíóúäöü]+(?:\s+[A-ZÁÉÍÓÚÄÖÜ][a-záéíóúäöü]+)?,\s*[A-ZÁÉÍÓÚÄÖÜ][a-záéíóúäöü]+(?:\s+[A-ZÁÉÍÓÚÄÖÜ][a-záéíóúäöü]+)?)\b/);
    if (cityMatch) {
      location = cityMatch[1].trim();
    }
  }

  // 2. Identify candidate name and headline from top lines
  let candidateName = '';
  let headline = '';

  const excludedNamePatterns = /^(?:professional\s+summary|summary|profile|professional\s+profile|resumen|perfil|acerca\s+de|overview|career|history|experience|education|skills|languages|certifications|curriculum|resume|cv|technical\s+skills|core\s+competencies|frontend|backend|fullstack|software\s+engineer|developer|desarrollador|ingeniero)/i;

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const clean = cleanFormatting(line);
    if (
      !clean.includes('@') &&
      !clean.includes('http') &&
      !clean.includes('linkedin') &&
      !clean.includes('github') &&
      !clean.match(/^\+?\d/) &&
      clean.length >= 3 &&
      clean.length <= 60 &&
      !excludedNamePatterns.test(clean)
    ) {
      if (clean.includes('|')) {
        if (!headline) headline = clean;
      } else if (!candidateName) {
        candidateName = clean;
        const nextLine = lines[i + 1] ? cleanFormatting(lines[i + 1]) : '';
        if (
          nextLine &&
          nextLine.length <= 100 &&
          !nextLine.includes('@') &&
          !nextLine.match(/^\+?\d/) &&
          !excludedNamePatterns.test(nextLine)
        ) {
          headline = nextLine;
        }
      }
    }
  }

  if (!candidateName) {
    candidateName = cleanCandidateFallback(fallbackName) || 'Candidate';
  } else if (/^[A-Z\s]{4,}$/.test(candidateName)) {
    candidateName = candidateName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  if (!linkedin && candidateName !== 'Candidate') {
    const slug = candidateName.toLowerCase().replace(/\s+/g, '-');
    if (/\blinkedin\b/i.test(rawText)) linkedin = `https://linkedin.com/in/${slug}`;
    if (/\bgithub\b/i.test(rawText)) github = `https://github.com/${slug}`;
  }

  // 3. Section partitioner
  const experienceKeywords = /^(?:work\s+experience|experience|employment\s+history|career\s+history|professional\s+experience|experiencia\s+laboral|experiencia\s+profesional|experiencia|berufserfahrung|expérience\s+professionnelle|esperienza\s+lavorativa)/i;
  const educationKeywords = /^(?:education|academic\s+background|academic\s+history|qualifications|educaci[oó]n|formaci[oó]n\s+acad[eé]mica|formaci[oó]n|estudios|t[ií]tulos|ausbildung|formation|istruzione|studi)/i;
  const skillsKeywords = /^(?:skills|technical\s+skills|core\s+competencies|technologies|tools|habilidades|competencias|tecnolog[ií]as|kenntnisse|compétences|competenze)/i;
  const summaryKeywords = /^(?:summary|profile|professional\s+summary|about\s+me|overview|resumen|perfil\s+profesional|perfil|acerca\s+de\s+m[ií]|profil|résumé)/i;
  const certKeywords = /^(?:certifications|certificates|courses|licenses|certificaciones|certificados|cursos|diplomados|zertifikate|certificazioni)/i;
  const languagesKeywords = /^(?:languages|idiomas|langues|sprachen|lingue)/i;
  const projectsKeywords = /^(?:featured\s+projects|projects|personal\s+projects|proyectos\s+destacados|proyectos|projekte)/i;

  const sections = {
    summary: [] as string[],
    experience: [] as string[],
    projects: [] as string[],
    education: [] as string[],
    skills: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    other: [] as string[]
  };

  let currentSection: keyof typeof sections = 'other';

  for (const line of lines) {
    const clean = cleanFormatting(line);
    const lower = clean.toLowerCase();

    // Two-column section header e.g. "EDUCACIÓN Y CERTIFICACIONES | IDIOMAS"
    if (lower.includes('educaci') && lower.includes('idioma')) {
      currentSection = 'education';
      continue;
    }

    // Check if line is a section header
    if (summaryKeywords.test(lower)) {
      currentSection = 'summary';
      continue;
    } else if (experienceKeywords.test(lower)) {
      currentSection = 'experience';
      continue;
    } else if (projectsKeywords.test(lower)) {
      currentSection = 'projects';
      continue;
    } else if (educationKeywords.test(lower)) {
      currentSection = 'education';
      continue;
    } else if (skillsKeywords.test(lower)) {
      currentSection = 'skills';
      continue;
    } else if (certKeywords.test(lower)) {
      currentSection = 'certifications';
      continue;
    } else if (languagesKeywords.test(lower)) {
      currentSection = 'languages';
      continue;
    }

    // Split two-column education/languages line if present
    const langMatch = clean.match(/(?:[-•*]\s*)?(Spanish|English|French|German|Italian|Español|Inglés|Francés|Alemán|Italiano)[:\s]+(?:(?:Native|Bilingual|Fluent|Nativo|B[12]|C[12]|A[12]|Professional)[^\n]*)/i);
    if (langMatch && langMatch.index !== undefined) {
      const langPart = clean.slice(langMatch.index).replace(/^[-•*]\s*/, '').trim();
      const beforePart = clean.slice(0, langMatch.index).replace(/[|•–—]\s*$/, '').trim();

      sections.languages.push(langPart);
      if (beforePart && beforePart.length > 5 && !/^\(?(?:professional\s+working|proficiency)/i.test(beforePart)) {
        sections.education.push(beforePart);
      }
      continue;
    }

    const stripped = clean.replace(/^[-*•·+«»|]\s*/, '').trim();

    if (currentSection === 'languages') {
      if (languagesKeywords.test(stripped.toLowerCase())) continue;
      // Merge continuation lines like "(Professional Working Proficiency)" into previous language
      if (/^[([a-z]|proficiency/i.test(stripped) && sections.languages.length > 0) {
        sections.languages[sections.languages.length - 1] += ` ${clean}`;
        continue;
      }
    }

    if (currentSection === 'education') {
      if (educationKeywords.test(stripped.toLowerCase())) continue;
      // Filter out OCR junk lines from right column bleed or previous section
      if (/^\(?(?:professional\s+working|proficiency)/i.test(stripped) || /^(?:ie\s+tokens|tokens\s+de\s+api)/i.test(stripped)) {
        continue;
      }
    }

    if (currentSection) {
      sections[currentSection].push(clean);
    }
  }

  // Build Markdown sections
  const summaryText = sections.summary.length > 0
    ? sections.summary.join(' ')
    : (headline ? `${headline} with extensive technical experience.` : '');

  const skillsText = sections.skills.length > 0
    ? sections.skills
        .map((s) => {
          const clean = s.replace(/^[-*•·+«»]\s*/, '').trim();
          const colonIdx = clean.indexOf(':');
          if (colonIdx !== -1) {
            const cat = clean.slice(0, colonIdx).replace(/\*\*/g, '').trim();
            const rest = clean.slice(colonIdx + 1).trim();
            return `- **${cat}:** ${rest}`;
          }
          return `- ${clean}`;
        })
        .join('\n')
    : '';

  const expText = sections.experience.length > 0
    ? reconstructExperienceBlocks(sections.experience)
    : '';

  const projText = sections.projects.length > 0
    ? reconstructExperienceBlocks(sections.projects, true, {
        extractedLinks,
        candidateGithub: github,
        emailPrefix,
      })
    : '';

  const eduText = sections.education.length > 0
    ? sections.education.map((ed) => (ed.startsWith('-') ? ed : `- ${ed}`)).join('\n')
    : '';

  const certText = sections.certifications.length > 0
    ? sections.certifications.map((c) => (c.startsWith('-') ? c : `- ${c}`)).join('\n')
    : '';

  const langText = sections.languages.length > 0
    ? sections.languages
        .map((l) => {
          const clean = l.replace(/^[-*•·+]\s*/, '').replace(/\*\*/g, '').trim();
          const colonIdx = clean.indexOf(':');
          if (colonIdx !== -1) {
            const langName = clean.slice(0, colonIdx).trim();
            const prof = clean.slice(colonIdx + 1).trim();
            return `- ${langName}: ${prof}`;
          }
          return `- ${clean}`;
        })
        .join('\n')
    : '';

  // Header contact row
  const contactParts: string[] = [];
  if (location) contactParts.push(location);
  if (email) contactParts.push(email);
  if (phone) contactParts.push(phone);
  if (linkedin) contactParts.push(linkedin);
  if (github) contactParts.push(github);

  let markdown = `# ${candidateName}\n`;
  if (contactParts.length > 0) {
    markdown += `${contactParts.join(' • ')}\n`;
  }

  if (summaryText) {
    markdown += `\n---\n\n## 🎯 1. Career Overview & Professional Pitch\n\n${summaryText}\n`;
  }

  if (skillsText) {
    markdown += `\n---\n\n## 🛠️ 2. Master Stack & Competency Matrix\n\n${skillsText}\n`;
  }

  if (expText) {
    markdown += `\n---\n\n## 💼 3. Career History & Key Achievements\n\n${expText}\n`;
  }

  if (projText) {
    markdown += `\n---\n\n## 🚀 4. Featured Projects\n\n${projText}\n`;
  }

  if (eduText || certText) {
    markdown += `\n---\n\n## 🎓 5. Education & Academic Background\n\n${[eduText, certText].filter(Boolean).join('\n')}\n`;
  }

  if (langText) {
    markdown += `\n---\n\n## 🌍 7. Languages\n\n${langText}\n`;
  }

  return markdown.trim();
}

/**
 * Extracts raw textual content from all pages of an uploaded PDF file directly in the browser.
 * Falls back to client-side OCR via Tesseract.js if no text stream is detected.
 */
export async function extractRawTextFromPdf(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<{ text: string; usedOcr: boolean; extractedLinks: string[] }> {
  let arrayBuffer: ArrayBuffer;

  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  // 0. Super-fast byte-level extraction for CV Studio generated PDFs (<1ms)
  try {
    const uint8 = new Uint8Array(arrayBuffer);
    const scanLen = Math.min(uint8.length, 150000);
    const headStr = new TextDecoder('latin1').decode(uint8.subarray(0, scanLen));
    const embedMatch = headStr.match(/(?:CV_STUDIO_MD:|cv-studio-data:)([A-Za-z0-9+/=]{30,})/);
    if (embedMatch) {
      const decoded = decodeURIComponent(escape(atob(embedMatch[1])));
      if (decoded && decoded.length > 30) {
        return { text: decoded, usedOcr: false, extractedLinks: [] };
      }
    }
  } catch {
    // Non-critical fast-path error, proceed with standard extraction
  }

  if (onProgress) onProgress('Reading PDF document structure...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // 1. Check for embedded CV Studio Master Profile metadata payload
  try {
    const meta = await pdf.getMetadata();
    const info = (meta?.info || {}) as Record<string, unknown>;
    const subject = typeof info.Subject === 'string' ? info.Subject : '';
    if (subject.startsWith('CV_STUDIO_MD:')) {
      const payload = subject.replace('CV_STUDIO_MD:', '');
      const decoded = decodeURIComponent(escape(atob(payload)));
      if (decoded && decoded.length > 30) {
        return { text: decoded, usedOcr: false, extractedLinks: [] };
      }
    }
  } catch {
    // Non-critical metadata read error, proceed with standard extraction
  }

  // Collect all link annotations across pages
  const extractedLinks: string[] = [];
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const annots = await page.getAnnotations();
      for (const a of annots) {
        const linkUrl = typeof a.url === 'string' ? a.url : (typeof a.unsafeUrl === 'string' ? a.unsafeUrl : '');
        if (a.subtype === 'Link' && linkUrl && linkUrl.startsWith('http')) {
          extractedLinks.push(linkUrl);
        }
      }
    } catch {
      // Non-critical annotation extraction error
    }
  }

  // 2. Attempt native text stream extraction
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by vertical position (y coordinate)
    const items = textContent.items as Array<{ str?: string; transform?: number[] }>;
    const lineMap = new Map<number, Array<{ x: number; text: string }>>();

    for (const item of items) {
      if (!item.str || item.str.trim().length === 0) continue;
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      const x = Math.round(transform[4] || 0);
      // Round y coordinate to ~4px tolerance to group characters into identical lines
      const y = Math.round((transform[5] || 0) / 4) * 4;

      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push({ x, text: item.str });
    }

    // Sort lines by y descending (top of page to bottom), then words by x ascending (left to right)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const pageLines: string[] = [];

    for (const y of sortedY) {
      const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      const lineStr = lineItems.map((item) => item.text).join(' ').trim();
      if (lineStr) {
        pageLines.push(lineStr);
      }
    }

    if (pageLines.length > 0) {
      pageTexts.push(pageLines.join('\n'));
    }
  }

  const nativeFullText = pageTexts.join('\n\n').trim();
  if (nativeFullText && nativeFullText.length > 20) {
    return { text: nativeFullText, usedOcr: false, extractedLinks };
  }

  // 3. Fallback to Client-Side OCR via Tesseract.js for scanned/image PDFs
  if (onProgress) onProgress('Scanned PDF detected. Initializing OCR engine...');

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(['eng', 'spa']);
  const ocrPageTexts: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress(`Running OCR on page ${pageNum} of ${numPages}...`);
      }

      const page = await pdf.getPage(pageNum);
      // 2.5x scale provides crisp pixel density for high OCR accuracy
      const viewport = page.getViewport({ scale: 2.5 });

      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          const imgDataUrl = canvas.toDataURL('image/png');
          const ret = await worker.recognize(imgDataUrl);
          let pageStr = ret.data.text.trim();
          // On page 1: ensure header banner (name, title, contacts) was not dropped by whole-page segmentation
          if (pageNum === 1) {
            try {
              // Top 11% contains the isolated candidate name banner and headline
              const headerH = Math.floor(canvas.height * 0.11);
              const headerCanvas = document.createElement('canvas');
              headerCanvas.width = canvas.width;
              headerCanvas.height = headerH;
              const hCtx = headerCanvas.getContext('2d');
              if (hCtx) {
                hCtx.fillStyle = '#ffffff';
                hCtx.fillRect(0, 0, headerCanvas.width, headerH);
                hCtx.drawImage(canvas, 0, 0, canvas.width, headerH, 0, 0, canvas.width, headerH);
                const hRet = await worker.recognize(headerCanvas.toDataURL('image/png'));
                const hText = hRet.data.text.trim();
                const hLines = hText.split('\n').map((l) => l.trim()).filter(Boolean);
                if (hLines.length > 0) {
                  const firstHLine = hLines[0];
                  if (!pageStr.toLowerCase().includes(firstHLine.toLowerCase())) {
                    pageStr = `${hLines.join('\n')}\n\n${pageStr}`;
                  }
                }
              }
            } catch {
              // Non-critical header crop recognition error
            }

            // Bottom 28%: detect if there is a two-column section (e.g. Education + Languages)
            try {
              const lowerPage = pageStr.toLowerCase();
              if (
                (lowerPage.includes('educaci') || lowerPage.includes('education')) &&
                (lowerPage.includes('idioma') || lowerPage.includes('language'))
              ) {
                const bottomY = Math.floor(canvas.height * 0.74);
                const bottomH = canvas.height - bottomY;

                // Left column: 0 to 63% width (Education & Certifications)
                const leftW = Math.floor(canvas.width * 0.63);
                const leftCanvas = document.createElement('canvas');
                leftCanvas.width = leftW;
                leftCanvas.height = bottomH;
                const lCtx = leftCanvas.getContext('2d');

                // Right column: 63% to 100% width (Languages)
                const rightX = leftW;
                const rightW = canvas.width - rightX;
                const rightCanvas = document.createElement('canvas');
                rightCanvas.width = rightW;
                rightCanvas.height = bottomH;
                const rCtx = rightCanvas.getContext('2d');

                if (lCtx && rCtx) {
                  lCtx.fillStyle = '#ffffff';
                  lCtx.fillRect(0, 0, leftW, bottomH);
                  lCtx.drawImage(canvas, 0, bottomY, leftW, bottomH, 0, 0, leftW, bottomH);

                  rCtx.fillStyle = '#ffffff';
                  rCtx.fillRect(0, 0, rightW, bottomH);
                  rCtx.drawImage(canvas, rightX, bottomY, rightW, bottomH, 0, 0, rightW, bottomH);

                  const [lRet, rRet] = await Promise.all([
                    worker.recognize(leftCanvas.toDataURL('image/png')),
                    worker.recognize(rightCanvas.toDataURL('image/png')),
                  ]);

                  const lText = lRet.data.text.trim();
                  const rText = rRet.data.text.trim();

                  if (lText.length > 20 && rText.length > 10) {
                    const eduHeaderRegex = /(?:^|\n)[|#*\s]*(?:educaci[oó]n|education)[^\n]*/i;
                    const match = pageStr.match(eduHeaderRegex);
                    if (match && match.index !== undefined) {
                      pageStr = pageStr.slice(0, match.index).trim() + `\n\n| EDUCACIÓN Y CERTIFICACIONES\n${lText}\n\n| IDIOMAS\n${rText}`;
                    }
                  }
                }
              }
            } catch {
              // Non-critical column crop recognition error
            }
          }

          if (pageStr) {
            // Fix common OCR artifact where '&' is recognized as '8' between words (e.g. "Studio 8 Tailor")
            pageStr = pageStr.replace(/\bStudio\s+8\s+/gi, 'Studio & ');
            ocrPageTexts.push(pageStr);
          }
        }
      }
    }
  } finally {
    await worker.terminate();
  }

  const ocrFullText = ocrPageTexts.join('\n\n').trim();
  if (!ocrFullText || ocrFullText.length === 0) {
    throw new Error('No readable text found in PDF. The document appears to be empty or an unreadable scanned image.');
  }

  return { text: ocrFullText, usedOcr: true, extractedLinks };
}

/**
 * 100% Client-Side Local PDF import orchestrator.
 * Parses PDF documents locally in milliseconds with automatic OCR fallback for scanned resumes.
 */
export async function importResumePdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<PdfImportResult> {
  const { text: rawText, usedOcr, extractedLinks = [] } = await extractRawTextFromPdf(file, onProgress);
  const candidateName = extractCandidateName(rawText, file.name.replace(/\.pdf$/i, ''));
  const markdown = formatPdfRawTextToMarkdown(rawText, candidateName, extractedLinks);

  return {
    markdown,
    candidateName,
    usedAI: false,
    usedOcr,
    rawText
  };
}
