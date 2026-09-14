import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { platformService } from '../../../core/platform';
import { NativeChoiceList } from './NativeChoiceList';
import { MasterDataSyncBanner } from './MasterDataSyncBanner';
import { ChoiceModeCards } from './ChoiceModeCards';

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
 * Clean, frictionless entrance allowing the candidate to:
 * 1) Import an existing resume (PDF, TXT, MD)
 * 2) Start from scratch or continue via Guided Step-by-Step Form
 * 3) Paste or view unformatted notes / free text
 * 4) Sync from PC via QR code or pairing code
 */
export const MasterDataChoiceView: React.FC<MasterDataChoiceViewProps> = React.memo(({
  onSelectFreeText,
  onSelectGuided,
  onLoadSample,
  onUploadFile,
  openFileDialog,
  fileInputRef,
  isProcessing = false,
  progressMessage,
  hasData = false,
  onOpenSync,
}) => {
  const { t } = useTranslation(['profile']);

  // NATIVE APP EXPERIENCE: Clean list living directly on screen background
  if (platformService.isNative()) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.markdown,.txt,application/pdf,text/plain,text/markdown"
          style={{ display: 'none' }}
          onChange={onUploadFile}
        />
        <NativeChoiceList
          onSelectGuided={onSelectGuided}
          openFileDialog={openFileDialog}
          onLoadSample={onLoadSample}
          onOpenSync={onOpenSync}
          isProcessing={isProcessing}
          progressMessage={progressMessage}
        />
      </>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1040,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        pt: { xs: 1.5, sm: 3 },
        pb: { xs: 4, sm: 5 },
        px: { xs: 1.5, sm: 3 },
        boxSizing: 'border-box',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.md,.markdown,.txt"
        style={{ display: 'none' }}
        onChange={onUploadFile}
      />

      {/* Header Banner */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3.5 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            mb: { xs: 0.5, sm: 1.2 },
            letterSpacing: '-0.01em',
            fontSize: { xs: '1.35rem', sm: '1.75rem', md: '1.95rem' },
          }}
        >
          {t('profile:choice.title', 'How would you like to start your profile?')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 640,
            mx: 'auto',
            fontSize: { xs: '0.86rem', sm: '0.95rem' },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {t(
            'profile:choice.subtitle',
            'Choose the input method that best matches your workflow. Everything is processed 100% locally and privately.'
          )}
        </Typography>
      </Box>

      {/* Fast Sync Banner (Prominently visible at top for Mobile and Desktop) */}
      {onOpenSync && <MasterDataSyncBanner onOpenSync={onOpenSync} />}

      {/* 3 Decision Cards Grid */}
      <ChoiceModeCards
        onSelectFreeText={onSelectFreeText}
        onSelectGuided={onSelectGuided}
        openFileDialog={openFileDialog}
        isProcessing={isProcessing}
        progressMessage={progressMessage}
        hasData={hasData}
      />

      {/* Bottom Option: Sample Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('profile:choice.sampleQuestion', 'Just testing?')}
        </Typography>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onLoadSample}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 700 }}
        >
          {t('profile:choice.loadSampleAction', 'Load Sample Profile')}
        </Button>
      </Box>
    </Box>
  );
});

MasterDataChoiceView.displayName = 'MasterDataChoiceView';
