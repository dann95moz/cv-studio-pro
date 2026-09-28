import React from 'react';
import { GenericSlotData } from '../types';
import { safeMarkdown } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissGenericSectionProps {
  section: GenericSlotData;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissGenericSection: React.FC<SwissGenericSectionProps> = ({
  section,
  inSidebar,
  liveEdit,
}) => {
  return (
    <section key={section.id} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={section.title}
          onSave={(newTitle) => liveEdit?.updateSectionTitle(section.id, newTitle)}
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
        style={{ fontSize: inSidebar ? '10.5px' : '11px', color: '#334155', lineHeight: 1.45 }}
        dangerouslySetInnerHTML={{ __html: safeMarkdown(section.rawContent) }}
      />
    </section>
  );
};
