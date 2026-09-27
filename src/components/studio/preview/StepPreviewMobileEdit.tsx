import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import { useTranslation } from 'react-i18next';
import { safeMarkdown, safeMarkdownInline } from '../../../utils/sanitize';
import { CVData } from '../../../types/cv';
import { ThemeId } from '../../../types/theme';
import { extractCandidateInitials } from '../../../core/parser';
import { themeSupportsPhoto } from '../../../templates';
import { useCvLiveEdit } from './CvLiveEditContext';
import { AiRegeneratePopover } from './AiRegeneratePopover';
import { ProfilePhotoDisplay } from '../photo/ProfilePhotoDisplay';
import { EditableText } from './EditableText';

export interface StepPreviewMobileEditProps {
  parsedCv: CVData;
  activeTheme?: ThemeId;
}



interface ActiveEditItem {
  type: 'bullet' | 'summary';
  fieldKey: string;
  sectionType?: 'experience' | 'projects';
  itemIndex?: number;
  bulletIndex?: number;
  company?: string;
  role?: string;
  initialText: string;
}

export const StepPreviewMobileEdit: React.FC<StepPreviewMobileEditProps> = ({ parsedCv, activeTheme = 'modern-tech' }) => {

  const { t } = useTranslation(['preview', 'common']);
  const liveEdit = useCvLiveEdit();
  const theme = useTheme();

  // State for direct manual text edit modal
  const [editingItem, setEditingItem] = useState<ActiveEditItem | null>(null);
  const [editText, setEditText] = useState<string>('');

  // State for AI regeneration bottom sheet
  const [aiTarget, setAiTarget] = useState<ActiveEditItem | null>(null);

  const handleOpenEdit = (item: ActiveEditItem) => {
    setEditingItem(item);
    setEditText(item.initialText);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !liveEdit) return;

    if (editingItem.type === 'summary') {
      liveEdit.updateSummary(editText);
    } else if (editingItem.type === 'bullet' && editingItem.itemIndex !== undefined && editingItem.bulletIndex !== undefined) {
      liveEdit.updateExperienceBullet(
        editingItem.sectionType || 'experience',
        editingItem.itemIndex,
        editingItem.bulletIndex,
        editText
      );
    }
    setEditingItem(null);
  };

  const handleOpenAiRegenerate = (item: ActiveEditItem) => {
    setAiTarget(item);
  };

  const handleExecuteAiRegenerate = async (guidance: string) => {
    if (!aiTarget || !liveEdit) return;

    if (aiTarget.type === 'summary') {
      await liveEdit.regenerateSummaryBlock({
        fieldKey: aiTarget.fieldKey,
        currentSummary: aiTarget.initialText,
        userGuidance: guidance,
      });
    } else if (aiTarget.type === 'bullet' && aiTarget.itemIndex !== undefined && aiTarget.bulletIndex !== undefined) {
      await liveEdit.regenerateExperienceBullet({
        fieldKey: aiTarget.fieldKey,
        sectionType: aiTarget.sectionType || 'experience',
        itemIndex: aiTarget.itemIndex,
        bulletIndex: aiTarget.bulletIndex,
        company: aiTarget.company || '',
        role: aiTarget.role,
        currentBullet: aiTarget.initialText,
        userGuidance: guidance,
      });
    }
  };

  const handleUndo = (fieldKey: string, onRevert: (val: string) => void) => {
    if (!liveEdit) return;
    liveEdit.undoItem(fieldKey, onRevert);
  };

  const initials = extractCandidateInitials(parsedCv.name || 'Candidate');
  const isPhotoSupported = themeSupportsPhoto(activeTheme);

  return (
    <Box sx={{ px: 2, py: 2, pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 72px)', sm: 8 }, display: 'flex', flexDirection: 'column', gap: 2.5, boxSizing: 'border-box' }}>
      {/* 0. Header & Profile Photo Card (Photo-Supported Themes) */}
      {isPhotoSupported && (
        <Box>

          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'text.secondary',
              mb: 1,
              display: 'block',
            }}
          >
            {t('preview:panels.design.photoTitle', 'Profile Photo & Header')}
          </Typography>

          <Card
            variant="outlined"
            sx={{
              bgcolor: 'background.paper',
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                '&:last-child': { pb: 2 },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {parsedCv.name || 'Candidate Name'}
                </Typography>
                {parsedCv.title && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 0.25 }}>
                    {parsedCv.title}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                  {t('preview:panels.design.photoUploadTooltip', 'Tap photo to upload or crop')}
                </Typography>
              </Box>

              <ProfilePhotoDisplay
                maskShape={activeTheme === 'academic-research' || activeTheme === 'swiss-modern' ? 'circle' : activeTheme === 'designer-uiux' ? 'squircle' : 'rounded'}
                size={54}
                border={`2px solid ${theme.palette.primary.main}`}
                fallbackInitials={initials}
                fallbackIcon={activeTheme === 'two-column' ? 'diamond' : 'monogram'}
                activeTheme={activeTheme}
                editable={true}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 0.1 Swiss Legal Status & Work Permit Card (swiss-modern) */}
      {activeTheme === 'swiss-modern' && (parsedCv.workPermit || parsedCv.nationality || parsedCv.civilStatus || parsedCv.availability || parsedCv.dateOfBirth || parsedCv.drivingLicense) && (
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'text.secondary',
              mb: 1,
              display: 'block',
            }}
          >
            {t('preview:swissLegal.title', '🇨🇭 Statut Légal & Permis de Travail (Suisse)')}
          </Typography>

          <Card variant="outlined" sx={{ bgcolor: 'background.paper', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {parsedCv.workPermit && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.workPermit', 'PERMIS DE TRAVAIL / STATUT')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.workPermit}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('workPermit', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {parsedCv.nationality && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.nationality', 'NATIONALITÉ (ORIGINE)')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.nationality}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('nationality', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {parsedCv.civilStatus && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.civilStatus', 'ÉTAT CIVIL')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.civilStatus}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('civilStatus', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {parsedCv.availability && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.availability', 'DISPONIBILITÉ / MOBILITÉ CANTONALE')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.availability}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('availability', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {parsedCv.dateOfBirth && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.dateOfBirth', 'DATE DE NAISSANCE')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.dateOfBirth}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('dateOfBirth', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {parsedCv.drivingLicense && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                  {t('preview:swissLegal.drivingLicense', 'PERMIS DE CONDUIRE')}
                </Typography>
                <EditableText
                  tagName="div"
                  value={parsedCv.drivingLicense}
                  onSave={(val: string) => liveEdit?.updatePersonalDetail('drivingLicense', val)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </Box>
            )}
          </Card>
        </Box>
      )}

      {/* 1. Summary Block Card */}
      {parsedCv.summary && (
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'text.secondary',
              mb: 1,
              display: 'block',
            }}
          >
            {t('preview:sections.summary', 'Professional Summary')}
          </Typography>

          <Card
            variant="outlined"
            sx={{
              bgcolor: 'background.paper',
            }}
          >

            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  fontSize: '0.88rem',
                  lineHeight: 1.55,
                  color: 'text.primary',
                  mb: 1.75,
                  '& strong': { fontWeight: 700, color: 'text.primary' },
                }}
                dangerouslySetInnerHTML={{ __html: safeMarkdown(parsedCv.summary || '') }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() =>
                    handleOpenEdit({
                      type: 'summary',
                      fieldKey: 'summary-main',
                      initialText: parsedCv.summary || '',
                    })
                  }
                  startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ flex: 1 }}
                >
                  {t('preview:aiRegen.editItem', 'Editar')}
                </Button>

                <Button
                  size="medium"
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleOpenAiRegenerate({
                      type: 'summary',
                      fieldKey: 'summary-main',
                      initialText: parsedCv.summary || '',
                    })
                  }
                  startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ flex: 1 }}
                >
                  {t('preview:aiRegen.button', 'Regenerar')}
                </Button>

                {liveEdit?.undoMap['summary-main'] !== undefined && (
                  <Button
                    size="medium"
                    variant="outlined"
                    onClick={() =>
                      handleUndo('summary-main', (val) => liveEdit?.updateSummary(val))
                    }
                    startIcon={<UndoRoundedIcon sx={{ fontSize: 16 }} />}
                  >
                    {t('preview:aiRegen.undo', 'Deshacer')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 2. Professional Experience Bullets Cards */}
      {parsedCv.experience && parsedCv.experience.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {parsedCv.experience.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                  }}
                >
                  {item.company}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {item.role} {item.date ? `• ${item.date}` : ''}
                </Typography>
              </Box>

              {item.bullets && item.bullets.map((bullet, bIdx) => {
                const fieldKey = `experience-${idx}-${bIdx}`;
                const hasUndo = liveEdit?.undoMap[fieldKey] !== undefined;

                return (
                  <Card
                    key={bIdx}
                    variant="outlined"
                    sx={{
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box
                        sx={{
                          fontSize: '0.86rem',
                          lineHeight: 1.5,
                          color: 'text.primary',
                          mb: 1.75,
                          '& strong': { fontWeight: 700, color: 'text.primary' },
                        }}
                        dangerouslySetInnerHTML={{ __html: safeMarkdownInline(bullet) }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={() =>
                            handleOpenEdit({
                              type: 'bullet',
                              fieldKey,
                              sectionType: 'experience',
                              itemIndex: idx,
                              bulletIndex: bIdx,
                              company: item.company,
                              role: item.role,
                              initialText: bullet,
                            })
                          }
                          startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1 }}
                        >
                          {t('preview:aiRegen.editItem', 'Editar')}
                        </Button>

                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleOpenAiRegenerate({
                              type: 'bullet',
                              fieldKey,
                              sectionType: 'experience',
                              itemIndex: idx,
                              bulletIndex: bIdx,
                              company: item.company,
                              role: item.role,
                              initialText: bullet,
                            })
                          }
                          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1 }}
                        >
                          {t('preview:aiRegen.button', 'Regenerar')}
                        </Button>

                        {hasUndo && (
                          <Button
                            size="medium"
                            variant="outlined"
                            onClick={() =>
                              handleUndo(fieldKey, (val) =>
                                liveEdit?.updateExperienceBullet('experience', idx, bIdx, val)
                              )
                            }
                            startIcon={<UndoRoundedIcon sx={{ fontSize: 16 }} />}
                          >
                            {t('preview:aiRegen.undo', 'Deshacer')}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ))}
        </Box>
      )}

      {/* 3. Featured Projects Bullets Cards */}
      {parsedCv.projects && parsedCv.projects.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {parsedCv.projects.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                  }}
                >
                  {item.company}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {item.role} {item.date ? `• ${item.date}` : ''}
                </Typography>
              </Box>

              {item.bullets && item.bullets.map((bullet, bIdx) => {
                const fieldKey = `projects-${idx}-${bIdx}`;
                const hasUndo = liveEdit?.undoMap[fieldKey] !== undefined;

                return (
                  <Card
                    key={bIdx}
                    variant="outlined"
                    sx={{
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box
                        sx={{
                          fontSize: '0.88rem',
                          lineHeight: 1.55,
                          color: 'text.primary',
                          mb: 1.75,
                          '& strong': { fontWeight: 700, color: 'text.primary' },
                        }}
                        dangerouslySetInnerHTML={{ __html: safeMarkdownInline(bullet) }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={() =>
                            handleOpenEdit({
                              type: 'bullet',
                              fieldKey,
                              sectionType: 'projects',
                              itemIndex: idx,
                              bulletIndex: bIdx,
                              company: item.company,
                              role: item.role,
                              initialText: bullet,
                            })
                          }
                          startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1 }}
                        >
                          {t('preview:aiRegen.editItem', 'Editar')}
                        </Button>

                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleOpenAiRegenerate({
                              type: 'bullet',
                              fieldKey,
                              sectionType: 'projects',
                              itemIndex: idx,
                              bulletIndex: bIdx,
                              company: item.company,
                              role: item.role,
                              initialText: bullet,
                            })
                          }
                          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{ flex: 1 }}
                        >
                          {t('preview:aiRegen.button', 'Regenerar')}
                        </Button>

                        {hasUndo && (
                          <Button
                            size="medium"
                            variant="outlined"
                            onClick={() =>
                              handleUndo(fieldKey, (val) =>
                                liveEdit?.updateExperienceBullet('projects', idx, bIdx, val)
                              )
                            }
                            startIcon={<UndoRoundedIcon sx={{ fontSize: 16 }} />}
                          >
                            {t('preview:aiRegen.undo', 'Deshacer')}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ))}
        </Box>
      )}

      {/* Manual Touch Edit Dialog Modal */}
      <Dialog
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          {t('preview:aiRegen.editItem', 'Editar Contenido')}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.88rem',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>

          <Button
            onClick={() => setEditingItem(null)}
            variant="text"
            color="inherit"
          >
            {t('preview:aiRegen.cancelItem', 'Cancelar')}
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
          >
            {t('preview:aiRegen.saveItem', 'Guardar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Regenerate Bottom Sheet */}
      <AiRegeneratePopover
        open={Boolean(aiTarget)}
        anchorEl={null}
        onClose={() => setAiTarget(null)}
        type={aiTarget?.type}
        onRegenerate={handleExecuteAiRegenerate}
      />

      {/* Dedicated End-of-Scroll Safe Spacer */}
      <Box sx={{ height: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 36px)', sm: 20 }, flexShrink: 0 }} />
    </Box>
  );
};
