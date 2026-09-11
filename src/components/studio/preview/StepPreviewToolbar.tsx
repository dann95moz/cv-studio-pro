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
  ButtonBase,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { VersionSelectorDropdown } from './VersionSelectorDropdown';
import { useTranslation } from 'react-i18next';
import { StepPreviewToolbarProps, PageFormat } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

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
  savedVersions = [],
  activeVersionId = null,
  companyName,
  targetRole,
  matchScore = 0,
  onSelectVersion,
  onPinAsGeneric,
  onUnpinGeneric,
  onSaveAsGeneric,
  onCompareAgainstGeneric,
  onOpenAdaptModal,
}) => {
  const { t } = useTranslation(['preview', 'target', 'common']);
  const theme = useTheme();

  const [stepMenuAnchor, setStepMenuAnchor] = useState<null | HTMLElement>(null);
  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [docMenuAnchor, setDocMenuAnchor] = useState<null | HTMLElement>(null);
  const [copiedAts, setCopiedAts] = useState<boolean>(false);

  const handleOpenDocMenu = (e: React.MouseEvent<HTMLElement>) => {
    setDocMenuAnchor(e.currentTarget);
  };

  const handleCloseDocMenu = () => {
    setDocMenuAnchor(null);
  };

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
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 32,
                borderRadius: RADIUS_TOKENS.full,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                overflow: 'hidden',
                transition: 'border-color 0.15s ease',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                },
              }}
            >
              {/* Segment 1: Step 2 Link */}
              <Tooltip title={t('preview:toolbar.backToStep2', 'Ir a Paso 2: Vacante Objetivo')}>
                <ButtonBase
                  onClick={() => onSelectWizardStep('target')}
                  aria-label={t('preview:toolbar.backToStep2', 'Ir a Paso 2: Vacante Objetivo')}
                  sx={{
                    px: 1.2,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('preview:toolbar.step2BreadcrumbPrefix', 'Vacante Objetivo')}
                  </Typography>
                </ButtonBase>
              </Tooltip>

              {/* Breadcrumb Separator */}
              <Typography
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'text.disabled',
                  userSelect: 'none',
                  px: 0.1,
                }}
              >
                ›
              </Typography>

              {/* Segment 2: Step 3 Active Label */}
              <Box
                sx={{
                  px: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  userSelect: 'none',
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('preview:toolbar.step3Breadcrumb', 'CV en Vivo')}
                </Typography>
              </Box>

              {/* Segment 3: All Steps Jump Chevron */}
              <Tooltip title={t('preview:toolbar.allStepsMenu', 'Saltar a cualquier paso del wizard')}>
                <IconButton
                  size="small"
                  onClick={handleOpenStepMenu}
                  aria-label={t('preview:toolbar.allStepsMenu', 'Saltar a cualquier paso del wizard')}
                  aria-haspopup="true"
                  aria-expanded={Boolean(stepMenuAnchor)}
                  sx={{
                    p: 0.5,
                    mr: 0.3,
                    color: 'text.secondary',
                    borderRadius: RADIUS_TOKENS.full,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: 'primary.main',
                    },
                  }}
                >
                  <ArrowDropDownRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              anchorEl={stepMenuAnchor}
              open={Boolean(stepMenuAnchor)}
              onClose={handleCloseStepMenu}
              slotProps={{ paper: { sx: { mt: 0.75, minWidth: 290, p: 0.5 } } }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseStepMenu();
                  onSelectWizardStep('profile');
                }}
                sx={{ borderRadius: RADIUS_TOKENS.sm, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: RADIUS_TOKENS.full,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    1
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {t('preview:toolbar.step1Label', 'Paso 1: Perfil del Candidato')}
                      </Typography>
                      <Chip
                        size="small"
                        label={t('preview:toolbar.stepReady', 'Listo')}
                        color="success"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    </Box>
                  }
                  secondary={t('preview:toolbar.step1Desc', 'Editar master data y trayectoria')}
                  slotProps={{
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleCloseStepMenu();
                  onSelectWizardStep('target');
                }}
                sx={{ borderRadius: RADIUS_TOKENS.sm, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: RADIUS_TOKENS.full,
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    2
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {t('preview:toolbar.step2Label', 'Paso 2: Vacante Objetivo')}
                      </Typography>
                      <Chip
                        size="small"
                        label={t('preview:toolbar.stepReady', 'Listo')}
                        color="success"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    </Box>
                  }
                  secondary={t('preview:toolbar.step2Desc', 'Ajustar descripción y calibración ATS')}
                  slotProps={{
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>

              <MenuItem
                selected
                onClick={handleCloseStepMenu}
                sx={{ borderRadius: RADIUS_TOKENS.sm }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: RADIUS_TOKENS.full,
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    3
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                        {t('preview:toolbar.step3Label', 'Paso 3: CV en Vivo y Exportación')}
                      </Typography>
                      <Chip
                        size="small"
                        label={t('preview:toolbar.stepCurrent', 'Paso actual')}
                        color="primary"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    </Box>
                  }
                  secondary={t('preview:toolbar.step3Desc', 'Paso actual (edición en tiempo real)')}
                  slotProps={{
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>
            </Menu>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
          </>
        )}

        {/* CV Saved Versions & Generic Selector Dropdown */}
        {onSelectVersion && onPinAsGeneric && onSaveAsGeneric && onCompareAgainstGeneric && (
          <>
            <VersionSelectorDropdown
              savedVersions={savedVersions}
              activeVersionId={activeVersionId}
              currentCompanyName={companyName}
              currentTargetRole={targetRole}
              currentMatchScore={matchScore}
              onSelectVersion={onSelectVersion}
              onPinAsGeneric={onPinAsGeneric}
              onUnpinGeneric={onUnpinGeneric}
              onSaveAsGeneric={onSaveAsGeneric}
              onCompareAgainstGeneric={onCompareAgainstGeneric}
              onOpenAdaptModal={onOpenAdaptModal}
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
          </>
        )}

        {/* Document Type Switcher Dropdown */}
        {onPreviewDocTypeChange && (
          <>
            <Button
              size="small"
              variant="outlined"
              color={previewDocType === 'cv' ? 'primary' : 'secondary'}
              onClick={handleOpenDocMenu}
              startIcon={
                previewDocType === 'cv' ? (
                  <ArticleRoundedIcon sx={{ fontSize: '15px !important' }} />
                ) : (
                  <EmailRoundedIcon sx={{ fontSize: '15px !important' }} />
                )
              }
              endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18 }} />}
              sx={{
                height: 28,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                px: 1.2,
                borderColor: alpha(previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main, 0.3),
                bgcolor: alpha(previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main, 0.06),
                '&:hover': {
                  bgcolor: alpha(previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main, 0.12),
                },
              }}
            >
              {previewDocType === 'cv'
                ? t('preview:toolbar.docCv', 'Currículum (CV)')
                : t('preview:toolbar.docCoverLetter', 'Carta de Presentación')}
            </Button>

            <Menu
              anchorEl={docMenuAnchor}
              open={Boolean(docMenuAnchor)}
              onClose={handleCloseDocMenu}
              slotProps={{ paper: { sx: { mt: 0.5, minWidth: 230 } } }}
            >
              <MenuItem
                selected={previewDocType === 'cv'}
                onClick={() => {
                  onPreviewDocTypeChange('cv');
                  handleCloseDocMenu();
                }}
              >
                <ListItemIcon>
                  <ArticleRoundedIcon fontSize="small" color={previewDocType === 'cv' ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.docCv', 'Currículum (CV)')}
                  secondary={t('preview:toolbar.docCvDesc', 'Documento ATS principal adaptado')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.82rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>
              <MenuItem
                selected={previewDocType === 'cover-letter'}
                onClick={() => {
                  onPreviewDocTypeChange('cover-letter');
                  handleCloseDocMenu();
                }}
              >
                <ListItemIcon>
                  <EmailRoundedIcon fontSize="small" color={previewDocType === 'cover-letter' ? 'secondary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.docCoverLetter', 'Carta de Presentación')}
                  secondary={t('preview:toolbar.docCoverLetterDesc', 'Carta motivacional personalizada')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.82rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.7rem' } },
                  }}
                />
              </MenuItem>
            </Menu>
          </>
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

        {/* Quick Compare vs Generic Action */}
        {onCompareAgainstGeneric && (
          <Tooltip title={t('preview:versionSelector.compareAgainstGeneric', 'Comparar versión actual contra CV Genérico')}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: '15px !important' }} />}
              onClick={() => onCompareAgainstGeneric()}
              sx={{
                height: 28,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                px: 1.2,
                display: { xs: 'none', lg: 'inline-flex' },
              }}
            >
              {t('preview:versionSelector.compareVsGenericBtn', 'Comparar vs Genérico')}
            </Button>
          </Tooltip>
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

        {/* 4. Adapt to Another Job Offer Action (Primary tinted pill button) */}
        {onOpenAdaptModal && (
          <Tooltip title={t('preview:toolbar.adaptToNewOfferTooltip', 'Adaptar este CV a una nueva oferta laboral sin perder la actual')}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<PostAddRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={onOpenAdaptModal}
              disabled={isGenerating}
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.6,
                py: 0.5,
                minHeight: 34,
                display: { xs: 'none', md: 'inline-flex' },
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>
                {t('preview:toolbar.adaptToNewOffer', 'Adaptar a otra oferta')}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' } }}>
                {t('preview:toolbar.adaptToNewOfferShort', 'Nueva Oferta')}
              </Box>
            </Button>
          </Tooltip>
        )}

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
