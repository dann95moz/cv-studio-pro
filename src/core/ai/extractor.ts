import {
  MULTILINGUAL_MATCH_SCORE_REGEX,
  MULTILINGUAL_KEYWORDS_REGEX
} from '../parser/metadataExtractor';
import { extractJobKeywords } from '../matching/quickMatcher';
import { CVData, CVSection } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { serializeCvDataToMarkdown, parseMarkdownToCvData, extractCandidateName } from '../parser';
import {
  inferDocumentLanguage,
  normalizeSkillCategory,
  cleanCvData,
  cleanSummary,
  cleanBulletText,
  cleanSkillItem,
  cleanSkillCategory,
  cleanEducationItem,
  cleanLanguageItem
} from '../parser/markdownToCvData';

export interface ExtractedCvAndGap {
  cvMarkdown: string;
  gapMarkdown: string;
  score: number;
  keywords: string[];
  cvData?: CVData;
  detectedLanguage?: SupportedLanguage;
}

interface JsonCvOutput {
  detectedLanguage?: string;
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
  cvData?: {
    name?: string;
    title?: string;
    contacts?: Array<{ type: any; label: string; url?: string }>;
    summary?: string;
    skills?: Array<{ category: string; skills: string[] }>;
    experience?: Array<{ company: string; role?: string; date?: string; location?: string; bullets?: string[] }>;
    projects?: Array<{ company?: string; name?: string; role?: string; demoUrl?: string; repoUrl?: string; bullets?: string[] }>;
    education?: string[];
    certifications?: string[];
    languages?: string[];
  };
}

/**
 * Tries parsing JSON output adhering to the AI JSON Schema.
 */
