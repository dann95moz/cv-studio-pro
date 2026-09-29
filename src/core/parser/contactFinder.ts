import { ContactItem, CVData, CvTranslationVariant, GeneratedCvVersion } from '../../types/cv';
import { SupportedLanguage } from '../../constants/languages';
import { parseMarkdownToCvData } from './markdownToCvData';
import { isLikelyContactLine, parseContactsLine } from './contactParser';

/**
 * Normalizes and localizes location contact strings across supported languages.
 */
export function localizeContactItem(item: ContactItem, targetLang: SupportedLanguage): ContactItem {
  if (item.type !== 'location' || !item.label) return item;
  let label = item.label;

  if (targetLang === 'en') {
    label = label
      .replace(/\bSuisse\b/gi, 'Switzerland')
      .replace(/\bSuiza\b/gi, 'Switzerland')
      .replace(/\bSchweiz\b/gi, 'Switzerland')
      .replace(/\bSvizzera\b/gi, 'Switzerland')
      .replace(/\bGenève\b/gi, 'Geneva')
      .replace(/\bGinebra\b/gi, 'Geneva')
      .replace(/\bGenf\b/gi, 'Geneva')
      .replace(/\bGinevra\b/gi, 'Geneva')
      .replace(/\bColombie\b/gi, 'Colombia')
      .replace(/\bKolumbien\b/gi, 'Colombia')
      .replace(/\bÉtats-Unis\b/gi, 'United States')
      .replace(/\bEstados Unidos\b/gi, 'United States')
      .replace(/\bEspagne\b/gi, 'Spain')
      .replace(/\bEspaña\b/gi, 'Spain')
      .replace(/\bSpanien\b/gi, 'Spain')
      .replace(/\bSpagna\b/gi, 'Spain')
      .replace(/\bAllemagne\b/gi, 'Germany')
      .replace(/\bAlemania\b/gi, 'Germany')
      .replace(/\bDeutschland\b/gi, 'Germany')
      .replace(/\bGermania\b/gi, 'Germany');
  } else if (targetLang === 'fr') {
    label = label
      .replace(/\bSwitzerland\b/gi, 'Suisse')
      .replace(/\bSuiza\b/gi, 'Suisse')
      .replace(/\bSchweiz\b/gi, 'Suisse')
      .replace(/\bSvizzera\b/gi, 'Suisse')
      .replace(/\bGeneva\b/gi, 'Genève')
      .replace(/\bGinebra\b/gi, 'Genève')
      .replace(/\bGenf\b/gi, 'Genève')
      .replace(/\bGinevra\b/gi, 'Genève')
      .replace(/\bColombia\b/gi, 'Colombie')
      .replace(/\bKolumbien\b/gi, 'Colombie');
  } else if (targetLang === 'es') {
    label = label
      .replace(/\bSwitzerland\b/gi, 'Suiza')
      .replace(/\bSuisse\b/gi, 'Suiza')
      .replace(/\bSchweiz\b/gi, 'Suiza')
      .replace(/\bSvizzera\b/gi, 'Suiza')
      .replace(/\bGeneva\b/gi, 'Ginebra')
      .replace(/\bGenève\b/gi, 'Ginebra')
      .replace(/\bGenf\b/gi, 'Ginebra')
      .replace(/\bGinevra\b/gi, 'Ginebra')
      .replace(/\bColombia\b/gi, 'Colombia')
      .replace(/\bColombie\b/gi, 'Colombia');
  } else if (targetLang === 'de') {
    label = label
      .replace(/\bSwitzerland\b/gi, 'Schweiz')
      .replace(/\bSuisse\b/gi, 'Schweiz')
      .replace(/\bSuiza\b/gi, 'Schweiz')
      .replace(/\bSvizzera\b/gi, 'Schweiz')
      .replace(/\bGeneva\b/gi, 'Genf')
      .replace(/\bGenève\b/gi, 'Genf')
      .replace(/\bGinebra\b/gi, 'Genf')
      .replace(/\bGinevra\b/gi, 'Genf');
  } else if (targetLang === 'it') {
    label = label
      .replace(/\bSwitzerland\b/gi, 'Svizzera')
      .replace(/\bSuisse\b/gi, 'Svizzera')
      .replace(/\bSuiza\b/gi, 'Svizzera')
      .replace(/\bSchweiz\b/gi, 'Svizzera')
      .replace(/\bGeneva\b/gi, 'Ginevra')
      .replace(/\bGenève\b/gi, 'Ginevra')
      .replace(/\bGinebra\b/gi, 'Ginevra')
      .replace(/\bGenf\b/gi, 'Ginevra');
  }

  return {
    ...item,
    label,
  };
}

