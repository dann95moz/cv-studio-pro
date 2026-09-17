import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Popover,
  Slider,
  Chip,
  IconButton,
  Button,
  ButtonGroup,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { useTranslation } from 'react-i18next';
import { ProfilePhotoConfig, ThemeId } from '../../../types/cv';
import { PhotoCropperModal } from './PhotoCropperModal';
import { useProfilePhotoEditor } from '../../../hooks/useProfilePhotoEditor';

export interface ProfilePhotoDisplayProps {
  photo?: ProfilePhotoConfig | null;
  maskShape?: 'circle' | 'rounded' | 'squircle';
  size?: number | string;
  width?: number | string;
  height?: number | string;
  border?: string;
  boxShadow?: string;
  fallbackInitials?: string;
  fallbackIcon?: 'diamond' | 'monogram' | 'none';
  editable?: boolean;
  activeTheme?: ThemeId;
  onPhotoChange?: (updated: ProfilePhotoConfig | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ProfilePhotoDisplay: React.FC<ProfilePhotoDisplayProps> = ({
  photo: propPhoto,
  maskShape = 'rounded',
  size,
  width,
  height,
  border,
  boxShadow,
  fallbackInitials,
  fallbackIcon = 'monogram',
  editable = true,
  activeTheme,
  onPhotoChange,
  className,
  style,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const muiTheme = useTheme();

  const {
    currentPhoto,
    currentTheme,
    hasActivePhoto,
    clampedSize,
    minSafeSize,
    maxSafeSize,
    anchorEl,
    isPopoverOpen,
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
  } = useProfilePhotoEditor({
    photo: propPhoto,
    activeTheme,
    editable,
    onPhotoChange,
  });

  const getBorderRadius = () => {
    switch (maskShape) {
      case 'circle':
        return '50%';
      case 'squircle':
        return '14px';
      case 'rounded':
      default:
        return '8px';
    }
  };

  // If explicit width/height/size prop is provided, honor it directly (for thumbnails, UI panels, etc.)
  const explicitWidth = width !== undefined ? width : (size !== undefined ? size : null);
  const explicitHeight = height !== undefined ? height : (size !== undefined ? size : null);

  const finalWidth = explicitWidth !== null ? explicitWidth : clampedSize;
  const finalHeight = explicitHeight !== null ? explicitHeight : clampedSize;

  const borderRadius = getBorderRadius();

  const tooltipTitle = hasActivePhoto
    ? t('preview:panels.design.photoEditTooltip', 'Click to adjust framing or change photo')
    : t('preview:panels.design.photoUploadTooltip', 'Click to upload profile photo');

  return (
    <>
      {/* Hidden File Input for direct canvas click */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <Tooltip title={editable && !isPopoverOpen ? tooltipTitle : ''} arrow placement="top">
        <Box
          onClick={handleContainerClick}
          className={`cv-profile-photo-container ${className || ''}`}
          sx={{
            width: finalWidth,
            height: finalHeight,
            borderRadius,
            border: border || (muiTheme.palette.mode === 'dark' ? `2px solid ${alpha(muiTheme.palette.common.white, 0.2)}` : `2px solid ${muiTheme.palette.divider}`),
            boxShadow: boxShadow || muiTheme.shadows[2],
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            cursor: editable ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.18s ease-out, height 0.18s ease-out, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': editable
              ? {
                  transform: 'scale(1.04)',
                  boxShadow: `0 6px 18px ${alpha(muiTheme.palette.primary.main, 0.35)}`,
                }
              : {},
            ...style,
          }}
        >
          {/* 1. Render Active Cropped Photo */}
          {hasActivePhoto && currentPhoto ? (
            <img
              src={currentPhoto.url}
              alt="Candidate Profile"
              className="cv-profile-photo-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `translate(${currentPhoto.crop.x}%, ${currentPhoto.crop.y}%) scale(${currentPhoto.crop.zoom})`,
                transformOrigin: 'center center',
                pointerEvents: 'none',
                userSelect: 'none',
                display: 'block',
              }}
            />
          ) : fallbackIcon === 'diamond' ? (
            /* Diamond fallback for TwoColumn template */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '55%', height: '55%', fill: 'var(--cv-accent-color, #1d4ed8)' }}>
                <path d="M12 2L15 9.5L22 12L15 14.5L12 22L9 14.5L2 12L9 9.5Z" />
              </svg>
              {fallbackInitials && (
                <Typography sx={{ fontSize: '9px', fontWeight: 800, color: 'var(--cv-accent-color, #1d4ed8)', mt: '-2px' }}>
                  {fallbackInitials}
                </Typography>
              )}
            </Box>
          ) : fallbackInitials ? (
            /* Monogram Initials Fallback */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: alpha(muiTheme.palette.common.white, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: typeof finalWidth === 'number' ? Math.round(finalWidth * 0.38) : '1.1rem',
                  lineHeight: 1,
                  color: 'common.white',
                }}
              >
                {fallbackInitials}
              </Typography>
            </Box>
          ) : (
            <AddAPhotoRoundedIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
          )}

