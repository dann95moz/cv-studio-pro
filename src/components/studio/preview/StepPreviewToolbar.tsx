import React from 'react';
import { Paper, Box, Divider, useTheme } from '@mui/material';
import { VersionSelectorDropdown } from './VersionSelectorDropdown';
import { StepPreviewToolbarProps } from '../../../types';
import { PreviewBreadcrumbNav } from './toolbar/PreviewBreadcrumbNav';
import { PreviewLanguageSelector } from './toolbar/PreviewLanguageSelector';
import { PreviewToolbarActions } from './toolbar/PreviewToolbarActions';
import { PreviewExportActions } from './toolbar/PreviewExportActions';

export type { StepPreviewToolbarProps };

/**
 * StepPreviewToolbar
 * Clean, decoupled container assembling preview toolbar actions across:
 * - Breadcrumb navigation & Document switcher (PreviewBreadcrumbNav)
 * - Version dropdown (VersionSelectorDropdown)
 * - Language selection & AI translation sync (PreviewLanguageSelector)
 * - Micro actions: Auto-fit, Compare, Track (PreviewToolbarActions)
 * - Primary Export, PDF generation & Save version (PreviewExportActions)
 */
export const StepPreviewToolbar: React.FC<StepPreviewToolbarProps> = ({
  onSelectWizardStep,
  previewDocType = 'cv',
  onPreviewDocTypeChange,
  activeTemplateName,
  onOpenTemplates,
  onSaveVersion,
  savedSuccess = false,
  isSavingVersion = false,
  onReTailor,
  isGenerating = false,
  onDownloadPdf,
  onDownloadMarkdown,
  onDownloadPlainText,
  onDownloadDocx,
  onCopyPlainText,
  isExportingPdf = false,
  pageFormat = 'a4',
  onPageFormatChange,
  isOverflowing = false,
  onAutoFit,
  onTrackApplication,
  isTracked = false,
  activeLanguage = 'es',
  baseLanguage = 'es',
  translations = {},
  onLanguageChange,
  onOpenTranslateModal,
  isLanguageOutdated = false,
  outdatedSectionsCount = 0,
  onQuickSyncOutdated,
  isTranslating = false,
  savedVersions = [],
  activeVersionId = null,
  companyName,
  targetRole,
  matchScore = 0,
  onSelectVersion,
  onPinAsGeneric,
  onUnpinGeneric,
  onSaveAsGeneric,
  onCompareAgainstGeneric,
  onOpenAdaptModal,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      className="no-print preview-top-toolbar"
      sx={{
        py: 1,
        px: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        gap: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: 20,
      }}
    >
      {/* Left: Wizard Breadcrumb Dropdown, Version Dropdown & Document Switcher */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <PreviewBreadcrumbNav
          onSelectWizardStep={onSelectWizardStep}
          previewDocType={previewDocType}
          onPreviewDocTypeChange={onPreviewDocTypeChange}
        />

        {/* CV Saved Versions & Generic Selector Dropdown */}
        {onSelectVersion && onPinAsGeneric && onSaveAsGeneric && onCompareAgainstGeneric && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
            <VersionSelectorDropdown
              savedVersions={savedVersions}
              activeVersionId={activeVersionId}
              currentCompanyName={companyName}
              currentTargetRole={targetRole}
              currentMatchScore={matchScore}
              onSelectVersion={onSelectVersion}
              onPinAsGeneric={onPinAsGeneric}
              onUnpinGeneric={onUnpinGeneric}
              onSaveAsGeneric={onSaveAsGeneric}
              onCompareAgainstGeneric={onCompareAgainstGeneric}
              onOpenAdaptModal={onOpenAdaptModal}
            />
          </>
        )}

        {/* Language Selector */}
        {previewDocType === 'cv' && onLanguageChange && (
          <PreviewLanguageSelector
            activeLanguage={activeLanguage}
            baseLanguage={baseLanguage}
            translations={translations}
            onLanguageChange={onLanguageChange}
            onOpenTranslateModal={onOpenTranslateModal}
            isLanguageOutdated={isLanguageOutdated}
            outdatedSectionsCount={outdatedSectionsCount}
            onQuickSyncOutdated={onQuickSyncOutdated}
            isTranslating={isTranslating}
          />
        )}

        {/* Central Toolbar Micro-Actions (Compare vs Generic, Auto-Fit, Track App) */}
        <PreviewToolbarActions
          onCompareAgainstGeneric={onCompareAgainstGeneric}
          onAutoFit={onAutoFit}
          isOverflowing={isOverflowing}
          onTrackApplication={onTrackApplication}
          isTracked={isTracked}
        />
      </Box>

      {/* Right: Export & Save Action Group */}
      <PreviewExportActions
        onDownloadPdf={onDownloadPdf}
        isExportingPdf={isExportingPdf}
        onDownloadMarkdown={onDownloadMarkdown}
        onDownloadPlainText={onDownloadPlainText}
        onDownloadDocx={onDownloadDocx}
        onCopyPlainText={onCopyPlainText}
        onSaveVersion={onSaveVersion}
        isSavingVersion={isSavingVersion}
        savedSuccess={savedSuccess}
        onReTailor={onReTailor}
        isGenerating={isGenerating}
        onOpenAdaptModal={onOpenAdaptModal}
      />
    </Paper>
  );
};
