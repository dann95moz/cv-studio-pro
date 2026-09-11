import React from 'react';
import { LanguagesSlotProps } from '../../templates/types';
import { marked } from 'marked';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';

export type { LanguagesSlotProps };

export const LanguagesSlot: React.FC<LanguagesSlotProps> = ({ data, className = '' }) => {
  const liveEdit = useCvLiveEdit();

  return (
    <section className={`cv-section section-languages section-block ${className}`}>
      <EditableText
        tagName="h2"
        className="cv-section-title"
        value={data.title}
        onSave={(newTitle) => liveEdit?.updateSectionTitle('languages', newTitle)}
        placeholder="Languages"
      />
      <ul className="languages-list section-block">

        {data.items.map((rawItem, idx) => {
          let item = (rawItem || '').trim();
          // Auto-repair "Spanish:** Level" or "*Spanish:** Level"
          if (/^\*?[^*]+:\*\*/.test(item)) {
            item = item.replace(/^\*?([^*]+):\*\*/, '**$1:**');
          } else if (!item.includes('**') && /^[\p{L}\s]+:/u.test(item)) {
            item = item.replace(/^([\p{L}\s]+):/u, '**$1:**');
          }

          return (
            <EditableText
              key={idx}
              tagName="li"
              value={item}
              onSave={(newVal) => liveEdit?.updateLanguageItem(idx, newVal)}
              htmlContent={marked.parseInline(item) as string}
              placeholder="Language (Proficiency Level)..."
            />
          );
        })}
      </ul>
    </section>
  );
};
