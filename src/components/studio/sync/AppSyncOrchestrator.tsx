import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { DeviceSyncModal } from './DeviceSyncModal';
import { SnapshotConflictModal } from './SnapshotConflictModal';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { UseDeviceSyncReturn } from '../../../hooks/useDeviceSync';

export interface AppSyncOrchestratorProps {
  sync: UseDeviceSyncReturn;
  isSyncModalOpen: boolean;
  onCloseSyncModal: () => void;
  syncModalInitialTab: 'export' | 'import';
  onScanCamera?: () => Promise<void>;
}

/**
 * AppSyncOrchestrator
 * Encapsulates the multi-device sync modals, conflict review, and back-button registrations.
 */
export const AppSyncOrchestrator: React.FC<AppSyncOrchestratorProps> = ({
  sync,
  isSyncModalOpen,
  onCloseSyncModal,
  syncModalInitialTab,
  onScanCamera,
}) => {
  // Listen for hash-based sync parameters on mount & hashchange (e.g. #sync?id=...#key=...)
  useEffect(() => {
    const handleCheckSync = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#sync')) {
        await sync.handlePullSnapshot(hash);
        // Clear hash so it doesn't re-trigger on subsequent refreshes
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleCheckSync();
    window.addEventListener('hashchange', handleCheckSync);
    return () => window.removeEventListener('hashchange', handleCheckSync);
  }, [sync.handlePullSnapshot]);

  // Register open modals in the Back Button Stack
  useEffect(() => {
    if (isSyncModalOpen) {
      return backButtonRegistry.register({
        id: 'sync-modal',
        priority: 100,
        handler: () => {
          onCloseSyncModal();
          return true;
        },
      });
    }
  }, [isSyncModalOpen, onCloseSyncModal]);

  useEffect(() => {
    if (sync.pendingSnapshot && sync.conflictComparison) {
      return backButtonRegistry.register({
        id: 'snapshot-conflict-modal',
        priority: 110,
        handler: () => {
          sync.handleCancelConflict();
          return true;
        },
      });
    }
  }, [sync.pendingSnapshot, sync.conflictComparison, sync.handleCancelConflict]);

  return (
    <>
      {/* Device Sync Modal (Export / Import) */}
      <DeviceSyncModal
        open={isSyncModalOpen}
        onClose={onCloseSyncModal}
        initialTab={syncModalInitialTab}
        onScanCamera={Capacitor.isNativePlatform() ? onScanCamera : undefined}
        isExporting={sync.isExporting}
        exportUrl={sync.exportUrl}
        exportId={sync.exportId}
        secondsRemaining={sync.secondsRemaining}
        includeApiKeys={sync.includeApiKeys}
        onToggleApiKeys={sync.setIncludeApiKeys}
        onGenerateExport={sync.handleGenerateExport}
        isImporting={sync.isImporting}
        importError={sync.importError}
        onPullSnapshot={(input) => {
          sync.handlePullSnapshot(input);
          onCloseSyncModal();
        }}
      />

      {/* Snapshot Conflict & Safety Review Modal */}
      <SnapshotConflictModal
        open={Boolean(sync.pendingSnapshot && sync.conflictComparison)}
        comparison={sync.conflictComparison}
        onConfirmOverwrite={sync.handleConfirmOverwrite}
        onDownloadSafetyBackup={sync.handleDownloadSafetyBackup}
        onCancel={sync.handleCancelConflict}
      />
    </>
  );
};
