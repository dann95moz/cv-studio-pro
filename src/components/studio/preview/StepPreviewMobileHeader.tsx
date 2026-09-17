import React from 'react';
import { Box } from '@mui/material';
import { MobileDocumentBar, MobileDiagnosticBar } from '../mobile';
import { StepPreviewFacade } from '../../../hooks/facades/useStepPreviewFacade';

export interface StepPreviewMobileHeaderProps {
  facade: StepPreviewFacade;
}

/**
 * StepPreviewMobileHeader
 * Renders the mobile secondary document bar (CV vs Cover letter, language switcher)
 * and tertiary diagnostic bar (ATS scores, audit trigger).
 */
export const StepPreviewMobileHeader: React.FC<StepPreviewMobileHeaderProps> = React.memo(({ facade }) => {
  return (
    <>
      {/* Mobile Secondary Document Bar: Document Switcher & Language Selector */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, flexShrink: 0 }}>
        <MobileDocumentBar
          previewDocType={facade.docType.previewDocType}
          onPreviewDocTypeChange={facade.docType.setPreviewDocType}
          activeLanguage={facade.translation.activeLanguage}
          baseLanguage={facade.translation.currentBaseLanguage}
          translations={facade.translation.translations}
          onLanguageChange={facade.translation.setActiveLanguage}
          onOpenTranslateModal={facade.translation.handleOpenTranslateModal}
          isLanguageOutdated={facade.translation.isLanguageOutdated}
        />
      </Box>

      {/* Mobile Tertiary Diagnostic Bar */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, flexShrink: 0 }}>
        <MobileDiagnosticBar
          auditScore={facade.meta.auditReport?.overallScore ?? 0}
          matchScore={facade.meta.gapInfo?.matchScore ?? 0}
          onSelectTab={(tab) => {
            facade.modals.setIsAuditGapOpen(true);
            facade.modals.setAuditGapTab(tab);
            facade.modals.setActiveSidePanel(null);
          }}
        />
      </Box>
    </>
  );
});

StepPreviewMobileHeader.displayName = 'StepPreviewMobileHeader';
