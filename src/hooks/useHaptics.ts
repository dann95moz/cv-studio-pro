import { useCallback } from 'react';
import { hapticsService } from '../core/haptics';

/**
 * Universal Mobile Haptics Hook.
 * Exposes memoized tactile actions for UI triggers (template picks, theme changes, synthesis finish).
 */
export function useHaptics() {
  const triggerLight = useCallback(() => {
    hapticsService.impactLight();
  }, []);

  const triggerMedium = useCallback(() => {
    hapticsService.impactMedium();
  }, []);

  const triggerSuccess = useCallback(() => {
    hapticsService.notificationSuccess();
  }, []);

  const triggerWarning = useCallback(() => {
    hapticsService.notificationWarning();
  }, []);

  return {
    triggerLight,
    triggerMedium,
    triggerSuccess,
    triggerWarning,
  };
}
