import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Slider,
  Tooltip,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { ProfilePhotoConfig, ProfilePhotoCrop, ThemeId } from '../../../types/cv';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';

export interface PhotoCropperModalProps {
  open: boolean;
  onClose: () => void;
  photo: ProfilePhotoConfig | null;
  onSave: (photo: ProfilePhotoConfig) => void;
  activeTheme?: ThemeId;
}

export const PhotoCropperModal: React.FC<PhotoCropperModalProps> = ({
  open,
  onClose,
  photo,
  onSave,
  activeTheme = 'academic-research',
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const muiTheme = useTheme();

  const [imageUrl, setImageUrl] = useState<string>(photo?.url || '');
  const [crop, setCrop] = useState<ProfilePhotoCrop>(
    photo?.crop || { x: 0, y: 0, zoom: 1.0 }
  );
  const [displaySize, setDisplaySize] = useState<number>(photo?.size || 64);

  // Derive mask shape strictly from active template identity
  const maskShape: 'circle' | 'rounded' | 'squircle' =
    activeTheme === 'academic-research' || activeTheme === 'swiss-modern'
      ? 'circle'
      : activeTheme === 'designer-uiux'
      ? 'squircle'
      : 'rounded';

  // Dragging & Panning state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cropX: number; cropY: number }>({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
  });

  // Touch pinch-to-zoom tracking
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialTouchZoomRef = useRef<number>(1.0);

  // Sync state when modal opens or photo changes
  useEffect(() => {
    if (open) {
      setImageUrl(photo?.url || '');
      setCrop(photo?.crop || { x: 0, y: 0, zoom: 1.0 });
      setDisplaySize(photo?.size || 64);
    }
  }, [open, photo]);

  const {
    fileInputRef,
    handleFileInputChange: handleFileUpload,
    uploadError,
    clearError,
  } = usePhotoUpload({
    onPhotoLoaded: (loadedPhoto) => {
      setImageUrl(loadedPhoto.url);
      setCrop({ x: 0, y: 0, zoom: 1.0 });
    },
  });

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const sensitivity = 0.45; // Smooth pan sensitivity

      setCrop((prev) => ({
        ...prev,
        x: Math.max(-60, Math.min(60, dragStartRef.current.cropX + deltaX * sensitivity)),
        y: Math.max(-60, Math.min(60, dragStartRef.current.cropY + deltaY * sensitivity)),
      }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch drag & pinch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageUrl) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        cropX: crop.x,
        cropY: crop.y,
      };
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialTouchDistanceRef.current = distance;
      initialTouchZoomRef.current = crop.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      const sensitivity = 0.45;

      setCrop((prev) => ({
        ...prev,
        x: Math.max(-60, Math.min(60, dragStartRef.current.cropX + deltaX * sensitivity)),
        y: Math.max(-60, Math.min(60, dragStartRef.current.cropY + deltaY * sensitivity)),
      }));
    } else if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const factor = distance / initialTouchDistanceRef.current;
      const newZoom = Math.max(1.0, Math.min(3.0, initialTouchZoomRef.current * factor));
      setCrop((prev) => ({ ...prev, zoom: parseFloat(newZoom.toFixed(2)) }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialTouchDistanceRef.current = null;
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0, zoom: 1.0 });
  };

  const handleSave = () => {
    if (!imageUrl) return;
    onSave({
      url: imageUrl,
      crop,
      enabled: true,
      size: displaySize,
    });
    onClose();
  };

  const getMaskBorderRadius = () => {
    switch (maskShape) {
      case 'circle':
        return '50%';
      case 'squircle':
        return '24px';
      case 'rounded':
      default:
        return '14px';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.3 }}>
            {t('preview:panels.design.photoCropTitle', 'Adjust Photo Framing & Zoom')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('preview:panels.design.photoCropDesc', 'Drag to pan and use the slider to center your face')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {uploadError && (
          <Alert severity="error" onClose={clearError} sx={{ width: '100%', mb: 1.5 }}>
            {uploadError}
          </Alert>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Viewport Mask & Canvas */}
        <Box
          sx={{
            width: 240,
            height: 240,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.85),
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: (theme) => theme.shadows[8],
            border: `1px solid ${muiTheme.palette.divider}`,
            cursor: imageUrl ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none',
            userSelect: 'none',
            my: 1.5,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imageUrl ? (
            <>
              {/* Draggable & Scalable Image */}
              <Box
                component="img"
                src={imageUrl}
                alt="Headshot Preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${crop.x}%, ${crop.y}%) scale(${crop.zoom})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              />

              {/* Viewport Cutout Mask Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  boxShadow: `0 0 0 9999px rgba(15, 23, 42, 0.65)`,
                  borderRadius: getMaskBorderRadius(),
                  border: `2px dashed ${alpha(muiTheme.palette.primary.main, 0.85)}`,
                  margin: '16px',
                }}
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <AddAPhotoRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No photo selected
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddAPhotoRoundedIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mt: 1.5 }}
              >
                {t('preview:panels.design.photoUpload', 'Upload Photo')}
              </Button>
            </Box>
          )}
        </Box>

        {imageUrl && (
          <>
            {/* Controls Bar: Zoom Slider & Reset Button */}
            <Box sx={{ width: '100%', maxWidth: 360, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {t('preview:toolbar.zoomFit', 'Zoom Level')}: {crop.zoom.toFixed(1)}x
                </Typography>
                <Tooltip title={t('common:actions.reset', 'Reset Framing')}>
                  <IconButton size="small" onClick={handleReset}>
                    <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ZoomOutRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Slider
                  size="small"
                  value={crop.zoom}
                  min={1.0}
                  max={3.0}
                  step={0.05}
                  onChange={(_, val) => setCrop((prev) => ({ ...prev, zoom: val as number }))}
                  sx={{ flex: 1 }}
                />
                <ZoomInRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AddAPhotoRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                >
                  Change Image File
                </Button>
              </Box>
            </Box>

            {/* ATS Compliance Advisory Note */}
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="inherit" />}
              sx={{
                mt: 2,
                width: '100%',
                fontSize: '0.74rem',
                lineHeight: 1.35,
                bgcolor: alpha(muiTheme.palette.info.main, 0.08),
                border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`,
              }}
            >
              {t(
                'preview:panels.design.photoAtsWarning',
                'ATS Compatibility Note: Photos are recommended for EU/Latin America applications and executive portfolios. In the US & UK, corporate ATS parsers typically prefer text-only resumes.'
              )}
            </Alert>
          </>
        )}
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${muiTheme.palette.divider}`, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t('common:actions.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!imageUrl}
          startIcon={<CheckRoundedIcon />}
          onClick={handleSave}
        >
          {t('preview:panels.design.photoSaveCrop', 'Apply Framing')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
