import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import { useTranslation } from 'react-i18next';
import { platformService } from '../../../core/platform';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MasterDataSyncBannerProps {
  onOpenSync: (tab?: 'export' | 'import') => void;
}

/**
 * Promotional Fast QR Sync Banner for Desktop and Mobile Web.
 */
export const MasterDataSyncBanner: React.FC<MasterDataSyncBannerProps> = React.memo(({
  onOpenSync,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        mb: { xs: 2.5, sm: 3.5 },
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        borderRadius: RADIUS_TOKENS.lg,
        border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
        bgcolor: alpha(theme.palette.secondary.main, 0.05),
        boxShadow: `0 2px 12px ${alpha(theme.palette.secondary.main, 0.08)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: { xs: 42, sm: 48 },
            height: { xs: 42, sm: 48 },
            borderRadius: RADIUS_TOKENS.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.secondary.main, 0.15),
            color: 'secondary.main',
            flexShrink: 0,
          }}
        >
          {platformService.isDesktopWeb() ? (
            <QrCode2RoundedIcon fontSize="medium" />
          ) : (
            <QrCodeScannerRoundedIcon fontSize="medium" />
          )}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: { xs: '0.98rem', sm: '1.05rem' } }}
          >
            {platformService.isDesktopWeb()
              ? t('profile:choice.syncToPhoneTitle', 'Sincronizar con Móvil (Código QR)')
              : t('profile:choice.syncCardTitle', 'Escanear QR de PC')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: { xs: '0.82rem', sm: '0.86rem' }, mt: 0.35, lineHeight: 1.4 }}
          >
            {platformService.isDesktopWeb()
              ? t(
                  'profile:choice.syncToPhoneDesc',
                  'Genera un código QR para transferir tu Master CV, versiones y postulaciones a tu smartphone en un instante.'
                )
              : t(
                  'profile:choice.syncCardDesc',
                  'Apunta la cámara de tu teléfono al código QR de tu computadora para importar tu Master CV y versiones al instante.'
                )}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => onOpenSync(platformService.isDesktopWeb() ? 'export' : 'import')}
        startIcon={
          platformService.isDesktopWeb() ? (
            <QrCode2RoundedIcon />
          ) : (
            <QrCodeScannerRoundedIcon />
          )
        }
        sx={{
          flexShrink: 0,
          fontWeight: 700,
          height: { xs: 46, sm: 40 },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {platformService.isDesktopWeb()
          ? t('profile:choice.syncToPhoneAction', 'Generar Código QR')
          : t('profile:choice.syncCardAction', 'Escanear QR')}
      </Button>
    </Paper>
  );
});

MasterDataSyncBanner.displayName = 'MasterDataSyncBanner';
