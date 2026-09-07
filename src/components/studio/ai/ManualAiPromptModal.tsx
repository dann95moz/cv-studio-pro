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
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface ManualAiPromptModalProps {
  open: boolean;
  onClose: () => void;
  promptText: string;
  onSubmitResponse: (response: string) => void;
  isProcessing?: boolean;
  title?: string;
}

/**
 * Dumb/Presentational Modal for Bring-Your-Own-AI (BYO-AI) Prompt & Paste workflow.
 */
export const ManualAiPromptModal: React.FC<ManualAiPromptModalProps> = ({
  open,
  onClose,
  promptText,
  onSubmitResponse,
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
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: RADIUS_TOKENS.xl,
            p: { xs: 1, sm: 2 },
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
        {/* Step 1: Copy Prompt Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: RADIUS_TOKENS.md,
            bgcolor: isDark ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.success.main, 0.02),
            borderColor: alpha(theme.palette.success.main, 0.25),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
              {t('settings:providers.byoAiStep1', '1. Copy Calibrated Prompt')}
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
              onClick={handleCopyPrompt}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {copied
                ? t('settings:providers.promptCopied', 'Prompt Copied!')
                : t('settings:providers.copyPrompt', 'Copy Full Prompt')}
            </Button>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={promptText}
            slotProps={{ input: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                bgcolor: 'background.default',
              },
            }}
          />

          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {t('settings:providers.openInWebAi', 'Open in Web AI:')}
            </Typography>
            <Button
              size="small"
              variant="text"
              color="inherit"
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
              sx={{ fontSize: '0.74rem', textTransform: 'none', py: 0 }}
            >
              ChatGPT
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
              sx={{ fontSize: '0.74rem', textTransform: 'none', py: 0 }}
            >
              Claude
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
              sx={{ fontSize: '0.74rem', textTransform: 'none', py: 0 }}
            >
              Gemini
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              href="https://chat.deepseek.com"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
              sx={{ fontSize: '0.74rem', textTransform: 'none', py: 0 }}
            >
              DeepSeek
            </Button>
          </Box>
        </Paper>

        {/* Step 2: Paste Response */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('settings:providers.pasteAiResponse', '2. Paste AI Response')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={7}
            placeholder={t(
              'settings:providers.pasteAiResponsePlaceholder',
              'Paste the complete response generated by ChatGPT, Claude, Gemini here...'
            )}
            value={responseInput}
            onChange={(e) => {
              setResponseInput(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.8rem',
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

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button variant="text" color="inherit" onClick={onClose} disabled={isProcessing}>
          {t('common:actions.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowRoundedIcon />}
          onClick={handleProcess}
          disabled={isProcessing || !responseInput.trim()}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {t('settings:providers.processResponseAndContinue', 'Process Response & Continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
