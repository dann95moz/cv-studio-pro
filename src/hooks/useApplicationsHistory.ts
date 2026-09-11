import { useState, useMemo, useCallback } from 'react';
import { useResumeStore } from '../store';
import { GeneratedCvVersion, KanbanColumn } from '../types/cv';
import { downloadTextFile, buildTimestampedFileName } from '../utils/fileUtils';

export function useApplicationsHistory() {
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const applications = useResumeStore((s) => s.applications || []);
  const kanbanColumns = useResumeStore((s) => s.kanbanColumns || []);

  const handleLoadVersion = useResumeStore((s) => s.handleLoadVersion);
  const handleDeleteVersion = useResumeStore((s) => s.handleDeleteVersion);
  const handleDeleteMultipleVersions = useResumeStore((s) => s.handleDeleteMultipleVersions);
  const handleAddApplication = useResumeStore((s) => s.handleAddApplication);
  const handleDeleteApplication = useResumeStore((s) => s.handleDeleteApplication);
  const handleMoveApplication = useResumeStore((s) => s.handleMoveApplication);
  const handleArchiveApplication = useResumeStore((s) => s.handleArchiveApplication);
  const handleUnarchiveApplication = useResumeStore((s) => s.handleUnarchiveApplication);
  const handleArchiveColumn = useResumeStore((s) => s.handleArchiveColumn);
  const handleSetAttachedVersion = useResumeStore((s) => s.handleSetAttachedVersion);
  const handleSetApplicationLanguage = useResumeStore((s) => s.handleSetApplicationLanguage);
  const handleAddColumn = useResumeStore((s) => s.handleAddColumn);
  const handleUpdateColumn = useResumeStore((s) => s.handleUpdateColumn);
  const handleDeleteColumn = useResumeStore((s) => s.handleDeleteColumn);

  const setActiveTab = useResumeStore((s) => s.setActiveTab);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);
  const setCompanyName = useResumeStore((s) => s.setCompanyName);
  const setTargetRole = useResumeStore((s) => s.setTargetRole);

  const [activeView, setActiveView] = useState<'grid' | 'board' | 'archived' | 'versions'>('grid');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Selection mode states for version history
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState<boolean>(false);

  // Dialog states
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackPrefillColumnId, setTrackPrefillColumnId] = useState<string | undefined>();
  const [trackPrefillVersion, setTrackPrefillVersion] = useState<GeneratedCvVersion | undefined>();
  const [trackPrefillSourceType, setTrackPrefillSourceType] = useState<'internal' | 'external' | undefined>();
  const [isColumnEditOpen, setIsColumnEditOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);

  // Diff modal states
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [diffSelectedVersionId, setDiffSelectedVersionId] = useState<string | undefined>(undefined);

  // Filtered lists and stats
  const activeApplications = useMemo(() => applications.filter((app) => !app.isArchived), [applications]);
  const archivedApplications = useMemo(() => applications.filter((app) => app.isArchived), [applications]);

  const totalActive = activeApplications.length;
  const totalArchived = archivedApplications.length;
  const totalInterviews = activeApplications.filter(
    (a) => a.columnId === 'interview' || a.columnId === 'tech_test'
  ).length;
  const totalOffers = activeApplications.filter((a) => a.columnId === 'offer').length;

  const avgMatchScore = useMemo(() => {
    return totalActive > 0
      ? Math.round(
          activeApplications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / totalActive
        )
      : 0;
  }, [activeApplications, totalActive]);

  // Filtered saved versions for the "versions" tab
  const filteredVersions = useMemo(() => {
    return savedVersions.filter(
      (v) =>
        v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.targetRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedVersions, searchQuery]);

  // Set of version IDs linked to active (non-archived) Kanban applications
  const activeLinkedVersionIds = useMemo(() => {
    return new Set(
      activeApplications
        .map((app) => app.appliedVersionId)
        .filter((id): id is string => Boolean(id))
    );
  }, [activeApplications]);

  // Visible version IDs based on search filter
  const visibleVersionIds = useMemo(() => filteredVersions.map((v) => v.id), [filteredVersions]);

  // Selected counts
  const selectedTotalCount = selectedVersionIds.length;
  const selectedProtectedCount = useMemo(() => {
    return selectedVersionIds.filter((id) => activeLinkedVersionIds.has(id)).length;
  }, [selectedVersionIds, activeLinkedVersionIds]);
  const selectedDeletableCount = selectedTotalCount - selectedProtectedCount;

  const isAllVisibleSelected =
    visibleVersionIds.length > 0 &&
    visibleVersionIds.every((id) => selectedVersionIds.includes(id));

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedVersionIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAllVisible = useCallback(() => {
    if (isAllVisibleSelected) {
      setSelectedVersionIds((prev) => prev.filter((id) => !visibleVersionIds.includes(id)));
    } else {
      setSelectedVersionIds((prev) => Array.from(new Set([...prev, ...visibleVersionIds])));
    }
  }, [isAllVisibleSelected, visibleVersionIds]);

  const handleStartSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedVersionIds([]);
  }, []);

  const handleConfirmBulkDelete = useCallback(() => {
    handleDeleteMultipleVersions(selectedVersionIds);
    setIsBulkDeleteDialogOpen(false);
    handleExitSelectionMode();
  }, [handleDeleteMultipleVersions, selectedVersionIds, handleExitSelectionMode]);

  const handleDownloadMarkdown = useCallback((v: GeneratedCvVersion) => {
    const candidate = v.candidateName.replace(/\s+/g, '_');
    const company = v.companyName.replace(/\s+/g, '_');
    const versionDate = v.createdAt ? new Date(v.createdAt) : undefined;
    const baseName = `CV_${candidate}_${company}`;
    const fileName = buildTimestampedFileName(baseName, 'md', versionDate);
    downloadTextFile(v.cvMarkdown, fileName);
  }, []);

  const handleDownloadPdf = useCallback(async (v: GeneratedCvVersion, language?: string) => {
    setDownloadingPdfId(v.id);
    try {
      const { generateVersionDirectPdf } = await import('../core/browser-pdf-generator');
      await generateVersionDirectPdf(v, { language });
    } catch (error) {
      console.error('Failed to generate version PDF:', error);
    } finally {
      setDownloadingPdfId(null);
    }
  }, []);

  const handleOpenTrackModal = useCallback((columnId?: string, version?: GeneratedCvVersion, initialSourceType?: 'internal' | 'external') => {
    setTrackPrefillColumnId(columnId);
    setTrackPrefillVersion(version);
    setTrackPrefillSourceType(initialSourceType);
    setIsTrackModalOpen(true);
  }, []);

  const handleCloseTrackModal = useCallback(() => {
    setIsTrackModalOpen(false);
    setTrackPrefillColumnId(undefined);
    setTrackPrefillVersion(undefined);
    setTrackPrefillSourceType(undefined);
  }, []);

  const handleOpenEditColumn = useCallback((col?: KanbanColumn) => {
    setEditingColumn(col || null);
    setIsColumnEditOpen(true);
  }, []);

  const handleCloseEditColumn = useCallback(() => {
    setIsColumnEditOpen(false);
    setEditingColumn(null);
  }, []);

  const handleSaveColumn = useCallback((title: string, color: string) => {
    if (editingColumn) {
      handleUpdateColumn(editingColumn.id, { title, color });
    } else {
      handleAddColumn(title, color);
    }
    setIsColumnEditOpen(false);
    setEditingColumn(null);
  }, [editingColumn, handleUpdateColumn, handleAddColumn]);

  const handleOpenDiffModal = useCallback((versionId?: string) => {
    setDiffSelectedVersionId(versionId);
    setIsDiffModalOpen(true);
  }, []);

  const handleCloseDiffModal = useCallback(() => {
    setIsDiffModalOpen(false);
    setDiffSelectedVersionId(undefined);
  }, []);

  const handleOpenBulkDeleteModal = useCallback(() => {
    setIsBulkDeleteDialogOpen(true);
  }, []);

  const handleCloseBulkDeleteModal = useCallback(() => {
    setIsBulkDeleteDialogOpen(false);
  }, []);

  const handleStartNewResume = useCallback(() => {
    setActiveTab('wizard');
    setWizardStep('target');
  }, [setActiveTab, setWizardStep]);

  const handleTailorForApplication = useCallback((app: import('../types/cv').ApplicationItem) => {
    if (app.companyName) setCompanyName(app.companyName);
    if (app.targetRole) setTargetRole(app.targetRole);
    setActiveTab('wizard');
    setWizardStep('target');
  }, [setCompanyName, setTargetRole, setActiveTab, setWizardStep]);

  const handleViewChange = useCallback((view: 'grid' | 'board' | 'archived' | 'versions') => {
    setActiveView(view);
    if (view !== 'versions' && isSelectionMode) {
      handleExitSelectionMode();
    }
  }, [isSelectionMode, handleExitSelectionMode]);

  return {
    savedVersions,
    applications,
    kanbanColumns,
    activeApplications,
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
  };
}
