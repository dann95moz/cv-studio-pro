import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { CVData, ExperienceItem, SectionType } from '../../../types/cv';
import { useResumeStore } from '../../../store';

import { serializeCvDataToMarkdown } from '../../../core/parser';
import { regenerateCvBullet, regenerateCvSummary } from '../../../core/ai/bullet-regenerator';

export interface ActiveFieldFormatter {
  executeFormat: (command: 'bold' | 'italic' | 'highlight') => void;
}

export interface CvLiveEditContextValue {
  isLiveEditing: boolean;
  setLiveEditing: (enabled: boolean) => void;
  activeFormatter: ActiveFieldFormatter | null;
  setActiveFormatter: (formatter: ActiveFieldFormatter | null) => void;
  formatSelection: (command: 'bold' | 'italic' | 'highlight') => void;
  undoMap: Record<string, string>;
  undoItem: (fieldKey: string, onRevert: (previousValue: string) => void) => void;
  clearUndo: (fieldKey: string) => void;
  regenerateExperienceBullet: (params: {
    fieldKey: string;
    sectionType: 'experience' | 'projects';
    itemIndex: number;
    bulletIndex: number;
    company: string;
    role?: string;
    currentBullet: string;
    userGuidance?: string;
  }) => Promise<string>;
  regenerateSummaryBlock: (params: {
    fieldKey: string;
    currentSummary: string;
    userGuidance?: string;
  }) => Promise<string>;
  updateName: (name: string) => void;
  updateTitle: (title: string) => void;
  updateSummary: (summary: string) => void;
  updateContact: (index: number, label: string, url?: string) => void;
  updateSkillCategory: (groupIndex: number, category: string) => void;
  updateSkillList: (groupIndex: number, skills: string[]) => void;
  updateExperienceField: (
    type: 'experience' | 'projects',
    itemIndex: number,
    field: keyof Pick<ExperienceItem, 'company' | 'role' | 'date' | 'location'>,
    value: string
  ) => void;
  updateExperienceBullet: (
    type: 'experience' | 'projects',
    itemIndex: number,
    bulletIndex: number,
    value: string
  ) => void;
  updateEducationItem: (itemIndex: number, value: string) => void;
  updateLanguageItem: (itemIndex: number, value: string) => void;
  updateSectionTitle: (type: SectionType | string, newTitle: string) => void;
}

const CvLiveEditContext = createContext<CvLiveEditContextValue | null>(null);


export interface CvLiveEditProviderProps {
  children: React.ReactNode;
  parsedCv: CVData;
  isEditable?: boolean;
}

/**
 * Provider for live hot in-place editing of CV elements.
 * Updates the underlying structured CV model and serializes it back to Markdown,
 * which instantly and reactively triggers the Quality Audit and ATS scoring engine.
 */
