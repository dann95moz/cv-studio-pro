# Anti-Patterns & Code Hygiene Rules

This document establishes strict prohibitions and zero-tolerance criteria against code contamination, burned styles, dummy data, and architectural violations in **CV Studio**. All AI agents and developers must strictly follow these rules.

---

## 1. 🚫 Zero Tolerance: Burned Code & Anti-Patterns

### 1.1. Native Browser Dialogs (`alert`, `confirm`, `prompt`)
- ❌ **STRICTLY FORBIDDEN**: Calling `window.alert()`, `alert()`, `window.confirm()`, `confirm()`, or `window.prompt()`.
  - Native popups freeze browser execution, bypass the design system, look unprofessional, and break internationalization.
- ✅ **MANDATORY**:
  - For notifications / non-blocking errors: Use MUI `<Snackbar>` / `<Alert>` with localized messages (`useTranslation()`).
  - For destructive confirmations (delete, overwrite, reset): Use `<ConfirmDeleteDialog>` or custom themed `<Dialog>`.

---

### 1.2. Burned Dummy Scores & Fallback Magic Numbers
- ❌ **STRICTLY FORBIDDEN**: Injecting hardcoded numbers as false fallbacks:
  ```typescript
  // NEVER DO THIS:
  matchScore: matchScore || 92
  qualityScore: score || 8.8
  score: data?.score || 94
  ```
- ✅ **MANDATORY**:
  - Use real evaluation data from parsing/AST analysis.
  - If a score has not been calculated yet, use `null`, `undefined`, or `0`.
  - In UI display: Render placeholder `--` or `—` when `!score || score <= 0`, or use the atomic component `<MatchScoreBadge score={score} />`.

---

### 1.3. Direct Service & SDK Invocation in UI Components
- ❌ **STRICTLY FORBIDDEN**:
  - Importing `@google/generative-ai` or AI SDKs directly in components under `src/components/`.
  - Directly executing async AI generators (`generateCoverLetter()`, `generateLinkedInProfile()`) inside UI views.
- ✅ **MANDATORY**:
  - Encapsulate AI services, API calls, and Zustand orchestrations inside domain custom hooks in `src/hooks/` (e.g. `useCoverLetterWorkflow`, `useLinkedInWorkflow`, `useStepPreviewWorkflow`).
  - UI components receive data and callbacks via props, or invoke dedicated custom hooks.

---

### 1.4. Monolithic "God Components" (>200 Lines)
- ❌ **STRICTLY FORBIDDEN**: Authoring or leaving components with >200 lines mixing:
  - Form validation + parsing + DOM measurement + multiple modal dialogs.
  - Giant `switch(templateId)` statements rendering inline SVG/JSX.
- ✅ **MANDATORY**:
  - Follow the **3-Tier Decomposition Model**:
    1. **Domain Hook** (`src/hooks/useX.ts`): State, debounces, mutations, stores.
    2. **Orchestrator Container** (`src/components/.../XView.tsx`): High-level layout under ~250 lines.
    3. **Dumb Components / Atoms / Molecules**: Focused presentational components under 150 lines.
  - For registries (templates, icons, miniatures): Use dictionary/map registries (e.g., `MINIATURE_REGISTRY`).

---

### 1.5. Burned Styles, Arbitrary Radiuses & Inline Colors
- ❌ **STRICTLY FORBIDDEN**:
  - `borderRadius: '8px'`, `'16px'`, `'6px'`, `'10px'`, `'64px'`.
  - Inline hex colors: `bgcolor: '#0f172a'`, `color: '#0284c7'`, `#ffffff`.
  - Raw `rgba(...)` in component JSX.
  - Arbitrary `zIndex` numbers (`zIndex: 1400`, `zIndex: 10001`, `zIndex: 100`).
- ✅ **MANDATORY**:
  - Use `RADIUS_TOKENS` from `src/theme/dimensions.ts` or theme shape (`borderRadius: 1` = 8px, `borderRadius: 2` = 16px).
  - Use semantic theme palette tokens: `theme.palette.background.paper`, `theme.palette.text.primary`, `alpha(theme.palette.primary.main, 0.08)`.
  - Use standard MUI z-indexes: `(theme) => theme.zIndex.snackbar`, `(theme) => theme.zIndex.modal`.

---

### 1.6. Untyped `any` in Stores & Data Models
- ❌ **STRICTLY FORBIDDEN**: Using `any` in state slices, selectors, or parsing schemas (e.g. `loadJson<any>`).
- ✅ **MANDATORY**:
  - Always provide explicit, strict domain models (`ThemeId`, `PaletteId`, `FontFamilyId`, `SpacingDensity`, `AIProviderSettings`, `GeneratedCvVersion[]`).
  - Use `unknown` with explicit type guards when runtime payload shape is uncertain.

---

### 1.7. The Mobile Desktop-Retrofitting Anti-Pattern (Viewport Theft & Toolbar Crowding)
- ❌ **STRICTLY FORBIDDEN**:
  - Squeezing wide desktop horizontal toolbars (10+ buttons) onto mobile viewports (`xs`) by shrinking paddings or wrapping buttons into 3–4 stacked rows.
  - Consuming >20% of the mobile screen height with static headers and toolbars, starving the document canvas.
  - Panning or pushing the mobile canvas off-center with desktop side-rails.
  - Scattering global settings (Theme, Language, Sync QR) across multiple toolbars instead of a single `•••` menu.
- ✅ **MANDATORY**:
  - Follow [mobile-first-ux-rules.md](file:///.agents/rules/mobile-first-ux-rules.md): single-row top header + `•••` overflow menu + secondary document bar + Bottom Sheet for tools + fixed Bottom Navigation.

## 2. Atomic Design Structure Enforcement

All new visual components must adhere to the atomic hierarchy:

```text
src/components/
├── atoms/        # Primitive, highly reusable visual elements (MatchScoreBadge, StatusDot, ActionIconButton, SectionHeader)
├── molecules/    # Combinations of atoms with simple local interaction (SearchBarWithClear, ColorPalettePicker)
├── slots/        # CV document rendering slots (HeaderSlot, ExperienceSlot, SkillsSlot, etc.)
├── studio/       # Feature domain containers & organisms (history/, preview/, profile/, audit/, ai/)
└── landing/      # Landing page organisms & hero components
```

### Golden Rule of Atoms & Molecules:
- Atoms and Molecules must be **100% presentational** (Dumb Components).
- Zero direct store imports (`useResumeStore` forbidden).
- Zero SDK / API imports.
- Only receive props (`data`, `handlers`, `sx`) and return JSX.

---

## 3. Pre-Commit Compliance Checklist

Before committing any change, verify that:
1. [ ] No `alert(`, `confirm(`, or `prompt(` exists in `src/`.
2. [ ] No `|| 92`, `|| 8.8`, or arbitrary hardcoded scores exist.
3. [ ] No inline hex colors or arbitrary pixel `borderRadius` were added to JSX `sx`.
4. [ ] No AI service or direct store mutation exists inside presentational components.
5. [ ] TypeScript compiler passes cleanly: `npm run typecheck` exits 0.
6. [ ] Compliance audit passes: `npm run check:compliance` exits 0.
