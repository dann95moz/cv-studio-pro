import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissSkillsSectionProps {
  skills?: CVTemplateProps['slots']['skills'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissSkillsSection: React.FC<SwissSkillsSectionProps> = ({
  skills,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!skills) return null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={skills.title || labels.competencies}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('skills', newTitle)}
          placeholder={labels.competencies}
          style={{
            fontSize: inSidebar ? '10.5px' : '11.5px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: inSidebar ? '1px' : '0.6px',
            color: inSidebar ? 'var(--cv-primary, #0284c7)' : '#0f172a',
            margin: 0,
          }}
        />
      </div>

      <div
        style={
          inSidebar
            ? { display: 'flex', flexDirection: 'column', gap: '7px' }
            : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }
        }
      >
        {skills.skillGroups.map((group, gIdx) => (
          <div
            key={gIdx}
            style={
              inSidebar
                ? { fontSize: '11px' }
                : { fontSize: '11px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }
            }
          >
            <div style={{ fontWeight: 700, color: inSidebar ? '#334155' : 'var(--cv-primary, #0284c7)', marginBottom: '2px' }}>
              {group.category}
            </div>
            <div style={{ color: inSidebar ? '#64748b' : '#334155', lineHeight: 1.35 }}>
              {group.skills.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
