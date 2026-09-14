import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import { useFileUploader } from '../../hooks/useFileUploader';
import { useTranslation } from 'react-i18next';
import { StepTargetJobProps } from '../../types';
import { TargetJobProgressBanner } from './target/TargetJobProgressBanner';
import { TargetJobMetadataBar } from './target/TargetJobMetadataBar';
import { TargetJobFooterActions } from './target/TargetJobFooterActions';
import { QuickScoreBadge } from './target/QuickScoreBadge';
import { LiveJobDescriptionEditor } from './target/LiveJobDescriptionEditor';
import { useStepTargetJobFacade } from '../../hooks/facades/useStepTargetJobFacade';

const ContextualAiModal = React.lazy(() =>
  import('./ai/ContextualAiModal').then((m) => ({ default: m.ContextualAiModal }))
);

export type { StepTargetJobProps };

export const StepTargetJob: React.FC<StepTargetJobProps> = ({
  content,
  onChange,
  companyName,
  onCompanyChange,
  targetRole,
  onRoleChange,
  onLoadSample,
  onPrevStep,
  onNextStep,
  onGenerate,
  isGenerating = false,
  generationStep,
  hasGeneratedCv = false,
  providerSettings,
  onProviderSettingsChange,
}) => {
  const { t } = useTranslation(['target', 'common']);
  const theme = useTheme();
  const lastClickRef = useRef<number>(0);

  const {
    state: {
      localContent,
      localCompany,
      localRole,
      aiModalOpen,
      skillToast,
      quickMatchResult,
      masterData,
    },
    actions: {
      setAiModalOpen,
      setSkillToast,
      handleContentChange,
      handleCompanyChange,
      handleRoleChange,
      handleAddSkillToMaster,
      flushAll,
      openManualPromptModal,
    },
  } = useStepTargetJobFacade({
    content,
    onChange,
    companyName,
    onCompanyChange,
    targetRole,
    onRoleChange,
  });

  // Upload handler for .txt / .md files
  const { fileInputRef, handleFileUpload, handleDragOver, handleDrop } = useFileUploader({
    onFileLoaded: (text: string) => {
      handleContentChange(text);
    },
  });

  const hasJob = localContent.trim().length > 40 && !localContent.includes('[Paste the raw job description');
  const wordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const isManual = providerSettings?.provider === 'manual';

  const handleTailorAndProceed = () => {
    if (isGenerating) return;
    flushAll();

    const now = Date.now();
    if (now - lastClickRef.current < 1000) {
      return;
    }
    lastClickRef.current = now;

    if (isManual) {
      if (!hasJob) return;
      openManualPromptModal();
      return;
    }

    const isConfigured = Boolean(
      providerSettings && (
        (providerSettings.provider === 'local') ||
        (providerSettings.provider === 'custom' && providerSettings.customEndpoint?.trim()) ||
        (providerSettings.apiKey && providerSettings.apiKey.trim().length > 5)
      )
    );

    if (!isConfigured) {
      setAiModalOpen(true);
      return;
    }

    if (onGenerate) {
      onGenerate();
    }
  };

  const handleSaveModalAndGenerate = (updatedSettings: NonNullable<typeof providerSettings>) => {
    onProviderSettingsChange?.(updatedSettings);
    setAiModalOpen(false);
    if (onGenerate && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        p: { xs: 1.5, sm: 2, md: 3 },
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 48px)', sm: 5, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Hidden File Input for .txt / .md files */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".md,.txt"
          onChange={handleFileUpload}
        />

        {/* 1. Active AI Synthesis Progress Banner */}
        <TargetJobProgressBanner
          isGenerating={isGenerating}
          generationStep={generationStep}
        />

        {/* 2. Top Header Title & Description */}
        <Box sx={{ mb: { xs: 0, sm: -0.5 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {t('target:title', 'Target Job Vacancy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('target:subtitle', 'Paste the job posting description. The AI will automatically calibrate the optimal length, impact metrics, and keyword alignment.')}
          </Typography>
        </Box>

        {/* 3. Target Metadata & Metric Inputs Bar */}
        <TargetJobMetadataBar
          companyName={localCompany}
          onCompanyChange={handleCompanyChange}
          onCompanyBlur={() => onCompanyChange(localCompany)}
          targetRole={localRole}
          onRoleChange={handleRoleChange}
          onRoleBlur={() => onRoleChange(localRole)}
          wordCount={wordCount}
        />

        {/* 3.5. Instant Pre-generation Quick Score Match */}
        {quickMatchResult.totalKeywords > 0 && (
          <QuickScoreBadge
            result={quickMatchResult}
            onAddSkillToMaster={handleAddSkillToMaster}
          />
        )}

        {/* 4. Spacious Direct Job Description Editor Area */}
        <Paper
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 400,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Toolbar with Legend and Input Source Actions */}
          <Box
            sx={{
              py: 0.75,
              px: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.text.primary, 0.02),
              flexShrink: 0,
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* Real-time Keyword Metrics & Color Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {quickMatchResult.totalKeywords > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Tooltip title={t('target:editor.coveredLegend', 'In your profile')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('target:editor.coveredCount', '{{count}} covered', {
                          count: quickMatchResult.matchedKeywords.length,
                        })}
                        <Box
                          component="span"
                          sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 500, opacity: 0.85, ml: 0.5 }}
                        >
                          ({t('target:editor.coveredLegend', 'In your profile')})
                        </Box>
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title={t('target:editor.gapsLegend', 'Gaps to cover')}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {t('target:editor.missingCount', '{{count}} gaps', {
                          count: quickMatchResult.missingKeywords.length,
                        })}
                        <Box
                          component="span"
                          sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 500, opacity: 0.85, ml: 0.5 }}
                        >
                          ({t('target:editor.gapsLegend', 'Gaps to cover')})
                        </Box>
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {t('target:editor.editModeTitle', 'Job Description (Raw Text / Direct Paste)')}
                </Typography>
              )}
            </Box>

            {/* Clustered Input Sources: Load Sample & Attach File */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {onLoadSample && (
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={onLoadSample}
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    py: 0.25,
                    px: 1,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {t('target:actions.loadSample', 'Load Sample Vacancy')}
                </Button>
              )}

              <Tooltip title={t('target:actions.uploadFileTip', 'Upload job description file (.txt, .md)')}>
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<AttachFileRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    py: 0.25,
                    px: 1,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {t('target:actions.uploadFileInline', 'Attach file (.txt, .md)')}
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Unified Live Interactive Editor with Backdrop Highlighting */}
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              flex: 1,
              position: 'relative',
              p: 0,
              display: 'flex',
              minHeight: 280,
            }}
          >
            <LiveJobDescriptionEditor
              value={localContent}
              onChange={handleContentChange}
              onBlur={() => onChange(localContent)}
              masterData={masterData}
              highlightsEnabled={true}
              placeholder={t(
                'target:editor.placeholder',
                '# Job Title / Target Role\nCompany Name • Location / Remote\n\n## About the Role\nPaste the full vacancy responsibilities, requirements, and tech stack here...'
              )}
            />
          </Box>
        </Paper>

        {/* 5. Navigation & Direct Action Footer */}
        <TargetJobFooterActions
          onBack={() => {
            flushAll();
            if (onPrevStep) onPrevStep();
          }}
          onViewExisting={
            onNextStep
              ? () => {
                  flushAll();
                  onNextStep();
                }
              : undefined
          }
          onTailorNow={handleTailorAndProceed}
          onOpenManualPrompt={
            isManual
              ? undefined
              : () => {
                  flushAll();
                  openManualPromptModal();
                }
          }
          isGenerating={isGenerating}
          generationStep={generationStep}
          hasJob={hasJob}
          hasGeneratedCv={hasGeneratedCv}
        />

        {/* Dedicated End-of-Scroll Safe Spacer */}
        <Box sx={{ height: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', sm: 20 }, flexShrink: 0 }} />
      </Box>

      {/* Contextual AI Setup Modal (opens on click if key is missing) */}
      {providerSettings && (
        <React.Suspense fallback={null}>
          <ContextualAiModal
            open={aiModalOpen}
            onClose={() => setAiModalOpen(false)}
            settings={providerSettings}
            onSaveAndGenerate={handleSaveModalAndGenerate}
          />
        </React.Suspense>
      )}

      {/* Real-time Skill Addition Feedback Toast */}
      <Snackbar
        open={Boolean(skillToast)}
        autoHideDuration={3500}
        onClose={() => setSkillToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSkillToast(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {skillToast}
        </Alert>
      </Snackbar>
    </Box>
  );
};
