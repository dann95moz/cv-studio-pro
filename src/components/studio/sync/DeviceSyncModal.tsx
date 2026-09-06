import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useTranslation } from 'react-i18next';
import { QrCodeCard } from './QrCodeCard';

export interface DeviceSyncModalProps {
  open: boolean;
  onClose: () => void;
  isExporting: boolean;
  exportUrl: string | null;
  exportId: string | null;
  secondsRemaining: number;
  includeApiKeys: boolean;
  onToggleApiKeys: (val: boolean) => void;
  onGenerateExport: (includeApiKeys: boolean) => void;
  isImporting: boolean;
  importError: string | null;
  onPullSnapshot: (idOrUrl: string, key?: string) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  open,
  onClose,
  isExporting,
  exportUrl,
  exportId,
  secondsRemaining,
  includeApiKeys,
  onToggleApiKeys,
  onGenerateExport,
  isImporting,
  importError,
  onPullSnapshot,
}) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [importInput, setImportInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    if (!exportUrl) return;
    navigator.clipboard.writeText(exportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartImport = () => {
    if (!importInput.trim()) return;
    onPullSnapshot(importInput.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="device-sync-dialog-title"
    >
      <DialogTitle
        id="device-sync-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
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
            <DevicesRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t('common:sync.modalTitle', 'Sincronizar Dispositivos')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('common:sync.modalSubtitle', 'Transfiere tu espacio de trabajo entre PC y móvil con cifrado E2EE')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label={t('common:actions.close', 'Cerrar')}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          aria-label="device sync tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<QrCode2RoundedIcon fontSize="small" />}
            iconPosition="start"
            label={t('common:sync.exportTab', 'Enviar (Generar QR)')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<DownloadRoundedIcon fontSize="small" />}
            iconPosition="start"
            label={t('common:sync.importTab', 'Recibir (Importar)')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ py: 3 }}>
        {/* TAB 0: EXPORT SNAPSHOT (SEND) */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {!exportUrl ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t(
                    'common:sync.exportDescription',
                    'Genera un snapshot cifrado temporal de todo tu espacio de trabajo (Master CV, versiones, vacantes y postulaciones Kanban) para escanearlo o abrirlo en otro dispositivo.'
                  )}
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeApiKeys}
                      onChange={(e) => onToggleApiKeys(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.secondary">
                      {t('common:sync.includeApiKeys', 'Incluir credenciales de IA (cifradas)')}
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    startIcon={
                      isExporting ? <CircularProgress size={18} color="inherit" /> : <QrCode2RoundedIcon />
                    }
                    disabled={isExporting}
                    onClick={() => onGenerateExport(includeApiKeys)}
                    sx={{ px: 3 }}
                  >
                    {isExporting
                      ? t('common:sync.generating', 'Generando snapshot...')
                      : t('common:sync.generateAction', 'Generar Código QR')}
                  </Button>
                </Box>

                {importError && (
                  <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                    {importError}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <QrCodeCard
                  url={exportUrl}
                  secondsRemaining={secondsRemaining}
                  syncId={exportId || 'CV-SYNC'}
                />

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t(
                    'common:sync.scanPrompt',
                    'Apunta la cámara nativa de tu smartphone hacia la pantalla para abrir tu espacio de trabajo al instante.'
                  )}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                    onClick={handleCopyLink}
                    sx={{ textTransform: 'none' }}
                  >
                    {copied ? t('common:sync.linkCopied', '¡Enlace copiado!') : t('common:sync.copyLink', 'Copiar Enlace Seguro')}
                  </Button>

                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    onClick={() => onGenerateExport(includeApiKeys)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('common:sync.regenerate', 'Regenerar')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* TAB 1: IMPORT SNAPSHOT (RECEIVE) */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t(
                'common:sync.importDescription',
                'Pega el enlace de sincronización generado en tu otro dispositivo o ingresa el código de emparejamiento.'
              )}
            </Typography>

            <TextField
              fullWidth
              label={t('common:sync.inputLabel', 'Enlace de sincronización o Código (ej. CV-78K2)')}
              placeholder="https://...#sync?id=... o CV-..."
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              size="small"
              autoFocus
            />

            {importError && (
              <Alert severity="error" variant="outlined">
                {importError}
              </Alert>
            )}

            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
              }}
            >
              <SecurityRoundedIcon fontSize="small" color="info" sx={{ mt: 0.25 }} />
              <Typography variant="caption" color="text.secondary">
                {t(
                  'common:sync.securityNotice',
                  'Antes de sobrescribir cualquier dato, se mostrará una comparativa de fechas y cambios para que verifiques que no te estés pisando a ti mismo.'
                )}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={isImporting ? <CircularProgress size={18} color="inherit" /> : <DownloadRoundedIcon />}
                disabled={isImporting || !importInput.trim()}
                onClick={handleStartImport}
                sx={{ px: 3 }}
              >
                {isImporting
                  ? t('common:sync.connecting', 'Descargando y descifrando...')
                  : t('common:sync.pullAction', 'Conectar y Descargar')}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="text">
          {t('common:actions.close', 'Cerrar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
