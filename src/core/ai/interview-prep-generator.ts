import { CVData } from '../../types/cv';
import { AIProviderSettings } from '../../types/cv';
import { InterviewPrepResult, InterviewQuestion } from '../../types/audit';
import { getAIStrategy } from './strategies';
import { PromptBundle } from './prompt-builder';

/**
 * Build prompts for gap-driven interview questions and STAR strategies.
 */
export function buildInterviewPrepPrompts(
  gapKeywords: string[],
  targetRole: string,
  companyName: string,
  cvData: CVData
): PromptBundle {
  const role = targetRole || cvData.title || 'Target Role';
  const company = companyName || 'Target Company';
  const topGaps = gapKeywords.slice(0, 8);

  const systemInstruction = `You are a Principal Tech Recruiter and Hiring Manager Interview Coach at ${company}.
Your mission is to generate high-value, realistic interview preparation questions tailored specifically to a candidate applying for the "${role}" position.

CRITICAL FOCUS:
Address the candidate's identified skill and domain gaps: [${topGaps.join(', ')}].
For each question, provide:
1. The exact question as an interviewer would ask it.
2. "rationale": Why the interviewer will ask this (linking directly to the gap or role expectation).
3. "starStrategy": Step-by-step guidance using the STAR formula (Situation, Task, Action, Result) explaining how the candidate can leverage adjacent competencies, transferable knowledge, or rapid learning examples.
4. "category": One of 'gap', 'technical', 'behavioral', 'leadership'.

OUTPUT FORMAT:
Return ONLY a valid, raw JSON object (no markdown code blocks, no backticks, no preamble) with this exact schema:
{
  "targetRole": "${role}",
  "companyName": "${company}",
  "overallTips": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3..."
  ],
  "questions": [
    {
      "id": "q1",
      "question": "Question text...",
      "category": "gap",
      "relatedGap": "Gap name",
      "rationale": "Why this is asked...",
      "starStrategy": {
        "situation": "Context to set...",
        "task": "The challenge or objective...",
        "action": "Specific engineering or leadership action taken...",
        "result": "Quantifiable outcome or architectural impact..."
      },
      "sampleAnswerOutline": "Brief speaking points outline..."
    }
  ]
}`;

  const userPrompt = `Candidate Profile Summary:
Name: ${cvData.name || 'Candidate'}
Current Title: ${cvData.title || 'Professional'}
Primary Skills: ${cvData.skillGroups?.flatMap(g => g.skills).slice(0, 15).join(', ') || 'Software Development'}
Identified Gaps for ${role} at ${company}: ${topGaps.join(', ') || 'Core Architecture, System Scale'}

Generate 5 to 7 high-impact interview preparation questions focusing on these specific gaps and role requirements.`;

  return {
    systemInstruction,
    userPrompt,
    company
  };
}

/**
 * Parses and validates raw LLM output into a typed InterviewPrepResult.
 */
export function parseInterviewPrepResponse(
  rawText: string,
  fallback: () => InterviewPrepResult
): InterviewPrepResult {
  try {
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as InterviewPrepResult;

    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Failed to parse Interview Prep response:', err);
  }
  return fallback();
}

/**
 * Generate intelligent, gap-driven interview questions and STAR strategies.
 */
export async function generateInterviewPrep(
  gapKeywords: string[],
  targetRole: string,
  companyName: string,
  cvData: CVData,
  settings: AIProviderSettings
): Promise<InterviewPrepResult> {
  const role = targetRole || cvData.title || 'Target Role';
  const company = companyName || 'Target Company';
  const topGaps = gapKeywords.slice(0, 8);
  const promptBundle = buildInterviewPrepPrompts(gapKeywords, targetRole, companyName, cvData);

  try {
    const isConfigured = Boolean(
      (settings.provider === 'local') ||
      (settings.provider === 'custom' && settings.customEndpoint?.trim()) ||
      (settings.apiKey && settings.apiKey.trim().length > 5)
    );

    if (!isConfigured) {
      return generateDeterministicFallback(topGaps, role, company, cvData);
    }

    const strategy = getAIStrategy(settings.provider);
    const result = await strategy.execute(promptBundle, settings);
    
    return parseInterviewPrepResponse(result.text, () => generateDeterministicFallback(topGaps, role, company, cvData));
  } catch (err) {
    console.warn('AI Interview prep failed, falling back to heuristic generator:', err);
    return generateDeterministicFallback(topGaps, role, company, cvData);
  }
}

