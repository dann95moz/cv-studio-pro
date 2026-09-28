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
  const hidden = new Set(header.hiddenDetails || []);
  const showNationality = !hidden.has('nationality');
  const showOrigin = !hidden.has('placeOfOrigin');
  const showWorkPermit = !hidden.has('workPermit');
  const showAvailability = !hidden.has('availability');
  const showCivilStatus = !hidden.has('civilStatus');
  const showBirthDate = !hidden.has('dateOfBirth');
  const showDrivingLicense = !hidden.has('drivingLicense');

  const rawNat = (header.nationality || '').replace(/[*_]/g, '').trim();
  const rawPermit = (header.workPermit || '').replace(/[*_]/g, '').trim();

  // 1. Resolve place of origin: prefer first-class placeOfOrigin property, fallback to regex
  const originRegex = /(?:Originaire\s+de|Lieu\s+d['’]origine|Heimatort|Place\s+of\s+origin|Lugar\s+de\s+origen)\s*[:\s]*([a-zA-ZÀ-ÿ\s()–-]+(?:\([A-Z]{2}\))?)/i;
  const legacyOriginMatch = rawNat.match(originRegex) || rawPermit.match(originRegex);
  let origin = (header.placeOfOrigin || '').trim();
  if (!origin && legacyOriginMatch) {
    origin = legacyOriginMatch[0].trim();
  }

  // Extract Swiss canton origin if enclosed in parentheses (e.g. "(Frutigen BE)" or "(Frutigen - BE)")
  const swissCantonOriginRegex = /\(([A-Za-zÀ-ÿ\s–-]+?(?:[,\s–-]+[A-Z]{2}|\([A-Z]{2}\)))\)/i;
  const cantonMatch = rawNat.match(swissCantonOriginRegex) || rawPermit.match(swissCantonOriginRegex);
  if (!origin && cantonMatch) {
    const cantonClean = cantonMatch[1].trim().replace(/[,\s–-]+([A-Z]{2})$/, ' ($1)');
    origin = `Originaire de ${cantonClean}`;
  }

  // 2. Clean nationality string: unconditionally strip origin, canton, and availability if bundled in rawNat
  let cleanNat = rawNat;
  if (legacyOriginMatch && cleanNat.includes(legacyOriginMatch[0])) {
    cleanNat = cleanNat.replace(legacyOriginMatch[0], '').trim();
  }
  if (cantonMatch && cleanNat.includes(cantonMatch[0])) {
    cleanNat = cleanNat.replace(cantonMatch[0], '').trim();
  }
  if (origin && cleanNat.includes(origin)) {
    cleanNat = cleanNat.replace(origin, '').trim();
  }

  // 3. Resolve availability: ALWAYS strip availability from cleanNat so it never leaks into nationality badge
  const availRegex = /[•·|,]?\s*(?:Disponibilit[ée]|Availability|Verf[üu]gbarkeit|Disponibilidad)\s*[:：]?\s*([^•·\n]+)/i;
  const legacyAvailMatch = cleanNat.match(availRegex) || rawPermit.match(availRegex);
  let legacyAvailability = '';
  if (legacyAvailMatch) {
    legacyAvailability = legacyAvailMatch[1].trim();
    cleanNat = cleanNat.replace(legacyAvailMatch[0], '').trim();
  }

  cleanNat = cleanNat.replace(/[•·/–—,\s]+$/, '').replace(/^[•·/–—,\s]+/, '').trim();

  const isSwissCitizen =
    /(suisse|swiss|schweiz|svizzera)/i.test(cleanNat) ||
    Boolean(origin) ||
    /(suisse|swiss|schweiz|svizzera|citoyen|citizen)/i.test(rawPermit);

  const noPermitNeeded =
    isSwissCitizen ||
    /(aucun permis|no permit|sans permis|permis non requis|don['’]?t require|not require|keine bewilligung|sin permiso|nessun permesso)/i.test(cleanNat) ||
    /(aucun permis|no permit|sans permis|permis non requis|don['’]?t require|not require|keine bewilligung|sin permiso|nessun permesso)/i.test(rawPermit);

  const isNationalityPrimary = Boolean(cleanNat && (noPermitNeeded || !header.workPermit));

  // Determine dynamic display for Swiss / dual citizens or candidates requiring no work permit
  let displayNationality = cleanNat;
  const alreadyMentionsNoPermit = /(aucun permis|no permit|sans permis|permis non requis|keine bewilligung|sin permiso|nessun permesso)/i.test(cleanNat);
  if (cleanNat && noPermitNeeded && !alreadyMentionsNoPermit) {
    displayNationality = `${cleanNat}, ${labels.noPermitRequired}`;
  }

  // Clean availability: strip modality clutter like "Remote / Hybrid / On-site"
  let cleanAvailability = (header.availability || legacyAvailability || '').replace(/[*_]/g, '').trim();
  if (cleanAvailability.includes('|')) {
    cleanAvailability = cleanAvailability.split('|')[0].trim();
  }
  if (/^(immediate|inmediata|immediata|sofort|immédiate)$/i.test(cleanAvailability)) {
    cleanAvailability = labels.immediate;
  }

  // Check if work permit is redundant with citizenship
  const isPermitRedundant = isSwissCitizen && /(citoyen|citizen|suisse|swiss|don['’]?t require|aucun permis|no permit)/i.test(rawPermit);

  const hasVisibleDetails =
    (showNationality && isNationalityPrimary) ||
    (showWorkPermit && header.workPermit) ||
    (showOrigin && origin) ||
    (showAvailability && cleanAvailability) ||
    (showCivilStatus && header.civilStatus) ||
    (showBirthDate && header.dateOfBirth) ||
    (showDrivingLicense && header.drivingLicense);

  if (!hasVisibleDetails) {
    return null;
  }

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
        {showNationality && isNationalityPrimary && (
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

        {showWorkPermit && !isNationalityPrimary && header.workPermit && (
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
        {showOrigin && origin && (
          <div>
            <span style={{ fontWeight: 700, color: '#334155' }}>
              <EditableText
                tagName="span"
                value={origin}
                onSave={(val) => liveEdit?.updatePersonalDetail('placeOfOrigin', val)}
              />
            </span>
          </div>
        )}

        {/* Secondary: Work Permit if Nationality was primary and permit is genuinely distinct */}
        {showWorkPermit && isNationalityPrimary && header.workPermit && !isPermitRedundant && (
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
        {showNationality && !isNationalityPrimary && cleanNat && (
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
        {showAvailability && cleanAvailability && (
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
        {showCivilStatus && header.civilStatus && (
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
        {showBirthDate && header.dateOfBirth && (
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
        {showDrivingLicense && header.drivingLicense && (
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
