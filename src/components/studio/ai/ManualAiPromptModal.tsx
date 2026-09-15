import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface ManualAiPromptModalProps {
  open: boolean;
  onClose: () => void;
  promptText: string;
  onSubmitResponse: (response: string) => void;
  onCopyPrompt?: () => void;
  isProcessing?: boolean;
  title?: string;
}

/**
 * Dumb/Presentational Modal & Bottom Sheet for Bring-Your-Own-AI (BYO-AI) Prompt & Paste workflow.
 * - Mobile: Renders as an ergonomic slide-up bottom sheet with native drag pill and max screen focus.
 * - Desktop: Renders as a focused, centered dialog.
 * - Streamlined: Minimal single-click copy action and expansive response textarea for pasting.
 */
export const ManualAiPromptModal: React.FC<ManualAiPromptModalProps> = ({
  open,
  onClose,
  promptText,
  onSubmitResponse,
  onCopyPrompt,
  isProcessing = false,
  title,
}) => {
  const { t } = useTranslation(['settings', 'common', 'target']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [copied, setCopied] = useState(false);
  const [responseInput, setResponseInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onCopyPrompt?.();
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = promptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onCopyPrompt?.();
    }
  };

  const handleProcess = () => {
    if (!responseInput.trim()) {
      setErrorMsg(t('settings:providers.invalidResponse', 'Please paste the AI response before continuing.'));
      return;
    }
    setErrorMsg(null);
    onSubmitResponse(responseInput.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: `${RADIUS_TOKENS.xl} ${RADIUS_TOKENS.xl} 0 0`, sm: RADIUS_TOKENS.xl },
            m: { xs: 0, sm: 2 },
            position: { xs: 'fixed', sm: 'relative' },
            bottom: { xs: 0, sm: 'auto' },
            maxHeight: { xs: '92vh', sm: '88vh' },
            width: { xs: '100%', sm: 'auto' },
            p: { xs: 1.5, sm: 2 },
            pb: { xs: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 20px)', sm: 2.5 },
          },
        },
      }}
    >
      {/* Mobile Drag Handle Pill */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          width: 36,
          height: 4,
          borderRadius: RADIUS_TOKENS.full,
          bgcolor: 'divider',
          mx: 'auto',
          mb: 1.5,
          mt: 0.5,
        }}
      />

      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <AutoAwesomeRoundedIcon color="success" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title || t('settings:providers.byoAiTitle', 'Bring Your Own AI (Prompt & Paste)')}
          </Typography>
          <Chip
            label={t('settings:providers.noKeyNeeded', '100% Free • No API Key')}
            size="small"
            color="success"
            sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }}
          />
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important', px: { xs: 1, sm: 2 } }}>
        {/* Step 1: Copy Prompt Card (Streamlined, compact) */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: RADIUS_TOKENS.md,
            bgcolor: isDark ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.success.main, 0.02),
            borderColor: alpha(theme.palette.success.main, 0.25),
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mb: 0.25 }}>
              {t('settings:providers.byoAiStep1', '1. Copy Calibrated Prompt')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
              {t(
                'settings:providers.byoAiStep1Desc',
                'CV Studio formats your master data, target vacancy, and ATS rules into a single calibrated prompt.'
              )}
            </Typography>
          </Box>

          <Button
            size="medium"
            variant="contained"
            color="success"
            startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
            onClick={handleCopyPrompt}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              py: 0.9,
              flexShrink: 0,
              alignSelf: { xs: 'stretch', sm: 'center' },
            }}
          >
            {copied
              ? t('settings:providers.promptCopied', 'Prompt Copied!')
              : t('settings:providers.copyPrompt', 'Copy Prompt')}
          </Button>
        </Paper>

        {/* Step 2: Paste Response (Expanded Space) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('settings:providers.pasteAiResponse', '2. Paste AI Response')}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={8}
            maxRows={14}
            placeholder={t(
              'settings:providers.pasteAiResponsePlaceholder',
              'Paste the complete response generated by ChatGPT, Claude, Gemini here...'
            )}
            value={responseInput}
            onChange={(e) => {
              setResponseInput(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            helperText={
              !responseInput.trim()
                ? t('settings:providers.pasteToEnablePrompt', 'Paste the AI response to continue')
                : undefined
            }
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                minHeight: { xs: '180px', sm: '220px' },
                alignItems: 'flex-start',
              },
            }}
          />
        </Box>

        {errorMsg && (
          <Alert severity="warning" sx={{ borderRadius: RADIUS_TOKENS.md }}>
            {errorMsg}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 1, sm: 2 }, pb: 1, pt: 1, justifyContent: 'space-between' }}>
        <Button variant="text" color="inherit" onClick={onClose} disabled={isProcessing}>
          {t('common:actions.cancel', 'Cancel')}
        </Button>
        <Tooltip
          title={
            !responseInput.trim()
              ? t('settings:providers.pasteToEnablePrompt', 'Paste the AI response to continue')
              : ''
          }
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={handleProcess}
              disabled={isProcessing || !responseInput.trim()}
              sx={{ fontWeight: 700, px: 3 }}
            >
              {t('settings:providers.generateCvAction', 'Generate CV')}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};
