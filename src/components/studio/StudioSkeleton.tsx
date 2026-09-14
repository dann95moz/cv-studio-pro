import React from 'react';
import {
  Box,
  Skeleton,
  Paper,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';

export type StudioSkeletonVariant =
  | 'preview'
  | 'masterData'
  | 'guidedForm'
  | 'targetJob'
  | 'audit'
  | 'gap'
  | 'history'
  | 'settings'
  | 'landing'
  | 'drawer'
  | 'workspace';

interface StudioSkeletonProps {
  variant?: StudioSkeletonVariant;
  customMessage?: string;
}

export const StudioSkeleton: React.FC<StudioSkeletonProps> = ({
  variant = 'workspace',
  customMessage
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusText = (): string => {
    if (customMessage) return customMessage;
    switch (variant) {
      case 'preview':
        return t('loading.preview', 'Rendering high-fidelity preview...');
      case 'masterData':
      case 'guidedForm':
        return t('loading.profile', 'Preparing profile & career data...');
      case 'targetJob':
        return t('loading.target', 'Loading job matching workspace...');
      case 'audit':
        return t('loading.audit', 'Calibrating ATS audit metrics...');
      case 'gap':
        return t('loading.gap', 'Analyzing skill match & gap strategy...');
      case 'history':
        return t('loading.history', 'Retrieving application versions...');
      case 'settings':
        return t('loading.settings', 'Loading studio preferences...');
      case 'landing':
      case 'workspace':
      default:
        return t('loading.workspace', 'Preparing your resume studio...');
    }
  };

  const statusPill = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        borderRadius: 9999,
        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.3 : 0.2)}`,
        backdropFilter: 'blur(8px)',
        mb: 2.5,
        boxShadow: 2,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      <AutoAwesomeRoundedIcon
        sx={{
          fontSize: 16,
          color: theme.palette.primary.main,
          animation: 'spin 4s linear infinite'
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
          letterSpacing: '0.01em',
          fontSize: '0.82rem'
        }}
      >
        {getStatusText()}
      </Typography>
    </Box>
  );

  // Render Skeleton for A4 Preview Workspace
  if (variant === 'preview') {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {statusPill}
        </Box>
        {/* Preview Top Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rounded" width={110} height={32} />
            <Skeleton variant="rounded" width={90} height={32} />
            <Skeleton variant="rounded" width={140} height={32} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={140} height={32} />
          </Stack>
        </Paper>

        {/* Center Simulated A4 Document Sheet */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, overflow: 'hidden' }}>
          <Paper
            elevation={2}
            sx={{
              width: '100%',
              maxWidth: 794,
              minHeight: 650,
              p: { xs: 2.5, sm: 4.5 },
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5
            }}
          >
            {/* CV Header */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={38} />
                <Skeleton variant="text" width="35%" height={22} />
                <Skeleton variant="text" width="70%" height={18} sx={{ mt: 0.5 }} />
              </Box>

            </Box>

            {/* Summary Block */}
            <Box>
              <Skeleton variant="text" width="25%" height={26} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width="100%" height={50} />
            </Box>

            {/* Experience Blocks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="text" width="30%" height={26} />
              <Box>
                <Skeleton variant="text" width="40%" height={22} />
                <Skeleton variant="text" width="20%" height={18} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="95%" height={16} />
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="text" width="85%" height={16} />
              </Box>
              <Box>
                <Skeleton variant="text" width="45%" height={22} />
                <Skeleton variant="text" width="25%" height={18} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="92%" height={16} />
                <Skeleton variant="text" width="88%" height={16} />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Render Skeleton for Quality Audit View
  if (variant === 'audit') {
    return (
      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {statusPill}
        </Box>
        {/* Score Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap'
          }}
        >
          <Skeleton variant="circular" width={90} height={90} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="rounded" width="100%" height={12} sx={{ mt: 1.5, borderRadius: 1 }} />
          </Box>
        </Paper>

        {/* 4 Dimension Metrics Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}
            >
              <Skeleton variant="rounded" width={36} height={36} sx={{ mb: 1.5, borderRadius: 1 }} />
              <Skeleton variant="text" width="60%" height={22} />
              <Skeleton variant="text" width="40%" height={28} sx={{ my: 0.5 }} />
              <Skeleton variant="text" width="90%" height={16} />
            </Paper>
          ))}
        </Box>

        {/* Section Accordions */}
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={64} sx={{ borderRadius: 1.5 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  // Render Skeleton for Settings View
  if (variant === 'settings') {
    return (
      <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {statusPill}
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3.5 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <Skeleton variant="text" width="35%" height={36} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
          
          <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
            <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
          </Stack>

          <Stack spacing={2.5}>
            <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: 1.5 }} />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Render Skeleton for Side Drawer / Panels
  if (variant === 'drawer') {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="85%" height={18} sx={{ mb: 1 }} />
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={70} sx={{ borderRadius: 1.5 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  // Mobile-adapted Step Flow Skeleton (Guided Profile Form & Personal Info)
  if (isMobile && (variant === 'guidedForm' || variant === 'masterData')) {
    return (
      <Box sx={{ width: '100%', maxWidth: 580, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {statusPill}
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            minHeight: 420,
            justifyContent: 'space-between',
          }}
        >
          {/* Micro-stepper dots */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
            <Stack direction="row" spacing={0.75}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} variant="circular" width={8} height={8} />
              ))}
            </Stack>
            <Skeleton variant="text" width={45} height={18} />
          </Box>

          {/* Hero Question Block */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="55%" height={18} sx={{ mt: 0.5 }} />
              </Box>
            </Box>

            {/* Single Hero Input Box */}
            <Skeleton variant="rounded" width="100%" height={54} sx={{ borderRadius: 2, mt: 1 }} />
          </Box>

          {/* Bottom Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="rounded" width={130} height={42} sx={{ borderRadius: 9999 }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  // Default / Step Wizard & Form Skeleton (Guided Assistant, Target Job, Master Data)
  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', p: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {statusPill}
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3.5 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={36} />
            <Skeleton variant="text" width="65%" height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        </Box>

        <Stack spacing={2} sx={{ my: 1 }}>
          <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width="100%" height={220} sx={{ borderRadius: 1.5 }} />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Skeleton variant="rounded" width={100} height={38} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={160} height={38} sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    </Box>
  );
};

