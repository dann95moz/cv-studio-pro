import React from 'react';
import { Box } from '@mui/material';
import { StepPreviewToolbar } from './StepPreviewToolbar';
import { StepPreviewFacade } from '../../../hooks/facades/useStepPreviewFacade';

export interface StepPreviewDesktopToolbarProps {
  facade: StepPreviewFacade;
}

/**
 * StepPreviewDesktopToolbar
 * Responsive container for the desktop preview toolbar.
 * Binds domain slices from StepPreviewFacade to StepPreviewToolbar.
 */
export const StepPreviewDesktopToolbar: React.FC<StepPreviewDesktopToolbarProps> = React.memo(({ facade }) => {
  return (
    <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
      <StepPreviewToolbar
        onSelectWizardStep={facade.meta.setWizardStep}
        previewDocType={facade.docType.previewDocType}
        onPreviewDocTypeChange={facade.docType.setPreviewDocType}
        activeTemplateName={facade.meta.activeTemplateMeta.name}
        onOpenTemplates={() => {
          facade.modals.setActiveSidePanel('design');
          facade.modals.setIsAuditGapOpen(false);
        }}
        onSaveVersion={facade.modals.handleSaveToHistory}
        savedSuccess={facade.modals.savedSuccess}
        isSavingVersion={facade.modals.isSavingVersion}
        onReTailor={facade.meta.handleGenerate}
        isGenerating={facade.meta.isGenerating}
        onDownloadPdf={facade.exports.onTriggerDirectDownloadPdf}
        onDownloadMarkdown={facade.exports.handleDownloadCvMarkdown}
        onDownloadPlainText={facade.exports.onTriggerDownloadPlainText}
        onDownloadDocx={facade.exports.onTriggerDownloadDocx}
        onCopyPlainText={facade.exports.onTriggerCopyPlainText}
        isExportingPdf={facade.exports.isExportingPdf}
        pageFormat={facade.design.pageFormat}
        onPageFormatChange={facade.design.setPageFormat}
        isOverflowing={facade.canvas.isOverflowing}
        onAutoFit={facade.canvas.handleMagicAutoFit}
        onTrackApplication={facade.modals.handleTrackApplication}
        isTracked={facade.modals.isTracked}
        activeLanguage={facade.translation.activeLanguage}
        baseLanguage={facade.translation.currentBaseLanguage}
        translations={facade.translation.translations}
        onLanguageChange={facade.translation.setActiveLanguage}
        onOpenTranslateModal={facade.translation.handleOpenTranslateModal}
        isLanguageOutdated={facade.translation.isLanguageOutdated}
        outdatedSectionsCount={facade.translation.outdatedSectionsCount}
        onQuickSyncOutdated={facade.translation.handleQuickSyncOutdated}
        isTranslating={facade.translation.isTranslating}
        savedVersions={facade.versions.savedVersions}
        activeVersionId={facade.versions.activeVersionId}
        companyName={facade.meta.companyName}
        targetRole={facade.meta.targetRole}
        matchScore={
          facade.meta.gapInfo.matchScore ||
          (facade.meta.auditReport.overallScore ? Math.round(facade.meta.auditReport.overallScore * 10) : 0)
        }
        onSelectVersion={facade.versions.handleLoadVersion}
        onPinAsGeneric={facade.versions.handlePinAsGeneric}
        onUnpinGeneric={facade.versions.handleUnpinGeneric}
        onSaveAsGeneric={facade.versions.handleSaveAsGeneric}
        onCompareAgainstGeneric={facade.modals.handleCompareAgainstGeneric}
        onOpenAdaptModal={facade.modals.handleOpenAdaptModal}
      />
    </Box>
  );
});

StepPreviewDesktopToolbar.displayName = 'StepPreviewDesktopToolbar';
