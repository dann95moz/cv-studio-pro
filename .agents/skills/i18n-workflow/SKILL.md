---
name: i18n-workflow
description: >-
  Use this skill when adding, modifying, or auditing user-facing translations
  across all supported languages (en, es, de, fr, it) in CV Studio.
---

# Internationalization (i18n) Workflow

This skill details how to manage and synchronize translations across the application.

---

## Supported Locales & Directories

```text
src/i18n/locales/
├── en/     # English (Default source)
├── es/     # Spanish
├── de/     # German
├── fr/     # French
└── it/     # Italian
```

### Translation Namespaces
- `common.json`: Navigation, general actions, footer, language selector.
- `landing.json`: Welcome screen, hero, file input dropzones.
- `target.json`: Vacancy analysis, tailoring options, keyword badges.
- `preview.json`: Document preview toolbar, templates drawer, design panel.
- `history.json`: Applications tracker and version timeline.
- `settings.json`: AI provider configuration and app preferences.

---

## Step-by-Step Translation Workflow

1. **Identify the Target Namespace**:
   - Determine which JSON namespace the string belongs to (e.g., `common`, `preview`).
2. **Add Key to English (`en`) First**:
   - Define the key and natural English text in `src/i18n/locales/en/<namespace>.json`.
3. **Replicate across all 4 Other Locales**:
   - Add the exact same key to `es`, `de`, `fr`, and `it` with accurate translations.
4. **Consume in Component**:
   - Import `useTranslation`:
     ```tsx
     const { t } = useTranslation(['namespace', 'common']);
     ```
   - Reference key with English fallback:
     ```tsx
     {t('namespace:path.to.key', 'English fallback')}
     ```
5. **Validation**:
   - Switch language via the language dropdown in UI or Settings to verify rendering in all 5 locales.
6. **Dynamic Resolvers for Default Entity Seeds**:
   - When dealing with domain entity seeds (e.g., default skill categories `Core Skills`, `Specialties`, `Tools`), never display stored entity strings directly in the UI if they could be frozen in a previous language.
   - Use dynamic localization resolvers (`getLocalizedCategoryTitle` in `src/utils/skillCategoryUtils.ts`) so standard categories automatically adapt to the user's active locale while preserving custom user-defined items.
