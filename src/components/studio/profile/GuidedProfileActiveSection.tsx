import React from 'react';
import { useTranslation } from 'react-i18next';
import { CVData, ExperienceItem, SkillCategory, CustomSection, ContactType } from '../../../types/cv';
import { ProfileSectionKey } from './ProfileNavRail';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SummarySection } from './SummarySection';
import { SkillsCategorizedPanel } from './SkillsCategorizedPanel';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { LanguagesSection } from './LanguagesSection';
import { ProjectsSection } from './ProjectsSection';
import { CustomSectionPanel } from './CustomSectionPanel';

const EMPTY_EXPERIENCE: ExperienceItem[] = [];
const EMPTY_EDUCATION: string[] = [];
const EMPTY_LANGUAGES: string[] = [];
const EMPTY_PROJECTS: ExperienceItem[] = [];

export interface GuidedProfileActiveSectionProps {
  activeSection: ProfileSectionKey;
  formData: CVData;
  skillGroups: SkillCategory[];
  activeCustomSection: CustomSection | null | undefined;
  isProfileComplete: boolean;
  isLastSection: boolean;
  onNameChange: (name: string) => void;
  onTitleChange: (title: string) => void;
  onContactChange: (type: ContactType, label: string, url?: string) => void;
  onSummaryChange: (summary: string) => void;
  onSkillCategoryChange: (index: number, newCategory: string) => void;
  onSkillsChange: (index: number, skillsStr: string) => void;
  onAddSkillGroup: () => void;
  onRemoveSkillGroup: (index: number) => void;
  onExperienceFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  onAddBullet: (expIndex: number) => void;
  onUpdateBullet: (expIndex: number, bulletIndex: number, text: string) => void;
  onRemoveBullet: (expIndex: number, bulletIndex: number) => void;
  onUpdateEducation: (index: number, text: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
  onUpdateLanguage: (index: number, text: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
  onAddProject: () => void;
  onProjectFieldChange: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onRemoveProject: (index: number) => void;
  onUpdateCustomSectionTitle: (sectionId: string, newTitle: string) => void;
  onAddCustomSectionItem: (sectionId: string, itemText: string) => void;
  onUpdateCustomSectionItem: (sectionId: string, index: number, newText: string) => void;
  onRemoveCustomSectionItem: (sectionId: string, index: number) => void;
  onRemoveCustomSection: (sectionId: string) => void;
  onPrevInSequence: () => void;
  onNextInSequence: () => void;
}

export const GuidedProfileActiveSection: React.FC<GuidedProfileActiveSectionProps> = React.memo(({
  activeSection,
  formData,
  skillGroups,
  activeCustomSection,
  isProfileComplete,
  isLastSection,
  onNameChange,
  onTitleChange,
  onContactChange,
  onSummaryChange,
  onSkillCategoryChange,
  onSkillsChange,
  onAddSkillGroup,
  onRemoveSkillGroup,
  onExperienceFieldChange,
  onAddExperience,
  onRemoveExperience,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet,
  onUpdateEducation,
  onAddEducation,
  onRemoveEducation,
  onUpdateLanguage,
  onAddLanguage,
  onRemoveLanguage,
  onAddProject,
  onProjectFieldChange,
  onRemoveProject,
  onUpdateCustomSectionTitle,
  onAddCustomSectionItem,
  onUpdateCustomSectionItem,
  onRemoveCustomSectionItem,
  onRemoveCustomSection,
  onPrevInSequence,
  onNextInSequence,
}) => {
  const { t } = useTranslation(['profile']);

  const continueLabel = isProfileComplete
    ? t('profile:actions.continueToTarget', 'Continue to Target Vacancy')
    : undefined;

  if (activeSection === 'personal') {
    return (
      <PersonalInfoSection
        name={formData.name || ''}
        title={formData.title || ''}
        contacts={formData.contacts}
        onNameChange={onNameChange}
        onTitleChange={onTitleChange}
        onContactChange={onContactChange}
        onAdvanceSection={onNextInSequence}
        isProfileComplete={isProfileComplete}
      />
    );
  }

  if (activeSection === 'summary') {
    return (
      <SummarySection
        summary={formData.summary || ''}
        onSummaryChange={onSummaryChange}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeSection === 'skills') {
    return (
      <SkillsCategorizedPanel
        skillGroups={skillGroups}
        onCategoryChange={onSkillCategoryChange}
        onSkillsChange={onSkillsChange}
        onAddCategory={onAddSkillGroup}
        onRemoveCategory={onRemoveSkillGroup}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeSection === 'experience') {
    return (
      <ExperienceSection
        experience={formData.experience || EMPTY_EXPERIENCE}
        onFieldChange={onExperienceFieldChange}
        onAddExperience={onAddExperience}
        onRemoveExperience={onRemoveExperience}
        onAddBullet={onAddBullet}
        onUpdateBullet={onUpdateBullet}
        onRemoveBullet={onRemoveBullet}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeSection === 'education') {
    return (
      <EducationSection
        education={formData.education || EMPTY_EDUCATION}
        onUpdateEducation={onUpdateEducation}
        onAddEducation={onAddEducation}
        onRemoveEducation={onRemoveEducation}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeSection === 'languages') {
    return (
      <LanguagesSection
        languages={formData.languages || EMPTY_LANGUAGES}
        onUpdateLanguage={onUpdateLanguage}
        onAddLanguage={onAddLanguage}
        onRemoveLanguage={onRemoveLanguage}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeSection === 'projects') {
    return (
      <ProjectsSection
        projects={formData.projects || EMPTY_PROJECTS}
        onFieldChange={onProjectFieldChange}
        onAddProject={onAddProject}
        onRemoveProject={onRemoveProject}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  if (activeCustomSection) {
    return (
      <CustomSectionPanel
        section={activeCustomSection}
        onUpdateTitle={(newTitle) => onUpdateCustomSectionTitle(activeCustomSection.id, newTitle)}
        onAddItem={(itemText) => onAddCustomSectionItem(activeCustomSection.id, itemText)}
        onUpdateItem={(index, newText) => onUpdateCustomSectionItem(activeCustomSection.id, index, newText)}
        onRemoveItem={(index) => onRemoveCustomSectionItem(activeCustomSection.id, index)}
        onRemoveSection={() => onRemoveCustomSection(activeCustomSection.id)}
        onBack={onPrevInSequence}
        onContinue={onNextInSequence}
        isLastSection={isLastSection || isProfileComplete}
        continueLabel={continueLabel}
      />
    );
  }

  return null;
});

GuidedProfileActiveSection.displayName = 'GuidedProfileActiveSection';