function tryParseJsonCv(
  rawText: string,
  masterData: string,
  company: string,
  targetRole: string
): ExtractedCvAndGap | null {
  let candidateJson = rawText.trim();
  const fenceMatch = candidateJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    candidateJson = fenceMatch[1].trim();
  } else {
    const firstBrace = candidateJson.indexOf('{');
    const lastBrace = candidateJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      candidateJson = candidateJson.slice(firstBrace, lastBrace + 1);
    }
  }

  try {
    const parsed = JSON.parse(candidateJson) as JsonCvOutput;
    if (!parsed || !parsed.cvData) return null;

    const rawName = parsed.cvData.name?.trim() || '';
    const isPlaceholder = !rawName || rawName.includes('[') || rawName.toLowerCase().includes('candidate full name') || rawName.toLowerCase() === 'candidate';
    const candidateName = !isPlaceholder ? rawName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() : extractCandidateName(masterData, 'Candidate');
    const role = parsed.cvData.title || targetRole || '';

    const contacts = (parsed.cvData.contacts || [])
      .filter((c) => c && c.label && !c.label.includes('[candidate') && !c.label.includes('[+1 (555)'))
      .map((c) => ({
        type: c.type || 'globe',
        label: c.label.replace(/\\/g, '').trim(),
        url: c.url?.replace(/\\/g, '').trim(),
      }));

    const inferred = inferDocumentLanguage(parsed.cvData.summary || rawText);
    const detectedLang: SupportedLanguage = parsed.detectedLanguage && ['es', 'en', 'de', 'fr', 'it'].includes(parsed.detectedLanguage.toLowerCase())
      ? (parsed.detectedLanguage.toLowerCase() as SupportedLanguage)
      : inferred;
    const langDef = LANGUAGE_DEFINITIONS[detectedLang] || LANGUAGE_DEFINITIONS.es;

    const sections: CVSection[] = [];
    if (parsed.cvData.summary) {
      sections.push({ id: 'summary', type: 'summary', title: langDef.sections.summary });
    }
    if (parsed.cvData.skills && parsed.cvData.skills.length > 0) {
      sections.push({ id: 'skills', type: 'skills', title: langDef.sections.skills });
    }
    if (parsed.cvData.experience && parsed.cvData.experience.length > 0) {
      sections.push({ id: 'experience', type: 'experience', title: langDef.sections.experience });
    }
    if (parsed.cvData.projects && parsed.cvData.projects.length > 0) {
      sections.push({ id: 'projects', type: 'projects', title: langDef.sections.projects });
    }
    if ((parsed.cvData.education && parsed.cvData.education.length > 0) || (parsed.cvData.certifications && parsed.cvData.certifications.length > 0)) {
      sections.push({ id: 'education', type: 'education', title: langDef.sections.education });
    }
    if (parsed.cvData.languages && parsed.cvData.languages.length > 0) {
      sections.push({ id: 'languages', type: 'languages', title: langDef.sections.languages });
    }

    const rawCvData: CVData = {
      name: candidateName,
      title: role,
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
      summary: cleanSummary(parsed.cvData.summary || ''),
      skillGroups: (parsed.cvData.skills || []).map((sg) => ({
        category: cleanSkillCategory(normalizeSkillCategory((sg.category || '').trim(), detectedLang)),
        skills: (sg.skills || [])
          .map((sk) => cleanSkillItem(sk))
          .filter(Boolean),
      })),
      experience: (parsed.cvData.experience || []).map((exp) => ({
        company: exp.company || '',
        role: exp.role || 'Specialist',
        date: exp.date || '',
        location: exp.location || '',
        bullets: (exp.bullets || []).map(cleanBulletText).filter(Boolean),
      })),
      projects: (parsed.cvData.projects || []).map((proj) => ({
        company: proj.company || proj.name || 'Project',
        role: proj.role || '',
        demoUrl: proj.demoUrl,
        repoUrl: proj.repoUrl,
        bullets: (proj.bullets || []).map(cleanBulletText).filter(Boolean),
      })),
      education: (parsed.cvData.education || []).map(cleanEducationItem).filter(Boolean),
      certifications: (parsed.cvData.certifications || []).map(cleanEducationItem).filter(Boolean),
      languages: (parsed.cvData.languages || []).map(cleanLanguageItem).filter(Boolean),
    };

    const cvData = cleanCvData(rawCvData);
    const cvMarkdown = serializeCvDataToMarkdown(cvData, detectedLang);
    const score = parsed.gapReport?.estimatedScore ?? parsed.gapReport?.estimatedMatchScore ?? 0;
    const keywords = parsed.gapReport?.criticalKeywords ?? parsed.gapReport?.criticalIntegratedKeywords ?? [];

    const compName = parsed.gapReport?.targetCompany || company || 'Target Company';
    const tgtRole = parsed.gapReport?.targetRole || targetRole || role;
    const narrative = parsed.gapReport?.narrative || '';
    const gaps = parsed.gapReport?.gaps || '';

    const gapMarkdown = [
      `# MATCHING & TAILORING REPORT`,
      `- **Target Company:** ${compName}`,
      `- **Target Role:** ${tgtRole}`,
      `- **Estimated Match Score:** ${score}/100`,
      `- **Critical Integrated Keywords:** ${keywords.join(', ')}`,
      `- **Strategic Narrative:** ${narrative}`,
      `- **Addressed Gaps:** ${gaps}`,
    ].join('\n');

    return {
      cvMarkdown,
      gapMarkdown,
      score,
      keywords,
      cvData,
      detectedLanguage: detectedLang,
    };
  } catch {
    return null;
  }
}

/**
 * Pure function: Extracts and separates Part 1 (Gap Analysis) and Part 2 (Tailored CV) from LLM output.
 * Primary: AI JSON Schema. Fallback: Delimited Markdown.
 */
