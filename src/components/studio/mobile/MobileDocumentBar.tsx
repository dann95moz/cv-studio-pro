import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';
import { CvTranslationVariant } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MobileDocumentBarProps {
  previewDocType: 'cv' | 'cover-letter';
  onPreviewDocTypeChange: (docType: 'cv' | 'cover-letter') => void;
  activeLanguage: string;
  baseLanguage: string;
  translations?: Record<string, CvTranslationVariant>;
  onLanguageChange: (lang: string) => void;
  onOpenTranslateModal?: () => void;
  isLanguageOutdated?: boolean;
}

/**
 * Mobile-First Secondary Document Bar (Document Switcher + Language Variant Selector).
 * Adheres strictly to mobile-first-ux-rules.md (2 clean controls, maximum canvas clearance).
 */
export const MobileDocumentBar: React.FC<MobileDocumentBarProps> = ({
  previewDocType,
  onPreviewDocTypeChange,
  activeLanguage = 'es',
  baseLanguage = 'es',
  translations = {},
  onLanguageChange,
  onOpenTranslateModal,
  isLanguageOutdated = false,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  const [docMenuAnchor, setDocMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const isCv = previewDocType === 'cv';
  const displayDocTitle = isCv
    ? t('preview:toolbar.docCv', 'Currículum')
    : t('preview:toolbar.docCoverLetter', 'Carta de presentación');

  return (
    <Box
      className="no-print mobile-document-bar"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        gap: 1.5,
      }}
    >
      {/* 1. Document Type Dropdown Button */}
      <Button
        size="medium"
        variant="outlined"
        onClick={(e) => setDocMenuAnchor(e.currentTarget)}
        startIcon={
          isCv ? (
            <ArticleRoundedIcon sx={{ fontSize: '18px !important', color: 'primary.main' }} />
          ) : (
            <EmailRoundedIcon sx={{ fontSize: '18px !important', color: 'primary.main' }} />
          )
        }
        endIcon={<ArrowDropDownRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
        sx={{
          flex: 1,
          justifyContent: 'space-between',
          height: 38,
          borderRadius: RADIUS_TOKENS.md,
          borderColor: 'divider',
          color: 'text.primary',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'none',
          px: 1.5,
          bgcolor: alpha(theme.palette.background.default, 0.6),
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}
        >
          {displayDocTitle}
        </Typography>
      </Button>

      {/* 2. Language Variant Dropdown Button */}
      <Button
        size="medium"
        variant="outlined"
        onClick={(e) => setLangMenuAnchor(e.currentTarget)}
        endIcon={<ArrowDropDownRoundedIcon sx={{ fontSize: 20, color: 'text.secondary', ml: -0.5 }} />}
        sx={{
          minWidth: 72,
          height: 38,
          borderRadius: RADIUS_TOKENS.md,
          borderColor: isLanguageOutdated ? 'warning.main' : 'divider',
          color: isLanguageOutdated ? 'warning.main' : 'text.primary',
          fontSize: '0.82rem',
          fontWeight: 700,
          textTransform: 'none',
          px: 1.25,
          bgcolor: isLanguageOutdated
            ? alpha(theme.palette.warning.main, 0.08)
            : alpha(theme.palette.background.default, 0.6),
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

      {/* Document Selector Menu */}
      <Menu
        anchorEl={docMenuAnchor}
        open={Boolean(docMenuAnchor)}
        onClose={() => setDocMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 220,
              borderRadius: RADIUS_TOKENS.md,
            },
          },
        }}
      >
        <MenuItem
          selected={previewDocType === 'cv'}
          onClick={() => {
            onPreviewDocTypeChange('cv');
            setDocMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <ArticleRoundedIcon fontSize="small" color={previewDocType === 'cv' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: previewDocType === 'cv' ? 700 : 500, fontSize: '0.85rem' }}>
                {t('preview:toolbar.docCv', 'Currículum')}
              </Typography>
            }
          />
          {previewDocType === 'cv' && <CheckRoundedIcon fontSize="small" color="primary" />}
        </MenuItem>

        <MenuItem
          selected={previewDocType === 'cover-letter'}
          onClick={() => {
            onPreviewDocTypeChange('cover-letter');
            setDocMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EmailRoundedIcon fontSize="small" color={previewDocType === 'cover-letter' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: previewDocType === 'cover-letter' ? 700 : 500, fontSize: '0.85rem' }}>
                {t('preview:toolbar.docCoverLetter', 'Carta de presentación')}
              </Typography>
            }
          />
          {previewDocType === 'cover-letter' && <CheckRoundedIcon fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>

      {/* Language Variant Menu */}
      <Menu
        anchorEl={langMenuAnchor}
        open={Boolean(langMenuAnchor)}
        onClose={() => setLangMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 210,
              borderRadius: RADIUS_TOKENS.md,
            },
          },
        }}
      >
        {/* Base Language Item */}
        <MenuItem
          selected={!activeLanguage || activeLanguage === baseLanguage}
          onClick={() => {
            setLangMenuAnchor(null);
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
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {`${(baseLanguage || 'es').toUpperCase()} (${t('preview:translation.baseLang', 'Original')})`}
              </Typography>
            }
          />
        </MenuItem>

        {/* Existing Translation Variants */}
        {translations &&
          Object.values(translations).map((variant) => (
            <MenuItem
              key={variant.language}
              selected={activeLanguage === variant.language}
              onClick={() => {
                setLangMenuAnchor(null);
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
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {`${variant.language.toUpperCase()} (${variant.languageLabel || variant.language})`}
                  </Typography>
                }
              />
              {variant.isOutdated && (
                <Chip
                  size="small"
                  label={t('preview:translation.outdatedBadge', 'Outdated')}
                  color="warning"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.62rem', height: 18 }}
                />
              )}
            </MenuItem>
          ))}

        <Divider sx={{ my: 0.5 }} />

        {/* Translate to new language option */}
        <MenuItem
          onClick={() => {
            setLangMenuAnchor(null);
            onOpenTranslateModal?.();
          }}
        >
          <ListItemIcon>
            <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                {t('preview:translation.translateNewAction', '+ Traducir a otro idioma...')}
              </Typography>
            }
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};
