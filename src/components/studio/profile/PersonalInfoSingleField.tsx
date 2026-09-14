import React from 'react';
import { Box, Typography, TextField, Fade, useTheme, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { StepFieldConfig } from './personalInfoStepsConfig';

export interface PersonalInfoSingleFieldProps {
  activeConfig: StepFieldConfig;
  currentValue: string;
  validationError: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (val: string) => void;
  onEnterPress: () => void;
}

export const PersonalInfoSingleField: React.FC<PersonalInfoSingleFieldProps> = React.memo(({
  activeConfig,
  currentValue,
  validationError,
  inputRef,
  onChange,
  onEnterPress,
}) => {
  const { t } = useTranslation(['profile']);
  const theme = useTheme();

  return (
    <Fade in key={activeConfig.id} timeout={220}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 580,
          width: '100%',
          mx: 'auto',
          py: { xs: 1.5, sm: 3 },
        }}
      >
        {/* Field Header / Question */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            {activeConfig.iconNode}
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
                lineHeight: 1.25,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {t(activeConfig.questionKey, activeConfig.defaultQuestion)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              {t(activeConfig.hintKey, activeConfig.defaultHint)}
            </Typography>
          </Box>
        </Box>

        {/* Single Hero Text Field */}
        <Box sx={{ mt: 1, mb: 1 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="medium"
            variant="outlined"
            type={activeConfig.inputType || 'text'}
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onEnterPress();
              }
            }}
            error={Boolean(validationError)}
            helperText={validationError}
            placeholder={
              activeConfig.placeholderKey
                ? t(activeConfig.placeholderKey, activeConfig.defaultPlaceholder || activeConfig.placeholder)
                : activeConfig.placeholder
            }
            slotProps={{
              input: {
                sx: {
                  fontSize: { xs: '1.05rem', sm: '1.15rem' },
                  fontWeight: 600,
                  py: 0.5,
                  borderRadius: RADIUS_TOKENS.md,
                  bgcolor: 'background.paper',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
});

PersonalInfoSingleField.displayName = 'PersonalInfoSingleField';
