import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import QRCode from 'qrcode';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { useTranslation } from 'react-i18next';

export interface QrCodeCardProps {
  url: string;
  secondsRemaining: number;
  syncId: string;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  url,
  secondsRemaining,
  syncId,
}) => {
  const { t } = useTranslation(['common']);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useTheme();

  // Draw QR code onto canvas whenever URL changes
  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 230,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: url.length > 250 ? 'L' : 'M',
      }).catch((err) => {
        console.error('Error drawing QR code:', err);
      });
    }
  }, [url]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = (secondsRemaining / 300) * 100;

  // Determine progress color
  const timerColor = secondsRemaining > 60 ? 'primary' : 'warning';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2.5,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.default, 0.6),
        border: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
        width: '100%',
        maxWidth: 380,
        mx: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* QR Canvas Container with white border */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 4 }} />
      </Box>

      {/* Human-Friendly Code Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('common:sync.pairingCode', 'Código de emparejamiento:')}
        </Typography>
        <Chip
          label={syncId}
          color="primary"
          variant="filled"
          size="small"
          sx={{ fontWeight: 800, letterSpacing: '0.05em', px: 1 }}
        />
      </Box>

      {/* Countdown Progress Bar */}
      <Box sx={{ width: '100%', mt: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeRoundedIcon fontSize="small" color={timerColor} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: `${timerColor}.main` }}>
              {t('common:sync.expiresIn', 'Expira en:')} {timeFormatted}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progressPercent)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          color={timerColor}
          sx={{ height: 6, borderRadius: 9999 }}
        />
      </Box>

      {/* Security & Self-Destruct Highlights */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          mt: 0.5,
        }}
      >
        <Chip
          icon={<LockRoundedIcon fontSize="inherit" />}
          label={t('common:sync.e2eeBadge', 'Cifrado E2EE (AES-256)')}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
        <Chip
          icon={<LocalFireDepartmentRoundedIcon fontSize="inherit" />}
          label={t('common:sync.burnBadge', 'Se quema al primer uso')}
          size="small"
          variant="outlined"
          color="warning"
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>
    </Box>
  );
};
