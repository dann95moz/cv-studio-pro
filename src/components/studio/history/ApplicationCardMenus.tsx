import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';
import { ApplicationItem, KanbanColumn, GeneratedCvVersion } from '../../../types';
import { getLocalizedColumnTitle } from '../../../utils/kanbanUtils';
import { ConfirmDeleteDialog } from '../common/ConfirmDeleteDialog';

export interface ApplicationCardMenusProps {
  application: ApplicationItem;
  allColumns: KanbanColumn[];
  attachedVersion?: GeneratedCvVersion | null;
  statusMenuAnchor: HTMLElement | null;
  onCloseStatusMenu: () => void;
  onMoveToStage: (targetColId: string) => void;
  onManageStages?: () => void;
  moreMenuAnchor: HTMLElement | null;
  onCloseMoreMenu: () => void;
  onArchive: (appId: string) => void;
  onOpenDeleteDialog: () => void;
  isDeleteDialogOpen: boolean;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
  onLoadInStudio?: (versionId: string) => void;
  langMenuAnchor?: HTMLElement | null;
  onCloseLangMenu?: () => void;
  onSelectLanguage?: (appId: string, lang: string) => void;
}


export const ApplicationCardMenus: React.FC<ApplicationCardMenusProps> = ({
  application,
  allColumns,
  attachedVersion,
  statusMenuAnchor,
  onCloseStatusMenu,
  onMoveToStage,
  onManageStages,
  moreMenuAnchor,
  onCloseMoreMenu,
  onArchive,
  onOpenDeleteDialog,
  isDeleteDialogOpen,
  onCloseDeleteDialog,
  onConfirmDelete,
  onTailorForApplication,
  onLoadInStudio,
  langMenuAnchor,
  onCloseLangMenu,
  onSelectLanguage,
}) => {
  const { t } = useTranslation(['history', 'common']);
  const theme = useTheme();

  return (
    <>
      {/* 1-Click Status Selection Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={onCloseStatusMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 200 },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 0.75,
            display: 'block',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'text.secondary',
            fontSize: '0.66rem',
            letterSpacing: '0.5px',
          }}
        >
          {t('history:status.moveToStage', 'Move to Stage')}
        </Typography>

        {allColumns.map((col) => {
          const isSelected = col.id === application.columnId;
          const colColor = col.color || theme.palette.primary.main;
          return (
            <MenuItem
              key={col.id}
              onClick={() => {
                onCloseStatusMenu();
                onMoveToStage(col.id);
              }}
              selected={isSelected}
              sx={{ py: 0.75, gap: 1 }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: colColor,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                    {getLocalizedColumnTitle(col, t)}
                  </Typography>
                }
              />
              {isSelected && <CheckRoundedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 'auto' }} />}
            </MenuItem>
          );
        })}

        {onManageStages && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                onCloseStatusMenu();
                onManageStages();
              }}
              sx={{ py: 0.75, color: 'text.secondary' }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                <SettingsRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {t('history:actions.manageStages', 'Manage Stages...')}
                  </Typography>
                }
              />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Card Context Menu (Archive / Delete) */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={onCloseMoreMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onTailorForApplication && (
          <MenuItem
            onClick={() => {
              onCloseMoreMenu();
              onTailorForApplication(application);
            }}
            sx={{ gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: 'primary.main' }}>
              <AutoAwesomeRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'primary.main' }}>
                  {t('history:card.tailorCvForApp', '✨ Adaptar CV en Studio')}
                </Typography>
              }
            />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onCloseMoreMenu();
            onArchive(application.id);
          }}
          sx={{ gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <ArchiveRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('history:actions.archive', 'Archive Application')} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            onCloseMoreMenu();
            onOpenDeleteDialog();
          }}
          sx={{ color: 'error.main', gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:actions.delete', 'Delete')} />
        </MenuItem>
      </Menu>

      {/* Language Selection Menu (Optional) */}
      {langMenuAnchor && onCloseLangMenu && onSelectLanguage && attachedVersion && (
        <Menu
          anchorEl={langMenuAnchor}
          open={Boolean(langMenuAnchor)}
          onClose={onCloseLangMenu}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuItem
            selected={!application.selectedLanguage || application.selectedLanguage === (attachedVersion.baseLanguage || 'es')}
            onClick={() => {
              onCloseLangMenu();
              onSelectLanguage(application.id, attachedVersion.baseLanguage || 'es');
            }}
            sx={{ gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 24 }}>
              <LanguageRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {(attachedVersion.baseLanguage || 'es').toUpperCase()} ({t('history:variant.original', 'Original')})
                </Typography>
              }
            />
          </MenuItem>

          {Object.entries(attachedVersion.translations || {}).map(([langKey, variant]) => (
            <MenuItem
              key={langKey}
              selected={application.selectedLanguage === langKey}
              onClick={() => {
                onCloseLangMenu();
                onSelectLanguage(application.id, langKey);
              }}
              sx={{ gap: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 24 }}>
                <TranslateRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {langKey.toUpperCase()} ({variant.languageLabel})
                    </Typography>
                    {variant.isOutdated && (
                      <WarningAmberRoundedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    )}
                  </Box>
                }
              />
            </MenuItem>
          ))}

          {onLoadInStudio && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  onCloseLangMenu();
                  onLoadInStudio(attachedVersion.id);
                }}
              >
                <ListItemIcon>
                  <TranslateRoundedIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'primary.main' }}>
                      {t('history:language.manageTranslations', 'Traducir / Gestionar Idiomas...')}
                    </Typography>
                  }
                />
              </MenuItem>
            </>
          )}
        </Menu>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        title={t('history:deleteAppTitle', 'Delete Application')}
        message={t(
          'history:deleteAppConfirm',
          'Are you sure you want to remove {{company}} from your application tracking? This cannot be undone.',
          { company: application.companyName }
        )}
        confirmLabel={t('common:actions.delete', 'Delete')}
        cancelLabel={t('common:actions.cancel', 'Cancel')}
        onConfirm={onConfirmDelete}
        onCancel={onCloseDeleteDialog}
      />
    </>
  );
};
