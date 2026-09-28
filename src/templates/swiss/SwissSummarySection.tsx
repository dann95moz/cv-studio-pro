import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { safeMarkdown } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissSummarySectionProps {
  summary?: CVTemplateProps['slots']['summary'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissSummarySection: React.FC<SwissSummarySectionProps> = ({
  summary,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!summary) return null;

  return (
    <section key="summary" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={summary.title || labels.profile}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('summary', newTitle)}
          placeholder={labels.profile}
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
      <EditableText
        tagName="div"
        value={summary.rawContent}
        onSave={(val) => liveEdit?.updateSummary(val)}
        multiline
        htmlContent={safeMarkdown(summary.rawContent)}
        aiConfig={{
          type: 'summary',
          fieldKey: 'swiss-summary-main',
        }}
        style={{
          margin: 0,
          fontSize: inSidebar ? '10.5px' : '11.5px',
          lineHeight: inSidebar ? 1.4 : 1.5,
          color: '#334155',
        }}
      />
    </section>
  );
};
