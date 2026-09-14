import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { useTranslation } from 'react-i18next';
import { SummarySectionProps } from '../../../types';
import { GuidedSectionNavFooter } from './GuidedSectionNavFooter';

export type { SummarySectionProps };

export const SummarySection: React.FC<SummarySectionProps> = React.memo(({
  summary,
  onSummaryChange,
  onBack,
  onContinue,
  continueLabel,
  isLastSection = false,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const wordsCount = React.useMemo(() => {
    return summary ? summary.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [summary]);

  const isValid = Boolean(summary && summary.trim().length >= 15);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: { xs: 440, sm: 460 },
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        gap: 2.5,
      }}
    >
      <Fade in timeout={200}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: 620,
            width: '100%',
            mx: 'auto',
          }}
        >
          {/* Header Prompt */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'primary.main',
              }}
            >
              <DescriptionRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.15rem', sm: '1.35rem' },
                  color: 'text.primary',
                  lineHeight: 1.25,
                  mb: 0.5,
                }}
              >
                {t('profile:sections.summary.question', 'How would you summarize your professional profile?')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  lineHeight: 1.4,
                }}
              >
                {t(
                  'profile:sections.summary.hint',
                  'Write 2-4 sentences highlighting your core experience, specialty, and unique value.'
                )}
              </Typography>
            </Box>
          </Box>

          {/* Text Area */}
          <TextField
            multiline
            minRows={6}
            maxRows={10}
            variant="outlined"
            value={summary || ''}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder={t(
              'profile:sections.summary.placeholder',
              'Write 2-4 sentences highlighting your core experience, specializations, and professional background...'
            )}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.6,
                p: 2,
                borderRadius: 2,
              },
            }}
          />

          {/* Word Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, px: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {wordsCount} {wordsCount === 1 ? t('profile:sections.summary.word', 'word') : t('profile:sections.summary.words', 'words')} {t('profile:sections.summary.idealWords', '(ideal: 40–90)')}
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Navigation Footer */}
      <GuidedSectionNavFooter
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!isValid}
        continueLabel={continueLabel}
        isLastSection={isLastSection}
      />
    </Box>
  );
});

SummarySection.displayName = 'SummarySection';
