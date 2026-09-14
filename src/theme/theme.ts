import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
import {
  DARK_THEME_TOKENS,
  LIGHT_THEME_TOKENS,
  getCssVariablesFromTokens,
} from './colors';
import { getDimensionCssVariables, RADIUS_TOKENS } from './dimensions';

export type ThemeMode = 'light' | 'dark';

declare module '@mui/material/styles' {
  interface PaletteColor {
    container?: string;
    onContainer?: string;
  }
  interface SimplePaletteColorOptions {
    container?: string;
    onContainer?: string;
  }
}

const getDesignTokens = (mode: ThemeMode): ThemeOptions => {
  const isDark = mode === 'dark';
  const tokens = isDark ? DARK_THEME_TOKENS : LIGHT_THEME_TOKENS;
  const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const displayFont = "'Space Grotesk', 'Inter', sans-serif"; // headings only
  return {
    palette: {
      mode,
      primary: tokens.primary,
      secondary: tokens.secondary,
      success: tokens.success,
      warning: tokens.warning,
      error: tokens.error,
      background: {
        default: tokens.background.default,
        paper: tokens.background.paper,
      },
      text: tokens.text,
      divider: tokens.border.default,
    },
    shape: {
      borderRadius: parseInt(RADIUS_TOKENS.sm, 10),
    },
    typography: {

      fontFamily: bodyFont,
      h1: {
        fontFamily: displayFont,
        fontWeight: 800,
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: displayFont,
        fontWeight: 700,
        fontSize: 'clamp(1.4rem, 3.2vw, 2.25rem)',
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: displayFont,
        fontWeight: 600,
        fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)',
        lineHeight: 1.3,
        letterSpacing: '-0.015em',
      },
      h4: {
        fontWeight: 700,
        fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
      },
      h5: { fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 },
      subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
      subtitle2: { fontWeight: 600, fontSize: '0.825rem' },
      body1: { fontSize: '0.925rem', lineHeight: 1.6 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            ...getCssVariablesFromTokens(tokens),
            ...getDimensionCssVariables(),
          },
          body: {
            backgroundColor: tokens.background.default,
            backgroundImage: tokens.ambientGlow,
            backgroundAttachment: 'fixed',
            scrollbarColor: isDark
              ? `${tokens.border.light} ${tokens.background.input}`
              : `${tokens.border.light} ${tokens.background.default}`,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: tokens.border.light,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: tokens.background.input,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: RADIUS_TOKENS.full,
            padding: '8px 20px',
            fontSize: '0.875rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          sizeSmall: {
            padding: '4px 14px',
            fontSize: '0.78rem',
            minHeight: 32,
          },
          sizeMedium: {
            padding: '8px 20px',
            fontSize: '0.875rem',
            minHeight: 40,
          },
          sizeLarge: {
            padding: '12px 28px',
            fontSize: '0.95rem',
            minHeight: 48,
          },
          contained: {
            background: tokens.gradient.primary,
            color: '#ffffff',
            boxShadow: tokens.shadow.pill,
            '&:hover': {
              background: tokens.gradient.primaryHover,
              boxShadow: `0 4px 16px ${tokens.accent.glow}`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.MuiButton-containedSecondary': {
              background: tokens.gradient.secondary,
              color: tokens.secondary.contrastText,
              '&:hover': {
                background: tokens.secondary.dark,
                boxShadow: `0 4px 14px ${alpha(tokens.secondary.main, 0.3)}`,
                transform: 'translateY(-1px)',
              },
            },
            '&.MuiButton-containedError': {
              background: tokens.gradient.error,
              color: '#ffffff',
              boxShadow: `0 2px 10px ${alpha(tokens.error.main, 0.35)}`,
              '&:hover': {
                background: tokens.gradient.errorHover,
                boxShadow: `0 4px 14px ${alpha(tokens.error.main, 0.5)}`,
                transform: 'translateY(-1px)',
              },
            },
            '&.MuiButton-containedWarning': {
              background: tokens.gradient.warning,
              color: '#ffffff',
              boxShadow: `0 2px 10px ${alpha(tokens.warning.main, 0.35)}`,
              '&:hover': {
                background: tokens.gradient.warningHover,
                boxShadow: `0 4px 14px ${alpha(tokens.warning.main, 0.5)}`,
                transform: 'translateY(-1px)',
              },
            },
            '&.MuiButton-containedSuccess': {
              background: tokens.gradient.success,
              color: '#ffffff',
              boxShadow: `0 2px 10px ${alpha(tokens.success.main, 0.35)}`,
              '&:hover': {
                background: tokens.gradient.successHover,
                boxShadow: `0 4px 14px ${alpha(tokens.success.main, 0.5)}`,
                transform: 'translateY(-1px)',
              },
            },
            '&.Mui-disabled': {
              background: isDark ? 'rgba(255, 255, 255, 0.08) !important' : 'rgba(0, 0, 0, 0.08) !important',
              color: isDark ? 'rgba(255, 255, 255, 0.3) !important' : 'rgba(0, 0, 0, 0.26) !important',
              boxShadow: 'none !important',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
            '&:hover': {
              borderColor: tokens.primary.main,
              backgroundColor: tokens.primary.container,
              transform: 'translateY(-1px)',
            },
            '&.MuiButton-outlinedError': {
              borderColor: alpha(tokens.error.main, 0.4),
              color: tokens.error.main,
              '&:hover': {
                borderColor: tokens.error.main,
                backgroundColor: tokens.error.container,
              },
            },
            '&.MuiButton-outlinedWarning': {
              borderColor: alpha(tokens.warning.main, 0.4),
              color: tokens.warning.main,
              '&:hover': {
                borderColor: tokens.warning.main,
                backgroundColor: tokens.warning.container,
              },
            },
            '&.MuiButton-outlinedSuccess': {
              borderColor: alpha(tokens.success.main, 0.4),
              color: tokens.success.main,
              '&:hover': {
                borderColor: tokens.success.main,
                backgroundColor: tokens.success.container,
              },
            },
            '&.Mui-disabled': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08) !important' : 'rgba(0, 0, 0, 0.08) !important',
              color: isDark ? 'rgba(255, 255, 255, 0.3) !important' : 'rgba(0, 0, 0, 0.26) !important',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(tokens.primary.main, isDark ? 0.1 : 0.06),
            },
          },
        },
      },
      MuiButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_TOKENS.full,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            padding: 2,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            '& .MuiButton-root': {
              borderRadius: RADIUS_TOKENS.full,
              border: 'none !important',
              margin: '0 1px',
              padding: '6px 14px',
              '&.MuiButton-contained': {
                boxShadow: 'none',
              },
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_TOKENS.full,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            padding: 2,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            gap: 2,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: `${RADIUS_TOKENS.full} !important`,
            border: 'none !important',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.825rem',
            padding: '6px 16px',
            color: tokens.text.secondary,
            transition: 'all 0.15s ease',
            '&.Mui-selected': {
              backgroundColor: tokens.primary.container,
              color: tokens.primary.onContainer,
              fontWeight: 700,
              '&:hover': {
                backgroundColor: tokens.primary.container,
              },
            },
            '&:hover': {
              backgroundColor: alpha(tokens.text.primary, 0.05),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_TOKENS.full,
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: alpha(tokens.primary.main, isDark ? 0.12 : 0.08),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: parseInt(RADIUS_TOKENS.md, 10),
            backgroundImage: 'none',
            border: `1px solid ${tokens.border.default}`,
            backgroundColor: tokens.background.paper,
            boxShadow: tokens.shadow.box,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: parseInt(RADIUS_TOKENS.md, 10),
          },
          outlined: {
            border: `1px solid ${tokens.border.default}`,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: `${RADIUS_TOKENS.md} !important`,
            border: `1px solid ${tokens.border.default}`,
            backgroundColor: tokens.background.paper,
            backgroundImage: 'none',
            overflow: 'hidden',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: '8px 0' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS_TOKENS.full,
            fontWeight: 600,
            fontSize: '0.78rem',
            padding: '0 4px',
            transition: 'all 0.15s ease',
          },
          colorPrimary: {
            backgroundColor: tokens.primary.container,
            color: tokens.primary.onContainer,
            border: `1px solid ${alpha(tokens.primary.main, 0.25)}`,
          },
          colorSecondary: {
            backgroundColor: tokens.secondary.container,
            color: tokens.secondary.onContainer,
            border: `1px solid ${alpha(tokens.secondary.main, 0.25)}`,
          },
          colorSuccess: {
            backgroundColor: tokens.success.container,
            color: tokens.success.onContainer,
            border: `1px solid ${alpha(tokens.success.main, 0.25)}`,
          },
          colorWarning: {
            backgroundColor: tokens.warning.container,
            color: tokens.warning.onContainer,
            border: `1px solid ${alpha(tokens.warning.main, 0.25)}`,
          },
          colorError: {
            backgroundColor: tokens.error.container,
            color: tokens.error.onContainer,
            border: `1px solid ${alpha(tokens.error.main, 0.25)}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: parseInt(RADIUS_TOKENS.sm, 10),
            backgroundColor: tokens.background.input,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.border.default,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary.main,
            },
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 40,
            borderRadius: RADIUS_TOKENS.full,
            margin: '0 4px',
            padding: '6px 16px',
            transition: 'all 0.15s ease',
            '&.Mui-selected': {
              color: tokens.primary.main,
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
        styleOverrides: {
          tooltip: {
            borderRadius: parseInt(RADIUS_TOKENS.sm, 10),
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: tokens.background.card,
            border: `1px solid ${tokens.border.default}`,
            color: tokens.text.primary,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: parseInt(RADIUS_TOKENS['2xl'], 10),
            backgroundColor: tokens.glass.background,
            backdropFilter: tokens.glass.backdropBlur,
            WebkitBackdropFilter: tokens.glass.backdropBlur,
            border: `1px solid ${tokens.glass.border}`,
            boxShadow: tokens.glass.shadow,
            backgroundImage: 'none',
            overflow: 'hidden',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: parseInt(RADIUS_TOKENS.lg, 10),
            backgroundColor: tokens.background.paper,
            border: `1px solid ${tokens.border.default}`,
            boxShadow: tokens.shadow.floating,
            backgroundImage: 'none',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: parseInt(RADIUS_TOKENS.lg, 10),
            backgroundColor: tokens.background.paper,
            border: `1px solid ${tokens.border.default}`,
            boxShadow: tokens.shadow.floating,
            backgroundImage: 'none',
          },
        },
      },
    },
  };
};


export const buildTheme = (mode: ThemeMode) => createTheme(getDesignTokens(mode));
