import React from 'react';
import { ExperienceSlotProps } from '../../templates/types';
import { marked } from 'marked';
import { EditableText } from '../studio/preview/EditableText';
import { useCvLiveEdit } from '../studio/preview/CvLiveEditContext';
import { APP_LINKS } from '../../constants/links';

export type { ExperienceSlotProps };

export const ExperienceSlot: React.FC<ExperienceSlotProps> = ({ 
  data, 
  className = '',
  maxItems
}) => {
  const liveEdit = useCvLiveEdit();
  const displayItems = maxItems ? data.items.slice(0, maxItems) : data.items;
  const isProjects = data.type === 'projects';
  const sectionType = isProjects ? 'projects' : 'experience';

  return (
    <section className={`cv-section section-${data.type} section-block ${className}`}>
      <h2 className="section-title">
        <EditableText
          value={data.title}
          onSave={(newVal) => liveEdit?.updateSectionTitle(sectionType, newVal)}
          placeholder={isProjects ? 'Personal & Open Source Projects' : 'Work Experience'}
        />
      </h2>
      <div className="section-content">
        {displayItems.map((item, idx) => (
          <div key={idx} className="experience-item">
            <div className="item-header">
              <EditableText
                className="item-company"
                value={item.company}
                htmlContent={item.company ? (marked.parseInline(item.company) as string) : ''}
                onSave={(newVal) => liveEdit?.updateExperienceField(sectionType, idx, 'company', newVal)}
                placeholder={isProjects ? 'Project Title' : 'Company / Organization'}
              />
              {isProjects ? (
                (item.demoUrl || item.repoUrl || item.location || (item.company && (item.company.toLowerCase().includes('cv studio') || item.company.toLowerCase().includes('tailor engine')))) && (
                  <span
                    className="item-location"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let demoUrl = item.demoUrl;
                        let repoUrl = item.repoUrl;

                        if (!demoUrl && item.location) {
                          const dm = item.location.match(/\[([^\]]*(?:demo|sitio|website|app|live)[^\]]*)\]\((https?:\/\/[^)]+)\)/i) ||
                                     item.location.match(/https?:\/\/(?!github\.com)[^\s)\]•|]+/i);
                          if (dm) demoUrl = dm[2] || dm[1] || dm[0];
                        }
                        if (!repoUrl && item.location) {
                          const rm = item.location.match(/\[([^\]]*(?:github|repo|código|code|source)[^\]]*)\]\((https?:\/\/[^)]+)\)/i) ||
                                     item.location.match(/https?:\/\/github\.com\/[^\s)\]•|]+/i);
                          if (rm) repoUrl = rm[2] || rm[1] || rm[0];
                        }

                        const compLower = (item.company || '').toLowerCase();
                        if (compLower.includes('cv studio') || compLower.includes('tailor engine')) {
                          if (!demoUrl) demoUrl = APP_LINKS.DEMO_URL;
                          if (!repoUrl) repoUrl = APP_LINKS.GITHUB_REPO;
                        }

                        const links: string[] = [];
                        if (demoUrl) {
                          const d = demoUrl.startsWith('http') ? demoUrl : `https://${demoUrl}`;
                          links.push(`<a href="${d}" target="_blank" rel="noopener noreferrer">Live Demo</a>`);
                        }
                        if (repoUrl) {
                          const r = repoUrl.startsWith('http') ? repoUrl : `https://${repoUrl}`;
                          links.push(`<a href="${r}" target="_blank" rel="noopener noreferrer">GitHub Repository</a>`);
                        }
                        const locClean = item.location
                          ? item.location
                              .replace(/\[([^\]]+)\]\([^)]+\)/g, '')
                              .replace(/Live\s*Demo/gi, '')
                              .replace(/GitHub(?:\s*Repository)?/gi, '')
                              .replace(/https?:\/\/[^\s]+/g, '')
                              .replace(/[•|·+–—/]/g, '')
                              .trim()
                          : '';
                        const locText = locClean ? (marked.parseInline(locClean) as string) : '';
                        if (links.length > 0) {
                          return [locText, ...links].filter(Boolean).join(' • ');
                        }
                        return item.location ? (marked.parseInline(item.location) as string) : '';
                      })()
                    }}
                  />
                )
              ) : (
                (item.location || liveEdit?.isLiveEditing) && (
                  <EditableText
                    tagName="span"
                    className="item-location"
                    value={item.location || ''}
                    htmlContent={item.location ? (marked.parseInline(item.location) as string) : ''}
                    onSave={(newVal) => liveEdit?.updateExperienceField(sectionType, idx, 'location', newVal)}
                    placeholder="Location"
                  />
                )
              )}
            </div>
            
            {(item.role || item.date || (!isProjects && liveEdit?.isLiveEditing)) && (
              <div className="item-sub-header">
                <EditableText
                  tagName="span"
                  className="item-role"
                  value={item.role || ''}
                  htmlContent={item.role ? (marked.parseInline(item.role) as string) : ''}
                  onSave={(newVal) => liveEdit?.updateExperienceField(sectionType, idx, 'role', newVal)}
                  placeholder={isProjects ? 'Category / Role' : 'Role / Job Title'}
                />
                {(Boolean(item.date?.trim()) || (!isProjects && liveEdit?.isLiveEditing)) && (
                  <EditableText
                    tagName="span"
                    className="item-date"
                    value={item.date || ''}
                    onSave={(newVal) => liveEdit?.updateExperienceField(sectionType, idx, 'date', newVal)}
                    placeholder={isProjects ? 'Year / Date' : 'Date Range'}
                  />
                )}
              </div>
            )}

            {item.bullets && item.bullets.length > 0 && (
              <ul className="item-bullets">
                {item.bullets.map((bullet, bIdx) => (
                  <EditableText
                    key={bIdx}
                    tagName="li"
                    value={bullet}
                    onSave={(newBullet) => liveEdit?.updateExperienceBullet(sectionType, idx, bIdx, newBullet)}
                    multiline
                    htmlContent={marked.parseInline(bullet) as string}
                    placeholder="Describe high-impact achievement with metrics..."
                    aiConfig={{
                      type: 'bullet',
                      fieldKey: `${sectionType}-${idx}-${bIdx}`,
                      sectionType,
                      itemIndex: idx,
                      bulletIndex: bIdx,
                      company: item.company,
                      role: item.role,
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
