import React, { useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { StepPreviewProps } from '../../types';
import { useStepPreviewFacade } from '../../hooks/facades/useStepPreviewFacade';
import { backButtonRegistry } from '../../core/backButtonRegistry';
import { useCanvasTouchGestures } from '../../hooks/useCanvasTouchGestures';
import { StepPreviewDesktopToolbar } from './preview/StepPreviewDesktopToolbar';
import { StepPreviewMobileHeader } from './preview/StepPreviewMobileHeader';
import { StepPreviewSidePanels } from './preview/StepPreviewSidePanels';
import { StepPreviewCanvas } from './preview/StepPreviewCanvas';
import { StepPreviewAuditDrawer } from './preview/StepPreviewAuditDrawer';
import { StepPreviewMobileControls } from './preview/StepPreviewMobileControls';
import { StepPreviewModalsContainer } from './preview/StepPreviewModalsContainer';

export type { StepPreviewProps };

/**
 * StepPreview: Top-level Preview Studio Container.
 * Orchestrates preview layout across:
 * - Desktop toolbar (StepPreviewDesktopToolbar)
 * - Mobile headers (StepPreviewMobileHeader)
 * - Main workspace (SidePanels, Canvas, AuditDrawer)
 * - Mobile bottom controls & gestures (StepPreviewMobileControls)
 * - Studio dialogs & modals (StepPreviewModalsContainer)
 * Strictly follows SOLID (SRP) and the <200 line component rule.
 */
export const StepPreview: React.FC<StepPreviewProps> = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const facade = useStepPreviewFacade();

  // 0ms Touch Gestures for mobile A4 canvas (Pinch-to-zoom & 2-finger pan)
  const {
    currentScale: dynamicCanvasScale,
    isZoomed: isCanvasZoomed,
    resetToFit: handleResetFitZoom,
  } = useCanvasTouchGestures({
    containerRef: facade.canvas.canvasContainerRef,
    baseScale: facade.canvas.canvasScale,
    onResetFit: () => facade.canvas.setMobileZoomMode('fit'),
  });

  const effectiveCanvasScale = isMobile ? dynamicCanvasScale : facade.canvas.canvasScale;

  // Register audit drawer in Android/mobile back button stack
  useEffect(() => {
    if (facade.modals.isAuditGapOpen) {
      return backButtonRegistry.register({
        id: 'preview-audit-drawer',
        priority: 60,
        handler: () => {
          facade.modals.setIsAuditGapOpen(false);
          return true;
        },
      });
    }
  }, [facade.modals.isAuditGapOpen, facade.modals.setIsAuditGapOpen]);

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
      <StepPreviewDesktopToolbar facade={facade} />

      {/* Mobile Secondary Document & Diagnostic Bars */}
      <StepPreviewMobileHeader facade={facade} />

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
          activeSidePanel={facade.modals.activeSidePanel}
          onToggleSidePanel={facade.modals.handleToggleSidePanel}
          onCloseSidePanel={() => facade.modals.setActiveSidePanel(null)}
          customColor={facade.design.customColor}
          onCustomColorChange={facade.design.setCustomColor}
          palette={facade.design.palette}
          onSelectPalette={facade.design.setPalette}
          fontFamily={facade.design.fontFamily}
          onFontFamilyChange={facade.design.setFontFamily}
          spacingDensity={facade.design.spacingDensity}
          onSpacingDensityChange={facade.design.setSpacingDensity}
          sidebarWidth={facade.design.sidebarWidth}
          onSidebarWidthChange={facade.design.setSidebarWidth}
          pageFormat={facade.design.pageFormat}
          onPageFormatChange={facade.design.setPageFormat}
          onAutoFit={facade.canvas.handleMagicAutoFit}
          sheetHeight={facade.canvas.sheetHeight}
          a4PagePx={facade.canvas.targetPagePx}
          estimatedPages={facade.canvas.estimatedPages}
          photo={facade.design.photo}
          onPhotoChange={facade.design.setProfilePhoto}
          onPhotoToggle={facade.design.setProfilePhotoEnabled}
          theme={facade.design.theme}
          onSelectTheme={facade.design.setTheme}
          parsedCv={facade.meta.parsedCv}
          companyName={facade.meta.companyName}
          targetRole={facade.meta.targetRole}
          targetJob={facade.meta.targetJob}
          providerSettings={facade.meta.providerSettings}
        />

        {/* Center Canvas: A4 Sheet / Cover Letter */}
        <StepPreviewCanvas
          previewDocType={facade.docType.previewDocType}
          canvasContainerRef={facade.canvas.canvasContainerRef}
          paperRef={facade.canvas.paperRef}
          effectiveCanvasScale={effectiveCanvasScale}
          targetPageWidthPx={facade.canvas.targetPageWidthPx}
          targetPagePx={facade.canvas.targetPagePx}
          sheetHeight={facade.canvas.sheetHeight}
          overflowPercentage={facade.canvas.overflowPercentage}
          isOverflowing={facade.canvas.isOverflowing}
          pageFormat={facade.design.pageFormat}
          parsedCv={facade.meta.parsedCv}
          theme={facade.design.theme}
          palette={facade.design.palette}
          customColor={facade.design.customColor}
          fontFamily={facade.design.fontFamily}
          spacingDensity={facade.design.spacingDensity}
          sidebarWidth={facade.design.sidebarWidth}
          onSidebarWidthChange={facade.design.setSidebarWidth}
          photo={facade.design.photo}
          companyName={facade.meta.companyName}
          targetRole={facade.meta.targetRole}
          onTriggerDirectDownloadPdf={facade.exports.onTriggerDirectDownloadPdf}
          isAuditGapOpen={facade.modals.isAuditGapOpen}
          isHudMinimized={facade.modals.isHudMinimized}
        />

        {/* Right-Side Audit & Gap Drawer */}
        <StepPreviewAuditDrawer facade={facade} />
      </Box>

      {/* Mobile Floating Action Button (FAB) & Bottom Sheet Tools */}
      <StepPreviewMobileControls
        facade={facade}
        isMobile={isMobile}
        isCanvasZoomed={isCanvasZoomed}
        effectiveCanvasScale={effectiveCanvasScale}
        handleResetFitZoom={handleResetFitZoom}
      />

      {/* All Studio Dialogs, Modals & Alerts */}
      <StepPreviewModalsContainer facade={facade} />
    </div>
  );
};
