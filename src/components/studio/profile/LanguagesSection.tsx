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
  useTheme,
  alpha
} from '@mui/material';

import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { useTranslation } from 'react-i18next';
import { LanguagesSectionProps } from '../../../types';
import { GuidedSectionNavFooter } from './GuidedSectionNavFooter';

export type { LanguagesSectionProps };

export interface StructuredLanguageEntry {
  name: string;
  level: string;
}

export const POPULAR_LANGUAGES = [
  'Español',
  'English',
  'Français',
  'Deutsch',
  'Italiano',
  'Português',
  '中文 (Chinese)',
  '日本語 (Japanese)',
  '한국어 (Korean)',
  'Русский (Russian)',
  'العربية (Arabic)',
  'Nederlands (Dutch)',
  'Polski (Polish)',
  'Svenska (Swedish)',
  'Türkçe (Turkish)',
  'हिन्दी (Hindi)',
  'Català',
  'Euskara',
  'Galego',
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
 * Standardizes any raw language proficiency level string to one of the 7 supported Select values.
 */
export function matchStandardLevel(rawLevel: string): string {
  if (!rawLevel) return 'B2 • Upper Intermediate';
  const lower = rawLevel.trim().toLowerCase();
  if (lower.includes('nativ') || lower.includes('biling')) return 'Native';
  if (lower.includes('c2') || lower.includes('maestr') || lower.includes('mastery')) return 'C2 • Full Professional / Mastery';
  if (lower.includes('c1') || lower.includes('avanzad') || lower.includes('advanced') || lower.includes('fluido')) return 'C1 • Advanced';
  if (lower.includes('b2') || lower.includes('upper') || lower.includes('profesional') || lower.includes('professional')) return 'B2 • Upper Intermediate';
  if (lower.includes('b1') || lower.includes('intermedio') || lower.includes('intermediate')) return 'B1 • Intermediate';
  if (lower.includes('a2') || lower.includes('elemental') || lower.includes('elementary') || lower.includes('básico') || lower.includes('basico')) return 'A2 • Elementary';
  if (lower.includes('a1') || lower.includes('princip') || lower.includes('beginner')) return 'A1 • Beginner';
  return 'B2 • Upper Intermediate';
}

/**
 * Serializes name and level back into standardized Markdown
 */
export function formatLanguageEntry(name: string, level: string): string {
  const cleanName = (name || '').trim().replace(/\*\*/g, '');
  const cleanLevel = (level || '').trim().replace(/\*\*/g, '');
  if (!cleanName && !cleanLevel) return '';
  if (!cleanLevel) return cleanName;
  if (!cleanName) return cleanLevel;
  return `${cleanName}: ${cleanLevel}`;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = React.memo(({
  languages,
  onUpdateLanguage,
  onAddLanguage,
  onRemoveLanguage,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const [customInputIndices, setCustomInputIndices] = React.useState<Set<number>>(new Set());

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
    const current = parseLanguageEntry(languages[index] || '');
    if (current[field] === value) return;
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('profile:sections.languages.empty', 'No hay idiomas agregados aún (se requiere al menos uno).')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onUpdateLanguage(languages.length, '**Español:** Nativo')}
            >
              + {t('profile:sections.languages.quickSpanish', 'Español (Nativo)')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => onUpdateLanguage(languages.length, '**Inglés:** Profesional (C1)')}
            >
              + {t('profile:sections.languages.quickEnglish', 'Inglés (C1 Profesional)')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {languages.map((lang, idx) => {
            const parsed = parseLanguageEntry(lang);
            const matchedLevel = matchStandardLevel(parsed.level);

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
                  {customInputIndices.has(idx) ? (
                    <TextField
                      size="small"
                      fullWidth
                      label={t('profile:sections.languages.language', 'Idioma')}
                      placeholder={t('profile:sections.languages.languagePlaceholder', 'ej. Español, Inglés...')}
                      value={parsed.name}
                      onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <Tooltip title={t('profile:sections.languages.chooseFromList', 'Elegir de la lista')}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCustomInputIndices((prev) => {
                                    const next = new Set(prev);
                                    next.delete(idx);
                                    return next;
                                  });
                                }}
                                sx={{ color: 'text.secondary' }}
                              >
                                <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          ),
                        },
                      }}
                    />
                  ) : (
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`lang-name-label-${idx}`}>
                        {t('profile:sections.languages.language', 'Idioma')}
                      </InputLabel>
                      <Select
                        labelId={`lang-name-label-${idx}`}
                        label={t('profile:sections.languages.language', 'Idioma')}
                        value={parsed.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            setCustomInputIndices((prev) => new Set(prev).add(idx));
                          } else {
                            handleFieldChange(idx, 'name', val);
                          }
                        }}
                        MenuProps={{
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          slotProps: {
                            paper: {
                              sx: {
                                maxHeight: 280,
                              },
                            },
                          },
                        }}
                      >
                        {parsed.name && !POPULAR_LANGUAGES.includes(parsed.name) && (
                          <MenuItem value={parsed.name}>
                            {parsed.name}
                          </MenuItem>
                        )}
                        {POPULAR_LANGUAGES.map((langName) => (
                          <MenuItem key={langName} value={langName}>
                            {langName}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__custom__"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            borderTop: `1px dashed ${theme.palette.divider}`,
                            mt: 0.5,
                          }}
                        >
                          {t('profile:sections.languages.customLanguage', '+ Escribir otro idioma...')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}

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
                      MenuProps={{
                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        slotProps: {
                          paper: {
                            sx: {
                              maxHeight: 260,
                            },
                          },
                        },
                      }}
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

      {/* Navigation Footer */}
      <GuidedSectionNavFooter
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={languages.length === 0}
      />
    </Box>
  );
});
