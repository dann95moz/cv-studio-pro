import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

/**
 * Enterprise Secure Storage Service for CV Studio Pro.
 * On native Android, leverages Android Keystore backed EncryptedSharedPreferences (AES-256).
 * On Web/Desktop browser environments, seamlessly falls back to standard web storage.
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await SecureStorage.set(key, value);
        return;
      } catch (err) {
        console.warn('[secureStorage] Native Keystore write failed, using web storage fallback:', err);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('[secureStorage] LocalStorage fallback write failed:', e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const val = await SecureStorage.get(key);
        if (typeof val === 'string') return val;
        if (val !== null && val !== undefined) return String(val);
        return null;
      } catch (err) {
        console.warn('[secureStorage] Native Keystore read failed, falling back to local storage:', err);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      return null;
    }
    return null;
  },

  async removeItem(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await SecureStorage.remove(key);
      } catch (err) {
        console.debug('[secureStorage] Native Keystore remove notice:', err);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};
