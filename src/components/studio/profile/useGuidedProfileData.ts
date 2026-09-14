import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { serializeCvDataToMarkdown, parseMarkdownToCvData, cleanCvData } from '../../../core/parser';
import { CVData, ContactItem, ContactType, ExperienceItem, SkillCategory, CustomSectionPresetType } from '../../../types/cv';
import { BLANK_CV_DATA } from '../../../constants/templates';
import { ProfileSectionKey } from './ProfileNavRail';
import { getLocalizedCategoryTitle } from '../../../utils/skillCategoryUtils';

export interface UseGuidedProfileDataParams {
  markdownContent: string;
  onChange: (markdown: string) => void;
  onFlushRef?: React.MutableRefObject<(() => void) | null>;
  data?: CVData;
  activeSection: ProfileSectionKey;
  onSectionChange: (sec: ProfileSectionKey) => void;
  onComplete?: () => void;
}

export function useGuidedProfileData({
  markdownContent,
  onChange,
  onFlushRef,
  data,
  activeSection,
  onSectionChange,
  onComplete,
}: UseGuidedProfileDataParams) {
  const { t } = useTranslation(['profile']);

  const [formData, setFormData] = useState<CVData>(() => {
    if (data) return cleanCvData(data);
    if (markdownContent && markdownContent.trim().length > 0) {
      return cleanCvData(parseMarkdownToCvData(markdownContent));
    }
    return cleanCvData(BLANK_CV_DATA);
  });

  const lastEmittedMarkdownRef = useRef<string>(markdownContent);
  const formDataRef = useRef<CVData>(formData);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  formDataRef.current = formData;

  // Flush pending changes to parent
  const flushChanges = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!isDirtyRef.current) {
      return;
    }
    isDirtyRef.current = false;
    const newMarkdown = serializeCvDataToMarkdown(formDataRef.current);
    if (newMarkdown !== lastEmittedMarkdownRef.current) {
      lastEmittedMarkdownRef.current = newMarkdown;
      onChange(newMarkdown);
    }
  }, [onChange]);

  // Hook up onFlushRef for parent components
  useEffect(() => {
    if (onFlushRef) {
      onFlushRef.current = flushChanges;
    }
    return () => {
      if (onFlushRef) {
        onFlushRef.current = null;
      }
    };
  }, [flushChanges, onFlushRef]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (isDirtyRef.current) {
        isDirtyRef.current = false;
        const newMarkdown = serializeCvDataToMarkdown(formDataRef.current);
        if (newMarkdown !== lastEmittedMarkdownRef.current) {
          lastEmittedMarkdownRef.current = newMarkdown;
          onChange(newMarkdown);
        }
      }
    };
  }, [onChange]);

  // Synchronize when external data or markdownContent changes
  useEffect(() => {
    if (data) {
      const cleaned = cleanCvData(data);
      setFormData(cleaned);
      formDataRef.current = cleaned;
    } else if (markdownContent !== lastEmittedMarkdownRef.current) {
      lastEmittedMarkdownRef.current = markdownContent;
      const parsed = cleanCvData(
        markdownContent && markdownContent.trim().length > 0
          ? parseMarkdownToCvData(markdownContent)
          : BLANK_CV_DATA
      );
      setFormData(parsed);
      formDataRef.current = parsed;
    }
  }, [data, markdownContent]);

  const scheduleEmit = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      if (isDirtyRef.current) {
        isDirtyRef.current = false;
        const newMarkdown = serializeCvDataToMarkdown(formDataRef.current);
        if (newMarkdown !== lastEmittedMarkdownRef.current) {
          lastEmittedMarkdownRef.current = newMarkdown;
          onChange(newMarkdown);
        }
      }
    }, 250);
  }, [onChange]);

  const updateData = useCallback((updater: (prev: CVData) => CVData) => {
    isDirtyRef.current = true;
    setFormData(prev => {
      const next = updater(prev);
      formDataRef.current = next;
      return next;
    });
    scheduleEmit();
  }, [scheduleEmit]);

  // Identity / Contact Callbacks
  const handleNameChange = useCallback((name: string) => {
    updateData(prev => ({ ...prev, name }));
  }, [updateData]);

  const handleTitleChange = useCallback((title: string) => {
    updateData(prev => ({ ...prev, title }));
  }, [updateData]);

  const handleContactChange = useCallback((type: ContactType, label: string, url?: string) => {
    updateData(prev => {
      const remaining = prev.contacts.filter(c => c.type !== type);
      if (label) {
        let cleanText = label;
        if (type === 'email') {
          cleanText = cleanText.replace(/^mailto:/i, '');
        }

        let finalUrl = url?.trim();
        if (type === 'email') {
          finalUrl = cleanText ? `mailto:${cleanText}` : undefined;
        } else if (!finalUrl && (type === 'linkedin' || type === 'github' || type === 'globe')) {
          finalUrl = label.startsWith('http') ? label : `https://${label.replace(/^https?:\/\//, '')}`;
        } else if (finalUrl && (type === 'linkedin' || type === 'github' || type === 'globe') && !finalUrl.startsWith('http')) {
          finalUrl = `https://${finalUrl}`;
        }

        const newContact: ContactItem = {
          type,
          label: label.trim(),
          url: finalUrl
        };
        return { ...prev, contacts: [...remaining, newContact] };
      }
      return { ...prev, contacts: remaining };
    });
  }, [updateData]);

  // Summary Callbacks
  const handleSummaryChange = useCallback((summary: string) => {
    updateData(prev => ({ ...prev, summary }));
  }, [updateData]);

  // Skill category helpers
  const handleSkillGroupCategoryChange = useCallback((index: number, newCategory: string) => {
    updateData(prev => {
      const groups = prev.skillGroups && prev.skillGroups.length > 0 ? [...prev.skillGroups] : [
        { category: t('profile:sections.skills.defaultCore', 'Core Skills'), skills: [] },
        { category: t('profile:sections.skills.defaultArchitecture', 'Specialties'), skills: [] },
        { category: t('profile:sections.skills.defaultTooling', 'Tools'), skills: [] }
      ];
      if (!groups[index]) return prev;
      groups[index] = { ...groups[index], category: newCategory };
      return { ...prev, skillGroups: groups };
    });
  }, [updateData, t]);

  const handleSkillGroupSkillsChange = useCallback((index: number, skillsStr: string) => {
    updateData(prev => {
      const groups = prev.skillGroups && prev.skillGroups.length > 0 ? [...prev.skillGroups] : [
        { category: t('profile:sections.skills.defaultCore', 'Core Skills'), skills: [] },
        { category: t('profile:sections.skills.defaultArchitecture', 'Specialties'), skills: [] },
        { category: t('profile:sections.skills.defaultTooling', 'Tools'), skills: [] }
      ];
      if (!groups[index]) return prev;
      groups[index] = {
        ...groups[index],
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean)
      };
      return { ...prev, skillGroups: groups };
    });
  }, [updateData, t]);

  const handleAddSkillGroup = useCallback(() => {
    updateData(prev => {
      const current = prev.skillGroups ? [...prev.skillGroups] : [];
      const newIdx = current.length;
      const defaultCategory = newIdx === 0
        ? t('profile:sections.skills.defaultCore', 'Core Skills')
        : newIdx === 1
        ? t('profile:sections.skills.defaultArchitecture', 'Specialties')
        : newIdx === 2
        ? t('profile:sections.skills.defaultTooling', 'Tools')
        : `${t('profile:sections.skills.groupName', 'Category')} ${newIdx + 1}`;

      const newGroup: SkillCategory = {
        category: defaultCategory,
        skills: []
      };
      return {
        ...prev,
        skillGroups: [...current, newGroup]
      };
    });
  }, [updateData, t]);

  const handleRemoveSkillGroup = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      skillGroups: (prev.skillGroups || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  // Experience helpers
  const handleExperienceChange = useCallback((index: number, field: keyof ExperienceItem, value: string | string[]) => {
    updateData(prev => {
      const expList = [...(prev.experience || [])];
      expList[index] = { ...expList[index], [field]: value };
      return { ...prev, experience: expList };
    });
  }, [updateData]);

  const handleAddExperience = useCallback(() => {
    const newExp: ExperienceItem = {
      company: '',
      role: '',
      location: '',
      date: '',
      bullets: ['']
    };
    updateData(prev => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])]
    }));
  }, [updateData]);

  const handleRemoveExperience = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  const handleAddBullet = useCallback((expIndex: number) => {
    updateData(prev => {
      const expList = [...(prev.experience || [])];
      const targetExp = expList[expIndex];
      const newBullets = [...targetExp.bullets, ''];
      expList[expIndex] = { ...targetExp, bullets: newBullets };
      return { ...prev, experience: expList };
    });
  }, [updateData]);

  const handleUpdateBullet = useCallback((expIndex: number, bulletIndex: number, text: string) => {
    updateData(prev => {
      const expList = [...(prev.experience || [])];
      const targetExp = expList[expIndex];
      const nextBullets = [...targetExp.bullets];
      nextBullets[bulletIndex] = text;
      expList[expIndex] = { ...targetExp, bullets: nextBullets };
      return { ...prev, experience: expList };
    });
  }, [updateData]);

  const handleRemoveBullet = useCallback((expIndex: number, bulletIndex: number) => {
    updateData(prev => {
      const expList = [...(prev.experience || [])];
      const targetExp = expList[expIndex];
      const nextBullets = targetExp.bullets.filter((_, i) => i !== bulletIndex);
      expList[expIndex] = { ...targetExp, bullets: nextBullets };
      return { ...prev, experience: expList };
    });
  }, [updateData]);

  // Education helpers
  const handleUpdateEducation = useCallback((index: number, text: string) => {
    updateData(prev => {
      const eduList = [...(prev.education || [])];
      eduList[index] = text;
      return { ...prev, education: eduList };
    });
  }, [updateData]);

  const handleAddEducation = useCallback(() => {
    updateData(prev => ({
      ...prev,
      education: ['', ...(prev.education || [])]
    }));
  }, [updateData]);

  const handleRemoveEducation = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  // Languages helpers
  const handleUpdateLanguage = useCallback((index: number, text: string) => {
    updateData(prev => {
      const langList = [...(prev.languages || [])];
      if (langList[index] === text) return prev;
      langList[index] = text;
      return { ...prev, languages: langList };
    });
  }, [updateData]);

  const handleAddLanguage = useCallback(() => {
    updateData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), '']
    }));
  }, [updateData]);

  const handleRemoveLanguage = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  // Projects helpers
  const handleAddProject = useCallback(() => {
    const newProj: ExperienceItem = {
      company: '',
      role: '',
      location: '',
      date: '',
      bullets: ['']
    };
    updateData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));
  }, [updateData]);

  const handleProjectFieldChange = useCallback((index: number, field: keyof ExperienceItem, value: string | string[]) => {
    updateData(prev => {
      const list = [...(prev.projects || [])];
      if (!list[index]) return prev;
      let val = value;
      if (typeof val === 'string' && (field === 'demoUrl' || field === 'repoUrl')) {
        const trimmed = val.trim();
        if (trimmed && !trimmed.startsWith('http') && (trimmed.includes('.') || trimmed.includes('/'))) {
          val = `https://${trimmed.replace(/^https?:\/\//, '')}`;
        } else {
          val = trimmed;
        }
      }
      if (list[index][field] === val) return prev;
      list[index] = { ...list[index], [field]: val };
      return { ...prev, projects: list };
    });
  }, [updateData]);

  const handleRemoveProject = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  // Custom Sections Handlers
  const handleAddCustomSection = useCallback((title: string, presetType: CustomSectionPresetType) => {
    const newId = `sec_${Date.now()}`;
    updateData(prev => {
      const current = prev.customSections || [];
      return {
        ...prev,
        customSections: [
          ...current,
          {
            id: newId,
            title,
            presetType,
            items: [],
          }
        ]
      };
    });
    onSectionChange(`custom_${newId}`);
  }, [updateData, onSectionChange]);

  const handleUpdateCustomSectionTitle = useCallback((sectionId: string, newTitle: string) => {
    updateData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => 
        sec.id === sectionId ? { ...sec, title: newTitle } : sec
      )
    }));
  }, [updateData]);

  const handleAddCustomSectionItem = useCallback((sectionId: string, itemText: string) => {
    updateData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => 
        sec.id === sectionId ? { ...sec, items: [...(sec.items || []), itemText] } : sec
      )
    }));
  }, [updateData]);

  const handleUpdateCustomSectionItem = useCallback((sectionId: string, index: number, newText: string) => {
    updateData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id !== sectionId) return sec;
        const newItems = [...(sec.items || [])];
        newItems[index] = newText;
        return { ...sec, items: newItems };
      })
    }));
  }, [updateData]);

  const handleRemoveCustomSectionItem = useCallback((sectionId: string, index: number) => {
    updateData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(sec => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, items: (sec.items || []).filter((_, i) => i !== index) };
      })
    }));
  }, [updateData]);

  const handleRemoveCustomSection = useCallback((sectionId: string) => {
    updateData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(sec => sec.id !== sectionId)
    }));
    onSectionChange('personal');
  }, [updateData, onSectionChange]);

  // Active custom section resolver
  const activeCustomSection = useMemo(() => {
    if (activeSection.startsWith('custom_')) {
      const secId = activeSection.replace('custom_', '');
      return (formData.customSections || []).find(sec => sec.id === secId || `custom_${sec.id}` === activeSection);
    }
    return null;
  }, [activeSection, formData.customSections]);

  // Compute section counts & completion status
  const sectionCounts = useMemo(() => {
    const personalComplete = Boolean(
      formData.name &&
      formData.name.trim().length > 2 &&
      formData.contacts?.some(c => c.type === 'email' || c.type === 'location' || c.type === 'phone')
    );
    const summaryComplete = Boolean(formData.summary && formData.summary.trim().length > 25);
    const skillsCount = (formData.skillGroups || []).reduce((acc, g) => acc + (g.skills?.length || 0), 0);
    const experienceCount = (formData.experience || []).length;
    const educationCount = (formData.education || []).length;
    const languagesCount = (formData.languages || []).length;
    const projectsCount = (formData.projects || []).length;

    return {
      personalComplete,
      summaryComplete,
      skillsCount,
      experienceCount,
      educationCount,
      languagesCount,
      projectsCount
    };
  }, [formData]);

  // Check if profile satisfies minimum requirements
  const isProfileComplete = useMemo(() => {
    return Boolean(
      sectionCounts.personalComplete &&
      sectionCounts.summaryComplete &&
      sectionCounts.skillsCount > 0 &&
      (sectionCounts.experienceCount > 0 || sectionCounts.educationCount > 0)
    );
  }, [sectionCounts]);

  // Ensure default skill groups if none exist
  const skillGroups = useMemo(() => {
    if (formData.skillGroups && formData.skillGroups.length > 0) {
      return formData.skillGroups.map((g) => ({
        ...g,
        category: getLocalizedCategoryTitle(g.category, t),
      }));
    }
    return [
      { category: t('profile:sections.skills.defaultCore', 'Core Skills'), skills: [] },
      { category: t('profile:sections.skills.defaultArchitecture', 'Specialties'), skills: [] },
      { category: t('profile:sections.skills.defaultTooling', 'Tools'), skills: [] }
    ];
  }, [formData.skillGroups, t]);

  // Ordered section keys for carousel navigation
  const sectionKeys = useMemo<ProfileSectionKey[]>(() => {
    const keys: ProfileSectionKey[] = [
      'personal',
      'summary',
      'skills',
      'experience',
      'education',
      'languages',
      'projects',
    ];
    if (formData.customSections && formData.customSections.length > 0) {
      formData.customSections.forEach((cs) => {
        keys.push(`custom_${cs.id}`);
      });
    }
    return keys;
  }, [formData.customSections]);

  const currentSectionIndex = sectionKeys.indexOf(activeSection);
  const isLastSection = currentSectionIndex === sectionKeys.length - 1;

  const handleNextInSequence = useCallback(() => {
    if (isProfileComplete) {
      onComplete?.();
      return;
    }
    const nextIdx = currentSectionIndex + 1;
    if (nextIdx < sectionKeys.length) {
      onSectionChange(sectionKeys[nextIdx]);
    } else {
      onComplete?.();
    }
  }, [isProfileComplete, currentSectionIndex, sectionKeys, onSectionChange, onComplete]);

  const handlePrevInSequence = useCallback(() => {
    const prevIdx = currentSectionIndex - 1;
    if (prevIdx >= 0) {
      onSectionChange(sectionKeys[prevIdx]);
    }
  }, [currentSectionIndex, sectionKeys, onSectionChange]);

  const handleSwipeLeft = useCallback(() => {
    if (currentSectionIndex >= 0 && currentSectionIndex < sectionKeys.length - 1) {
      onSectionChange(sectionKeys[currentSectionIndex + 1]);
    }
  }, [sectionKeys, currentSectionIndex, onSectionChange]);

  const handleSwipeRight = useCallback(() => {
    if (currentSectionIndex > 0) {
      onSectionChange(sectionKeys[currentSectionIndex - 1]);
    }
  }, [sectionKeys, currentSectionIndex, onSectionChange]);

  return {
    formData,
    sectionCounts,
    isProfileComplete,
    skillGroups,
    activeCustomSection,
    isLastSection,
    handleNameChange,
    handleTitleChange,
    handleContactChange,
    handleSummaryChange,
    handleSkillGroupCategoryChange,
    handleSkillGroupSkillsChange,
    handleAddSkillGroup,
    handleRemoveSkillGroup,
    handleExperienceChange,
    handleAddExperience,
    handleRemoveExperience,
    handleAddBullet,
    handleUpdateBullet,
    handleRemoveBullet,
    handleUpdateEducation,
    handleAddEducation,
    handleRemoveEducation,
    handleUpdateLanguage,
    handleAddLanguage,
    handleRemoveLanguage,
    handleAddProject,
    handleProjectFieldChange,
    handleRemoveProject,
    handleAddCustomSection,
    handleUpdateCustomSectionTitle,
    handleAddCustomSectionItem,
    handleUpdateCustomSectionItem,
    handleRemoveCustomSectionItem,
    handleRemoveCustomSection,
    handleNextInSequence,
    handlePrevInSequence,
    handleSwipeLeft,
    handleSwipeRight,
  };
}
