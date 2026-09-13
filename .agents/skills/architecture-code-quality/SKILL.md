---
name: architecture-code-quality
description: >-
  Use this skill when structuring state management (Zustand), refactoring components,
  enforcing SOLID & Clean Architecture, designing typed interfaces, or optimizing performance.
---

# Architecture & Code Quality Specialist Skill

This skill provides architectural guidelines, design patterns, state management standards, and TypeScript conventions for CV Studio.

---

## 1. Clean Layer Architecture & Boundaries

Code in this repository is organized into distinct, decoupled layers:

```text
src/
├── components/   # Pure UI & Layout. Receives props or consumes custom hooks. No direct API/SDK calls.
├── hooks/        # Stateful reusable logic, browser event listeners, composition hooks.
├── store/        # Zustand global state slices (design, data, tailoring, settings, history).
├── core/         # Business engines (AI client, markdown parser, audit logic, gap analysis).
├── templates/    # ATS resume template components & metadata registry.
├── theme/        # MUI palette, typography, breakpoints & dimensions.
├── types/        # TypeScript interfaces, domain models, discriminated unions.
└── utils/        # Pure helper functions without side effects.
```

### Dependency Inversion & Separation Rules
- **Rule 1**: Presentational components in `src/components/` must not import AI SDKs (`@google/generative-ai`) or raw storage APIs directly. Inject via custom hooks (`src/hooks/`) or state store (`src/store/`).
- **Rule 2**: Avoid "God Files". If a file exceeds ~300 lines or mixes data parsing with UI rendering, decompose it into a custom hook + focused subcomponents.

---

## 2. Zustand State Management & Slices

Global state is organized into modular domain slices in `src/store/slices/`:
- `dataSlice.ts` — Master CV markdown, tailored CV markdown, active document ID.
- `designSlice.ts` — Active theme, color palette, custom hex, font pairing, spacing density.
- `tailoringSlice.ts` — Job description, extracted keywords, match score, audit findings.
- `settingsSlice.ts` — AI provider preferences, API keys, custom model endpoints.
- `historySlice.ts` — Saved CV application versions and audit logs.

### State Best Practices
- **No Derived State in Store**: Calculate computed data on-the-fly via selectors or `useMemo`.
- **Selector Precision**: Always use granular selectors to prevent unnecessary re-renders:
  ```tsx
  // Good: Re-renders only when themeId changes
  const themeId = useCVStore((state) => state.themeId);

  // Avoid: Re-renders on any store update
  const { themeId, setMasterMarkdown } = useCVStore();
  ```

---

## 3. Strict TypeScript Standards

- **Zero `any` Policy**: Never use `any`. Use `unknown` with explicit type guards or type narrowing functions.
- **Interfaces for Contracts**: Prefer `interface` for prop definitions and domain models; use `type` for unions and utility transformations.
- **Discriminated Unions**: Model multi-state workflows (e.g., async status, template variants) using discriminated unions:
  ```typescript
  export type AsyncStatus =
    | { status: 'idle' }
    | { status: 'loading'; progress?: number }
    | { status: 'success'; data: CVData }
    | { status: 'error'; error: string };
  ```

---
## 4. Dumb Components & Single Responsibility (SRP) Workflow

### The 3-Tier Decomposition Model
When authoring or refactoring complex views:

1. **Domain Hook (`src/hooks/useXxx.ts`)**:
   - Manages state, Zustand subscriptions, debounces, and side-effects.
   - Returns a clean, minimal contract `{ data, handlers, uiStatus }`.
2. **Container / Orchestrator (`src/components/.../XContainer.tsx`)**:
   - Invokes the custom hook and handles high-level layout/routing.
   - Passes specific data slices down to dumb components without business logic in JSX.
3. **Dumb Components (`src/components/.../XCard.tsx`, `XToolbar.tsx`, `XModal.tsx`)**:
   - Pure presentational components.
   - Receive typed props: data to display + callbacks to trigger (`onClick`, `onSave`, `onDelete`).
   - Zero store imports, zero API calls, zero parsing logic.

### Refactoring Smells Checklist
Decompose immediately if a component:
- [ ] Exceeds **200 lines** of code.
- [ ] Imports both `useResumeStore` AND renders deep nested DOM trees.
- [ ] Performs string parsing / regex calculations inline during render.
- [ ] Contains multiple modals, forms, and cards in the same file.

---

## 5. Performance & Memoization Guidelines

- **Memoize with Purpose**: Apply `useMemo` and `useCallback` when passing callbacks to memoized children (`React.memo`) or when performing expensive parsing / regex AST calculations.
- **Pure Functions**: Keep utility helpers in `src/utils/` pure and easily testable.

---

## 6. Mobile & Cross-Platform UI Architecture Standards

### 6.1. In-Sheet Sub-View Navigation Pattern
- When a Bottom Sheet triggers secondary selection workflows (e.g., App Language Selector, Export Formats list):
  - ❌ **Anti-Pattern**: Opening a secondary nested `<Dialog>`, nested `<Drawer>`, or floating `<Menu>`.
  - ✅ **Standard**: Implement an internal sheet state:
    ```tsx
    const [sheetView, setSheetView] = useState<'main' | 'subview'>('main');
    ```
  - Transition between views within the same `<Drawer anchor="bottom">`. Provide an `<ArrowBackRoundedIcon>` button to return to `'main'`, and reset view state on drawer `onClose`.

### 6.2. Platform-Aware Viewport Alignment
- When rendering views directly on the device background (`platformService.isNative()`):
  - Parent scroll containers must adjust vertical alignment dynamically:
    ```tsx
    justifyContent: platformService.isNative() && isChoiceMode ? 'center' : 'flex-start'
    ```
  - This guarantees short task blocks center within Steven Hoober's Natural Reach Zone on tall screens (20:9) without breaking standard scroll behavior on desktop web.


