import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonBase,
  Fade,
  Dialog,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import {
  OnboardingProfileIllustration,
  OnboardingAiIllustration,
  OnboardingExportIllustration,
} from './illustrations';
import { hapticsService } from '../../../core/haptics';

export interface MobileOnboardingWalkthroughProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onScanQr?: () => void;
  onImportPdf?: () => void;
  onLoadDemo?: () => void;
}

interface SlideItem {
  id: number;
  illustration: React.ReactNode;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
}

export const MobileOnboardingWalkthrough: React.FC<MobileOnboardingWalkthroughProps> = ({
  open,
  onClose,
  onComplete,
  onImportPdf,
}) => {
  const { t } = useTranslation(['common']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Dynamic Theme-Adaptive Design Tokens (WCAG AAA compliant)
  const colors = {
    canvasBg: isDark
      ? 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(37, 99, 235, 0.22) 0%, transparent 75%), radial-gradient(circle at 50% 32%, rgba(56, 189, 248, 0.12) 0%, transparent 60%), linear-gradient(180deg, #070a12 0%, #0c111d 42%, #080b13 100%)'
      : 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(186, 230, 253, 0.45) 0%, transparent 75%), linear-gradient(180deg, #edf4fe 0%, #ffffff 50%, #f8faff 100%)',
    paperBgColor: isDark ? '#070a12' : '#ffffff',
    title: isDark ? '#ffffff' : '#0f172a',
    titleGlow: isDark ? '0 2px 14px rgba(0, 0, 0, 0.6)' : 'none',
    description: isDark ? '#94a3b8' : '#475569',
    skipBtn: isDark ? '#94a3b8' : '#64748b',
    skipBtnHover: isDark ? '#ffffff' : '#0038ff',
    ctaBg: isDark ? '#1d72fe' : '#0038ff',
    ctaHoverBg: isDark ? '#155cd8' : '#002ecb',
    ctaColor: '#ffffff',
    ctaShadow: isDark ? '0 8px 24px rgba(29, 114, 254, 0.45)' : '0 8px 24px rgba(0, 56, 255, 0.35)',
    dotActive: isDark ? '#38bdf8' : '#0038ff',
    dotActiveGlow: isDark ? '0 0 12px rgba(56, 189, 248, 0.7)' : '0 2px 6px rgba(0, 56, 255, 0.3)',
    dotInactive: isDark ? 'rgba(255, 255, 255, 0.20)' : '#cbd5e1',
    secondaryText: isDark ? '#94a3b8' : '#64748b',
    secondaryAccent: isDark ? '#38bdf8' : '#0038ff',
  };

  // Touch Swipe Gesture State across Entire Screen
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides: SlideItem[] = [
    {
      id: 0,
      illustration: <OnboardingProfileIllustration />,
      titleKey: 'common:onboarding.step1.title',
      defaultTitle: 'Tu Perfil Profesional',
      descKey: 'common:onboarding.step1.description',
      defaultDesc: 'Construye tu base de experiencia, habilidades y logros con un formato estructurado y optimizado.',
    },
    {
      id: 1,
      illustration: <OnboardingAiIllustration />,
      titleKey: 'common:onboarding.step2.title',
      defaultTitle: 'Adaptación Inteligente',
      descKey: 'common:onboarding.step2.description',
      defaultDesc: 'Pega la oferta laboral deseada y adapta tus puntos fuertes para superar los filtros ATS con IA.',
    },
    {
      id: 2,
      illustration: <OnboardingExportIllustration />,
      titleKey: 'common:onboarding.step3.title',
      defaultTitle: 'Tu Estudio en Cualquier Lugar',
      descKey: 'common:onboarding.step3.description',
      defaultDesc: 'Genera PDFs de alta fidelidad y sincroniza al instante tu espacio de trabajo vía QR.',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      hapticsService.impactLight();
    } else {
      hapticsService.notificationSuccess();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      hapticsService.impactLight();
    }
  };

  const handleSkip = () => {
    hapticsService.impactLight();
    onClose();
  };

  // Touch Handlers for horizontal swipe anywhere on screen
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentSlide > 0) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!open) return null;

  const activeSlide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleSkip}
      transitionDuration={250}
      slotProps={{
        paper: {
          sx: {
            background: `${colors.canvasBg} !important`,
            backgroundColor: `${colors.paperBgColor} !important`,
            color: colors.title,
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            overflow: 'hidden',
            boxSizing: 'border-box',
          },
        },
      }}
    >
      {/* Root Container with Screen-wide Swipe Gesture Listeners */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* 1. Fixed Top Header: Skip Button (With relaxed top clearance from status bar) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: 48,
            flexShrink: 0,
            pt: 'max(calc(env(safe-area-inset-top) + 8px), 26px)',
            px: 3.5,
            boxSizing: 'content-box',
          }}
        >
          {!isLastSlide ? (
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{
                color: colors.skipBtn,
                fontWeight: 600,
                fontSize: '0.94rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.75,
                minWidth: 0,
                '&:hover': {
                  bgcolor: 'transparent',
                  color: colors.skipBtnHover,
                },
              }}
            >
              {t('common:onboarding.skip', 'Skip')}
            </Button>
          ) : (
            <Box sx={{ height: 36 }} />
          )}
        </Box>

        {/* 2. Main Hero Content: Illustration + Title + Description */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 390,
            mx: 'auto',
            px: 3.5,
            minHeight: 0,
            boxSizing: 'border-box',
          }}
        >
          {/* Illustration Container with ambient depth */}
          <Fade in={true} key={`illus-${currentSlide}`} timeout={280}>
            <Box
              sx={{
                width: '100%',
                height: { xs: '33vh', sm: '36vh' },
                maxHeight: 285,
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mb: { xs: 2, sm: 2.5 },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  maxWidth: 320,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activeSlide.illustration}
              </Box>
            </Box>
          </Fade>

          {/* Title and Description: High contrast and legible typography */}
          <Fade in={true} key={`text-${currentSlide}`} timeout={280}>
            <Box sx={{ textAlign: 'center', width: '100%', px: 1 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  mb: 1.5,
                  color: colors.title,
                  textShadow: colors.titleGlow,
                  fontSize: { xs: '1.7rem', sm: '1.95rem' },
                  lineHeight: 1.22,
                }}
              >
                {t(activeSlide.titleKey, activeSlide.defaultTitle)}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: colors.description,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.94rem', sm: '1rem' },
                  maxWidth: 320,
                  mx: 'auto',
                }}
              >
                {t(activeSlide.descKey, activeSlide.defaultDesc)}
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* 3. Bottom Action Cluster: Dots + Elevated CTA Button with Comfortable Screen Margins */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 390,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 3.5,
            pb: 'max(calc(env(safe-area-inset-bottom) + 16px), 44px)',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          {/* Stepper Dots Indicator (Positioned directly above the CTA for unified interaction) */}
          <Box
            sx={{
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
            }}
          >
            {slides.map((s, index) => {
              const isActive = currentSlide === index;
              return (
                <Box
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(index);
                    hapticsService.impactLight();
                  }}
                  sx={{
                    height: 6,
                    width: isActive ? 24 : 6,
                    borderRadius: 3,
                    bgcolor: isActive ? colors.dotActive : colors.dotInactive,
                    boxShadow: isActive ? colors.dotActiveGlow : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              );
            })}
          </Box>

          {/* Elevated Primary Action Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleNext}
            endIcon={isLastSlide ? <ArrowForwardRoundedIcon /> : undefined}
            sx={{
              bgcolor: colors.ctaBg,
              color: colors.ctaColor,
              height: 52,
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: colors.ctaShadow,
              '&:hover': {
                bgcolor: colors.ctaHoverBg,
              },
              '&:active': {
                transform: 'scale(0.985)',
              },
            }}
          >
            {isLastSlide
              ? t('common:onboarding.getStarted', 'Comenzar')
              : t('common:onboarding.next', 'Siguiente')}
          </Button>

          {/* Clean, Non-wrapping Secondary Link on Slide 3 */}
          {isLastSlide && onImportPdf && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                mt: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondaryText,
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
              >
                {t('common:onboarding.haveAccountPrompt', '¿Ya tienes un CV previo?')}
              </Typography>
              <ButtonBase
                onClick={() => {
                  hapticsService.impactLight();
                  onClose();
                  setTimeout(() => onImportPdf(), 100);
                }}
                sx={{
                  color: colors.secondaryAccent,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  p: '2px 4px',
                  borderRadius: 1,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    textDecoration: 'underline',
                    opacity: 0.9,
                  },
                }}
              >
                {t('common:onboarding.actions.importPdf', 'Importar PDF')}
              </ButtonBase>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
