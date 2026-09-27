import React from 'react';
import { CVTemplateProps } from './types';
import { safeMarkdown, safeMarkdownInline, resolveContactDisplay } from '../utils/sanitize';
import { EditableText } from '../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../components/studio/preview/CvLiveEditContext';
import { Icon } from '../components/Icons';
import { SupportedLanguage } from '../constants/languages';
import { ProfilePhotoDisplay } from '../components/studio/photo/ProfilePhotoDisplay';
import { extractCandidateInitials } from '../core/parser';

interface SwissLabels {
  contactTitle: string;
  workPermit: string;
  nationality: string;
  birthDate: string;
  drivingLicense: string;
  availability: string;
  civilStatus: string;
  languages: string;
  competencies: string;
  education: string;
  profile: string;
  experience: string;
  projects: string;
  references: string;
}

const SWISS_LABELS: Record<SupportedLanguage, SwissLabels> = {
  fr: {
    contactTitle: 'Contact & Informations',
    workPermit: 'Permis de travail',
    nationality: 'Nationalité',
    birthDate: 'Date de naissance',
    drivingLicense: 'Permis de conduire',
    availability: 'Disponibilité',
    civilStatus: 'État civil',
    languages: 'Langues',
    competencies: 'Compétences',
    education: 'Formation & Diplômes',
    profile: 'Profil professionnel',
    experience: 'Expérience professionnelle',
    projects: 'Projets & Réalisations',
    references: 'Références',
  },
  de: {
    contactTitle: 'Kontakt & Personalien',
    workPermit: 'Aufenthaltsbewilligung',
    nationality: 'Nationalität',
    birthDate: 'Geburtsdatum',
    drivingLicense: 'Führerschein',
    availability: 'Verfügbarkeit',
    civilStatus: 'Zivilstand',
    languages: 'Sprachen',
    competencies: 'Kenntnisse & IT',
    education: 'Ausbildung & Abschlüsse',
    profile: 'Kurzprofil',
    experience: 'Berufliche Erfahrung',
    projects: 'Projekte & Erfolge',
    references: 'Referenzen',
  },
  en: {
    contactTitle: 'Contact & Details',
    workPermit: 'Work permit',
    nationality: 'Nationality',
    birthDate: 'Date of birth',
    drivingLicense: 'Driving licence',
    availability: 'Availability',
    civilStatus: 'Civil status',
    languages: 'Languages',
    competencies: 'Core Competencies',
    education: 'Education & Credentials',
    profile: 'Professional Profile',
    experience: 'Work Experience',
    projects: 'Projects & Achievements',
    references: 'References',
  },
  es: {
    contactTitle: 'Contacto y Datos',
    workPermit: 'Permiso de trabajo',
    nationality: 'Nacionalidad',
    birthDate: 'Fecha de nacimiento',
    drivingLicense: 'Permiso de conducir',
    availability: 'Disponibilidad',
    civilStatus: 'Estado civil',
    languages: 'Idiomas',
    competencies: 'Competencias',
    education: 'Educación y Títulos',
    profile: 'Perfil profesional',
    experience: 'Experiencia laboral',
    projects: 'Proyectos destacados',
    references: 'Referencias',
  },
  it: {
    contactTitle: 'Contatti e Dati',
    workPermit: 'Permesso di lavoro',
    nationality: 'Nazionalità',
    birthDate: 'Data di nascita',
    drivingLicense: 'Patente',
    availability: 'Disponibilità',
    civilStatus: 'Stato civile',
    languages: 'Lingue',
    competencies: 'Competenze',
    education: 'Istruzione e Titoli',
    profile: 'Profilo professionale',
    experience: 'Esperienza professionale',
    projects: 'Progetti principali',
    references: 'Referenze',
  },
};

