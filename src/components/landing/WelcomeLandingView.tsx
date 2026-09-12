import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import { useTranslation } from 'react-i18next';
import { useFileUploader } from '../../hooks/useFileUploader';
import { useWelcomeLandingWorkflow } from '../../hooks/useWelcomeLandingWorkflow';
import { ConfirmDeleteDialog } from '../studio/common/ConfirmDeleteDialog';
import { APP_LINKS } from '../../constants/links';
import { RADIUS_TOKENS } from '../../theme/dimensions';

export interface WelcomeLandingViewProps {
  onStart?: () => void;
  onExploreDemo?: () => void;
  onFileLoaded?: (content: string) => void;
  onOpenSync?: () => void;
}

export const WelcomeLandingView: React.FC<WelcomeLandingViewProps> = ({
  onStart,
  onExploreDemo,
  onFileLoaded,
  onOpenSync,
}) => {
  const { t } = useTranslation(['landing', 'common', 'profile']);
  const theme = useTheme();
  const workflow = useWelcomeLandingWorkflow();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const { fileInputRef, isProcessing, progressMessage, handleFileUpload, openFileDialog } = useFileUploader({
    onFileLoaded: (content) => {
      if (onFileLoaded) {
        onFileLoaded(content);
      } else {
        workflow.handleUploadSuccess(content);
      }
    },
  });

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      workflow.handleStartWizard();
    }
  };

  const handleDemo = () => {
    if (onExploreDemo) {
      onExploreDemo();
    } else {
      workflow.handleExploreDemo();
    }
  };

  return (
    <div className="welcome-landing-wrapper">
      {/* Hidden file input for Landing PDF/MD Import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
        onChange={handleFileUpload}
      />

      <div className="welcome-landing-content">
        {/* Badge Pill */}
        <div className="welcome-badge">
          <span className="pulse-dot" />
          <span>{t('landing:badge', 'Free & 100% Private')}</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="welcome-hero-header">
          <Typography variant="h1" className="welcome-hero-title">
            {t('landing:hero.titlePrefix', 'Multiply Your Interviews')}{' '}
            <span className="welcome-gradient-text">
              {t('landing:hero.titleGradient', 'by Tailoring Your CV in Seconds')}
            </span>
          </Typography>
          <Typography variant="body1" className="welcome-hero-subtitle">
            {t(
              'landing:hero.subtitle',
              'Transform your career history into a high-impact resume with quantifiable Google XYZ-formula bullets, guaranteed ATS compliance, and 100% on-device privacy.'
            )}
          </Typography>
        </div>

        {/* 3 Streamlined Process Cards */}
        <div className="welcome-steps-grid">
          {/* Step 1 */}
          <div className="welcome-step-card">
            <div className="welcome-step-header">
              <span className="welcome-step-number">{t('landing:steps.step1.number', 'STEP 01')}</span>
              <div className="welcome-step-icon">
                <DescriptionRoundedIcon fontSize="small" />
              </div>
            </div>
            <Typography variant="h6" className="welcome-step-title">
              {t('landing:steps.step1.title', 'Complete Career Profile')}
            </Typography>
            <Typography variant="body2" className="welcome-step-desc">
              {t(
                'landing:steps.step1.desc',
                'Store your complete career history, skills, projects, and achievements in an intuitive guided visual form.'
              )}
            </Typography>

          </div>

          {/* Step 2 */}
          <div className="welcome-step-card">
            <div className="welcome-step-header">
              <span className="welcome-step-number">{t('landing:steps.step2.number', 'STEP 02')}</span>
              <div className="welcome-step-icon">
                <TrackChangesRoundedIcon fontSize="small" />
              </div>
            </div>
            <Typography variant="h6" className="welcome-step-title">
              {t('landing:steps.step2.title', 'Target Vacancy & Tailoring')}
            </Typography>
            <Typography variant="body2" className="welcome-step-desc">
              {t(
                'landing:steps.step2.desc',
                'Paste target job postings to synthesize aligned bullets with Google XYZ formula and employer keywords.'
              )}
            </Typography>
          </div>

          {/* Step 3 */}
          <div className="welcome-step-card">
            <div className="welcome-step-header">
              <span className="welcome-step-number">{t('landing:steps.step3.number', 'STEP 03')}</span>
              <div className="welcome-step-icon">
                <AssessmentRoundedIcon fontSize="small" />
              </div>
            </div>
            <Typography variant="h6" className="welcome-step-title">
              {t('landing:steps.step3.title', 'Live CV & Quality Audit')}
            </Typography>
            <Typography variant="body2" className="welcome-step-desc">
              {t(
                'landing:steps.step3.desc',
                'Inspect calibrated 1–10 quality scores, customize across 7 ATS themes, and export print-perfect PDFs.'
              )}
            </Typography>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="welcome-actions-row">
          {workflow.hasSavedData ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={onStart || workflow.handleResumeWizard}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  px: 3.5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {workflow.candidateFirstName
                  ? t('landing:actions.continueWithName', {
                    name: workflow.candidateFirstName,
                    defaultValue: `Continuar, ${workflow.candidateFirstName}`,
                  })
                  : t('landing:actions.continueWhereLeft', 'Continuar donde lo dejaste')}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={workflow.handleViewProfile}
                startIcon={<PersonRoundedIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                {t('landing:actions.viewProfile', 'Ver mi Perfil')}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => setShowResetConfirm(true)}
                startIcon={<AddRoundedIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {t('landing:actions.startNewResume', 'Empezar un CV nuevo')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={handleStart}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  px: 3.5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {t('landing:actions.startBuilding', 'Start Building Resume')}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={openFileDialog}
                disabled={isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PictureAsPdfRoundedIcon />
                  )
                }
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                {isProcessing ? (progressMessage || t('profile:actions.importing', 'Extracting PDF...')) : t('landing:actions.importPdfHero', 'Import Existing PDF')}
              </Button>

              {onOpenSync && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={onOpenSync}
                  startIcon={<QrCodeScannerRoundedIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  {t('landing:actions.syncFromPc', 'Escanear QR de PC')}
                </Button>
              )}

              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={handleDemo}
                startIcon={<AutoAwesomeRoundedIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {t('landing:actions.trySample', 'Try with Sample Data')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile-First Fast Sync from PC Card */}
        {onOpenSync && (
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              p: 2.25,
              mt: 2.5,
              mb: 1,
              borderRadius: RADIUS_TOKENS.lg,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.35)}`,
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              textAlign: 'center',
              gap: 1,
              width: '100%',
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeScannerRoundedIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {t('landing:actions.syncFromPcTitle', '¿Ya creaste tu CV en PC?')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
              {t(
                'landing:actions.syncFromPcDesc',
                'Apunta la cámara al código QR de tu PC para importar todo tu espacio de trabajo en segundos.'
              )}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={onOpenSync}
              startIcon={<QrCodeScannerRoundedIcon />}
              sx={{ fontWeight: 700, mt: 0.75, width: '100%' }}
            >
              {t('landing:actions.syncFromPc', 'Escanear QR de PC')}
            </Button>
          </Box>
        )}

        {/* Capabilities Pill Ribbon */}
        <div className="welcome-capabilities-ribbon">
          <div className="welcome-pill">
            <LockRoundedIcon sx={{ fontSize: 14 }} color="success" />
            <span>{t('landing:capabilities.privacy', '100% Local-First & Private')}</span>
          </div>
          <div className="welcome-pill">
            <PictureAsPdfRoundedIcon sx={{ fontSize: 14 }} color="error" />
            <span>{t('landing:capabilities.pdfImport', '1-Click PDF Importer')}</span>
          </div>
          <div className="welcome-pill">
            <CheckCircleRoundedIcon sx={{ fontSize: 14 }} color="info" />
            <span>{t('landing:capabilities.googleXyz', 'Google XYZ Formula')}</span>
          </div>
          <div className="welcome-pill">
            <SpeedRoundedIcon sx={{ fontSize: 14 }} color="warning" />
            <span>{t('landing:capabilities.auditScore', 'Calibrated 1–10 Audit')}</span>
          </div>
          <div className="welcome-pill">
            <StyleRoundedIcon sx={{ fontSize: 14 }} color="secondary" />
            <span>{t('landing:capabilities.themes', '7 Precision ATS Themes')}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div
          className="welcome-footer-note"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <span>
            {t(
              'common:footer.privacyNote',
              'All data remains in your browser storage. You can switch back here anytime via the top logo.'
            )}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span>
              {t('common:footer.craftedBy', 'Crafted by')}{' '}
              <strong>{APP_LINKS.AUTHOR_NAME}</strong>
            </span>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href={APP_LINKS.GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
                borderBottom: '1px dotted currentColor',
              }}
            >
              {t('common:footer.openSource', 'Open source on GitHub')}{' '}
              <StarRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Before Starting a New Resume */}
      <ConfirmDeleteDialog
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          workflow.handleStartNewResume();
        }}
        title={t('landing:dialog.confirmNewCvTitle', 'Start a new resume?')}
        message={t(
          'landing:dialog.confirmNewCvDesc',
          'This will clear your current profile data so you can start fresh from scratch. Do you want to continue?'
        )}
        confirmLabel={t('landing:dialog.confirmNewCv', 'Start New')}
        cancelLabel={t('common:actions.cancel', 'Cancel')}
      />
    </div>
  );
};

