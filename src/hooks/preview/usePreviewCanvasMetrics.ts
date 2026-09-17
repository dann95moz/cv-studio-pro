import { useState, useRef, useEffect, useCallback } from 'react';
import { PageFormat, ThemeId, PaletteId, FontFamilyId, SpacingDensity, PreviewSidePanelType } from '../../types';
import { getPageFormatConfig } from '../../theme/dimensions';

export interface UsePreviewCanvasMetricsProps {
  cvMarkdown: string;
  theme: ThemeId;
  palette: PaletteId;
  customColor: string;
  fontFamily: FontFamilyId;
  spacingDensity: SpacingDensity;
  setSpacingDensity: (density: SpacingDensity) => void;
  setFontFamily: (font: FontFamilyId) => void;
  pageFormat: PageFormat;
  activeSidePanel: PreviewSidePanelType | null;
  isAuditGapOpen: boolean;
  isHudMinimized: boolean;
}

/**
 * Domain Hook: usePreviewCanvasMetrics
 * Encapsulates A4/Letter page dimensions, ResizeObserver measurement of rendered document height,
 * responsive canvas scaling, overflow calculations, and single-page magic auto-fit.
 */
export function usePreviewCanvasMetrics({
  cvMarkdown,
  theme,
  palette,
  customColor,
  fontFamily,
  spacingDensity,
  setSpacingDensity,
  setFontFamily,
  pageFormat,
  activeSidePanel,
  isAuditGapOpen,
  isHudMinimized,
}: UsePreviewCanvasMetricsProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const formatConfig = getPageFormatConfig(pageFormat);
  const targetPagePx = formatConfig.heightPx;
  const targetPageWidthPx = formatConfig.widthPx;

  const [sheetHeight, setSheetHeight] = useState<number>(targetPagePx || 1123);
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('preview');
  const [mobileZoomMode, setMobileZoomMode] = useState<'fit' | '100%'>('fit');

  // Measure rendered paper sheet height whenever styling, content or format changes
  useEffect(() => {
    const updateHeight = () => {
      if (paperRef.current && paperRef.current.scrollHeight > 0) {
        setSheetHeight(paperRef.current.scrollHeight);
      }
    };
    updateHeight();
    const timer = setTimeout(updateHeight, 150);
    const observer = new ResizeObserver(updateHeight);
    if (paperRef.current) {
      observer.observe(paperRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [cvMarkdown, theme, palette, customColor, fontFamily, spacingDensity, pageFormat]);

  // Auto-calculate scale factor for responsive canvas preview across all breakpoints
  useEffect(() => {
    const calculateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth;
      if (containerWidth <= 0) return;

      if (mobileZoomMode === '100%') {
        setCanvasScale(1);
        return;
      }

      // Available width accounts for container padding and floating HUD allowance on desktop
      const isDesktop = containerWidth >= 900;
      const hudAllowance = isDesktop && !isAuditGapOpen && !isHudMinimized ? 230 : 0;
      const basePadding = containerWidth < 500 ? 16 : containerWidth < 900 ? 32 : 56;
      const totalReservedWidth = basePadding + hudAllowance;
      const availableWidth = Math.max(280, containerWidth - totalReservedWidth);

      if (availableWidth < targetPageWidthPx) {
        const scale = Math.min(1, Math.max(0.35, availableWidth / targetPageWidthPx));
        setCanvasScale(scale);
      } else {
        setCanvasScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    const observer = new ResizeObserver(calculateScale);
    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateScale);
      observer.disconnect();
    };
  }, [targetPageWidthPx, mobileViewMode, mobileZoomMode, activeSidePanel, isAuditGapOpen, isHudMinimized]);

  const isOverflowing = sheetHeight > targetPagePx + 8;
  const estimatedPages = isOverflowing ? Math.max(2, Math.ceil(sheetHeight / targetPagePx)) : 1;
  const overflowPercentage = isOverflowing
    ? Math.round(((sheetHeight - targetPagePx) / targetPagePx) * 100)
    : 0;

  const handleMagicAutoFit = useCallback(() => {
    if (spacingDensity === 'spacious') {
      setSpacingDensity('standard');
    } else if (spacingDensity === 'standard') {
      setSpacingDensity('compact');
    } else if (fontFamily === 'serif' || fontFamily === 'mono') {
      setFontFamily('inter');
    }
  }, [spacingDensity, fontFamily, setSpacingDensity, setFontFamily]);

  return {
    paperRef,
    canvasContainerRef,
    sheetHeight,
    canvasScale,
    targetPagePx,
    targetPageWidthPx,
    formatConfig,
    isOverflowing,
    estimatedPages,
    overflowPercentage,
    mobileViewMode,
    setMobileViewMode,
    mobileZoomMode,
    setMobileZoomMode,
    handleMagicAutoFit,
  };
}
