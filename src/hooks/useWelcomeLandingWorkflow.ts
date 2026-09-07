import { useMemo } from 'react';
import { useResumeStore } from '../store';
import { extractCandidateName } from '../core/parser/metadataExtractor';

/**
 * Domain hook encapsulating store state and mutations for WelcomeLandingView.
 * Decouples the landing view from direct Zustand store references.
 */
export function useWelcomeLandingWorkflow() {
  const masterData = useResumeStore((s) => s.masterData);
  const targetJob = useResumeStore((s) => s.targetJob);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const activeCvData = useResumeStore((s) => s.activeCvData);
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const wizardStep = useResumeStore((s) => s.wizardStep);
  const handleStartWizard = useResumeStore((s) => s.handleStartWizard);
  const handleExploreDemo = useResumeStore((s) => s.handleExploreDemo);
  const handleStartBlank = useResumeStore((s) => s.handleStartBlank);
  const setMasterData = useResumeStore((s) => s.setMasterData);
  const setActiveTab = useResumeStore((s) => s.setActiveTab);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);

  const hasMasterData = Boolean(masterData && masterData.trim().length > 30);
  const hasTargetJob = Boolean(targetJob && targetJob.trim().length > 20);
  const hasCvMarkdown = Boolean(cvMarkdown && cvMarkdown.trim().length > 30);
  const hasActiveCvData = Boolean(
    activeCvData &&
      (activeCvData.name ||
        activeCvData.summary ||
        (activeCvData.experience && activeCvData.experience.length > 0) ||
        (activeCvData.skillGroups && activeCvData.skillGroups.length > 0))
  );
  const hasSavedVersions = Boolean(savedVersions && savedVersions.length > 0);

  const hasSavedData = hasMasterData || hasTargetJob || hasCvMarkdown || hasActiveCvData || hasSavedVersions;

  const candidateFirstName = useMemo(() => {
    const isDemoOrPlaceholder = (name: string): boolean => {
      const lower = name.toLowerCase().trim();
      return (
        !lower ||
        lower === 'candidate' ||
        lower === 'candidato' ||
        lower === 'tu nombre' ||
        lower === 'nombre y apellido' ||
        lower === 'alex' ||
        lower === 'alex morgan' ||
        lower === 'alex_morgan'
      );
    };

    const cleanFirstName = (raw: string): string => {
      const cleaned = raw.replace(/_/g, ' ').trim();
      if (!cleaned) return '';
      return cleaned.split(/\s+/)[0];
    };

    const candidates: (string | undefined | null)[] = [
      activeCvData?.name,
      savedVersions && savedVersions.length > 0 ? savedVersions[0].candidateName : undefined,
      cvMarkdown && cvMarkdown.trim().length > 30 ? extractCandidateName(cvMarkdown, '') : undefined,
      masterData && masterData.trim().length > 30 ? extractCandidateName(masterData, '') : undefined,
    ];

    for (const cand of candidates) {
      if (cand && cand.trim() && !isDemoOrPlaceholder(cand)) {
        const firstName = cleanFirstName(cand);
        if (firstName && !isDemoOrPlaceholder(firstName)) {
          return firstName;
        }
      }
    }

    return '';
  }, [activeCvData, savedVersions, cvMarkdown, masterData]);

  const handleResumeWizard = () => {
    setActiveTab('wizard');
    // wizardStep automatically directs user to their last active step ('profile' | 'target' | 'preview')
  };

  const handleViewProfile = () => {
    setActiveTab('wizard');
    setWizardStep('profile');
  };

  const handleStartNewResume = () => {
    handleStartBlank();
    setWizardStep('profile');
    setActiveTab('wizard');
  };

  const handleUploadSuccess = (content: string) => {
    setMasterData(content);
    setActiveTab('wizard');
    setWizardStep('profile');
  };

  return {
    hasSavedData,
    candidateFirstName,
    lastWizardStep: wizardStep,
    handleStartWizard,
    handleResumeWizard,
    handleViewProfile,
    handleStartNewResume,
    handleExploreDemo,
    handleUploadSuccess,
  };
}

