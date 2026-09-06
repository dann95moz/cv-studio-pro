import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import { useTranslation } from 'react-i18next';
import { SettingsAiTab } from './settings/SettingsAiTab';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { SettingsViewProps } from '../../types';
import { APP_LINKS } from '../../constants/links';

export type { SettingsViewProps };

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsChange,
  onResetDefaults,
  onOpenSync,
}) => {
  const { t } = useTranslation(['settings', 'common', 'feedback']);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 48px)', sm: 5, md: 6 }, display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          border: `1px solid ${muiTheme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 1,
            bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
            color: muiTheme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SettingsRoundedIcon fontSize="medium" />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
            {t('settings:title', 'Settings & AI Configuration')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {t('settings:subtitle', 'Configure your AI engine provider, model credentials, and generation parameters.')}
          </Typography>
        </Box>
      </Paper>

      {/* Multidevice Sync Card */}
      {onOpenSync && (
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: `1px solid ${muiTheme.palette.divider}`,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DevicesRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}
              >
                {t('common:sync.settingsCardTitle', 'Sincronización Multidispositivo (Snapshot Pull & Push)')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                {t(
                  'common:sync.settingsCardSubtitle',
                  'Transfiere todo tu espacio de trabajo (Master CV, versiones, vacantes y Kanban) entre PC y smartphone mediante código QR o enlace efímero con cifrado E2EE.'
                )}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<QrCode2RoundedIcon sx={{ fontSize: 18 }} />}
            onClick={onOpenSync}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0, textTransform: 'none', px: 2.5 }}
          >
            {t('common:sync.openSyncAction', 'Sincronizar Dispositivos')}
          </Button>
        </Paper>
      )}

      {/* Main AI Configuration Panel */}
      <SettingsAiTab
        settings={settings}
        onSettingsChange={onSettingsChange}
      />

      {/* Open Source & Community Credit */}
      <Paper
        sx={{
          p: { xs: 1.75, sm: 2.5 },
          border: `1px solid ${muiTheme.palette.divider}`,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StarRoundedIcon sx={{ fontSize: 24, color: 'inherit' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {t('common:footer.openSource', 'Open Source & Community')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
              {t('common:footer.craftedBy', 'Crafted by')} <strong>{APP_LINKS.AUTHOR_NAME}</strong> · {t('common:footer.communityNote', 'If CV Studio helped you land an interview, a star on GitHub helps more people find it.')}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<StarRoundedIcon sx={{ fontSize: 18 }} />}
          endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
          href={APP_LINKS.GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
        >
          {t('common:footer.giveStar', 'Give a star')}
        </Button>
      </Paper>

      {/* Feedback & Suggestions Strip */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          border: `1px solid ${muiTheme.palette.divider}`,
          bgcolor: alpha(muiTheme.palette.text.primary, 0.02),
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RateReviewRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              {t('feedback:promptTitle', 'Have feedback or suggestions?')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              {t('feedback:promptSubtitle', 'Tell us what you love or what we should improve next.')}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RateReviewRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setIsFeedbackOpen(true)}
          sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0, fontWeight: 700 }}
        >
          {t('feedback:promptButton', 'Send Feedback')}
        </Button>
      </Paper>

      {/* Danger Zone: Reset Workspace */}
      <Paper
        sx={{
          p: { xs: 1.75, sm: 2.25 },
          borderRadius: 2,
          border: `1px solid ${alpha(muiTheme.palette.error.main, 0.3)}`,
          bgcolor: alpha(muiTheme.palette.error.main, isDark ? 0.04 : 0.02),
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
            {t('settings:general.resetWorkspace', 'Reset Entire Workspace')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {t('settings:general.resetConfirm', 'Permanently resets all draft texts, API keys, and configurations back to clean blank defaults.')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteSweepRoundedIcon />}
          onClick={onResetDefaults}
          sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0, fontWeight: 700 }}
        >
          {t('common:actions.reset', 'Reset Workspace')}
        </Button>
      </Paper>

      {/* Dedicated End-of-Scroll Safe Spacer */}
      <Box sx={{ height: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', sm: 20 }, flexShrink: 0 }} />

      {/* In-App Feedback Modal */}
      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentRoute="settings"
      />
    </Box>
  );
};
