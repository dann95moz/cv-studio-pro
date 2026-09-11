/**
 * CV Studio Pro - UI Component Props & Interfaces
 * 
 * Centralized interface declarations for UI components.
 * Adheres to Interface Segregation (I) and Single Responsibility (S).
 */

import React from 'react';
import {
  CVData,
  ContactItem,
  ContactType,
  ExperienceItem,
} from './cv';
import { ThemeId, PaletteId, FontFamilyId, SpacingDensity, PageFormat, ProfilePhotoConfig } from './theme';
import { AIProviderId, AIProviderSettings } from './ai';
import {
  WizardStep,
  PreviewViewMode,
  PreviewSidePanelType,
  GeneratedCvVersion,
  KanbanColumn,
  ApplicationItem,
  CvTranslationVariant,
} from './studio';
import {
  AuditSectionResult,
  QualityAuditReport,
  ActionModalState,
} from './audit';

export interface StepPreviewProps {}

// ---------------------------------------------------------------------------
// 1. Core Render & Icons
// ---------------------------------------------------------------------------
export type IconType = 
  | ContactType 
  | 'sparkles' 
  | 'zap' 
  | 'file-text' 
  | 'upload' 
  | 'download' 
  | 'check' 
  | 'copy' 
  | 'shield' 
  | 'settings' 
  | 'refresh' 
  | 'eye' 
  | 'edit' 
  | 'trash' 
  | 'close' 
  | 'play' 
  | 'brain' 
  | 'printer' 
  | 'star' 
  | 'external-link' 
  | 'check-circle' 
  | 'alert-circle'
  | 'target'
  | 'layers'
  | 'gauge'
  | 'user'
  | 'arrow-right'
  | 'arrow-left'
  | 'bullet'
  | 'wand'
  | 'code';

export interface IconProps {
  type: IconType;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export interface CVRendererProps {
  data: CVData;
  theme?: ThemeId;
  palette?: PaletteId;
  customColor?: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
  density?: SpacingDensity;
  containerId?: string;
  photo?: ProfilePhotoConfig | null;
}

export interface LockedViewCardProps {
  iconType: 'gauge' | 'target' | 'zap' | 'file-text';
  badgeVariant?: 'default' | 'target' | 'ai';
  title: string;
  description: React.ReactNode;
  actionText: string;
  actionIcon?: 'zap' | 'file-text' | 'layers';
  onAction: () => void;
  isDisabled?: boolean;
}

// ---------------------------------------------------------------------------
// 2. Wizard & Form Navigation
// ---------------------------------------------------------------------------
export interface WizardStepperProps {
  currentStep: WizardStep;
  onSelectStep: (step: WizardStep) => void;
  hasMasterData: boolean;
  hasTargetJob: boolean;
  hasGeneratedCv: boolean;
  onStepClick?: (step: WizardStep) => void;
  canNavigateTo?: (step: WizardStep) => boolean;
}

export interface ContextualAiModalProps {
  open: boolean;
  onClose: () => void;
  settings: AIProviderSettings;
  onSaveAndGenerate: (updatedSettings: AIProviderSettings) => void;
}

export interface PreviewAuditGapDrawerProps {
  auditReport: QualityAuditReport;
  gapInfo: { matchScore: number; keywords: string[] };
  gapMarkdown?: string;
  companyName?: string;
  targetRole?: string;
  cvData?: import('./cv').CVData;
  isOpen: boolean;
  activeTab: 'audit' | 'gap' | 'interview';
  onToggleTab: (tab: 'audit' | 'gap' | 'interview') => void;
  onClose: () => void;
  onOpenFullAudit?: () => void;
  isHudMinimized?: boolean;
  onToggleHudMinimized?: (minimized: boolean) => void;
}

export interface StepMasterDataProps {
  content: string;
  onChange: (value: string) => void;
  onLoadSample: () => void;
  onResetTemplate: () => void;
  onPrevStep?: () => void;
  onNextStep: () => void;
  onContinue?: () => void;
}

export interface StepTargetJobProps {
  content: string;
  onChange: (value: string) => void;
  companyName: string;
  onCompanyChange: (value: string) => void;
  targetRole: string;
  onRoleChange: (value: string) => void;
  onLoadSample: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  pageBudget?: 1 | 2;
  onPageBudgetChange?: (budget: 1 | 2) => void;
  onGenerate?: () => Promise<void> | void;
  isGenerating?: boolean;
  generationStep?: string;
  hasGeneratedCv?: boolean;
  providerSettings?: AIProviderSettings;
  onProviderSettingsChange?: (settings: AIProviderSettings) => void;
  onContinue?: () => void;
  onBack?: () => void;
}

export interface GuidedProfileFormProps {
  markdownContent: string;
  onChange: (newMarkdown: string) => void;
  data?: CVData;
  onFlushRef?: React.MutableRefObject<(() => void) | null>;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}


export interface PersonalInfoSectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  name: string;
  title: string;
  contacts: ContactItem[];
  onNameChange: (val: string) => void;
  onTitleChange: (val: string) => void;
  onContactChange: (type: ContactType, label: string, url?: string) => void;
  onChange?: (info: { name: string; title: string; contacts: ContactItem[] }) => void;
}

