import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TrackApplicationDialog } from '../history/TrackApplicationDialog';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import {
  GeneratedCvVersion,
  ApplicationItem,
  KanbanColumn,
  AIProviderSettings,
  CvTranslationVariant,
  TrackApplicationDialogProps,
} from '../../../types';
import { SupportedLanguage } from '../../../constants/languages';

const VersionDiffModal = React.lazy(() =>
  import('../history/VersionDiffModal').then((m) => ({ default: m.VersionDiffModal }))
);
const GitHubStarToast = React.lazy(() =>
  import('../GitHubStarToast').then((m) => ({ default: m.GitHubStarToast }))
);
const CvTranslateModal = React.lazy(() =>
  import('./CvTranslateModal').then((m) => ({ default: m.CvTranslateModal }))
);
const AdaptToNewOfferModal = React.lazy(() =>
  import('./AdaptToNewOfferModal').then((m) => ({ default: m.AdaptToNewOfferModal }))
);

export interface StepPreviewModalsProps {
  isTrackModalOpen: boolean;
  onCloseTrackModal: () => void;
  onConfirmTrackApplication: TrackApplicationDialogProps['onConfirm'];
  companyName: string;
  targetRole: string;
  savedVersions: GeneratedCvVersion[];
  applications: ApplicationItem[];
  kanbanColumns: KanbanColumn[];
  isDiffModalOpen: boolean;
  onCloseDiffModal: () => void;
  diffInitialVersionAId?: string;
  diffInitialVersionBId?: string;
  isTranslateModalOpen: boolean;
  onCloseTranslateModal: () => void;
  currentBaseLanguage: string;
  translations: Record<string, CvTranslationVariant>;
  providerSettings: AIProviderSettings;
  activeModelName: string;
  isTranslating: boolean;
  onTranslateFull: (targetLang: SupportedLanguage) => Promise<void>;
  onTranslateIncremental: (targetLang: SupportedLanguage, sections: string[]) => Promise<void>;
  isAdaptModalOpen: boolean;
  onCloseAdaptModal: () => void;
  cvMarkdown: string;
  onUseCurrentCvForNewOffer: (data: { companyName: string; targetRole: string; jobText: string }) => void;
  onAdaptNewOfferWithAi: (data: { companyName: string; targetRole: string; jobText: string }) => Promise<void>;
  isGenerating: boolean;
  isPromptOpen: boolean;
  onDismissPrompt: () => void;
  onStarClick: () => void;
  trackSuccess: boolean;
  onCloseTrackSuccess: () => void;
}


export const StepPreviewModals: React.FC<StepPreviewModalsProps> = ({
  isTrackModalOpen,
  onCloseTrackModal,
  onConfirmTrackApplication,
  companyName,
  targetRole,
  savedVersions,
  applications,
  kanbanColumns,
  isDiffModalOpen,
  onCloseDiffModal,
  diffInitialVersionAId,
  diffInitialVersionBId,
  isTranslateModalOpen,
  onCloseTranslateModal,
  currentBaseLanguage,
  translations,
  providerSettings,
  activeModelName,
  isTranslating,
  onTranslateFull,
  onTranslateIncremental,
  isAdaptModalOpen,
  onCloseAdaptModal,
  cvMarkdown,
  onUseCurrentCvForNewOffer,
  onAdaptNewOfferWithAi,
  isGenerating,
  isPromptOpen,
  onDismissPrompt,
  onStarClick,
  trackSuccess,
  onCloseTrackSuccess,
}) => {
  const { t } = useTranslation(['preview']);

  // Register modals in Android hardware back button stack
  useEffect(() => {
    if (isDiffModalOpen) {
      return backButtonRegistry.register({
        id: 'preview-diff-modal',
        priority: 100,
        handler: () => {
          onCloseDiffModal();
          return true;
        },
      });
    }
  }, [isDiffModalOpen, onCloseDiffModal]);

  useEffect(() => {
    if (isTrackModalOpen) {
      return backButtonRegistry.register({
        id: 'preview-track-modal',
        priority: 100,
        handler: () => {
          onCloseTrackModal();
          return true;
        },
      });
    }
  }, [isTrackModalOpen, onCloseTrackModal]);

  useEffect(() => {
    if (isTranslateModalOpen) {
      return backButtonRegistry.register({
        id: 'preview-translate-modal',
        priority: 100,
        handler: () => {
          onCloseTranslateModal();
          return true;
        },
      });
    }
  }, [isTranslateModalOpen, onCloseTranslateModal]);

  useEffect(() => {
    if (isAdaptModalOpen) {
      return backButtonRegistry.register({
        id: 'preview-adapt-modal',
        priority: 100,
        handler: () => {
          onCloseAdaptModal();
          return true;
        },
      });
    }
  }, [isAdaptModalOpen, onCloseAdaptModal]);

  return (
    <>
      {/* One-Time Post-Export GitHub Star Satisfaction Toast */}
      <React.Suspense fallback={null}>
        <GitHubStarToast
          open={isPromptOpen}
          onClose={onDismissPrompt}
          onStarClick={onStarClick}
        />
      </React.Suspense>

      {/* Opt-in Track Application Dialog */}
      <TrackApplicationDialog
        open={isTrackModalOpen}
        onClose={onCloseTrackModal}
        onConfirm={onConfirmTrackApplication}
        prefillCompany={companyName}
        prefillRole={targetRole}
        savedVersions={savedVersions}
        existingApplications={applications}
        columns={kanbanColumns}
      />

      {/* Visual Version Diff Modal */}
      <React.Suspense fallback={null}>
        <VersionDiffModal
          open={isDiffModalOpen}
          onClose={onCloseDiffModal}
          initialVersionAId={diffInitialVersionAId}
          initialVersionBId={diffInitialVersionBId}
        />
      </React.Suspense>

      {/* CV AI Translation Modal */}
      <React.Suspense fallback={null}>
        {isTranslateModalOpen && (
          <CvTranslateModal
            open={isTranslateModalOpen}
            onClose={onCloseTranslateModal}
            baseLanguage={currentBaseLanguage}
            translations={translations}
            activeProviderName={providerSettings.provider}
            activeModelName={activeModelName}
            isTranslating={isTranslating}
            onTranslateFull={onTranslateFull}
            onTranslateIncremental={onTranslateIncremental}
          />
        )}
      </React.Suspense>

      {/* Adapt CV to Another Job Offer Modal */}
      <React.Suspense fallback={null}>
        {isAdaptModalOpen && (
          <AdaptToNewOfferModal
            open={isAdaptModalOpen}
            onClose={onCloseAdaptModal}
            currentCompanyName={companyName}
            currentTargetRole={targetRole}
            currentCvMarkdown={cvMarkdown}
            onUseCurrent={onUseCurrentCvForNewOffer}
            onGenerateNew={onAdaptNewOfferWithAi}
            isGenerating={isGenerating}
          />
        )}
      </React.Suspense>

      {/* Toast Feedback when application is tracked */}
      <Snackbar
        open={trackSuccess}
        autoHideDuration={3000}
        onClose={onCloseTrackSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          {t('preview:toolbar.trackedSuccess', 'Saved to My Applications')}
        </Alert>
      </Snackbar>
    </>
  );
};
