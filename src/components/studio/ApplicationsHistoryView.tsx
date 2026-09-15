import React from 'react';
import { Box } from '@mui/material';
import { ApplicationsStatsHeader } from './history/ApplicationsStatsHeader';
import { ApplicationsEmptyCard } from './history/ApplicationsEmptyCard';
import { KanbanBoard } from './history/KanbanBoard';
import { ApplicationsGridView } from './history/ApplicationsGridView';
import { ArchivedApplicationsView } from './history/ArchivedApplicationsView';
import { SavedVersionsListView } from './history/SavedVersionsListView';
import { ApplicationsHistoryModals } from './history/ApplicationsHistoryModals';
import { useApplicationsHistory } from '../../hooks/useApplicationsHistory';

export const ApplicationsHistoryView: React.FC = () => {
  const {
    savedVersions,
    applications,
    kanbanColumns,
    archivedApplications,
    filteredVersions,
    activeView,
    selectedStageFilter,
    setSelectedStageFilter,
    searchQuery,
    setSearchQuery,
    downloadingPdfId,
    isSelectionMode,
    selectedVersionIds,
    isBulkDeleteDialogOpen,
    isTrackModalOpen,
    trackPrefillColumnId,
    trackPrefillVersion,
    trackPrefillSourceType,
    isColumnEditOpen,
    editingColumn,
    isDiffModalOpen,
    diffSelectedVersionId,
    totalActive,
    totalArchived,
    totalInterviews,
    totalOffers,
    avgMatchScore,
    activeLinkedVersionIds,
    selectedTotalCount,
    selectedProtectedCount,
    selectedDeletableCount,
    visibleVersionIds,
    isAllVisibleSelected,
    handleToggleSelect,
    handleToggleSelectAllVisible,
    handleStartSelectionMode,
    handleExitSelectionMode,
    handleConfirmBulkDelete,
    handleDownloadMarkdown,
    handleDownloadPdf,
    handleOpenTrackModal,
    handleCloseTrackModal,
    handleOpenEditColumn,
    handleCloseEditColumn,
    handleSaveColumn,
    handleOpenDiffModal,
    handleCloseDiffModal,
    handleOpenBulkDeleteModal,
    handleCloseBulkDeleteModal,
    handleStartNewResume,
    handleTailorForApplication,
    handleViewChange,
    handleLoadVersion,
    handleDeleteVersion,
    handleAddApplication,
    handleDeleteApplication,
    handleMoveApplication,
    handleArchiveApplication,
    handleUnarchiveApplication,
    handleArchiveColumn,
    handleSetAttachedVersion,
    handleSetApplicationLanguage,
    handleDeleteColumn,
  } = useApplicationsHistory();

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        pt: { xs: 'max(calc(env(safe-area-inset-top, 0px) + 12px), 16px)', sm: 2, md: 3 },
        pb: { xs: 'max(calc(env(safe-area-inset-bottom, 0px) + 80px), 104px)', sm: 5, md: 6 },
        pl: { xs: 'max(calc(env(safe-area-inset-left, 0px) + 12px), 12px)', sm: 2, md: 3 },
        pr: { xs: 'max(calc(env(safe-area-inset-right, 0px) + 12px), 12px)', sm: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: (activeView === 'board' || activeView === 'grid') && totalActive > 0 ? '100%' : 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        {/* Top Summary Banner & Controls */}
        <ApplicationsStatsHeader
          totalActiveApplications={totalActive}
          totalInterviews={totalInterviews}
          totalOffers={totalOffers}
          totalArchived={totalArchived}
          avgMatchScore={avgMatchScore}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTrackNewApplication={() => handleOpenTrackModal()}
          onStartNewResume={handleStartNewResume}
          activeView={activeView}
          onViewChange={handleViewChange}
          savedVersionsCount={savedVersions.length}
        />

        {/* 1. APPLICATIONS GRID VIEW (Primary) */}
        {activeView === 'grid' && (
          <>
            {totalActive === 0 ? (
              <ApplicationsEmptyCard
                savedVersionsCount={savedVersions.length}
                onStartNewResume={handleStartNewResume}
                onTrackApplication={handleOpenTrackModal}
              />
            ) : (
              <ApplicationsGridView
                applications={applications}
                columns={kanbanColumns}
                savedVersions={savedVersions}
                searchQuery={searchQuery}
                selectedStageFilter={selectedStageFilter}
                onStageFilterChange={setSelectedStageFilter}
                onMoveToStage={handleMoveApplication}
                onLoadVersionInStudio={handleLoadVersion}
                onArchiveApplication={handleArchiveApplication}
                onDeleteApplication={handleDeleteApplication}
                onDownloadPdf={handleDownloadPdf}
                isDownloadingPdfId={downloadingPdfId}
                onManageStages={(col) => handleOpenEditColumn(col)}
                onQuickAddApplication={handleOpenTrackModal}
                onSelectLanguage={handleSetApplicationLanguage}
                onTailorForApplication={handleTailorForApplication}
              />
            )}
          </>
        )}

        {/* 2. KANBAN BOARD VIEW */}
        {activeView === 'board' && (
          <>
            {totalActive === 0 ? (
              <ApplicationsEmptyCard
                savedVersionsCount={savedVersions.length}
                onStartNewResume={handleStartNewResume}
                onTrackApplication={handleOpenTrackModal}
              />
            ) : (
              <KanbanBoard
                columns={kanbanColumns}
                applications={applications}
                savedVersions={savedVersions}
                searchQuery={searchQuery}
                onMoveApplication={handleMoveApplication}
                onLoadVersionInStudio={handleLoadVersion}
                onSetAttachedVersion={handleSetAttachedVersion}
                onArchiveApplication={handleArchiveApplication}
                onDeleteApplication={handleDeleteApplication}
                onDownloadPdf={handleDownloadPdf}
                isDownloadingPdfId={downloadingPdfId}
                onAddColumn={() => handleOpenEditColumn()}
                onEditColumn={handleOpenEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onArchiveColumn={handleArchiveColumn}
                onQuickAddApplication={handleOpenTrackModal}
                onSelectLanguage={handleSetApplicationLanguage}
                onTailorForApplication={handleTailorForApplication}
              />
            )}
          </>
        )}

        {/* 3. ARCHIVED APPLICATIONS VIEW */}
        {activeView === 'archived' && (
          <ArchivedApplicationsView
            archivedApplications={archivedApplications}
            savedVersions={savedVersions}
            searchQuery={searchQuery}
            onRestore={handleUnarchiveApplication}
            onDeletePermanently={handleDeleteApplication}
            onLoadInStudio={handleLoadVersion}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdfId={downloadingPdfId}
          />
        )}

        {/* 4. ALL SAVED RESUME VERSIONS */}
        {activeView === 'versions' && (
          <SavedVersionsListView
            savedVersions={savedVersions}
            filteredVersions={filteredVersions}
            searchQuery={searchQuery}
            isSelectionMode={isSelectionMode}
            selectedVersionIds={selectedVersionIds}
            selectedTotalCount={selectedTotalCount}
            selectedProtectedCount={selectedProtectedCount}
            selectedDeletableCount={selectedDeletableCount}
            visibleVersionIds={visibleVersionIds}
            isAllVisibleSelected={isAllVisibleSelected}
            activeLinkedVersionIds={activeLinkedVersionIds}
            downloadingPdfId={downloadingPdfId}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAllVisible={handleToggleSelectAllVisible}
            onStartSelectionMode={handleStartSelectionMode}
            onExitSelectionMode={handleExitSelectionMode}
            onOpenBulkDeleteModal={handleOpenBulkDeleteModal}
            onOpenDiffModal={handleOpenDiffModal}
            onLoadVersion={handleLoadVersion}
            onDeleteVersion={handleDeleteVersion}
            onDownloadMarkdown={handleDownloadMarkdown}
            onDownloadPdf={handleDownloadPdf}
            onTrackVersion={(v) => handleOpenTrackModal(undefined, v)}
          />
        )}

        {/* Dedicated End-of-Scroll Safe Spacer */}
        <Box sx={{ height: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', sm: 20 }, flexShrink: 0 }} />
      </Box>

      {/* History Dialogs & Modals */}
      <ApplicationsHistoryModals
        isBulkDeleteDialogOpen={isBulkDeleteDialogOpen}
        onCloseBulkDeleteModal={handleCloseBulkDeleteModal}
        onConfirmBulkDelete={handleConfirmBulkDelete}
        selectedProtectedCount={selectedProtectedCount}
        selectedDeletableCount={selectedDeletableCount}
        selectedTotalCount={selectedTotalCount}
        isTrackModalOpen={isTrackModalOpen}
        onCloseTrackModal={handleCloseTrackModal}
        onConfirmAddApplication={handleAddApplication}
        trackPrefillSourceType={trackPrefillSourceType}
        trackPrefillVersion={trackPrefillVersion}
        trackPrefillColumnId={trackPrefillColumnId}
        savedVersions={savedVersions}
        applications={applications}
        kanbanColumns={kanbanColumns}
        isColumnEditOpen={isColumnEditOpen}
        editingColumn={editingColumn}
        onCloseEditColumn={handleCloseEditColumn}
        onSaveColumn={handleSaveColumn}
        isDiffModalOpen={isDiffModalOpen}
        onCloseDiffModal={handleCloseDiffModal}
        diffSelectedVersionId={diffSelectedVersionId}
      />
    </Box>
  );
};
