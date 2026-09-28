import React from 'react';
import { CVTemplateProps } from '../types';
import { SwissLabels } from './swissLabels';
import { EditableText } from '../../components/studio/preview/EditableText';
import { useCvLiveEdit } from '../../components/studio/preview/CvLiveEditContext';

export interface SwissLegalStatusBlockProps {
  header: CVTemplateProps['slots']['header'];
  labels: SwissLabels;
  liveEdit: ReturnType<typeof useCvLiveEdit>;
}

export const SwissLegalStatusBlock: React.FC<SwissLegalStatusBlockProps> = ({
  header,
  labels,
  liveEdit,
}) => {
  const hasPersonalDetails = Boolean(
    header.workPermit ||
    header.nationality ||
    header.dateOfBirth ||
    header.drivingLicense ||
    header.availability ||
    header.civilStatus
  );

  if (!hasPersonalDetails) {
    return null;
  }

  // Determine if Nationality should be elevated to the primary top badge
  // (e.g. Swiss/dual citizens who require no permit, or when workPermit is empty)
  const isNationalityPrimary = Boolean(
    header.nationality && (
      !header.workPermit ||
      /(suisse|swiss|schweiz|svizzera|aucun permis|no permit|citoyen|sans permis|permis non requis|keine bewilligung)/i.test(header.nationality) ||
      /(aucun permis|no permit|sans permis|permis non requis|keine bewilligung)/i.test(header.workPermit || '')
    )
  );

  return (
    <section
      style={{
        backgroundColor: '#f1f5f9',
        borderRadius: '6px',
        padding: '10px 12px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '10.5px', color: '#334155' }}>
        {/* Primary Highlight Badge (Nationality or Work Permit) */}
        {isNationalityPrimary && header.nationality && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 800, color: 'var(--cv-primary, #0284c7)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.5px' }}>
              {labels.nationality}
            </span>
            <span
              style={{
                fontWeight: 800,
                backgroundColor: 'var(--cv-primary-light, #e0f2fe)',
                color: 'var(--cv-primary-dark, #0369a1)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: '10.5px',
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
              }}
            >
              <EditableText
                tagName="span"
                value={header.nationality}
                onSave={(val) => liveEdit?.updatePersonalDetail('nationality', val)}
              />
            </span>
          </div>
        )}

        {!isNationalityPrimary && header.workPermit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 800, color: 'var(--cv-primary, #0284c7)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.5px' }}>
              {labels.workPermit}
            </span>
            <span
              style={{
                fontWeight: 800,
                backgroundColor: 'var(--cv-primary-light, #e0f2fe)',
                color: 'var(--cv-primary-dark, #0369a1)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: '10.5px',
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
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

        {/* Secondary: Work Permit if Nationality was primary and permit has distinct info */}
        {isNationalityPrimary && header.workPermit && !header.nationality?.includes(header.workPermit) && !/(aucun permis|no permit)/i.test(header.workPermit) && (
          <div>
            <span style={{ fontWeight: 700, color: '#475569' }}>{labels.workPermit} : </span>
            <span style={{ fontWeight: 600 }}>
              <EditableText
                tagName="span"
                value={header.workPermit}
                onSave={(val) => liveEdit?.updatePersonalDetail('workPermit', val)}
              />
            </span>
          </div>
        )}

        {/* Secondary: Nationality if Work Permit was primary */}
        {!isNationalityPrimary && header.nationality && (
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
  );
};
