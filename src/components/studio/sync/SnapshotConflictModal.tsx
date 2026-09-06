import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import ComputerRoundedIcon from '@mui/icons-material/ComputerRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import { useTranslation } from 'react-i18next';
import { ConflictComparison } from '../../../types/sync';

export interface SnapshotConflictModalProps {
  open: boolean;
  comparison: ConflictComparison | null;
  onConfirmOverwrite: () => void;
  onDownloadSafetyBackup: () => void;
  onCancel: () => void;
}

export const SnapshotConflictModal: React.FC<SnapshotConflictModalProps> = ({
  open,
  comparison,
  onConfirmOverwrite,
  onDownloadSafetyBackup,
  onCancel,
}) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();

  if (!comparison) return null;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return t('common:status.unknown', 'Desconocido');
    return new Date(timestamp).toLocaleString();
  };

  const isConflict = comparison.severity === 'local_newer_conflict';
  const isClean = comparison.severity === 'clean';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="conflict-dialog-title"
    >
      <DialogTitle
        id="conflict-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            bgcolor: alpha(
              isConflict
                ? theme.palette.warning.main
                : theme.palette.primary.main,
              0.12
            ),
            color: isConflict ? 'warning.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CompareArrowsRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {t('common:sync.conflictTitle', 'Confirmar Importación de Workspace')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('common:sync.conflictSubtitle', 'Compara el estado de tus datos antes de sobrescribir')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Status Alert Banner */}
        {isConflict ? (
          <Alert
            severity="warning"
            icon={<WarningAmberRoundedIcon fontSize="inherit" />}
            variant="filled"
            sx={{ fontWeight: 600 }}
          >
            {t(
              'common:sync.conflictWarning',
              `⚠️ Atención: Los datos que vas a importar son más antiguos. Tienes cambios más recientes en este dispositivo (hace ${comparison.timeDiffFormatted}). ¿Estás seguro de que deseas sobrescribir?`
            )}
          </Alert>
        ) : isClean ? (
          <Alert severity="info" variant="outlined">
            {t(
              'common:sync.cleanNotice',
              'Este dispositivo no tiene datos previos. La importación se realizará directamente.'
            )}
          </Alert>
        ) : (
          <Alert
            severity="success"
            icon={<CheckCircleRoundedIcon fontSize="inherit" />}
            variant="outlined"
          >
            {t(
              'common:sync.newerRemoteNotice',
              'El snapshot entrante es más reciente que tus datos locales. Es seguro proceder con la sincronización.'
            )}
          </Alert>
        )}

        {/* Side-by-Side Comparison Columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Local Device Column */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: isConflict ? theme.palette.warning.main : theme.palette.divider,
              bgcolor: isConflict ? alpha(theme.palette.warning.main, 0.03) : 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <ComputerRoundedIcon fontSize="small" color={isConflict ? 'warning' : 'action'} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {t('common:sync.localDataTitle', 'Datos en este Dispositivo')}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              <strong>{t('common:sync.lastModified', 'Última modificación:')}</strong>{' '}
              {formatDate(comparison.localLastModified)}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, fontSize: '0.8125rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.versionsCount', 'Versiones de CV:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.localStats.versionsCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.applicationsCount', 'Postulaciones Kanban:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.localStats.applicationsCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.masterLength', 'Tamaño CV Maestro:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.localStats.masterDataLength} caracteres
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Remote Snapshot Column */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: !isConflict ? theme.palette.success.main : theme.palette.divider,
              bgcolor: !isConflict ? alpha(theme.palette.success.main, 0.03) : 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CloudDownloadRoundedIcon fontSize="small" color={!isConflict ? 'success' : 'action'} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {t('common:sync.remoteSnapshotTitle', 'Snapshot Entrante')}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              <strong>{t('common:sync.snapshotDate', 'Fecha del snapshot:')}</strong>{' '}
              {formatDate(comparison.remoteLastModified)}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, fontSize: '0.8125rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.versionsCount', 'Versiones de CV:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.remoteStats.versionsCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.applicationsCount', 'Postulaciones Kanban:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.remoteStats.applicationsCount}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common:sync.masterLength', 'Tamaño CV Maestro:')}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {comparison.remoteStats.masterDataLength} caracteres
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Safety Net Notice & Download Backup Button */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t(
              'common:sync.backupFirstAdvice',
              'Te recomendamos descargar un archivo de respaldo antes de sobrescribir para garantizar que no pierdas ningún dato.'
            )}
          </Typography>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<DownloadRoundedIcon />}
            onClick={onDownloadSafetyBackup}
            sx={{ flexShrink: 0, textTransform: 'none' }}
          >
            {t('common:sync.downloadBackupAction', 'Descargar Respaldo Previo')}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onCancel} color="inherit" variant="text">
          {t('common:actions.cancel', 'Cancelar')}
        </Button>

        <Button
          onClick={onConfirmOverwrite}
          color={isConflict ? 'warning' : 'primary'}
          variant="contained"
          sx={{ px: 3 }}
        >
          {t('common:sync.confirmOverwriteAction', 'Sobrescribir Workspace')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
