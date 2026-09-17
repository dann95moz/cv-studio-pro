import React from 'react';
import { StepPreviewModals } from './StepPreviewModals';
import { StepPreviewFacade } from '../../../hooks/facades/useStepPreviewFacade';

export interface StepPreviewModalsContainerProps {
  facade: StepPreviewFacade;
}

/**
 * StepPreviewModalsContainer
 * Binds domain slices from StepPreviewFacade to StepPreviewModals dialogs.
 */
export const StepPreviewModalsContainer: React.FC<StepPreviewModalsContainerProps> = React.memo(({ facade }) => {
  return (
    <StepPreviewModals
      isTrackModalOpen={facade.modals.isTrackModalOpen}
      onCloseTrackModal={() => facade.modals.setIsTrackModalOpen(false)}
      onConfirmTrackApplication={facade.modals.handleConfirmTrackApplication}
      companyName={facade.meta.companyName}
      targetRole={facade.meta.targetRole}
      savedVersions={facade.versions.savedVersions}
      applications={facade.meta.applications}
      kanbanColumns={facade.meta.kanbanColumns}
      isDiffModalOpen={facade.modals.isDiffModalOpen}
      onCloseDiffModal={facade.modals.handleCloseDiffModal}
      diffInitialVersionAId={facade.modals.diffInitialVersionAId}
      diffInitialVersionBId={facade.modals.diffInitialVersionBId}
      isTranslateModalOpen={facade.translation.isTranslateModalOpen}
      onCloseTranslateModal={facade.translation.handleCloseTranslateModal}
      currentBaseLanguage={facade.translation.currentBaseLanguage}
      translations={facade.translation.translations}
      providerSettings={facade.meta.providerSettings}
      activeModelName={facade.translation.activeModelName}
      isTranslating={facade.translation.isTranslating}
      onTranslateFull={facade.translation.handleTranslateFull}
      onTranslateIncremental={facade.translation.handleTranslateIncremental}
      isAdaptModalOpen={facade.modals.isAdaptModalOpen}
      onCloseAdaptModal={facade.modals.handleCloseAdaptModal}
      cvMarkdown={facade.meta.cvMarkdown}
      onUseCurrentCvForNewOffer={facade.modals.handleUseCurrentCvForNewOffer}
      onAdaptNewOfferWithAi={facade.modals.handleAdaptNewOfferWithAi}
      isGenerating={facade.meta.isGenerating}
      isPromptOpen={facade.exports.isPromptOpen}
      onDismissPrompt={facade.exports.dismissPrompt}
      onStarClick={facade.exports.openGitHubAndDismiss}
      trackSuccess={facade.modals.trackSuccess}
      onCloseTrackSuccess={() => facade.modals.setTrackSuccess(false)}
    />
  );
});

StepPreviewModalsContainer.displayName = 'StepPreviewModalsContainer';
