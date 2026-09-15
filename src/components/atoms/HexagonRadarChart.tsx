import React, { useState } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getLocalizedAuditRecommendation } from '../../utils/auditUtils';

export interface RadarDimension {
  key: string;
  label: string;
  score: number; // Actual candidate score (0 to 10)
  targetScore?: number; // Calibrated target score for this specific vacancy (0 to 10)
  maxScore?: number; // Default 10
  recommendation?: string;
}

export interface HexagonRadarChartProps {
  dimensions: RadarDimension[];
  size?: number;
  className?: string;
  actualLabel?: string;
  targetLabel?: string;
  targetShortLabel?: string;
}

/**
 * High-fidelity 2-Layer Multidimensional Radar Chart (SVG Nativo).
 * Displays:
 *  - Blue solid line with vertex dots: Actual Candidate Score
 *  - Orange dashed line with vertex dots: Calibrated Target for this specific vacancy
 *  - Concentric polygonal grid with scale markers (2, 4, 6, 8, 10)
 *  - Zero heavy external dependencies (no recharts bloat), 100% React 19 & MUI token compatible.
 */
export const HexagonRadarChart: React.FC<HexagonRadarChartProps> = ({
  dimensions,
  size = 340,
  className = '',
  actualLabel,
  targetLabel,
  targetShortLabel,
}) => {
  const { t } = useTranslation(['audit', 'common']);
  const displayActualLabel = actualLabel || t('audit:radar.actualLabel', 'Actual');
  const displayTargetLabel = targetLabel || t('audit:radar.targetLabel', 'Objetivo para esta vacante');
  const displayTargetShort = targetShortLabel || t('audit:radar.targetShort', 'Meta');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const numAxes = dimensions.length;
  if (numAxes < 3) return null;

  const center = size / 2;
  const maxRadius = (size / 2) - 58; // margin for outer text labels
  const svgPadding = 55;

  const angleStep = (2 * Math.PI) / numAxes;
  const startAngle = -Math.PI / 2; // Point top vertex straight up

  const getCoordinates = (index: number, radius: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Concentric grid levels (2, 4, 6, 8, 10 on a 10-point scale)
  const gridLevels = [
    { level: 0.2, label: '2' },
    { level: 0.4, label: '4' },
    { level: 0.6, label: '6' },
    { level: 0.8, label: '8' },
    { level: 1.0, label: '10' },
  ];

  const gridPolygons = gridLevels.map(({ level }) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, maxRadius * level);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Calculate coordinates for Actual scores
  const actualCoords = dimensions.map((dim, i) => {
    const max = dim.maxScore || 10;
    const normalized = Math.max(0.08, Math.min(1, dim.score / max));
    return getCoordinates(i, maxRadius * normalized);
  });
  const actualPoints = actualCoords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  // Calculate coordinates for Target scores (calibrated per vacancy, default 9.0)
  const targetCoords = dimensions.map((dim, i) => {
    const max = dim.maxScore || 10;
    const target = dim.targetScore !== undefined ? dim.targetScore : 9.0;
    const normalized = Math.max(0.08, Math.min(1, target / max));
    return getCoordinates(i, maxRadius * normalized);
  });
  const targetPoints = targetCoords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const primaryColor = theme.palette.primary.main;
  const targetColor = theme.palette.mode === 'dark' ? '#fb923c' : '#ea580c'; // Vibrant warm orange
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
  const spokeStroke = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: { xs: '100%', sm: size + 60 },
        mx: 'auto',
        position: 'relative',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
        p: { xs: 0.5, sm: 1 },
      }}
    >
      {/* Top Legend Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        {/* Actual Series Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: primaryColor,
              display: 'inline-block',
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
            {displayActualLabel}
          </Typography>
        </Box>

        {/* Target Series Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 16,
              height: 0,
              borderTop: `2.5px dashed ${targetColor}`,
              display: 'inline-block',
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.82rem' }}>
            {displayTargetLabel}
          </Typography>
        </Box>
      </Box>

      {/* SVG Canvas */}
      <svg
        viewBox={`-${svgPadding} -${svgPadding} ${size + svgPadding * 2} ${size + svgPadding * 2}`}
        width="100%"
        height="auto"
        style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}
      >
        {/* Concentric Grid Polygons */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={pts}
            fill="none"
            stroke={gridStroke}
            strokeWidth={idx === gridPolygons.length - 1 ? '1.5' : '1'}
          />
        ))}

        {/* Radial Spokes from Center to outer vertices */}
        {Array.from({ length: numAxes }).map((_, i) => {
          const outer = getCoordinates(i, maxRadius);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke={spokeStroke}
              strokeWidth="1"
            />
          );
        })}

        {/* Scale Numbers on Vertical Top Axis (2, 4, 6, 8, 10) */}
        {gridLevels.map(({ level, label }) => {
          const yPos = center - maxRadius * level;
          return (
            <text
              key={`scale-${label}`}
              x={center + 6}
              y={yPos + 3}
              fontSize="9"
              fontWeight={600}
              fill={theme.palette.text.disabled}
              textAnchor="start"
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          );
        })}

        {/* Series 2: TARGET FOR THIS VACANCY (Orange Dashed Outline, No fill to avoid noise) */}
        <polygon
          points={targetPoints}
          fill="none"
          stroke={targetColor}
          strokeWidth="2"
          strokeDasharray="5 4"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Target Dots on vertices */}
        {targetCoords.map((coord, i) => (
          <circle
            key={`target-dot-${i}`}
            cx={coord.x}
            cy={coord.y}
            r="4"
            fill={targetColor}
            stroke={theme.palette.background.paper}
            strokeWidth="1.5"
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* Series 1: ACTUAL SCORE (Blue Solid Outline with Light Blue Fill) */}
        <polygon
          points={actualPoints}
          fill={alpha(primaryColor, 0.16)}
          stroke={primaryColor}
          strokeWidth="2.5"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Actual Dots on vertices */}
        {actualCoords.map((coord, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <circle
              key={`actual-dot-${i}`}
              cx={coord.x}
              cy={coord.y}
              r={isHovered ? 7 : 5}
              fill={primaryColor}
              stroke={theme.palette.background.paper}
              strokeWidth="2"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isHovered ? `drop-shadow(0 0 6px ${alpha(primaryColor, 0.6)})` : undefined,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* Outer Dimension Text Labels */}
        {dimensions.map((dim, i) => {
          const labelCoord = getCoordinates(i, maxRadius + 22);
          const isHovered = hoveredIndex === i;

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelCoord.x > center + 15) textAnchor = 'start';
          if (labelCoord.x < center - 15) textAnchor = 'end';

          return (
            <text
              key={`label-${dim.key}`}
              x={labelCoord.x}
              y={labelCoord.y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fill={isHovered ? primaryColor : theme.palette.text.primary}
              fontSize="11.5"
              fontWeight={isHovered ? 800 : 600}
              style={{
                userSelect: 'none',
                cursor: 'pointer',
                transition: 'fill 0.2s ease',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {dim.label}
            </text>
          );
        })}
      </svg>

      {/* Interactive Detail Card for Hovered Dimension */}
      {hoveredIndex !== null && dimensions[hoveredIndex] && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            px: 2,
            width: '100%',
            maxWidth: { xs: '100%', sm: 360 },
            boxSizing: 'border-box',
            borderRadius: 2,
            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : alpha(primaryColor, 0.04),
            border: `1px solid ${alpha(primaryColor, 0.3)}`,
            backdropFilter: 'blur(8px)',
            boxShadow: 2,
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {dimensions[hoveredIndex].label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor }}>
                {displayActualLabel}: {dimensions[hoveredIndex].score}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: targetColor }}>
                • {displayTargetShort}: {dimensions[hoveredIndex].targetScore ?? 9.0}
              </Typography>
            </Box>
          </Box>
          {(() => {
            const rawRec = dimensions[hoveredIndex].recommendation;
            const localizedRec = rawRec
              ? getLocalizedAuditRecommendation(
                  {
                    sectionName: dimensions[hoveredIndex].key || dimensions[hoveredIndex].label,
                    score: dimensions[hoveredIndex].score,
                    comment: rawRec,
                  },
                  t
                )
              : '';
            return localizedRec || rawRec ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                💡 {localizedRec || rawRec}
              </Typography>
            ) : null;
          })()}
        </Box>
      )}
    </Box>
  );
};
