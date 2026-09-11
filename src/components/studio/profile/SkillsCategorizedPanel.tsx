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
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useTranslation } from 'react-i18next';
import { SkillCategory } from '../../../types/cv';
import { RADIUS_TOKENS } from '../../../theme/dimensions';

export interface SkillsCategorizedPanelProps {
  skillGroups: SkillCategory[];
  onCategoryChange: (index: number, newCategory: string) => void;
  onSkillsChange: (index: number, skillsStr: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (index: number) => void;
}

const DEFAULT_SUGGESTIONS_BY_TYPE: Record<string, string[]> = {
  core: ['TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3', 'SASS', 'Responsive Design', 'REST APIs', 'Node.js', 'Python', 'Java', 'SQL'],
  architecture: ['Microfrontends', 'Clean Architecture', 'Module Federation', 'State Management', 'Zustand', 'Redux Toolkit', 'Design Systems', 'Atomic Design', 'SSR / SSG', 'GraphQL'],
  tooling: ['Vite', 'Webpack', 'Jest', 'React Testing Library', 'Cypress', 'Git', 'GitHub Actions', 'CI/CD', 'Docker', 'ESLint', 'Prettier', 'Figma'],
  default: ['Agile / Scrum', 'Problem Solving', 'Team Leadership', 'Mentoring', 'Code Reviews', 'Performance Optimization', 'Security Best Practices']
};

export const SkillsCategorizedPanel: React.FC<SkillsCategorizedPanelProps> = ({
  skillGroups,
  onCategoryChange,
  onSkillsChange,
  onAddCategory,
  onRemoveCategory
}) => {
  const { t } = useTranslation(['profile', 'common']);
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editCategoryIdx, setEditCategoryIdx] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Fallback if activeTab exceeds length
  const safeTab = Math.min(activeTab, Math.max(0, skillGroups.length - 1));
  const currentGroup = skillGroups[safeTab];

  const handleAddSkill = (skillToAdd?: string) => {
    const raw = (skillToAdd !== undefined ? skillToAdd : newSkillInput).trim();
    if (!raw || !currentGroup) return;

    // Handle comma-separated skills if pasted
    const incomingSkills = raw
      .split(/[,|•·;]/)
      .map(s => s.replace(/^[-*•·+]\s*/, '').replace(/[*_`]/g, '').replace(/[\[\]]/g, '').trim())
      .filter(Boolean);
    const existing = new Set(currentGroup.skills.map(s => s.toLowerCase()));
    
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

  const handleOpenEditCategory = (idx: number, currentName: string) => {
    setEditCategoryIdx(idx);
    setEditCategoryName(currentName);
  };

  const handleSaveCategoryName = () => {
    if (editCategoryIdx !== null && editCategoryName.trim()) {
      onCategoryChange(editCategoryIdx, editCategoryName.trim());
      setEditCategoryIdx(null);
    }
  };

  // Get smart suggestions for current category
  const categoryKey = (currentGroup?.category || '').toLowerCase();
  const suggestions =
    categoryKey.includes('core') || categoryKey.includes('lang') || categoryKey.includes('fundam')
      ? DEFAULT_SUGGESTIONS_BY_TYPE.core
      : categoryKey.includes('arch') || categoryKey.includes('frame')
      ? DEFAULT_SUGGESTIONS_BY_TYPE.architecture
      : categoryKey.includes('tool') || categoryKey.includes('ci') || categoryKey.includes('cloud')
      ? DEFAULT_SUGGESTIONS_BY_TYPE.tooling
      : DEFAULT_SUGGESTIONS_BY_TYPE.default;

  const currentSkillSet = new Set((currentGroup?.skills || []).map(s => s.toLowerCase()));
  const unselectedSuggestions = suggestions.filter(s => !currentSkillSet.has(s.toLowerCase())).slice(0, 6);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Category Tabs Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1
        }}
      >
        <Tabs
          value={safeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            '& .MuiTabs-indicator': {
              borderRadius: RADIUS_TOKENS.full,
              height: 3
            },
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 1.75,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem'
            }
          }}
        >
          {skillGroups.map((group, gIdx) => (
            <Tab
              key={gIdx}
              label={`${group.category} (${group.skills.length})`}
            />
          ))}
        </Tabs>

        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={onAddCategory}
        >
          {t('profile:sections.skills.addGroup', 'Agregar Categoría')}
        </Button>
      </Box>

      {/* Active Category Actions & Info */}
      {currentGroup && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.96rem' }}>
              {currentGroup.category}
            </Typography>
            <Tooltip title={t('common:actions.edit', 'Renombrar')}>
              <IconButton
                size="small"
                onClick={() => handleOpenEditCategory(safeTab, currentGroup.category)}
              >
                <EditRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {skillGroups.length > 1 && (
              <Tooltip title={t('profile:sections.skills.removeGroup', 'Eliminar Categoría')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveCategory(safeTab)}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {currentGroup.skills.length} {t('profile:nav.skills', 'habilidades')}
          </Typography>
        </Box>
      )}

      {/* Chip Cloud for Active Category */}
      {currentGroup && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            minHeight: 52,
            p: 1.5,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: RADIUS_TOKENS.md,
          }}
        >
          {currentGroup.skills.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 0.5 }}>
              {t('profile:sections.skills.empty', 'No skills added in this group yet. Type below or select a suggestion.')}
            </Typography>
          ) : (
            currentGroup.skills.map((skill, sIdx) => (
              <Chip
                key={sIdx}
                label={skill.replace(/[*_`]/g, '').trim()}
                onDelete={() => handleDeleteSkill(sIdx)}
                variant="filled"
              />
            ))
          )}
        </Box>
      )}

      {/* Quick Add Input Bar with Enter Key & Plus Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('profile:sections.skills.inputPlaceholder', 'Type skill and press Enter...')}
          value={newSkillInput}
          onChange={(e) => setNewSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => handleAddSkill()}
          disabled={!newSkillInput.trim()}
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
        >
          {t('common:actions.add', 'Add')}
        </Button>
      </Box>

      {/* Smart Quick Suggestions */}
      {unselectedSuggestions.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
            {t('profile:sections.skills.quickSuggestions', 'Suggested:')}
          </Typography>
          {unselectedSuggestions.map((sug, i) => (
            <Chip
              key={i}
              label={`+ ${sug}`}
              size="small"
              onClick={() => handleAddSkill(sug)}
              clickable
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      )}

      {/* Edit Category Dialog */}
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
          <Button variant="contained" onClick={handleSaveCategoryName}>{t('common:actions.save', 'Save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
