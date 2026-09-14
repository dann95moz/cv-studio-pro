import { useMemo, useCallback } from 'react';
import { useResumeStore, useDerivedFlags, useAuditReport, useGapInfo } from '../../store';
import { StudioTab, WizardStep } from '../../types';
import { AIProviderSettings } from '../../types/cv';
import { platformService } from '../../core/platform';

/**
 * Facade Pattern: useStudioFacade
 * High-level unified facade over the Zustand domain slices (data, ui, design, ai, history).
 * Simplifies and decouples root UI views from 30+ granular slice selectors,
 * protecting against unintended cascading re-renders.
 */
export function useStudioFacade() {
  // Navigation & Wizard State
  const activeTab = useResumeStore((s) => s.activeTab);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);
  const wizardStep = useResumeStore((s) => s.wizardStep);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);
  const masterDataMode = useResumeStore((s) => s.masterDataMode);
  const setMasterDataMode = useResumeStore((s) => s.setMasterDataMode);

  // Core Documents & Tailoring Data
  const masterData = useResumeStore((s) => s.masterData);
  const setMasterData = useResumeStore((s) => s.setMasterData);
  const targetJob = useResumeStore((s) => s.targetJob);
  const setTargetJob = useResumeStore((s) => s.setTargetJob);
  const companyName = useResumeStore((s) => s.companyName);
  const setCompanyName = useResumeStore((s) => s.setCompanyName);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTargetRole = useResumeStore((s) => s.setTargetRole);
  const rules = useResumeStore((s) => s.rules);
  const setRules = useResumeStore((s) => s.setRules);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const setCvMarkdown = useResumeStore((s) => s.setCvMarkdown);
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);
  const activeCvData = useResumeStore((s) => s.activeCvData);

  // Computed audit and gap reports
  const auditReport = useAuditReport();
  const gapInfo = useGapInfo();

  // AI & Generation State
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const setProviderSettings = useResumeStore((s) => s.setProviderSettings);
  const isGenerating = useResumeStore((s) => s.isGenerating);
  const generationStep = useResumeStore((s) => s.generationStep);
  const generationError = useResumeStore((s) => s.generationError);
  const setGenerationError = useResumeStore((s) => s.setGenerationError);
  const handleGenerate = useResumeStore((s) => s.handleGenerate);
  const handleResetWorkspace = useResumeStore((s) => s.handleResetWorkspace);

  // Manual Prompt Bundle
  const isManualPromptModalOpen = useResumeStore((s) => s.isManualPromptModalOpen);
  const manualPromptBundle = useResumeStore((s) => s.manualPromptBundle);
  const manualPromptTitle = useResumeStore((s) => s.manualPromptTitle);
  const closeManualPromptModal = useResumeStore((s) => s.closeManualPromptModal);
  const submitManualResponse = useResumeStore((s) => s.submitManualResponse);

  // Notification State
  const globalNotification = useResumeStore((s) => s.globalNotification);
  const showNotification = useResumeStore((s) => s.showNotification);
  const hideNotification = useResumeStore((s) => s.hideNotification);

  // Applications & History metrics
  const applicationsCount = useResumeStore((s) => s.applications.length);
  const savedVersionsCount = useResumeStore((s) => s.savedVersions.length);

  // Derived Workflow Flags
  const { hasTargetJob, hasGeneratedCv, hasGapReport } = useDerivedFlags();
  const hasMasterData = useMemo(() => Boolean(masterData && masterData.trim().length > 10), [masterData]);
  const hasStarted = useMemo(
    () => hasMasterData || applicationsCount > 0 || savedVersionsCount > 0 || hasTargetJob || hasGeneratedCv,
    [hasMasterData, applicationsCount, savedVersionsCount, hasTargetJob, hasGeneratedCv]
  );

  // Responsive Mobile Navigation Heuristic
  const showMobileBottomNav = useMemo(() => {
    if (platformService.isNative()) {
      return activeTab === 'history';
    }
    return activeTab !== 'landing' && (hasStarted || activeTab === 'history');
  }, [activeTab, hasStarted]);

  // Safe tab switcher helper
  const navigateToTab = useCallback(
    (tab: StudioTab) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  // Safe step switcher helper
  const navigateToStep = useCallback(
    (step: WizardStep) => {
      setWizardStep(step);
    },
    [setWizardStep]
  );

  return {
    // Navigation
    navigation: {
      activeTab,
      setActiveTab: navigateToTab,
      wizardStep,
      setWizardStep: navigateToStep,
      masterDataMode,
      setMasterDataMode,
      showMobileBottomNav,
      hasStarted,
    },
    // Documents
    documents: {
      masterData,
      setMasterData,
      hasMasterData,
      targetJob,
      setTargetJob,
      companyName,
      setCompanyName,
      targetRole,
      setTargetRole,
      rules,
      setRules,
      cvMarkdown,
      setCvMarkdown,
      gapMarkdown,
      activeCvData,
      hasTargetJob,
      hasGeneratedCv,
      hasGapReport,
      savedVersionsCount,
      applicationsCount,
      auditReport,
      gapInfo,
    },
    // AI Pipeline
    ai: {
      providerSettings,
      setProviderSettings,
      isGenerating,
      generationStep,
      generationError,
      setGenerationError,
      handleGenerate,
      isManualPromptModalOpen,
      manualPromptBundle,
      manualPromptTitle,
      closeManualPromptModal,
      submitManualResponse,
    },
    // Feedback & System
    system: {
      globalNotification,
      showNotification,
      hideNotification,
      handleResetWorkspace,
    },
  };
}
