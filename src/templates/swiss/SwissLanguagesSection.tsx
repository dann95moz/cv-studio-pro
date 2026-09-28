import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { safeMarkdownInline } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissLanguagesSectionProps {
  languages?: CVTemplateProps['slots']['languages'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissLanguagesSection: React.FC<SwissLanguagesSectionProps> = ({
  languages,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!languages) return null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={languages.title || labels.languages}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('languages', newTitle)}
          placeholder={labels.languages}
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
            ? { display: 'flex', flexDirection: 'column', gap: '6px' }
            : { display: 'flex', flexWrap: 'wrap', gap: '8px' }
        }
      >
        {languages.languageItems && languages.languageItems.length > 0 ? (
          languages.languageItems.map((langItem, lIdx) => {
            const isNative = langItem.level === 'Native';
            return (
              <div
                key={lIdx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  ...(inSidebar ? {} : { backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', gap: '10px' }),
                }}
              >
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{langItem.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: isNative ? '#dcfce7' : '#e0f2fe',
                    color: isNative ? '#166534' : '#0369a1',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  {langItem.level}
                </span>
              </div>
            );
          })
        ) : (
          languages.items.map((rawLang, lIdx) => (
            <EditableText
              key={lIdx}
              tagName="div"
              value={rawLang}
              onSave={(val) => liveEdit?.updateLanguageItem(lIdx, val)}
              htmlContent={safeMarkdownInline(rawLang)}
              style={{ fontSize: '11px' }}
            />
          ))
        )}
      </div>
    </section>
  );
};
