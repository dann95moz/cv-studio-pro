import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../../theme/ThemeContext';
import { APP_LINKS } from '../../../constants/links';
import { LANGUAGE_DEFINITIONS, SupportedLanguage } from '../../../constants/languages';
import { WizardStep } from '../../../types';

export interface MobileTopHeaderProps {
  currentStepNumber?: number;
  totalSteps?: number;
  stepTitle: string;
  onOpenSync: () => void;
  isWizard?: boolean;
  onSelectStep?: (step: WizardStep) => void;
  activeWizardStep?: WizardStep;
}

/**
 * Mobile-First Top Header (Step progress, step title & ••• overflow menu).
 * Adheres strictly to mobile-first-ux-rules.md (single row, 52-56px).
 */
export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  currentStepNumber = 3,
  totalSteps = 3,
  stepTitle,
  onOpenSync,
  isWizard = true,
  onSelectStep,
  activeWizardStep = 'preview',
}) => {
  const { t, i18n } = useTranslation(['common', 'profile', 'preview']);
  const theme = useTheme();
  const { mode, toggleThemeMode } = useThemeMode();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [stepMenuAnchor, setStepMenuAnchor] = useState<null | HTMLElement>(null);

  const progressPercent = (currentStepNumber / totalSteps) * 100;
  const currentLang = (i18n.language || 'es').slice(0, 2).toUpperCase();

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleToggleTheme = () => {
    toggleThemeMode();
    handleCloseMenu();
  };

  const handleSyncClick = () => {
    handleCloseMenu();
    onOpenSync();
  };

  const handleOpenLangMenu = (e: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(e.currentTarget);
  };

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
    setLangMenuAnchor(null);
    handleCloseMenu();
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
              onClick={onSelectStep ? (e) => setStepMenuAnchor(e.currentTarget) : undefined}
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
            onClick={isWizard && onSelectStep ? (e) => setStepMenuAnchor(e.currentTarget) : undefined}
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
          onClick={handleOpenMenu}
          aria-label="more options"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <MoreHorizRoundedIcon />
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

      {/* Step Selector Menu (when clicking step title) */}
      {isWizard && onSelectStep && (
        <Menu
          anchorEl={stepMenuAnchor}
          open={Boolean(stepMenuAnchor)}
          onClose={() => setStepMenuAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 200,
              },
            },
          }}
        >
          {wizardStepOptions.map((opt) => (
            <MenuItem
              key={opt.id}
              selected={activeWizardStep === opt.id}
              onClick={() => {
                onSelectStep(opt.id);
                setStepMenuAnchor(null);
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: activeWizardStep === opt.id ? 700 : 500 }}>
                {t('common:nav.stepCounter', 'Paso {{current}} de {{total}} · {{title}}', {
                  current: opt.stepNumber,
                  total: 3,
                  title: opt.title,
                })}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Primary ••• Overflow Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 230,
            },
          },
        }}
      >
        {/* App Language Selector */}
        <MenuItem onClick={handleOpenLangMenu}>
          <ListItemIcon>
            <LanguageRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:nav.appLanguage', 'Idioma app')} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1.5 }}>
            {currentLang} ⌄
          </Typography>
        </MenuItem>

        {/* Theme Mode Switcher */}
        <MenuItem onClick={handleToggleTheme}>
          <ListItemIcon>
            {mode === 'dark' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={t('common:nav.theme', 'Tema')} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1.5 }}>
            {mode === 'dark' ? t('common:nav.dark', 'Oscuro') : t('common:nav.light', 'Claro')}
          </Typography>
        </MenuItem>

        {/* Multidevice Sync (QR) */}
        <MenuItem onClick={handleSyncClick}>
          <ListItemIcon>
            <QrCode2RoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:nav.syncQr', 'Sincronizar (QR)')} />
        </MenuItem>

        {/* View on GitHub */}
        <MenuItem
          component="a"
          href={APP_LINKS.GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCloseMenu}
        >
          <ListItemIcon>
            <GitHubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:nav.viewGithub', 'Ver en GitHub')} />
        </MenuItem>
      </Menu>

      {/* Language Picker Sub-Menu */}
      <Menu
        anchorEl={langMenuAnchor}
        open={Boolean(langMenuAnchor)}
        onClose={() => setLangMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 180,
            },
          },
        }}
      >
        {Object.values(LANGUAGE_DEFINITIONS).map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language?.startsWith(lang.code)}
            onClick={() => handleSelectLanguage(lang.code as SupportedLanguage)}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {lang.nativeName} ({lang.code.toUpperCase()})
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
