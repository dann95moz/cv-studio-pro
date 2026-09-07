import React from 'react';
import { Fab, useTheme, alpha } from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { useTranslation } from 'react-i18next';

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

  return (
    <Fab
      color="primary"
      onClick={onClick}
      aria-label={t('preview:navRail.templates', 'Herramientas de edición')}
      sx={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
        right: 20,
        zIndex: theme.zIndex.speedDial || 1050,
        width: 54,
        height: 54,
        bgcolor: 'var(--terracotta)',
        color: '#ffffff',
        boxShadow: '0 6px 18px var(--terracotta-glow)',
        '&:hover': {
          bgcolor: 'var(--terracotta-hover)',
          transform: 'scale(1.05)',
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
