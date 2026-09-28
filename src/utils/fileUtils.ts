/**
 * Generates a filesystem-safe date-time stamp string: YYYY-MM-DD_HH-mm
 * e.g., "2026-09-02_22-45"
 */
export function getFileTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Builds a clean, timestamped filename for markdown or text file downloads.
 * e.g. buildTimestampedFileName('master-profile', 'md') -> "master-profile_2026-09-02_22-45.md"
 * e.g. buildTimestampedFileName('CV_Alex_Morgan_Google', 'md') -> "CV_Alex_Morgan_Google_2026-09-02_22-45.md"
 */
export function buildTimestampedFileName(
  baseName: string,
  extension: string = 'md',
  date?: Date
): string {
  const cleanBase = baseName.replace(/\.(md|pdf|txt|json)$/i, '').trim();
  const timestamp = getFileTimestamp(date);
  const cleanExt = extension.startsWith('.') ? extension.slice(1) : extension;
  return `${cleanBase}_${timestamp}.${cleanExt}`;
}

/**
 * Triggers a browser download of text or markdown content as a file.
 */
export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType: string = 'text/markdown;charset=utf-8;'
): void {
  if (!content) return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 10000);
}

export function downloadBlobFile(blob: Blob, fileName: string): void {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 10000);
}

