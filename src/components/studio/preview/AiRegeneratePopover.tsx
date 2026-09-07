import React, { useState, useEffect } from 'react';
import {
  Popover,
  Drawer,
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface AiRegeneratePopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onRegenerate: (guidance: string) => Promise<void>;
  type?: 'bullet' | 'summary';
}

export const AiRegeneratePopover: React.FC<AiRegeneratePopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onRegenerate,
  type = 'bullet',
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [guidance, setGuidance] = useState<string>('');
  const [selectedChipKey, setSelectedChipKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset local state when popover opens/closes
  useEffect(() => {
    if (open) {
      setGuidance('');
      setSelectedChipKey(null);
      setErrorMessage(null);
      setIsGenerating(false);
    }
  }, [open]);

  const chips = type === 'bullet'
    ? [
        { key: 'concise', label: t('preview:aiRegen.chips.concise', 'More concise') },
        { key: 'leadership', label: t('preview:aiRegen.chips.leadership', 'Leadership focus') },
        { key: 'angle', label: t('preview:aiRegen.chips.angle', 'Different angle') },
        { key: 'metrics', label: t('preview:aiRegen.chips.metrics', 'Stronger metrics') },
      ]
    : [
        { key: 'concise', label: t('preview:aiRegen.chips.concise', 'More concise') },
        { key: 'leadership', label: t('preview:aiRegen.chips.leadership', 'Leadership focus') },
        { key: 'targetFit', label: t('preview:aiRegen.chips.targetFit', 'Target job fit') },
      ];

  const handleChipClick = (chipKey: string, chipLabel: string) => {
    if (selectedChipKey === chipKey) {
      setSelectedChipKey(null);
      setGuidance('');
    } else {
      setSelectedChipKey(chipKey);
      setGuidance(chipLabel);
    }
  };

  const handleExecute = async () => {
    if (isGenerating) return;
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      await onRegenerate(guidance.trim());
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('preview:aiRegen.error', 'Failed to regenerate. Please check your AI settings.');
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) {
        handleExecute();
      }
    }
  };

  const content = (
    <Box sx={{ width: '100%' }}>
      {/* Mobile Grab Handle */}
      {isMobile && (
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: 'divider',
            borderRadius: RADIUS_TOKENS.full,
            mx: 'auto',
            mb: 2,
          }}
        />
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '0.92rem' } }}>
            {type === 'bullet'
              ? t('preview:aiRegen.titleBullet', 'Regenerate this achievement')
              : t('preview:aiRegen.titleSummary', 'Regenerate professional summary')}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          disabled={isGenerating}
          sx={{
            color: 'text.secondary',
            p: 0.5,
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Quick Guidance Chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {chips.map((chip) => {
          const isSelected = selectedChipKey === chip.key;
          return (
            <Chip
              key={chip.key}
              label={chip.label}
              size={isMobile ? 'medium' : 'small'}
              clickable
              disabled={isGenerating}
              onClick={() => handleChipClick(chip.key, chip.label)}
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              sx={{
                fontWeight: isSelected ? 700 : 500,
                fontSize: { xs: '0.8rem', sm: '0.76rem' },
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </Box>

      {/* Free-text input */}
      <TextField
        fullWidth
        size="small"
        multiline
        rows={isMobile ? 3 : 2}
        disabled={isGenerating}
        value={guidance}
        onChange={(e) => {
          setGuidance(e.target.value);
          setSelectedChipKey(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={t(
          'preview:aiRegen.placeholder',
          "Optional: tell us what to adjust (e.g. 'emphasize teamwork')"
        )}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '0.88rem', sm: '0.82rem' },
            borderRadius: RADIUS_TOKENS.md,
            bgcolor: alpha(theme.palette.background.default, 0.6),
          },
        }}
      />

      {/* Error alert if any */}
      {errorMessage && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2, py: 0.5, fontSize: '0.78rem', borderRadius: RADIUS_TOKENS.md }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          gap: 1.25,
        }}
      >
        {!isMobile && (
          <Button
            size="small"
            variant="text"
            disabled={isGenerating}
            onClick={onClose}
            sx={{
              fontSize: '0.78rem',
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {t('common:actions.cancel', 'Cancel')}
          </Button>
        )}

        <Button
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'small'}
          variant="contained"
          color="primary"
          disabled={isGenerating}
          onClick={handleExecute}
          startIcon={
            isGenerating ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <AutoAwesomeRoundedIcon sx={{ fontSize: '15px !important' }} />
            )
          }
        >
          {isGenerating
            ? t('preview:aiRegen.regenerating', 'Regenerating...')
            : t('preview:aiRegen.button', 'Regenerate')}
        </Button>
      </Box>
    </Box>
  );

  // Mobile: Render as Bottom Sheet Drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={isGenerating ? undefined : onClose}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              p: 2.5,
              pb: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            },
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  // Desktop / Tablet: Render as anchored Popover
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={isGenerating ? undefined : onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxWidth: '100vw',
            p: 2,
          },
        },
      }}
    >
      {content}
    </Popover>

  );
};
