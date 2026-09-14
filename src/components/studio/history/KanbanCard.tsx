import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import DriveFileMoveRoundedIcon from '@mui/icons-material/DriveFileMoveRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { KanbanCardProps, GeneratedCvVersion } from '../../../types';
import { getPaletteConfig } from '../../../constants/palettes';
import { formatLocalizedDate } from '../../../utils/dateUtils';
import { MatchScoreBadge } from '../../atoms';
import { ApplicationCardMenus } from './ApplicationCardMenus';

export const KanbanCard: React.FC<KanbanCardProps> = ({
  application,
  allColumns,
  attachedVersion,
  allMatchingVersions,
  onLoadInStudio,
  onSetAttachedVersion,
  onMoveToColumn,
  onArchive,
  onDelete,
  onDownloadPdf,
  isDownloadingPdf = false,
  isDraggingOverlay = false,
  onSelectLanguage,
  onTailorForApplication,
}) => {
  const { t, i18n } = useTranslation(['history', 'common', 'gap', 'audit', 'preview', 'target']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  // Language Variant resolution
  const baseLang = attachedVersion?.baseLanguage || 'es';
  const currentLang = application.selectedLanguage || attachedVersion?.activeLanguage || baseLang;
  const currentVariant = attachedVersion?.translations?.[currentLang];
  const isLanguageOutdated = Boolean(currentLang !== baseLang && currentVariant?.isOutdated);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: 'card',
      application,
    },
    disabled: isDraggingOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDraggingOverlay ? 'grabbing' : 'default',
  };

  const palConfig = getPaletteConfig(attachedVersion?.palette || 'corporate-blue');

  const formatDate = (isoString?: string) =>
    formatLocalizedDate(isoString, i18n.language || 'en', {
      day: '2-digit',
      month: 'short',
    });

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMenuAnchor(null);
  };

  // Find version index for label
  const attachedVersionIndex = allMatchingVersions.findIndex((v) => v.id === application.appliedVersionId);
  const versionDisplayNumber = attachedVersionIndex !== -1 ? allMatchingVersions.length - attachedVersionIndex : 1;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        variant="outlined"
        sx={{
          bgcolor: 'background.paper',
          border: `1px solid ${isDraggingOverlay ? theme.palette.primary.main : theme.palette.divider}`,
          boxShadow: isDraggingOverlay ? 8 : 1,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 3,
          },
        }}
      >
        <CardContent sx={{ p: 1.75, pb: 1 }}>
          {/* Top Row: Drag Handle + Company + Menu */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              {/* Drag Handle */}
              <Box
                {...attributes}
                {...listeners}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  cursor: isDraggingOverlay ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  p: { xs: 0.75, sm: 0.35 },
                  minWidth: { xs: 34, sm: 24 },
                  minHeight: { xs: 34, sm: 24 },
                  borderRadius: 1,
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  '&:hover, &:active': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
                aria-label={t('history:card.dragHandle', 'Drag card to reorder or move between stages')}
              >
                <DragIndicatorRoundedIcon sx={{ fontSize: { xs: 20, sm: 18 } }} />
              </Box>

              {/* Company Logo Icon */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: alpha(palConfig.accentColor || theme.palette.primary.main, 0.12),
                  color: palConfig.accentColor || theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >

                <BusinessRoundedIcon sx={{ fontSize: 16 }} />
              </Box>

              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
                title={application.companyName}
              >
                {application.companyName}
              </Typography>
            </Box>

            {/* More Menu */}
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              sx={{ p: 0.25, color: 'text.secondary', flexShrink: 0 }}
            >
              <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Target Role */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'text.secondary',
              mb: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            title={application.targetRole}
          >
            {application.targetRole}
          </Typography>

          {/* Badges: Match Score & Attached Version Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {Boolean(application.matchScore || attachedVersion?.matchScore) && (
              <MatchScoreBadge
                score={application.matchScore || attachedVersion?.matchScore}
              />
            )}

            {/* Attached Version Switcher or External CV Badge */}
            {application.isExternalCv ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  icon={<DescriptionRoundedIcon sx={{ fontSize: '12px !important' }} />}
                  label={application.externalCvTitle || t('history:externalCv.badge', 'External CV')}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
                />
                {Boolean(application.contactChannel) && (
                  <Chip
                    label={
                      application.contactChannel === 'linkedin' ? '🌐 LinkedIn' :
                      application.contactChannel === 'whatsapp' ? '💬 WhatsApp' :
                      application.contactChannel === 'email' ? '✉️ Email' :
                      application.contactChannel === 'referral' ? '👥 Referido' :
                      application.contactChannel === 'headhunter' ? '👔 Headhunter' :
                      application.contactChannel === 'portal' ? '🏢 Portal' :
                      application.contactChannel === 'direct' ? '🤝 Directo' :
                      `📌 ${application.contactChannel}`
                    }
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
                  />
                )}
                {Boolean(application.contactPerson) && (
                  <Tooltip title={`${t('history:trackModal.contactPerson', 'Contacto')}: ${application.contactPerson}`}>
                    <Chip
                      icon={<PersonRoundedIcon sx={{ fontSize: '11px !important' }} />}
                      label={application.contactPerson}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.65rem' }}
                    />
                  </Tooltip>
                )}
              </Box>
            ) : allMatchingVersions.length > 1 ? (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={application.appliedVersionId}
                  onChange={(e) => onSetAttachedVersion(application.id, e.target.value)}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    '& .MuiSelect-select': { py: 0.2, px: 0.8 },
                  }}
                >
                  {allMatchingVersions.map((v, i) => (
                    <MenuItem key={v.id} value={v.id} sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      v{allMatchingVersions.length - i} • {v.matchScore}% Match ({formatDate(v.createdAt)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Chip
                icon={<LayersRoundedIcon sx={{ fontSize: '12px !important' }} />}
                label={`v${versionDisplayNumber}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
              />
            )}

            {/* Language Variant Chip & Dropdown */}
            {attachedVersion && (
              <>
                <Tooltip title={t('history:language.selectTooltip', 'Cambiar idioma del CV para esta postulación')}>
                  <Chip
                    icon={<LanguageRoundedIcon sx={{ fontSize: '12px !important' }} />}
                    label={`${currentLang.toUpperCase()}${isLanguageOutdated ? ' ⚠️' : ''}`}
                    size="small"
                    variant="outlined"
                    color={isLanguageOutdated ? 'warning' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLangMenuAnchor(e.currentTarget);
                    }}
                    sx={{
                      height: 22,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(isLanguageOutdated ? theme.palette.warning.main : theme.palette.primary.main, 0.08),
                      },
                    }}
                  />
                </Tooltip>
              </>
            )}
          </Box>

          {/* Optional Meta: Salary, Location, Notes indicator */}
          {(application.salary || application.location || application.notes) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1, color: 'text.secondary' }}>
              {application.salary && (
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '0.68rem', fontWeight: 600 }}>
                  <MonetizationOnRoundedIcon sx={{ fontSize: 13, color: 'success.main' }} />
                  {application.salary}
                </Typography>
              )}
              {application.location && (
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '0.68rem' }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 13 }} />
                  {application.location}
                </Typography>
              )}
              {application.notes && (
                <Tooltip title={application.notes}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '0.68rem', cursor: 'pointer' }}>
                    <NotesRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                    {t('history:card.notes', 'Notes')}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          )}

          {/* Date applied */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem' }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 11 }} /> {formatDate(application.appliedDate || application.createdAt)}
            </Typography>
          </Box>
        </CardContent>

        {/* Card Actions: View in Studio + PDF */}
        <CardActions
          sx={{
            p: 1,
            px: 1.5,
            pt: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            bgcolor: alpha(theme.palette.text.primary, isDark ? 0.015 : 0.01),
          }}
        >
          {application.appliedVersionId && (
            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onLoadInStudio(application.appliedVersionId!);
              }}
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                p: 0.4,
                px: 1,
                textTransform: 'none',
              }}
            >
              {t('history:card.openInStudio', 'View & Edit')}
            </Button>
          )}

          {attachedVersion && (
            <Tooltip title={t('history:actions.downloadPdfWithLang', 'Descargar PDF ({{lang}})', { lang: currentLang.toUpperCase() })}>
              <span>
                <IconButton
                  size="small"
                  disabled={isDownloadingPdf}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadPdf(attachedVersion, currentLang);
                  }}
                  sx={{
                    p: 0.5,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {isDownloadingPdf ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <PictureAsPdfRoundedIcon sx={{ fontSize: 15 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
        </CardActions>
      </Card>

      {/* Context, Status, and Language Menus and Confirmation Dialogs */}
      <ApplicationCardMenus
        application={application}
        allColumns={allColumns || []}
        attachedVersion={attachedVersion}
        statusMenuAnchor={null}
        onCloseStatusMenu={() => {}}
        onMoveToStage={(colId) => onMoveToColumn?.(colId)}
        moreMenuAnchor={menuAnchor}
        onCloseMoreMenu={handleCloseMenu}
        onArchive={onArchive}
        onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={() => {
          setIsDeleteDialogOpen(false);
          onDelete(application.id);
        }}
        onTailorForApplication={onTailorForApplication}
        langMenuAnchor={langMenuAnchor}
        onCloseLangMenu={() => setLangMenuAnchor(null)}
        onSelectLanguage={onSelectLanguage}
        onLoadInStudio={onLoadInStudio}
      />
    </div>
  );
};
