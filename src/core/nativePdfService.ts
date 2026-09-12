import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { downloadBlobFile } from '../utils/fileUtils';

/**
 * Converts a Blob to a pure Base64 data string (stripping data mime base64 prefix).
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      const base64Index = result.indexOf(';base64,');
      if (base64Index !== -1) {
        resolve(result.substring(base64Index + 8));
      } else {
        resolve(result);
      }
    };
    reader.readAsDataURL(blob);
  });
}

export interface SavePdfResult {
  uri: string;
  isNative: boolean;
  fileName: string;
}

/**
 * Route 1: Persistent Save to Device Storage.
 * - On Native Android: Writes permanently to `Directory.Documents` so it persists and
 *   shows up in the Android "Files / Documents" app.
 * - On Web Browser: Triggers standard browser direct download.
 */
export async function savePdfPermanently(blob: Blob, fileName: string): Promise<SavePdfResult> {
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);

      const writeResult = await Filesystem.writeFile({
        path: safeName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      return {
        uri: writeResult.uri,
        isNative: true,
        fileName: safeName,
      };
    } catch (err) {
      console.error('[nativePdfService] Failed to save to Directory.Documents:', err);
      // Fallback: download via browser DOM
      downloadBlobFile(blob, safeName);
      return { uri: '', isNative: false, fileName: safeName };
    }
  }

  // Web fallback
  downloadBlobFile(blob, safeName);
  return { uri: '', isNative: false, fileName: safeName };
}

/**
 * Route 2: Transient Share Sheet (WhatsApp, Gmail, Drive, Slack).
 * - On Native Android: Writes a temporary cache file to `Directory.Cache` and immediately
 *   triggers the native Android Share Sheet without cluttering user documents.
 * - On Web: Utilizes the Web Share API (if supported) or falls back to direct download.
 */
export async function sharePdfTransitory(blob: Blob, fileName: string): Promise<boolean> {
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);

      const cacheResult = await Filesystem.writeFile({
        path: safeName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: safeName,
        text: 'Currículum Vitae (CV Studio Pro)',
        url: cacheResult.uri,
        dialogTitle: 'Compartir Currículum en PDF',
      });

      return true;
    } catch (err) {
      console.error('[nativePdfService] Native share failed:', err);
      // Fallback
      downloadBlobFile(blob, safeName);
      return false;
    }
  }

  // Modern Web Share API
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], safeName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: safeName,
        });
        return true;
      }
    } catch (err) {
      // User cancelled share or failed
      console.debug('[nativePdfService] Web share cancelled or unsupported:', err);
    }
  }

  // Fallback
  downloadBlobFile(blob, safeName);
  return false;
}
