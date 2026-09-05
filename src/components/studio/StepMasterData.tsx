import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  useTheme,
  alpha,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { StepMasterDataProps } from '../../types';
import { StudioSkeleton } from './StudioSkeleton';
import { ConfirmDeleteDialog } from './common/ConfirmDeleteDialog';
import { useMasterDataWorkflow } from '../../hooks/useMasterDataWorkflow';
import { useMasterProfileCompleteness } from '../../hooks/useMasterProfileCompleteness';
import { ProfileCompletenessBar } from './profile/ProfileCompletenessBar';
import { MasterDataChoiceView } from './profile/MasterDataChoiceView';

const GuidedProfileForm = React.lazy(() =>
  import('./GuidedProfileForm').then((m) => ({ default: m.GuidedProfileForm }))
);

export type { StepMasterDataProps };

export const StepMasterData: React.FC<StepMasterDataProps> = ({
  content,
  onChange,
  onLoadSample,
  onNextStep,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const completeness = useMasterProfileCompleteness(content);

  const wordCount = React.useMemo(() => {
    if (!content || !content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  const {
    editMode,
    handleSwitchMode,
    handleSelectMode,
    handleResetToChoice,
    flushGuidedRef,
    flushManualRef,
    manualText,
    handleManualTextChange,
    handleManualBlur,
    hasData,
    showConfirmDialog,
    showClearConfirmDialog,
    setShowClearConfirmDialog,
    pendingFile,
    notification,
    handleCloseNotification,
    handleConfirmReplace,
    handleCancelReplace,
    handleConfirmClear,
    handleDownload,
    handleContinue,
    fileInputRef,
    isProcessing,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openFileDialog,
  } = useMasterDataWorkflow({
    content,
    onChange,
    onNextStep,
  });

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        p: { xs: 1.5, sm: 2, md: 3 },
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 48px)', sm: 5, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-View Drag Overlay */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            inset: 12,
            zIndex: 10,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            backdropFilter: 'blur(8px)',
            border: `2px dashed ${theme.palette.primary.main}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pointerEvents: 'none',
          }}
        >
          <PictureAsPdfRoundedIcon sx={{ fontSize: 56, color: 'primary.main', animation: 'pulse 1.5s infinite' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {t('profile:dropzone.dropToImport', 'Drop your PDF, .md or .txt file here to import')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('profile:subtitle', 'We will automatically extract your contact info, experience, and technical skills.')}
          </Typography>
        </Box>
      )}

      {/* VIEW 1: Onboarding Choice Mode (When no profile data yet or explicitly selected) */}
      {editMode === 'choice' ? (
        <MasterDataChoiceView
          onSelectFreeText={() => handleSelectMode('freeText')}
          onSelectGuided={() => handleSelectMode('guided')}
          onLoadSample={onLoadSample}
          onUploadFile={handleFileUpload}
          openFileDialog={openFileDialog}
          fileInputRef={fileInputRef}
          isProcessing={isProcessing}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Hidden File Input for uploads */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
            onChange={handleFileUpload}
          />

          {/* Dedicated Header for Active Mode */}
          <Paper
            sx={{
              p: { xs: 2, md: 2.5 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ maxWidth: 720 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  icon={editMode === 'guided' ? <FormatListBulletedRoundedIcon sx={{ fontSize: 16 }} /> : <EditNoteRoundedIcon sx={{ fontSize: 16 }} />}
                  label={editMode === 'guided' ? t('profile:modes.guidedShort', 'Guided Form Mode') : t('profile:modes.freeTextShort', 'Career Notes Mode')}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={handleResetToChoice}
                  sx={{ fontSize: '0.75rem', color: 'text.secondary', textTransform: 'none' }}
                >
                  {t('profile:choice.switchMethod', 'Change Method')}
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  onClick={() => handleSwitchMode(editMode === 'guided' ? 'freeText' : 'guided')}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}
                >
                  {editMode === 'guided'
                    ? t('profile:choice.switchToFreeText', 'Switch to Plain Notes')
                    : t('profile:choice.switchToGuided', 'Switch to Guided Form')}
                </Button>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {editMode === 'guided'
                  ? t('profile:modes.guidedTitle', 'Guided Profile Form')
                  : t('profile:modes.freeTextTitle', 'Free Text & Career Notes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editMode === 'guided'
                  ? t(
                      'profile:subtitle',
                      'Add your career history and skills once. We will automatically adapt it for every job you apply to.'
                    )
                  : t(
                      'profile:modes.freeTextHint',
                      'Paste raw text, LinkedIn summary, or unformatted notes. No Markdown syntax required—the AI synthesizes and structures everything automatically.'
                    )}
              </Typography>
            </Box>

            {/* Mode Actions */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                alignItems: { xs: 'stretch', sm: 'center' },
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={openFileDialog}
                disabled={isProcessing}
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                {t('profile:actions.importResume', 'Import File')}
              </Button>

              {hasData && (
                <Tooltip title={t('profile:actions.clearProfileTip', 'Clear all profile fields and start from a blank slate')}>
                  <IconButton
                    size="small"
                    onClick={() => setShowClearConfirmDialog(true)}
                    disabled={isProcessing}
                    aria-label={t('profile:actions.clearProfile', 'Start from Scratch')}
                    sx={{
                      color: 'text.secondary',
                      border: `1px solid ${theme.palette.divider}`,
                      p: 0.75,
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Paper>

          {/* VIEW 2: Pure Guided Form (When in guided mode) */}
          {editMode === 'guided' && (
            <>
              <ProfileCompletenessBar completeness={completeness} />
              <Paper
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: { xs: 'auto', md: 520 },
                  overflow: { xs: 'visible', md: 'hidden' },
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }}
              >
                <React.Suspense fallback={<StudioSkeleton variant="guidedForm" />}>
                  <GuidedProfileForm markdownContent={content} onChange={onChange} onFlushRef={flushGuidedRef} />
                </React.Suspense>
              </Paper>
            </>
          )}

          {/* VIEW 3: Pure Free Text / Notes Editor */}
          {editMode === 'freeText' && (
            <Paper
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: { xs: 450, md: 520 },
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {t(
                      'profile:modes.freeTextHint',
                      'Paste raw text, LinkedIn summary, or unformatted notes. No Markdown syntax required—the AI synthesizes and structures everything automatically.'
                    )}
                  </Typography>
                </Box>
                {wordCount > 0 && (
                  <Chip
                    label={`${wordCount} ${t('common:units.words', 'words')}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      flexShrink: 0,
                      borderColor: theme.palette.divider,
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                    }}
                  />
                )}
              </Box>
              <TextField
                multiline
                fullWidth
                value={content}
                onChange={(e) => handleManualTextChange(e.target.value)}
                onBlur={handleManualBlur}
                placeholder={t(
                  'profile:modes.freeTextPlaceholder',
                  'Candidate Name\nRole or Specialization\nLocation • Email • Phone\n\nEXPERIENCE & ACHIEVEMENTS\nWrite or paste your career notes, company names, projects, roles, and achievements in plain text or bullet points...'
                )}
                sx={{
                  flex: 1,
                  display: 'flex',
                  '& .MuiOutlinedInput-root': {
                    p: 2,
                    height: '100%',
                    alignItems: 'flex-start',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    border: 'none',
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-inputMultiline': {
                    height: '100% !important',
                    overflowY: 'auto !important',
                  },
                }}
              />
            </Paper>
          )}

        {/* Navigation Footer */}
        <Paper
          sx={{
            p: { xs: 2, sm: 2 },
            px: { xs: 2, sm: 2.5 },
            pb: { xs: 2.5, sm: 2 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            borderRadius: 2,
            gap: { xs: 1.5, sm: 2 },
            boxShadow: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            {hasData ? (
              <Chip
                icon={<CheckCircleRoundedIcon />}
                label={t('profile:status.ready', 'Career profile ready for tailoring')}
                color="success"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                icon={<InfoRoundedIcon />}
                label={t('profile:status.tipLoadSample', "Tip: Click 'Import from PDF' or 'Load Sample Profile' to start")}
                color="warning"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}

            {/* Contextual Backup Export only when there is actual profile data */}
            {hasData && (
              <Tooltip title={t('profile:actions.exportBackupTip', 'Download your career profile as Markdown (.md)')}>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleDownload}
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  {t('profile:actions.exportBackup', 'Export Backup (.md)')}
                </Button>
              </Tooltip>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={handleContinue}
            sx={{
              fontWeight: 700,
              px: 3,
              py: 1.2,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('profile:actions.continueToTarget', 'Continue to Target Vacancy')}
          </Button>
        </Paper>

        {/* Dedicated End-of-Scroll Safe Spacer */}
        <Box sx={{ height: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 40px)', sm: 20 }, flexShrink: 0 }} />
      </Box>
      )}

      {/* Confirmation Dialog Before Overwriting Existing Profile */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelReplace}
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
          <WarningAmberRoundedIcon color="warning" />
          {t('profile:dialog.confirmReplaceTitle', 'Replace current profile?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
            {t(
              'profile:dialog.confirmReplaceDesc',
              'Importing this file will overwrite your current career profile data. Are you sure you want to proceed?'
            )}
          </DialogContentText>
          {pendingFile && (
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: alpha(theme.palette.text.primary, 0.02),
                borderRadius: 1,
              }}
            >
              {pendingFile.isPdf ? (
                <PictureAsPdfRoundedIcon color="primary" />
              ) : (
                <DescriptionRoundedIcon color="primary" />
              )}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {pendingFile.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('profile:status.importedLocal', '100% Client-Side Local Parser')}
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelReplace} color="inherit" sx={{ fontWeight: 600 }}>
            {t('profile:dialog.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirmReplace}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700 }}
          >
            {t('profile:dialog.confirm', 'Import & Replace')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog Before Starting From Scratch / Clearing Data */}
      <ConfirmDeleteDialog
        open={showClearConfirmDialog}
        onCancel={() => setShowClearConfirmDialog(false)}
        onConfirm={handleConfirmClear}
        title={t('profile:dialog.confirmClearTitle', 'Start from scratch?')}
        message={t(
          'profile:dialog.confirmClearDesc',
          'Are you sure you want to clear all profile data? This action cannot be undone.'
        )}
        confirmLabel={t('profile:dialog.confirmClear', 'Confirm')}
        cancelLabel={t('profile:dialog.cancel', 'Cancel')}
      />

      {/* Success / Error Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notification.severity}
          onClose={handleCloseNotification}
          sx={{ fontWeight: 600 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
