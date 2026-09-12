import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  useResumeStore,
  useDerivedFlags,
} from '../store';
import { StudioNavbar } from '../components/studio/StudioNavbar';
import { WizardStepper } from '../components/studio/WizardStepper';
import { LockedViewCard } from '../components/studio/LockedViewCard';
import { SynthesisErrorBanner } from '../components/studio/SynthesisErrorBanner';
import { StudioSkeleton } from '../components/studio/StudioSkeleton';
import { AiGeneratingOverlay } from '../components/studio/ai/AiGeneratingOverlay';
import { ManualAiPromptModal } from '../components/studio/ai/ManualAiPromptModal';
import { DeviceSyncModal } from '../components/studio/sync/DeviceSyncModal';
import { SnapshotConflictModal } from '../components/studio/sync/SnapshotConflictModal';
import { useDeviceSync } from '../hooks/useDeviceSync';
import {
  BLANK_MASTER_DATA,
  DEMO_MASTER_DATA,
  DEMO_TARGET_JOB,
} from '../constants/templates';
import { downloadTextFile, buildTimestampedFileName } from '../utils/fileUtils';
import { useTranslation } from 'react-i18next';
import { Box, Snackbar, Alert, Button } from '@mui/material';
import { MobileTopHeader, MobileBottomNav } from '../components/studio/mobile';
import { useAndroidBackHandler } from '../hooks/useAndroidBackHandler';
import { useForegroundResume } from '../hooks/useForegroundResume';
import { backButtonRegistry } from '../core/backButtonRegistry';
import { Capacitor } from '@capacitor/core';
import { qrScannerService } from '../core/qrScannerService';
import { hapticsService } from '../core/haptics';
import './App.css';

// Dynamically loaded tab views and wizard steps
const WelcomeLandingView = lazy(() =>
  import('../components/landing/WelcomeLandingView').then((m) => ({ default: m.WelcomeLandingView }))
);
const StepMasterData = lazy(() =>
  import('../components/studio/StepMasterData').then((m) => ({ default: m.StepMasterData }))
);
const StepTargetJob = lazy(() =>
  import('../components/studio/StepTargetJob').then((m) => ({ default: m.StepTargetJob }))
);
const StepPreview = lazy(() =>
  import('../components/studio/StepPreview').then((m) => ({ default: m.StepPreview }))
);
const QualityAuditView = lazy(() =>
  import('../components/studio/QualityAuditView').then((m) => ({ default: m.QualityAuditView }))
);
const GapAnalysisView = lazy(() =>
  import('../components/studio/GapAnalysisView').then((m) => ({ default: m.GapAnalysisView }))
);
const ApplicationsHistoryView = lazy(() =>
  import('../components/studio/ApplicationsHistoryView').then((m) => ({ default: m.ApplicationsHistoryView }))
);
const SettingsView = lazy(() =>
  import('../components/studio/SettingsView').then((m) => ({ default: m.SettingsView }))
);

