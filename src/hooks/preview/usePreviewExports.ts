import { useCallback } from 'react';
import { CVData, PageFormat } from '../../types';
import { extractCandidateName, sanitizeFileName } from '../../core/parser';
import { usePrintPdf } from '../usePrintPdf';
import { useGitHubStarPrompt } from '../useGitHubStarPrompt';
import { generatePlainTextCv } from '../../core/export/plainTextExporter';
import { generateWordDocumentBlob } from '../../core/export/docxExporter';
import { downloadTextFile, downloadBlobFile } from '../../utils/fileUtils';

export interface UsePreviewExportsProps {
  paperRef: React.RefObject<HTMLDivElement | null>;
  parsedCv: CVData;
  companyName: string;
  masterData: string;
  pageFormat: PageFormat;
  handleDownloadCvMarkdown: () => void;
}

/**
 * Domain Hook: usePreviewExports
 * Encapsulates multi-format exporting pipelines: Vector PDF with GitHub star toast triggers,
 * Plain Text ATS formatting, Microsoft Word (.doc) generation, clipboard copying, and Markdown downloads.
 */
export function usePreviewExports({
  paperRef,
  parsedCv,
  companyName,
  masterData,
  pageFormat,
  handleDownloadCvMarkdown,
}: UsePreviewExportsProps) {
  const { isExportingPdf, handleDirectDownload } = usePrintPdf();
  const { isPromptOpen, triggerPrompt, dismissPrompt, openGitHubAndDismiss } = useGitHubStarPrompt();

  const candidateName = sanitizeFileName(
    parsedCv.name || extractCandidateName(masterData, 'Candidate')
  );
  const cleanCompany = sanitizeFileName(companyName || 'Target');
  const targetPdfName = `CV_${candidateName}_${cleanCompany}.pdf`;

  const onTriggerDirectDownloadPdf = useCallback(
    (mode: 'save' | 'share' = 'save') => {
      if (paperRef.current) {
        handleDirectDownload(paperRef.current, targetPdfName, pageFormat, mode);
        triggerPrompt(2000);
      }
    },
    [paperRef, handleDirectDownload, targetPdfName, pageFormat, triggerPrompt]
  );

  const onTriggerSharePdf = useCallback(() => {
    onTriggerDirectDownloadPdf('share');
  }, [onTriggerDirectDownloadPdf]);

  const onTriggerDownloadPlainText = useCallback(() => {
    const plainText = generatePlainTextCv(parsedCv);
    const targetTxtName = `CV_${candidateName}_${cleanCompany}_ATS.txt`;
    downloadTextFile(plainText, targetTxtName, 'text/plain;charset=utf-8;');
  }, [parsedCv, candidateName, cleanCompany]);

  const onTriggerDownloadDocx = useCallback(() => {
    const blob = generateWordDocumentBlob(parsedCv);
    const targetDocxName = `CV_${candidateName}_${cleanCompany}.doc`;
    downloadBlobFile(blob, targetDocxName);
  }, [parsedCv, candidateName, cleanCompany]);

  const onTriggerCopyPlainText = useCallback(async (): Promise<boolean> => {
    const plainText = generatePlainTextCv(parsedCv);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(plainText);
      return true;
    }
    return false;
  }, [parsedCv]);

  return {
    isExportingPdf,
    onTriggerDirectDownloadPdf,
    onTriggerSharePdf,
    onTriggerDownloadPlainText,
    onTriggerDownloadDocx,
    onTriggerCopyPlainText,
    handleDownloadCvMarkdown,
    // GitHub star prompts
    isPromptOpen,
    dismissPrompt,
    openGitHubAndDismiss,
  };
}
