import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generatePdfFromMarkdown } from './pdf-generator';
import {
  sanitizeFileName,
  extractCandidateName,
  extractTargetCompany
} from './parser';
import { generateQualityAuditReport } from './audit';
import { ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../types/cv';
import { getWorkspaceRoot, getOutputsDir } from './workspace';
import { buildPrompts } from './ai/prompt-builder';
import { extractCvAndGap } from './ai/extractor';

dotenv.config();

export interface TailorCvOptions {
  companyName?: string;
  theme?: ThemeId;
  palette?: PaletteId;
  customColor?: string;
  fontFamily?: FontFamilyId;
  spacingDensity?: SpacingDensity;
  modelName?: string;
  maxPages?: number;
  baseDir?: string;
  masterDataPath?: string;
  targetJobPath?: string;
  rulesPath?: string;
}

function loadReferenceFiles(
  root: string,
  customMaster?: string,
  customJob?: string,
  customRules?: string
) {
  const masterDataPath = customMaster
    ? (path.isAbsolute(customMaster) ? customMaster : path.join(root, customMaster))
    : path.join(root, 'master-data.md');

  const targetJobPath = customJob
    ? (path.isAbsolute(customJob) ? customJob : path.join(root, customJob))
    : path.join(root, 'target-job.md');

  const rulesPath = customRules
    ? (path.isAbsolute(customRules) ? customRules : path.join(root, customRules))
    : path.join(root, 'rules.md');

  if (!fs.existsSync(masterDataPath)) {
    throw new Error(`File master data not found at: ${masterDataPath}`);
  }
  if (!fs.existsSync(targetJobPath)) {
    throw new Error(`File target job not found at: ${targetJobPath}`);
  }
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`File rules not found at: ${rulesPath}`);
  }

  return {
    masterData: fs.readFileSync(masterDataPath, 'utf8'),
    targetJob: fs.readFileSync(targetJobPath, 'utf8'),
    rules: fs.readFileSync(rulesPath, 'utf8')
  };
}

