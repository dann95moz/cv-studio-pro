import React, { useState, useMemo, useEffect } from 'react';
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
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { computeLineDiff } from '../../../utils/diffUtils';
import { computeVisualCvDiff } from '../../../utils/cvVisualDiff';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useVersionDiffWorkflow } from '../../../hooks/useVersionDiffWorkflow';
import { formatLocalizedDate } from '../../../utils/dateUtils';
import { VisualSplitView, CurtainSplitView, TextDiffView } from './diff';

export interface VersionDiffModalProps {
  open: boolean;
  onClose: () => void;
  initialVersionAId?: string;
  initialVersionBId?: string;
}

export type DiffViewMode = 'visual' | 'curtain' | 'text';

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  open,
  onClose,
  initialVersionAId,
  initialVersionBId,
}) => {
  const { t, i18n } = useTranslation(['history', 'preview', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const {
    savedVersions,
    resolveVersion,
    applyVersion,
    currentTheme,
    currentPalette,
    currentFontFamily,
    currentSpacingDensity,
  } = useVersionDiffWorkflow();

  const [versionAId, setVersionAId] = useState<string>(() => initialVersionAId || 'master');
  const [versionBId, setVersionBId] = useState<string>(() => {
    if (initialVersionBId) return initialVersionBId;
    if (savedVersions.length > 0) return savedVersions[0].id;
    return 'current';
  });

  useEffect(() => {
    if (open) {
      if (initialVersionAId) setVersionAId(initialVersionAId);
      if (initialVersionBId) setVersionBId(initialVersionBId);
    }
  }, [open, initialVersionAId, initialVersionBId]);

  const [viewMode, setViewMode] = useState<DiffViewMode>('visual');
  const [textSubMode, setTextSubMode] = useState<'unified' | 'split'>('unified');
  const [isLinkedStyles, setIsLinkedStyles] = useState<boolean>(true);

  // Template and palette local state for independent or linked comparison
  const [themeA, setThemeA] = useState<string>(currentTheme);
  const [themeB, setThemeB] = useState<string>(currentTheme);
  const [paletteA, setPaletteA] = useState<string>(currentPalette);
  const [paletteB, setPaletteB] = useState<string>(currentPalette);

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

  const verA = useMemo(() => resolveVersion(versionAId), [versionAId, resolveVersion]);
  const verB = useMemo(() => resolveVersion(versionBId), [versionBId, resolveVersion]);

  // Synchronize themes when versions change
  useEffect(() => {
    if (verA.theme) setThemeA(verA.theme);
    if (verA.palette) setPaletteA(verA.palette);
  }, [verA.id, verA.theme, verA.palette]);

  useEffect(() => {
    if (verB.theme) setThemeB(verB.theme);
    if (verB.palette) setPaletteB(verB.palette);
  }, [verB.id, verB.theme, verB.palette]);

  // Deep visual semantic diff
  const visualDiffResult = useMemo(() => {
    return computeVisualCvDiff(verA.cvData, verB.cvData);
  }, [verA.cvData, verB.cvData]);

  // Text code diff
  const textDiffResult = useMemo(() => {
    return computeLineDiff(verA.cvMarkdown, verB.cvMarkdown);
  }, [verA.cvMarkdown, verB.cvMarkdown]);

  const handleCopyDiff = async () => {
    const rawDiff = textDiffResult.lines
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
      fullScreen={isMobile}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: isMobile ? '100%' : '92vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          py: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.default',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <DifferenceRoundedIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '1rem' }, lineHeight: 1.2 }}>
              {t('history:diff.title', 'Visual Version Diff & Template Comparator')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {t('history:diff.subtitle', 'Compare tailored variants and templates side-by-side with WYSIWYG fidelity')}
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Close diff modal" sx={{ ml: 1, flexShrink: 0 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Primary Controls Toolbar */}
      <Box
        sx={{
          py: { xs: 0.75, sm: 1.25 },
          px: { xs: 1.5, sm: 3 },
          bgcolor: alpha(theme.palette.text.primary, 0.02),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
          flexShrink: 0,
        }}
      >
        {/* Mode Toggles: Visual vs Curtain vs Text */}
        <ButtonGroup
          size="small"
          variant="outlined"
          sx={{
            width: { xs: '100%', md: 'auto' },
            order: { xs: 1, md: 2 },
            height: { xs: 32, sm: 36 },
          }}
        >
          <Button
            fullWidth={isMobile}
            variant={viewMode === 'visual' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('visual')}
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.75rem' }, px: { xs: 1, sm: 1.5 }, whiteSpace: 'nowrap' }}
          >
            {isMobile ? t('history:diff.modeVisualShort', 'Side-by-Side') : t('history:diff.modeVisual', 'Side-by-Side')}
          </Button>
          <Button
            fullWidth={isMobile}
            variant={viewMode === 'curtain' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('curtain')}
            startIcon={<ViewColumnRoundedIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.75rem' }, px: { xs: 1, sm: 1.5 }, whiteSpace: 'nowrap' }}
          >
            {isMobile ? t('history:diff.modeCurtainShort', 'Cortina') : t('history:diff.modeCurtain', 'Cortina')}
          </Button>
          <Button
            fullWidth={isMobile}
            variant={viewMode === 'text' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('text')}
            startIcon={<CodeRoundedIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.75rem' }, px: { xs: 1, sm: 1.5 }, whiteSpace: 'nowrap' }}
          >
            {isMobile ? t('history:diff.modeTextShort', 'Diff') : t('history:diff.modeText', 'Diff')}
          </Button>
        </ButtonGroup>

        {/* Version Selectors */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            order: { xs: 2, md: 1 },
            width: { xs: '100%', md: 'auto' },
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
          }}
        >
          <FormControl size="small" sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { xs: 0, sm: 200 } }}>
            {!isMobile && <InputLabel id="diff-base-label">{t('history:diff.baseVersion', 'Base (Old)')}</InputLabel>}
            <Select
              labelId={!isMobile ? "diff-base-label" : undefined}
              value={versionAId}
              label={!isMobile ? t('history:diff.baseVersion', 'Base (Old)') : undefined}
              onChange={(e) => setVersionAId(e.target.value)}
              sx={{ height: { xs: 32, sm: 38 }, fontSize: { xs: '0.72rem', sm: '0.82rem' }, fontWeight: 600 }}
            >
              {allVersionOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.78rem' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CompareArrowsRoundedIcon sx={{ color: 'text.secondary', fontSize: { xs: 16, sm: 20 }, flexShrink: 0 }} />

          <FormControl size="small" sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { xs: 0, sm: 200 } }}>
            {!isMobile && <InputLabel id="diff-target-label">{t('history:diff.targetVersion', 'Target (New)')}</InputLabel>}
            <Select
              labelId={!isMobile ? "diff-target-label" : undefined}
              value={versionBId}
              label={!isMobile ? t('history:diff.targetVersion', 'Target (New)') : undefined}
              onChange={(e) => setVersionBId(e.target.value)}
              sx={{ height: { xs: 32, sm: 38 }, fontSize: { xs: '0.72rem', sm: '0.82rem' }, fontWeight: 600 }}
            >
              {allVersionOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.78rem' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {genericVersion && (
            isMobile ? (
              <Tooltip title={t('preview:versionSelector.compareAgainstGeneric', 'Comparar vs Genérico')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setVersionAId(genericVersion.id);
                    setVersionBId('current');
                  }}
                  sx={{
                    height: 32,
                    width: 32,
                    border: `1px solid ${theme.palette.primary.main}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    flexShrink: 0,
                  }}
                  aria-label="Compare vs Generic"
                >
                  <CompareArrowsRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            ) : (
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
            )
          )}
        </Box>
      </Box>

      {/* Stats Summary Bar */}
      <Box
        sx={{
          py: { xs: 0.5, sm: 0.75 },
          px: { xs: 1.5, sm: 3 },
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Chip
          size="small"
          label={`+${visualDiffResult.stats.additions}${isMobile ? '' : ` ${t('history:diff.additions', 'Additions')}`}`}
          color="success"
          variant="filled"
          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
        />
        <Chip
          size="small"
          label={`-${visualDiffResult.stats.deletions}${isMobile ? '' : ` ${t('history:diff.deletions', 'Deletions')}`}`}
          color="error"
          variant="filled"
          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
        />
        <Chip
          size="small"
          label={`${visualDiffResult.stats.similarity}%${isMobile ? '' : ` ${t('history:diff.similarity', 'Match Similarity')}`}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
        />
        {visualDiffResult.stats.metricsCount > 0 && (
          <Chip
            size="small"
            label={`${visualDiffResult.stats.metricsCount}${isMobile ? ' métricas' : ` ${t('history:diff.metricsEnhanced', 'Metrics Enhanced')}`}`}
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
          />
        )}
      </Box>

      {/* Main Diff Content Container */}
      <DialogContent sx={{ p: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {viewMode === 'visual' && (
          <VisualSplitView
            dataA={visualDiffResult.dataAWithDiff}
            dataB={visualDiffResult.dataBWithDiff}
            labelA={verA.label}
            labelB={verB.label}
            scoreA={verA.matchScore}
            scoreB={verB.matchScore}
            themeA={themeA}
            themeB={themeB}
            onThemeAChange={setThemeA}
            onThemeBChange={setThemeB}
            paletteA={paletteA}
            paletteB={paletteB}
            onPaletteAChange={setPaletteA}
            onPaletteBChange={setPaletteB}
            isLinkedStyles={isLinkedStyles}
            onToggleLinkedStyles={() => setIsLinkedStyles((prev) => !prev)}
            fontFamily={currentFontFamily}
            spacingDensity={currentSpacingDensity}
          />
        )}

        {viewMode === 'curtain' && (
          <CurtainSplitView
            dataA={visualDiffResult.dataAWithDiff}
            dataB={visualDiffResult.dataBWithDiff}
            labelA={verA.label}
            labelB={verB.label}
            themeA={themeA}
            themeB={themeB}
            paletteA={paletteA}
            paletteB={paletteB}
            fontFamily={currentFontFamily}
            spacingDensity={currentSpacingDensity}
          />
        )}

        {viewMode === 'text' && (
          <TextDiffView
            diffResult={textDiffResult}
            verALabel={verA.label}
            verAText={verA.cvMarkdown}
            verBLabel={verB.label}
            verBText={verB.cvMarkdown}
            subMode={textSubMode}
            onSubModeChange={setTextSubMode}
          />
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          py: 1,
          px: { xs: 1.5, sm: 3 },
          justifyContent: 'space-between',
          borderTop: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          bgcolor: 'background.default',
        }}
      >
        {isMobile ? (
          <Tooltip title={t('history:diff.copyDiff', 'Copy Raw Diff')}>
            <IconButton
              size="small"
              onClick={handleCopyDiff}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                height: 36,
                width: 36,
              }}
              aria-label="Copy Raw Diff"
            >
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyRoundedIcon />}
            onClick={handleCopyDiff}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            {t('history:diff.copyDiff', 'Copy Raw Diff')}
          </Button>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" variant="text" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common:actions.close', 'Close')}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleLoadVersionB}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.76rem', sm: '0.82rem' },
              whiteSpace: 'nowrap',
              height: 36,
            }}
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
