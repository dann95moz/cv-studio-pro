import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { BulletItemRow } from './BulletItemRow';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissExperienceSectionProps {
  experience?: CVTemplateProps['slots']['experience'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissExperienceSection: React.FC<SwissExperienceSectionProps> = ({
  experience,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!experience) return null;

  return (
    <section key="experience" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '8px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={experience.title || labels.experience}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('experience', newTitle)}
          placeholder={labels.experience}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: inSidebar ? '9px' : '12px' }}>
        {experience.items.map((exp, expIdx) => (
          <div key={expIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div>
                <EditableText
                  tagName="span"
                  value={exp.role || 'Poste'}
                  onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'role', val)}
                  style={{ fontWeight: 800, color: '#0f172a', fontSize: inSidebar ? '11px' : '12px' }}
                />
                <span style={{ color: '#94a3b8', margin: '0 5px' }}>|</span>
                <EditableText
                  tagName="span"
                  value={exp.company}
                  onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'company', val)}
                  style={{ fontWeight: 700, color: 'var(--cv-primary, #0284c7)', fontSize: inSidebar ? '10.5px' : '11.5px' }}
                />
                {exp.location && (
                  <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '5px' }}>
                    ({exp.location})
                  </span>
                )}
              </div>
              {exp.date && (
                <span style={{ fontSize: inSidebar ? '9.5px' : '10.5px', fontWeight: 700, color: '#64748b' }}>
                  {exp.date}
                </span>
              )}
            </div>

            {exp.bullets && (
              <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {exp.bullets.map((bullet, bIdx) => {
                  const isDisabled = Boolean(exp.disabledBullets?.includes(bIdx));
                  return (
                    <BulletItemRow
                      key={bIdx}
                      bullet={bullet}
                      isDisabled={isDisabled}
                      isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
                      onToggle={() => liveEdit?.toggleBulletVisibility('experience', expIdx, bIdx)}
                      onSave={(val) => liveEdit?.updateExperienceBullet('experience', expIdx, bIdx, val)}
                      aiConfig={{
                        type: 'bullet',
                        fieldKey: `swiss-exp-${expIdx}-bullet-${bIdx}`,
                        sectionType: 'experience',
                        itemIndex: expIdx,
                        bulletIndex: bIdx,
                        company: exp.company,
                        role: exp.role,
                      }}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
