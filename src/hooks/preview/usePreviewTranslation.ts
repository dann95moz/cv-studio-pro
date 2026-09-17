import { useState } from 'react';
import { CvTranslationVariant } from '../../types';
import { AIProviderSettings } from '../../types/cv';
import {
  translateFullCv,
  translateCvSection,
  parseCvIntoSections,
  spliceTranslatedSection,
  computeContentHash,
  buildFullCvTranslationPrompts,
  buildSectionTranslationPrompts,
  sanitizeLlmOutput,
} from '../../core/ai/cv-translator';
import { SupportedLanguage, LANGUAGE_DEFINITIONS } from '../../constants/languages';

export interface UsePreviewTranslationProps {
  cvMarkdown: string;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
  currentBaseLanguage: string;
  translations: Record<string, CvTranslationVariant>;
  saveTranslationVariant: (variant: CvTranslationVariant) => void;
  providerSettings: AIProviderSettings;
  openManualPromptModal: (prompt: string, title: string, onSubmit: (response: string) => void) => void;
  activeModelName: string;
}

/**
 * Domain Hook: usePreviewTranslation
 * Encapsulates multi-language translation orchestration: detection of outdated sections,
 * full document translation, incremental section-level translation, and BYOK/Manual prompt dispatch.
 */
export function usePreviewTranslation({
  cvMarkdown,
  activeLanguage,
  setActiveLanguage,
  currentBaseLanguage,
  translations,
  saveTranslationVariant,
  providerSettings,
  openManualPromptModal,
  activeModelName,
}: UsePreviewTranslationProps) {
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Outdated translation detection for current active variant
  const activeVariant = translations[activeLanguage];
  const isLanguageOutdated = Boolean(
    activeLanguage !== currentBaseLanguage && activeVariant?.isOutdated
  );
  const outdatedSectionsCount = activeVariant?.outdatedSections?.length || 0;

  const handleOpenTranslateModal = () => setIsTranslateModalOpen(true);
  const handleCloseTranslateModal = () => setIsTranslateModalOpen(false);

  const handleTranslateFull = async (targetLang: SupportedLanguage) => {
    const langDef = LANGUAGE_DEFINITIONS[targetLang] || LANGUAGE_DEFINITIONS.en;

    if (providerSettings.provider === 'manual') {
      const prompts = buildFullCvTranslationPrompts(cvMarkdown, targetLang);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;
      openManualPromptModal(bundle, `Translate CV to ${langDef.name}`, (response) => {
        const translated = sanitizeLlmOutput(response);
        if (translated) {
          const variant: CvTranslationVariant = {
            language: targetLang,
            languageLabel: langDef.nativeName,
            cvMarkdown: translated,
            updatedAt: new Date().toISOString(),
            isOutdated: false,
            baseMarkdownHash: computeContentHash(cvMarkdown),
            outdatedSections: [],
          };
          saveTranslationVariant(variant);
          setActiveLanguage(targetLang);
        }
      });
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateFullCv({
        cvMarkdown,
        targetLanguage: targetLang,
        providerSettings,
      });

      const variant: CvTranslationVariant = {
        language: targetLang,
        languageLabel: langDef.nativeName,
        cvMarkdown: translated,
        updatedAt: new Date().toISOString(),
        isOutdated: false,
        baseMarkdownHash: computeContentHash(cvMarkdown),
        outdatedSections: [],
      };

      saveTranslationVariant(variant);
      setActiveLanguage(targetLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateIncremental = async (targetLang: SupportedLanguage, sections: string[]) => {
    const langDef = LANGUAGE_DEFINITIONS[targetLang] || LANGUAGE_DEFINITIONS.en;
    const existing = translations[targetLang];
    let currentTranslatedText = existing?.cvMarkdown || '';

    const baseSections = parseCvIntoSections(cvMarkdown);
    const sectionsMap = new Map(baseSections.sections.map((s) => [s.title.toLowerCase(), s]));

    if (providerSettings.provider === 'manual') {
      const sectionsToTranslate = sections
        .map((secTitle) => sectionsMap.get(secTitle.toLowerCase()))
        .filter(Boolean);
      const combinedTitle = sectionsToTranslate.map((s) => s!.title).join(' & ');
      const combinedContent = sectionsToTranslate.map((s) => `## ${s!.title}\n${s!.content}`).join('\n\n');

      const prompts = buildSectionTranslationPrompts(combinedTitle, combinedContent, targetLang);
      const bundle = `${prompts.systemInstruction}\n\n---\n\n${prompts.userPrompt}`;

      openManualPromptModal(bundle, `Translate (${combinedTitle}) to ${langDef.name}`, (response) => {
        const translated = sanitizeLlmOutput(response);
        if (translated) {
          const parsedTranslated = parseCvIntoSections(translated);
          if (parsedTranslated.sections.length > 0) {
            for (const sec of parsedTranslated.sections) {
              currentTranslatedText = spliceTranslatedSection(
                currentTranslatedText,
                sec.title,
                sec.content
              );
            }
          }

          const updatedVariant: CvTranslationVariant = {
            language: targetLang,
            languageLabel: existing?.languageLabel || langDef.nativeName,
            cvMarkdown: currentTranslatedText,
            updatedAt: new Date().toISOString(),
            isOutdated: false,
            baseMarkdownHash: computeContentHash(cvMarkdown),
            outdatedSections: [],
          };

          saveTranslationVariant(updatedVariant);
          setActiveLanguage(targetLang);
        }
      });
      return;
    }

    setIsTranslating(true);
    try {
      for (const secTitle of sections) {
        const foundSec = sectionsMap.get(secTitle.toLowerCase());
        if (foundSec) {
          const translatedSection = await translateCvSection({
            sectionTitle: foundSec.title,
            sectionContent: foundSec.content,
            targetLanguage: targetLang,
            providerSettings,
          });
          currentTranslatedText = spliceTranslatedSection(
            currentTranslatedText,
            foundSec.title,
            translatedSection
          );
        }
      }

      const updatedVariant: CvTranslationVariant = {
        language: targetLang,
        languageLabel: existing?.languageLabel || langDef.nativeName,
        cvMarkdown: currentTranslatedText,
        updatedAt: new Date().toISOString(),
        isOutdated: false,
        baseMarkdownHash: computeContentHash(cvMarkdown),
        outdatedSections: [],
      };

      saveTranslationVariant(updatedVariant);
      setActiveLanguage(targetLang);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleQuickSyncOutdated = () => {
    if (activeVariant && activeVariant.outdatedSections && activeVariant.outdatedSections.length > 0) {
      handleTranslateIncremental(activeLanguage as SupportedLanguage, activeVariant.outdatedSections);
    }
  };

  return {
    activeLanguage,
    setActiveLanguage,
    currentBaseLanguage,
    translations,
    isLanguageOutdated,
    outdatedSectionsCount,
    isTranslateModalOpen,
    isTranslating,
    activeModelName,
    handleOpenTranslateModal,
    handleCloseTranslateModal,
    handleTranslateFull,
    handleTranslateIncremental,
    handleQuickSyncOutdated,
  };
}
