---
name: code-audit-compliance
description: >-
  Use this skill to audit the workspace against all known anti-patterns, burned code,
  hardcoded styles, dummy scores, monolithic components, and Atomic Design compliance in CV Studio.
---

# Code Audit & Quality Compliance Specialist Skill

This skill establishes automated procedures, audit checklists, regex scanners, and structural standards to guarantee that code contamination, burned styles, dummy data, and architectural violations are prevented, caught, and eradicated in **CV Studio**.

---

## 1. Automated Compliance Verification

Run the automated compliance scanner:

```bash
npm run check:compliance
```

This automated script checks:
- **Zero Browser Popups**: Scans for `alert(`, `confirm(`, and `prompt(`.
- **Zero Dummy Scores**: Scans for `|| 92`, `|| 8.8`, and hardcoded score fallbacks.
- **Zero Burned Pixel Radiuses**: Scans for `borderRadius: '\d+px'` in component `sx`.
- **Zero Untyped Any in Store**: Scans for `loadJson<any>`.
- **Zero AI Service Invocation in UI**: Scans for direct imports of AI generator services in `src/components/`.
- **Zero Raw HTML `<button>` in UI**: Scans for `<button` in `src/components/` (must use MUI `<Button>` or `<IconButton>`).
- **Zero Button Radius Overrides**: Scans for `borderRadius` on `<Button` in `src/components/` (must inherit theme pill shape).
- **100% i18n Parity**: Scans all 10 namespaces across `en`, `es`, `de`, `fr`, and `it`.

---

## 2. Quick Regex Scanners for Manual Auditing

Run these searches to detect latent violations:

| Violation | Search Pattern / Command | Remediation |
| :--- | :--- | :--- |
| **Native Popups** | `alert\(|confirm\(|prompt\(` | Replace with MUI `<Snackbar>` or `<ConfirmDeleteDialog>` |
| **Burned Dummy Scores** | `\|\|\s*92|\|\|\s*8\.8|matchScore\s*:\s*\d{2}` | Replace with real score, `?? 0`, or placeholder `--` |
| **Arbitrary Border Radiuses** | `borderRadius:\s*['"][0-9]+px['"]` | Replace with `RADIUS_TOKENS` or theme numeric shape (`1`, `2`) |
| **Button Radius Override** | `<Button[\s\S]*?borderRadius:` | Remove `borderRadius` override; inherit theme `RADIUS_TOKENS.full` |
| **Raw HTML Buttons** | `<button\b` in `src/components/` | Replace with MUI `<Button>` or `<IconButton>` |
| **Legacy Button Classes** | `studio-btn` | Replace with standard MUI `variant="contained|outlined|text"` |
| **Raw Hex in JSX** | `(?:bgcolor|color|borderColor|background):\s*['"]#[0-9a-fA-F]{3,6}['"]` | Replace with `theme.palette.*` or `alpha(...)` |
| **Direct AI in UI** | `import.*from.*ai-service.*` in `src/components/` | Extract into `src/hooks/useXWorkflow.ts` |
| **Any in Store** | `loadJson<any>` or `:\s*any\b` | Use strict discriminated union or domain type |

---

## 3. Structural & Atomic Design Rules

### 3.1. Layer Organization
Ensure every component lives in its designated Atomic Design layer:
- `src/components/atoms/`: Pure primitive dumb components (`MatchScoreBadge`, `StatusDot`, `ActionIconButton`, `SectionHeader`).
- `src/components/molecules/`: Reusable composite units with local UI state (`SearchBarWithClear`, `ColorPalettePicker`).
- `src/components/slots/`: Document template layout slots (`HeaderSlot`, `ExperienceSlot`, `SkillsSlot`).
- `src/components/studio/`: Feature domain organisms and containers (`history/`, `preview/`, `profile/`, `audit/`, `ai/`).
- `src/hooks/`: Stateful domain logic and container-hook wrappers.

### 3.2. Sizing Standards
- Dumb components must stay under **150–200 lines**.
- If a component grows beyond 250 lines, split into:
  1. Custom Hook (`src/hooks/useXWorkflow.ts`)
  2. Main Container View
  3. Extracted child cards, lists, toolbars, or dialogs

---

## 4. The Anti-Pattern Eradication Protocol

Whenever reviewing or writing code:

1. **Step 1: Check UI Imports**
   - Does any component import `useResumeStore` directly when it should be presentational?
   - Does any component import `generateCoverLetter` or `@google/generative-ai`?
   - *Fix*: Extract a hook in `src/hooks/`.

2. **Step 2: Check Values & Magic Numbers**
   - Are there any `|| 92` or hardcoded dummy values?
   - *Fix*: Use real metadata from parser or `?? 0` / `--`.

3. **Step 3: Check Design Tokens**
   - Are there any `#hex` colors or `'8px'` border radiuses?
   - *Fix*: Use MUI `theme.palette` and `RADIUS_TOKENS`.

4. **Step 4: Verify Compilation & Audit**
   - Run `npm run typecheck`
   - Run `npm run check:compliance`
   - Run `npm run build`
