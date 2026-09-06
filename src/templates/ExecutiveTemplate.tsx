import React from 'react';
import { CVTemplateProps } from './types';
import { extractCandidateInitials } from '../core/parser';
import { Icon } from '../components/Icons';
import { 
  SummarySlot, 
  SkillsSlot, 
  ExperienceSlot, 
  EducationSlot, 
  LanguagesSlot, 
  GenericSlot 
} from '../components/slots';
import { EditableText } from '../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../components/studio/preview/CvLiveEditContext';
import { ProfilePhotoDisplay } from '../components/studio/photo/ProfilePhotoDisplay';

/**
 * Corporate Top Banner Template (Photo 2 Reference):
 * - Prominent full-width colored header banner with candidate initials monogram box [DC].
 * - Two-column body: Left main narrative (Summary & Work History) + Right sidebar (Contacts, Links, Skills, Education).
 */
export const ExecutiveTemplate: React.FC<CVTemplateProps> = ({ slots, theme }) => {
  const liveEdit = useCvLiveEdit();
  const initials = extractCandidateInitials(slots.header.name);
  const contacts = slots.header.contacts || [];

  // Separate links (LinkedIn, GitHub, Portfolio, Globe) from basic contacts (Email, Phone, Location)
  const basicContacts = contacts.filter(c => ['email', 'phone', 'location'].includes(c.type));
  const linkContacts = contacts.filter(c => !['email', 'phone', 'location'].includes(c.type));

  return (
    <div className={`theme-${theme} template-corporate-banner`}>
      <div className="cv-container">
        {/* Full-width Top Header Banner */}
        <header className="banner-header cv-header">
          <ProfilePhotoDisplay
            photo={slots.header.photo}
            maskShape="rounded"
            size={54}
            border="2px solid rgba(255, 255, 255, 0.85)"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.25)"
            fallbackInitials={initials}
            fallbackIcon="monogram"
            activeTheme={theme}
            editable={true}
            style={{ margin: '0 auto 8px' }}
          />
          <EditableText
            tagName="h1"
            className="banner-name"
            value={slots.header.name}
            onSave={(newName) => liveEdit?.updateName(newName)}
            placeholder="Full Name"
          />
          {(slots.header.title || liveEdit?.isLiveEditing) && (
            <EditableText
              tagName="div"
              className="banner-title"
              value={slots.header.title || ''}
              onSave={(newTitle) => liveEdit?.updateTitle(newTitle)}
              placeholder="Professional Title"
            />
          )}
        </header>

        {/* 2-Column Body Layout */}
        <div className="banner-body-grid">
          {/* Main Left Column: Summary & Work History */}
          <main className="banner-main-col">
            {slots.summary && (
              <SummarySlot data={slots.summary} />
            )}

            {slots.experience && (
              <ExperienceSlot data={slots.experience} />
            )}

            {slots.projects && (
              <ExperienceSlot data={slots.projects} />
            )}

            {slots.genericSections.map(sec => (
              <GenericSlot key={sec.id} data={sec} />
            ))}
          </main>

          {/* Right Sidebar: Contacts, Links, Skills, Education, Languages */}
          <aside className="banner-side-col">
            {/* Direct Contact Information */}
            {basicContacts.length > 0 && (
              <div className="banner-side-section banner-contacts-block">
                <ul className="banner-contact-list">
                  {basicContacts.map((c, i) => (
                    <li key={i} className="banner-contact-item">
                      <Icon type={c.type} size={13} />
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
              <div className="banner-side-section banner-links-block">
                <h3 className="banner-side-title">{slots.websitesTitle || 'Websites, Portfolios, Profiles'}</h3>
                <ul className="banner-link-list">
                  {linkContacts.map((c, i) => (
                    <li key={i} className="banner-link-item">
                      <Icon type={c.type} size={13} />
                      <a href={c.url || '#'} target="_blank" rel="noopener noreferrer">
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {slots.skills && (
              <div className="banner-side-section">
                <SkillsSlot data={slots.skills} variant="pills" />
              </div>
            )}

            {/* Education */}
            {slots.education && (
              <div className="banner-side-section">
                <EducationSlot data={slots.education} />
              </div>
            )}

            {/* Languages */}
            {slots.languages && (
              <div className="banner-side-section">
                <LanguagesSlot data={slots.languages} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
