import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { ProfileNavRail, ProfileSectionKey } from './profile/ProfileNavRail';
import { AddSectionModal } from './profile/AddSectionModal';
import { GuidedProfileFormProps } from '../../types';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { useGuidedProfileData } from './profile/useGuidedProfileData';
import { GuidedProfileActiveSection } from './profile/GuidedProfileActiveSection';

export type { GuidedProfileFormProps };

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
  activeSection: controlledActiveSection,
  onSectionChange: setControlledActiveSection,
  onComplete,
}) => {
  const [internalSection, setInternalSection] = useState<ProfileSectionKey>('personal');
  const activeSection = (controlledActiveSection as ProfileSectionKey) || internalSection;

  const handleSectionChange = useCallback(
    (sec: ProfileSectionKey) => {
      if (setControlledActiveSection) {
        setControlledActiveSection(sec);
      } else {
        setInternalSection(sec);
      }
    },
    [setControlledActiveSection]
  );

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  const profileData = useGuidedProfileData({
    markdownContent,
    onChange,
    onFlushRef,
    data,
    activeSection,
    onSectionChange: handleSectionChange,
    onComplete,
  });

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: profileData.handleSwipeLeft,
    onSwipeRight: profileData.handleSwipeRight,
    enabled: activeSection !== 'personal',
  });

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
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Left Navigation Rail (Desktop) / Mobile Top Section Bar (Mobile) */}
      <ProfileNavRail
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sectionCounts={profileData.sectionCounts}
        customSections={profileData.formData.customSections || []}
        onAddSectionClick={() => setIsAddSectionModalOpen(true)}
      />

      {/* 2. Right Content Active Workspace Panel with Carousel Swipe Support */}
      <Box
        {...swipeHandlers}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: { xs: 'visible', md: 'auto' },
          touchAction: 'pan-y',
          transition: 'opacity 0.2s ease',
        }}
      >
        <GuidedProfileActiveSection
          activeSection={activeSection}
          formData={profileData.formData}
          skillGroups={profileData.skillGroups}
          activeCustomSection={profileData.activeCustomSection}
          isProfileComplete={profileData.isProfileComplete}
          isLastSection={profileData.isLastSection}
          onNameChange={profileData.handleNameChange}
          onTitleChange={profileData.handleTitleChange}
          onContactChange={profileData.handleContactChange}
          onSummaryChange={profileData.handleSummaryChange}
          onSkillCategoryChange={profileData.handleSkillGroupCategoryChange}
          onSkillsChange={profileData.handleSkillGroupSkillsChange}
          onAddSkillGroup={profileData.handleAddSkillGroup}
          onRemoveSkillGroup={profileData.handleRemoveSkillGroup}
          onExperienceFieldChange={profileData.handleExperienceChange}
          onAddExperience={profileData.handleAddExperience}
          onRemoveExperience={profileData.handleRemoveExperience}
          onAddBullet={profileData.handleAddBullet}
          onUpdateBullet={profileData.handleUpdateBullet}
          onRemoveBullet={profileData.handleRemoveBullet}
          onUpdateEducation={profileData.handleUpdateEducation}
          onAddEducation={profileData.handleAddEducation}
          onRemoveEducation={profileData.handleRemoveEducation}
          onUpdateLanguage={profileData.handleUpdateLanguage}
          onAddLanguage={profileData.handleAddLanguage}
          onRemoveLanguage={profileData.handleRemoveLanguage}
          onAddProject={profileData.handleAddProject}
          onProjectFieldChange={profileData.handleProjectFieldChange}
          onRemoveProject={profileData.handleRemoveProject}
          onUpdateCustomSectionTitle={profileData.handleUpdateCustomSectionTitle}
          onAddCustomSectionItem={profileData.handleAddCustomSectionItem}
          onUpdateCustomSectionItem={profileData.handleUpdateCustomSectionItem}
          onRemoveCustomSectionItem={profileData.handleRemoveCustomSectionItem}
          onRemoveCustomSection={profileData.handleRemoveCustomSection}
          onPrevInSequence={profileData.handlePrevInSequence}
          onNextInSequence={profileData.handleNextInSequence}
        />
      </Box>

      {/* Add Custom Section Modal */}
      <AddSectionModal
        open={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={profileData.handleAddCustomSection}
      />
    </Box>
  );
};
