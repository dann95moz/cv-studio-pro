import React, { useRef, useCallback, useState } from 'react';
import { importResumePdf, PdfImportResult } from '../core/pdf-extractor';

export interface UseFileUploaderOptions {
  onFileLoaded: (content: string, fileName: string, isPdf?: boolean, importDetails?: PdfImportResult) => void;
  onError?: (error: Error) => void;
}

export function useFileUploader({ onFileLoaded, onError }: UseFileUploaderOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProgressBanner, setShowProgressBanner] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

      if (isPdf) {
        setIsProcessing(true);
        setProgressMessage('Extracting career history and skills from PDF...');

        // Debounce the progress banner to avoid visual flicker/layout jumps on fast extractions (<200ms)
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        progressTimerRef.current = setTimeout(() => {
          setShowProgressBanner(true);
        }, 200);

        try {
          const result = await importResumePdf(file, (msg) => {
            setProgressMessage(msg);
          });
          onFileLoaded(result.markdown, file.name, true, result);
        } catch (err: unknown) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          if (onError) onError(errorObj);
        } finally {
          if (progressTimerRef.current) {
            clearTimeout(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          setIsProcessing(false);
          setShowProgressBanner(false);
          setProgressMessage('');
        }
      } else {
        // Plain text / Markdown file reader
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            onFileLoaded(text, file.name, false);
          }
        };
        reader.onerror = (event) => {
          const err = new Error(event.target?.error?.message || 'Error reading file');
          if (onError) onError(err);
        };
        reader.readAsText(file);
      }
    },
    [onFileLoaded, onError]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
        e.target.value = '';
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    isProcessing,
    showProgressBanner,
    progressMessage,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openFileDialog,
    processFile,
  };
}
