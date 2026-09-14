import React from 'react';
import { PersonalInfoSectionProps } from '../../../types';
import { PersonalInfoStepFlow } from './PersonalInfoStepFlow';

export type { PersonalInfoSectionProps };

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = React.memo(({
  name,
  title,
  contacts,
  onNameChange,
  onTitleChange,
  onContactChange,
  onAdvanceSection,
}) => {
  return (
    <PersonalInfoStepFlow
      name={name}
      title={title}
      contacts={contacts}
      onNameChange={onNameChange}
      onTitleChange={onTitleChange}
      onContactChange={onContactChange}
      onAdvanceSection={onAdvanceSection}
    />
  );
});

PersonalInfoSection.displayName = 'PersonalInfoSection';
