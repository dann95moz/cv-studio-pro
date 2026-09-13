import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { useTranslation } from 'react-i18next';
import { PreviewSidePanelType } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MobileToolsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectTool: (panel: PreviewSidePanelType) => void;
  onOpenDiff?: () => void;
  onOpenAuditGap?: (tab?: 'audit' | 'gap' | 'interview') => void;
  onDownloadPdf?: () => void;
  onSharePdf?: () => void;
  onDownloadDocx?: () => void;
  onDownloadPlainText?: () => void;
  onCopyPlainText?: () => void;
  onDownloadMarkdown?: () => void;
  onSaveVersion?: () => void;
  onReTailor?: () => void;
  onOpenAdaptModal?: () => void;
  isExportingPdf?: boolean;
  isSavingVersion?: boolean;
}

/**
 * Mobile-First Slide-Up Bottom Sheet for Document Tools (Templates, Design, LinkedIn, Compare).
 * Adheres strictly to mobile-first-ux-rules.md (Pillar 4: Thumb-Zone Bottom Sheet, zero floating menus).
 */
export const MobileToolsBottomSheet: React.FC<MobileToolsBottomSheetProps> = ({
  open,
  onClose,
  onSelectTool,
  onOpenDiff,
  onOpenAuditGap,
  onDownloadPdf,
  onSharePdf,
  onDownloadDocx,
  onDownloadPlainText,
  onCopyPlainText,
  onDownloadMarkdown,
  onSaveVersion,
  onReTailor,
  onOpenAdaptModal,
  isExportingPdf = false,
  isSavingVersion = false,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  const [activeView, setActiveView] = useState<'tools' | 'export'>('tools');
  const [copiedAts, setCopiedAts] = useState<boolean>(false);

  const handleClose = () => {
    setActiveView('tools');
    onClose();
  };

  const toolItems = [
    {
      id: 'templates' as PreviewSidePanelType,
      label: t('preview:navRail.templates', 'Plantillas'),
      icon: <GridViewRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        handleClose();
        onSelectTool('templates');
      },
    },
    {
      id: 'design' as PreviewSidePanelType,
      label: t('preview:navRail.design', 'Diseño & Formato'),
      icon: <PaletteRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        handleClose();
        onSelectTool('design');
      },
    },
    {
      id: 'gap',
      label: t('preview:drawer.hudTitle', 'Diagnóstico & Brechas ATS'),
      icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        handleClose();
        onOpenAuditGap?.('gap');
      },
    },
    ...(onOpenDiff ? [{
      id: 'compare' as PreviewSidePanelType,
      label: t('preview:navRail.compare', 'Comparar con Original'),
      icon: <CompareArrowsRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        handleClose();
        onOpenDiff();
      },
    }] : []),
    {
      id: 'linkedin' as PreviewSidePanelType,
      label: t('preview:navRail.linkedin', 'Publicación para LinkedIn'),
      icon: <LinkedInIcon sx={{ fontSize: 22, color: '#0a66c2' }} />,
      action: () => {
        handleClose();
        onSelectTool('linkedin');
      },
    },
    ...(onOpenAdaptModal ? [{
      id: 'adapt' as PreviewSidePanelType,
      label: t('preview:toolbar.adaptToNewOffer', 'Adaptar a otra oferta'),
      icon: <PostAddRoundedIcon sx={{ fontSize: 22, color: 'primary.main' }} />,
      action: () => {
        handleClose();
        onOpenAdaptModal();
      },
    }] : []),
  ];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: RADIUS_TOKENS.xl,
            borderTopRightRadius: RADIUS_TOKENS.xl,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            pt: 1,
            pb: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 24px)',
            px: 1.5,
            boxShadow: theme.shadows[16],
          },
        },
      }}
    >
      {/* Drag Handle Pill */}
      <Box
        sx={{
          width: 36,
          height: 4,
          borderRadius: RADIUS_TOKENS.full,
          bgcolor: 'divider',
          mx: 'auto',
          mb: 1.5,
          mt: 0.5,
        }}
      />

      {activeView === 'tools' ? (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
              {t('preview:toolbar.toolsMenuTitle', 'Herramientas del Documento')}
            </Typography>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {toolItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={item.action}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  transition: 'background-color 0.15s ease',
                  '&:active': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: RADIUS_TOKENS.md,
                      bgcolor: alpha(theme.palette.text.primary, 0.05),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.98rem',
                        color: 'text.primary',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
                <ChevronRightRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
              </ListItemButton>
            ))}
          </List>

          {/* Primary Action Button (Unified Download / Export Transition) */}
          <Box sx={{ mt: 2, px: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={isExportingPdf}
              startIcon={isExportingPdf ? <CircularProgress size={16} color="inherit" /> : <DownloadRoundedIcon />}
              endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 22 }} />}
              onClick={() => setActiveView('export')}
              sx={{
                height: 48,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {isExportingPdf
                ? t('preview:toolbar.exporting', 'Exportando PDF...')
                : t('preview:toolbar.downloadFormats', 'Descargar / Exportar')}
            </Button>
          </Box>
        </>
      ) : (
        <>
          {/* Export Formats Sub-View */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setActiveView('tools')}
              sx={{ mr: 1, color: 'text.secondary' }}
              aria-label={t('common:actions.back', 'Volver')}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', flexGrow: 1 }}>
              {t('preview:toolbar.downloadFormats', 'Formatos de Exportación')}
            </Typography>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {onSharePdf && (
              <ListItemButton
                onClick={() => {
                  handleClose();
                  onSharePdf();
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <ShareRoundedIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.sharePdfItem', 'Compartir PDF')}
                  secondary={t('preview:toolbar.sharePdfDesc', 'Enviar por WhatsApp, Gmail, Drive...')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700 } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}

            {onDownloadPdf && (
              <ListItemButton
                onClick={() => {
                  handleClose();
                  onDownloadPdf();
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <PictureAsPdfRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.savePdfItem', 'Guardar en Dispositivo (PDF)')}
                  secondary={t('preview:toolbar.savePdfDesc', 'Guardar permanentemente en Documentos')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700 } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}

            {onDownloadDocx && (
              <ListItemButton
                onClick={() => {
                  handleClose();
                  onDownloadDocx();
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <DescriptionRoundedIcon fontSize="small" sx={{ color: '#2b579a' }} />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.downloadDocxItem', 'Descargar Word (.docx)')}
                  secondary={t('preview:toolbar.downloadDocxDesc', 'Formato Office editable para reclutadores')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700 } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}

            {onDownloadPlainText && (
              <ListItemButton
                onClick={() => {
                  handleClose();
                  onDownloadPlainText();
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <NotesRoundedIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.downloadTxtItem', 'Texto Plano ATS (.txt)')}
                  secondary={t('preview:toolbar.downloadTxtDesc', 'Para copiar y pegar en portales ATS')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700 } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}

            {onCopyPlainText && (
              <ListItemButton
                onClick={() => {
                  onCopyPlainText();
                  setCopiedAts(true);
                  setTimeout(() => {
                    setCopiedAts(false);
                    handleClose();
                  }, 750);
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <ContentCopyRoundedIcon fontSize="small" color={copiedAts ? 'success' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={copiedAts ? t('common:status.copied', '¡Copiado!') : t('preview:toolbar.copyTxtItem', 'Copiar Texto ATS')}
                  secondary={t('preview:toolbar.copyTxtDesc', 'Copia el texto limpio al portapapeles')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700, color: copiedAts ? 'success.main' : 'inherit' } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}

            {onDownloadMarkdown && <Divider sx={{ my: 0.5 }} />}
            {onDownloadMarkdown && (
              <ListItemButton
                onClick={() => {
                  handleClose();
                  onDownloadMarkdown();
                }}
                sx={{
                  py: 1.5,
                  px: 1.75,
                  borderRadius: RADIUS_TOKENS.lg,
                  '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  <CodeRoundedIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={t('preview:toolbar.downloadMdItem', 'Descargar Markdown (.md)')}
                  secondary={t('preview:toolbar.downloadMdDesc', 'Código fuente para respaldos')}
                  slotProps={{
                    primary: { sx: { fontSize: '0.92rem', fontWeight: 700 } },
                    secondary: { sx: { fontSize: '0.78rem' } },
                  }}
                />
              </ListItemButton>
            )}
          </List>
        </>
      )}
    </Drawer>
  );
};
