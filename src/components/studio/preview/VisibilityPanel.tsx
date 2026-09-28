import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useTranslation } from 'react-i18next';
import { CVData, ProfilePhotoConfig } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import {
  WORK_PERMIT_PRESETS,
  AVAILABILITY_PRESETS,
  DRIVING_LICENSE_PRESETS,
  CIVIL_STATUS_PRESETS,
  REFERENCES_PRESETS,
  NATIONALITY_PRESETS,
  PLACE_OF_ORIGIN_PRESETS,
  getLocalizedReferences,
  LegalPresetOption,
} from '../../../constants/legalPresets';
import { SupportedLanguage } from '../../../constants/languages';
import { isStandardDefaultSectionTitle } from '../../../templates/slot-mapper';

export interface VisibilityPanelProps {
  parsedCv?: CVData;
  hiddenDetails?: string[];
  onToggleHiddenDetail?: (detailKey: string) => void;
  hiddenSections?: string[];
  onToggleHiddenSection?: (sectionKey: string) => void;
  photo?: ProfilePhotoConfig | null;
  onPhotoToggle?: (enabled: boolean) => void;
  onUpdatePersonalDetail?: (field: string, value: string) => void;
}

interface VisibilityRowProps {
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: () => void;
  onEdit?: () => void;
}

