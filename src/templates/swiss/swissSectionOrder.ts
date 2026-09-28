import { CVTemplateProps, GenericSlotData } from '../types';

export interface SwissSectionOrderResult {
  activeSidebarIds: string[];
  activeMainIds: string[];
}

export function resolveSwissSectionOrder(
  genericSections: GenericSlotData[],
  data?: CVTemplateProps['data']
): SwissSectionOrderResult {
  const defaultSidebar = ['languages', 'skills', 'education'];
  const defaultMain = ['summary', 'experience', 'projects', 'references', ...genericSections.map((g) => g.id)];

  const placement: Record<string, 'sidebar' | 'main'> = {
    languages: 'sidebar',
    skills: 'sidebar',
    education: 'sidebar',
    summary: 'main',
    experience: 'main',
    projects: 'main',
    references: 'main',
    ...Object.fromEntries(genericSections.map((g) => [g.id, 'main'])),
    ...(data?.sectionPlacement || {}),
  };

  const rawSidebar = data?.sidebarSectionOrder && data.sidebarSectionOrder.length > 0
    ? data.sidebarSectionOrder
    : defaultSidebar;
  const activeSidebarIds: string[] = rawSidebar.filter((id) => placement[id] === 'sidebar');
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'sidebar' && !activeSidebarIds.includes(id)) {
      activeSidebarIds.push(id);
    }
  });

  const rawMain = data?.mainSectionOrder && data.mainSectionOrder.length > 0
    ? data.mainSectionOrder
    : defaultMain;
  const activeMainIds: string[] = rawMain.filter((id) => placement[id] === 'main');
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'main' && !activeMainIds.includes(id)) {
      activeMainIds.push(id);
    }
  });

  return { activeSidebarIds, activeMainIds };
}
