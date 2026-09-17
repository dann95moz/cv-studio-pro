import React, { useState, useCallback } from 'react';
import { Box, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { useTranslation } from 'react-i18next';
import { ThemeId } from '../../../types/cv';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface ColumnLayoutConfig {
  side: 'left' | 'right';
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
}

export const TWO_COLUMN_CONFIGS: Partial<Record<ThemeId, ColumnLayoutConfig>> = {
  'academic-research': { side: 'left', defaultWidth: 34, minWidth: 24, maxWidth: 46 },
  'designer-uiux': { side: 'left', defaultWidth: 32, minWidth: 24, maxWidth: 46 },
  'euro-modern': { side: 'left', defaultWidth: 34, minWidth: 24, maxWidth: 46 },
  'two-column': { side: 'right', defaultWidth: 34, minWidth: 24, maxWidth: 46 },
  'executive': { side: 'right', defaultWidth: 38, minWidth: 24, maxWidth: 46 },
};

export interface ColumnResizeDividerProps {
  theme: ThemeId;
  paperRef: React.RefObject<HTMLDivElement | null>;
  sidebarWidth?: number;
  onSidebarWidthChange: (width?: number) => void;
}

/**
 * Interactive in-canvas column resize curtain (divider).
 * Allows tactile, real-time dragging to widen or narrow the sidebar/columns on 2-column templates.
 * Fully clamped to safe boundaries and 100% ignored in print/PDF export (.no-print).
 */
export const ColumnResizeDivider: React.FC<ColumnResizeDividerProps> = ({
  theme: activeThemeId,
  paperRef,
  sidebarWidth,
  onSidebarWidthChange,
}) => {
  const { t } = useTranslation('preview');
  const muiTheme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const config = TWO_COLUMN_CONFIGS[activeThemeId];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !paperRef.current || !config) return;
      const rect = paperRef.current.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;

      let rawPct: number;
      if (config.side === 'left') {
        rawPct = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        rawPct = ((rect.right - e.clientX) / rect.width) * 100;
      }

      const clamped = Math.round(Math.max(config.minWidth, Math.min(config.maxWidth, rawPct)));
      onSidebarWidthChange(clamped);
    },
    [isDragging, paperRef, config, onSidebarWidthChange]
  );

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSidebarWidthChange(undefined);
  };

  // Safe early return strictly AFTER all hooks have executed to preserve React Hook rules
  if (!config) return null;

  const currentWidth = sidebarWidth ?? config.defaultWidth;
  const isDefault = sidebarWidth === undefined || sidebarWidth === config.defaultWidth;

  // Position from left edge of paper sheet
  const positionPercent = config.side === 'left' ? currentWidth : 100 - currentWidth;

  const tooltipTitle = isDefault
    ? t('preview:resizer.dragHint', 'Arrastra para ajustar el ancho de la columna')
    : `${t('preview:resizer.columnWidth', { width: currentWidth })} • ${t('preview:resizer.doubleClickReset', 'Doble clic para restaurar')}`;

  return (
    <Box
      className="no-print cv-column-resizer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${positionPercent}%`,
        width: 24,
        marginLeft: '-12px',
        zIndex: 35,
        cursor: 'col-resize',
        touchAction: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central Guide Line */}
      <Box
        sx={{
          width: isDragging ? 3 : 2,
          height: '100%',
          bgcolor: isDragging
            ? 'primary.main'
            : isHovered
              ? alpha(muiTheme.palette.primary.main, 0.65)
              : 'transparent',
          boxShadow: isDragging
            ? `0 0 8px ${alpha(muiTheme.palette.primary.main, 0.6)}`
            : isHovered
              ? `0 0 4px ${alpha(muiTheme.palette.primary.main, 0.3)}`
              : 'none',
          transition: isDragging ? 'none' : 'background-color 0.15s ease, box-shadow 0.15s ease',
        }}
      />

      {/* Floating Grip Handle */}
      <Tooltip title={tooltipTitle} open={isHovered || isDragging} placement="top" arrow enterDelay={100}>
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            width: 20,
            height: 34,
            borderRadius: RADIUS_TOKENS.full,
            bgcolor: 'background.paper',
            border: `1.5px solid ${
              isDragging
                ? muiTheme.palette.primary.main
                : isHovered
                  ? alpha(muiTheme.palette.primary.main, 0.5)
                  : muiTheme.palette.divider
            }`,
            boxShadow: isDragging
              ? `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.35)}`
              : muiTheme.shadows[2],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered || isDragging ? 1 : 0.45,
            transform: isDragging ? 'scale(1.15)' : isHovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'opacity 0.2s ease, transform 0.15s ease, border-color 0.15s ease',
            pointerEvents: 'none',
          }}
        >
          <DragIndicatorRoundedIcon
            sx={{
              fontSize: 14,
              color: isDragging ? 'primary.main' : 'text.secondary',
            }}
          />
        </Box>
      </Tooltip>

      {/* Active Percentage Badge when Dragging */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 'calc(35% - 32px)',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 1,
            py: 0.25,
            borderRadius: RADIUS_TOKENS.full,
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            boxShadow: 3,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>
            {currentWidth}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};
