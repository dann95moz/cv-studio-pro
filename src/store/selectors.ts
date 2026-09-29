import { useMemo } from 'react';
import { useResumeStore } from './useResumeStore';
import { auditCvContent } from '../core/audit-engine';
import { CVData, ContactItem, QualityAuditReport, CvTranslationVariant, GeneratedCvVersion } from '../types/cv';
import { extractGapInfo } from '../utils/sanitize';
import { DEMO_CV_DATA } from '../constants/templates';
import { parseMarkdownToCvData } from '../core/parser';
import { findCandidateContacts, enrichContactList } from '../core/parser/contactFinder';
import { SupportedLanguage } from '../constants/languages';

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

export interface ComputeParsedCvParams {
  activeCvData?: CVData | null;
  cvMarkdown?: string;
  masterData?: string;
  activeLanguage?: string;
  currentBaseLanguage?: string;
  translations?: Record<string, CvTranslationVariant>;
  savedVersions?: GeneratedCvVersion[];
}

/**
 * Pure calculation function to resolve, parse, and enrich CV data with candidate credentials.
 */
export const computeParsedCv = (params: ComputeParsedCvParams): CVData => {
  const {
    activeCvData,
    cvMarkdown,
    masterData,
    activeLanguage,
    currentBaseLanguage,
    translations,
    savedVersions,
  } = params;

  const rawLang = (activeLanguage || currentBaseLanguage || 'es').toLowerCase();
  const effectiveLang: SupportedLanguage = (['es', 'en', 'de', 'fr', 'it'].includes(rawLang)
    ? rawLang
    : 'es') as SupportedLanguage;

  // Resolve comprehensive candidate contacts pool across all stores
  const candidatePool = findCandidateContacts({
    activeCvData,
    translations,
    cvMarkdown,
    masterData,
    savedVersions,
  });

  const enrichContacts = (variantContacts?: ContactItem[], lang: SupportedLanguage = effectiveLang): ContactItem[] => {
    return enrichContactList(variantContacts, candidatePool, lang);
  };

  const finalizeCvData = (data: CVData, targetLang: SupportedLanguage = effectiveLang): CVData => {
    return {
      ...data,
      contacts: enrichContacts(data.contacts, targetLang),
      language: data.language || targetLang,
    };
  };

  // 1. Language variant cvData (must have real candidate content)
  const variantData = activeLanguage && currentBaseLanguage && activeLanguage !== currentBaseLanguage
    ? translations?.[activeLanguage]?.cvData
    : undefined;
  if (
    variantData &&
    (variantData.name ||
      variantData.summary ||
      variantData.experience?.length ||
      variantData.skillGroups?.length)
  ) {
    return finalizeCvData(variantData, effectiveLang);
  }

  // 2. Language variant cvMarkdown
  if (
    activeLanguage &&
    currentBaseLanguage &&
    activeLanguage !== currentBaseLanguage &&
    translations?.[activeLanguage]?.cvMarkdown &&
    translations[activeLanguage].cvMarkdown.trim().length > 30
  ) {
    const parsedVariant = parseMarkdownToCvData(translations[activeLanguage].cvMarkdown, effectiveLang);
    if (parsedVariant.name || parsedVariant.summary || parsedVariant.experience?.length || parsedVariant.skillGroups?.length) {
      return finalizeCvData(parsedVariant, parsedVariant.language || effectiveLang);
    }
  }

  // 3. Active structured CV data (only if populated with real content)
  const isBaseLanguage = !activeLanguage || activeLanguage === currentBaseLanguage;
  if (
    isBaseLanguage &&
    activeCvData &&
    (activeCvData.name ||
      activeCvData.summary ||
      activeCvData.experience?.length ||
      activeCvData.skillGroups?.length)
  ) {
    return finalizeCvData(activeCvData, effectiveLang);
  }

  // 4. Tailored CV markdown
  if (cvMarkdown && cvMarkdown.trim().length > 30) {
    const parsed = parseMarkdownToCvData(cvMarkdown, effectiveLang);
    if (parsed.name || parsed.summary || parsed.experience?.length || parsed.skillGroups?.length) {
      return finalizeCvData(parsed, parsed.language || effectiveLang);
    }
  }

  // 5. Master Data fallback (if tailored markdown not generated yet)
  if (masterData && masterData.trim().length > 30) {
    const parsedMaster = parseMarkdownToCvData(masterData, effectiveLang);
    if (parsedMaster.name || parsedMaster.summary || parsedMaster.experience?.length || parsedMaster.skillGroups?.length) {
      return finalizeCvData(parsedMaster, parsedMaster.language || effectiveLang);
    }
  }

  return finalizeCvData(DEMO_CV_DATA, effectiveLang);
};

/**
 * Hook to get memoized CV data from current tailored state
 */
export const useParsedCv = (): CVData => {
  const activeCvData = useResumeStore((s) => s.activeCvData);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const masterData = useResumeStore((s) => s.masterData);
  const activeLanguage = useResumeStore((s) => s.activeLanguage);
  const currentBaseLanguage = useResumeStore((s) => s.currentBaseLanguage);
  const translations = useResumeStore((s) => s.translations);
  const savedVersions = useResumeStore((s) => s.savedVersions);

  return useMemo(() => {
    return computeParsedCv({
      activeCvData,
      cvMarkdown,
      masterData,
      activeLanguage,
      currentBaseLanguage,
      translations,
      savedVersions,
    });
  }, [activeCvData, cvMarkdown, masterData, activeLanguage, currentBaseLanguage, translations, savedVersions]);
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
