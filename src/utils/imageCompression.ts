/**
 * Image compression and resizing utility for profile photos.
 * Principle: Single Responsibility (S) - Client-side image optimization.
 * Ensures profile photos remain crisp for 300 DPI print while keeping
 * localStorage payload and exported PDF file sizes minimal (< 250-400 KB).
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

/**
 * Calculates approximate byte size of a base64 Data URL.
 */
export function estimateDataUrlSizeBytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const commaIndex = dataUrl.indexOf(',');
  const base64Str = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return Math.round((base64Str.length * 3) / 4);
}

/**
 * Compresses and downscales an image file or Data URL to fit within target dimensions
 * and quality constraints.
 */
export function compressAndResizeImage(
  input: File | string,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If the image is already within bounds and small, return early
        const initialSize = estimateDataUrlSizeBytes(dataUrl);
        if (width <= maxWidth && height <= maxHeight && initialSize <= 120 * 1024) {
          resolve(dataUrl);
          return;
        }

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Fallback to original if 2D context fails
          return;
        }

        // High quality bicubic resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw white background in case of transparent PNG converted to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          // Keep whichever is smaller
          if (estimateDataUrlSizeBytes(compressedDataUrl) < initialSize) {
            resolve(compressedDataUrl);
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = dataUrl;
    };

    if (typeof input === 'string') {
      processDataUrl(input);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          processDataUrl(e.target.result);
        } else {
          reject(new Error('FileReader returned non-string result'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file for compression'));
      reader.readAsDataURL(input);
    }
  });
}
