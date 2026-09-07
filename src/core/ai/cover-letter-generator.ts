import { CVData } from '../../types/cv';
import { AIProviderSettings } from '../../types/cv';
import { getAIStrategy } from './strategies';
import { PromptBundle } from './prompt-builder';

export type CoverLetterTone = 'corporate' | 'startup' | 'leadership';

/**
 * Build prompts for Cover Letter generation.
 */
export function buildCoverLetterPrompts(
  cvData: CVData,
  targetJob: string,
  companyName: string,
  targetRole: string,
  tone: CoverLetterTone = 'corporate'
): PromptBundle {
  const role = targetRole || cvData.title || 'Target Role';
  const company = companyName || 'Target Company';
  const candidateName = cvData.name || 'Candidate';

  const toneGuidelines = {
    corporate: 'Professional, structured, respectful, and authoritative tone suitable for enterprise companies.',
    startup: 'Direct, energetic, high-ownership, problem-solving, and builder-focused tone suitable for fast-growing startups.',
    leadership: 'Strategic, vision-aligned, architectural-impact, and team-multiplier tone suitable for senior/staff/principal roles.'
  }[tone];

  const systemInstruction = `You are an elite Executive Career Coach and Technical Recruiter.
Your task is to write a compelling, tailored 3-paragraph cover letter for ${candidateName} applying for the position of "${role}" at "${company}".

LANGUAGE REQUIREMENT:
Analyze the target job vacancy. The cover letter MUST be written 100% in the exact same natural language as the target job vacancy (e.g. Spanish if the vacancy is in Spanish, German if in German, English if in English). Do NOT switch to English if the vacancy is in another language.

TONE REQUIREMENT:
${toneGuidelines}

STRICT WRITING RULES:
1. THREE PARAGRAPHS ONLY:
   - Paragraph 1 (The Hook): State genuine, research-backed excitement for ${company} and the ${role} opening.
   - Paragraph 2 (The Core Proof / Google XYZ Impact): Highlight 2 real achievements from the candidate's experience that directly address key requirements in the job posting, citing real metrics.
   - Paragraph 3 (Closing & Call to Action): State how the candidate's unique background will drive immediate value, and express enthusiasm for an interview discussion.
2. ZERO HALLUCINATIONS:
   - Use ONLY facts, companies, metrics, and technologies present in the candidate's profile.
3. Clean, professional epistolar Markdown format (Salutation, Body paragraphs, Sign-off).`;

  const topSkills = cvData.skillGroups?.flatMap((g) => g.skills).slice(0, 10).join(', ') || '';
  const topBullets = cvData.experience?.flatMap((e) => e.bullets).slice(0, 5).join('\n') || '';

  const userPrompt = `Candidate Profile:
Name: ${candidateName}
Current Title: ${cvData.title || 'Professional'}
Key Skills: ${topSkills}
Key Achievements:
${topBullets}

Target Job Vacancy (${company} - ${role}):
${targetJob || 'Standard high-impact engineering role'}

Please write the tailored cover letter in markdown format.`;

  return {
    systemInstruction,
    userPrompt,
    company
  };
}

/**
 * Generate a tailored 3-paragraph A4 cover letter matching candidate experience with the target vacancy.
 */
export async function generateCoverLetter(
  cvData: CVData,
  targetJob: string,
  companyName: string,
  targetRole: string,
  tone: CoverLetterTone = 'corporate',
  settings: AIProviderSettings
): Promise<string> {
  const role = targetRole || cvData.title || 'Target Role';
  const company = companyName || 'Target Company';
  const promptBundle = buildCoverLetterPrompts(cvData, targetJob, companyName, targetRole, tone);

  try {
    const isConfigured = Boolean(
      (settings.provider === 'local') ||
      (settings.provider === 'custom' && settings.customEndpoint?.trim()) ||
      (settings.apiKey && settings.apiKey.trim().length > 5)
    );

    if (!isConfigured) {
      return generateDeterministicCoverLetter(cvData, company, role, tone);
    }

    const strategy = getAIStrategy(settings.provider);
    const result = await strategy.execute(promptBundle, settings);
    
    if (result.text && result.text.trim().length > 100) {
      return result.text.trim();
    }
    
    return generateDeterministicCoverLetter(cvData, company, role, tone);
  } catch (err) {
    console.warn('AI Cover letter generation failed, using deterministic template:', err);
    return generateDeterministicCoverLetter(cvData, company, role, tone);
  }
}

