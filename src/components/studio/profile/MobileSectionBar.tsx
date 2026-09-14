import React, { useState, useMemo } from 'react';
import {
  Box,
  ButtonBase,
  IconButton,
  Typography,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useTranslation } from 'react-i18next';
import { ProfileSectionKey, ProfileSectionMeta } from './ProfileNavRail';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface MobileSectionBarProps {
  activeSection: ProfileSectionKey;
  onSectionChange: (section: ProfileSectionKey) => void;
  allSections: ProfileSectionMeta[];
  onAddSectionClick?: () => void;
}

export const MobileSectionBar: React.FC<MobileSectionBarProps> = ({
  activeSection,
  onSectionChange,
  allSections,
  onAddSectionClick,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const currentIndex = useMemo(() => {
    const idx = allSections.findIndex((s) => s.key === activeSection);
    return idx >= 0 ? idx : 0;
  }, [allSections, activeSection]);

  const activeMeta = allSections[currentIndex] || allSections[0];

  const isSectionBlocked = (targetIdx: number) => {
    if (targetIdx <= currentIndex) return false;
    for (let i = 0; i < targetIdx; i++) {
      const sec = allSections[i];
      const isReq =
        sec.key === 'personal' ||
        sec.key === 'summary' ||
        sec.key === 'skills' ||
        sec.key === 'education' ||
        sec.key === 'languages';
      if (isReq && !sec.isComplete) {
        return true;
      }
    }
    return false;
  };

  const activeLabel = activeMeta?.labelKey
    ? t(activeMeta.labelKey, activeMeta.defaultLabel)
    : activeMeta?.defaultLabel || '';

  return (
    <>
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 0.75,
          px: 1,
          boxSizing: 'border-box',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.text.primary, 0.015),
        }}
      >
        {/* Center Interactive Pill */}
        <ButtonBase
          onClick={() => setIsSheetOpen(true)}
          aria-label={t('profile:nav.sheetTitle', 'Profile Sections')}
          sx={{
            width: '100%',
            maxWidth: 580,
            py: 0.7,
            px: 1.5,
            borderRadius: RADIUS_TOKENS.full,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            transition: 'all 0.15s ease',
            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {activeMeta?.icon}
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeLabel}
            </Typography>

            {activeMeta?.isComplete ? (
              <CheckRoundedIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }} />
            ) : typeof activeMeta?.count === 'number' && activeMeta.count > 0 ? (
              <Chip
                label={activeMeta.count}
                size="small"
                color="primary"
                sx={{ height: 18, fontSize: '0.68rem', px: 0.25, flexShrink: 0 }}
              />
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                color: 'text.secondary',
              }}
            >
              {currentIndex + 1}/{allSections.length}
            </Typography>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Box>
        </ButtonBase>
      </Box>

      {/* Sections Selector Bottom Sheet */}
      <Drawer
        anchor="bottom"
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '75vh',
              bgcolor: 'background.paper',
              pb: 'max(env(safe-area-inset-bottom, 0px), 16px)',
            },
          },
        }}
      >
        {/* Drag Handle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
            }}
          />
        </Box>

        {/* Drawer Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t('profile:nav.sheetTitle', 'Profile Sections')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('profile:nav.sectionCounter', '{{current}} of {{total}} sections', {
                current: currentIndex + 1,
                total: allSections.length,
              })}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsSheetOpen(false)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Section List */}
        <List sx={{ px: 1.5, py: 1 }}>
          {allSections.map((sec, idx) => {
            const isActive = activeSection === sec.key;
            const isBlocked = isSectionBlocked(idx);
            const label = sec.labelKey ? t(sec.labelKey, sec.defaultLabel) : sec.defaultLabel;

            return (
              <ListItem key={sec.key} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  disabled={isBlocked}
                  onClick={() => {
                    if (!isBlocked) {
                      onSectionChange(sec.key);
                      setIsSheetOpen(false);
                    }
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    '&.Mui-disabled': {
                      opacity: 0.4,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {sec.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.9rem',
                          color: isActive ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {label}
                      </Typography>
                    }
                  />
                  {sec.isComplete ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  ) : typeof sec.count === 'number' && sec.count > 0 ? (
                    <Chip
                      label={sec.count}
                      size="small"
                      color={isActive ? 'primary' : 'default'}
                      variant={isActive ? 'filled' : 'outlined'}
                      sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                      #{idx + 1}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Add Section Action in Bottom Sheet */}
        {onAddSectionClick && (
          <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={() => {
                setIsSheetOpen(false);
                onAddSectionClick();
              }}
              sx={{
                borderStyle: 'dashed',
                fontWeight: 700,
                py: 1,
              }}
            >
              {t('profile:customSections.addSectionBtn', 'Add Section')}
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
};
