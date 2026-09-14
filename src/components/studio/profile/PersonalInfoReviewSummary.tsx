import React from 'react';
import { Box, Typography, Paper, IconButton, Fade, useTheme, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { StepFieldConfig } from './personalInfoStepsConfig';
import { ContactType } from '../../../types/cv';

export interface PersonalInfoReviewSummaryProps {
  name: string;
  title: string;
  contactValues: Partial<Record<ContactType, string>>;
  stepsConfig: StepFieldConfig[];
  onJumpToField: (index: number) => void;
}

export const PersonalInfoReviewSummary: React.FC<PersonalInfoReviewSummaryProps> = React.memo(({
  name,
  title,
  contactValues,
  stepsConfig,
  onJumpToField,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  return (
    <Fade in timeout={250}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 580,
          width: '100%',
          mx: 'auto',
          py: 1,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: RADIUS_TOKENS.lg,
            bgcolor: alpha(theme.palette.success.main, 0.03),
            borderColor: alpha(theme.palette.success.main, 0.25),
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 26 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {t('profile:stepFlow.reviewTitle', 'Personal Information Complete!')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t(
                  'profile:stepFlow.reviewSubtitle',
                  'Verify that your details are accurate before continuing.'
                )}
              </Typography>
            </Box>
          </Box>

          {/* Review Checklist */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stepsConfig.map((s, idx) => {
              const val =
                s.type === 'name'
                  ? name
                  : s.type === 'title'
                  ? title
                  : s.contactType
                  ? contactValues[s.contactType]
                  : '';
              const hasVal = Boolean(val && val.trim().length > 0);

              return (
                <Box
                  key={s.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.75,
                    px: 1.25,
                    borderRadius: RADIUS_TOKENS.sm,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Box sx={{ color: 'primary.main', display: 'flex', flexShrink: 0 }}>
                      {s.iconNode}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
                      >
                        {t(s.questionKey, s.defaultQuestion)}
                      </Typography>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 700,
                          color: hasVal ? 'text.primary' : 'text.disabled',
                          fontStyle: hasVal ? 'normal' : 'italic',
                          fontSize: '0.85rem',
                        }}
                      >
                        {hasVal ? val : t('profile:stepFlow.skipped', 'Skipped')}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => onJumpToField(idx)}
                    aria-label={t('profile:stepFlow.edit', 'Edit')}
                    sx={{ color: 'primary.main', p: 0.5 }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
});

PersonalInfoReviewSummary.displayName = 'PersonalInfoReviewSummary';
