/**
 * PDF Generator Engine: Client-Side Browser Environment (Canvas & jsPDF)
 * 
 * ENVIRONMENT: Browser DOM only (React UI: 1-click Direct PDF Download).
 * ENGINE: html2canvas + jsPDF.
 * PURPOSE: Captures the rendered DOM resume element and downloads high-DPI PDFs directly in browser without print dialogs.
 * 
 * NOTE: For server/CLI Puppeteer PDF generation, see `src/core/pdf-generator.ts`.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PageFormat } from '../types/theme';
import { GeneratedCvVersion } from '../types/studio';
import { getPageFormatConfig } from '../theme/dimensions';
import { sanitizeFileName } from './parser';
import { DEMO_CV_DATA } from '../constants/templates';
import { CVRenderer } from '../components/CVRenderer';

export interface DirectPdfOptions {
  fileName?: string;
  pageFormat?: PageFormat;
  qualityScale?: number;
  onProgress?: (step: 'capturing' | 'rendering' | 'saving' | 'done') => void;
}

const PAGE_MM_DIMENSIONS: Record<PageFormat, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

/**
 * Generates and downloads a high-fidelity PDF directly in the browser
 * without opening the system print dialog.
 * 
 * Capabilities:
 * - 1-click automatic file download directly to the user's Downloads folder.
 * - Slices multi-page resumes cleanly into distinct PDF pages.
 * - Renders at 2x high-resolution scale (crisp typography & graphics).
 * - Full support for A4, US Letter, and US Legal dimensions.
 * - Works on mobile (iOS/Android) and desktop browsers.
 */
export async function generateDirectPdf(
  element: HTMLElement,
  options: DirectPdfOptions = {}
): Promise<void> {
  const {
    fileName = 'Resume.pdf',
    pageFormat = 'a4',
    qualityScale = 2,
    onProgress
  } = options;

  const targetFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const formatConfig = getPageFormatConfig(pageFormat);
  const mmDimensions = PAGE_MM_DIMENSIONS[pageFormat] || PAGE_MM_DIMENSIONS.a4;

  if (onProgress) onProgress('capturing');

  // Temporarily reset zoom/scale transforms on the cloned element or during capture
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalMargin = element.style.margin;

  element.style.transform = 'none';
  element.style.transformOrigin = 'top center';
  element.style.margin = '0 auto';

  try {
    const canvas = await html2canvas(element, {
      scale: qualityScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: formatConfig.widthPx,
      onclone: (clonedDoc) => {
        // Ensure cloned document is in light mode with crisp styling
        clonedDoc.documentElement.setAttribute('data-theme', 'light');
        clonedDoc.documentElement.style.colorScheme = 'light';
        clonedDoc.documentElement.style.setProperty('--cv-paper-bg', '#ffffff');
        clonedDoc.documentElement.style.setProperty('--cv-text-primary', '#1e293b');
        clonedDoc.documentElement.style.setProperty('--cv-text-heading', '#0f172a');
        clonedDoc.documentElement.style.setProperty('--cv-text-secondary', '#475569');
        clonedDoc.documentElement.style.setProperty('--cv-text-muted', '#64748b');
        clonedDoc.documentElement.style.setProperty('--cv-border-light', '#e2e8f0');
        clonedDoc.documentElement.style.setProperty('--cv-border-color', '#cbd5e1');

        if (clonedDoc.body) {
          clonedDoc.body.style.backgroundColor = '#ffffff';
        }

        // Hide all hover actions, bubbles, and interactive toolbars
        clonedDoc.querySelectorAll('.no-print, .preview-mobile-edit, .cv-ai-hover-actions, .cv-selection-bubble, .cv-ai-sparkle-btn, .cv-undo-button, .photo-upload-placeholder').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });

        // Suppress placeholder pseudo-elements and empty editable elements in exported canvas
        const printPlaceholderStyle = clonedDoc.createElement('style');
        printPlaceholderStyle.textContent = `
          [data-placeholder]::before,
          .cv-editable-field:empty::before {
            display: none !important;
            content: "" !important;
          }
        `;
        clonedDoc.head.appendChild(printPlaceholderStyle);

        // Ensure cloned printable sheet and containers have clean unscaled styling
        const clonedScaleContainer = clonedDoc.querySelector('.paper-scale-container') as HTMLElement;
        if (clonedScaleContainer) {
          clonedScaleContainer.style.width = `${formatConfig.widthPx}px`;
          clonedScaleContainer.style.height = 'auto';
          clonedScaleContainer.style.transform = 'none';
        }
        const clonedWrapper = clonedDoc.querySelector('.paper-sheet-wrapper') as HTMLElement;
        if (clonedWrapper) {
          clonedWrapper.style.width = `${formatConfig.widthPx}px`;
          clonedWrapper.style.transform = 'none';
          clonedWrapper.style.position = 'relative';
        }
        const clonedSheet = clonedDoc.querySelector('.paper-sheet') as HTMLElement;
        if (clonedSheet) {
          clonedSheet.style.width = `${formatConfig.widthPx}px`;
          clonedSheet.style.transform = 'none';
          clonedSheet.style.margin = '0 auto';
          clonedSheet.style.boxShadow = 'none';
          clonedSheet.style.border = 'none';
          clonedSheet.style.backgroundColor = '#ffffff';
        }
      }
    });

    if (onProgress) onProgress('rendering');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [mmDimensions.width, mmDimensions.height],
      compress: true
    });

    const pdfPageWidth = mmDimensions.width;
    const pdfPageHeight = mmDimensions.height;

    // Calculate canvas image height in PDF mm units
    const imgWidth = pdfPageWidth;
    const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Add subsequent pages if document exceeds 1 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage([pdfPageWidth, pdfPageHeight], 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
    }

    if (onProgress) onProgress('saving');

    // Trigger direct browser download
    pdf.save(targetFileName);

    if (onProgress) onProgress('done');
  } finally {
    // Restore original DOM styles safely
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.margin = originalMargin;
  }
}

