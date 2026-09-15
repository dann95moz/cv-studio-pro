import React from 'react';
import { Box } from '@mui/material';
import { NativeChoiceList } from './NativeChoiceList';

export interface MasterDataChoiceViewProps {
  onSelectFreeText: () => void;
  onSelectGuided: () => void;
  onLoadSample: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProcessing?: boolean;
  progressMessage?: string;
  hasData?: boolean;
  onOpenSync?: (tab?: 'export' | 'import') => void;
}

/**
 * Step 1: Onboarding Choice View (Dumb Presentational Component)
 * Streamlined, unified entrance matching modern mobile-first heuristics:
 * 1) Sincronizar desde PC (QR pairing)
 * 2) Importar CV (PDF, TXT, MD) - Featured
 * 3) Formulario guiado (Step-by-step assistant)
 * 4) Cargar perfil de ejemplo
 */
export const MasterDataChoiceView: React.FC<MasterDataChoiceViewProps> = React.memo(({
  onSelectGuided,
  onLoadSample,
  onUploadFile,
  openFileDialog,
  fileInputRef,
  isProcessing = false,
  progressMessage,
  onOpenSync,
}) => {
  return (
    <>
      {/* Hidden file input for resume uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.markdown,.txt,application/pdf,text/plain,text/markdown"
        style={{ display: 'none' }}
        onChange={onUploadFile}
      />

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 'auto', md: '65vh' },
          boxSizing: 'border-box',
        }}
      >
        <NativeChoiceList
          onSelectGuided={onSelectGuided}
          openFileDialog={openFileDialog}
          onLoadSample={onLoadSample}
          onOpenSync={onOpenSync}
          isProcessing={isProcessing}
          progressMessage={progressMessage}
        />
      </Box>
    </>
  );
});

MasterDataChoiceView.displayName = 'MasterDataChoiceView';
