import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { BulletItemRow } from './BulletItemRow';
import { safeMarkdownInline } from '../../utils/sanitize';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissProjectsSectionProps {
  projects?: CVTemplateProps['slots']['projects'];
  labels: SwissLabels;
  inSidebar: boolean;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissProjectsSection: React.FC<SwissProjectsSectionProps> = ({
  projects,
  labels,
  inSidebar,
  liveEdit,
}) => {
  if (!projects) return null;

  return (
    <section key="projects" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
        <EditableText
          tagName={inSidebar ? 'h3' : 'h2'}
          value={projects.title || labels.projects}
          onSave={(newTitle) => liveEdit?.updateSectionTitle('projects', newTitle)}
          placeholder={labels.projects}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {projects.items.map((proj, pIdx) => (
          <div key={pIdx}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '11.5px' }}>{proj.company}</span>
              {proj.role && (
                <span
                  style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}
                  dangerouslySetInnerHTML={{ __html: safeMarkdownInline(proj.role) }}
                />
              )}
            </div>
            {proj.bullets && (
              <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {proj.bullets.map((b, bIdx) => {
                  const isDisabled = Boolean(proj.disabledBullets?.includes(bIdx));
                  return (
                    <BulletItemRow
                      key={bIdx}
                      bullet={b}
                      isDisabled={isDisabled}
                      isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
                      onToggle={() => liveEdit?.toggleBulletVisibility('projects', pIdx, bIdx)}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
