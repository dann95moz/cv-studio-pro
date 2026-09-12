import React from 'react';
import { Fab, useTheme, alpha } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { useTranslation } from 'react-i18next';
import { useKeyboardStatus } from '../../../hooks/useKeyboardStatus';

export interface MobileStudioFabProps {
  onClick: () => void;
}

/**
 * Mobile-First Floating Action Button (FAB).
 * Anchored in the bottom-right thumb zone, triggering the slide-up tools Bottom Sheet.
 */
export const MobileStudioFab: React.FC<MobileStudioFabProps> = ({ onClick }) => {
  const { t } = useTranslation('preview');
  const theme = useTheme();
  const { isKeyboardVisible } = useKeyboardStatus();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Fab
      onClick={onClick}
      aria-label={t('preview:navRail.templates', 'Herramientas de edición')}
      sx={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
        right: 20,
        zIndex: theme.zIndex.speedDial || 1050,
        width: 54,
        height: 54,
        transform: isKeyboardVisible ? 'scale(0)' : 'scale(1)',
        opacity: isKeyboardVisible ? 0 : 1,
        pointerEvents: isKeyboardVisible ? 'none' : 'auto',
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : 'background.paper',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${isDark ? alpha(theme.palette.divider, 0.8) : alpha(theme.palette.primary.main, 0.28)}`,
        color: 'primary.main',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.55)'
          : `0 8px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
        '&:hover': {
          bgcolor: isDark ? theme.palette.background.paper : alpha(theme.palette.primary.main, 0.06),
          borderColor: 'primary.main',
          transform: 'scale(1.05)',
          boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
        },
        '&:active': {
          transform: 'scale(0.96)',
        },
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <GridViewRoundedIcon sx={{ fontSize: 24 }} />
    </Fab>
  );
};
