/**
 * CV Studio Pro - Centralized Color Design Tokens
 * 
 * Single source of truth for all color constants across the application.
 * Adheres to DRY by providing a unified token dictionary that feeds both
 * MUI Palette configurations and CSS custom properties (:root variables).
 */

export interface PaletteColorTokens {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
  container: string;
  onContainer: string;
}

export interface ThemeColorTokens {
  primary: PaletteColorTokens;
  secondary: PaletteColorTokens;
  success: PaletteColorTokens;
  warning: PaletteColorTokens;
  error: PaletteColorTokens;
  background: {
    default: string;
    paper: string;
    card: string;
    cardHover: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    input: string;
    code: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: {
    default: string;
    light: string;
    outline: string;
    outlineVariant: string;
  };
  accent: {
    main: string;
    hover: string;
    glow: string;
    purple: string;
    container: string;
    onContainer: string;
  };
  shadow: {
    box: string;
    pill: string;
    floating: string;
  };

  glass: {
    background: string;
    border: string;
    backdropBlur: string;
    shadow: string;
  };
  ambientGlow: string;
  gradient: {
    primary: string;
    primaryHover: string;
    secondary: string;
    badge: string;
    error: string;
    errorHover: string;
    warning: string;
    warningHover: string;
    success: string;
    successHover: string;
  };
}

export const DARK_THEME_TOKENS: ThemeColorTokens = {
  primary: {
    main: '#38bdf8',
    light: '#7dd3fc',
    dark: '#0284c7',
    contrastText: '#041e2e',
    container: 'rgba(56, 189, 248, 0.12)',
    onContainer: '#bae6fd',
  },
  secondary: {
    main: '#a78bfa',
    light: '#c4b5fd',
    dark: '#7c3aed',
    contrastText: '#1e0a45',
    container: 'rgba(167, 139, 250, 0.12)',
    onContainer: '#ddd6fe',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
    container: 'rgba(16, 185, 129, 0.12)',
    onContainer: '#6ee7b7',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#ffffff',
    container: 'rgba(245, 158, 11, 0.12)',
    onContainer: '#fde68a',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
    contrastText: '#ffffff',
    container: 'rgba(239, 68, 68, 0.12)',
    onContainer: '#fca5a5',
  },
  background: {
    default: '#07090e',
    paper: '#0d111a',
    card: '#121724',
    cardHover: '#181f30',
    surfaceContainerLow: '#0a0e17',
    surfaceContainer: '#121724',
    surfaceContainerHigh: '#192133',
    input: '#0b0f18',
    code: '#0b0f18',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    disabled: '#64748b',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.14)',
    outline: 'rgba(56, 189, 248, 0.22)',
    outlineVariant: 'rgba(255, 255, 255, 0.05)',
  },
  accent: {
    main: '#38bdf8',
    hover: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.25)',
    purple: '#818cf8',
    container: 'rgba(56, 189, 248, 0.12)',
    onContainer: '#7dd3fc',
  },
  shadow: {
    box: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    pill: '0 2px 10px rgba(56, 189, 248, 0.25)',
    floating: '0 16px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.09)',
  },

  glass: {
    background: 'rgba(13, 17, 26, 0.94)',
    border: 'rgba(255, 255, 255, 0.10)',
    backdropBlur: 'blur(20px)',
    shadow: '0 24px 48px -8px rgba(0, 0, 0, 0.75), 0 0 32px rgba(56, 189, 248, 0.08)',
  },
  ambientGlow:
    'radial-gradient(ellipse 75% 50% at 50% -10%, rgba(56, 189, 248, 0.08), transparent 70%), radial-gradient(ellipse 60% 40% at 85% 95%, rgba(139, 92, 246, 0.05), transparent 70%)',
  gradient: {
    primary: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
    primaryHover: 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 50%, #4338ca 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    badge: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    errorHover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    warningHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    successHover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
};

