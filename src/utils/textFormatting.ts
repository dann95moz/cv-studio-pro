/**
 * Bidirectional inline formatting utilities for CV text and live in-place editing.
 * Handles Markdown bold (**text**), italic (*text*), and keyword highlights (++text++).
 */

/**
 * Escapes HTML characters to prevent XSS while preparing text for inline rendering.
 */
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Converts Markdown inline formatting into safe HTML for contentEditable and preview rendering.
 * Supports:
 * - Bold: **text** or __text__ -> <strong>text</strong>
 * - Highlights: ++text++ -> <strong class="cv-highlight-keyword">text</strong>
 * - Italic: *text* or _text_ -> <em>text</em>
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let html = escapeHtml(markdown);

  // Restore safe studio diff tags (<mark class="cv-diff-(add|del)"> and <span class="cv-diff-(added|removed)-bullet">)
  html = html
    .replace(/&lt;mark class=&quot;(cv-diff-(?:add|del))&quot;&gt;/g, '<mark class="$1">')
    .replace(/&lt;\/mark&gt;/g, '</mark>')
    .replace(/&lt;span class=&quot;(cv-diff-(?:added|removed)-bullet)&quot;&gt;/g, '<span class="$1">')
    .replace(/&lt;\/span&gt;/g, '</span>');

  // 1. Keyword highlights: ++text++ -> <strong class="cv-highlight-keyword">$1</strong>
  html = html.replace(/\+\+([^\+\r\n]+?)\+\+/g, '<strong class="cv-highlight-keyword">$1</strong>');

  // 2. Bold: **text** or __text__ -> <strong>text</strong>
  html = html.replace(/\*\*([^\*\r\n]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_\r\n]+?)__/g, '<strong>$1</strong>');

  // 3. Italic: *text* or _text_ (excluding inside tags)
  html = html.replace(/(^|[^\*])\*([^\*\r\n]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
  html = html.replace(/(^|[^_])_([^_\r\n]+?)_([^_]|$)/g, '$1<em>$2</em>$3');

  // 4. Markdown links: [Label](url) -> <a href="url" target="_blank" rel="noopener noreferrer" class="cv-link">Label</a>
  html = html.replace(/\[([^\]\r\n]+?)\]\(((?:https?:\/\/|mailto:|\/|#)[^\)\s]+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="cv-link">$1</a>');

  return html;
};

export { htmlToMarkdown } from '../core/parser/htmlToMarkdown';
