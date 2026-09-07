import { AIProviderSettings } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { getAIStrategy } from './strategies';
import { PromptBundle } from './prompt-builder';

export interface CvSectionBlock {
  rawHeader: string; // e.g. "## EXPERIENCIA LABORAL"
  title: string;     // e.g. "EXPERIENCIA LABORAL"
  content: string;   // the text lines belonging to this section
  fullText: string;  // header + content
  hash: string;      // fast content hash
}

export interface ParsedCvDocument {
  preamble: string; // Lines before first ## (e.g. # Candidate Name, contact items)
  preambleHash: string;
  sections: CvSectionBlock[];
}

/**
 * Fast, deterministic 32-bit string hash for comparing sections and documents.
 */
export function computeContentHash(str: string): string {
  let hash = 5381;
  const clean = str.trim().replace(/\r\n/g, '\n');
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Splits a CV Markdown document into structured sections based on '## '.
 */
export function parseCvIntoSections(markdown: string): ParsedCvDocument {
  if (!markdown) {
    return { preamble: '', preambleHash: '', sections: [] };
  }

  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  let preambleLines: string[] = [];
  const sections: CvSectionBlock[] = [];
  let currentHeader = '';
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentHeader) {
        const content = currentLines.join('\n');
        const fullText = `${currentHeader}\n${content}`.trim();
        sections.push({
          rawHeader: currentHeader,
          title: currentTitle,
          content,
          fullText,
          hash: computeContentHash(fullText),
        });
        currentLines = [];
      } else {
        preambleLines = [...currentLines];
        currentLines = [];
      }
      currentHeader = line.trim();
      currentTitle = currentHeader.replace(/^##\s+/, '').trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentHeader) {
    const content = currentLines.join('\n');
    const fullText = `${currentHeader}\n${content}`.trim();
    sections.push({
      rawHeader: currentHeader,
      title: currentTitle,
      content,
      fullText,
      hash: computeContentHash(fullText),
    });
  } else {
    preambleLines = currentLines;
  }

  const preamble = preambleLines.join('\n').trim();
  return {
    preamble,
    preambleHash: computeContentHash(preamble),
    sections,
  };
}

/**
 * Compares two base CV Markdown documents and detects which sections have changed.
 */
export function detectOutdatedSections(
  oldBaseMarkdown: string,
  newBaseMarkdown: string
): { isOutdated: boolean; changedSections: string[] } {
  if (!oldBaseMarkdown || !newBaseMarkdown) {
    return { isOutdated: false, changedSections: [] };
  }

  const oldDoc = parseCvIntoSections(oldBaseMarkdown);
  const newDoc = parseCvIntoSections(newBaseMarkdown);

  const changedSections: string[] = [];

  if (oldDoc.preambleHash !== newDoc.preambleHash) {
    changedSections.push('Header / Profile Info');
  }

  const oldSectionsMap = new Map(oldDoc.sections.map((s) => [s.title.toLowerCase(), s.hash]));

  for (const newSec of newDoc.sections) {
    const oldHash = oldSectionsMap.get(newSec.title.toLowerCase());
    if (!oldHash || oldHash !== newSec.hash) {
      changedSections.push(newSec.title);
    }
  }

  return {
    isOutdated: changedSections.length > 0,
    changedSections,
  };
}

/**
 * Clean raw LLM response text from surrounding markdown code fences.
 */
export function sanitizeLlmOutput(rawText: string): string {
  let text = rawText.trim();
  text = text.replace(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/i, '$1');
  text = text.replace(/^```([\s\S]*?)```$/i, '$1');
  return text.trim();
}

/**
 * System guidelines for CV translation with strict technical term protection.
 */
export function buildTranslationSystemPrompt(targetLangName: string, targetLangCode?: string): string {
  const isSpanish = targetLangCode === 'es' || /spanish|español/i.test(targetLangName);

  return `You are an elite, ATS-specialized multilingual CV translator and executive resume editor.
Your mission is to translate a professional CV/Resume into ${targetLangName} with native executive polish, maintaining high ATS compatibility.

CRITICAL INTEGRITY & NON-LITERAL TRANSLATION RULES:
1. TECHNICAL JOB TITLES & ROLES:
   - DO NOT literally translate established tech industry job titles (e.g. keep "Frontend Engineer", "Tech Lead Angular", "DevOps Engineer", "Cloud Architect", "Fullstack Developer", "Product Owner", "Scrum Master", "Site Reliability Engineer", "Data Scientist", "Mobile Developer").
   - Only translate universally localized traditional roles if standard in the target language (e.g., "Software Engineer" can remain "Software Engineer" or appropriate native equivalent, but NEVER invent clumsy literal translations like "Ingeniero del Frente" or "Líder Técnico de Angular").
2. TECH STACK & TOOLS:
   - NEVER translate technology names, frameworks, tools, libraries, or protocols (e.g. React, Next.js, Node.js, TypeScript, Docker, Kubernetes, AWS, GCP, Azure, CI/CD, SQL, REST APIs, GraphQL, Microservices, Git).
3. PROPER NOUNS & ENTITIES:
   - NEVER translate company names, university names, personal names, project brand names, URLs, or email addresses.
4. METRICS & FORMATTING:
   - Preserve all metrics, numbers, percentages, dates, and currency values.
   - Maintain the exact same Markdown syntax: headings (#, ##, ###), bold text (**word**), bullet points (-), and clean spacing.
5. NATURAL NARRATIVE & VERB TENSES:
   - For bullet points and summaries, translate the action verbs and business impact narratives using strong, natural executive phrasing in ${targetLangName} following the Google XYZ formula.
${isSpanish ? '   - **CRITICAL SPANISH VERB STANDARD (MANDATORY INFINITIVE):** In Spanish, ALL experience and project bullet points MUST begin with action verbs in the **INFINITIVE** form (e.g., Diseñar, Desarrollar, Implementar, Optimizar, Liderar, Refactorizar, Reducir, Coordinar). ❌ NEVER translate action verbs into past tense / pretérito (e.g. Diseñó, Desarrollé, Implementó, Optimizó).\n' : ''}6. OUTPUT FORMAT:
   - Return ONLY the translated Markdown text.
   - Do NOT include conversational greetings, explanations, or commentary.`;
}

