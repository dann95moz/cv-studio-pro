import React, { useState } from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { safeMarkdown } from '../../utils/sanitize';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icons';
import { GapAnalysisViewProps } from '../../types';
import { useGapInfo } from '../../store';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export type { GapAnalysisViewProps };

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  gapMarkdown,
  matchScore: propMatchScore,
  keywords: propKeywords,
  companyName,
  targetRole,
  onDownload
}) => {
  const { t } = useTranslation(['gap', 'common', 'preview']);
  const hookGapInfo = useGapInfo();
  const matchScore = propMatchScore ?? hookGapInfo.matchScore;
  const keywords = propKeywords ?? hookGapInfo.keywords;
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = () => {
    if (!gapMarkdown) return;
    copy(gapMarkdown);
  };


  return (
    <div className="gap-analysis-container">
      {/* Hero Banner */}
      <div className="gap-hero-banner">
        <div className="gap-score-badge">
          <span className="score-percent">{matchScore}%</span>
          <span className="score-label">{t('gap:matchScore', 'Estimated Match')}</span>
        </div>

        <div className="gap-hero-text">
          <div className="target-pill">
            <Icon type="target" size={13} />
            <span>Target: <strong>{companyName || 'Target Company'}</strong> • {targetRole || 'Target Role'}</span>
          </div>
          <h2 className="gap-title">{t('gap:title', 'Matching Strategy & Gap Report')}</h2>
          <p className="gap-desc">
            {t('gap:subtitle', 'Cross-references your background against employer requirements and highlights strategic mitigation.')}
          </p>
        </div>

        <Box className="gap-actions" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={handleCopy}
            title={t('common:actions.copy', 'Copy')}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {copied ? t('preview:toolbar.copied', 'Copied!') : t('common:actions.copy', 'Copy Text')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={onDownload}
            title={t('gap:downloadReport', 'Export Gap Report (.md)')}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common:actions.export', 'Export Report (.md)')}
          </Button>
        </Box>
      </div>

      {/* Keywords Tag Cloud */}
      <div className="gap-card">
        <div className="card-header">
          <span className="card-icon">
            <Icon type="sparkles" size={16} />
          </span>
          <h3 className="card-title">{t('gap:integratedKeywords', 'Critical Integrated Keywords')}</h3>
        </div>
        <div className="keywords-cloud">
          {keywords.map((kw, i) => (
            <span key={i} className="keyword-pill">
              <Icon type="check" size={11} /> {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Full Gap Report Formatted / Markdown View */}
      <div className="gap-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="card-icon">
              <Icon type="file-text" size={16} />
            </span>
            <h3 className="card-title">{t('gap:title', 'Strategic Alignment Narrative')}</h3>
          </div>

          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={viewMode === 'formatted' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('formatted')}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
            >
              {t('target:editor.formattedPreview', 'Formatted Report')}
            </Button>
            <Button
              variant={viewMode === 'raw' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('raw')}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
            >
              {t('target:editor.editText', 'Markdown Source')}
            </Button>
          </ButtonGroup>
        </div>

        {viewMode === 'formatted' ? (
          <div 
            className="gap-markdown-rendered"
            dangerouslySetInnerHTML={{
              __html: safeMarkdown(gapMarkdown || '*No gap analysis available yet. Generate a tailored CV first.*')
            }}
          />
        ) : (
          <div className="gap-markdown-rendered">
            <pre className="gap-raw-text">{gapMarkdown || 'No gap analysis available yet. Generate a tailored CV first.'}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
