import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResumeStore } from '../store';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const RESUME_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes window

/**
 * Hook to detect if a previous AI synthesis was interrupted when the app went to background
 * (e.g. OS memory pressure or process pause), and seamlessly resume it upon returning to foreground.
 */
export const useForegroundResume = () => {
  const { t } = useTranslation(['common']);
  const showNotification = useResumeStore((s) => s.showNotification);
  const handleGenerate = useResumeStore((s) => s.handleGenerate);
  const isResumingRef = useRef(false);

  useEffect(() => {
    const checkAndResume = () => {
      if (typeof window === 'undefined' || isResumingRef.current) return;
      try {
        const raw = window.sessionStorage?.getItem('cv_studio_pending_synthesis');
        if (!raw) return;

        const parsed = JSON.parse(raw);
        const elapsed = Date.now() - (parsed.timestamp || 0);

        // If stale (> 5 min), discard snapshot
        if (elapsed > RESUME_EXPIRY_MS) {
          window.sessionStorage?.removeItem('cv_studio_pending_synthesis');
          return;
        }

        // If synthesis is not currently active, auto-resume
        const state = useResumeStore.getState();
        if (!state.isGenerating) {
          isResumingRef.current = true;
          window.sessionStorage?.removeItem('cv_studio_pending_synthesis');
          showNotification({
            message: t('common:status.resumingSynthesis', 'Resuming CV synthesis...'),
            severity: 'info',
          });
          handleGenerate().finally(() => {
            isResumingRef.current = false;
          });
        }
      } catch {
        // Non-critical session parsing error
      }
    };

    // 1. Initial check on mount
    checkAndResume();

    // 2. Web visibilitychange event
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Native Capacitor App state change (returning from background / other app)
    let appStateHandle: { remove: () => void } | null = null;
    if (Capacitor.isNativePlatform()) {
      try {
        const res = App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            checkAndResume();
          }
        }) as unknown;

        if (res && typeof (res as Promise<{ remove: () => void }>).then === 'function') {
          (res as Promise<{ remove: () => void }>).then((handle) => {
            if (handle && typeof handle.remove === 'function') {
              appStateHandle = handle;
            }
          }).catch(() => {});
        } else if (res && typeof (res as { remove: () => void }).remove === 'function') {
          appStateHandle = res as { remove: () => void };
        }
      } catch {
        // Ignored
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appStateHandle && typeof appStateHandle.remove === 'function') {
        appStateHandle.remove();
      }
    };
  }, [handleGenerate, showNotification, t]);
};
