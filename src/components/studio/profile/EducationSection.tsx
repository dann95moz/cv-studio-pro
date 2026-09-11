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
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useTranslation } from 'react-i18next';
import { EducationSectionProps } from '../../../types';

export type { EducationSectionProps };

export interface StructuredEducationItem {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

/**
 * Robust parser to decompose a Markdown education string into structured entities:
 * 1. degree (Título o Grado)
 * 2. institution (Universidad, Escuela o Emisor)
 * 3. year (Año o rango de años, ej. 2018 – 2022 o 2024)
 * 4. description (Viñeta o descripción adicional de logros)
 */
export function parseEducationString(raw: string): StructuredEducationItem {
  const lines = (raw || '').split(/\r?\n/);
  const mainLine = lines[0] || '';
  const descLines = lines
    .slice(1)
    .map((l) => l.replace(/^\s*[-*•·]\s*/, '').trim())
    .filter(Boolean);
  const description = descLines.join('\n');

  let clean = mainLine.trim().replace(/^(?:[-•·]|\*(?!\*))\s*/, '').trim();

  // 1. Extract year / date range at the end: (2014 – 2020), 2024, 2018 - 2022, etc. (with optional trailing period)
  let year = '';
  const yearMatch = clean.match(/(?:[,\s(–—\-|]+)\s*(\(?\d{4}(?:\s*[\-–—]\s*(?:\d{4}|[A-Za-z]+))?\)?)\.?\s*$/);
  if (yearMatch) {
    year = yearMatch[1].replace(/[()]/g, '').trim();
    clean = clean.slice(0, yearMatch.index).replace(/[,–—\-|.\s]+$/, '').trim();
  }

  // 2. Extract degree vs institution separated by –, —, -, or |
  let degree = clean;
  let institution = '';

  const splitMatch = clean.match(/^(\*{0,2}[^*–—|]+\*{0,2})\s*([–—\-|])\s*(.+)$/);
  if (splitMatch) {
    degree = splitMatch[1];
    institution = splitMatch[3];
  } else {
    // If has **bold** part
    const boldMatch = clean.match(/^\*\*([^*]+)\*\*\s*(?:[–—\-,|]\s*)?(.*)$/);
    if (boldMatch) {
      degree = boldMatch[1];
      institution = boldMatch[2];
    } else {
      // Fallback: split by comma if available
      const commaIdx = clean.indexOf(',');
      if (commaIdx !== -1) {
        degree = clean.slice(0, commaIdx);
        institution = clean.slice(commaIdx + 1);
      }
    }
  }

  // Clean all markdown markers, brackets, and stray asterisks
  const cleanDegree = (degree || clean)
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/[\[\]]/g, '')
    .replace(/^[:,\s–—|-]+|[:,\s–—|-]+$/g, '')
    .trim();

  const cleanInstitution = institution
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/[\[\]]/g, '')
    .replace(/^[:,\s–—|-]+|[:,\s–—|-]+$/g, '')
    .trim();

