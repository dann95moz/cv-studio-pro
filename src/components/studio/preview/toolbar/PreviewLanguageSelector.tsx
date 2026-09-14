import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useTranslation } from 'react-i18next';
import { CvTranslationVariant } from '../../../../types';

export interface PreviewLanguageSelectorProps {
  activeLanguage?: string;
  baseLanguage?: string;
  translations?: Record<string, CvTranslationVariant>;
  onLanguageChange: (lang: string) => void;
  onOpenTranslateModal?: () => void;
  isLanguageOutdated?: boolean;
  outdatedSectionsCount?: number;
  onQuickSyncOutdated?: () => void;
  isTranslating?: boolean;
}

/**
 * PreviewLanguageSelector
 * Presentational dumb subcomponent for selecting CV language variants,
 * opening the AI translation modal, and triggering quick-sync on outdated sections.
 */
export const PreviewLanguageSelector: React.FC<PreviewLanguageSelectorProps> = ({
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
  const { t } = useTranslation(['preview']);
  const theme = useTheme();

  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenLangMenu = (e: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(e.currentTarget);
  };

  const handleCloseLangMenu = () => {
    setLangMenuAnchor(null);
  };

  return (
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
            {!activeLanguage || activeLanguage === baseLanguage ? (
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
        {translations &&
          Object.values(translations).map((variant) => (
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
            startIcon={
              isTranslating ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <BoltRoundedIcon sx={{ fontSize: '14px !important' }} />
              )
            }
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
              : t('preview:toolbar.syncDiffBtn', 'Sincronizar cambios ({{count}})', {
                  count: outdatedSectionsCount || 1,
                })}
          </Button>
        </Tooltip>
      )}
    </>
  );
};
