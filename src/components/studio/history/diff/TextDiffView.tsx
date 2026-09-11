import React from 'react';
import { Box, Typography, ButtonGroup, Button, useTheme, alpha } from '@mui/material';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import { useTranslation } from 'react-i18next';
import { DiffResult } from '../../../../utils/diffUtils';

export interface TextDiffViewProps {
  diffResult: DiffResult;
  verALabel: string;
  verAText: string;
  verBLabel: string;
  verBText: string;
  subMode: 'unified' | 'split';
  onSubModeChange: (mode: 'unified' | 'split') => void;
}

export const TextDiffView: React.FC<TextDiffViewProps> = ({
  diffResult,
  verALabel,
  verAText,
  verBLabel,
  verBText,
  subMode,
  onSubModeChange,
}) => {
  const { t } = useTranslation(['history', 'common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sub-toolbar: Unified vs Split Toggle */}
      <Box
        sx={{
          py: 0.75,
          px: 2.5,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={subMode === 'unified' ? 'contained' : 'outlined'}
            onClick={() => onSubModeChange('unified')}
            startIcon={<ViewAgendaRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem' }}
          >
            {t('history:diff.unified', 'Unified Diff')}
          </Button>
          <Button
            variant={subMode === 'split' ? 'contained' : 'outlined'}
            onClick={() => onSubModeChange('split')}
            startIcon={<ViewColumnRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem' }}
          >
            {t('history:diff.split', 'Side-by-Side Text')}
          </Button>
        </ButtonGroup>
      </Box>

      {/* Main Diff Code Display */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
        {subMode === 'unified' ? (
          /* UNIFIED DIFF VIEW */
          <Box sx={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '0.82rem', lineHeight: 1.6 }}>
            {diffResult.lines.map((line, idx) => {
              const isAdded = line.type === 'added';
              const isRemoved = line.type === 'removed';

              let bg = 'transparent';
              let color = 'text.primary';
              let prefix = '  ';

              if (isAdded) {
                bg = alpha(theme.palette.success.main, isDark ? 0.18 : 0.12);
                color = 'success.main';
                prefix = '+ ';
              } else if (isRemoved) {
                bg = alpha(theme.palette.error.main, isDark ? 0.18 : 0.1);
                color = 'error.main';
                prefix = '- ';
              }

              return (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    bgcolor: bg,
                    color: color,
                    px: 2,
                    py: 0.25,
                    borderLeft: isAdded
                      ? `3px solid ${theme.palette.success.main}`
                      : isRemoved
                      ? `3px solid ${theme.palette.error.main}`
                      : '3px solid transparent',
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      width: 44,
                      userSelect: 'none',
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      textAlign: 'right',
                      pr: 2,
                      flexShrink: 0,
                    }}
                  >
                    {line.newLineNumber || line.oldLineNumber || ''}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 700,
                      width: 20,
                      userSelect: 'none',
                      color: isAdded ? 'success.main' : isRemoved ? 'error.main' : 'text.disabled',
                      flexShrink: 0,
                    }}
                  >
                    {prefix}
                  </Typography>
                  <Typography component="span" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, fontFamily: 'inherit' }}>
                    {line.content || ' '}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          /* SIDE-BY-SIDE SPLIT VIEW */
          <Box sx={{ display: 'flex', height: '100%', minHeight: 400 }}>
            {/* Left Column: Version A */}
            <Box sx={{ flex: 1, borderRight: `1px solid ${theme.palette.divider}`, p: 2, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                {verALabel}
              </Typography>
              <Box sx={{ fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {verAText}
              </Box>
            </Box>

            {/* Right Column: Version B */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                {verBLabel}
              </Typography>
              <Box sx={{ fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {verBText}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
