import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { computeLineDiff } from '../../../utils/diffUtils';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useVersionDiffWorkflow } from '../../../hooks/useVersionDiffWorkflow';
import { formatLocalizedDate } from '../../../utils/dateUtils';

export interface VersionDiffModalProps {
  open: boolean;
  onClose: () => void;
  initialVersionAId?: string;
  initialVersionBId?: string;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  open,
  onClose,
  initialVersionAId,
  initialVersionBId,
}) => {
  const { t, i18n } = useTranslation(['history', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { masterData, cvMarkdown, savedVersions, applyVersion } = useVersionDiffWorkflow();

  const [versionAId, setVersionAId] = useState<string>(() => initialVersionAId || 'master');
  const [versionBId, setVersionBId] = useState<string>(() => {
    if (initialVersionBId) return initialVersionBId;
    if (savedVersions.length > 0) return savedVersions[0].id;
    return 'current';
  });

  React.useEffect(() => {
    if (open) {
      if (initialVersionAId) setVersionAId(initialVersionAId);
      if (initialVersionBId) setVersionBId(initialVersionBId);
    }
  }, [open, initialVersionAId, initialVersionBId]);

  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const { copy } = useCopyToClipboard();

  const genericVersion = useMemo(
    () => savedVersions.find((v) => v.isPinned || v.isGeneric),
    [savedVersions]
  );

  const allVersionOptions = useMemo(() => [
    { id: 'master', label: t('history:diff.masterCv', 'Original Career Profile') },
    { id: 'current', label: t('history:diff.currentTailored', 'Current Tailored CV (Editor)') },
    ...savedVersions.map((v) => {
      const pinPrefix = v.isPinned ? '📌 ' : v.isGeneric ? '⭐ ' : '';
      const genericSuffix = v.isGeneric ? ` [${t('preview:versionSelector.genericBadge', 'Genérico')}]` : '';
      const company = v.companyName || 'General';
      const role = v.targetRole ? ` • ${v.targetRole}` : '';
      const date = formatLocalizedDate(v.createdAt, i18n.language || 'en');
      return { id: v.id, label: `${pinPrefix}${company}${role}${genericSuffix} (${date})` };
    }),
  ], [savedVersions, i18n.language, t]);


  // Helper to resolve markdown content by ID
  const getVersionText = (id: string): { label: string; text: string } => {
    if (id === 'master') {
      return { label: t('history:diff.masterCv', 'Original Career Profile'), text: masterData };
    }

    if (id === 'current') {
      return { label: t('history:diff.currentTailored', 'Current Tailored CV (Editor)'), text: cvMarkdown };
    }
    const found = savedVersions.find((v) => v.id === id);
    if (found) {
      const company = found.companyName || 'General';
      const role = found.targetRole ? ` • ${found.targetRole}` : '';
      const date = formatLocalizedDate(found.createdAt, i18n.language || 'en');
      return { label: `${company}${role} (${date})`, text: found.cvMarkdown };
    }
    return { label: 'Unknown Version', text: '' };
  };

  const verA = useMemo(() => getVersionText(versionAId), [versionAId, masterData, savedVersions, i18n.language]);
  const verB = useMemo(() => getVersionText(versionBId), [versionBId, cvMarkdown, savedVersions, i18n.language]);

  // Compute diff
  const diffResult = useMemo(() => {
    return computeLineDiff(verA.text, verB.text);
  }, [verA.text, verB.text]);

  const handleCopyDiff = async () => {
    const rawDiff = diffResult.lines
      .map((l) => `${l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  '}${l.content}`)
      .join('\n');
    await copy(rawDiff);
    setSnackbar(t('common:actions.copied', 'Copied to clipboard!'));
  };

  const handleLoadVersionB = () => {
    applyVersion(versionBId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: '88vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          px: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <DifferenceRoundedIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {t('history:diff.title', 'Visual Version Diff Comparator')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('history:diff.subtitle', 'Compare tailored variants side-by-side or unified')}
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Close diff modal">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          p: 2,
          px: 3,
          bgcolor: alpha(theme.palette.text.primary, 0.02),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="diff-base-label">{t('history:diff.baseVersion', 'Base (Old)')}</InputLabel>
            <Select
              labelId="diff-base-label"
              value={versionAId}
              label={t('history:diff.baseVersion', 'Base (Old)')}
              onChange={(e) => setVersionAId(e.target.value)}
              sx={{ fontSize: '0.82rem', fontWeight: 600 }}
            >
              {allVersionOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.82rem' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CompareArrowsRoundedIcon sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="diff-target-label">{t('history:diff.targetVersion', 'Target (New)')}</InputLabel>
            <Select
              labelId="diff-target-label"
              value={versionBId}
              label={t('history:diff.targetVersion', 'Target (New)')}
              onChange={(e) => setVersionBId(e.target.value)}
              sx={{ fontSize: '0.82rem', fontWeight: 600 }}
            >
              {allVersionOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.82rem' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {genericVersion && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => {
                setVersionAId(genericVersion.id);
                setVersionBId('current');
              }}
              startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                height: 38,
                whiteSpace: 'nowrap',
              }}
            >
              {t('preview:versionSelector.compareAgainstGeneric', 'Comparar vs Genérico')}
            </Button>
          )}
        </Box>


        {/* View Mode Toggle: Unified vs Split */}
        <ButtonGroup size="small" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, mt: { xs: 1, md: 2 } }}>
          <Button
            variant={viewMode === 'unified' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('unified')}
            startIcon={<ViewAgendaRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
          >
            {t('history:diff.unified', 'Unified Diff')}
          </Button>
          <Button
            variant={viewMode === 'split' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('split')}
            startIcon={<ViewColumnRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
          >
            {t('history:diff.split', 'Side-by-Side')}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Stats Summary Bar */}
      <Box
        sx={{
          py: 1,
          px: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          size="small"
          label={`+${diffResult.stats.additions} ${t('history:diff.additions', 'Additions')}`}
          color="success"
          variant="filled"
          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
        />
        <Chip
          size="small"
          label={`-${diffResult.stats.deletions} ${t('history:diff.deletions', 'Deletions')}`}
          color="error"
          variant="filled"
          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
        />
        <Chip
          size="small"
          label={`${diffResult.stats.similarity}% ${t('history:diff.similarity', 'Match Similarity')}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
        />
        {diffResult.stats.metricsCount > 0 && (
          <Chip
            size="small"
            label={`${diffResult.stats.metricsCount} ${t('history:diff.metricsEnhanced', 'Metrics Enhanced')}`}
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
          />
        )}
      </Box>

      {/* Main Diff Code Display */}
      <DialogContent sx={{ p: 0, flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
        {viewMode === 'unified' ? (
          /* UNIFIED DIFF VIEW */
          <Box sx={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '0.82rem', lineHeight: 1.6 }}>
            {diffResult.lines.map((line, idx) => {
              const isAdded = line.type === 'added';
              const isRemoved = line.type === 'removed';

              let bg = 'transparent';
              let color = 'text.primary';
              let prefix = '  ';

              if (isAdded) {
                bg = alpha(theme.palette.success.main, isDark ? 0.18 : 0.12);
                color = 'success.main';
                prefix = '+ ';
              } else if (isRemoved) {
                bg = alpha(theme.palette.error.main, isDark ? 0.18 : 0.1);
                color = 'error.main';
                prefix = '- ';
              }

              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    bgcolor: bg,
                    color: color,
                    px: 2,
                    py: 0.25,
                    borderLeft: isAdded
                      ? `3px solid ${theme.palette.success.main}`
                      : isRemoved
                      ? `3px solid ${theme.palette.error.main}`
                      : '3px solid transparent',
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      width: 44,
                      userSelect: 'none',
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      textAlign: 'right',
                      pr: 2,
                      flexShrink: 0,
                    }}
                  >
                    {line.newLineNumber || line.oldLineNumber || ''}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 700,
                      width: 20,
                      userSelect: 'none',
                      color: isAdded ? 'success.main' : isRemoved ? 'error.main' : 'text.disabled',
                      flexShrink: 0,
                    }}
                  >
                    {prefix}
                  </Typography>
                  <Typography component="span" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, fontFamily: 'inherit' }}>
                    {line.content || ' '}
                  </Typography>
                </Box>
              );
            })}
          </Box>

        ) : (
          /* SIDE-BY-SIDE SPLIT VIEW */
          <Box sx={{ display: 'flex', height: '100%', minHeight: 400 }}>
            {/* Left Column: Version A */}
            <Box sx={{ flex: 1, borderRight: `1px solid ${theme.palette.divider}`, p: 2, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                {verA.label}
              </Typography>
              <Box sx={{ fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {verA.text}
              </Box>
            </Box>

            {/* Right Column: Version B */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                {verB.label}
              </Typography>
              <Box sx={{ fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {verB.text}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={handleCopyDiff}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          {t('history:diff.copyDiff', 'Copy Raw Diff')}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button size="small" variant="text" onClick={onClose}>
            {t('common:actions.close', 'Close')}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={handleLoadVersionB}
            sx={{ fontWeight: 700, textTransform: 'none', px: 2 }}
          >
            {t('history:diff.openInEditor', 'Load Version into Editor')}
          </Button>
        </Box>
      </DialogActions>

      {/* Toast Feedback */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
};
