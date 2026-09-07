import { PageFormat } from '../types/theme';

export interface PageFormatConfig {
  id: PageFormat;
  name: string;
  shortLabel: string;
  width: string;
  height: string;
  widthPx: number;
  heightPx: number;
  printSize: string;
}

export const PAGE_FORMAT_CONFIGS: Record<PageFormat, PageFormatConfig> = {
  a4: {
    id: 'a4',
    name: 'A4 Standard (210 × 297 mm)',
    shortLabel: 'A4',
    width: '794px',
    height: '1123px',
    widthPx: 794,
    heightPx: 1123,
    printSize: 'A4 portrait',
  },
  letter: {
    id: 'letter',
    name: 'Carta / Letter (8.5 × 11 in)',
    shortLabel: 'Letter',
    width: '816px',
    height: '1056px',
    widthPx: 816,
    heightPx: 1056,
    printSize: 'letter portrait',
  },
  legal: {
    id: 'legal',
    name: 'Oficio / Legal (8.5 × 14 in)',
    shortLabel: 'Legal',
    width: '816px',
    height: '1344px',
    widthPx: 816,
    heightPx: 1344,
    printSize: 'legal portrait',
  },
};

export const DOCUMENT_DIMENSIONS = {
  pageWidth: '794px',
  pageHeight: '1123px',
  pageHeightPx: 1123,
  marginSingleCol: '10mm 12mm',
} as const;

export function getPageFormatConfig(format: PageFormat = 'a4'): PageFormatConfig {
  return PAGE_FORMAT_CONFIGS[format] || PAGE_FORMAT_CONFIGS.a4;
}

export const LAYOUT_DIMENSIONS = {
  navbarHeight: '64px',
  containerSm: '600px',
  containerMd: '900px',
  containerLg: '960px',
  containerXl: '1200px',
  splitEditorMinWidth: '320px',
  splitEditorHeaderHeight: '38px',
} as const;

export const RADIUS_TOKENS = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '28px',
  full: '9999px',
} as const;

export const SPACING_TOKENS = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

/**
 * Generates the CSS custom properties record for layout & dimension tokens.
 */
export function getDimensionCssVariables(): Record<string, string> {
  return {
    '--navbar-height': LAYOUT_DIMENSIONS.navbarHeight,
    '--container-sm': LAYOUT_DIMENSIONS.containerSm,
    '--container-md': LAYOUT_DIMENSIONS.containerMd,
    '--container-lg': LAYOUT_DIMENSIONS.containerLg,
    '--container-xl': LAYOUT_DIMENSIONS.containerXl,
    '--cv-page-width': DOCUMENT_DIMENSIONS.pageWidth,
    '--cv-page-min-height': DOCUMENT_DIMENSIONS.pageHeight,
    '--radius-none': RADIUS_TOKENS.none,
    '--radius-xs': RADIUS_TOKENS.xs,
    '--radius-sm': RADIUS_TOKENS.sm,
    '--radius-md': RADIUS_TOKENS.md,
    '--radius-lg': RADIUS_TOKENS.lg,
    '--radius-xl': RADIUS_TOKENS.xl,
    '--radius-2xl': RADIUS_TOKENS['2xl'],
    '--radius-full': RADIUS_TOKENS.full,
    '--space-xs': SPACING_TOKENS.xs,
    '--space-sm': SPACING_TOKENS.sm,
    '--space-md': SPACING_TOKENS.md,
    '--space-lg': SPACING_TOKENS.lg,
    '--space-xl': SPACING_TOKENS.xl,
  };
}