/**
 * Extracts candidate contact items from full text using line analysis and regex fallbacks.
 */
export function extractContactsFromFullText(text: string): ContactItem[] {
  if (!text || !text.trim()) return [];
  const contacts: ContactItem[] = [];
  const lines = text.split('\n');

  // 1. Process structured lines (those containing delimiters | or • or starting with contact keyword)
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/[|•·]/.test(line) && isLikelyContactLine(line)) {
      const parsed = parseContactsLine(line);
      for (const item of parsed) {
        if (!contacts.some((c) => c.type === item.type && (c.label === item.label || c.url === item.url))) {
          if (!/^(?:nationality|nationalit[ée]|place\s+of\s+origin|lieu\s+d['’]origine|availability|disponibilit[ée]|work\s+permit|civil\s+status|date\s+of\s+birth)/i.test(item.label)) {
            contacts.push(item);
          }
        }
      }
    }
  }

  // 2. Clean regex extractions
  // Email
  if (!contacts.some((c) => c.type === 'email')) {
    const emailMatch = text.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
    if (emailMatch) {
      contacts.push({
        type: 'email',
        label: emailMatch[1],
        url: `mailto:${emailMatch[1]}`,
      });
    }
  }

  // Regex fallback: Phone
  if (!contacts.some((c) => c.type === 'phone')) {
    const phoneMatch = text.match(/(?:\+|tel[ée]fono|phone|celular|mobile)[\s:]*([+\s0-9().-]{8,22})/i);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].trim();
      contacts.push({
        type: 'phone',
        label: cleanPhone,
        url: `tel:${cleanPhone.replace(/[^\d+]/g, '')}`,
      });
    }
  }

  // Regex fallback: LinkedIn
  if (!contacts.some((c) => c.type === 'linkedin')) {
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
    if (linkedinMatch) {
      const fullUrl = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
      contacts.push({
        type: 'linkedin',
        label: 'LinkedIn',
        url: fullUrl,
      });
    }
  }

  // Regex fallback: GitHub
  if (!contacts.some((c) => c.type === 'github')) {
    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
    if (githubMatch) {
      const fullUrl = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
      contacts.push({
        type: 'github',
        label: 'GitHub',
        url: fullUrl,
      });
    }
  }

  return contacts;
}

export interface CandidateContactSources {
  activeCvData?: CVData | null;
  translations?: Record<string, CvTranslationVariant>;
  cvMarkdown?: string;
  masterData?: string;
  savedVersions?: GeneratedCvVersion[];
}

/**
 * Searches across all stores (translations, activeCvData, base cvMarkdown, masterData, savedVersions)
 * to gather candidate credentials and ensure they are never lost.
 */
