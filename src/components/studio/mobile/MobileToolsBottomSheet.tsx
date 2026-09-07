import React from 'react';
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
  useTheme,
  alpha,
} from '@mui/material';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';
import { PreviewSidePanelType } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MobileToolsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectTool: (panel: PreviewSidePanelType) => void;
  onOpenDiff?: () => void;
  onDownloadPdf?: () => void;
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
  onDownloadPdf,
  onSaveVersion,
  onReTailor,
  isExportingPdf = false,
  isSavingVersion = false,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

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

      {/* Primary Action Button (Download PDF) */}
      {onDownloadPdf && (
        <Box sx={{ mt: 1.5, px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={isExportingPdf}
            startIcon={isExportingPdf ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfRoundedIcon />}
            onClick={() => {
              onClose();
              onDownloadPdf();
            }}
            sx={{
              height: 44,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.92rem',
            }}
          >
            {isExportingPdf
              ? t('preview:toolbar.exporting', 'Exportando PDF...')
              : t('preview:toolbar.downloadPdfDirect', 'Descargar PDF')}
          </Button>
        </Box>
      )}
    </Drawer>
  );
};
