import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CVData } from '../types/cv';
import { LinkedInProfileResult } from '../types/linkedin';
import { AIProviderSettings } from '../types/ai';
import { useResumeStore } from '../store';
import {
  generateLinkedInProfile,
  buildLinkedInPrompts,
  parseLinkedInResponse,
  generateDeterministicLinkedInProfile,
} from '../core/ai-service';
import { useCopyToClipboard } from './useCopyToClipboard';

export interface UseLinkedInWorkflowProps {
  cvData: CVData;
  companyName: string;
  targetRole: string;
  targetJob?: string;
  providerSettings?: AIProviderSettings;
}

export interface UseLinkedInWorkflowReturn {
  loading: boolean;
  data: LinkedInProfileResult | null;
  copiedId: string | null;
  isEditingAbout: boolean;
  setIsEditingAbout: React.Dispatch<React.SetStateAction<boolean>>;
  aboutText: string;
  setAboutText: (text: string) => void;
  snackbar: string | null;
  handleGenerate: () => Promise<void>;
  handleCopy: (text: string, id: string, label: string) => Promise<void>;
  handleCloseSnackbar: () => void;
}

const DEFAULT_SETTINGS_FALLBACK: AIProviderSettings = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  temperature: 0.2,
};

export function useLinkedInWorkflow({
  cvData,
  companyName,
  targetRole,
  targetJob = '',
  providerSettings,
}: UseLinkedInWorkflowProps): UseLinkedInWorkflowReturn {
  const { t } = useTranslation(['preview', 'common']);
  const { copy } = useCopyToClipboard();
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LinkedInProfileResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const activeSettings = providerSettings || DEFAULT_SETTINGS_FALLBACK;

  const handleGenerate = useCallback(async () => {
    if (activeSettings.provider === 'manual') {
      const prompts = buildLinkedInPrompts(cvData, targetJob, companyName, targetRole);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
      openManualPromptModal(bundle, 'Generate LinkedIn Profile Package', (response) => {
        const parsed = parseLinkedInResponse(response, () =>
          generateDeterministicLinkedInProfile(cvData, targetRole, companyName)
        );
        setData(parsed);
        setAboutText(parsed.about.text);
      });
      return;
    }

    setLoading(true);
    try {
      const res = await generateLinkedInProfile(
        cvData,
        targetJob,
        companyName,
        targetRole,
        activeSettings
      );
      setData(res);
      setAboutText(res.about.text);
    } catch (err) {
      console.error('Failed to generate LinkedIn profile:', err);
    } finally {
      setLoading(false);
    }
  }, [cvData, targetJob, companyName, targetRole, activeSettings, openManualPromptModal]);

  useEffect(() => {
    if (activeSettings.provider === 'manual') {
      const initial = generateDeterministicLinkedInProfile(cvData, targetRole, companyName);
      setData(initial);
      setAboutText(initial.about.text);
    } else {
      handleGenerate();
    }
  }, [companyName, targetRole, activeSettings.provider, handleGenerate, cvData]);

  const handleCopy = useCallback(
    async (text: string, id: string, label: string) => {
      await copy(text);
      setCopiedId(id);
      setSnackbar(t('preview:linkedin.copiedToast', '{{label}} copied to clipboard!', { label }));
      setTimeout(() => setCopiedId(null), 2000);
    },
    [copy, t]
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  return {
    loading,
    data,
    copiedId,
    isEditingAbout,
    setIsEditingAbout,
    aboutText,
    setAboutText,
    snackbar,
    handleGenerate,
    handleCopy,
    handleCloseSnackbar,
  };
}
