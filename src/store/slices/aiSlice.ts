import { StateCreator } from 'zustand';
import { ResumeStore, AiSlice } from '../types';
import { AIProviderSettings, GeneratedCvVersion, CVData } from '../../types/cv';
import { tailorResume, buildPrompts, extractCvAndGap } from '../../core/ai-service';
import {
  extractCandidateName,
  extractTargetCompany,
  extractTargetRole,
  serializeCvDataToMarkdown,
  parseMarkdownToCvData,
} from '../../core/parser';


import { secureStorage } from '../../core/secureStorage';
import { hapticsService } from '../../core/haptics';

export const DEFAULT_AI_SETTINGS: AIProviderSettings = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: '',
  temperature: 0.15,
  customEndpoint: 'http://localhost:11434/v1',
};

let activeAbortController: AbortController | null = null;

export const createAiSlice: StateCreator<ResumeStore, [], [], AiSlice> = (set, get) => ({
  providerSettings: DEFAULT_AI_SETTINGS,
  isGenerating: false,
  generationStep: '',
  generationStage: 1,
  generationProgress: 0,
  streamedWords: 0,
  streamedSnippet: '',
  activeModelName: '',
  generationError: null,
  isManualPromptModalOpen: false,
  manualPromptBundle: '',
  manualPromptTitle: undefined,
  manualCustomSubmit: null,

  setProviderSettings: (val) => {
    const nextVal = typeof val === 'function' ? val(get().providerSettings) : val;
    if (nextVal.apiKey !== undefined) {
      secureStorage.setItem('cv_studio_secure_api_key', nextVal.apiKey);
    }
    set({ providerSettings: nextVal });
  },

  setGenerationError: (err: string | null) => {
    set({ generationError: err });
  },

  openManualPromptModal: (
    customPrompt?: string,
    title?: string,
    customSubmit?: (response: string) => Promise<void> | void
  ) => {
    let bundle = customPrompt;
    if (!bundle) {
      const { masterData, targetJob, rules, companyName, targetRole, pageBudget, providerSettings } = get();
      const prompts = buildPrompts({
        masterData,
        targetJob,
        rules,
        companyName: companyName || undefined,
        targetRole: targetRole || undefined,
        pageBudget,
        providerSettings,
      });
      bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
    }
    set({
      isManualPromptModalOpen: true,
      manualPromptBundle: bundle,
      manualPromptTitle: title,
      manualCustomSubmit: customSubmit || null,
      isGenerating: false,
    });
  },

  closeManualPromptModal: () => {
    set({
      isManualPromptModalOpen: false,
      manualPromptTitle: undefined,
      manualCustomSubmit: null,
    });
  },

  submitManualResponse: async (responseRaw: string) => {
    const { manualCustomSubmit } = get();
    if (manualCustomSubmit) {
      set({
        isManualPromptModalOpen: false,
        manualPromptTitle: undefined,
        manualCustomSubmit: null,
        isGenerating: false,
      });
      await manualCustomSubmit(responseRaw);
      return;
    }

    const { masterData, targetJob, companyName, targetRole, pageBudget, theme, palette, savedVersions } = get();
    const comp = companyName || extractTargetCompany(targetJob, 'Target Company');
    const role = targetRole || extractTargetRole(targetJob, masterData, '') || '';

    const extracted = extractCvAndGap(responseRaw, masterData, comp, role);
    const tailoredCv = extracted.cvMarkdown || get().cvMarkdown;
    const gapReport = extracted.gapMarkdown || get().gapMarkdown;

    const candName = (extracted.cvData?.name && !extracted.cvData.name.includes('[') && extracted.cvData.name.toLowerCase() !== 'candidate')
      ? extracted.cvData.name.replace(/_/g, ' ').trim()
      : extractCandidateName(masterData, 'Candidate');

    const detectedLang = extracted.detectedLanguage || 'es';
    let nextSavedVersions = savedVersions;
    const autoVersionId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const autoSavedVersion: GeneratedCvVersion = {
      id: autoVersionId,
      createdAt: new Date().toISOString(),
      candidateName: candName,
      companyName: comp,
      targetRole: role,
      matchScore: extracted.score ?? 0,
      qualityScore: 0,
      theme,
      palette,
      pageBudget,
      cvMarkdown: tailoredCv,
      gapMarkdown: gapReport,
      targetJobSnippet: targetJob.slice(0, 280),
      baseLanguage: detectedLang,
      activeLanguage: detectedLang,
      translations: {},
    };
    nextSavedVersions = [autoSavedVersion, ...savedVersions.filter((v) => v.id !== autoSavedVersion.id)];

    let nextMasterData = masterData;
    let activeCv: CVData | null = extracted.cvData || null;

    if (!activeCv && tailoredCv) {
      activeCv = parseMarkdownToCvData(tailoredCv, detectedLang);
    }

    if (activeCv && (activeCv.name || activeCv.experience?.length || activeCv.skillGroups?.length || activeCv.summary)) {
      const structured = serializeCvDataToMarkdown(activeCv, detectedLang);
      if (structured && structured.trim().length > 20) {
        nextMasterData = structured;
      }
    } else if (tailoredCv && tailoredCv.trim().length > 20) {
      nextMasterData = tailoredCv;
    }

    set({
      masterData: nextMasterData,
      cvMarkdown: tailoredCv,
      activeCvData: activeCv,
      gapMarkdown: gapReport,
      currentBaseLanguage: detectedLang,
      activeLanguage: detectedLang,
      activeVersionId: autoVersionId,
      translations: {},
      savedVersions: nextSavedVersions,
      isManualPromptModalOpen: false,
      isGenerating: false,
      activeTab: 'wizard',
      wizardStep: 'preview',
    });

  },

  cancelGeneration: () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    set({
      isGenerating: false,
      generationStep: '',
      generationStage: 1,
      generationProgress: 0,
      streamedWords: 0,
      streamedSnippet: '',
      generationError: null,
    });
  },

  handleGenerate: async () => {
    if (get().providerSettings.provider === 'manual') {
      get().openManualPromptModal();
      return;
    }

    if (get().isGenerating && !get().generationError) {
      return;
    }

    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    const currentModel = get().providerSettings.model || 'AI Model';

    set({
      isGenerating: true,
      generationError: null,
      generationStage: 1,
      generationProgress: 15,
      generationStep: 'Analyzing employer requirements & extracting ATS keywords...',
      streamedWords: 0,
      streamedSnippet: '',
      activeModelName: currentModel,
    });

    // 1. Snapshot pending synthesis state for background / foreground crash resilience
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('cv_studio_pending_synthesis', JSON.stringify({
          timestamp: Date.now(),
          companyName: get().companyName,
          targetRole: get().targetRole,
        }));
      }
    } catch {
      // Non-critical session snapshot error
    }

    // 2. Request OS background execution window via Capacitor BackgroundTask
    let bgTaskId: string | null = null;
    if (typeof window !== 'undefined') {
      import('@capawesome/capacitor-background-task').then(({ BackgroundTask }) => {
        BackgroundTask.beforeExit(async () => {
          // Keep thread execution window open during external app switching
        }).then((id) => {
          bgTaskId = id;
        }).catch(() => {});
      }).catch(() => {});
    }

    try {
      const {
        masterData,
        targetJob,
        rules,
        companyName,
        targetRole,
        pageBudget,
        providerSettings,
        theme,
        palette,
        savedVersions,
      } = get();

      const response = await tailorResume(
        {
          masterData,
          targetJob,
          rules,
          companyName,
          targetRole,
          pageBudget,
          providerSettings,
        },
        (progress) => {
          set({
            generationStage: progress.stageIndex,
            generationProgress: progress.progress,
            generationStep: progress.message,
            streamedWords: progress.wordCount ?? get().streamedWords,
            streamedSnippet: progress.snippet ?? get().streamedSnippet,
            activeModelName: progress.modelUsed ?? currentModel,
          });
        },
        activeAbortController.signal
      );

      const tailoredCv = response.tailoredCvMarkdown || get().cvMarkdown;
      const gapReport = response.gapAnalysisMarkdown || get().gapMarkdown;

      const candName = (response.cvData?.name && !response.cvData.name.includes('[') && response.cvData.name.toLowerCase() !== 'candidate')
        ? response.cvData.name.replace(/_/g, ' ').trim()
        : extractCandidateName(masterData, 'Candidate');
      const comp = companyName || extractTargetCompany(targetJob, 'Target Company');
      const role = targetRole || extractTargetRole(targetJob, masterData, '') || '';

      // Check if an identical version exists in savedVersions
      const existingDuplicate = savedVersions.find(
        (v) =>
          v.cvMarkdown.trim() === tailoredCv.trim() &&
          v.companyName.trim().toLowerCase() === comp.trim().toLowerCase() &&
          v.targetRole.trim().toLowerCase() === role.trim().toLowerCase() &&
          v.theme === theme &&
          v.palette === palette &&
          v.pageBudget === pageBudget
      );

      const detectedLang = response.detectedLanguage || 'es';
      let nextSavedVersions = savedVersions;
      let targetVersionId = existingDuplicate?.id;

      if (!existingDuplicate) {
        const autoVersionId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        targetVersionId = autoVersionId;
        const autoSavedVersion: GeneratedCvVersion = {
          id: autoVersionId,
          createdAt: new Date().toISOString(),
          candidateName: candName,
          companyName: comp,
          targetRole: role,
          matchScore: response.estimatedMatchScore ?? 0,
          qualityScore: 0,
          theme,
          palette,
          pageBudget,
          cvMarkdown: tailoredCv,
          gapMarkdown: gapReport,
          targetJobSnippet: targetJob.slice(0, 280),
          baseLanguage: detectedLang,
          activeLanguage: detectedLang,
          translations: {},
        };
        nextSavedVersions = [autoSavedVersion, ...savedVersions.filter((v) => v.id !== autoSavedVersion.id)];
      }

      let nextMasterData = masterData;
      if (response.cvData && (!masterData || !/^##\s+/m.test(masterData))) {
        const structured = serializeCvDataToMarkdown(response.cvData);
        if (structured && structured.trim()) {
          nextMasterData = structured;
        }
      }

      set({
        masterData: nextMasterData,
        cvMarkdown: tailoredCv,
        activeCvData: response.cvData || null,
        gapMarkdown: gapReport,
        currentBaseLanguage: detectedLang,
        activeLanguage: detectedLang,
        activeVersionId: targetVersionId,
        translations: {},
        savedVersions: nextSavedVersions,
        generationStage: 4,
        generationProgress: 100,
        generationStep: 'Done! Resume tailored successfully.',
      });

      // Clear pending resilience marker upon successful completion
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem('cv_studio_pending_synthesis');
        }
      } catch {
        // Ignore
      }

      // Finish OS BackgroundTask
      if (bgTaskId) {
        import('@capawesome/capacitor-background-task').then(({ BackgroundTask }) => {
          BackgroundTask.finish({ taskId: bgTaskId! });
        }).catch(() => {});
      }

      // Tactile success feedback
      hapticsService.notificationSuccess();

      setTimeout(() => {
        set({
          isGenerating: false,
          activeTab: 'wizard',
          wizardStep: 'preview',
        });
      }, 400);
    } catch (err: unknown) {
      // Clear pending resilience marker on error
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem('cv_studio_pending_synthesis');
        }
      } catch {
        // Ignore
      }

      // Finish OS BackgroundTask
      if (bgTaskId) {
        import('@capawesome/capacitor-background-task').then(({ BackgroundTask }) => {
          BackgroundTask.finish({ taskId: bgTaskId! });
        }).catch(() => {});
      }

      // Tactile warning feedback
      hapticsService.notificationWarning();

      if (err instanceof Error && err.message.includes('cancelled')) {
        set({
          isGenerating: false,
          generationError: null,
          generationProgress: 0,
        });
        return;
      }

      const message = err instanceof Error ? err.message : 'Error occurred during AI resume synthesis.';
      set({
        generationError: message,
        isGenerating: true,
        generationProgress: 0,
      });
    } finally {
      activeAbortController = null;
    }
  },
});
