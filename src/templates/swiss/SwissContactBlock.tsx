import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { resolveContactDisplay } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { Icon } from '../../components/Icons';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissContactBlockProps {
  contacts: CVTemplateProps['slots']['header']['contacts'];
  labels: SwissLabels;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissContactBlock: React.FC<SwissContactBlockProps> = ({
  contacts,
  labels,
  liveEdit,
}) => {
  return (
    <section>
      <h3
        style={{
          fontSize: '10.5px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--cv-primary, #0284c7)',
          borderBottom: '1.5px solid #e2e8f0',
          paddingBottom: '3px',
          marginBottom: '8px',
        }}
      >
        {labels.contactTitle}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#475569' }}>
        {contacts.map((c, idx) => {
          const { resolvedUrl, displayLabel } = resolveContactDisplay(c);

          return (
            <div key={idx} style={{ wordBreak: 'break-word' }}>
              {resolvedUrl ? (
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-contact-link"
                  style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icon type={c.type} size={11} />
                  <EditableText
                    tagName="span"
                    value={displayLabel}
                    onSave={(newVal) => liveEdit?.updateContact(idx, newVal, resolvedUrl)}
                  />
                </a>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon type={c.type} size={11} />
                  <EditableText
                    tagName="span"
                    value={displayLabel}
                    onSave={(newVal) => liveEdit?.updateContact(idx, newVal)}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
