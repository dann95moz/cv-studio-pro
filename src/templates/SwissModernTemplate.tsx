import React, { useState } from 'react';
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

const DraggableSectionBlock: React.FC<{
  sectionId: string;
  column: 'sidebar' | 'main';
  index: number;
  isLiveEditing: boolean;
  onReorder: (sourceId: string, targetColumn: 'sidebar' | 'main', targetIndex?: number) => void;
  children: React.ReactNode;
}> = ({ sectionId, column, index, isLiveEditing, onReorder, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  if (!isLiveEditing) {
    return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDropPosition(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          setDropPosition('before');
        } else {
          setDropPosition('after');
        }
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setDropPosition(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);
        const sourceId = e.dataTransfer.getData('cv-section-id') || e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== sectionId) {
          const targetIndex = dropPosition === 'after' ? index + 1 : index;
          onReorder(sourceId, column, targetIndex);
        }
      }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '6px',
        transition: 'background-color 0.15s ease',
        backgroundColor: isHovered ? 'rgba(2, 132, 199, 0.02)' : 'transparent',
      }}
    >
      {/* Drop insertion line indicator (before) */}
      {dropPosition === 'before' && (
        <div
          className="no-print"
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'var(--cv-primary, #0284c7)',
            borderRadius: '9999px',
            boxShadow: '0 0 6px rgba(2, 132, 199, 0.45)',
            zIndex: 10,
          }}
        />
      )}

      {/* Notion-style subtle Drag Grip handle that appears on hover */}
      <div
        className="no-print"
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('cv-section-id', sectionId);
          e.dataTransfer.setData('text/plain', sectionId);
          e.dataTransfer.effectAllowed = 'move';
        }}
        title="Arrastra para reordenar arriba/abajo o mover a la otra columna"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: isHovered ? 0.75 : 0,
          transition: 'opacity 0.15s ease, background-color 0.15s ease',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: 'rgba(241, 245, 249, 0.95)',
          border: '1px dashed #cbd5e1',
          color: '#64748b',
          fontSize: '9.5px',
          fontWeight: 600,
          userSelect: 'none',
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: '11px', letterSpacing: '-1px' }}>⋮⋮</span>
      </div>

      {children}

      {/* Drop insertion line indicator (after) */}
      {dropPosition === 'after' && (
        <div
          className="no-print"
          style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'var(--cv-primary, #0284c7)',
            borderRadius: '9999px',
            boxShadow: '0 0 6px rgba(2, 132, 199, 0.45)',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

const BulletItemRow: React.FC<{
  bullet: string;
  isDisabled: boolean;
  isLiveEditing: boolean;
  onToggle: () => void;
  onSave?: (newVal: string) => void;
  aiConfig?: {
    type: 'bullet';
    fieldKey: string;
    sectionType: 'experience' | 'projects';
    itemIndex: number;
    bulletIndex: number;
    company?: string;
    role?: string;
  };
}> = ({
  bullet,
  isDisabled,
  isLiveEditing,
  onToggle,
  onSave,
  aiConfig,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isDisabled && !isLiveEditing) {
    return null;
  }

  return (
    <li
      className={isDisabled ? 'no-print' : ''}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontSize: '11px',
        color: '#334155',
        lineHeight: 1.45,
        opacity: isDisabled ? 0.42 : 1,
        textDecoration: isDisabled ? 'line-through' : 'none',
        transition: 'opacity 0.2s ease',
        listStyleType: 'disc',
      }}
    >
      <span style={{ display: 'inline' }}>
        {onSave ? (
          <EditableText
            tagName="span"
            value={bullet}
            onSave={onSave}
            htmlContent={safeMarkdownInline(bullet)}
            aiConfig={aiConfig}
            style={{ display: 'inline' }}
          />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: safeMarkdownInline(bullet) }} />
        )}

        {isLiveEditing && (
          <span
            className="no-print"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title={isDisabled ? 'Activar viñeta en el documento' : 'Ocultar viñeta para ahorrar espacio vertical en 1 página'}
            style={{
              display: isHovered || isDisabled ? 'inline-flex' : 'none',
              alignItems: 'center',
              gap: '3px',
              marginLeft: '6px',
              fontSize: '8.5px',
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
              verticalAlign: 'baseline',
              backgroundColor: isDisabled ? '#fef2f2' : 'rgba(241, 245, 249, 0.8)',
              color: isDisabled ? '#dc2626' : '#64748b',
              border: `1px dashed ${isDisabled ? '#f87171' : '#cbd5e1'}`,
              transition: 'all 0.15s ease',
            }}
          >
            {isDisabled ? (
              <>
                <span>✕ Oculta</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>• Clic para activar</span>
              </>
            ) : (
              <>
                <span>👁️ Ocultar</span>
              </>
            )}
          </span>
        )}
      </span>
    </li>
  );
};

