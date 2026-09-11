import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Slider,
} from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import { useTranslation } from 'react-i18next';
import { CVData, ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../../../../types';
import { CVRenderer } from '../../../CVRenderer';
import { getAllTemplates } from '../../../../templates';
import { CURATED_PALETTES } from '../../../../constants/palettes';

export interface VisualSplitViewProps {
  dataA: CVData;
  dataB: CVData;
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  themeA: string;
  themeB: string;
  onThemeAChange: (theme: string) => void;
  onThemeBChange: (theme: string) => void;
  paletteA: string;
  paletteB: string;
  onPaletteAChange: (palette: string) => void;
  onPaletteBChange: (palette: string) => void;
  isLinkedStyles: boolean;
  onToggleLinkedStyles: () => void;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
}

export const VisualSplitView: React.FC<VisualSplitViewProps> = ({
  dataA,
  dataB,
  labelA,
  labelB,
  scoreA,
  scoreB,
  themeA,
  themeB,
  onThemeAChange,
  onThemeBChange,
  paletteA,
  paletteB,
  onPaletteAChange,
  onPaletteBChange,
  isLinkedStyles,
  onToggleLinkedStyles,
  fontFamily = 'inter',
  spacingDensity = 'standard',
}) => {
  const { t } = useTranslation(['history', 'preview', 'gap', 'common']);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef<boolean>(false);

  const [activeMobileTab, setActiveMobileTab] = useState<'A' | 'B'>('B');
  const [zoomFactor, setZoomFactor] = useState<number>(0.72);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 900;
  const effectiveScale = isMobile
    ? Math.min(0.85, Math.max(0.38, (windowWidth - 48) / 794))
    : zoomFactor;

  // Synchronized scroll handler
  const handleScroll = useCallback((source: 'A' | 'B') => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    const srcEl = source === 'A' ? containerARef.current : containerBRef.current;
    const targetEl = source === 'A' ? containerBRef.current : containerARef.current;

    if (srcEl && targetEl) {
      const scrollRatio = srcEl.scrollTop / Math.max(1, srcEl.scrollHeight - srcEl.clientHeight);
      targetEl.scrollTop = scrollRatio * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  const templates = getAllTemplates();
  const palettes = Object.values(CURATED_PALETTES);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sub-toolbar: Template selectors, Linking toggle, and Zoom */}
      <Box
        sx={{
          py: 1,
          px: 2.5,
          bgcolor: alpha(muiTheme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Left Side: Template A Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`A: ${labelA}`}
            color="default"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.72rem', maxWidth: 180 }}
          />
          <Chip
            size="small"
            label={`${scoreA}%`}
            color={scoreA >= 80 ? 'success' : 'default'}
            variant="filled"
            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
          />

          <Select
            size="small"
            value={themeA}
            onChange={(e) => {
              onThemeAChange(e.target.value);
              if (isLinkedStyles) onThemeBChange(e.target.value);
            }}
            sx={{ height: 28, fontSize: '0.72rem', fontWeight: 600 }}
          >
            {templates.map((tpl) => (
              <MenuItem key={tpl.id} value={tpl.id} sx={{ fontSize: '0.74rem' }}>
                {tpl.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={paletteA}
            onChange={(e) => {
              onPaletteAChange(e.target.value);
              if (isLinkedStyles) onPaletteBChange(e.target.value);
            }}
            sx={{ height: 28, fontSize: '0.72rem', fontWeight: 600 }}
          >
            {palettes.map((pal) => (
              <MenuItem key={pal.id} value={pal.id} sx={{ fontSize: '0.74rem' }}>
                {pal.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Center: Style Linking Switch */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip
            title={
              isLinkedStyles
                ? t('history:diff.unlinkStyles', 'Linked Styles (Click to choose different templates)')
                : t('history:diff.linkStyles', 'Independent Styles (Click to synchronize template & color)')
            }
          >
            <IconButton
              size="small"
              onClick={onToggleLinkedStyles}
              color={isLinkedStyles ? 'primary' : 'default'}
              sx={{
                border: `1px solid ${isLinkedStyles ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
                bgcolor: isLinkedStyles ? alpha(muiTheme.palette.primary.main, 0.08) : 'transparent',
              }}
            >
              {isLinkedStyles ? <LinkRoundedIcon fontSize="small" /> : <LinkOffRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ fontWeight: 700, display: { xs: 'none', md: 'inline' } }}>
            {isLinkedStyles ? t('history:diff.linkStyles', 'Linked Styles') : t('history:diff.unlinkStyles', 'Custom Styles')}
          </Typography>
        </Box>

        {/* Right Side: Template B Controls & Zoom */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`B: ${labelB}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.72rem', maxWidth: 180 }}
          />
          <Chip
            size="small"
            label={`${scoreB}%`}
            color="success"
            variant="filled"
            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
          />

          <Select
            size="small"
            value={themeB}
            onChange={(e) => {
              onThemeBChange(e.target.value);
              if (isLinkedStyles) onThemeAChange(e.target.value);
            }}
            disabled={isLinkedStyles}
            sx={{ height: 28, fontSize: '0.72rem', fontWeight: 600 }}
          >
            {templates.map((tpl) => (
              <MenuItem key={tpl.id} value={tpl.id} sx={{ fontSize: '0.74rem' }}>
                {tpl.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={paletteB}
            onChange={(e) => {
              onPaletteBChange(e.target.value);
              if (isLinkedStyles) onPaletteAChange(e.target.value);
            }}
            disabled={isLinkedStyles}
            sx={{ height: 28, fontSize: '0.72rem', fontWeight: 600 }}
          >
            {palettes.map((pal) => (
              <MenuItem key={pal.id} value={pal.id} sx={{ fontSize: '0.74rem' }}>
                {pal.name}
              </MenuItem>
            ))}
          </Select>

          {/* Desktop Zoom Controls */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, width: 110 }}>
              <ZoomOutRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Slider
                size="small"
                value={zoomFactor}
                min={0.45}
                max={0.95}
                step={0.03}
                onChange={(_, val) => setZoomFactor(val as number)}
                aria-label="Zoom visual CVs"
              />
              <ZoomInRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Switch: Tab A vs Tab B */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
            bgcolor: alpha(muiTheme.palette.background.paper, 0.95),
          }}
        >
          <Box
            onClick={() => setActiveMobileTab('A')}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderBottom: activeMobileTab === 'A' ? `2px solid ${muiTheme.palette.primary.main}` : 'none',
              color: activeMobileTab === 'A' ? 'primary.main' : 'text.secondary',
            }}
          >
            A: {labelA}
          </Box>
          <Box
            onClick={() => setActiveMobileTab('B')}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderBottom: activeMobileTab === 'B' ? `2px solid ${muiTheme.palette.primary.main}` : 'none',
              color: activeMobileTab === 'B' ? 'primary.main' : 'text.secondary',
            }}
          >
            B: {labelB}
          </Box>
        </Box>
      )}

      {/* Dual Sheet Comparison Viewport */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          bgcolor: isDark ? alpha('#000', 0.3) : alpha('#000', 0.03),
        }}
      >
        {/* Left Column: Version A Canvas */}
        {(!isMobile || activeMobileTab === 'A') && (
          <Box
            ref={containerARef}
            onScroll={() => handleScroll('A')}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: { xs: 1.5, md: 3 },
              borderRight: !isMobile ? `1px solid ${muiTheme.palette.divider}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: `${794 * effectiveScale}px`,
                overflow: 'hidden',
                margin: '0 auto',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 12px 36px rgba(0,0,0,0.12)',
                borderRadius: 1,
                bgcolor: '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: '794px',
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <CVRenderer
                  data={dataA}
                  theme={themeA as ThemeId}
                  palette={paletteA as PaletteId}
                  fontFamily={fontFamily}
                  spacingDensity={spacingDensity}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Right Column: Version B Canvas */}
        {(!isMobile || activeMobileTab === 'B') && (
          <Box
            ref={containerBRef}
            onScroll={() => handleScroll('B')}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: { xs: 1.5, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: `${794 * effectiveScale}px`,
                overflow: 'hidden',
                margin: '0 auto',
                boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 12px 36px rgba(0,0,0,0.12)',
                borderRadius: 1,
                bgcolor: '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: '794px',
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <CVRenderer
                  data={dataB}
                  theme={themeB as ThemeId}
                  palette={paletteB as PaletteId}
                  fontFamily={fontFamily}
                  spacingDensity={spacingDensity}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
