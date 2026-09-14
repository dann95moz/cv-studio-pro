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

### 4.7. Typographic Weight Hierarchy in Choice & Decision Screens
- **The Heavy Title Pitfall**:
  - ❌ **Anti-Pattern**: Using ultra-heavy font weights (`fontWeight: 800` or aggressive black styles) on introductory questions or context headers (e.g. *"How would you like to start your profile?"*).
  - **Why It Fails**: A dense, heavy black title monopolizes visual attention and exerts excessive visual gravity, competing directly with the interactive choices below it rather than gracefully introducing them.
  - ✅ **Standard**:
    - **Context vs. Action**: The headline sets the scene, but the interactive options are the true protagonists of the screen.
    - **Medium Weight (`fontWeight: 500`)**: Give decision screen headers a calm, refined medium weight (`500`) and clean letter-spacing (`-0.01em`). This creates natural visual hierarchy: the title provides context without visual aggression, allowing the interactive options (`600` / `700`) to hold clear focal priority.

### 4.8. Sub-Flow Navigation & Reversibility (Never Trap the User)
- **The One-Way Gate Anti-Pattern**:
  - ❌ **Anti-Pattern**: Transitioning the candidate into a detail form or sub-flow without an explicit, visible, and system-level path back to the parent options screen.
  - **Why It Fails**: Exploration is natural. Candidates tap "Guided form" or "Notes" just to explore what it entails. If they can't go back, they feel trapped and anxious about losing context or being committed to the wrong path.
  - ✅ **Standard (Clean Canonical Back Affordance)**:
    1. **Top App Bar Navigation Icon**: The header bar displays a clean back arrow (`[←]`) whenever the user is in a sub-view or non-root step.
    2. **Zero Redundant In-View Buttons**: Never duplicate the top back arrow with a redundant "Back to Options" button in the content card below. Having two back triggers stacked vertically creates cognitive noise and steals vertical space.
    3. **Zero Redundant Alternative Actions**: Do not clutter the sub-form with actions already provided by the parent choice screen (e.g. "Import PDF" inside the Guided Form). Tapping `←` returns to the canonical home of those actions.
    4. **Android Hardware & Gesture Back**: Register an interceptor with `backButtonRegistry` so system back gestures and hardware buttons return to the choice screen seamlessly without exiting the app.
    5. **Preserve Ephemeral State**: Returning to the options screen must never discard already typed data; store state safely so re-entering resumes without data loss.

### 4.9 Separation of Evaluation vs. Navigation Controls (Zero Stacked Dual Navigators)
- ❌ **Anti-Pattern**: Placing interactive recommendation chips (e.g. "Suggested to add: [+ Skills] [+ Experience]") directly above or stacked on top of the canonical tab bar (`ProfileNavRail`). Tapping them only switches tabs, resulting in two duplicate sets of navigation controls solving the same problem.
- **Why It Fails**:
  1. **Mental Model Confusion**: A chip with a `+` icon suggests creating/adding data immediately; when it merely switches tabs, it creates a false affordance.
  2. **Screen Real Estate Waste**: Consumes 60–80px of vertical space on mobile screens, pushing active inputs and keyboards out of view.
  3. **Divided Attention**: Candidates face 10+ competing buttons (chips above vs tabs below) performing the identical view switch.
- ✅ **Standard**:
  1. **Evaluation Stays Pure**: Keep progress and completeness bars as compact status feedback (Score %, progress meter, section counter) without embedding duplicate tab-switching controls.
  2. **Single Canonical Navigator**: The tab bar / rail is the sole, authoritative mechanism for navigating between sections.
  3. **In-Tab Feedback**: Reflect section status directly on the tab itself (e.g. green checkmark `✓` for complete sections, item count chip `(3)` for active lists).

### 4.10 Mobile Section Carousel & ViewPager Navigation (Section Bar + Safe Gesture Isolation)
- ❌ **Anti-Pattern**: Squeezing a horizontal scrollable tab bar with 7+ items into a 40px mobile strip, forcing awkward micro-scrolling with the thumb where only 1.5 tabs fit.
- ❌ **Secondary Anti-Pattern (Unsafe Swiping)**: Attaching global swipe listeners to forms without excluding inputs, which causes cursor positioning or text selection inside `<input>`/`<textarea>` to trigger accidental section changes and close virtual keyboards.
- ✅ **Standard**:
  1. **Mobile Section Bar**: Replace the cramped mobile tabs strip with a clean, ergonomic navigator: `[←]` prev button, centered interactive pill displaying the active section `(current/total)` and completion status (`✓`), and `[→]` next button.
  2. **Section Bottom Sheet**: Tapping the center pill opens an accessible mobile Bottom Sheet (`Drawer anchor="bottom"`) displaying all sections cleanly with full titles, item counts, and completion indicators.
  3. **Safe Form Swipe Isolation (`useSwipeGesture`)**:
     - 100% aborted if touch starts on any interactive element (`input, textarea, select, button, a, [role="button"], .MuiInputBase-root, .MuiIconButton-root, .MuiChip-root`).
     - 100% aborted if touch starts within 24px of screen edges (`clientX < 24 || clientX > innerWidth - 24`) to protect Android OS system back/edge gestures.
     - Immediately cancels horizontal recognition if vertical displacement dominates, preserving buttery smooth 60/120fps native vertical form scrolling.