export function findCandidateContacts(sources: CandidateContactSources): ContactItem[] {
  const pool: ContactItem[] = [];

  const addItems = (items?: ContactItem[]) => {
    if (!items || items.length === 0) return;
    for (const item of items) {
      if (!item.label && !item.url) continue;
      // Exclude legal metadata keywords that might have been accidentally parsed as contacts
      if (/^(?:nationality|nationalit[ée]|place\s+of\s+origin|lieu\s+d['’]origine|availability|disponibilit[ée]|work\s+permit|permis(?!\s+de\s+conduire)|civil\s+status|[ée]tat\s+civil|date\s+of\s+birth|date\s+de\s+naissance|references?|r[ée]f[ée]rences?)/i.test(item.label || '')) {
        continue;
      }
      if (!pool.some((p) => p.type === item.type && (p.label === item.label || (p.url && p.url === item.url)))) {
        pool.push(item);
      }
    }
  };

  // 1. Check activeCvData
  addItems(sources.activeCvData?.contacts);

  // 2. Check all translation variants (e.g. French, Spanish, German, Italian, English)
  if (sources.translations) {
    for (const variant of Object.values(sources.translations)) {
      addItems(variant?.cvData?.contacts);
      if (variant?.cvMarkdown) {
        try {
          addItems(parseMarkdownToCvData(variant.cvMarkdown).contacts);
        } catch {
          // ignore
        }
      }
    }
  }

  // 3. Check base cvMarkdown
  if (sources.cvMarkdown) {
    try {
      addItems(parseMarkdownToCvData(sources.cvMarkdown).contacts);
    } catch {
      // ignore
    }
  }

  // 4. Check masterData (preamble + full-text fallback)
  if (sources.masterData) {
    try {
      addItems(parseMarkdownToCvData(sources.masterData).contacts);
    } catch {
      // ignore
    }
    if (!pool.some((c) => c.type === 'email') || !pool.some((c) => c.type === 'phone')) {
      addItems(extractContactsFromFullText(sources.masterData));
    }
  }

  // 5. Check savedVersions
  if (sources.savedVersions) {
    for (const ver of sources.savedVersions) {
      addItems(ver.cvData?.contacts);
      if (ver.cvMarkdown) {
        try {
          addItems(parseMarkdownToCvData(ver.cvMarkdown).contacts);
        } catch {
          // ignore
        }
      }
    }
  }

  return pool;
}

/**
 * Enriches a contact list with candidate contacts from the pool.
 */
export function enrichContactList(
  currentContacts: ContactItem[] | undefined,
  pool: ContactItem[],
  targetLang: SupportedLanguage = 'en'
): ContactItem[] {
  const current = currentContacts && currentContacts.length > 0 ? [...currentContacts] : [];
  if (pool.length === 0) return current;

  if (current.length === 0) {
    return pool.map((c) => localizeContactItem(c, targetLang));
  }

  for (const poolItem of pool) {
    if (!current.some((c) => c.type === poolItem.type)) {
      current.push(localizeContactItem(poolItem, targetLang));
    }
  }

  return current;
}

/**
 * Injects candidate contacts into a markdown preamble if contacts are absent.
 */
export function injectContactsIntoMarkdownPreamble(markdown: string, contacts: ContactItem[]): string {
  if (!markdown || !contacts || contacts.length === 0) return markdown;

  // Check if markdown already has contacts
  try {
    const parsed = parseMarkdownToCvData(markdown);
    if (parsed.contacts && parsed.contacts.length > 0) return markdown;
  } catch {
    // continue
  }

  const contactParts = contacts
    .map((c) => {
      if (c.url && c.type !== 'location') {
        return `[${c.label || c.type}](${c.url})`;
      }
      return c.label;
    })
    .filter(Boolean);

  if (contactParts.length === 0) return markdown;
  const contactLine = contactParts.join(' | ');

  const lines = markdown.split('\n');
  let insertIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('## ')) {
      if (insertIndex === -1) insertIndex = i;
      break;
    }
    if (l.startsWith('# ') || l.startsWith('**') || /^[A-Za-z]/.test(l)) {
      insertIndex = i + 1;
    }
  }

  if (insertIndex > -1) {
    lines.splice(insertIndex, 0, contactLine);
    return lines.join('\n');
  }

  return `${contactLine}\n\n${markdown}`;
}
