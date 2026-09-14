import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { AIProviderId } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface AiProviderSelectorProps {
  selectedProvider: AIProviderId;
  onSelectProvider: (provider: AIProviderId) => void;
}

export const AiProviderSelector: React.FC<AiProviderSelectorProps> = ({
  selectedProvider,
  onSelectProvider,
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const providerOptions: Array<{
    id: AIProviderId;
    title: string;
    chipLabel?: string;
    chipColor?: 'primary' | 'secondary' | 'warning' | 'success';
    desc: string;
    icon?: React.ReactNode;
  }> = [
    {
      id: 'local',
      title: 'Local AI (Ollama / LM Studio)',
      chipLabel: t('settings:providers.freeOffline', '100% Free & Offline'),
      chipColor: 'secondary',
      desc: t('settings:providers.localAiDesc', 'Run locally on your PC without external network dependency.'),
      icon: <LaptopRoundedIcon fontSize="small" color="secondary" />,
    },
    {
      id: 'gemini',
      title: 'Google Gemini',
      chipLabel: t('common:badge.recommended', 'Recommended'),
      chipColor: 'primary',
      desc: t('settings:providers.geminiDesc', 'Fast and accurate with free key from Google AI Studio.'),
      icon: <CloudQueueRoundedIcon fontSize="small" color="primary" />,
    },
    {
      id: 'groq',
      title: 'Groq (Ultra-Fast)',
      chipLabel: t('settings:providers.highSpeed', 'High Speed'),
      chipColor: 'warning',
      desc: t('settings:providers.groqDesc', 'Llama 3.3 70B & DeepSeek R1 running on ultra-fast hardware.'),
      icon: <BoltRoundedIcon fontSize="small" color="warning" />,
    },
    {
      id: 'openai',
      title: 'OpenAI',
      desc: t('settings:providers.openaiDesc', 'GPT-4o and o3-mini models.'),
    },
    {
      id: 'claude',
      title: 'Anthropic Claude',
      desc: t('settings:providers.claudeDesc', 'Claude 3.7 Sonnet & 3.5 Sonnet reasoning.'),
    },
    {
      id: 'openrouter',
      title: 'OpenRouter / Custom Remote Proxy',
      desc: t('settings:providers.openrouterDesc', 'Multi-model gateway or custom base URL.'),
    },
    {
      id: 'manual',
      title: t('settings:providers.byoAiTitle', 'Bring Your Own AI (Prompt & Paste)'),
      chipLabel: t('settings:providers.noKeyNeeded', '100% Free • No API Key'),
      chipColor: 'success',
      desc: t('settings:providers.byoAiDesc', 'Copy calibrated prompts to ChatGPT, Claude, Gemini Web, or DeepSeek and paste the response back.'),
      icon: <AutoAwesomeRoundedIcon fontSize="small" color="success" />,
    },
  ];

  return (
    <Paper
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        border: `1px solid ${muiTheme.palette.divider}`,
        bgcolor: 'background.paper',
        borderRadius: RADIUS_TOKENS.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BoltRoundedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {t('settings:providers.selectAiProvider', 'Select AI Provider')}
        </Typography>
      </Box>

      <RadioGroup
        value={selectedProvider}
        onChange={(e) => onSelectProvider(e.target.value as AIProviderId)}
        sx={{ gap: 1.5 }}
      >
        {providerOptions.map((opt) => {
          const isSelected = selectedProvider === opt.id;
          const isLocalOpt = opt.id === 'local';
          const activeColor = isLocalOpt ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main;

          return (
            <Paper
              key={opt.id}
              variant="outlined"
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: RADIUS_TOKENS.md,
                borderColor: isSelected ? activeColor : muiTheme.palette.divider,
                bgcolor: isSelected ? alpha(activeColor, isDark ? 0.08 : 0.04) : 'transparent',
                transition: 'all 0.15s ease',
                overflow: 'hidden',
              }}
            >
              <FormControlLabel
                value={opt.id}
                control={
                  <Radio
                    color={isLocalOpt ? 'secondary' : 'primary'}
                    size="small"
                    sx={{ p: 0.5, mt: 0.25 }}
                  />
                }
                sx={{ m: 0, width: '100%', display: 'flex', alignItems: 'flex-start', gap: 0.75 }}
                label={
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.86rem' }}>
                        {opt.title}
                      </Typography>
                      {opt.chipLabel && (
                        <Chip
                          label={opt.chipLabel}
                          size="small"
                          color={opt.chipColor || 'primary'}
                          sx={{ height: 18, fontSize: '0.66rem', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25, lineHeight: 1.35 }}
                    >
                      {opt.desc}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          );
        })}
      </RadioGroup>
    </Paper>
  );
};
