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

  const rawNat = (header.nationality || '').replace(/[*_]/g, '').trim();
  const rawPermit = (header.workPermit || '').replace(/[*_]/g, '').trim();

  // Extract place of origin if present in nationality or permit (e.g. "Originaire de Frutigen (BE)")
  const originRegex = /(?:Originaire\s+de|Lieu\s+d['’]origine|Heimatort)\s*[:\s]*([a-zA-ZÀ-ÿ\s()–-]+(?:\([A-Z]{2}\))?)/i;
  let origin = '';
  const originMatch = rawNat.match(originRegex) || rawPermit.match(originRegex);
  if (originMatch) {
    origin = originMatch[0].trim().replace(/^(?:Lieu\s+d['’]origine|Heimatort)\s*[:\s]*/i, 'Originaire de ');
  }

  // Clean nationality string without origin suffix/prefix
  let cleanNat = rawNat;
  if (originMatch && rawNat.includes(originMatch[0])) {
    cleanNat = cleanNat.replace(originMatch[0], '').replace(/[•·/–—,\s]+$/, '').replace(/^[•·/–—,\s]+/, '').trim();
  }

  const isSwissCitizen =
    /(suisse|swiss|schweiz|svizzera)/i.test(cleanNat) ||
    /(suisse|swiss|schweiz|svizzera|citoyen|citizen)/i.test(rawPermit);

  const noPermitNeeded =
    isSwissCitizen ||
    /(aucun permis|no permit|sans permis|permis non requis|don['’]?t require|not require|keine bewilligung)/i.test(cleanNat) ||
    /(aucun permis|no permit|sans permis|permis non requis|don['’]?t require|not require|keine bewilligung)/i.test(rawPermit);

  const isNationalityPrimary = Boolean(cleanNat && (noPermitNeeded || !header.workPermit));

  // Determine elegant display for Swiss / dual citizens
  let displayNationality = cleanNat;
  if (isSwissCitizen) {
    if (/(colomb|colombia|colombienne)/i.test(cleanNat)) {
      displayNationality = 'Suisse et colombienne, aucun permis requis';
    } else if (!/(aucun permis|no permit|sans permis|permis non requis)/i.test(displayNationality)) {
      displayNationality = `${displayNationality}, aucun permis requis`;
    }
  }

  // Clean availability: strip modality clutter like "Remote / Hybrid / On-site"
  let cleanAvailability = (header.availability || '').replace(/[*_]/g, '').trim();
  if (cleanAvailability.includes('|')) {
    cleanAvailability = cleanAvailability.split('|')[0].trim();
  }
  if (/^immediate$/i.test(cleanAvailability)) {
    cleanAvailability = 'immédiate';
  }

  // Check if work permit is redundant with citizenship
  const isPermitRedundant = isSwissCitizen && /(citoyen|citizen|suisse|swiss|don['’]?t require|aucun permis|no permit)/i.test(rawPermit);

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
        {isNationalityPrimary && (
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
                value={displayNationality}
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

        {/* Place of origin for Swiss citizens */}
        {origin && (
          <div>
            <span style={{ fontWeight: 700, color: '#334155' }}>
              <EditableText
                tagName="span"
                value={origin}
                onSave={(val) => liveEdit?.updatePersonalDetail('nationality', `${displayNationality} • ${val}`)}
              />
            </span>
          </div>
        )}

        {/* Secondary: Work Permit if Nationality was primary and permit is genuinely distinct */}
        {isNationalityPrimary && header.workPermit && !isPermitRedundant && (
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
        {!isNationalityPrimary && cleanNat && (
          <div>
            <span style={{ fontWeight: 700, color: '#475569' }}>{labels.nationality} : </span>
            <span style={{ fontWeight: 600 }}>
              <EditableText
                tagName="span"
                value={cleanNat}
                onSave={(val) => liveEdit?.updatePersonalDetail('nationality', val)}
              />
            </span>
          </div>
        )}

        {/* Disponibilité (Clean date/status without modality clutter) */}
        {cleanAvailability && (
          <div>
            <span style={{ fontWeight: 700, color: '#475569' }}>{labels.availability} : </span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              <EditableText
                tagName="span"
                value={cleanAvailability}
                onSave={(val) => liveEdit?.updatePersonalDetail('availability', val)}
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
