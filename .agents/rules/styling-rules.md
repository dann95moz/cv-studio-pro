---
trigger: always_on
---

# Styling, Design Tokens & Design System (DS) Rules

This document establishes the strict styling and Design System (DS) compliance rules for **CV Studio**. All AI agents and developers must strictly adhere to these rules. Creating ad-hoc, rogue, or hardcoded (burned) styling is strictly forbidden.

---

## 1. Centralized Design System (DS) Architecture

All design values must strictly originate from the centralized Design System tokens:
- **Design Tokens**: `src/styles/tokens.css` defines root CSS variables (colors, surfaces, shadows, transitions).
- **Theme Palette & Overrides**: `src/theme/theme.ts` integrates tokens into Material-UI component overrides (`MuiButton`, `MuiChip`, `MuiPaper`, `MuiPopover`, `MuiMenu`, `MuiDialog`, `MuiTooltip`, etc.).
- **Dimensions & Radiuses**: `src/theme/dimensions.ts` defines standard radiuses (`RADIUS_TOKENS`) and layout dimensions.
- **Color Palettes**: `src/theme/colors.ts` defines light and dark theme color tokens (`LIGHT_THEME_TOKENS`, `DARK_THEME_TOKENS`).

---

## 2. 🚫 Zero Tolerance: Forbidden Hardcoded (Burned) Styles

### ❌ 1. Never hardcode inline `boxShadow` or `border` on Popovers, Menus, Dialogs, or Cards:
- ❌ **Forbidden**:
  ```tsx
  // DON'T DO THIS:
  slotProps={{
    paper: {
      sx: {
        p: 2,
        borderRadius: '12px',
        border: '1px solid divider',
        bgcolor: 'background.paper',
        boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)...' : '0 12px 32px rgba(15,23,42,0.14)...',
        zIndex: 10001,
      },
    },
  }}
  ```
- ✅ **Standard Practice**: Let `<Popover>`, `<Menu>`, `<Dialog>`, and `<Card>` inherit default surfaces, shadows, and borders directly from `src/theme/theme.ts`. Only customize content dimensions (e.g. `width: 380, p: 2`).

---

### ❌ 2. Never hardcode arbitrary pixel `borderRadius`:
- ❌ **Forbidden**: `borderRadius: '6px'`, `borderRadius: '8px'`, `borderRadius: '10px'`, `borderRadius: '12px'`, `borderRadius: '16px'`.
- ✅ **Standard Practice**:
  - Buttons, Chips, Tabs, Badges: Inherit `RADIUS_TOKENS.full` (`9999px` / Pill) automatically.
  - Dialogs & Modals: Inherit `RADIUS_TOKENS.xl` (`16px`) from theme.
  - Cards, Panels & Drawers: Inherit `RADIUS_TOKENS.lg` (`12px`) from theme.
  - Inputs & Menus: Inherit `RADIUS_TOKENS.md` (`8px`) from theme.

---

### ❌ 3. Never hardcode arbitrary hex colors (`#hex`) or raw `rgba()` in component JSX:
- ❌ **Forbidden**: `bgcolor: '#0284c7'`, `color: '#f8fafc'`, `border: '1px solid rgba(255, 255, 255, 0.08)'`.
- ✅ **Standard Practice**: Use theme palette and alpha utilities:
  - `bgcolor: 'background.paper'` or `bgcolor: 'background.default'`
  - `color: 'text.primary'` or `color: 'text.secondary'`
  - `borderColor: 'divider'` or `borderColor: alpha(theme.palette.primary.main, 0.2)`
  - `bgcolor: alpha(theme.palette.primary.main, 0.08)`

---

### ❌ 4. Never hardcode rogue `zIndex` numbers:
- ❌ **Forbidden**: `zIndex: 10001`, `zIndex: 99999`, `zIndex: 5000`.
- ✅ **Standard Practice**: Use standard Material-UI z-indexes:
  - `zIndex: theme.zIndex.modal` (1300)
  - `zIndex: theme.zIndex.snackbar` (1400)
  - `zIndex: theme.zIndex.tooltip` (1500)
  - Layout relative layers: `zIndex: 1`, `zIndex: 10`, `zIndex: 20`.

---

### ❌ 5. Button Architecture & Taxonomy Standard (Zero Ad-hoc Button Styling)
Buttons are the primary interactive instruments of the studio. To guarantee visual harmony across all views and toolbars, all buttons must strictly follow the Design System Taxonomy:

