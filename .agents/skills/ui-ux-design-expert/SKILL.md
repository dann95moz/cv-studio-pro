---
name: ui-ux-design-expert
description: >-
  Use this skill when designing, building, or polishing UI components, design tokens,
  micro-interactions, responsive mobile layouts, accessibility (a11y), and user experience flows.
---

# UI/UX & Design System Specialist Skill

This skill provides comprehensive instructions, design patterns, and quality criteria for crafting premium, responsive, and accessible user interfaces in CV Studio.

---

## 1. Design Token Architecture & Theming

All visual styles must derive from the centralized design system:
- **CSS Variables & Tokens**: `src/styles/tokens.css` (Colors, borders, radiuses, shadows, transitions, backdrop blurs).
- **MUI Theme Integration**: `src/theme/theme.ts` (Palette tokens, component overrides for `MuiButton`, `MuiChip`, `MuiPaper`, `MuiTab`, `MuiDialog`, etc.).
- **A4 Physical Dimensions**: `src/theme/dimensions.ts` (A4 standard: 794px width, 1123px height at 96 DPI).

### Aesthetics Guidelines
- **Modern Polish**: Use curated color palettes (deep slates, subtle gradients, rich accents) rather than raw browser defaults.
- **Glassmorphism & Elevation**: Apply subtle glass backdrops (`backdrop-filter: blur(12px)`) with thin borders (`rgba(255, 255, 255, 0.08)`) for floating toolbars, drawers, and modal headers.
- **Micro-Interactions**: Use smooth transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) for hover states, scale transforms on cards (`transform: translateY(-2px)`), and active button presses.

---

## 2. UX Heuristics & User Feedback

1. **Instant Visual Feedback**:
   - Every asynchronous operation (AI tailoring, PDF export, saving version) must show clear progress indicators (progress bars, spinners, or pulsing skeleton loaders).
   - Use non-blocking snackbars (`toast` / `useSnackbar`) for completed actions or non-fatal warnings.
2. **Empty & Error States**:
   - Never render a blank screen. If a list or preview is empty, render an informative empty state with an illustrative icon, clear explanation, and primary call-to-action button.
   - For errors, provide a descriptive message and an actionable retry button.
3. **Progressive Disclosure**:
   - Keep primary actions visible and secondary/advanced settings accessible via clean menus, accordions, or drawer tabs (e.g., Template Customizer, Typography Settings, AI Provider Config).

---

## 3. Responsive & Mobile-First Best Practices

- **Mobile Viewports (`xs`: 0–599px)**:
  - Toolbars must never wrap erratically into jagged multi-line heights. Use `flexWrap: 'nowrap'`, horizontal scroll containers, or compact icon buttons (`p: 0.75`, `18px` icons).
  - Responsive label strategy:
    ```tsx
    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{fullLabel}</Box>
    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{shortLabel}</Box>
    ```
- **A4 Document Canvas**:
  - Maintain the A4 proportion (`794px × 1123px`).
  - On smaller screens, scale the preview sheet responsively via CSS transform `transform: scale(autoScale)` calculated from available container width.

---

## 4. Mobile & Touch Ergonomics Heuristics (Hoober Thumb Zone & Android MD Standards)

### 4.1. Semantic Icon Selection
- **Global Settings vs. Contextual Overflows**:
  - ❌ **Anti-Pattern**: Using iOS-centric meatballs `•••` or vertical kebab `⋮` for global app preferences. In mobile UX (and particularly Android Material Design), a kebab menu implies *contextual actions for the specific item/screen* (e.g. "Archive" or "Spam" on an open email in Gmail).
  - ✅ **Standard**: Global application preferences (Language, Theme, Tour replay, GitHub repository) must use a **Settings Gear icon (⚙ / `SettingsRoundedIcon`)**. This aligns user expectations and remains coherent across all wizard steps.

### 4.2. Typography Hierarchy: Portadas vs. Pantallas de Trabajo
- **Welcome & Hero Portadas**: Reserve Black / Heavy weights (`fontWeight: 800`–`900`) strictly for landing heroes where the headline is the sole visual protagonist.
- **Working Tasks & Wizard Screens**: Calibrate headings in functional workspaces to **Semibold (`fontWeight: 600` / `700`)** with subtle tracking (`-0.02em`). This keeps the screen calm and prevents the headline from aggressively competing with interactive options and cards.

