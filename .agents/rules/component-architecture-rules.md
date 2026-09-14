---
trigger: always_on
---

# Component Architecture: Dumb Components, SOLID, DRY & KISS Rules

This document defines the strict component architecture and separation-of-concerns standards for **CV Studio**. All AI agents and developers must adhere to these principles when creating or refactoring components.

---

## 1. The Container / Dumb (Presentational) Component Pattern

Every UI feature must be cleanly divided into **Smart Containers / Domain Hooks** and **Dumb Presentational Components**.

```text
┌──────────────────────────────────────────────────────────────────┐
│                   SMART CONTAINER / CUSTOM HOOK                  │
│  - Connects to Zustand stores (useResumeStore)                   │
│  - Dispatches async mutations, API calls, debounces              │
│  - Manages routing, modals, and workflow orchestration           │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ Props (data + callbacks)
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                   DUMB PRESENTATIONAL COMPONENT                  │
│  - 100% Pure & Deterministic: same props ➔ same UI               │
│  - ZERO direct store imports (useResumeStore forbidden)          │
│  - ZERO direct API/SDK imports (fetch, Gemini/AI forbidden)      │
│  - Only local ephemeral UI state (e.g. menu open/close anchor)   │
│  - Emits user actions via typed callbacks (onSave, onSelect)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Dumb Component Golden Rules (Zero Business Logic)

1. **Pure Props Contract**:
   - A dumb component receives pure data and action callbacks via a typed `interface XProps`.
   - It does **not** compute global business rules or parse external file schemas internally.
2. **Forbidden Inside Dumb Components**:
   - ❌ `useResumeStore((s) => s.xyz)` or direct global store mutations.
   - ❌ `fetch()`, `axios`, or AI provider SDK imports (`@google/generative-ai`).
   - ❌ `localStorage`, `sessionStorage`, or file system APIs.
   - ❌ Complex business validation or Markdown parsing engines.
3. **Allowed Inside Dumb Components**:
   - ✅ Rendering JSX with Material-UI and theme tokens.
   - ✅ Translation hooks (`useTranslation()`) with fallback strings.
   - ✅ Local UI micro-state: `openMenuAnchor`, `isExpanded`, `isHovered`, `tooltipOpen`.
   - ✅ Passing typed events up: `onClick={() => onSelect(item.id)}`.

---

## 3. SOLID Principles in Component Design

- **S — Single Responsibility Principle (SRP)**:
  - Each component has **one reason to change**.
  - If a component handles list rendering, card items, filtering headers, and dialog confirmations in a single file, split it into:
    1. Parent layout / container.
    2. `XList.tsx` (list presentation).
    3. `XCard.tsx` (individual item presentation).
    4. `XFilterBar.tsx` (search/filter controls).
    5. `XDeleteModal.tsx` (modal confirmation).
  - **File Size Guideline**: Keep presentational components under **150–200 lines**.
- **O — Open/Closed Principle**:
  - Extend component variants via **composition (`children`, slots, render props)** rather than adding cascading boolean flags (`if (isCompact && isHeader && !isModal)`).
- **L — Liskov Substitution Principle**:
  - Sub-elements (e.g. buttons, card variants, slot renderers) must fulfill their prop contracts without unexpected side-effects.
- **I — Interface Segregation Principle**:
  - Do not pass a monolithic 50-field `CVData` or `GeneratedCvVersion` object to a component that only needs `name`, `role`, and `avatar`.
  - Prefer granular, focused props (`title: string; date: string; onEdit: () => void;`).
- **D — Dependency Inversion Principle**:
  - UI components depend on abstractions (interfaces, callback signatures), never on concrete infrastructure engines.

---

## 4. DRY (Don't Repeat Yourself) Standards

1. **Centralize Reusable Logic in Hooks**:
   - Clipboard operations ➔ `useCopyToClipboard.ts`
   - Date formatting ➔ `formatLocalizedDate` in `src/utils/dateUtils.ts`
   - Font family tokens ➔ `FONT_FAMILY_CSS_MAP` in `src/theme/typography.ts`
2. **Centralize Shared Types**:
   - Define domain interfaces in `src/types/` (e.g. `cv.ts`, `components.ts`, `store.ts`).
   - Never duplicate interface declarations across sibling files.
3. **No Copy-Pasted Markup**:
   - If a button group, status badge, or confirmation modal appears in 2+ places with identical styling, extract it into a dumb component in `src/components/studio/common/`.

---

## 5. KISS & YAGNI (Keep It Simple & Minimal)

1. **Simplest Working Solution**:
   - Avoid speculative configuration flags, unused props, or complex higher-order component factories when a standard functional component with props suffices.
2. **Derive During Render**:
   - **Never mirror props in `useState`** unless creating a temporary edit buffer that requires explicit commit/cancel actions.
   - Compute counts, filtered arrays, and validation booleans on-the-fly or via `useMemo`.

---

---

## 6. The Facade Pattern Standard (Decoupled Domain Orchestration)

To prevent cascading re-renders and tight coupling between UI components and granular state stores:
1. **Domain Facades in `src/hooks/facades/`**:
   - Complex views must not invoke 15–30 loose selectors from multiple Zustand slices directly.
   - Introduce a domain facade hook (e.g. `useStudioFacade()`, `useStepTargetJobFacade()`).
   - The facade encapsulates the store subscriptions, debouncing, auto-extractions, and high-level actions, returning clean, grouped objects (`navigation`, `documents`, `ai`, `system`).
2. **Code-Splitting & Lazy Loading for Wizard Steps**:
   - Heavy feature views (`StepMasterData`, `StepTargetJob`, `StepPreview`, `QualityAuditView`, `GapAnalysisView`) must be loaded dynamically via `React.lazy()` and wrapped in `<Suspense fallback={<StudioSkeleton />} />`.
   - This ensures the Web bundle remains minimal (< 500 kB gzip) while Android (Capacitor) loads all chunks with zero latency from the local APK bundle.
3. **Resilience & Error Boundaries**:
   - All dynamic document rendering (such as `CVRenderer` inside `StepPreview`) and the application root (`main.tsx`) must be enclosed in an `<ErrorBoundary>`.
   - Never allow an unhandled template or parsing exception to crash the entire application to a blank screen.

---

## 7. Verification Checklist for Agents

Before authoring or refactoring any component:
1. [ ] Is the component purely presentational (Dumb), or does it belong in `hooks/` / `store/`?
2. [ ] Are all props strictly typed via an explicit `interface`?
3. [ ] Does the component avoid importing global stores or AI SDKs directly?
4. [ ] Is the component under ~200 lines with a single, clear visual responsibility?
5. [ ] Are repeated helpers and tokens imported from centralized utilities?
6. [ ] Is the component protected with an `ErrorBoundary` if rendering dynamic external data?
7. [ ] Does it use a domain Facade hook if coordinating multiple store domains?

