import { CVTemplateProps, GenericSlotData } from '../types';

export interface SwissSectionOrderResult {
  activeSidebarIds: string[];
  activeMainIds: string[];
}

export function resolveSwissSectionOrder(
  genericSections: GenericSlotData[],
  data?: CVTemplateProps['data']
): SwissSectionOrderResult {
  const knownBaseIds = ['summary', 'skills', 'experience', 'projects', 'education', 'languages', 'references'];
  const customIds = genericSections
    .map((g) => g.id)
    .filter((id) => !knownBaseIds.includes(id));

  const defaultSidebar = ['languages', 'skills', 'education'];
  const defaultMain = ['summary', 'experience', 'projects', 'references', ...customIds];

  const placement: Record<string, 'sidebar' | 'main'> = {
    languages: 'sidebar',
    skills: 'sidebar',
    education: 'sidebar',
    summary: 'main',
    experience: 'main',
    projects: 'main',
    references: 'main',
    ...Object.fromEntries(customIds.map((id) => [id, 'main'])),
    ...(data?.sectionPlacement || {}),
  };

  const hidden = new Set([
    ...(data?.hiddenSections || []),
    ...(data?.hiddenDetails || []),
  ]);

  const rawSidebar = data?.sidebarSectionOrder && data.sidebarSectionOrder.length > 0
    ? data.sidebarSectionOrder
    : defaultSidebar;
  const activeSidebarIds: string[] = Array.from(
    new Set(rawSidebar.filter((id) => placement[id] === 'sidebar' && !hidden.has(id)))
  );
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'sidebar' && !activeSidebarIds.includes(id) && !hidden.has(id)) {
      activeSidebarIds.push(id);
    }
  });

  const rawMain = data?.mainSectionOrder && data.mainSectionOrder.length > 0
    ? data.mainSectionOrder
    : defaultMain;
  const activeMainIds: string[] = Array.from(
    new Set(rawMain.filter((id) => placement[id] === 'main' && !hidden.has(id)))
  );
  Object.entries(placement).forEach(([id, col]) => {
    if (col === 'main' && !activeMainIds.includes(id) && !hidden.has(id)) {
      activeMainIds.push(id);
    }
  });

  return { activeSidebarIds, activeMainIds };
}
