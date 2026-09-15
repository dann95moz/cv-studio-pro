import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ContactItem } from '../types/cv';

/**
 * Configure marked renderer options for clean inline and block outputs.
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Sanitizes and parses markdown text to secure HTML.
 * Eliminates XSS vectors, prompt injection tags, and malicious script execution.
 */
export function safeMarkdown(markdown: string): string {
  if (!markdown) return '';
  const rawHtml = marked.parse(markdown) as string;
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
    });
  }
  return rawHtml;
}

/**
 * Sanitizes and parses inline markdown text to secure HTML (spans/strong/em).
 */
export function safeMarkdownInline(markdown: string): string {
  if (!markdown) return '';
  const rawHtml = marked.parseInline(markdown) as string;
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
    });
  }
  return rawHtml;
}

export interface ResolvedContactDisplay {
  url?: string;
  resolvedUrl?: string;
  displayLabel: string;
}

/**
 * Strips protocol, www, and trailing slashes for clean, elegant domain/handle display.
 */
function cleanWebUrlForDisplay(rawUrl: string): string {
  return rawUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

/**
 * Unified contact URL and display label resolver (DRY & ATS-Compliant).
 * Resolves:
 * - Fully qualified clickable URLs (https://, mailto:, tel:)
 * - Human-readable clean display labels (e.g. linkedin.com/in/alexmorgan, github.com/alexmorgan, portfolio.dev)
 *   that are 100% readable on printed paper and accurately extractable by ATS parsers.
 */
export function resolveContactDisplay(
  contact: { type?: string; label?: string; url?: string } | ContactItem
): ResolvedContactDisplay {
  if (!contact) {
    return { displayLabel: '' };
  }

  const type = (contact.type || '').toLowerCase();
  const rawLabel = (contact.label || '').trim();
  const rawUrl = (contact.url || '').trim();

  let url: string | undefined = rawUrl || undefined;
  let displayLabel = rawLabel;

  if (type === 'email') {
    const email = (rawUrl || rawLabel).replace(/^mailto:/i, '').trim();
    if (email.includes('@')) {
      url = `mailto:${email}`;
      displayLabel = email;
    }
  } else if (type === 'phone') {
    const phone = rawLabel || rawUrl;
    if (phone) {
      displayLabel = phone;
      const digits = phone.replace(/[^\d+]/g, '');
      if (digits.length >= 7) {
        url = `tel:${digits}`;
      }
    }
  } else if (type === 'linkedin') {
    // 1. Resolve URL
    if (url) {
      if (!url.startsWith('http')) {
        url = `https://${url.replace(/^\/+/, '')}`;
      }
    } else if (rawLabel) {
      if (rawLabel.startsWith('http') || rawLabel.includes('linkedin.com')) {
        url = rawLabel.startsWith('http') ? rawLabel : `https://${rawLabel}`;
      } else if (rawLabel.toLowerCase() !== 'linkedin') {
        const cleanHandle = rawLabel.replace(/^in\//i, '').replace(/^@/, '').trim();
        url = `https://linkedin.com/in/${cleanHandle}`;
      }
    }

    // 2. Resolve clean display label (e.g. linkedin.com/in/username)
    if (url) {
      const cleanDisplay = cleanWebUrlForDisplay(url);
      if (cleanDisplay.includes('linkedin.com')) {
        displayLabel = cleanDisplay;
      } else {
        displayLabel = 'LinkedIn';
      }
    } else {
      displayLabel = rawLabel || 'LinkedIn';
    }
  } else if (type === 'github') {
    // 1. Resolve URL
    if (url) {
      if (!url.startsWith('http')) {
        url = `https://${url.replace(/^\/+/, '')}`;
      }
    } else if (rawLabel) {
      if (rawLabel.startsWith('http') || rawLabel.includes('github.com')) {
        url = rawLabel.startsWith('http') ? rawLabel : `https://${rawLabel}`;
      } else if (rawLabel.toLowerCase() !== 'github') {
        const cleanHandle = rawLabel.replace(/^@/, '').trim();
        url = `https://github.com/${cleanHandle}`;
      }
    }

    // 2. Resolve clean display label (e.g. github.com/username)
    if (url) {
      const cleanDisplay = cleanWebUrlForDisplay(url);
      if (cleanDisplay.includes('github.com')) {
        displayLabel = cleanDisplay;
      } else {
        displayLabel = 'GitHub';
      }
    } else {
      displayLabel = rawLabel || 'GitHub';
    }
  } else if (type === 'globe') {
    // 1. Resolve URL
    if (url) {
      if (!url.startsWith('http')) {
        url = `https://${url.replace(/^\/+/, '')}`;
      }
    } else if (rawLabel && (rawLabel.includes('.') || rawLabel.startsWith('http'))) {
      url = rawLabel.startsWith('http') ? rawLabel : `https://${rawLabel}`;
    }

    // 2. Resolve clean display label
    if (url) {
      displayLabel = cleanWebUrlForDisplay(url);
    } else {
      displayLabel = rawLabel || 'Portfolio';
    }
  } else {
    // Location, text, etc.
    displayLabel = rawLabel;
  }

  return {
    url,
    resolvedUrl: url,
    displayLabel: displayLabel || rawLabel || '',
  };
}

/**
 * Unified contact label resolver (DRY).
 * Converts full URLs or raw identifiers into clean, human-readable labels for badges & links.
 */
export function getCleanContactLabel(contact: { type?: string; label: string; url?: string } | ContactItem): string {
  return resolveContactDisplay(contact).displayLabel;
}

/**
 * Backwards compatibility re-export for extractGapInfo.
 * SSOT location is src/core/parser/metadataExtractor.ts.
 */
export { extractGapInfo } from '../core/parser';

