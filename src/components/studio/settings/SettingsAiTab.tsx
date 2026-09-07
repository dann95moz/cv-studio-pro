import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  useTheme,
} from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LaptopRoundedIcon from '@mui/icons-material/LaptopRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { SettingsAiTabProps } from '../../../types';
import { AiConfigForm } from '../ai/AiConfigForm';
import { useAiConnectionTest } from '../../../hooks/useAiConnectionTest';

export type { SettingsAiTabProps };

/**
 * Tab panel for configuring AI providers, Local AI, API keys, and model parameters.
 * Reuses the unified AiConfigForm component in grid layout.
 */
export const SettingsAiTab: React.FC<SettingsAiTabProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const muiTheme = useTheme();
  const { testingConnection, statusMessage, runConnectionTest } = useAiConnectionTest();

  const isLocal = settings.provider === 'local';
  const isManual = settings.provider === 'manual';

  const handleRunQuickTest = () => {
    runConnectionTest(settings);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
      {/* Overview Status Bar */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          border: `1px solid ${muiTheme.palette.divider}`,
          bgcolor: 'background.paper',
          borderRadius: 2,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {t('settings:providers.title', 'Active AI Engine')}:{' '}
              {isLocal
                ? t('settings:providers.localAiServer', 'Local AI Server')
                : isManual
                ? t('settings:providers.manualModeTitle', 'Your Own AI')
                : settings.provider.toUpperCase()}
            </Typography>
            {isManual ? (
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label={t('settings:providers.noKeyNeeded', '100% Free • No API Key')}
                size="small"
                color="success"
                sx={{ height: 'auto', minHeight: 22, py: 0.25, fontSize: '0.7rem', fontWeight: 700 }}
              />
            ) : (
              <Chip
                icon={isLocal ? <LaptopRoundedIcon /> : <CloudQueueRoundedIcon />}
                label={
                  isLocal
                    ? t('settings:providers.offlinePrivate', 'Offline & Private')
                    : settings.apiKey
                    ? t('settings:providers.keyConfigured', 'Key Configured')
                    : t('settings:providers.apiKeyRequired', 'API Key Required')
                }
                size="small"
                color={isLocal ? 'secondary' : settings.apiKey ? 'success' : 'warning'}
                sx={{ height: 'auto', minHeight: 22, py: 0.25, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
            {isManual ? (
              <strong>{t('settings:providers.manualModeDesc', 'Mode: Copy & Paste (Your own AI)')}</strong>
            ) : (
              <>
                {t('settings:providers.configuredModel', 'Configured model')}: <strong>{settings.model}</strong>
              </>
            )}
            {statusMessage && ` • ${statusMessage}`}
          </Typography>
        </Box>

        {!isManual && (
          <Button
            variant="outlined"
            size="small"
            color={isLocal ? 'secondary' : 'primary'}
            startIcon={testingConnection ? <CircularProgress size={14} color="inherit" /> : <BoltRoundedIcon />}
            onClick={handleRunQuickTest}
            disabled={testingConnection}
            sx={{ fontWeight: 700, fontSize: '0.8rem', px: 2.25, width: { xs: '100%', sm: 'auto' } }}
          >
            {testingConnection ? t('settings:providers.testing', 'Testing...') : t('settings:providers.testConnection', 'Test Connection')}
          </Button>
        )}
      </Paper>

      {/* Unified AI Configuration Form in 2-column Grid Layout */}
      <AiConfigForm
        settings={settings}
        onSettingsChange={onSettingsChange}
        layout="grid"
        showTestButton={false}
      />
    </Box>
  );
};
