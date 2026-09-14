import React, { useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import { SynthesisErrorBanner } from '../SynthesisErrorBanner';
import { AiGeneratingOverlay } from '../ai/AiGeneratingOverlay';
import { ManualAiPromptModal } from '../ai/ManualAiPromptModal';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { GlobalNotification } from '../../../types';

export interface AppGlobalOverlaysProps {
  generationError: string | null;
  onClearGenerationError: () => void;
  onOpenSettings: () => void;
  isManualPromptModalOpen: boolean;
  manualPromptTitle?: string;
  manualPromptBundle: string;
  onCloseManualPromptModal: () => void;
  onSubmitManualResponse: (response: string) => void;
  globalNotification: GlobalNotification | null;
  onHideNotification: () => void;
}

export const AppGlobalOverlays: React.FC<AppGlobalOverlaysProps> = ({
  generationError,
  onClearGenerationError,
  onOpenSettings,
  isManualPromptModalOpen,
  manualPromptTitle,
  manualPromptBundle,
  onCloseManualPromptModal,
  onSubmitManualResponse,
  globalNotification,
  onHideNotification,
}) => {
  // Register manual prompt modal in back button stack
  useEffect(() => {
    if (isManualPromptModalOpen) {
      return backButtonRegistry.register({
        id: 'manual-prompt-modal',
        priority: 100,
        handler: () => {
          onCloseManualPromptModal();
          return true;
        },
      });
    }
  }, [isManualPromptModalOpen, onCloseManualPromptModal]);

  return (
    <>
      {/* Synthesis Error Floating Banner */}
      <SynthesisErrorBanner
        error={generationError}
        onDismiss={onClearGenerationError}
        onOpenSettings={() => {
          onClearGenerationError();
          onOpenSettings();
        }}
      />

      {/* Full-Screen Blocking AI Synthesis Screen */}
      <AiGeneratingOverlay />

      {/* Bring-Your-Own-AI (Prompt & Paste) Modal */}
      <ManualAiPromptModal
        open={isManualPromptModalOpen}
        title={manualPromptTitle}
        onClose={onCloseManualPromptModal}
        promptText={manualPromptBundle}
        onSubmitResponse={onSubmitManualResponse}
      />

      {/* Global Toast Notification */}
      {globalNotification && (
        <Snackbar
          open={globalNotification.open}
          autoHideDuration={6000}
          onClose={onHideNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: { xs: '72px', sm: '80px' } }}
        >
          <Alert
            severity={globalNotification.severity || 'success'}
            variant="filled"
            onClose={onHideNotification}
            action={
              globalNotification.actionLabel ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    globalNotification.onAction?.();
                    onHideNotification();
                  }}
                  sx={{ fontWeight: 700, textTransform: 'none', ml: 1 }}
                >
                  {globalNotification.actionLabel}
                </Button>
              ) : undefined
            }
            sx={{ fontWeight: 600, alignItems: 'center' }}
          >
            {globalNotification.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};
