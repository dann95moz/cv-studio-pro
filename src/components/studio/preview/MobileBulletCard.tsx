import React from 'react';
import { Box, Card, CardContent, Button } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useTranslation } from 'react-i18next';
import { safeMarkdownInline } from '../../../utils/sanitize';

export interface MobileBulletCardProps {
  bullet: string;
  isBulletDisabled: boolean;
  hasUndo: boolean;
  onToggleVisibility: () => void;
  onOpenEdit: () => void;
  onOpenAiRegenerate: () => void;
  onUndo: () => void;
}

/**
 * Pure dumb presentational card representing a single editable/regenerable bullet
 * on mobile viewports for both experience and project sections.
 */
export const MobileBulletCard: React.FC<MobileBulletCardProps> = ({
  bullet,
  isBulletDisabled,
  hasUndo,
  onToggleVisibility,
  onOpenEdit,
  onOpenAiRegenerate,
  onUndo,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: 'background.paper',
        opacity: isBulletDisabled ? 0.6 : 1,
        borderStyle: isBulletDisabled ? 'dashed' : 'solid',
        transition: 'opacity 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            fontSize: '0.86rem',
            lineHeight: 1.5,
            color: 'text.primary',
            textDecoration: isBulletDisabled ? 'line-through' : 'none',
            mb: 1.75,
            '& strong': { fontWeight: 700, color: 'text.primary' },
          }}
          dangerouslySetInnerHTML={{ __html: safeMarkdownInline(bullet) }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Button
            size="medium"
            variant={isBulletDisabled ? 'contained' : 'outlined'}
            color={isBulletDisabled ? 'inherit' : 'primary'}
            onClick={onToggleVisibility}
            startIcon={isBulletDisabled ? <VisibilityRoundedIcon sx={{ fontSize: 16 }} /> : <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />}
            title={t('preview:bullets.toggleTooltip', 'Activar o desactivar viñeta para ahorrar espacio')}
          >
            {isBulletDisabled ? t('preview:bullets.activate', 'Activar') : t('preview:bullets.deactivate', 'Ocultar')}
          </Button>

          <Button
            size="medium"
            variant="outlined"
            onClick={onOpenEdit}
            startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ flex: 1 }}
          >
            {t('preview:aiRegen.editItem', 'Editar')}
          </Button>

          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={onOpenAiRegenerate}
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ flex: 1 }}
          >
            {t('preview:aiRegen.button', 'Regenerar')}
          </Button>

          {hasUndo && (
            <Button
              size="medium"
              variant="outlined"
              onClick={onUndo}
              startIcon={<UndoRoundedIcon sx={{ fontSize: 16 }} />}
            >
              {t('preview:aiRegen.undo', 'Deshacer')}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
