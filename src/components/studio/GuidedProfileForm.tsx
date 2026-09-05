import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import { serializeCvDataToMarkdown } from '../../core/parser';
import { CVData, ContactItem, ContactType, ExperienceItem, SkillCategory } from '../../types/cv';
import { BLANK_CV_DATA } from '../../constants/templates';
import { useResumeStore } from '../../store/useResumeStore';
import { ProfileNavRail, ProfileSectionKey } from './profile/ProfileNavRail';
import { PersonalInfoSection } from './profile/PersonalInfoSection';
import { SummarySection } from './profile/SummarySection';
import { SkillsCategorizedPanel } from './profile/SkillsCategorizedPanel';
import { ExperienceSection } from './profile/ExperienceSection';
import { EducationSection } from './profile/EducationSection';
import { LanguagesSection } from './profile/LanguagesSection';
import { ProjectsSection } from './profile/ProjectsSection';
import { CustomSectionPanel } from './profile/CustomSectionPanel';
import { AddSectionModal } from './profile/AddSectionModal';
import { CustomSectionPresetType } from '../../types/cv';
import { useTranslation } from 'react-i18next';
import { GuidedProfileFormProps } from '../../types';


export type { GuidedProfileFormProps };

const EMPTY_EXPERIENCE: ExperienceItem[] = [];
const EMPTY_EDUCATION: string[] = [];
const EMPTY_LANGUAGES: string[] = [];
const EMPTY_PROJECTS: ExperienceItem[] = [];

/**
 * Step 1: Master-Detail Guided Visual Profile Form.
 * Features a high-conversion vertical navigation rail (horizontal on mobile)
 * with instant section switching, live item counts, and completion checkmarks.
 */
