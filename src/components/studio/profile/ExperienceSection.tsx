import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Collapse,
  Divider,
  useTheme,
  alpha
} from '@mui/material';

import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useTranslation } from 'react-i18next';
import { ExperienceItem, ExperienceSectionProps } from '../../../types';
import { GuidedSectionNavFooter } from './GuidedSectionNavFooter';

export type { ExperienceSectionProps };

interface ExperienceCardProps {
  exp: ExperienceItem;
  expIdx: number;
  isExpanded: boolean;
  onToggle: () => void;
  onFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onRemoveExperience: (index: number) => void;
  onAddBullet: (expIndex: number) => void;
  onUpdateBullet: (expIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet: (expIndex: number, bulletIndex: number) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = React.memo(({
  exp,
  expIdx,
  isExpanded,
  onToggle,
  onFieldChange,
  onRemoveExperience,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        borderColor: isExpanded ? 'primary.main' : theme.palette.divider,
        borderWidth: isExpanded ? 1.5 : 1,
        bgcolor: isExpanded
          ? alpha(theme.palette.primary.main, isDark ? 0.04 : 0.02)
          : alpha(theme.palette.text.primary, isDark ? 0.015 : 0.01),
        overflow: 'hidden',
        transition: 'all 0.15s ease-in-out'
      }}
    >
      {/* Header bar: clickable to toggle */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          px: 2,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            bgcolor: alpha(theme.palette.text.primary, 0.02)
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem', color: isExpanded ? 'primary.main' : 'text.primary' }}>
            {exp.company || t('profile:sections.experience.company', 'Empresa / Organización')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
            {exp.role ? `${exp.role} ` : ''}{exp.date ? `• ${exp.date}` : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={t('profile:sections.experience.removeExp', 'Eliminar experiencia')}>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveExperience(expIdx);
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible Form Body */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Divider sx={{ mb: 1 }} />

          {/* 4 Core Metadata Inputs (Grid 2 cols) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField
              label={t('profile:sections.experience.company', 'Empresa')}
              size="small"
              value={exp.company}
              onChange={(e) => onFieldChange(expIdx, 'company', e.target.value)}
              placeholder={t('profile:sections.experience.placeholders.company', 'e.g. Acme Corp, Google, Globant')}
            />
            <TextField
              label={t('profile:sections.experience.role', 'Cargo / Puesto')}
              size="small"
              value={exp.role || ''}
              onChange={(e) => onFieldChange(expIdx, 'role', e.target.value)}
              placeholder={t('profile:sections.experience.placeholders.role', 'e.g. Senior Frontend Engineer')}
            />
            <TextField
              label={t('profile:sections.experience.dates', 'Fechas')}
              size="small"
              value={exp.date || ''}
              onChange={(e) => onFieldChange(expIdx, 'date', e.target.value)}
              placeholder={t('profile:sections.experience.placeholders.dates', 'e.g. Oct 2021 – Present')}
            />
            <TextField
              label={t('profile:sections.experience.location', 'Ubicación / Modalidad')}
              size="small"
              value={exp.location || ''}
              onChange={(e) => onFieldChange(expIdx, 'location', e.target.value)}
              placeholder={t('profile:sections.experience.placeholders.location', 'e.g. London, UK / Remote')}
            />
          </Box>

          {/* Bullets List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
              {t('profile:sections.experience.logros', 'Logros principales')}
            </Typography>

            <Stack spacing={1}>
              {exp.bullets.map((bullet, bIdx) => (
                <Box key={bIdx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    size="small"
                    value={bullet}
                    onChange={(e) => onUpdateBullet(expIdx, bIdx, e.target.value)}
                    placeholder={t('profile:sections.experience.placeholders.bullet', 'Key achievement measured by impact or metrics (e.g. Increased conversion by 28% through...)')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.86rem',
                        lineHeight: 1.4
                      }
                    }}
                  />
                  {exp.bullets.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onRemoveBullet(expIdx, bIdx)}
                      sx={{ mt: 0.5, p: 0.5 }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>

            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onAddBullet(expIdx)}
              sx={{ alignSelf: 'flex-start', mt: 0.5 }}
            >
              {t('profile:sections.experience.addBullet', 'Agregar viñeta de logro')}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
});

export const ExperienceSection: React.FC<ExperienceSectionProps> = React.memo(({
  experience,
  onFieldChange,
  onAddExperience,
  onRemoveExperience,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet,
  onBack,
  onContinue,
  continueLabel,
  isLastSection = false,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleToggleCard = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Header info & Add Role */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkRoundedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
            {t('profile:sections.experience.title', 'Experiencia Laboral')}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => {
            onAddExperience();
            setExpandedIndex(0);
          }}
        >
          {t('profile:sections.experience.addRole', 'Agregar Puesto de Trabajo')}
        </Button>
      </Box>

      {/* Experience Cards Stack */}
      {experience.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 1.5,
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.text.primary, 0.015),
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('profile:sections.experience.empty', 'No hay experiencias laborales agregadas aún (opcional).')}
          </Typography>
        </Paper>

      ) : (
        <Stack spacing={1.5}>
          {experience.map((exp, idx) => (
            <ExperienceCard
              key={idx}
              exp={exp}
              expIdx={idx}
              isExpanded={expandedIndex === idx}
              onToggle={() => handleToggleCard(idx)}
              onFieldChange={onFieldChange}
              onRemoveExperience={onRemoveExperience}
              onAddBullet={onAddBullet}
              onUpdateBullet={onUpdateBullet}
              onRemoveBullet={onRemoveBullet}
            />
          ))}
        </Stack>
      )}

      {/* Navigation Footer */}
      <GuidedSectionNavFooter
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={false}
        isLastSection={isLastSection}
        continueLabel={
          continueLabel
            ? continueLabel
            : experience.length === 0
            ? t('profile:sections.experience.continueWithout', 'Continuar sin experiencia')
            : undefined
        }
      />
    </Box>
  );
});
