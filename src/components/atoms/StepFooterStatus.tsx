import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

export interface StepFooterStatusProps {
  status: 'ready' | 'missing' | 'warning' | 'info' | 'generating';
  label: string;
}

/**
 * Atomic Dumb Component for Step Footer live status indicators (e.g. "Perfil profesional listo").
 * Displays a subtle 8px pulse-styled indicator dot with an alpha glow ring and a styled caption.
 */
export const StepFooterStatus: React.FC<StepFooterStatusProps> = React.memo(({ status, label }) => {
  const theme = useTheme();

  const colorKey =
    status === 'ready'
      ? 'success'
      : status === 'generating'
      ? 'info'
      : status === 'missing' || status === 'warning'
      ? 'warning'
      : 'info';

  const resolvedColor = theme.palette[colorKey].main;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.5,
        justifyContent: { xs: 'center', sm: 'flex-start' },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: `${colorKey}.main`,
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${alpha(resolvedColor, 0.2)}`,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          fontSize: '0.8125rem',
          userSelect: 'none',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
});
