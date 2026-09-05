import { useMemo } from 'react';
import { useResumeStore } from './useResumeStore';
import { auditCvContent } from '../core/audit-engine';
import { CVData, QualityAuditReport } from '../types/cv';
import { extractGapInfo } from '../utils/sanitize';
import { DEMO_CV_DATA } from '../constants/templates';

export { extractGapInfo };

export const checkHasTargetJob = (targetJob: string): boolean => {
  return Boolean(targetJob && targetJob.trim().length > 20);
};

export const checkHasGeneratedCv = (cvMarkdown: string): boolean => {
  return Boolean(cvMarkdown && cvMarkdown.trim().length > 30);
};

export const checkHasGapReport = (gapMarkdown: string): boolean => {
  return Boolean(gapMarkdown && gapMarkdown.trim().length > 30);
};

/**
 * Hook to get memoized CV data from current tailored state
 */
export const useParsedCv = (): CVData => {
  const activeCvData = useResumeStore((s) => s.activeCvData);
  const activeLanguage = useResumeStore((s) => s.activeLanguage);
  const currentBaseLanguage = useResumeStore((s) => s.currentBaseLanguage);
  const translations = useResumeStore((s) => s.translations);

  return useMemo(() => {
    if (
      activeLanguage &&
      currentBaseLanguage &&
      activeLanguage !== currentBaseLanguage &&
      translations[activeLanguage]?.cvData
    ) {
      return translations[activeLanguage].cvData!;
    }
    return activeCvData || DEMO_CV_DATA;
  }, [activeCvData, activeLanguage, currentBaseLanguage, translations]);
};

/**
 * Hook to get memoized Quality Audit Report
 */
export const useAuditReport = (): QualityAuditReport => {
  const cvData = useParsedCv();
  const targetJob = useResumeStore((s) => s.targetJob);
  const masterData = useResumeStore((s) => s.masterData);
  return useMemo(() => auditCvContent(cvData, targetJob, masterData), [cvData, targetJob, masterData]);
};

/**
 * Hook to get memoized Gap Analysis Information
 */
export const useGapInfo = (): { matchScore: number; keywords: string[] } => {
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);
  const targetJob = useResumeStore((s) => s.targetJob);
  return useMemo(() => extractGapInfo(gapMarkdown, targetJob), [gapMarkdown, targetJob]);
};

/**
 * Hook to get validation flags for target job, tailored CV, and gap report
 */
export const useDerivedFlags = () => {
  const targetJob = useResumeStore((s) => s.targetJob);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);

  const hasTargetJob = useMemo(() => checkHasTargetJob(targetJob), [targetJob]);
  const hasGeneratedCv = useMemo(() => checkHasGeneratedCv(cvMarkdown), [cvMarkdown]);
  const hasGapReport = useMemo(() => checkHasGapReport(gapMarkdown), [gapMarkdown]);

  return { hasTargetJob, hasGeneratedCv, hasGapReport };
};
