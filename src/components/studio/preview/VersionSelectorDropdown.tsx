import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useTranslation } from 'react-i18next';
import { GeneratedCvVersion } from '../../../types/studio';
import { formatLocalizedDate } from '../../../utils/dateUtils';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface VersionSelectorDropdownProps {
  savedVersions: GeneratedCvVersion[];
  activeVersionId: string | null;
  currentCompanyName?: string;
  currentTargetRole?: string;
  currentMatchScore?: number;
  onSelectVersion: (versionId: string) => void;
  onPinAsGeneric: (versionId: string) => void;
  onUnpinGeneric?: (versionId: string) => void;
  onSaveAsGeneric: () => void;
  onCompareAgainstGeneric: (versionId?: string) => void;
  onOpenAdaptModal?: () => void;
}

/**
 * Presentational (Dumb) Dropdown component allowing candidates to switch
 * between saved CV versions, pin their canonical "CV Genérico", and compare
 * against it directly from Step 3 without navigating away.
 */
export const VersionSelectorDropdown: React.FC<VersionSelectorDropdownProps> = React.memo(({
  savedVersions,
  activeVersionId,
  currentCompanyName,
  currentTargetRole,
  currentMatchScore,
  onSelectVersion,
  onPinAsGeneric,
  onUnpinGeneric,
  onSaveAsGeneric,
  onCompareAgainstGeneric,
  onOpenAdaptModal,
}) => {
  const { t, i18n } = useTranslation(['preview', 'common']);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const activeVersion = savedVersions.find((v) => v.id === activeVersionId);
  const pinnedGenericVersion = savedVersions.find((v) => v.isPinned || v.isGeneric);

  // Label for trigger button
  const displayTitle = activeVersion
    ? activeVersion.isPinned
      ? t('preview:versionSelector.genericTitle', '📌 CV Genérico')
      : `${activeVersion.companyName || 'General'}${activeVersion.targetRole ? ` • ${activeVersion.targetRole}` : ''}`
    : currentCompanyName
    ? `${currentCompanyName}${currentTargetRole ? ` • ${currentTargetRole}` : ''}`
    : t('preview:versionSelector.defaultActive', 'CV en Vivo');

  const displayScore = activeVersion ? activeVersion.matchScore : (currentMatchScore || 0);

  return (
    <>
      <Tooltip title={t('preview:versionSelector.tooltip', 'Alternar entre CVs guardados o gestionar CV Genérico')}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={handleOpen}
          startIcon={
            activeVersion?.isPinned ? (
              <PushPinRoundedIcon sx={{ fontSize: '15px !important', color: 'primary.main' }} />
            ) : (
              <HistoryRoundedIcon sx={{ fontSize: '16px !important', color: 'text.secondary' }} />
            )
          }
          endIcon={<ArrowDropDownRoundedIcon sx={{ ml: -0.5, fontSize: 18 }} />}
          sx={{
            height: 28,
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'none',
            px: 1.2,
            borderColor: activeVersion?.isPinned ? alpha(theme.palette.primary.main, 0.4) : 'divider',
            bgcolor: activeVersion?.isPinned ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
            maxWidth: { xs: 150, sm: 220, md: 280 },
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            },
          }}
        >
          <Typography
            noWrap
            component="span"
            sx={{
              fontSize: '0.74rem',
              fontWeight: 700,
              maxWidth: { xs: 90, sm: 140, md: 190 },
              color: activeVersion?.isPinned ? 'primary.main' : 'text.primary',
            }}
          >
            {displayTitle}
          </Typography>

          {displayScore > 0 && (
            <Chip
              size="small"
              label={`${displayScore}%`}
              color={displayScore >= 80 ? 'success' : 'primary'}
              sx={{
                ml: 0.75,
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 800,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              width: { xs: 300, sm: 380 },
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header with Title & Count */}
        <Box
          sx={{
            px: 2,
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryRoundedIcon fontSize="small" color="primary" />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
              {t('preview:versionSelector.title', 'Versiones de CV Creadas')}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={savedVersions.length}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
          />
        </Box>

        {/* Pinned Generic CV Section */}
        {pinnedGenericVersion && (
          <Box
            sx={{
              p: 1.25,
              mx: 1,
              my: 1,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PushPinRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'primary.main' }}>
                  {t('preview:versionSelector.pinnedGenericHeader', 'CV Genérico (Baseline)')}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={t('preview:versionSelector.genericBadge', 'Genérico')}
                color="primary"
                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
              />
            </Box>

            <Typography variant="body2" sx={{ fontSize: '0.74rem', color: 'text.secondary', mb: 1 }} noWrap>
              {pinnedGenericVersion.companyName} • {pinnedGenericVersion.targetRole || 'Perfil General'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant={activeVersionId === pinnedGenericVersion.id ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => {
                  onSelectVersion(pinnedGenericVersion.id);
                  handleClose();
                }}
                disabled={activeVersionId === pinnedGenericVersion.id}
                sx={{
                  flex: 1,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 0.3,
                }}
              >
                {activeVersionId === pinnedGenericVersion.id
                  ? t('preview:versionSelector.currentActive', 'Activo')
                  : t('preview:versionSelector.loadGenericAction', 'Cargar Genérico')}
              </Button>

              <Tooltip title={t('preview:versionSelector.compareAgainstGeneric', 'Comparar versión actual vs este CV Genérico')}>
                <IconButton
                  size="small"
                  onClick={() => {
                    onCompareAgainstGeneric(pinnedGenericVersion.id);
                    handleClose();
                  }}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    color: 'primary.main',
                    p: 0.5,
                  }}
                >
                  <CompareArrowsRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Scrollable List of Versions */}
        <Box sx={{ overflowY: 'auto', flex: 1, maxHeight: 240 }}>
          {savedVersions.length === 0 ? (
            <Box sx={{ py: 3, px: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('preview:versionSelector.emptyNotice', 'No hay versiones guardadas todavía.')}
              </Typography>
            </Box>
          ) : (
            savedVersions.map((version) => {
              const isSelected = version.id === activeVersionId;
              const formattedDate = formatLocalizedDate(version.createdAt, i18n.language || 'es');

              return (
                <MenuItem
                  key={version.id}
                  selected={isSelected}
                  onClick={() => {
                    onSelectVersion(version.id);
                    handleClose();
                  }}
                  sx={{
                    py: 1,
                    px: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <ListItemIcon sx={{ minWidth: 26 }}>
                      {isSelected ? (
                        <CheckRoundedIcon fontSize="small" color="primary" />
                      ) : (
                        <BusinessRoundedIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: 18 }} />
                      )}
                    </ListItemIcon>

                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 600 }} noWrap>
                          {version.companyName || 'General'}
                        </Typography>
                        {version.isPinned && (
                          <PushPinRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>
                        {version.targetRole ? `${version.targetRole} • ` : ''}{formattedDate}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Micro Actions (Score, Pin, Compare) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    {version.matchScore > 0 && (
                      <Chip
                        size="small"
                        label={`${version.matchScore}%`}
                        color={version.matchScore >= 80 ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                      />
                    )}

                    <Tooltip
                      title={
                        version.isPinned
                          ? t('preview:versionSelector.unpinGeneric', 'Desanclar como genérico')
                          : t('preview:versionSelector.pinAsGeneric', 'Pinear como CV Genérico')
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (version.isPinned && onUnpinGeneric) {
                            onUnpinGeneric(version.id);
                          } else {
                            onPinAsGeneric(version.id);
                          }
                        }}
                        sx={{
                          p: 0.4,
                          color: version.isPinned ? 'primary.main' : 'text.disabled',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {version.isPinned ? (
                          <PushPinRoundedIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <PushPinOutlinedIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t('preview:versionSelector.compareAgainstGeneric', 'Comparar contra CV Genérico')}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          onCompareAgainstGeneric(version.id);
                          handleClose();
                        }}
                        sx={{
                          p: 0.4,
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <CompareArrowsRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </MenuItem>
              );
            })
          )}
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* Footer Actions: Save as Generic & Quick Compare */}
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.75, bgcolor: alpha(theme.palette.text.primary, 0.01) }}>
          <Button
            size="small"
            variant="text"
            color="primary"
            startIcon={<AddRoundedIcon fontSize="small" />}
            onClick={() => {
              onSaveAsGeneric();
              handleClose();
            }}
            sx={{
              justifyContent: 'flex-start',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
            }}
          >
            {t('preview:versionSelector.saveAsGenericAction', '+ Guardar actual como CV Genérico')}
          </Button>

          <Button
            size="small"
            variant="text"
            color="inherit"
            startIcon={<CompareArrowsRoundedIcon fontSize="small" />}
            onClick={() => {
              onCompareAgainstGeneric();
              handleClose();
            }}
            sx={{
              justifyContent: 'flex-start',
              fontSize: '0.76rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              px: 1.5,
              py: 0.5,
            }}
          >
            {t('preview:versionSelector.compareCurrentVsGeneric', '⇄ Comparar versión actual vs Genérico')}
          </Button>

          {onOpenAdaptModal && (
            <Button
              size="small"
              variant="text"
              color="primary"
              startIcon={<PostAddRoundedIcon fontSize="small" />}
              onClick={() => {
                onOpenAdaptModal();
                handleClose();
              }}
              sx={{
                justifyContent: 'flex-start',
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
              }}
            >
              {t('preview:toolbar.adaptToNewOffer', 'Adaptar a otra oferta')}
            </Button>
          )}
        </Box>
      </Menu>
    </>
  );
});
