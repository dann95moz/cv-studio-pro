import { useState, useCallback } from 'react';
import { ProfilePhotoConfig, ThemeId } from '../types/cv';
import { useResumeStore } from '../store';
import { usePhotoUpload } from './usePhotoUpload';

export interface UseProfilePhotoEditorProps {
  photo?: ProfilePhotoConfig | null;
  activeTheme?: ThemeId;
  editable?: boolean;
  onPhotoChange?: (updated: ProfilePhotoConfig | null) => void;
}

export interface UseProfilePhotoEditorReturn {
  currentPhoto: ProfilePhotoConfig | null;
  currentTheme: ThemeId;
  hasActivePhoto: boolean;
  clampedSize: number;
  minSafeSize: number;
  maxSafeSize: number;
  anchorEl: HTMLElement | null;
  isPopoverOpen: boolean;
  cropperOpen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadError: string | null;
  clearError: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContainerClick: (e: React.MouseEvent<HTMLElement>) => void;
  handleClosePopover: () => void;
  handleOpenCropper: () => void;
  handleCloseCropper: () => void;
  handleLiveSizeChange: (newSize: number) => void;
  handleSavePhoto: (updated: ProfilePhotoConfig | null) => void;
  handleDeletePhoto: () => void;
}

export function useProfilePhotoEditor({
  photo: propPhoto,
  activeTheme,
  editable = true,
  onPhotoChange,
}: UseProfilePhotoEditorProps): UseProfilePhotoEditorReturn {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const storePhoto = useResumeStore((s) => s.photo);
  const setProfilePhoto = useResumeStore((s) => s.setProfilePhoto);
  const syncTransversalPersonalDetail = useResumeStore((s) => s.syncTransversalPersonalDetail);
  const storeTheme = useResumeStore((s) => s.theme);

  const currentPhoto = propPhoto !== undefined ? propPhoto : storePhoto;
  const currentTheme = activeTheme || storeTheme;

  const minSafeSize = 80;
  const maxSafeSize = currentTheme === 'executive' ? 120 : currentTheme === 'designer-uiux' ? 132 : 144;
  const templateConfiguredSize = currentPhoto?.size || 108;
  const clampedSize = Math.max(minSafeSize, Math.min(maxSafeSize, templateConfiguredSize));
  const hasActivePhoto = Boolean(currentPhoto && currentPhoto.enabled && currentPhoto.url);

  const handleSavePhoto = useCallback(
    (updated: ProfilePhotoConfig | null) => {
      if (onPhotoChange) {
        onPhotoChange(updated);
      } else {
        setProfilePhoto(updated);
      }
      syncTransversalPersonalDetail('photo', updated);
    },
    [onPhotoChange, setProfilePhoto, syncTransversalPersonalDetail]
  );

  const {
    fileInputRef,
    handleFileInputChange: handleFileUpload,
    uploadError,
    clearError,
  } = usePhotoUpload({
    defaultSize: currentPhoto?.size || 108,
    onPhotoLoaded: (newPhoto) => {
      handleSavePhoto(newPhoto);
      setCropperOpen(true);
    },
  });

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!editable) return;
      e.stopPropagation();

      if (hasActivePhoto) {
        setAnchorEl(e.currentTarget);
      } else {
        fileInputRef.current?.click();
      }
    },
    [editable, hasActivePhoto, fileInputRef]
  );

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOpenCropper = useCallback(() => {
    handleClosePopover();
    setCropperOpen(true);
  }, [handleClosePopover]);

  const handleCloseCropper = useCallback(() => {
    setCropperOpen(false);
  }, []);

  const handleLiveSizeChange = useCallback(
    (newSize: number) => {
      if (!currentPhoto) return;
      const bounded = Math.max(minSafeSize, Math.min(maxSafeSize, newSize));
      handleSavePhoto({
        ...currentPhoto,
        size: bounded,
      });
    },
    [currentPhoto, minSafeSize, maxSafeSize, handleSavePhoto]
  );

  const handleDeletePhoto = useCallback(() => {
    handleClosePopover();
    handleSavePhoto(null);
  }, [handleClosePopover, handleSavePhoto]);

  return {
    currentPhoto,
    currentTheme,
    hasActivePhoto,
    clampedSize,
    minSafeSize,
    maxSafeSize,
    anchorEl,
    isPopoverOpen: Boolean(anchorEl),
    cropperOpen,
    fileInputRef,
    uploadError,
    clearError,
    handleFileUpload,
    handleContainerClick,
    handleClosePopover,
    handleOpenCropper,
    handleCloseCropper,
    handleLiveSizeChange,
    handleSavePhoto,
    handleDeletePhoto,
  };
}
