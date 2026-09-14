import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContactType, ContactItem } from '../../../types/cv';
import { hapticsService } from '../../../core/haptics';
import { backButtonRegistry } from '../../../core/backButtonRegistry';
import { useSwipeGesture } from '../../../hooks/useSwipeGesture';
import {
  extractContactValues,
  getStepsConfig,
  EMAIL_REGEX,
} from './personalInfoStepsConfig';
import { PersonalInfoStepHeader } from './PersonalInfoStepHeader';
import { PersonalInfoSingleField } from './PersonalInfoSingleField';
import { PersonalInfoReviewSummary } from './PersonalInfoReviewSummary';
import { PersonalInfoStepActions } from './PersonalInfoStepActions';

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

/**
 * Step 1: Personal Information conversational flow.
 * Orchestrates step progression, validation, and review summary.
 */
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

  const contactValues = useMemo(() => extractContactValues(contacts), [contacts]);
  const stepsConfig = useMemo(() => getStepsConfig(theme), [theme]);
  const totalFields = stepsConfig.length;

  const isAlreadyComplete = useMemo(() => {
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
  const currentValue = useMemo(() => {
    if (!activeConfig) return '';
    if (activeConfig.type === 'name') return name || '';
    if (activeConfig.type === 'title') return title || '';
    if (activeConfig.type === 'contact' && activeConfig.contactType) {
      return contactValues[activeConfig.contactType] || '';
    }
    return '';
  }, [activeConfig, name, title, contactValues]);

  // Autofocus when step changes only if field is empty
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

  // Android Back Handler
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
        return false;
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
      <PersonalInfoStepHeader
        isEditingSingleField={isEditingSingleField}
        isReviewScreen={isReviewScreen}
        isAlreadyComplete={isAlreadyComplete}
        currentStep={currentStep}
        totalFields={totalFields}
        stepsConfig={stepsConfig}
        onBackToReview={() => {
          setIsEditingSingleField(false);
          setCurrentStep(totalFields);
          setValidationError(null);
        }}
        onJumpToField={handleJumpToField}
        onSwitchToStepMode={() => {
          setIsEditingSingleField(false);
          setCurrentStep(0);
          setValidationError(null);
        }}
      />

      {!isReviewScreen && activeConfig ? (
        <PersonalInfoSingleField
          activeConfig={activeConfig}
          currentValue={currentValue}
          validationError={validationError}
          inputRef={inputRef}
          onChange={handleValueChange}
          onEnterPress={handleNext}
        />
      ) : (
        <PersonalInfoReviewSummary
          name={name}
          title={title}
          contactValues={contactValues}
          stepsConfig={stepsConfig}
          onJumpToField={handleJumpToField}
        />
      )}

      <PersonalInfoStepActions
        isEditingSingleField={isEditingSingleField}
        isReviewScreen={isReviewScreen}
        isProfileComplete={isProfileComplete}
        isAlreadyComplete={isAlreadyComplete}
        currentStep={currentStep}
        activeConfig={activeConfig}
        currentValue={currentValue}
        onPrev={handlePrev}
        onNext={handleNext}
        onAdvanceSection={onAdvanceSection}
      />
    </Box>
  );
};
