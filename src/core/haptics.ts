import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Universal Mobile Haptics Service for CV Studio Pro.
 * Provides subtle, tactile feedback on physical devices with silent fallbacks on desktop.
 */
export const hapticsService = {
  async impactLight(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Silent catch on unsupported environments
    }
  },

  async impactMedium(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch {
      // Silent catch
    }
  },

  async notificationSuccess(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 60, 20]);
      }
    } catch {
      // Silent catch
    }
  },

  async notificationWarning(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 40, 30]);
      }
    } catch {
      // Silent catch
    }
  },
};
