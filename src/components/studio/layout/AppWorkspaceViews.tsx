import React, { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StudioSkeleton } from '../StudioSkeleton';
import { LockedViewCard } from '../LockedViewCard';
import { platformService } from '../../../core/platform';
import {
  BLANK_MASTER_DATA,
  DEMO_MASTER_DATA,
  DEMO_TARGET_JOB,
} from '../../../constants/templates';
import { downloadTextFile, buildTimestampedFileName } from '../../../utils/fileUtils';
import {
  StudioTab,
  WizardStep,
  AIProviderSettings,
  QualityAuditReport,
  GapAnalysisInfo,
} from '../../../types';

// Code-split dynamic views
const StepMasterData = lazy(() =>
  import('../StepMasterData').then((m) => ({ default: m.StepMasterData }))
);
const StepTargetJob = lazy(() =>
  import('../StepTargetJob').then((m) => ({ default: m.StepTargetJob }))
);
const StepPreview = lazy(() =>
  import('../StepPreview').then((m) => ({ default: m.StepPreview }))
);
const WelcomeLandingView = lazy(() =>
  import('../../landing/WelcomeLandingView').then((m) => ({ default: m.WelcomeLandingView }))
);
const QualityAuditView = lazy(() =>
  import('../QualityAuditView').then((m) => ({ default: m.QualityAuditView }))
);
const GapAnalysisView = lazy(() =>
  import('../GapAnalysisView').then((m) => ({ default: m.GapAnalysisView }))
);
const ApplicationsHistoryView = lazy(() =>
  import('../ApplicationsHistoryView').then((m) => ({ default: m.ApplicationsHistoryView }))
);
const SettingsView = lazy(() =>
  import('../SettingsView').then((m) => ({ default: m.SettingsView }))
);

export interface AppWorkspaceViewsProps {
  activeTab: StudioTab;
  wizardStep: WizardStep;
  showMobileBottomNav: boolean;
  masterData: string;
  setMasterData: (val: string) => void;
  targetJob: string;
  setTargetJob: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  rules: string;
  setRules: (val: string) => void;
  providerSettings: AIProviderSettings;
  setProviderSettings: (val: AIProviderSettings) => void;
  isGenerating: boolean;
  generationStep: string;
  hasTargetJob: boolean;
  hasGeneratedCv: boolean;
  hasGapReport: boolean;
  auditReport: QualityAuditReport | null;
  gapInfo: GapAnalysisInfo;
  gapMarkdown: string;
  onSelectTab: (tab: StudioTab) => void;
  onSelectWizardStep: (step: WizardStep) => void;
  onGenerate: () => void;
  onResetWorkspace: () => void;
  onOpenSync: () => void;
  onRefreshAudit: () => void;
}


