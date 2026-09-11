import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  IconButton,
  Autocomplete,
  Tooltip,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { ExperienceItem, ProjectsSectionProps } from '../../../types';

export type { ProjectsSectionProps };

const CATEGORY_SUGGESTIONS: string[] = [
  'Personal Project',
  'Open Source',
  'Conference Talk',
  'Publication',
  'Volunteering',
  'Award / Recognition',
  'Side Venture',
  'Research Paper'
];

interface ProjectCardProps {
  proj: ExperienceItem;
  projIdx: number;
  onFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onRemoveProject: (index: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({
  proj,
  projIdx,
  onFieldChange,
  onRemoveProject
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const descriptionText = (proj.bullets || []).join('\n');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.text.primary, isDark ? 0.015 : 0.012),
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.92rem' }}>
          {proj.company || `${t('profile:sections.projects.projectName', 'Proyecto')} #${projIdx + 1}`}
        </Typography>
        <Tooltip title={t('profile:sections.projects.remove', 'Eliminar proyecto')}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemoveProject(projIdx)}
            sx={{ p: 0.5 }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr' }, gap: 1.5 }}>
        <TextField
          label={t('profile:sections.projects.projectName', 'Título / Nombre del Proyecto')}
          size="small"
          value={proj.company || ''}
          onChange={(e) => onFieldChange(projIdx, 'company', e.target.value)}
          placeholder="e.g. CV Studio Pro"
          fullWidth
        />
        <Autocomplete
          freeSolo
          options={CATEGORY_SUGGESTIONS}
          value={proj.role || ''}
          onInputChange={(_event, newInputValue) => {
            onFieldChange(projIdx, 'role', newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('profile:sections.projects.role', 'Categoría / Rol')}
              size="small"
              placeholder="e.g. Personal Project"
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 0.8fr' }, gap: 1.5 }}>
        <TextField
          label={t('profile:sections.projects.demoUrl', 'Enlace Demo / Sitio Web')}
          size="small"
          value={proj.demoUrl || ''}
          onChange={(e) => onFieldChange(projIdx, 'demoUrl', e.target.value)}
          placeholder="e.g. https://my-app.vercel.app"
          fullWidth
        />
        <TextField
          label={t('profile:sections.projects.repoUrl', 'Repositorio URL')}
          size="small"
          value={proj.repoUrl || (proj.location && (proj.location.includes('github') || proj.location.startsWith('http')) ? proj.location : '')}
          onChange={(e) => onFieldChange(projIdx, 'repoUrl', e.target.value)}
          placeholder="e.g. https://github.com/user/project"
          fullWidth
        />
        <TextField
          label={t('profile:sections.projects.date', 'Año / Fecha (opcional)')}
          size="small"
          value={proj.date || ''}
          onChange={(e) => onFieldChange(projIdx, 'date', e.target.value)}
          placeholder={t('profile:sections.projects.datePlaceholder', 'ej. 2024 (opcional)')}
          fullWidth
        />
      </Box>

      <TextField
        label={t('profile:sections.projects.bullets', 'Descripción y Logros Clave')}
        size="small"
        multiline
        minRows={2}
        maxRows={5}
        value={descriptionText}
        onChange={(e) => {
          const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
          onFieldChange(projIdx, 'bullets', lines);
        }}
        placeholder="Breve descripción del proyecto, impacto técnico y métricas conseguidas..."
        fullWidth
      />
    </Paper>
  );
});

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(({
  projects,
  onFieldChange,
  onAddProject,
  onRemoveProject
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Header Info & Add */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchRoundedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
            {t('profile:sections.projects.title', 'Proyectos Destacados')}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={onAddProject}
        >
          {t('profile:sections.projects.addProject', 'Agregar Proyecto')}
        </Button>
      </Box>

      {projects.length === 0 ? (
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

            {t('profile:sections.projects.empty', 'No hay proyectos agregados aún. Agrega proyectos personales, open-source o iniciativas.')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {projects.map((proj, idx) => (
            <ProjectCard
              key={idx}
              proj={proj}
              projIdx={idx}
              onFieldChange={onFieldChange}
              onRemoveProject={onRemoveProject}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
});
