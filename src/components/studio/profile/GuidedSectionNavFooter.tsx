import React from 'react';
import { Box, Button, useTheme, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { hapticsService } from '../../../core/haptics';

export interface GuidedSectionNavFooterProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  onSkip?: () => void;
  skipLabel?: string;
  isLastSection?: boolean;
}

export const GuidedSectionNavFooter: React.FC<GuidedSectionNavFooterProps> = React.memo(({
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel,
  onSkip,
  skipLabel,
  isLastSection = false,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const handleBackClick = () => {
    hapticsService.impactLight();
    onBack?.();
  };

  const handleContinueClick = () => {
    hapticsService.impactLight();
    onContinue?.();
  };

  const handleSkipClick = () => {
    hapticsService.impactLight();
    onSkip?.();
  };

  const resolvedContinueLabel = continueLabel
    ? continueLabel
    : isLastSection
    ? t('profile:actions.continueToTarget', 'Continue to Target Vacancy')
    : t('profile:stepFlow.next', 'Continue');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        pt: 2.5,
        mt: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        flexWrap: 'wrap',
      }}
    >
      {/* Back Button */}
      {onBack ? (
        <Button
          size="medium"
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBackClick}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            px: 1.5,
          }}
        >
          {t('profile:stepFlow.prev', 'Previous')}
        </Button>
      ) : (
        <Box />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Optional Skip Button */}
        {onSkip && (
          <Button
            size="medium"
            variant="outlined"
            color="inherit"
            onClick={handleSkipClick}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              px: 2,
            }}
          >
            {skipLabel || t('profile:stepFlow.skip', 'Skip')}
          </Button>
        )}

        {/* Primary Forward Button */}
        {onContinue && (
          <Button
            size="medium"
            variant="contained"
            color="primary"
            disabled={continueDisabled}
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={handleContinueClick}
            sx={{
              fontWeight: 700,
              px: 3,
              py: 1,
              whiteSpace: 'nowrap',
              '&.Mui-disabled': {
                opacity: 0.45,
              },
            }}
          >
            {resolvedContinueLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
});

GuidedSectionNavFooter.displayName = 'GuidedSectionNavFooter';
