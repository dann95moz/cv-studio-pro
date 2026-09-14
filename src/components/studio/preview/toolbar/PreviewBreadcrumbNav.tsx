import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { useTranslation } from 'react-i18next';
import { WizardStep } from '../../../../types';
import { RADIUS_TOKENS } from '../../../../theme/dimensions';

export interface PreviewBreadcrumbNavProps {
  onSelectWizardStep?: (step: WizardStep) => void;
  previewDocType?: 'cv' | 'cover-letter';
  onPreviewDocTypeChange?: (docType: 'cv' | 'cover-letter') => void;
}

/**
 * PreviewBreadcrumbNav
 * Presentational dumb subcomponent rendering the interactive breadcrumb to jump between steps
 * and the switcher between CV and Cover Letter.
 */
export const PreviewBreadcrumbNav: React.FC<PreviewBreadcrumbNavProps> = ({
  onSelectWizardStep,
  previewDocType = 'cv',
  onPreviewDocTypeChange,
}) => {
  const { t } = useTranslation(['preview']);
  const theme = useTheme();

  const [stepMenuAnchor, setStepMenuAnchor] = useState<null | HTMLElement>(null);
  const [docMenuAnchor, setDocMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenStepMenu = (e: React.MouseEvent<HTMLElement>) => {
    setStepMenuAnchor(e.currentTarget);
  };

  const handleCloseStepMenu = () => {
    setStepMenuAnchor(null);
  };

  const handleOpenDocMenu = (e: React.MouseEvent<HTMLElement>) => {
    setDocMenuAnchor(e.currentTarget);
  };

  const handleCloseDocMenu = () => {
    setDocMenuAnchor(null);
  };

  return (
    <>
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
              borderColor: alpha(
                previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main,
                0.3
              ),
              bgcolor: alpha(
                previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main,
                0.06
              ),
              '&:hover': {
                bgcolor: alpha(
                  previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.secondary.main,
                  0.12
                ),
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
                <EmailRoundedIcon
                  fontSize="small"
                  color={previewDocType === 'cover-letter' ? 'secondary' : 'inherit'}
                />
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
    </>
  );
};
