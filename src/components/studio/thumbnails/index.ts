import React from 'react';
import { ThemeId } from '../../../types/cv';
import { FormalLegalMiniature } from './FormalLegalMiniature';
import { ModernTechMiniature } from './ModernTechMiniature';
import { MinimalAtsMiniature } from './MinimalAtsMiniature';
import { ExecutiveMiniature } from './ExecutiveMiniature';
import { TwoColumnMiniature } from './TwoColumnMiniature';
import { DesignerUiuxMiniature } from './DesignerUiuxMiniature';
import { AcademicResearchMiniature } from './AcademicResearchMiniature';
import { EuropassMiniature } from './EuropassMiniature';
import { EuroModernMiniature } from './EuroModernMiniature';
import { SwissModernMiniature } from './SwissModernMiniature';
import { MiniatureLayoutProps } from './types';

export * from './types';
export {
  FormalLegalMiniature,
  ModernTechMiniature,
  MinimalAtsMiniature,
  ExecutiveMiniature,
  TwoColumnMiniature,
  DesignerUiuxMiniature,
  AcademicResearchMiniature,
  EuropassMiniature,
  EuroModernMiniature,
  SwissModernMiniature,
};

export const MINIATURE_REGISTRY: Record<string, React.FC<MiniatureLayoutProps>> = {
  'formal-legal': FormalLegalMiniature,
  'modern-tech': ModernTechMiniature,
  'minimal-ats': MinimalAtsMiniature,
  'executive': ExecutiveMiniature,
  'two-column': TwoColumnMiniature,
  'designer-uiux': DesignerUiuxMiniature,
  'academic-research': AcademicResearchMiniature,
  'europass': EuropassMiniature,
  'euro-modern': EuroModernMiniature,
  'swiss-modern': SwissModernMiniature,
};

export const getLayoutBadge = (themeId: ThemeId): string => {
  switch (themeId) {
    case 'formal-legal':
      return 'Serif · 1 Col';
    case 'modern-tech':
      return 'Tech · 1 Col';
    case 'minimal-ats':
      return '100% ATS';
    case 'executive':
      return 'Banner · 2 Col';
    case 'two-column':
      return 'Sidebar · 2 Col';
    case 'designer-uiux':
      return 'Editorial · Card';
    case 'academic-research':
      return 'Dual-Tone · 2 Col';
    case 'europass':
      return 'Europass · EU';
    case 'euro-modern':
      return 'DACH · 2 Col';
    case 'swiss-modern':
      return 'Suisse · 2 Col';
    default:
      return '1 Col';
  }
};
