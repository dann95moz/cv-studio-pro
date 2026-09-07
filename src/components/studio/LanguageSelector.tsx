import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/types';

export interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'full';
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  showLabel = false,
}) => {
  const { i18n, t } = useTranslation('common');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLangCode = (i18n.language?.substring(0, 2) as SupportedLanguage) || 'en';
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('language.chooseLanguage', 'Select language')}>
        <Button
          onClick={handleClick}
          size="small"
          variant="outlined"
          color="inherit"
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          startIcon={<LanguageRoundedIcon sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' } }} />}
          sx={{
            minWidth: variant === 'compact' ? 36 : 'auto',
            height: { xs: 28, sm: 32 },
            px: { xs: 0.9, sm: 1.25 },
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            fontWeight: 700,
            fontSize: { xs: '0.75rem', sm: '0.82rem' },
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            {currentLang.code.toUpperCase()}
          </Typography>
        </Button>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 190,
              mt: 0.75,
              '& .MuiMenuItem-root': {
                px: 1.75,
                py: 1,
                borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                mx: 0.75,
                my: 0.25,
                transition: 'all 0.15s ease',
              },
            },
          },
        }}
      >

        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('language.selectLanguage', 'Language')}
          </Typography>
        </Box>

        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLang.code === lang.code;
          return (
            <MenuItem
              key={lang.code}
              selected={isSelected}
              onClick={() => handleSelectLanguage(lang.code)}
            >
              <ListItemIcon sx={{ minWidth: 28, fontSize: '1.1rem' }}>
                {lang.flag}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                    {lang.nativeLabel}
                  </Typography>
                }
                secondary={
                  lang.nativeLabel !== lang.label ? (
                    <Typography variant="caption" color="text.secondary">
                      {lang.label}
                    </Typography>
                  ) : null
                }
              />
              {isSelected && (
                <CheckRoundedIcon
                  fontSize="small"
                  color="primary"
                  sx={{ ml: 1, fontSize: '1.1rem' }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
