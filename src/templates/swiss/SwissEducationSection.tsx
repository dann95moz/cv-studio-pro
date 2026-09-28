import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { safeMarkdownInline } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissEducationSectionProps {
  education?: CVTemplateProps['slots']['education'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissEducationSection: React.FC<SwissEducationSectionProps> = ({
  education,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!education) return null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={education.title || labels.education}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('education', newTitle)}
          placeholder={labels.education}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: inSidebar ? '6px' : '8px' }}>
        {education.items.map((edu, eIdx) => (
          <EditableText
            key={eIdx}
            tagName="div"
            value={edu}
            onSave={(val) => liveEdit?.updateEducationItem(eIdx, val)}
            htmlContent={safeMarkdownInline(edu)}
            style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4 }}
          />
        ))}
      </div>
    </section>
  );
};
