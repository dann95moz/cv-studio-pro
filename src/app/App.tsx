import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { MobileBottomNav } from '../components/studio/mobile';
import { AppHeaderBar } from '../components/studio/layout/AppHeaderBar';
import { AppWorkspaceViews } from '../components/studio/layout/AppWorkspaceViews';
import { AppGlobalOverlays } from '../components/studio/layout/AppGlobalOverlays';
import { AppSyncOrchestrator } from '../components/studio/sync/AppSyncOrchestrator';
import { AppWalkthroughOrchestrator } from '../components/studio/mobile/AppWalkthroughOrchestrator';
import { useStudioFacade } from '../hooks/facades/useStudioFacade';
import { useAppBackNavigation } from '../hooks/useAppBackNavigation';
import { useDeviceSync } from '../hooks/useDeviceSync';
import { useForegroundResume } from '../hooks/useForegroundResume';
import { qrScannerService } from '../core/qrScannerService';
import { hapticsService } from '../core/haptics';
import { platformService } from '../core/platform';
import { DEMO_MASTER_DATA, DEMO_TARGET_JOB } from '../constants/templates';
import './App.css';

export const App: React.FC = () => {
  const { t } = useTranslation(['common', 'profile']);

  const {
    navigation: {
      activeTab,
      setActiveTab,
      wizardStep,
      setWizardStep,
      masterDataMode,
      setMasterDataMode,
      showMobileBottomNav,
    },
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
      setCvMarkdown,
      gapMarkdown,
      hasTargetJob,
      hasGeneratedCv,
      hasGapReport,
      auditReport,
      gapInfo,
    },
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
    system: {
      globalNotification,
      showNotification,
      hideNotification,
      handleResetWorkspace,
    },
  } = useStudioFacade();

  // Mobile Onboarding Walkthrough State (Exclusively on Native App first launch)
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(() => {
    try {
      const isSeen = localStorage.getItem('cv_studio_onboarding_completed') === 'true';
      return platformService.isNative() && !isSeen;
    } catch {
      return false;
    }
  });

  const handleCloseWalkthrough = () => {
    try {
      localStorage.setItem('cv_studio_onboarding_completed', 'true');
    } catch (e) {
      console.debug('[App] Error writing onboarding flag:', e);
    }
    setIsWalkthroughOpen(false);
    if (platformService.isNative() || activeTab === 'landing') {
      setActiveTab('wizard');
      setWizardStep('profile');
    }
  };

  // Multidevice Sync State & Hook
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncModalInitialTab, setSyncModalInitialTab] = useState<'export' | 'import'>('export');
  const sync = useDeviceSync();

  const handleOpenSync = (tab: 'export' | 'import' = 'export') => {
    setSyncModalInitialTab(tab);
    setIsSyncModalOpen(true);
  };

  const handleScanOrSync = async (defaultTab?: 'export' | 'import') => {
    if (defaultTab) {
      handleOpenSync(defaultTab);
      return;
    }

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

        if (scanRes.cancelled) return;

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

    if (platformService.isDesktopWeb()) {
      handleOpenSync('export');
    } else {
      handleOpenSync('import');
    }
  };

  const handleModalScanCamera = async () => {
    setIsSyncModalOpen(false);
    setTimeout(async () => {
      await handleScanOrSync();
    }, 150);
  };

  // Hardware and top back navigation
  const { canMobileGoBack, handleMobileTopHeaderBack } = useAppBackNavigation({
    activeTab,
    setActiveTab,
    wizardStep,
    setWizardStep,
    masterDataMode,
    setMasterDataMode,
  });

  return (
    <div className="studio-app">
      {/* Header Bar (Desktop Navbar, Stepper, Mobile Top Header) */}
      <AppHeaderBar
        activeTab={activeTab}
        wizardStep={wizardStep}
        masterDataMode={masterDataMode}
        hasMasterData={hasMasterData}
        hasTargetJob={hasTargetJob}
        hasGeneratedCv={hasGeneratedCv}
        canMobileGoBack={canMobileGoBack}
        onSelectTab={setActiveTab}
        onSelectWizardStep={setWizardStep}
        onMobileBack={handleMobileTopHeaderBack}
        onOpenSync={() => handleScanOrSync()}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />

      {/* Main Workspace Body */}
      <AppWorkspaceViews
        activeTab={activeTab}
        wizardStep={wizardStep}
        showMobileBottomNav={showMobileBottomNav}
        masterData={masterData}
        setMasterData={setMasterData}
        targetJob={targetJob}
        setTargetJob={setTargetJob}
        companyName={companyName}
        setCompanyName={setCompanyName}
        targetRole={targetRole}
        setTargetRole={setTargetRole}
        rules={rules}
        setRules={setRules}
        providerSettings={providerSettings}
        setProviderSettings={setProviderSettings}
        isGenerating={isGenerating}
        generationStep={generationStep}
        hasTargetJob={hasTargetJob}
        hasGeneratedCv={hasGeneratedCv}
        hasGapReport={hasGapReport}
        auditReport={auditReport}
        gapInfo={gapInfo}
        gapMarkdown={gapMarkdown}
        onSelectTab={setActiveTab}
        onSelectWizardStep={setWizardStep}
        onGenerate={handleGenerate}
        onResetWorkspace={handleResetWorkspace}
        onOpenSync={() => handleScanOrSync()}
        onRefreshAudit={() => setCvMarkdown((prev: string) => `${prev}`)}
      />

      {/* Mobile-First Bottom Navigation */}
      {showMobileBottomNav && (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
        </Box>
      )}

      {/* Global Overlays: AI generating overlay, manual prompt modal, error banners, notifications */}
      <AppGlobalOverlays
        generationError={generationError}
        onClearGenerationError={() => setGenerationError(null)}
        onOpenSettings={() => {
          setGenerationError(null);
          setActiveTab('settings');
        }}
        isManualPromptModalOpen={isManualPromptModalOpen}
        manualPromptTitle={manualPromptTitle}
        manualPromptBundle={manualPromptBundle}
        onCloseManualPromptModal={closeManualPromptModal}
        onSubmitManualResponse={submitManualResponse}
        globalNotification={globalNotification}
        onHideNotification={hideNotification}
      />

      {/* Multi-Device Synchronization Orchestrator */}
      <AppSyncOrchestrator
        sync={sync}
        isSyncModalOpen={isSyncModalOpen}
        onCloseSyncModal={() => setIsSyncModalOpen(false)}
        syncModalInitialTab={syncModalInitialTab}
        onScanCamera={handleModalScanCamera}
      />

      {/* Mobile Walkthrough & Quick Actions */}
      <AppWalkthroughOrchestrator
        isOpen={isWalkthroughOpen}
        onClose={handleCloseWalkthrough}
        onOpenSync={handleScanOrSync}
        onLoadDemo={() => {
          setMasterData(DEMO_MASTER_DATA);
          setTargetJob(DEMO_TARGET_JOB);
          setCompanyName('Stripe');
          setTargetRole('Senior Frontend Engineer');
          setActiveTab('wizard');
          setWizardStep('preview');
        }}
        onImportMasterData={(content) => {
          setMasterData(content);
          setActiveTab('wizard');
          setWizardStep('profile');
          showNotification({
            message: t('profile:importSuccess', 'CV importado correctamente'),
            severity: 'success',
          });
        }}
      />
    </div>
  );
};