export async function tailorCvWithGemini({
  companyName = 'Target',
  theme = 'modern-tech',
  palette,
  customColor,
  fontFamily,
  spacingDensity,
  modelName = 'gemini-3.7-flash',
  maxPages = 1,
  baseDir,
  masterDataPath,
  targetJobPath,
  rulesPath
}: TailorCvOptions = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      '⚠️  GEMINI_API_KEY not found.\n' +
      '   Create a .env file in the project root with:\n' +
      '   GEMINI_API_KEY=your_api_key_here'
    );
  }

  const root = getWorkspaceRoot(baseDir);
  const { masterData, targetJob, rules } = loadReferenceFiles(root, masterDataPath, targetJobPath, rulesPath);

  const prompts = buildPrompts({
    masterData,
    targetJob,
    rules,
    companyName: companyName !== 'Target' ? companyName : undefined,
    pageBudget: maxPages === 2 ? 2 : 1,
    providerSettings: {
      provider: 'gemini',
      model: modelName,
      apiKey
    }
  });

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`📡 Sending request to model ${modelName}...`);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: prompts.systemInstruction,
    generationConfig: {
      temperature: 0.15
    }
  });

  const result = await model.generateContent(prompts.userPrompt);
  const usedModel = modelName;
  const activeModel = model;

  const responseText = result.response.text();
  const outputsDir = getOutputsDir(root);

  // Extract CV and Gap Analysis using unified extractor
  const extracted = extractCvAndGap(responseText, masterData, prompts.company);
  let cvContent = extracted.cvMarkdown;
  const gapContent = extracted.gapMarkdown;

  const inferredCompany = companyName !== 'Target' ? companyName : extractTargetCompany(targetJob, 'Target');
  const sanitizedCompany = sanitizeFileName(inferredCompany || 'Target');

  let candidateName = extractCandidateName(masterData);
  if (!candidateName) {
    const rawName = extractCandidateName(cvContent, 'Candidate');
    candidateName = sanitizeFileName(rawName);
  }

  const baseFileName = candidateName ? `CV_${candidateName}_${sanitizedCompany}` : `CV_${sanitizedCompany}`;
  const cvMdPath = path.join(outputsDir, `${baseFileName}.md`);
  const pdfPath = path.join(outputsDir, `${baseFileName}.pdf`);
  const gapMdPath = path.join(outputsDir, `Gap_Analysis_${candidateName ? `${candidateName}_` : ''}${sanitizedCompany}.md`);

  if (gapContent) {
    fs.writeFileSync(gapMdPath, gapContent, 'utf8');
    console.log(`📊 Gap Analysis report saved to: ${gapMdPath}`);
  }

  fs.writeFileSync(cvMdPath, cvContent, 'utf8');
  console.log(`📝 CV Markdown generated and saved to: ${cvMdPath}`);

  console.log(`🖨️ Compiling to PDF with theme "${theme}" (Limit: ${maxPages} page(s))...`);
  let pdfResult = await generatePdfFromMarkdown({
    markdownFilePath: cvMdPath,
    outputPath: pdfPath,
    theme,
    palette,
    customColor,
    fontFamily,
    spacingDensity,
    maxPages,
    baseDir: root
  });

  // Self-Healing AI Condensation Loop: If content overshoots maxPages, condense automatically
  if (pdfResult.pages > maxPages) {
    console.log(`\n⚠️ Generated CV occupied ${pdfResult.pages} pages (exceeds limit of ${maxPages} page(s)).`);
    console.log(`🔄 Starting automatic auto-condensation and synthesis pass with Gemini...`);

    const condensationInstruction = `
You are a Senior Executive Resume Editor specializing in precision content synthesis.
The generated CV exceeded the target limit of ${maxPages} page(s) and must be rigorously condensed to fit into EXACTLY ${maxPages} page(s) while preserving technical impact, leadership verbs, and quantitative metrics.

CONDENSATION RULES:
1. Reduce experience bullets to EXACTLY 2–3 bullets per company, prioritizing top quantitative impact (Google XYZ formula).
2. Keep each bullet concise (20–25 words max).
3. Summary: Maximum 3 dense, impactful lines ending with core metrics.
4. Skills: Keep exactly 3 dense categories.
5. Education & Certifications: Keep highest degrees and 2-3 most critical certifications.
6. Preserve 100% factual accuracy and original language.
7. STRICT FORMAT: Return ONLY the raw Markdown code starting directly with "# [FULL NAME]", without any conversational preambles.
`;

    try {
      const condenseResponse = await (activeModel || genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })).generateContent([
        { text: condensationInstruction },
        { text: `CURRENT CV TO CONDENSE:\n\n${cvContent}` }
      ]);

      const condensedExtracted = extractCvAndGap(condenseResponse.response.text(), masterData, prompts.company);
      const condensedMarkdown = condensedExtracted.cvMarkdown;

      if (condensedMarkdown.length > 100) {
        cvContent = condensedMarkdown;
        fs.writeFileSync(cvMdPath, cvContent, 'utf8');
        console.log(`📝 CV successfully condensed and saved to: ${cvMdPath}`);

        console.log(`🖨️ Recompiling adjusted PDF...`);
        pdfResult = await generatePdfFromMarkdown({
          markdownFilePath: cvMdPath,
          outputPath: pdfPath,
          theme,
          palette,
          customColor,
          fontFamily,
          spacingDensity,
          maxPages,
          baseDir: root
        });
      }
    } catch (condenseErr: unknown) {
      const msg = condenseErr instanceof Error ? condenseErr.message : String(condenseErr);
      console.warn(`⚠️ Could not complete secondary auto-condensation: ${msg}`);
    }
  }

  console.log(`🎉 PDF created successfully at: ${pdfPath}! (Pages: ${pdfResult.pages})`);

  let qualityReportPath: string | null = null;
  try {
    const auditRes = await generateQualityAuditReport({
      cvMarkdownPath: cvMdPath,
      theme,
      baseDir: root
    });
    qualityReportPath = auditRes.reportMdPath;
  } catch (auditErr: unknown) {
    const msg = auditErr instanceof Error ? auditErr.message : String(auditErr);
    console.warn(`⚠️ Could not generate quality report: ${msg}`);
  }

  return {
    cvMdPath,
    gapMdPath: gapContent ? gapMdPath : null,
    qualityReportPath,
    pdfPath,
    theme,
    modelUsed: usedModel
  };
}
