import { useState } from 'react';
import {
  useResumeStore,
  useParsedCv,
  useAuditReport,
  useGapInfo,
} from '../../store';
import { getTemplateMetadata } from '../../templates';
import { usePreviewCanvasMetrics } from '../preview/usePreviewCanvasMetrics';
import { usePreviewExports } from '../preview/usePreviewExports';
import { usePreviewTranslation } from '../preview/usePreviewTranslation';
import { usePreviewModals } from '../preview/usePreviewModals';

/**
 * Unified Domain Facade: useStepPreviewFacade
 * Encapsulates and decouples the entire preview experience into clean, isolated domain namespaces:
 * - canvas: responsive scaling, A4 dimensions, overflow and auto-fit
 * - design: theme, palette, typography, spacing, photo, and live sidebar width
 * - exports: vector PDF, DOCX, ATS plain text, and Markdown
 * - modals: side panels, audit drawer, diff comparison, tracking, and adaptation
 * - translation: 5-language management, outdated section detection, and incremental LLM translation
 * - versions: saved versions, pinning, and active version switching
 * - meta: target company, role, template metadata, and live audit scores
 */
export function useStepPreviewFacade() {
  const [previewDocType, setPreviewDocType] = useState<'cv' | 'cover-letter'>('cv');

  // Store Selectors: Design
  const theme = useResumeStore((s) => s.theme);
  const setTheme = useResumeStore((s) => s.setTheme);
  const palette = useResumeStore((s) => s.palette);
  const setPalette = useResumeStore((s) => s.setPalette);
  const customColor = useResumeStore((s) => s.customColor);
  const setCustomColor = useResumeStore((s) => s.setCustomColor);
  const fontFamily = useResumeStore((s) => s.fontFamily);
  const setFontFamily = useResumeStore((s) => s.setFontFamily);
  const spacingDensity = useResumeStore((s) => s.spacingDensity);
  const setSpacingDensity = useResumeStore((s) => s.setSpacingDensity);
  const sidebarWidth = useResumeStore((s) => s.sidebarWidth);
  const setSidebarWidth = useResumeStore((s) => s.setSidebarWidth);
  const pageFormat = useResumeStore((s) => s.pageFormat);
  const setPageFormat = useResumeStore((s) => s.setPageFormat);
  const photo = useResumeStore((s) => s.photo);
  const setProfilePhoto = useResumeStore((s) => s.setProfilePhoto);
  const setProfilePhotoEnabled = useResumeStore((s) => s.setProfilePhotoEnabled);

  // Store Selectors: Workflow & Documents
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const masterData = useResumeStore((s) => s.masterData);
  const targetJob = useResumeStore((s) => s.targetJob);
  const setTargetJob = useResumeStore((s) => s.setTargetJob);
  const companyName = useResumeStore((s) => s.companyName);
  const setCompanyName = useResumeStore((s) => s.setCompanyName);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTargetRole = useResumeStore((s) => s.setTargetRole);
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);
  const isGenerating = useResumeStore((s) => s.isGenerating);
  const handleGenerate = useResumeStore((s) => s.handleGenerate);
  const handleDownloadCvMarkdown = useResumeStore((s) => s.handleDownloadCvMarkdown);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);

  // Store Selectors: AI & Translations
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);
  const activeModelName = useResumeStore((s) => s.activeModelName);
  const activeLanguage = useResumeStore((s) => s.activeLanguage);
  const setActiveLanguage = useResumeStore((s) => s.setActiveLanguage);
  const currentBaseLanguage = useResumeStore((s) => s.currentBaseLanguage);
  const translations = useResumeStore((s) => s.translations);
  const saveTranslationVariant = useResumeStore((s) => s.saveTranslationVariant);

  // Store Selectors: Versions & Applications
  const activeVersionId = useResumeStore((s) => s.activeVersionId);
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const applications = useResumeStore((s) => s.applications);
  const kanbanColumns = useResumeStore((s) => s.kanbanColumns);
  const handleAddApplication = useResumeStore((s) => s.handleAddApplication);
  const handleSaveCurrentVersion = useResumeStore((s) => s.handleSaveCurrentVersion);
  const handleLoadVersion = useResumeStore((s) => s.handleLoadVersion);
  const handlePinAsGeneric = useResumeStore((s) => s.handlePinAsGeneric);
  const handleUnpinGeneric = useResumeStore((s) => s.handleUnpinGeneric);
  const handleSaveAsGeneric = useResumeStore((s) => s.handleSaveAsGeneric);

  // Computed Selectors
  const parsedCv = useParsedCv();
  const auditReport = useAuditReport();
  const gapInfo = useGapInfo();
  const activeTemplateMeta = getTemplateMetadata(theme);

  // Sub-hook: Modals & Side Panels
  const modals = usePreviewModals({
    companyName,
    setCompanyName,
    targetRole,
    setTargetRole,
    targetJob,
    setTargetJob,
    applications,
    handleAddApplication,
    savedVersions,
    activeVersionId,
    handleSaveCurrentVersion,
    handleGenerate,
    setActiveTab,
  });

  // Sub-hook: Canvas Dimensions, Scaling & Overflow
  const canvas = usePreviewCanvasMetrics({
    cvMarkdown,
    theme,
    palette,
    customColor,
    fontFamily,
    spacingDensity,
    setSpacingDensity,
    setFontFamily,
    pageFormat,
    activeSidePanel: modals.activeSidePanel,
    isAuditGapOpen: modals.isAuditGapOpen,
    isHudMinimized: modals.isHudMinimized,
  });

  // Sub-hook: Multi-Format Exports
  const exports = usePreviewExports({
    paperRef: canvas.paperRef,
    parsedCv,
    companyName,
    masterData,
    pageFormat,
    handleDownloadCvMarkdown,
  });

  // Sub-hook: AI Multi-Language Translation
  const translation = usePreviewTranslation({
    cvMarkdown,
    activeLanguage,
    setActiveLanguage,
    currentBaseLanguage,
    translations,
    saveTranslationVariant,
    providerSettings,
    openManualPromptModal,
    activeModelName,
  });

  return {
    docType: {
      previewDocType,
      setPreviewDocType,
    },
    canvas,
    design: {
      theme,
      setTheme,
      palette,
      setPalette,
      customColor,
      setCustomColor,
      fontFamily,
      setFontFamily,
      spacingDensity,
      setSpacingDensity,
      sidebarWidth,
      setSidebarWidth,
      pageFormat,
      setPageFormat,
      photo,
      setProfilePhoto,
      setProfilePhotoEnabled,
    },
    exports,
    modals,
    translation,
    versions: {
      activeVersionId,
      savedVersions,
      handleLoadVersion,
      handlePinAsGeneric,
      handleUnpinGeneric,
      handleSaveAsGeneric,
    },
    meta: {
      activeTemplateMeta,
      companyName,
      targetRole,
      targetJob,
      parsedCv,
      auditReport,
      gapInfo,
      gapMarkdown,
      cvMarkdown,
      isGenerating,
      handleGenerate,
      setWizardStep,
      providerSettings,
      applications,
      kanbanColumns,
    },
  };
}

export type StepPreviewFacade = ReturnType<typeof useStepPreviewFacade>;
