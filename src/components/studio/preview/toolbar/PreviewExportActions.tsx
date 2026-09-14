import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useTranslation } from 'react-i18next';

export interface PreviewExportActionsProps {
  onDownloadPdf: () => void;
  isExportingPdf?: boolean;
  onDownloadMarkdown?: () => void;
  onDownloadPlainText?: () => void;
  onDownloadDocx?: () => void;
  onCopyPlainText?: () => void;
  onSaveVersion?: () => void;
  isSavingVersion?: boolean;
  savedSuccess?: boolean;
  onReTailor?: () => void;
  isGenerating?: boolean;
  onOpenAdaptModal?: () => void;
}

/**
 * PreviewExportActions
 * Presentational dumb subcomponent handling the export menu (PDF, Word, TXT, MD),
 * live version saving, and AI CV regeneration actions.
 */
export const PreviewExportActions: React.FC<PreviewExportActionsProps> = ({
  onDownloadPdf,
  isExportingPdf = false,
  onDownloadMarkdown,
  onDownloadPlainText,
  onDownloadDocx,
  onCopyPlainText,
  onSaveVersion,
  isSavingVersion = false,
  savedSuccess = false,
  onReTailor,
  isGenerating = false,
  onOpenAdaptModal,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);
  const [copiedAts, setCopiedAts] = useState<boolean>(false);

  const handleOpenPdfMenu = (e: React.MouseEvent<HTMLElement>) => {
    setPdfMenuAnchor(e.currentTarget);
  };

  const handleClosePdfMenu = () => {
    setPdfMenuAnchor(null);
  };

  const handleCopyAts = () => {
    if (onCopyPlainText) {
      onCopyPlainText();
      setCopiedAts(true);
      setTimeout(() => setCopiedAts(false), 2500);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
      {/* 1. Save Version Action */}
      {onSaveVersion && (
        <Button
          size="small"
          variant="text"
          onClick={onSaveVersion}
          disabled={isSavingVersion}
          startIcon={
            isSavingVersion ? (
              <CircularProgress size={13} color="inherit" />
            ) : savedSuccess ? (
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />
            ) : undefined
          }
          sx={{
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            color: savedSuccess ? 'success.main' : 'text.secondary',
            px: 1,
            display: { xs: 'none', sm: 'inline-flex' },
            transition: 'all 0.15s ease',
            '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.06) },
          }}
        >
          {isSavingVersion
            ? t('common:actions.saving', 'Saving...')
            : savedSuccess
            ? t('common:actions.saved', 'Saved!')
            : t('common:actions.save', 'Save')}
        </Button>
      )}

      {/* 2. Regenerate Full CV Action */}
      {onReTailor && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={onReTailor}
          disabled={isGenerating}
          sx={{
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1.8,
            py: 0.5,
            minHeight: 34,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.paper',
            boxShadow: 'none',
            display: { xs: 'none', md: 'inline-flex' },
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            },
          }}
        >
          {isGenerating
            ? t('preview:toolbar.regeneratingCv', 'Regenerando...')
            : t('preview:toolbar.regenerateCv', 'Regenerar CV')}
        </Button>
      )}

      {/* 3. Adapt to Another Job Offer Action */}
      {onOpenAdaptModal && (
        <Tooltip title={t('preview:toolbar.adaptToNewOfferTooltip', 'Adaptar este CV a una nueva oferta laboral sin perder la actual')}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<PostAddRoundedIcon sx={{ fontSize: 15 }} />}
            onClick={onOpenAdaptModal}
            disabled={isGenerating}
            sx={{
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 1.6,
              py: 0.5,
              minHeight: 34,
              display: { xs: 'none', md: 'inline-flex' },
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderColor: 'primary.main',
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>
              {t('preview:toolbar.adaptToNewOffer', 'Adaptar a otra oferta')}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' } }}>
              {t('preview:toolbar.adaptToNewOfferShort', 'Nueva Oferta')}
            </Box>
          </Button>
        </Tooltip>
      )}

      {/* Divider */}
      <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 }, my: 0.5, display: { xs: 'none', md: 'block' } }} />

      {/* 4. Download Dropdown Button */}
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={handleOpenPdfMenu}
        disabled={isExportingPdf}
        startIcon={
          isExportingPdf ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <DownloadRoundedIcon sx={{ fontSize: 16 }} />
          )
        }
        endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18 }} />}
        sx={{
          fontSize: '0.82rem',
          fontWeight: 700,
          textTransform: 'none',
          px: { xs: 1.5, sm: 2 },
          py: 0.6,
          minHeight: 34,
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {isExportingPdf ? t('preview:toolbar.generatingPdf', 'Generando PDF...') : t('preview:toolbar.downloadFormats', 'Descargar / Exportar')}
        </Box>
        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
          {isExportingPdf ? '...' : t('preview:toolbar.downloadFormats', 'Exportar')}
        </Box>
      </Button>

      {/* Export Dropdown Menu */}
      <Menu
        anchorEl={pdfMenuAnchor}
        open={Boolean(pdfMenuAnchor)}
        onClose={handleClosePdfMenu}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              minWidth: 240,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClosePdfMenu();
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
              primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
              secondary: { sx: { fontSize: '0.7rem' } },
            }}
          />
        </MenuItem>

        {onDownloadDocx && (
          <MenuItem
            onClick={() => {
              handleClosePdfMenu();
              onDownloadDocx();
            }}
          >
            <ListItemIcon>
              <DescriptionRoundedIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('preview:toolbar.downloadDocxItem', 'Descargar Word (.docx)')}
              secondary={t('preview:toolbar.downloadDocxDesc', 'Formato Office editable para reclutadores')}
              slotProps={{
                primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                secondary: { sx: { fontSize: '0.7rem' } },
              }}
            />
          </MenuItem>
        )}

        {onDownloadPlainText && (
          <MenuItem
            onClick={() => {
              handleClosePdfMenu();
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
                primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                secondary: { sx: { fontSize: '0.7rem' } },
              }}
            />
          </MenuItem>
        )}

        {onCopyPlainText && (
          <MenuItem
            onClick={() => {
              handleClosePdfMenu();
              handleCopyAts();
            }}
          >
            <ListItemIcon>
              <ContentCopyRoundedIcon fontSize="small" color={copiedAts ? 'success' : 'action'} />
            </ListItemIcon>
            <ListItemText
              primary={copiedAts ? t('common:status.copied', '¡Copiado!') : t('preview:toolbar.copyTxtItem', 'Copiar Texto ATS')}
              secondary={t('preview:toolbar.copyTxtDesc', 'Copia el texto limpio al portapapeles')}
              slotProps={{
                primary: { sx: { fontSize: '0.82rem', fontWeight: 700, color: copiedAts ? 'success.main' : 'inherit' } },
                secondary: { sx: { fontSize: '0.7rem' } },
              }}
            />
          </MenuItem>
        )}

        {onDownloadMarkdown && <Divider sx={{ my: 0.5 }} />}

        {onDownloadMarkdown && (
          <MenuItem
            onClick={() => {
              handleClosePdfMenu();
              onDownloadMarkdown();
            }}
          >
            <ListItemIcon>
              <ArticleRoundedIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary={t('preview:toolbar.downloadMdItem', 'Descargar Markdown (.md)')}
              secondary={t('preview:toolbar.downloadMdDesc', 'Documento fuente en Markdown')}
              slotProps={{
                primary: { sx: { fontSize: '0.82rem', fontWeight: 700 } },
                secondary: { sx: { fontSize: '0.7rem' } },
              }}
            />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
