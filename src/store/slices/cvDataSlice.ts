import { StateCreator } from 'zustand';
import { ResumeStore, CvDataSlice } from '../types';
import {
  BLANK_MASTER_DATA,
  BLANK_TARGET_JOB,
  BLANK_TAILORED_CV,
  BLANK_GAP_REPORT,
  DEMO_MASTER_DATA,
  DEMO_TARGET_JOB,
  DEMO_TAILORED_CV,
  DEMO_GAP_REPORT,
} from '../../constants/templates';
import { DEFAULT_RULES } from '../../core/ai-service';
import {
  extractCandidateName,
  extractTargetCompany,
  extractTargetRole,
  serializeCvDataToMarkdown,
  parseMarkdownToCvData,
  cleanCvData,
  cleanHumanText,
  sanitizeFileName,
} from '../../core/parser';
import { downloadTextFile, buildTimestampedFileName } from '../../utils/fileUtils';
import { CvTranslationVariant, ProfilePhotoConfig } from '../../types/cv';
import { computeContentHash, detectOutdatedSections } from '../../core/ai/cv-translator';

export const createCvDataSlice: StateCreator<ResumeStore, [], [], CvDataSlice> = (set, get) => ({
  masterData: BLANK_MASTER_DATA,
  targetJob: BLANK_TARGET_JOB,
  cvMarkdown: BLANK_TAILORED_CV,
  activeCvData: null,
  gapMarkdown: BLANK_GAP_REPORT,
  coverLetterMarkdown: '',
  coverLetterTone: 'corporate',
  rules: DEFAULT_RULES,
  companyName: '',
  targetRole: '',
  currentBaseLanguage: 'es',
  activeLanguage: 'es',
  activeVersionId: null,
  savedVersions: [],
  applications: [],
  kanbanColumns: [],
  translations: {},
  theme: 'modern-tech',
  palette: 'ocean-blue',
  customColor: null,
  fontFamily: 'Inter',
  spacingDensity: 'standard',
  pageBudget: 1,
  pageFormat: 'A4',
  photo: null,
  lastBackupTimestamp: Date.now(),
  lastModifiedTimestamp: Date.now(),
  unsavedChangesCount: 0,

  recordBackup: () => {
    set({ lastBackupTimestamp: Date.now(), unsavedChangesCount: 0 });
  },

  recordLastModified: () => {
    set({ lastModifiedTimestamp: Date.now() });
  },

  restoreFullSnapshot: (snapshot) => {
    const validUpdates: Partial<ResumeStore> = {};
    if (typeof snapshot.masterData === 'string') {
      validUpdates.masterData = snapshot.masterData
        .replace(
          /^#\s+(?:CV[_-]+)?([^\r\n]+)/m,
          (_, raw) => {
            const isDocHeader = /^(?:Master\s+Data|Master\s+Profile|Perfil\s+Profesional|Curriculum|Resume|Datos\s+Maestros)/i.test(raw);
            return isDocHeader ? `# ${raw}` : `# ${raw.replace(/_/g, ' ').trim()}`;
          }
        )
        .replace(
          /((?:Nombre Completo|Full Name|Candidate Name|Nombre)(?:\s*\/[^*:]*)?(?::\*{0,2}|\*{0,2}:)\s*)([^\r\n]+)/gi,
          (_, prefix, val) => `${prefix}${cleanHumanText(val)}`
        );
    }
    if (typeof snapshot.targetJob === 'string') validUpdates.targetJob = snapshot.targetJob;
    if (typeof snapshot.cvMarkdown === 'string') {
      validUpdates.cvMarkdown = snapshot.cvMarkdown
        .replace(
          /^#\s+(?:CV[_-]+)?([^\r\n]+)/m,
          (_, raw) => {
            const isDocHeader = /^(?:Master\s+Data|Master\s+Profile|Perfil\s+Profesional|Curriculum|Resume)/i.test(raw);
            return isDocHeader ? `# ${raw}` : `# ${raw.replace(/_/g, ' ').trim()}`;
          }
        )
        .replace(
          /((?:Nombre Completo|Full Name|Candidate Name|Nombre)(?:\s*\/[^*:]*)?(?::\*{0,2}|\*{0,2}:)\s*)([^\r\n]+)/gi,
          (_, prefix, val) => `${prefix}${cleanHumanText(val)}`
        );
    }
    if (typeof snapshot.gapMarkdown === 'string') validUpdates.gapMarkdown = snapshot.gapMarkdown;
    if (typeof snapshot.coverLetterMarkdown === 'string') validUpdates.coverLetterMarkdown = snapshot.coverLetterMarkdown;
    if (typeof snapshot.rules === 'string') validUpdates.rules = snapshot.rules;
    if (typeof snapshot.companyName === 'string') validUpdates.companyName = cleanHumanText(snapshot.companyName);
    if (typeof snapshot.targetRole === 'string') validUpdates.targetRole = cleanHumanText(snapshot.targetRole);
    if (typeof snapshot.currentBaseLanguage === 'string') validUpdates.currentBaseLanguage = snapshot.currentBaseLanguage;
    if (typeof snapshot.activeLanguage === 'string') validUpdates.activeLanguage = snapshot.activeLanguage;
    if (snapshot.activeVersionId !== undefined) validUpdates.activeVersionId = snapshot.activeVersionId;
    if (Array.isArray(snapshot.savedVersions)) {
      validUpdates.savedVersions = snapshot.savedVersions.map((v) => ({
        ...v,
        candidateName: v.candidateName ? cleanHumanText(v.candidateName) : v.candidateName,
        companyName: v.companyName ? cleanHumanText(v.companyName) : v.companyName,
      }));
    }
    if (Array.isArray(snapshot.applications)) {
      validUpdates.applications = snapshot.applications.map((a) => ({
        ...a,
        companyName: a.companyName ? cleanHumanText(a.companyName) : a.companyName,
        targetRole: a.targetRole ? cleanHumanText(a.targetRole) : a.targetRole,
      }));
    }
    if (Array.isArray(snapshot.kanbanColumns)) validUpdates.kanbanColumns = snapshot.kanbanColumns;
    if (snapshot.translations && typeof snapshot.translations === 'object') validUpdates.translations = snapshot.translations;
    if (snapshot.theme) validUpdates.theme = snapshot.theme;
    if (snapshot.palette) validUpdates.palette = snapshot.palette;
    if (snapshot.customColor) validUpdates.customColor = snapshot.customColor;
    if (snapshot.fontFamily) validUpdates.fontFamily = snapshot.fontFamily;
    if (snapshot.spacingDensity) validUpdates.spacingDensity = snapshot.spacingDensity;
    if (snapshot.pageBudget) validUpdates.pageBudget = snapshot.pageBudget;
    if (snapshot.pageFormat) validUpdates.pageFormat = snapshot.pageFormat;
    if (snapshot.photo !== undefined) validUpdates.photo = snapshot.photo;
    if (snapshot.providerSettings && typeof snapshot.providerSettings === 'object') {
      validUpdates.providerSettings = snapshot.providerSettings;
    }

    if (
      snapshot.activeCvData &&
      (snapshot.activeCvData.name ||
        snapshot.activeCvData.summary ||
        snapshot.activeCvData.experience?.length ||
        snapshot.activeCvData.skillGroups?.length)
    ) {
      validUpdates.activeCvData = cleanCvData(snapshot.activeCvData);
    } else if (snapshot.cvMarkdown && snapshot.cvMarkdown.trim().length > 30) {
      validUpdates.activeCvData = parseMarkdownToCvData(snapshot.cvMarkdown);
    } else if (snapshot.masterData && snapshot.masterData.trim().length > 30) {
      validUpdates.activeCvData = parseMarkdownToCvData(snapshot.masterData);
    } else {
      validUpdates.activeCvData = null;
    }

    validUpdates.lastModifiedTimestamp = snapshot.lastModifiedTimestamp || Date.now();
    validUpdates.unsavedChangesCount = 0;

    set(validUpdates);
  },

  setMasterData: (val) => {
    const rawVal = typeof val === 'function' ? val(get().masterData) : val;
    let nextVal = rawVal;
    if (typeof nextVal === 'string') {
      const trimmed = nextVal.trim();
      if (
        trimmed.startsWith('{') ||
        trimmed.includes('"cvData"') ||
        /```(?:json)?\s*\{/i.test(trimmed) ||
        (trimmed.includes('"name"') && (trimmed.includes('"experience"') || trimmed.includes('"skills"')))
      ) {
        try {
          const parsed = parseMarkdownToCvData(trimmed);
          if (parsed && (parsed.name || parsed.experience?.length || parsed.skillGroups?.length || parsed.summary)) {
            nextVal = serializeCvDataToMarkdown(parsed);
          }
        } catch {
          // Fall back to original raw string if parse fails
        }
      }
    }
    const extractedRole = extractTargetRole(get().targetJob, nextVal);
    const hasChanged = nextVal !== get().masterData;
    set({
      masterData: nextVal,
      ...(extractedRole ? { targetRole: extractedRole } : {}),
      ...(hasChanged ? { unsavedChangesCount: get().unsavedChangesCount + 1 } : {}),
    });
  },

  setTargetJob: (val) => {
    const nextVal = typeof val === 'function' ? val(get().targetJob) : val;
    const extractedComp = extractTargetCompany(nextVal);
    const extractedRole = extractTargetRole(nextVal, get().masterData);
    set({
      targetJob: nextVal,
      ...(extractedComp ? { companyName: extractedComp.replace(/_/g, ' ') } : {}),
      ...(extractedRole ? { targetRole: extractedRole } : {}),
    });
  },

  setCvMarkdown: (val) => {
    const { cvMarkdown, activeLanguage, currentBaseLanguage, translations } = get();
    const isEditingVariant = Boolean(activeLanguage && currentBaseLanguage && activeLanguage !== currentBaseLanguage);

    if (isEditingVariant && translations[activeLanguage]) {
      const currentVariantText = translations[activeLanguage].cvMarkdown;
      const nextVariantText = typeof val === 'function' ? val(currentVariantText) : val;
      const parsedData = parseMarkdownToCvData(nextVariantText, activeLanguage as any);
      const hasParsedContent = Boolean(
        parsedData && (parsedData.name || parsedData.summary || parsedData.experience?.length || parsedData.skillGroups?.length)
      );
      const prevVariantCvData = translations[activeLanguage].cvData;
      const updatedVariant: CvTranslationVariant = {
        ...translations[activeLanguage],
        cvMarkdown: nextVariantText,
        cvData: hasParsedContent
          ? {
              ...parsedData,
              sidebarSectionOrder: prevVariantCvData?.sidebarSectionOrder,
              mainSectionOrder: prevVariantCvData?.mainSectionOrder,
              sectionPlacement: prevVariantCvData?.sectionPlacement,
            }
          : translations[activeLanguage].cvData,
        updatedAt: new Date().toISOString(),
      };
      set({
        translations: {
          ...translations,
          [activeLanguage]: updatedVariant,
        },
        activeCvData: updatedVariant.cvData || null,
        unsavedChangesCount: get().unsavedChangesCount + 1,
      });
      return;
    }

    const nextVal = typeof val === 'function' ? val(cvMarkdown) : val;
    const hasChanged = nextVal !== cvMarkdown;

    // Check existing translations to flag outdated status
    const currentHash = computeContentHash(nextVal);
    const updatedTranslations: Record<string, CvTranslationVariant> = {};
    let translationsChanged = false;

    for (const [lang, variant] of Object.entries(translations)) {
      if (variant.baseMarkdownHash && variant.baseMarkdownHash !== currentHash) {
        const diff = detectOutdatedSections(cvMarkdown, nextVal);
        const mergedOutdatedSections = Array.from(new Set([...(variant.outdatedSections || []), ...diff.changedSections]));
        updatedTranslations[lang] = {
          ...variant,
          isOutdated: true,
          outdatedSections: mergedOutdatedSections,
        };
        translationsChanged = true;
      } else {
        updatedTranslations[lang] = variant;
      }
    }

    const currentActiveCvData = get().activeCvData;
    let nextActiveCvData = currentActiveCvData;
    if (hasChanged) {
      if (currentActiveCvData) {
        const currentSerialized = serializeCvDataToMarkdown(currentActiveCvData);
        if (currentSerialized.trim() !== nextVal.trim()) {
          const parsed = parseMarkdownToCvData(nextVal);
          nextActiveCvData = {
            ...parsed,
            sidebarSectionOrder: currentActiveCvData.sidebarSectionOrder,
            mainSectionOrder: currentActiveCvData.mainSectionOrder,
            sectionPlacement: currentActiveCvData.sectionPlacement,
          };
        }
      } else if (nextVal && nextVal.trim().length > 30) {
        nextActiveCvData = parseMarkdownToCvData(nextVal);
      }
    }

    set({
      cvMarkdown: nextVal,
      activeCvData: nextActiveCvData,
      ...(translationsChanged ? { translations: updatedTranslations } : {}),
      ...(hasChanged ? { unsavedChangesCount: get().unsavedChangesCount + 1 } : {}),
    });
  },

  setActiveCvData: (data) => {
    const { activeLanguage, currentBaseLanguage, translations } = get();
    const isEditingVariant = Boolean(activeLanguage && currentBaseLanguage && activeLanguage !== currentBaseLanguage);

    if (isEditingVariant && translations[activeLanguage]) {
      const updatedVariant: CvTranslationVariant = {
        ...translations[activeLanguage],
        cvData: data ? { ...data, language: activeLanguage as any } : undefined,
        updatedAt: new Date().toISOString(),
      };
      set({
        translations: {
          ...translations,
          [activeLanguage]: updatedVariant,
        },
        activeCvData: data ? { ...data, language: activeLanguage as any } : null,
      });
      return;
    }

    const baseData = data
      ? { ...data, language: (data.language || currentBaseLanguage || 'es') as any }
      : null;
    set({ activeCvData: baseData });
  },

  setGapMarkdown: (val) => {
    const nextVal = typeof val === 'function' ? val(get().gapMarkdown) : val;
    set({ gapMarkdown: nextVal });
  },

  setCoverLetterMarkdown: (val) => {
    const nextVal = typeof val === 'function' ? val(get().coverLetterMarkdown) : val;
    set({ coverLetterMarkdown: nextVal });
  },

  setCoverLetterTone: (coverLetterTone) => {
    set({ coverLetterTone });
  },

  setRules: (val) => {
    const nextVal = typeof val === 'function' ? val(get().rules) : val;
    set({ rules: nextVal });
  },

  setCompanyName: (companyName: string) => {
    set({ companyName });
  },

  setTargetRole: (targetRole: string) => {
    set({ targetRole });
  },

  setCurrentBaseLanguage: (currentBaseLanguage: string) => {
    set({ currentBaseLanguage });
  },

  setActiveLanguage: (activeLanguage: string) => {
    const { currentBaseLanguage, cvMarkdown, translations } = get();
    if (activeLanguage === currentBaseLanguage) {
      const healedBase = cvMarkdown && cvMarkdown.trim().length > 30
        ? parseMarkdownToCvData(cvMarkdown, (currentBaseLanguage || 'es') as any)
        : null;
      set({ activeLanguage, activeCvData: healedBase });
      return;
    }
    const variant = translations[activeLanguage];
    if (variant) {
      const variantData = variant.cvData || (variant.cvMarkdown && variant.cvMarkdown.trim().length > 30
        ? parseMarkdownToCvData(variant.cvMarkdown, activeLanguage as any)
        : null);
      set({ activeLanguage, activeCvData: variantData });
      return;
    }
    set({ activeLanguage });
  },

  setActiveVersionId: (activeVersionId: string | null) => {
    set({ activeVersionId });
  },

  setTranslations: (translations: Record<string, CvTranslationVariant>) => {
    set({ translations });
  },

  saveTranslationVariant: (variant: CvTranslationVariant) => {
    const current = get().translations;
    set({
      translations: {
        ...current,
        [variant.language]: variant,
      },
      activeLanguage: variant.language,
      activeCvData: variant.cvData || null,
    });
  },

  deleteTranslationVariant: (language: string) => {
    const { translations, activeLanguage, currentBaseLanguage, cvMarkdown } = get();
    const next = { ...translations };
    delete next[language];
    const isDeletingActive = activeLanguage === language;
    const targetLang = isDeletingActive ? currentBaseLanguage : activeLanguage;
    const healedBase = isDeletingActive && cvMarkdown && cvMarkdown.trim().length > 30
      ? parseMarkdownToCvData(cvMarkdown, (currentBaseLanguage || 'es') as any)
      : null;
    set({
      translations: next,
      ...(isDeletingActive ? { activeLanguage: targetLang, activeCvData: healedBase } : {}),
    });
  },

  handleLoadDemoProfile: () => {
    set({
      masterData: DEMO_MASTER_DATA,
      targetJob: DEMO_TARGET_JOB,
      cvMarkdown: DEMO_TAILORED_CV,
      gapMarkdown: DEMO_GAP_REPORT,
      companyName: 'Stripe',
      targetRole: 'Senior Frontend Engineer',
      currentBaseLanguage: 'en',
      activeLanguage: 'en',
      translations: {},
    });
  },

  handleStartBlank: () => {
    set({
      masterData: BLANK_MASTER_DATA,
      targetJob: BLANK_TARGET_JOB,
      cvMarkdown: BLANK_TAILORED_CV,
      activeCvData: null,
      activeVersionId: null,
      gapMarkdown: BLANK_GAP_REPORT,
      companyName: '',
      targetRole: '',
      currentBaseLanguage: 'es',
      activeLanguage: 'es',
      translations: {},
    });
  },

  handleResetWorkspace: () => {
    set({
      masterData: BLANK_MASTER_DATA,
      targetJob: BLANK_TARGET_JOB,
      cvMarkdown: BLANK_TAILORED_CV,
      activeCvData: null,
      activeVersionId: null,
      gapMarkdown: BLANK_GAP_REPORT,
      companyName: '',
      targetRole: '',
      currentBaseLanguage: 'es',
      activeLanguage: 'es',
      translations: {},
      theme: 'modern-tech',
      palette: 'corporate-blue',
      customColor: '#1d4ed8',
      fontFamily: 'inter',
      spacingDensity: 'standard',
      activeTab: 'landing',
      wizardStep: 'profile',
    });
  },

  handleDownloadCvMarkdown: () => {
    const { masterData, targetJob, companyName, cvMarkdown, activeLanguage, currentBaseLanguage, translations } = get();
    const candidateName = extractCandidateName(masterData, 'Candidate');
    const targetComp = companyName || extractTargetCompany(targetJob, 'Target');
    const isVariant = activeLanguage && currentBaseLanguage && activeLanguage !== currentBaseLanguage && translations[activeLanguage];
    const content = isVariant ? translations[activeLanguage].cvMarkdown : cvMarkdown;
    const langSuffix = isVariant ? `_${activeLanguage.toUpperCase()}` : '';
    const baseName = `CV_${sanitizeFileName(candidateName)}_${sanitizeFileName(targetComp)}${langSuffix}`;
    const fileName = buildTimestampedFileName(baseName, 'md');

    downloadTextFile(content, fileName);
    get().recordBackup();
  },

  handleUseMasterDataAsCv: () => {
    const { masterData, cvMarkdown } = get();
    // If cvMarkdown is empty, initialize it from masterData
    if (!cvMarkdown || cvMarkdown.trim().length <= 30) {
      const parsed = parseMarkdownToCvData(masterData);
      set({
        cvMarkdown: masterData,
        activeCvData: parsed,
        unsavedChangesCount: get().unsavedChangesCount + 1,
      });
    }
    set({ wizardStep: 'preview' });
  },

  syncTransversalPersonalDetail: (field, value) => {
    if (field === 'photo') {
      get().setProfilePhoto((value as ProfilePhotoConfig) || null);
    }
    const { masterData, setMasterData } = get();
    if (!masterData || typeof masterData !== 'string') return;

    try {
      const parsedMaster = parseMarkdownToCvData(masterData);
      if (!parsedMaster) return;

      const cleanVal = typeof value === 'string' ? value.trim() || undefined : value;
      const updatedMaster = {
        ...parsedMaster,
        [field]: cleanVal,
        ...(field === 'photo' ? { photo: (value as ProfilePhotoConfig) || undefined } : {}),
      };
      const serialized = serializeCvDataToMarkdown(updatedMaster, (updatedMaster.language || 'es') as any);
      if (serialized && serialized.trim().length > 20) {
        setMasterData(serialized);
      }
    } catch (err) {
      console.warn('Failed to sync transversal personal detail to master CV:', err);
    }
  },
});
