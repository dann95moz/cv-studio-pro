import { useCallback, useState } from 'react';
import { PageFormat } from '../types/theme';
import { getPageFormatConfig } from '../theme/dimensions';

/**
 * Universal PDF exporter hook providing both direct 1-click in-browser download
 * and fallback system print capability.
 * 
 * Principle: Single Responsibility & Dependency Inversion (SOLID).
 */
export const usePrintPdf = () => {
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'rendering' | 'saving' | 'done'>('idle');

  const handlePrintPdf = useCallback((fileName?: string, pageFormat: PageFormat = 'a4') => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme');
    const previousScheme = root.style.colorScheme;
    const previousTitle = document.title;

    // Temporarily switch DOM to light mode for crisp PDF composition
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    document.body.classList.add('is-printing-pdf');

    // Dynamic @page size style tag
    const formatConfig = getPageFormatConfig(pageFormat);
    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-print-page-style';
    styleEl.textContent = `@page { size: ${formatConfig.printSize}; margin: 0mm; }`;
    document.head.appendChild(styleEl);

    if (fileName && fileName.trim().length > 0) {
      const sanitized = fileName.replace(/\.pdf$/i, '').trim();
      document.title = sanitized;
    }

    const restoreTheme = () => {
      document.title = previousTitle;
      document.body.classList.remove('is-printing-pdf');
      const injected = document.getElementById('dynamic-print-page-style');
      if (injected) {
        injected.remove();
      }
      if (previousTheme) {
        root.setAttribute('data-theme', previousTheme);
      }
      if (previousScheme) {
        root.style.colorScheme = previousScheme;
      } else {
        root.style.removeProperty('color-scheme');
      }
      window.removeEventListener('afterprint', restoreTheme);
    };

    window.addEventListener('afterprint', restoreTheme, { once: true });

    // Trigger browser print dialog (A4 / Letter / Legal vector output)
    window.print();

    // Safety fallback restoration in case afterprint does not fire in some browsers
    setTimeout(restoreTheme, 3000);
  }, []);

  const handleDirectDownload = useCallback(async (
    element: HTMLElement | null,
    fileName?: string,
    pageFormat: PageFormat = 'a4'
  ) => {
    if (!element) return;
    setIsExportingPdf(true);
    setExportStatus('rendering');

    try {
      const { generateDirectPdf } = await import('../core/browser-pdf-generator');
      await generateDirectPdf(element, {
        fileName,
        pageFormat,
        qualityScale: 2,
        onProgress: (step) => {
          if (step === 'saving') setExportStatus('saving');
          else if (step === 'done') setExportStatus('done');
        }
      });
    } catch (error) {
      console.warn('Direct PDF export failed, falling back to browser print:', error);
      handlePrintPdf(fileName, pageFormat);
    } finally {
      setIsExportingPdf(false);
      setExportStatus('idle');
    }
  }, [handlePrintPdf]);

  return {
    isExportingPdf,
    exportStatus,
    handleDirectDownload,
    handlePrintPdf,
    handleDownloadPdf: handleDirectDownload
  };
};
