import { cleanHumanText } from './metadataExtractor';

export interface LegalMetadataResult {
  workPermit?: string;
  nationality?: string;
  dateOfBirth?: string;
  drivingLicense?: string;
  availability?: string;
  civilStatus?: string;
  references?: string;
}

/**
 * Parses European & Swiss personal and legal metadata lines from preamble or markdown text.
 * Matches multi-lingual variants (EN, ES, DE, FR, IT).
 */
export function parseLegalMetadata(pLine: string): { key: keyof LegalMetadataResult; value: string } | null {
  const cleanMeta = pLine.replace(/^[–\-*•·]\s*/, '').trim();

  const permitMatch = cleanMeta.match(
    /^\*{0,2}(?:Permis(?:\s+de\s+travail|\s+de\s+s[ée]jour)?|Work\s+Permit|Aufenthaltsbewilligung|Permiso\s+de\s+trabajo)\*{0,2}[:\s]+(.+)$/i
  );
  if (permitMatch) {
    return { key: 'workPermit', value: cleanHumanText(permitMatch[1]) };
  }

  const natMatch = cleanMeta.match(
    /^\*{0,2}(?:Nationalit[ée]|Nationality|Nationalit[äa]t|Nacionalidad|Nazionalit[àa])\*{0,2}[:\s]+(.+)$/i
  );
  if (natMatch) {
    return { key: 'nationality', value: cleanHumanText(natMatch[1]) };
  }

  const dobMatch = cleanMeta.match(
    /^\*{0,2}(?:Date\s+de\s+naissance|Date\s+of\s+birth|Geburtsdatum|Fecha\s+de\s+nacimiento|Data\s+di\s+nascita|Birth\s*date|N[ée]\(e\)\s+le)\*{0,2}[:\s]+(.+)$/i
  );
  if (dobMatch) {
    return { key: 'dateOfBirth', value: cleanHumanText(dobMatch[1]) };
  }

  const driveMatch = cleanMeta.match(
    /^\*{0,2}(?:Permis\s+de\s+conduire|Driving\s+licen[cs]e|F[üu]hrerschein|Permiso\s+de\s+conducir|Patente)\*{0,2}[:\s]+(.+)$/i
  );
  if (driveMatch) {
    return { key: 'drivingLicense', value: cleanHumanText(driveMatch[1]) };
  }

  const availMatch = cleanMeta.match(
    /^\*{0,2}(?:Disponibilit[ée]|Availability|D[ée]lai\s+de\s+cong[ée]|K[üu]ndigungsfrist|Disponibilidad|Disponibilit[àa])\*{0,2}[:\s]+(.+)$/i
  );
  if (availMatch) {
    return { key: 'availability', value: cleanHumanText(availMatch[1]) };
  }

  const civilMatch = cleanMeta.match(
    /^\*{0,2}([ÉEe]tat\s+civil|Civil\s+status|Zivilstand|Estado\s+civil|Stato\s+civile)\*{0,2}[:\s]+(.+)$/i
  );
  if (civilMatch) {
    return { key: 'civilStatus', value: cleanHumanText(civilMatch[1]) };
  }

  const refMatch = cleanMeta.match(
    /^\*{0,2}(?:R[ée]f[ée]rences?|References?|Referenzen|Referencias)\*{0,2}[:\s]+(.+)$/i
  );
  if (refMatch) {
    return { key: 'references', value: cleanHumanText(refMatch[1]) };
  }

  return null;
}
