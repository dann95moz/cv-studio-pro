import React from 'react';
import {
  Paper,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { CVRenderer } from '../CVRenderer';
import { CvLiveEditProvider } from './preview/CvLiveEditContext';
import { StepPreviewToolbar } from './preview/StepPreviewToolbar';
import { StepPreviewNavRail } from './preview/StepPreviewNavRail';
import { StepPreviewProps } from '../../types';
import { useTranslation } from 'react-i18next';
import { StudioSkeleton } from './StudioSkeleton';
import { TrackApplicationDialog } from './history/TrackApplicationDialog';
import { StepPreviewMobileEdit } from './preview/StepPreviewMobileEdit';
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

  return (
    <div className="preview-workspace-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Studio Control Bar: Desktop Toolbar */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <StepPreviewToolbar
          previewDocType={previewDocType}
          onPreviewDocTypeChange={setPreviewDocType}
          activeTemplateName={activeTemplateMeta.name}
          onOpenTemplates={() => {
            setActiveSidePanel('templates');
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden', position: 'relative' }}>
        {/* 1. Left Tool Rail (Desktop only, mobile uses FAB + Bottom Sheet) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
          <StepPreviewNavRail
            activeSidePanel={activeSidePanel}
            onToggleSidePanel={handleToggleSidePanel}
          />
        </Box>

        {/* 2. Expandable Left Side Panel */}
        {activeSidePanel && (
          <Box
            className="no-print preview-side-panel"
            sx={{
              position: { xs: 'fixed', md: 'relative' },
              left: 0,
              right: { xs: 0, md: 'auto' },
              top: { xs: 0, md: 0 },
              bottom: { xs: 0, md: 0 },
              width: { xs: '100%', sm: 330 },
              maxWidth: { xs: '100%', sm: 360 },
              borderRight: `1px solid ${muiTheme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
              flexShrink: 0,
              zIndex: muiTheme.zIndex.modal,
              boxShadow: { xs: 12, md: 'none' },
            }}
          >
            <React.Suspense fallback={<StudioSkeleton variant="drawer" />}>
              {activeSidePanel === 'templates' && (
                <TemplatesPanel
                  theme={theme}
                  onSelectTheme={setTheme}
                  palette={palette}
                  onSelectPalette={setPalette}
                  customColor={customColor}
                  onCustomColorChange={setCustomColor}
                  onClose={() => setActiveSidePanel(null)}
                />
              )}

              {activeSidePanel === 'design' && (
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
          </Box>
        )}

        {/* 3. Main Center Canvas: Document Sheet & Mobile Touch Editor or Cover Letter */}
        <div
          className="preview-canvas-wrapper"
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', order: 2 }}
        >
          {previewDocType === 'cover-letter' ? (
            <Box
              sx={{
                flex: 1,
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
              {/* Mobile View Mode Segmented Control (Visible only on mobile xs/sm) */}
              <Box
                className="no-print"
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.75,
                  px: 1.5,
                  bgcolor: 'background.paper',
                  borderBottom: `1px solid ${muiTheme.palette.divider}`,
                  zIndex: 10,
                  gap: 1,
                }}
              >
                <ButtonGroup
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: alpha(muiTheme.palette.primary.main, 0.06),
                    p: 0.3,
                    border: 'none',
                    gap: 0.5,
                  }}
                >
                  <Button
                    onClick={() => setMobileViewMode('edit')}
                    variant={mobileViewMode === 'edit' ? 'contained' : 'text'}
                    sx={{
                      px: 2.25,
                      py: 0.5,
                      minHeight: 32,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      bgcolor: mobileViewMode === 'edit' ? 'primary.main' : 'transparent',
                      color: mobileViewMode === 'edit' ? 'common.white' : 'text.secondary',
                    }}
                  >
                    {t('preview:aiRegen.mobileModeEdit', 'Edit')}
                  </Button>
                  <Button
                    onClick={() => setMobileViewMode('preview')}
                    variant={mobileViewMode === 'preview' ? 'contained' : 'text'}
                    sx={{
                      px: 2.25,
                      py: 0.5,
                      minHeight: 32,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textTransform: 'none',
                      boxShadow: 'none',
                      bgcolor: mobileViewMode === 'preview' ? 'primary.main' : 'transparent',
                      color: mobileViewMode === 'preview' ? 'common.white' : 'text.secondary',
                    }}
                  >
                    {t('preview:aiRegen.mobileModePreview', 'Preview')}
                  </Button>
                </ButtonGroup>

                {/* Mobile Zoom Fit Mode Toggle */}
                {mobileViewMode === 'preview' && (
                  <Chip
                    size="small"
                    label={mobileZoomMode === 'fit' ? t('preview:toolbar.zoomFit', 'Fit Width') : t('preview:toolbar.zoom100', '100% Real')}
                    color={mobileZoomMode === 'fit' ? 'primary' : 'default'}
                    variant={mobileZoomMode === 'fit' ? 'filled' : 'outlined'}
                    onClick={() => setMobileZoomMode((m) => (m === 'fit' ? '100%' : 'fit'))}
                    sx={{ fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                  />
                )}
              </Box>

              {/* Mobile 'Edit' Mode: Vertical List of Cards with Large Touch Buttons */}
              {mobileViewMode === 'edit' && (
                <Box
                  className="no-print preview-mobile-edit"
                  sx={{
                    display: { xs: 'block', md: 'none' },
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: 'background.default',
                    '@media print': {
                      display: 'none !important',
                    },
                  }}
                >
                  <CvLiveEditProvider parsedCv={parsedCv} isEditable={true}>
                    <StepPreviewMobileEdit parsedCv={parsedCv} activeTheme={theme} />
                  </CvLiveEditProvider>
                </Box>
              )}

              {/* Desktop OR Mobile 'Preview' Mode: Standard Pristine Canvas */}
              <Box
                component="main"
                ref={canvasContainerRef}
                className="preview-pane-canvas"
                sx={{
                  position: 'relative',
                  display: {
                    xs: mobileViewMode === 'edit' ? 'none' : 'flex',
                    md: 'flex',
                  },
                  flexDirection: 'column',
                  alignItems: canvasScale < 1 && mobileZoomMode === 'fit' ? 'center' : 'flex-start',
                  justifyContent: 'flex-start',
                  flex: 1,
                  overflowX: 'auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  p: { xs: 1.5, sm: 2, md: 3.5 },
                  pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 64px)', sm: 5, md: 6 },
                  boxSizing: 'border-box',
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
                    width: canvasScale < 1 && mobileZoomMode === 'fit' ? `${targetPageWidthPx * canvasScale}px` : `${targetPageWidthPx}px`,
                    height: canvasScale < 1 && mobileZoomMode === 'fit' ? `${sheetHeight * canvasScale}px` : `${sheetHeight}px`,
                    position: 'relative',
                    margin: '0 auto',
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="paper-sheet-wrapper"
                    style={{
                      width: `${targetPageWidthPx}px`,
                      transform: canvasScale < 1 && mobileZoomMode === 'fit' ? `scale(${canvasScale})` : undefined,
                      transformOrigin: 'top left',
                      position: canvasScale < 1 && mobileZoomMode === 'fit' ? 'absolute' : 'relative',
                      top: 0,
                      left: 0,
                    }}
                  >
                    <div
                      ref={paperRef}
                      className={`paper-sheet ${overflowPercentage > 0 && overflowPercentage <= 25 ? 'compact-fit' : ''}`}
                      style={{
                        width: `${targetPageWidthPx}px`,
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

              {/* Bottom Navigation Bar: Desktop only */}
              <Paper
                elevation={0}
                className="no-print preview-nav-footer"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  p: 1.25,
                  px: { xs: 1.5, sm: 3 },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  borderTop: `1px solid ${muiTheme.palette.divider}`,
                  bgcolor: 'background.paper',
                  zIndex: 10,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={() => setWizardStep('target')}
                  size="small"
                  sx={{ fontSize: { xs: '0.74rem', sm: '0.8rem' } }}
                >
                  {t('preview:actions.backToTarget', 'Back to Target Vacancy')}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    icon={<EditRoundedIcon sx={{ fontSize: '13px !important' }} />}
                    label={t('preview:toolbar.liveHotEdit', 'Live Hot Edit • Click text to edit & re-audit')}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      height: 24,
                      display: { xs: 'none', md: 'inline-flex' },
                    }}
                  />

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                    {t('preview:toolbar.pageFit', 'Estimated Length')}: <strong style={{ color: estimatedPages === 1 ? muiTheme.palette.success.main : muiTheme.palette.warning.main }}>{estimatedPages} {estimatedPages === 1 ? `Page (${pageFormat.toUpperCase()})` : 'Pages'}</strong> • Height: {sheetHeight}px / {targetPagePx}px
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </div>

        {/* 4. Unified Right-Side Audit & Gap Drawer */}
        <Box sx={{ order: 3, display: 'flex', height: '100%' }}>
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
    </div>
  );
};
