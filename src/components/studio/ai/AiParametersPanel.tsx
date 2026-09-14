import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ButtonGroup,
  Button,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useTranslation } from 'react-i18next';
import { AIProviderId, AIProviderSettings } from '../../../types';
import { AVAILABLE_AI_MODELS } from '../../../constants/models';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface AiParametersPanelProps {
  settings: AIProviderSettings;
  onSettingsChange: (settings: AIProviderSettings) => void;
  onLocalPreset: (type: 'ollama' | 'lm-studio' | 'custom') => void;
  showTestButton?: boolean;
  testingConnection: boolean;
  onRunTest: () => void;
}

export const AiParametersPanel: React.FC<AiParametersPanelProps> = ({
  settings,
  onSettingsChange,
  onLocalPreset,
  showTestButton = true,
  testingConnection,
  onRunTest,
}) => {
  const { t } = useTranslation(['settings']);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const [showKey, setShowKey] = useState(false);

  const isLocal = settings.provider === 'local';
  const isManual = settings.provider === 'manual';

  const getKeyHelper = (provider: AIProviderId) => {
    switch (provider) {
      case 'gemini':
        return { label: t('settings:providers.getKeyGemini', 'Get Free Key at Google AI Studio'), url: 'https://aistudio.google.com/app/apikey' };
      case 'groq':
        return { label: t('settings:providers.getKeyGroq', 'Get Free Key at Groq Console'), url: 'https://console.groq.com/keys' };
      case 'openai':
        return { label: t('settings:providers.getKeyOpenai', 'Get OpenAI Key'), url: 'https://platform.openai.com/api-keys' };
      case 'claude':
        return { label: t('settings:providers.getKeyClaude', 'Get Anthropic Console Key'), url: 'https://console.anthropic.com/settings/keys' };
      case 'openrouter':
        return { label: t('settings:providers.getKeyOpenrouter', 'Get OpenRouter Key'), url: 'https://openrouter.ai/keys' };
      default:
        return null;
    }
  };

  const keyHelper = getKeyHelper(settings.provider);
  const currentModels = AVAILABLE_AI_MODELS.filter((m) => m.provider === settings.provider);
  const isKnownModel = currentModels.some((m) => m.id === settings.model);

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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyRoundedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {isManual
            ? t('settings:providers.byoAiConfigTitle', 'BYO AI Configuration')
            : isLocal
            ? t('settings:providers.localServerParams', 'Local Server Parameters')
            : t('settings:providers.apiKeyParams', 'API Key & Parameters')}
        </Typography>
      </Box>

      {isManual ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: isDark ? alpha(muiTheme.palette.success.main, 0.08) : alpha(muiTheme.palette.success.main, 0.04),
              borderColor: alpha(muiTheme.palette.success.main, 0.3),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoAwesomeRoundedIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                {t('settings:providers.byoAiInfoTitle', 'How using your own AI works (Copy & Paste):')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              {t('settings:providers.byoAiStep1', '1. CV Studio formats your master data, target vacancy, and ATS rules into a single calibrated prompt.')}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              {t('settings:providers.byoAiStep2', '2. Click Copy and paste into your favorite web AI (ChatGPT, Claude, Gemini Web, DeepSeek, Perplexity).')}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              {t('settings:providers.byoAiStep3', '3. Paste the AI response back into CV Studio. Formatting, scoring, and previewing work seamlessly!')}
            </Typography>
          </Paper>
        </Box>
      ) : isLocal ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              {t('settings:providers.presetServer', 'Preset Server:')}
            </Typography>
            <ButtonGroup size="small" variant="outlined" sx={{ width: '100%' }}>
              <Button
                fullWidth
                variant={(settings.localServerType === 'ollama' || !settings.localServerType) ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => onLocalPreset('ollama')}
              >
                Ollama (11434)
              </Button>
              <Button
                fullWidth
                variant={settings.localServerType === 'lm-studio' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => onLocalPreset('lm-studio')}
              >
                LM Studio (1234)
              </Button>
              <Button
                fullWidth
                variant={settings.localServerType === 'custom' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => onLocalPreset('custom')}
              >
                {t('settings:providers.customUrl', 'Custom URL')}
              </Button>
            </ButtonGroup>
          </Box>

          <TextField
            fullWidth
            size="small"
            label={t('settings:providers.localEndpointUrl', 'Local Endpoint URL')}
            value={settings.customEndpoint || 'http://localhost:11434/v1'}
            onChange={(e) => onSettingsChange({ ...settings, customEndpoint: e.target.value })}
          />

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: isDark ? alpha(muiTheme.palette.secondary.main, 0.05) : alpha(muiTheme.palette.secondary.main, 0.02),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <TerminalRoundedIcon fontSize="small" color="secondary" />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t('settings:providers.ollamaCorsTitle', 'Ollama CORS Startup Command:')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: muiTheme.palette.secondary.main, display: 'block' }}>
              OLLAMA_ORIGINS=&quot;*&quot; ollama serve
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Box>
          <TextField
            fullWidth
            label={t('settings:providers.apiKeyLabel', '{{provider}} API Key', { provider: settings.provider.toUpperCase() })}
            type={showKey ? 'text' : 'password'}
            placeholder={t('settings:providers.apiKeyPlaceholderProvider', 'Paste your {{provider}} API key...', { provider: settings.provider })}
            value={settings.apiKey || ''}
            onChange={(e) => onSettingsChange({ ...settings, apiKey: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowKey(!showKey)} edge="end" size="small">
                      {showKey ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {keyHelper && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mt: 0.75, gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                🔒 {t('settings:providers.keyStoredSecurely', "Key stored securely in your browser's private local storage.")}
              </Typography>
              <Button
                size="small"
                variant="text"
                href={keyHelper.url}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
                sx={{ fontSize: '0.72rem', py: 0, textTransform: 'none', px: 0 }}
              >
                {keyHelper.label}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {!isManual && (
        <>
          <FormControl fullWidth size="small">
            <InputLabel id="active-model-select-label">{t('settings:providers.activeModel', 'Active Model')}</InputLabel>
            <Select
              labelId="active-model-select-label"
              value={settings.model}
              label={t('settings:providers.activeModel', 'Active Model')}
              onChange={(e) => onSettingsChange({ ...settings, model: e.target.value })}
            >
              {currentModels.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
              {!isKnownModel && settings.model && settings.model !== 'custom-local-model' && (
                <MenuItem value={settings.model}>
                  {`Local AI — ${settings.model} (Active / Custom)`}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {isLocal && (settings.model === 'custom-local-model' || !isKnownModel) && (
            <TextField
              fullWidth
              size="small"
              label={t('settings:providers.customModelTag', 'Local Model Tag (Ollama / LM Studio)')}
              placeholder={t('settings:providers.customModelTagPlaceholder', 'e.g. qwen2.5:14b, deepseek-r1:14b')}
              helperText={t('settings:providers.customModelTagHelp', "Specify the exact model tag (e.g., qwen2.5:14b, deepseek-r1:14b). Run 'ollama list' to view installed models.")}
              value={settings.model === 'custom-local-model' ? '' : settings.model}
              onChange={(e) => onSettingsChange({ ...settings, model: e.target.value.trim() || 'custom-local-model' })}
            />
          )}

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {t('settings:providers.creativityAndPrecision', 'Creativity & Precision: {{value}}', {
                value: (typeof settings.temperature === 'number' ? settings.temperature : 0.15).toFixed(2),
              })}
            </Typography>
            <Slider
              value={typeof settings.temperature === 'number' ? settings.temperature : 0.15}
              min={0.0}
              max={1.0}
              step={0.05}
              onChange={(_, val) => onSettingsChange({ ...settings, temperature: val as number })}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              {t('settings:providers.temperatureHelp', 'Recommended: 0.10 – 0.20 for strict factual accuracy (Zero Hallucinations).')}
            </Typography>
          </Box>

          {showTestButton && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                color={isLocal ? 'secondary' : 'primary'}
                startIcon={testingConnection ? <CircularProgress size={14} color="inherit" /> : <BoltRoundedIcon />}
                onClick={onRunTest}
                disabled={testingConnection}
                sx={{ fontWeight: 700, fontSize: '0.8rem', px: 2 }}
              >
                {testingConnection ? t('settings:providers.testing', 'Testing...') : t('settings:providers.testConnection', 'Test Connection')}
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};
