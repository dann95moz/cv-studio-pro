/**
 * Lightweight, zero-dependency HTML to inline Markdown converter.
 * Converts contentEditable browser HTML (b, i, mark, p, br) to clean inline Markdown
 * without requiring the turndown library.
 */
export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return '';

  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // 1. Remove non-print action UI elements
    temp.querySelectorAll('.no-print, .cv-ai-hover-actions').forEach((el) => el.remove());

    // 2. Convert highlights: <mark> or .cv-highlight-keyword -> ++text++
    temp.querySelectorAll('mark, .cv-highlight-keyword, .cv-keyword-highlight').forEach((el) => {
      const text = el.textContent?.trim();
      el.textContent = text ? `++${text}++` : '';
    });

    // 3. Convert bold elements: <b>, <strong> -> **text**
    temp.querySelectorAll('b, strong').forEach((el) => {
      const text = el.textContent?.trim();
      el.textContent = text ? `**${text}**` : '';
    });

    // 4. Convert italic elements: <i>, <em> -> *text*
    temp.querySelectorAll('i, em').forEach((el) => {
      const text = el.textContent?.trim();
      el.textContent = text ? `*${text}*` : '';
    });

    // 5. Convert line breaks and paragraph spacing
    temp.querySelectorAll('br').forEach((el) => el.replaceWith('\n'));
    temp.querySelectorAll('p, div').forEach((el) => {
      const text = el.textContent?.trim();
      el.replaceWith(text ? `\n${text}\n` : '\n');
    });

    return (temp.textContent || '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Server-side / Node fallback regex
  return html
    .replace(/<span[^>]*class="[^"]*(?:no-print|cv-ai-hover-actions)[^"]*"[^>]*>.*?<\/span>/gi, '')
    .replace(/<(?:mark|span[^>]*class="[^"]*(?:cv-highlight-keyword|cv-keyword-highlight)[^"]*")[^>]*>(.*?)<\/(?:mark|span)>/gi, '++$1++')
    .replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:p|div)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
