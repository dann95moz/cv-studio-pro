import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CVRenderer } from '../../CVRenderer';
import { CvLiveEditProvider } from './CvLiveEditContext';
import { ColumnResizeDivider } from './ColumnResizeDivider';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import { StudioSkeleton } from '../StudioSkeleton';
import {
  CVData,
  ThemeId,
  PaletteId,
  FontFamilyId,
  SpacingDensity,
  PageFormat,
  ProfilePhotoConfig,
} from '../../../types';

const CoverLetterView = React.lazy(() =>
  import('./CoverLetterView').then((m) => ({ default: m.CoverLetterView }))
);

export interface StepPreviewCanvasProps {
  previewDocType: 'cv' | 'cover-letter';
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  paperRef: React.RefObject<HTMLDivElement | null>;
  effectiveCanvasScale: number;
  targetPageWidthPx: number;
  targetPagePx: number;
  sheetHeight: number;
  overflowPercentage: number;
  isOverflowing: boolean;
  pageFormat: PageFormat;
  parsedCv: CVData;
  theme: ThemeId;
  palette: PaletteId;
  customColor?: string;
  fontFamily: FontFamilyId;
  spacingDensity: SpacingDensity;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width?: number) => void;
  photo?: ProfilePhotoConfig | null;
  companyName: string;
  targetRole: string;
  onTriggerDirectDownloadPdf: () => void;
  isAuditGapOpen: boolean;
  isHudMinimized: boolean;
}

export const StepPreviewCanvas: React.FC<StepPreviewCanvasProps> = ({
  previewDocType,
  canvasContainerRef,
  paperRef,
  effectiveCanvasScale,
  targetPageWidthPx,
  targetPagePx,
  sheetHeight,
  overflowPercentage,
  isOverflowing,
  pageFormat,
  parsedCv,
  theme,
  palette,
  customColor,
  fontFamily,
  spacingDensity,
  sidebarWidth,
  onSidebarWidthChange,
  photo,
  companyName,
  targetRole,
  onTriggerDirectDownloadPdf,
  isAuditGapOpen,
  isHudMinimized,
}) => {
  const { t } = useTranslation(['preview']);

  return (
    <div
      className="preview-canvas-wrapper"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        order: 2,
      }}
    >
      {previewDocType === 'cover-letter' ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 1.5, sm: 3 },
            pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 64px)', sm: 6 },
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <React.Suspense fallback={<StudioSkeleton variant="preview" />}>
            <CoverLetterView
              cvData={parsedCv}
              companyName={companyName}
              targetRole={targetRole}
              themeId={theme}
              paletteId={palette}
              customColor={customColor}
              fontFamily={fontFamily}
              onExportPdf={onTriggerDirectDownloadPdf}
            />
          </React.Suspense>
        </Box>
      ) : (
        <Box
          component="main"
          ref={canvasContainerRef}
          className="preview-pane-canvas"
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
            height: '100%',
            minHeight: 0,
            width: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            p: { xs: 1.5, sm: 2, md: 3.5 },
            pr: {
              xs: 1.5,
              sm: 2,
              md: !isAuditGapOpen && !isHudMinimized ? 'calc(215px + 28px)' : 3.5,
            },
            pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', sm: 5, md: 6 },
            boxSizing: 'border-box',
            transition: 'padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '@media print': {
              display: 'block !important',
              visibility: 'visible !important',
              overflow: 'visible !important',
              p: '0 !important',
              m: '0 !important',
            },
          }}
        >
          {/* Scaled Wrapper Container with strict visual pixel footprint */}
          <div
            className="paper-scale-container"
            style={{
              width: effectiveCanvasScale < 1 ? `${targetPageWidthPx * effectiveCanvasScale}px` : `${targetPageWidthPx}px`,
              height: effectiveCanvasScale < 1 ? `${(sheetHeight || targetPagePx) * effectiveCanvasScale}px` : (sheetHeight > 0 ? `${sheetHeight}px` : 'auto'),
              minHeight: effectiveCanvasScale < 1 ? `${targetPagePx * effectiveCanvasScale}px` : `${targetPagePx}px`,
              position: 'relative',
              margin: '0 auto',
              flexShrink: 0,
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              className="paper-sheet-wrapper"
              style={{
                width: `${targetPageWidthPx}px`,
                minHeight: `${targetPagePx}px`,
                transform: effectiveCanvasScale < 1 ? `scale(${effectiveCanvasScale})` : undefined,
                transformOrigin: 'top left',
                position: effectiveCanvasScale < 1 ? 'absolute' : 'relative',
                top: 0,
                left: 0,
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                ref={paperRef}
                className={`paper-sheet ${overflowPercentage > 0 && overflowPercentage <= 25 ? 'compact-fit' : ''}`}
                style={{
                  width: `${targetPageWidthPx}px`,
                  minHeight: `${targetPagePx}px`,
                  margin: '0 auto',
                }}
              >
                <CvLiveEditProvider parsedCv={parsedCv} isEditable={true}>
                  <ErrorBoundary isIsolatedModule fallbackTitle="Error al renderizar la plantilla del CV">
                    <CVRenderer
                      data={parsedCv}
                      theme={theme}
                      palette={palette}
                      customColor={palette === 'custom' ? customColor : undefined}
                      fontFamily={fontFamily}
                      spacingDensity={spacingDensity}
                      sidebarWidth={sidebarWidth}
                      photo={photo}
                    />
                  </ErrorBoundary>
                </CvLiveEditProvider>

                {/* Column Resize Divider (Curtain) on 2-column layouts */}
                {onSidebarWidthChange && (
                  <ColumnResizeDivider
                    theme={theme}
                    paperRef={paperRef}
                    sidebarWidth={sidebarWidth}
                    onSidebarWidthChange={onSidebarWidthChange}
                  />
                )}
              </div>

              {/* Visual Page Break Marker only on actual overflow */}
              {isOverflowing && (
                <div
                  className="page-break-guide"
                  style={{
                    top: `${targetPagePx}px`,
                  }}
                >
                  <span>✂️ {t('preview:toolbar.pageBoundary', 'Page 1 Boundary ({{format}} Standard)', { format: pageFormat.toUpperCase() })}</span>
                </div>
              )}
            </div>
          </div>
        </Box>
      )}
    </div>
  );
};
