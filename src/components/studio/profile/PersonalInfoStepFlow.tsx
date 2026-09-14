import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useTranslation } from 'react-i18next';
import { ContactType, ContactItem } from '../../../types/cv';
import { Icon, IconType } from '../../Icons';
import { hapticsService } from '../../../core/haptics';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';

export interface PersonalInfoStepFlowProps {
  name: string;
  title: string;
  contacts?: ContactItem[];
  onNameChange: (name: string) => void;
  onTitleChange: (title: string) => void;
  onContactChange: (type: ContactType, label: string, url?: string) => void;
  onAdvanceSection?: () => void;
  isProfileComplete?: boolean;
}

interface StepFieldConfig {
  id: string;
  iconNode: React.ReactNode;
  questionKey: string;
  defaultQuestion: string;
  hintKey: string;
  defaultHint: string;
  placeholder: string;
  isOptional: boolean;
  type: 'name' | 'title' | 'contact';
  contactType?: ContactType;
  inputType?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PersonalInfoStepFlow: React.FC<PersonalInfoStepFlowProps> = ({
  name,
  title,
  contacts = [],
  onNameChange,
  onTitleChange,
  onContactChange,
  onAdvanceSection,
  isProfileComplete = false,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const contactValues = React.useMemo(() => {
    const map: Partial<Record<ContactType, string>> = {};
    (contacts || []).forEach((c) => {
      const raw =
        c.type === 'email'
          ? c.label || c.url || ''
          : c.type === 'location' || c.type === 'phone' || c.type === 'text'
          ? c.label || ''
          : c.url || c.label || '';

      let cleaned = raw
        .replace(/^mailto:/i, '')
        .replace(/\\([\[\]+*`_~\\-])/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .trim();

      if (c.type === 'linkedin' || c.type === 'github' || c.type === 'globe') {
        const urlMatch = cleaned.match(/https?:\/\/[^\s)\]]+/i);
        cleaned = urlMatch ? urlMatch[0] : cleaned.replace(/[*_\[\]()]/g, '').trim();
      } else {
        cleaned = cleaned.replace(/[*_\[\]]/g, '').replace(/^\\+|\\+$/g, '').trim();
      }
      map[c.type] = cleaned;
    });
    return map;
  }, [contacts]);

  const stepsConfig: StepFieldConfig[] = [
    {
      id: 'name',
      type: 'name',
      iconNode: <PersonRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      questionKey: 'profile:stepFlow.questions.fullName',
      defaultQuestion: 'What is your full name?',
      hintKey: 'profile:stepFlow.hints.fullName',
      defaultHint: 'This will appear as the main heading on your resume.',
      placeholder: 'e.g. Alex Morgan',
      isOptional: false,
    },
    {
      id: 'title',
      type: 'title',
      iconNode: <BadgeRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      questionKey: 'profile:stepFlow.questions.jobTitle',
      defaultQuestion: 'What is your professional title or headline?',
      hintKey: 'profile:stepFlow.hints.jobTitle',
      defaultHint: 'Your headline (e.g. Staff Frontend Architect, Lead DevOps).',
      placeholder: 'e.g. Senior Software Engineer | Full Stack & Cloud',
      isOptional: false,
    },
    {
      id: 'email',
      type: 'contact',
      contactType: 'email',
      inputType: 'email',
      iconNode: <Icon type="email" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.email',
      defaultQuestion: 'What email can recruiters reach you at?',
      hintKey: 'profile:stepFlow.hints.email',
      defaultHint: 'Recruiters and ATS systems will use this to contact you.',
      placeholder: 'e.g. alex.morgan@example.com',
      isOptional: false,
    },
    {
      id: 'location',
      type: 'contact',
      contactType: 'location',
      iconNode: <Icon type="location" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.location',
      defaultQuestion: 'Where are you located?',
      hintKey: 'profile:stepFlow.hints.location',
      defaultHint: 'City and Country (e.g. London, UK or Remote - US).',
      placeholder: 'e.g. Madrid, Spain | Remote',
      isOptional: false,
    },
    {
      id: 'phone',
      type: 'contact',
      contactType: 'phone',
      inputType: 'tel',
      iconNode: <Icon type="phone" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.phone',
      defaultQuestion: 'Do you have a contact phone number?',
      hintKey: 'profile:stepFlow.hints.phone',
      defaultHint: 'Optional. Useful if employers reach out via phone or WhatsApp.',
      placeholder: 'e.g. +1 555 123 4567',
      isOptional: true,
    },
    {
      id: 'linkedin',
      type: 'contact',
      contactType: 'linkedin',
      inputType: 'url',
      iconNode: <Icon type="linkedin" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.linkedin',
      defaultQuestion: 'Do you have a LinkedIn profile?',
      hintKey: 'profile:stepFlow.hints.linkedin',
      defaultHint: 'Optional. Recommended so evaluators can review your network and recommendations.',
      placeholder: 'linkedin.com/in/username',
      isOptional: true,
    },
    {
      id: 'portfolio',
      type: 'contact',
      contactType: 'globe',
      inputType: 'url',
      iconNode: <Icon type="globe" size={26} style={{ color: theme.palette.primary.main }} />,
      questionKey: 'profile:stepFlow.questions.portfolio',
      defaultQuestion: 'Do you have a portfolio or personal website?',
      hintKey: 'profile:stepFlow.hints.portfolio',
      defaultHint: 'Optional. Great for demonstrating live demos, GitHub repositories, or design work.',
      placeholder: 'myportfolio.dev',
      isOptional: true,
    },
  ];

  const totalFields = stepsConfig.length;

  const isAlreadyComplete = React.useMemo(() => {
    return Boolean(
      name &&
      name.trim().length >= 2 &&
      contacts &&
      contacts.some(
        (c) =>
          (c.type === 'email' || c.type === 'location' || c.type === 'phone') &&
          Boolean((c.label || c.url || '').trim())
      )
    );
  }, [name, contacts]);

  // Step index from 0 to totalFields (where totalFields is the Review Summary screen)
  const [currentStep, setCurrentStep] = useState(() => (isAlreadyComplete ? totalFields : 0));
  const [isEditingSingleField, setIsEditingSingleField] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const prevStepRef = useRef<number | null>(null);

  // When complete data is available (e.g. from async load, sample load, or parent update),
  // ensure user sees the Review Summary checklist instead of being stuck in the single-field flow,
  // unless user is explicitly editing a single field.
  const previousCompleteRef = useRef(isAlreadyComplete);
  useEffect(() => {
    if (isAlreadyComplete && !previousCompleteRef.current && currentStep === 0 && !isEditingSingleField) {
      setCurrentStep(totalFields);
    }
    previousCompleteRef.current = isAlreadyComplete;
  }, [isAlreadyComplete, currentStep, isEditingSingleField, totalFields]);

  const isReviewScreen = currentStep >= totalFields;
  const activeConfig = !isReviewScreen ? stepsConfig[currentStep] : null;

  // Read current value
  const currentValue = React.useMemo(() => {
    if (!activeConfig) return '';
    if (activeConfig.type === 'name') return name || '';
    if (activeConfig.type === 'title') return title || '';
    if (activeConfig.type === 'contact' && activeConfig.contactType) {
      return contactValues[activeConfig.contactType] || '';
    }
    return '';
  }, [activeConfig, name, title, contactValues]);

  // Autofocus when step changes ONLY IF the field is currently empty.
  // If it already has information, do NOT open the soft keyboard automatically (focus only upon user touch).
  useEffect(() => {
    if (prevStepRef.current === currentStep) {
      return;
    }
    prevStepRef.current = currentStep;

    if (!isReviewScreen && inputRef.current && activeConfig) {
      let val = '';
      if (activeConfig.type === 'name') val = name || '';
      else if (activeConfig.type === 'title') val = title || '';
      else if (activeConfig.type === 'contact' && activeConfig.contactType) {
        val = contactValues[activeConfig.contactType] || '';
      }
      const hasValue = Boolean(val && val.trim().length > 0);
      if (!hasValue) {
        inputRef.current.focus();
      } else {
        inputRef.current.blur();
      }
    }
  }, [currentStep, isReviewScreen, activeConfig, name, title, contactValues]);

  // Android Back Handler (Priority 50: Return from single edit to review, or step back one question)
  useEffect(() => {
    return backButtonRegistry.register({
      id: 'personal-info-step-back',
      priority: 50,
      handler: () => {
        if (isEditingSingleField) {
          setIsEditingSingleField(false);
          setCurrentStep(totalFields);
          setValidationError(null);
          hapticsService.impactLight();
          return true;
        }
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
          setValidationError(null);
          hapticsService.impactLight();
          return true;
        }
        return false; // let priority 40 choice view handler take over
      },
    });
  }, [currentStep, isEditingSingleField, totalFields]);

  const handleValueChange = (val: string) => {
    if (validationError) setValidationError(null);
    if (!activeConfig) return;

    if (activeConfig.type === 'name') {
      onNameChange(val);
    } else if (activeConfig.type === 'title') {
      onTitleChange(val);
    } else if (activeConfig.type === 'contact' && activeConfig.contactType) {
      onContactChange(activeConfig.contactType, val);
    }
  };

  const handleNext = useCallback(() => {
    if (isReviewScreen) {
      onAdvanceSection?.();
      return;
    }

    if (!activeConfig) return;

    const trimmed = currentValue.trim();

    // Required validation
    if (!activeConfig.isOptional && trimmed.length === 0) {
      setValidationError(t('common:validation.required', 'This field is required.'));
      return;
    }

    // Email format validation
    if (activeConfig.contactType === 'email' && trimmed.length > 0 && !EMAIL_REGEX.test(trimmed)) {
      setValidationError(
        t('profile:stepFlow.emailInvalid', 'Please enter a valid email address.')
      );
      return;
    }

    setValidationError(null);
    hapticsService.impactLight();

    if (isEditingSingleField) {
      setIsEditingSingleField(false);
      setCurrentStep(totalFields);
      return;
    }

    if (currentStep < totalFields) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isReviewScreen, activeConfig, currentValue, isEditingSingleField, currentStep, totalFields, onAdvanceSection, t]);

  const handlePrev = useCallback(() => {
    if (isEditingSingleField) {
      setValidationError(null);
      hapticsService.impactLight();
      setIsEditingSingleField(false);
      setCurrentStep(totalFields);
      return;
    }
    if (currentStep > 0) {
      setValidationError(null);
      hapticsService.impactLight();
      setCurrentStep((prev) => prev - 1);
    }
  }, [isEditingSingleField, currentStep, totalFields]);

  const handleJumpToField = (fieldIndex: number) => {
    if (fieldIndex > currentStep && currentStep < totalFields) {
      if (!name || name.trim().length < 2) {
        setValidationError(t('common:validation.required', 'This field is required.'));
        return;
      }
    }
    setValidationError(null);
    hapticsService.impactLight();
    if (isReviewScreen) {
      setIsEditingSingleField(true);
    }
    setCurrentStep(fieldIndex);
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
    enabled: true,
  });

  return (
    <Box
      {...swipeHandlers}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: { xs: 440, sm: 460 },
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        gap: 3,
        touchAction: 'pan-y',
      }}
    >
      {/* Top Micro-Stepper & Mode Switch */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          pb: 1.5,
        }}
      >
        {isEditingSingleField ? (
          <Button
            size="small"
            variant="text"
            color="primary"
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              setIsEditingSingleField(false);
              setCurrentStep(totalFields);
              setValidationError(null);
            }}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 1,
            }}
          >
            {t('profile:stepFlow.backToReview', 'Back to summary')}
          </Button>
        ) : !isReviewScreen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {/* Step Dots */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                {stepsConfig.map((s, idx) => {
                  const isPassed = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <Box
                      key={s.id}
                      onClick={() => handleJumpToField(idx)}
                      sx={{
                        width: isCurrent ? 18 : 6,
                        height: 6,
                        borderRadius: 9999,
                        bgcolor: isCurrent
                          ? 'primary.main'
                          : isPassed
                          ? alpha(theme.palette.primary.main, 0.45)
                          : alpha(theme.palette.text.disabled, 0.25),
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  );
                })}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  letterSpacing: 0.2,
                }}
              >
                {t('profile:stepFlow.stepCount', '{{current}} of {{total}}', {
                  current: currentStep + 1,
                  total: totalFields,
                })}
              </Typography>
            </Box>

            {isAlreadyComplete && (
              <Button
                size="small"
                variant="text"
                color="primary"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setIsEditingSingleField(false);
                  setCurrentStep(totalFields);
                  setValidationError(null);
                }}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  px: 1,
                }}
              >
                {t('profile:stepFlow.backToReview', 'Back to summary')}
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {t('profile:stepFlow.reviewTitle', 'Personal Information Complete!')}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={() => {
                setIsEditingSingleField(false);
                setCurrentStep(0);
                setValidationError(null);
              }}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              {t('profile:stepFlow.switchStep', 'Step-by-step mode')}
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Conversational Workspace */}
      {!isReviewScreen && activeConfig ? (
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
                  borderRadius: 2,
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
                onChange={(e) => handleValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                error={Boolean(validationError)}
                helperText={validationError}
                placeholder={activeConfig.placeholder}
                slotProps={{
                  input: {
                    sx: {
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      fontWeight: 600,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Fade>
      ) : (
        /* Final Step: Completion Review Summary */
        <Fade in timeout={250}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 580,
              width: '100%',
              mx: 'auto',
              py: 1,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.success.main, 0.03),
                borderColor: alpha(theme.palette.success.main, 0.25),
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 26 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {t('profile:stepFlow.reviewTitle', 'Personal Information Complete!')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t(
                      'profile:stepFlow.reviewSubtitle',
                      'Verify that your details are accurate before continuing.'
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Review Checklist */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stepsConfig.map((s, idx) => {
                  const val =
                    s.type === 'name'
                      ? name
                      : s.type === 'title'
                      ? title
                      : s.contactType
                      ? contactValues[s.contactType]
                      : '';
                  const hasVal = Boolean(val && val.trim().length > 0);

                  return (
                    <Box
                      key={s.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        px: 1.25,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex', flexShrink: 0 }}>
                          {s.iconNode}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
                          >
                            {t(s.questionKey, s.defaultQuestion)}
                          </Typography>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: 700,
                              color: hasVal ? 'text.primary' : 'text.disabled',
                              fontStyle: hasVal ? 'normal' : 'italic',
                              fontSize: '0.85rem',
                            }}
                          >
                            {hasVal ? val : t('profile:stepFlow.skipped', 'Skipped')}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleJumpToField(idx)}
                        aria-label={t('profile:stepFlow.edit', 'Edit')}
                        sx={{ color: 'primary.main', p: 0.5 }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* Bottom Step Action Controller (Hidden on summary review when profile is already complete, as global Continue to Target Vacancy footer handles it) */}
      {(!isReviewScreen || !isProfileComplete) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pt: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          {/* Previous Field Button / Return to Summary */}
          {isEditingSingleField ? (
            <Button
              size="medium"
              variant="text"
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={handlePrev}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                px: 1.5,
              }}
            >
              {t('profile:stepFlow.backToReview', 'Back to summary')}
            </Button>
          ) : currentStep > 0 && !isReviewScreen ? (
            <Button
              size="medium"
              variant="text"
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={handlePrev}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                px: 1.5,
              }}
            >
              {t('profile:stepFlow.prev', 'Previous')}
            </Button>
          ) : (
            <Box />
          )}

          {/* Primary Action Button (Siguiente / Omitir / Guardar y volver / Confirmar) */}
          {!isReviewScreen && activeConfig ? (
            <Button
              size="medium"
              variant={!isEditingSingleField && activeConfig.isOptional && !currentValue.trim() ? 'outlined' : 'contained'}
              color="primary"
              endIcon={isEditingSingleField ? undefined : <ArrowForwardRoundedIcon />}
              startIcon={isEditingSingleField ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> : undefined}
              onClick={handleNext}
              sx={{
                fontWeight: 700,
                px: 3,
                py: 1,
                minWidth: 140,
              }}
            >
              {isEditingSingleField
                ? t('profile:stepFlow.saveAndReturn', 'Save and return')
                : activeConfig.isOptional && !currentValue.trim()
                ? t('profile:stepFlow.skip', 'Skip')
                : t('profile:stepFlow.next', 'Next')}
            </Button>
          ) : (
            <Button
              size="medium"
              variant="contained"
              color="primary"
              disabled={!isAlreadyComplete}
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => onAdvanceSection?.()}
              sx={{
                fontWeight: 700,
                px: 3,
                py: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {t('profile:stepFlow.confirmAndContinue', 'Continue')}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};
