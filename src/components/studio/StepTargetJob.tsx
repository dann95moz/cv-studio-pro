import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { extractTargetCompany } from '../../core/parser';
import { useFileUploader } from '../../hooks/useFileUploader';
import { useTranslation } from 'react-i18next';
import { StepTargetJobProps } from '../../types';
import { TargetJobProgressBanner } from './target/TargetJobProgressBanner';
import { TargetJobMetadataBar } from './target/TargetJobMetadataBar';
import { TargetJobFooterActions } from './target/TargetJobFooterActions';
import { QuickScoreBadge } from './target/QuickScoreBadge';
import { LiveJobDescriptionEditor } from './target/LiveJobDescriptionEditor';
import { calculateQuickScore } from '../../core/matching/quickMatcher';
import { useResumeStore } from '../../store/useResumeStore';

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
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [highlightsEnabled, setHighlightsEnabled] = useState<boolean>(true);
  const lastClickRef = useRef<number>(0);

  const [localContent, setLocalContent] = useState(content);
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localRole, setLocalRole] = useState(targetRole);

  const masterData = useResumeStore((s) => s.masterData);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);
  const quickMatchResult = React.useMemo(() => {
    return calculateQuickScore(localContent, masterData);
  }, [localContent, masterData]);

  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const companyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    setLocalCompany(companyName);
  }, [companyName]);

  useEffect(() => {
    setLocalRole(targetRole);
  }, [targetRole]);

  useEffect(() => {
    return () => {
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
      if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
      if (roleTimerRef.current) clearTimeout(roleTimerRef.current);
    };
  }, []);

  const flushAll = React.useCallback(() => {
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current);
      contentTimerRef.current = null;
      onChange(localContent);
    }
    if (companyTimerRef.current) {
      clearTimeout(companyTimerRef.current);
      companyTimerRef.current = null;
      onCompanyChange(localCompany);
    }
    if (roleTimerRef.current) {
      clearTimeout(roleTimerRef.current);
      roleTimerRef.current = null;
      onRoleChange(localRole);
    }
  }, [localContent, localCompany, localRole, onChange, onCompanyChange, onRoleChange]);

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    if (!localCompany) {
      const extracted = extractTargetCompany(val);
      if (extracted) {
        setLocalCompany(extracted);
        onCompanyChange(extracted);
      }
    }
    if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    contentTimerRef.current = setTimeout(() => {
      onChange(val);
    }, 400);
  };

  const handleCompanyChange = (val: string) => {
    setLocalCompany(val);
    if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
    companyTimerRef.current = setTimeout(() => {
      onCompanyChange(val);
    }, 400);
  };

  const handleRoleChange = (val: string) => {
    setLocalRole(val);
    if (roleTimerRef.current) clearTimeout(roleTimerRef.current);
    roleTimerRef.current = setTimeout(() => {
      onRoleChange(val);
    }, 400);
  };

  // Upload handler for .txt / .md files
  const { fileInputRef, handleFileUpload, handleDragOver, handleDrop } = useFileUploader({
    onFileLoaded: (text: string) => {
      handleContentChange(text);
    },
  });



  const handleTailorAndProceed = () => {
    if (isGenerating) return;
    flushAll();

    const now = Date.now();
    if (now - lastClickRef.current < 1000) {
      return;
    }
    lastClickRef.current = now;

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

  const wordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const hasJob = localContent.trim().length > 40 && !localContent.includes('[Paste the raw job description');

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

        {/* 2. Top Header Hero Panel */}
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ maxWidth: 780 }}>
            <Chip
              icon={<WorkRoundedIcon sx={{ fontSize: '16px !important' }} />}
              label={t('target:stepBadge', 'Step 2 of 3 • Target Vacancy & Tailoring')}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ mb: 1, fontWeight: 700 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {t('target:title', 'Target Job Vacancy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('target:subtitle', 'Paste the job posting description. The AI will automatically calibrate the optimal length, impact metrics, and keyword alignment.')}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={onLoadSample}
            sx={{
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('target:actions.loadSample', 'Load Sample Vacancy')}
          </Button>
        </Paper>

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
          <QuickScoreBadge result={quickMatchResult} />
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
          {/* Editor Header Toolbar with Highlights Toggle and Attachment Action */}
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
            {/* Live Highlights Toggle and Real-time Keyword Metrics */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant={highlightsEnabled ? 'contained' : 'outlined'}
                color={highlightsEnabled ? 'primary' : 'inherit'}
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setHighlightsEnabled((prev) => !prev)}
                sx={{
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  px: 1.25,
                  py: 0.35,
                  fontWeight: highlightsEnabled ? 700 : 500,
                }}
              >
                {highlightsEnabled
                  ? t('target:editor.highlightsOn', 'Highlights: ON')
                  : t('target:editor.highlightsOff', 'Highlights: OFF')}
              </Button>

              {quickMatchResult.totalKeywords > 0 && (
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, ml: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {t('target:editor.coveredCount', '{{count}} covered', {
                        count: quickMatchResult.matchedKeywords.length,
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {t('target:editor.missingCount', '{{count}} gaps', {
                        count: quickMatchResult.missingKeywords.length,
                      })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

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
              highlightsEnabled={highlightsEnabled}
              placeholder="# Job Title / Target Role&#10;Company Name • Location / Remote&#10;&#10;## About the Role&#10;Paste the full vacancy responsibilities, requirements, and tech stack here..."
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
          onOpenManualPrompt={() => {
            flushAll();
            openManualPromptModal();
          }}
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
    </Box>
  );
};
