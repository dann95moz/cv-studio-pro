import { Capacitor } from '@capacitor/core';

export type PlatformEnvironment = 'native-app' | 'mobile-web' | 'desktop-web';

/**
 * Centralized Platform Detection Service.
 * Decouples environment heuristics from UI components,
 * ensuring clean separation between Desktop Web, Mobile Web, and Native App (Android/iOS).
 */
export const platformService = {
  /**
   * Returns true when running inside a native Capacitor container (Android / iOS).
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Returns true when running in a desktop browser viewport (width >= 900px, non-native).
   */
  isDesktopWeb(): boolean {
    if (this.isNative()) return false;
    return typeof window !== 'undefined' && window.innerWidth >= 900;
  },

  /**
   * Returns true when running in a mobile browser viewport (width < 900px, non-native).
   */
  isMobileWeb(): boolean {
    if (this.isNative()) return false;
    return typeof window !== 'undefined' && window.innerWidth < 900;
  },

  /**
   * Returns true if the device supports direct touch interaction.
   */
  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Returns the current execution environment enum.
   */
  getEnvironment(): PlatformEnvironment {
    if (this.isNative()) return 'native-app';
    if (this.isMobileWeb()) return 'mobile-web';
    return 'desktop-web';
  },
};
