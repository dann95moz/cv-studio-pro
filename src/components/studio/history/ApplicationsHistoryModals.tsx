import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { TrackApplicationDialog } from './TrackApplicationDialog';
import { ColumnEditDialog } from './ColumnEditDialog';
import { VersionDiffModal } from './VersionDiffModal';
import {
  GeneratedCvVersion,
  ApplicationItem,
  KanbanColumn,
  TrackApplicationDialogProps,
} from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface ApplicationsHistoryModalsProps {
  isBulkDeleteDialogOpen: boolean;
  onCloseBulkDeleteModal: () => void;
  onConfirmBulkDelete: () => void;
  selectedProtectedCount: number;
  selectedDeletableCount: number;
  selectedTotalCount: number;
  isTrackModalOpen: boolean;
  onCloseTrackModal: () => void;
  onConfirmAddApplication: TrackApplicationDialogProps['onConfirm'];
  trackPrefillSourceType?: 'internal' | 'external';
  trackPrefillVersion?: GeneratedCvVersion | null;
  trackPrefillColumnId?: string;

  savedVersions: GeneratedCvVersion[];
  applications: ApplicationItem[];
  kanbanColumns: KanbanColumn[];
  isColumnEditOpen: boolean;
  editingColumn: KanbanColumn | null;
  onCloseEditColumn: () => void;
  onSaveColumn: (title: string, color: string) => void;
  isDiffModalOpen: boolean;
  onCloseDiffModal: () => void;
  diffSelectedVersionId?: string;
}

export const ApplicationsHistoryModals: React.FC<ApplicationsHistoryModalsProps> = ({
  isBulkDeleteDialogOpen,
  onCloseBulkDeleteModal,
  onConfirmBulkDelete,
  selectedProtectedCount,
  selectedDeletableCount,
  selectedTotalCount,
  isTrackModalOpen,
  onCloseTrackModal,
  onConfirmAddApplication,
  trackPrefillSourceType,
  trackPrefillVersion,
  trackPrefillColumnId,
  savedVersions,
  applications,
  kanbanColumns,
  isColumnEditOpen,
  editingColumn,
  onCloseEditColumn,
  onSaveColumn,
  isDiffModalOpen,
  onCloseDiffModal,
  diffSelectedVersionId,
}) => {
  const { t } = useTranslation(['history', 'common']);

  return (
    <>
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onClose={onCloseBulkDeleteModal}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: RADIUS_TOKENS.lg,
              p: 1,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineRoundedIcon color="error" />
          {selectedProtectedCount > 0 && selectedDeletableCount === 0
            ? t('history:bulkDeleteDialog.titleAllProtected', 'Protected CV Versions')
            : selectedProtectedCount > 0
            ? t('history:bulkDeleteDialog.titlePartial', 'Delete {{count}} versions?', {
                count: selectedDeletableCount,
              })
            : t('history:bulkDeleteDialog.title', {
                count: selectedTotalCount,
                defaultValue:
                  selectedTotalCount === 1
                    ? 'Delete 1 CV version?'
                    : `Delete ${selectedTotalCount} CV versions?`,
              })}
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {selectedProtectedCount > 0 && (
            <Alert
              severity="warning"
              variant="outlined"
              sx={{ mb: 1.5, py: 0.75, fontSize: '0.82rem', borderRadius: RADIUS_TOKENS.sm }}
            >
              {t(
                'history:bulkDeleteDialog.protectedAlert',
                '{{protectedCount}} of the {{totalCount}} selected versions are linked to active applications on your Kanban board and will not be deleted.',
                { protectedCount: selectedProtectedCount, totalCount: selectedTotalCount }
              )}
            </Alert>
          )}

          <DialogContentText sx={{ fontSize: '0.88rem', color: 'text.secondary' }}>
            {selectedProtectedCount > 0 && selectedDeletableCount === 0
              ? t(
                  'history:bulkDeleteDialog.messageAllProtected',
                  'All selected versions are currently attached to active applications in your Kanban pipeline. To delete them, first archive or delete the corresponding Kanban applications.'
                )
              : selectedProtectedCount > 0
              ? t(
                  'history:bulkDeleteDialog.messagePartial',
                  'Are you sure you want to delete the remaining {{deletableCount}} versions? This action is permanent and cannot be undone.',
                  { deletableCount: selectedDeletableCount }
                )
              : t(
                  'history:bulkDeleteDialog.message',
                  {
                    count: selectedTotalCount,
                    defaultValue:
                      selectedTotalCount === 1
                        ? 'Delete 1 CV version? This action is permanent and cannot be undone.'
                        : `Delete ${selectedTotalCount} CV versions? This action is permanent and cannot be undone.`,
                  }
                )}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
          <Button
            onClick={onCloseBulkDeleteModal}
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          >
            {selectedProtectedCount > 0 && selectedDeletableCount === 0
              ? t('common:actions.close', 'Close')
              : t('common:actions.cancel', 'Cancel')}
          </Button>

          {selectedDeletableCount > 0 && (
            <Button
              onClick={onConfirmBulkDelete}
              color="error"
              variant="contained"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              sx={{ fontWeight: 700 }}
            >
              {t('history:selection.confirmDelete', 'Delete {{count}} Versions', {
                count: selectedDeletableCount,
              })}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Opt-in Track Application Dialog */}
      <TrackApplicationDialog
        open={isTrackModalOpen}
        onClose={onCloseTrackModal}
        onConfirm={onConfirmAddApplication}
        initialSourceType={trackPrefillSourceType}
        prefillCompany={trackPrefillVersion?.companyName}
        prefillRole={trackPrefillVersion?.targetRole}
        prefillVersionId={trackPrefillVersion?.id}
        defaultColumnId={trackPrefillColumnId}
        savedVersions={savedVersions}
        existingApplications={applications}
        columns={kanbanColumns}
      />

      {/* Column Add / Edit Dialog */}
      <ColumnEditDialog
        open={isColumnEditOpen}
        column={editingColumn}
        onClose={onCloseEditColumn}
        onSave={onSaveColumn}
      />

      {/* Visual Version Diff Modal */}
      <VersionDiffModal
        open={isDiffModalOpen}
        onClose={onCloseDiffModal}
        initialVersionBId={diffSelectedVersionId}
      />
    </>
  );
};
