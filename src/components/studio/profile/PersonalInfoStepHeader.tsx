import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { StepFieldConfig } from './personalInfoStepsConfig';

export interface PersonalInfoStepHeaderProps {
  isEditingSingleField: boolean;
  isReviewScreen: boolean;
  isAlreadyComplete: boolean;
  currentStep: number;
  totalFields: number;
  stepsConfig: StepFieldConfig[];
  onBackToReview: () => void;
  onJumpToField: (index: number) => void;
  onSwitchToStepMode: () => void;
}

export const PersonalInfoStepHeader: React.FC<PersonalInfoStepHeaderProps> = React.memo(({
  isEditingSingleField,
  isReviewScreen,
  isAlreadyComplete,
  currentStep,
  totalFields,
  stepsConfig,
  onBackToReview,
  onJumpToField,
  onSwitchToStepMode,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        pb: 1.5,
      }}
    >
      {isEditingSingleField ? (
        <Button
          size="small"
          variant="text"
          color="primary"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={onBackToReview}
          sx={{
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'none',
            px: 1,
          }}
        >
          {t('profile:stepFlow.backToReview', 'Back to summary')}
        </Button>
      ) : !isReviewScreen ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* Step Dots */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              {stepsConfig.map((s, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <Box
                    key={s.id}
                    onClick={() => onJumpToField(idx)}
                    sx={{
                      width: isCurrent ? 18 : 6,
                      height: 6,
                      borderRadius: RADIUS_TOKENS.full,
                      bgcolor: isCurrent
                        ? 'primary.main'
                        : isPassed
                        ? alpha(theme.palette.primary.main, 0.45)
                        : alpha(theme.palette.text.disabled, 0.25),
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                );
              })}
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.75rem',
                letterSpacing: 0.2,
              }}
            >
              {t('profile:stepFlow.stepCount', '{{current}} of {{total}}', {
                current: currentStep + 1,
                total: totalFields,
              })}
            </Typography>
          </Box>

          {isAlreadyComplete && (
            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={onBackToReview}
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                px: 1,
              }}
            >
              {t('profile:stepFlow.backToReview', 'Back to summary')}
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {t('profile:stepFlow.reviewTitle', 'Personal Information Complete!')}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={onSwitchToStepMode}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
            }}
          >
            {t('profile:stepFlow.switchStep', 'Step-by-step mode')}
          </Button>
        </Box>
      )}
    </Box>
  );
});

PersonalInfoStepHeader.displayName = 'PersonalInfoStepHeader';
