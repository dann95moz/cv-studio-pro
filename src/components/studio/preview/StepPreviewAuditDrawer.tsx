import React from 'react';
import { Box } from '@mui/material';
import { StepPreviewFacade } from '../../../hooks/facades/useStepPreviewFacade';

const PreviewAuditGapDrawer = React.lazy(() =>
  import('./PreviewAuditGapDrawer').then((m) => ({ default: m.PreviewAuditGapDrawer }))
);

export interface StepPreviewAuditDrawerProps {
  facade: StepPreviewFacade;
}

/**
 * StepPreviewAuditDrawer
 * Encapsulates the right-side collapsible Audit & Gap Analysis drawer.
 */
export const StepPreviewAuditDrawer: React.FC<StepPreviewAuditDrawerProps> = React.memo(({ facade }) => {
  const isOpen = facade.modals.isAuditGapOpen;

  return (
    <Box
      sx={{
        order: 3,
        display: { xs: isOpen ? 'block' : 'none', md: 'flex' },
        width: isOpen ? { xs: '100%', sm: 380, md: 380 } : 0,
        height: { xs: 'auto', md: '100%' },
        position: isOpen ? 'relative' : 'static',
        flexShrink: 0,
      }}
    >
      <React.Suspense fallback={null}>
        {isOpen && (
          <PreviewAuditGapDrawer
            isOpen={isOpen}
            onClose={() => facade.modals.setIsAuditGapOpen(false)}
            activeTab={facade.modals.auditGapTab}
            onToggleTab={facade.modals.setAuditGapTab}
            auditReport={facade.meta.auditReport}
            gapInfo={facade.meta.gapInfo}
            gapMarkdown={facade.meta.gapMarkdown}
            companyName={facade.meta.companyName}
            targetRole={facade.meta.targetRole}
            cvData={facade.meta.parsedCv}
            onOpenFullAudit={facade.modals.handleOpenFullAudit}
            isHudMinimized={facade.modals.isHudMinimized}
            onToggleHudMinimized={facade.modals.setIsHudMinimized}
          />
        )}
      </React.Suspense>
    </Box>
  );
});

StepPreviewAuditDrawer.displayName = 'StepPreviewAuditDrawer';
