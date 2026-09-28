import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { AiHoverActionsPillProps } from '../../../types/components';

/**
 * Presentational dumb component for AI granular bullet and summary hover actions.
 * Displays compact icon buttons (accept, undo, regenerate, audit warning) with zero text clutter.
 */
export const AiHoverActionsPill: React.FC<AiHoverActionsPillProps> = ({
  hasUndo,
  isRecentlyRegenerated = false,
  onAccept,
  onUndo,
  onOpenAiPopover,
  auditIssue,
  onOpenAuditPopover,
}) => {
  const { t } = useTranslation(['preview', 'common']);
  const theme = useTheme();

  return (
    <span
      className={`no-print cv-ai-hover-actions ${isRecentlyRegenerated ? 'is-recently-regenerated' : ''} ${hasUndo ? 'has-undo' : ''}`}
      aria-hidden="true"
      data-no-ats="true"
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: RADIUS_TOKENS.full,
          boxShadow: 2,
          p: '2px 3px',
        }}
      >
        {hasUndo && (
          <>
            <Tooltip title={t('preview:aiRegen.accept', 'Accept changes')} arrow placement="top">
              <IconButton
                size="small"
                onClick={onAccept}
                color="success"
                aria-label={t('preview:aiRegen.accept', 'Accept changes')}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: 'success.main',
                  borderRadius: RADIUS_TOKENS.full,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('preview:aiRegen.undoTooltip', 'Undo and revert to previous text')} arrow placement="top">
              <IconButton
                size="small"
                onClick={onUndo}
                aria-label={t('preview:aiRegen.undoTooltip', 'Undo and revert to previous text')}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  color: 'text.secondary',
                  borderRadius: RADIUS_TOKENS.full,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.16),
                    color: 'text.primary',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <UndoRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {auditIssue && (
          <Tooltip title={t(auditIssue.titleKey, auditIssue.defaultTitle)} arrow placement="top">
            <IconButton
              size="small"
              onClick={onOpenAuditPopover}
              aria-label={t(auditIssue.titleKey, auditIssue.defaultTitle)}
              sx={{
                width: 24,
                height: 24,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: 'warning.main',
                borderRadius: RADIUS_TOKENS.full,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={t('preview:aiRegen.tooltip', 'Regenerate with AI')} arrow placement="top">
          <IconButton
            size="small"
            onClick={onOpenAiPopover}
            className="cv-ai-sparkle-btn"
            aria-label={t('preview:aiRegen.tooltip', 'Regenerate with AI')}
            sx={{
              width: 24,
              height: 24,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              borderRadius: RADIUS_TOKENS.full,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                transform: 'scale(1.1)',
              },
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </span>
  );
};
