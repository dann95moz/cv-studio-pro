import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Slide,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { useTranslation } from 'react-i18next';
import { safeMarkdown } from '../../../utils/sanitize';
import { buildRadarDimensions } from '../../../utils/auditUtils';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { PreviewAuditGapDrawerProps } from '../../../types';
import { HexagonRadarChart, RadarDimension } from '../../atoms/HexagonRadarChart';
import { useAuditActions } from '../../../hooks/useAuditActions';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { AuditImprovementModal } from '../audit/AuditImprovementModal';
import { InterviewPrepTab } from '../audit/InterviewPrepTab';
import { AuditScoreHero } from '../audit/AuditScoreHero';
import { AuditPillarsBreakdown } from '../audit/AuditPillarsBreakdown';
import { AuditGapTabContent } from '../audit/AuditGapTabContent';

export type { PreviewAuditGapDrawerProps };

/**
 * Unified Right-Side Audit & Gap Strategy Panel for CV Preview.
 * Reference UI:
 * - Collapsed: Floating HUD Capsule on the canvas (Audit score + Gap % + Interview Prep).
 * - Expanded: Unified 330px side panel with [Audit 9/10], [Gap 92%], and [Prep] segmented tabs.
 */
export const PreviewAuditGapDrawer: React.FC<PreviewAuditGapDrawerProps> = React.memo(({
  auditReport,
  gapInfo,
  gapMarkdown = '',
  companyName,
  targetRole,
  cvData,
  isOpen,
  activeTab,
  onToggleTab,
  onClose,
  onOpenFullAudit,
}) => {
  const { t } = useTranslation(['audit', 'gap', 'preview', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [fullReportModalOpen, setFullReportModalOpen] = useState(false);
  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);
  const { copied: isReportCopied, copy: copyReport } = useCopyToClipboard();

  const radarDimensions: RadarDimension[] = React.useMemo(
    () => buildRadarDimensions(auditReport.sections || [], t),
    [auditReport.sections, t]
  );

  const {
    modalState,
    snackbarMessage,
    handleOpenAction,
    handleApplyAction,
    handleCloseModal,
    handleCloseSnackbar,
    handleInputChange,
    getActionButtonLabel,
  } = useAuditActions();

  const auditScore = auditReport.overallScore ?? 0;
  const matchScore = gapInfo.matchScore ?? 0;

  const [scoreUpdated, setScoreUpdated] = useState(false);
  const prevScoreRef = React.useRef(auditScore);

  React.useEffect(() => {
    if (prevScoreRef.current !== auditScore) {
      prevScoreRef.current = auditScore;
      setScoreUpdated(true);
      const timer = setTimeout(() => setScoreUpdated(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [auditScore]);

  // Split keywords into matched and missing/suggested
  const keywords = gapInfo.keywords && gapInfo.keywords.length > 0 ? gapInfo.keywords : [];

  const matchedKeywords = keywords.slice(0, Math.ceil(keywords.length * 0.7));
  const missingKeywords = keywords.slice(Math.ceil(keywords.length * 0.7));

  return (
    <>
      {/* 1. COLLAPSED STATE: Floating HUD Capsule (Single Card) or Edge Pill */}
      {!isOpen && (
        <>
          {/* A. When Minimized: Sleek Edge Pill */}
          {isHudMinimized ? (
            <Tooltip title={t('preview:drawer.expandHud', 'Expand ATS Diagnostic HUD')} placement="left">
              <Paper
                elevation={3}
                onClick={() => setIsHudMinimized(false)}
                className="no-print"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 0,
                  zIndex: 10,
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 0.75,
                  py: 0.75,
                  px: 1.25,
                  borderTopLeftRadius: RADIUS_TOKENS.full,
                  borderBottomLeftRadius: RADIUS_TOKENS.full,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRight: 'none',
                  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.85 : 0.95),
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    transform: 'translateX(-3px)',
                  },
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.75rem' }}>
                  {auditScore > 0 ? auditScore : '--'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>•</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.75rem' }}>
                  {matchScore > 0 ? `${matchScore}%` : '--'}
                </Typography>
                <ChevronLeftRoundedIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.25 }} />
              </Paper>
            </Tooltip>
          ) : (
            /* B. When Normal: Unified Floating HUD Card */
            <Paper
              elevation={4}
              className="no-print"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                width: 215,
                p: 1.25,
                borderRadius: RADIUS_TOKENS.md,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.85 : 0.92),
                backdropFilter: 'blur(16px)',
                border: `1px solid ${scoreUpdated ? theme.palette.primary.main : theme.palette.divider}`,
                boxShadow: scoreUpdated
                  ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
                  : undefined,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {/* Header: Title + Minimize Button [›] */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', fontSize: '0.68rem', color: 'text.secondary' }}>
                    {t('preview:drawer.hudTitle', 'ATS Diagnostic')}
                  </Typography>
                </Box>
                <Tooltip title={t('preview:drawer.minimizeHud', 'Minimize')} placement="top">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHudMinimized(true);
                    }}
                    sx={{
                      p: 0.25,
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary', bgcolor: alpha(theme.palette.action.hover, 0.1) },
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* 2-Cell Grid: Quality Score & ATS Match */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                {/* Cell 1: Quality Score */}
                <Tooltip
                  title={scoreUpdated ? t('audit:liveRecalculated', 'Recalculated in real-time') : t('audit:title', 'Resume Quality Audit')}
                  placement="bottom"
                >
                  <Box
                    onClick={() => onToggleTab('audit')}
                    sx={{
                      p: 1,
                      borderRadius: RADIUS_TOKENS.sm,
                      bgcolor: alpha(theme.palette.success.main, isDark ? 0.18 : 0.08),
                      border: `1px solid ${scoreUpdated ? theme.palette.primary.main : alpha(theme.palette.success.main, 0.3)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, isDark ? 0.26 : 0.14),
                        transform: 'translateY(-1.5px)',
                        borderColor: theme.palette.success.main,
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        lineHeight: 1,
                        color: scoreUpdated ? 'primary.main' : 'success.main',
                      }}
                    >
                      {auditScore > 0 ? auditScore : '--'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.4,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        mt: 0.35,
                      }}
                    >
                      {t('preview:drawer.quality', 'Quality')}
                    </Typography>
                  </Box>
                </Tooltip>

                {/* Cell 2: ATS Match */}
                <Tooltip title={t('gap:matchScore', 'ATS Keyword Alignment')} placement="bottom">
                  <Box
                    onClick={() => onToggleTab('gap')}
                    sx={{
                      p: 1,
                      borderRadius: RADIUS_TOKENS.sm,
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.26 : 0.14),
                        transform: 'translateY(-1.5px)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        lineHeight: 1,
                        color: 'primary.main',
                      }}
                    >
                      {matchScore > 0 ? `${matchScore}%` : '--'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.4,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        mt: 0.35,
                      }}
                    >
                      {t('preview:drawer.match', 'Match')}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              {/* Bottom Action: Interview Prep */}
              <Tooltip title={t('preview:drawer.interviewPrep', 'AI Interview Gap Simulator')} placement="bottom">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onToggleTab('interview')}
                  startIcon={<PsychologyRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    py: 0.5,
                    color: theme.palette.secondary.main,
                    borderColor: alpha(theme.palette.secondary.main, 0.35),
                    bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.1 : 0.04),
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.1),
                    },
                  }}
                >
                  {t('preview:drawer.interviewPrepBtn', 'Interview Prep')}
                </Button>
              </Tooltip>
            </Paper>
          )}
        </>
      )}

      {/* 2. EXPANDED STATE: Unified Right-Side Panel */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: { xs: 'fixed', md: 'relative' },
            top: { xs: 'var(--navbar-height, 56px)', md: 'auto' },
            bottom: { xs: 0, md: 'auto' },
            right: 0,
            width: { xs: '100%', sm: 330, md: 330 },
            maxWidth: { xs: '100vw', sm: 330 },
            borderLeft: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            flexShrink: 0,
            zIndex: { xs: theme.zIndex.modal, md: 10 },
            boxSizing: 'border-box',
          }}
        >
          {/* Header with Segmented Tabs and Close [X] */}
          <Box
            sx={{
              p: 1,
              px: { xs: 1, sm: 1.5 },
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 0.75,
              bgcolor: 'background.default',
              boxSizing: 'border-box',
              width: '100%',
              minWidth: 0,
            }}
          >
            <ButtonGroup size="small" variant="outlined" sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
              <Button
                variant={activeTab === 'audit' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => onToggleTab('audit')}
                startIcon={<AssessmentRoundedIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  flex: 1,
                  fontWeight: 800,
                  fontSize: { xs: '0.68rem', sm: '0.74rem' },
                  textTransform: 'none',
                  px: { xs: 0.5, sm: 0.75 },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t('preview:drawer.shortScore', 'Audit')} {auditScore > 0 ? `${auditScore}/10` : '--'}
              </Button>
              <Button
                variant={activeTab === 'gap' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => onToggleTab('gap')}
                startIcon={<TrackChangesRoundedIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  flex: 1,
                  fontWeight: 800,
                  fontSize: { xs: '0.68rem', sm: '0.74rem' },
                  textTransform: 'none',
                  px: { xs: 0.5, sm: 0.75 },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t('preview:drawer.shortMatch', 'Match')} {matchScore > 0 ? `${matchScore}%` : '--'}
              </Button>
              <Button
                variant={activeTab === 'interview' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => onToggleTab('interview')}
                startIcon={<PsychologyRoundedIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  flex: 1,
                  fontWeight: 800,
                  fontSize: { xs: '0.68rem', sm: '0.74rem' },
                  textTransform: 'none',
                  px: { xs: 0.5, sm: 0.75 },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t('preview:drawer.shortInterview', 'Prep')}
              </Button>
            </ButtonGroup>

            <IconButton size="small" onClick={onClose} aria-label="Collapse panel" sx={{ flexShrink: 0, p: 0.5 }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Panel Content Body */}
          <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
            {/* TAB 1: AUDIT BREAKDOWN */}
            {activeTab === 'audit' && (
              <>
                <AuditScoreHero score={auditScore} />

                {/* Multidimensional Radar Chart in Lateral Drawer */}
                {radarDimensions.length >= 3 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.6),
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ width: '100%', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.85rem' }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        {t('audit:radar.title', 'Análisis Multidimensional de Afinidad')}
                      </Typography>
                      <Chip
                        size="small"
                        label={t('audit:radar.sevenAxes', '7 Ejes ATS')}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1.5, display: 'block', lineHeight: 1.35 }}>
                      {t('audit:radar.descShort', 'Pasa el cursor sobre los vértices para comparar tu puntuación actual vs la meta calibrada de la vacante.')}
                    </Typography>

                    <HexagonRadarChart
                      dimensions={radarDimensions}
                      size={275}
                      actualLabel={t('audit:radar.actualLabel', 'Actual')}
                      targetLabel={t('audit:radar.targetLabel', 'Objetivo para esta vacante')}
                      targetShortLabel={t('audit:radar.targetShort', 'Meta')}
                    />

                    {onOpenFullAudit && (
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={onOpenFullAudit}
                        sx={{
                          mt: 1.5,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          width: '100%',
                          py: 0.5,
                        }}
                      >
                        {t('audit:radar.openFullAudit', 'Ver Diagnóstico Completo y Palancas de Acción')}
                      </Button>
                    )}
                  </Paper>
                )}

                <AuditPillarsBreakdown
                  auditReport={auditReport}
                  onOpenAction={handleOpenAction}
                  getActionButtonLabel={getActionButtonLabel}
                />
              </>
            )}

            {/* TAB 2: GAP STRATEGY */}
            {activeTab === 'gap' && (
              <AuditGapTabContent
                matchScore={matchScore}
                companyName={companyName}
                targetRole={targetRole}
                matchedKeywords={matchedKeywords}
                missingKeywords={missingKeywords}
                hasGapMarkdown={Boolean(gapMarkdown)}
                onViewFullReport={() => setFullReportModalOpen(true)}
              />
            )}

            {/* TAB 3: INTERVIEW PREPARATION */}
            {activeTab === 'interview' && (
              <InterviewPrepTab
                gapKeywords={missingKeywords}
                companyName={companyName || ''}
                targetRole={targetRole || ''}
                cvData={cvData || { name: '', title: '', contacts: [], sections: [] }}
              />
            )}
          </Box>
        </Box>
      </Slide>


      {/* 3. Progressive Disclosure Dialog: Full Detailed Markdown Report */}
      {gapMarkdown && (
        <Dialog
          open={fullReportModalOpen}
          onClose={() => setFullReportModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{t('gap:title', 'Target Job Gap Analysis Report')}</span>
            <IconButton size="small" onClick={() => setFullReportModalOpen(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              className="gap-markdown-rendered"
              dangerouslySetInnerHTML={{ __html: safeMarkdown(gapMarkdown) }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={isReportCopied ? <CheckRoundedIcon color="success" /> : <ContentCopyRoundedIcon />}
              onClick={() => copyReport(gapMarkdown)}
            >
              {isReportCopied ? t('common:status.copied', 'Copied!') : t('common:actions.copy', 'Copy Report Text')}
            </Button>

            <Button variant="contained" onClick={() => setFullReportModalOpen(false)}>
              {t('common:actions.close', 'Close Report')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 4. Action Lever Dialog */}
      <AuditImprovementModal
        modalState={modalState}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onApply={handleApplyAction}
      />

      {/* 5. Toast Feedback */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </>
  );
});
