import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';

export interface MasterDataChoiceViewProps {
  onSelectFreeText: () => void;
  onSelectGuided: () => void;
  onLoadSample: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProcessing?: boolean;
}

/**
 * Step 1: Onboarding Choice View (Dumb Presentational Component)
 * Clean, frictionless entrance allowing the candidate to:
 * 1) Import an existing resume (PDF, TXT, MD)
 * 2) Start from scratch via Guided Step-by-Step Form
 * 3) Paste unformatted notes or free text
 */
export const MasterDataChoiceView: React.FC<MasterDataChoiceViewProps> = React.memo(({
  onSelectFreeText,
  onSelectGuided,
  onLoadSample,
  onUploadFile,
  openFileDialog,
  fileInputRef,
  isProcessing = false,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1040,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.markdown,.txt"
        style={{ display: 'none' }}
        onChange={onUploadFile}
      />

      {/* Header Banner */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4.5 } }}>
        <Chip
          icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          label={t('profile:choice.badge', 'Step 1 of 3 • Career Profile')}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1.5, fontWeight: 700 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.2, letterSpacing: '-0.02em' }}>
          {t('profile:choice.title', 'How would you like to start your profile?')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto' }}>
          {t(
            'profile:choice.subtitle',
            'Choose the input method that best matches your workflow. Everything is processed 100% locally and privately.'
          )}
        </Typography>
      </Box>

      {/* 3 Decision Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, sm: 2.5 },
          width: '100%',
          mb: 4,
        }}
      >
        {/* Card 1: Upload File Mode */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <CloudUploadRoundedIcon fontSize="medium" />
              </Box>
              <Chip
                label={t('profile:choice.recommendedChip', 'Fast & Easy')}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.importCardTitle', 'Import Resume')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {t(
                'profile:choice.importCardDesc',
                'Upload your existing CV in PDF, TXT, or Markdown. Content is extracted locally.'
              )}
            </Typography>

            {/* Quick Drop & Browse Area */}
            <Box
              onClick={openFileDialog}
              sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: `1.5px dashed ${theme.palette.divider}`,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>
                {t('profile:choice.dropOrBrowse', 'Drop file or click to browse')}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={openFileDialog}
            disabled={isProcessing}
            startIcon={<CloudUploadRoundedIcon />}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {t('profile:actions.importResume', 'Upload Resume')}
          </Button>
        </Paper>

        {/* Card 2: Guided Step-by-Step Form (Start from Scratch) */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: 'secondary.main',
                }}
              >
                <FormatListBulletedRoundedIcon fontSize="medium" />
              </Box>
              <Chip
                label={t('profile:choice.startFromScratch', 'Start from Scratch')}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.guidedCardTitle', 'Guided Form')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {t(
                'profile:choice.guidedCardDesc',
                'Fill out your personal info, experience, education, and skills step by step in a structured visual form.'
              )}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            size="medium"
            onClick={onSelectGuided}
            endIcon={<ArrowForwardRoundedIcon />}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {t('profile:choice.guidedAction', 'Start Guided Form')}
          </Button>
        </Paper>

        {/* Card 3: Free Text & Notes Mode */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: 'text.primary',
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                color: 'text.primary',
                mb: 2,
              }}
            >
              <EditNoteRoundedIcon fontSize="medium" />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.freeTextCardTitle', 'Paste Raw Notes')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {t(
                'profile:choice.freeTextCardDesc',
                'Paste unformatted career notes, LinkedIn summary, or bullet points. The AI handles the structure.'
              )}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            size="medium"
            onClick={onSelectFreeText}
            endIcon={<ArrowForwardRoundedIcon />}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {t('profile:choice.freeTextAction', 'Write or Paste Notes')}
          </Button>
        </Paper>
      </Box>

      {/* Bottom Option: Sample Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('profile:choice.sampleQuestion', 'Just testing?')}
        </Typography>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onLoadSample}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 700 }}
        >
          {t('profile:choice.loadSampleAction', 'Load Sample Profile')}
        </Button>
      </Box>
    </Box>
  );
});

MasterDataChoiceView.displayName = 'MasterDataChoiceView';
