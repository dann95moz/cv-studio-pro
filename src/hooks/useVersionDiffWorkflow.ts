import { useMemo } from 'react';
import { useResumeStore, useParsedCv, useGapInfo } from '../store';
import { parseMarkdownToCvData } from '../core/parser';
import { CVData, ThemeId, PaletteId, FontFamilyId, SpacingDensity } from '../types';

export interface ResolvedDiffVersion {
  id: string;
  label: string;
  cvMarkdown: string;
  cvData: CVData;
  theme: ThemeId;
  palette: PaletteId;
  customColor?: string;
  fontFamily: FontFamilyId;
  spacingDensity: SpacingDensity;
  matchScore: number;
}

/**
 * Domain hook encapsulating store subscriptions and actions for VersionDiffModal.
 * Decouples the UI component from direct Zustand store references.
 */
export function useVersionDiffWorkflow() {
  const masterData = useResumeStore((s) => s.masterData);
  const cvMarkdown = useResumeStore((s) => s.cvMarkdown);
  const savedVersions = useResumeStore((s) => s.savedVersions || []);
  const handleLoadVersion = useResumeStore((s) => s.handleLoadVersion);
  const setCvMarkdown = useResumeStore((s) => s.setCvMarkdown);
  const setWizardStep = useResumeStore((s) => s.setWizardStep);

  const currentTheme = (useResumeStore((s) => s.theme) || 'modern-tech') as ThemeId;
  const currentPalette = (useResumeStore((s) => s.palette) || 'corporate-blue') as PaletteId;
  const currentCustomColor = useResumeStore((s) => s.customColor);
  const currentFontFamily = (useResumeStore((s) => s.fontFamily) || 'inter') as FontFamilyId;
  const currentSpacingDensity = (useResumeStore((s) => s.spacingDensity) || 'standard') as SpacingDensity;
  const { matchScore: currentMatchScore } = useGapInfo();

  const parsedCurrentCv = useParsedCv();

  const parsedMasterCv = useMemo(() => {
    return parseMarkdownToCvData(masterData);
  }, [masterData]);

  const resolveVersion = (versionId: string, fallbackLabel?: string): ResolvedDiffVersion => {
    if (versionId === 'master') {
      return {
        id: 'master',
        label: fallbackLabel || 'Original Career Profile',
        cvMarkdown: masterData,
        cvData: parsedMasterCv,
        theme: 'minimal-slate' as ThemeId,
        palette: 'minimal-slate' as PaletteId,
        customColor: undefined,
        fontFamily: 'inter' as FontFamilyId,
        spacingDensity: 'standard' as SpacingDensity,
        matchScore: 58,
      };
    }

    if (versionId === 'current') {
      return {
        id: 'current',
        label: fallbackLabel || 'Current Tailored CV (Editor)',
        cvMarkdown,
        cvData: parsedCurrentCv,
        theme: currentTheme,
        palette: currentPalette,
        customColor: currentCustomColor,
        fontFamily: currentFontFamily,
        spacingDensity: currentSpacingDensity,
        matchScore: currentMatchScore || 85,
      };
    }

    const found = savedVersions.find((v) => v.id === versionId);
    if (found) {
      const company = found.companyName || 'General';
      const role = found.targetRole ? ` • ${found.targetRole}` : '';
      return {
        id: found.id,
        label: fallbackLabel || `${company}${role}`,
        cvMarkdown: found.cvMarkdown,
        cvData: found.cvData || parseMarkdownToCvData(found.cvMarkdown),
        theme: found.theme || currentTheme,
        palette: found.palette || currentPalette,
        customColor: undefined,
        fontFamily: currentFontFamily,
        spacingDensity: currentSpacingDensity,
        matchScore: found.matchScore || 85,
      };
    }

    return {
      id: versionId,
      label: fallbackLabel || 'Unknown Version',
      cvMarkdown: '',
      cvData: { name: 'Candidate', title: '', contacts: [], sections: [] },
      theme: currentTheme,
      palette: currentPalette,
      customColor: currentCustomColor,
      fontFamily: currentFontFamily,
      spacingDensity: currentSpacingDensity,
      matchScore: 0,
    };
  };

  const applyVersion = (versionId: string) => {
    if (versionId === 'master') {
      setCvMarkdown(masterData);
    } else if (versionId !== 'current') {
      handleLoadVersion(versionId);
    }
    setWizardStep('preview');
  };

  return {
    masterData,
    cvMarkdown,
    savedVersions,
    resolveVersion,
    applyVersion,
    currentTheme,
    currentPalette,
    currentFontFamily,
    currentSpacingDensity,
  };
}