const VisibilityRow: React.FC<VisibilityRowProps> = ({
  title,
  subtitle,
  checked,
  onToggle,
  onEdit,
}) => {
  const { t } = useTranslation(['preview']);
  const notSetLabel = t('preview:panels.design.visibility.notSet', 'No configurado');
  const isNotConfigured = !subtitle || subtitle === notSetLabel;

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
      <Box
        onClick={onEdit}
        sx={{
          minWidth: 0,
          pr: 1.5,
          flex: 1,
          cursor: onEdit ? 'pointer' : 'default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          {onEdit && (
            <Tooltip
              title={
                isNotConfigured
                  ? t('preview:panels.design.visibility.configureValue', 'Configurar valor')
                  : t('preview:panels.design.visibility.editValue', 'Editar valor')
              }
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                sx={{
                  p: 0.25,
                  color: isNotConfigured ? 'primary.main' : 'text.secondary',
                  opacity: 0.85,
                  '&:hover': { opacity: 1, color: 'primary.main' },
                }}
              >
                <EditRoundedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {subtitle && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              fontSize: '0.72rem',
              color: isNotConfigured ? 'primary.main' : 'text.secondary',
              fontWeight: isNotConfigured ? 600 : 400,
              maxWidth: 220,
            }}
          >
            {isNotConfigured
              ? `✏️ ${subtitle} — ${t('preview:panels.design.visibility.configureValue', 'Configurar')}`
              : subtitle}
          </Typography>
        )}
      </Box>
      <Tooltip
        title={
          isNotConfigured
            ? t('preview:panels.design.visibility.clickToConfigure', 'Clic para configurar')
            : checked
            ? t('preview:panels.design.visibility.visibleOnCv', 'Visible en el CV (clic para ocultar)')
            : t('preview:panels.design.visibility.hiddenOnCv', 'Oculto en el CV (clic para mostrar)')
        }
      >
        <Switch
          size="small"
          checked={checked}
          onChange={onToggle}
          sx={{ flexShrink: 0 }}
        />
      </Tooltip>
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
  onUpdatePersonalDetail,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  const [editingField, setEditingField] = useState<{
    key: string;
    title: string;
    currentValue: string;
    placeholder?: string;
  } | null>(null);
  const [editInputVal, setEditInputVal] = useState<string>('');

  const handleOpenEdit = (key: string, title: string, currentValue: string, placeholder?: string) => {
    setEditingField({ key, title, currentValue, placeholder });
    setEditInputVal(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingField && onUpdatePersonalDetail) {
      onUpdatePersonalDetail(editingField.key, editInputVal);
    }
    setEditingField(null);
  };

  const docLang: SupportedLanguage = (
    parsedCv?.language && parsedCv.language in WORK_PERMIT_PRESETS
      ? parsedCv.language
      : 'es'
  ) as SupportedLanguage;

  const getFieldPresets = (key?: string): LegalPresetOption[] => {
    if (!key) return [];
    if (key === 'nationality') return NATIONALITY_PRESETS[docLang] || [];
    if (key === 'placeOfOrigin') return PLACE_OF_ORIGIN_PRESETS;
    if (key === 'workPermit') return WORK_PERMIT_PRESETS[docLang] || [];
    if (key === 'availability') return AVAILABILITY_PRESETS[docLang] || [];
    if (key === 'drivingLicense') return DRIVING_LICENSE_PRESETS[docLang] || [];
    if (key === 'civilStatus') return CIVIL_STATUS_PRESETS[docLang] || [];
    if (key === 'references') return REFERENCES_PRESETS[docLang] || [];
    return [];
  };

  const activePresets = getFieldPresets(editingField?.key);

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
    onEdit?: () => void;
  }> = [
    {
      key: 'availability',
      title: t('preview:panels.design.visibility.availability', 'Disponibilidad'),
      subtitle: parsedCv?.availability || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.availability && parsedCv.availability.trim()) && !hiddenDetailsSet.has('availability'),
      onToggle: () => {
        if (!parsedCv?.availability || !parsedCv.availability.trim()) {
          handleOpenEdit(
            'availability',
            t('preview:panels.design.visibility.availability', 'Disponibilidad'),
            '',
            'Ej: Immédiate, Décembre 2026, 1 mes'
          );
        } else {
          onToggleHiddenDetail?.('availability');
        }
      },
      available: Boolean(parsedCv?.availability && parsedCv.availability.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'availability',
              t('preview:panels.design.visibility.availability', 'Disponibilidad'),
              parsedCv?.availability || '',
              'Ej: Immédiate, Décembre 2026, 1 mes'
            )
        : undefined,
    },
    {
      key: 'placeOfOrigin',
      title: t('preview:panels.design.visibility.placeOfOrigin', 'Lugar de origen / Cantón'),
      subtitle: parsedCv?.placeOfOrigin || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.placeOfOrigin && parsedCv.placeOfOrigin.trim()) && !hiddenDetailsSet.has('placeOfOrigin'),
      onToggle: () => {
        if (!parsedCv?.placeOfOrigin || !parsedCv.placeOfOrigin.trim()) {
          handleOpenEdit(
            'placeOfOrigin',
            t('preview:panels.design.visibility.placeOfOrigin', 'Lugar de origen / Cantón'),
            '',
            'Ej: Frutigen (BE), Bern (BE)'
          );
        } else {
          onToggleHiddenDetail?.('placeOfOrigin');
        }
      },
      available: Boolean(parsedCv?.placeOfOrigin && parsedCv.placeOfOrigin.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'placeOfOrigin',
              t('preview:panels.design.visibility.placeOfOrigin', 'Lugar de origen / Cantón'),
              parsedCv?.placeOfOrigin || '',
              'Ej: Frutigen (BE), Bern (BE)'
            )
        : undefined,
    },
    {
      key: 'nationality',
      title: t('preview:panels.design.visibility.nationality', 'Nacionalidad'),
      subtitle: parsedCv?.nationality || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.nationality && parsedCv.nationality.trim()) && !hiddenDetailsSet.has('nationality'),
      onToggle: () => {
        if (!parsedCv?.nationality || !parsedCv.nationality.trim()) {
          handleOpenEdit(
            'nationality',
            t('preview:panels.design.visibility.nationality', 'Nacionalidad'),
            '',
            'Ej: Suisse / Colombienne, Española'
          );
        } else {
          onToggleHiddenDetail?.('nationality');
        }
      },
      available: Boolean(parsedCv?.nationality && parsedCv.nationality.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'nationality',
              t('preview:panels.design.visibility.nationality', 'Nacionalidad'),
              parsedCv?.nationality || '',
              'Ej: Suisse / Colombienne, Española'
            )
        : undefined,
    },
    {
      key: 'workPermit',
      title: t('preview:panels.design.visibility.workPermit', 'Permiso de trabajo'),
      subtitle: parsedCv?.workPermit || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.workPermit && parsedCv.workPermit.trim()) && !hiddenDetailsSet.has('workPermit'),
      onToggle: () => {
        if (!parsedCv?.workPermit || !parsedCv.workPermit.trim()) {
          handleOpenEdit(
            'workPermit',
            t('preview:panels.design.visibility.workPermit', 'Permiso de trabajo'),
            '',
            'Ej: Permis C, Citoyen suisse, Permis B'
          );
        } else {
          onToggleHiddenDetail?.('workPermit');
        }
      },
      available: Boolean(parsedCv?.workPermit && parsedCv.workPermit.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'workPermit',
              t('preview:panels.design.visibility.workPermit', 'Permiso de trabajo'),
              parsedCv?.workPermit || '',
              'Ej: Permis C, Citoyen suisse, Permis B'
            )
        : undefined,
    },
    {
      key: 'dateOfBirth',
      title: t('preview:panels.design.visibility.dateOfBirth', 'Fecha de nacimiento'),
      subtitle: parsedCv?.dateOfBirth || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.dateOfBirth && parsedCv.dateOfBirth.trim()) && !hiddenDetailsSet.has('dateOfBirth'),
      onToggle: () => {
        if (!parsedCv?.dateOfBirth || !parsedCv.dateOfBirth.trim()) {
          handleOpenEdit(
            'dateOfBirth',
            t('preview:panels.design.visibility.dateOfBirth', 'Fecha de nacimiento'),
            '',
            'Ej: 15.05.1990'
          );
        } else {
          onToggleHiddenDetail?.('dateOfBirth');
        }
      },
      available: Boolean(parsedCv?.dateOfBirth && parsedCv.dateOfBirth.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'dateOfBirth',
              t('preview:panels.design.visibility.dateOfBirth', 'Fecha de nacimiento'),
              parsedCv?.dateOfBirth || '',
              'Ej: 15.05.1990'
            )
        : undefined,
    },
    {
      key: 'drivingLicense',
      title: t('preview:panels.design.visibility.drivingLicense', 'Permiso de conducir'),
      subtitle: parsedCv?.drivingLicense || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.drivingLicense && parsedCv.drivingLicense.trim()) && !hiddenDetailsSet.has('drivingLicense'),
      onToggle: () => {
        if (!parsedCv?.drivingLicense || !parsedCv.drivingLicense.trim()) {
          handleOpenEdit(
            'drivingLicense',
            t('preview:panels.design.visibility.drivingLicense', 'Permiso de conducir'),
            '',
            'Ej: Catégorie B, Tipo B'
          );
        } else {
          onToggleHiddenDetail?.('drivingLicense');
        }
      },
      available: Boolean(parsedCv?.drivingLicense && parsedCv.drivingLicense.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'drivingLicense',
              t('preview:panels.design.visibility.drivingLicense', 'Permiso de conducir'),
              parsedCv?.drivingLicense || '',
              'Ej: Catégorie B, Tipo B'
            )
        : undefined,
    },
    {
      key: 'civilStatus',
      title: t('preview:panels.design.visibility.civilStatus', 'Estado civil'),
      subtitle: parsedCv?.civilStatus || t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: Boolean(parsedCv?.civilStatus && parsedCv.civilStatus.trim()) && !hiddenDetailsSet.has('civilStatus'),
      onToggle: () => {
        if (!parsedCv?.civilStatus || !parsedCv.civilStatus.trim()) {
          handleOpenEdit(
            'civilStatus',
            t('preview:panels.design.visibility.civilStatus', 'Estado civil'),
            '',
            'Ej: Célibataire, Soltero/a'
          );
        } else {
          onToggleHiddenDetail?.('civilStatus');
        }
      },
      available: Boolean(parsedCv?.civilStatus && parsedCv.civilStatus.trim()),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'civilStatus',
              t('preview:panels.design.visibility.civilStatus', 'Estado civil'),
              parsedCv?.civilStatus || '',
              'Ej: Célibataire, Soltero/a'
            )
        : undefined,
    },
    {
      key: 'photo',
      title: t('preview:panels.design.visibility.photo', 'Foto de perfil'),
      subtitle: photo?.url ? t('preview:panels.design.visibility.photoAttached', 'Foto cargada') : t('preview:panels.design.visibility.noPhoto', 'Sin foto'),
      checked: photo?.enabled !== false && Boolean(photo?.url),
      onToggle: () => onPhotoToggle?.(photo?.enabled === false),
      available: Boolean(photo?.url || parsedCv?.photo),
    },
  ];

  const getSectionTitle = (key: string, i18nKey: string, fallback: string): string => {
    const raw = parsedCv?.sectionTitles?.[key];
    if (raw && raw.trim() && !isStandardDefaultSectionTitle(raw.trim())) {
      return raw.trim();
    }
    return t(i18nKey, fallback);
  };

  // Group 2: Document Sections
  const sectionRows: Array<{
    key: string;
    title: string;
    subtitle?: string;
    checked: boolean;
    onToggle: () => void;
    available: boolean;
    onEdit?: () => void;
  }> = [
    {
      key: 'summary',
      title: getSectionTitle('summary', 'preview:panels.design.visibility.summary', 'Resumen Profesional'),
      subtitle: parsedCv?.summary ? `${parsedCv.summary.slice(0, 42)}...` : undefined,
      checked: !hiddenSectionsSet.has('summary'),
      onToggle: () => onToggleHiddenSection?.('summary'),
      available: Boolean(parsedCv?.summary),
    },
    {
      key: 'skills',
      title: getSectionTitle('skills', 'preview:panels.design.visibility.skills', 'Competencias y Habilidades'),
      subtitle: parsedCv?.skillGroups?.length
        ? t('preview:panels.design.visibility.countCategories', '{{count}} categorías', { count: parsedCv.skillGroups.length })
        : undefined,
      checked: !hiddenSectionsSet.has('skills'),
      onToggle: () => onToggleHiddenSection?.('skills'),
      available: Boolean(parsedCv?.skillGroups?.length),
    },
    {
      key: 'experience',
      title: getSectionTitle('experience', 'preview:panels.design.visibility.experience', 'Experiencia Laboral'),
      subtitle: parsedCv?.experience?.length
        ? t('preview:panels.design.visibility.countRoles', '{{count}} cargos', { count: parsedCv.experience.length })
        : undefined,
      checked: !hiddenSectionsSet.has('experience'),
      onToggle: () => onToggleHiddenSection?.('experience'),
      available: Boolean(parsedCv?.experience?.length),
    },
    {
      key: 'projects',
      title: getSectionTitle('projects', 'preview:panels.design.visibility.projects', 'Proyectos Destacados'),
      subtitle: parsedCv?.projects?.length
        ? t('preview:panels.design.visibility.countProjects', '{{count}} proyectos', { count: parsedCv.projects.length })
        : undefined,
      checked: !hiddenSectionsSet.has('projects'),
      onToggle: () => onToggleHiddenSection?.('projects'),
      available: Boolean(parsedCv?.projects?.length),
    },
    {
      key: 'education',
      title: getSectionTitle('education', 'preview:panels.design.visibility.education', 'Educación y Formación'),
      subtitle: parsedCv?.education?.length
        ? t('preview:panels.design.visibility.countDegrees', '{{count}} títulos', { count: parsedCv.education.length })
        : undefined,
      checked: !hiddenSectionsSet.has('education'),
      onToggle: () => onToggleHiddenSection?.('education'),
      available: Boolean(parsedCv?.education?.length),
    },
    {
      key: 'languages',
      title: getSectionTitle('languages', 'preview:panels.design.visibility.languages', 'Idiomas'),
      subtitle: parsedCv?.languages?.length
        ? t('preview:panels.design.visibility.countLanguages', '{{count}} idiomas', { count: parsedCv.languages.length })
        : undefined,
      checked: !hiddenSectionsSet.has('languages'),
      onToggle: () => onToggleHiddenSection?.('languages'),
      available: Boolean(parsedCv?.languages?.length),
    },
    {
      key: 'references',
      title: getSectionTitle('references', 'preview:panels.design.visibility.references', 'Referencias'),
      subtitle: parsedCv?.references
        ? getLocalizedReferences(parsedCv.references, docLang)
        : t('preview:panels.design.visibility.notSet', 'No configurado'),
      checked: !hiddenSectionsSet.has('references') && !hiddenDetailsSet.has('references'),
      onToggle: () => {
        const isCurrentlyHidden = hiddenSectionsSet.has('references') || hiddenDetailsSet.has('references');
        if (isCurrentlyHidden) {
          if (hiddenSectionsSet.has('references')) onToggleHiddenSection?.('references');
          if (hiddenDetailsSet.has('references')) onToggleHiddenDetail?.('references');
        } else {
          onToggleHiddenSection?.('references');
        }
      },
      available: Boolean(parsedCv?.references),
      onEdit: onUpdatePersonalDetail
        ? () =>
            handleOpenEdit(
              'references',
              getSectionTitle('references', 'preview:panels.design.visibility.references', 'Referencias'),
              parsedCv?.references ? getLocalizedReferences(parsedCv.references, docLang) : '',
              'Ej: References available upon request'
            )
        : undefined,
    },
  ];

  // Custom sections
  const customSectionRows = (parsedCv?.customSections || []).map((custom) => ({
    key: custom.id,
    title: custom.title,
    subtitle: t('preview:panels.design.visibility.countItems', '{{count}} elementos', { count: custom.items?.length || 0 }),
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
              onEdit={row.onEdit}
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
              onEdit={row.onEdit}
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

      {/* Direct Edit Modal for Personal / Legal Details */}
      <Dialog
        open={Boolean(editingField)}
        onClose={() => setEditingField(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS_TOKENS.xl,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editingField?.currentValue
            ? t('preview:panels.design.visibility.editValueTitle', 'Editar {{field}}', {
                field: editingField?.title,
              })
            : t('preview:panels.design.visibility.configureValueTitle', 'Configurar {{field}}', {
                field: editingField?.title,
              })}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ fontSize: '0.85rem', mb: 2 }}>
            {t(
              'preview:panels.design.visibility.editPrompt',
              'Ingresa o modifica la información que se mostrará en esta sección de tu CV:'
            )}
          </DialogContentText>

          {activePresets.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                  fontSize: '0.75rem',
                }}
              >
                {t('preview:panels.design.visibility.standardOptions', 'Opciones estándar sugeridas:')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="preset-select-label">
                    {t('preview:panels.design.visibility.standardOptions', 'Opciones estándar sugeridas:')}
                  </InputLabel>
                  <Select
                    labelId="preset-select-label"
                    label={t('preview:panels.design.visibility.standardOptions', 'Opciones estándar sugeridas:')}
                    value={activePresets.some((p) => p.value.toLowerCase() === editInputVal.toLowerCase()) ? editInputVal : ''}
                    onChange={(e) => setEditInputVal(e.target.value)}
                    sx={{ borderRadius: RADIUS_TOKENS.md }}
                  >
                    {activePresets.map((preset) => (
                      <MenuItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Quick selectable chips for instant 1-tap fill */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
                  {activePresets.map((preset) => {
                    const isSelected = editInputVal.toLowerCase() === preset.value.toLowerCase();
                    return (
                      <Chip
                        key={preset.value}
                        label={preset.label}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() => setEditInputVal(preset.value)}
                        sx={{
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}

          <TextField
            autoFocus
            fullWidth
            size="small"
            value={editInputVal}
            onChange={(e) => setEditInputVal(e.target.value)}
            placeholder={
              editingField?.placeholder ||
              t('preview:panels.design.visibility.valuePlaceholder', 'Ingresa el texto para este campo...')
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" onClick={() => setEditingField(null)}>
            {t('common:actions.cancel', 'Cancelar')}
          </Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            {t('common:actions.save', 'Guardar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