### 4.3. Material Design List Inset Dividers
- In lists with leading circular icons or avatars:
  - ❌ **Anti-Pattern**: Running dividers across the entire width, cutting awkwardly underneath the icon.
  - ✅ **Standard**: Indent list dividers to align flush with the text column (`ml: '72px'`, `mr: 1.5`). This reinforces the visual gestalt that the icon and its label form a single interactive unit.

### 4.4. Vertical Optical Balance on Tall Displays (20:9)
- On modern elongated screens with high vertical real estate:
  - Avoid pinning short task blocks (e.g., a title + 3 option rows + helper link) directly to the top edge, leaving an awkward 400px abyss of black void below.
  - Center the block vertically in the available viewport (`my: 'auto'`, `justifyContent: 'center'`) within the **Steven Hoober Natural Reach Zone** (25%–75% height). This maximizes thumb comfort (Fitts's Law) and eliminates visual imbalance.

### 4.5. Bottom Sheet Paradigm (Zero Floating Menus on Mobile)
- ❌ **STRICTLY FORBIDDEN ON MOBILE**: Anchored floating dropdown menus (`<Menu>`, `<Popover>`) floating in the air.
- ✅ **MANDATORY**: Every secondary menu, overflow options, document selector, or format picker MUST open as a slide-up **Bottom Sheet** (`Drawer anchor="bottom"` with top drag handle `36×4px`, `borderTopLeftRadius: 16px`, `borderTopRightRadius: 16px`, and safe-area padding).

### 4.6. Disentangling "Recommended" from "Selected / Active" States
- **The Superposition Trap**:
  - ❌ **Anti-Pattern**: Applying an accent border and tinted background fill to an option marked as "Recommended" in its resting state before the user has touched anything.
  - **Why It Fails**: In digital UI semantics, a solid accent border + background wash communicates *"this item is currently selected / active / turned on"*. Giving that treatment to a recommendation creates ambiguity: the user assumes the choice was already made for them or that the option is pre-checked.
  - ✅ **Standard**:
    1. **Resting State Uniformity**: All available option rows share the identical resting surface (neutral background, identical borders or dividers).
    2. **Explicit Recommendation Badge**: Express recommendation solely via an explicit textual badge (e.g. `<Chip label="Recommended" size="small" />`).
    3. **Selection Affordance**: Reserve the accent border and tinted surface exclusively for active touches (`:active`), loading transitions, or when an item has truly been selected.

---

## 5. Accessibility (a11y) & Usability Checklist

- [ ] **Contrast**: Text elements meet WCAG AA contrast ratio (minimum 4.5:1 for normal text).
- [ ] **Keyboard Navigation**: Interactive elements have visible `:focus-visible` outlines and support Enter/Space activation.
- [ ] **ARIA Landmarks & Tooltips**: Icon-only buttons must have descriptive `aria-label` and `<Tooltip title="...">`.
- [ ] **Semantic Markup**: Use `<header>`, `<main>`, `<nav>`, `<section>`, `<article>` appropriately instead of generic `<div>` soup.

---

## 6. Strict Design System (DS) Component Compliance Checklist

When creating or modifying components:
- [ ] **Buttons**: Must NEVER use manual `borderRadius: '6px' / '8px' / '10px'`. Must inherit `MuiButton` pill tokens (`RADIUS_TOKENS.full`).
- [ ] **Chips**: Must NEVER use manual `borderRadius` or custom inline `height: 18`. Use standard `<Chip size="small" variant="filled | outlined" color="..." />`.
- [ ] **Colors**: Use MUI palette tokens (`theme.palette.primary.main`, `theme.palette.success.main`, etc.) and `alpha(...)` instead of raw hex codes.
- [ ] **Alignment**: Action buttons inside cards must use clean flex containers (`justifyContent: 'flex-start' | 'center'`) rather than stretching full-width arbitrarily.
- [ ] **Mobile Menus**: Zero floating `<Menu>` or `<Popover>` in mobile components; all secondary choices must be Bottom Sheets (`Drawer anchor="bottom"`).
- [ ] **Semantic Icons**: Use Settings (⚙) for global app preferences, not `•••` or kebab.
- [ ] **Inset Dividers**: Lists with leading icons must use inset dividers (`ml: '72px'`) aligned to text.
- [ ] **Recommended vs Selected**: Do NOT pre-highlight "Recommended" items with active borders/backgrounds. Use only explicit badge chips.



