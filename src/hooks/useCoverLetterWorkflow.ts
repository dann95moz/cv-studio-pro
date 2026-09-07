import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CVData } from '../types/cv';
import { useResumeStore } from '../store';
import {
  generateCoverLetter,
  buildCoverLetterPrompts,
  generateDeterministicCoverLetter,
} from '../core/ai-service';
import { useCopyToClipboard } from './useCopyToClipboard';

export type CoverLetterTone = 'corporate' | 'startup' | 'leadership';

export interface UseCoverLetterWorkflowProps {
  cvData: CVData;
  companyName: string;
  targetRole: string;
}

export interface UseCoverLetterWorkflowReturn {
  coverLetterMarkdown: string;
  setCoverLetterMarkdown: (content: string) => void;
  coverLetterTone: CoverLetterTone;
  loading: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  snackbar: string | null;
  copied: boolean;
  handleGenerateLetter: (tone?: CoverLetterTone) => Promise<void>;
  handleToneChange: (tone: CoverLetterTone) => void;
  handleCopyMarkdown: () => Promise<void>;
  handleCloseSnackbar: () => void;
}

export function useCoverLetterWorkflow({
  cvData,
  companyName,
  targetRole,
}: UseCoverLetterWorkflowProps): UseCoverLetterWorkflowReturn {
  const { t } = useTranslation(['preview', 'common']);

  const providerSettings = useResumeStore((s) => s.providerSettings);
  const targetJob = useResumeStore((s) => s.targetJob);
  const coverLetterMarkdown = useResumeStore((s) => s.coverLetterMarkdown);
  const setCoverLetterMarkdown = useResumeStore((s) => s.setCoverLetterMarkdown);
  const coverLetterTone = useResumeStore((s) => s.coverLetterTone);
  const setCoverLetterTone = useResumeStore((s) => s.setCoverLetterTone);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const handleGenerateLetter = useCallback(
    async (tone: CoverLetterTone = coverLetterTone) => {
      if (providerSettings.provider === 'manual') {
        const prompts = buildCoverLetterPrompts(
          cvData,
          targetJob,
          companyName,
          targetRole,
          tone
        );
        const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
        openManualPromptModal(bundle, 'Generate Tailored Cover Letter', (response) => {
          if (response && response.trim()) {
            setCoverLetterMarkdown(response.trim());
            setSnackbar(t('preview:coverLetter.generatedSuccess', 'Cover letter generated successfully!'));
          }
        });
        return;
      }

      setLoading(true);
      try {
        const generated = await generateCoverLetter(
          cvData,
          targetJob,
          companyName,
          targetRole,
          tone,
          providerSettings
        );
        setCoverLetterMarkdown(generated);
        setSnackbar(t('preview:coverLetter.generatedSuccess', 'Cover letter generated successfully!'));
      } catch (err) {
        console.error('Failed to generate cover letter:', err);
      } finally {
        setLoading(false);
      }
    },
    [cvData, targetJob, companyName, targetRole, coverLetterTone, providerSettings, setCoverLetterMarkdown, openManualPromptModal, t]
  );

  // Generate initial cover letter if empty
  useEffect(() => {
    if (!coverLetterMarkdown || coverLetterMarkdown.trim().length === 0) {
      if (providerSettings.provider === 'manual') {
        const initialDraft = generateDeterministicCoverLetter(
          cvData,
          companyName,
          targetRole,
          coverLetterTone
        );
        setCoverLetterMarkdown(initialDraft);
      } else {
        handleGenerateLetter(coverLetterTone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, targetRole]);

  const handleToneChange = useCallback(
    (tone: CoverLetterTone) => {
      setCoverLetterTone(tone);
      handleGenerateLetter(tone);
    },
    [setCoverLetterTone, handleGenerateLetter]
  );

  const handleCopyMarkdown = useCallback(async () => {
    if (!coverLetterMarkdown) return;
    await copy(coverLetterMarkdown);
    setSnackbar(t('common:actions.copied', 'Copied to clipboard!'));
  }, [coverLetterMarkdown, copy, t]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  return {
    coverLetterMarkdown,
    setCoverLetterMarkdown,
    coverLetterTone,
    loading,
    isEditing,
    setIsEditing,
    snackbar,
    copied,
    handleGenerateLetter,
    handleToneChange,
    handleCopyMarkdown,
    handleCloseSnackbar,
  };
}
