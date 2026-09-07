# AGENTS.md — Workspace Agent Guide

Welcome to **CV Studio (mi-cv-engine)**. This document establishes guidelines, architectural principles, and operating standards for all AI agents working within this repository.

---

## 1. Project Overview & Tech Stack

CV Studio is a local-first, privacy-respecting ATS resume builder, tailoring engine, and high-fidelity PDF generation studio.

### Technology Stack
- **Framework & UI**: React 19 (Functional Components + Hooks), Vite 6, TypeScript 5.7+ (Strict mode).
- **Component Library & Theming**: Material-UI (MUI v9) + Emotion (`@emotion/react`, `@emotion/styled`).
- **State Management**: Zustand v5 (modular domain slices).
- **Internationalization**: `i18next` + `react-i18next` (5 locales: `en`, `es`, `de`, `fr`, `it`).
- **Markdown & PDF Generation**: `marked` (Markdown parsing), Native browser print / Puppeteer PDF generation.
- **AI Synthesis**: Google Gemini API (`@google/generative-ai`) and configurable OpenAI-compatible providers.
- **CLI Engine**: `tsx` (runtime), `esbuild` (bundling to `bin/cli.mjs`).

---

## 2. Workspace Rules & Standards

All agent operations in this repository must strictly adhere to the following rules:

1. **Coding Standards**: See [coding-rules.md](file:///.agents/rules/coding-rules.md) for SOLID, DRY, KISS/YAGNI, naming conventions, and layer architecture.
2. **Component Architecture & Dumb Components**: See [component-architecture-rules.md](file:///.agents/rules/component-architecture-rules.md) for presentational/container separation, minimal components, and zero business logic in UI.
3. **Design Tokens & Styling**: See [styling-rules.md](file:///.agents/rules/styling-rules.md) for theme tokens, responsive mobile-first layouts, and A4 page dimensions.
4. **Internationalization (i18n)**: See [i18n-rules.md](file:///.agents/rules/i18n-rules.md) for multilingual synchronization across `src/i18n/locales/`.
5. **Anti-Patterns & Code Hygiene**: See [anti-patterns-rules.md](file:///.agents/rules/anti-patterns-rules.md) for zero-tolerance on native alerts, burned dummy scores, raw hex/border radiuses in JSX, and direct SDK calls in UI.
6. **Mobile-First UX Architecture**: See [mobile-first-ux-rules.md](file:///.agents/rules/mobile-first-ux-rules.md) for strict mobile (`xs`) heuristics: clean top headers, `•••` overflow menus, bottom sheets, FAB triggers, and bottom navigation.

---

## 3. Specialized Agent Skills & Personas

The repository includes dedicated on-demand skills located in `.agents/skills/`:

- 🎨 **`ui-ux-design-expert`**: UI components, design tokens, micro-interactions, responsive mobile layouts, a11y, and UX heuristics.
- 🏗️ **`architecture-code-quality`**: Clean layer architecture, SOLID design, Zustand state slices, strict TypeScript typing, and memoization.
- 🛡️ **`code-audit-compliance`**: Automated hygiene scanners, zero-dummy scores, anti-pattern eradication, and Atomic Design audits.
- 📄 **`cv-templates-manager`**: ATS resume templates registry, color palettes, font pairings, and print CSS stylesheets.
- ⚡ **`ai-tailoring-workflow`**: Gemini/OpenAI synthesis prompts, Google XYZ formula, integrity safeguards, and ATS gap scoring.
- 🌐 **`i18n-workflow`**: 5-locale synchronization (`en`, `es`, `de`, `fr`, `it`), namespace organization, and fallback standards.
- 🧪 **`qa-testing-compliance`**: Typechecking (`tsc --noEmit`), build verification, i18n parity audits, and print rendering validation.
-  **`product-owner-strategy`**: Product discovery, user friction analysis, value vs. effort prioritization (RICE/Kano), user stories with acceptance criteria, and feature innovation radar.

---

## 4. Directory Layout

```text
customs CVs/
├── .agents/                      # Customization system (rules & skills)
│   ├── rules/                    # Granular project rules (anti-patterns, styling, coding)
│   └── skills/                   # On-demand agent runbooks & workflows
├── bin/                          # Built CLI binary (cli.mjs)
├── prompts/                      # System prompts & AI templates
├── scripts/                      # Maintenance & compliance scripts (audit-codebase.mjs)
├── src/
│   ├── app/                      # Main App container & wizard state
│   ├── cli/                      # Command-line interface commands & wizard
│   ├── components/               # Atomic Design components
│   │   ├── atoms/                # Primitive UI elements (MatchScoreBadge, StatusDot, etc.)
│   │   ├── molecules/            # Reusable interactive composites (SearchBarWithClear, etc.)
│   │   ├── slots/                # Standardized CV document template slots
│   │   ├── landing/              # Welcome & Master CV input views
│   │   └── studio/               # 3-step Studio wizard, Preview Studio & pipeline
│   ├── constants/                # App links, defaults, models & global constants
│   ├── core/                     # AI services, markdown parser, audit logic
│   ├── hooks/                    # Reusable stateful domain hooks
│   ├── i18n/                     # i18next configuration & JSON locales
│   ├── store/                    # Zustand state management
│   ├── styles/                   # Design tokens (tokens.css), print & preview CSS
│   ├── templates/                # ATS CV Templates registry & metadata
│   ├── theme/                    # MUI theme, dimensions & typography
│   └── types/                    # Shared TypeScript interfaces & types
├── master-data.md                # Master CV markdown database
├── target-job.md                 # Target vacancy description
└── rules.md                      # ATS rules & tailoring prompt constraints
```

---

## 5. Key Development Commands

- `npm run dev`: Start local Vite development server with HMR.
- `npm run build`: Typecheck with `tsc` and create optimized Vite production bundle in `dist/`.
- `npm run typecheck`: Run TypeScript compiler without emitting files (`tsc --noEmit`).
- `npm run check:compliance`: Run automated code hygiene, anti-patterns and i18n parity audit.
- `npm run pdf`: Generate PDF from current `master-data.md` via Puppeteer CLI.
- `npm run build:cli`: Bundle CLI executable with `esbuild`.

---

## 6. Verification Checklist for Agents

Before completing any task:
1. Ensure TypeScript compiles cleanly (`npm run build` or `npm run typecheck` exits with code 0).
2. Ensure compliance audit passes (`npm run check:compliance` exits with code 0).
3. Ensure no hardcoded non-English user-facing strings were introduced without i18n keys.
4. Ensure mobile (`xs`) responsiveness remains intact without accidental button overflow or multi-line wrapping.
5. Keep commit messages clear, following the Conventional Commits specification (`feat:`, `fix:`, `refactor:`, `style:`, `docs:`).
