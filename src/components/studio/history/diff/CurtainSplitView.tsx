import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, Chip, useTheme, alpha } from '@mui/material';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import { useTranslation } from 'react-i18next';
import { CVData, ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../../../../types';
import { CVRenderer } from '../../../CVRenderer';

export interface CurtainSplitViewProps {
  dataA: CVData;
  dataB: CVData;
  labelA: string;
  labelB: string;
  themeA: string;
  themeB: string;
  paletteA: string;
  paletteB: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
}

export const CurtainSplitView: React.FC<CurtainSplitViewProps> = ({
  dataA,
  dataB,
  labelA,
  labelB,
  themeA,
  themeB,
  paletteA,
  paletteB,
  fontFamily = 'inter',
  spacingDensity = 'standard',
}) => {
  const { t } = useTranslation(['history', 'common']);
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveScale = Math.min(0.85, Math.max(0.42, (windowWidth - 48) / 794));

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handlePointerMove(e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Top Banner Guide */}
      <Box
        sx={{
          py: 1,
          px: 3,
          bgcolor: alpha(muiTheme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={`← A: ${labelA}`}
            color="default"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.74rem' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('history:diff.dragCurtain', 'Drag vertical curtain to compare layout shifts & density')}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={`B: ${labelB} →`}
          color="primary"
          variant="filled"
          sx={{ fontWeight: 700, fontSize: '0.74rem' }}
        />
      </Box>

      {/* Main Curtain Stage */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: { xs: 1.5, md: 3 },
          bgcolor: isDark ? alpha('#000', 0.3) : alpha('#000', 0.03),
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: `${794 * effectiveScale}px`,
            minHeight: `${1123 * effectiveScale}px`,
            margin: '0 auto',
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.7)' : '0 16px 40px rgba(0,0,0,0.14)',
            borderRadius: 1,
            bgcolor: '#ffffff',
            overflow: 'hidden',
            cursor: 'ew-resize',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Layer B (Background / Right Side) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '794px',
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
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

          {/* Layer A (Foreground / Left Side with dynamic clipping width) */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${sliderPosition}%`,
              height: '100%',
              overflow: 'hidden',
              borderRight: `2px solid ${muiTheme.palette.primary.main}`,
              boxShadow: '4px 0 12px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              bgcolor: '#ffffff',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
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

          {/* Draggable Divider Handle */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPosition}%`,
              transform: 'translate(-50%, -50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 10,
              cursor: 'ew-resize',
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.12)',
              },
            }}
          >
            <CompareArrowsRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
