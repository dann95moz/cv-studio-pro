import { AIProviderSettings, CVData } from '../../types/cv';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';
import { getAIStrategy } from './strategies';
import { PromptBundle } from './prompt-builder';
import { parseJsonToCvData } from '../parser/jsonToCvData';
import { serializeCvDataToMarkdown, parseMarkdownToCvData } from '../parser';
import { cleanTrackingAndSearchUrl } from '../../utils/sanitize';

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

export interface TranslatedCvResult {
  cvData: CVData;
  cvMarkdown: string;
}

/**
 * System guidelines for CV translation with strict technical term protection and JSON schema enforcement.
 */
export function buildTranslationSystemPrompt(targetLangName: string, targetLangCode?: string): string {
  const isSpanish = targetLangCode === 'es' || /spanish|español/i.test(targetLangName);

  return `You are an elite, ATS-specialized multilingual CV translator and executive resume editor.
Your mission is to translate a professional CV/Resume into ${targetLangName} with native executive polish, maintaining 100% structured data integrity.

CRITICAL INTEGRITY & NON-LITERAL TRANSLATION RULES:
1. TECHNICAL JOB TITLES & ROLES:
   - DO NOT literally translate established tech industry job titles (e.g. keep "Frontend Engineer", "Tech Lead Angular", "DevOps Engineer", "Cloud Architect", "Fullstack Developer", "Product Owner", "Scrum Master", "Site Reliability Engineer", "Data Scientist", "Mobile Developer").
   - Only translate universally localized traditional roles if standard in the target language.
2. TECH STACK & TOOLS:
   - NEVER translate technology names, frameworks, tools, libraries, or protocols (e.g. React, Next.js, Node.js, TypeScript, Docker, Kubernetes, AWS, GCP, Azure, CI/CD, SQL, REST APIs, GraphQL, Microservices, Git).
3. PROPER NOUNS & ENTITIES:
   - NEVER translate company names, university names, personal names, project brand names, URLs, or email addresses.
4. CONTACT LINKS & URLS INTEGRITY:
   - Keep all URLs (LinkedIn, GitHub, Portfolio, demo, repo) EXACTLY as in the source.
   - ❌ NEVER prepend "https://www.google.com/search?q=" to emails, phone numbers, or links.
   - ❌ NEVER append tracking query parameters like "?utm_source=gemini".
   - Keep clean "mailto:...", "tel:...", "https://...".
5. SWISS & REGIONAL LEGAL FIELDS:
   - Accurately translate regional details when present in the CV:
     - Nationality (e.g. "Suisse", "Schweizer", "Suiza", "Swiss")
     - Work permit status (e.g. "Permis de travail : Citoyen suisse – Aucun permis requis", "Permis B", "Permis C", "Permis G frontalier")
     - Civil status (e.g. "Célibataire", "Ledig", "Soltero", "Single")
     - Availability / Cantonal mobility (e.g. "Disponibilité : Immédiate (Mobilité Suisse Romande)")
     - References (e.g. "Références disponibles sur demande")
6. NATURAL NARRATIVE & VERB TENSES:
   - For bullet points and summaries, translate action verbs and business impact narratives using strong, natural executive phrasing in ${targetLangName} following the Google XYZ formula.
${isSpanish ? '   - **CRITICAL SPANISH VERB STANDARD (MANDATORY INFINITIVE):** In Spanish, ALL experience and project bullet points MUST begin with action verbs in the **INFINITIVE** form (e.g., Diseñar, Desarrollar, Implementar, Optimizar, Liderar, Refactorizar, Reducir, Coordinar). ❌ NEVER translate action verbs into past tense / pretérito (e.g. Diseñó, Desarrollé, Implementó, Optimizó).\n' : ''}7. ACADEMIC DEGREES, DIPLOMAS & CERTIFICATIONS (MANDATORY LOCALIZATION):
   - Academic Degrees and Majors MUST be translated into their natural academic equivalent in ${targetLangName}:
     - e.g. "B.S. in Environmental Management" ➡️ in French: "Licence en Gestion Environnementale" or "Bachelor en Gestion de l'Environnement" (in German: "Bachelor in Umweltmanagement", in Spanish: "Grado / Pregrado en Gestión Ambiental").
     - ❌ NEVER leave degree titles in English when translating into French, German, Spanish, or Italian.
     - Keep the institution or university name intact as an authentic proper noun (e.g. "– Universidad Piloto de Colombia, 2020").
   - Certifications, Courses & Specializations:
     - Descriptive course and certification titles MUST be translated into ${targetLangName} while preserving technical framework/tool names (e.g. "Frontend Web Development in React.js" ➡️ in French: "Développement Web Frontend & React.js", in Spanish: "Desarrollo Web Frontend en React.js", in German: "Frontend-Webentwicklung mit React.js").
     - Keep the issuer/platform name intact (e.g. "– Platzi, 2023", "– Coursera / DeepLearning.AI").
8. AUTHENTIC TECHNICAL INDUSTRY VOCABULARY (NO AWKWARD FAUX-TRANSLATIONS):
   - In tech engineering, use standard industry terminology rather than literal or artificial translations:
     - In French: Use "design system" (❌ NEVER use "stylage" or "habillage" for UI component design systems). For example: "...en migrant le design system de Kendo UI vers Material UI (MUI)...".
     - In French: Use "gestion d'état" (or "state management"), "composants modulaires / réutilisables", "intégration continue (CI/CD)", "tests unitaires et d'intégration".
     - In Spanish/German/Italian: Use standard technical engineering idioms ("design system / sistema de diseño", "Design System", etc.).
=== STRICT OUTPUT FORMAT (JSON SCHEMA) ===
CRITICAL: You MUST return a single, strictly valid JSON object (optionally inside a \`\`\`json ... \`\`\` code block) adhering strictly to this schema. ❌ NEVER return raw unstructured text.

\`\`\`json
{
  "detectedLanguage": "${targetLangCode || 'en'}",
  "cvData": {
    "name": "Candidate authentic full name (never translate personal names)",
    "title": "Target Role / Professional Title in ${targetLangName}",
    "contacts": [
      { "type": "location", "label": "Candidate Location (e.g. Bogotá, Colombie)" },
      { "type": "email", "label": "real candidate email" },
      { "type": "phone", "label": "real candidate phone" },
      { "type": "linkedin", "label": "LinkedIn", "url": "real LinkedIn URL" },
      { "type": "github", "label": "GitHub", "url": "real GitHub URL" },
      { "type": "globe", "label": "Portfolio", "url": "real portfolio URL" }
    ],
    "summary": "3-4 lines dynamic summary translated into ${targetLangName} without bolding technology names, ending with **bold mandatory closing impact metrics**",
    "skills": [
      { "category": "Languages & Core Fundamentals", "skills": ["Skill 1", "Skill 2"] },
      { "category": "Frameworks, Architecture & Ecosystem", "skills": ["Skill 3", "Skill 4"] },
      { "category": "Tooling, Testing, CI/CD & AI Integrations", "skills": ["Skill 5", "Skill 6"] }
    ],
    "experience": [
      {
        "company": "Company Name",
        "location": "Company Location",
        "role": "Job Title",
        "date": "Localized dates (e.g. Oct 2024 – Avr 2026)",
        "bullets": [
          "Action verb with **bold technologies** and **bold quantified metrics** in ${targetLangName}"
        ]
      }
    ],
    "projects": [
      {
        "company": "Project Name",
        "role": "Role / Scope / Stack",
        "demoUrl": "https://...",
        "repoUrl": "https://...",
        "bullets": [
          "Project impact with **bold technologies** and **metrics** in ${targetLangName}"
        ]
      }
    ],
    "education": [
      "**Degree / Major** – Institution, Year"
    ],
    "certifications": [
      "**Certification Name** – Issuer, Year"
    ],
    "languages": [
      "**Language 1:** Native",
      "**Language 2:** [CEFR Level] in ${targetLangName}"
    ],
    "nationality": "Candidate nationality in ${targetLangName} (omit if absent)",
    "workPermit": "Work permit in ${targetLangName} (omit if absent)",
    "civilStatus": "Civil status in ${targetLangName} (omit if absent)",
    "dateOfBirth": "Date of birth (omit if absent)",
    "drivingLicense": "Driving license in ${targetLangName} (omit if absent)",
    "availability": "Availability in ${targetLangName} (omit if absent)",
    "references": "References in ${targetLangName} (omit if absent)"
  }
}
\`\`\``;
}

