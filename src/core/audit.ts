import fs from 'fs';
import path from 'path';
import { sanitizeFileName } from './parser';
import { generatePdfFromMarkdown } from './cli-pdf-generator';
import { ThemeId, AuditSectionResult, StrategicGrowthPillar, QualityAuditReport } from '../types/cv';
import { auditCvContent } from './audit-engine';
import { getWorkspaceRoot, getOutputsDir } from './workspace';

export { auditCvContent };
export type { AuditSectionResult, StrategicGrowthPillar, QualityAuditReport };

/**
 * Generates and saves the Quality Audit report (Markdown + PDF) in Node/CLI environments
 */
export async function generateQualityAuditReport({
  cvMarkdownPath,
  targetJobPath,
  masterDataPath,
  outputPath,
  theme = 'modern-tech',
  baseDir
}: {
  cvMarkdownPath: string;
  targetJobPath?: string;
  masterDataPath?: string;
  outputPath?: string;
  theme?: ThemeId;
  baseDir?: string;
}) {
  const root = getWorkspaceRoot(baseDir);
  const cvMd = fs.readFileSync(cvMarkdownPath, 'utf8');
  
  const targetJobText = targetJobPath && fs.existsSync(targetJobPath) 
    ? fs.readFileSync(targetJobPath, 'utf8') 
    : (fs.existsSync(path.join(root, 'target-job.md')) ? fs.readFileSync(path.join(root, 'target-job.md'), 'utf8') : '');

  const masterDataText = masterDataPath && fs.existsSync(masterDataPath) 
    ? fs.readFileSync(masterDataPath, 'utf8') 
    : (fs.existsSync(path.join(root, 'master-data.md')) ? fs.readFileSync(path.join(root, 'master-data.md'), 'utf8') : '');

  const report = auditCvContent(cvMd, targetJobText, masterDataText);
  const outputsDir = getOutputsDir(baseDir);

  const candidateClean = sanitizeFileName(report.candidateName || 'Candidate');
  const companyClean = sanitizeFileName(report.targetCompany || 'Target');

  const reportMdPath = outputPath || path.join(outputsDir, `Quality_Report_${candidateClean}_${companyClean}.md`);
  const reportPdfPath = reportMdPath.replace(/\.md$/, '.pdf');

  fs.writeFileSync(reportMdPath, report.markdownReport, 'utf8');
  console.log(`📊 Quality Audit report saved to: ${reportMdPath}`);

  console.log(`🖨️ Compiling Quality Audit PDF...`);
  const pdfResult = await generatePdfFromMarkdown({
    markdownFilePath: reportMdPath,
    outputPath: reportPdfPath,
    theme,
    baseDir: root
  });

  console.log(`✅ Quality Audit PDF created at: ${reportPdfPath} (Pages: ${pdfResult.pages})`);

  return {
    reportMdPath,
    reportPdfPath,
    report
  };
}