export function extractCvAndGap(
  rawText: string,
  masterData: string = '',
  company: string = '',
  targetRole: string = ''
): ExtractedCvAndGap {
  // 1. Try JSON schema extraction first (Ruta B)
  const jsonResult = tryParseJsonCv(rawText, masterData, company, targetRole);
  if (jsonResult) {
    return jsonResult;
  }

  // 2. Fallback to Markdown regex extraction for backward compatibility
  let gapContent = '';
  let cvContent = rawText;

  // Extract Gap Analysis (multilingual: EN, ES, DE, FR, IT)
  const gapRegex = /(?:#\s*(?:PART\s*1\s*:?\s*)?(?:MATCHING & TAILORING|GAP ANALYSIS|MATCHING STRATEGY|REPORTE DE ESTRATEGIA|REPORTE DE MATCHING|MATCHING- & ANPASSUNGSSTRATEGIEBERICHT|RAPPORT DE STRATÉGIE|RAPPORTO DI STRATEGIA)[\s\S]*?)(?=(?:#\s*(?:PART\s*2\s*:?\s*)?(?:TAILORED CV|CV OPTIMIZADO|ANGEPASSTER LEBENSLAUF|CV ADAPTÉ|CV SU MISURA)|#\s+[A-ZÁÉÍÓÚÑÄÖÜÀÈÉÌÒÙ]{3,}\s+[A-ZÁÉÍÓÚÑÄÖÜÀÈÉÌÒÙ]{3,}|\n---\s*\n#))/i;
  const gapMatch = rawText.match(gapRegex);

  if (gapMatch) {
    gapContent = gapMatch[0]
      .replace(/```markdown/gi, '')
      .replace(/```/g, '')
      .trim();
  }

  // Extract CV Content cleanly (find where candidate header starts)
  const candidateHeaderRegex = /(?:#\s+(?:PART\s*2\s*:?\s*)?(?:TAILORED CV|CV OPTIMIZADO|ANGEPASSTER LEBENSLAUF|CV ADAPTÉ|CV SU MISURA)\s*)?(#\s+[A-ZÁÉÍÓÚÑÄÖÜÀÈÉÌÒÙ\s\[\]]{4,}[\r\n]+[\s\S]*)$/i;
  const cvMatch = rawText.match(candidateHeaderRegex);

  if (cvMatch && cvMatch[1]) {
    cvContent = cvMatch[1];
  } else if (gapMatch) {
    cvContent = rawText.replace(gapMatch[0], '');
  }

  // Clean markdown backticks and labels
  cvContent = cvContent
    .replace(/^#\s*(?:PART\s*2\s*:?\s*)?(?:TAILORED CV|CV OPTIMIZADO|ANGEPASSTER LEBENSLAUF|CV ADAPTÉ|CV SU MISURA)\s*/i, '')
    .replace(/```markdown\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Extract Match Score (supports multilingual label matching; defaults to 0 if unparsed, per anti-patterns rules)
  let score = 0;
  const scoreMatch = (gapContent || rawText).match(MULTILINGUAL_MATCH_SCORE_REGEX);
  if (scoreMatch) {
    const parsed = parseInt(scoreMatch[1], 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      score = parsed;
    }
  }

  // Extract Keywords (supports multilingual label matching)
  let keywords: string[] = [];
  const kwMatch = (gapContent || rawText).match(MULTILINGUAL_KEYWORDS_REGEX);
  if (kwMatch) {
    keywords = kwMatch[1]
      .split(/[,|•·;]/)
      .map(k => k.replace(/[*_`\[\]]/g, '').trim())
      .filter(Boolean);
  }

  // Fallback: extract domain keywords from actual response text if gap block didn't contain explicit list
  if (keywords.length === 0) {
    keywords = extractJobKeywords(gapContent || rawText).slice(0, 6);
  }

  const fallbackCvData = parseMarkdownToCvData(cvContent);

  return {
    cvMarkdown: cvContent,
    gapMarkdown: gapContent,
    score,
    keywords,
    cvData: fallbackCvData,
    detectedLanguage: fallbackCvData.language,
  };
}
