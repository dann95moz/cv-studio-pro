import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

import { GeneratedCvVersion } from '../../../types';

export interface ApplicationsEmptyCardProps {
  savedVersionsCount: number;
  onStartNewResume: () => void;
  onTrackApplication: (
    prefillColumnId?: string,
    prefillVersion?: GeneratedCvVersion,
    sourceType?: 'internal' | 'external'
  ) => void;
}

export const ApplicationsEmptyCard: React.FC<ApplicationsEmptyCardProps> = ({
  savedVersionsCount,
  onStartNewResume,
  onTrackApplication,
}) => {
  const { t } = useTranslation(['history']);
  const theme = useTheme();

  if (savedVersionsCount === 0) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 720,
          mx: 'auto',
          width: '100%',
          textAlign: 'center',
          borderRadius: RADIUS_TOKENS.lg,
          borderStyle: 'dashed',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: '0 !important' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ViewKanbanRoundedIcon fontSize="large" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('history:empty.title', 'No Applications Tracked Yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
            {t(
              'history:empty.desc',
              'Synthesize or save a tailored resume in Resume Studio, then click "Track Application" to organize your recruitment pipeline on the Kanban board.'
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={onStartNewResume}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              {t('history:empty.action', 'Start New Application')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddRoundedIcon />}
              onClick={() => onTrackApplication(undefined, undefined, 'external')}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              {t('history:empty.actionDirect', '+ Track Direct Process')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 3, sm: 4.5 },
        maxWidth: 720,
        mx: 'auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: RADIUS_TOKENS.lg,
        bgcolor: 'background.paper',
        border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: '0 !important' }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: RADIUS_TOKENS.md,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AddRoundedIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {t('history:emptyBoardWithVersions.title', {
            count: savedVersionsCount,
            defaultValue:
              savedVersionsCount === 1
                ? 'You have 1 tailored CV ready to track'
                : `You have ${savedVersionsCount} tailored CVs ready to track`,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.5 }}>
          {t(
            'history:emptyBoardWithVersions.desc',
            'Select which CV version was actually submitted to an employer to add it to your active recruitment grid.'
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mt: 0.75 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={() => onTrackApplication()}
            sx={{ fontWeight: 700, px: 3, py: 1 }}
          >
            {t('history:actions.trackApp', 'Track Application')}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<AddRoundedIcon />}
            onClick={() => onTrackApplication(undefined, undefined, 'external')}
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            {t('history:empty.actionDirect', '+ Track Direct Process')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