export const CvLiveEditProvider: React.FC<CvLiveEditProviderProps> = ({
  children,
  parsedCv,
  isEditable = true,
}) => {
  const [isLiveEditing, setLiveEditing] = useState<boolean>(isEditable);
  const [activeFormatter, setActiveFormatter] = useState<ActiveFieldFormatter | null>(null);
  const [undoMap, setUndoMap] = useState<Record<string, string>>({});

  const masterData = useResumeStore((s) => s.masterData);
  const targetJob = useResumeStore((s) => s.targetJob);
  const providerSettings = useResumeStore((s) => s.providerSettings);
  const setCvMarkdown = useResumeStore((s) => s.setCvMarkdown);
  const setActiveCvData = useResumeStore((s) => s.setActiveCvData);

  const formatSelection = useCallback((command: 'bold' | 'italic' | 'highlight') => {
    if (activeFormatter) {
      activeFormatter.executeFormat(command);
    }
  }, [activeFormatter]);

  const applyCvUpdate = useCallback((updater: (prev: CVData) => CVData) => {
    const updated = updater(parsedCv);
    const serialized = serializeCvDataToMarkdown(updated);
    setActiveCvData(updated);
    setCvMarkdown(serialized);
  }, [parsedCv, setCvMarkdown, setActiveCvData]);

  const updateName = useCallback((name: string) => {
    applyCvUpdate((prev) => ({
      ...prev,
      name: name.trim(),
    }));
  }, [applyCvUpdate]);

  const updateTitle = useCallback((title: string) => {
    applyCvUpdate((prev) => ({
      ...prev,
      title: title.trim(),
    }));
  }, [applyCvUpdate]);

  const updateSummary = useCallback((summary: string) => {
    applyCvUpdate((prev) => ({
      ...prev,
      summary: summary.trim(),
    }));
  }, [applyCvUpdate]);

  const updateContact = useCallback((index: number, label: string, url?: string) => {
    applyCvUpdate((prev) => {
      const contacts = [...(prev.contacts || [])];
      if (contacts[index]) {
        contacts[index] = {
          ...contacts[index],
          label: label.trim(),
          url: url !== undefined ? url : contacts[index].url,
        };
      }
      return { ...prev, contacts };
    });
  }, [applyCvUpdate]);

  const updateSkillCategory = useCallback((groupIndex: number, category: string) => {
    applyCvUpdate((prev) => {
      const skillGroups = (prev.skillGroups || []).map((g, idx) => {
        if (idx === groupIndex) {
          return { ...g, category: category.trim() };
        }
        return g;
      });
      return { ...prev, skillGroups };
    });
  }, [applyCvUpdate]);

  const updateSkillList = useCallback((groupIndex: number, skills: string[]) => {
    applyCvUpdate((prev) => {
      const skillGroups = (prev.skillGroups || []).map((g, idx) => {
        if (idx === groupIndex) {
          return { ...g, skills };
        }
        return g;
      });
      return { ...prev, skillGroups };
    });
  }, [applyCvUpdate]);

  const updateExperienceField = useCallback((
    type: 'experience' | 'projects',
    itemIndex: number,
    field: keyof Pick<ExperienceItem, 'company' | 'role' | 'date' | 'location'>,
    value: string
  ) => {
    applyCvUpdate((prev) => {
      const listKey = type === 'projects' ? 'projects' : 'experience';
      const items = (prev[listKey] || []).map((item, idx) => {
        if (idx === itemIndex) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, [listKey]: items };
    });
  }, [applyCvUpdate]);

  const updateExperienceBullet = useCallback((
    type: 'experience' | 'projects',
    itemIndex: number,
    bulletIndex: number,
    value: string
  ) => {
    applyCvUpdate((prev) => {
      const listKey = type === 'projects' ? 'projects' : 'experience';
      const items = (prev[listKey] || []).map((item, idx) => {
        if (idx === itemIndex) {
          const bullets = [...(item.bullets || [])];
          if (value.trim()) {
            bullets[bulletIndex] = value.trim();
          } else {
            bullets.splice(bulletIndex, 1);
          }
          return { ...item, bullets };
        }
        return item;
      });
      return { ...prev, [listKey]: items };
    });
  }, [applyCvUpdate]);

  const updateEducationItem = useCallback((itemIndex: number, value: string) => {
    applyCvUpdate((prev) => {
      const education = [...(prev.education || [])];
      if (value.trim()) {
        education[itemIndex] = value.trim();
      } else {
        education.splice(itemIndex, 1);
      }
      return { ...prev, education };
    });
  }, [applyCvUpdate]);

  const updateLanguageItem = useCallback((itemIndex: number, value: string) => {
    applyCvUpdate((prev) => {
      const languages = [...(prev.languages || [])];
      if (value.trim()) {
        languages[itemIndex] = value.trim();
      } else {
        languages.splice(itemIndex, 1);
      }
      return { ...prev, languages };
    });
  }, [applyCvUpdate]);

  const updateSectionTitle = useCallback((type: SectionType | string, newTitle: string) => {
    applyCvUpdate((prev) => {
      const trimmedTitle = newTitle.trim();
      const updatedSections = (prev.sections || []).map((sec) => {
        if (sec.type === type || sec.id === type) {
          return { ...sec, title: trimmedTitle };
        }
        return sec;
      });

      const updatedSectionTitles = {
        ...(prev.sectionTitles || {}),
        [type]: trimmedTitle,
      };

      return {
        ...prev,
        sections: updatedSections,
        sectionTitles: updatedSectionTitles,
      };
    });
  }, [applyCvUpdate]);

  const undoItem = useCallback((fieldKey: string, onRevert: (previousValue: string) => void) => {

    const previousValue = undoMap[fieldKey];
    if (previousValue !== undefined) {
      onRevert(previousValue);
      setUndoMap((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  }, [undoMap]);

  const clearUndo = useCallback((fieldKey: string) => {
    setUndoMap((prev) => {
      if (!(fieldKey in prev)) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  const regenerateExperienceBullet = useCallback(async (params: {
    fieldKey: string;
    sectionType: 'experience' | 'projects';
    itemIndex: number;
    bulletIndex: number;
    company: string;
    role?: string;
    currentBullet: string;
    userGuidance?: string;
  }) => {
    const { fieldKey, sectionType, itemIndex, bulletIndex, company, role, currentBullet, userGuidance } = params;
    const newBullet = await regenerateCvBullet({
      currentBullet,
      company,
      role,
      masterData,
      targetJob,
      userGuidance,
      providerSettings,
    });

    if (newBullet && newBullet.trim()) {
      setUndoMap((prev) => ({ ...prev, [fieldKey]: currentBullet }));
      updateExperienceBullet(sectionType, itemIndex, bulletIndex, newBullet);
    }
    return newBullet;
  }, [masterData, targetJob, providerSettings, updateExperienceBullet]);

  const regenerateSummaryBlock = useCallback(async (params: {
    fieldKey: string;
    currentSummary: string;
    userGuidance?: string;
  }) => {
    const { fieldKey, currentSummary, userGuidance } = params;
    const newSummary = await regenerateCvSummary({
      currentSummary,
      masterData,
      targetJob,
      userGuidance,
      providerSettings,
    });

    if (newSummary && newSummary.trim()) {
      setUndoMap((prev) => ({ ...prev, [fieldKey]: currentSummary }));
      updateSummary(newSummary);
    }
    return newSummary;
  }, [masterData, targetJob, providerSettings, updateSummary]);

  const value = useMemo<CvLiveEditContextValue>(() => ({
    isLiveEditing,
    setLiveEditing,
    activeFormatter,
    setActiveFormatter,
    formatSelection,
    undoMap,
    undoItem,
    clearUndo,
    regenerateExperienceBullet,
    regenerateSummaryBlock,
    updateName,
    updateTitle,
    updateSummary,
    updateContact,
    updateSkillCategory,
    updateSkillList,
    updateExperienceField,
    updateExperienceBullet,
    updateEducationItem,
    updateLanguageItem,
    updateSectionTitle,
  }), [
    isLiveEditing,
    setLiveEditing,
    activeFormatter,
    setActiveFormatter,
    formatSelection,
    undoMap,
    undoItem,
    clearUndo,
    regenerateExperienceBullet,
    regenerateSummaryBlock,
    updateName,
    updateTitle,
    updateSummary,
    updateContact,
    updateSkillCategory,
    updateSkillList,
    updateExperienceField,
    updateExperienceBullet,
    updateEducationItem,
    updateLanguageItem,
    updateSectionTitle,
  ]);


  return (
    <CvLiveEditContext.Provider value={value}>
      {children}
    </CvLiveEditContext.Provider>
  );
};

export const useCvLiveEdit = (): CvLiveEditContextValue | null => {
  return useContext(CvLiveEditContext);
};