export interface TranslateCvParams {
  cvMarkdown: string;
  targetLanguage: SupportedLanguage;
  providerSettings: AIProviderSettings;
}

/**
 * Builds prompt bundle for full CV translation with strict JSON schema instructions.
 */
export function buildFullCvTranslationPrompts(cvMarkdown: string, targetLanguage: SupportedLanguage): PromptBundle {
  const langDef = LANGUAGE_DEFINITIONS[targetLanguage] || LANGUAGE_DEFINITIONS.en;
  const targetLangName = langDef.name;

  const systemPrompt = buildTranslationSystemPrompt(targetLangName, langDef.code);
  const userPrompt = `Translate the following complete CV into ${targetLangName}.
CRITICAL INSTRUCTION: Deliver your response as a single, strictly valid JSON object conforming to the cvData schema defined in the system prompt. Do NOT return plain text or unstructured markdown.

=== SOURCE CV TO TRANSLATE INTO ${targetLangName.toUpperCase()} ===
\`\`\`markdown
${cvMarkdown}
\`\`\`

Return ONLY the JSON object.`;

  return {
    systemInstruction: systemPrompt,
    userPrompt,
    company: 'CV Translation',
  };
}

/**
 * Parses and extracts structured CVData and valid Markdown from the translation LLM response.
 */
