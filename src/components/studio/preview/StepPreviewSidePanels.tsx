import React, { useEffect } from 'react';
import { Box, Drawer, useTheme } from '@mui/material';
import { StepPreviewNavRail } from './StepPreviewNavRail';
import { StudioSkeleton } from '../StudioSkeleton';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import {
  PreviewSidePanelType,
  CVData,
  ThemeId,
  PaletteId,
  FontFamilyId,
  SpacingDensity,
  PageFormat,
  ProfilePhotoConfig,
  AIProviderSettings,
} from '../../../types';

const DesignFormattingPanel = React.lazy(() =>
  import('./DesignFormattingPanel').then((m) => ({ default: m.DesignFormattingPanel }))
);
const LinkedInPanel = React.lazy(() =>
  import('./LinkedInPanel').then((m) => ({ default: m.LinkedInPanel }))
);

export interface StepPreviewSidePanelsProps {
  isMobile: boolean;
  activeSidePanel: PreviewSidePanelType | null;
  onToggleSidePanel: (panel: PreviewSidePanelType) => void;
  onCloseSidePanel: () => void;
  // Design formatting props
  customColor: string;
  onCustomColorChange: (color: string) => void;
  palette: PaletteId;
  onSelectPalette: (palette: PaletteId) => void;
  fontFamily: FontFamilyId;
  onFontFamilyChange: (font: FontFamilyId) => void;
  spacingDensity: SpacingDensity;
  onSpacingDensityChange: (density: SpacingDensity) => void;
  pageFormat: PageFormat;
  onPageFormatChange: (format: PageFormat) => void;
  onAutoFit: () => void;
  sheetHeight: number;
  a4PagePx: number;
  estimatedPages: number;
  photo?: ProfilePhotoConfig | null;
  onPhotoChange: (photo: ProfilePhotoConfig | null) => void;
  onPhotoToggle: (enabled: boolean) => void;
  theme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  // LinkedIn props
  parsedCv: CVData;
  companyName: string;
  targetRole: string;
  targetJob: string;
  providerSettings: AIProviderSettings;
}

export const StepPreviewSidePanels: React.FC<StepPreviewSidePanelsProps> = ({
  isMobile,
  activeSidePanel,
  onToggleSidePanel,
  onCloseSidePanel,
  customColor,
  onCustomColorChange,
  palette,
  onSelectPalette,
  fontFamily,
  onFontFamilyChange,
  spacingDensity,
  onSpacingDensityChange,
  pageFormat,
  onPageFormatChange,
  onAutoFit,
  sheetHeight,
  a4PagePx,
  estimatedPages,
  photo,
  onPhotoChange,
  onPhotoToggle,
  theme,
  onSelectTheme,
  parsedCv,
  companyName,
  targetRole,
  targetJob,
  providerSettings,
}) => {
  const muiTheme = useTheme();

  // Register in back button stack
  useEffect(() => {
    if (activeSidePanel) {
      return backButtonRegistry.register({
        id: 'preview-side-panel',
        priority: 60,
        handler: () => {
          onCloseSidePanel();
          return true;
        },
      });
    }
  }, [activeSidePanel, onCloseSidePanel]);

  const panelContent = activeSidePanel && (
    <React.Suspense fallback={<StudioSkeleton variant="drawer" />}>
      {(activeSidePanel === 'design' || activeSidePanel === 'templates') && (
        <DesignFormattingPanel
          customColor={customColor}
          onCustomColorChange={onCustomColorChange}
          palette={palette}
          onSelectPalette={onSelectPalette}
          fontFamily={fontFamily}
          onFontFamilyChange={onFontFamilyChange}
          spacingDensity={spacingDensity}
          onSpacingDensityChange={onSpacingDensityChange}
          pageFormat={pageFormat}
          onPageFormatChange={onPageFormatChange}
          onAutoFit={onAutoFit}
          sheetHeight={sheetHeight}
          a4PagePx={a4PagePx}
          estimatedPages={estimatedPages}
          photo={photo}
          onPhotoChange={onPhotoChange}
          onPhotoToggle={onPhotoToggle}
          activeTheme={theme}
          theme={theme}
          onSelectTheme={onSelectTheme}
          initialTab={activeSidePanel === 'templates' ? 'templates' : 'formatting'}
          onClose={onCloseSidePanel}
        />
      )}

      {activeSidePanel === 'linkedin' && (
        <LinkedInPanel
          cvData={parsedCv}
          companyName={companyName}
          targetRole={targetRole}
          targetJob={targetJob}
          providerSettings={providerSettings}
          onClose={onCloseSidePanel}
        />
      )}
    </React.Suspense>
  );

  return (
    <>
      {/* 1. Left Tool Rail (Desktop only, mobile uses FAB + Bottom Sheet) */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%' }}>
        <StepPreviewNavRail
          activeSidePanel={activeSidePanel}
          onToggleSidePanel={onToggleSidePanel}
        />
      </Box>

      {/* 2. Expandable Left Side Panel (Desktop only - Mobile uses Bottom Sheet Drawer) */}
      {!isMobile && activeSidePanel && (
        <Box
          className="no-print preview-side-panel"
          sx={{
            position: 'relative',
            width: 330,
            maxWidth: 360,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            flexShrink: 0,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {panelContent}
        </Box>
      )}

      {/* 3. Mobile Tool Drawer (Bottom Sheet on mobile when opened via FAB) */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={Boolean(activeSidePanel)}
          onClose={onCloseSidePanel}
          slotProps={{
            paper: {
              sx: {
                maxHeight: '85vh',
                borderTopLeftRadius: RADIUS_TOKENS.xl,
                borderTopRightRadius: RADIUS_TOKENS.xl,
                bgcolor: 'background.paper',
                overflowY: 'auto',
              },
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 4,
              bgcolor: 'divider',
              borderRadius: RADIUS_TOKENS.full,
              mx: 'auto',
              mt: 1.5,
              mb: 0.5,
            }}
          />
          {panelContent}
        </Drawer>
      )}
    </>
  );
};
