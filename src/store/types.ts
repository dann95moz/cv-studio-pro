import {
  ThemeId,
  PaletteId,
  FontFamilyId,
  SpacingDensity,
  PageFormat,
  ProfilePhotoConfig,
  ProfilePhotoCrop,
  StudioTab,
  WizardStep,
  AIProviderSettings,
  GeneratedCvVersion,
  KanbanColumn,
  ApplicationItem,
  CvTranslationVariant,
  CVData,
} from '../types/cv';

export interface GlobalNotification {
  open: boolean;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export interface UiSlice {
  activeTab: StudioTab;
  wizardStep: WizardStep;
  globalNotification: GlobalNotification | null;
  setActiveTab: (tab: StudioTab) => void;
  setWizardStep: (step: WizardStep) => void;
  showNotification: (notif: Omit<GlobalNotification, 'open'>) => void;
  hideNotification: () => void;
  handleStartWizard: () => void;
  handleExploreDemo: () => void;
}


export interface CvDataSlice {
  masterData: string;
  targetJob: string;
  cvMarkdown: string;
  activeCvData: CVData | null;
  gapMarkdown: string;
  coverLetterMarkdown: string;
  coverLetterTone: 'corporate' | 'startup' | 'leadership';
  rules: string;
  companyName: string;
  targetRole: string;
  lastBackupTimestamp: number;
  lastModifiedTimestamp?: number;
  unsavedChangesCount: number;
  recordBackup: () => void;
  recordLastModified: () => void;
  restoreFullSnapshot: (snapshotData: Partial<ResumeStore>) => void;
  setMasterData: (val: string | ((prev: string) => string)) => void;
  setTargetJob: (val: string | ((prev: string) => string)) => void;
  setCvMarkdown: (val: string | ((prev: string) => string)) => void;
  setActiveCvData: (data: CVData | null) => void;
  setGapMarkdown: (val: string | ((prev: string) => string)) => void;
  setCoverLetterMarkdown: (val: string | ((prev: string) => string)) => void;
  setCoverLetterTone: (val: 'corporate' | 'startup' | 'leadership') => void;
  setRules: (val: string | ((prev: string) => string)) => void;
  setCompanyName: (val: string) => void;
  setTargetRole: (val: string) => void;
  currentBaseLanguage: string;
  activeLanguage: string;
  activeVersionId: string | null;
  translations: Record<string, CvTranslationVariant>;
  setCurrentBaseLanguage: (lang: string) => void;
  setActiveLanguage: (lang: string) => void;
  setActiveVersionId: (id: string | null) => void;
  setTranslations: (translations: Record<string, CvTranslationVariant>) => void;
  saveTranslationVariant: (variant: CvTranslationVariant) => void;
  deleteTranslationVariant: (language: string) => void;
  handleLoadDemoProfile: () => void;
  handleStartBlank: () => void;
  handleResetWorkspace: () => void;
  handleDownloadCvMarkdown: () => void;
}

export interface DesignSlice {
  pageBudget: 1 | 2;
  pageFormat: PageFormat;
  theme: ThemeId;
  palette: PaletteId;
  customColor: string;
  fontFamily: FontFamilyId;
  spacingDensity: SpacingDensity;
  photo: ProfilePhotoConfig | null;
  setPageBudget: (val: 1 | 2) => void;
  setPageFormat: (val: PageFormat) => void;
  setTheme: (val: ThemeId) => void;
  setPalette: (val: PaletteId) => void;
  setCustomColor: (val: string) => void;
  setFontFamily: (val: FontFamilyId) => void;
  setSpacingDensity: (val: SpacingDensity) => void;
  setProfilePhoto: (photo: ProfilePhotoConfig | null) => void;
  setProfilePhotoEnabled: (enabled: boolean) => void;
  updateProfilePhotoCrop: (crop: ProfilePhotoCrop) => void;
  updateProfilePhotoSize: (size: number) => void;
}

export interface AiSlice {
  providerSettings: AIProviderSettings;
  isGenerating: boolean;
  generationStep: string;
  generationStage: number;
  generationProgress: number;
  streamedWords: number;
  streamedSnippet: string;
  activeModelName: string;
  generationError: string | null;
  setProviderSettings: (val: AIProviderSettings | ((prev: AIProviderSettings) => AIProviderSettings)) => void;
  setGenerationError: (err: string | null) => void;
  handleGenerate: () => Promise<void>;
  cancelGeneration: () => void;
}

export interface HistorySlice {
  savedVersions: GeneratedCvVersion[];
  applications: ApplicationItem[];
  kanbanColumns: KanbanColumn[];
  handleSaveCurrentVersion: (customTitle?: string) => string;
  handleLoadVersion: (id: string) => void;
  handleDeleteVersion: (id: string) => void;
  handleDeleteMultipleVersions: (ids: string[]) => void;
  handleAddApplication: (appData: {
    companyName: string;
    targetRole: string;
    appliedVersionId?: string;
    isExternalCv?: boolean;
    externalCvTitle?: string;
    columnId?: string;
    contactChannel?: string;
    contactPerson?: string;
    jobUrl?: string;
    notes?: string;
    salary?: string;
    location?: string;
  }) => string;
  handleUpdateApplication: (id: string, updates: Partial<ApplicationItem>) => void;
  handleDeleteApplication: (id: string) => void;
  handleMoveApplication: (id: string, targetColumnId: string, newIndex?: number) => void;
  handleArchiveApplication: (id: string) => void;
  handleUnarchiveApplication: (id: string) => void;
  handleArchiveColumn: (columnId: string) => void;
  handleSetAttachedVersion: (applicationId: string, versionId: string) => void;
  handleSetApplicationLanguage: (applicationId: string, language: string) => void;
  handleSaveVersionTranslation: (versionId: string, translation: CvTranslationVariant) => void;
  handleDeleteVersionTranslation: (versionId: string, language: string) => void;
  handleAddColumn: (title: string, color?: string) => void;
  handleUpdateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
  handleDeleteColumn: (columnId: string, fallbackColumnId?: string) => void;
  handleReorderColumns: (columnIds: string[]) => void;
  handleResetKanbanColumns: () => void;
}

export type ResumeStore = UiSlice & CvDataSlice & DesignSlice & AiSlice & HistorySlice;

