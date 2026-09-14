import React, { useEffect } from 'react';
import { MobileOnboardingWalkthrough } from './MobileOnboardingWalkthrough';
import { useFileUploader } from '../../../hooks/useFileUploader';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { useTranslation } from 'react-i18next';
import { DEMO_MASTER_DATA, DEMO_TARGET_JOB } from '../../../constants/templates';

export interface AppWalkthroughOrchestratorProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSync: () => void;
  onLoadDemo: () => void;
  onImportMasterData: (content: string) => void;
}

export const AppWalkthroughOrchestrator: React.FC<AppWalkthroughOrchestratorProps> = ({
  isOpen,
  onClose,
  onOpenSync,
  onLoadDemo,
  onImportMasterData,
}) => {
  const { t } = useTranslation(['profile']);

  const { fileInputRef, openFileDialog } = useFileUploader({
    onFileLoaded: (content) => {
      onImportMasterData(content);
    },
  });

  // Register in Android hardware back button stack
  useEffect(() => {
    if (isOpen) {
      return backButtonRegistry.register({
        id: 'walkthrough-modal',
        priority: 120,
        handler: () => {
          onClose();
          return true;
        },
      });
    }
  }, [isOpen, onClose]);

  const handleWalkthroughScan = () => {
    onClose();
    setTimeout(() => {
      onOpenSync();
    }, 150);
  };

  const handleWalkthroughImport = () => {
    onClose();
    setTimeout(() => {
      openFileDialog();
    }, 150);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
      />
      <MobileOnboardingWalkthrough
        open={isOpen}
        onClose={onClose}
        onComplete={onClose}
        onScanQr={handleWalkthroughScan}
        onImportPdf={handleWalkthroughImport}
        onLoadDemo={() => {
          onClose();
          onLoadDemo();
        }}
      />
    </>
  );
};
