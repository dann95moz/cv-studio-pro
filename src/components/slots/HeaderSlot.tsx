import React from 'react';
import { marked } from 'marked';
import { HeaderSlotProps } from '../../templates/types';
import { Icon } from '../Icons';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';
import { resolveContactDisplay } from '../../utils/sanitize';

export type { HeaderSlotProps };

export const HeaderSlot: React.FC<HeaderSlotProps> = ({ 
  data, 
  className = '',
  showContactsInHeader = true 
}) => {
  const liveEdit = useCvLiveEdit();

  return (
    <header className={`cv-header ${className}`}>
      <EditableText
        tagName="h1"
        className="cv-name"
        value={data.name}
        htmlContent={data.name ? (marked.parseInline(data.name) as string) : ''}
        onSave={(newName) => liveEdit?.updateName(newName)}
        placeholder="Full Name"
      />
      {(data.title || liveEdit?.isLiveEditing) && (
        <EditableText
          tagName="div"
          className="cv-title"
          value={data.title || ''}
          htmlContent={data.title ? (marked.parseInline(data.title) as string) : ''}
          onSave={(newTitle) => liveEdit?.updateTitle(newTitle)}
          placeholder="Professional Title"
        />
      )}
      
      {showContactsInHeader && data.contacts.length > 0 && (
        <div className="cv-contact-list">
          {data.contacts.map((c, i) => {
            const { url: resolvedUrl, displayLabel } = resolveContactDisplay(c);

            return (
              <span key={i} className="cv-contact-item">
                {resolvedUrl ? (
                  <a 
                    href={resolvedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cv-contact-link"
                    title={displayLabel}
                  >
                    <Icon type={c.type} />
                    <span>{displayLabel}</span>
                  </a>
                ) : (
                  <span className="cv-contact-plain">
                    <Icon type={c.type} />
                    <span>{displayLabel}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </header>
  );
};