          {/* 2. Live Hot Edit Hover Overlay with Pencil / Camera Icon (Hidden on Print) */}
          {editable && (
            <Box
              className="no-print cv-photo-edit-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'common.white',
                opacity: 0,
                transition: 'opacity 0.18s ease-in-out',
                '&:hover': {
                  opacity: 1,
                },
                // On touch screens / mobile, show subtle pencil badge in corner
                '@media (hover: none)': {
                  opacity: 0,
                },
              }}
            >
              {hasActivePhoto ? (
                <EditRoundedIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              ) : (
                <AddAPhotoRoundedIcon sx={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              )}
            </Box>
          )}

          {/* 3. Mobile Touch Pencil Badge in corner (Visible on touch/mobile) */}
          {editable && (
            <Box
              className="no-print"
              sx={{
                display: { xs: 'flex', md: 'none' },
                position: 'absolute',
                bottom: 2,
                right: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '50%',
                width: 18,
                height: 18,
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                border: '1px solid',
                borderColor: 'common.white',
                zIndex: 2,
              }}
            >
              {hasActivePhoto ? (
                <EditRoundedIcon sx={{ fontSize: 11 }} />
              ) : (
                <AddAPhotoRoundedIcon sx={{ fontSize: 11 }} />
              )}
            </Box>
          )}
        </Box>
      </Tooltip>

      {/* Floating In-Place Quick Popover for Live Resizing & Actions */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className="no-print"
        slotProps={{
          paper: {
            sx: {
              p: 2.25,
              width: { xs: 'calc(100vw - 32px)', sm: 330 },
              maxWidth: 350,
              mt: 1,
            },
          },
        }}
      >
        {/* Popover Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
            {t('preview:panels.design.photoTitle', 'Profile Photo')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={`${clampedSize}px`}
              size="small"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem', px: 0.5 }}
            />
            <IconButton size="small" onClick={handleClosePopover} sx={{ p: 0.4 }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {uploadError && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 1.25, fontSize: '0.75rem' }}>
            {uploadError}
          </Alert>
        )}

        {/* Live Photo Size Stepper & Slider */}
        <Box sx={{ my: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.74rem' }}>
              {t('preview:panels.design.photoSize', 'Live Display Size')}
            </Typography>
            <ButtonGroup size="small" variant="outlined" sx={{ height: 24 }}>
              <IconButton
                size="small"
                onClick={() => handleLiveSizeChange(clampedSize - 4)}
                disabled={clampedSize <= minSafeSize}
                sx={{ p: 0.3, width: 24, height: 24 }}
              >
                <RemoveRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleLiveSizeChange(clampedSize + 4)}
                disabled={clampedSize >= maxSafeSize}
                sx={{ p: 0.3, width: 24, height: 24 }}
              >
                <AddRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </ButtonGroup>
          </Box>

          <Slider
            size="small"
            value={clampedSize}
            min={minSafeSize}
            max={maxSafeSize}
            step={4}
            onChange={(_, val) => handleLiveSizeChange(val as number)}
            sx={{ mb: 1.25 }}
          />

          {/* Quick Presets (S / M / L / XL) in a 4-column responsive grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.75,
            }}
          >
            {[
              { label: 'S (88px)', val: 88 },
              { label: 'M (104px)', val: 104 },
              { label: 'L (120px)', val: 120 },
              { label: 'XL (140px)', val: Math.min(140, maxSafeSize) },
            ].map((preset) => (
              <Chip
                key={preset.val}
                label={preset.label}
                size="small"
                variant={clampedSize === preset.val ? 'filled' : 'outlined'}
                color={clampedSize === preset.val ? 'primary' : 'default'}
                onClick={() => handleLiveSizeChange(preset.val)}
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: clampedSize === preset.val ? 800 : 600,
                  height: 24,
                  width: '100%',
                  cursor: 'pointer',
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Action Buttons: Crop & Pan / Change File / Remove */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CropRoundedIcon />}
            onClick={handleOpenCropper}
            fullWidth
            sx={{ fontSize: '0.78rem', textTransform: 'none', py: 0.6, whiteSpace: 'nowrap' }}
          >
            {t('preview:panels.design.photoEdit', 'Adjust Framing & Zoom')}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<AddAPhotoRoundedIcon />}
              onClick={() => {
                handleClosePopover();
                fileInputRef.current?.click();
              }}
              sx={{ flex: 1.2, fontSize: '0.72rem', textTransform: 'none', py: 0.5, whiteSpace: 'nowrap' }}
            >
              {t('preview:panels.design.photoChangeAction', 'Change Image')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={handleDeletePhoto}
              sx={{ flex: 0.8, fontSize: '0.72rem', textTransform: 'none', py: 0.5, whiteSpace: 'nowrap' }}
            >
              {t('preview:panels.design.photoDeleteAction', 'Remove')}
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Pan & Zoom Cropper Modal */}
      {cropperOpen && (
        <PhotoCropperModal
          open={cropperOpen}
          onClose={handleCloseCropper}
          photo={currentPhoto || null}
          onSave={handleSavePhoto}
          activeTheme={currentTheme}
        />
      )}

      {/* Global Error Notification for file uploads outside popover */}
      <Snackbar
        open={Boolean(uploadError && !isPopoverOpen)}
        autoHideDuration={5000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={clearError} severity="error" variant="filled">
          {uploadError}
        </Alert>
      </Snackbar>
    </>
  );
};
