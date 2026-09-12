import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

export interface QrScanResult {
  success: boolean;
  content: string | null;
  deniedPermission?: boolean;
  cancelled?: boolean;
  errorMessage?: string;
}

export const qrScannerService = {
  /**
   * Checks if native barcode scanning is supported on this platform/device.
   */
  async isSupported(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }
    try {
      const { supported } = await BarcodeScanner.isSupported();
      return supported;
    } catch {
      return false;
    }
  },

  /**
   * Triggers native Google Code Scanner / camera viewfinder directly.
   * If Google Play Services is available, it opens Google's native bottom-sheet scanner.
   * If permissions are required, it requests them.
   * If the user rejects permissions or cancels, it returns appropriate flags so the UI can fall back to manual code input.
   */
  async scan(): Promise<QrScanResult> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, content: null, errorMessage: 'Native scanner only available on mobile' };
    }

    try {
      // 1. Check if Google Barcode Scanner module is available on Android
      try {
        const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
        if (!available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule();
        }
      } catch {
        // Not on Android or Google module check not supported
      }

      // 2. Launch scan with Google Barcode Scanner UI (autoZoom enabled)
      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (result.barcodes && result.barcodes.length > 0) {
        const rawValue = result.barcodes[0].displayValue || result.barcodes[0].rawValue;
        if (rawValue && rawValue.trim()) {
          return { success: true, content: rawValue.trim() };
        }
      }

      return { success: false, content: null, cancelled: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

      // Check if user cancelled
      if (message.includes('cancel') || message.includes('dismiss')) {
        return { success: false, content: null, cancelled: true };
      }

      // If Google scanner failed due to permissions, request them
      try {
        const permStatus = await BarcodeScanner.checkPermissions();
        if (permStatus.camera !== 'granted') {
          const reqStatus = await BarcodeScanner.requestPermissions();
          if (reqStatus.camera !== 'granted') {
            return { success: false, content: null, deniedPermission: true };
          }
        }
      } catch {
        return { success: false, content: null, deniedPermission: true, errorMessage: message };
      }

      return { success: false, content: null, errorMessage: message };
    }
  },
};
