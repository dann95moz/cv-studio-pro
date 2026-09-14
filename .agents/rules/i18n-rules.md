---
trigger: always_on
---

# Internationalization (i18n) Rules

## 1. Supported Locales

The application supports 5 primary languages:
1. **English (`en`)** — Default / Source language
2. **Spanish (`es`)**
3. **German (`de`)**
4. **French (`fr`)**
5. **Italian (`it`)**

Location: `src/i18n/locales/{en, es, de, fr, it}/`

## 2. Namespace Organization

Translations are divided by feature domain namespaces:
- `common.json` — Global navigation, actions (save, cancel, export, edit), status badges, community links, footer.
- `landing.json` — Welcome landing hero, capabilities, master data input.
- `target.json` — Target job description input, AI synthesis options, keywords selector.
- `preview.json` — Document preview studio, templates panel, design formatting, audit drawer, toolbars.
- `history.json` — Applications tracker, version history, export options.
- `settings.json` — AI provider configuration, custom endpoints, language preferences.

## 3. Strict Synchronization Rules

- **Zero Missing Keys**: When adding, modifying, or renaming a key, you **must update all 5 locale files** in the same change.
- **English Hardcoded Fallback**: In JSX/TSX components, always provide an English fallback string as the second argument to `t()`:
  ```tsx
  {t('common:actions.save', 'Save Version')}
  ```
- **Interpolation Syntax**: Use `{{variableName}}` for dynamic values (e.g., `Step {{number}}`, `{{count}} items`).
- **Zero Hardcoded User-Facing Text**: Never render raw user-facing strings directly in components without wrapping them in `t()`.

## 4. Default Entity Names & Seed Data (Dynamic Localization vs Static Storage)

- **Root Cause of Language Bleed**: Seeding default entity titles (such as default skill categories `Core Skills`, `Specialties`, `Tools` or default section headers) as static string literals in mutable state or Markdown freezes them in a single language. If initialized or saved in English, switching the UI language to Spanish leaves those entity titles in English while surrounding labels translate, causing an inconsistent UI.
- **Mandatory Standards**:
  1. **Dynamic Localization Resolvers**: Standard default categories or section seeds must pass through a dynamic localization helper (e.g., `getLocalizedCategoryTitle(rawName, t)`) at render time so they automatically adapt to the user's active UI locale.
  2. **Preserve User Customizations**: The resolver must recognize standard system seeds across all 5 languages and only translate those. Custom user-created names (e.g., "Litigación Civil", "Cloud Architecture") must pass through unchanged.
  3. **Data Serialization vs. UI Presentation**: When persisting to Markdown or state, accept localized titles or standard canonical keys, but always ensure the UI layer resolves standard keys dynamically rather than displaying raw stored strings.
