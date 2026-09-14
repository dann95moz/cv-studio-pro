import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTranslation } from 'react-i18next';
import { SkillCategory } from '../../../types/cv';
import { RADIUS_TOKENS } from '../../../theme/dimensions';
import { getLocalizedCategoryTitle } from '../../../utils/skillCategoryUtils';
import { GuidedSectionNavFooter } from './GuidedSectionNavFooter';

export interface SkillsCategorizedPanelProps {
  skillGroups: SkillCategory[];
  onCategoryChange: (index: number, newCategory: string) => void;
  onSkillsChange: (index: number, skillsStr: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (index: number) => void;
  onBack?: () => void;
  onContinue?: () => void;
}

export const SkillsCategorizedPanel: React.FC<SkillsCategorizedPanelProps> = ({
  skillGroups,
  onCategoryChange,
  onSkillsChange,
  onAddCategory,
  onRemoveCategory,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editCategoryIdx, setEditCategoryIdx] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Fallback if activeTab exceeds length
  const safeTab = Math.min(activeTab, Math.max(0, skillGroups.length - 1));
  const currentGroup = skillGroups[safeTab];

  const handleAddSkill = (skillToAdd?: string) => {
    const raw = (skillToAdd !== undefined ? skillToAdd : newSkillInput).trim();
    if (!raw || !currentGroup) return;

    // Handle comma-separated skills if pasted
    const incomingSkills = raw
      .split(/[,|•·;]/)
      .map((s) => s.replace(/^[-*•·+]\s*/, '').replace(/[*_`]/g, '').replace(/[\[\]]/g, '').trim())
      .filter(Boolean);
    const existing = new Set(currentGroup.skills.map((s) => s.toLowerCase()));

    const nextSkills = [...currentGroup.skills];
    for (const skill of incomingSkills) {
      if (!existing.has(skill.toLowerCase())) {
        nextSkills.push(skill);
        existing.add(skill.toLowerCase());
      }
    }

    onSkillsChange(safeTab, nextSkills.join(', '));
    if (skillToAdd === undefined) {
      setNewSkillInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleDeleteSkill = (skillIndex: number) => {
    if (!currentGroup) return;
    const nextSkills = currentGroup.skills.filter((_, i) => i !== skillIndex);
    onSkillsChange(safeTab, nextSkills.join(', '));
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleTriggerRename = () => {
    if (currentGroup) {
      setEditCategoryIdx(safeTab);
      setEditCategoryName(getLocalizedCategoryTitle(currentGroup.category, t));
    }
    handleCloseMenu();
  };

  const handleTriggerDelete = () => {
    if (skillGroups.length > 1) {
      onRemoveCategory(safeTab);
      if (safeTab > 0) {
        setActiveTab(safeTab - 1);
      }
    }
    handleCloseMenu();
  };

  const handleSaveCategoryName = () => {
    if (editCategoryIdx !== null && editCategoryName.trim()) {
      onCategoryChange(editCategoryIdx, editCategoryName.trim());
      setEditCategoryIdx(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* 1. Category Tabs Navigation */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
        }}
      >
        <Tabs
          value={safeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile={false}
          sx={{
            minHeight: 42,
            '& .MuiTabs-indicator': {
              borderRadius: RADIUS_TOKENS.full,
              height: 3,
            },
            '& .MuiTab-root': {
              minHeight: 40,
              py: 0.5,
              px: { xs: 1.5, sm: 2 },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'text.primary',
                fontWeight: 800,
              },
            },
          }}
        >
          {skillGroups.map((group, gIdx) => (
            <Tab key={gIdx} label={getLocalizedCategoryTitle(group.category, t)} />
          ))}
        </Tabs>
      </Box>

      {/* 2. Category Title & Action Row (Clean typography, no nested card) */}
      {currentGroup && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            pt: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.92rem', sm: '0.98rem' },
                color: 'text.primary',
              }}
            >
              {getLocalizedCategoryTitle(currentGroup.category, t)} · {currentGroup.skills.length}{' '}
              {currentGroup.skills.length === 1
                ? t('profile:sections.skills.skillSingular', 'skill')
                : t('profile:nav.skills', 'skills')}
            </Typography>

            <IconButton
              size="small"
              onClick={handleOpenMenu}
              aria-label={t('common:actions.more', 'More actions')}
              sx={{ color: 'text.secondary', p: 0.5 }}
            >
              <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Contextual Kebab Menu for Rename / Delete */}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleTriggerRename} sx={{ fontSize: '0.88rem', gap: 1.25, py: 1 }}>
                <EditRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                {t('profile:sections.skills.renameGroup', 'Rename Category')}
              </MenuItem>
              {skillGroups.length > 1 && (
                <MenuItem
                  onClick={handleTriggerDelete}
                  sx={{ fontSize: '0.88rem', gap: 1.25, py: 1, color: 'error.main' }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  {t('profile:sections.skills.removeGroup', 'Delete Category')}
                </MenuItem>
              )}
            </Menu>
          </Box>

          <Button
            size="small"
            variant="text"
            color="primary"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onAddCategory}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              p: { xs: '2px 6px', sm: '4px 8px' },
            }}
          >
            {t('profile:sections.skills.addCategoryAction', '+ Add category')}
          </Button>
        </Box>
      )}

      {/* 3. Skills Chips Flow or Clean Empty State (NO nested border box) */}
      {currentGroup && (
        <Box sx={{ minHeight: 36, py: 0.5 }}>
          {currentGroup.skills.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic', fontSize: '0.88rem', py: 0.5 }}
            >
              {t('profile:sections.skills.empty', 'No skills added here yet.')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentGroup.skills.map((skill, sIdx) => (
                <Chip
                  key={sIdx}
                  label={skill.replace(/[*_`]/g, '').trim()}
                  onDelete={() => handleDeleteSkill(sIdx)}
                  variant="filled"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.84rem',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* 4. Touch-First Add Input Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('profile:sections.skills.inputPlaceholder', 'e.g. Project Management...')}
          value={newSkillInput}
          onChange={(e) => setNewSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: RADIUS_TOKENS.md,
            },
          }}
        />
        <Button
          size="medium"
          variant="contained"
          color="primary"
          onClick={() => handleAddSkill()}
          disabled={!newSkillInput.trim()}
          sx={{
            whiteSpace: 'nowrap',
            px: { xs: 2, sm: 2.5 },
            minWidth: { xs: 90, sm: 100 },
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          {t('common:actions.add', '+ Add')}
        </Button>
      </Box>

      {/* 5. Rename Category Dialog */}
      <Dialog open={editCategoryIdx !== null} onClose={() => setEditCategoryIdx(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {t('profile:sections.skills.groupName', 'Category Name')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryIdx(null)}>{t('common:actions.cancel', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleSaveCategoryName}>
            {t('common:actions.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. Navigation Footer */}
      <GuidedSectionNavFooter
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={skillGroups.reduce((acc, g) => acc + (g.skills?.length || 0), 0) === 0}
      />
    </Box>
  );
};
