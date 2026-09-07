import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Collapse,
  Button,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { useTranslation } from 'react-i18next';
import { QuickMatchResult } from '../../../core/matching/quickMatcher';

export interface QuickScoreBadgeProps {
  result: QuickMatchResult;
  onAddSkillToMaster?: (skill: string) => void;
}

export const QuickScoreBadge: React.FC<QuickScoreBadgeProps> = ({ result, onAddSkillToMaster }) => {
  const { t } = useTranslation(['target', 'common']);
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (result.totalKeywords === 0) {
    return null;
  }

  const colorKey =
    result.verdict === 'high' ? 'success' : result.verdict === 'moderate' ? 'warning' : 'info';
  const colorMain = theme.palette[colorKey].main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(colorMain, 0.05),
        border: `1px solid ${alpha(colorMain, 0.25)}`,
        transition: 'all 0.25s ease',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 38, sm: 44 },
              height: { xs: 38, sm: 44 },
              borderRadius: '50%',
              bgcolor: alpha(colorMain, 0.15),
              color: colorMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              flexShrink: 0,
            }}
          >
            {result.score}%
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t('target:quickScore.title', 'Quick Score de Compatibilidad')}
              </Typography>
              <Chip
                size="small"
                color={colorKey}
                label={
                  result.verdict === 'high'
                    ? t('target:quickScore.highFit', 'Alto Encaje')
                    : result.verdict === 'moderate'
                    ? t('target:quickScore.moderateFit', 'Encaje Moderado')
                    : t('target:quickScore.lowFit', 'Encaje Inicial')
                }
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('target:quickScore.summary', {
                matched: result.matchedKeywords.length,
                total: result.totalKeywords,
                defaultValue: `${result.matchedKeywords.length} de ${result.totalKeywords} palabras clave encontradas en tu Perfil Maestro`,
              })}
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={
            expanded ? (
              <KeyboardArrowUpRoundedIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownRoundedIcon fontSize="small" />
            )
          }
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
        >
          {expanded
            ? t('common:actions.hideDetails', 'Ocultar desglose')
            : t('common:actions.viewDetails', 'Ver desglose')}
        </Button>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
          {/* Matched keywords */}
          {result.matchedKeywords.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: 'success.main' }}
              >
                ✓ {t('target:quickScore.matchedSkills', 'Habilidades que ya tienes en tu perfil:')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {result.matchedKeywords.map((kw) => (
                  <Chip
                    key={kw}
                    label={kw}
                    size="small"
                    color="success"
                    variant="outlined"
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                    sx={{ fontSize: '0.6875rem', height: 22 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Missing keywords */}
          {result.missingKeywords.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: 'text.secondary' }}
              >
                ⚡ {t('target:quickScore.missingSkills', 'Habilidades de la vacante no detectadas en tu perfil:')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {result.missingKeywords.map((kw) => (
                  <Tooltip
                    key={kw}
                    title={
                      onAddSkillToMaster
                        ? t('target:quickScore.addSkillTip', {
                            skill: kw,
                            defaultValue: `Haz clic para agregar '${kw}' a tu perfil si tienes experiencia`,
                          })
                        : t(
                            'target:quickScore.missingTooltip',
                            'Si tienes experiencia en esto, agrégalo a tu Master CV para mejorar tu puntuación.'
                          )
                    }
                  >
                    <Chip
                      label={kw}
                      size="small"
                      variant="outlined"
                      color="warning"
                      icon={<AddCircleOutlineRoundedIcon sx={{ fontSize: '13px !important' }} />}
                      clickable={Boolean(onAddSkillToMaster)}
                      onClick={onAddSkillToMaster ? () => onAddSkillToMaster(kw) : undefined}
                      sx={{
                        fontSize: '0.6875rem',
                        height: 22,
                        borderColor: alpha(theme.palette.warning.main, 0.4),
                        color: 'warning.main',
                        cursor: onAddSkillToMaster ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        '&:hover': onAddSkillToMaster
                          ? {
                              bgcolor: alpha(theme.palette.warning.main, 0.12),
                              borderColor: 'warning.main',
                              transform: 'translateY(-1px)',
                            }
                          : undefined,
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};
