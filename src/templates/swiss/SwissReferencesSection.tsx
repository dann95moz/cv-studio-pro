import React from 'react';
import { SwissLabels } from './swissLabels';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissReferencesSectionProps {
  references?: string;
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissReferencesSection: React.FC<SwissReferencesSectionProps> = ({
  references,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!references) return null;

  return (
    <section
      key="references"
      style={{
        marginTop: 'auto',
        paddingTop: '8px',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: inSidebar ? '10px' : '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--cv-primary, #0284c7)',
          }}
        >
          {labels.references} :
        </span>
        <span style={{ fontSize: inSidebar ? '10px' : '11px', color: '#64748b', fontStyle: 'italic' }}>
          <EditableText
            tagName="span"
            value={references}
            onSave={(val) => liveEdit?.updatePersonalDetail('references', val)}
          />
        </span>
      </div>
    </section>
  );
};
