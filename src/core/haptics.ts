import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { platformService } from './platform';

/**
 * Universal Mobile Haptics Service for CV Studio Pro.
 * Provides subtle, tactile feedback on physical mobile/native devices with strict silence on desktop web.
 */
export const hapticsService = {
  async impactLight(): Promise<void> {
    if (platformService.isDesktopWeb()) return;
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
    if (platformService.isDesktopWeb()) return;
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
    if (platformService.isDesktopWeb()) return;
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
    if (platformService.isDesktopWeb()) return;
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
