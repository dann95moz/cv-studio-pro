# Platform Experience & Cross-Platform Integrity Rules

This document establishes the strict architectural separation and quality standards for **CV Studio** across its 3 execution environments:
1. **Desktop Web (`desktop-web`)**: High-productivity SaaS in desktop browsers ($\ge 900\text{px}$).
2. **Mobile Web (`mobile-web`)**: Touch-friendly web application in mobile browsers ($< 900\text{px}$).
3. **Native Android Container (`native-app`)**: Capacitor native APK with direct OS & hardware integration.

All AI agents and developers must strictly enforce the boundaries defined here. **Platform cross-contamination is strictly forbidden.**

---

## 1. The Platform Service as Single Source of Truth

All environment detection must strictly originate from `platformService` in `src/core/platform.ts`.
- ❌ **STRICTLY FORBIDDEN**: Using ad-hoc checks scattered across components like `Capacitor.isNativePlatform()` without platform encapsulation, or assuming `window.innerWidth` without checking native context.
- ✅ **MANDATORY**:
  ```typescript
  import { platformService } from '../core/platform';

  if (platformService.isNative()) {
    // Native Android / iOS hardware & OS integrations
  } else if (platformService.isDesktopWeb()) {
    // Large screen desktop web layout and interactions
  } else if (platformService.isMobileWeb()) {
    // Mobile browser touch layout & fallbacks
  }
  ```

---

## 2. 🖥️ Desktop Web Experience (`desktop-web`)

Desktop Web users interact via mouse, keyboard, and large displays. The experience must feel like a premier, state-of-the-art SaaS studio.

### 2.1. 🚫 Zero History Trapping & Zero Mobile Exit Guards
- ❌ **STRICTLY FORBIDDEN**:
  - Trapping browser navigation with dummy `window.history.pushState` loops.
  - Intercepting `popstate` to show mobile-centric exit toasts (e.g. *"Presiona atrás de nuevo para salir"* / *"Press back again to exit"*).
  - Preventing the user from using standard browser Back / Forward buttons, tabs, or bookmarks.
- ✅ **MANDATORY**:
  - Desktop browsers maintain normal history. Modals and drawers close via `Escape` key, backdrop click, or explicit `[X]` buttons.

### 2.2. Ergonomics & High-Density Workspace
- ✅ **MANDATORY**:
  - **Drag & Drop**: Direct drag-and-drop of PDF/Markdown files onto the landing page and candidate profile with an active glassmorphic drop overlay.
  - **Sync Direction**: Desktop acts as the source station. Sync actions must read *"Sincronizar con Móvil (QR)"* / *"Generar Código QR"* and default to the **Export** tab (`tab='export'`), displaying the encrypted QR code on-screen for the phone to scan.
  - **Top Navigation**: Render the full SaaS navigation bar (`StudioNavbar`) with 3-step indicators, language picker, theme switcher, and direct sync trigger.
  - **PDF Export**: 1-click in-browser download via Blob URL or standard A4 Print preview.
  - **Silent Haptics**: Never trigger `navigator.vibrate()` or hardware vibration calls on desktop browsers.

---

## 3. 📱 Mobile Web Experience (`mobile-web`)

Mobile Web users interact via touch screens within mobile browsers (Safari, Chrome Mobile) without native APK installation.

