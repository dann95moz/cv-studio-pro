/**
 * Metadata & text sanitization extraction utilities.
 * Principle: Single Responsibility (S) - focuses exclusively on parsing candidate & vacancy metadata.
 */

/**
 * Sanitizes a string into a clean Pascal_Snake_Case filename without accents or special chars
 */
export function sanitizeFileName(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\[|\]/g, '')
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
}

/**
 * Extracts candidate initials (e.g. 'Daniel Corredor' -> 'DC') for monograms
 */
export function extractCandidateInitials(name?: string): string {
  if (!name) return 'CV';
  const clean = name.replace(/\[|\]/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Extracts candidate name from master-data.md or fallback
 */
export function extractCandidateName(masterDataText: string, fallback: string = ''): string {
  const match = masterDataText.match(
    /(?:^|\n)\s*[-*•]?\s*\*{0,2}(?:Nombre Completo|Full Name|Candidate Name|Nombre)(?:\s*\/[^*:]*)?(?::\*{0,2}|\*{0,2}:)\s*(.+)$/im
  );
  if (match) {
    let raw = match[1].trim().replace(/^\s*\\?\[\s*|\s*\\?\]\s*$/g, '');
    raw = raw.replace(/\\([\[\]+*`_~\\-])/g, '$1').replace(/^\\+|\\+$/g, '').trim();
    if (
      !raw.toLowerCase().includes('tu nombre') && 
      !raw.toLowerCase().includes('nombre y apellido') &&
      !raw.toLowerCase().includes('candidate full name') &&
      !raw.toLowerCase().includes('candidate name')
    ) {
      return sanitizeFileName(raw);
    }
  }

  const headingMatch = masterDataText.match(/^#\s+([^\r\n]+)/m);
  if (headingMatch) {
    const raw = headingMatch[1].trim();
    if (
      !raw.toLowerCase().includes('tu nombre') && 
      !raw.toLowerCase().includes('nombre y apellido') &&
      !raw.toLowerCase().includes('candidate full name') &&
      !raw.toLowerCase().includes('candidate name') &&
      !raw.toLowerCase().includes('ejemplo') &&
      !raw.toLowerCase().includes('reporte') &&
      !raw.toLowerCase().includes('gap')
    ) {
      return sanitizeFileName(raw);
    }
  }

  return sanitizeFileName(fallback);
}

/**
 * Extracts target company from target-job.md or fallback
 */
export function extractTargetCompany(targetJobText: string, fallback: string = ''): string {
  const match = targetJobText.match(/(?:Empresa|Company):\*{0,2}\s*\[?(?:Ej:\s*|e\.g\.\s*)?([^\]\r\n*]+)\]?/i);
  if (match) {
    const raw = match[1].trim();
    if (
      !raw.toLowerCase().includes('startup x') && 
      !raw.toLowerCase().includes('company name') && 
      !raw.toLowerCase().includes('target company') &&
      !raw.includes('/')
    ) {
      return sanitizeFileName(raw);
    }
  }
  return sanitizeFileName(fallback);
}

/**
 * Extracts target role from target-job.md or master-data.md or fallback
 */
export function extractTargetRole(targetJobText: string, masterDataText: string = '', fallback: string = ''): string {
  let detectedRole = '';

  // 1. Check explicit vacancy role key-value headers (e.g. "Target Role: Senior Angular Developer")
  if (targetJobText) {
    const match = targetJobText.match(/(?:Target Role|Target Position|Role|Cargo|Puesto|Position|Title|Job Title):\*{0,2}\s*\[?(?:e\.g\.\s*|Ej:\s*)?([^\]\r\n*]+)\]?/i);
    if (match) {
      const raw = match[1].replace(/^[–\-•|:\s]+/, '').replace(/[–\-•|:\s]+$/, '').trim();
      if (
        !raw.toLowerCase().includes('target role') &&
        !raw.toLowerCase().includes('role title') &&
        !raw.toLowerCase().includes('e.g.') &&
        raw.length < 70
      ) {
        detectedRole = raw;
      }
    }

    // 2. Check natural vacancy opening sentences (e.g. "seeking an experienced Senior Angular/Front-End Developer...")
    if (!detectedRole) {
      const seekingMatch = targetJobText.match(/(?:seeking|looking for|hiring|need)\s+(?:an?\s+)?(?:experienced(?:\s+and\s+highly\s+skilled)?|highly skilled|skilled|talented|passionate|senior|lead|staff|principal)?\s*([A-Za-z0-9/ -]+(?:Developer|Engineer|Architect|Lead|Manager|Specialist|Consultant|Designer|Analyst|Scientist))/i);
      if (seekingMatch && seekingMatch[1]) {
        const clean = seekingMatch[1].replace(/^[–\-•|:\s]+/, '').replace(/[–\-•|:\s]+$/, '').trim();
        if (clean.length > 5 && clean.length < 70) {
          detectedRole = clean;
        }
      }
    }
  }

  // 3. Check explicit Primary Professional Title field from master-data.md
  let masterPrimaryTitle = '';
  if (masterDataText) {
    const primaryTitleMatch = masterDataText.match(
      /(?:^|\n)\s*[-*•]?\s*\*{0,2}(?:Primary Professional Title|Professional Title|Cargo Principal|Título Profesional|Target Role|Title|Cargo)(?:\s*\/[^*:]*)?(?::\*{0,2}|\*{0,2}:)\s*(.+)$/im
    );
    if (primaryTitleMatch) {
      let raw = primaryTitleMatch[1].trim().replace(/^\s*\\?\[\s*|\s*\\?\]\s*$/g, '');
      raw = raw.replace(/\\([\[\]+*`_~\\-])/g, '$1').replace(/^\\+|\\+$/g, '').trim();
      if (
        raw &&
        !raw.toLowerCase().includes('primary professional title') &&
        !raw.toLowerCase().includes('título profesional') &&
        raw.length < 90
      ) {
        masterPrimaryTitle = raw;
      }
    }
  }

  if (detectedRole) {
    // Seniority Boundary: Check if candidate's master data has Senior/Lead/Staff
    const seniorityLevels = ['Senior', 'Lead', 'Staff', 'Principal', 'Director', 'Head of'];
    for (const level of seniorityLevels) {
      const levelRegex = new RegExp(`\\b${level}\\b`, 'i');
      if (levelRegex.test(detectedRole)) {
        const hasLevelInMaster = levelRegex.test(masterPrimaryTitle) || (masterDataText && levelRegex.test(masterDataText.split(/##\s*(?:🛠️\s*)?(?:MASTER\s+TECH|SKILLS|TECHNICAL\s+SKILLS)/i)[0]));
        if (!hasLevelInMaster) {
          // Strip the inflated seniority level from detected role
          detectedRole = detectedRole.replace(levelRegex, '').replace(/^[–\-•|/:\s]+|[–\-•|/:\s]+$/g, '').trim();
        }
      }
    }
    return detectedRole;
  }

  if (masterPrimaryTitle) {
    return masterPrimaryTitle;
  }

  // Fallback: Check top header subtitle line right under # Name
  if (masterDataText) {
    const headerTitleMatch = masterDataText.match(/^#\s+[^\r\n]+\r?\n+\*\*([^*]+)\*\*/m);
    if (headerTitleMatch) {
      const raw = headerTitleMatch[1].trim();
      if (
        raw &&
        !raw.toLowerCase().includes('dossier') &&
        !raw.toLowerCase().includes('instructions') &&
        raw.length < 70
      ) {
        return raw;
      }
    }
  }

  return fallback;
}

/**
 * Extracts a clean, executive summary snippet from the CV markdown.
 */
export function extractSummaryExcerpt(cvMarkdown?: string): string {
  if (!cvMarkdown) return '';

  // 1. Try to extract content under ## Professional Summary / Resumen / Pitch
  const sectionMatch = cvMarkdown.match(/##\s*[^#\n]*(?:SUMMARY|RESUMEN|PROFILE|PERFIL|PITCH)[^\n]*\n+([\s\S]*?)(?=\n+##|\n+---|$)/i);
  let text = '';
  if (sectionMatch && sectionMatch[1]) {
    text = sectionMatch[1].trim();
  } else {
    // 2. Fallback: get first non-header, non-contact paragraph
    const lines = cvMarkdown.split('\n');
    const contentLines: string[] = [];
    let started = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!started && (trimmed.startsWith('#') || trimmed.startsWith('**') || trimmed.includes('@') || trimmed.includes('http') || trimmed.startsWith('---'))) {
        continue;
      }
      if (trimmed) {
        started = true;
        if (trimmed.startsWith('#')) break;
        contentLines.push(trimmed);
      } else if (started) {
        break;
      }
    }
    text = contentLines.join(' ');
  }

  // 3. Clean any markdown formatting (headers, bold, italic, links, bullets)
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Multilingual regex matching match score across 5 supported locales (EN, ES, DE, FR, IT).
 */
export const MULTILINGUAL_MATCH_SCORE_REGEX = /(?:Estimated Match Score|Puntuación Estimada|Geschätzter Match-Score|Score de Correspondance|Punteggio di Corrispondenza):\*{0,2}\s*(\d{1,3})/i;

/**
 * Multilingual regex matching critical integrated keywords across 5 supported locales (EN, ES, DE, FR, IT).
 */
export const MULTILINGUAL_KEYWORDS_REGEX = /(?:Critical Integrated Keywords|Palabras Clave Críticas Integradas|Integrierte kritische Schlüsselwörter|Mots-clés Critiques Intégrés|Parole Chiave Critiche Integrate):\*{0,2}\s*\[?([^\]\r\n]+)\]?/i;

/**
 * Extracts match score and critical keywords from Gap Analysis Markdown text (DRY & Single Responsibility).
 * Supports multilingual reports across all 5 locales and includes intelligent keyword extraction without hardcoded frameworks.
 */
export function extractGapInfo(
  gapMarkdown: string,
  targetJobText: string = ''
): { matchScore: number; keywords: string[] } {
  let matchScore = 0;
  if (gapMarkdown) {
    const scoreMatch = gapMarkdown.match(MULTILINGUAL_MATCH_SCORE_REGEX);
    if (scoreMatch) {
      const parsed = parseInt(scoreMatch[1], 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        matchScore = parsed;
      }
    }
  }

  let keywords: string[] = [];

  if (gapMarkdown) {
    const kwMatch = gapMarkdown.match(MULTILINGUAL_KEYWORDS_REGEX);
    if (kwMatch) {
      keywords = kwMatch[1]
        .split(/[,|•·;]/)
        .map((k) => k.replace(/[*_`\[\]]/g, '').trim())
        .filter(Boolean);
    }
  }

  // If no explicit keywords in gap markdown, extract top salient keywords from target job
  if (keywords.length === 0 && targetJobText && targetJobText.trim().length > 20) {
    const cleanJob = targetJobText
      .replace(/[#*`_\[\]()]/g, ' ')
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF-]/g, ' ');
    const tokens = cleanJob.split(/\s+/).filter((t) => t.length > 3);
    const stopWords = new Set([
      'with', 'have', 'from', 'this', 'that', 'your', 'about', 'will', 'must',
      'para', 'como', 'sobre', 'este', 'esta', 'para', 'con', 'experiencia',
      'responsibilities', 'qualifications', 'requirements', 'requisitos',
      'und', 'mit', 'für', 'pour', 'avec', 'dans', 'della', 'delle', 'con'
    ]);
    const candidates = Array.from(new Set(tokens.filter((t) => !stopWords.has(t.toLowerCase()))));
    keywords = candidates.slice(0, 6);
  }

  // Fallback if completely empty
  if (keywords.length === 0) {
    keywords = ['Core Competencies', 'Industry Best Practices', 'Leadership', 'Execution'];
  }

  return { matchScore, keywords };
}

