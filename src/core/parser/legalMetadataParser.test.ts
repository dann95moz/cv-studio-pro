import { describe, it, expect } from 'vitest';
import {
  parseLegalMetadata,
  parseAllLegalMetadata,
} from './legalMetadataParser';

describe('legalMetadataParser', () => {
  it('returns empty object when line does not contain legal metadata', () => {
    const contactLine =
      'Geneva / Lausanne, Switzerland | danielcasw@gmail.com | +57 320 436 2076 | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/';
    const result = parseAllLegalMetadata(contactLine);

    expect(Object.keys(result)).toEqual([]);
    expect(result.nationality).toBeUndefined();
    expect(result.workPermit).toBeUndefined();
    expect(result.placeOfOrigin).toBeUndefined();
  });

  it('correctly parses multiple legal details joined with pipe (|) or bullets (•)', () => {
    const legalLine =
      'Nationality: Swiss / Colombian, no permit required | Place of Origin: Frutigen (BE) | Availability: since December 2026';
    const result = parseAllLegalMetadata(legalLine);

    expect(result.nationality).toBe('Swiss / Colombian, no permit required');
    expect(result.placeOfOrigin).toBe('Frutigen (BE)');
    expect(result.availability).toBe('since December 2026');
  });

  it('correctly cleans origin and avoids duplicate origin prefixes', () => {
    const res1 = parseLegalMetadata('Place of Origin: Origin: Frutigen (BE)');
    expect(res1?.key).toBe('placeOfOrigin');
    expect(res1?.value).toBe('Frutigen (BE)');

    const res2 = parseLegalMetadata("Lieu d'origine: Frutigen (BE)");
    expect(res2?.key).toBe('placeOfOrigin');
    expect(res2?.value).toBe('Frutigen (BE)');

    const res3 = parseLegalMetadata('Heimatort: Bern (BE)');
    expect(res3?.key).toBe('placeOfOrigin');
    expect(res3?.value).toBe('Bern (BE)');
  });

  it('disambiguates driving license from work permit', () => {
    const driveRes = parseLegalMetadata('Permis de conduire : Catégorie B');
    expect(driveRes?.key).toBe('drivingLicense');
    expect(driveRes?.value).toBe('Catégorie B');

    const permitRes = parseLegalMetadata('Permis de travail : B (activité lucrative)');
    expect(permitRes?.key).toBe('workPermit');
    expect(permitRes?.value).toBe('B (activité lucrative)');
  });
});
