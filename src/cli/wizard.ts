import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { generatePdfFromMarkdown } from '../core/cli-pdf-generator';
import { tailorCvWithGemini } from '../core/gemini';
import { generateQualityAuditReport } from '../core/audit';
import { getAllTemplates } from '../templates/registry';
import { getAllPalettes } from '../constants/palettes';
import { AVAILABLE_AI_MODELS } from '../core/ai-service';
import { getWorkspaceRoot, getOutputsDir, resolveCvPath, findLatestCvMarkdown } from '../core/workspace';
import { ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../types/cv';

interface WizardChoice<T> {
  label: string;
  value: T;
  description?: string;
}

async function askOption<T>(
  rl: readline.Interface,
  question: string,
  choices: WizardChoice<T>[],
  defaultIndex = 0
): Promise<T> {
  console.log(`\n${question}`);
  choices.forEach((c, idx) => {
    const isDef = idx === defaultIndex ? ' (Default)' : '';
    const desc = c.description ? ` — ${c.description}` : '';
    console.log(`  [${idx + 1}] ${c.label}${desc}${isDef}`);
  });

  while (true) {
    const rawAnswer = (await rl.question(`Select option [1-${choices.length}] (Enter = ${defaultIndex + 1}): `)).trim();
    if (rawAnswer === '') {
      return choices[defaultIndex].value;
    }
    const num = parseInt(rawAnswer, 10);
    if (!isNaN(num) && num >= 1 && num <= choices.length) {
      return choices[num - 1].value;
    }
    console.log(`❌ Invalid choice. Please enter a number between 1 and ${choices.length}.`);
  }
}

async function askInput(
  rl: readline.Interface,
  prompt: string,
  defaultValue = ''
): Promise<string> {
  const displayPrompt = defaultValue ? `${prompt} [${defaultValue}]: ` : `${prompt}: `;
  const answer = (await rl.question(displayPrompt)).trim();
  return answer || defaultValue;
}

/**
 * Interactive flow for compiling any CV Markdown to PDF.
 */
async function runCompilePdfWizard(rl: readline.Interface, rootDir: string) {
  console.log(`\n=============================================================`);
  console.log(`🖨️  CV to PDF Compilation Wizard`);
  console.log(`=============================================================`);

  const outputsDir = getOutputsDir(rootDir);
  const foundFiles = fs.readdirSync(outputsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('Gap_Analysis_') && !f.startsWith('Quality_Report_'));

  let targetFilePath: string;

  if (foundFiles.length > 0) {
    const fileChoices: WizardChoice<string>[] = foundFiles.map(f => ({
      label: f,
      value: path.join(outputsDir, f)
    }));
    fileChoices.push({
      label: 'Enter a custom file path...',
      value: '__custom__'
    });

    const chosen = await askOption(rl, '📄 Which CV Markdown file do you want to compile?', fileChoices, 0);
    if (chosen === '__custom__') {
      const customPath = await askInput(rl, 'Enter relative or absolute path to .md file');
      targetFilePath = resolveCvPath(customPath, rootDir);
    } else {
      targetFilePath = chosen;
    }
  } else {
    const defaultFile = findLatestCvMarkdown(rootDir) || path.join(rootDir, 'templates', 'cv-template.md');
    const inputPath = await askInput(rl, '📄 Enter path to CV markdown file', defaultFile);
    targetFilePath = resolveCvPath(inputPath, rootDir);
  }

  if (!fs.existsSync(targetFilePath)) {
    console.error(`❌ File not found at: ${targetFilePath}`);
    return;
  }

  // 1. Theme Selection
  const allTemplates = getAllTemplates();
  const themeChoices: WizardChoice<ThemeId>[] = allTemplates.map(t => ({
    label: `${t.icon} ${t.id}`,
    value: t.id,
    description: `${t.name} (${t.layout})`
  }));
  const theme = await askOption(rl, '🎨 Select Visual Layout Theme:', themeChoices, 4); // modern-tech default

  // 2. Palette Selection
  const allPalettes = getAllPalettes();
  const paletteChoices: WizardChoice<PaletteId | 'custom'>[] = allPalettes.map(p => ({
    label: `${p.name} (${p.previewColor})`,
    value: p.id,
    description: p.description
  }));
  paletteChoices.push({
    label: 'Custom Brand HEX Color',
    value: 'custom',
    description: 'Enter your bespoke color code (e.g. #2563eb)'
  });

  const palette = await askOption(rl, '🌈 Select Color Palette:', paletteChoices, 0);
  let customColor: string | undefined = undefined;
  if (palette === 'custom') {
    customColor = await askInput(rl, 'Enter HEX Color (e.g. #1d4ed8)', '#1d4ed8');
  }

  // 3. Typography Selection
  const fontChoices: WizardChoice<FontFamilyId>[] = [
    { label: 'Inter', value: 'inter', description: 'Clean modern technical sans-serif' },
    { label: 'Outfit', value: 'outfit', description: 'Contemporary geometric sans-serif' },
    { label: 'Serif', value: 'serif', description: 'Classical prestigious Merriweather / Garamond' },
    { label: 'Mono', value: 'mono', description: 'JetBrains Mono developer accent' },
  ];
  const fontFamily = await askOption(rl, '🔤 Select Typography Family:', fontChoices, 0);

  // 4. Spacing Density Selection
  const densityChoices: WizardChoice<SpacingDensity>[] = [
    { label: 'Standard', value: 'standard', description: 'Balanced industry-standard margins & 9.5pt font' },
    { label: 'Compact', value: 'compact', description: 'Tight spacing & 8.8pt font — recommended for 1-page fit' },
    { label: 'Spacious', value: 'spacious', description: 'Relaxed margins & 10.2pt font — great for 2 pages' },
  ];
  const spacingDensity = await askOption(rl, '📏 Select Spacing Density:', densityChoices, 0);

  // 5. Page Budget
  const pageChoices: WizardChoice<number | undefined>[] = [
    { label: '1 Page', value: 1, description: 'Auto-calibrate and scale strictly to 1 A4 page' },
    { label: '2 Pages', value: 2, description: 'Budget up to 2 A4 pages' },
    { label: 'Automatic', value: undefined, description: 'Let length determine pages dynamically' },
  ];
  const maxPages = await askOption(rl, '📄 Target Page Budget:', pageChoices, 0);

  console.log(`\n🚀 Compiling CV with selected styling...`);
  console.log(`📄 Source:  ${targetFilePath}`);
  console.log(`🎨 Theme:   ${theme}`);
  console.log(`🌈 Palette: ${palette}${customColor ? ` (${customColor})` : ''}`);
  console.log(`🔤 Font:    ${fontFamily}`);
  console.log(`📏 Density: ${spacingDensity}`);

  try {
    const result = await generatePdfFromMarkdown({
      markdownFilePath: targetFilePath,
      theme,
      palette,
      customColor,
      fontFamily,
      spacingDensity,
      maxPages,
      baseDir: rootDir
    });

    console.log(`\n🎉 PDF generated successfully!`);
    console.log(`📂 Output: ${result.outputPath}`);
    console.log(`📄 Pages:  ${result.pages} ${result.scale && result.scale < 1 ? `(Auto-Fit scale: ${(result.scale * 100).toFixed(0)}%)` : ''}\n`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Error compiling PDF: ${msg}`);
  }
}

/**
 * Interactive flow for tailoring a CV with AI.
 */
async function runTailorWizard(rl: readline.Interface, rootDir: string) {
  console.log(`\n=============================================================`);
  console.log(`🎯  AI Resume Tailoring Wizard`);
  console.log(`=============================================================`);
  console.log(`🔒 SSOT Guarantee: master-data.md is strictly read-only.\n`);

  const company = await askInput(rl, '🏢 Target Company Name (e.g. Google, Stripe)', 'Target');
  const jobFile = await askInput(rl, '🎯 Job Spec File', 'target-job.md');
  const masterFile = await askInput(rl, '📂 Master Data File', 'master-data.md');

  const allTemplates = getAllTemplates();
  const themeChoices: WizardChoice<ThemeId>[] = allTemplates.map(t => ({
    label: `${t.icon} ${t.id}`,
    value: t.id,
    description: t.name
  }));
  const theme = await askOption(rl, '🎨 Select Visual Theme:', themeChoices, 4);

  const pageChoices: WizardChoice<number>[] = [
    { label: '1 Page', value: 1, description: 'Rigorously condensed executive 1-pager' },
    { label: '2 Pages', value: 2, description: 'Comprehensive 2-page narrative' },
  ];
  const maxPages = await askOption(rl, '📄 Page Budget for AI Synthesis:', pageChoices, 0);

  console.log(`\n🚀 Launching AI Tailoring Pipeline...`);
  try {
    const result = await tailorCvWithGemini({
      companyName: company,
      theme,
      maxPages,
      targetJobPath: jobFile,
      masterDataPath: masterFile,
      baseDir: rootDir
    });

    console.log(`\n🎉 Tailored Resume and PDF generated successfully!`);
    console.log(`📝 Markdown: ${result.cvMdPath}`);
    if (result.gapMdPath) {
      console.log(`📊 Gap Report: ${result.gapMdPath}`);
    }
    console.log(`🖨️ PDF:      ${result.pdfPath}\n`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Tailoring Error: ${msg}`);
  }
}

/**
 * Interactive flow for Quality & ATS Audit.
 */
async function runAuditWizard(rl: readline.Interface, rootDir: string) {
  console.log(`\n=============================================================`);
  console.log(`🔍  CV Quality & ATS Audit Wizard`);
  console.log(`=============================================================`);

  const outputsDir = getOutputsDir(rootDir);
  const foundFiles = fs.readdirSync(outputsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('Gap_Analysis_') && !f.startsWith('Quality_Report_'));

  let targetFilePath: string;

  if (foundFiles.length > 0) {
    const fileChoices: WizardChoice<string>[] = foundFiles.map(f => ({
      label: f,
      value: path.join(outputsDir, f)
    }));
    targetFilePath = await askOption(rl, '📄 Select CV to evaluate:', fileChoices, 0);
  } else {
    const defaultFile = findLatestCvMarkdown(rootDir) || path.join(rootDir, 'templates', 'cv-template.md');
    const inputPath = await askInput(rl, '📄 Path to CV file to audit', defaultFile);
    targetFilePath = resolveCvPath(inputPath, rootDir);
  }

  console.log(`\n🔍 Running Quality Audit on: ${targetFilePath}...`);
  try {
    const result = await generateQualityAuditReport({
      cvMarkdownPath: targetFilePath,
      baseDir: rootDir
    });

    console.log(`\n🎉 Quality Audit Completed!`);
    console.log(`⭐ Overall Score: ${result.report.overallScore} / 10.0`);
    console.log(`📊 Markdown Report: ${result.reportMdPath}`);
    console.log(`🖨️ PDF Report:      ${result.reportPdfPath}\n`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Audit Error: ${msg}`);
  }
}

function printThemesOverview() {
  const templates = getAllTemplates();
  console.log(`\n🎨 Available Visual Themes (${templates.length})`);
  console.log(`=============================================================`);
  for (const t of templates) {
    console.log(`  ${t.icon} --theme ${t.id.padEnd(19)} [${t.category}]`);
    console.log(`     ${t.description}`);
    console.log(`     Recommended for: ${t.recommendedFor}\n`);
  }
}

function printPalettesOverview() {
  const palettes = getAllPalettes();
  console.log(`\n🌈 Curated Professional Palettes (${palettes.length + 1})`);
  console.log(`=============================================================`);
  for (const p of palettes) {
    console.log(`  • --palette ${p.id.padEnd(20)} ${p.previewColor.padEnd(10)} ${p.name}`);
    console.log(`    ${p.description}\n`);
  }
  console.log(`  • --palette custom --color "#HEX"   Any bespoke brand color hex of your choice\n`);
}

function printModelsOverview() {
  console.log(`\n🤖 Available AI Models & Providers (${AVAILABLE_AI_MODELS.length})`);
  console.log(`=============================================================`);
  for (const m of AVAILABLE_AI_MODELS) {
    const freeBadge = m.isFree ? ' [Free / Public]' : '';
    console.log(`  • --model ${m.id.padEnd(30)} [${m.provider.toUpperCase()}]${freeBadge}`);
    console.log(`    ${m.name}: ${m.description}\n`);
  }
}

/**
 * Main Interactive Wizard Entry Point.
 */
export async function startInteractiveWizard() {
  const rl = readline.createInterface({ input, output });
  const rootDir = getWorkspaceRoot();

  console.log(`
✨ ============================================================= ✨
   CV Studio Pro — Interactive Terminal Wizard
   Design, Tailor & Generate ATS-Optimized Vector Resumes
✨ ============================================================= ✨
`);

  try {
    let keepRunning = true;
    while (keepRunning) {
      const mainMenuChoices: WizardChoice<string>[] = [
        { label: '🖨️  Compile CV to PDF', value: 'pdf', description: 'Select markdown file, theme, palette, font & density' },
        { label: '🎯  Tailor CV with AI', value: 'tailor', description: 'Synthesize custom CV from job vacancy with page auto-fit' },
        { label: '🔍  Run Quality & ATS Audit', value: 'audit', description: 'Get 1-10 scoring across 6 recruiter dimensions' },
        { label: '🎨  Browse Visual Themes', value: 'themes', description: 'Explore the 7 template layouts & recommended roles' },
        { label: '🌈  Browse Color Palettes', value: 'palettes', description: 'Inspect the 10 curated color schemes' },
        { label: '🤖  Browse AI Models', value: 'models', description: 'View supported models across Gemini, Groq, Claude, OpenAI' },
        { label: '❌  Exit', value: 'exit', description: 'Close the wizard' },
      ];

      const action = await askOption(rl, 'What would you like to do?', mainMenuChoices, 0);

      switch (action) {
        case 'pdf':
          await runCompilePdfWizard(rl, rootDir);
          break;
        case 'tailor':
          await runTailorWizard(rl, rootDir);
          break;
        case 'audit':
          await runAuditWizard(rl, rootDir);
          break;
        case 'themes':
          printThemesOverview();
          break;
        case 'palettes':
          printPalettesOverview();
          break;
        case 'models':
          printModelsOverview();
          break;
        case 'exit':
          keepRunning = false;
          console.log(`\n👋 Thanks for using CV Studio Pro. Good luck with your applications!\n`);
          break;
      }

      if (keepRunning) {
        const nextAction = await askInput(rl, '\nPress Enter to return to main menu or type "q" to quit', '');
        if (nextAction.toLowerCase() === 'q') {
          keepRunning = false;
          console.log(`\n👋 Goodbye!\n`);
        }
      }
    }
  } finally {
    rl.close();
  }
}
