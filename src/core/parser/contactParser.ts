import { ContactItem, ContactType } from '../../types/cv';
import { cleanHumanText } from './metadataExtractor';
import { cleanTrackingAndSearchUrl } from '../../utils/sanitize';

/**
 * Detects contact type from text or URL.
 */
export function inferContactType(text: string, url?: string): ContactType {
  const combined = `${text} ${url || ''}`.toLowerCase();
  if (combined.includes('@')) return 'email';
  if (combined.includes('linkedin.com') || combined.includes('/in/')) return 'linkedin';
  if (combined.includes('github.com')) return 'github';
  if (
    combined.includes('http://') ||
    combined.includes('https://') ||
    combined.includes('www.') ||
    combined.includes('.dev') ||
    combined.includes('.io') ||
    combined.includes('.me')
  ) {
    return 'globe';
  }
  if (/^[\s+0-9().-]{7,}$/.test(text.trim())) return 'phone';
  return 'location';
}

/**
 * Normalizes contact URL ensuring protocol prefixes and tracking removal.
 */
export function normalizeContactUrl(type: ContactType, val: string, existingUrl?: string): string | undefined {
  const rawU = existingUrl?.trim() || '';
  if (rawU) {
    let u = cleanTrackingAndSearchUrl(rawU);
    if (type === 'email' && !u.startsWith('mailto:')) return `mailto:${u}`;
    if ((type === 'linkedin' || type === 'github' || type === 'globe') && !u.startsWith('http')) return `https://${u}`;
    return u;
  }
  const clean = cleanTrackingAndSearchUrl(val.trim());
  if (!clean) return undefined;
  if (type === 'email') return `mailto:${clean.replace(/^mailto:/i, '')}`;
  if (type === 'phone') return `tel:${clean.replace(/[^\d+]/g, '')}`;
  if (type === 'linkedin' || type === 'github' || type === 'globe') {
    return clean.startsWith('http') ? clean : `https://${clean}`;
  }
  return undefined;
}

/**
 * Heuristically checks if a line in markdown represents candidate contact information.
 */
export function isLikelyContactLine(line: string): boolean {
  if (line.includes('@')) return true;
  if (/https?:\/\/|www\.|linkedin\.com|github\.com/i.test(line)) return true;
  if (/(?:\+|tel[ée]fono|phone|celular|mobile)[\s:]*[0-9]/i.test(line)) return true;
  if (/^(?:[-*•]\s*)?\*{0,2}(?:Email|Correo|Tel[ée]fono|Phone|Mobile|Celular|Ubicaci[oó]n|Location|City|Ciudad|LinkedIn|GitHub|Portfolio|Web)/i.test(line)) return true;
  if (/[•|·]/.test(line)) {
    return /@|https?:\/\/|www\.|linkedin|github|\+?\d{2,}/i.test(line);
  }
  return false;
}

/**
 * Parses raw contacts line (e.g. "San Francisco, CA • [alex@example.com](mailto:...) • +1 415 555 0192 • [LinkedIn](...)")
 */
export function parseContactsLine(line: string): ContactItem[] {
  const items = line.split(/[•|·]/).map((item) => item.trim()).filter(Boolean);
  const contacts: ContactItem[] = [];

  for (const item of items) {
    const linkMatch = item.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const rawLabel = cleanHumanText(linkMatch[1]);
      let rawUrl = cleanTrackingAndSearchUrl(linkMatch[2].trim());
      const type = inferContactType(rawLabel, rawUrl);
      if (type === 'email' && !rawUrl.startsWith('mailto:')) {
        rawUrl = `mailto:${rawUrl}`;
      } else if ((type === 'linkedin' || type === 'github' || type === 'globe') && !rawUrl.startsWith('http')) {
        rawUrl = `https://${rawUrl}`;
      }
      contacts.push({
        type,
        label: rawLabel,
        url: rawUrl,
      });
    } else {
      let clean = cleanTrackingAndSearchUrl(item.replace(/^[–\-*]\s*/, '').trim());
      // Handle key-value prefixes e.g. "**Email:** user@example.com" or "Email: user@example.com"
      const kvMatch = clean.match(/^\*{0,2}(Email|E-mail|Correo|Tel[ée]fono|Phone|Mobile|Celular|Ubicaci[oó]n|Location|City|Ciudad|LinkedIn|GitHub|Portfolio|Web)\*{0,2}[:\s]+(.+)$/i);
      let detectedType: ContactType | undefined;
      if (kvMatch) {
        const key = kvMatch[1].toLowerCase();
        clean = kvMatch[2].replace(/[*_`]/g, '').trim();
        if (key.includes('email') || key.includes('correo')) detectedType = 'email';
        else if (key.includes('tel') || key.includes('phone') || key.includes('mobile') || key.includes('celular')) detectedType = 'phone';
        else if (key.includes('ubic') || key.includes('loc') || key.includes('city') || key.includes('ciudad')) detectedType = 'location';
        else if (key.includes('linkedin')) detectedType = 'linkedin';
        else if (key.includes('github')) detectedType = 'github';
        else if (key.includes('port') || key.includes('web')) detectedType = 'globe';
      }
      if (clean) {
        const type = detectedType || inferContactType(clean);
        const url = normalizeContactUrl(type, clean);
        contacts.push({
          type,
          label: clean,
          url,
        });
      }
    }
  }

  return contacts;
}
