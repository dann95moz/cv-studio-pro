import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useResumeStore,
  useParsedCv,
  useAuditReport,
  useGapInfo,
} from '../store';
import { extractCandidateName, sanitizeFileName } from '../core/parser';
import { getTemplateMetadata } from '../templates';
import { usePrintPdf } from './usePrintPdf';
import { useGitHubStarPrompt } from './useGitHubStarPrompt';
import { PreviewSidePanelType, CvTranslationVariant } from '../types';
import { getPageFormatConfig } from '../theme/dimensions';
import { generatePlainTextCv } from '../core/export/plainTextExporter';
import { generateWordDocumentBlob } from '../core/export/docxExporter';
import { downloadTextFile, downloadBlobFile } from '../utils/fileUtils';
import {
  translateFullCv,
  translateCvSection,
  parseCvIntoSections,
  spliceTranslatedSection,
  computeContentHash,
  buildFullCvTranslationPrompts,
  buildSectionTranslationPrompts,
  sanitizeLlmOutput,
} from '../core/ai/cv-translator';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../constants/languages';

export const useStepPreviewWorkflow = () => {
  const { isExportingPdf, handleDirectDownload } = usePrintPdf();
  const { isPromptOpen, triggerPrompt, dismissPrompt, openGitHubAndDismiss } = useGitHubStarPrompt();

  const [previewDocType, setPreviewDocType] = useState<'cv' | 'cover-letter'>('cv');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [diffInitialVersionAId, setDiffInitialVersionAId] = useState<string | undefined>(undefined);
  const [diffInitialVersionBId, setDiffInitialVersionBId] = useState<string | undefined>(undefined);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState<boolean>(false);

  // Zustand Store selectors
  const activeVersionId = useResumeStore((s) => s.activeVersionId);
  const handleLoadVersion = useResumeStore((s) => s.handleLoadVersion);
  const handlePinAsGeneric = useResumeStore((s) => s.handlePinAsGeneric);
  const handleUnpinGeneric = useResumeStore((s) => s.handleUnpinGeneric);
  const handleSaveAsGeneric = useResumeStore((s) => s.handleSaveAsGeneric);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const activeLanguage = useResumeStore((s) => s.activeLanguage);
  const setActiveLanguage = useResumeStore((s) => s.setActiveLanguage);
  const currentBaseLanguage = useResumeStore((s) => s.currentBaseLanguage);
  const translations = useResumeStore((s) => s.translations);
  const saveTranslationVariant = useResumeStore((s) => s.saveTranslationVariant);
  const activeModelName = useResumeStore((s) => s.activeModelName);
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
  const pageFormat = useResumeStore((s) => s.pageFormat);
  const setPageFormat = useResumeStore((s) => s.setPageFormat);
  const photo = useResumeStore((s) => s.photo);
  const setProfilePhoto = useResumeStore((s) => s.setProfilePhoto);
  const setProfilePhotoEnabled = useResumeStore((s) => s.setProfilePhotoEnabled);
  const handleSaveCurrentVersion = useResumeStore((s) => s.handleSaveCurrentVersion);
  const handleDownloadCvMarkdown = useResumeStore((s) => s.handleDownloadCvMarkdown);
  const handleGenerate = useResumeStore((s) => s.handleGenerate);
  const isGenerating = useResumeStore((s) => s.isGenerating);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);

  const companyName = useResumeStore((s) => s.companyName);
  const setCompanyName = useResumeStore((s) => s.setCompanyName);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTargetRole = useResumeStore((s) => s.setTargetRole);
  const targetJob = useResumeStore((s) => s.targetJob);
  const setTargetJob = useResumeStore((s) => s.setTargetJob);
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);
  const masterData = useResumeStore((s) => s.masterData);
  const applications = useResumeStore((s) => s.applications);
  const kanbanColumns = useResumeStore((s) => s.kanbanColumns);
  const handleAddApplication = useResumeStore((s) => s.handleAddApplication);
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);

  const parsedCv = useParsedCv();
  const auditReport = useAuditReport();
  const gapInfo = useGapInfo();

  // Outdated translation detection for current active variant
  const activeVariant = translations[activeLanguage];
  const isLanguageOutdated = Boolean(
    activeLanguage !== currentBaseLanguage && activeVariant?.isOutdated
  );
  const outdatedSectionsCount = activeVariant?.outdatedSections?.length || 0;

  const handleOpenTranslateModal = () => setIsTranslateModalOpen(true);
  const handleCloseTranslateModal = () => setIsTranslateModalOpen(false);

  const handleTranslateFull = async (targetLang: SupportedLanguage) => {
    const langDef = LANGUAGE_DEFINITIONS[targetLang] || LANGUAGE_DEFINITIONS.en;

    if (providerSettings.provider === 'manual') {
      const prompts = buildFullCvTranslationPrompts(cvMarkdown, targetLang);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
      openManualPromptModal(bundle, `Translate CV to ${langDef.name}`, (response) => {
        const translated = sanitizeLlmOutput(response);
        if (translated) {
          const variant: CvTranslationVariant = {
            language: targetLang,
            languageLabel: langDef.nativeName,
            cvMarkdown: translated,
            updatedAt: new Date().toISOString(),
            isOutdated: false,
            baseMarkdownHash: computeContentHash(cvMarkdown),
            outdatedSections: [],
          };
          saveTranslationVariant(variant);
          setActiveLanguage(targetLang);
        }
      });
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateFullCv({
        cvMarkdown,
        targetLanguage: targetLang,
        providerSettings,
      });

      const variant: CvTranslationVariant = {
        language: targetLang,
        languageLabel: langDef.nativeName,
        cvMarkdown: translated,
        updatedAt: new Date().toISOString(),
        isOutdated: false,
        baseMarkdownHash: computeContentHash(cvMarkdown),
        outdatedSections: [],
      };

      saveTranslationVariant(variant);
      setActiveLanguage(targetLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateIncremental = async (targetLang: SupportedLanguage, sections: string[]) => {
    const langDef = LANGUAGE_DEFINITIONS[targetLang] || LANGUAGE_DEFINITIONS.en;
    const existing = translations[targetLang];
    let currentTranslatedText = existing?.cvMarkdown || '';

    const baseSections = parseCvIntoSections(cvMarkdown);
    const sectionsMap = new Map(baseSections.sections.map((s) => [s.title.toLowerCase(), s]));

    if (providerSettings.provider === 'manual') {
      const sectionsToTranslate = sections
        .map((secTitle) => sectionsMap.get(secTitle.toLowerCase()))
        .filter(Boolean);
      const combinedTitle = sectionsToTranslate.map((s) => s!.title).join(' & ');
      const combinedContent = sectionsToTranslate.map((s) => `## ${s!.title}\n${s!.content}`).join('\n\n');

      const prompts = buildSectionTranslationPrompts(combinedTitle, combinedContent, targetLang);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;

      openManualPromptModal(bundle, `Translate (${combinedTitle}) to ${langDef.name}`, (response) => {
        const translated = sanitizeLlmOutput(response);
        if (translated) {
          const parsedTranslated = parseCvIntoSections(translated);
          if (parsedTranslated.sections.length > 0) {
            for (const sec of parsedTranslated.sections) {
              currentTranslatedText = spliceTranslatedSection(
                currentTranslatedText,
                sec.title,
                sec.fullText
              );
            }
          } else {
            currentTranslatedText = spliceTranslatedSection(
              currentTranslatedText,
              sections[0],
              translated
            );
          }

          const updatedVariant: CvTranslationVariant = {
            language: targetLang,
            languageLabel: existing?.languageLabel || langDef.nativeName,
            cvMarkdown: currentTranslatedText,
            updatedAt: new Date().toISOString(),
            isOutdated: false,
            baseMarkdownHash: computeContentHash(cvMarkdown),
            outdatedSections: [],
          };

          saveTranslationVariant(updatedVariant);
          setActiveLanguage(targetLang);
        }
      });
      return;
    }

    setIsTranslating(true);
    try {
      for (const secTitle of sections) {
        const foundSec = sectionsMap.get(secTitle.toLowerCase());
        if (foundSec) {
          const translatedSection = await translateCvSection({
            sectionTitle: foundSec.title,
            sectionContent: foundSec.content,
            targetLanguage: targetLang,
            providerSettings,
          });
          currentTranslatedText = spliceTranslatedSection(
            currentTranslatedText,
            foundSec.title,
            translatedSection
          );
        }
      }

      const updatedVariant: CvTranslationVariant = {
        language: targetLang,
        languageLabel: existing?.languageLabel || langDef.nativeName,
        cvMarkdown: currentTranslatedText,
        updatedAt: new Date().toISOString(),
        isOutdated: false,
        baseMarkdownHash: computeContentHash(cvMarkdown),
        outdatedSections: [],
      };

      saveTranslationVariant(updatedVariant);
      setActiveLanguage(targetLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleQuickSyncOutdated = () => {
    if (activeVariant && activeVariant.outdatedSections && activeVariant.outdatedSections.length > 0) {
      handleTranslateIncremental(activeLanguage as SupportedLanguage, activeVariant.outdatedSections);
    }
  };

  const handleOpenFullAudit = () => {
    setActiveTab('audit');
  };

  // Page dimensions
  const formatConfig = getPageFormatConfig(pageFormat);
  const targetPagePx = formatConfig.heightPx;
  const targetPageWidthPx = formatConfig.widthPx;

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [trackSuccess, setTrackSuccess] = useState<boolean>(false);
  const [sheetHeight, setSheetHeight] = useState<number>(targetPagePx || 1123);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Tracked state
  const isTracked = Boolean(
    companyName && applications.some((app) =>
      app.companyName.toLowerCase().trim() === companyName.toLowerCase().trim() &&
      (!targetRole || app.targetRole.toLowerCase().trim() === targetRole.toLowerCase().trim())
    )
  );

  const [isSavingVersion, setIsSavingVersion] = useState<boolean>(false);
  const lastSaveClickRef = useRef<number>(0);

  const handleSaveToHistory = () => {
    if (isSavingVersion) return;
    const now = Date.now();
    if (now - lastSaveClickRef.current < 1000) {
      return; // Debounce rapid double-clicks
    }
    lastSaveClickRef.current = now;

    setIsSavingVersion(true);
    try {
      handleSaveCurrentVersion();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setTimeout(() => setIsSavingVersion(false), 500);
    }
  };

  const handleTrackApplication = () => {
    if (savedVersions.length === 0) {
      handleSaveCurrentVersion();
    }
    setIsTrackModalOpen(true);
  };

  const handleConfirmTrackApplication = (appData: Parameters<typeof handleAddApplication>[0]) => {
    handleAddApplication(appData);
    setTrackSuccess(true);
    setTimeout(() => setTrackSuccess(false), 3000);
  };

  // Left Tool Rail active side panel
  const [activeSidePanel, setActiveSidePanel] = useState<PreviewSidePanelType | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      return null;
    }
    return 'templates';
  });

  // Automatically close side panel if user resizes window into mobile breakpoint (< 900px)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 900) {
        setActiveSidePanel((prev) => (prev === 'templates' ? null : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Right Side Unified Audit & Gap Drawer state
  const [isAuditGapOpen, setIsAuditGapOpen] = useState<boolean>(false);
  const [auditGapTab, setAuditGapTab] = useState<'audit' | 'gap' | 'interview'>('audit');
  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);

  // Mobile mode toggle: 'edit' vs 'preview'
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('preview');
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [mobileZoomMode, setMobileZoomMode] = useState<'fit' | '100%'>('fit');

  const activeTemplateMeta = getTemplateMetadata(theme);

  // Measure rendered paper sheet height whenever styling or content changes
  useEffect(() => {
    const updateHeight = () => {
      if (paperRef.current && paperRef.current.scrollHeight > 0) {
        setSheetHeight(paperRef.current.scrollHeight);
      }
    };
    updateHeight();
    const timer = setTimeout(updateHeight, 150);
    const observer = new ResizeObserver(updateHeight);
    if (paperRef.current) {
      observer.observe(paperRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [cvMarkdown, theme, palette, customColor, fontFamily, spacingDensity, pageFormat]);

  // Auto-calculate scale factor for responsive canvas preview across all breakpoints
  useEffect(() => {
    const calculateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth;
      if (containerWidth <= 0) return;

      if (mobileZoomMode === '100%') {
        setCanvasScale(1);
        return;
      }

      // Available width accounts for container padding and floating HUD allowance on desktop
      const isDesktop = containerWidth >= 900;
      const hudAllowance = isDesktop && !isAuditGapOpen && !isHudMinimized ? 230 : 0;
      const basePadding = containerWidth < 500 ? 16 : (containerWidth < 900 ? 32 : 56);
      const totalReservedWidth = basePadding + hudAllowance;
      const availableWidth = Math.max(280, containerWidth - totalReservedWidth);

      if (availableWidth < targetPageWidthPx) {
        const scale = Math.min(1, Math.max(0.35, availableWidth / targetPageWidthPx));
        setCanvasScale(scale);
      } else {
        setCanvasScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    const observer = new ResizeObserver(calculateScale);
    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateScale);
      observer.disconnect();
    };
  }, [targetPageWidthPx, mobileViewMode, mobileZoomMode, activeSidePanel, isAuditGapOpen, isHudMinimized]);

  const isOverflowing = sheetHeight > targetPagePx + 8;
  const estimatedPages = isOverflowing ? Math.max(2, Math.ceil(sheetHeight / targetPagePx)) : 1;
  const overflowPercentage = isOverflowing ? Math.round(((sheetHeight - targetPagePx) / targetPagePx) * 100) : 0;

  const handleMagicAutoFit = () => {
    if (spacingDensity === 'spacious') {
      setSpacingDensity('standard');
    } else if (spacingDensity === 'standard') {
      setSpacingDensity('compact');
    } else if (fontFamily === 'serif' || fontFamily === 'mono') {
      setFontFamily('inter');
    }
  };

  const candidateName = sanitizeFileName(
    parsedCv.name || extractCandidateName(masterData, 'Candidate')
  );
  const cleanCompany = sanitizeFileName(companyName || 'Target');
  const targetPdfName = `CV_${candidateName}_${cleanCompany}.pdf`;

  const onTriggerDirectDownloadPdf = useCallback((mode: 'save' | 'share' = 'save') => {
    if (paperRef.current) {
      handleDirectDownload(paperRef.current, targetPdfName, pageFormat, mode);
      triggerPrompt(2000);
    }
  }, [handleDirectDownload, targetPdfName, pageFormat, triggerPrompt]);

  const onTriggerSharePdf = useCallback(() => {
    onTriggerDirectDownloadPdf('share');
  }, [onTriggerDirectDownloadPdf]);

  const onTriggerDownloadPlainText = useCallback(() => {
    const plainText = generatePlainTextCv(parsedCv);
    const targetTxtName = `CV_${candidateName}_${cleanCompany}_ATS.txt`;
    downloadTextFile(plainText, targetTxtName, 'text/plain;charset=utf-8;');
  }, [parsedCv, candidateName, cleanCompany]);

  const onTriggerDownloadDocx = useCallback(() => {
    const blob = generateWordDocumentBlob(parsedCv);
    const targetDocxName = `CV_${candidateName}_${cleanCompany}.doc`;
    downloadBlobFile(blob, targetDocxName);
  }, [parsedCv, candidateName, cleanCompany]);

  const onTriggerCopyPlainText = useCallback(async (): Promise<boolean> => {
    const plainText = generatePlainTextCv(parsedCv);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(plainText);
      return true;
    }
    return false;
  }, [parsedCv]);

  const handleCompareAgainstGeneric = useCallback((targetVersionId?: string) => {
    const genericVersion = savedVersions.find((v) => v.isPinned || v.isGeneric);
    const versionA = genericVersion ? genericVersion.id : 'master';
    const versionB = targetVersionId || activeVersionId || 'current';
    setDiffInitialVersionAId(versionA);
    setDiffInitialVersionBId(versionB);
    setIsDiffModalOpen(true);
  }, [savedVersions, activeVersionId]);

  const handleCloseDiffModal = useCallback(() => {
    setIsDiffModalOpen(false);
    setDiffInitialVersionAId(undefined);
    setDiffInitialVersionBId(undefined);
  }, []);

  const handleOpenAdaptModal = useCallback(() => {
    setIsAdaptModalOpen(true);
  }, []);

  const handleCloseAdaptModal = useCallback(() => {
    setIsAdaptModalOpen(false);
  }, []);

  const handleUseCurrentCvForNewOffer = useCallback((data: { companyName: string; targetRole: string; jobText: string }) => {
    let versionId = activeVersionId;
    if (!versionId || !savedVersions.some((v) => v.id === versionId)) {
      versionId = handleSaveCurrentVersion();
    }

    setCompanyName(data.companyName);
    if (data.targetRole) {
      setTargetRole(data.targetRole);
    }
    if (data.jobText) {
      setTargetJob(data.jobText);
    }

    handleAddApplication({
      companyName: data.companyName,
      targetRole: data.targetRole,
      appliedVersionId: versionId,
    });

    setTrackSuccess(true);
    setTimeout(() => setTrackSuccess(false), 3000);
  }, [activeVersionId, savedVersions, handleSaveCurrentVersion, setCompanyName, setTargetRole, setTargetJob, handleAddApplication]);

  const handleAdaptNewOfferWithAi = useCallback(async (data: { companyName: string; targetRole: string; jobText: string }) => {
    setCompanyName(data.companyName);
    if (data.targetRole) {
      setTargetRole(data.targetRole);
    }
    if (data.jobText) {
      setTargetJob(data.jobText);
    }

    await handleGenerate();

    const newlyCreatedVersionId = useResumeStore.getState().activeVersionId;
    if (newlyCreatedVersionId) {
      handleAddApplication({
        companyName: data.companyName,
        targetRole: data.targetRole,
        appliedVersionId: newlyCreatedVersionId,
      });
    }

    setTrackSuccess(true);
    setTimeout(() => setTrackSuccess(false), 3000);
  }, [setCompanyName, setTargetRole, setTargetJob, handleGenerate, handleAddApplication]);

  const handleToggleSidePanel = (panel: PreviewSidePanelType) => {
    if (panel === 'compare') {
      handleCompareAgainstGeneric();
      return;
    }
    if (panel === 'audit') {
      const willBeOpen = !isAuditGapOpen;
      setIsAuditGapOpen(willBeOpen);
      setAuditGapTab('audit');
      if (willBeOpen) {
        setActiveSidePanel(null);
      }
    } else {
      const willBeOpen = activeSidePanel !== panel;
      setActiveSidePanel(willBeOpen ? panel : null);
      if (willBeOpen) {
        setIsAuditGapOpen(false);
      }
    }
  };

  return {
    // Refs
    paperRef,
    canvasContainerRef,
    // Document type & modals
    previewDocType,
    setPreviewDocType,
    isDiffModalOpen,
    setIsDiffModalOpen,
    diffInitialVersionAId,
    diffInitialVersionBId,
    handleCompareAgainstGeneric,
    handleCloseDiffModal,
    isTrackModalOpen,
    setIsTrackModalOpen,
    savedSuccess,
    trackSuccess,
    setTrackSuccess,
    isSavingVersion,
    // Side panels & drawers
    activeSidePanel,
    setActiveSidePanel,
    isAuditGapOpen,
    setIsAuditGapOpen,
    auditGapTab,
    setAuditGapTab,
    handleToggleSidePanel,
    handleOpenFullAudit,
    // Mobile canvas & zoom
    mobileViewMode,
    setMobileViewMode,
    mobileZoomMode,
    setMobileZoomMode,
    canvasScale,
    sheetHeight,
    // Dimension & overflow calculations
    formatConfig,
    targetPagePx,
    targetPageWidthPx,
    isOverflowing,
    estimatedPages,
    overflowPercentage,
    activeTemplateMeta,
    // Store data & setters
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
    pageFormat,
    setPageFormat,
    photo,
    setProfilePhoto,
    setProfilePhotoEnabled,
    handleGenerate,
    isGenerating,
    handleDownloadCvMarkdown,
    setWizardStep,
    companyName,
    targetRole,
    targetJob,
    cvMarkdown,
    providerSettings,
    applications,
    kanbanColumns,
    savedVersions,
    activeVersionId,
    gapMarkdown,
    parsedCv,
    auditReport,
    gapInfo,
    isTracked,
    isHudMinimized,
    setIsHudMinimized,
    // Actions
    handleSaveToHistory,
    handleSaveAsGeneric,
    handleLoadVersion,
    handlePinAsGeneric,
    handleUnpinGeneric,
    handleTrackApplication,
    handleConfirmTrackApplication,
    handleMagicAutoFit,
    onTriggerDirectDownloadPdf,
    onTriggerSharePdf,
    onTriggerDownloadPlainText,
    onTriggerDownloadDocx,
    onTriggerCopyPlainText,
    // Print & Star prompt
    isExportingPdf,
    isPromptOpen,
    dismissPrompt,
    openGitHubAndDismiss,
    // Translation & Multi-language Variant System
    activeLanguage,
    setActiveLanguage,
    currentBaseLanguage,
    translations,
    isLanguageOutdated,
    outdatedSectionsCount,
    isTranslateModalOpen,
    isTranslating,
    activeModelName,
    handleOpenTranslateModal,
    handleCloseTranslateModal,
    handleTranslateFull,
    handleTranslateIncremental,
    handleQuickSyncOutdated,
    // Adapt to New Offer Workflow
    isAdaptModalOpen,
    setIsAdaptModalOpen,
    handleOpenAdaptModal,
    handleCloseAdaptModal,
    handleUseCurrentCvForNewOffer,
    handleAdaptNewOfferWithAi,
  };
};
