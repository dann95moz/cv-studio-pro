import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Tooltip,
  Slider,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import FormatPaintRoundedIcon from '@mui/icons-material/FormatPaintRounded';
import { useTranslation } from 'react-i18next';
import {
  FontFamilyId,
  SpacingDensity,
  PageFormat,
  DesignFormattingPanelProps,
} from '../../../types';
import { themeSupportsPhoto } from '../../../templates';
import { ProfilePhotoDisplay } from '../photo/ProfilePhotoDisplay';
import { PhotoCropperModal } from '../photo/PhotoCropperModal';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';
import { TemplatesPanel } from './TemplatesPanel';

export type { DesignFormattingPanelProps };

export const DesignFormattingPanel: React.FC<DesignFormattingPanelProps> = ({
  customColor,
  onCustomColorChange,
  palette = 'corporate-blue',
  onSelectPalette,
  fontFamily = 'inter',
  onFontFamilyChange,
  spacingDensity = 'standard',
  onSpacingDensityChange,
  pageFormat = 'a4',
  onPageFormatChange,
  onAutoFit,
  sheetHeight = 0,
  a4PagePx = 1123,
  estimatedPages = 1,
  photo,
  onPhotoChange,
  onPhotoToggle,
  activeTheme = 'modern-tech',
  theme,
  onSelectTheme,
  initialTab = 'templates',
  onClose,
}) => {

  const { t } = useTranslation(['preview', 'common']);
  const muiTheme = useTheme();
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);
  const currentTheme = theme || activeTheme;
  const [panelTab, setPanelTab] = useState<'templates' | 'formatting'>(initialTab);

  const isPhotoSupported = themeSupportsPhoto(currentTheme);

  const {
    fileInputRef: hiddenFileInputRef,
    handleFileInputChange: handlePhotoUploadFromFileInput,
    uploadError,
    clearError,
  } = usePhotoUpload({
    onPhotoLoaded: (newPhoto) => {
      onPhotoChange?.(newPhoto);
      setCropperOpen(true);
    },
  });

  return (
    <Box sx={{ p: 2.5, pb: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', boxSizing: 'border-box' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {t('preview:panels.design.title', 'Diseño y Plantillas')}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Segmented Tab Controls: Plantillas vs Formato */}
      <ToggleButtonGroup
        value={panelTab}
        exclusive
        onChange={(_, val) => { if (val) setPanelTab(val); }}
        size="small"
        fullWidth
        sx={{
          mb: 2.5,
          bgcolor: alpha(muiTheme.palette.text.primary, 0.04),
          p: 0.35,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <ToggleButton
          value="templates"
          sx={{
            fontWeight: 700,
            fontSize: '0.76rem',
            py: 0.6,
            textTransform: 'none',
            borderRadius: '6px !important',
            border: 'none !important',
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              color: 'primary.main',
              boxShadow: 1,
            },
          }}
        >
          <StyleRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('preview:panels.design.tabTemplates', 'Plantillas')}
        </ToggleButton>
        <ToggleButton
          value="formatting"
          sx={{
            fontWeight: 700,
            fontSize: '0.76rem',
            py: 0.6,
            textTransform: 'none',
            borderRadius: '6px !important',
            border: 'none !important',
            '&.Mui-selected': {
              bgcolor: 'background.paper',
              color: 'primary.main',
              boxShadow: 1,
            },
          }}
        >
          <FormatPaintRoundedIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('preview:panels.design.tabFormatting', 'Formato y Estilos')}
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Tab 1: Plantillas y Paletas de Colores */}
      {panelTab === 'templates' && onSelectTheme && (
        <TemplatesPanel
          hideHeader
          theme={currentTheme}
          onSelectTheme={onSelectTheme}
          palette={palette}
          onSelectPalette={onSelectPalette}
          customColor={customColor}
          onCustomColorChange={onCustomColorChange}
          onClose={onClose}
        />
      )}

      {/* Tab 2: Formato, Tipografía, Espaciado y Foto */}
      {panelTab === 'formatting' && (
        <>
          {/* Hidden File Input for quick upload */}
          <input
            ref={hiddenFileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
            onChange={handlePhotoUploadFromFileInput}
          />

      {/* Section 2: Profile Photo (Two-Column & Regional Customization) */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {t('preview:panels.design.photoTitle', 'Profile Photo')}
          </Typography>
          {isPhotoSupported && photo && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={Boolean(photo.enabled)}
                  onChange={(e) => onPhotoToggle?.(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.74rem' }}>
                  {photo.enabled ? 'Enabled' : 'Hidden'}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
          {t(
            'preview:panels.design.photoSubtitle',
            'Optional headshot with pan & zoom framing. Recommended for EU & LatAm applications.'
          )}
        </Typography>

        {/* Photo-Supported vs Text-Only ATS State */}
        {!isPhotoSupported ? (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            sx={{
              fontSize: '0.72rem',
              lineHeight: 1.35,
              bgcolor: alpha(muiTheme.palette.info.main, 0.08),
            }}
          >
            {t(
              'preview:panels.design.photoNotSupported',
              'Photos are supported on Executive, Two-Column, Designer, Academic, Europass, and Euro Modern templates. Single-column ATS designs (Modern Tech, Minimal ATS, Formal Legal) omit photos for 100% parser compliance.'
            )}
          </Alert>
        ) : photo && photo.url ? (

          <>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: alpha(muiTheme.palette.background.paper, 0.8),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ProfilePhotoDisplay
                  photo={photo}
                  maskShape={activeTheme === 'academic-research' ? 'circle' : activeTheme === 'designer-uiux' ? 'squircle' : 'rounded'}
                  size={48}
                  border={`1.5px solid ${muiTheme.palette.primary.main}`}
                />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: 'text.primary', fontSize: '0.78rem' }}>
                    Headshot Configured
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                    Zoom: {photo.crop.zoom.toFixed(1)}x • Offset: {Math.round(photo.crop.x)}%, {Math.round(photo.crop.y)}%
                  </Typography>
                </Box>
              </Box>


              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={t('preview:panels.design.photoEdit', 'Adjust Framing & Zoom')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setCropperOpen(true)}
                    sx={{ bgcolor: alpha(muiTheme.palette.primary.main, 0.1) }}
                  >
                    <CropRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('preview:panels.design.photoRemove', 'Remove Photo')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onPhotoChange?.(null)}
                    sx={{ bgcolor: alpha(muiTheme.palette.error.main, 0.08) }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>

            {/* Photo Display Size Slider & Preset Chips */}
            <Box sx={{ mt: 1.5, px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {t('preview:panels.design.photoSize', 'Display Size in Template')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {photo.size || 108}px
                </Typography>
              </Box>
              <Slider
                size="small"
                value={photo.size || 108}
                min={80}
                max={144}
                step={4}
                onChange={(_, val) => onPhotoChange?.({ ...photo, size: val as number })}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {[
                  { label: t('preview:panels.design.sizeCompact', 'Compact'), val: 88 },
                  { label: t('preview:panels.design.sizeStandard', 'Standard'), val: 104 },
                  { label: t('preview:panels.design.sizeLarge', 'Large'), val: 120 },
                  { label: t('preview:panels.design.sizeHero', 'Hero'), val: 140 },
                ].map((preset) => (
                  <Chip
                    key={preset.val}
                    label={`${preset.label} (${preset.val}px)`}
                    size="small"
                    variant={(photo.size || 108) === preset.val ? 'filled' : 'outlined'}
                    color={(photo.size || 108) === preset.val ? 'primary' : 'default'}
                    onClick={() => onPhotoChange?.({ ...photo, size: preset.val })}
                    sx={{ fontSize: '0.68rem', height: 22, cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<AddAPhotoRoundedIcon />}
              onClick={() => hiddenFileInputRef.current?.click()}
              sx={{ fontSize: '0.78rem', textTransform: 'none', py: 0.75 }}
              fullWidth
            >
              {t('preview:panels.design.photoUpload', 'Upload Professional Photo')}
            </Button>
            {uploadError && (
              <Alert severity="error" onClose={clearError} sx={{ fontSize: '0.75rem' }}>
                {uploadError}
              </Alert>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', textAlign: 'center' }}>
              PNG, JPG or WebP (Max 5MB)
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Section 3: Typography Selection */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('preview:panels.design.fontFamily', 'Font Family')}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2, lineHeight: 1.4 }}>
        {t('preview:panels.design.fontFamilyDesc', 'ATS-safe typography calibrated for executive clarity.')}
      </Typography>

      <ToggleButtonGroup
        value={fontFamily}
        exclusive
        onChange={(_, val) => val && onFontFamilyChange(val as FontFamilyId)}
        size="small"
        fullWidth
        sx={{ mb: 2.5 }}
      >
        <ToggleButton value="inter" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          Modern Sans
        </ToggleButton>
        <ToggleButton value="outfit" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          Display
        </ToggleButton>
        <ToggleButton value="serif" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          Serif
        </ToggleButton>
        <ToggleButton value="mono" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          Mono
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      {/* Section 4: Spacing & Content Density */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('preview:panels.design.sectionSpacing', 'Section Spacing')}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2, lineHeight: 1.4 }}>
        {t('preview:panels.design.sectionSpacingDesc', 'Adjust padding and line height to guarantee optimal fit.')}
      </Typography>

      <ToggleButtonGroup
        value={spacingDensity}
        exclusive
        onChange={(_, val) => val && onSpacingDensityChange(val as SpacingDensity)}
        size="small"
        fullWidth
        sx={{ mb: 2.5 }}
      >
        <ToggleButton value="compact" sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.6 }}>
          {t('preview:panels.design.sizeCompact', 'Compact')}
        </ToggleButton>
        <ToggleButton value="standard" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          {t('preview:panels.design.sizeStandard', 'Standard')}
        </ToggleButton>
        <ToggleButton value="spacious" sx={{ fontSize: '0.72rem', fontWeight: 600, py: 0.6 }}>
          {t('preview:panels.design.sizeLarge', 'Spacious')}
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      {/* Section 5: Page Paper Format */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('preview:panels.design.pageFormat', 'Paper Format')}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2, lineHeight: 1.4 }}>
        {t('preview:panels.design.pageFormatDesc', 'Select standard A4, Letter, or Legal format.')}
      </Typography>

      <ToggleButtonGroup
        value={pageFormat}
        exclusive
        onChange={(_, val) => val && onPageFormatChange && onPageFormatChange(val as PageFormat)}
        size="small"
        fullWidth
        sx={{ mb: 2.5 }}
      >
        <ToggleButton value="a4" sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.6 }}>
          {t('preview:panels.design.pageFormatA4', 'A4')}
        </ToggleButton>
        <ToggleButton value="letter" sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.6 }}>
          {t('preview:panels.design.pageFormatLetter', 'Letter')}
        </ToggleButton>
        <ToggleButton value="legal" sx={{ fontSize: '0.72rem', fontWeight: 700, py: 0.6 }}>
          {t('preview:panels.design.pageFormatLegal', 'Legal')}
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      {/* Section 6: Page Budget & Scale Meter */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {t('preview:toolbar.pageFit', 'Page Budget & Scale')}
        </Typography>
        {onAutoFit && (
          <Chip
            label={t('preview:toolbar.autoFit', '⚡ Auto-Fit 1 Page')}
            size="small"
            color={estimatedPages > 1 ? 'warning' : 'primary'}
            onClick={onAutoFit}
            clickable
            sx={{ fontWeight: 800, height: 22, fontSize: '0.7rem' }}
          />
        )}
      </Box>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('preview:panels.design.paperStandard', 'Paper Standard')}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {pageFormat.toUpperCase()} ({a4PagePx}px)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('preview:panels.design.renderedHeight', 'Rendered Height')}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {sheetHeight}px / {a4PagePx}px
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('preview:panels.design.pageStatus', 'Page Status')}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: estimatedPages === 1 ? 'success.main' : 'warning.main' }}>
            {estimatedPages === 1
              ? t('preview:panels.design.perfectOnePage', 'Perfect 1 Page ✓')
              : t('preview:panels.design.pagesCount', { count: estimatedPages, defaultValue: `${estimatedPages} Pages` })}
          </Typography>
        </Box>


        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.round((sheetHeight / a4PagePx) * 100))}
          color={estimatedPages === 1 ? 'success' : 'warning'}
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontSize: '0.66rem', mt: 0.5, display: 'block', textAlign: 'right' }}
        >
          {Math.round((sheetHeight / a4PagePx) * 100)}% ({pageFormat.toUpperCase()})
        </Typography>
      </Paper>
      </>
      )}

      {/* Pan & Zoom Photo Cropper Modal */}
      {cropperOpen && (
        <PhotoCropperModal
          open={cropperOpen}
          onClose={() => setCropperOpen(false)}
          photo={photo || null}
          onSave={(updatedPhoto) => {
            onPhotoChange?.(updatedPhoto);
          }}
          activeTheme={activeTheme}
        />
      )}
    </Box>
  );
};
