import React from 'react';
import { Box, Typography, ButtonBase, useTheme, alpha } from '@mui/material';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { useKeyboardStatus } from '../../../hooks/useKeyboardStatus';

export interface CanvasZoomFloatingCapsuleProps {
  scale: number;
  isZoomed: boolean;
  onResetFit: () => void;
}

/**
 * CanvasZoomFloatingCapsule:
 * Discrete, non-intrusive floating indicator showing current canvas zoom level
 * with a 1-tap "Fit to Width" reset button for mobile ergonomics.
 */
export const CanvasZoomFloatingCapsule: React.FC<CanvasZoomFloatingCapsuleProps> = React.memo(({
  scale,
  isZoomed,
  onResetFit,
}) => {
  const { t } = useTranslation('preview');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isKeyboardVisible } = useKeyboardStatus();

  const percentage = Math.round(scale * 100);

  return (
    <Box
      className="no-print"
      sx={{
        position: 'fixed',
        left: 16,
        bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
        zIndex: theme.zIndex.speedDial || 1050,
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.6,
        borderRadius: RADIUS_TOKENS.full,
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.88) : 'background.paper',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.8) : alpha(theme.palette.divider, 0.6)}`,
        boxShadow: isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.5)'
          : `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
        opacity: isKeyboardVisible ? 0 : 1,
        pointerEvents: isKeyboardVisible ? 'none' : 'auto',
        transform: isKeyboardVisible ? 'scale(0.8)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: isZoomed ? 'primary.main' : 'text.secondary',
        }}
      >
        {percentage}%
      </Typography>

      {isZoomed && (
        <ButtonBase
          onClick={onResetFit}
          aria-label={t('preview:toolbar.zoomFit', 'Fit width')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.35,
            borderRadius: RADIUS_TOKENS.full,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontSize: '0.72rem',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <FitScreenRoundedIcon sx={{ fontSize: 13 }} />
          <span>{t('preview:toolbar.pageFit', 'Fit')}</span>
        </ButtonBase>
      )}
    </Box>
  );
});
