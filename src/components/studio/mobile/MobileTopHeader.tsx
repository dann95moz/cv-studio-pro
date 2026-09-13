import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Divider,
  Switch,
  useTheme,
  alpha,
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../../theme/ThemeContext';
import { APP_LINKS } from '../../../constants/links';
import { LANGUAGE_DEFINITIONS, SupportedLanguage } from '../../../constants/languages';
import { WizardStep } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { hapticsService } from '../../../core/haptics';

export interface MobileTopHeaderProps {
  currentStepNumber?: number;
  totalSteps?: number;
  stepTitle: string;
  onOpenSync?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenApplications?: () => void;
  isWizard?: boolean;
  onSelectStep?: (step: WizardStep) => void;
  activeWizardStep?: WizardStep;
}

/**
 * Mobile-First Top Header (Step progress, step title & ••• overflow Bottom Sheet).
 * Adheres strictly to mobile-first-ux-rules.md:
 * - Single row (52px-56px).
 * - ZERO floating popup menus: all secondary actions open as slide-up Bottom Sheets within the Thumb Zone.
 */
export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  currentStepNumber = 3,
  totalSteps = 3,
  stepTitle,
  onOpenSync,
  onOpenWalkthrough,
  onOpenApplications,
  isWizard = true,
  onSelectStep,
  activeWizardStep = 'preview',
}) => {
  const { t, i18n } = useTranslation(['common', 'profile', 'preview']);
  const theme = useTheme();
  const { mode, toggleThemeMode } = useThemeMode();

  const [isOptionsSheetOpen, setIsOptionsSheetOpen] = useState<boolean>(false);
  const [activeSheetView, setActiveSheetView] = useState<'main' | 'language'>('main');
  const [isStepSheetOpen, setIsStepSheetOpen] = useState<boolean>(false);

  const progressPercent = (currentStepNumber / totalSteps) * 100;
  const currentLang = (i18n.language || 'es').slice(0, 2).toUpperCase();

  const handleOpenOptions = () => {
    hapticsService.impactLight();
    setActiveSheetView('main');
    setIsOptionsSheetOpen(true);
  };

  const handleCloseOptions = () => {
    setIsOptionsSheetOpen(false);
    setActiveSheetView('main');
  };

  const handleToggleTheme = () => {
    hapticsService.impactLight();
    toggleThemeMode();
  };

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    hapticsService.impactLight();
    i18n.changeLanguage(langCode);
    handleCloseOptions();
  };

  const wizardStepOptions: Array<{ id: 'profile' | 'target' | 'preview'; stepNumber: number; title: string }> = [
    { id: 'profile', stepNumber: 1, title: t('profile:stepper.profileShortLabel', 'Datos Maestro') },
    { id: 'target', stepNumber: 2, title: t('profile:stepper.targetShortLabel', 'Oferta y Vacante') },
    { id: 'preview', stepNumber: 3, title: t('profile:stepper.previewShortLabel', 'CV y PDF') },
  ];

  return (
    <Box
      className="no-print mobile-top-header"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pt: 'max(env(safe-area-inset-top), 0px)',
        position: 'relative',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          height: 52,
        }}
      >
        {isWizard && activeWizardStep === 'preview' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStep?.('target');
              }}
              sx={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'text.secondary',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
                '&:hover': { color: 'primary.main' },
                '&:active': { opacity: 0.7 },
              }}
            >
              {t('preview:toolbar.step2BreadcrumbPrefix', 'Vacante Objetivo')}
            </Typography>
            <Typography
              component="span"
              sx={{
                color: 'text.disabled',
                mx: 0.25,
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              &gt;
            </Typography>
            <Typography
              component="span"
              onClick={
                onSelectStep
                  ? () => {
                      hapticsService.impactLight();
                      setIsStepSheetOpen(true);
                    }
                  : undefined
              }
              sx={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: 'text.primary',
                cursor: onSelectStep ? 'pointer' : 'default',
                letterSpacing: '-0.01em',
                '&:active': onSelectStep ? { opacity: 0.7 } : undefined,
              }}
            >
              {t('preview:toolbar.step3Breadcrumb', 'CV en Vivo')}
            </Typography>
          </Box>
        ) : (
          <Box
            onClick={
              isWizard && onSelectStep
                ? () => {
                    hapticsService.impactLight();
                    setIsStepSheetOpen(true);
                  }
                : undefined
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: isWizard && onSelectStep ? 'pointer' : 'default',
              userSelect: 'none',
              '&:active': isWizard && onSelectStep ? { opacity: 0.7 } : undefined,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              {isWizard
                ? t('common:nav.stepCounter', 'Paso {{current}} de {{total}} · {{title}}', {
                    current: currentStepNumber,
                    total: totalSteps,
                    title: stepTitle,
                  })
                : stepTitle}
            </Typography>
          </Box>
        )}

        <IconButton
          size="small"
          onClick={handleOpenOptions}
          aria-label={t('common:nav.settings', 'Configuración')}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <SettingsRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Subtle Step Progress Line */}
      {isWizard && (
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            '& .MuiLinearProgress-bar': {
              bgcolor: 'primary.main',
              borderRadius: '0 2px 2px 0',
            },
          }}
        />
      )}

      {/* Step Selector Bottom Sheet (when tapping step title) */}
      {isWizard && onSelectStep && (
        <Drawer
          anchor="bottom"
          open={isStepSheetOpen}
          onClose={() => setIsStepSheetOpen(false)}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: RADIUS_TOKENS.xl,
                borderTopRightRadius: RADIUS_TOKENS.xl,
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                pt: 1,
                pb: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 24px)',
                px: 2,
                boxShadow: theme.shadows[16],
              },
            },
          }}
        >
          {/* Drag Handle */}
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: RADIUS_TOKENS.full,
              bgcolor: 'divider',
              mx: 'auto',
              mb: 1.5,
              mt: 0.5,
            }}
          />

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
              {t('common:nav.stepsTitle', 'Pasos del Estudio')}
            </Typography>
            <IconButton size="small" onClick={() => setIsStepSheetOpen(false)} sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {wizardStepOptions.map((opt) => {
              const isSelected = activeWizardStep === opt.id;
              return (
                <ListItemButton
                  key={opt.id}
                  selected={isSelected}
                  onClick={() => {
                    hapticsService.impactLight();
                    onSelectStep(opt.id);
                    setIsStepSheetOpen(false);
                  }}
                  sx={{
                    py: 1.75,
                    px: 2,
                    borderRadius: RADIUS_TOKENS.lg,
                    border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        bgcolor: isSelected ? 'primary.main' : alpha(theme.palette.text.primary, 0.06),
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {opt.stepNumber}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: isSelected ? 700 : 500, color: 'text.primary' }}>
                      {opt.title}
                    </Typography>
                  </Box>
                  {isSelected && <CheckRoundedIcon color="primary" fontSize="small" />}
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}

      {/* Global ••• Overflow Bottom Sheet (Thumb Zone Ergonomics) */}
      <Drawer
        anchor="bottom"
        open={isOptionsSheetOpen}
        onClose={handleCloseOptions}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: RADIUS_TOKENS.xl,
              borderTopRightRadius: RADIUS_TOKENS.xl,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              pt: 1,
              pb: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 24px)',
              px: 2,
              boxShadow: theme.shadows[16],
            },
          },
        }}
      >
        {/* Drag Handle */}
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: RADIUS_TOKENS.full,
            bgcolor: 'divider',
            mx: 'auto',
            mb: 1.5,
            mt: 0.5,
          }}
        />

        {activeSheetView === 'main' ? (
          <>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
                {t('common:nav.settings', 'Configuración')}
              </Typography>
              <IconButton size="small" onClick={handleCloseOptions} sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {/* App Language Selector */}
              <ListItemButton
                onClick={() => {
                  hapticsService.impactLight();
                  setActiveSheetView('language');
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  <LanguageRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('common:nav.appLanguage', 'Idioma de la app')}
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {LANGUAGE_DEFINITIONS[i18n.language as SupportedLanguage]?.nativeName || currentLang}
                  </Typography>
                  <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </Box>
              </ListItemButton>

              {/* Theme Switcher */}
              <ListItemButton
                onClick={handleToggleTheme}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  {mode === 'dark' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={t('common:nav.theme', 'Tema')}
                  secondary={mode === 'dark' ? t('common:nav.dark', 'Oscuro') : t('common:nav.light', 'Claro')}
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }}
                />
                <Switch
                  checked={mode === 'dark'}
                  onChange={handleToggleTheme}
                  edge="end"
                  size="small"
                  slotProps={{ input: { 'aria-label': 'theme switcher' } }}
                />
              </ListItemButton>

              {/* View Intro Walkthrough */}
              {onOpenWalkthrough && (
                <ListItemButton
                  onClick={() => {
                    hapticsService.impactLight();
                    handleCloseOptions();
                    onOpenWalkthrough();
                  }}
                  sx={{
                    py: 1.5,
                    px: 1.75,
                    borderRadius: RADIUS_TOKENS.lg,
                    '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                    <AutoStoriesRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('common:nav.viewWalkthrough', 'Ver introducción')}
                    slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }}
                  />
                  <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </ListItemButton>
              )}

              <Divider sx={{ my: 0.75 }} />

              {/* View on GitHub */}
              <ListItemButton
                component="a"
                href={APP_LINKS.GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCloseOptions}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.primary' }}>
                  <GitHubIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('common:nav.viewGithub', 'Ver en GitHub')}
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }}
                />
                <OpenInNewRoundedIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              </ListItemButton>
            </List>
          </>
        ) : (
          <>
            {/* Language Sub-View Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    hapticsService.impactLight();
                    setActiveSheetView('main');
                  }}
                  sx={{ color: 'text.primary', ml: -0.75 }}
                >
                  <ArrowBackRoundedIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
                  {t('common:nav.appLanguage', 'Idioma de la app')}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleCloseOptions} sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {Object.values(LANGUAGE_DEFINITIONS).map((lang) => {
                const isSelected = i18n.language?.startsWith(lang.code);
                return (
                  <ListItemButton
                    key={lang.code}
                    selected={isSelected}
                    onClick={() => handleSelectLanguage(lang.code as SupportedLanguage)}
                    sx={{
                      py: 1.75,
                      px: 2,
                      borderRadius: RADIUS_TOKENS.lg,
                      border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: isSelected ? 700 : 500, color: 'text.primary' }}>
                        {lang.nativeName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        ({lang.code.toUpperCase()})
                      </Typography>
                    </Box>
                    {isSelected && <CheckRoundedIcon color="primary" fontSize="small" />}
                  </ListItemButton>
                );
              })}
            </List>
          </>
        )}
      </Drawer>
    </Box>
  );
};
