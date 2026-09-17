import React, { useState, useEffect } from 'react';
import { MobileStudioFab, MobileToolsBottomSheet } from '../mobile';
import { CanvasZoomFloatingCapsule } from './CanvasZoomFloatingCapsule';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { StepPreviewFacade } from '../../../hooks/facades/useStepPreviewFacade';

export interface StepPreviewMobileControlsProps {
  facade: StepPreviewFacade;
  isMobile: boolean;
  isCanvasZoomed: boolean;
  effectiveCanvasScale: number;
  handleResetFitZoom: () => void;
}

/**
 * StepPreviewMobileControls
 * Renders thumb-zone mobile overlays:
 * - Floating Action Button (FAB)
 * - Tools Bottom Sheet (Design, Templates, LinkedIn, Compare)
 * - Canvas Zoom Floating Capsule
 */
export const StepPreviewMobileControls: React.FC<StepPreviewMobileControlsProps> = React.memo(({
  facade,
  isMobile,
  isCanvasZoomed,
  effectiveCanvasScale,
  handleResetFitZoom,
}) => {
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  // Register mobile tools bottom sheet in back button stack
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

  return (
    <>
      {/* Mobile Floating Action Button (FAB) Trigger */}
      <MobileStudioFab onClick={() => setIsMobileToolsOpen(true)} />

      {/* Mobile Tools Bottom Sheet */}
      <MobileToolsBottomSheet
        open={isMobileToolsOpen}
        onClose={() => setIsMobileToolsOpen(false)}
        onSelectTool={(panel) => {
          facade.modals.setActiveSidePanel(panel);
          facade.modals.setIsAuditGapOpen(false);
        }}
        onOpenDiff={facade.modals.handleCompareAgainstGeneric}
        onOpenAuditGap={(tab) => {
          facade.modals.setIsAuditGapOpen(true);
          if (tab) facade.modals.setAuditGapTab(tab);
          facade.modals.setActiveSidePanel(null);
        }}
        onDownloadPdf={facade.exports.onTriggerDirectDownloadPdf}
        onSharePdf={facade.exports.onTriggerSharePdf}
        onDownloadMarkdown={facade.exports.handleDownloadCvMarkdown}
        onDownloadPlainText={facade.exports.onTriggerDownloadPlainText}
        onDownloadDocx={facade.exports.onTriggerDownloadDocx}
        onCopyPlainText={facade.exports.onTriggerCopyPlainText}
        onSaveVersion={facade.modals.handleSaveToHistory}
        onReTailor={facade.meta.handleGenerate}
        onOpenAdaptModal={facade.modals.handleOpenAdaptModal}
        isExportingPdf={facade.exports.isExportingPdf}
        isSavingVersion={facade.modals.isSavingVersion}
      />

      {/* Mobile Floating Zoom Capsule */}
      <CanvasZoomFloatingCapsule
        scale={effectiveCanvasScale}
        isZoomed={isMobile && isCanvasZoomed}
        onResetFit={handleResetFitZoom}
      />
    </>
  );
});

StepPreviewMobileControls.displayName = 'StepPreviewMobileControls';
