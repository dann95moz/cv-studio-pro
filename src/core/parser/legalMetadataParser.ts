import { cleanHumanText } from './metadataExtractor';
import { extractAndStripEmbeddedAvailability, sanitizeLegalMetadata, cleanPlaceOfOrigin } from './cvSanitizers';

export interface LegalMetadataResult {
  workPermit?: string;
  nationality?: string;
  placeOfOrigin?: string;
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

  // 1. Driving license MUST precede generic work permit to avoid 'Permis de conduire' matching 'Permis'
  const driveMatch = cleanMeta.match(
    /^\*{0,2}(?:Permis\s+de\s+conduire|Driving\s+licen[cs]e|F[üu]hrerschein|Permiso\s+de\s+conducir|Patente(?:\s+di\s+guida)?)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (driveMatch) {
    return { key: 'drivingLicense', value: cleanHumanText(driveMatch[1]) };
  }

  // 2. Work permit (excluding driving license)
  const permitMatch = cleanMeta.match(
    /^\*{0,2}(?:Permis(?!\s+de\s+conduire)(?:\s+de\s+travail|\s+de\s+s[ée]jour)?|Work\s+Permit|Aufenthaltsbewilligung|Permiso\s+de\s+trabajo|Permesso(?:\s+di\s+soggiorno|\s+di\s+lavoro)?)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (permitMatch) {
    const rawVal = cleanHumanText(permitMatch[1]);
    const { cleaned } = extractAndStripEmbeddedAvailability(rawVal);
    return { key: 'workPermit', value: cleaned || rawVal };
  }

  // 3. Nationality
  const natMatch = cleanMeta.match(
    /^\*{0,2}(?:Nationalit[ée]|Nationality|Nationalit[äa]t|Nacionalidad|Nazionalit[àa])\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (natMatch) {
    return { key: 'nationality', value: cleanHumanText(natMatch[1]) };
  }

  // 4. Place of origin
  const originMatch = cleanMeta.match(
    /^\*{0,2}(?:place\s+of\s+origin|lieu\s+d['’]origine|originaire\s+de|lugar\s+de\s+origen|luogo\s+d['’]origine|heimatort|origin|origine|origen)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (originMatch) {
    return { key: 'placeOfOrigin', value: cleanPlaceOfOrigin(originMatch[1]) };
  }

  // 5. Date of birth
  const dobMatch = cleanMeta.match(
    /^\*{0,2}(?:Date\s+de\s+naissance|Date\s+of\s+birth|Geburtsdatum|Fecha\s+de\s+nacimiento|Data\s+di\s+nascita|Birth\s*date|Date\s+de\s+nacimiento|N[ée]\(e\)\s+le)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (dobMatch) {
    return { key: 'dateOfBirth', value: cleanHumanText(dobMatch[1]) };
  }

  // 6. Availability
  const availMatch = cleanMeta.match(
    /^\*{0,2}(?:Disponibilit[ée]|Availability|D[ée]lai\s+de\s+cong[ée]|K[üu]ndigungsfrist|Disponibilidad|Disponibilit[àa])\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (availMatch) {
    return { key: 'availability', value: cleanHumanText(availMatch[1]) };
  }

  // 7. Civil status (non-capturing group for labels so civilMatch[1] captures value)
  const civilMatch = cleanMeta.match(
    /^\*{0,2}(?:[ÉEe]tat\s+civil|Civil\s+status|Zivilstand|Estado\s+civil|Stato\s+civile)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (civilMatch) {
    return { key: 'civilStatus', value: cleanHumanText(civilMatch[1]) };
  }

  // 8. References
  const refMatch = cleanMeta.match(
    /^\*{0,2}(?:R[ée]f[ée]rences?|References?|Referenzen|Referencias|Referenze)\*{0,2}[:\s]+([^•·|\n]+)$/i
  );
  if (refMatch) {
    return { key: 'references', value: cleanHumanText(refMatch[1]) };
  }

  return null;
}

/**
 * Robustly parses all legal and personal metadata items from a line,
 * supporting multi-token lines joined with •, ·, or |.
 */
export function parseAllLegalMetadata(line: string): LegalMetadataResult {
  const result: LegalMetadataResult = {};
  if (!line || !line.trim()) return result;

  // Split by bullet / pipe / middle dot dividers
  const segments = line
    .split(/\s+[•·|]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    const single = parseLegalMetadata(seg);
    if (single) {
      if (single.key === 'nationality' && result.nationality) {
        result.nationality = `${result.nationality} • ${single.value}`;
      } else {
        result[single.key] = single.value;
      }
    }
  }

  if (Object.keys(result).length === 0) {
    return {};
  }

  const sanitized = sanitizeLegalMetadata(result) as LegalMetadataResult;
  const cleanedResult: LegalMetadataResult = {};
  for (const [k, v] of Object.entries(sanitized)) {
    if (v !== undefined && v !== null && String(v).trim()) {
      cleanedResult[k as keyof LegalMetadataResult] = String(v).trim();
    }
  }
  return cleanedResult;
}