export const SwissModernTemplate: React.FC<CVTemplateProps> = ({ slots, theme, photo }) => {
  const liveEdit = useCvLiveEdit();
  const { header, summary, skills, experience, education, languages, projects, genericSections } = slots;
  const lang: SupportedLanguage = slots.language || 'fr';
  const labels = SWISS_LABELS[lang] || SWISS_LABELS.fr;

  const activePhoto = photo || slots.header.photo;
  const initials = extractCandidateInitials(header.name);
  const hasPersonalDetails = Boolean(
    header.workPermit ||
    header.nationality ||
    header.dateOfBirth ||
    header.drivingLicense ||
    header.availability ||
    header.civilStatus
  );

  return (
    <div
      className={`theme-${theme} template-swiss-modern`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#1e293b',
        fontSize: '12px',
        lineHeight: 1.5,
        display: 'flex',
        minHeight: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 1. LEFT SIDEBAR: Photo, Contact, Swiss Legal Status, Languages, Skills, Education */}
      <aside
        style={{
          width: 'var(--cv-sidebar-width, 34%)',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {/* Profile Photo / Interactive Avatar Uploader */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <ProfilePhotoDisplay
            photo={activePhoto}
            maskShape="circle"
            size={activePhoto?.size || 96}
            border="2.5px solid var(--cv-primary, #0284c7)"
            boxShadow="0 3px 10px rgba(0, 0, 0, 0.08)"
            fallbackInitials={initials}
            fallbackIcon="monogram"
            fallbackBgColor="var(--cv-primary-light, #e0f2fe)"
            fallbackTextColor="var(--cv-primary, #0284c7)"
            activeTheme={theme}
            editable={true}
            hideOnPrintIfEmpty={true}
          />
        </div>

        {/* Contact Block */}
        <section>
          <h3
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--cv-primary, #0284c7)',
              borderBottom: '1.5px solid #e2e8f0',
              paddingBottom: '3px',
              marginBottom: '8px',
            }}
          >
            {labels.contactTitle}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#475569' }}>
            {header.contacts.map((c, idx) => {
              const { resolvedUrl, displayLabel } = resolveContactDisplay(c);

              return (
                <div key={idx} style={{ wordBreak: 'break-word' }}>
                  {resolvedUrl ? (
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-contact-link"
                      style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Icon type={c.type} size={11} />
                      <EditableText
                        tagName="span"
                        value={displayLabel}
                        onSave={(newVal) => liveEdit?.updateContact(idx, newVal, resolvedUrl)}
                      />
                    </a>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Icon type={c.type} size={11} />
                      <EditableText
                        tagName="span"
                        value={displayLabel}
                        onSave={(newVal) => liveEdit?.updateContact(idx, newVal)}
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Swiss Status & Personal Details */}
        {hasPersonalDetails && (
          <section
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '10.5px', color: '#334155' }}>
              {/* Work Permit Badge */}
              {header.workPermit && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--cv-primary, #0284c7)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.5px' }}>
                    {labels.workPermit}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      fontSize: '10.5px',
                      lineHeight: 1.3,
                    }}
                  >
                    <EditableText
                      tagName="span"
                      value={header.workPermit}
                      onSave={(val) => liveEdit?.updatePersonalDetail('workPermit', val)}
                    />
                  </span>
                </div>
              )}

              {/* Nationalité */}
              {header.nationality && (
                <div>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{labels.nationality} : </span>
                  <span style={{ fontWeight: 600 }}>
                    <EditableText
                      tagName="span"
                      value={header.nationality}
                      onSave={(val) => liveEdit?.updatePersonalDetail('nationality', val)}
                    />
                  </span>
                </div>
              )}

              {/* État civil */}
              {header.civilStatus && (
                <div>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{labels.civilStatus} : </span>
                  <span style={{ fontWeight: 600 }}>
                    <EditableText
                      tagName="span"
                      value={header.civilStatus}
                      onSave={(val) => liveEdit?.updatePersonalDetail('civilStatus', val)}
                    />
                  </span>
                </div>
              )}

              {/* Disponibilité / Mobilité */}
              {header.availability && (
                <div>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{labels.availability} : </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    <EditableText
                      tagName="span"
                      value={header.availability}
                      onSave={(val) => liveEdit?.updatePersonalDetail('availability', val)}
                    />
                  </span>
                </div>
              )}

              {/* Date de naissance */}
              {header.dateOfBirth && (
                <div>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{labels.birthDate} : </span>
                  <span>
                    <EditableText
                      tagName="span"
                      value={header.dateOfBirth}
                      onSave={(val) => liveEdit?.updatePersonalDetail('dateOfBirth', val)}
                    />
                  </span>
                </div>
              )}

              {/* Permis de conduire */}
              {header.drivingLicense && (
                <div>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{labels.drivingLicense} : </span>
                  <span>
                    <EditableText
                      tagName="span"
                      value={header.drivingLicense}
                      onSave={(val) => liveEdit?.updatePersonalDetail('drivingLicense', val)}
                    />
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Languages (With CEFR Badges) */}
        {languages && (
          <section>
            <EditableText
              tagName="h3"
              value={languages.title || labels.languages}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('languages', newTitle)}
              placeholder={labels.languages}
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--cv-primary, #0284c7)',
                borderBottom: '1.5px solid #e2e8f0',
                paddingBottom: '3px',
                marginBottom: '8px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
        )}

        {/* Competencies / Skills */}
        {skills && (
          <section>
            <EditableText
              tagName="h3"
              value={skills.title || labels.competencies}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('skills', newTitle)}
              placeholder={labels.competencies}
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--cv-primary, #0284c7)',
                borderBottom: '1.5px solid #e2e8f0',
                paddingBottom: '3px',
                marginBottom: '8px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {skills.skillGroups.map((group, gIdx) => (
                <div key={gIdx} style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>{group.category}</div>
                  <div style={{ color: '#64748b', lineHeight: 1.35 }}>{group.skills.join(', ')}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Formation & Diplômes */}
        {education && (
          <section>
            <EditableText
              tagName="h3"
              value={education.title || labels.education}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('education', newTitle)}
              placeholder={labels.education}
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--cv-primary, #0284c7)',
                borderBottom: '1.5px solid #e2e8f0',
                paddingBottom: '3px',
                marginBottom: '8px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {education.items.map((edu, eIdx) => (
                <EditableText
                  key={eIdx}
                  tagName="div"
                  value={edu}
                  onSave={(val) => liveEdit?.updateEducationItem(eIdx, val)}
                  htmlContent={safeMarkdownInline(edu)}
                  style={{ fontSize: '11px', color: '#334155' }}
                />
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* 2. MAIN BODY: Name, Title, Pitch, Work Experience, Projects, References */}
      <main
        style={{
          width: '66%',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Name & Title */}
        <header style={{ borderBottom: '2.5px solid var(--cv-primary, #0284c7)', paddingBottom: '10px' }}>
          <EditableText
            tagName="h1"
            value={header.name}
            onSave={(val) => liveEdit?.updateName(val)}
            style={{
              fontSize: '25px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 2px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }}
          />
          {header.title && (
            <EditableText
              tagName="div"
              value={header.title}
              onSave={(val) => liveEdit?.updateTitle(val)}
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--cv-primary, #0284c7)',
                letterSpacing: '0.2px',
              }}
            />
          )}
        </header>

        {/* Profil professionnel (Summary) */}
        {summary && (
          <section>
            <EditableText
              tagName="h2"
              value={summary.title || labels.profile}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('summary', newTitle)}
              placeholder={labels.profile}
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '6px',
              }}
            />
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
              style={{ margin: 0, fontSize: '11.5px', lineHeight: 1.5, color: '#334155' }}
            />
          </section>
        )}

        {/* Expérience professionnelle */}
        {experience && (
          <section>
            <EditableText
              tagName="h2"
              value={experience.title || labels.experience}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('experience', newTitle)}
              placeholder={labels.experience}
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '8px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experience.items.map((exp, expIdx) => (
                <div key={expIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div>
                      <EditableText
                        tagName="span"
                        value={exp.role || 'Poste'}
                        onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'role', val)}
                        style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px' }}
                      />
                      <span style={{ color: '#94a3b8', margin: '0 5px' }}>|</span>
                      <EditableText
                        tagName="span"
                        value={exp.company}
                        onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'company', val)}
                        style={{ fontWeight: 700, color: 'var(--cv-primary, #0284c7)', fontSize: '11.5px' }}
                      />
                      {exp.location && (
                        <span style={{ color: '#64748b', fontSize: '10.5px', marginLeft: '5px' }}>
                          ({exp.location})
                        </span>
                      )}
                    </div>
                    {exp.date && (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>
                        {exp.date}
                      </span>
                    )}
                  </div>

                  {exp.bullets && (
                    <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {exp.bullets.map((bullet, bIdx) => (
                        <EditableText
                          key={bIdx}
                          tagName="li"
                          value={bullet}
                          onSave={(val) => liveEdit?.updateExperienceBullet('experience', expIdx, bIdx, val)}
                          htmlContent={safeMarkdownInline(bullet)}
                          aiConfig={{
                            type: 'bullet',
                            fieldKey: `swiss-exp-${expIdx}-bullet-${bIdx}`,
                            sectionType: 'experience',
                            itemIndex: expIdx,
                            bulletIndex: bIdx,
                            company: exp.company,
                            role: exp.role,
                          }}
                          style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4 }}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projets notables (optionnel) */}
        {projects && (
          <section>
            <EditableText
              tagName="h2"
              value={projects.title || labels.projects}
              onSave={(newTitle) => liveEdit?.updateSectionTitle('projects', newTitle)}
              placeholder={labels.projects}
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '6px',
              }}
            />
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
                    <ul style={{ margin: '2px 0 0 0', paddingLeft: '16px' }}>
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ fontSize: '11px', color: '#334155' }}>
                          <span dangerouslySetInnerHTML={{ __html: safeMarkdownInline(b) }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Generic or Custom sections */}
        {genericSections.map((sec) => (
          <section key={sec.id}>
            <EditableText
              tagName="h2"
              value={sec.title}
              onSave={(newTitle) => liveEdit?.updateSectionTitle(sec.id, newTitle)}
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '6px',
              }}
            />
            <div
              style={{ fontSize: '11px', color: '#334155', lineHeight: 1.45 }}
              dangerouslySetInnerHTML={{ __html: safeMarkdown(sec.rawContent) }}
            />
          </section>
        ))}

        {/* Références professionnelles */}
        {header.references && (
          <section
            style={{
              marginTop: 'auto',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--cv-primary, #0284c7)',
                }}
              >
                {labels.references} :
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                <EditableText
                  tagName="span"
                  value={header.references}
                  onSave={(val) => liveEdit?.updatePersonalDetail('references', val)}
                />
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
