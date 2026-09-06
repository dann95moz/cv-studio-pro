import React from 'react';
import { CVTemplateProps } from './types';
import { extractCandidateInitials } from '../core/parser';
import { Icon } from '../components/Icons';
import { safeMarkdownInline } from '../utils/sanitize';
import { 
  SummarySlot, 
  SkillsSlot, 
  ExperienceSlot, 
  LanguagesSlot, 
  GenericSlot 
} from '../components/slots';
import { EditableText } from '../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../components/studio/preview/CvLiveEditContext';
import { ProfilePhotoDisplay } from '../components/studio/photo/ProfilePhotoDisplay';

/**
 * Executive Dual-Tone Template (Photo 5 Reference):
 * - Left dark charcoal sidebar: Candidate initials monogram avatar circle [DC], contact info, websites, and education.
 * - Right main area: Top accent header banner with spaced uppercase name, Professional Summary, Skills grid, and Work History.
 */
export const AcademicResearchTemplate: React.FC<CVTemplateProps> = ({ slots, theme }) => {
  const liveEdit = useCvLiveEdit();
  const initials = extractCandidateInitials(slots.header.name);
  const contacts = slots.header.contacts || [];

  const basicContacts = contacts.filter(c => ['email', 'phone', 'location'].includes(c.type));
  const linkContacts = contacts.filter(c => !['email', 'phone', 'location'].includes(c.type));

  return (
    <div className={`theme-${theme} template-dualtone-split`}>
      <div className="cv-container dualtone-grid-layout">
        {/* LEFT DARK CHARCOAL SIDEBAR */}
        <aside className="dualtone-sidebar-col">
          {/* Monogram Initials Avatar Circle / Profile Photo */}
          <ProfilePhotoDisplay
            photo={slots.header.photo}
            maskShape="circle"
            size={56}
            border="2px solid rgba(255, 255, 255, 0.7)"
            boxShadow="0 4px 14px rgba(0, 0, 0, 0.35)"
            fallbackInitials={initials}
            fallbackIcon="monogram"
            activeTheme={theme}
            editable={true}
            style={{ margin: '0 auto 12px' }}
          />

          {/* Contact Details */}
          {basicContacts.length > 0 && (
            <div className="dualtone-side-block">
              <ul className="dualtone-contact-list">
                {basicContacts.map((c, i) => (
                  <li key={i} className="dualtone-contact-item">
                    <span className="dualtone-icon-badge">
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

          {/* Websites & Profiles */}
          {linkContacts.length > 0 && (
            <div className="dualtone-side-block">
              <h3 className="dualtone-side-title">{slots.websitesTitle || 'Websites, Portfolios, Profiles'}</h3>
              <ul className="dualtone-link-list">
                {linkContacts.map((c, i) => (
                  <li key={i} className="dualtone-link-item">
                    <a href={c.url || '#'} target="_blank" rel="noopener noreferrer">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education in Dark Sidebar */}
          {slots.education && (
            <div className="dualtone-side-block">
              <EditableText
                tagName="h3"
                className="dualtone-side-title"
                value={slots.education.title || 'Education'}
                onSave={(newTitle) => liveEdit?.updateSectionTitle('education', newTitle)}
                placeholder="Education"
              />
              <ul className="dualtone-edu-list">

                {slots.education.items.map((item, eIdx) => (
                  <li 
                    key={eIdx}
                    dangerouslySetInnerHTML={{ __html: safeMarkdownInline(item) }}
                  />
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="dualtone-main-col">
          {/* Top Header Banner with Soft Accent Tint */}
          <header className="dualtone-top-header cv-header">
            <EditableText
              tagName="h1"
              className="dualtone-name"
              value={slots.header.name}
              onSave={(newName) => liveEdit?.updateName(newName)}
              placeholder="Full Name"
            />
            {(slots.header.title || liveEdit?.isLiveEditing) && (
              <EditableText
                tagName="div"
                className="dualtone-title"
                value={slots.header.title || ''}
                onSave={(newTitle) => liveEdit?.updateTitle(newTitle)}
                placeholder="Professional Title"
              />
            )}
          </header>

          <div className="dualtone-main-body">
            {/* Professional Summary */}
            {slots.summary && (
              <div className="dualtone-section">
                <SummarySlot data={slots.summary} />
              </div>
            )}

            {/* Skills Multi-Column Grid */}
            {slots.skills && (
              <div className="dualtone-section">
                <SkillsSlot data={slots.skills} variant="inline" />
              </div>
            )}

            {/* Work History */}
            {slots.experience && (
              <div className="dualtone-section">
                <ExperienceSlot data={slots.experience} />
              </div>
            )}

            {/* Projects */}
            {slots.projects && (
              <div className="dualtone-section">
                <ExperienceSlot data={slots.projects} />
              </div>
            )}

            {/* Languages */}
            {slots.languages && (
              <div className="dualtone-section">
                <LanguagesSlot data={slots.languages} />
              </div>
            )}

            {slots.genericSections.map(sec => (
              <GenericSlot key={sec.id} data={sec} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
