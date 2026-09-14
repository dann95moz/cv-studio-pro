import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { ProfileCompletenessResult } from '../../../hooks/useMasterProfileCompleteness';

export interface ProfileCompletenessBarProps {
  completeness: ProfileCompletenessResult;
  onSelectMissingSection?: (sectionId: string) => void;
}

export const ProfileCompletenessBar: React.FC<ProfileCompletenessBarProps> = ({
  completeness,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const { score, level, completedCount, totalCount } = completeness;

  const colorKey =
    level === 'complete' ? 'success' : level === 'good' ? 'primary' : 'warning';
  const colorMain = theme.palette[colorKey].main;

  if (level === 'complete') {
    return (
      <Paper
        elevation={0}
        sx={{
          py: 0.85,
          px: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          bgcolor: alpha(colorMain, 0.05),
          border: `1px solid ${alpha(colorMain, 0.25)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          transition: 'all 0.2s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <CheckCircleRoundedIcon sx={{ color: colorMain, fontSize: 18, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('profile:completeness.title', 'Completitud del Perfil Maestro')}:{' '}
            <Box component="span" sx={{ color: colorMain }}>
              100%
            </Box>
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, ml: 1, display: { xs: 'none', sm: 'inline' } }}>
              • {t('profile:completeness.levelComplete', '¡Perfil robusto! Listo para adaptar con alto impacto ATS.')}
            </Box>
          </Typography>
        </Box>

        <Chip
          size="small"
          color="success"
          variant="outlined"
          label={`${completedCount}/${totalCount} ${t('profile:completeness.sectionsDone', 'secciones')}`}
          sx={{ fontWeight: 600, height: 22, fontSize: '0.6875rem', flexShrink: 0 }}
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1,
        px: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(colorMain, 0.04),
        border: `1px solid ${alpha(colorMain, 0.2)}`,
        transition: 'all 0.2s ease',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 0.85,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <AutoAwesomeRoundedIcon sx={{ color: colorMain, fontSize: 18, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('profile:completeness.title', 'Completitud del Perfil Maestro')}:{' '}
            <Box component="span" sx={{ color: colorMain }}>
              {score}%
            </Box>
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, ml: 1, display: { xs: 'none', sm: 'inline' } }}>
              • {level === 'good'
                ? t('profile:completeness.levelGood', 'Perfil sólido. Puedes generar CVs o completar secciones para mayor afinidad.')
                : t('profile:completeness.levelInitial', 'Perfil básico. Te sugerimos agregar más detalles para un mejor resultado.')}
            </Box>
          </Typography>
        </Box>

        <Chip
          size="small"
          color={colorKey}
          variant="outlined"
          label={`${completedCount}/${totalCount} ${t('profile:completeness.sectionsDone', 'secciones')}`}
          sx={{ fontWeight: 600, height: 22, fontSize: '0.6875rem', flexShrink: 0 }}
        />
      </Box>

      {/* Determinate Progress Meter */}
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 6,
          borderRadius: 9999,
          bgcolor: alpha(colorMain, 0.12),
          '& .MuiLinearProgress-bar': {
            borderRadius: 9999,
            bgcolor: colorMain,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      />
    </Paper>
  );
};