export const LIGHT_THEME_TOKENS: ThemeColorTokens = {
  primary: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    contrastText: '#ffffff',
    container: 'rgba(2, 132, 199, 0.10)',
    onContainer: '#0369a1',
  },
  secondary: {
    main: '#7c3aed',
    light: '#8b5cf6',
    dark: '#6d28d9',
    contrastText: '#ffffff',
    container: 'rgba(124, 58, 237, 0.10)',
    onContainer: '#6d28d9',
  },
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
    contrastText: '#ffffff',
    container: 'rgba(5, 150, 105, 0.10)',
    onContainer: '#047857',
  },
  warning: {
    main: '#d97706',
    light: '#f59e0b',
    dark: '#92400e',
    contrastText: '#ffffff',
    container: 'rgba(217, 119, 6, 0.10)',
    onContainer: '#92400e',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#991b1b',
    contrastText: '#ffffff',
    container: 'rgba(220, 38, 38, 0.10)',
    onContainer: '#991b1b',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    card: '#ffffff',
    cardHover: '#f1f5f9',
    surfaceContainerLow: '#f8fafc',
    surfaceContainer: '#ffffff',
    surfaceContainerHigh: '#f1f5f9',
    input: '#f8fafc',
    code: '#f1f5f9',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
  },
  border: {
    default: '#e2e8f0',
    light: '#cbd5e1',
    outline: '#cbd5e1',
    outlineVariant: 'rgba(0, 0, 0, 0.06)',
  },
  accent: {
    main: '#0284c7',
    hover: '#0369a1',
    glow: 'rgba(2, 132, 199, 0.2)',
    purple: '#7c3aed',
    container: 'rgba(2, 132, 199, 0.10)',
    onContainer: '#0369a1',
  },
  shadow: {
    box: '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
    pill: '0 2px 10px rgba(2, 132, 199, 0.18)',
    floating: '0 12px 32px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)',
  },

  glass: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: 'rgba(2, 132, 199, 0.18)',
    backdropBlur: 'blur(20px)',
    shadow: '0 20px 40px -8px rgba(15, 23, 42, 0.15), 0 0 24px rgba(2, 132, 199, 0.08)',
  },
  ambientGlow:
    'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(2, 132, 199, 0.04), transparent 70%), radial-gradient(ellipse 60% 40% at 85% 95%, rgba(124, 58, 237, 0.03), transparent 70%)',
  gradient: {
    primary: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    primaryHover: 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    badge: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    errorHover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    warningHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    successHover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
};

/**
 * Generates the CSS custom properties record to inject into :root / CssBaseline.
 */
export function getCssVariablesFromTokens(tokens: ThemeColorTokens): Record<string, string> {
  return {
    '--bg-dark': tokens.background.default,
    '--panel-bg': tokens.background.paper,
    '--card-bg': tokens.background.card,
    '--card-hover': tokens.background.cardHover,
    '--surface-container-low': tokens.background.surfaceContainerLow,
    '--surface-container': tokens.background.surfaceContainer,
    '--surface-container-high': tokens.background.surfaceContainerHigh,
    '--border': tokens.border.default,
    '--border-light': tokens.border.light,
    '--outline': tokens.border.outline,
    '--outline-variant': tokens.border.outlineVariant,
    '--accent': tokens.accent.main,
    '--accent-glow': tokens.accent.glow,
    '--accent-hover': tokens.accent.hover,
    '--primary-purple': tokens.accent.purple,
    '--primary-container': tokens.primary.container,
    '--on-primary-container': tokens.primary.onContainer,
    '--secondary-container': tokens.secondary.container,
    '--on-secondary-container': tokens.secondary.onContainer,
    '--success': tokens.success.main,
    '--success-container': tokens.success.container,
    '--warning': tokens.warning.main,
    '--warning-container': tokens.warning.container,
    '--danger': tokens.error.main,
    '--danger-container': tokens.error.container,
    '--text-main': tokens.text.primary,
    '--text-muted': tokens.text.secondary,
    '--text-dim': tokens.text.disabled,
    '--input-bg': tokens.background.input,
    '--code-bg': tokens.background.code,
    '--box-shadow': tokens.shadow.box,
    '--pill-shadow': tokens.shadow.pill,
    '--glass-bg': tokens.glass.background,
    '--glass-border': tokens.glass.border,
    '--glass-shadow': tokens.glass.shadow,
    '--studio-ambient-glow': tokens.ambientGlow,
    '--gradient-primary': tokens.gradient.primary,
    '--gradient-primary-hover': tokens.gradient.primaryHover,
    '--gradient-secondary': tokens.gradient.secondary,
    '--gradient-badge': tokens.gradient.badge,
    '--gradient-error': tokens.gradient.error,
    '--gradient-error-hover': tokens.gradient.errorHover,
    '--gradient-warning': tokens.gradient.warning,
    '--gradient-warning-hover': tokens.gradient.warningHover,
    '--gradient-success': tokens.gradient.success,
    '--gradient-success-hover': tokens.gradient.successHover,
  };
}

/**
 * CV Document Engine Neutral & Base Design Tokens
 * 
 * Standardized neutral palette for CV document templates guaranteeing 100% ATS readability.
 * Body text always remains high-contrast charcoal/slate; paper is always clean white.
 */
export const CV_DOCUMENT_TOKENS = {
  paperBg: '#ffffff',
  textPrimary: '#1e293b',
  textHeading: '#0f172a',
  textSecondary: '#334155',
  textStrong: '#090d16',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  borderColor: '#e2e8f0',
  borderLight: '#f1f5f9',
};

