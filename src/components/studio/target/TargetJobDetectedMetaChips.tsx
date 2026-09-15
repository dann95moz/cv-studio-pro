import React, { useState } from 'react';
import {
  Box,
  Chip,
  Popover,
  TextField,
  Typography,
  IconButton,
  Button,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface TargetJobDetectedMetaChipsProps {
  companyName: string;
  onCompanyChange: (val: string) => void;
  targetRole: string;
  onRoleChange: (val: string) => void;
  wordCount: number;
}

/**
 * TargetJobDetectedMetaChips
 * Displays auto-detected company name, target role, and vacancy word count as subtle, non-blocking chips.
 * Clicking either chip or the edit button opens a lightweight popover to adjust values if desired.
 */
export const TargetJobDetectedMetaChips: React.FC<TargetJobDetectedMetaChipsProps> = React.memo(({
  companyName,
  onCompanyChange,
  targetRole,
  onRoleChange,
  wordCount,
}) => {
  const { t } = useTranslation(['target', 'common']);
  const theme = useTheme();

  // Popover state for optional manual editing
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [editCompany, setEditCompany] = useState(companyName);
  const [editRole, setEditRole] = useState(targetRole);

  const handleOpenEdit = (event: React.MouseEvent<HTMLElement>) => {
    setEditCompany(companyName);
    setEditRole(targetRole);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    onCompanyChange(editCompany);
    onRoleChange(editRole);
    handleClose();
  };

  const hasAnyMeta = Boolean(companyName || targetRole || wordCount > 0);
  if (!hasAnyMeta) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        px: 0.5,
      }}
    >
      {/* Left: Detected metadata chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {companyName ? (
          <Tooltip title={t('target:fields.detectedCompanyHint', 'Company auto-detected from job description. Click to edit.')}>
            <Chip
              icon={<BusinessRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              label={companyName}
              size="small"
              onClick={handleOpenEdit}
              variant="outlined"
              sx={{
                borderRadius: RADIUS_TOKENS.full,
                borderColor: alpha(theme.palette.primary.main, 0.35),
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: 'primary.main',
                },
              }}
            />
          </Tooltip>
        ) : null}

        {targetRole ? (
          <Tooltip title={t('target:fields.detectedRoleHint', 'Role auto-detected from job description. Click to edit.')}>
            <Chip
              icon={<BadgeRoundedIcon sx={{ fontSize: '1rem !important' }} />}
              label={targetRole}
              size="small"
              onClick={handleOpenEdit}
              variant="outlined"
              sx={{
                borderRadius: RADIUS_TOKENS.full,
                borderColor: alpha(theme.palette.secondary.main, 0.35),
                bgcolor: alpha(theme.palette.secondary.main, 0.06),
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.12),
                  borderColor: 'secondary.main',
                },
              }}
            />
          </Tooltip>
        ) : null}

        {/* Optional quick edit button */}
        {(companyName || targetRole) && (
          <Tooltip title={t('target:fields.editMeta', 'Edit company or role')}>
            <IconButton
              size="small"
              onClick={handleOpenEdit}
              sx={{
                width: 24,
                height: 24,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Right: Word count badge */}
      {wordCount > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <DescriptionRoundedIcon sx={{ fontSize: 15, opacity: 0.7 }} />
          <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.85 }}>
            {wordCount} {t('target:fields.words', 'words')}
          </Typography>
        </Box>
      )}

      {/* Lightweight Popover for manual adjustments */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {t('target:fields.editMetaTitle', 'Edit Vacancy Info')}
        </Typography>

        <TextField
          label={t('target:fields.company', 'Company Name')}
          value={editCompany}
          onChange={(e) => setEditCompany(e.target.value)}
          size="small"
          fullWidth
          autoFocus
        />

        <TextField
          label={t('target:fields.role', 'Target Role')}
          value={editRole}
          onChange={(e) => setEditRole(e.target.value)}
          size="small"
          fullWidth
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
          <Button size="small" variant="text" color="inherit" onClick={handleClose}>
            {t('common:actions.cancel', 'Cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<CheckRoundedIcon />}
            onClick={handleSave}
          >
            {t('common:actions.save', 'Save')}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
});

TargetJobDetectedMetaChips.displayName = 'TargetJobDetectedMetaChips';