export function extractTranslatedCv(
  rawLlmText: string,
  fallbackMarkdown: string,
  targetLanguage: SupportedLanguage
): TranslatedCvResult {
  const sanitized = sanitizeLlmOutput(rawLlmText);

  // 1. Primary: parse structured JSON
  const parsedData = parseJsonToCvData(sanitized, fallbackMarkdown, '');
  if (parsedData && (parsedData.name || parsedData.summary || parsedData.experience?.length || parsedData.skillGroups?.length)) {
    const cvData: CVData = {
      ...parsedData,
      language: targetLanguage,
    };
    const cvMarkdown = serializeCvDataToMarkdown(cvData, targetLanguage);
    return { cvData, cvMarkdown };
  }

  // 2. Fallback: parse markdown or text with resilience to missing headers
  const cleanedText = cleanTrackingAndSearchUrl(sanitized);
  const parsedMarkdownData = parseMarkdownToCvData(cleanedText, targetLanguage);
  const cvData: CVData = {
    ...parsedMarkdownData,
    language: targetLanguage,
  };
  const cvMarkdown = serializeCvDataToMarkdown(cvData, targetLanguage) || cleanedText;
  return { cvData, cvMarkdown };
}

/**
 * Translates the entire CV into the target language using the configured AI provider,
 * returning both strongly-typed CVData and ATS-compliant Markdown.
 */
export async function translateFullCv(params: TranslateCvParams): Promise<TranslatedCvResult> {
  const prompts = buildFullCvTranslationPrompts(params.cvMarkdown, params.targetLanguage);
  const strategy = getAIStrategy(params.providerSettings.provider);
  const result = await strategy.execute(prompts, params.providerSettings);

  return extractTranslatedCv(result.text, params.cvMarkdown, params.targetLanguage);
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
