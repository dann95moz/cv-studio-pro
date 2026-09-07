import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CVData } from '../types/cv';
import { InterviewPrepResult, InterviewQuestion } from '../types/audit';
import { useResumeStore } from '../store';
import {
  generateInterviewPrep,
  buildInterviewPrepPrompts,
  parseInterviewPrepResponse,
  generateDeterministicInterviewPrep,
} from '../core/ai-service';

export interface UseInterviewPrepWorkflowProps {
  gapKeywords: string[];
  companyName: string;
  targetRole: string;
  cvData: CVData;
}

export function useInterviewPrepWorkflow({
  gapKeywords,
  companyName,
  targetRole,
  cvData,
}: UseInterviewPrepWorkflowProps) {
  const { t } = useTranslation(['audit', 'common']);
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);

  const [loading, setLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | false>('q1');

  const fetchInterviewPrep = useCallback(async () => {
    if (providerSettings.provider === 'manual') {
      const prompts = buildInterviewPrepPrompts(gapKeywords, targetRole, companyName, cvData);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
      openManualPromptModal(bundle, 'Generate Interview Questions & STAR Strategies', (response) => {
        const parsed = parseInterviewPrepResponse(response, () =>
          generateDeterministicInterviewPrep(gapKeywords, targetRole, companyName, cvData)
        );
        setPrepResult(parsed);
        if (parsed.questions.length > 0) {
          setExpandedId(parsed.questions[0].id);
        }
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateInterviewPrep(
        gapKeywords,
        targetRole,
        companyName,
        cvData,
        providerSettings
      );
      setPrepResult(result);
      if (result.questions.length > 0) {
        setExpandedId(result.questions[0].id);
      }
    } catch (err) {
      console.error('Failed to generate interview prep:', err);
    } finally {
      setLoading(false);
    }
  }, [gapKeywords, targetRole, companyName, cvData, providerSettings, openManualPromptModal]);

  useEffect(() => {
    if (providerSettings.provider === 'manual') {
      const initial = generateDeterministicInterviewPrep(gapKeywords, targetRole, companyName, cvData);
      setPrepResult(initial);
      if (initial.questions.length > 0) {
        setExpandedId(initial.questions[0].id);
      }
    } else {
      fetchInterviewPrep();
    }
  }, [gapKeywords, targetRole, companyName, providerSettings.provider, cvData, fetchInterviewPrep]);

  const handleCopyQuestion = (q: InterviewQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `**Question:** ${q.question}\n\n**Why they ask this:** ${q.rationale}\n\n**STAR Strategy:**\n- **Situation:** ${q.starStrategy.situation}\n- **Task:** ${q.starStrategy.task}\n- **Action:** ${q.starStrategy.action}\n- **Result:** ${q.starStrategy.result}\n\n**Outline:** ${q.sampleAnswerOutline || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setSnackbar(t('audit:interview.copied', 'Question & STAR strategy copied to clipboard!'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!prepResult) return;
    const allText =
      `# Interview Preparation for ${targetRole} at ${companyName}\n\n` +
      prepResult.questions
        .map(
          (q, i) =>
            `### ${i + 1}. [${q.category.toUpperCase()}] ${q.question}\n` +
            `*Rationale:* ${q.rationale}\n\n` +
            `**STAR Method Guide:**\n` +
            `- **S (Situation):** ${q.starStrategy.situation}\n` +
            `- **T (Task):** ${q.starStrategy.task}\n` +
            `- **A (Action):** ${q.starStrategy.action}\n` +
            `- **R (Result):** ${q.starStrategy.result}\n\n` +
            (q.sampleAnswerOutline ? `*Key Outline:* ${q.sampleAnswerOutline}\n\n` : '\n')
        )
        .join('---\n\n');

    navigator.clipboard.writeText(allText);
    setSnackbar(t('audit:interview.allCopied', 'All questions & STAR strategies copied!'));
  };

  return {
    loading,
    prepResult,
    copiedId,
    snackbar,
    setSnackbar,
    expandedId,
    setExpandedId,
    fetchInterviewPrep,
    handleCopyQuestion,
    handleCopyAll,
  };
}
