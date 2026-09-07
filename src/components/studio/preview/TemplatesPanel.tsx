import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormatPaintRoundedIcon from '@mui/icons-material/FormatPaintRounded';
import { useTranslation } from 'react-i18next';
import { TemplatesPanelProps } from '../../../types';
import { getAllPalettes } from '../../../constants/palettes';
import { getAllTemplates } from '../../../templates';
import { TemplateThumbnailMiniature } from '../TemplateThumbnailMiniature';

export type { TemplatesPanelProps };

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  theme,
  onSelectTheme,
  palette,
  onSelectPalette,
  customColor,
  onCustomColorChange,
  onClose,
  hideHeader = false,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const muiTheme = useTheme();
  const palettes = getAllPalettes();
  const allTemplates = getAllTemplates();

  return (
    <Box sx={{ p: hideHeader ? 0 : 2.5, pb: hideHeader ? 0 : 'calc(env(safe-area-inset-bottom, 0px) + 36px)', boxSizing: 'border-box' }}>
      {/* Header: Title + Close Button */}
      {!hideHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
            {t('preview:panels.templates.title', 'Templates')}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      )}

      {/* Color Palette Selector: Wrapped Grid (No Horizontal Scroll) */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {t('preview:panels.templates.palette', 'Color Palette')}
          </Typography>
          {palette === 'custom' && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.72rem' }}>
              {customColor}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.2,
            p: 1.25,
            borderRadius: 2,
            bgcolor: alpha(muiTheme.palette.divider, 0.04),
            border: `1px solid ${muiTheme.palette.divider}`,
          }}
        >
          {/* Custom Color Swatch with Native Color Picker */}
          <Tooltip title={`${t('preview:panels.design.primaryColor', 'Accent Color')} (${customColor})`}>
            <Box
              component="label"
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: customColor,
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: palette === 'custom'
                  ? `2.5px solid ${muiTheme.palette.primary.main}`
                  : `1.5px solid ${muiTheme.palette.divider}`,
                boxShadow: palette === 'custom' ? `0 0 0 2px ${alpha(customColor, 0.4)}` : 'none',
                transform: palette === 'custom' ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.15s ease',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  onCustomColorChange(e.target.value);
                  onSelectPalette('custom');
                }}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              />
              <FormatPaintRoundedIcon sx={{ fontSize: 13, color: 'common.white' }} />
            </Box>
          </Tooltip>

          {/* Curated Preset Swatches */}
          {palettes.map((p) => {
            const isSelected = palette === p.id;
            return (
              <Tooltip key={p.id} title={`${p.name} — ${p.description}`}>
                <Box
                  onClick={() => {
                    onSelectPalette(p.id);
                    onCustomColorChange(p.primaryColor);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: p.previewColor,
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: isSelected
                      ? `2.5px solid ${muiTheme.palette.primary.main}`
                      : `1.5px solid ${muiTheme.palette.divider}`,
                    boxShadow: isSelected ? `0 0 0 2px ${alpha(p.previewColor, 0.4)}` : 'none',
                    transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    '&:hover': { transform: 'scale(1.2)' },
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

      </Box>

      {/* Subtitle: All templates */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {t('preview:panels.templates.all', 'All templates')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {allTemplates.length} {t('preview:navRail.templates', 'designs')}
        </Typography>
      </Box>

      {/* 2-Column Grid of Miniature Template Preview Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.75,
        }}
      >
        {allTemplates.map((tpl) => (
          <TemplateThumbnailMiniature
            key={tpl.id}
            themeId={tpl.id}
            paletteId={palette}
            customColor={palette === 'custom' ? customColor : undefined}
            name={tpl.name}
            category={tpl.category}
            description={tpl.description}
            recommendedFor={tpl.recommendedFor}
            layout={tpl.layout}
            icon={tpl.icon}
            isSelected={theme === tpl.id}
            onClick={() => onSelectTheme(tpl.id)}
          />
        ))}
      </Box>
    </Box>
  );
};
