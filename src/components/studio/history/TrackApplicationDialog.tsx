import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Chip,
  Alert,
  MenuItem,
  IconButton,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { TrackApplicationDialogProps, GeneratedCvVersion } from '../../../types';
import { getLocalizedColumnTitle } from '../../../utils/kanbanUtils';
import { MatchScoreBadge } from '../../atoms';

export const TrackApplicationDialog: React.FC<TrackApplicationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  initialSourceType,
  prefillCompany = '',
  prefillRole = '',
  prefillVersionId,
  defaultColumnId,
  savedVersions,
  existingApplications,
  columns,
}) => {
  const { t, i18n } = useTranslation(['history', 'common', 'target', 'preview', 'gap']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [company, setCompany] = useState(prefillCompany);
  const [role, setRole] = useState(prefillRole);
  const [cvSourceType, setCvSourceType] = useState<'internal' | 'external'>(
    initialSourceType || (savedVersions.length > 0 ? 'internal' : 'external')
  );
  const [externalCvTitle, setExternalCvTitle] = useState('');
  const [contactChannel, setContactChannel] = useState<string>('linkedin');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [jobUrl, setJobUrl] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [columnId, setColumnId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  // Initialize or reset fields on open
  useEffect(() => {
    if (open) {
      const initialCompany = prefillCompany || '';
      const initialRole = prefillRole || '';
      setCompany(initialCompany);
      setRole(initialRole);
      setNotes('');
      setSalary('');
      setLocation('');
      setShowExtraDetails(false);
      setExternalCvTitle('');
      setContactChannel('linkedin');
      setContactPerson('');
      setJobUrl('');

      const defaultCol = defaultColumnId || (columns.length > 0 ? columns[0].id : 'applied');
      setColumnId(defaultCol);

      if (initialSourceType) {
        setCvSourceType(initialSourceType);
      } else if (prefillVersionId && savedVersions.some((v) => v.id === prefillVersionId)) {
        setSelectedVersionId(prefillVersionId);
        setCvSourceType('internal');
      } else if (savedVersions.length > 0) {
        setSelectedVersionId(savedVersions[0].id);
        setCvSourceType('internal');
      } else {
        setSelectedVersionId('');
        setCvSourceType('external');
      }
    }
  }, [open, prefillCompany, prefillRole, prefillVersionId, defaultColumnId, savedVersions, columns, initialSourceType]);

  // Matching versions for current company input
  const matchingVersions = useMemo(() => {
    const trimmed = company.trim().toLowerCase();
    if (!trimmed) return savedVersions;
    const directMatches = savedVersions.filter((v) => v.companyName.toLowerCase().trim() === trimmed);
    return directMatches.length > 0 ? directMatches : savedVersions;
  }, [company, savedVersions]);

  // Check if there is already an active application for Company + Role
  const hasActiveDuplicate = useMemo(() => {
    const trimmedComp = company.trim().toLowerCase();
    const trimmedRole = role.trim().toLowerCase();
    if (!trimmedComp) return false;
    return existingApplications.some(
      (app) =>
        !app.isArchived &&
        app.companyName.toLowerCase().trim() === trimmedComp &&
        app.targetRole.toLowerCase().trim() === trimmedRole
    );
  }, [company, role, existingApplications]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(i18n.language || 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const isExternal = cvSourceType === 'external';
  const isValid = Boolean(company.trim() && (isExternal || selectedVersionId));

  const handleConfirm = () => {
    if (!isValid) return;

    onConfirm({
      companyName: company.trim(),
      targetRole: role.trim() || 'Specialist',
      appliedVersionId: isExternal ? undefined : selectedVersionId,
      isExternalCv: isExternal,
      externalCvTitle: isExternal
        ? externalCvTitle.trim() || t('history:externalCv.defaultTitle', 'Direct Contact / External CV')
        : undefined,
      contactChannel: isExternal ? contactChannel : undefined,
      contactPerson: isExternal ? contactPerson.trim() || undefined : undefined,
      jobUrl: jobUrl.trim() || undefined,
      columnId: columnId || (columns[0]?.id ?? 'applied'),
      notes: notes.trim() || undefined,
      salary: salary.trim() || undefined,
      location: location.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BusinessRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {isExternal
                ? t('history:trackModal.titleExternal', 'Track Direct / External Application')
                : t('history:trackModal.title', 'Track Job Application')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isExternal
                ? t('history:trackModal.subtitleExternal', 'Track direct contacts, recruiter messages, or non-tailored submissions')
                : t('history:trackModal.subtitle', 'Link a tailored CV version to your Kanban board')}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        {/* Duplicate Active Application Warning (Soft & Informative) */}
        {hasActiveDuplicate && (
          <Alert
            severity="warning"
            icon={<WarningAmberRoundedIcon />}
            sx={{
              fontSize: '0.82rem',
              '& .MuiAlert-message': { fontWeight: 500 },
            }}
          >
            {t(
              'history:trackModal.duplicateWarning',
              'You already have an active application with {{company}} for {{role}}. A new tracking card will be created alongside it.',
              { company: company.trim(), role: role.trim() }
            )}
          </Alert>
        )}

        {/* Company & Role Inputs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <TextField
            label={t('target:fields.company', 'Company Name')}
            placeholder={t('history:trackModal.companyPlaceholder', 'e.g. Acme Corp, Google, Globant')}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            fullWidth
            size="small"
            required
            autoFocus
          />
          <TextField
            label={t('target:fields.role', 'Target Role / Position')}
            placeholder={t('history:trackModal.rolePlaceholder', 'e.g. Senior Frontend Engineer')}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>

        {/* CV Source Selector */}
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              {t('history:trackModal.cvSourceTitle', 'Resume / CV Document')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                variant={cvSourceType === 'internal' ? 'contained' : 'outlined'}
                color={cvSourceType === 'internal' ? 'primary' : 'inherit'}
                startIcon={<DescriptionRoundedIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => setCvSourceType('internal')}
                sx={{ fontSize: '0.72rem', py: 0.25, px: 1, textTransform: 'none' }}
              >
                {t('history:trackModal.sourceStudio', 'Studio Resume')}
              </Button>
              <Button
                size="small"
                variant={cvSourceType === 'external' ? 'contained' : 'outlined'}
                color={cvSourceType === 'external' ? 'primary' : 'inherit'}
                startIcon={<SendRoundedIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => setCvSourceType('external')}
                sx={{ fontSize: '0.72rem', py: 0.25, px: 1, textTransform: 'none' }}
              >
                {t('history:trackModal.sourceExternal', 'External / Direct CV')}
              </Button>
            </Box>
          </Box>

          {cvSourceType === 'external' ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.02),
                borderColor: alpha(theme.palette.primary.main, 0.25),
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                {t(
                  'history:trackModal.externalCvDesc',
                  'Track direct submissions, recruiter inmails, or informal outreach that did not go through the tailored Studio workflow.'
                )}
              </Typography>

              {/* Contact Channel & Recruiter Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <TextField
                  select
                  label={t('history:trackModal.contactChannel', 'Contact Channel / Source')}
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="linkedin">🌐 {t('history:channels.linkedin', 'LinkedIn')}</MenuItem>
                  <MenuItem value="whatsapp">💬 {t('history:channels.whatsapp', 'WhatsApp')}</MenuItem>
                  <MenuItem value="email">✉️ {t('history:channels.email', 'Direct Email')}</MenuItem>
                  <MenuItem value="referral">👥 {t('history:channels.referral', 'Employee Referral')}</MenuItem>
                  <MenuItem value="headhunter">👔 {t('history:channels.headhunter', 'Headhunter / Agency')}</MenuItem>
                  <MenuItem value="portal">🏢 {t('history:channels.portal', 'Career Site / Portal')}</MenuItem>
                  <MenuItem value="direct">🤝 {t('history:channels.direct', 'Direct Outreach')}</MenuItem>
                  <MenuItem value="other">📌 {t('history:channels.other', 'Other Channel')}</MenuItem>
                </TextField>

                <TextField
                  label={t('history:trackModal.contactPerson', 'Recruiter / Contact Person (Optional)')}
                  placeholder={t('history:trackModal.contactPersonPlaceholder', 'e.g. John Doe, Sarah HR')}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Box>

              {/* Document Label & Job URL */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <TextField
                  label={t('history:trackModal.externalCvTitleField', 'Document Label or Sent CV (Optional)')}
                  placeholder={t('history:trackModal.externalCvPlaceholder', 'e.g. Generic Master PDF, LinkedIn Profile')}
                  value={externalCvTitle}
                  onChange={(e) => setExternalCvTitle(e.target.value)}
                  size="small"
                  fullWidth
                />

                <TextField
                  label={t('history:trackModal.jobUrlField', 'Job Link or Chat URL (Optional)')}
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Box>
            </Paper>
          ) : (
            <>
              {matchingVersions.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.05) }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      'history:trackModal.noVersionsFound',
                      'No saved resume versions found for this company. You can switch to "External / Direct CV" or synthesize a version first.'
                    )}
                  </Typography>
                </Paper>
              ) : (
                <RadioGroup
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  {matchingVersions.map((v: GeneratedCvVersion, index: number) => {
                    const isSelected = selectedVersionId === v.id;
                    return (
                      <Paper
                        key={v.id}
                        variant="outlined"
                        onClick={() => setSelectedVersionId(v.id)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.04)
                            : 'background.paper',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                          <FormControlLabel
                            value={v.id}
                            control={<Radio size="small" />}
                            label=""
                            sx={{ m: 0, mr: -0.5 }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                v{matchingVersions.length - index} • {v.targetRole || 'Specialist'}
                              </Typography>
                              {Boolean(v.matchScore) && (
                                <MatchScoreBadge score={v.matchScore} />
                              )}
                              <Chip
                                label={v.theme || 'modern-tech'}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.68rem' }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}
                            >
                              <CalendarTodayRoundedIcon sx={{ fontSize: 11 }} /> {formatDate(v.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </RadioGroup>
              )}
            </>
          )}
        </Box>

        {/* Initial Column Stage */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <TextField
            select
            label={t('history:trackModal.initialColumn', 'Initial Stage')}
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            fullWidth
            size="small"
          >
            {columns.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: col.color || theme.palette.primary.main,
                    }}
                  />
                  {getLocalizedColumnTitle(col, t)}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('history:trackModal.salary', 'Salary / Budget (Optional)')}
            placeholder={t('history:trackModal.salaryPlaceholder', '$120k - $140k')}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>

        {/* Optional Extra Fields Toggle */}
        <Button
          size="small"
          color="inherit"
          onClick={() => setShowExtraDetails((prev) => !prev)}
          endIcon={showExtraDetails ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          sx={{ alignSelf: 'flex-start', fontSize: '0.76rem', color: 'text.secondary' }}
        >
          {showExtraDetails
            ? t('history:trackModal.hideDetails', 'Hide additional details')
            : t('history:trackModal.addDetails', '+ Add location & notes')}
        </Button>

        <Collapse in={showExtraDetails}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
            <TextField
              label={t('history:trackModal.location', 'Location / Remote Policy')}
              placeholder={t('history:trackModal.locationPlaceholder', 'e.g. San Francisco, CA / Remote')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label={t('history:trackModal.notes', 'Personal Notes & Interview Contact')}
              placeholder={t('history:trackModal.notesPlaceholder', 'e.g. Referred by Alex; Interviewer highlighted performance engineering...')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
          </Box>
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          {t('common:actions.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!isValid}
          sx={{ fontWeight: 700, px: 2.5 }}
        >
          {t('history:trackModal.confirm', 'Track Application')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
