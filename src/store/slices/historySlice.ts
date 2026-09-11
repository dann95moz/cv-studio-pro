import { StateCreator } from 'zustand';
import { ResumeStore, HistorySlice } from '../types';
import { GeneratedCvVersion, ApplicationItem, KanbanColumn, DEFAULT_KANBAN_COLUMNS, CvTranslationVariant } from '../../types/cv';
import {
  extractCandidateName,
  extractTargetCompany,
  extractTargetRole,
} from '../../core/parser';
import { auditCvContent } from '../../core/audit-engine';
import { extractGapInfo } from '../../utils/sanitize';

export const createHistorySlice: StateCreator<ResumeStore, [], [], HistorySlice> = (set, get) => ({
  savedVersions: [],
  applications: [],
  kanbanColumns: DEFAULT_KANBAN_COLUMNS,

  handleSaveCurrentVersion: (customTitle?: string) => {
    const {
      masterData,
      companyName,
      targetJob,
      targetRole,
      gapMarkdown,
      cvMarkdown,
      theme,
      palette,
      pageBudget,
      photo,
      savedVersions,
      currentBaseLanguage,
      activeLanguage,
      translations,
      activeVersionId,
      activeCvData,
    } = get();

    const candName = (activeCvData?.name ? activeCvData.name.replace(/_/g, ' ') : extractCandidateName(masterData, 'Candidate')).trim();
    const comp = customTitle || companyName || extractTargetCompany(targetJob, 'Target Company');
    const role = targetRole || extractTargetRole(targetJob, masterData, '') || '';
    const baseLang = currentBaseLanguage || 'es';

    // If activeVersionId is loaded and matches an existing version, update that version
    const existingIndex = activeVersionId ? savedVersions.findIndex((v) => v.id === activeVersionId) : -1;

    // Duplicate prevention: if an identical version already exists and no activeVersionId, avoid creating a redundant clone
    if (existingIndex === -1) {
      const existingDuplicate = savedVersions.find(
        (v) =>
          v.cvMarkdown.trim() === cvMarkdown.trim() &&
          v.companyName.trim().toLowerCase() === comp.trim().toLowerCase() &&
          v.targetRole.trim().toLowerCase() === role.trim().toLowerCase() &&
          v.theme === theme &&
          v.palette === palette &&
          v.pageBudget === pageBudget &&
          JSON.stringify(v.translations || {}) === JSON.stringify(translations || {})
      );

      if (existingDuplicate) {
        set({ activeVersionId: existingDuplicate.id });
        return existingDuplicate.id;
      }
    }

    const { matchScore } = extractGapInfo(gapMarkdown, targetJob);
    const audit = auditCvContent(activeCvData || cvMarkdown, targetJob, masterData);
    const versionId = existingIndex !== -1 && activeVersionId ? activeVersionId : `cv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const isExisting = existingIndex !== -1;
    const newVersion: GeneratedCvVersion = {
      id: versionId,
      createdAt: isExisting ? savedVersions[existingIndex].createdAt : new Date().toISOString(),
      candidateName: candName,
      companyName: comp,
      targetRole: role,
      matchScore: matchScore > 0 ? matchScore : (audit.overallScore ? Math.round(audit.overallScore * 10) : 0),
      qualityScore: audit.overallScore || 0,
      theme,
      palette,
      pageBudget,
      cvMarkdown,
      cvData: activeCvData || undefined,
      gapMarkdown,
      targetJobSnippet: targetJob.slice(0, 280),
      photo: photo || undefined,
      baseLanguage: baseLang,
      translations: translations || {},
      activeLanguage: activeLanguage || baseLang,
      isGeneric: isExisting ? savedVersions[existingIndex].isGeneric : false,
      isPinned: isExisting ? savedVersions[existingIndex].isPinned : false,
    };

    if (existingIndex !== -1) {
      const updatedVersions = [...savedVersions];
      updatedVersions[existingIndex] = newVersion;
      set({ savedVersions: updatedVersions });
    } else {
      set({
        savedVersions: [newVersion, ...savedVersions.filter((v) => v.id !== newVersion.id)],
        activeVersionId: versionId,
      });
    }

    return versionId;
  },

  handleSaveAsGeneric: (customTitle?: string) => {
    const {
      masterData,
      targetJob,
      targetRole,
      gapMarkdown,
      cvMarkdown,
      theme,
      palette,
      pageBudget,
      photo,
      savedVersions,
      currentBaseLanguage,
      activeLanguage,
      translations,
      activeCvData,
    } = get();

    const candName = (activeCvData?.name ? activeCvData.name.replace(/_/g, ' ') : extractCandidateName(masterData, 'Candidate')).trim();
    const comp = customTitle || 'CV Genérico';
    const role = targetRole || activeCvData?.title || 'Perfil Base';
    const baseLang = currentBaseLanguage || 'es';

    const { matchScore } = extractGapInfo(gapMarkdown, targetJob);
    const audit = auditCvContent(activeCvData || cvMarkdown, targetJob, masterData);
    const versionId = `cv_generic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newGenericVersion: GeneratedCvVersion = {
      id: versionId,
      createdAt: new Date().toISOString(),
      candidateName: candName,
      companyName: comp,
      targetRole: role,
      matchScore: matchScore > 0 ? matchScore : (audit.overallScore ? Math.round(audit.overallScore * 10) : 0),
      qualityScore: audit.overallScore || 0,
      theme,
      palette,
      pageBudget,
      cvMarkdown,
      cvData: activeCvData || undefined,
      gapMarkdown,
      targetJobSnippet: targetJob.slice(0, 280),
      photo: photo || undefined,
      baseLanguage: baseLang,
      translations: translations || {},
      activeLanguage: activeLanguage || baseLang,
      isGeneric: true,
      isPinned: true,
    };

    // Unpin other versions and place this pinned version at the front
    const otherVersions = savedVersions.map((v) => ({ ...v, isPinned: false }));
    set({
      savedVersions: [newGenericVersion, ...otherVersions],
      activeVersionId: versionId,
    });

    return versionId;
  },

  handlePinAsGeneric: (versionId: string) => {
    set({
      savedVersions: get().savedVersions.map((v) => ({
        ...v,
        isPinned: v.id === versionId,
        isGeneric: v.id === versionId ? true : v.isGeneric,
      })),
    });
  },

  handleUnpinGeneric: (versionId: string) => {
    set({
      savedVersions: get().savedVersions.map((v) =>
        v.id === versionId ? { ...v, isPinned: false } : v
      ),
    });
  },

  handleLoadVersion: (id: string) => {
    const found = get().savedVersions.find((v) => v.id === id);
    if (found) {
      const baseLang = found.baseLanguage || 'es';
      const activeLang = found.activeLanguage || baseLang;
      set({
        cvMarkdown: found.cvMarkdown,
        activeCvData: found.cvData || null,
        ...(found.gapMarkdown ? { gapMarkdown: found.gapMarkdown } : {}),
        ...(found.companyName ? { companyName: found.companyName } : {}),
        ...(found.targetRole ? { targetRole: found.targetRole } : {}),
        ...(found.theme ? { theme: found.theme } : {}),
        ...(found.palette ? { palette: found.palette } : {}),
        ...(found.pageBudget ? { pageBudget: found.pageBudget } : {}),
        photo: found.photo || null,
        currentBaseLanguage: baseLang,
        activeLanguage: activeLang,
        translations: found.translations || {},
        activeVersionId: found.id,
        activeTab: 'wizard',
        wizardStep: 'preview',
      });
    }
  },

  handleDeleteVersion: (id: string) => {
    set({
      savedVersions: get().savedVersions.filter((v) => v.id !== id),
    });
  },

  handleDeleteMultipleVersions: (ids: string[]) => {
    const { applications, savedVersions } = get();
    // Protect versions that are linked to active (non-archived) Kanban applications
    const activeApps = applications.filter((app) => !app.isArchived);
    const protectedIds = new Set(
      activeApps.map((app) => app.appliedVersionId).filter((id): id is string => Boolean(id))
    );

    const idsToDelete = new Set(ids.filter((id) => !protectedIds.has(id)));
    set({
      savedVersions: savedVersions.filter((v) => !idsToDelete.has(v.id)),
    });
  },

  handleAddApplication: (appData) => {
    const { savedVersions, applications, kanbanColumns } = get();
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const attachedVersion = appData.appliedVersionId
      ? savedVersions.find((v) => v.id === appData.appliedVersionId)
      : undefined;
    const targetColId = appData.columnId || (kanbanColumns[0]?.id ?? 'applied');

    const newApp: ApplicationItem = {
      id: appId,
      companyName: appData.companyName.trim(),
      targetRole: appData.targetRole.trim(),
      columnId: targetColId,
      appliedVersionId: appData.appliedVersionId,
      isExternalCv: appData.isExternalCv ?? (!appData.appliedVersionId),
      externalCvTitle: appData.externalCvTitle,
      contactChannel: appData.contactChannel,
      contactPerson: appData.contactPerson,
      jobUrl: appData.jobUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appliedDate: new Date().toISOString(),
      matchScore: attachedVersion?.matchScore ?? 0,
      qualityScore: attachedVersion?.qualityScore ?? 0,
      notes: appData.notes || '',
      salary: appData.salary || '',
      location: appData.location || '',
      isArchived: false,
    };

    set({
      applications: [newApp, ...applications],
    });

    return appId;
  },

  handleUpdateApplication: (id, updates) => {
    set({
      applications: get().applications.map((app) =>
        app.id === id
          ? {
              ...app,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleDeleteApplication: (id) => {
    set({
      applications: get().applications.filter((app) => app.id !== id),
    });
  },

  handleMoveApplication: (id, targetColumnId, newIndex) => {
    const currentApps = [...get().applications];
    const appIndex = currentApps.findIndex((a) => a.id === id);
    if (appIndex === -1) return;

    const [movedApp] = currentApps.splice(appIndex, 1);
    const updatedApp: ApplicationItem = {
      ...movedApp,
      columnId: targetColumnId,
      updatedAt: new Date().toISOString(),
    };

    if (typeof newIndex === 'number' && newIndex >= 0) {
      currentApps.splice(newIndex, 0, updatedApp);
    } else {
      currentApps.unshift(updatedApp);
    }

    set({ applications: currentApps });
  },

  handleArchiveApplication: (id) => {
    set({
      applications: get().applications.map((app) =>
        app.id === id
          ? {
              ...app,
              isArchived: true,
              archivedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleUnarchiveApplication: (id) => {
    set({
      applications: get().applications.map((app) =>
        app.id === id
          ? {
              ...app,
              isArchived: false,
              archivedAt: undefined,
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleArchiveColumn: (columnId) => {
    set({
      applications: get().applications.map((app) =>
        app.columnId === columnId && !app.isArchived
          ? {
              ...app,
              isArchived: true,
              archivedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleSetAttachedVersion: (applicationId, versionId) => {
    const version = get().savedVersions.find((v) => v.id === versionId);
    set({
      applications: get().applications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              appliedVersionId: versionId,
              matchScore: version?.matchScore ?? app.matchScore,
              qualityScore: version?.qualityScore ?? app.qualityScore,
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleSetApplicationLanguage: (applicationId, language) => {
    set({
      applications: get().applications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              selectedLanguage: language,
              updatedAt: new Date().toISOString(),
            }
          : app
      ),
    });
  },

  handleSaveVersionTranslation: (versionId, translation) => {
    set({
      savedVersions: get().savedVersions.map((v) => {
        if (v.id !== versionId) return v;
        const currentTrans = v.translations || {};
        return {
          ...v,
          translations: {
            ...currentTrans,
            [translation.language]: translation,
          },
        };
      }),
    });
  },

  handleDeleteVersionTranslation: (versionId, language) => {
    set({
      savedVersions: get().savedVersions.map((v) => {
        if (v.id !== versionId) return v;
        const currentTrans = { ...(v.translations || {}) };
        delete currentTrans[language];
        return {
          ...v,
          translations: currentTrans,
        };
      }),
    });
  },

  handleAddColumn: (title, color) => {
    const newColId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCol: KanbanColumn = {
      id: newColId,
      title: title.trim(),
      color: color || '#0284c7',
    };
    set({
      kanbanColumns: [...get().kanbanColumns, newCol],
    });
  },

  handleUpdateColumn: (columnId, updates) => {
    set({
      kanbanColumns: get().kanbanColumns.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      ),
    });
  },

  handleDeleteColumn: (columnId, fallbackColumnId) => {
    const columns = get().kanbanColumns.filter((c) => c.id !== columnId);
    const targetColId = fallbackColumnId || columns[0]?.id || 'applied';

    // Reassign existing applications in this column to targetColId
    const updatedApps = get().applications.map((app) =>
      app.columnId === columnId ? { ...app, columnId: targetColId } : app
    );

    set({
      kanbanColumns: columns,
      applications: updatedApps,
    });
  },

  handleReorderColumns: (columnIds) => {
    const currentCols = get().kanbanColumns;
    const sorted = columnIds
      .map((id) => currentCols.find((c) => c.id === id))
      .filter((c): c is KanbanColumn => Boolean(c));
    set({ kanbanColumns: sorted });
  },

  handleResetKanbanColumns: () => {
    set({ kanbanColumns: DEFAULT_KANBAN_COLUMNS });
  },
});

