import { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { extractCandidateName } from '../core/parser';
import { DEFAULT_RULES } from '../core/ai-service';
import {
  WorkspaceSnapshotPayload,
  WorkspaceSnapshotMetadata,
  ConflictComparison,
  ConflictSeverity,
} from '../types/sync';
import {
  generateAesKey,
  exportKeyToBase64Url,
  importKeyFromBase64Url,
  encryptPayload,
  decryptPayload,
} from '../services/cryptoService';
import {
  generateSyncId,
  pushSnapshotToRelay,
  pullSnapshotFromRelay,
} from '../services/relayService';
import { downloadTextFile, buildTimestampedFileName } from '../utils/fileUtils';

export function formatRelativeTimeDifference(diffMs: number): string {
  const absDiff = Math.abs(diffMs);
  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ${days === 1 ? 'día' : 'días'}`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  return 'pocos segundos';
}

export const useDeviceSync = () => {
  const storeState = useResumeStore();
  const restoreFullSnapshot = useResumeStore((s) => s.restoreFullSnapshot);
  const showNotification = useResumeStore((s) => s.showNotification);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [exportKey, setExportKey] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [includeApiKeys, setIncludeApiKeys] = useState(false);

  // Import / Conflict State
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingSnapshot, setPendingSnapshot] = useState<WorkspaceSnapshotPayload | null>(null);
  const [conflictComparison, setConflictComparison] = useState<ConflictComparison | null>(null);

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear countdown timer when unmounting
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  /**
   * Generates a complete snapshot of current Zustand state, compresses and encrypts it,
   * then pushes it to Upstash Redis with 5-minute TTL.
   */
  const handleGenerateExport = useCallback(
    async (withApiKeys = false) => {
      setIsExporting(true);
      setImportError(null);

      try {
        const state = useResumeStore.getState();
        const candidateName = extractCandidateName(state.masterData, 'Candidate');
        const syncId = generateSyncId();
        const aesKey = await generateAesKey();
        const keyBase64Url = await exportKeyToBase64Url(aesKey);

        const localLastModified =
          state.lastModifiedTimestamp ||
          Math.max(
            state.lastBackupTimestamp || 0,
            ...state.savedVersions.map((v) => Date.parse(v.createdAt) || 0),
            Date.now()
          );

        const metadata: WorkspaceSnapshotMetadata = {
          version: 1,
          createdAt: Date.now(),
          lastModifiedAt: localLastModified,
          deviceLabel: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'PC / Escritorio',
          candidateName,
          stats: {
            versionsCount: state.savedVersions.length,
            applicationsCount: state.applications.length,
            hasTargetJob: Boolean(state.targetJob && state.targetJob.trim().length > 10),
            masterDataLength: state.masterData.length,
          },
        };

        const exportData = {
          masterData: state.masterData,
          targetJob: state.targetJob,
          cvMarkdown: state.cvMarkdown,
          gapMarkdown: state.gapMarkdown,
          coverLetterMarkdown: state.coverLetterMarkdown,
          rules: state.rules && state.rules !== DEFAULT_RULES ? state.rules : undefined,
          companyName: state.companyName,
          targetRole: state.targetRole,
          currentBaseLanguage: state.currentBaseLanguage,
          activeLanguage: state.activeLanguage,
          activeVersionId: state.activeVersionId,
          savedVersions: state.savedVersions,
          applications: state.applications,
          kanbanColumns: state.kanbanColumns,
          translations: state.translations,
          theme: state.theme,
          palette: state.palette,
          customColor: state.customColor,
          fontFamily: state.fontFamily,
          spacingDensity: state.spacingDensity,
          pageBudget: state.pageBudget,
          pageFormat: state.pageFormat,
          photo: state.photo,
          lastModifiedTimestamp: localLastModified,
          ...(withApiKeys ? { providerSettings: state.providerSettings } : {}),
        };

        const payload: WorkspaceSnapshotPayload = {
          metadata,
          data: exportData,
        };

        const serialized = JSON.stringify(payload);
        const ciphertext = await encryptPayload(serialized, aesKey);

        // Upload to serverless relay
        const relayRes = await pushSnapshotToRelay(syncId, ciphertext);

        // Build URL: if relay returned lanHost and we are on localhost, use lanHost so mobile on LAN can connect!
        let baseOrigin = window.location.origin;
        if (
          relayRes.lanHost &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '')
        ) {
          baseOrigin = relayRes.lanHost;
        }
        const baseUrl = baseOrigin + window.location.pathname;

        // If ciphertext is compact (<= 1800 chars), we ALSO include direct payload 'd='
        // allowing 0-network instantaneous decryption right from the QR code!
        let magicUrl = `${baseUrl}#sync?id=${encodeURIComponent(syncId)}&key=${keyBase64Url}`;
        if (ciphertext.length <= 1800) {
          magicUrl += `&d=${encodeURIComponent(ciphertext)}`;
        }

        setExportId(syncId);
        setExportKey(keyBase64Url);
        setExportUrl(magicUrl);
        setSecondsRemaining(300);

        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              setExportUrl(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: unknown) {
        console.error('Failed to generate export snapshot:', err);
        setImportError(err instanceof Error ? err.message : 'Error al generar snapshot');
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Pulls an encrypted snapshot from direct payload or relay, decrypts it,
   * and either auto-applies (if local is clean) or prepares the conflict comparison.
   */
  const handlePullSnapshot = useCallback(
    async (
      idOrUrl: string,
      explicitKey?: string
    ): Promise<{ success: boolean; autoApplied?: boolean; error?: string }> => {
      setIsImporting(true);
      setImportError(null);

      try {
        let syncId = '';
        let keyBase64Url = explicitKey?.trim() || '';
        let serverOrigin: string | undefined = undefined;
        let directCiphertext: string | undefined = undefined;

        const trimmed = idOrUrl.trim();

        // 1. Extract parameters from URL, hash, or plain code
        if (
          trimmed.includes('#sync') ||
          trimmed.includes('sync?') ||
          trimmed.includes('?id=') ||
          trimmed.includes('&id=') ||
          trimmed.startsWith('http')
        ) {
          try {
            const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://dummy.com/${trimmed}`);
            if (trimmed.startsWith('http') && !trimmed.includes('dummy.com')) {
              serverOrigin = urlObj.origin;
            }

            const hash = urlObj.hash || '';
            const queryInHash = hash.includes('?')
              ? hash.slice(hash.indexOf('?') + 1)
              : hash.replace(/^#sync\??/, '').replace(/^#/, '');
            const hashParams = new URLSearchParams(queryInHash);
            const searchParams = urlObj.searchParams;

            syncId = hashParams.get('id') || searchParams.get('id') || '';
            keyBase64Url = keyBase64Url || hashParams.get('key') || searchParams.get('key') || '';
            directCiphertext = hashParams.get('d') || searchParams.get('d') || undefined;

            // Fallback regex if URLSearchParams missed delimiters (e.g. multiple #)
            if (!syncId) {
              const idMatch = (hash + urlObj.search).match(/[?&#]id=([A-Za-z0-9_-]+)/);
              if (idMatch) syncId = idMatch[1];
            }
            if (!keyBase64Url) {
              const keyMatch = (hash + urlObj.search).match(/[?&#]key=([A-Za-z0-9_-]+)/);
              if (keyMatch) keyBase64Url = keyMatch[1];
            }
            if (!directCiphertext) {
              const dMatch = (hash + urlObj.search).match(/[?&#]d=([A-Za-z0-9_-]+)/);
              if (dMatch) directCiphertext = dMatch[1];
            }
          } catch (urlErr) {
            console.warn('[useDeviceSync] Failed URL parsing, fallback to regex:', urlErr);
            const idMatch = trimmed.match(/[?&#]id=([A-Za-z0-9_-]+)/);
            const keyMatch = trimmed.match(/[?&#]key=([A-Za-z0-9_-]+)/);
            const dMatch = trimmed.match(/[?&#]d=([A-Za-z0-9_-]+)/);
            if (idMatch) syncId = idMatch[1];
            if (keyMatch) keyBase64Url = keyMatch[1];
            if (dMatch) directCiphertext = dMatch[1];
          }
        } else {
          syncId = trimmed;
        }

        if (!syncId && !directCiphertext) {
          throw new Error('Código de sincronización o URL no válido');
        }

        if (!keyBase64Url) {
          throw new Error('Falta la clave de descifrado E2EE');
        }

        // 2. Obtain ciphertext: either from direct payload in QR (0-network) or from relay
        let ciphertext = directCiphertext;
        if (!ciphertext) {
          if (!syncId) {
            throw new Error('Código de sincronización no encontrado');
          }
          ciphertext = await pullSnapshotFromRelay(syncId, serverOrigin);
        }

        // 3. Decrypt and decompress
        const aesKey = await importKeyFromBase64Url(keyBase64Url);
        const decryptedJson = await decryptPayload(ciphertext, aesKey);
        const snapshot: WorkspaceSnapshotPayload = JSON.parse(decryptedJson);

        if (!snapshot || !snapshot.metadata || !snapshot.data) {
          throw new Error('El formato del snapshot recibido no es válido');
        }

        // 4. Compare timestamps and calculate conflict
        const local = useResumeStore.getState();
        const localModified =
          local.lastModifiedTimestamp ||
          Math.max(
            local.lastBackupTimestamp || 0,
            ...local.savedVersions.map((v) => Date.parse(v.createdAt) || 0),
            0
          );
        const remoteModified = snapshot.metadata.lastModifiedAt || snapshot.metadata.createdAt;
        const diffMs = localModified - remoteModified;
        const isLocalSignificantlyNewer = diffMs > 60 * 1000; // local is newer by at least 1 minute

        let severity: ConflictSeverity = 'newer_remote';
        const isLocalBlank =
          (!local.masterData || local.masterData.trim().length < 20) && local.savedVersions.length === 0;

        if (isLocalBlank) {
          severity = 'clean';
        } else if (isLocalSignificantlyNewer) {
          severity = 'local_newer_conflict';
        } else {
          severity = 'newer_remote';
        }

        const comparison: ConflictComparison = {
          severity,
          localLastModified: localModified,
          remoteLastModified: remoteModified,
          timeDiffFormatted: formatRelativeTimeDifference(diffMs),
          isLocalSignificantlyNewer,
          localStats: {
            versionsCount: local.savedVersions.length,
            applicationsCount: local.applications.length,
            masterDataLength: local.masterData.length,
          },
          remoteStats: {
            versionsCount: snapshot.metadata.stats.versionsCount,
            applicationsCount: snapshot.metadata.stats.applicationsCount,
            masterDataLength: snapshot.metadata.stats.masterDataLength,
          },
        };

        // 5. If local workspace is clean, auto-apply immediately!
        if (severity === 'clean') {
          const safetyBackup = JSON.stringify({
            masterData: local.masterData,
            targetJob: local.targetJob,
            cvMarkdown: local.cvMarkdown,
            activeCvData: local.activeCvData,
            savedVersions: local.savedVersions,
            applications: local.applications,
            kanbanColumns: local.kanbanColumns,
            theme: local.theme,
            lastBackupTimestamp: local.lastBackupTimestamp,
          });
          try {
            localStorage.setItem('cv_pre_sync_safety_backup', safetyBackup);
          } catch (e) {
            console.warn('[useDeviceSync] Failed to store local safety backup:', e);
          }

          restoreFullSnapshot(snapshot.data);

          showNotification({
            message: '¡Espacio de trabajo importado con éxito desde tu PC!',
            severity: 'success',
            actionLabel: 'Deshacer',
            onAction: () => {
              try {
                const rawBackup = localStorage.getItem('cv_pre_sync_safety_backup');
                if (rawBackup) {
                  const parsed = JSON.parse(rawBackup);
                  restoreFullSnapshot(parsed);
                  showNotification({
                    message: 'Se ha restaurado tu espacio de trabajo previo.',
                    severity: 'info',
                  });
                }
              } catch (e) {
                console.error('Failed to undo sync:', e);
              }
            },
          });

          setPendingSnapshot(null);
          setConflictComparison(null);
          return { success: true, autoApplied: true };
        }

        // Local workspace has data -> show conflict resolution modal
        setPendingSnapshot(snapshot);
        setConflictComparison(comparison);
        return { success: true, autoApplied: false };
      } catch (err: unknown) {
        console.error('Failed to pull or decrypt snapshot:', err);
        const errMsg =
          err instanceof Error && err.message === 'NOT_FOUND_OR_EXPIRED'
            ? 'El código ha expirado o ya fue consumido por otro dispositivo.'
            : err instanceof Error
              ? err.message
              : 'Error al descargar o descifrar snapshot';

        setImportError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setIsImporting(false);
      }
    },
    [restoreFullSnapshot, showNotification]
  );

  /**
   * Confirms overwriting workspace:
   * 1. Saves safety backup in localStorage
   * 2. Overwrites Zustand store
   * 3. Shows toast with undo option
   */
  const handleConfirmOverwrite = useCallback(() => {
    if (!pendingSnapshot) return;

    try {
      const current = useResumeStore.getState();
      const safetyBackup = JSON.stringify({
        masterData: current.masterData,
        targetJob: current.targetJob,
        cvMarkdown: current.cvMarkdown,
        activeCvData: current.activeCvData,
        savedVersions: current.savedVersions,
        applications: current.applications,
        kanbanColumns: current.kanbanColumns,
        theme: current.theme,
        lastBackupTimestamp: current.lastBackupTimestamp,
      });
      localStorage.setItem('cv_pre_sync_safety_backup', safetyBackup);

      // Restore full snapshot
      restoreFullSnapshot(pendingSnapshot.data);

      showNotification({
        message: '¡Espacio de trabajo sincronizado con éxito!',
        severity: 'success',
        actionLabel: 'Deshacer',
        onAction: () => {
          try {
            const rawBackup = localStorage.getItem('cv_pre_sync_safety_backup');
            if (rawBackup) {
              const parsed = JSON.parse(rawBackup);
              restoreFullSnapshot(parsed);
              showNotification({
                message: 'Se ha restaurado tu espacio de trabajo previo.',
                severity: 'info',
              });
            }
          } catch (e) {
            console.error('Failed to undo sync:', e);
          }
        },
      });

      setPendingSnapshot(null);
      setConflictComparison(null);
    } catch (err: unknown) {
      console.error('Failed to confirm overwrite:', err);
      setImportError(err instanceof Error ? err.message : 'Error al restaurar snapshot');
    }
  }, [pendingSnapshot, restoreFullSnapshot, showNotification]);

  /**
   * Downloads a quick .json safety backup of current local data before overwriting
   */
  const handleDownloadSafetyBackup = useCallback(() => {
    const current = useResumeStore.getState();
    const candidateName = extractCandidateName(current.masterData, 'Candidate');
    const baseName = `CV_PreSyncBackup_${candidateName.replace(/\s+/g, '_')}`;
    const fileName = buildTimestampedFileName(baseName, 'json');
    const backupContent = JSON.stringify(
      {
        masterData: current.masterData,
        targetJob: current.targetJob,
        savedVersions: current.savedVersions,
        applications: current.applications,
        kanbanColumns: current.kanbanColumns,
        theme: current.theme,
      },
      null,
      2
    );

    downloadTextFile(backupContent, fileName);
  }, []);

  const handleCancelConflict = useCallback(() => {
    setPendingSnapshot(null);
    setConflictComparison(null);
    setImportError(null);
  }, []);

  return {
    isExporting,
    exportUrl,
    exportId,
    exportKey,
    secondsRemaining,
    includeApiKeys,
    setIncludeApiKeys,
    handleGenerateExport,
    isImporting,
    importError,
    setImportError,
    pendingSnapshot,
    conflictComparison,
    handlePullSnapshot,
    handleConfirmOverwrite,
    handleDownloadSafetyBackup,
    handleCancelConflict,
  };
};
