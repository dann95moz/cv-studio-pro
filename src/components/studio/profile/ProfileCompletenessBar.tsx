import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { ProfileCompletenessResult } from '../../../hooks/useMasterProfileCompleteness';

export interface ProfileCompletenessBarProps {
  completeness: ProfileCompletenessResult;
  onSelectMissingSection?: (sectionId: string) => void;
}

export const ProfileCompletenessBar: React.FC<ProfileCompletenessBarProps> = ({
  completeness,
  onSelectMissingSection,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const { score, level, missingSections, completedCount, totalCount } = completeness;

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
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(colorMain, 0.04),
        border: `1px solid ${alpha(colorMain, 0.2)}`,
        transition: 'all 0.2s ease',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 1.25,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: alpha(colorMain, 0.12),
              color: colorMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('profile:completeness.title', 'Completitud del Perfil Maestro')}:{' '}
              <Box component="span" sx={{ color: colorMain }}>
                {score}%
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {level === 'good'
                ? t('profile:completeness.levelGood', 'Perfil sólido. Puedes generar CVs o completar secciones para mayor afinidad.')
                : t('profile:completeness.levelInitial', 'Perfil básico. Te sugerimos agregar más detalles para un mejor resultado.')}
            </Typography>
          </Box>
        </Box>

        <Chip
          size="small"
          color={colorKey}
          variant="outlined"
          label={`${completedCount}/${totalCount} ${t('profile:completeness.sectionsDone', 'secciones')}`}
          sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ width: '100%', mb: missingSections.length > 0 ? 1.5 : 0 }}>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 8,
            borderRadius: 9999,
            bgcolor: alpha(colorMain, 0.12),
            '& .MuiLinearProgress-bar': {
              borderRadius: 9999,
              bgcolor: colorMain,
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />
      </Box>

      {/* Missing sections suggestion chips */}
      {missingSections.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('profile:completeness.suggestedAdd', 'Sugerido agregar:')}
          </Typography>
          {missingSections.map((item) => (
            <Tooltip
              key={item.id}
              title={t('profile:completeness.clickToAdd', 'Ir a la sección para completarla')}
            >
              <Chip
                size="small"
                label={t(item.labelKey, item.defaultLabel)}
                icon={<AddRoundedIcon sx={{ fontSize: '13px !important' }} />}
                onClick={onSelectMissingSection ? () => onSelectMissingSection(item.id) : undefined}
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  border: `1px dashed ${alpha(theme.palette.text.primary, 0.25)}`,
                  cursor: onSelectMissingSection ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  '&:hover': onSelectMissingSection
                    ? {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        transform: 'translateY(-1px)',
                      }
                    : {},
                }}
              />
            </Tooltip>
          ))}
        </Box>
      )}
    </Paper>
  );
};