/**
 * High-quality rule-based deterministic fallback generator.
 */
export function generateDeterministicCoverLetter(
  cvData: CVData,
  companyName: string,
  targetRole: string,
  tone: CoverLetterTone = 'corporate'
): string {
  const name = cvData.name || 'Candidate';
  const role = targetRole || cvData.title || 'Specialist';
  const company = companyName || 'Hiring Team';
  const exp = cvData.experience?.[0];
  const primaryCompany = exp?.company || 'leading tech organizations';
  const primaryAchievement = exp?.bullets?.[0] || 'engineered high-availability systems with measurable business outcomes';
  const secondaryAchievement = exp?.bullets?.[1] || cvData.projects?.[0]?.bullets?.[0] || 'streamlined technical workflows to increase delivery velocity';
  const topSkills = cvData.skillGroups?.flatMap((g) => g.skills).slice(0, 6).join(', ') || 'modern architecture and software engineering';

  if (tone === 'startup') {
    return `Dear ${company} Team,

I am writing to express my strong enthusiasm for the **${role}** position at **${company}**. As an engineer who thrives at the intersection of product velocity and architectural excellence, I have followed ${company}'s growth and admire your commitment to delivering world-class user experiences.

Throughout my tenure at ${primaryCompany}, I have focused on solving high-leverage technical challenges. Specifically, I ${primaryAchievement.toLowerCase().replace(/^\*/, '').trim()}, and ${secondaryAchievement.toLowerCase().replace(/^\*/, '').trim()}. With hands-on expertise spanning **${topSkills}**, I specialize in shipping resilient code rapidly without incurring architectural debt.

Joining ${company} represents an exciting opportunity to bring this high-ownership mindset to your engineering roadmap. I would welcome the opportunity to discuss how my background in scalable development and performance optimization will help accelerate your product milestones.

Warm regards,

**${name}**`;
  }

  if (tone === 'leadership') {
    return `Dear Hiring Committee at ${company},

I am pleased to submit my application for the **${role}** position. With a strong track record of engineering leadership and system design across high-growth environments, I am eager to contribute strategic and technical value to ${company}'s forward-looking initiatives.

In my recent work at ${primaryCompany}, I spearheaded critical engineering initiatives where I ${primaryAchievement.toLowerCase().replace(/^\*/, '').trim()}. Additionally, I ${secondaryAchievement.toLowerCase().replace(/^\*/, '').trim()}, fostering cross-functional alignment across product, design, and engineering teams. My core foundation in **${topSkills}** enables me to elevate team execution standards and mentor engineers toward impactful business outcomes.

I am enthusiastic about the opportunity to partner with ${company} to scale robust systems and drive continuous engineering excellence. Thank you for your consideration, and I look forward to our conversation.

Sincerely,

**${name}**`;
  }

  // Default: Corporate / Structured
  return `Dear Hiring Manager,

Please accept this letter as an expression of my serious interest in the **${role}** opportunity at **${company}**. With extensive professional experience in technical execution and scalable delivery, I am confident in my ability to make an immediate, meaningful contribution to your organization.

At ${primaryCompany}, I have consistently applied rigorous engineering principles to drive measurable business impact. Notably, I ${primaryAchievement.toLowerCase().replace(/^\*/, '').trim()}, while also having ${secondaryAchievement.toLowerCase().replace(/^\*/, '').trim()}. Backed by comprehensive expertise in **${topSkills}**, I bring a data-driven approach to every phase of development and deployment.

I welcome the opportunity to discuss how my qualifications align with ${company}'s strategic goals for the ${role} role. Thank you for your time and consideration.

Best regards,

**${name}**`;
}