export interface SummarySectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  summary: string;
  onSummaryChange: (val: string) => void;
  onChange?: (summary: string) => void;
}

export interface ExperienceSectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  experience: ExperienceItem[];
  onFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  onAddBullet: (expIndex: number) => void;
  onUpdateBullet: (expIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet: (expIndex: number, bulletIndex: number) => void;
  onChange?: (items: ExperienceItem[]) => void;
}

export interface EducationSectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  education: string[];
  onUpdateEducation: (index: number, val: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
  onChange?: (items: string[]) => void;
}

export interface LanguagesSectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  languages: string[];
  onUpdateLanguage: (index: number, val: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
  onChange?: (items: string[]) => void;
}

export interface ProjectsSectionProps {
  isExpanded?: boolean;
  onToggle?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  projects: ExperienceItem[];
  onFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onAddProject: () => void;
  onRemoveProject: (index: number) => void;
  onChange?: (items: ExperienceItem[]) => void;
}

// ---------------------------------------------------------------------------
// 3. Preview Studio Panels & Toolbar
// ---------------------------------------------------------------------------
export interface StepPreviewToolbarProps {
  onSelectWizardStep?: (step: WizardStep) => void;
  viewMode?: PreviewViewMode;
  onViewModeChange?: (mode: PreviewViewMode) => void;
  previewDocType?: 'cv' | 'cover-letter';
  onPreviewDocTypeChange?: (docType: 'cv' | 'cover-letter') => void;
  activeTemplateName: string;
  onOpenTemplates: () => void;
  onSaveVersion?: () => void;
  savedSuccess?: boolean;
  isSavingVersion?: boolean;
  onReTailor: () => void;
  isGenerating: boolean;
  onDownloadPdf: () => void;
  onDownloadMarkdown?: () => void;
  onDownloadPlainText?: () => void;
  onDownloadDocx?: () => void;
  onCopyPlainText?: () => void;
  onPrintPdf?: () => void;
  isExportingPdf?: boolean;
  pageFormat?: PageFormat;
  onPageFormatChange?: (format: PageFormat) => void;
  isOverflowing?: boolean;
  onAutoFit?: () => void;
  onTrackApplication?: () => void;
  isTracked?: boolean;
  activeLanguage?: string;
  baseLanguage?: string;
  translations?: Record<string, CvTranslationVariant>;
  onLanguageChange?: (lang: string) => void;
  onOpenTranslateModal?: () => void;
  isLanguageOutdated?: boolean;
  outdatedSectionsCount?: number;
  onQuickSyncOutdated?: () => void;
  isTranslating?: boolean;
}

export interface StepPreviewNavRailProps {
  activeSidePanel: PreviewSidePanelType | null;
  onToggleSidePanel: (panel: PreviewSidePanelType) => void;
}