/**
 * Generates and downloads a direct PDF for any historical CV version,
 * rendering it in a temporary off-screen container.
 */
export async function generateVersionDirectPdf(
  version: GeneratedCvVersion,
  options: { pageFormat?: PageFormat; qualityScale?: number; language?: string } = {}
): Promise<void> {
  const pageFormat = options.pageFormat || 'a4';
  const formatConfig = getPageFormatConfig(pageFormat);

  const requestedLang = options.language || version.activeLanguage;
  const isVariant = Boolean(requestedLang && version.translations && version.translations[requestedLang]);
  const cvData = isVariant && version.translations?.[requestedLang!]?.cvData
    ? version.translations[requestedLang!].cvData!
    : (version.cvData || DEMO_CV_DATA);
  const candidateName = sanitizeFileName(version.candidateName || cvData.name || 'Candidate');
  const cleanCompany = sanitizeFileName(version.companyName || 'Application');
  const langSuffix = isVariant ? `_${requestedLang!.toUpperCase()}` : '';
  const fileName = `CV_${candidateName}_${cleanCompany}${langSuffix}.pdf`;

  // Create isolated off-screen render container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${formatConfig.widthPx}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.className = 'offscreen-cv-renderer';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  try {
    // Render the React CV Component with the version's theme and palette
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(CVRenderer, {
          data: cvData,
          theme: version.theme || 'modern-tech',
          palette: version.palette || 'corporate-blue',
          spacingDensity: 'standard',
          fontFamily: 'inter',
        })
      );
      // Brief tick to ensure DOM and stylesheet computations complete
      setTimeout(resolve, 120);
    });

    const targetElement = (container.querySelector('.paper-sheet') as HTMLElement) || container;

    await generateDirectPdf(targetElement, {
      fileName,
      pageFormat,
      qualityScale: options.qualityScale || 2,
    });
  } finally {
    // Clean up off-screen DOM tree
    setTimeout(() => {
      root.unmount();
      container.remove();
    }, 100);
  }
}
