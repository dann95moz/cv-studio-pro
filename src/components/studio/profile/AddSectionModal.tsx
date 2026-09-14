import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardActionArea,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useTranslation } from 'react-i18next';
import { CustomSectionPresetType } from '../../../types/cv';

export interface AddSectionModalProps {
  open: boolean;
  onClose: () => void;
  onAddSection: (title: string, presetType: CustomSectionPresetType) => void;
}

interface PresetOption {
  presetType: CustomSectionPresetType;
  labelKey: string;
  defaultLabel: string;
  descKey: string;
  defaultDesc: string;
  icon: React.ReactElement;
  color: string;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  open,
  onClose,
  onAddSection,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedPreset, setSelectedPreset] = useState<CustomSectionPresetType | 'custom'>('certifications');
  const [customTitle, setCustomTitle] = useState('');
  const [error, setError] = useState(false);

  const presets: PresetOption[] = [
    {
      presetType: 'certifications',
      labelKey: 'profile:customSections.presets.certifications',
      defaultLabel: 'Certificaciones y Licencias',
      descKey: 'profile:customSections.presets.certificationsDesc',
      defaultDesc: 'AWS, Azure, CISSP, PMP, Scrum Master, acreditaciones profesionales',
      icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.info.main,
    },
    {
      presetType: 'awards',
      labelKey: 'profile:customSections.presets.awards',
      defaultLabel: 'Premios y Reconocimientos',
      descKey: 'profile:customSections.presets.awardsDesc',
      defaultDesc: 'Hackathons, distinciones académicas, empleado del año, becas',
      icon: <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
    },
    {
      presetType: 'publications',
      labelKey: 'profile:customSections.presets.publications',
      defaultLabel: 'Publicaciones y Patentes',
      descKey: 'profile:customSections.presets.publicationsDesc',
      defaultDesc: 'Artículos científicos, libros, papers técnicos, patentes registradas',
      icon: <MenuBookRoundedIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.secondary.main,
    },
    {
      presetType: 'volunteering',
      labelKey: 'profile:customSections.presets.volunteering',
      defaultLabel: 'Voluntariado e Impacto Social',
      descKey: 'profile:customSections.presets.volunteeringDesc',
      defaultDesc: 'Liderazgo comunitario, ONGs, mentorías y causas sociales',
      icon: <VolunteerActivismRoundedIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
    },
    {
      presetType: 'conferences',
      labelKey: 'profile:customSections.presets.conferences',
      defaultLabel: 'Conferencias y Charlas',
      descKey: 'profile:customSections.presets.conferencesDesc',
      defaultDesc: 'Keynotes, ponencias en eventos de la industria, workshops dictados',
      icon: <RecordVoiceOverRoundedIcon sx={{ fontSize: 24 }} />,
      color: theme.palette.primary.main,
    },
  ];

  const handleSelectPreset = (preset: PresetOption) => {
    setSelectedPreset(preset.presetType);
    setCustomTitle(t(preset.labelKey, preset.defaultLabel));
    setError(false);
  };

  const handleSelectCustom = () => {
    setSelectedPreset('custom');
    setCustomTitle('');
    setError(false);
  };

  const handleSubmit = () => {
    let finalTitle = customTitle.trim();
    if (!finalTitle) {
      if (selectedPreset !== 'custom') {
        const found = presets.find((p) => p.presetType === selectedPreset);
        if (found) {
          finalTitle = t(found.labelKey, found.defaultLabel);
        }
      }
    }

    if (!finalTitle) {
      setError(true);
      return;
    }

    onAddSection(finalTitle, selectedPreset as CustomSectionPresetType);
    onClose();
    setCustomTitle('');
    setSelectedPreset('certifications');
    setError(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >


      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          px: 3,
          pt: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddCircleOutlineRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('profile:customSections.addTitle', 'Agregar Sección Personalizada')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label={t('common:actions.close', 'Cerrar')}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            'profile:customSections.addSubtitle',
            'Selecciona una categoría sugerida para optimizar el ATS o define tu propia sección libre.'
          )}
        </Typography>

        {/* Preset Cards Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.presetType;
            return (
              <Card
                key={preset.presetType}
                variant="outlined"
                sx={{
                  borderColor: isSelected ? preset.color : theme.palette.divider,
                  bgcolor: isSelected
                    ? isDark
                      ? alpha(preset.color, 0.15)
                      : alpha(preset.color, 0.06)
                    : 'background.paper',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: preset.color,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectPreset(preset)}
                  sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5 }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(preset.color, 0.12),
                      color: preset.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {preset.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {t(preset.labelKey, preset.defaultLabel)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.74rem' }}>
                      {t(preset.descKey, preset.defaultDesc)}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}

          {/* Custom Section Card */}
          <Card
            variant="outlined"
            sx={{
              borderColor: selectedPreset === 'custom' ? theme.palette.primary.main : theme.palette.divider,
              bgcolor: selectedPreset === 'custom'
                ? isDark
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.06)
                : 'background.paper',
              transition: 'all 0.15s ease',
            }}
          >
            <CardActionArea
              onClick={handleSelectCustom}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.text.secondary, 0.1),
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AddCircleOutlineRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  {t('profile:customSections.presets.custom', 'Otra Sección Personalizada...')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.74rem' }}>
                  {t('profile:customSections.presets.customDesc', 'Define un nombre de sección completamente libre a tu gusto')}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Box>

        {/* Section Title Input */}
        <TextField
          fullWidth
          size="small"
          label={t('profile:customSections.inputLabel', 'Título de la Sección')}
          value={customTitle}
          onChange={(e) => {
            setCustomTitle(e.target.value);
            if (error) setError(false);
          }}
          placeholder={t('profile:customSections.inputPlaceholder', 'e.g. Certifications & Licenses')}
          error={error}
          helperText={error ? t('profile:customSections.errorRequired', 'El título es requerido') : ''}
        />

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, justifyContent: 'space-between' }}>
        <Button variant="text" color="inherit" onClick={onClose} sx={{ fontWeight: 600 }}>
          {t('common:actions.cancel', 'Cancelar')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700, px: 3 }}>
          {t('profile:customSections.createAction', 'Crear Sección')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
