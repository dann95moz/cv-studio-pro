import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useResumeStore } from '../../store';
import { extractTargetCompany, extractTargetRole } from '../../core/parser';
import { calculateQuickScore } from '../../core/matching/quickMatcher';

/**
 * Appends a skill to the user's Master CV Markdown under an existing skills header,
 * or creates a Technical Skills section if not present.
 */
function addSkillToMasterMarkdown(masterMarkdown: string, skill: string): string {
  const trimmedSkill = skill.trim();
  if (!trimmedSkill) return masterMarkdown;

  const escaped = trimmedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const alreadyPresentRegex = new RegExp(`(^|[,•\\-\\s])${escaped}([,•\\-\\s]|$)`, 'i');
  if (alreadyPresentRegex.test(masterMarkdown)) {
    return masterMarkdown;
  }

  const skillsHeaderRegex = /(##[^\n]*(?:skills|habilidades|competencias|stack|technologies|tecnologías)[^\n]*\n)/i;
  const match = masterMarkdown.match(skillsHeaderRegex);

  if (match && match.index !== undefined) {
    const insertPos = match.index + match[0].length;
    return (
      masterMarkdown.slice(0, insertPos) +
      `- ${trimmedSkill}\n` +
      masterMarkdown.slice(insertPos)
    );
  }

  return `${masterMarkdown.trimEnd()}\n\n## Technical Skills\n- ${trimmedSkill}\n`;
}

export interface UseStepTargetJobFacadeProps {
  content: string;
  onChange: (value: string) => void;
  companyName: string;
  onCompanyChange: (name: string) => void;
  targetRole: string;
  onRoleChange: (role: string) => void;
}

/**
 * Facade Pattern: useStepTargetJobFacade
 * Encapsulates store interactions, debounced local inputs, automated role/company extractions,
 * quick ATS score calculations, and master profile skill sync for StepTargetJob.
 * This completely purifies StepTargetJob into a presentational Dumb Component.
 */
export function useStepTargetJobFacade({
  content,
  onChange,
  companyName,
  onCompanyChange,
  targetRole,
  onRoleChange,
}: UseStepTargetJobFacadeProps) {
  const { t } = useTranslation(['target', 'common']);

  // Modal and toast state
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [skillToast, setSkillToast] = useState<string | null>(null);

  // Local state buffers
  const [localContent, setLocalContent] = useState(content);
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localRole, setLocalRole] = useState(targetRole);

  // Store access encapsulated within facade
  const masterData = useResumeStore((s) => s.masterData);
  const setMasterData = useResumeStore((s) => s.setMasterData);
  const openManualPromptModal = useResumeStore((s) => s.openManualPromptModal);

  // Computed ATS Match Score
  const quickMatchResult = useMemo(() => {
    return calculateQuickScore(localContent, masterData);
  }, [localContent, masterData]);

  // Timers for input debouncing
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const companyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    setLocalCompany(companyName);
  }, [companyName]);

  useEffect(() => {
    setLocalRole(targetRole);
  }, [targetRole]);

  useEffect(() => {
    return () => {
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
      if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
      if (roleTimerRef.current) clearTimeout(roleTimerRef.current);
    };
  }, []);

  const flushAll = useCallback(() => {
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current);
      contentTimerRef.current = null;
      onChange(localContent);
    }
    if (companyTimerRef.current) {
      clearTimeout(companyTimerRef.current);
      companyTimerRef.current = null;
      onCompanyChange(localCompany);
    }
    if (roleTimerRef.current) {
      clearTimeout(roleTimerRef.current);
      roleTimerRef.current = null;
      onRoleChange(localRole);
    }
  }, [localContent, localCompany, localRole, onChange, onCompanyChange, onRoleChange]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
      contentTimerRef.current = setTimeout(() => {
        onChange(newContent);
        contentTimerRef.current = null;
      }, 500);

      // Automated field extraction if fields are empty
      if (!localCompany) {
        const autoCompany = extractTargetCompany(newContent);
        if (autoCompany) {
          setLocalCompany(autoCompany);
          onCompanyChange(autoCompany);
        }
      }
      if (!localRole) {
        const autoRole = extractTargetRole(newContent);
        if (autoRole) {
          setLocalRole(autoRole);
          onRoleChange(autoRole);
        }
      }
    },
    [localCompany, localRole, onChange, onCompanyChange, onRoleChange]
  );

  const handleCompanyChange = useCallback(
    (newCompany: string) => {
      setLocalCompany(newCompany);
      if (companyTimerRef.current) clearTimeout(companyTimerRef.current);
      companyTimerRef.current = setTimeout(() => {
        onCompanyChange(newCompany);
        companyTimerRef.current = null;
      }, 500);
    },
    [onCompanyChange]
  );

  const handleRoleChange = useCallback(
    (newRole: string) => {
      setLocalRole(newRole);
      if (roleTimerRef.current) clearTimeout(roleTimerRef.current);
      roleTimerRef.current = setTimeout(() => {
        onRoleChange(newRole);
        roleTimerRef.current = null;
      }, 500);
    },
    [onRoleChange]
  );

  const handleAddSkillToMaster = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed) return;

      const updated = addSkillToMasterMarkdown(masterData, trimmed);
      if (updated !== masterData) {
        setMasterData(updated);
      }

      setSkillToast(
        t('target:quickScore.skillAddedToast', {
          skill: trimmed,
          defaultValue: `Skill '${trimmed}' added to your Master Profile`,
        })
      );
    },
    [masterData, setMasterData, t]
  );

  return {
    state: {
      localContent,
      localCompany,
      localRole,
      aiModalOpen,
      skillToast,
      quickMatchResult,
      masterData,
    },
    actions: {
      setAiModalOpen,
      setSkillToast,
      handleContentChange,
      handleCompanyChange,
      handleRoleChange,
      handleAddSkillToMaster,
      flushAll,
      openManualPromptModal,
    },
  };
}