export const GuidedProfileForm: React.FC<GuidedProfileFormProps> = ({
  markdownContent,
  onChange,
  onFlushRef,
  data,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const activeCvData = useResumeStore((s) => s.activeCvData);
  const [formData, setFormData] = useState<CVData>(() => data || activeCvData || BLANK_CV_DATA);
  const [activeSection, setActiveSection] = useState<ProfileSectionKey>('personal');
  
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
    useResumeStore.getState().setActiveCvData(formDataRef.current);
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
        useResumeStore.getState().setActiveCvData(formDataRef.current);
      }
    };
  }, [onChange]);

  // Synchronize when external data changes
  useEffect(() => {
    if (data) {
      setFormData(data);
      formDataRef.current = data;
    }
  }, [data]);

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
        useResumeStore.getState().setActiveCvData(formDataRef.current);
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

        let finalUrl = url;
        if (type === 'email') {
          finalUrl = cleanText ? `mailto:${cleanText}` : undefined;
        } else if (!finalUrl && (type === 'linkedin' || type === 'github' || type === 'globe')) {
          finalUrl = label;
        }

        const newContact: ContactItem = {
          type,
          label,
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
        { category: t('profile:sections.skills.defaultCore', 'Core & Languages'), skills: ['TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3'] },
        { category: t('profile:sections.skills.defaultArchitecture', 'Architecture & Frameworks'), skills: ['State Management', 'Clean Architecture', 'REST APIs'] },
        { category: t('profile:sections.skills.defaultTooling', 'Tooling, Cloud & CI/CD'), skills: ['Git', 'Vite', 'CI/CD'] }
      ];
      if (!groups[index]) return prev;
      groups[index] = { ...groups[index], category: newCategory };
      return { ...prev, skillGroups: groups };
    });
  }, [updateData, t]);

  const handleSkillGroupSkillsChange = useCallback((index: number, skillsStr: string) => {
    updateData(prev => {
      const groups = prev.skillGroups && prev.skillGroups.length > 0 ? [...prev.skillGroups] : [
        { category: t('profile:sections.skills.defaultCore', 'Core & Languages'), skills: ['TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3'] },
        { category: t('profile:sections.skills.defaultArchitecture', 'Architecture & Frameworks'), skills: ['State Management', 'Clean Architecture', 'REST APIs'] },
        { category: t('profile:sections.skills.defaultTooling', 'Tooling, Cloud & CI/CD'), skills: ['Git', 'Vite', 'CI/CD'] }
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
        ? t('profile:sections.skills.defaultCore', 'Core & Languages')
        : newIdx === 1
        ? t('profile:sections.skills.defaultArchitecture', 'Architecture & Frameworks')
        : newIdx === 2
        ? t('profile:sections.skills.defaultTooling', 'Tooling, Cloud & CI/CD')
        : `${t('profile:sections.skills.groupName', 'Categoría')} ${newIdx + 1}`;

      const newGroup: SkillCategory = {
        category: defaultCategory,
        skills: ['TypeScript', 'JavaScript']
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
      company: 'Nueva Empresa',
      role: 'Cargo / Especialización',
      location: 'Ubicación / Remoto',
      date: 'Ene 2023 – Presente',
      bullets: [
        'Lideró la arquitectura de módulos frontend logrando una reducción del 35% en tiempos de carga.'
      ]
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
      const newBullets = [...targetExp.bullets, 'Logro clave medido por métricas cuantificables implementando soluciones escalables.'];
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
      education: ['**Ingeniería / Licenciatura** — Universidad / Plataforma, 2024', ...(prev.education || [])]
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
      langList[index] = text;
      return { ...prev, languages: langList };
    });
  }, [updateData]);

  const handleAddLanguage = useCallback(() => {
    updateData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), '**Inglés:** Profesional (C1)']
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
      company: 'Nuevo Proyecto',
      role: 'Personal Project',
      location: 'github.com/usuario/proyecto',
      date: '2024',
      bullets: [
        'Desarrolló una plataforma escalable con TypeScript y arquitectura limpia.'
      ]
    };
    updateData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));
  }, [updateData]);

  const handleProjectFieldChange = useCallback((index: number, field: keyof ExperienceItem, value: string | string[]) => {
    updateData(prev => {
      const list = [...(prev.projects || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, projects: list };
    });
  }, [updateData]);

  const handleRemoveProject = useCallback((index: number) => {
    updateData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  }, [updateData]);

  // Modal State for Adding Custom Section
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

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
    setActiveSection(`custom_${newId}`);
  }, [updateData]);

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
    setActiveSection('personal');
  }, [updateData]);

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
      formData.contacts?.some(c => c.type === 'email' || c.type === 'location')
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

  // Ensure default skill groups if none exist
  const skillGroups = useMemo(() => {
    if (formData.skillGroups && formData.skillGroups.length > 0) {
      return formData.skillGroups;
    }
    return [
      { category: t('profile:sections.skills.defaultCore', 'Core & Languages'), skills: ['TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3'] },
      { category: t('profile:sections.skills.defaultArchitecture', 'Architecture & Frameworks'), skills: ['State Management', 'Clean Architecture', 'REST APIs'] },
      { category: t('profile:sections.skills.defaultTooling', 'Tooling, Cloud & CI/CD'), skills: ['Git', 'Vite', 'CI/CD'] }
    ];
  }, [formData.skillGroups, t]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flex: 1,
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        minHeight: { xs: 'auto', md: 520 },
        alignItems: 'stretch',
        boxSizing: 'border-box'
      }}
    >

      {/* 1. Left Navigation Rail (Desktop) / Top Tabs (Mobile) */}
      <ProfileNavRail
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sectionCounts={sectionCounts}
        customSections={formData.customSections || []}
        onAddSectionClick={() => setIsAddSectionModalOpen(true)}
      />

      {/* 2. Right Content Active Workspace Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: { xs: 'visible', md: 'auto' }
        }}
      >

        {activeSection === 'personal' && (
          <PersonalInfoSection
            name={formData.name || ''}
            title={formData.title || ''}
            contacts={formData.contacts}
            onNameChange={handleNameChange}
            onTitleChange={handleTitleChange}
            onContactChange={handleContactChange}
          />
        )}

        {activeSection === 'summary' && (
          <SummarySection
            summary={formData.summary || ''}
            onSummaryChange={handleSummaryChange}
          />
        )}

        {activeSection === 'skills' && (
          <SkillsCategorizedPanel
            skillGroups={skillGroups}
            onCategoryChange={handleSkillGroupCategoryChange}
            onSkillsChange={handleSkillGroupSkillsChange}
            onAddCategory={handleAddSkillGroup}
            onRemoveCategory={handleRemoveSkillGroup}
          />
        )}

        {activeSection === 'experience' && (
          <ExperienceSection
            experience={formData.experience || EMPTY_EXPERIENCE}
            onFieldChange={handleExperienceChange}
            onAddExperience={handleAddExperience}
            onRemoveExperience={handleRemoveExperience}
            onAddBullet={handleAddBullet}
            onUpdateBullet={handleUpdateBullet}
            onRemoveBullet={handleRemoveBullet}
          />
        )}

        {activeSection === 'education' && (
          <EducationSection
            education={formData.education || EMPTY_EDUCATION}
            onUpdateEducation={handleUpdateEducation}
            onAddEducation={handleAddEducation}
            onRemoveEducation={handleRemoveEducation}
          />
        )}

        {activeSection === 'languages' && (
          <LanguagesSection
            languages={formData.languages || EMPTY_LANGUAGES}
            onUpdateLanguage={handleUpdateLanguage}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
          />
        )}

        {activeSection === 'projects' && (
          <ProjectsSection
            projects={formData.projects || EMPTY_PROJECTS}
            onFieldChange={handleProjectFieldChange}
            onAddProject={handleAddProject}
            onRemoveProject={handleRemoveProject}
          />
        )}

        {/* Dynamic Custom Section Panel */}
        {activeCustomSection && (
          <CustomSectionPanel
            section={activeCustomSection}
            onUpdateTitle={(newTitle) => handleUpdateCustomSectionTitle(activeCustomSection.id, newTitle)}
            onAddItem={(itemText) => handleAddCustomSectionItem(activeCustomSection.id, itemText)}
            onUpdateItem={(index, newText) => handleUpdateCustomSectionItem(activeCustomSection.id, index, newText)}
            onRemoveItem={(index) => handleRemoveCustomSectionItem(activeCustomSection.id, index)}
            onRemoveSection={() => handleRemoveCustomSection(activeCustomSection.id)}
          />
        )}
      </Box>

      {/* Add Custom Section Modal */}
      <AddSectionModal
        open={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={handleAddCustomSection}
      />
    </Box>
  );
};