### 4.11 Form Cognitive Load Reduction via Progressive Disclosure (Essential Fields + Optional Link Chips)
- ❌ **Anti-Pattern (Wall of Fields)**: Rendering 8+ empty text inputs simultaneously on mobile or desktop without visual hierarchy. Candidates experience instant cognitive fatigue and abandonment because optional fields (GitHub, Portfolio, Phone, LinkedIn) appear as an endless list of mandatory chores.
- ✅ **Standard**:
  1. **Essential Core First**: Only render the fundamental fields by default (Full Name, Headline / Title, Email, Location). The form feels lightweight, spacious, and achievable in under 30 seconds.
  2. **Progressive Disclosure for Optional Links**: Provide clean, interactive chips (`[+ Phone]`, `[+ LinkedIn]`, `[+ GitHub]`, `[+ Portfolio]`) in an optional links drawer or section.
  3. **Data-Driven Visibility**: If an optional field already contains content (e.g. from an imported PDF, sample data, or previous session), automatically render it visible with its value. Never hide pre-existing candidate data.
  4. **Non-Destructive Removal**: Allow removing visible optional fields with a clean `[✕]` action that clears the value and returns the chip to the optional pool.

### 4.12 Conversational Single-Field Guided Flow ("One Question at a Time")
- ❌ **Anti-Pattern (Overwhelming Multi-Input Wall)**: Presenting an unbroken sequence of 6–10 form fields at once, triggering cognitive overload, keyboard jumping, and high drop-off rates on mobile viewports.
- ✅ **Standard**:
  1. **Single Hero Field Focus**: Display exactly one field per screen with a conversational prompt/question (e.g. "¿Cuál es tu nombre completo?"), clear context hint, and autofocus. No other inputs visible or peeking.
  2. **Dedicated Micro-Progress**: Render a distinct section micro-stepper (pill dots + step counter "3 de 7") visually segregated from the global macro wizard stepper ("Paso 1 de 3").
  3. **Contextual Action Buttons**: Primary bottom action switches dynamically between `[ Siguiente ]` (when required/filled) and `[ Omitir ]` (for optional empty fields). Enter key advances immediately.
  4. **Smooth Transitions & Haptics**: Subtle 200–250ms slide animations between steps coupled with `hapticsService.impactLight()` feedback on native/mobile.
  5. **Real-time Validation on Submit/Blur**: Show inline errors with helpful corrective copy without blocking user navigation on optional fields.
  6. **Celebratory Review Summary**: Conclude the section with an interactive review card listing all entered data with 1-tap `[Editar]` shortcuts and a prominent CTA to advance to the next section.
  7. **Android System Back Interception**: Register a Priority 50 handler in `backButtonRegistry` so system back navigates to the previous field within the flow instead of abruptly exiting.
  8. **Reversible View Mode**: Always provide an unobtrusive toggle (`[Ver todos]` / `[Modo paso a paso]`) so users can switch to the classic grid at will without losing state.

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
- [ ] **Calm Context Typography**: Choice screen titles must use medium weight (`fontWeight: 500`) to provide calm context without overpowering interactive options.
- [ ] **Reversible Sub-Flows**: Every sub-flow must provide top app bar `←` (without duplicate in-view buttons) and system back interception to return to the options screen without data loss.
- [ ] **Single Canonical Navigator**: Never stack duplicate interactive chips above the canonical tab bar; keep completeness bars as compact status feedback.
- [ ] **Safe Mobile Carousel Swiping**: Isolate form swipe listeners from inputs, textareas, and Android system edge zones (< 24px).
- [ ] **Progressive Disclosure in Forms**: Display essential fields first and use optional chips for secondary links/contacts to avoid "wall of fields" fatigue.
- [ ] **Conversational Step Flows**: For dense forms, support single-field focus ("One Question at a Time") with micro-steppers, Enter-to-advance, haptics, Priority 50 back handling, and a review summary.

