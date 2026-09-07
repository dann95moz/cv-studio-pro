import { CVData } from '../../types/cv';
import { AIProviderSettings } from '../../types/cv';
import { LinkedInProfileResult, LinkedInHeadline, LinkedInAbout } from '../../types/linkedin';
import { getAIStrategy } from './strategies';
import { PromptBundle } from './prompt-builder';

/**
 * Build prompts for LinkedIn Profile optimization.
 */
export function buildLinkedInPrompts(
  cvData: CVData,
  targetJob: string,
  companyName: string,
  targetRole: string
): PromptBundle {
  const role = targetRole || cvData.title || 'Senior Software Engineer';
  const company = companyName || 'Target Company';
  const name = cvData.name || 'Candidate';
  const topSkills = cvData.skillGroups?.flatMap((g) => g.skills).slice(0, 12).join(', ') || 'TypeScript, React, Architecture';
  const topBullets = cvData.experience?.flatMap((e) => e.bullets).slice(0, 4).join('\n') || '';

  const systemInstruction = `You are a world-class Executive LinkedIn Brand Strategist and Technical Recruiter.
Your goal is to optimize ${name}'s LinkedIn profile to attract recruiters and hiring managers for roles like "${role}".

YOU MUST OUTPUT STRICT VALID JSON with no markdown fences, matching this exact schema:
{
  "headlines": [
    {
      "id": "h1",
      "style": "keyword",
      "title": "Keyword-Dense & ATS Recruiter Focused",
      "text": "Exact headline string (MAX 220 CHARACTERS). Use pipes (|) or bullets (•) to separate skills and impact.",
      "charCount": 0
    },
    {
      "id": "h2",
      "style": "value",
      "title": "High-Impact Value Proposition",
      "text": "Exact headline string (MAX 220 CHARACTERS). Focus on what business problems the candidate solves.",
      "charCount": 0
    },
    {
      "id": "h3",
      "style": "executive",
      "title": "Executive & Strategic Leadership",
      "text": "Exact headline string (MAX 220 CHARACTERS). Focus on scale, architecture, and team enablement.",
      "charCount": 0
    }
  ],
  "about": {
    "text": "Complete 3-paragraph formatted About section string (max 2600 chars).",
    "charCount": 0,
    "hook": "Paragraph 1 hook string",
    "coreStory": "Paragraph 2 career impact & Google XYZ metrics string",
    "skillsAndContact": "Paragraph 3 core stack & call to action"
  }
}

CRITICAL RULES:
- Headlines MUST NOT exceed 220 characters.
- About section MUST NOT exceed 2600 characters.
- Use ONLY real candidate skills and achievements. No hallucinations.`;

  const userPrompt = `Candidate Profile:
Name: ${name}
Current Title: ${cvData.title || 'Software Engineer'}
Core Skills: ${topSkills}
Key Accomplishments:
${topBullets}

Target Role / Industry: ${role} ${company ? `(Targeting ${company})` : ''}

Generate the JSON LinkedIn Profile Optimization Package now.`;

  return {
    systemInstruction,
    userPrompt,
    company
  };
}

/**
 * Parses and validates raw LLM output into a typed LinkedInProfileResult.
 */
