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
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useTranslation } from 'react-i18next';
import { ApplicationGridCardProps } from '../../../types';
import { getLocalizedColumnTitle } from '../../../utils/kanbanUtils';
import { formatLocalizedDate } from '../../../utils/dateUtils';
import { MatchScoreBadge } from '../../atoms';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { ApplicationCardMenus } from './ApplicationCardMenus';

export const ApplicationGridCard: React.FC<ApplicationGridCardProps> = React.memo(({
  application,
  allColumns,
  attachedVersion,
  onLoadInStudio,
  onMoveToStage,
  onArchive,
  onDelete,
  onDownloadPdf,
  isDownloadingPdf = false,
  onManageStages,
  onSelectLanguage,
  onTailorForApplication,
}) => {
  const { t, i18n } = useTranslation(['history', 'common']);
  const theme = useTheme();

  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Language Variant configuration
  const baseLang = attachedVersion?.baseLanguage || 'es';
  const currentLang = application.selectedLanguage || attachedVersion?.activeLanguage || baseLang;
  const currentVariant = attachedVersion?.translations?.[currentLang];
  const isLanguageOutdated = Boolean(currentLang !== baseLang && currentVariant?.isOutdated);

  // Find current column
  const currentColumn = allColumns.find((c) => c.id === application.columnId);
  const stageTitle = currentColumn ? getLocalizedColumnTitle(currentColumn, t) : application.columnId;
  const stageColor = currentColumn?.color || theme.palette.primary.main;

  const formatDate = (isoString?: string) =>
    formatLocalizedDate(isoString, i18n.language || 'en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleOpenStatusMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setStatusMenuAnchor(e.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
  };

  const handleSelectStage = (targetColId: string) => {
    handleCloseStatusMenu();
    if (targetColId !== application.columnId) {
      onMoveToStage(application.id, targetColId);
    }
  };

  const handleOpenMoreMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMoreMenuAnchor(e.currentTarget);
  };

  const handleCloseMoreMenu = () => {
    setMoreMenuAnchor(null);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete(application.id);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          borderRadius: RADIUS_TOKENS.lg,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          height: '100%',
          boxSizing: 'border-box',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.45)'
              : '0 8px 24px rgba(15,23,42,0.06)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.25 }, pb: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Card Header: Company, Role & Interactive Status Chip */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <BusinessRoundedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={application.companyName}
                >
                  {application.companyName}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={application.targetRole}
              >
                {application.targetRole}
              </Typography>
            </Box>

            {/* Interactive Status Chip (1-Click Change) */}
            <Tooltip title={t('history:status.clickToChange', 'Click to change stage')} arrow>
              <Chip
                label={stageTitle}
                size="small"
                onClick={handleOpenStatusMenu}
                deleteIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '15px !important', color: `${stageColor} !important` }} />}
                onDelete={handleOpenStatusMenu}
                sx={{
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: alpha(stageColor, 0.12),
                  color: stageColor,
                  border: `1px solid ${alpha(stageColor, 0.35)}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: alpha(stageColor, 0.2),
                    borderColor: stageColor,
                  },
                }}
              />
            </Tooltip>
          </Box>

          {/* Metadata Badges Strip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {/* Match score if internal or has score */}
            {Boolean(application.matchScore && application.matchScore > 0) && (
              <MatchScoreBadge score={application.matchScore} />
            )}

            {/* Resume Source Indicator */}
            {application.isExternalCv ? (
              <>
                <Chip
                  icon={<DescriptionRoundedIcon sx={{ fontSize: '13px !important' }} />}
                  label={application.externalCvTitle || t('history:externalCv.badge', 'External CV')}
                  size="small"
                  variant="outlined"
                  color="default"
                  sx={{ fontSize: '0.68rem', height: 22 }}
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
                    sx={{ fontSize: '0.65rem', height: 22, fontWeight: 600 }}
                  />
                )}
                {Boolean(application.contactPerson) && (
                  <Tooltip title={`${t('history:trackModal.contactPerson', 'Contacto')}: ${application.contactPerson}`}>
                    <Chip
                      icon={<PersonRoundedIcon sx={{ fontSize: '12px !important' }} />}
                      label={application.contactPerson}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 22 }}
                    />
                  </Tooltip>
                )}
              </>
            ) : attachedVersion ? (
              <>
                <Tooltip title={t('history:language.selectTooltip', 'Cambiar idioma del CV para esta postulación')}>
                  <Chip
                    icon={<LanguageRoundedIcon sx={{ fontSize: '13px !important' }} />}
                    label={`${currentLang.toUpperCase()}${isLanguageOutdated ? ' ⚠️' : ''}`}
                    size="small"
                    variant="outlined"
                    color={isLanguageOutdated ? 'warning' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLangMenuAnchor(e.currentTarget);
                    }}
                    sx={{
                      fontSize: '0.68rem',
                      height: 22,
                      fontWeight: 700,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(isLanguageOutdated ? theme.palette.warning.main : theme.palette.primary.main, 0.08),
                      },
                    }}
                  />
                </Tooltip>
              </>
            ) : null}

            {/* Location & Salary chips if present */}
            {Boolean(application.location) && (
              <Chip
                icon={<LocationOnRoundedIcon sx={{ fontSize: '13px !important' }} />}
                label={application.location}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.68rem', height: 22, color: 'text.secondary' }}
              />
            )}

            {Boolean(application.salary) && (
              <Chip
                icon={<MonetizationOnRoundedIcon sx={{ fontSize: '13px !important' }} />}
                label={application.salary}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.68rem', height: 22, color: 'text.secondary' }}
              />
            )}
          </Box>

          {/* Notes Preview if available */}
          {Boolean(application.notes) && (
            <Box
              sx={{
                p: 1,
                borderRadius: RADIUS_TOKENS.sm,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.75,
              }}
            >
              <NotesRoundedIcon sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.35,
                  fontSize: '0.72rem',
                }}
              >
                {application.notes}
              </Typography>
            </Box>
          )}

          {/* Timestamp */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto', pt: 0.5 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {t('history:appliedOn', 'Applied')}: {formatDate(application.appliedDate || application.createdAt)}
            </Typography>
          </Box>
        </CardContent>

        <Divider sx={{ opacity: 0.6 }} />

        {/* Card Actions Footer */}
        <CardActions sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {attachedVersion && onLoadInStudio && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={() => onLoadInStudio(attachedVersion.id)}
                sx={{
                  fontSize: '0.72rem',
                  py: 0.4,
                  px: 1.25,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t('history:actions.openInStudio', 'Open Studio')}
              </Button>
            )}

            {!attachedVersion && onTailorForApplication && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => onTailorForApplication(application)}
                sx={{
                  fontSize: '0.72rem',
                  py: 0.4,
                  px: 1.25,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {t('history:card.tailorCvForApp', '✨ Adaptar CV')}
              </Button>
            )}

            {attachedVersion && onDownloadPdf && (
              <Tooltip title={t('history:actions.downloadPdfWithLang', 'Descargar PDF ({{lang}})', { lang: currentLang.toUpperCase() })} arrow>
                <IconButton
                  size="small"
                  onClick={() => onDownloadPdf(attachedVersion, currentLang)}
                  disabled={isDownloadingPdf}
                  sx={{
                    color: 'text.secondary',
                    p: 0.75,
                    '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.08) },
                  }}
                >
                  {isDownloadingPdf ? (
                    <CircularProgress size={16} />
                  ) : (
                    <PictureAsPdfRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <IconButton
            size="small"
            onClick={handleOpenMoreMenu}
            sx={{ color: 'text.secondary', p: 0.75 }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>

      {/* Menus and Confirmation Dialogs */}
      <ApplicationCardMenus
        application={application}
        allColumns={allColumns}
        attachedVersion={attachedVersion}
        statusMenuAnchor={statusMenuAnchor}
        onCloseStatusMenu={handleCloseStatusMenu}
        onMoveToStage={(colId) => onMoveToStage(application.id, colId)}
        onManageStages={onManageStages}
        moreMenuAnchor={moreMenuAnchor}
        onCloseMoreMenu={handleCloseMoreMenu}
        onArchive={onArchive}
        onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        onTailorForApplication={onTailorForApplication}
        langMenuAnchor={langMenuAnchor}
        onCloseLangMenu={() => setLangMenuAnchor(null)}
        onSelectLanguage={onSelectLanguage}
        onLoadInStudio={onLoadInStudio}
      />
    </>
  );
});
