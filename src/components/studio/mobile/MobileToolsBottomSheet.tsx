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
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
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
  onDownloadDocx?: () => void;
  onDownloadPlainText?: () => void;
  onCopyPlainText?: () => void;
  onDownloadMarkdown?: () => void;
  onSaveVersion?: () => void;
  onReTailor?: () => void;
  isExportingPdf?: boolean;
  isSavingVersion?: boolean;
}

/**
 * Mobile-First Slide-Up Bottom Sheet for Document Tools (Templates, Design, LinkedIn, Compare).
 * Adheres strictly to mobile-first-ux-rules.md (Pillar 4: Thumb-Zone Bottom Sheet).
 */
export const MobileToolsBottomSheet: React.FC<MobileToolsBottomSheetProps> = ({
  open,
  onClose,
  onSelectTool,
  onOpenDiff,
  onOpenAuditGap,
  onDownloadPdf,
  onDownloadDocx,
  onDownloadPlainText,
  onCopyPlainText,
  onDownloadMarkdown,
  onSaveVersion,
  onReTailor,
  isExportingPdf = false,
  isSavingVersion = false,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [copiedAts, setCopiedAts] = useState<boolean>(false);

  const toolItems = [
    {
      id: 'templates' as PreviewSidePanelType,
      label: t('preview:navRail.templates', 'Plantillas'),
      icon: <GridViewRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        onClose();
        onSelectTool('templates');
      },
    },
    {
      id: 'design' as PreviewSidePanelType,
      label: t('preview:navRail.design', 'Diseño & Formato'),
      icon: <PaletteRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        onClose();
        onSelectTool('design');
      },
    },
    {
      id: 'gap',
      label: t('preview:drawer.hudTitle', 'Diagnóstico & Brechas ATS'),
      icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        onClose();
        onOpenAuditGap?.('gap');
      },
    },
    {
      id: 'linkedin' as PreviewSidePanelType,
      label: t('preview:navRail.linkedin', 'LinkedIn'),
      icon: <LinkedInIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        onClose();
        onSelectTool('linkedin');
      },
    },
    {
      id: 'diff',
      label: t('preview:navRail.diff', 'Comparar'),
      icon: <CompareArrowsRoundedIcon sx={{ fontSize: 22, color: 'text.primary' }} />,
      action: () => {
        onClose();
        onOpenDiff?.();
      },
    },
  ];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: RADIUS_TOKENS.xl,
            borderTopRightRadius: RADIUS_TOKENS.xl,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            pt: 1,
            pb: 2,
            px: 1,
            boxShadow: theme.shadows[12],
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
        }}
      />

      <List disablePadding>
        {toolItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              onClick={item.action}
              sx={{
                py: 1.75,
                px: 2,
                borderRadius: RADIUS_TOKENS.md,
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
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
            </ListItemButton>
            {idx < toolItems.length - 1 && <Divider sx={{ my: 0.5, mx: 2 }} />}
          </React.Fragment>
        ))}
      </List>

      {/* Primary Action Button (Unified Download / Export Dropdown) */}
      <Box sx={{ mt: 1.5, px: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={isExportingPdf}
          startIcon={isExportingPdf ? <CircularProgress size={16} color="inherit" /> : <DownloadRoundedIcon />}
          endIcon={<ArrowDropDownRoundedIcon sx={{ fontSize: 22 }} />}
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          sx={{
            height: 46,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.94rem',
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          {isExportingPdf
            ? t('preview:toolbar.exporting', 'Exportando PDF...')
            : t('preview:toolbar.downloadFormats', 'Descargar / Exportar')}
        </Button>

        {/* Dropdown Menu for all Export Formats */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          slotProps={{
            paper: {
              sx: {
                width: 320,
                maxWidth: '92vw',
                borderRadius: RADIUS_TOKENS.lg,
                mb: 1,
                zIndex: (t) => t.zIndex.modal + 20,
              },
            },
          }}
        >
          {onDownloadPdf && (
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onClose();
                onDownloadPdf();
              }}
            >
              <ListItemIcon>
                <PictureAsPdfRoundedIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.directPdfItem', 'Descarga Directa (PDF)')}
                secondary={t('preview:toolbar.directPdfDesc', 'Documento PDF de alta fidelidad')}
                slotProps={{
                  primary: { sx: { fontSize: '0.86rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                }}
              />
            </MenuItem>
          )}

          {onDownloadDocx && (
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onClose();
                onDownloadDocx();
              }}
            >
              <ListItemIcon>
                <DescriptionRoundedIcon fontSize="small" sx={{ color: '#2b579a' }} />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadDocxItem', 'Descargar Word (.docx)')}
                secondary={t('preview:toolbar.downloadDocxDesc', 'Formato Office editable para reclutadores')}
                slotProps={{
                  primary: { sx: { fontSize: '0.86rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                }}
              />
            </MenuItem>
          )}

          {onDownloadPlainText && (
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onClose();
                onDownloadPlainText();
              }}
            >
              <ListItemIcon>
                <NotesRoundedIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadTxtItem', 'Texto Plano ATS (.txt)')}
                secondary={t('preview:toolbar.downloadTxtDesc', 'Para copiar y pegar en portales ATS')}
                slotProps={{
                  primary: { sx: { fontSize: '0.86rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                }}
              />
            </MenuItem>
          )}

          {onCopyPlainText && (
            <MenuItem
              onClick={() => {
                onCopyPlainText();
                setCopiedAts(true);
                setTimeout(() => {
                  setCopiedAts(false);
                  setExportMenuAnchor(null);
                  onClose();
                }, 750);
              }}
            >
              <ListItemIcon>
                <ContentCopyRoundedIcon fontSize="small" color={copiedAts ? 'success' : 'action'} />
              </ListItemIcon>
              <ListItemText
                primary={copiedAts ? t('common:status.copied', '¡Copiado!') : t('preview:toolbar.copyTxtItem', 'Copiar Texto ATS')}
                secondary={t('preview:toolbar.copyTxtDesc', 'Copia el texto limpio al portapapeles')}
                slotProps={{
                  primary: { sx: { fontSize: '0.86rem', fontWeight: 700, color: copiedAts ? 'success.main' : 'inherit' } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                }}
              />
            </MenuItem>
          )}

          {onDownloadMarkdown && <Divider sx={{ my: 0.5 }} />}
          {onDownloadMarkdown && (
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onClose();
                onDownloadMarkdown();
              }}
            >
              <ListItemIcon>
                <CodeRoundedIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={t('preview:toolbar.downloadMdItem', 'Descargar Markdown (.md)')}
                secondary={t('preview:toolbar.downloadMdDesc', 'Código fuente para respaldos')}
                slotProps={{
                  primary: { sx: { fontSize: '0.86rem', fontWeight: 700 } },
                  secondary: { sx: { fontSize: '0.72rem' } },
                }}
              />
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Drawer>
  );
};
