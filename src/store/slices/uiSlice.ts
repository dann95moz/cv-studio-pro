import { StateCreator } from 'zustand';
import { StudioTab, WizardStep } from '../../types/cv';
import { ResumeStore, UiSlice } from '../types';
import { platformService } from '../../core/platform';

const getInitialTab = (): StudioTab => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.replace('#', '') as StudioTab;
    const validTabs: StudioTab[] = ['landing', 'wizard', 'editor', 'preview', 'audit', 'gap', 'history', 'settings'];
    if (validTabs.includes(hash)) {
      if (platformService.isNative() && hash === 'landing') {
        return 'wizard';
      }
      return hash;
    }
  }
  // Native app bypasses marketing landing page completely and enters studio wizard
  if (platformService.isNative()) {
    return 'wizard';
  }
  return 'landing';
};

export const createUiSlice: StateCreator<ResumeStore, [], [], UiSlice> = (set, get) => ({
  activeTab: getInitialTab(),
  wizardStep: 'profile',
  masterDataMode: 'choice',
  globalNotification: null,

  setActiveTab: (tab: StudioTab) => {
    const resolvedTab = platformService.isNative() && tab === 'landing' ? 'wizard' : tab;
    set({ activeTab: resolvedTab });
    if (typeof window !== 'undefined' && window.location.hash !== `#${resolvedTab}`) {
      window.location.hash = `#${resolvedTab}`;
    }
  },

  setWizardStep: (step: WizardStep) => {
    set({ wizardStep: step });
  },

  setMasterDataMode: (mode) => {
    set({ masterDataMode: mode });
  },

  showNotification: (notif) => {
    set({ globalNotification: { ...notif, open: true } });
  },

  hideNotification: () => {
    set((state) => ({
      globalNotification: state.globalNotification
        ? { ...state.globalNotification, open: false }
        : null,
    }));
  },


  handleStartWizard: () => {
    get().setActiveTab('wizard');
    get().setWizardStep('profile');
  },

  handleExploreDemo: () => {
    get().handleLoadDemoProfile();
    get().setActiveTab('wizard');
    get().setWizardStep('preview');
  },
});
