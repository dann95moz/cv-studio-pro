import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useTranslation } from 'react-i18next';
import { StudioTab } from '../../../types/cv';

import { useKeyboardStatus } from '../../../hooks/useKeyboardStatus';

export interface MobileBottomNavProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
}

/**
 * Mobile-First Fixed Bottom Navigation Bar.
 * Anchors the primary domain workflows (Estudio & Postulaciones) inside the natural thumb zone.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { isKeyboardVisible } = useKeyboardStatus();

  // Normalize active value for the two primary mobile tabs
  const navValue = activeTab === 'history' ? 'history' : 'wizard';

  return (
    <Paper
      elevation={8}
      className="no-print mobile-bottom-nav"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        pb: 'max(env(safe-area-inset-bottom), 4px)',
        transform: isKeyboardVisible ? 'translateY(100%)' : 'translateY(0)',
        opacity: isKeyboardVisible ? 0 : 1,
        pointerEvents: isKeyboardVisible ? 'none' : 'auto',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
      }}
    >
      <BottomNavigation
        showLabels
        value={navValue}
        onChange={(_, newValue: StudioTab) => {
          onSelectTab(newValue);
        }}
        sx={{
          height: 56,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 0.5,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.74rem',
            fontWeight: 600,
            mt: 0.25,
            '&.Mui-selected': {
              fontSize: '0.74rem',
              fontWeight: 700,
            },
          },
        }}
      >
        <BottomNavigationAction
          value="wizard"
          label={t('common:nav.studio', 'Estudio')}
          icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />}
        />
        <BottomNavigationAction
          value="history"
          label={t('common:nav.myApplications', 'Postulaciones')}
          icon={<BusinessRoundedIcon sx={{ fontSize: 20 }} />}
        />
      </BottomNavigation>
    </Paper>
  );
};
