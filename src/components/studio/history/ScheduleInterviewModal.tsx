import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import { useTranslation } from 'react-i18next';
import { ApplicationItem } from '../../../types';
import { InterviewEventOptions, downloadInterviewIcs } from '../../../utils/icsGenerator';

export interface ScheduleInterviewModalProps {
  open: boolean;
  application: ApplicationItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  open,
  application,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation(['history', 'common']);
  const theme = useTheme();

  // Tomorrow at 10:00 AM local time formatted for datetime-local input (YYYY-MM-DDTHH:mm)
  const getTomorrowDefaultIso = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateTimeStr, setDateTimeStr] = useState<string>(getTomorrowDefaultIso());
  const [duration, setDuration] = useState<number>(45);
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [interviewerName, setInterviewerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open) {
      setDateTimeStr(getTomorrowDefaultIso());
      setDuration(45);
      setMeetingLink('');
      setInterviewerName('');
      setNotes(application?.notes || '');
    }
  }, [open, application]);

  const handleDownload = () => {
    if (!application) return;

    const startDate = new Date(dateTimeStr);
    const validDate = isNaN(startDate.getTime()) ? new Date() : startDate;

    const options: InterviewEventOptions = {
      companyName: application.companyName,
      targetRole: application.targetRole,
      startDate: validDate,
      durationMinutes: duration,
      meetingLink: meetingLink.trim(),
      interviewerName: interviewerName.trim(),
      notes: notes.trim(),
    };

    downloadInterviewIcs(options);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarMonthRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('history:calendar.modalTitle', 'Agendar Entrevista en Calendario')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {application ? `${application.targetRole} @ ${application.companyName}` : ''}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label={t('common:actions.close', 'Cerrar')}
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t(
            'history:calendar.modalDesc',
            'Genera un archivo de evento (.ics) compatible con Google Calendar, Apple Calendar y Outlook sin necesidad de conectar cuentas externas.'
          )}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
          <TextField
            label={t('history:calendar.dateTime', 'Fecha y Hora')}
            type="datetime-local"
            value={dateTimeStr}
            onChange={(e) => setDateTimeStr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            size="small"
          />

          <TextField
            select
            label={t('history:calendar.duration', 'Duración')}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            size="small"
            fullWidth
          >
            <MenuItem value={30}>30 min</MenuItem>
            <MenuItem value={45}>45 min</MenuItem>
            <MenuItem value={60}>60 min (1h)</MenuItem>
            <MenuItem value={90}>90 min (1.5h)</MenuItem>
          </TextField>
        </Box>

        <TextField
          label={t('history:calendar.meetingLink', 'Enlace de Reunión (Google Meet, Zoom, Teams)')}
          placeholder="https://meet.google.com/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <VideoCameraFrontRoundedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
        />

        <TextField
          label={t('history:calendar.interviewer', 'Entrevistador / Reclutador (Opcional)')}
          placeholder={t('history:calendar.interviewerPlaceholder', 'e.g. Sarah Jenkins (Talent Lead)')}
          value={interviewerName}
          onChange={(e) => setInterviewerName(e.target.value)}
          size="small"
          fullWidth
        />

        <TextField
          label={t('history:calendar.notes', 'Notas adicionales')}
          placeholder={t('history:calendar.notesPlaceholder', 'Key topics, questions to ask, requirements...')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={2}
          size="small"
          fullWidth
        />
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" variant="text" size="small">
          {t('common:actions.cancel', 'Omitir')}
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
          startIcon={<CalendarMonthRoundedIcon />}
        >
          {t('history:calendar.downloadIcs', 'Descargar Evento (.ics)')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
