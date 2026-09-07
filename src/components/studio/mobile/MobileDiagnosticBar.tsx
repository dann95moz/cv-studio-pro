import React from 'react';
import {
  Box,
  Typography,
  ButtonBase,
  useTheme,
  alpha,
} from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MobileDiagnosticBarProps {
  auditScore: number;
  matchScore: number;
  onSelectTab: (tab: 'audit' | 'gap' | 'interview') => void;
  scoreUpdated?: boolean;
}

/**
 * MobileDiagnosticBar:
 * 3-capsule horizontal metric bar for mobile screens (calidad, ajuste, prep).
 * Directly connects mobile users to ATS Quality Audit, Gap Analysis (Brechas),
 * and Interview Question Simulator with 1-tap access.
 */
export const MobileDiagnosticBar: React.FC<MobileDiagnosticBarProps> = ({
  auditScore = 0,
  matchScore = 0,
  onSelectTab,
  scoreUpdated = false,
}) => {
  const { t } = useTranslation(['preview', 'gap', 'audit']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const formattedAuditScore =
    auditScore > 0 ? (auditScore >= 10 ? '10' : auditScore.toFixed(1)) : '--';
  const formattedMatchScore = matchScore > 0 ? `${matchScore}%` : '--';

  return (
    <Box
      className="no-print mobile-diagnostic-bar"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1.25,
        px: 2,
        py: 0.85,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 1. Quality Card (Calidad) */}
      <ButtonBase
        onClick={() => onSelectTab('audit')}
        aria-label={t('audit:title', 'Auditoría de Calidad')}
        sx={{
          width: '100%',
          py: 0.85,
          px: 1,
          borderRadius: RADIUS_TOKENS.md,
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.action.hover, 0.04),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          '&:active': {
            transform: 'scale(0.97)',
            bgcolor: alpha(theme.palette.action.hover, 0.08),
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.2rem',
            lineHeight: 1.1,
            color: scoreUpdated ? 'primary.main' : 'success.main',
          }}
        >
          {formattedAuditScore}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'lowercase',
            mt: 0.25,
          }}
        >
          {t('preview:drawer.quality', 'calidad')}
        </Typography>
      </ButtonBase>

      {/* 2. Match / Gap Card (Ajuste / Brechas) */}
      <ButtonBase
        onClick={() => onSelectTab('gap')}
        aria-label={t('gap:matchScore', 'Ajuste de Vacante y Brechas')}
        sx={{
          width: '100%',
          py: 0.85,
          px: 1,
          borderRadius: RADIUS_TOKENS.md,
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.action.hover, 0.04),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          '&:active': {
            transform: 'scale(0.97)',
            bgcolor: alpha(theme.palette.action.hover, 0.08),
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.2rem',
            lineHeight: 1.1,
            color: isDark ? theme.palette.warning.light : '#b45309',
          }}
        >
          {formattedMatchScore}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'lowercase',
            mt: 0.25,
          }}
        >
          {t('preview:drawer.match', 'ajuste')}
        </Typography>
      </ButtonBase>

      {/* 3. Interview Prep Card (Prep) */}
      <ButtonBase
        onClick={() => onSelectTab('interview')}
        aria-label={t('preview:drawer.interviewPrep', 'Simulador de Entrevista')}
        sx={{
          width: '100%',
          py: 0.85,
          px: 1,
          borderRadius: RADIUS_TOKENS.md,
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.action.hover, 0.04),
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          '&:active': {
            transform: 'scale(0.97)',
            bgcolor: alpha(theme.palette.action.hover, 0.08),
          },
        }}
      >
        <Box sx={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 21, color: 'primary.main' }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'lowercase',
            mt: 0.25,
          }}
        >
          {t('preview:drawer.shortInterview', 'prep')}
        </Typography>
      </ButtonBase>
    </Box>
  );
};