export function parseLinkedInResponse(
  rawText: string,
  fallback: () => LinkedInProfileResult
): LinkedInProfileResult {
  try {
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as LinkedInProfileResult;

    if (parsed.headlines && parsed.headlines.length > 0 && parsed.about?.text) {
      parsed.headlines = parsed.headlines.map((h) => ({
        ...h,
        charCount: h.text.length,
      }));
      parsed.about.charCount = parsed.about.text.length;
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse LinkedIn response:', err);
  }
  return fallback();
}

/**
 * Generate 3 tailored LinkedIn headlines (max 220 chars) and a 3-part storytelling About summary (max 2600 chars).
 */
export async function generateLinkedInProfile(
  cvData: CVData,
  targetJob: string,
  companyName: string,
  targetRole: string,
  settings: AIProviderSettings
): Promise<LinkedInProfileResult> {
  const role = targetRole || cvData.title || 'Senior Software Engineer';
  const company = companyName || 'Target Company';
  const promptBundle = buildLinkedInPrompts(cvData, targetJob, companyName, targetRole);

  try {
    const isConfigured = Boolean(
      (settings.provider === 'local') ||
      (settings.provider === 'custom' && settings.customEndpoint?.trim()) ||
      (settings.apiKey && settings.apiKey.trim().length > 5)
    );

    if (!isConfigured) {
      return generateDeterministicLinkedInProfile(cvData, role, company);
    }

    const strategy = getAIStrategy(settings.provider);
    const result = await strategy.execute(promptBundle, settings);
    
    if (result.text) {
      return parseLinkedInResponse(result.text, () => generateDeterministicLinkedInProfile(cvData, role, company));
    }

    return generateDeterministicLinkedInProfile(cvData, role, company);
  } catch (err) {
    console.warn('AI LinkedIn generation failed, using deterministic fallback:', err);
    return generateDeterministicLinkedInProfile(cvData, role, company);
  }
}

/**
 * High-quality deterministic fallback for LinkedIn headlines & About section.
 */
export function generateDeterministicLinkedInProfile(
  cvData: CVData,
  targetRole: string,
  companyName: string
): LinkedInProfileResult {
  const role = targetRole || cvData.title || 'Senior Software Engineer';
  const skills = cvData.skillGroups?.flatMap(g => g.skills).slice(0, 5).join(' • ') || 'TypeScript • React • Node.js • Architecture';
  const exp = cvData.experience?.[0];
  const bullet = exp?.bullets?.[0]?.replace(/^\*/, '').trim() || 'Engineered high-throughput web applications with 99.99% uptime';
  const primaryCompany = exp?.company || 'leading tech companies';

  const h1Text = `${role} | ${skills} | High-Scale Web Architecture`;
  const h2Text = `${role} | Helping engineering teams ship fast, reliable, and accessible products | Ex-${primaryCompany}`;
  const h3Text = `Staff & Lead ${role} | Systems Architecture • Distributed Scale • Team Multiplier | ${skills}`;

  const headlines: LinkedInHeadline[] = [
    {
      id: 'h1',
      style: 'keyword',
      title: 'Keyword-Dense & ATS Recruiter Focused',
      text: h1Text.slice(0, 220),
      charCount: h1Text.slice(0, 220).length,
    },
    {
      id: 'h2',
      style: 'value',
      title: 'High-Impact Value Proposition',
      text: h2Text.slice(0, 220),
      charCount: h2Text.slice(0, 220).length,
    },
    {
      id: 'h3',
      style: 'executive',
      title: 'Executive & Strategic Leadership',
      text: h3Text.slice(0, 220),
      charCount: h3Text.slice(0, 220).length,
    },
  ];

  const hook = `I am a ${role} focused on engineering scalable, performant, and resilient user interfaces that solve complex business bottlenecks.`;
  const coreStory = `Throughout my career at ${primaryCompany}, I have led high-leverage technical projects. Notably, I ${bullet.toLowerCase()}. I combine deep technical craft with product empathy to turn ambitious product roadmaps into reality.`;
  const skillsAndContact = `Core Technical Expertise:\n• Languages & Frameworks: ${skills}\n• Architecture: Distributed Systems, Performance Optimization, Clean Code\n\nAlways open to connecting with fellow engineers, tech leaders, and teams building impactful software.`;

  const fullAboutText = `${hook}\n\n${coreStory}\n\n${skillsAndContact}`;

  const about: LinkedInAbout = {
    text: fullAboutText,
    charCount: fullAboutText.length,
    hook,
    coreStory,
    skillsAndContact,
  };

  return { headlines, about };
}