export const AppWorkspaceViews: React.FC<AppWorkspaceViewsProps> = ({
  activeTab,
  wizardStep,
  showMobileBottomNav,
  masterData,
  setMasterData,
  targetJob,
  setTargetJob,
  companyName,
  setCompanyName,
  targetRole,
  setTargetRole,
  rules,
  setRules,
  providerSettings,
  setProviderSettings,
  isGenerating,
  generationStep,
  hasTargetJob,
  hasGeneratedCv,
  hasGapReport,
  auditReport,
  gapInfo,
  gapMarkdown,
  onSelectTab,
  onSelectWizardStep,
  onGenerate,
  onResetWorkspace,
  onOpenSync,
  onRefreshAudit,
}) => {
  const { t } = useTranslation(['audit', 'gap', 'target']);

  return (
    <Box
      component="div"
      className="studio-body"
      sx={{
        flex: 1,
        minHeight: 0,
        height: {
          xs: 'auto',
          md: 'calc(100dvh - var(--navbar-height))',
        },
        pb: {
          xs: showMobileBottomNav
            ? 'calc(env(safe-area-inset-bottom, 0px) + 56px)'
            : 'env(safe-area-inset-bottom, 0px)',
          md: 0,
        },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* VIEW: WELCOME & ONBOARDING LANDING (Web Only) */}
      {!platformService.isNative() && activeTab === 'landing' && (
        <Suspense fallback={<StudioSkeleton variant="landing" />}>
          <WelcomeLandingView onOpenSync={onOpenSync} />
        </Suspense>
      )}

      {/* WIZARD FLOW: 3 STREAMLINED STEPS */}
      {activeTab === 'wizard' && (
        <Suspense
          fallback={
            <StudioSkeleton
              variant={
                wizardStep === 'profile'
                  ? 'masterData'
                  : wizardStep === 'target'
                    ? 'targetJob'
                    : 'preview'
              }
            />
          }
        >
          {wizardStep === 'profile' && (
            <StepMasterData
              content={masterData}
              onChange={setMasterData}
              onLoadSample={() => setMasterData(DEMO_MASTER_DATA)}
              onResetTemplate={() => setMasterData(BLANK_MASTER_DATA)}
              onNextStep={() => onSelectWizardStep('target')}
              onOpenSync={onOpenSync}
            />
          )}

          {wizardStep === 'target' && (
            <StepTargetJob
              content={targetJob}
              onChange={setTargetJob}
              companyName={companyName}
              onCompanyChange={setCompanyName}
              targetRole={targetRole}
              onRoleChange={setTargetRole}
              providerSettings={providerSettings}
              onProviderSettingsChange={setProviderSettings}
              onLoadSample={() => {
                setTargetJob(DEMO_TARGET_JOB);
                setCompanyName('Stripe');
                setTargetRole('Senior Frontend Engineer');
              }}
              onPrevStep={() => onSelectWizardStep('profile')}
              onNextStep={() => onSelectWizardStep('preview')}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              generationStep={generationStep}
              hasGeneratedCv={hasGeneratedCv}
            />
          )}

          {(wizardStep === 'preview' || wizardStep === 'tailor') && (
            <StepPreview />
          )}
        </Suspense>
      )}

      {/* VIEW: QUALITY AUDIT (1-10 SCALE) */}
      {activeTab === 'audit' && (
        <div className="audit-workspace-layout">
          {hasGeneratedCv ? (
            <Suspense fallback={<StudioSkeleton variant="audit" />}>
              <QualityAuditView
                report={auditReport || undefined}
                onRefresh={onRefreshAudit}
              />
            </Suspense>
          ) : (
            <LockedViewCard
              iconType="gauge"
              title={t('audit:locked.title', 'Quality Audit Requires a Tailored CV')}
              description={t('audit:locked.desc', 'The calibrated 1–10 executive scoring engine evaluates real achievement density, Google XYZ formula percentages, and ATS compliance. Please create or synthesize your tailored CV first to unlock section-by-section scoring.')}
              actionText={t('audit:locked.action', 'Go to Target Job & Tailor')}
              actionIcon="zap"
              onAction={() => {
                onSelectTab('wizard');
                onSelectWizardStep('target');
              }}
            />
          )}
        </div>
      )}

      {/* VIEW: GAP ANALYSIS & MATCHING STRATEGY */}
      {activeTab === 'gap' && (
        <div className="gap-workspace-layout">
          {!hasTargetJob ? (
            <LockedViewCard
              iconType="target"
              badgeVariant="target"
              title={t('gap:lockedNoJob.title', 'No Target Vacancy Entered Yet')}
              description={t('gap:lockedNoJob.desc', 'Gap Strategy cross-references your candidate background against specific employer requirements. Please paste or upload a target job posting in the wizard first.')}
              actionText={t('gap:lockedNoJob.action', 'Add Target Job in Wizard')}
              actionIcon="file-text"
              onAction={() => {
                onSelectTab('wizard');
                onSelectWizardStep('target');
              }}
            />
          ) : !hasGapReport ? (
            <LockedViewCard
              iconType="zap"
              badgeVariant="ai"
              title={t('gap:lockedNoReport.title', 'Ready to Synthesize Gap Strategy')}
              description={t('gap:lockedNoReport.desc', {
                company: companyName || 'Target Company',
                defaultValue: `You have entered target vacancy details for ${companyName || 'Target Company'}. Click below to synthesize your tailored CV and generate the matching strategy report with keyword extraction.`
              })}
              actionText={isGenerating ? t('target:actions.tailoring', 'Synthesizing...') : t('gap:lockedNoReport.action', '✨ Synthesize Tailored CV Now')}
              actionIcon="zap"
              isDisabled={isGenerating}
              onAction={onGenerate}
            />
          ) : (
            <Suspense fallback={<StudioSkeleton variant="gap" />}>
              <GapAnalysisView
                gapMarkdown={gapMarkdown}
                matchScore={gapInfo.matchScore}
                keywords={gapInfo.keywords}
                companyName={companyName}
                targetRole={targetRole}
                onDownload={() => {
                  const targetComp = companyName || 'Target';
                  const baseName = `Gap_Analysis_${targetComp.replace(/\s+/g, '_')}`;
                  const fileName = buildTimestampedFileName(baseName, 'md');
                  downloadTextFile(gapMarkdown, fileName);
                }}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* VIEW: APPLICATIONS & CV VERSIONS HISTORY */}
      {activeTab === 'history' && (
        <Suspense fallback={<StudioSkeleton variant="history" />}>
          <div className="history-workspace-layout" style={{ height: '100%' }}>
            <ApplicationsHistoryView />
          </div>
        </Suspense>
      )}

      {/* VIEW: SETTINGS & RULES */}
      {activeTab === 'settings' && (
        <Suspense fallback={<StudioSkeleton variant="settings" />}>
          <div className="settings-workspace-layout">
            <SettingsView
              settings={providerSettings}
              onSettingsChange={setProviderSettings}
              rules={rules}
              onRulesChange={setRules}
              onResetDefaults={onResetWorkspace}
              onOpenSync={onOpenSync}
            />
          </div>
        </Suspense>
      )}
    </Box>
  );
};
