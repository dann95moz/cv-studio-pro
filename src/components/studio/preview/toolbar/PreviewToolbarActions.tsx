import React from 'react';
import { Box, Button, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useTranslation } from 'react-i18next';

export interface PreviewToolbarActionsProps {
  onCompareAgainstGeneric?: () => void;
  onAutoFit?: () => void;
  isOverflowing?: boolean;
  onTrackApplication?: () => void;
  isTracked?: boolean;
}

/**
 * PreviewToolbarActions
 * Presentational dumb subcomponent containing application tracking,
 * compare against generic CV, and auto-fit 1 page buttons.
 */
export const PreviewToolbarActions: React.FC<PreviewToolbarActionsProps> = ({
  onCompareAgainstGeneric,
  onAutoFit,
  isOverflowing = false,
  onTrackApplication,
  isTracked = false,
}) => {
  const { t } = useTranslation(['preview']);
  const theme = useTheme();

  return (
    <>
      {/* Quick Compare vs Generic Action */}
      {onCompareAgainstGeneric && (
        <Tooltip title={t('preview:versionSelector.compareAgainstGeneric', 'Comparar versión actual contra CV Genérico')}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: '15px !important' }} />}
            onClick={() => onCompareAgainstGeneric()}
            sx={{
              height: 28,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.2,
              display: { xs: 'none', lg: 'inline-flex' },
            }}
          >
            {t('preview:versionSelector.compareVsGenericBtn', 'Comparar vs Genérico')}
          </Button>
        </Tooltip>
      )}

      {/* Magic 1-Page Auto-Fit Button */}
      {onAutoFit && (
        <Tooltip title={t('preview:toolbar.autoFitTooltip', 'Auto-Fit to 1 Page: Automatically recalibrates spacing and density to snap resume perfectly to 1 page.')}>
          <Button
            size="small"
            variant={isOverflowing ? 'contained' : 'outlined'}
            color={isOverflowing ? 'warning' : 'inherit'}
            startIcon={<BoltRoundedIcon sx={{ fontSize: '15px !important' }} />}
            onClick={onAutoFit}
            sx={{
              height: 28,
              fontSize: '0.72rem',
              fontWeight: 800,
              px: 1.2,
              display: { xs: 'none', sm: 'inline-flex' },
              animation: isOverflowing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
              boxShadow: isOverflowing ? `0 0 12px ${alpha(theme.palette.warning.main, 0.4)}` : 'none',
            }}
          >
            {t('preview:toolbar.autoFit', 'Auto-Fit 1 Page')}
          </Button>
        </Tooltip>
      )}

      {/* Tracked Status Indicator / Action */}
      {onTrackApplication && (
        isTracked ? (
          <Box
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              gap: 0.6,
              px: 1,
              py: 0.4,
            }}
          >
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography
              component="span"
              sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'success.main' }}
            >
              {t('preview:toolbar.tracked', 'En el tablero')}
            </Typography>
          </Box>
        ) : (
          <Button
            size="small"
            variant="text"
            onClick={onTrackApplication}
            startIcon={<ViewKanbanRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontSize: '0.8rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
            }}
          >
            {t('preview:toolbar.trackApp', 'Postular')}
          </Button>
        )
      )}
    </>
  );
};
