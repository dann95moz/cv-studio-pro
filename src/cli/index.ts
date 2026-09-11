#!/usr/bin/env node

import { generatePdfFromMarkdown, generateAllPdfs } from '../core/cli-pdf-generator';
import { tailorCvWithGemini } from '../core/gemini';
import { generateQualityAuditReport } from '../core/audit';
import { ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../types/cv';
import { getWorkspaceRoot, findLatestCvMarkdown, resolveCvPath } from '../core/workspace';
import { getAllTemplates } from '../templates/registry';
import { getAllPalettes, CURATED_PALETTES } from '../constants/palettes';
import { AVAILABLE_AI_MODELS } from '../core/ai-service';
import { startInteractiveWizard } from './wizard';

const rootDir = getWorkspaceRoot();

function parseArgs(args: string[]) {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--') && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith('--') && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

function printThemes() {
  const templates = getAllTemplates();
  console.log(`\n🎨 Available Visual Themes (${templates.length})`);
  console.log(`=============================================================`);
  for (const t of templates) {
    console.log(`  ${t.icon} --theme ${t.id.padEnd(19)} [${t.category}]`);
    console.log(`     ${t.description}`);
    console.log(`     Recommended for: ${t.recommendedFor}\n`);
  }
}

function printPalettes() {
  const palettes = getAllPalettes();
  console.log(`\n🌈 Curated Professional Palettes (${palettes.length + 1})`);
  console.log(`=============================================================`);
  for (const p of palettes) {
    console.log(`  • --palette ${p.id.padEnd(20)} ${p.previewColor.padEnd(10)} ${p.name}`);
    console.log(`    ${p.description}\n`);
  }
  console.log(`  • --palette custom --color "#HEX"   Any bespoke brand color hex of your choice\n`);
}

function printModels() {
  console.log(`\n🤖 Available AI Models & Providers (${AVAILABLE_AI_MODELS.length})`);
  console.log(`=============================================================`);
  for (const m of AVAILABLE_AI_MODELS) {
    const freeBadge = m.isFree ? ' [Free / Public]' : '';
    console.log(`  • --model ${m.id.padEnd(30)} [${m.provider.toUpperCase()}]${freeBadge}`);
    console.log(`    ${m.name}: ${m.description}\n`);
  }
}

function printHelp() {
  console.log(`
✨ CV Studio & Tailor Engine (TypeScript + React + Puppeteer)
=============================================================

Interactive Terminal Wizard:
  npm run wizard                      Launch step-by-step interactive terminal assistant
  cv-engine                           Launch wizard automatically (when run with no flags)

CLI Usage:
  npm run pdf                         Generate PDF from the most recent file in outputs/
  npm run pdf <file.md>               Generate PDF from the specified Markdown file
  npm run pdf:all                     Generate PDFs for all files in outputs/
  npm run audit [file.md]             Generate Quality and Audit Report (1-10 table and growth levers)
  npm run generate [Company]          Synthesize tailored CV using Gemini API from target-job.md
  npm run dev                         Start the CV Studio Web interface in real-time (Vite + React)
  npm run themes                      List all available templates and layouts
  npm run palettes                    List all available curated color palettes
  npm run models                      List all available AI models

Visual Design Options (Full Parity with Studio Frontend):
  --theme <id>                        Visual template layout (default: modern-tech)
                                      Available: modern-tech, executive, minimal-ats,
                                      two-column, designer-uiux, formal-legal, academic-research
  --palette <id>                      Curated color scheme (default: corporate-blue)
                                      Available: corporate-blue, accent-teal, editorial-black,
                                      minimal-slate, modern-indigo, executive-burgundy,
                                      forest-green, warm-amber, creative-coral, custom
  --color <hex>                       Bespoke brand color hex (e.g. "#1d4ed8", sets --palette custom)
  --font <family>                     Typography family (default: inter)
                                      Available: inter, outfit, serif, mono
  --density <spacing>                 Spacing density & margins (default: standard)
                                      Available: compact, standard, spacious
  --pages <1|2>                       Page budget & length calibration (default: 1)
  --output <path>                     Destination file path for generated PDF

AI Tailoring & Synthesis Options:
  --company <name>                    Target company name (e.g. "Google", "Stripe")
  --model <model-name>                AI model identifier (e.g. gemini-3.7-flash, gpt-4o)
  --job <path>                        Custom job description file (default: target-job.md)
  --master <path>                     Custom master data source file (default: master-data.md)
  --rules <path>                      Custom rules instruction file (default: rules.md)

Examples:
  # Launch interactive step-by-step assistant
  npm run wizard

  # Generate PDF with modern tech template and linear indigo styling
  npm run pdf outputs/Sample_CV_Stripe.md -- --theme modern-tech --palette modern-indigo --font outfit

  # Generate compact 1-page PDF using designer pastel template
  npm run pdf outputs/CV_Daniel.md -- --theme designer-uiux --palette accent-teal --density compact --pages 1

  # Batch-generate all CVs with corporate navy executive styling
  npm run pdf:all -- --theme executive --palette corporate-blue

  # Tailor CV for target company with full styling parameters
  npm run generate "Stripe" -- --theme modern-tech --palette modern-indigo --pages 1 --job target-job.md

  # Inspect available options
  npm run themes
  npm run palettes
  npm run models
`);
}

const VALID_FONTS: FontFamilyId[] = ['inter', 'outfit', 'serif', 'mono'];
const VALID_DENSITIES: SpacingDensity[] = ['compact', 'standard', 'spacious'];

async function main() {
  const rawArgs = process.argv.slice(2);
  const { flags, positional } = parseArgs(rawArgs);

  const command = positional[0];

  // Launch interactive wizard if explicitly invoked or run without arguments in an interactive terminal
  if (
    command === 'wizard' ||
    command === 'interactive' ||
    flags.interactive ||
    flags.wizard ||
    (rawArgs.length === 0 && process.stdin.isTTY)
  ) {
    await startInteractiveWizard();
    return;
  }

  const activeCommand = command || 'pdf';

  if (flags.help || flags.h || activeCommand === 'help' || activeCommand === '--help') {
    printHelp();
    return;
  }

  if (activeCommand === 'themes' || activeCommand === 'list:themes') {
    printThemes();
    return;
  }

  if (activeCommand === 'palettes' || activeCommand === 'list:palettes') {
    printPalettes();
    return;
  }

  if (activeCommand === 'models' || activeCommand === 'list:models') {
    printModels();
    return;
  }

  // Resolve and validate theme
  const themeArg = flags.theme as string | undefined;
  const validThemes = getAllTemplates().map(t => t.id);
  let theme: ThemeId = 'modern-tech';
  if (themeArg) {
    if (validThemes.includes(themeArg as ThemeId)) {
      theme = themeArg as ThemeId;
    } else {
      console.warn(`⚠️ Warning: Unknown theme "${themeArg}". Falling back to "modern-tech".`);
      console.warn(`   Valid themes: ${validThemes.join(', ')}`);
    }
  }

  // Resolve and validate palette
  const paletteArg = flags.palette as string | undefined;
  const customColor = (flags.color || flags['custom-color']) as string | undefined;
  const validPalettes = [...Object.keys(CURATED_PALETTES), 'custom'];
  let palette: PaletteId | undefined = undefined;

  if (customColor && !paletteArg) {
    palette = 'custom';
  } else if (paletteArg) {
    if (validPalettes.includes(paletteArg)) {
      palette = paletteArg as PaletteId;
    } else {
      console.warn(`⚠️ Warning: Unknown palette "${paletteArg}".`);
      console.warn(`   Valid palettes: ${validPalettes.join(', ')}`);
    }
  }

  // Resolve typography font family
  const fontArg = (flags.font || flags['font-family']) as string | undefined;
  let fontFamily: FontFamilyId | undefined = undefined;
  if (fontArg) {
    if (VALID_FONTS.includes(fontArg as FontFamilyId)) {
      fontFamily = fontArg as FontFamilyId;
    } else {
      console.warn(`⚠️ Warning: Unknown font "${fontArg}". Valid fonts: ${VALID_FONTS.join(', ')}`);
    }
  }

  // Resolve spacing density
  const densityArg = (flags.density || flags.spacing) as string | undefined;
  let spacingDensity: SpacingDensity | undefined = undefined;
  if (densityArg) {
    if (VALID_DENSITIES.includes(densityArg as SpacingDensity)) {
      spacingDensity = densityArg as SpacingDensity;
    } else {
      console.warn(`⚠️ Warning: Unknown density "${densityArg}". Valid options: ${VALID_DENSITIES.join(', ')}`);
    }
  }

  // Resolve page budget
  const rawPages = flags.pages || flags['max-pages'] || flags['page-budget'];
  const maxPages = rawPages ? Number(rawPages) : undefined;

  try {
    switch (command) {
      case 'pdf': {
        const targetFile = positional[1]
          ? resolveCvPath(positional[1], rootDir)
          : findLatestCvMarkdown(rootDir);

        if (!targetFile) {
          console.error('❌ No .md file found in outputs/ or templates/.');
          process.exit(1);
        }

        console.log(`\n🚀 Compiling CV to PDF with TypeScript + React SSR...`);
        console.log(`📄 Source:       ${targetFile}`);
        console.log(`🎨 Theme:        ${theme}`);
        if (palette) console.log(`🌈 Palette:      ${palette}${customColor ? ` (${customColor})` : ''}`);
        if (fontFamily) console.log(`🔤 Font:         ${fontFamily}`);
        if (spacingDensity) console.log(`📏 Density:      ${spacingDensity}`);
        if (maxPages) console.log(`📄 Page Budget:  ${maxPages} page(s)`);

        const result = await generatePdfFromMarkdown({
          markdownFilePath: targetFile,
          outputPath: flags.output as string | undefined,
          theme,
          palette,
          customColor,
          fontFamily,
          spacingDensity,
          maxPages,
          baseDir: rootDir
        });

        console.log(`\n✅ PDF generated successfully!\n📂 File:  ${result.outputPath}\n📄 Pages: ${result.pages} ${result.scale && result.scale < 1 ? `(Auto-Fit: ${(result.scale * 100).toFixed(0)}%)` : ''}\n`);
        break;
      }

      case 'pdf:all': {
        console.log(`\n🚀 Compiling all files in outputs/ to PDF...`);
        console.log(`🎨 Theme:   ${theme}`);
        if (palette) console.log(`🌈 Palette: ${palette}${customColor ? ` (${customColor})` : ''}`);
        if (fontFamily) console.log(`🔤 Font:    ${fontFamily}`);
        if (spacingDensity) console.log(`📏 Density: ${spacingDensity}\n`);

        await generateAllPdfs({
          theme,
          palette,
          customColor,
          fontFamily,
          spacingDensity,
          maxPages,
          baseDir: rootDir
        });
        console.log(`\n✨ Batch process completed successfully.\n`);
        break;
      }

      case 'audit':
      case 'quality': {
        const targetFile = positional[1]
          ? resolveCvPath(positional[1], rootDir)
          : findLatestCvMarkdown(rootDir);

        if (!targetFile) {
          console.error('❌ No CV found in outputs/ to audit. Pass the file path explicitly.');
          process.exit(1);
        }

        console.log(`\n🔍 Starting CV Quality Audit...`);
        console.log(`📄 Evaluated CV: ${targetFile}`);

        const result = await generateQualityAuditReport({
          cvMarkdownPath: targetFile,
          theme,
          outputPath: flags.output as string | undefined,
          baseDir: rootDir
        });

        console.log(`\n🎉 Quality Report and PDF generated successfully!`);
        console.log(`📊 Markdown Report: ${result.reportMdPath}`);
        console.log(`🖨️ PDF Report:      ${result.reportPdfPath}`);
        console.log(`⭐ Overall Score:   ${result.report.overallScore} / 10.0\n`);
        break;
      }

      case 'generate':
      case 'tailor': {
        const companyName = positional[1] || (flags.company as string) || undefined;
        const modelName = flags.model as string | undefined;
        const targetJobPath = (flags.job || flags['target-job']) as string | undefined;
        const masterDataPath = (flags.master || flags['master-data']) as string | undefined;
        const rulesPath = flags.rules as string | undefined;

        console.log(`\n🎯 Starting CV Tailoring with Gemini API...`);
        console.log(`🏢 Target:       ${companyName || 'Target Role'}`);
        console.log(`🎨 Theme:        ${theme}`);
        if (palette) console.log(`🌈 Palette:      ${palette}${customColor ? ` (${customColor})` : ''}`);
        if (fontFamily) console.log(`🔤 Font:         ${fontFamily}`);
        if (spacingDensity) console.log(`📏 Density:      ${spacingDensity}`);
        if (modelName) console.log(`🤖 Model:        ${modelName}`);
        if (targetJobPath) console.log(`📋 Job Spec:     ${targetJobPath}`);
        if (masterDataPath) console.log(`📂 Master Data:  ${masterDataPath}`);

        const result = await tailorCvWithGemini({
          companyName,
          theme,
          palette,
          customColor,
          fontFamily,
          spacingDensity,
          modelName,
          maxPages,
          targetJobPath,
          masterDataPath,
          rulesPath,
          baseDir: rootDir
        });

        console.log(`\n🎉 CV and PDF generated successfully!`);
        console.log(`📄 Markdown:   ${result.cvMdPath}`);
        if (result.gapMdPath) {
          console.log(`📊 Gap Report: ${result.gapMdPath}`);
        }
        console.log(`🖨️ PDF:        ${result.pdfPath}\n`);
        break;
      }

      default:
        console.error(`❌ Unrecognized command: "${command}"`);
        printHelp();
        process.exit(1);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error:`, msg);
    process.exit(1);
  }
}

main();
