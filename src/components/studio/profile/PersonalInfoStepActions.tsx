import React from 'react';
import { Box, Button, useTheme, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';
import { StepFieldConfig } from './personalInfoStepsConfig';

export interface PersonalInfoStepActionsProps {
  isEditingSingleField: boolean;
  isReviewScreen: boolean;
  isProfileComplete: boolean;
  isAlreadyComplete: boolean;
  currentStep: number;
  activeConfig: StepFieldConfig | null;
  currentValue: string;
  onPrev: () => void;
  onNext: () => void;
  onAdvanceSection?: () => void;
}

export const PersonalInfoStepActions: React.FC<PersonalInfoStepActionsProps> = React.memo(({
  isEditingSingleField,
  isReviewScreen,
  isProfileComplete,
  isAlreadyComplete,
  currentStep,
  activeConfig,
  currentValue,
  onPrev,
  onNext,
  onAdvanceSection,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  // Hidden on summary review when profile is already complete
  if (isReviewScreen && isProfileComplete) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        pt: 1.5,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
      }}
    >
      {/* Previous Field Button / Return to Summary */}
      {isEditingSingleField ? (
        <Button
          size="medium"
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={onPrev}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            px: 1.5,
          }}
        >
          {t('profile:stepFlow.backToReview', 'Back to summary')}
        </Button>
      ) : currentStep > 0 && !isReviewScreen ? (
        <Button
          size="medium"
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={onPrev}
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

      {/* Primary Action Button */}
      {!isReviewScreen && activeConfig ? (
        <Button
          size="medium"
          variant={!isEditingSingleField && activeConfig.isOptional && !currentValue.trim() ? 'outlined' : 'contained'}
          color="primary"
          endIcon={isEditingSingleField ? undefined : <ArrowForwardRoundedIcon />}
          startIcon={isEditingSingleField ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> : undefined}
          onClick={onNext}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1,
            minWidth: 140,
          }}
        >
          {isEditingSingleField
            ? t('profile:stepFlow.saveAndReturn', 'Save and return')
            : activeConfig.isOptional && !currentValue.trim()
            ? t('profile:stepFlow.skip', 'Skip')
            : t('profile:stepFlow.next', 'Next')}
        </Button>
      ) : (
        <Button
          size="medium"
          variant="contained"
          color="primary"
          disabled={!isAlreadyComplete}
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => onAdvanceSection?.()}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {t('profile:stepFlow.confirmAndContinue', 'Continue')}
        </Button>
      )}
    </Box>
  );
});

PersonalInfoStepActions.displayName = 'PersonalInfoStepActions';
