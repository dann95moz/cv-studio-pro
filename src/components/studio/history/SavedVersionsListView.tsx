import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import DeselectRoundedIcon from '@mui/icons-material/DeselectRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useTranslation } from 'react-i18next';
import { ApplicationCard } from './ApplicationCard';
import { GeneratedCvVersion } from '../../../types';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface SavedVersionsListViewProps {
  savedVersions: GeneratedCvVersion[];
  filteredVersions: GeneratedCvVersion[];
  searchQuery: string;
  isSelectionMode: boolean;
  selectedVersionIds: string[];
  selectedTotalCount: number;
  selectedProtectedCount: number;
  selectedDeletableCount: number;
  visibleVersionIds: string[];
  isAllVisibleSelected: boolean;
  activeLinkedVersionIds: Set<string>;
  downloadingPdfId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAllVisible: () => void;
  onStartSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onOpenBulkDeleteModal: () => void;
  onOpenDiffModal: (versionId?: string) => void;
  onLoadVersion: (id: string) => void;
  onDeleteVersion: (id: string) => void;
  onDownloadMarkdown: (v: GeneratedCvVersion) => void;
  onDownloadPdf: (v: GeneratedCvVersion) => void;
  onTrackVersion: (v: GeneratedCvVersion) => void;
}


export const SavedVersionsListView: React.FC<SavedVersionsListViewProps> = ({
  savedVersions,
  filteredVersions,
  searchQuery,
  isSelectionMode,
  selectedVersionIds,
  selectedTotalCount,
  selectedProtectedCount,
  selectedDeletableCount,
  visibleVersionIds,
  isAllVisibleSelected,
  activeLinkedVersionIds,
  downloadingPdfId,
  onToggleSelect,
  onToggleSelectAllVisible,
  onStartSelectionMode,
  onExitSelectionMode,
  onOpenBulkDeleteModal,
  onOpenDiffModal,
  onLoadVersion,
  onDeleteVersion,
  onDownloadMarkdown,
  onDownloadPdf,
  onTrackVersion,
}) => {
  const { t } = useTranslation(['history', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Version List Control / Selection Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.75 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          borderRadius: RADIUS_TOKENS.md,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: isSelectionMode
            ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.04)
            : 'background.paper',
          transition: 'all 0.2s ease',
        }}
      >
        {isSelectionMode ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={t('history:selection.selectedCount', '{{count}} selected', {
                  count: selectedTotalCount,
                })}
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />

              {selectedProtectedCount > 0 && (
                <Chip
                  icon={<LockRoundedIcon sx={{ fontSize: '13px !important' }} />}
                  label={t('history:selection.protectedNotice', '{{count}} linked to Kanban (protected)', {
                    count: selectedProtectedCount,
                  })}
                  color="warning"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={onToggleSelectAllVisible}
                startIcon={
                  isAllVisibleSelected ? (
                    <DeselectRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <SelectAllRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{ fontWeight: 600, fontSize: '0.78rem' }}
              >
                {isAllVisibleSelected
                  ? t('history:selection.deselectAll', 'Deselect All')
                  : searchQuery
                  ? t('history:selection.selectAllFiltered', 'Select Filtered ({{count}})', {
                      count: visibleVersionIds.length,
                    })
                  : t('history:selection.selectAll', 'Select All')}
              </Button>

              <Button
                size="small"
                variant="contained"
                color="error"
                disabled={selectedDeletableCount === 0}
                onClick={onOpenBulkDeleteModal}
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 700, fontSize: '0.78rem' }}
              >
                {t('history:selection.deleteButton', 'Delete ({{count}})', {
                  count: selectedDeletableCount,
                })}
              </Button>

              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={onExitSelectionMode}
                startIcon={<CloseRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 600, fontSize: '0.78rem' }}
              >
                {t('common:actions.cancel', 'Cancel')}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {searchQuery
                  ? t('history:selection.showingFiltered', 'Showing {{filtered}} of {{total}} saved versions', {
                      filtered: filteredVersions.length,
                      total: savedVersions.length,
                    })
                  : t('history:selection.totalSaved', '{{count}} total saved versions', {
                      count: savedVersions.length,
                    })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                disabled={savedVersions.length === 0}
                onClick={() => onOpenDiffModal()}
                startIcon={<DifferenceRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 700, fontSize: '0.78rem' }}
              >
                {t('history:diff.compareButton', 'Compare Versions (Diff)')}
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="primary"
                disabled={savedVersions.length === 0}
                onClick={onStartSelectionMode}
                startIcon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 700, fontSize: '0.78rem' }}
              >
                {t('history:selection.enterSelectMode', 'Select to Delete')}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Empty States */}
      {filteredVersions.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4.5 },
            textAlign: 'center',
            borderRadius: RADIUS_TOKENS.lg,
            bgcolor: 'background.paper',
            borderStyle: 'dashed',
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: '0 !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {searchQuery
                ? t('history:selection.noFilteredTitle', 'No CV versions match your filter')
                : t('history:selection.noVersionsTitle', 'No Tailored CV Versions Yet')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              {searchQuery
                ? t('history:selection.noFilteredDesc', 'Try adjusting your search query or clear the filter.')
                : t('history:selection.noVersionsDesc', 'Generate or save tailored CVs in Studio to maintain your application history here.')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {filteredVersions.map((v) => (
            <ApplicationCard
              key={v.id}
              version={v}
              onLoad={onLoadVersion}
              onDelete={onDeleteVersion}
              onDownload={onDownloadMarkdown}
              onDownloadPdf={onDownloadPdf}
              onTrack={(version) => onTrackVersion(version)}
              isDownloadingPdf={downloadingPdfId === v.id}
              selectionMode={isSelectionMode}
              isSelected={selectedVersionIds.includes(v.id)}
              onToggleSelect={onToggleSelect}
              isLinkedToActiveApp={activeLinkedVersionIds.has(v.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
