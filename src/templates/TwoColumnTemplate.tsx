import React from 'react';
import { CVTemplateProps } from './types';
import { extractCandidateInitials } from '../core/parser';
import { Icon } from '../components/Icons';
import { safeMarkdownInline } from '../utils/sanitize';
import { 
  SummarySlot, 
  ExperienceSlot, 
  EducationSlot, 
  GenericSlot 
} from '../components/slots';
import { EditableText } from '../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../components/studio/preview/CvLiveEditContext';
import { ProfilePhotoDisplay } from '../components/studio/photo/ProfilePhotoDisplay';

/**
 * Modern Contrast Sidebar Template (Photo 3 Reference):
 * - Left main content (66%): Extra bold modern name, Professional Summary, Work History, Education.
 * - Right full-height solid colored sidebar (34%): White geometric diamond/monogram card, contact info with circular icon badges, Websites & Profiles, and Skills in white text.
 */
export const TwoColumnTemplate: React.FC<CVTemplateProps> = ({ slots, theme }) => {
  const liveEdit = useCvLiveEdit();
  const initials = extractCandidateInitials(slots.header.name);
  const contacts = slots.header.contacts || [];

  const basicContacts = contacts.filter(c => ['email', 'phone', 'location'].includes(c.type));
  const linkContacts = contacts.filter(c => !['email', 'phone', 'location'].includes(c.type));

  return (
    <div className={`theme-${theme} template-contrast-sidebar`}>
      <div className="cv-container contrast-grid-layout">
        {/* LEFT MAIN CONTENT AREA */}
        <main className="contrast-main-col">
          {/* Header Name & Title */}
          <header className="contrast-header cv-header">
            <EditableText
              tagName="h1"
              className="contrast-name"
              value={slots.header.name}
              onSave={(newName) => liveEdit?.updateName(newName)}
              placeholder="Full Name"
            />
            {(slots.header.title || liveEdit?.isLiveEditing) && (
              <EditableText
                tagName="div"
                className="contrast-title"
                value={slots.header.title || ''}
                onSave={(newTitle) => liveEdit?.updateTitle(newTitle)}
                placeholder="Professional Title"
              />
            )}
          </header>

          {/* Professional Summary */}
          {slots.summary && (
            <div className="contrast-section">
              <SummarySlot data={slots.summary} />
            </div>
          )}

          {/* Work History */}
          {slots.experience && (
            <div className="contrast-section">
              <ExperienceSlot data={slots.experience} />
            </div>
          )}

          {/* Projects */}
          {slots.projects && (
            <div className="contrast-section">
              <ExperienceSlot data={slots.projects} />
            </div>
          )}

          {/* Education in Main Column */}
          {slots.education && (
            <div className="contrast-section">
              <EducationSlot data={slots.education} />
            </div>
          )}

          {slots.genericSections.map(sec => (
            <GenericSlot key={sec.id} data={sec} />
          ))}
        </main>

        {/* RIGHT SOLID COLORED SIDEBAR */}
        <aside className="contrast-sidebar-col">
          {/* Geometric Diamond Emblem Card / Profile Photo */}
          <ProfilePhotoDisplay
            photo={slots.header.photo}
            maskShape="rounded"
            size={56}
            border="2px solid #ffffff"
            boxShadow="0 4px 14px rgba(0, 0, 0, 0.25)"
            fallbackInitials={initials}
            fallbackIcon="diamond"
            activeTheme={theme}
            editable={true}
            style={{ margin: '0 auto 12px' }}
          />

          {/* Contact Details with Circular Icon Badges */}
          {basicContacts.length > 0 && (
            <div className="contrast-side-block">
              <ul className="contrast-contact-list">
                {basicContacts.map((c, i) => (
                  <li key={i} className="contrast-contact-item">
                    <span className="contrast-icon-badge">
                      <Icon type={c.type} size={11} style={{ margin: 0, verticalAlign: 'middle', display: 'block' }} />
                    </span>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {c.label}
                      </a>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Websites, Portfolios, Profiles */}
          {linkContacts.length > 0 && (
            <div className="contrast-side-block">
              <h3 className="contrast-side-title">{slots.websitesTitle || 'Websites, Portfolios, Profiles'}</h3>
              <ul className="contrast-link-list">
                {linkContacts.map((c, i) => (
                  <li key={i} className="contrast-link-item">
                    <a href={c.url || '#'} target="_blank" rel="noopener noreferrer">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills List in White */}
          {slots.skills && (
            <div className="contrast-side-block">
              <EditableText
                tagName="h3"
                className="contrast-side-title"
                value={slots.skills.title || 'Skills'}
                onSave={(newTitle) => liveEdit?.updateSectionTitle('skills', newTitle)}
                placeholder="Skills"
              />
              <div className="contrast-skills-list">
                {slots.skills.skillGroups.map((group, gIdx) => (
                  <div key={gIdx} className="contrast-skill-group">
                    <span className="contrast-skill-group-name">{group.category}:</span>
                    <ul className="contrast-skill-bullets">
                      {group.skills.map((skill, sIdx) => (
                        <li 
                          key={sIdx}
                          dangerouslySetInnerHTML={{ __html: safeMarkdownInline(skill) }}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages in White */}
          {slots.languages && (
            <div className="contrast-side-block">
              <EditableText
                tagName="h3"
                className="contrast-side-title"
                value={slots.languages.title || 'Languages'}
                onSave={(newTitle) => liveEdit?.updateSectionTitle('languages', newTitle)}
                placeholder="Languages"
              />
              <ul className="contrast-skill-bullets">

                {slots.languages.items.map((item, lIdx) => (
                  <li 
                    key={lIdx}
                    dangerouslySetInnerHTML={{ __html: safeMarkdownInline(item) }}
                  />
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
