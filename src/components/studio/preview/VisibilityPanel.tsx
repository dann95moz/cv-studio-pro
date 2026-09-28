import React from 'react';
import {
  Box,
  Typography,
  Switch,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import { useTranslation } from 'react-i18next';
import { CVData, ProfilePhotoConfig } from '../../../types';

export interface VisibilityPanelProps {
  parsedCv?: CVData;
  hiddenDetails?: string[];
  onToggleHiddenDetail?: (detailKey: string) => void;
  hiddenSections?: string[];
  onToggleHiddenSection?: (sectionKey: string) => void;
  photo?: ProfilePhotoConfig | null;
  onPhotoToggle?: (enabled: boolean) => void;
}

interface VisibilityRowProps {
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: () => void;
}

const VisibilityRow: React.FC<VisibilityRowProps> = ({
  title,
  subtitle,
  checked,
  onToggle,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        px: 1.25,
        borderRadius: 1.5,
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box sx={{ minWidth: 0, pr: 1.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: checked ? 'text.primary' : 'text.disabled',
            transition: 'color 0.15s ease',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              fontSize: '0.72rem',
              color: 'text.secondary',
              maxWidth: 220,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Switch
        size="small"
        checked={checked}
        onChange={onToggle}
        sx={{ flexShrink: 0 }}
      />
    </Box>
  );
};

export const VisibilityPanel: React.FC<VisibilityPanelProps> = ({
  parsedCv,
  hiddenDetails = [],
  onToggleHiddenDetail,
  hiddenSections = [],
  onToggleHiddenSection,
  photo,
  onPhotoToggle,
}) => {
  const { t } = useTranslation(['preview']);
  const theme = useTheme();

  const hiddenDetailsSet = new Set(hiddenDetails);
  const hiddenSectionsSet = new Set(hiddenSections);

  // Group 1: Personal Details & Legal Status
  const personalDetailRows: Array<{
    key: string;
    title: string;
    subtitle?: string;
    checked: boolean;
    onToggle: () => void;
    available: boolean;
  }> = [
    {
      key: 'availability',
      title: t('preview:panels.design.visibility.availability', 'Disponibilidad'),
      subtitle: parsedCv?.availability || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('availability'),
      onToggle: () => onToggleHiddenDetail?.('availability'),
      available: Boolean(parsedCv?.availability),
    },
    {
      key: 'placeOfOrigin',
      title: t('preview:panels.design.visibility.placeOfOrigin', 'Lugar de origen / Cantón'),
      subtitle: parsedCv?.placeOfOrigin || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('placeOfOrigin'),
      onToggle: () => onToggleHiddenDetail?.('placeOfOrigin'),
      available: Boolean(parsedCv?.placeOfOrigin),
    },
    {
      key: 'nationality',
      title: t('preview:panels.design.visibility.nationality', 'Nacionalidad'),
      subtitle: parsedCv?.nationality || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('nationality'),
      onToggle: () => onToggleHiddenDetail?.('nationality'),
      available: Boolean(parsedCv?.nationality),
    },
    {
      key: 'workPermit',
      title: t('preview:panels.design.visibility.workPermit', 'Permiso de trabajo'),
      subtitle: parsedCv?.workPermit || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('workPermit'),
      onToggle: () => onToggleHiddenDetail?.('workPermit'),
      available: Boolean(parsedCv?.workPermit),
    },
    {
      key: 'dateOfBirth',
      title: t('preview:panels.design.visibility.dateOfBirth', 'Fecha de nacimiento'),
      subtitle: parsedCv?.dateOfBirth || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('dateOfBirth'),
      onToggle: () => onToggleHiddenDetail?.('dateOfBirth'),
      available: Boolean(parsedCv?.dateOfBirth),
    },
    {
      key: 'drivingLicense',
      title: t('preview:panels.design.visibility.drivingLicense', 'Permiso de conducir'),
      subtitle: parsedCv?.drivingLicense || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('drivingLicense'),
      onToggle: () => onToggleHiddenDetail?.('drivingLicense'),
      available: Boolean(parsedCv?.drivingLicense),
    },
    {
      key: 'civilStatus',
      title: t('preview:panels.design.visibility.civilStatus', 'Estado civil'),
      subtitle: parsedCv?.civilStatus || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenDetailsSet.has('civilStatus'),
      onToggle: () => onToggleHiddenDetail?.('civilStatus'),
      available: Boolean(parsedCv?.civilStatus),
    },
    {
      key: 'photo',
      title: t('preview:panels.design.visibility.photo', 'Foto de perfil'),
      subtitle: photo?.url ? t('preview:panels.design.visibility.photoAttached', 'Foto cargada') : t('preview:panels.design.visibility.noPhoto', 'Sin foto'),
      checked: photo?.enabled !== false,
      onToggle: () => onPhotoToggle?.(photo?.enabled === false),
      available: Boolean(photo?.url || parsedCv?.photo),
    },
  ];

  // Group 2: Document Sections
  const sectionRows: Array<{
    key: string;
    title: string;
    subtitle?: string;
    checked: boolean;
    onToggle: () => void;
    available: boolean;
  }> = [
    {
      key: 'summary',
      title: parsedCv?.sectionTitles?.summary || t('preview:panels.design.visibility.summary', 'Resumen Profesional'),
      subtitle: parsedCv?.summary ? `${parsedCv.summary.slice(0, 42)}...` : undefined,
      checked: !hiddenSectionsSet.has('summary'),
      onToggle: () => onToggleHiddenSection?.('summary'),
      available: Boolean(parsedCv?.summary),
    },
    {
      key: 'skills',
      title: parsedCv?.sectionTitles?.skills || t('preview:panels.design.visibility.skills', 'Competencias y Habilidades'),
      subtitle: parsedCv?.skillGroups?.length ? `${parsedCv.skillGroups.length} categorías` : undefined,
      checked: !hiddenSectionsSet.has('skills'),
      onToggle: () => onToggleHiddenSection?.('skills'),
      available: Boolean(parsedCv?.skillGroups?.length),
    },
    {
      key: 'experience',
      title: parsedCv?.sectionTitles?.experience || t('preview:panels.design.visibility.experience', 'Experiencia Laboral'),
      subtitle: parsedCv?.experience?.length ? `${parsedCv.experience.length} cargos` : undefined,
      checked: !hiddenSectionsSet.has('experience'),
      onToggle: () => onToggleHiddenSection?.('experience'),
      available: Boolean(parsedCv?.experience?.length),
    },
    {
      key: 'projects',
      title: parsedCv?.sectionTitles?.projects || t('preview:panels.design.visibility.projects', 'Proyectos Destacados'),
      subtitle: parsedCv?.projects?.length ? `${parsedCv.projects.length} proyectos` : undefined,
      checked: !hiddenSectionsSet.has('projects'),
      onToggle: () => onToggleHiddenSection?.('projects'),
      available: Boolean(parsedCv?.projects?.length),
    },
    {
      key: 'education',
      title: parsedCv?.sectionTitles?.education || t('preview:panels.design.visibility.education', 'Educación y Formación'),
      subtitle: parsedCv?.education?.length ? `${parsedCv.education.length} títulos` : undefined,
      checked: !hiddenSectionsSet.has('education'),
      onToggle: () => onToggleHiddenSection?.('education'),
      available: Boolean(parsedCv?.education?.length),
    },
    {
      key: 'languages',
      title: parsedCv?.sectionTitles?.languages || t('preview:panels.design.visibility.languages', 'Idiomas'),
      subtitle: parsedCv?.languages?.length ? `${parsedCv.languages.length} idiomas` : undefined,
      checked: !hiddenSectionsSet.has('languages'),
      onToggle: () => onToggleHiddenSection?.('languages'),
      available: Boolean(parsedCv?.languages?.length),
    },
    {
      key: 'references',
      title: t('preview:panels.design.visibility.references', 'Referencias'),
      subtitle: parsedCv?.references,
      checked: !hiddenSectionsSet.has('references'),
      onToggle: () => onToggleHiddenSection?.('references'),
      available: Boolean(parsedCv?.references),
    },
  ];

  // Custom sections
  const customSectionRows = (parsedCv?.customSections || []).map((custom) => ({
    key: custom.id,
    title: custom.title,
    subtitle: `${custom.items?.length || 0} elementos`,
    checked: !hiddenSectionsSet.has(custom.id),
    onToggle: () => onToggleHiddenSection?.(custom.id),
    available: true,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Intro info box */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 2,
          p: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          {t('preview:panels.design.visibility.introTitle', 'Control de Visibilidad')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
          {t(
            'preview:panels.design.visibility.introSubtitle',
            'Oculta o muestra secciones y datos personales en el documento generado sin perder la información en tu base de datos.'
          )}
        </Typography>
      </Box>

      {/* 1. Legal and Personal Details */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BadgeRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {t('preview:panels.design.visibility.personalGroup', 'Datos Personales y Estado Legal')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {personalDetailRows.map((row) => (
            <VisibilityRow
              key={row.key}
              title={row.title}
              subtitle={row.subtitle}
              checked={row.checked}
              onToggle={row.onToggle}
            />
          ))}
        </Box>
      </Paper>

      {/* 2. Document Sections */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <LayersRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {t('preview:panels.design.visibility.sectionsGroup', 'Secciones del Documento')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {sectionRows.map((row) => (
            <VisibilityRow
              key={row.key}
              title={row.title}
              subtitle={row.subtitle}
              checked={row.checked}
              onToggle={row.onToggle}
            />
          ))}
          {customSectionRows.map((row) => (
            <VisibilityRow
              key={row.key}
              title={row.title}
              subtitle={row.subtitle}
              checked={row.checked}
              onToggle={row.onToggle}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
