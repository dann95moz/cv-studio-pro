# Mobile-First UX Architecture & Responsive Rules

This document establishes the mandatory architectural standards, UX heuristics, and layout rules for **mobile (`xs`) experiences** in **CV Studio**. All AI agents and developers must strictly adhere to these rules.

---

## 1. The Core Principle: Mobile-First Architecture vs. "Desktop Retrofitting"

### 🚫 The "Desktop Retrofitting" Anti-Pattern (Why Early Mobile Failed)
In early iterations, the desktop workspace layout (which features a 1200px horizontal toolbar with 15+ buttons, a left rail, and a right drawer) was adapted to mobile merely by:
- Wrapping toolbars (`flexWrap: 'wrap'`), causing buttons to stack into 3–4 rows.
- Hiding text labels (`display: { xs: 'none', sm: 'inline' }`), leaving a sea of cryptic icon buttons.
- Forcing desktop side panels into 100%-width overlays that broke canvas visibility.

**The result was unacceptable:**
1. **Vertical Viewport Theft**: Stacked headers and rails consumed 40%+ of the mobile screen height, leaving almost no room to view the CV preview.
2. **Ergonomic Strain**: Primary actions were pinned in the top-left or top-right corners—the hardest areas to reach with one hand (outside the natural "Thumb Zone").
3. **Cognitive Overload**: Exposing every desktop action at once violated the fundamental UX principle of **Progressive Disclosure**.

### ✅ The Mobile-First Standard
On mobile viewports (`xs`: 0px–599px), the interface must **not** be a scaled-down desktop app. It must adopt native mobile design patterns:
- **Clean Top Header**: Step title + progress bar + single `•••` overflow menu.
- **Secondary Document Bar**: Compact document switcher dropdown + language chip.
- **Maximum Canvas Focus**: Unobstructed document preview occupying the maximum screen real estate.
- **Floating Action Button (FAB) & Bottom Sheet**: Tool panels (Templates, Design, LinkedIn, Compare) live in a slide-up bottom sheet triggered from the thumb zone.
- **Fixed Bottom Navigation**: Primary domain tabs (`Estudio`, `Postulaciones`) anchored at the bottom.

---

## 2. The 5 Mandatory Mobile Layout Primitives

```text
┌─────────────────────────────────────────────────────────┐
│ Paso 3 de 3 · CV y PDF                              ••• │ ◄── 1. Clean Top Header
├─────────────────────────────────────────────────────────┤ (Accent progress bar)
│ ┌──────────────────────┐  ┌───────┐                     │
│ │ 📄 Currículum     ⌄  │  │ EN  ⌄ │                     │ ◄── 2. Secondary Document Bar
│ └──────────────────────┘  └───────┘                     │
│                                                         │
│                                                         │
│                                                         │
│                   VISTA PREVIA DEL CV                   │ ◄── 3. Unobstructed Canvas
│                   (Maximum viewport)                    │
│                                                         │
│                                           ┌─────────┐   │
│                                           │   ⊞     │   │ ◄── 4. Floating Action Button (FAB)
│                                           └─────────┘   │       (Triggers Bottom Sheet)
├─────────────────────────────────────────────────────────┤
│        ✦ Estudio                🏢 Postulaciones         │ ◄── 5. Fixed Bottom Navigation
└─────────────────────────────────────────────────────────┘
```

---

### Pillar 1: Clean Top Header & Step Progress
- The top header on mobile (`xs`) must be a **single row** with a fixed height (`52px`–`56px`).
- **Left**: Step title and breadcrumb (e.g. `Paso 3 de 3 · CV y PDF`).
- **Right**: Single `•••` (More options / Overflow) `IconButton`.
- **Bottom**: Thin 2px accent progress bar.
- ❌ **Forbidden on Mobile**: Placing Save, Re-tailor, Download PDF, or Autofit buttons directly in the top header.

---

### Pillar 2: Global `•••` Overflow Menu (Progressive Disclosure)
All meta-actions and secondary tools must be encapsulated inside the top-right `•••` menu:
- `🌐 Idioma app` (Language switcher with current code, e.g. `ES`).
- `☼ Tema` (Theme switcher: Claro / Oscuro).
- `▦ Sincronizar (QR)` (Multidevice sync modal trigger).
- `⌥ Ver en GitHub` (Repository link).
- Secondary export actions (Download Plain Text ATS, Download DOCX, Download Markdown).

---

### Pillar 3: Contextual Secondary Document Bar
Immediately beneath the top header, render a clean, horizontal secondary control bar:
- **Document Selector**: A compact rounded dropdown button showing the active document:
  - `📄 Currículum ⌄`
  - `✉ Carta de presentación ⌄`
- **Language Variant**: A compact chip/button showing the active document language:
  - `EN ⌄` / `ES ⌄` (tapping opens the translation variant picker or modal).
- ❌ **Forbidden**: Adding more than these 2 controls in this row on mobile.

---

### Pillar 4: Floating Action Button (FAB) & Slide-Up Bottom Sheet
Instead of desktop side rails or horizontal icon bars eating screen space:
- Render a circular **FAB** in the bottom-right corner (accent/terracotta color, e.g. `48px` or `56px`), positioned cleanly above the bottom navigation.
- Tapping the FAB opens a native **Bottom Sheet** (`Drawer anchor="bottom"` with rounded top corners `16px` and drag handle `—`).
- **Bottom Sheet Menu Items**:
  1. `⊞ Plantillas` (Templates selector drawer).
  2. `🎨 Diseño & Formato` (Theme, font, spacing, margins).
  3. `in LinkedIn` (LinkedIn profile generator).
  4. `⇄ Comparar` (Version diff & history).
- Tapping any item closes the bottom sheet and opens the dedicated focused editor or modal.

---

### Pillar 5: Fixed Bottom Navigation Bar
At the very bottom of the screen (docked and elevated), render a native `BottomNavigation`:
- **Item 1**: `✦ Estudio` (Navigates to the current active studio wizard step).
- **Item 2**: `🏢 Postulaciones` (Navigates to the Job Applications Tracker & Kanban board).
- Must adhere to mobile safe-area insets (`env(safe-area-inset-bottom)`).

---

## 3. Strict Prohibitions & Anti-Patterns for Mobile (`xs`)

1. ❌ **The "Desktop Toolbar Squeeze"**: Squeezing 5+ buttons onto a mobile header row or allowing toolbars to wrap into multiple lines.
2. ❌ **Viewport Theft (>20% rule)**: Top headers + toolbars must never consume more than **15–20%** of the mobile screen height. The remaining 80%+ belongs to the candidate's CV.
3. ❌ **Desktop Side-Rails on Mobile**: Never render a left or right vertical bar that shifts or pushes the mobile preview off-center.
4. ❌ **Rogue Tiny-Icon Rows**: Never render a row of 5+ micro-icons with 9px labels crammed underneath the canvas.
5. ❌ **Scattered Global Settings**: Theme and language toggles must not appear in 3 different toolbars. On mobile, they belong exclusively in the `•••` overflow menu.

---

## 4. Responsive Verification Checklist for Agents

Before completing any task affecting UI or layout:
1. [ ] Is the top header on `xs` clean and single-row with `•••` overflow menu?
2. [ ] Are global settings (theme, app language, sync QR, GitHub) located in the `•••` menu on mobile?
3. [ ] Does the document canvas occupy the maximum viewport height without being crowded by stacked bars?
4. [ ] Are tool panels (Templates, Design, LinkedIn, Diff) accessible via a bottom sheet or FAB?
5. [ ] Is the bottom navigation (`Estudio`, `Postulaciones`) anchored at the bottom with proper safe-area padding?
