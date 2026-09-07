import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
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
  Alert,
  AlertTitle,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useTranslation } from 'react-i18next';
import { AIProviderId, AIProviderSettings } from '../../../types';
import { AVAILABLE_AI_MODELS } from '../../../constants/models';
import { useAiConnectionTest } from '../../../hooks/useAiConnectionTest';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface AiConfigFormProps {
  settings: AIProviderSettings;
  onSettingsChange: (settings: AIProviderSettings) => void;
  layout?: 'grid' | 'stacked' | 'modal';
  showTestButton?: boolean;
  showSubmitButton?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

/**
 * Unified, single-source-of-truth AI configuration form component.
 * Reused seamlessly between the Settings Page (grid layout) and the Contextual Setup Modal (modal layout).
 */
export const AiConfigForm: React.FC<AiConfigFormProps> = ({
  settings,
  onSettingsChange,
  layout = 'grid',
  showTestButton = true,
  showSubmitButton = false,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}) => {
  const { t } = useTranslation(['settings', 'target', 'common']);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const [showKey, setShowKey] = useState(false);
  const [showOtherProviders, setShowOtherProviders] = useState(false);
  const {
    testingConnection,
    testResult,
    setTestResult,
    runConnectionTest,
  } = useAiConnectionTest();

  const isLocal = settings.provider === 'local';

  const handleProviderChange = (provider: AIProviderId) => {
    let defaultModel = 'gemini-2.5-flash';
    let defaultEndpoint = settings.customEndpoint;

    if (provider === 'local') {
      defaultModel = 'llama3.2';
      defaultEndpoint = defaultEndpoint || 'http://localhost:11434/v1';
    } else if (provider === 'groq') {
      defaultModel = 'llama-3.3-70b-versatile';
    } else if (provider === 'openai') {
      defaultModel = 'gpt-4o';
    } else if (provider === 'claude') {
      defaultModel = 'claude-3-7-sonnet-latest';
    } else if (provider === 'openrouter') {
      defaultModel = 'openrouter-free';
    } else if (provider === 'custom') {
      defaultModel = 'custom-endpoint';
      defaultEndpoint = defaultEndpoint || 'http://localhost:8000/v1';
    } else if (provider === 'manual') {
      defaultModel = 'byo-ai-manual';
    }

    onSettingsChange({
      ...settings,
      provider,
      model: defaultModel,
      customEndpoint: defaultEndpoint,
    });
    setTestResult(null);
  };

  const handleLocalPreset = (type: 'ollama' | 'lm-studio' | 'custom') => {
    let endpoint = 'http://localhost:11434/v1';
    let model = 'llama3.2';

    if (type === 'lm-studio') {
      endpoint = 'http://localhost:1234/v1';
      model = 'local-model';
    } else if (type === 'custom') {
      endpoint = settings.customEndpoint || 'http://localhost:8080/v1';
      model = settings.model || 'local-model';
    }

    onSettingsChange({
      ...settings,
      provider: 'local',
      localServerType: type,
      customEndpoint: endpoint,
      model,
    });
    setTestResult(null);
  };

  const handleRunTest = () => {
    runConnectionTest(settings);
  };

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
  const currentModels = AVAILABLE_AI_MODELS.filter(m => m.provider === settings.provider);
  const isKnownModel = currentModels.some(m => m.id === settings.model);
  const isManual = settings.provider === 'manual';
  const canSubmit = isLocal || isManual ? true : Boolean(settings.apiKey && settings.apiKey.trim().length > 5);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Provider Options List Definition
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

  /* -------------------------------------------------------------------------- */
  /* Sub-View: Provider Selection List                                          */
  /* -------------------------------------------------------------------------- */
  const renderProviderSelector = () => (
    <Paper
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        border: `1px solid ${muiTheme.palette.divider}`,
        bgcolor: 'background.paper',
        borderRadius: 2,
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
        value={settings.provider}
        onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
        sx={{ gap: 1.5 }}
      >
        {providerOptions.map((opt) => {
          const isSelected = settings.provider === opt.id;
          const isLocalOpt = opt.id === 'local';
          const activeColor = isLocalOpt ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main;

          return (
            <Paper
              key={opt.id}
              variant="outlined"
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 1.5,
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
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word', mt: 0.25 }}>
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

  /* -------------------------------------------------------------------------- */
  /* Sub-View: Credentials & Model Parameters Panel                             */
  /* -------------------------------------------------------------------------- */
  const renderCredentialsAndParameters = () => (
    <Paper
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        border: `1px solid ${muiTheme.palette.divider}`,
        bgcolor: 'background.paper',
        borderRadius: RADIUS_TOKENS.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyRoundedIcon color={isManual ? 'success' : isLocal ? 'secondary' : 'primary'} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isManual
            ? t('settings:providers.byoAiTitle', 'Bring Your Own AI (Prompt & Paste)')
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
                onClick={() => handleLocalPreset('ollama')}
              >
                Ollama (11434)
              </Button>
              <Button
                fullWidth
                variant={settings.localServerType === 'lm-studio' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => handleLocalPreset('lm-studio')}
              >
                LM Studio (1234)
              </Button>
              <Button
                fullWidth
                variant={settings.localServerType === 'custom' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => handleLocalPreset('custom')}
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
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
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
              placeholder="e.g. qwen2.5:14b, deepseek-r1:14b"
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
                onClick={handleRunTest}
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

  /* -------------------------------------------------------------------------- */
  /* Main Container Layout Rendering                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {/* Test Result Alert */}
      {testResult && (
        <Alert
          severity={testResult.success ? 'success' : 'warning'}
          sx={{ borderRadius: RADIUS_TOKENS.md }}
          onClose={() => setTestResult(null)}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            {testResult.success
              ? t('settings:providers.connectionSuccess', 'Connection Successful')
              : t('settings:providers.connectionIssue', 'Connection Issue Detected')}
          </AlertTitle>
          <Typography variant="body2">{testResult.message}</Typography>
          {testResult.detectedModels && testResult.detectedModels.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t('settings:providers.detectedModels', 'Detected Models:')}
              </Typography>
              {testResult.detectedModels.slice(0, 6).map((dm: string) => (
                <Chip
                  key={dm}
                  label={dm}
                  size="small"
                  clickable
                  onClick={() => onSettingsChange({ ...settings, model: dm })}
                  color={settings.model === dm ? 'secondary' : 'default'}
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                />
              ))}
            </Box>
          )}
        </Alert>
      )}

      {layout === 'grid' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: { xs: 2, md: 3 },
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {renderProviderSelector()}
          {renderCredentialsAndParameters()}
        </Box>
      ) : layout === 'modal' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Active Provider Card / Input */}
          {renderCredentialsAndParameters()}

          {/* Collapsible Accordion for Alternative Providers */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowOtherProviders(!showOtherProviders)}
              endIcon={showOtherProviders ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {t('settings:providers.alternativeProviders', 'Alternative AI Providers')}
            </Button>

            <Collapse in={showOtherProviders} sx={{ mt: 1.5, textAlign: 'left' }}>
              {renderProviderSelector()}
            </Collapse>
          </Box>
        </Box>
      ) : (
        /* Stacked Layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {renderProviderSelector()}
          {renderCredentialsAndParameters()}
        </Box>
      )}

      {/* Optional Submit Button (for modal dialogs) */}
      {showSubmitButton && (
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={!canSubmit || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <BoltRoundedIcon />}
          sx={{
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.95rem',
            mt: 0.5,
          }}
        >
          {submitLabel || t('target:actions.tailorNow', 'Tailor Resume Now')}
        </Button>
      )}
    </Box>
  );
};
