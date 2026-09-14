import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { StepPreviewToolbar } from './preview/StepPreviewToolbar';
import { StepPreviewCanvas } from './preview/StepPreviewCanvas';
import { StepPreviewSidePanels } from './preview/StepPreviewSidePanels';
import { StepPreviewModals } from './preview/StepPreviewModals';
import { StepPreviewProps } from '../../types';
import { useStepPreviewWorkflow } from '../../hooks/useStepPreviewWorkflow';
import {
  MobileDocumentBar,
  MobileDiagnosticBar,
  MobileStudioFab,
  MobileToolsBottomSheet,
} from './mobile';
import { backButtonRegistry } from '../../core/backButtonRegistry';
import { useCanvasTouchGestures } from '../../hooks/useCanvasTouchGestures';
import { CanvasZoomFloatingCapsule } from './preview/CanvasZoomFloatingCapsule';

const PreviewAuditGapDrawer = React.lazy(() =>
  import('./preview/PreviewAuditGapDrawer').then((m) => ({ default: m.PreviewAuditGapDrawer }))
);

export type { StepPreviewProps };

export const StepPreview: React.FC<StepPreviewProps> = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const {
    paperRef,
    canvasContainerRef,
    previewDocType,
    setPreviewDocType,
    isDiffModalOpen,
    setIsDiffModalOpen,
    isTrackModalOpen,
    setIsTrackModalOpen,
    savedSuccess,
    trackSuccess,
    setTrackSuccess,
    isSavingVersion,
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
    setMobileZoomMode,
    canvasScale,
    sheetHeight,
    targetPagePx,
    targetPageWidthPx,
    isOverflowing,
    estimatedPages,
    overflowPercentage,
    activeTemplateMeta,
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
    handleSaveToHistory,
    handleSaveAsGeneric,
    handleLoadVersion,
    handlePinAsGeneric,
    handleUnpinGeneric,
    diffInitialVersionAId,
    diffInitialVersionBId,
    handleCompareAgainstGeneric,
    handleCloseDiffModal,
    handleTrackApplication,
    handleConfirmTrackApplication,
    handleMagicAutoFit,
    onTriggerDirectDownloadPdf,
    onTriggerSharePdf,
    onTriggerDownloadPlainText,
    onTriggerDownloadDocx,
    onTriggerCopyPlainText,
    isExportingPdf,
    isPromptOpen,
    dismissPrompt,
    openGitHubAndDismiss,
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
    cvMarkdown,
    isAdaptModalOpen,
    handleOpenAdaptModal,
    handleCloseAdaptModal,
    handleUseCurrentCvForNewOffer,
    handleAdaptNewOfferWithAi,
  } = useStepPreviewWorkflow();

  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  // 0ms Touch Gestures for mobile A4 canvas (Pinch-to-zoom & 2-finger pan)
  const {
    currentScale: dynamicCanvasScale,
    isZoomed: isCanvasZoomed,
    resetToFit: handleResetFitZoom,
  } = useCanvasTouchGestures({
    containerRef: canvasContainerRef,
    baseScale: canvasScale,
    onResetFit: () => setMobileZoomMode('fit'),
  });

  const effectiveCanvasScale = isMobile ? dynamicCanvasScale : canvasScale;

  // Register mobile tools bottom sheet and audit drawer in the back button stack
  useEffect(() => {
    if (isMobileToolsOpen) {
      return backButtonRegistry.register({
        id: 'preview-mobile-tools',
        priority: 50,
        handler: () => {
          setIsMobileToolsOpen(false);
          return true;
        },
      });
    }
  }, [isMobileToolsOpen]);

  useEffect(() => {
    if (isAuditGapOpen) {
      return backButtonRegistry.register({
        id: 'preview-audit-drawer',
        priority: 60,
        handler: () => {
          setIsAuditGapOpen(false);
          return true;
        },
      });
    }
  }, [isAuditGapOpen, setIsAuditGapOpen]);

  return (
    <div
      className="preview-workspace-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Top Studio Control Bar: Desktop Toolbar */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <StepPreviewToolbar
          onSelectWizardStep={setWizardStep}
          previewDocType={previewDocType}
          onPreviewDocTypeChange={setPreviewDocType}
          activeTemplateName={activeTemplateMeta.name}
          onOpenTemplates={() => {
            setActiveSidePanel('design');
            setIsAuditGapOpen(false);
          }}
          onSaveVersion={handleSaveToHistory}
          savedSuccess={savedSuccess}
          isSavingVersion={isSavingVersion}
          onReTailor={handleGenerate}
          isGenerating={isGenerating}
          onDownloadPdf={onTriggerDirectDownloadPdf}
          onDownloadMarkdown={handleDownloadCvMarkdown}
          onDownloadPlainText={onTriggerDownloadPlainText}
          onDownloadDocx={onTriggerDownloadDocx}
          onCopyPlainText={onTriggerCopyPlainText}
          isExportingPdf={isExportingPdf}
          pageFormat={pageFormat}
          onPageFormatChange={setPageFormat}
          isOverflowing={isOverflowing}
          onAutoFit={handleMagicAutoFit}
          onTrackApplication={handleTrackApplication}
          isTracked={isTracked}
          activeLanguage={activeLanguage}
          baseLanguage={currentBaseLanguage}
          translations={translations}
          onLanguageChange={setActiveLanguage}
          onOpenTranslateModal={handleOpenTranslateModal}
          isLanguageOutdated={isLanguageOutdated}
          outdatedSectionsCount={outdatedSectionsCount}
          onQuickSyncOutdated={handleQuickSyncOutdated}
          isTranslating={isTranslating}
          savedVersions={savedVersions}
          activeVersionId={activeVersionId}
          companyName={companyName}
          targetRole={targetRole}
          matchScore={
            gapInfo.matchScore ||
            (auditReport.overallScore ? Math.round(auditReport.overallScore * 10) : 0)
          }
          onSelectVersion={handleLoadVersion}
          onPinAsGeneric={handlePinAsGeneric}
          onUnpinGeneric={handleUnpinGeneric}
          onSaveAsGeneric={handleSaveAsGeneric}
          onCompareAgainstGeneric={handleCompareAgainstGeneric}
          onOpenAdaptModal={handleOpenAdaptModal}
        />
      </Box>

      {/* Mobile-First Secondary Document Bar: Document Switcher & Language Selector */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, flexShrink: 0 }}>
        <MobileDocumentBar
          previewDocType={previewDocType}
          onPreviewDocTypeChange={setPreviewDocType}
          activeLanguage={activeLanguage}
          baseLanguage={currentBaseLanguage}
          translations={translations}
          onLanguageChange={setActiveLanguage}
          onOpenTranslateModal={handleOpenTranslateModal}
          isLanguageOutdated={isLanguageOutdated}
        />
      </Box>

      {/* Mobile-First Tertiary Diagnostic Bar */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, flexShrink: 0 }}>
        <MobileDiagnosticBar
          auditScore={auditReport?.overallScore ?? 0}
          matchScore={gapInfo?.matchScore ?? 0}
          onSelectTab={(tab) => {
            setIsAuditGapOpen(true);
            setAuditGapTab(tab);
            setActiveSidePanel(null);
          }}
        />
      </Box>

      {/* Main Studio Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Side Panels (NavRail & Expandable Drawer) */}
        <StepPreviewSidePanels
          isMobile={isMobile}
          activeSidePanel={activeSidePanel}
          onToggleSidePanel={handleToggleSidePanel}
          onCloseSidePanel={() => setActiveSidePanel(null)}
          customColor={customColor}
          onCustomColorChange={setCustomColor}
          palette={palette}
          onSelectPalette={setPalette}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          spacingDensity={spacingDensity}
          onSpacingDensityChange={setSpacingDensity}
          pageFormat={pageFormat}
          onPageFormatChange={setPageFormat}
          onAutoFit={handleMagicAutoFit}
          sheetHeight={sheetHeight}
          a4PagePx={targetPagePx}
          estimatedPages={estimatedPages}
          photo={photo}
          onPhotoChange={setProfilePhoto}
          onPhotoToggle={setProfilePhotoEnabled}
          theme={theme}
          onSelectTheme={setTheme}
          parsedCv={parsedCv}
          companyName={companyName}
          targetRole={targetRole}
          targetJob={targetJob}
          providerSettings={providerSettings}
        />

        {/* Center Canvas: A4 Sheet / Cover Letter */}
        <StepPreviewCanvas
          previewDocType={previewDocType}
          canvasContainerRef={canvasContainerRef}
          paperRef={paperRef}
          effectiveCanvasScale={effectiveCanvasScale}
          targetPageWidthPx={targetPageWidthPx}
          targetPagePx={targetPagePx}
          sheetHeight={sheetHeight}
          overflowPercentage={overflowPercentage}
          isOverflowing={isOverflowing}
          pageFormat={pageFormat}
          parsedCv={parsedCv}
          theme={theme}
          palette={palette}
          customColor={customColor}
          fontFamily={fontFamily}
          spacingDensity={spacingDensity}
          photo={photo}
          companyName={companyName}
          targetRole={targetRole}
          onTriggerDirectDownloadPdf={onTriggerDirectDownloadPdf}
          isAuditGapOpen={isAuditGapOpen}
          isHudMinimized={isHudMinimized}
        />

        {/* Right-Side Audit & Gap Drawer */}
        <Box
          sx={{
            order: 3,
            display: { xs: isAuditGapOpen ? 'block' : 'none', md: 'flex' },
            width: isAuditGapOpen ? { xs: '100%', sm: 380, md: 380 } : 0,
            height: { xs: 'auto', md: '100%' },
            position: isAuditGapOpen ? 'relative' : 'static',
            flexShrink: 0,
          }}
        >
          <React.Suspense fallback={null}>
            <PreviewAuditGapDrawer
              auditReport={auditReport}
              gapInfo={gapInfo}
              gapMarkdown={gapMarkdown}
              companyName={companyName}
              targetRole={targetRole}
              cvData={parsedCv}
              isOpen={isAuditGapOpen}
              activeTab={auditGapTab}
              onToggleTab={(tab) => {
                setIsAuditGapOpen(true);
                setAuditGapTab(tab);
                setActiveSidePanel(null);
              }}
              onClose={() => setIsAuditGapOpen(false)}
              onOpenFullAudit={handleOpenFullAudit}
              isHudMinimized={isHudMinimized}
              onToggleHudMinimized={setIsHudMinimized}
            />
          </React.Suspense>
        </Box>
      </Box>

      {/* Mobile-First FAB, Zoom Indicator, and Tools Bottom Sheet */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <CanvasZoomFloatingCapsule
          scale={effectiveCanvasScale}
          isZoomed={isCanvasZoomed}
          onResetFit={handleResetFitZoom}
        />
        <MobileStudioFab onClick={() => setIsMobileToolsOpen(true)} />
        <MobileToolsBottomSheet
          open={isMobileToolsOpen}
          onClose={() => setIsMobileToolsOpen(false)}
          onSelectTool={(tool) => {
            setIsMobileToolsOpen(false);
            handleToggleSidePanel(tool);
          }}
          onOpenDiff={() => {
            setIsMobileToolsOpen(false);
            handleCompareAgainstGeneric();
          }}
          onOpenAuditGap={(tab = 'gap') => {
            setIsMobileToolsOpen(false);
            setIsAuditGapOpen(true);
            setAuditGapTab(tab);
            setActiveSidePanel(null);
          }}
          onDownloadPdf={onTriggerDirectDownloadPdf}
          onSharePdf={onTriggerSharePdf}
          onDownloadDocx={onTriggerDownloadDocx}
          onDownloadPlainText={onTriggerDownloadPlainText}
          onCopyPlainText={onTriggerCopyPlainText}
          onDownloadMarkdown={handleDownloadCvMarkdown}
          onSaveVersion={handleSaveToHistory}
          onReTailor={handleGenerate}
          onOpenAdaptModal={handleOpenAdaptModal}
          isExportingPdf={isExportingPdf}
          isSavingVersion={isSavingVersion}
        />
      </Box>

      {/* Preview Dialogs, Modals, and Feedback */}
      <StepPreviewModals
        isTrackModalOpen={isTrackModalOpen}
        onCloseTrackModal={() => setIsTrackModalOpen(false)}
        onConfirmTrackApplication={handleConfirmTrackApplication}
        companyName={companyName}
        targetRole={targetRole}
        savedVersions={savedVersions}
        applications={applications}
        kanbanColumns={kanbanColumns}
        isDiffModalOpen={isDiffModalOpen}
        onCloseDiffModal={handleCloseDiffModal}
        diffInitialVersionAId={diffInitialVersionAId}
        diffInitialVersionBId={diffInitialVersionBId}
        isTranslateModalOpen={isTranslateModalOpen}
        onCloseTranslateModal={handleCloseTranslateModal}
        currentBaseLanguage={currentBaseLanguage}
        translations={translations}
        providerSettings={providerSettings}
        activeModelName={activeModelName}
        isTranslating={isTranslating}
        onTranslateFull={handleTranslateFull}
        onTranslateIncremental={handleTranslateIncremental}
        isAdaptModalOpen={isAdaptModalOpen}
        onCloseAdaptModal={handleCloseAdaptModal}
        cvMarkdown={cvMarkdown}
        onUseCurrentCvForNewOffer={handleUseCurrentCvForNewOffer}
        onAdaptNewOfferWithAi={handleAdaptNewOfferWithAi}
        isGenerating={isGenerating}
        isPromptOpen={isPromptOpen}
        onDismissPrompt={dismissPrompt}
        onStarClick={openGitHubAndDismiss}
        trackSuccess={trackSuccess}
        onCloseTrackSuccess={() => setTrackSuccess(false)}
      />
    </div>
  );
};
