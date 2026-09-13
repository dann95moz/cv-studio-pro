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
- **Clean Top Header**: Step title + progress bar + single Settings (⚙) icon.
- **Secondary Document Bar**: Compact document switcher dropdown + language chip.
- **Maximum Canvas Focus**: Unobstructed document preview occupying the maximum screen real estate.
- **Floating Action Button (FAB) & Bottom Sheet**: Tool panels (Templates, Design, LinkedIn, Compare) live in a slide-up bottom sheet triggered from the thumb zone.
- **Fixed Bottom Navigation**: Primary domain tabs (`Estudio`, `Postulaciones`) anchored at the bottom.

---

## 2. The 5 Mandatory Mobile Layout Primitives

```text
┌─────────────────────────────────────────────────────────┐
│ Paso 3 de 3 · CV y PDF                                ⚙ │ ◄── 1. Clean Top Header
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
- **Right**: Single Settings (⚙) `IconButton` (`SettingsRoundedIcon`).
- **Bottom**: Thin 2px accent progress bar.
- ❌ **Forbidden on Mobile**: Placing Save, Re-tailor, Download PDF, or Autofit buttons directly in the top header.

---

### Pillar 2: Global Settings (⚙) Bottom Sheet (Zero Floating Menus)
- ❌ **STRICTLY FORBIDDEN ON APP & MOBILE WEB**: Anchored floating dropdown menus (`<Menu>`, `<Popover>`) floating near the top or middle of the screen.
- ✅ **MANDATORY**: Tapping ⚙ MUST open a native **Slide-Up Bottom Sheet** (`Drawer anchor="bottom"` with top drag handle `—`, `borderTopLeftRadius: 16px`, `borderTopRightRadius: 16px`, and safe-area padding).
- Encapsulate meta-actions and system preferences inside this thumb-zone bottom sheet without duplicating primary navigation:
  - `🌐 Idioma app` (Navigates to an in-sheet language selection sub-view with Back button).
  - `☼ Tema` (Theme switcher: Claro / Oscuro).
  - `📖 Ver Tour / Intro` (Onboarding tour replay).
  - `⌥ Ver en GitHub` (Repository link).
  *(Note: Primary domain navigation like 'Mis Postulaciones' lives permanently in `MobileBottomNav`, and 'Sincronizar QR' lives in the Step 1 Profile view to prevent redundant action clutter).*

---

### Pillar 3: Contextual Secondary Document Bar (Bottom Sheet Pickers)
Immediately beneath the top header, render a clean, horizontal secondary control bar:
- **Document Selector**: A compact rounded button showing the active document (`📄 Currículum ⌄` / `✉ Carta de presentación ⌄`).
  - Tapping MUST open a **Slide-Up Bottom Sheet** to switch document types. Floating `<Menu>` is strictly forbidden.
- **Language Variant**: A compact chip showing the active document language (`EN ⌄` / `ES ⌄`).
  - Tapping MUST open a **Slide-Up Bottom Sheet** listing available translation variants and the AI translation trigger. Floating `<Menu>` is strictly forbidden.
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
- **Secondary Actions & Export Formats**: Tapping "Descargar / Exportar" transitions seamlessly to an in-sheet sub-view (`activeView: 'export'`) with a Back arrow button (`<`), never opening a floating `<Menu>` or nested popup.
- Tapping any tool item closes the bottom sheet and opens the dedicated focused editor or modal.

---

### Pillar 5: Fixed Bottom Navigation Bar
At the very bottom of the screen (docked and elevated), render a native `BottomNavigation`:
- **Item 1**: `✦ Estudio` (Navigates to the current active studio wizard step).
- **Item 2**: `🏢 Postulaciones` (Navigates to the Job Applications Tracker & Kanban board).
- Must adhere to mobile safe-area insets (`env(safe-area-inset-bottom)`).

---

## 3. Touch Ergonomics & Interaction Physics: Fitts's Law + Steven Hoober Thumb Zone

Mobile devices (particularly modern tall aspect ratios like 19.5:9, 20:9, and 21:9) demand strict adherence to human hand biomechanics. Interfaces must never place primary actions at physical reach extremes.

### 3.1. Steven Hoober's Thumb Zone Architecture

```text
┌─────────────────────────────────────────────────────────┐
│ [Clock / Battery] ◄── Status Bar (OS reserved)          │
├─────────────────────────────────────────────────────────┤
│                     OFF-LIMITS / STRETCH ZONE           │
│  [Back / Close]                              [Skip]     │ ◄── Safe Top Offset: ≥ 24px–28px + safe-area
│                                                         │     (Never collide with camera notch or clock)
│                                                         │
│               PASSIVE CONTENT / HERO AREA               │
│               - 3D Illustrations                        │
│               - Headings & Descriptions                 │
│               - Preview Canvas / Cards                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│               NATURAL REACH (THE SWEET SPOT)            │
│               - Primary CTAs (Next, Save, Apply)        │
│               - Floating Action Buttons (FAB)           │ ◄── Highest ergonomic comfort
│               - Stepper Dots & Paginators               │     (Zero palm strain, fast acquisition)
│               - Bottom Navigation Tabs                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ ⚠️ THE "CRAMP ZONE" (DO NOT PIN BUTTONS HERE!)          │
│ ─────────────────────────────────────────────────────── │ ◄── Minimum Bottom Clearance: ≥ 40px–48px
│ ══════════════════ [Gesture Bar] ══════════════════════ │     (Prevents accidental OS Home navigation)
└─────────────────────────────────────────────────────────┘
```

1. **Zone 1: Natural Reach (The Sweet Spot — Bottom 25% to 65% of screen)**:
   - Primary forward actions (`Next`, `Get Started`, `Save`, `Continue`, `Generate`) MUST sit in this zone.
   - Secondary paginators (e.g. Stepper Dots) must be clustered **16px–24px directly above** the primary button, forming a cohesive interactive unit.

2. **Zone 2: The "Cramp Zone" Prohibition (Bottom 0px–36px)**:
   - ❌ **Forbidden**: Sticking primary action buttons right against the bottom edge of the viewport (`pb: 0`, `pb: 8px`, `pb: 16px`).
   - ⚠️ **The Problem**: Tapping at the extreme bottom edge forces the thumb to fold sharply against the palm (thumb flexor strain) and frequently triggers the OS gesture bar (accidental minimize/home navigation).
   - ✅ **Mandatory Clearance**: All floating or bottom-docked action containers must enforce:
     ```tsx
     pb: 'max(calc(env(safe-area-inset-bottom) + 16px), 42px)'
     ```

3. **Zone 3: Top Clearance & Notch Immunity (Top 0px–44px)**:
   - ❌ **Forbidden**: Placing `Skip`, `Back`, or `Close [X]` flush against the top edge or with meager padding (`pt: 8px` / `pt: 16px`).
   - ⚠️ **The Problem**: Collides with Android status bar icons (battery, clock, wifi) and front camera punch-holes/island cutouts.
   - ✅ **Mandatory Clearance**: Top headers and dismiss triggers must enforce:
     ```tsx
     pt: 'max(calc(env(safe-area-inset-top) + 8px), 26px)'
     ```

---

### 3.2. Fitts's Law for Mobile Touch Targets

Fitts's Law states that the time $T$ required to rapidly move to a target area is a function of the ratio between the distance to the target ($D$) and the width of the target ($W$):
$$T = a + b \log_2\left(1 + \frac{D}{W}\right)$$

In CV Studio mobile interfaces, Fitts's Law dictates 3 strict rules:

1. **Maximize Target Width ($W$) for Primary Actions**:
   - Primary mobile buttons (`Next`, `Comenzar`, `Guardar`) must be **full-width** (`fullWidth`, max-width bounded to 390px–420px) with minimum height **$48\text{px}$–$52\text{px}$**.
   - Full-width pill buttons reduce acquisition time to near zero because horizontal aiming is eliminated.
2. **Minimize Inter-Action Distance ($D$) & Kill "Dead Voids"**:
   - ❌ **Forbidden**: Scattering related controls across screen extremes (e.g. Stepper Dots in the upper half and CTA button 160px below in the abyss via unconstrained `mt: 'auto'`).
   - ✅ **Mandatory**: Cluster related interactive elements together. Stepper indicators, helper tips, and secondary actions must reside within $16\text{px}$–$24\text{px}$ of the primary CTA.
3. **Optical Center Balance on Tall Displays**:
   - On 20:9 mobile displays, content must not be split into disconnected top/bottom islands with a massive empty cavern in between.
   - The presentation must feel unified: Hero message centered in the upper/mid canvas, and the Action Cluster elevated in the Natural Thumb Zone.

---

## 4. Strict Prohibitions & Anti-Patterns for Mobile (`xs`)

1. ❌ **The "Desktop Toolbar Squeeze"**: Squeezing 5+ buttons onto a mobile header row or allowing toolbars to wrap into multiple lines.
2. ❌ **Viewport Theft (>20% rule)**: Top headers + toolbars must never consume more than **15–20%** of the mobile screen height. The remaining 80%+ belongs to the candidate's CV.
3. ❌ **Desktop Side-Rails on Mobile**: Never render a left or right vertical bar that shifts or pushes the mobile preview off-center.
4. ❌ **The "Cramp Zone" Anchor**: Pinning primary CTA buttons directly to the bottom bezel without $\ge 40\text{px}$–$48\text{px}$ safe elevation.
5. ❌ **Notch / Status Bar Collision**: Placing `Skip` or close buttons with `< 24px` top clearance.
6. ❌ **The 100px+ Empty Void**: Leaving massive dead space between paginators and primary action buttons.
7. ❌ **Scattered Global Settings**: Theme and language toggles must not appear in 3 different toolbars. On mobile, they belong exclusively in the Settings (⚙) bottom sheet.
8. ❌ **Floating / Anchored Menus (`<Menu>`, `<Popover>`)**: Floating popover menus anchored to header icons, dropdown triggers, or toolbar buttons are strictly forbidden on mobile. Every secondary choice, menu, or format picker MUST open as a slide-up Bottom Sheet (`Drawer anchor="bottom"`).

---

## 5. Responsive Verification Checklist for Agents

Before completing any task affecting UI or layout:
1. [ ] Is the top header on `xs` clean and single-row with Settings (⚙) icon?
2. [ ] Are global preferences (theme, app language, tour, GitHub) located in the Settings (⚙) bottom sheet on mobile?
3. [ ] Does the document canvas occupy the maximum viewport height without being crowded by stacked bars?
4. [ ] Are tool panels (Templates, Design, LinkedIn, Diff) accessible via a bottom sheet or FAB?
5. [ ] Is the bottom navigation (`Estudio`, `Postulaciones`) anchored at the bottom with proper safe-area padding?
6. [ ] **Fitts's Law Check**: Are primary CTAs full-width with height $\ge 48\text{px}$–$52\text{px}$?
7. [ ] **Hoober Thumb Zone Check**: Is the bottom CTA elevated out of the "Cramp Zone" ($\ge 42\text{px}$ clearance above gesture bar)?
8. [ ] **Notch Clearance Check**: Are top actions (`Skip`, `Back`) cleared by $\ge 26\text{px}$ from the top edge?
9. [ ] **Void Check**: Are paginator dots and CTAs clustered without an artificial 100px+ empty void?
10. [ ] **Zero Floating Menus Check**: Are all dropdowns, submenus, overflow options, and format pickers implemented as slide-up Bottom Sheets (`Drawer anchor="bottom"`) with 0 `<Menu>` or `<Popover>` components?
