import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useTranslation } from 'react-i18next';
import { AIProviderId, AIProviderSettings } from '../../../types';
import { useAiConnectionTest } from '../../../hooks/useAiConnectionTest';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { AiProviderSelector } from './AiProviderSelector';
import { AiParametersPanel } from './AiParametersPanel';

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
 * Unified AI configuration form orchestrator.
 * Decomposed into AiProviderSelector and AiParametersPanel.
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
  const [showOtherProviders, setShowOtherProviders] = useState(false);
  const {
    testingConnection,
    testResult,
    setTestResult,
    runConnectionTest,
  } = useAiConnectionTest();

  const isLocal = settings.provider === 'local';
  const isManual = settings.provider === 'manual';
  const canSubmit = isLocal || isManual ? true : Boolean(settings.apiKey && settings.apiKey.trim().length > 5);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const providerSelectorElement = (
    <AiProviderSelector
      selectedProvider={settings.provider}
      onSelectProvider={handleProviderChange}
    />
  );

  const parametersPanelElement = (
    <AiParametersPanel
      settings={settings}
      onSettingsChange={onSettingsChange}
      onLocalPreset={handleLocalPreset}
      showTestButton={showTestButton}
      testingConnection={testingConnection}
      onRunTest={() => runConnectionTest(settings)}
    />
  );

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
          {providerSelectorElement}
          {parametersPanelElement}
        </Box>
      ) : layout === 'modal' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {parametersPanelElement}

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
              {providerSelectorElement}
            </Collapse>
          </Box>
        </Box>
      ) : (
        /* Stacked Layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {providerSelectorElement}
          {parametersPanelElement}
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
