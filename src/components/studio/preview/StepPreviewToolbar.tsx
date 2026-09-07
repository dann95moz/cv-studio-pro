import React, { useState } from 'react';
import {
  Paper,
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useTranslation } from 'react-i18next';
import { StepPreviewToolbarProps, PageFormat } from '../../../types';
import { PAGE_FORMAT_CONFIGS } from '../../../theme/dimensions';

export type { StepPreviewToolbarProps };

export const StepPreviewToolbar: React.FC<StepPreviewToolbarProps> = ({
  onSelectWizardStep,
  previewDocType = 'cv',
  onPreviewDocTypeChange,
  activeTemplateName,
  onOpenTemplates,
  onSaveVersion,
  savedSuccess = false,
  isSavingVersion = false,
  onReTailor,
  isGenerating,
  onDownloadPdf,
  onDownloadMarkdown,
  onDownloadPlainText,
  onDownloadDocx,
  onCopyPlainText,
  isExportingPdf = false,
  pageFormat = 'a4',
  onPageFormatChange,
  isOverflowing = false,
  onAutoFit,
  onTrackApplication,
  isTracked = false,
  activeLanguage = 'es',
  baseLanguage = 'es',
  translations = {},
  onLanguageChange,
  onOpenTranslateModal,
  isLanguageOutdated = false,
  outdatedSectionsCount = 0,
  onQuickSyncOutdated,
  isTranslating = false,
}) => {
  const { t } = useTranslation(['preview', 'target', 'common']);
  const theme = useTheme();

  const [stepMenuAnchor, setStepMenuAnchor] = useState<null | HTMLElement>(null);
  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [formatMenuAnchor, setFormatMenuAnchor] = useState<null | HTMLElement>(null);
  const [copiedAts, setCopiedAts] = useState<boolean>(false);

  const handleOpenStepMenu = (e: React.MouseEvent<HTMLElement>) => {
    setStepMenuAnchor(e.currentTarget);
  };

  const handleCloseStepMenu = () => {
    setStepMenuAnchor(null);
  };

  const handleCopyAts = () => {
    if (onCopyPlainText) {
      onCopyPlainText();
      setCopiedAts(true);
      setTimeout(() => setCopiedAts(false), 2500);
    }
  };

  const handleOpenPdfMenu = (e: React.MouseEvent<HTMLElement>) => {
    setPdfMenuAnchor(e.currentTarget);
  };

  const handleClosePdfMenu = () => {
    setPdfMenuAnchor(null);
  };

  const handleOpenLangMenu = (e: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(e.currentTarget);
  };

  const handleCloseLangMenu = () => {
    setLangMenuAnchor(null);
  };

  const handleOpenFormatMenu = (e: React.MouseEvent<HTMLElement>) => {
    setFormatMenuAnchor(e.currentTarget);
  };

  const handleCloseFormatMenu = () => {
    setFormatMenuAnchor(null);
  };

  return (
    <Paper
      elevation={0}
      className="no-print preview-top-toolbar"
      sx={{
        py: 1,
        px: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        gap: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: 20,
      }}
    >
      {/* Left: Wizard Breadcrumb Dropdown, Document Switcher & Settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {/* Interactive Wizard Step Breadcrumb Dropdown */}
        {onSelectWizardStep && (
          <>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleOpenStepMenu}
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: '15px !important', color: 'primary.main' }} />}
              endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18, color: 'text.secondary' }} />}
              sx={{
                px: 1.4,
                textTransform: 'none',
                borderColor: alpha(theme.palette.primary.main, 0.25),
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: 'primary.main',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {t('preview:toolbar.step2BreadcrumbPrefix', 'Vacante')} &gt;
                </Box>
                <Box component="span" sx={{ color: 'primary.main' }}>
                  {t('preview:toolbar.step3Breadcrumb', 'CV en Vivo')}
                </Box>
              </Typography>
            </Button>

            <Menu
              anchorEl={stepMenuAnchor}
              open={Boolean(stepMenuAnchor)}
              onClose={handleCloseStepMenu}
              slotProps={{ paper: { sx: { mt: 0.75, minWidth: 260 } } }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseStepMenu();
                  onSelectWizardStep('profile');
                }}
              >
                <ListItemIcon>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                    1
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.step1Label', 'Paso 1: Perfil y Experiencia')}
                  secondary={t('preview:toolbar.step1Desc', 'Editar master data y trayectoria')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.82rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleCloseStepMenu();
                  onSelectWizardStep('target');
                }}
              >
                <ListItemIcon>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                    2
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.step2Label', 'Paso 2: Vacante Objetivo')}
                  secondary={t('preview:toolbar.step2Desc', 'Ajustar descripción y calibración ATS')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.82rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>

              <MenuItem
                selected
                onClick={handleCloseStepMenu}
              >
                <ListItemIcon>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                    3
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.step3Label', 'Paso 3: CV en Vivo y Exportación')}
                  secondary={t('preview:toolbar.step3Desc', 'Paso actual (edición en tiempo real)')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>
            </Menu>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
          </>
        )}

        {/* Document Type Switcher */}
        {onPreviewDocTypeChange && (
          <ButtonGroup
            size="small"
            variant="outlined"
            sx={{
              p: 0.25,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              variant={previewDocType === 'cv' ? 'contained' : 'text'}
              color="primary"
              onClick={() => onPreviewDocTypeChange('cv')}
              startIcon={<ArticleRoundedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.74rem',
                textTransform: 'none',
                px: { xs: 1, sm: 1.5 },
                py: 0.35,
              }}
            >
              {t('preview:toolbar.docCv', 'Resume (CV)')}
            </Button>
            <Button
              variant={previewDocType === 'cover-letter' ? 'contained' : 'text'}
              color="secondary"
              onClick={() => onPreviewDocTypeChange('cover-letter')}
              startIcon={<EmailRoundedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.74rem',
                textTransform: 'none',
                px: { xs: 1, sm: 1.5 },
                py: 0.35,
              }}
            >
              {t('preview:toolbar.docCoverLetter', 'Cover Letter')}
            </Button>
          </ButtonGroup>
        )}

        {/* CV Language Variant Selector & Translator */}
        {previewDocType === 'cv' && onLanguageChange && (
          <>
            <Tooltip title={t('preview:toolbar.languageTooltip', 'CV Language Variant / Translations')}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleOpenLangMenu}
                startIcon={<LanguageRoundedIcon sx={{ fontSize: '15px !important' }} />}
                endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18 }} />}
                sx={{
                  height: 28,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 1,
                  borderColor: isLanguageOutdated ? 'warning.main' : 'divider',
                  color: isLanguageOutdated ? 'warning.main' : 'text.primary',
                  bgcolor: isLanguageOutdated ? alpha(theme.palette.warning.main, 0.08) : 'background.paper',
                  '&:hover': {
                    borderColor: isLanguageOutdated ? 'warning.dark' : 'primary.main',
                  },
                }}
              >
                {activeLanguage ? activeLanguage.toUpperCase() : 'ES'}
                {isLanguageOutdated && (
                  <WarningAmberRoundedIcon sx={{ fontSize: '14px !important', ml: 0.5, color: 'warning.main' }} />
                )}
              </Button>
            </Tooltip>

            <Menu
              anchorEl={langMenuAnchor}
              open={Boolean(langMenuAnchor)}
              onClose={handleCloseLangMenu}
              slotProps={{ paper: { sx: { mt: 0.75, minWidth: 220 } } }}
            >
              {/* Base Language Item */}
              <MenuItem
                selected={!activeLanguage || activeLanguage === baseLanguage}
                onClick={() => {
                  handleCloseLangMenu();
                  onLanguageChange(baseLanguage || 'es');
                }}
              >
                <ListItemIcon>
                  {(!activeLanguage || activeLanguage === baseLanguage) ? (
                    <CheckRoundedIcon fontSize="small" color="primary" />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {`${(baseLanguage || 'es').toUpperCase()} (${t('preview:translation.baseLang', 'Original')})`}
                    </Typography>
                  }
                />
              </MenuItem>

              {/* Translated Variants */}
              {translations && Object.values(translations).map((variant) => (
                <MenuItem
                  key={variant.language}
                  selected={activeLanguage === variant.language}
                  onClick={() => {
                    handleCloseLangMenu();
                    onLanguageChange(variant.language);
                  }}
                >
                  <ListItemIcon>
                    {activeLanguage === variant.language ? (
                      <CheckRoundedIcon fontSize="small" color="primary" />
                    ) : (
                      <Box sx={{ width: 20 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {`${variant.language.toUpperCase()} (${variant.languageLabel || variant.language})`}
                      </Typography>
                    }
                  />
                  {variant.isOutdated && (
                    <Chip
                      size="small"
                      icon={<WarningAmberRoundedIcon sx={{ fontSize: '12px !important' }} />}
                      label={t('preview:translation.outdatedBadge', 'Outdated')}
                      color="warning"
                      variant="outlined"
                      sx={{ ml: 1, fontSize: '0.62rem', height: 18 }}
                    />
                  )}
                </MenuItem>
              ))}

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={() => {
                  handleCloseLangMenu();
                  onOpenTranslateModal?.();
                }}
              >
                <ListItemIcon>
                  <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'primary.main' }}>
                      {t('preview:translation.translateNewAction', '+ Traducir a otro idioma...')}
                    </Typography>
                  }
                />
              </MenuItem>
            </Menu>

            {/* Quick-Sync diff button if active language is outdated */}
            {isLanguageOutdated && onQuickSyncOutdated && (
              <Tooltip title={t('preview:toolbar.syncDiffTooltip', 'Actualizar solo las secciones modificadas con IA para sincronizar y ahorrar tokens')}>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  startIcon={isTranslating ? <CircularProgress size={12} color="inherit" /> : <BoltRoundedIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={onQuickSyncOutdated}
                  disabled={isTranslating}
                  sx={{
                    height: 28,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 1,
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                >
                  {isTranslating
                    ? t('preview:translation.syncing', 'Sincronizando...')
                    : t('preview:toolbar.syncDiffBtn', 'Sincronizar cambios ({{count}})', { count: outdatedSectionsCount || 1 })}
                </Button>
              </Tooltip>
            )}
          </>
        )}

        {/* Page Format Selector (A4 / Letter / Legal) */}
        {onPageFormatChange && (
          <>
            <Tooltip title={t('preview:toolbar.pageFormatTooltip', 'Paper Format (A4, US Letter, US Legal)')}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleOpenFormatMenu}
                startIcon={<AspectRatioRoundedIcon sx={{ fontSize: '14px !important', color: 'text.secondary' }} />}
                endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18, color: 'text.secondary' }} />}
                sx={{
                  height: 28,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 1,
                  borderColor: 'divider',
                  color: 'text.primary',
                  bgcolor: 'background.paper',
                  display: { xs: 'none', md: 'inline-flex' },
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {pageFormat === 'letter'
                  ? `${PAGE_FORMAT_CONFIGS.letter.shortLabel} (8.5×11")`
                  : pageFormat === 'legal'
                  ? `${PAGE_FORMAT_CONFIGS.legal.shortLabel} (8.5×14")`
                  : `${PAGE_FORMAT_CONFIGS.a4.shortLabel} (210×297mm)`}
              </Button>
            </Tooltip>

            <Menu
              anchorEl={formatMenuAnchor}
              open={Boolean(formatMenuAnchor)}
              onClose={handleCloseFormatMenu}
              slotProps={{ paper: { sx: { mt: 0.75, minWidth: 200 } } }}
            >
              <MenuItem
                selected={pageFormat === 'a4'}
                onClick={() => {
                  handleCloseFormatMenu();
                  onPageFormatChange('a4');
                }}
              >
                <ListItemIcon>
                  {pageFormat === 'a4' ? (
                    <CheckRoundedIcon fontSize="small" color="primary" />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: pageFormat === 'a4' ? 700 : 500 }}>
                      {PAGE_FORMAT_CONFIGS.a4.shortLabel} (210×297mm)
                    </Typography>
                  }
                />
              </MenuItem>
              <MenuItem
                selected={pageFormat === 'letter'}
                onClick={() => {
                  handleCloseFormatMenu();
                  onPageFormatChange('letter');
                }}
              >
                <ListItemIcon>
                  {pageFormat === 'letter' ? (
                    <CheckRoundedIcon fontSize="small" color="primary" />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: pageFormat === 'letter' ? 700 : 500 }}>
                      {PAGE_FORMAT_CONFIGS.letter.shortLabel} (8.5×11")
                    </Typography>
                  }
                />
              </MenuItem>
              <MenuItem
                selected={pageFormat === 'legal'}
                onClick={() => {
                  handleCloseFormatMenu();
                  onPageFormatChange('legal');
                }}
              >
                <ListItemIcon>
                  {pageFormat === 'legal' ? (
                    <CheckRoundedIcon fontSize="small" color="primary" />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: pageFormat === 'legal' ? 700 : 500 }}>
                      {PAGE_FORMAT_CONFIGS.legal.shortLabel} (8.5×14")
                    </Typography>
                  }
                />
              </MenuItem>
            </Menu>
          </>
        )}

        {/* Magic 1-Page Auto-Fit Button */}
        {onAutoFit && (
          <Tooltip title={t('preview:toolbar.autoFitTooltip', 'Auto-Fit to 1 Page: Automatically recalibrates spacing and density to snap resume perfectly to 1 page.')}>
            <Button
              size="small"
              variant={isOverflowing ? 'contained' : 'outlined'}
              color={isOverflowing ? 'warning' : 'inherit'}
              startIcon={<BoltRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={onAutoFit}
              sx={{
                height: 28,
                fontSize: '0.72rem',
                fontWeight: 800,
                px: 1.2,
                display: { xs: 'none', sm: 'inline-flex' },
                animation: isOverflowing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                boxShadow: isOverflowing ? `0 0 12px ${alpha(theme.palette.warning.main, 0.4)}` : 'none',
              }}
            >
              {t('preview:toolbar.autoFit', 'Auto-Fit 1 Page')}
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Right: Clean, Balanced Action Group */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
        {/* 1. Tracked Status Indicator / Action */}
        {onTrackApplication && (
          isTracked ? (
            <Box
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                alignItems: 'center',
                gap: 0.6,
                px: 1,
                py: 0.4,
              }}
            >
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography
                component="span"
                sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'success.main' }}
              >
                {t('preview:toolbar.tracked', 'En el tablero')}
              </Typography>
            </Box>
          ) : (
            <Button
              size="small"
              variant="text"
              onClick={onTrackApplication}
              startIcon={<ViewKanbanRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: '0.8rem',
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
              }}
            >
              {t('preview:toolbar.trackApp', 'Postular')}
            </Button>
          )
        )}

        {/* 2. Save Version (Clean text / ghost button with loading spinner) */}
        {onSaveVersion && (
          <Button
            size="small"
            variant="text"
            onClick={onSaveVersion}
            disabled={isSavingVersion}
            startIcon={
              isSavingVersion ? (
                <CircularProgress size={13} color="inherit" />
              ) : savedSuccess ? (
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />
              ) : undefined
            }
            sx={{
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              color: savedSuccess ? 'success.main' : 'text.secondary',
              px: 1,
              display: { xs: 'none', sm: 'inline-flex' },
              transition: 'all 0.15s ease',
              '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
            }}
          >
            {isSavingVersion
              ? t('common:actions.saving', 'Saving...')
              : savedSuccess
              ? t('common:actions.saved', 'Saved!')
              : t('common:actions.save', 'Save')}
          </Button>
        )}

        {/* 3. Regenerate Full CV Action (Secondary rounded pill button) */}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={onReTailor}
          disabled={isGenerating}
          sx={{
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1.8,
            py: 0.5,
            minHeight: 34,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.paper',
            boxShadow: 'none',
            display: { xs: 'none', md: 'inline-flex' },
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            },
          }}
        >
          {isGenerating
            ? t('preview:toolbar.regeneratingCv', 'Regenerando...')
            : t('preview:toolbar.regenerateCv', 'Regenerar CV')}
        </Button>

        {/* Visual separation before Primary CTA */}
        <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 }, my: 0.5, display: { xs: 'none', md: 'block' } }} />

        {/* 4. Download Dropdown Button (Unified Primary Action Pill) */}
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleOpenPdfMenu}
          disabled={isExportingPdf}
          startIcon={
            isExportingPdf ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <DownloadRoundedIcon sx={{ fontSize: 16 }} />
            )
          }
          endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18 }} />}
          sx={{
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'none',
            px: { xs: 1.5, sm: 2 },
            py: 0.6,
            minHeight: 34,
            whiteSpace: 'nowrap',
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {isExportingPdf ? t('preview:toolbar.generatingPdf', 'Generando PDF...') : t('preview:toolbar.downloadFormats', 'Descargar / Exportar')}
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            {isExportingPdf ? '...' : t('preview:toolbar.downloadFormats', 'Exportar')}
          </Box>
        </Button>


        {/* PDF & Markdown Export Options Dropdown Menu */}
        <Menu
          anchorEl={pdfMenuAnchor}
          open={Boolean(pdfMenuAnchor)}
          onClose={handleClosePdfMenu}
          slotProps={{
            paper: {
              sx: {
                mt: 0.75,
                minWidth: 240,
              },
            },
          }}

        >
          <MenuItem
            onClick={() => {
              handleClosePdfMenu();
              onDownloadPdf();
            }}
          >
            <ListItemIcon>
              <PictureAsPdfRoundedIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('preview:toolbar.directPdfItem', 'Descarga Directa (PDF)')}
              secondary={t('preview:toolbar.directPdfDesc', 'Documento PDF de alta fidelidad')}
              slotProps={{
                primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                secondary: { sx: { fontSize: '0.7rem' } },
              }}
            />
          </MenuItem>

          {onDownloadDocx && (
            <MenuItem
              onClick={() => {
                handleClosePdfMenu();
                onDownloadDocx();
              }}
            >
              <ListItemIcon>
                <DescriptionRoundedIcon fontSize="small" sx={{ color: '#2b579a' }} />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadDocxItem', 'Descargar Word (.docx)')}
                secondary={t('preview:toolbar.downloadDocxDesc', 'Formato Office editable para reclutadores')}
                slotProps={{
                  primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.7rem' } },
                }}
              />
            </MenuItem>
          )}

          {onDownloadPlainText && (
            <MenuItem
              onClick={() => {
                handleClosePdfMenu();
                onDownloadPlainText();
              }}
            >
              <ListItemIcon>
                <NotesRoundedIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadTxtItem', 'Texto Plano ATS (.txt)')}
                secondary={t('preview:toolbar.downloadTxtDesc', 'Para copiar y pegar en portales ATS')}
                slotProps={{
                  primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.7rem' } },
                }}
              />
            </MenuItem>
          )}

          {onCopyPlainText && (
            <MenuItem
              onClick={() => {
                handleClosePdfMenu();
                handleCopyAts();
              }}
            >
              <ListItemIcon>
                <ContentCopyRoundedIcon fontSize="small" color={copiedAts ? 'success' : 'action'} />
              </ListItemIcon>
              <ListItemText
                primary={copiedAts ? t('common:status.copied', '¡Copiado!') : t('preview:toolbar.copyTxtItem', 'Copiar Texto ATS')}
                secondary={t('preview:toolbar.copyTxtDesc', 'Copia el texto limpio al portapapeles')}
                slotProps={{
                  primary: { sx: { fontSize: '0.82rem', fontWeight: 700, color: copiedAts ? 'success.main' : 'inherit' } },
                  secondary: { sx: { fontSize: '0.7rem' } },
                }}
              />
            </MenuItem>
          )}

          {onDownloadMarkdown && <Divider sx={{ my: 0.5 }} />}

          {onDownloadMarkdown && (
            <MenuItem
              onClick={() => {
                handleClosePdfMenu();
                onDownloadMarkdown();
              }}
            >
              <ListItemIcon>
                <ArticleRoundedIcon fontSize="small" color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadMdItem', 'Descargar Markdown (.md)')}
                secondary={t('preview:toolbar.downloadMdDesc', 'Documento fuente en Markdown')}
                slotProps={{
                  primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.7rem' } },
                }}
              />
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Paper>
  );
};
