import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfilePhotoConfig } from '../types/cv';
import { compressAndResizeImage } from '../utils/imageCompression';

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UsePhotoUploadOptions {
  onPhotoLoaded?: (photo: ProfilePhotoConfig) => void;
  onError?: (errorMessage: string) => void;
  defaultSize?: number;
}

export interface UsePhotoUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProcessing: boolean;
  uploadError: string | null;
  clearError: () => void;
  openFileDialog: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Reusable, accessible hook for validating and reading profile photo uploads.
 * Replaces native browser alert() dialogs with localized error states.
 */
export function usePhotoUpload(options: UsePhotoUploadOptions = {}): UsePhotoUploadReturn {
  const { onPhotoLoaded, onError, defaultSize = 108 } = options;
  const { t } = useTranslation(['preview']);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const openFileDialog = useCallback(() => {
    setUploadError(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        const errorMsg = t(
          'preview:format.photoFileTooLarge',
          'Photo file size is too large (max 5MB). Please upload a smaller image.'
        );
        setUploadError(errorMsg);
        onError?.(errorMsg);
        e.target.value = '';
        return;
      }

      setIsProcessing(true);
      setUploadError(null);

      compressAndResizeImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
        .then((compressedUrl) => {
          setIsProcessing(false);
          const newPhoto: ProfilePhotoConfig = {
            url: compressedUrl,
            crop: { x: 0, y: 0, zoom: 1.0 },
            enabled: true,
            size: defaultSize,
          };
          onPhotoLoaded?.(newPhoto);
        })
        .catch(() => {
          setIsProcessing(false);
          const errorMsg = t(
            'preview:format.photoReadError',
            'Failed to read the selected image file. Please try again.'
          );
          setUploadError(errorMsg);
          onError?.(errorMsg);
        });

      e.target.value = '';
    },
    [t, onError, onPhotoLoaded, defaultSize]
  );

  return {
    fileInputRef,
    isProcessing,
    uploadError,
    clearError,
    openFileDialog,
    handleFileInputChange,
  };
}
