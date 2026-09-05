/**
 * PDF Generator Engine: CLI & Node.js Environment (Puppeteer)
 * 
 * ENVIRONMENT: Node.js only (CLI commands: `cv-studio pdf`, `npm run pdf`).
 * ENGINE: Puppeteer / Headless Chrome.
 * PURPOSE: Renders CV and Quality Audit markdown to pixel-perfect A4 PDFs on the local filesystem.
 * 
 * NOTE: For client-side / browser PDF export, see `src/core/pdfGenerator.ts`.
 */

import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { sanitizeFileName, extractCandidateName } from './parser';
import { CVRenderer } from '../components/CVRenderer';
import { CVData, ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../types/cv';
import { DEMO_CV_DATA } from '../constants/templates';
import { getWorkspaceRoot, getOutputsDir } from './workspace';
import { escapeHtml } from '../utils/textFormatting';

export interface SystemBrowserInfo {
  name: string;
  executablePath: string;
}

/**
 * Resolves the directory containing CV theme stylesheets, ensuring themes are located
 * correctly whether running locally in source, from the bundled binary, or as a global npm package.
 */
export function getThemesDir(rootDir: string): string {
  const candidates = [
    path.join(rootDir, 'src', 'themes'),
    path.resolve(import.meta.dirname, '..', 'src', 'themes'),
    path.resolve(import.meta.dirname, '..', 'themes'),
    path.resolve(import.meta.dirname, 'themes')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

/**
 * Detects locally installed Google Chrome or Microsoft Edge on Windows, macOS, or Linux.
 * Allows CLI users to generate PDFs instantly without downloading ~150MB of Chromium.
 */
export function findSystemBrowser(): SystemBrowserInfo | null {
  // 1. Check explicit environment variable overrides
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.EDGE_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return { name: 'Custom Browser (ENV)', executablePath: envPath };
  }

  const platform = os.platform();

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

    const candidates = [
      {
        name: 'Google Chrome',
        paths: [
          path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        ]
      },
      {
        name: 'Microsoft Edge',
        paths: [
          path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
          path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
          path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        ]
      }
    ];

    for (const browser of candidates) {
      for (const p of browser.paths) {
        if (p && fs.existsSync(p)) {
          return { name: browser.name, executablePath: p };
        }
      }
    }
  } else if (platform === 'darwin') {
    const home = process.env.HOME || '';
    const candidates = [
      { name: 'Google Chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' },
      { name: 'Microsoft Edge', path: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' },
      { name: 'Google Chrome', path: path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome') },
      { name: 'Microsoft Edge', path: path.join(home, 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge') },
    ];

    for (const c of candidates) {
      if (fs.existsSync(c.path)) {
        return { name: c.name, executablePath: c.path };
      }
    }
  } else if (platform === 'linux') {
    const candidates = [
      { name: 'Google Chrome', path: '/usr/bin/google-chrome' },
      { name: 'Google Chrome', path: '/usr/bin/google-chrome-stable' },
      { name: 'Microsoft Edge', path: '/usr/bin/microsoft-edge' },
      { name: 'Microsoft Edge', path: '/usr/bin/microsoft-edge-stable' },
      { name: 'Chromium', path: '/usr/bin/chromium' },
      { name: 'Chromium', path: '/usr/bin/chromium-browser' },
      { name: 'Chromium', path: '/snap/bin/chromium' },
    ];

    for (const c of candidates) {
      if (fs.existsSync(c.path)) {
        return { name: c.name, executablePath: c.path };
      }
    }
  }

  return null;
}

export interface GeneratePdfOptions {
  markdownContent?: string;
  markdownFilePath?: string;
  outputPath?: string;
  theme?: ThemeId;
  palette?: PaletteId;
  customColor?: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
  format?: 'A4' | 'Letter';
  maxPages?: number;
  autoFit?: boolean;
  baseDir?: string;
}

export interface RenderCvOptions {
  theme?: ThemeId;
  palette?: PaletteId;
  customColor?: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
  baseDir?: string;
}

export function renderCvToHtml(
  markdownContent: string | CVData,
  themeOrOptions: ThemeId | RenderCvOptions = 'modern-tech',
  legacyBaseDir?: string
): string {
  const options: RenderCvOptions = typeof themeOrOptions === 'string'
    ? { theme: themeOrOptions, baseDir: legacyBaseDir }
    : themeOrOptions;

  const {
    theme = 'modern-tech',
    palette,
    customColor,
    fontFamily,
    spacingDensity,
    baseDir
  } = options;

  const rootDir = getWorkspaceRoot(baseDir);
  let cvData: CVData;
  if (typeof markdownContent === 'object' && markdownContent !== null) {
    cvData = markdownContent;
  } else {
    try {
      cvData = JSON.parse(markdownContent);
    } catch {
      cvData = {
        ...DEMO_CV_DATA,
        name: extractCandidateName(markdownContent, 'Candidate') || DEMO_CV_DATA.name,
      };
    }
  }

  // Render React component tree to static HTML markup with complete design options
  const componentHtml = renderToStaticMarkup(
    React.createElement(CVRenderer, {
      data: cvData,
      theme,
      palette,
      customColor,
      fontFamily,
      spacingDensity
    })
  );

  // Load baseline shared CSS and active theme CSS
  const themesDir = getThemesDir(rootDir);
  const cvBasePath = path.join(themesDir, 'cv-base.css');
  const cvBaseCss = fs.existsSync(cvBasePath) ? fs.readFileSync(cvBasePath, 'utf8') : '';

  const themePath = path.join(themesDir, `${theme}.css`);
  const themeCss = fs.existsSync(themePath) ? fs.readFileSync(themePath, 'utf8') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cvData.name || 'CV')} - ${escapeHtml(cvData.title || 'Curriculum Vitae')}</title>
  <!-- Google Fonts: Inter, Merriweather, Outfit, Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  
  <style>
    /* CSS Variables for Dynamic Scaling & Page Fitting */
    :root {
      --cv-font-size: 9.5pt;
      --cv-line-height: 1.42;
      --cv-section-gap: 14px;
      --cv-item-gap: 10px;
      --cv-bullet-gap: 4px;
      --cv-skills-gap: 6px;
      --cv-header-gap: 16px;
    }

    /* CSS Base & Reset */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      font-size: var(--cv-font-size, 9.5pt);
      line-height: var(--cv-line-height, 1.42);
      color: #1e293b;
      background-color: #ffffff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Print Setup */
    @page {
      size: auto;
      margin: ${['academic-research', 'two-column', 'executive', 'designer-uiux'].includes(theme) ? '0mm' : '10mm 12mm 10mm 12mm'};
    }

    @media print {
      html, body {
        background: transparent !important;
        font-size: var(--cv-font-size, 9.5pt) !important;
        line-height: var(--cv-line-height, 1.42) !important;
      }
      .cv-container {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      a {
        text-decoration: none !important;
        color: inherit !important;
      }
    }

    /* Auto-Fit Cascade Hooks */
    .cv-section {
      margin-bottom: var(--cv-section-gap, 14px) !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .experience-item, .project-item, .education-item {
      margin-bottom: var(--cv-item-gap, 10px) !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .skills-group {
      margin-bottom: var(--cv-skills-gap, 6px) !important;
    }

    .cv-bullet-item {
      margin-bottom: var(--cv-bullet-gap, 4px) !important;
    }

    .cv-summary {
      font-size: var(--cv-font-size, 9.5pt) !important;
      line-height: var(--cv-line-height, 1.42) !important;
    }

    .cv-header {
      margin-bottom: var(--cv-header-gap, 16px) !important;
    }

    .icon {
      display: inline-flex;
      align-self: center;
      width: 13px;
      height: 13px;
      margin-right: 5px;
      vertical-align: -1.5px;
      fill: currentColor;
      flex-shrink: 0;
    }

    /* Base Styles & Injected Theme Styles */
    ${cvBaseCss}
    ${themeCss}
  </style>
</head>
<body class="theme-${theme}">
  ${componentHtml}
</body>
</html>`;
}

export async function generatePdfFromMarkdown({
  markdownContent,
  markdownFilePath,
  outputPath,
  theme = 'modern-tech',
  palette,
  customColor,
  fontFamily,
  spacingDensity,
  format = 'A4',
  maxPages,
  autoFit = true,
  baseDir
}: GeneratePdfOptions) {
  const rootDir = getWorkspaceRoot(baseDir);

  let content = markdownContent;
  if (!content && markdownFilePath) {
    if (!fs.existsSync(markdownFilePath)) {
      throw new Error(`File not found: ${markdownFilePath}`);
    }
    content = fs.readFileSync(markdownFilePath, 'utf8');
  }

  if (!content) {
    throw new Error('No Markdown content or file path provided.');
  }

  let finalOutputPath = outputPath;
  if (!finalOutputPath && markdownFilePath) {
    const dir = path.dirname(markdownFilePath);
    const ext = path.extname(markdownFilePath);
    const basename = path.basename(markdownFilePath, ext);
    finalOutputPath = path.join(dir, `${basename}.pdf`);
  }

  if (!finalOutputPath) {
    const name = extractCandidateName(content, 'Candidato');
    const candidateName = sanitizeFileName(name);
    finalOutputPath = path.join(rootDir, 'outputs', `CV_${candidateName}.pdf`);
  }

  // Determine target pages (1 page default for standard lengths, 2 for longer)
  const wordCount = content.trim().split(/\s+/).length;
  const targetPages = maxPages || (wordCount > 520 ? 2 : 1);

  const html = renderCvToHtml(content, {
    theme,
    palette,
    customColor,
    fontFamily,
    spacingDensity,
    baseDir: rootDir
  });

  const baseLaunchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--font-render-hinting=medium'
  ];

  const systemBrowser = findSystemBrowser();
  let browser: Browser;

  if (systemBrowser) {
    try {
      console.log(`🌐 Using detected system browser: ${systemBrowser.name}`);
      browser = await puppeteer.launch({
        headless: true,
        executablePath: systemBrowser.executablePath,
        args: baseLaunchArgs
      });
    } catch (launchErr: unknown) {
      const msg = launchErr instanceof Error ? launchErr.message : String(launchErr);
      console.warn(`⚠️ Could not launch system browser (${msg}). Falling back to Puppeteer bundled browser...`);
      browser = await puppeteer.launch({
        headless: true,
        args: baseLaunchArgs
      });
    }
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: baseLaunchArgs
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');
    await page.emulateMediaType('print');

    // Execute Smart Auto-Fitting inside page context
    const fitResult = await page.evaluate((target: number, allowFit: boolean) => {
      const container = (document.querySelector('.cv-container') as HTMLElement) || document.body;
      
      // A4 printable height in px at standard 96dpi (277mm printable = ~1046.9px)
      const PAGE_HEIGHT_PX = 1046.9;
      const targetHeightPx = target * PAGE_HEIGHT_PX;
      
      let measuredHeight = container.offsetHeight || container.scrollHeight;
      let appliedScale = 1.0;

      if (allowFit && measuredHeight > targetHeightPx) {
        const overflowFactor = measuredHeight / targetHeightPx;
        
        // If content is within condensable overflow range (up to 40% excess height)
        if (overflowFactor <= 1.40) {
          for (let s = 0.98; s >= 0.80; s -= 0.02) {
            const fontPt = (9.5 * s).toFixed(2);
            const lineHt = (1.42 * Math.max(0.90, s)).toFixed(2);
            const secGap = Math.max(6, Math.round(14 * s));
            const itemGap = Math.max(3, Math.round(10 * s));
            const bulletGap = Math.max(2, Math.round(4 * s));
            const skillsGap = Math.max(3, Math.round(6 * s));
            const headerGap = Math.max(8, Math.round(16 * s));

            document.documentElement.style.setProperty('--cv-font-size', `${fontPt}pt`);
            document.documentElement.style.setProperty('--cv-line-height', `${lineHt}`);
            document.documentElement.style.setProperty('--cv-section-gap', `${secGap}px`);
            document.documentElement.style.setProperty('--cv-item-gap', `${itemGap}px`);
            document.documentElement.style.setProperty('--cv-bullet-gap', `${bulletGap}px`);
            document.documentElement.style.setProperty('--cv-skills-gap', `${skillsGap}px`);
            document.documentElement.style.setProperty('--cv-header-gap', `${headerGap}px`);

            // Direct inline overrides
            container.style.fontSize = `${fontPt}pt`;
            container.style.lineHeight = `${lineHt}`;

            document.querySelectorAll('.cv-section').forEach(sec => {
              (sec as HTMLElement).style.marginBottom = `${secGap}px`;
            });

            document.querySelectorAll('.experience-item, .project-item, .education-item').forEach(it => {
              (it as HTMLElement).style.marginBottom = `${itemGap}px`;
            });

            document.querySelectorAll('.cv-bullet-item').forEach(b => {
              (b as HTMLElement).style.marginBottom = `${bulletGap}px`;
            });

            document.querySelectorAll('.skills-group').forEach(sg => {
              (sg as HTMLElement).style.marginBottom = `${skillsGap}px`;
            });

            const header = document.querySelector('.cv-header') as HTMLElement;
            if (header) {
              header.style.marginBottom = `${headerGap}px`;
              header.style.paddingBottom = `${Math.max(6, Math.round(12 * s))}px`;
            }

            measuredHeight = container.offsetHeight || container.scrollHeight;
            if (measuredHeight <= targetHeightPx) {
              appliedScale = s;
              break;
            }
          }
        }
      }

      const calculatedPages = Math.max(1, Math.ceil((measuredHeight - 4) / PAGE_HEIGHT_PX));
      return {
        measuredHeight: Math.round(measuredHeight),
        targetHeight: Math.round(targetHeightPx),
        appliedScale: Number(appliedScale.toFixed(2)),
        pages: calculatedPages,
        fitsStrictly: calculatedPages <= target
      };
    }, targetPages, autoFit);

    if (fitResult.appliedScale < 1) {
      console.log(`📏 Auto-Fit: Content micro-adjusted to ${(fitResult.appliedScale * 100).toFixed(0)}% (${fitResult.measuredHeight}px / ${fitResult.targetHeight}px) -> ${fitResult.pages} page(s).`);
    } else {
      console.log(`📏 Auto-Fit: Height: ${fitResult.measuredHeight}px / ${fitResult.targetHeight}px (${fitResult.pages} page(s)).`);
    }

    const outputDir = path.dirname(finalOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const isBleedTemplate = ['academic-research', 'two-column', 'executive', 'designer-uiux'].includes(theme);
    await page.pdf({
      path: finalOutputPath,
      format,
      printBackground: true,
      preferCSSPageSize: true,
      margin: isBleedTemplate ? { top: '0', right: '0', bottom: '0', left: '0' } : {
        top: '10mm',
        right: '12mm',
        bottom: '10mm',
        left: '12mm'
      }
    });

    return {
      success: true,
      outputPath: finalOutputPath,
      theme,
      pages: fitResult.pages,
      scale: fitResult.appliedScale
    };
  } finally {
    await browser.close();
  }
}

export interface GenerateAllPdfsOptions {
  theme?: ThemeId;
  palette?: PaletteId;
  customColor?: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
  maxPages?: number;
  baseDir?: string;
}

export async function generateAllPdfs({
  theme = 'modern-tech',
  palette,
  customColor,
  fontFamily,
  spacingDensity,
  maxPages,
  baseDir
}: GenerateAllPdfsOptions = {}) {
  const rootDir = getWorkspaceRoot(baseDir);
  const outputsDir = getOutputsDir(baseDir);

  const files = fs.readdirSync(outputsDir).filter(f => f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const mdPath = path.join(outputsDir, file);
    const pdfName = file.replace(/\.md$/, '.pdf');
    const pdfPath = path.join(outputsDir, pdfName);

    console.log(`📄 Procesando: ${file} (Tema: ${theme}${palette ? `, Paleta: ${palette}` : ''})...`);
    try {
      const res = await generatePdfFromMarkdown({
        markdownFilePath: mdPath,
        outputPath: pdfPath,
        theme,
        palette,
        customColor,
        fontFamily,
        spacingDensity,
        maxPages,
        baseDir: rootDir
      });
      console.log(`✅ Creado: ${pdfPath}`);
      results.push(res);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error in ${file}:`, errorMessage);
      results.push({ success: false, file, error: errorMessage });
    }
  }

  return results;
}
