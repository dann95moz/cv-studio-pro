import React from 'react';
import { HeaderSlotProps } from '../../templates/types';
import { Icon } from '../Icons';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';
import { getCleanContactLabel } from '../../utils/sanitize';

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
        onSave={(newName) => liveEdit?.updateName(newName)}
        placeholder="Full Name"
      />
      {(data.title || liveEdit?.isLiveEditing) && (
        <EditableText
          tagName="div"
          className="cv-title"
          value={data.title || ''}
          onSave={(newTitle) => liveEdit?.updateTitle(newTitle)}
          placeholder="Professional Title"
        />
      )}
      
      {showContactsInHeader && data.contacts.length > 0 && (
        <div className="cv-contact-list">
          {data.contacts.map((c, i) => {
            const displayLabel = getCleanContactLabel(c);
            let resolvedUrl = c.url?.trim();
            if (!resolvedUrl) {
              const raw = (c.label || '').trim();
              if (c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') {
                if (raw.includes('.') || raw.startsWith('http')) {
                  resolvedUrl = raw.startsWith('http') ? raw : `https://${raw.replace(/^https?:\/\//, '')}`;
                }
              } else if (c.type === 'email' && raw.includes('@')) {
                resolvedUrl = raw.startsWith('mailto:') ? raw : `mailto:${raw.replace(/^mailto:/i, '')}`;
              } else if (c.type === 'phone' && /[\d+]/.test(raw)) {
                resolvedUrl = `tel:${raw.replace(/[^\d+]/g, '')}`;
              }
            } else if ((c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') && !resolvedUrl.startsWith('http')) {
              resolvedUrl = `https://${resolvedUrl}`;
            }

            return (
              <span key={i} className="cv-contact-item">
                <Icon type={c.type} />
                {resolvedUrl && !liveEdit?.isLiveEditing ? (
                  <a href={resolvedUrl} target="_blank" rel="noopener noreferrer">
                    {displayLabel}
                  </a>
                ) : (
                  <EditableText
                    tagName="span"
                    value={c.label}
                    onSave={(newLabel) => liveEdit?.updateContact(i, newLabel)}
                    placeholder="Contact Info"
                  />
                )}
              </span>
            );
          })}
        </div>
      )}
    </header>
  );
};
