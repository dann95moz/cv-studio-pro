import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResumeStore } from '../store';
import { backButtonRegistry } from '../core/backButtonRegistry';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Universal Android Hardware & Gesture Back Button Hook.
 * Connects the Android system back button (via Capacitor App plugin or popstate)
 * to the LIFO priority-based `backButtonRegistry`, ensuring modals, sheets,
 * and wizard steps close gracefully in order before exiting the app.
 */
export function useAndroidBackHandler(): void {
  const { t } = useTranslation('common');
  const activeTab = useResumeStore((s) => s.activeTab);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);
  const wizardStep = useResumeStore((s) => s.wizardStep);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);
  const showNotification = useResumeStore((s) => s.showNotification);

  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    const handleSystemBack = () => {
      // 1. Check if any modal, drawer, or bottom sheet registered in the registry intercepts the back action
      const handled = backButtonRegistry.dispatch();
      if (handled) {
        return;
      }

      // 2. Wizard & Tab Navigation Fallback
      if (activeTab !== 'wizard') {
        setActiveTab('wizard');
        return;
      }

      if (wizardStep === 'preview') {
        setWizardStep('target');
        return;
      }

      if (wizardStep === 'target') {
        setWizardStep('profile');
        return;
      }

      // 3. Root Level Exit Guard (Double tap to exit within 2000ms)
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        if (Capacitor.isNativePlatform()) {
          App.exitApp();
        }
      } else {
        lastBackPressRef.current = now;
        showNotification({
          message: t('common:nav.pressBackAgainToExit', 'Press back again to exit'),
          severity: 'info',
        });
      }
    };

    // Safely bind to Capacitor App backButton event
    let capacitorRemoveListener: (() => void) | undefined;

    if (Capacitor.isNativePlatform()) {
      try {
        const res = App.addListener('backButton', () => {
          handleSystemBack();
        }) as unknown;

        if (res && typeof (res as Promise<{ remove: () => void }>).then === 'function') {
          (res as Promise<{ remove: () => void }>).then((handle) => {
            if (handle && typeof handle.remove === 'function') {
              capacitorRemoveListener = () => handle.remove();
            }
          }).catch((err) => {
            console.debug('[useAndroidBackHandler] Capacitor App listener error:', err);
          });
        } else if (res && typeof (res as { remove: () => void }).remove === 'function') {
          capacitorRemoveListener = () => (res as { remove: () => void }).remove();
        }
      } catch (err) {
        console.debug('[useAndroidBackHandler] Capacitor App listener unavailable:', err);
      }
    }

    // Web popstate fallback: push a state so the browser back button triggers our handler
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleSystemBack();
      // Keep state in history so back gestures continue to be intercepted
      window.history.pushState({ cvStudioNavigation: true }, '', window.location.href);
    };

    window.history.pushState({ cvStudioNavigation: true }, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      capacitorRemoveListener?.();
    };
  }, [activeTab, wizardStep, setActiveTab, setWizardStep, showNotification, t]);
}