  const cleanYear = year
    .replace(/[*_`]/g, '')
    .replace(/[()\[\]]/g, '')
    .trim();

  return {
    degree: cleanDegree,
    institution: cleanInstitution,
    year: cleanYear,
    description: description || undefined
  };
}

/**
 * Standardizes structured education fields into clean, ATS-compliant Markdown
 */
export function formatEducationString(item: StructuredEducationItem): string {
  const degreeClean = item.degree.trim().replace(/\*\*/g, '');
  const institutionClean = item.institution.trim().replace(/\*\*/g, '');
  const yearClean = item.year.trim().replace(/[()]/g, '');

  let formatted = degreeClean;
  if (institutionClean) {
    formatted += ` — ${institutionClean}`;
  }
  if (yearClean) {
    formatted += ` (${yearClean})`;
  }
  if (item.description && item.description.trim()) {
    const descLines = item.description
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-*•·]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean);
    for (const descLine of descLines) {
      formatted += `\n  - ${descLine}`;
    }
  }
  return formatted;
}

export const EducationSection: React.FC<EducationSectionProps> = React.memo(({
  education,
  onUpdateEducation,
  onAddEducation,
  onRemoveEducation
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [degreeField, setDegreeField] = useState('');
  const [institutionField, setInstitutionField] = useState('');
  const [yearField, setYearField] = useState('');
  const [descriptionField, setDescriptionField] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleStartEdit = (idx: number, rawEdu: string) => {
    setEditingIndex(idx);
    const parsed = parseEducationString(rawEdu);
    setDegreeField(parsed.degree);
    setInstitutionField(parsed.institution);
    setYearField(parsed.year);
    setDescriptionField(parsed.description || '');
  };

  const handleSaveEdit = (idx: number) => {
    if (!degreeField.trim() && !institutionField.trim()) {
      setEditingIndex(null);
      return;
    }

    const formatted = formatEducationString({
      degree: degreeField,
      institution: institutionField,
      year: yearField,
      description: descriptionField.trim() || undefined
    });

    onUpdateEducation(idx, formatted);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleAddNewItem = () => {
    onAddEducation();
    // Start editing the newly added first item
    setEditingIndex(0);
    setDegreeField('Nuevo Título / Certificación');
    setInstitutionField('Institución / Universidad');
    setYearField('2024');
    setDescriptionField('');
  };

  // Limit display to 8 items by default if there are many entries
  const displayedItems = showAll ? education : education.slice(0, 8);
  const remainingCount = education.length - displayedItems.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Header Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolRoundedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
            {t('profile:sections.education.title', 'Educación y Certificaciones')}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={handleAddNewItem}
        >
          {t('profile:sections.education.addEducation', 'Agregar Certificación o Título')}
        </Button>
      </Box>

      {/* List of Compact Education Rows */}
      {education.length === 0 ? (
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
            {t('profile:sections.education.empty', 'No hay registros de educación aún. Haz clic en "Agregar" para comenzar.')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {displayedItems.map((edu, idx) => {
            const isEditing = editingIndex === idx;

            if (isEditing) {
              return (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                    {t('profile:sections.education.edit', 'Editar Registro Educativo')}
                  </Typography>

                  {/* 3 Structured Input Fields */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1.5fr 1fr' }, gap: 1.5 }}>
                    <TextField
                      autoFocus
                      size="small"
                      label={t('profile:sections.education.degree', 'Título / Grado / Certificación')}
                      placeholder={t('profile:sections.education.degreePlaceholder', 'ej. Ingeniería de Sistemas')}
                      value={degreeField}
                      onChange={(e) => setDegreeField(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label={t('profile:sections.education.institution', 'Institución / Universidad / Emisor')}
                      placeholder={t('profile:sections.education.institutionPlaceholder', 'ej. Universidad Nacional / Udemy')}
                      value={institutionField}
                      onChange={(e) => setInstitutionField(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label={t('profile:sections.education.year', 'Año o Rango')}
                      placeholder={t('profile:sections.education.yearPlaceholder', 'ej. 2018 – 2022')}
                      value={yearField}
                      onChange={(e) => setYearField(e.target.value)}
                    />
                  </Box>

                  {/* Optional Description / Achievements */}
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    label={t('profile:sections.education.description', 'Descripción / Logros (Opcional)')}
                    placeholder={t('profile:sections.education.descriptionPlaceholder', 'ej. Diseñé y desarrollé aplicaciones web responsivas...')}
                    value={descriptionField}
                    onChange={(e) => setDescriptionField(e.target.value)}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
                    >
                      {t('profile:sections.education.cancel', 'Cancelar')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSaveEdit(idx)}
                      startIcon={<CheckRoundedIcon sx={{ fontSize: 16 }} />}
                    >
                      {t('profile:sections.education.save', 'Guardar')}
                    </Button>
                  </Box>
                </Paper>
              );
            }

            const parsed = parseEducationString(edu);

            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  p: 1.25,
                  px: 1.75,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.text.primary, 0.02),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  },
                  transition: 'background-color 0.15s ease-in-out'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', overflow: 'hidden', pr: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: 'text.primary'
                      }}
                    >
                      {parsed.degree}
                    </Typography>

                    {parsed.institution && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.84rem',
                          color: 'text.secondary'
                        }}
                      >
                        — {parsed.institution}
                      </Typography>
                    )}

                    {parsed.year && (
                      <Chip
                        label={parsed.year}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={t('profile:sections.education.edit', 'Editar')}>
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(idx, edu)}
                      >
                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('profile:sections.education.remove', 'Eliminar')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoveEducation(idx)}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {parsed.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                      lineHeight: 1.45,
                      pl: 1.25,
                      borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {parsed.description}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Show more toggle button */}
      {remainingCount > 0 && !showAll && (
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={() => setShowAll(true)}
          endIcon={<ExpandMoreRoundedIcon />}
          sx={{ alignSelf: 'center' }}
        >
          {t('profile:sections.education.moreEntries', {
            count: remainingCount,
            defaultValue: `+ ${remainingCount} entradas más`
          })}
        </Button>
      )}

      {showAll && education.length > 8 && (
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={() => setShowAll(false)}
          endIcon={<ExpandLessRoundedIcon />}
          sx={{ alignSelf: 'center' }}
        >
          {t('common:actions.collapse', 'Mostrar menos')}
        </Button>
      )}
    </Box>
  );
});
