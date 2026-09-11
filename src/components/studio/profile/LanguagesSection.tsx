import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  useTheme,
  alpha
} from '@mui/material';

import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { LanguagesSectionProps } from '../../../types';

export type { LanguagesSectionProps };

export interface StructuredLanguageEntry {
  name: string;
  level: string;
}

const COMMON_LANGUAGES = [
  'Español',
  'English',
  'Français',
  'Deutsch',
  'Italiano',
  'Português',
  '中文 (Chinese)',
  '日本語 (Japanese)'
];

/**
 * Parses raw markdown language line into structured name & level
 */
export function parseLanguageEntry(raw: string): StructuredLanguageEntry {
  const clean = (raw || '').trim().replace(/^(?:[-•·]|\*(?!\*))\s*/, '').trim();

  // 1. Format: **Language:** Level or Language: Level
  const colonMatch = clean.match(/^\*{0,2}([^:*–—(]+)\*{0,2}\s*[:*–—]\s*(.+)$/);
  if (colonMatch) {
    return {
      name: colonMatch[1].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim(),
      level: colonMatch[2].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim()
    };
  }

  // 2. Format: Language (Level)
  const parenMatch = clean.match(/^\*{0,2}([^:(]+)\*{0,2}\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return {
      name: parenMatch[1].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim(),
      level: parenMatch[2].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim()
    };
  }

  // 3. Format: Language - Level or Language | Level
  const parts = clean.split(/\s*[-–—|]\s*/);
  if (parts.length >= 2) {
    return {
      name: parts[0].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim(),
      level: parts.slice(1).join(' ').replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim()
    };
  }

  return {
    name: clean.replace(/[*_`]/g, '').replace(/\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '').trim(),
    level: 'Professional Working Proficiency'
  };
}

/**
 * Serializes name and level back into standardized Markdown
 */
export function formatLanguageEntry(name: string, level: string): string {
  const cleanName = (name || '').trim().replace(/\*\*/g, '');
  const cleanLevel = (level || '').trim().replace(/\*\*/g, '');
  if (!cleanName && !cleanLevel) return '';
  if (!cleanLevel) return cleanName;
  return `${cleanName}: ${cleanLevel}`;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = React.memo(({
  languages,
  onUpdateLanguage,
  onAddLanguage,
  onRemoveLanguage
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const levelOptions = useMemo(() => [
    { value: 'Native', label: t('profile:sections.languages.levelNative', 'Nativo / Bilingüe') },
    { value: 'C2 • Full Professional / Mastery', label: t('profile:sections.languages.levelC2', 'C2 • Maestría / Dominio Completo') },
    { value: 'C1 • Advanced', label: t('profile:sections.languages.levelC1', 'C1 • Avanzado / Fluido Profesional') },
    { value: 'B2 • Upper Intermediate', label: t('profile:sections.languages.levelB2', 'B2 • Intermedio Alto / Profesional') },
    { value: 'B1 • Intermediate', label: t('profile:sections.languages.levelB1', 'B1 • Intermedio') },
    { value: 'A2 • Elementary', label: t('profile:sections.languages.levelA2', 'A2 • Elemental / Básico') },
    { value: 'A1 • Beginner', label: t('profile:sections.languages.levelA1', 'A1 • Principiante') }
  ], [t]);

  const handleFieldChange = (index: number, field: 'name' | 'level', value: string) => {
    const current = parseLanguageEntry(languages[index]);
    const updated = {
      ...current,
      [field]: value
    };
    onUpdateLanguage(index, formatLanguageEntry(updated.name, updated.level));
  };

  const handleAddNewLanguage = () => {
    onAddLanguage();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Header Info & Add Language Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TranslateRoundedIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.98rem' }}>
            {t('profile:sections.languages.title', 'Idiomas')}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={handleAddNewLanguage}
        >
          {t('profile:sections.languages.addLanguage', 'Agregar Idioma')}
        </Button>
      </Box>

      {/* Languages Rows */}
      {languages.length === 0 ? (
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
            {t('profile:sections.languages.empty', 'No hay idiomas agregados aún.')}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {languages.map((lang, idx) => {
            const parsed = parseLanguageEntry(lang);

            // Find matching level value or fallback to custom/first
            const matchedLevel = levelOptions.find(opt => 
              opt.value.toLowerCase() === parsed.level.toLowerCase() ||
              opt.label.toLowerCase() === parsed.level.toLowerCase() ||
              parsed.level.toLowerCase().startsWith(opt.value.toLowerCase().split(' ')[0])
            )?.value || (parsed.level || 'B2 • Upper Intermediate');

            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                  alignItems: { xs: 'stretch', sm: 'center' },
                  p: 1.5,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.text.primary, 0.02),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  },
                  transition: 'background-color 0.15s ease-in-out'
                }}
              >
                {/* Inputs responsive layout */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1.5fr' }, gap: 1.5, flex: 1 }}>
                  {/* Left: Language Selector / Input */}
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={COMMON_LANGUAGES}
                    value={parsed.name}
                    onInputChange={(_e, newInputValue) => {
                      handleFieldChange(idx, 'name', newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('profile:sections.languages.language', 'Idioma')}
                        placeholder={t('profile:sections.languages.languagePlaceholder', 'ej. Español, Inglés...')}
                      />
                    )}
                  />

                  {/* Right: Proficiency Level Selector */}
                  <FormControl size="small" fullWidth>
                    <InputLabel id={`lang-level-label-${idx}`}>
                      {t('profile:sections.languages.proficiency', 'Nivel de Dominio')}
                    </InputLabel>
                    <Select
                      labelId={`lang-level-label-${idx}`}
                      label={t('profile:sections.languages.proficiency', 'Nivel de Dominio')}
                      value={matchedLevel}
                      onChange={(e) => handleFieldChange(idx, 'level', e.target.value)}
                    >
                      {levelOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>


                {/* Delete button */}
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' }, flexShrink: 0 }}>
                  <Tooltip title={t('profile:sections.languages.remove', 'Eliminar idioma')}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onRemoveLanguage(idx)}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

            );
          })}
        </Stack>
      )}
    </Box>
  );
});
