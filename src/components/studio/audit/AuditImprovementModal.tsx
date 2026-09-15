import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { ActionModalState, AuditImprovementModalProps } from '../../../types';

export type { ActionModalState, AuditImprovementModalProps };

export const AuditImprovementModal: React.FC<AuditImprovementModalProps> = ({
  modalState,
  onClose,
  onInputChange,
  onApply,
}) => {
  const { t } = useTranslation(['audit', 'common']);

  return (
    <Dialog
      open={modalState.open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: `${RADIUS_TOKENS.xl} ${RADIUS_TOKENS.xl} 0 0`, sm: RADIUS_TOKENS.xl },
            m: { xs: 0, sm: 2 },
            position: { xs: 'fixed', sm: 'relative' },
            bottom: { xs: 0, sm: 'auto' },
            maxHeight: { xs: '92vh', sm: '88vh' },
            width: { xs: '100%', sm: 'auto' },
            pt: { xs: 'max(calc(env(safe-area-inset-top, 0px) + 4px), 8px)', sm: 0 },
            pb: { xs: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 24px)', sm: 0 },
            pl: { xs: 'env(safe-area-inset-left, 0px)', sm: 0 },
            pr: { xs: 'env(safe-area-inset-right, 0px)', sm: 0 },
          },
        },
      }}
    >
      {/* Mobile Drag Handle Pill */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          width: 36,
          height: 4,
          borderRadius: RADIUS_TOKENS.full,
          bgcolor: 'divider',
          mx: 'auto',
          mb: 1.5,
          mt: 0.5,
        }}
      />
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {modalState.title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {modalState.description}
        </Typography>

        {modalState.presets.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.75, display: 'block', color: 'text.secondary' }}>
              {t('audit:quickSuggestions', 'Quick Suggestions (Click to apply):')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {modalState.presets.map((preset: string, idx: number) => (
                <Chip
                  key={idx}
                  label={preset}
                  size="small"
                  onClick={() => onInputChange(preset)}
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    py: 0.5,
                    cursor: 'pointer',
                    '& .MuiChip-label': { whiteSpace: 'normal', display: 'block' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <TextField
          multiline
          rows={3}
          label={t('audit:proposedAddition', 'Proposed Content Addition')}
          value={modalState.inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('audit:inputPlaceholder', 'Enter content to inject into this section...')}
          fullWidth
          size="small"
          autoFocus
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          {t('common:actions.cancel', 'Cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeRoundedIcon />}
          onClick={onApply}
          disabled={!modalState.inputValue.trim()}
        >
          {t('audit:applyImprovement', 'Apply to Tailored CV')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
