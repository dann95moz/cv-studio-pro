import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert, Collapse } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import { useResumeStore } from '../../store';
import { downloadTextFile, buildTimestampedFileName } from '../../utils/fileUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  isIsolatedModule?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Robust ErrorBoundary Component for CV Studio.
 * Catches unhandled rendering errors, prevents White Screen of Death (WSOD),
 * and provides emergency recovery options including state download.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CV Studio ErrorBoundary] Uncaught runtime exception caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    if (this.props.onReset) {
      this.setState({ hasError: false, error: null, errorInfo: null });
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    try {
      useResumeStore.getState().setActiveTab('landing');
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch {
      window.location.href = '/';
    }
  };

  private handleEmergencyBackup = (): void => {
    try {
      const state = useResumeStore.getState();
      const backupData = {
        timestamp: new Date().toISOString(),
        candidateName: state.activeCvData?.name || 'Emergency_Backup',
        masterData: state.masterData,
        targetJob: state.targetJob,
        cvMarkdown: state.cvMarkdown,
        savedVersions: state.savedVersions,
        applications: state.applications,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const fileName = buildTimestampedFileName('CV_Studio_Emergency_Recovery', 'json');
      downloadTextFile(jsonStr, fileName, 'application/json');
    } catch (err) {
      console.error('Failed to generate emergency backup:', err);
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const isIsolated = this.props.isIsolatedModule;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isIsolated ? 320 : '80vh',
            p: { xs: 2, sm: 4 },
            width: '100%',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 640,
              width: '100%',
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Alert
              severity="error"
              icon={<BugReportRoundedIcon fontSize="large" />}
              sx={{
                mb: 3,
                textAlign: 'left',
                alignItems: 'center',
                '& .MuiAlert-icon': { mr: 2 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {this.props.fallbackTitle || 'Algo no salió como se esperaba'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                Se detectó una excepción inesperada durante el renderizado. Tu progreso en el almacenamiento local se encuentra a salvo.
              </Typography>
            </Alert>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshRoundedIcon />}
                onClick={this.handleReload}
              >
                Reintentar
              </Button>

              {!isIsolated && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<HomeRoundedIcon />}
                  onClick={this.handleGoHome}
                >
                  Ir al Inicio
                </Button>
              )}

              <Button
                variant="outlined"
                color="warning"
                startIcon={<DownloadRoundedIcon />}
                onClick={this.handleEmergencyBackup}
              >
                Respaldo de Emergencia
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Button
                variant="text"
                size="small"
                color="inherit"
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                {this.state.showDetails ? 'Ocultar detalles técnicos ▲' : 'Ver detalles técnicos ▼'}
              </Button>

              <Collapse in={this.state.showDetails}>
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: 200,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Box>
              </Collapse>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
