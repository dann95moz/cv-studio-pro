import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StudioNavbar } from '../StudioNavbar';
import { WizardStepper } from '../WizardStepper';
import { MobileTopHeader } from '../mobile';
import { StudioTab, WizardStep, MasterDataMode } from '../../../types';

export interface AppHeaderBarProps {
  activeTab: StudioTab;
  wizardStep: WizardStep;
  masterDataMode: MasterDataMode;
  hasMasterData: boolean;
  hasTargetJob: boolean;
  hasGeneratedCv: boolean;
  canMobileGoBack: boolean;
  onSelectTab: (tab: StudioTab) => void;
  onSelectWizardStep: (step: WizardStep) => void;
  onMobileBack: () => void;
  onOpenSync: () => void;
  onOpenWalkthrough: () => void;
}


export const AppHeaderBar: React.FC<AppHeaderBarProps> = ({
  activeTab,
  wizardStep,
  masterDataMode,
  hasMasterData,
  hasTargetJob,
  hasGeneratedCv,
  canMobileGoBack,
  onSelectTab,
  onSelectWizardStep,
  onMobileBack,
  onOpenSync,
  onOpenWalkthrough,
}) => {
  const { t } = useTranslation(['common', 'profile']);

  const getStepTitle = () => {
    if (activeTab === 'history') {
      return t('common:nav.applicationsShort', 'Postulaciones');
    }
    if (activeTab === 'settings') {
      return t('common:nav.settings', 'Configuración');
    }
    if (activeTab === 'landing') {
      return t('common:appName', 'CV Studio');
    }
    if (wizardStep === 'profile') {
      return masterDataMode !== 'choice'
        ? t('profile:modes.guidedTitle', 'Formulario de Perfil')
        : t('profile:stepper.profileShortLabel', 'Datos Maestro');
    }
    if (wizardStep === 'target') {
      return t('profile:stepper.targetShortLabel', 'Oferta y Vacante');
    }
    return t('profile:stepper.previewShortLabel', 'CV y PDF');
  };

  return (
    <>
      {/* Top Navbar: Visible on Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <StudioNavbar onOpenSync={onOpenSync} />
      </Box>

      {/* Stepper Bar for Guided Wizard: Visible on Desktop for Steps 1 & 2 */}
      {activeTab === 'wizard' && wizardStep !== 'preview' && (
        <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
          <WizardStepper
            currentStep={wizardStep}
            onSelectStep={onSelectWizardStep}
            hasMasterData={hasMasterData}
            hasTargetJob={hasTargetJob}
            hasGeneratedCv={hasGeneratedCv}
          />
        </Box>
      )}

      {/* Mobile Top Header: Visible on Mobile (xs to sm) */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          flexShrink: 0,
          position: 'relative',
          zIndex: (theme) => theme.zIndex.appBar,
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <MobileTopHeader
          currentStepNumber={
            wizardStep === 'profile' ? 1 : wizardStep === 'target' ? 2 : 3
          }
          totalSteps={3}
          stepTitle={getStepTitle()}
          isWizard={activeTab === 'wizard'}
          onSelectStep={(step) => {
            onSelectTab('wizard');
            onSelectWizardStep(step);
          }}
          activeWizardStep={wizardStep}
          onBack={canMobileGoBack ? onMobileBack : undefined}
          onOpenSync={onOpenSync}
          onOpenWalkthrough={onOpenWalkthrough}
          onOpenApplications={() => onSelectTab('history')}
        />
      </Box>
    </>
  );
};
