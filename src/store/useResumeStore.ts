import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeStore } from './types';
import { createUiSlice } from './slices/uiSlice';
import { createCvDataSlice } from './slices/cvDataSlice';
import { createDesignSlice } from './slices/designSlice';
import { createAiSlice } from './slices/aiSlice';
import { createHistorySlice } from './slices/historySlice';
import {
  StudioTab,
  ThemeId,
  PaletteId,
  FontFamilyId,
  SpacingDensity,
  AIProviderSettings,
  GeneratedCvVersion,
  WizardStep,
} from '../types/cv';

/**
 * Migration helper to import legacy localStorage keys into the unified Zustand store
 */
const migrateLegacyLocalStorage = (): Partial<ResumeStore> => {
  if (typeof window === 'undefined') return {};

  const legacyData: Partial<ResumeStore> = {};

  try {
    // Only migrate if legacy keys exist and unified key doesn't
    const alreadyMigrated = localStorage.getItem('cv_studio_store');
    if (alreadyMigrated) return {};

    const loadJson = <T>(key: string): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
      } catch {
        return (localStorage.getItem(key) as unknown as T) || null;
      }
    };

    const master = loadJson<string>('cv_master_data');
    if (master) legacyData.masterData = master;

    const targetJob = loadJson<string>('cv_target_job');
    if (targetJob) legacyData.targetJob = targetJob;

    const cvMarkdown = loadJson<string>('cv_tailored_markdown');
    if (cvMarkdown) legacyData.cvMarkdown = cvMarkdown;

    const gapMarkdown = loadJson<string>('cv_gap_markdown');
    if (gapMarkdown) legacyData.gapMarkdown = gapMarkdown;

    const rules = loadJson<string>('cv_rules_markdown');
    if (rules) legacyData.rules = rules;

    const company = loadJson<string>('cv_company_name');
    if (company) legacyData.companyName = company;

    const role = loadJson<string>('cv_target_role');
    if (role) legacyData.targetRole = role;

    const budget = loadJson<1 | 2>('cv_page_budget');
    if (budget) legacyData.pageBudget = budget;

    const theme = loadJson<ThemeId>('cv_theme');
    if (theme) legacyData.theme = theme;

    const palette = loadJson<PaletteId>('cv_palette');
    if (palette) legacyData.palette = palette;

    const customColor = loadJson<string>('cv_custom_color');
    if (customColor) legacyData.customColor = customColor;

    const font = loadJson<FontFamilyId>('cv_font_family');
    if (font) legacyData.fontFamily = font;

    const density = loadJson<SpacingDensity>('cv_spacing_density');
    if (density) legacyData.spacingDensity = density;

    const aiSettings = loadJson<AIProviderSettings>('cv_ai_settings');
    if (aiSettings) legacyData.providerSettings = aiSettings;

    const savedVersions = loadJson<GeneratedCvVersion[]>('cv_saved_versions');
    if (savedVersions && Array.isArray(savedVersions)) legacyData.savedVersions = savedVersions;

    const activeTab = loadJson<StudioTab>('cv_active_tab');
    if (activeTab) legacyData.activeTab = activeTab;

    const wizardStep = loadJson<WizardStep>('cv_wizard_step');
    if (wizardStep) legacyData.wizardStep = wizardStep;
  } catch (err) {
    console.warn('Failed to migrate legacy localStorage data:', err);
  }

  return legacyData;
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createCvDataSlice(...a),
      ...createDesignSlice(...a),
      ...createAiSlice(...a),
      ...createHistorySlice(...a),
      ...migrateLegacyLocalStorage(),
    }),
    {
      name: 'cv_studio_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        wizardStep: state.wizardStep,
        masterData: state.masterData,
        targetJob: state.targetJob,
        cvMarkdown: state.cvMarkdown,
        activeCvData: state.activeCvData,
        gapMarkdown: state.gapMarkdown,
        rules: state.rules,
        companyName: state.companyName,
        targetRole: state.targetRole,
        currentBaseLanguage: state.currentBaseLanguage,
        activeLanguage: state.activeLanguage,
        activeVersionId: state.activeVersionId,
        translations: state.translations,
        lastBackupTimestamp: state.lastBackupTimestamp,
        lastModifiedTimestamp: state.lastModifiedTimestamp,
        unsavedChangesCount: state.unsavedChangesCount,
        pageBudget: state.pageBudget,
        theme: state.theme,
        palette: state.palette,
        customColor: state.customColor,
        fontFamily: state.fontFamily,
        spacingDensity: state.spacingDensity,
        providerSettings: state.providerSettings,
        savedVersions: state.savedVersions,
        applications: state.applications,
        kanbanColumns: state.kanbanColumns,
      }),
    }
  )
);

// Synchronize window.location.hash with activeTab on back/forward browser navigation
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') as StudioTab;
    const validTabs: StudioTab[] = ['landing', 'wizard', 'editor', 'preview', 'audit', 'gap', 'history', 'settings'];
    if (validTabs.includes(hash)) {
      const current = useResumeStore.getState().activeTab;
      if (current !== hash) {
        useResumeStore.setState({ activeTab: hash });
      }
    }
  });
}
