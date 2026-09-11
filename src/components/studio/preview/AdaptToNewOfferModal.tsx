import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { useTranslation } from 'react-i18next';
import { extractTargetCompany, extractTargetRole } from '../../../core/parser/metadataExtractor';
import { calculateQuickScore, QuickMatchResult } from '../../../core/matching/quickMatcher';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface AdaptToNewOfferModalProps {
  open: boolean;
  onClose: () => void;
  currentCompanyName?: string;
  currentTargetRole?: string;
  currentCvMarkdown: string;
  onUseCurrent: (data: { companyName: string; targetRole: string; jobText: string }) => void;
  onGenerateNew: (data: { companyName: string; targetRole: string; jobText: string }) => void;
  isGenerating?: boolean;
}

export const AdaptToNewOfferModal: React.FC<AdaptToNewOfferModalProps> = ({
  open,
  onClose,
  currentCompanyName = 'General',
  currentTargetRole = '',
  currentCvMarkdown,
  onUseCurrent,
  onGenerateNew,
  isGenerating = false,
}) => {
  const { t } = useTranslation(['preview', 'common', 'target']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const [jobText, setJobText] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setJobText('');
      setCompanyName('');
      setTargetRole('');
      setIsAutoDetected(false);
    }
  }, [open]);

  // Handle paste / typing in job description with auto-detection of company & role
  const handleJobTextChange = (text: string) => {
    setJobText(text);

    if (text.trim().length > 30) {
      let detectedCompany = '';
      let detectedRole = '';

      if (!companyName.trim()) {
        detectedCompany = extractTargetCompany(text, '');
        if (detectedCompany) setCompanyName(detectedCompany);
      }

      if (!targetRole.trim()) {
        detectedRole = extractTargetRole(text, '', '');
        if (detectedRole) setTargetRole(detectedRole);
      }

      if (detectedCompany || detectedRole) {
        setIsAutoDetected(true);
      }
    }
  };

  // Instant real-time affinity score (client-side, 0 API tokens)
  const affinityResult: QuickMatchResult | null = useMemo(() => {
    if (!jobText || jobText.trim().length < 30 || !currentCvMarkdown) return null;
    return calculateQuickScore(jobText, currentCvMarkdown);
  }, [jobText, currentCvMarkdown]);

  const hasContent = jobText.trim().length >= 30;
  const effectiveCompany = companyName.trim() || t('target:fields.unspecifiedCompany', 'Nueva Empresa');
  const effectiveRole = targetRole.trim() || currentTargetRole || '';

  const getAffinityColor = (score: number): 'success' | 'warning' | 'default' => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'default';
  };

  const affinityThemeConfig = useMemo(() => {
    if (!affinityResult) return null;
    const colorType = getAffinityColor(affinityResult.score);
    const colorMain = colorType === 'success'
      ? theme.palette.success.main
      : colorType === 'warning'
      ? theme.palette.warning.main
      : theme.palette.text.secondary;
    const borderColor = colorType === 'success'
      ? alpha(theme.palette.success.main, 0.3)
      : colorType === 'warning'
      ? alpha(theme.palette.warning.main, 0.3)
      : theme.palette.divider;
    const bgColor = colorType === 'success'
      ? alpha(theme.palette.success.main, isDark ? 0.08 : 0.04)
      : colorType === 'warning'
      ? alpha(theme.palette.warning.main, isDark ? 0.08 : 0.04)
      : alpha(theme.palette.text.primary, isDark ? 0.04 : 0.02);

    return { colorType, colorMain, borderColor, bgColor };
  }, [affinityResult, theme, isDark]);

  return (
    <Dialog
      open={open}
      onClose={isGenerating ? undefined : onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : RADIUS_TOKENS.xl,
            p: 0,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: isMobile ? '100%' : '90vh',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          py: 2,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: RADIUS_TOKENS.md,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {t('preview:adaptModal.title', 'Adaptar este CV a otra oferta')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {t('preview:adaptModal.subtitle', 'Evalúa la compatibilidad con una nueva vacante o genera una adaptación específica con IA.')}
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} disabled={isGenerating} sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
        {/* Safety Notice Banner */}
        <Alert
          severity="info"
          icon={<CheckCircleRoundedIcon fontSize="inherit" />}
          sx={{
            borderRadius: RADIUS_TOKENS.md,
            py: 0.75,
            px: 2,
            fontSize: '0.8rem',
            bgcolor: alpha(theme.palette.info.main, isDark ? 0.12 : 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.2),
          }}
        >
          {t('preview:adaptModal.safeNotice', 'Tu versión actual para {{company}} permanecerá guardada de forma segura en tu historial.', {
            company: currentCompanyName || 'General',
          })}
        </Alert>

        {/* Company & Role Inputs */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            size="small"
            label={t('preview:adaptModal.companyLabel', 'Empresa objetivo')}
            placeholder={t('preview:adaptModal.companyPlaceholder', 'Ej: Stripe, Mercado Libre, Globant')}
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setIsAutoDetected(false);
            }}
            slotProps={{
              input: {
                startAdornment: <BusinessRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />,
              },
            }}
          />
          <TextField
            fullWidth
            size="small"
            label={t('preview:adaptModal.roleLabel', 'Cargo objetivo')}
            placeholder={t('preview:adaptModal.rolePlaceholder', 'Ej: Senior Frontend Engineer')}
            value={targetRole}
            onChange={(e) => {
              setTargetRole(e.target.value);
              setIsAutoDetected(false);
            }}
            slotProps={{
              input: {
                startAdornment: <WorkOutlineRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />,
              },
            }}
          />
        </Box>

        {isAutoDetected && (
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, mt: -1.5 }}>
            ⚡ {t('preview:adaptModal.autoDetected', 'Auto-detectado de la oferta')}
          </Typography>
        )}

        {/* Job Description Textarea */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('preview:adaptModal.jobDescLabel', 'Descripción de la nueva vacante o requisitos')} *
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {jobText.trim().length} {t('common:units.characters', 'caracteres')}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 5 : 6}
            placeholder={t('preview:adaptModal.jobDescPlaceholder', 'Pega aquí el texto de la vacante, requisitos técnicos o responsabilidades...')}
            value={jobText}
            onChange={(e) => handleJobTextChange(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              },
            }}
          />
          {!hasContent && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              ℹ️ {t('preview:adaptModal.pasteTip', 'Al pegar la oferta, intentaremos detectar automáticamente la empresa y el cargo.')}
            </Typography>
          )}
        </Box>

        {/* Real-time Pre-flight Affinity Assessment */}
        {affinityResult && affinityThemeConfig && (
          <Box
            sx={{
              p: 2,
              borderRadius: RADIUS_TOKENS.lg,
              border: '1px solid',
              borderColor: affinityThemeConfig.borderColor,
              bgcolor: affinityThemeConfig.bgColor,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {t('preview:adaptModal.affinityTitle', 'Afinidad con tu CV actual en pantalla')}
                </Typography>
                <Chip
                  size="small"
                  label={
                    affinityResult.verdict === 'high'
                      ? t('preview:adaptModal.affinityHigh', 'Alta compatibilidad')
                      : affinityResult.verdict === 'moderate'
                      ? t('preview:adaptModal.affinityModerate', 'Compatibilidad moderada')
                      : t('preview:adaptModal.affinityLow', 'Baja compatibilidad')
                  }
                  color={affinityThemeConfig.colorType === 'default' ? 'default' : affinityThemeConfig.colorType}
                  sx={{ fontWeight: 700, height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: affinityThemeConfig.colorMain }}>
                  {affinityResult.score}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Match
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              {affinityResult.verdict === 'high'
                ? t('preview:adaptModal.affinityHighDesc', 'Tu CV actual ya cubre la gran mayoría de palabras clave y tecnologías requeridas.')
                : affinityResult.verdict === 'moderate'
                ? t('preview:adaptModal.affinityModerateDesc', 'Cubre parte del perfil, pero se recomienda generar una adaptación para integrar palabras clave faltantes.')
                : t('preview:adaptModal.affinityLowDesc', 'El perfil requiere adaptación con IA para priorizar tu experiencia relevante.')}
            </Typography>

            {/* Keyword Chips */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 0.5 }}>
              {affinityResult.matchedKeywords.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
                    {t('preview:adaptModal.matchedKeywords', 'Palabras clave detectadas ({{count}})', {
                      count: affinityResult.matchedKeywords.length,
                    })}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {affinityResult.matchedKeywords.map((kw, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={kw}
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {affinityResult.missingKeywords.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 13 }} />
                    {t('preview:adaptModal.missingKeywords', 'Palabras clave ausentes ({{count}})', {
                      count: affinityResult.missingKeywords.length,
                    })}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {affinityResult.missingKeywords.slice(0, 10).map((kw, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={kw}
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* Decision Fork Actions Footer */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: 1.5,
        }}
      >
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isGenerating}
          sx={{ order: { xs: 3, sm: 1 }, textTransform: 'none', fontWeight: 600 }}
        >
          {t('common:actions.cancel', 'Cancelar')}
        </Button>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexDirection: { xs: 'column', sm: 'row' },
            order: { xs: 1, sm: 2 },
            flex: { sm: 1 },
            justifyContent: 'flex-end',
          }}
        >
          {/* Path 1: Usar este CV tal cual */}
          <Tooltip title={t('preview:adaptModal.useCurrentDesc', 'Registra la candidatura en tu seguimiento vinculada a este CV sin cambios')}>
            <span>
              <Button
                fullWidth={isMobile}
                variant="outlined"
                color="inherit"
                disabled={!hasContent || isGenerating}
                startIcon={<AssignmentTurnedInRoundedIcon />}
                onClick={() => {
                  onUseCurrent({
                    companyName: effectiveCompany,
                    targetRole: effectiveRole,
                    jobText,
                  });
                  onClose();
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  py: 1,
                  px: 2,
                }}
              >
                {t('preview:adaptModal.useCurrentAction', 'Usar este CV tal cual')}
              </Button>
            </span>
          </Tooltip>

          {/* Path 2: Generar Adaptación Nueva con IA */}
          <Tooltip title={t('preview:adaptModal.generateDesc', 'Crea una versión independiente adaptada con IA')}>
            <span>
              <Button
                fullWidth={isMobile}
                variant="contained"
                color="primary"
                disabled={!hasContent || isGenerating}
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={() => {
                  onGenerateNew({
                    companyName: effectiveCompany,
                    targetRole: effectiveRole,
                    jobText,
                  });
                  onClose();
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  py: 1,
                  px: 2.5,
                }}
              >
                {t('preview:adaptModal.generateAction', 'Generar Adaptación Nueva')}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
