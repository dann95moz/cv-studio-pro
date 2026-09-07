import React from 'react';
import {
  Box,
  Paper,
  Button,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';

export interface TargetJobFooterActionsProps {
  onBack: () => void;
  onViewExisting?: () => void;
  onTailorNow: () => void;
  onOpenManualPrompt?: () => void;
  isGenerating?: boolean;
  generationStep?: string;
  hasJob: boolean;
  hasGeneratedCv?: boolean;
}

export const TargetJobFooterActions: React.FC<TargetJobFooterActionsProps> = React.memo(({
  onBack,
  onViewExisting,
  onTailorNow,
  onOpenManualPrompt,
  isGenerating = false,
  generationStep,
  hasJob,
  hasGeneratedCv = false,
}) => {
  const { t } = useTranslation(['target', 'common']);
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2 },
        px: { xs: 2, sm: 2.5 },
        pb: { xs: 2.5, sm: 2 },
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        borderRadius: 2,
        gap: { xs: 1.5, sm: 2 },
        boxShadow: 2,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={onBack}
        disabled={isGenerating}
        sx={{
          fontWeight: 600,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {t('target:actions.backToProfile', 'Back to Profile')}
      </Button>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isGenerating ? 'info.main' : hasJob ? 'success.main' : 'warning.main',
              flexShrink: 0,
              boxShadow: (theme) =>
                `0 0 0 2px ${alpha(
                  isGenerating
                    ? theme.palette.info.main
                    : hasJob
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.2
                )}`,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.8125rem',
              userSelect: 'none',
            }}
          >
            {hasJob
              ? isGenerating
                ? generationStep || t('target:actions.tailoring', 'Tailoring Resume...')
                : t('target:status.ready', 'Job details ready')
              : t('target:status.missing', 'Paste a job description to tailor')}
          </Typography>
        </Box>

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

        {onOpenManualPrompt && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={onOpenManualPrompt}
            disabled={isGenerating || !hasJob}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('target:actions.byoAiPrompt', 'Prompt & Paste (BYO-AI)')}
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <BoltRoundedIcon />}
          onClick={onTailorNow}
          disabled={isGenerating}
          sx={{
            fontWeight: 700,
            px: 3.5,
            py: 1.2,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {isGenerating ? t('target:actions.tailoring', 'Tailoring Resume...') : t('target:actions.tailorNow', 'Tailor Resume Now')}
        </Button>
      </Box>
    </Paper>

  );
});
