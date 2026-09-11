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

import { parseJsonToCvData, sanitizeJsonString, RawJsonCvInput } from '../parser/jsonToCvData';

/**
 * Tries parsing JSON output adhering to the AI JSON Schema.
 */
export function tryParseJsonCv(
  rawText: string,
  masterData: string,
  company: string,
  targetRole: string
): ExtractedCvAndGap | null {
  const cvData = parseJsonToCvData(rawText, masterData, targetRole);
  if (!cvData) return null;

  let score = 0;
  let keywords: string[] = [];
  let compName = company || 'Target Company';
  let tgtRole = targetRole || cvData.title || '';
  let narrative = '';
  let gaps = '';

  try {
    const cleaned = sanitizeJsonString(rawText);
    const parsed = JSON.parse(cleaned) as RawJsonCvInput;
    if (parsed && typeof parsed === 'object') {
      const gap = parsed.gapReport || parsed.gapAnalysis;
      if (gap) {
        score = gap.estimatedScore ?? gap.estimatedMatchScore ?? 0;
        keywords = gap.criticalKeywords ?? gap.criticalIntegratedKeywords ?? [];
        if (gap.targetCompany) compName = gap.targetCompany;
        if (gap.targetRole) tgtRole = gap.targetRole;
        if (gap.narrative) narrative = gap.narrative;
        if (gap.gaps) gaps = gap.gaps;
      }
    }
  } catch {
    // If gap parsing fails, proceed with cvData defaults
  }

  const detectedLang = cvData.language || 'es';
  const cvMarkdown = serializeCvDataToMarkdown(cvData, detectedLang);

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
