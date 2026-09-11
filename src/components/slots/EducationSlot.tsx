import React from 'react';
import { EducationSlotProps } from '../../templates/types';
import { marked } from 'marked';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';

export type { EducationSlotProps };

export const EducationSlot: React.FC<EducationSlotProps> = ({ 
  data, 
  className = '',
  maxItems 
}) => {
  const liveEdit = useCvLiveEdit();
  const displayItems = maxItems ? data.items.slice(0, maxItems) : data.items;

  return (
    <section className={`cv-section section-${data.type} section-block ${className}`}>
      <EditableText
        tagName="h2"
        className="cv-section-title"
        value={data.title}
        onSave={(newTitle) => liveEdit?.updateSectionTitle('education', newTitle)}
        placeholder="Education & Certifications"
      />
      <ul className={`${data.type}-list section-block`}>

        {displayItems.map((rawItem, idx) => {
          let item = (rawItem || '').trim();
          // Auto-repair missing leading bold like "Degree** – Institution" or "*Degree** – Institution"
          if (/^\*?[^*]+\*\*/.test(item)) {
            item = item.replace(/^\*?([^*]+)\*\*/, '**$1**');
          } else if (!item.includes('**') && /^[\p{L}0-9\s.,/&()-]+?\s+[–—\-]\s+/u.test(item)) {
            item = item.replace(/^([\p{L}0-9\s.,/&()-]+?)\s+([–—\-])\s+/u, '**$1** $2 ');
          }

          const htmlContent = item.includes('\n')
            ? (marked.parse(item) as string).replace(/^<p>([\s\S]*?)<\/p>/, '$1')
            : (marked.parseInline(item) as string);

          return (
            <EditableText
              key={idx}
              tagName="li"
              value={item}
              onSave={(newVal) => liveEdit?.updateEducationItem(idx, newVal)}
              htmlContent={htmlContent}
              placeholder="Degree, Institution, Dates..."
            />
          );
        })}
      </ul>
    </section>
  );
};