1. **Universal Pill Shape (`RADIUS_TOKENS.full`)**:
   - All standard buttons (`MuiButton`) inherit `borderRadius: RADIUS_TOKENS.full` (9999px) directly from `src/theme/theme.ts`.
   - ❌ **Forbidden**: Overriding `borderRadius` on `<Button>`, `<ButtonGroup>`, or `<ToggleButtonGroup>` with ad-hoc values like `borderRadius: 1.5`, `borderRadius: 2`, `borderRadius: '8px'`, or `borderRadius: RADIUS_TOKENS.sm`.
   - ✅ **Standard Practice**: Omit `borderRadius` in button `sx` completely. Let the centralized theme apply the pill shape automatically.

2. **The 3 Official Button Hierarchy Tiers**:
   - **Tier 1 — Contained / CTA**: `<Button variant="contained" color="primary | secondary | error | warning | success">`
     - Used for primary forward actions (*Descargar / Exportar*, *Sintetizar con IA*, *Guardar Versión*). Inherits gradient + subtle elevation glow from theme.
   - **Tier 2 — Outlined**: `<Button variant="outlined" color="primary | inherit | error | warning | success">`
     - Used for secondary actions (*Cargar Ejemplo*, *Regenerar CV*, *Breadcrumb de Pasos*, *Exportar Reporte*). Inherits theme border and hover fill.
   - **Tier 3 — Text / Ghost**: `<Button variant="text" color="inherit | primary">`
     - Used for tertiary, low-emphasis actions (*Cancelar*, *Postular*, *Cambiar Modo*).
   - ❌ **Forbidden Hybrid Variants**: Never graft custom borders and background colors onto `variant="text"` buttons to simulate boxy rectangles. If an outline or background is needed, use `variant="outlined"` or `<Chip>`.

3. **Icon Buttons vs Text Buttons**:
   - Circular icon micro-actions (`[X]`, `[Copy]`, `[Edit]`, `[Theme toggle]`) must use `<IconButton size="small">` or primitive dumb atoms (`ActionIconButton`).
   - ❌ **Forbidden**: Using `<Button>` with `borderRadius: '50%'` to fake an `<IconButton>`.

4. **Zero Raw HTML `<button>` in Components**:
   - ❌ **Forbidden**: `<button className="studio-btn...">`.
   - ✅ **Standard Practice**: All buttons in `src/components/` must use MUI `<Button>`, `<IconButton>`, or `<ButtonBase>`. Legacy CSS classes (`.studio-btn`, `.studio-btn-primary`, `.studio-btn-secondary`) are strictly forbidden.

---

## 3. Responsive Breakpoints & Mobile-First Rules

- `xs`: 0px–599px (Mobile)
- `sm`: 600px–899px (Tablet)
- `md`: 900px–1199px (Small Desktop / Laptop)
- `lg`: 1200px+ (Large Desktop)

### Mobile Architecture Rules (Strict Compliance with [mobile-first-ux-rules.md](file:///.agents/rules/mobile-first-ux-rules.md)):
- **Zero Desktop Retrofitting**: Never adapt desktop horizontal toolbars to mobile by merely shrinking padding or wrapping buttons into multi-line rows.
- **Top Header Discipline**: Mobile top header must be a clean single row (`52px`–`56px`) with step title + `•••` overflow menu. Never place 5+ action buttons in the mobile header.
- **Progressive Disclosure**: Global settings (theme, app language, sync QR, GitHub) and secondary exports must reside in the `•••` overflow menu on mobile.
- **Thumb Zone Ergonomics**: Bottom Navigation (`Estudio`, `Postulaciones`) and Floating Action Button (FAB) triggers for slide-up Bottom Sheets (`Plantillas`, `Diseño`, `LinkedIn`, `Comparar`) must sit at the bottom within thumb reach.
- **Maximum Canvas Focus**: The candidate's CV canvas must occupy ≥ 80% of the mobile viewport height without vertical toolbar crowding.

---

## 4. A4 Document Rendering & Print Consistency

- **A4 Dimensions**: 794px width by 1123px height per page (at 96 DPI).
- **Page Break Guides**: Show visual guide lines when height exceeds `A4_PAGE_PX - 30px`.
- **Canvas Scaling**: Mobile canvas uses `autoScale = Math.min(1, Math.max(0.35, availableWidth / 794))` with zero horizontal scroll.
- **Print CSS**: Ensure all non-document UI has `.no-print` class.

---

## 5. Verification Checklist for Design System Compliance

Before committing any component edit:
1. [ ] Are all colors using `theme.palette.*` or `alpha(...)` rather than raw hex/rgba strings?
2. [ ] Are Popovers, Menus, Dialogs, and Cards inheriting default shadows and borders from theme?
3. [ ] Are Buttons and Chips using standard variants without inline `borderRadius` overrides?
4. [ ] Are z-indexes using standard MUI layers rather than arbitrary magic numbers?
5. [ ] Is the layout mobile-friendly without overflowing or button wrapping on `xs` viewports?