export const SwissModernTemplate: React.FC<CVTemplateProps> = ({ slots, theme, photo, data }) => {
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

  const defaultSidebar = ['languages', 'skills', 'education'];
  const defaultMain = ['summary', 'experience', 'projects', 'references', ...genericSections.map((g) => g.id)];

  const placement: Record<string, 'sidebar' | 'main'> = {
    languages: 'sidebar',
    skills: 'sidebar',
    education: 'sidebar',
    summary: 'main',
    experience: 'main',
    projects: 'main',
    references: 'main',
    ...Object.fromEntries(genericSections.map((g) => [g.id, 'main'])),
    ...(data?.sectionPlacement || {}),
  };

  const rawSidebar = data?.sidebarSectionOrder && data.sidebarSectionOrder.length > 0
    ? data.sidebarSectionOrder
    : defaultSidebar;
  const activeSidebarIds: string[] = rawSidebar.filter((id) => placement[id] === 'sidebar');
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'sidebar' && !activeSidebarIds.includes(id)) {
      activeSidebarIds.push(id);
    }
  });

  const rawMain = data?.mainSectionOrder && data.mainSectionOrder.length > 0
    ? data.mainSectionOrder
    : defaultMain;
  const activeMainIds: string[] = rawMain.filter((id) => placement[id] === 'main');
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'main' && !activeMainIds.includes(id)) {
      activeMainIds.push(id);
    }
  });

  const [isDragOverAside, setIsDragOverAside] = useState(false);
  const [isDragOverMain, setIsDragOverMain] = useState(false);

  // 1. Languages Section Renderer
  const renderLanguagesSection = (inSidebar: boolean) => {
    if (!languages) return null;
    return (
      <section key="languages" style={{ display: 'flex', flexDirection: 'column' }}>
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

  // 2. Skills / Competencies Renderer
  const renderSkillsSection = (inSidebar: boolean) => {
    if (!skills) return null;
    return (
      <section key="skills" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
          <EditableText
            tagName={inSidebar ? 'h3' : 'h2'}
            value={skills.title || labels.competencies}
            onSave={(newTitle) => liveEdit?.updateSectionTitle('skills', newTitle)}
            placeholder={labels.competencies}
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
              ? { display: 'flex', flexDirection: 'column', gap: '7px' }
              : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }
          }
        >
          {skills.skillGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              style={
                inSidebar
                  ? { fontSize: '11px' }
                  : { fontSize: '11px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }
              }
            >
              <div style={{ fontWeight: 700, color: inSidebar ? '#334155' : 'var(--cv-primary, #0284c7)', marginBottom: '2px' }}>
                {group.category}
              </div>
              <div style={{ color: inSidebar ? '#64748b' : '#334155', lineHeight: 1.35 }}>
                {group.skills.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // 3. Education / Formation Renderer
  const renderEducationSection = (inSidebar: boolean) => {
    if (!education) return null;
    return (
      <section key="education" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
          <EditableText
            tagName={inSidebar ? 'h3' : 'h2'}
            value={education.title || labels.education}
            onSave={(newTitle) => liveEdit?.updateSectionTitle('education', newTitle)}
            placeholder={labels.education}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: inSidebar ? '6px' : '8px' }}>
          {education.items.map((edu, eIdx) => (
            <EditableText
              key={eIdx}
              tagName="div"
              value={edu}
              onSave={(val) => liveEdit?.updateEducationItem(eIdx, val)}
              htmlContent={safeMarkdownInline(edu)}
              style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4 }}
            />
          ))}
        </div>
      </section>
    );
  };

  // 4. Projects Renderer
  const renderProjectsSection = (inSidebar: boolean) => {
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

  // 5. Summary / Profile Renderer
  const renderSummarySection = (inSidebar: boolean) => {
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

  // 6. Experience Renderer
  const renderExperienceSection = (inSidebar: boolean) => {
    if (!experience) return null;
    return (
      <section key="experience" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '8px' }}>
          <EditableText
            tagName={inSidebar ? 'h3' : 'h2'}
            value={experience.title || labels.experience}
            onSave={(newTitle) => liveEdit?.updateSectionTitle('experience', newTitle)}
            placeholder={labels.experience}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: inSidebar ? '9px' : '12px' }}>
          {experience.items.map((exp, expIdx) => (
            <div key={expIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div>
                  <EditableText
                    tagName="span"
                    value={exp.role || 'Poste'}
                    onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'role', val)}
                    style={{ fontWeight: 800, color: '#0f172a', fontSize: inSidebar ? '11px' : '12px' }}
                  />
                  <span style={{ color: '#94a3b8', margin: '0 5px' }}>|</span>
                  <EditableText
                    tagName="span"
                    value={exp.company}
                    onSave={(val) => liveEdit?.updateExperienceField('experience', expIdx, 'company', val)}
                    style={{ fontWeight: 700, color: 'var(--cv-primary, #0284c7)', fontSize: inSidebar ? '10.5px' : '11.5px' }}
                  />
                  {exp.location && (
                    <span style={{ color: '#64748b', fontSize: '10px', marginLeft: '5px' }}>
                      ({exp.location})
                    </span>
                  )}
                </div>
                {exp.date && (
                  <span style={{ fontSize: inSidebar ? '9.5px' : '10.5px', fontWeight: 700, color: '#64748b' }}>
                    {exp.date}
                  </span>
                )}
              </div>

              {exp.bullets && (
                <ul style={{ margin: '3px 0 0 0', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {exp.bullets.map((bullet, bIdx) => {
                    const isDisabled = Boolean(exp.disabledBullets?.includes(bIdx));
                    return (
                      <BulletItemRow
                        key={bIdx}
                        bullet={bullet}
                        isDisabled={isDisabled}
                        isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
                        onToggle={() => liveEdit?.toggleBulletVisibility('experience', expIdx, bIdx)}
                        onSave={(val) => liveEdit?.updateExperienceBullet('experience', expIdx, bIdx, val)}
                        aiConfig={{
                          type: 'bullet',
                          fieldKey: `swiss-exp-${expIdx}-bullet-${bIdx}`,
                          sectionType: 'experience',
                          itemIndex: expIdx,
                          bulletIndex: bIdx,
                          company: exp.company,
                          role: exp.role,
                        }}
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

  // 7. References Renderer
  const renderReferencesSection = (inSidebar: boolean) => {
    if (!header.references) return null;
    return (
      <section
        key="references"
        style={{
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: inSidebar ? '10px' : '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--cv-primary, #0284c7)',
            }}
          >
            {labels.references} :
          </span>
          <span style={{ fontSize: inSidebar ? '10px' : '11px', color: '#64748b', fontStyle: 'italic' }}>
            <EditableText
              tagName="span"
              value={header.references}
              onSave={(val) => liveEdit?.updatePersonalDetail('references', val)}
            />
          </span>
        </div>
      </section>
    );
  };

  // Dispatcher for modular sections
  const renderSectionById = (id: string, inSidebar: boolean) => {
    switch (id) {
      case 'summary':
        return renderSummarySection(inSidebar);
      case 'experience':
        return renderExperienceSection(inSidebar);
      case 'projects':
        return renderProjectsSection(inSidebar);
      case 'languages':
        return renderLanguagesSection(inSidebar);
      case 'skills':
        return renderSkillsSection(inSidebar);
      case 'education':
        return renderEducationSection(inSidebar);
      case 'references':
        return renderReferencesSection(inSidebar);
      default: {
        const gen = genericSections.find((g) => g.id === id);
        if (gen) {
          return (
            <section key={gen.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: inSidebar ? '1.5px solid #e2e8f0' : '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                <EditableText
                  tagName={inSidebar ? 'h3' : 'h2'}
                  value={gen.title}
                  onSave={(newTitle) => liveEdit?.updateSectionTitle(gen.id, newTitle)}
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
                style={{ fontSize: inSidebar ? '10.5px' : '11px', color: '#334155', lineHeight: 1.45 }}
                dangerouslySetInnerHTML={{ __html: safeMarkdown(gen.rawContent) }}
              />
            </section>
          );
        }
        return null;
      }
    }
  };

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
      {/* 1. LEFT SIDEBAR: Photo, Contact, Swiss Legal Status, and modular dynamic sections */}
      <aside
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverAside(true);
        }}
        onDragLeave={() => setIsDragOverAside(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverAside(false);
          const sectionId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('cv-section-id');
          if (sectionId) {
            liveEdit?.reorderSection(sectionId, 'sidebar');
          }
        }}
        style={{
          width: 'var(--cv-sidebar-width, 34%)',
          backgroundColor: isDragOverAside ? 'rgba(2, 132, 199, 0.05)' : '#f8fafc',
          outline: isDragOverAside ? '2px dashed var(--cv-primary, #0284c7)' : 'none',
          outlineOffset: '-4px',
          borderRight: '1px solid #e2e8f0',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          flexShrink: 0,
          transition: 'background-color 0.2s ease, outline 0.2s ease',
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

        {/* Dynamic Reorderable Sections in Sidebar */}
        {activeSidebarIds.map((id, sIdx) => {
          const content = renderSectionById(id, true);
          if (!content) return null;
          return (
            <DraggableSectionBlock
              key={id}
              sectionId={id}
              column="sidebar"
              index={sIdx}
              isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
              onReorder={(src, col, idx) => liveEdit?.reorderSection(src, col, idx)}
            >
              {content}
            </DraggableSectionBlock>
          );
        })}
      </aside>

      {/* 2. MAIN BODY: Name, Title, and modular dynamic sections */}
      <main
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverMain(true);
        }}
        onDragLeave={() => setIsDragOverMain(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverMain(false);
          const sectionId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('cv-section-id');
          if (sectionId) {
            liveEdit?.reorderSection(sectionId, 'main');
          }
        }}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: isDragOverMain ? 'rgba(2, 132, 199, 0.03)' : '#ffffff',
          outline: isDragOverMain ? '2px dashed var(--cv-primary, #0284c7)' : 'none',
          outlineOffset: '-4px',
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxSizing: 'border-box',
          transition: 'background-color 0.2s ease, outline 0.2s ease',
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

        {/* Dynamic Reorderable Sections in Main */}
        {activeMainIds.map((id, mIdx) => {
          const content = renderSectionById(id, false);
          if (!content) return null;
          return (
            <DraggableSectionBlock
              key={id}
              sectionId={id}
              column="main"
              index={mIdx}
              isLiveEditing={Boolean(liveEdit?.isLiveEditing)}
              onReorder={(src, col, idx) => liveEdit?.reorderSection(src, col, idx)}
            >
              {content}
            </DraggableSectionBlock>
          );
        })}
      </main>
    </div>
  );
};