/**
 * Deterministic, high-quality rule-based interview prep fallback when offline or without API key.
 */
export function generateDeterministicFallback(
  gapKeywords: string[],
  targetRole: string,
  companyName: string,
  cvData: CVData
): InterviewPrepResult {
  const role = targetRole || cvData.title || 'Software Engineer';
  const company = companyName || 'Target Company';
  const gaps = gapKeywords.length > 0 ? gapKeywords : ['System Architecture', 'CI/CD Pipelines', 'Performance Optimization', 'Cross-functional Leadership'];

  const questions: InterviewQuestion[] = [];

  // Gap-focused questions
  gaps.slice(0, 4).forEach((gap, idx) => {
    questions.push({
      id: `gap-${idx + 1}`,
      question: `Our team at ${company} heavily relies on ${gap} for mission-critical systems. Can you walk us through your hands-on experience with ${gap}, or how you would ramp up quickly to drive impact in this area?`,
      category: 'gap',
      relatedGap: gap,
      rationale: `The job posting specifically requires ${gap}, and the interviewer wants to test whether you have direct experience or strong adjacent fundamentals to learn it rapidly.`,
      starStrategy: {
        situation: `Acknowledge your foundational mastery in related domains before contextualizing past projects.`,
        task: `Define a past scenario where you faced a similar architectural challenge or had to adopt a new stack under tight deadlines.`,
        action: `Detail the concrete steps: studying architectural patterns, building proof-of-concepts, benchmarking performance, and establishing team best practices.`,
        result: `Highlight the delivery outcome (e.g. 99.9% uptime, reduced latency by 30%, or successful production migration).`
      },
      sampleAnswerOutline: `1. "While my primary production focus has been in [adjacent technology], the core paradigm of ${gap} mirrors principles I've applied extensively..." 2. Give 1 concrete example of fast tech stack adoption. 3. Express genuine excitement about applying it at ${company}.`
    });
  });

  // Architectural / Technical question
  questions.push({
    id: `tech-1`,
    question: `How do you approach balancing rapid feature velocity with long-term code maintainability, testing, and system reliability?`,
    category: 'technical',
    rationale: `Evaluates your senior engineering maturity and whether you can deliver value without introducing technical debt at ${company}.`,
    starStrategy: {
      situation: `Describe a fast-paced release cycle where scalability or test coverage was at risk.`,
      task: `Needed to ship a critical customer feature while maintaining zero downtime and robust observability.`,
      action: `Implemented modular component design, automated unit/integration tests in CI/CD, and established error boundaries.`,
      result: `Shipped on schedule with 0 critical regression bugs and streamlined future iterations.`
    },
    sampleAnswerOutline: `Discuss modularity, automated test suites, type safety with TypeScript, and proactive code reviews.`
  });

  // Behavioral / Collaboration question
  questions.push({
    id: `behavioral-1`,
    question: `Tell me about a time you had a technical disagreement with a colleague or stakeholder regarding system architecture. How did you resolve it?`,
    category: 'behavioral',
    rationale: `Tests collaboration, communication clarity, and how well you navigate engineering trade-offs with data over ego.`,
    starStrategy: {
      situation: `Working on a key feature where conflicting architectural approaches were proposed.`,
      task: `Reaching consensus without delaying sprint milestones.`,
      action: `Created a lightweight prototype, benchmarked metrics (latency, payload size, maintenance overhead), and facilitated a transparent review.`,
      result: `Adopted the data-backed solution collaboratively, resulting in mutual team buy-in.`
    },
    sampleAnswerOutline: `Emphasize empathy, listening, data-driven trade-off analysis, and team cohesion.`
  });

  return {
    targetRole: role,
    companyName: company,
    overallTips: [
      `Anchor your answers in the Google XYZ Formula: Accomplished [X], as measured by [Y], by doing [Z].`,
      `When addressing ${gaps[0] || 'skill gaps'}, frame them as exciting learning vectors backed by your proven ability to master adjacent technologies quickly.`,
      `Prepare 2-3 thoughtful questions about ${company}'s engineering roadmap, deployment frequency, and technical debt management.`
    ],
    questions,
    generatedAt: new Date().toISOString()
  };
}
