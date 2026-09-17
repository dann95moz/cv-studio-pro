import { useState, useRef, useEffect, useCallback } from 'react';
import {
  PreviewSidePanelType,
  GeneratedCvVersion,
  ApplicationItem,
  TrackApplicationDialogProps,
  StudioTab,
} from '../../types';
import { useResumeStore } from '../../store';

export type TrackApplicationData = Parameters<TrackApplicationDialogProps['onConfirm']>[0];

export interface UsePreviewModalsProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  targetJob: string;
  setTargetJob: (job: string) => void;
  applications: ApplicationItem[];
  handleAddApplication: (appData: TrackApplicationData) => string;
  savedVersions: GeneratedCvVersion[];
  activeVersionId: string | null;
  handleSaveCurrentVersion: () => string;
  handleGenerate: () => Promise<void>;
  setActiveTab: (tab: StudioTab) => void;
}

/**
 * Domain Hook: usePreviewModals
 * Encapsulates modal dialog states, side panels, and audit drawers:
 * Version diff comparison, Application tracking modal, New offer tailoring modal,
 * side panel drawer visibility with mobile auto-collapse, and debounced history save.
 */
export function usePreviewModals({
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
}: UsePreviewModalsProps) {
  // Diff Modal state
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [diffInitialVersionAId, setDiffInitialVersionAId] = useState<string | undefined>(undefined);
  const [diffInitialVersionBId, setDiffInitialVersionBId] = useState<string | undefined>(undefined);

  // Track Application Modal state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [trackSuccess, setTrackSuccess] = useState<boolean>(false);
  const [isSavingVersion, setIsSavingVersion] = useState<boolean>(false);
  const lastSaveClickRef = useRef<number>(0);

  // Adapt to New Offer Modal state
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState<boolean>(false);

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

  // Tracked status
  const isTracked = Boolean(
    companyName &&
      applications.some(
        (app) =>
          app.companyName.toLowerCase().trim() === companyName.toLowerCase().trim() &&
          (!targetRole || app.targetRole.toLowerCase().trim() === targetRole.toLowerCase().trim())
      )
  );

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

  const handleCompareAgainstGeneric = useCallback(
    (targetVersionId?: string) => {
      const genericVersion = savedVersions.find((v) => v.isPinned || v.isGeneric);
      const versionA = genericVersion ? genericVersion.id : 'master';
      const versionB = targetVersionId || activeVersionId || 'current';
      setDiffInitialVersionAId(versionA);
      setDiffInitialVersionBId(versionB);
      setIsDiffModalOpen(true);
    },
    [savedVersions, activeVersionId]
  );

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

  const handleUseCurrentCvForNewOffer = useCallback(
    (data: { companyName: string; targetRole: string; jobText: string }) => {
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
        columnId: 'applied',
      });

      setTrackSuccess(true);
      setTimeout(() => setTrackSuccess(false), 3000);
    },
    [activeVersionId, savedVersions, handleSaveCurrentVersion, setCompanyName, setTargetRole, setTargetJob, handleAddApplication]
  );

  const handleAdaptNewOfferWithAi = useCallback(
    async (data: { companyName: string; targetRole: string; jobText: string }) => {
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
          columnId: 'applied',
        });
      }

      setTrackSuccess(true);
      setTimeout(() => setTrackSuccess(false), 3000);
    },
    [setCompanyName, setTargetRole, setTargetJob, handleGenerate, handleAddApplication]
  );

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

  const handleOpenFullAudit = () => {
    setActiveTab('audit');
  };

  const handleOpenFullGapAnalysis = () => {
    setActiveTab('gap');
  };

  return {
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
    handleSaveToHistory,
    handleTrackApplication,
    handleConfirmTrackApplication,
    isAdaptModalOpen,
    handleOpenAdaptModal,
    handleCloseAdaptModal,
    handleUseCurrentCvForNewOffer,
    handleAdaptNewOfferWithAi,
    activeSidePanel,
    setActiveSidePanel,
    isAuditGapOpen,
    setIsAuditGapOpen,
    auditGapTab,
    setAuditGapTab,
    isHudMinimized,
    setIsHudMinimized,
    handleToggleSidePanel,
    handleOpenFullAudit,
    handleOpenFullGapAnalysis,
    isTracked,
  };
}
