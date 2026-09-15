import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ButtonBase,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { hapticsService } from '../../../core/haptics';

export interface NativeChoiceListProps {
  onSelectGuided: () => void;
  openFileDialog: () => void;
  onLoadSample: () => void;
  onOpenSync?: (tab?: 'export' | 'import') => void;
  isProcessing?: boolean;
  progressMessage?: string;
}

/**
 * NativeChoiceList
 * Clean, mobile-first entrance view for Step 1 onboarding:
 * - Squircle avatar icon header
 * - Centered title and subtitle
 * - 3 Stacked interactive option cards with featured "Importar CV"
 * - Centered sample profile trigger
 */
export const NativeChoiceList: React.FC<NativeChoiceListProps> = React.memo(({
  onSelectGuided,
  openFileDialog,
  onLoadSample,
  onOpenSync,
  isProcessing = false,
  progressMessage,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Ephemeral selection feedback for active touch
  const [selectedOption, setSelectedOption] = useState<'sync' | 'import' | 'form' | null>(null);

  useEffect(() => {
    if (selectedOption && !isProcessing) {
      const timer = setTimeout(() => {
        setSelectedOption(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedOption, isProcessing]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
        my: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 1. Centered Profile Squircle Icon */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: RADIUS_TOKENS.xl,
          bgcolor: isDark ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.primary.main, 0.20)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          color: 'primary.main',
        }}
      >
        <PersonOutlineRoundedIcon sx={{ fontSize: 36 }} />
      </Box>

      {/* 2. Main Title & Subtitle (Centered) */}
      <Box sx={{ mb: 3.5, px: 0.5, textAlign: 'center' }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.45rem', sm: '1.65rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            color: 'text.primary',
            mb: 0.75,
          }}
        >
          {t('profile:choice.title', '¿Cómo querés empezar tu perfil?')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.92rem',
            lineHeight: 1.4,
          }}
        >
          {t('profile:choice.nativeSubtitle', 'Elegí una opción para continuar.')}
        </Typography>
      </Box>

      {/* 3. Three Interactive Option Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%' }}>
        {/* Row 1: Sincronizar desde PC */}
        <ButtonBase
          onClick={() => {
            hapticsService.impactLight();
            setSelectedOption('sync');
            onOpenSync?.('import');
          }}
          sx={{
            width: '100%',
            py: 1.75,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            border: `1px solid ${selectedOption === 'sync' ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: selectedOption === 'sync'
              ? (isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff')
              : (isDark ? alpha(theme.palette.text.primary, 0.02) : 'background.paper'),
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: isDark ? alpha(theme.palette.text.primary, 0.05) : alpha(theme.palette.primary.main, 0.03),
              borderColor: alpha(theme.palette.primary.main, 0.35),
            },
            '&:active': {
              transform: 'scale(0.985)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: RADIUS_TOKENS.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : alpha(theme.palette.text.primary, 0.04),
                color: 'text.primary',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <QrCodeScannerRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.25, color: 'text.primary' }}>
                {t('profile:choice.syncCardTitleShort', 'Sincronizar desde PC')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                {t('profile:choice.syncCardShortDesc', 'Transferí tu CV con un código QR')}
              </Typography>
            </Box>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
        </ButtonBase>

        {/* Row 2: Importar CV (Featured / Recommended) */}
        <ButtonBase
          onClick={() => {
            hapticsService.impactLight();
            setSelectedOption('import');
            openFileDialog();
          }}
          sx={{
            width: '100%',
            py: 1.85,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            borderTop: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.primary.main, 0.28)}`,
            borderRight: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.primary.main, 0.28)}`,
            borderBottom: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.primary.main, 0.28)}`,
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.14) : alpha(theme.palette.primary.main, 0.07),
              borderColor: 'primary.main',
            },
            '&:active': {
              transform: 'scale(0.985)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: RADIUS_TOKENS.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.25, color: 'text.primary' }}>
                  {t('profile:choice.importCardTitleShort', 'Importar CV')}
                </Typography>
                <Chip
                  label={t('profile:choice.recommendedChipShort', 'Recomendado')}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: RADIUS_TOKENS.full,
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.14),
                    color: isDark ? '#7dd3fc' : '#0284c7',
                    border: 'none',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                {t('profile:choice.importCardShortDesc', 'Subí tu PDF, TXT o Markdown')}
              </Typography>
            </Box>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: 'primary.main', fontSize: 22, ml: 1, flexShrink: 0 }} />
        </ButtonBase>

        {/* Row 3: Formulario guiado */}
        <ButtonBase
          onClick={() => {
            hapticsService.impactLight();
            setSelectedOption('form');
            onSelectGuided();
          }}
          sx={{
            width: '100%',
            py: 1.75,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            border: `1px solid ${selectedOption === 'form' ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: selectedOption === 'form'
              ? (isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff')
              : (isDark ? alpha(theme.palette.text.primary, 0.02) : 'background.paper'),
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: isDark ? alpha(theme.palette.text.primary, 0.05) : alpha(theme.palette.primary.main, 0.03),
              borderColor: alpha(theme.palette.primary.main, 0.35),
            },
            '&:active': {
              transform: 'scale(0.985)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: RADIUS_TOKENS.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : alpha(theme.palette.text.primary, 0.04),
                color: 'text.primary',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <FormatListBulletedRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.25, color: 'text.primary' }}>
                {t('profile:choice.guidedCardTitleShort', 'Formulario guiado')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                {t('profile:choice.guidedCardShortDesc', 'Empezar de cero, paso a paso')}
              </Typography>
            </Box>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
        </ButtonBase>
      </Box>

      {/* 4. Centered Sample Profile Link */}
      <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.88rem' }}>
          {t('profile:choice.sampleQuestion', '¿Solo probando?')}{' '}
          <Box
            component="span"
            onClick={() => {
              hapticsService.impactLight();
              onLoadSample();
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              cursor: 'pointer',
              ml: 0.5,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {t('profile:choice.loadSampleAction', 'Cargar perfil de ejemplo')}
          </Box>
        </Typography>
      </Box>

      {/* Processing Overlay */}
      {isProcessing && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            bgcolor: isDark ? 'rgba(11, 15, 25, 0.88)' : 'rgba(241, 244, 249, 0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRadius: RADIUS_TOKENS.xl,
          }}
        >
          <CircularProgress size={44} color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {progressMessage || t('common:actions.processing', 'Procesando...')}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

NativeChoiceList.displayName = 'NativeChoiceList';
