import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface ChoiceModeCardsProps {
  onSelectFreeText: () => void;
  onSelectGuided: () => void;
  openFileDialog: () => void;
  isProcessing?: boolean;
  progressMessage?: string;
  hasData?: boolean;
}

/**
 * 3 Decision Cards Grid (Import Resume, Guided Form, Paste Raw Notes).
 * Conforms strictly to Design System tokens.
 */
export const ChoiceModeCards: React.FC<ChoiceModeCardsProps> = React.memo(({
  onSelectFreeText,
  onSelectGuided,
  openFileDialog,
  isProcessing = false,
  progressMessage,
  hasData = false,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  return (
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
          border: `1.5px solid ${theme.palette.divider}`,
          borderRadius: RADIUS_TOKENS.lg,
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
                borderRadius: RADIUS_TOKENS.sm,
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
              borderRadius: RADIUS_TOKENS.sm,
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
          startIcon={
            isProcessing ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CloudUploadRoundedIcon />
            )
          }
          fullWidth
          sx={{ fontWeight: 700 }}
        >
          {isProcessing
            ? (progressMessage || t('profile:actions.importing', 'Extracting PDF...'))
            : t('profile:actions.importResume', 'Upload Resume')}
        </Button>
      </Paper>

      {/* Card 2: Guided Step-by-Step Form */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `1.5px solid ${theme.palette.divider}`,
          borderRadius: RADIUS_TOKENS.lg,
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
                borderRadius: RADIUS_TOKENS.sm,
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
              label={
                hasData
                  ? t('profile:choice.activeProfileBadge', 'Profile Loaded')
                  : t('profile:choice.startFromScratch', 'Start from Scratch')
              }
              size="small"
              color={hasData ? 'success' : 'secondary'}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
            {t('profile:choice.guidedCardTitle', 'Guided Form')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
            {hasData
              ? t(
                  'profile:choice.guidedCardDescExisting',
                  'Continue editing your structured profile sections: experience, education, and skills.'
                )
              : t(
                  'profile:choice.guidedCardDesc',
                  'Fill out your personal info, experience, education, and skills step by step in a structured visual form.'
                )}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color={hasData ? 'primary' : 'secondary'}
          size="medium"
          onClick={onSelectGuided}
          endIcon={<ArrowForwardRoundedIcon />}
          fullWidth
          sx={{ fontWeight: 700 }}
        >
          {hasData
            ? t('profile:choice.continueGuidedAction', 'Continue in Guided Form')
            : t('profile:choice.guidedAction', 'Start Guided Form')}
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
          borderRadius: RADIUS_TOKENS.lg,
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
              borderRadius: RADIUS_TOKENS.sm,
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
            {hasData
              ? t(
                  'profile:choice.freeTextCardDescExisting',
                  'View or edit your current career profile as plain text notes.'
                )
              : t(
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
          {hasData
            ? t('profile:choice.continueFreeTextAction', 'Edit in Free Text / Notes')
            : t('profile:choice.freeTextAction', 'Write or Paste Notes')}
        </Button>
      </Paper>
    </Box>
  );
});

ChoiceModeCards.displayName = 'ChoiceModeCards';
