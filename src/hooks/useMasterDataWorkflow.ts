import { useState, useRef, useEffect, useCallback } from 'react';
import { extractCandidateName } from '../core/parser';
import { useFileUploader } from './useFileUploader';
import { useTranslation } from 'react-i18next';
import { downloadTextFile, buildTimestampedFileName } from '../utils/fileUtils';
import { PdfImportResult } from '../core/pdf-extractor';
import { useResumeStore } from '../store/useResumeStore';

interface UseMasterDataWorkflowProps {
  content: string;
  onChange: (value: string) => void;
  onNextStep: () => void;
}

export type MasterDataMode = 'choice' | 'freeText' | 'guided';

export const useMasterDataWorkflow = ({
  content,
  onChange,
  onNextStep,
}: UseMasterDataWorkflowProps) => {
  const { t } = useTranslation(['profile', 'common']);

  const [editMode, setEditMode] = useState<MasterDataMode>(() => {
    if (!content || !content.trim()) return 'choice';
    if (/^##\s+/m.test(content)) return 'guided';
    return 'freeText';
  });
  const [manualText, setManualText] = useState(content);
  const manualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushGuidedRef = useRef<(() => void) | null>(null);
  const flushManualRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setManualText(content);
    if (editMode === 'choice' && content && content.trim().length > 20) {
      setEditMode(/^##\s+/m.test(content) ? 'guided' : 'freeText');
    }
  }, [content, editMode]);

  useEffect(() => {
    return () => {
      if (manualTimerRef.current) {
        clearTimeout(manualTimerRef.current);
        manualTimerRef.current = null;
      }
    };
  }, []);

  const flushManual = useCallback(() => {
    if (manualTimerRef.current) {
      clearTimeout(manualTimerRef.current);
      manualTimerRef.current = null;
      onChange(manualText);
    }
  }, [manualText, onChange]);

  const handleSwitchMode = useCallback((newMode: 'freeText' | 'guided') => {
    if (newMode === editMode) return;
    if (editMode === 'freeText') {
      flushManualRef.current?.();
      flushManual();
    } else if (editMode === 'guided') {
      flushGuidedRef.current?.();
    }
    setEditMode(newMode);
  }, [editMode, flushManual]);

  const handleSelectMode = useCallback((mode: 'freeText' | 'guided') => {
    setEditMode(mode);
  }, []);

  const handleResetToChoice = useCallback(() => {
    if (editMode === 'freeText') {
      flushManualRef.current?.();
      flushManual();
    } else if (editMode === 'guided') {
      flushGuidedRef.current?.();
    }
    setEditMode('choice');
  }, [editMode, flushManual]);

  const handleManualTextChange = (val: string) => {
    setManualText(val);
    onChange(val);
  };

  const handleManualBlur = () => {
    if (manualTimerRef.current) {
      clearTimeout(manualTimerRef.current);
      manualTimerRef.current = null;
    }
    if (manualText !== content) {
      onChange(manualText);
    }
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    content: string;
    fileName: string;
    isPdf?: boolean;
    details?: PdfImportResult;
  } | null>(null);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'error';
    usedAI?: boolean;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const hasData = Boolean(content && content.trim().length > 20);

  const handleApplyImportedData = (
    importedText: string,
    fileName: string,
    _isPdf?: boolean,
    _details?: PdfImportResult
  ) => {
    if (manualTimerRef.current) {
      clearTimeout(manualTimerRef.current);
      manualTimerRef.current = null;
    }
    setManualText(importedText);
    onChange(importedText);

    // Global toast informing user of successful upload with quick review action
    useResumeStore.getState().showNotification({
      message: t('profile:status.fileImportedSuccess', {
        fileName,
        defaultValue: `Resume "${fileName}" imported successfully!`,
      }),
      severity: 'success',
      actionLabel: t('profile:actions.reviewProfile', 'Review'),
      onAction: () => {
        useResumeStore.getState().setWizardStep('profile');
      },
    });

    // Fast-track auto advance directly to Step 2 (Target Vacancy)
    onNextStep();
  };

  const handleFileLoaded = (
    loadedContent: string,
    fileName: string,
    isPdf?: boolean,
    details?: PdfImportResult
  ) => {
    const finalContent = loadedContent;
    setEditMode('freeText');

    if (hasData) {
      setPendingFile({ content: finalContent, fileName, isPdf, details });
      setShowConfirmDialog(true);
    } else {
      handleApplyImportedData(finalContent, fileName, isPdf, details);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingFile) {
      handleApplyImportedData(
        pendingFile.content,
        pendingFile.fileName,
        pendingFile.isPdf,
        pendingFile.details
      );
      setPendingFile(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelReplace = () => {
    setPendingFile(null);
    setShowConfirmDialog(false);
  };

  const handleConfirmClear = () => {
    if (manualTimerRef.current) {
      clearTimeout(manualTimerRef.current);
      manualTimerRef.current = null;
    }
    setManualText('');
    onChange('');
    setEditMode('choice');
    setShowClearConfirmDialog(false);
    setNotification({
      open: true,
      message: t('profile:status.clearedSuccess', 'Career profile cleared. You can start from a blank slate.'),
      severity: 'info',
    });
  };

  const {
    fileInputRef,
    isProcessing,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openFileDialog,
  } = useFileUploader({
    onFileLoaded: handleFileLoaded,
    onError: (err) => {
      setNotification({
        open: true,
        message: err.message || 'Error processing uploaded file',
        severity: 'error',
      });
    },
  });

  const handleDownload = () => {
    const candidateName = extractCandidateName(content, '');
    const baseName = candidateName ? `master-profile_${candidateName.replace(/\s+/g, '_')}` : 'master-profile';
    const fileName = buildTimestampedFileName(baseName, 'md');
    downloadTextFile(content, fileName);
    useResumeStore.getState().recordBackup();
  };

  const handleContinue = () => {
    if (editMode === 'freeText') {
      flushManual();
    } else if (editMode === 'guided') {
      flushGuidedRef.current?.();
    }
    onNextStep();
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return {
    editMode,
    setEditMode,
    handleSwitchMode,
    handleSelectMode,
    handleResetToChoice,
    flushGuidedRef,
    flushManualRef,
    manualText,
    handleManualTextChange,
    handleManualBlur,
    hasData,
    showConfirmDialog,
    showClearConfirmDialog,
    setShowClearConfirmDialog,
    pendingFile,
    notification,
    handleCloseNotification,
    handleConfirmReplace,
    handleCancelReplace,
    handleConfirmClear,
    handleDownload,
    handleContinue,
    // File upload handlers & state
    fileInputRef,
    isProcessing,
    isDragging,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    openFileDialog,
  };
};