### 3.1. Touch Ergonomics & Viewport Discipline (Fitts's Law & Hoober Thumb Zone)
- ✅ **MANDATORY**:
  - **Fitts's Law Touch Targets**: Minimum $44 \times 44\text{px}$ for secondary elements; primary CTAs must be full-width with height $\ge 48\text{px}$–$52\text{px}$.
  - **Steven Hoober Thumb-Zone**: Position primary actions in the Natural Reach Zone (lower 25%–65% of screen); bottom CTAs must maintain safe clearance ($\ge 42\text{px}$ above navigation gesture bar) to avoid the "Cramp Zone".
  - **Single Column Layout**: Multi-column desktop grids must cleanly collapse to a single ergonomic column.
  - **Thumb-Zone Navigation**: Use `MobileBottomNav` for quick switching between *Estudio* and *Postulaciones*.
  - **Top Header Clearance**: Compact single row ($52\text{px}$–$56\text{px}$) with safe top offset ($\ge 26\text{px}$ + safe-area) to avoid notch and clock collisions. See [mobile-first-ux-rules.md](file:///.agents/rules/mobile-first-ux-rules.md).

### 3.2. Graceful Hardware Fallbacks
- ❌ **STRICTLY FORBIDDEN**: Calling native Capacitor plugins (camera, filesystem, background task) that reject or crash in mobile browsers.
- ✅ **MANDATORY**:
  - **Sync Direction**: Mobile Web acts as the consumer. Sync actions read *"Sincronizar desde PC (QR)"* and open the **Import** tab (`tab='import'`).
  - If camera stream is not allowed or unavailable, provide the manual 6-digit pairing code input seamlessly without error alerts.
  - File import uses standard HTML5 `<input type="file" accept=".pdf,.md,.txt">`.

---

## 4. 🤖 Native Android App Experience (`native-app`)

The Android application runs inside Capacitor with direct access to device hardware, storage, and operating system events.

### 4.1. Hardware Back Button & Double-Tap Exit Guard
- ✅ **MANDATORY**:
  - Hardware and gesture back buttons are intercepted exclusively on `platformService.isNative()`.
  - Back actions are dispatched through `backButtonRegistry` using LIFO priority:
    1. Active blocking modals & preview drawers (Priority 100+).
    2. Wizard step navigation (Step 3 ➔ Step 2 ➔ Step 1).
    3. Root screen exit guard: Double-tap within 2000ms triggers `App.exitApp()`, accompanied by the localized toast *"Presiona atrás de nuevo para salir"*.
- ❌ **STRICTLY FORBIDDEN**: Permitting this exit guard to trigger outside of `platformService.isNative()`.

### 4.2. Native Hardware & OS Integrations
- ✅ **MANDATORY**:
  - **First-Run Onboarding**: The 3-screen Onboarding Walkthrough (`MobileOnboardingWalkthrough`) with interactive gestures and illustrations auto-opens exclusively on the first launch of the native app.
  - **Instant Camera QR Scanner**: Tapping *"Escanear QR de PC"* launches ML Kit Barcode Scanning directly via the physical camera.
  - **Safe-Area Insets**: All top headers and bottom navigation bars must apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to respect camera notches and system navigation bars.
  - **Storage & Sharing**: PDFs are saved permanently to `Directory.Documents` via `@capacitor/filesystem` so they appear in the Android Files app, with support for the native Android Share sheet (`@capacitor/share`).
  - **Tactile Feedback**: Interactive touches and completion events trigger real device haptics (`hapticsService.impactLight()`, `notificationSuccess()`).
  - **Background AI Synthesis**: Long-running synthesis tasks hold an execution window via `@capawesome/capacitor-background-task`.

### 4.3. 🚫 Zero Marketing Landing Page on Native App
- ❌ **STRICTLY FORBIDDEN**: Rendering `WelcomeLandingView` on the native Android APK. A marketing landing page is intended exclusively for web browsers.
- ✅ **MANDATORY**:
  - The native app uses `MobileOnboardingWalkthrough` for first-run onboarding.
  - Upon onboarding completion, dismissal, or normal launch, the app routes directly into the Studio workspace (`activeTab: 'wizard'`, `wizardStep: 'profile'`).
  - `getInitialTab()` in `uiSlice` and routing guards in `App.tsx` must automatically resolve `landing` to `wizard` when `platformService.isNative()` is true.

---

## 5. Verification Checklist for Agents

Before completing any task affecting layout, navigation, or platform features:
1. [ ] Does `useAndroidBackHandler` only run when `platformService.isNative()` is true?
2. [ ] Does Desktop Web preserve natural browser back/forward navigation without history hijacking?
3. [ ] Does the Sync QR button show *"Sincronizar con Móvil (QR)"* on Desktop and *"Sincronizar desde PC (QR)"* on Mobile/Native?
4. [ ] Does Desktop Web support full-screen Drag & Drop for resume files?
5. [ ] Do native Capacitor calls safely guard against browser environments?
6. [ ] **Native App Landing Immunity**: Does the native app bypass `WelcomeLandingView` and go directly to `wizard`?
6. [ ] Does `npm run check:compliance` exit cleanly with 0 errors and 0 warnings?
