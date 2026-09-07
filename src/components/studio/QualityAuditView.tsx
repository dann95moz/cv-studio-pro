import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { Icon } from '../Icons';
import { QualityAuditViewProps } from '../../types';
import { HexagonRadarChart, RadarDimension } from '../atoms/HexagonRadarChart';
import { buildRadarDimensions } from '../../utils/auditUtils';
import { downloadTextFile, buildTimestampedFileName } from '../../utils/fileUtils';
import { AuditImprovementModal } from './audit/AuditImprovementModal';
import { AuditSectionCard } from './audit/AuditSectionCard';
import { useAuditActions } from '../../hooks/useAuditActions';
import { useAuditReport } from '../../store';

export type { QualityAuditViewProps };

export const QualityAuditView: React.FC<QualityAuditViewProps> = ({
  report: propReport,
  onRefresh
}) => {
  const hookReport = useAuditReport();
  const report = propReport || hookReport;
  const { t } = useTranslation(['audit', 'common']);
  const theme = useTheme();
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

  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const allExpanded = report.sections.length > 0 && report.sections.every((_, idx) => expandedSections[idx]);

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedSections({});
    } else {
      const all: Record<number, boolean> = {};
      report.sections.forEach((_, idx) => {
        all[idx] = true;
      });
      setExpandedSections(all);
    }
  };

  const handleToggleSection = (idx: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleDownloadReport = () => {
    const candidate = report.candidateName.replace(/\s+/g, '_');
    const baseName = `Quality_Report_${candidate}`;
    const fileName = buildTimestampedFileName(baseName, 'md');
    downloadTextFile(report.markdownReport, fileName);
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return theme.palette.success.main;
    if (score >= 8.0) return theme.palette.primary.main;
    if (score >= 7.0) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const radarDimensions: RadarDimension[] = React.useMemo(
    () => buildRadarDimensions(report.sections || [], t),
    [report.sections, t]
  );

  return (
    <div className="audit-dashboard-container">
      {/* Top Overview Banner */}
      <div className="audit-score-hero">
        <div className="score-gauge-box">
          <div 
            className="score-circle-outer"
            style={{ borderColor: getScoreColor(report.overallScore) }}
          >
            <span className="score-number">{report.overallScore}</span>
            <span className="score-max">/ 10.0</span>
          </div>
          <div className="score-meta-text">
            <div className="readiness-badge">
              <Icon type="check-circle" size={14} /> {t('common:status.ready', 'Application Readiness')}: <strong>{t('common:status.ready', 'Ready to Submit')}</strong>
            </div>
            <h2 className="audit-hero-title">{t('audit:title', 'Resume Quality & ATS Audit')}</h2>
            <p className="audit-hero-desc">
              Candidate: <strong>{report.candidateName}</strong> • Target: <strong>{report.targetCompany}</strong>
            </p>
          </div>
        </div>

        <Box className="audit-hero-actions" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined"
            size="small"
            color="inherit"
            onClick={onRefresh}
            title={t('audit:refreshScore', 'Recalculate audit scores')}
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common:actions.refresh', 'Re-Calculate')}
          </Button>
          <Button 
            variant="outlined"
            size="small"
            color="inherit"
            onClick={handleDownloadReport}
            title={t('gap:downloadReport', 'Download full markdown audit report')}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common:actions.export', 'Export Report (.md)')}
          </Button>
        </Box>
      </div>

      {/* Hexagonal Radar Chart Multidimensional Affinity */}
      {radarDimensions.length >= 3 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: { xs: '100%', md: 380 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon type="star" size={18} /> {t('audit:radar.title', 'Análisis Multidimensional de Afinidad')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('audit:radar.desc', 'Radiografía ejecutiva de tus 7 dimensiones ATS. Pasa el cursor sobre los vértices para ver acciones concretas de mejora.')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {t('audit:radar.legend', 'Dimensiones clave evaluadas:')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • <strong>{t('audit:dimensions.experience', 'Impacto')}</strong>: {t('audit:radar.xyzHint', 'Fórmula Google XYZ y métricas cuantificables')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • <strong>{t('audit:dimensions.skills', 'Habilidades')}</strong>: {t('audit:radar.skillsHint', 'Segmentación temática y densidad de palabras clave')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <HexagonRadarChart
              dimensions={radarDimensions}
              size={320}
              actualLabel={t('audit:radar.actualLabel', 'Actual')}
              targetLabel={t('audit:radar.targetLabel', 'Objetivo para esta vacante')}
              targetShortLabel={t('audit:radar.targetShort', 'Meta')}
            />
          </Box>
        </Paper>
      )}

      {/* Section Breakdown */}
      <div className="audit-section-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 className="section-group-title" style={{ margin: 0 }}>
            <Icon type="gauge" size={18} /> {t('audit:subtitle', 'Section Diagnostic & Action Levers')}
          </h3>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToggleAll}
            sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.25, px: 1.5 }}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        <div className="audit-cards-grid">
          {report.sections.map((sec, idx) => (
            <AuditSectionCard
              key={idx}
              section={sec}
              scoreColor={getScoreColor(sec.score)}
              onExecuteAction={handleOpenAction}
              getActionButtonLabel={getActionButtonLabel}
              isExpanded={Boolean(expandedSections[idx])}
              onToggle={() => handleToggleSection(idx)}
            />
          ))}
        </div>
      </div>

      {/* Strategic Growth Pillars */}
      <div className="audit-section-group">
        <h3 className="section-group-title">
          <Icon type="star" size={18} /> 2. Strategic Growth Levers (Top 5% Candidate Ceiling)
        </h3>

        <div className="growth-pillars-list">
          {report.strategicPillars.map((p, idx) => (
            <div key={idx} className="growth-pillar-card">
              <div className="pillar-header">
                <h4 className="pillar-name">{p.pillarName}</h4>
                <span className={`impact-badge ${p.impactLevel.toLowerCase().replace(/\s+/g, '-')}`}>
                  Impact: {p.impactLevel}
                </span>
              </div>
              <p className="pillar-diag"><strong>Diagnostic:</strong> {p.diagnostic}</p>
              <div className="pillar-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon type="zap" size={14} />
                  <span><strong>Recommended Action:</strong> {p.recommendationForMasterData}</span>
                </div>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenAction(p.recommendationForMasterData, p.pillarName)}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.25, px: 1 }}
                >
                  Execute Lever
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Dialog */}
      <AuditImprovementModal
        modalState={modalState}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onApply={handleApplyAction}
      />

      {/* Snackbar Feedback */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
};
