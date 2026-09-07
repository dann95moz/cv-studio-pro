import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { CVRenderer } from '../CVRenderer';
import { CvLiveEditProvider } from './preview/CvLiveEditContext';
import { StepPreviewToolbar } from './preview/StepPreviewToolbar';
import { StepPreviewNavRail } from './preview/StepPreviewNavRail';
import { StepPreviewProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { StudioSkeleton } from './StudioSkeleton';
import { TrackApplicationDialog } from './history/TrackApplicationDialog';
import { RADIUS_TOKENS } from '../../theme/dimensions';
import { useStepPreviewWorkflow } from '../../hooks/useStepPreviewWorkflow';
import {
  MobileDocumentBar,
  MobileStudioFab,
  MobileToolsBottomSheet,
} from './mobile';

// Dynamically loaded preview sidebars
const TemplatesPanel = React.lazy(() =>
  import('./preview/TemplatesPanel').then((m) => ({ default: m.TemplatesPanel }))
);
const DesignFormattingPanel = React.lazy(() =>
  import('./preview/DesignFormattingPanel').then((m) => ({ default: m.DesignFormattingPanel }))
);
const PreviewAuditGapDrawer = React.lazy(() =>
  import('./preview/PreviewAuditGapDrawer').then((m) => ({ default: m.PreviewAuditGapDrawer }))
);
const CoverLetterView = React.lazy(() =>
  import('./preview/CoverLetterView').then((m) => ({ default: m.CoverLetterView }))
);
const LinkedInPanel = React.lazy(() =>
  import('./preview/LinkedInPanel').then((m) => ({ default: m.LinkedInPanel }))
);
const VersionDiffModal = React.lazy(() =>
  import('./history/VersionDiffModal').then((m) => ({ default: m.VersionDiffModal }))
);
const GitHubStarToast = React.lazy(() =>
  import('./GitHubStarToast').then((m) => ({ default: m.GitHubStarToast }))
);
const CvTranslateModal = React.lazy(() =>
  import('./preview/CvTranslateModal').then((m) => ({ default: m.CvTranslateModal }))
);

export type { StepPreviewProps };

export const StepPreview: React.FC<StepPreviewProps> = () => {
  const { t } = useTranslation(['preview', 'target', 'common']);
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
    mobileViewMode,
    setMobileViewMode,
    mobileZoomMode,
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
    gapMarkdown,
    parsedCv,
    auditReport,
    gapInfo,
    isTracked,
    handleSaveToHistory,
    handleTrackApplication,
    handleConfirmTrackApplication,
    handleMagicAutoFit,
    onTriggerDirectDownloadPdf,
    onTriggerDownloadPlainText,
    onTriggerDownloadDocx,
    onTriggerCopyPlainText,
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
  } = useStepPreviewWorkflow();

  const [isMobileToolsOpen, setIsMobileToolsOpen] = React.useState(false);

  const panelContent = activeSidePanel && (
    <React.Suspense fallback={<StudioSkeleton variant="drawer" />}>
      {(activeSidePanel === 'design' || activeSidePanel === 'templates') && (
        <DesignFormattingPanel
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
          activeTheme={theme}
          theme={theme}
          onSelectTheme={setTheme}
          initialTab={activeSidePanel === 'templates' ? 'templates' : 'formatting'}
          onClose={() => setActiveSidePanel(null)}
        />
      )}

      {activeSidePanel === 'linkedin' && (
        <LinkedInPanel
          cvData={parsedCv}
          companyName={companyName}
          targetRole={targetRole}
          targetJob={targetJob}
          providerSettings={providerSettings}
          onClose={() => setActiveSidePanel(null)}
        />
      )}
    </React.Suspense>
  );

  return (
    <div className="preview-workspace-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
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

      {/* Main Studio Body: Vertical Left Rail + Side Drawer + Sheet Canvas + Right Audit/Gap Drawer */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden', position: 'relative' }}>
        {/* 1. Left Tool Rail (Desktop only, mobile uses FAB + Bottom Sheet) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
          <StepPreviewNavRail
            activeSidePanel={activeSidePanel}
            onToggleSidePanel={handleToggleSidePanel}
          />
        </Box>

        {/* 2. Expandable Left Side Panel (Desktop only - Mobile uses Bottom Sheet Drawer) */}
        {!isMobile && activeSidePanel && (
          <Box
            className="no-print preview-side-panel"
            sx={{
              position: 'relative',
              width: 330,
              maxWidth: 360,
              borderRight: `1px solid ${muiTheme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
              flexShrink: 0,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {panelContent}
          </Box>
        )}

        {/* 3. Main Center Canvas: Document Sheet & Mobile Touch Editor or Cover Letter */}
        <div
          className="preview-canvas-wrapper"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            order: 2,
          }}
        >
          {previewDocType === 'cover-letter' ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                p: { xs: 1.5, sm: 3 },
                pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 64px)', sm: 6 },
                bgcolor: 'background.default',
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <React.Suspense fallback={<StudioSkeleton variant="preview" />}>
                <CoverLetterView
                  cvData={parsedCv}
                  companyName={companyName}
                  targetRole={targetRole}
                  themeId={theme}
                  paletteId={palette}
                  customColor={customColor}
                  fontFamily={fontFamily}
                  onExportPdf={onTriggerDirectDownloadPdf}
                />
              </React.Suspense>
            </Box>
          ) : (
            <>
              {/* Document Canvas: Exact A4 simulation with responsive auto-scaling and dynamic balanced centering */}
              <Box
                component="main"
                ref={canvasContainerRef}
                className="preview-pane-canvas"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  flex: 1,
                  height: '100%',
                  minHeight: 0,
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  p: { xs: 1.5, sm: 2, md: 3.5 },
                  pr: {
                    xs: 1.5,
                    sm: 2,
                    md: !isAuditGapOpen && !isHudMinimized ? 'calc(215px + 28px)' : 3.5,
                  },
                  pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', sm: 5, md: 6 },
                  boxSizing: 'border-box',
                  transition: 'padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '@media print': {
                    display: 'block !important',
                    visibility: 'visible !important',
                    overflow: 'visible !important',
                    p: '0 !important',
                    m: '0 !important',
                  },
                }}
              >
                {/* Scaled Wrapper Container with strict visual pixel footprint */}
                <div
                  className="paper-scale-container"
                  style={{
                    width: canvasScale < 1 ? `${targetPageWidthPx * canvasScale}px` : `${targetPageWidthPx}px`,
                    height: canvasScale < 1 ? `${(sheetHeight || targetPagePx) * canvasScale}px` : (sheetHeight > 0 ? `${sheetHeight}px` : 'auto'),
                    minHeight: canvasScale < 1 ? `${targetPagePx * canvasScale}px` : `${targetPagePx}px`,
                    position: 'relative',
                    margin: '0 auto',
                    flexShrink: 0,
                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className="paper-sheet-wrapper"
                    style={{
                      width: `${targetPageWidthPx}px`,
                      minHeight: `${targetPagePx}px`,
                      transform: canvasScale < 1 ? `scale(${canvasScale})` : undefined,
                      transformOrigin: 'top left',
                      position: canvasScale < 1 ? 'absolute' : 'relative',
                      top: 0,
                      left: 0,
                      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div
                      ref={paperRef}
                      className={`paper-sheet ${overflowPercentage > 0 && overflowPercentage <= 25 ? 'compact-fit' : ''}`}
                      style={{
                        width: `${targetPageWidthPx}px`,
                        minHeight: `${targetPagePx}px`,
                        margin: '0 auto',
                      }}
                    >
                      <CvLiveEditProvider parsedCv={parsedCv} isEditable={true}>
                        <CVRenderer
                          data={parsedCv}
                          theme={theme}
                          palette={palette}
                          customColor={palette === 'custom' ? customColor : undefined}
                          fontFamily={fontFamily}
                          spacingDensity={spacingDensity}
                          photo={photo}
                        />
                      </CvLiveEditProvider>
                    </div>

                    {/* Visual Page Break Marker only on actual overflow */}
                    {isOverflowing && (
                      <div
                        className="page-break-guide"
                        style={{
                          top: `${targetPagePx}px`,
                        }}
                      >
                        <span>✂️ {t('preview:toolbar.pageBoundary', 'Page 1 Boundary ({{format}} Standard)', { format: pageFormat.toUpperCase() })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Box>
            </>
          )}
        </div>

        {/* 4. Unified Right-Side Audit & Gap Drawer */}
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

      {/* Mobile-First FAB and Tools Bottom Sheet */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
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
            setIsDiffModalOpen(true);
          }}
          onDownloadPdf={onTriggerDirectDownloadPdf}
          onDownloadDocx={onTriggerDownloadDocx}
          onDownloadPlainText={onTriggerDownloadPlainText}
          onCopyPlainText={onTriggerCopyPlainText}
          onDownloadMarkdown={handleDownloadCvMarkdown}
          onSaveVersion={handleSaveToHistory}
          onReTailor={handleGenerate}
          isExportingPdf={isExportingPdf}
          isSavingVersion={isSavingVersion}
        />
      </Box>

      {/* One-Time Post-Export GitHub Star Satisfaction Toast */}
      <React.Suspense fallback={null}>
        <GitHubStarToast
          open={isPromptOpen}
          onClose={dismissPrompt}
          onStarClick={openGitHubAndDismiss}
        />
      </React.Suspense>

      {/* Opt-in Track Application Dialog */}
      <TrackApplicationDialog
        open={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onConfirm={handleConfirmTrackApplication}
        prefillCompany={companyName}
        prefillRole={targetRole}
        savedVersions={savedVersions}
        existingApplications={applications}
        columns={kanbanColumns}
      />

      {/* Visual Version Diff Modal */}
      <React.Suspense fallback={null}>
        <VersionDiffModal
          open={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
        />
      </React.Suspense>

      {/* CV AI Translation Modal */}
      <React.Suspense fallback={null}>
        {isTranslateModalOpen && (
          <CvTranslateModal
            open={isTranslateModalOpen}
            onClose={handleCloseTranslateModal}
            baseLanguage={currentBaseLanguage}
            translations={translations}
            activeProviderName={providerSettings.provider}
            activeModelName={activeModelName}
            isTranslating={isTranslating}
            onTranslateFull={handleTranslateFull}
            onTranslateIncremental={handleTranslateIncremental}
          />
        )}
      </React.Suspense>

      {/* Toast Feedback when application is tracked */}
      <Snackbar
        open={trackSuccess}
        autoHideDuration={3000}
        onClose={() => setTrackSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          {t('preview:toolbar.trackedSuccess', 'Saved to My Applications')}
        </Alert>
      </Snackbar>

      {/* Mobile Tool Drawer (Bottom Sheet on mobile when opened via FAB) */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={Boolean(activeSidePanel)}
          onClose={() => setActiveSidePanel(null)}
          slotProps={{
            paper: {
              sx: {
                maxHeight: '85vh',
                borderTopLeftRadius: RADIUS_TOKENS.xl,
                borderTopRightRadius: RADIUS_TOKENS.xl,
                bgcolor: 'background.paper',
                overflowY: 'auto',
              },
            },
          }}
        >
          <Box sx={{ width: 36, height: 4, bgcolor: 'divider', borderRadius: RADIUS_TOKENS.full, mx: 'auto', mt: 1.5, mb: 0.5 }} />
          {panelContent}
        </Drawer>
      )}
    </div>
  );
};