export interface TemplateThumbnailMiniatureProps {
  themeId: ThemeId;
  paletteId: PaletteId;
  customColor?: string;
  name: string;
  category: string;
  description?: string;
  recommendedFor?: string;
  layout?: 'single-column' | 'two-column' | 'ats-linear';
  icon?: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface TemplatesPanelProps {
  theme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  palette: PaletteId;
  onSelectPalette: (id: PaletteId) => void;
  customColor: string;
  onCustomColorChange: (hex: string) => void;
  onClose: () => void;
  open?: boolean;
  activeTheme?: ThemeId;
  activePalette?: PaletteId;
  hideHeader?: boolean;
}

export interface DesignFormattingPanelProps {
  customColor: string;
  onCustomColorChange: (color: string) => void;
  palette: PaletteId;
  onSelectPalette: (palette: PaletteId) => void;
  fontFamily: FontFamilyId;
  onFontFamilyChange: (font: FontFamilyId) => void;
  spacingDensity: SpacingDensity;
  onSpacingDensityChange: (density: SpacingDensity) => void;
  pageFormat?: PageFormat;
  onPageFormatChange?: (format: PageFormat) => void;
  onAutoFit?: () => void;
  sheetHeight: number;
  a4PagePx: number;
  estimatedPages: number;
  onClose: () => void;
  open?: boolean;
  activePalette?: PaletteId;
  activeFont?: FontFamilyId;
  activeDensity?: SpacingDensity;
  onSelectFont?: (font: FontFamilyId) => void;
  onSelectDensity?: (density: SpacingDensity) => void;
  photo?: ProfilePhotoConfig | null;
  onPhotoChange?: (photo: ProfilePhotoConfig | null) => void;
  onPhotoToggle?: (enabled: boolean) => void;
  activeTheme?: ThemeId;
  theme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  initialTab?: 'templates' | 'formatting';
}

export interface PreviewComparisonViewProps {
  parsedMasterCv: CVData;
  parsedCv: CVData;
  theme: ThemeId;
  palette: PaletteId;
  customColor?: string;
  fontFamily: FontFamilyId;
  spacingDensity: SpacingDensity;
  companyName: string;
  matchScore: number;
  keywordsCount: number;
  parsedMaster?: CVData | null;
  parsedTailored?: CVData;
  activeTheme?: ThemeId;
  activePalette?: PaletteId;
  activeFont?: FontFamilyId;
  activeDensity?: SpacingDensity;
}

// ---------------------------------------------------------------------------
// 4. Quality Audit, Gap Analysis & History Views
// ---------------------------------------------------------------------------
export interface QualityAuditViewProps {
  report?: QualityAuditReport;
  onRefresh?: () => void;
  onBackToPreview?: () => void;
  onApplyActionItem?: (actionText: string) => void;
}

export interface AuditSectionCardProps {
  section: AuditSectionResult;
  scoreColor: string;
  onExecuteAction: (actionText: string, sectionName: string) => void;
  getActionButtonLabel: (action: string) => string;
  onActionClick?: (sectionName: string, itemText: string, itemType: 'gap' | 'action') => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface AuditImprovementModalProps {
  modalState: ActionModalState;
  onClose: () => void;
  onInputChange: (val: string) => void;
  onApply: () => void;
}

export interface GapAnalysisViewProps {
  gapMarkdown: string;
  matchScore?: number;
  keywords?: string[];
  companyName: string;
  targetRole: string;
  onDownload: () => void;
  onBackToPreview?: () => void;
  onRegenerateWithFocus?: (keywords: string[]) => void;
}

export interface SettingsViewProps {
  settings: AIProviderSettings;
  onSettingsChange: (settings: AIProviderSettings) => void;
  rules?: string;
  onRulesChange?: (rules: string) => void;
  onResetDefaults: () => void;
  onSave?: (settings: AIProviderSettings) => void;
  onOpenSync?: () => void;
}

export interface SettingsAiTabProps {
  settings: AIProviderSettings;
  onSettingsChange: (settings: AIProviderSettings) => void;
  provider?: AIProviderId;
  model?: string;
  apiKey?: string;
  customEndpoint?: string;
  temperature?: number;
  onProviderChange?: (provider: AIProviderId) => void;
  onModelChange?: (model: string) => void;
  onApiKeyChange?: (key: string) => void;
  onCustomEndpointChange?: (endpoint: string) => void;
  onTemperatureChange?: (temp: number) => void;
}


export interface ApplicationsStatsHeaderProps {
  totalActiveApplications: number;
  totalInterviews: number;
  totalOffers: number;
  totalArchived: number;
  avgMatchScore: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTrackNewApplication: () => void;
  onStartNewResume: () => void;
  activeView: 'grid' | 'board' | 'archived' | 'versions';
  onViewChange: (view: 'grid' | 'board' | 'archived' | 'versions') => void;
  savedVersionsCount: number;
}

export interface ApplicationGridCardProps {
  application: ApplicationItem;
  allColumns: KanbanColumn[];
  attachedVersion?: GeneratedCvVersion;
  onLoadInStudio?: (versionId: string) => void;
  onMoveToStage: (appId: string, targetColId: string) => void;
  onArchive: (appId: string) => void;
  onDelete: (appId: string) => void;
  onDownloadPdf?: (version: GeneratedCvVersion, language?: string) => void;
  isDownloadingPdf?: boolean;
  onManageStages?: () => void;
  onSelectLanguage?: (appId: string, language: string) => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
}

export interface ApplicationsGridViewProps {
  applications: ApplicationItem[];
  columns: KanbanColumn[];
  savedVersions: GeneratedCvVersion[];
  searchQuery: string;
  selectedStageFilter: string | 'all';
  onStageFilterChange: (stageId: string | 'all') => void;
  onMoveToStage: (appId: string, targetColId: string) => void;
  onLoadVersionInStudio: (versionId: string) => void;
  onArchiveApplication: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onDownloadPdf?: (version: GeneratedCvVersion, language?: string) => void;
  isDownloadingPdfId?: string | null;
  onManageStages: (column?: KanbanColumn) => void;
  onQuickAddApplication: (columnId?: string) => void;
  onSelectLanguage?: (appId: string, language: string) => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
}

export interface ApplicationCardProps {
  version: GeneratedCvVersion;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (v: GeneratedCvVersion) => void;
  onDownloadPdf?: (v: GeneratedCvVersion, language?: string) => void;
  onTrack?: (v: GeneratedCvVersion) => void;
  isDownloadingPdf?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isLinkedToActiveApp?: boolean;
  activeAppName?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  applications: ApplicationItem[];
  savedVersions: GeneratedCvVersion[];
  searchQuery: string;
  onMoveApplication: (appId: string, targetColumnId: string, newIndex?: number) => void;
  onLoadVersionInStudio: (versionId: string) => void;
  onSetAttachedVersion: (appId: string, versionId: string) => void;
  onArchiveApplication: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onDownloadPdf: (version: GeneratedCvVersion, language?: string) => void;
  isDownloadingPdfId: string | null;
  onAddColumn: () => void;
  onEditColumn: (column: KanbanColumn) => void;
  onDeleteColumn: (columnId: string) => void;
  onArchiveColumn: (columnId: string) => void;
  onQuickAddApplication: (columnId: string) => void;
  onSelectLanguage?: (appId: string, language: string) => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  allColumns?: KanbanColumn[];
  applications: ApplicationItem[];
  savedVersions: GeneratedCvVersion[];
  onMoveApplication: (appId: string, targetColumnId: string, newIndex?: number) => void;
  onLoadVersionInStudio: (versionId: string) => void;
  onSetAttachedVersion: (appId: string, versionId: string) => void;
  onArchiveApplication: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onDownloadPdf: (version: GeneratedCvVersion, language?: string) => void;
  isDownloadingPdfId: string | null;
  onEditColumn: (column: KanbanColumn) => void;
  onDeleteColumn: (columnId: string) => void;
  onArchiveColumn: (columnId: string) => void;
  onQuickAdd: (columnId: string) => void;
  onSelectLanguage?: (appId: string, language: string) => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
}

export interface KanbanCardProps {
  application: ApplicationItem;
  allColumns?: KanbanColumn[];
  attachedVersion?: GeneratedCvVersion;
  allMatchingVersions: GeneratedCvVersion[];
  onLoadInStudio: (versionId: string) => void;
  onSetAttachedVersion: (appId: string, versionId: string) => void;
  onMoveToColumn?: (targetColumnId: string) => void;
  onArchive: (appId: string) => void;
  onDelete: (appId: string) => void;
  onDownloadPdf: (version: GeneratedCvVersion, language?: string) => void;
  isDownloadingPdf?: boolean;
  isDraggingOverlay?: boolean;
  onSelectLanguage?: (appId: string, language: string) => void;
  onTailorForApplication?: (app: ApplicationItem) => void;
}

export interface TrackApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    companyName: string;
    targetRole: string;
    appliedVersionId?: string;
    isExternalCv?: boolean;
    externalCvTitle?: string;
    columnId: string;
    contactChannel?: string;
    contactPerson?: string;
    jobUrl?: string;
    notes?: string;
    salary?: string;
    location?: string;
  }) => void;
  initialSourceType?: 'internal' | 'external';
  prefillCompany?: string;
  prefillRole?: string;
  prefillVersionId?: string;
  defaultColumnId?: string;
  savedVersions: GeneratedCvVersion[];
  existingApplications: ApplicationItem[];
  columns: KanbanColumn[];
}

export interface ArchivedApplicationsViewProps {
  archivedApplications: ApplicationItem[];
  savedVersions: GeneratedCvVersion[];
  searchQuery: string;
  onRestore: (appId: string) => void;
  onDeletePermanently: (appId: string) => void;
  onLoadInStudio: (versionId: string) => void;
  onDownloadPdf: (version: GeneratedCvVersion) => void;
  isDownloadingPdfId: string | null;
}

export interface ColumnEditDialogProps {
  open: boolean;
  column?: KanbanColumn | null;
  onClose: () => void;
  onSave: (title: string, color: string) => void;
}

export interface GitHubStarToastProps {
  open: boolean;
  onClose: () => void;
  onStarClick: () => void;
}

import { BulletAuditIssue } from './audit';

export interface AiHoverActionsPillProps {
  hasUndo: boolean;
  isRecentlyRegenerated?: boolean;
  onAccept: (e: React.MouseEvent) => void;
  onUndo: (e: React.MouseEvent) => void;
  onOpenAiPopover: (e: React.MouseEvent<HTMLElement>) => void;
  auditIssue?: BulletAuditIssue | null;
  onOpenAuditPopover?: (e: React.MouseEvent<HTMLElement>) => void;
}

