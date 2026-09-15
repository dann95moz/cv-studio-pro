import React from 'react';
import {
  Box,
  Paper,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { StepFooterStatus } from '../../atoms/StepFooterStatus';

export interface TargetJobFooterActionsProps {
  onViewExisting?: () => void;
  onTailorNow: () => void;
  onOpenManualPrompt: () => void;
  isGenerating?: boolean;
  generationStep?: string;
  hasJob: boolean;
  hasGeneratedCv?: boolean;
  hasConfiguredApiKey?: boolean;
}

/**
 * TargetJobFooterActions
 * Cleaned footer for Step 2:
 * - Omits redundant "Back to Profile" (handled by top stepper & native back).
 * - Automatic BYOK: If no API key configured, presents "Copy Prompt (My Own AI)" as the primary 1-click action.
 * - If API key configured, provides "Tailor Resume Now" as primary with prompt copying as secondary option.
 */
export const TargetJobFooterActions: React.FC<TargetJobFooterActionsProps> = React.memo(({
  onViewExisting,
  onTailorNow,
  onOpenManualPrompt,
  isGenerating = false,
  generationStep,
  hasJob,
  hasGeneratedCv = false,
  hasConfiguredApiKey = false,
}) => {
  const { t } = useTranslation(['target', 'common']);
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 2 },
        px: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        borderRadius: 2,
        gap: { xs: 1.5, sm: 2 },
        boxShadow: 2,
      }}
    >
      {/* Status indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StepFooterStatus
          status={isGenerating ? 'generating' : hasJob ? 'ready' : 'missing'}
          label={
            hasJob
              ? isGenerating
                ? generationStep || t('target:actions.tailoring', 'Tailoring Resume...')
                : t('target:status.ready', 'Job details ready')
              : t('target:status.missing', 'Paste a job description to tailor')
          }
        />
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}
      >
        {/* View existing CV button (if previous version exists) */}
        {hasGeneratedCv && !isGenerating && onViewExisting && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onViewExisting}
            sx={{
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('target:actions.viewExisting', 'View Existing CV')}
          </Button>
        )}

        {/* CASE A: User HAS configured an API Key */}
        {hasConfiguredApiKey ? (
          <>
            {/* Secondary: Copy Prompt */}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={onOpenManualPrompt}
              disabled={isGenerating || !hasJob}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {t('target:actions.byoAiPrompt', 'Copy Prompt (My Own AI)')}
            </Button>

            {/* Primary: Direct AI Tailor */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <BoltRoundedIcon />}
              onClick={onTailorNow}
              disabled={isGenerating || !hasJob}
              sx={{
                fontWeight: 700,
                px: 3.5,
                py: 1.2,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {isGenerating
                ? t('target:actions.tailoring', 'Tailoring Resume...')
                : t('target:actions.tailorNow', 'Tailor Resume Now')}
            </Button>
          </>
        ) : (
          /* CASE B: User does NOT have an API Key (Automatic Free BYOK Mode) */
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRoundedIcon />}
            onClick={onOpenManualPrompt}
            disabled={isGenerating || !hasJob}
            sx={{
              fontWeight: 700,
              px: 3.5,
              py: 1.2,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('target:actions.byoAiPrompt', 'Copy Prompt (My Own AI)')}
          </Button>
        )}
      </Box>
    </Paper>
  );
});

TargetJobFooterActions.displayName = 'TargetJobFooterActions';
