import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { platformService } from '../../../core/platform';
import { hapticsService } from '../../../core/haptics';

export interface MasterDataChoiceViewProps {
  onSelectFreeText: () => void;
  onSelectGuided: () => void;
  onLoadSample: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProcessing?: boolean;
  progressMessage?: string;
  hasData?: boolean;
  onOpenSync?: (tab?: 'export' | 'import') => void;
}

/**
 * Step 1: Onboarding Choice View (Dumb Presentational Component)
 * Clean, frictionless entrance allowing the candidate to:
 * 1) Import an existing resume (PDF, TXT, MD)
 * 2) Start from scratch or continue via Guided Step-by-Step Form
 * 3) Paste or view unformatted notes / free text
 * 4) Sync from PC via QR code or pairing code
 */
export const MasterDataChoiceView: React.FC<MasterDataChoiceViewProps> = React.memo(({
  onSelectFreeText,
  onSelectGuided,
  onLoadSample,
  onUploadFile,
  openFileDialog,
  fileInputRef,
  isProcessing = false,
  progressMessage,
  hasData = false,
  onOpenSync,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // NATIVE APP EXPERIENCE: Content lives directly on screen background (zero-card container, zero-scroll)
  if (platformService.isNative()) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: 460,
          mx: 'auto',
          my: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2.5, sm: 3 },
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.markdown,.txt,application/pdf,text/plain,text/markdown"
          style={{ display: 'none' }}
          onChange={onUploadFile}
        />

        {/* Main Title directly on screen background (calm semibold typography) */}
        <Box sx={{ mb: 2.5, px: 0.5 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.42rem', sm: '1.65rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.28,
              color: 'text.primary',
            }}
          >
            {t('profile:choice.title', '¿Cómo querés empezar tu perfil?')}
          </Typography>
        </Box>

        {/* 3 Native Interactive Option Rows living directly on screen background */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Row 1: Sincronizar desde PC */}
          <ButtonBase
            onClick={() => {
              hapticsService.impactLight();
              onOpenSync?.('import');
            }}
            sx={{
              width: '100%',
              py: 1.75,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              borderRadius: RADIUS_TOKENS.lg,
              transition: 'all 0.15s ease',
              '&:active': {
                transform: 'scale(0.985)',
                bgcolor: alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                <QrCodeScannerRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
                  {t('profile:choice.syncCardTitleShort', 'Sincronizar desde PC')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                  {t('profile:choice.syncCardShortDesc', 'Transferí tu CV con un código QR')}
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
          </ButtonBase>

          {/* Material Design Inset Divider between Row 1 and Row 2 (starts after icon) */}
          <Box sx={{ height: '1px', bgcolor: theme.palette.divider, my: 0.5, ml: '72px', mr: 1.5 }} />

          {/* Row 2: Importar CV (Recomendado - Primary Accent & Left Indicator) */}
          <ButtonBase
            onClick={() => {
              hapticsService.impactLight();
              openFileDialog();
            }}
            sx={{
              width: '100%',
              py: 1.75,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              borderRadius: RADIUS_TOKENS.lg,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.12) : '#eff6ff',
              transition: 'all 0.15s ease',
              '&:active': {
                transform: 'scale(0.985)',
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : '#e0f0fe',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
                    {t('profile:choice.importCardTitleShort', 'Importar CV')}
                  </Typography>
                  <Chip
                    label={t('profile:choice.recommendedChipShort', 'Recomendado')}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: RADIUS_TOKENS.full,
                      bgcolor: isDark ? alpha(theme.palette.primary.main, 0.25) : '#dbeafe',
                      color: isDark ? '#93c5fd' : '#1d4ed8',
                      border: 'none',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                  {t('profile:choice.importCardShortDesc', 'Subí tu PDF, TXT o Markdown')}
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
          </ButtonBase>

          {/* Material Design Inset Divider between Row 2 and Row 3 (starts after icon) */}
          <Box sx={{ height: '1px', bgcolor: theme.palette.divider, my: 0.5, ml: '72px', mr: 1.5 }} />

          {/* Row 3: Formulario guiado */}
          <ButtonBase
            onClick={() => {
              hapticsService.impactLight();
              onSelectGuided();
            }}
            sx={{
              width: '100%',
              py: 1.75,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              borderRadius: RADIUS_TOKENS.lg,
              transition: 'all 0.15s ease',
              '&:active': {
                transform: 'scale(0.985)',
                bgcolor: alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                <FormatListBulletedRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}>
                  {t('profile:choice.guidedCardTitleShort', 'Formulario guiado')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', mt: 0.25, lineHeight: 1.35 }}>
                  {t('profile:choice.guidedCardShortDesc', 'Empezar de cero, paso a paso')}
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 22, ml: 1, flexShrink: 0 }} />
          </ButtonBase>
        </Box>

        {/* Subtle left-aligned action for demo sample (matching content margin) */}
        <Box sx={{ mt: 2.5, px: 1.5, display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="text"
            size="small"
            onClick={() => {
              hapticsService.impactLight();
              onLoadSample();
            }}
            sx={{
              color: 'text.secondary',
              fontSize: '0.86rem',
              textTransform: 'none',
              fontWeight: 500,
              p: 0,
              minWidth: 'auto',
              textAlign: 'left',
              justifyContent: 'flex-start',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'transparent',
              },
            }}
          >
            {t('profile:choice.sampleQuestion', '¿Solo quieres probar?')}{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, ml: 0.5 }}>
              {t('profile:choice.loadSampleAction', 'Cargar Ejemplo')}
            </Box>
          </Button>
        </Box>

        {/* Processing Indicator Modal / Overlay */}
        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              bgcolor: isDark ? 'rgba(7, 10, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              borderRadius: RADIUS_TOKENS.xl,
            }}
          >
            <CircularProgress size={44} color="primary" />
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {progressMessage || t('common:actions.processing', 'Procesando...')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1040,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        pt: { xs: 1.5, sm: 3 },
        pb: { xs: 4, sm: 5 },
        px: { xs: 1.5, sm: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.markdown,.txt"
        style={{ display: 'none' }}
        onChange={onUploadFile}
      />

      {/* Header Banner */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3.5 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: { xs: 0.5, sm: 1.2 },
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.35rem', sm: '1.85rem', md: '2.1rem' },
          }}
        >
          {t('profile:choice.title', 'How would you like to start your profile?')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 640,
            mx: 'auto',
            fontSize: { xs: '0.86rem', sm: '0.95rem' },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {t(
            'profile:choice.subtitle',
            'Choose the input method that best matches your workflow. Everything is processed 100% locally and privately.'
          )}
        </Typography>
      </Box>

      {/* Fast Sync Banner (Prominently visible at top for Mobile and Desktop) */}
      {onOpenSync && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: { xs: 2.5, sm: 3.5 },
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            borderRadius: RADIUS_TOKENS.lg,
            border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            boxShadow: `0 2px 12px ${alpha(theme.palette.secondary.main, 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                borderRadius: RADIUS_TOKENS.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.secondary.main, 0.15),
                color: 'secondary.main',
                flexShrink: 0,
              }}
            >
              {platformService.isDesktopWeb() ? (
                <QrCode2RoundedIcon fontSize="medium" />
              ) : (
                <QrCodeScannerRoundedIcon fontSize="medium" />
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: { xs: '0.98rem', sm: '1.05rem' } }}>
                {platformService.isDesktopWeb()
                  ? t('profile:choice.syncToPhoneTitle', 'Sincronizar con Móvil (Código QR)')
                  : t('profile:choice.syncCardTitle', 'Escanear QR de PC')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.82rem', sm: '0.86rem' }, mt: 0.35, lineHeight: 1.4 }}>
                {platformService.isDesktopWeb()
                  ? t(
                      'profile:choice.syncToPhoneDesc',
                      'Genera un código QR para transferir tu Master CV, versiones y postulaciones a tu smartphone en un instante.'
                    )
                  : t(
                      'profile:choice.syncCardDesc',
                      'Apunta la cámara de tu teléfono al código QR de tu computadora para importar tu Master CV y versiones al instante.'
                    )}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onOpenSync(platformService.isDesktopWeb() ? 'export' : 'import')}
            startIcon={
              platformService.isDesktopWeb() ? (
                <QrCode2RoundedIcon />
              ) : (
                <QrCodeScannerRoundedIcon />
              )
            }
            sx={{
              flexShrink: 0,
              fontWeight: 700,
              height: { xs: 46, sm: 40 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {platformService.isDesktopWeb()
              ? t('profile:choice.syncToPhoneAction', 'Generar Código QR')
              : t('profile:choice.syncCardAction', 'Escanear QR')}
          </Button>
        </Paper>
      )}

      {/* 3 Decision Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, sm: 2.5 },
          width: '100%',
          mb: 4,
        }}
      >
        {/* Card 1: Upload File Mode */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <CloudUploadRoundedIcon fontSize="medium" />
              </Box>
              <Chip
                label={t('profile:choice.recommendedChip', 'Fast & Easy')}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.importCardTitle', 'Import Resume')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {t(
                'profile:choice.importCardDesc',
                'Upload your existing CV in PDF, TXT, or Markdown. Content is extracted locally.'
              )}
            </Typography>

            {/* Quick Drop & Browse Area */}
            <Box
              onClick={openFileDialog}
              sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: `1.5px dashed ${theme.palette.divider}`,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'center' }}>
                {t('profile:choice.dropOrBrowse', 'Drop file or click to browse')}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={openFileDialog}
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CloudUploadRoundedIcon />
              )
            }
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {isProcessing
              ? (progressMessage || t('profile:actions.importing', 'Extracting PDF...'))
              : t('profile:actions.importResume', 'Upload Resume')}
          </Button>
        </Paper>

        {/* Card 2: Guided Step-by-Step Form (Start from Scratch) */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: 'secondary.main',
                }}
              >
                <FormatListBulletedRoundedIcon fontSize="medium" />
              </Box>
              <Chip
                label={
                  hasData
                    ? t('profile:choice.activeProfileBadge', 'Profile Loaded')
                    : t('profile:choice.startFromScratch', 'Start from Scratch')
                }
                size="small"
                color={hasData ? 'success' : 'secondary'}
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.guidedCardTitle', 'Guided Form')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {hasData
                ? t(
                    'profile:choice.guidedCardDescExisting',
                    'Continue editing your structured profile sections: experience, education, and skills.'
                  )
                : t(
                    'profile:choice.guidedCardDesc',
                    'Fill out your personal info, experience, education, and skills step by step in a structured visual form.'
                  )}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color={hasData ? 'primary' : 'secondary'}
            size="medium"
            onClick={onSelectGuided}
            endIcon={<ArrowForwardRoundedIcon />}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {hasData
              ? t('profile:choice.continueGuidedAction', 'Continue in Guided Form')
              : t('profile:choice.guidedAction', 'Start Guided Form')}
          </Button>
        </Paper>

        {/* Card 3: Free Text & Notes Mode */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1.5px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: 'text.primary',
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Box>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                color: 'text.primary',
                mb: 2,
              }}
            >
              <EditNoteRoundedIcon fontSize="medium" />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1.1rem' }}>
              {t('profile:choice.freeTextCardTitle', 'Paste Raw Notes')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5, minHeight: 48 }}>
              {hasData
                ? t(
                    'profile:choice.freeTextCardDescExisting',
                    'View or edit your current career profile as plain text notes.'
                  )
                : t(
                    'profile:choice.freeTextCardDesc',
                    'Paste unformatted career notes, LinkedIn summary, or bullet points. The AI handles the structure.'
                  )}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            size="medium"
            onClick={onSelectFreeText}
            endIcon={<ArrowForwardRoundedIcon />}
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            {hasData
              ? t('profile:choice.continueFreeTextAction', 'Edit in Free Text / Notes')
              : t('profile:choice.freeTextAction', 'Write or Paste Notes')}
          </Button>
        </Paper>
      </Box>

      {/* Bottom Option: Sample Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('profile:choice.sampleQuestion', 'Just testing?')}
        </Typography>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onLoadSample}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 700 }}
        >
          {t('profile:choice.loadSampleAction', 'Load Sample Profile')}
        </Button>
      </Box>
    </Box>
  );
});

MasterDataChoiceView.displayName = 'MasterDataChoiceView';