export const App: React.FC = () => {
  const { t } = useTranslation(['audit', 'gap', 'common', 'target', 'profile']);
  const activeTab = useResumeStore((s) => s.activeTab);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);
  const wizardStep = useResumeStore((s) => s.wizardStep);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);
  const hasMasterData = useResumeStore((s) => Boolean(s.masterData && s.masterData.trim().length > 10));
  const masterData = useResumeStore((s) => s.masterData);
  const setMasterData = useResumeStore((s) => s.setMasterData);
  const targetJob = useResumeStore((s) => s.targetJob);
  const setTargetJob = useResumeStore((s) => s.setTargetJob);
  const companyName = useResumeStore((s) => s.companyName);
  const setCompanyName = useResumeStore((s) => s.setCompanyName);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTargetRole = useResumeStore((s) => s.setTargetRole);
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const setProviderSettings = useResumeStore((s) => s.setProviderSettings);
  const rules = useResumeStore((s) => s.rules);
  const setRules = useResumeStore((s) => s.setRules);
  const gapMarkdown = useResumeStore((s) => s.gapMarkdown);
  const setCvMarkdown = useResumeStore((s) => s.setCvMarkdown);
  const isGenerating = useResumeStore((s) => s.isGenerating);
  const generationStep = useResumeStore((s) => s.generationStep);
  const generationError = useResumeStore((s) => s.generationError);
  const setGenerationError = useResumeStore((s) => s.setGenerationError);
  const handleGenerate = useResumeStore((s) => s.handleGenerate);
  const handleResetWorkspace = useResumeStore((s) => s.handleResetWorkspace);
  const globalNotification = useResumeStore((s) => s.globalNotification);
  const showNotification = useResumeStore((s) => s.showNotification);
  const hideNotification = useResumeStore((s) => s.hideNotification);
  const isManualPromptModalOpen = useResumeStore((s) => s.isManualPromptModalOpen);
  const manualPromptBundle = useResumeStore((s) => s.manualPromptBundle);
  const manualPromptTitle = useResumeStore((s) => s.manualPromptTitle);
  const closeManualPromptModal = useResumeStore((s) => s.closeManualPromptModal);
  const submitManualResponse = useResumeStore((s) => s.submitManualResponse);


  // Derived state via optimized memoized hooks
  const { hasTargetJob, hasGeneratedCv, hasGapReport } = useDerivedFlags();
  const hasApplications = useResumeStore((s) => s.applications.length > 0);
  const savedVersionsCount = useResumeStore((s) => s.savedVersions.length);
  const hasStarted = hasMasterData || hasApplications || savedVersionsCount > 0 || hasTargetJob || hasGeneratedCv;

  // Show bottom navigation on mobile ONLY when user is past landing AND has active workspace / applications
  const showMobileBottomNav = activeTab !== 'landing' && (hasStarted || activeTab === 'history');

  // Multidevice Sync State & Hook
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncModalInitialTab, setSyncModalInitialTab] = useState<'export' | 'import'>('export');
  const sync = useDeviceSync();

  const handleOpenSync = (tab: 'export' | 'import' = 'export') => {
    setSyncModalInitialTab(tab);
    setIsSyncModalOpen(true);
  };

  const handleScanOrSync = async () => {
    // 1. Mobile-First: Directly invoke native camera QR scanner
    if (Capacitor.isNativePlatform()) {
      try {
        const scanRes = await qrScannerService.scan();
        if (scanRes.success && scanRes.content) {
          hapticsService.notificationSuccess();
          showNotification({
            message: t('common:sync.qrDetected', 'QR detectado. Conectando y descargando datos...'),
            severity: 'info',
          });

          const result = await sync.handlePullSnapshot(scanRes.content);
          if (!result.success) {
            hapticsService.notificationWarning();
            showNotification({
              message: result.error || t('common:sync.downloadError', 'No se pudo descargar el espacio de trabajo.'),
              severity: 'error',
            });
            handleOpenSync('import');
          } else {
            hapticsService.notificationSuccess();
          }
          return;
        }

        // If user cancelled, do not force modal open
        if (scanRes.cancelled) {
          return;
        }

        // If permission was denied or scanner error, fallback to manual code modal
        if (scanRes.deniedPermission || scanRes.errorMessage) {
          hapticsService.notificationWarning();
          handleOpenSync('import');
          return;
        }
      } catch (err) {
        console.debug('[App] Native scan exception, falling back to manual code:', err);
        handleOpenSync('import');
        return;
      }
    }

    // 2. On Web or desktop: open sync modal in import tab
    handleOpenSync('import');
  };

  const handleModalScanCamera = async () => {
    setIsSyncModalOpen(false);
    setTimeout(async () => {
      await handleScanOrSync();
    }, 150);
  };

  // Listen for hash-based sync parameters on mount & hashchange (e.g. #sync?id=...#key=...)
  useEffect(() => {
    const handleCheckSync = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#sync')) {
        await sync.handlePullSnapshot(hash);
        // Clear hash so it doesn't re-trigger on subsequent refreshes
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleCheckSync();
    window.addEventListener('hashchange', handleCheckSync);
    return () => window.removeEventListener('hashchange', handleCheckSync);
  }, [sync.handlePullSnapshot]);

  // Unified Android Back Button Navigation Stack
  useAndroidBackHandler();

  // Background / Foreground synthesis recovery
  useForegroundResume();

  // Register open modals in the Back Button Stack
  useEffect(() => {
    if (isManualPromptModalOpen) {
      return backButtonRegistry.register({
        id: 'manual-prompt-modal',
        priority: 100,
        handler: () => {
          closeManualPromptModal();
          return true;
        },
      });
    }
  }, [isManualPromptModalOpen, closeManualPromptModal]);

  useEffect(() => {
    if (isSyncModalOpen) {
      return backButtonRegistry.register({
        id: 'sync-modal',
        priority: 100,
        handler: () => {
          setIsSyncModalOpen(false);
          return true;
        },
      });
    }
  }, [isSyncModalOpen]);

  useEffect(() => {
    if (sync.pendingSnapshot && sync.conflictComparison) {
      return backButtonRegistry.register({
        id: 'snapshot-conflict-modal',
        priority: 110,
        handler: () => {
          sync.handleCancelConflict();
          return true;
        },
      });
    }
  }, [sync.pendingSnapshot, sync.conflictComparison, sync.handleCancelConflict]);

  return (
    <div className="studio-app">
      {/* Top Navbar: Visible on Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <StudioNavbar onOpenSync={() => handleOpenSync('export')} />
      </Box>

      {/* Stepper Bar for Guided Wizard: Visible on Desktop for Steps 1 & 2 (Step 3 uses compact breadcrumb dropdown) */}
      {activeTab === 'wizard' && wizardStep !== 'preview' && (
        <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
          <WizardStepper
            currentStep={wizardStep}
            onSelectStep={setWizardStep}
            hasMasterData={hasMasterData}
            hasTargetJob={hasTargetJob}
            hasGeneratedCv={hasGeneratedCv}
          />
        </Box>
      )}

      {/* Mobile Top Header: Visible on Mobile (xs to sm) */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          flexShrink: 0,
          position: 'relative',
          zIndex: (theme) => theme.zIndex.appBar,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <MobileTopHeader
          currentStepNumber={
            wizardStep === 'profile' ? 1 : wizardStep === 'target' ? 2 : 3
          }
          totalSteps={3}
          stepTitle={
            activeTab === 'history'
              ? t('common:nav.applicationsShort', 'Postulaciones')
              : activeTab === 'settings'
              ? t('common:nav.settings', 'Configuración')
              : activeTab === 'landing'
              ? t('common:appName', 'CV Studio')
              : wizardStep === 'profile'
              ? t('profile:stepper.profileShortLabel', 'Datos Maestro')
              : wizardStep === 'target'
              ? t('profile:stepper.targetShortLabel', 'Oferta y Vacante')
              : t('profile:stepper.previewShortLabel', 'CV y PDF')
          }
          isWizard={activeTab === 'wizard'}
          onSelectStep={(step) => {
            setActiveTab('wizard');
            setWizardStep(step);
          }}
          activeWizardStep={wizardStep}
          onOpenSync={() => handleOpenSync('export')}
        />
      </Box>

      {/* Main Workspace Body */}
      <Box
        component="div"
        className="studio-body"
        sx={{
          flex: 1,
          minHeight: 0,
          height: {
            xs: 'auto',
            md: 'calc(100dvh - var(--navbar-height))',
          },
          pb: {
            xs: showMobileBottomNav
              ? 'calc(env(safe-area-inset-bottom, 0px) + 56px)'
              : 'env(safe-area-inset-bottom, 0px)',
            md: 0,
          },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* VIEW: WELCOME & ONBOARDING LANDING */}
        {activeTab === 'landing' && (
          <Suspense fallback={<StudioSkeleton variant="landing" />}>
            <WelcomeLandingView onOpenSync={handleScanOrSync} />
          </Suspense>
        )}

        {/* WIZARD FLOW: 3 STREAMLINED STEPS */}
        {activeTab === 'wizard' && (
          <>
            {wizardStep === 'profile' && (
              <Suspense fallback={<StudioSkeleton variant="masterData" />}>
                <StepMasterData
                  content={masterData}
                  onChange={setMasterData}
                  onLoadSample={() => setMasterData(DEMO_MASTER_DATA)}
                  onResetTemplate={() => setMasterData(BLANK_MASTER_DATA)}
                  onNextStep={() => setWizardStep('target')}
                  onOpenSync={handleScanOrSync}
                />
              </Suspense>
            )}

            {wizardStep === 'target' && (
              <Suspense fallback={<StudioSkeleton variant="targetJob" />}>
                <StepTargetJob
                  content={targetJob}
                  onChange={setTargetJob}
                  companyName={companyName}
                  onCompanyChange={setCompanyName}
                  targetRole={targetRole}
                  onRoleChange={setTargetRole}
                  providerSettings={providerSettings}
                  onProviderSettingsChange={setProviderSettings}
                  onLoadSample={() => {
                    setTargetJob(DEMO_TARGET_JOB);
                    setCompanyName('Stripe');
                    setTargetRole('Senior Frontend Engineer');
                  }}
                  onPrevStep={() => setWizardStep('profile')}
                  onNextStep={() => setWizardStep('preview')}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  generationStep={generationStep}
                  hasGeneratedCv={hasGeneratedCv}
                />
              </Suspense>
            )}

            {(wizardStep === 'preview' || wizardStep === 'tailor') && (
              <Suspense fallback={<StudioSkeleton variant="preview" />}>
                <StepPreview />
              </Suspense>
            )}
          </>
        )}

        {/* VIEW: QUALITY AUDIT (1-10 SCALE) */}
        {activeTab === 'audit' && (
          <div className="audit-workspace-layout">
            {hasGeneratedCv ? (
              <Suspense fallback={<StudioSkeleton variant="audit" />}>
                <QualityAuditView
                  onRefresh={() => setCvMarkdown((prev: string) => `${prev}`)}
                />
              </Suspense>
            ) : (
              <LockedViewCard
                iconType="gauge"
                title={t('audit:locked.title', 'Quality Audit Requires a Tailored CV')}
                description={t('audit:locked.desc', 'The calibrated 1–10 executive scoring engine evaluates real achievement density, Google XYZ formula percentages, and ATS compliance. Please create or synthesize your tailored CV first to unlock section-by-section scoring.')}
                actionText={t('audit:locked.action', 'Go to Target Job & Tailor')}
                actionIcon="zap"
                onAction={() => {
                  setActiveTab('wizard');
                  setWizardStep('target');
                }}
              />
            )}
          </div>
        )}

        {/* VIEW: GAP ANALYSIS & MATCHING STRATEGY */}
        {activeTab === 'gap' && (
          <div className="gap-workspace-layout">
            {!hasTargetJob ? (
              <LockedViewCard
                iconType="target"
                badgeVariant="target"
                title={t('gap:lockedNoJob.title', 'No Target Vacancy Entered Yet')}
                description={t('gap:lockedNoJob.desc', 'Gap Strategy cross-references your candidate background against specific employer requirements. Please paste or upload a target job posting in the wizard first.')}
                actionText={t('gap:lockedNoJob.action', 'Add Target Job in Wizard')}
                actionIcon="file-text"
                onAction={() => {
                  setActiveTab('wizard');
                  setWizardStep('target');
                }}
              />
            ) : !hasGapReport ? (
              <LockedViewCard
                iconType="zap"
                badgeVariant="ai"
                title={t('gap:lockedNoReport.title', 'Ready to Synthesize Gap Strategy')}
                description={t('gap:lockedNoReport.desc', {
                  company: companyName || 'Target Company',
                  defaultValue: `You have entered target vacancy details for ${companyName || 'Target Company'}. Click below to synthesize your tailored CV and generate the matching strategy report with keyword extraction.`
                })}
                actionText={isGenerating ? t('target:actions.tailoring', 'Synthesizing...') : t('gap:lockedNoReport.action', '✨ Synthesize Tailored CV Now')}
                actionIcon="zap"
                isDisabled={isGenerating}
                onAction={handleGenerate}
              />
            ) : (
              <Suspense fallback={<StudioSkeleton variant="gap" />}>
                <GapAnalysisView
                  gapMarkdown={gapMarkdown}
                  companyName={companyName}
                  targetRole={targetRole}
                  onDownload={() => {
                    const targetComp = companyName || 'Target';
                    const baseName = `Gap_Analysis_${targetComp.replace(/\s+/g, '_')}`;
                    const fileName = buildTimestampedFileName(baseName, 'md');
                    downloadTextFile(gapMarkdown, fileName);
                  }}
                />
              </Suspense>
            )}
          </div>
        )}

        {/* VIEW: APPLICATIONS & CV VERSIONS HISTORY */}
        {activeTab === 'history' && (
          <Suspense fallback={<StudioSkeleton variant="history" />}>
            <div className="history-workspace-layout" style={{ height: '100%' }}>
              <ApplicationsHistoryView />
            </div>
          </Suspense>
        )}

        {/* VIEW: SETTINGS & RULES */}
        {activeTab === 'settings' && (
          <Suspense fallback={<StudioSkeleton variant="settings" />}>
            <div className="settings-workspace-layout">
              <SettingsView
                settings={providerSettings}
                onSettingsChange={setProviderSettings}
                rules={rules}
                onRulesChange={setRules}
                onResetDefaults={handleResetWorkspace}
                onOpenSync={() => handleOpenSync('export')}
              />
            </div>
          </Suspense>
        )}
      </Box>

      {/* Mobile-First Bottom Navigation (Estudio & Postulaciones) */}
      {showMobileBottomNav && (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <MobileBottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        </Box>
      )}

      {/* Synthesis Error Floating Banner */}
      <SynthesisErrorBanner
        error={generationError}
        onDismiss={() => setGenerationError(null)}
        onOpenSettings={() => {
          setGenerationError(null);
          setActiveTab('settings');
        }}
      />


      {/* Full-Screen Blocking AI Synthesis Screen */}
      <AiGeneratingOverlay />

      {/* Bring-Your-Own-AI (Prompt & Paste) Modal */}
      <ManualAiPromptModal
        open={isManualPromptModalOpen}
        title={manualPromptTitle}
        onClose={closeManualPromptModal}
        promptText={manualPromptBundle}
        onSubmitResponse={submitManualResponse}
      />

      {/* Device Sync Modal (Export / Import) */}
      <DeviceSyncModal
        open={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        initialTab={syncModalInitialTab}
        onScanCamera={Capacitor.isNativePlatform() ? handleModalScanCamera : undefined}
        isExporting={sync.isExporting}
        exportUrl={sync.exportUrl}
        exportId={sync.exportId}
        secondsRemaining={sync.secondsRemaining}
        includeApiKeys={sync.includeApiKeys}
        onToggleApiKeys={sync.setIncludeApiKeys}
        onGenerateExport={sync.handleGenerateExport}
        isImporting={sync.isImporting}
        importError={sync.importError}
        onPullSnapshot={(input) => {
          sync.handlePullSnapshot(input);
          setIsSyncModalOpen(false);
        }}
      />

      {/* Snapshot Conflict & Safety Review Modal */}
      <SnapshotConflictModal
        open={Boolean(sync.pendingSnapshot && sync.conflictComparison)}
        comparison={sync.conflictComparison}
        onConfirmOverwrite={sync.handleConfirmOverwrite}
        onDownloadSafetyBackup={sync.handleDownloadSafetyBackup}
        onCancel={sync.handleCancelConflict}
      />

      {/* Global Toast Notification */}
      {globalNotification && (
        <Snackbar
          open={globalNotification.open}
          autoHideDuration={6000}
          onClose={hideNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: { xs: '72px', sm: '80px' } }}
        >
          <Alert
            severity={globalNotification.severity || 'success'}
            variant="filled"
            onClose={hideNotification}
            action={
              globalNotification.actionLabel ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    globalNotification.onAction?.();
                    hideNotification();
                  }}
                  sx={{ fontWeight: 700, textTransform: 'none', ml: 1 }}
                >
                  {globalNotification.actionLabel}
                </Button>
              ) : undefined
            }
            sx={{ fontWeight: 600, alignItems: 'center' }}
          >
            {globalNotification.message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

