import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
 * Native mobile presentation for Step 1 mode selection.
 * Pure dumb presentational component living directly on screen background.
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
        maxWidth: 460,
        mx: 'auto',
        my: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2.5, sm: 3 },
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Main Title directly on screen background */}
      <Box sx={{ mb: 2.5, px: 0.5 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 500,
            fontSize: { xs: '1.35rem', sm: '1.5rem' },
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            color: 'text.primary',
          }}
        >
          {t('profile:choice.title', '¿Cómo querés empezar tu perfil?')}
        </Typography>
      </Box>

      {/* 3 Native Interactive Option Rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            borderLeft: selectedOption === 'sync'
              ? `4px solid ${theme.palette.primary.main}`
              : '4px solid transparent',
            bgcolor: selectedOption === 'sync'
              ? (isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff')
              : 'transparent',
            transition: 'all 0.15s ease',
            '&:active': {
              transform: 'scale(0.985)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff',
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
                bgcolor: selectedOption === 'sync'
                  ? (isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe')
                  : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'),
                color: selectedOption === 'sync' ? 'primary.main' : 'text.primary',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <QrCodeScannerRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
                {t('profile:choice.syncCardTitleShort', 'Sincronizar desde PC')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                {t('profile:choice.syncCardShortDesc', 'Transferí tu CV con un código QR')}
              </Typography>
            </Box>
          </Box>
          <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
        </ButtonBase>

        {/* Divider */}
        <Box sx={{ height: '1px', bgcolor: theme.palette.divider, my: 0.5, ml: '72px', mr: 1.5 }} />

        {/* Row 2: Importar CV */}
        <ButtonBase
          onClick={() => {
            hapticsService.impactLight();
            setSelectedOption('import');
            openFileDialog();
          }}
          sx={{
            width: '100%',
            py: 1.75,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            borderLeft: selectedOption === 'import'
              ? `4px solid ${theme.palette.primary.main}`
              : '4px solid transparent',
            bgcolor: selectedOption === 'import'
              ? (isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff')
              : 'transparent',
            transition: 'all 0.15s ease',
            '&:active': {
              transform: 'scale(0.985)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff',
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
                bgcolor: selectedOption === 'import'
                  ? (isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe')
                  : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'),
                color: selectedOption === 'import' ? 'primary.main' : 'text.primary',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
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
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe',
                    color: isDark ? '#93c5fd' : '#1d4ed8',
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
          <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
        </ButtonBase>

        {/* Divider */}
        <Box sx={{ height: '1px', bgcolor: theme.palette.divider, my: 0.5, ml: '72px', mr: 1.5 }} />

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
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            borderRadius: RADIUS_TOKENS.lg,
            borderLeft: selectedOption === 'form'
              ? `4px solid ${theme.palette.primary.main}`
              : '4px solid transparent',
            bgcolor: selectedOption === 'form'
              ? (isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff')
              : 'transparent',
            transition: 'all 0.15s ease',
            '&:active': {
              transform: 'scale(0.985)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.14) : '#eff6ff',
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
                bgcolor: selectedOption === 'form'
                  ? (isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe')
                  : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'),
                color: selectedOption === 'form' ? 'primary.main' : 'text.primary',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <FormatListBulletedRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
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

      {/* Sample Demo Button */}
      <Box sx={{ mt: 2.5, px: 1.5, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="text"
          size="small"
          onClick={() => {
            hapticsService.impactLight();
            onLoadSample();
          }}
          sx={{
            color: 'text.secondary',
            fontSize: '0.86rem',
            textTransform: 'none',
            fontWeight: 500,
            p: 0,
            minWidth: 'auto',
            textAlign: 'left',
            justifyContent: 'flex-start',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'transparent',
            },
          }}
        >
          {t('profile:choice.sampleQuestion', '¿Solo quieres probar?')}{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, ml: 0.5 }}>
            {t('profile:choice.loadSampleAction', 'Cargar Ejemplo')}
          </Box>
        </Button>
      </Box>

      {/* Processing Overlay */}
      {isProcessing && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            bgcolor: isDark ? 'rgba(7, 10, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
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
