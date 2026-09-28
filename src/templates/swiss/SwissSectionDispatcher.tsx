import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { SwissLanguagesSection } from './SwissLanguagesSection';
import { SwissSkillsSection } from './SwissSkillsSection';
import { SwissEducationSection } from './SwissEducationSection';
import { SwissExperienceSection } from './SwissExperienceSection';
import { SwissSummarySection } from './SwissSummarySection';
import { SwissProjectsSection } from './SwissProjectsSection';
import { SwissReferencesSection } from './SwissReferencesSection';
import { SwissGenericSection } from './SwissGenericSection';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissSectionDispatcherProps {
  id: string;
  inSidebar: boolean;
  slots: CVTemplateProps['slots'];
  labels: SwissLabels;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const renderSwissSection = ({
  id,
  inSidebar,
  slots,
  labels,
  liveEdit,
}: SwissSectionDispatcherProps): React.ReactNode => {
  const { summary, experience, projects, languages, skills, education, header, genericSections } = slots;

  switch (id) {
    case 'summary':
      return <SwissSummarySection summary={summary} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'experience':
      return <SwissExperienceSection experience={experience} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'projects':
      return <SwissProjectsSection projects={projects} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'languages':
      return <SwissLanguagesSection languages={languages} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'skills':
      return <SwissSkillsSection skills={skills} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'education':
      return <SwissEducationSection education={education} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    case 'references':
      return <SwissReferencesSection references={header.references} labels={labels} inSidebar={inSidebar} liveEdit={liveEdit} />;
    default: {
      const gen = genericSections.find((g) => g.id === id);
      if (gen) {
        return <SwissGenericSection section={gen} inSidebar={inSidebar} liveEdit={liveEdit} />;
      }
      return null;
    }
  }
};
