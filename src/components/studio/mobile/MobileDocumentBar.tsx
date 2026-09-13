import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
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
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import { CvTranslationVariant } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { hapticsService } from '../../../core/haptics';

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
 * Adheres strictly to mobile-first-ux-rules.md:
 * - 2 clean controls, maximum canvas clearance.
 * - ZERO floating menus: both pickers open as slide-up Bottom Sheets in the Thumb Zone.
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

  const [isDocSheetOpen, setIsDocSheetOpen] = useState<boolean>(false);
  const [isLangSheetOpen, setIsLangSheetOpen] = useState<boolean>(false);

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
        onClick={() => {
          hapticsService.impactLight();
          setIsDocSheetOpen(true);
        }}
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
        onClick={() => {
          hapticsService.impactLight();
          setIsLangSheetOpen(true);
        }}
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

      {/* Document Selector Bottom Sheet */}
      <Drawer
        anchor="bottom"
        open={isDocSheetOpen}
        onClose={() => setIsDocSheetOpen(false)}
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
            {t('preview:toolbar.selectDocType', 'Tipo de documento')}
          </Typography>
          <IconButton size="small" onClick={() => setIsDocSheetOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <ListItemButton
            selected={previewDocType === 'cv'}
            onClick={() => {
              hapticsService.impactLight();
              onPreviewDocTypeChange('cv');
              setIsDocSheetOpen(false);
            }}
            sx={{
              py: 1.75,
              px: 2,
              borderRadius: RADIUS_TOKENS.lg,
              border: `1px solid ${previewDocType === 'cv' ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: previewDocType === 'cv' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ArticleRoundedIcon color={previewDocType === 'cv' ? 'primary' : 'inherit'} />
              <Typography variant="body1" sx={{ fontWeight: previewDocType === 'cv' ? 700 : 500, color: 'text.primary' }}>
                {t('preview:toolbar.docCv', 'Currículum')}
              </Typography>
            </Box>
            {previewDocType === 'cv' && <CheckRoundedIcon color="primary" fontSize="small" />}
          </ListItemButton>

          <ListItemButton
            selected={previewDocType === 'cover-letter'}
            onClick={() => {
              hapticsService.impactLight();
              onPreviewDocTypeChange('cover-letter');
              setIsDocSheetOpen(false);
            }}
            sx={{
              py: 1.75,
              px: 2,
              borderRadius: RADIUS_TOKENS.lg,
              border: `1px solid ${previewDocType === 'cover-letter' ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: previewDocType === 'cover-letter' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailRoundedIcon color={previewDocType === 'cover-letter' ? 'primary' : 'inherit'} />
              <Typography variant="body1" sx={{ fontWeight: previewDocType === 'cover-letter' ? 700 : 500, color: 'text.primary' }}>
                {t('preview:toolbar.docCoverLetter', 'Carta de presentación')}
              </Typography>
            </Box>
            {previewDocType === 'cover-letter' && <CheckRoundedIcon color="primary" fontSize="small" />}
          </ListItemButton>
        </List>
      </Drawer>

      {/* Language Variant Bottom Sheet */}
      <Drawer
        anchor="bottom"
        open={isLangSheetOpen}
        onClose={() => setIsLangSheetOpen(false)}
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
            {t('preview:toolbar.selectDocLanguage', 'Idioma del documento')}
          </Typography>
          <IconButton size="small" onClick={() => setIsLangSheetOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Base Language Option */}
          <ListItemButton
            selected={!activeLanguage || activeLanguage === baseLanguage}
            onClick={() => {
              hapticsService.impactLight();
              setIsLangSheetOpen(false);
              onLanguageChange(baseLanguage || 'es');
            }}
            sx={{
              py: 1.75,
              px: 2,
              borderRadius: RADIUS_TOKENS.lg,
              border: `1px solid ${(!activeLanguage || activeLanguage === baseLanguage) ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: (!activeLanguage || activeLanguage === baseLanguage) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: (!activeLanguage || activeLanguage === baseLanguage) ? 700 : 500, color: 'text.primary' }}>
              {`${(baseLanguage || 'es').toUpperCase()} (${t('preview:translation.baseLang', 'Original')})`}
            </Typography>
            {(!activeLanguage || activeLanguage === baseLanguage) && <CheckRoundedIcon color="primary" fontSize="small" />}
          </ListItemButton>

          {/* Existing Translation Variants */}
          {translations &&
            Object.values(translations).map((variant) => {
              const isSelected = activeLanguage === variant.language;
              return (
                <ListItemButton
                  key={variant.language}
                  selected={isSelected}
                  onClick={() => {
                    hapticsService.impactLight();
                    setIsLangSheetOpen(false);
                    onLanguageChange(variant.language);
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: isSelected ? 700 : 500, color: 'text.primary' }}>
                      {`${variant.language.toUpperCase()} (${variant.languageLabel || variant.language})`}
                    </Typography>
                    {variant.isOutdated && (
                      <Chip
                        size="small"
                        label={t('preview:translation.outdatedBadge', 'Outdated')}
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    )}
                  </Box>
                  {isSelected && <CheckRoundedIcon color="primary" fontSize="small" />}
                </ListItemButton>
              );
            })}

          <Divider sx={{ my: 0.5 }} />

          {/* Translate with AI Action */}
          <ListItemButton
            onClick={() => {
              hapticsService.impactLight();
              setIsLangSheetOpen(false);
              onOpenTranslateModal?.();
            }}
            sx={{
              py: 1.75,
              px: 2,
              borderRadius: RADIUS_TOKENS.lg,
              border: `1px dashed ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {t('preview:translation.translateNewAction', '+ Traducir a otro idioma con IA...')}
            </Typography>
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
};
