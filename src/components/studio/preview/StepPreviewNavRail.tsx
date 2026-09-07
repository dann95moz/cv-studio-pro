import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import FormatPaintRoundedIcon from '@mui/icons-material/FormatPaintRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import { useTranslation } from 'react-i18next';
import { PreviewSidePanelType, StepPreviewNavRailProps } from '../../../types';

export type { PreviewSidePanelType, StepPreviewNavRailProps };

export const StepPreviewNavRail: React.FC<StepPreviewNavRailProps> = ({
  activeSidePanel,
  onToggleSidePanel,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      className="no-print preview-side-rail"
      sx={{
        width: { xs: '100%', md: 72 },
        height: { xs: 'auto', md: '100%' },
        borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
        borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        alignItems: 'center',
        justifyContent: { xs: 'space-around', md: 'flex-start' },
        py: { xs: 0.75, md: 2 },
        px: { xs: 0.5, md: 0.5 },
        gap: { xs: 0.5, md: 1.5 },
        flexShrink: 0,
        zIndex: 20,
        order: { xs: 2, md: 0 },
      }}
    >
      {/* Design & Templates Rail Button */}
      <Box
        onClick={() => onToggleSidePanel('design')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          flex: { xs: 1, md: 'none' },
          width: { xs: 'auto', md: '100%' },
          px: 0.25,
          gap: 0.25,
          color: (activeSidePanel === 'design' || activeSidePanel === 'templates') ? 'primary.main' : 'text.secondary',
          transition: 'all 0.15s ease',
          '&:hover': { color: 'text.primary' }
        }}
      >
        <Box
          sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            borderRadius: { xs: '10px', md: '14px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (activeSidePanel === 'design' || activeSidePanel === 'templates')
              ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
              : 'transparent',
            color: (activeSidePanel === 'design' || activeSidePanel === 'templates') ? 'primary.main' : 'inherit',
            transition: 'all 0.15s ease',
          }}
        >
          <FormatPaintRoundedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.65rem', md: '0.68rem' },
            fontWeight: (activeSidePanel === 'design' || activeSidePanel === 'templates') ? 700 : 500,
            textAlign: 'center',
            lineHeight: 1.15,
            px: 0.25,
          }}
        >
          {t('preview:navRail.design', 'Diseño')}
        </Typography>
      </Box>


      {/* LinkedIn Tailoring Rail Button */}
      <Box
        onClick={() => onToggleSidePanel('linkedin')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          flex: { xs: 1, md: 'none' },
          width: { xs: 'auto', md: '100%' },
          px: 0.25,
          gap: 0.25,
          color: activeSidePanel === 'linkedin' ? 'primary.main' : 'text.secondary',
          transition: 'all 0.15s ease',
          '&:hover': { color: 'text.primary' }
        }}
      >
        <Box
          sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            borderRadius: { xs: 1.5, md: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: activeSidePanel === 'linkedin'
              ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12)
              : 'transparent',
            color: activeSidePanel === 'linkedin' ? 'primary.main' : 'inherit',
            transition: 'all 0.15s ease',
            fontWeight: 900,
            fontSize: { xs: '0.9rem', md: '1rem' },
          }}
        >
          in
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.65rem', md: '0.68rem' },
            fontWeight: activeSidePanel === 'linkedin' ? 700 : 500,
            textAlign: 'center',
            lineHeight: 1.15,
            px: 0.25,
          }}
        >
          {t('preview:navRail.linkedin', 'LinkedIn')}
        </Typography>
      </Box>

      {/* Compare Versions Diff Rail Button */}
      <Box
        onClick={() => onToggleSidePanel('compare')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          flex: { xs: 1, md: 'none' },
          width: { xs: 'auto', md: '100%' },
          px: 0.25,
          gap: 0.25,
          color: activeSidePanel === 'compare' ? 'secondary.main' : 'text.secondary',
          transition: 'all 0.15s ease',
          '&:hover': { color: 'text.primary' }
        }}
      >
        <Box
          sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            borderRadius: { xs: '10px', md: '14px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: activeSidePanel === 'compare'
              ? alpha(theme.palette.secondary.main, isDark ? 0.25 : 0.12)
              : 'transparent',
            color: activeSidePanel === 'compare' ? 'secondary.main' : 'inherit',
            transition: 'all 0.15s ease',
          }}
        >
          <DifferenceRoundedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.65rem', md: '0.68rem' },
            fontWeight: activeSidePanel === 'compare' ? 700 : 500,
            textAlign: 'center',
            lineHeight: 1.15,
            px: 0.25,
          }}
        >
          {t('preview:navRail.compare', 'Compare')}
        </Typography>
      </Box>
    </Box>
  );
};
