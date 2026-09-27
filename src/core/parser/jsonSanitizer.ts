/**
 * Robustly sanitizes a raw JSON string from external AI models (ChatGPT, Claude, DeepSeek).
 * - Strips Markdown code blocks (```json ... ```)
 * - Isolates outer JSON curly braces
 * - Strips // and /* comments outside strings (preserving URLs like https:// inside strings)
 * - Removes trailing commas before } or ]
 * - Escapes unescaped literal newlines and control characters inside double-quoted strings
 */
export function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find outer braces
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Single-pass scanner:
  // 1. Ignores // and /* */ comments outside strings, but preserves them inside strings (e.g. https://...)
  // 2. Escapes unescaped newlines, tabs, and carriage returns inside strings
  let inString = false;
  let isEscaped = false;
  let inLineComment = false;
  let inBlockComment = false;
  let result = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = i + 1 < cleaned.length ? cleaned[i + 1] : '';

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip /
      }
      continue;
    }

    if (!inString) {
      if (char === '/' && nextChar === '/') {
        inLineComment = true;
        i++; // skip next /
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++; // skip next *
        continue;
      }
      if (char === '"') {
        inString = true;
        result += char;
        continue;
      }
      result += char;
    } else {
      if (char === '"' && !isEscaped) {
        inString = false;
        result += char;
      } else if (char === '\\') {
        isEscaped = !isEscaped;
        result += char;
      } else if (char === '\n') {
        result += '\\n';
        isEscaped = false;
      } else if (char === '\r') {
        isEscaped = false;
      } else if (char === '\t') {
        result += '\\t';
        isEscaped = false;
      } else {
        result += char;
        isEscaped = false;
      }
    }
  }

  // Remove trailing commas before } or ]
  result = result.replace(/,\s*([}\]])/g, '$1');

  return result;
}