export interface TranslateCvParams {
  cvMarkdown: string;
  targetLanguage: SupportedLanguage;
  providerSettings: AIProviderSettings;
}

/**
 * Builds prompt bundle for full CV translation.
 */
export function buildFullCvTranslationPrompts(cvMarkdown: string, targetLanguage: SupportedLanguage): PromptBundle {
  const langDef = LANGUAGE_DEFINITIONS[targetLanguage] || LANGUAGE_DEFINITIONS.en;
  const targetLangName = langDef.name;

  const systemPrompt = buildTranslationSystemPrompt(targetLangName, langDef.code);
  const userPrompt = `Translate the following complete CV into ${targetLangName}. Follow all technical preservation rules strictly:

\`\`\`markdown
${cvMarkdown}
\`\`\`

Return ONLY the translated Markdown text.`;

  return {
    systemInstruction: systemPrompt,
    userPrompt,
    company: 'CV Translation',
  };
}

/**
 * Translates the entire CV into the target language using the configured AI provider.
 */
export async function translateFullCv(params: TranslateCvParams): Promise<string> {
  const prompts = buildFullCvTranslationPrompts(params.cvMarkdown, params.targetLanguage);
  const strategy = getAIStrategy(params.providerSettings.provider);
  const result = await strategy.execute(prompts, params.providerSettings);

  return sanitizeLlmOutput(result.text);
}

export interface TranslateSectionParams {
  sectionTitle: string;
  sectionContent: string;
  targetLanguage: SupportedLanguage;
  providerSettings: AIProviderSettings;
}

/**
 * Builds prompt bundle for single section translation.
 */
export function buildSectionTranslationPrompts(
  sectionTitle: string,
  sectionContent: string,
  targetLanguage: SupportedLanguage
): PromptBundle {
  const langDef = LANGUAGE_DEFINITIONS[targetLanguage] || LANGUAGE_DEFINITIONS.en;
  const targetLangName = langDef.name;

  const systemPrompt = buildTranslationSystemPrompt(targetLangName, langDef.code);
  const userPrompt = `Translate ONLY this single CV section titled "${sectionTitle}" into ${targetLangName}.
Preserve exact Markdown formatting, bullet points, and technical terms:

\`\`\`markdown
## ${sectionTitle}
${sectionContent}
\`\`\`

Return ONLY the translated section Markdown text (including the ## heading).`;

  return {
    systemInstruction: systemPrompt,
    userPrompt,
    company: 'CV Translation',
  };
}

/**
 * Translates a single section of the CV (incremental diff translation to save token costs).
 */
export async function translateCvSection(params: TranslateSectionParams): Promise<string> {
  const prompts = buildSectionTranslationPrompts(params.sectionTitle, params.sectionContent, params.targetLanguage);
  const strategy = getAIStrategy(params.providerSettings.provider);
  const result = await strategy.execute(prompts, params.providerSettings);

  return sanitizeLlmOutput(result.text);
}

/**
 * Splices an updated translated section into an existing translated CV document.
 */
export function spliceTranslatedSection(
  currentTranslatedCv: string,
  sectionTitle: string,
  newTranslatedSection: string
): string {
  if (!currentTranslatedCv) return newTranslatedSection;

  const cleanTitle = sectionTitle.trim().replace(/^##\s+/, '');
  const titleRegex = new RegExp(`(^|\\n)##\\s+${cleanTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\n[\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');

  if (titleRegex.test(currentTranslatedCv)) {
    return currentTranslatedCv.replace(titleRegex, `$1${newTranslatedSection.trim()}`);
  }

  return `${currentTranslatedCv.trim()}\n\n${newTranslatedSection.trim()}`;
}
