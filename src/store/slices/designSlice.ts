import { StateCreator } from 'zustand';
import { ResumeStore, DesignSlice } from '../types';
import { ThemeId, PaletteId, FontFamilyId, SpacingDensity, PageFormat, ProfilePhotoConfig, ProfilePhotoCrop } from '../../types/cv';

export const createDesignSlice: StateCreator<ResumeStore, [], [], DesignSlice> = (set) => ({
  pageBudget: 1,
  pageFormat: 'a4',
  theme: 'modern-tech',
  palette: 'corporate-blue',
  customColor: '#1d4ed8',
  fontFamily: 'inter',
  spacingDensity: 'standard',
  photo: null,
  sidebarWidth: undefined,

  setPageBudget: (pageBudget: 1 | 2) => set({ pageBudget }),
  setPageFormat: (pageFormat: PageFormat) => set({ pageFormat }),
  setTheme: (theme: ThemeId) => set({ theme }),
  setPalette: (palette: PaletteId) => set({ palette }),
  setCustomColor: (customColor: string) => set({ customColor }),
  setFontFamily: (fontFamily: FontFamilyId) => set({ fontFamily }),
  setSpacingDensity: (spacingDensity: SpacingDensity) => set({ spacingDensity }),
  setSidebarWidth: (sidebarWidth?: number) => set({ sidebarWidth }),
  setProfilePhoto: (photo: ProfilePhotoConfig | null) => set({ photo }),
  setProfilePhotoEnabled: (enabled: boolean) =>
    set((state) => ({
      photo: state.photo ? { ...state.photo, enabled } : null,
    })),
  updateProfilePhotoCrop: (crop: ProfilePhotoCrop) =>
    set((state) => ({
      photo: state.photo ? { ...state.photo, crop } : null,
    })),
  updateProfilePhotoSize: (size: number) =>
    set((state) => ({
      photo: state.photo ? { ...state.photo, size } : null,
    })),
});
