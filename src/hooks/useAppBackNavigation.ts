import { useEffect, useCallback } from 'react';
import { useAndroidBackHandler } from './useAndroidBackHandler';
import { useForegroundResume } from './useForegroundResume';
import { backButtonRegistry } from '../core/backButtonRegistry';
import { platformService } from '../core/platform';
import { StudioTab, WizardStep, MasterDataMode } from '../types';

export interface UseAppBackNavigationProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;
  masterDataMode: MasterDataMode;
  setMasterDataMode: (mode: MasterDataMode) => void;
}

/**
 * Hook to manage hardware back navigation, platform guards, and header back buttons.
 */
export function useAppBackNavigation({
  activeTab,
  setActiveTab,
  wizardStep,
  setWizardStep,
  masterDataMode,
  setMasterDataMode,
}: UseAppBackNavigationProps) {
  // Unified Android Back Button Navigation Stack
  useAndroidBackHandler();

  // Background / Foreground synthesis recovery
  useForegroundResume();

  // Guard: Native Android APK must never remain on or navigate to the Web Landing tab
  useEffect(() => {
    if (platformService.isNative() && activeTab === 'landing') {
      setActiveTab('wizard');
      setWizardStep('profile');
    }
  }, [activeTab, setActiveTab, setWizardStep]);

  const handleMobileTopHeaderBack = useCallback(() => {
    if (activeTab === 'wizard') {
      if (wizardStep === 'profile') {
        if (masterDataMode !== 'choice') {
          setMasterDataMode('choice');
        }
      } else if (wizardStep === 'target') {
        setWizardStep('profile');
      } else if (wizardStep === 'preview') {
        setWizardStep('target');
      }
    }
  }, [activeTab, wizardStep, masterDataMode, setMasterDataMode, setWizardStep]);

  const canMobileGoBack =
    activeTab === 'wizard' &&
    ((wizardStep === 'profile' && masterDataMode !== 'choice') ||
      wizardStep === 'target' ||
      wizardStep === 'preview');

  // Priority-based Android hardware back handler for wizard steps navigation
  useEffect(() => {
    if (activeTab === 'wizard') {
      if (wizardStep === 'target') {
        return backButtonRegistry.register({
          id: 'wizard-step-target-back',
          priority: 30,
          handler: () => {
            setWizardStep('profile');
            return true;
          },
        });
      }
      if (wizardStep === 'preview') {
        return backButtonRegistry.register({
          id: 'wizard-step-preview-back',
          priority: 30,
          handler: () => {
            setWizardStep('target');
            return true;
          },
        });
      }
    }
  }, [activeTab, wizardStep, setWizardStep]);

  return {
    canMobileGoBack,
    handleMobileTopHeaderBack,
  };
}
