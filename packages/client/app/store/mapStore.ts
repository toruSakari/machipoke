import { create } from 'zustand';
import type { SpotFilter } from '@/types/spot';

interface MapState {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  userLocation: [number, number] | null;
  selectedSpotId: string | null;
  filter: SpotFilter;
  isFilterVisible: boolean;
  // アクション
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setUserLocation: (location: [number, number] | null) => void;
  selectSpot: (spotId: string | null) => void;
  updateFilter: (filter: Partial<SpotFilter>) => void;
  resetFilter: () => void;
  toggleFilterVisibility: () => void;
}

// デフォルトの中心位置（東京）
const DEFAULT_CENTER: [number, number] = [35.6895, 139.6917];
const DEFAULT_ZOOM = 13;

const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  userLocation: null,
  selectedSpotId: null,
  filter: {
    category: undefined,
    searchTerm: undefined,
    minRating: undefined,
    minSecretLevel: undefined,
    nearLocation: undefined,
  },
  isFilterVisible: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setUserLocation: (location) => set({ userLocation: location }),
  selectSpot: (spotId) => set({ selectedSpotId: spotId }),
  updateFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
  resetFilter: () =>
    set({
      filter: {
        category: undefined,
        searchTerm: undefined,
        minRating: undefined,
        minSecretLevel: undefined,
        nearLocation: undefined,
      },
    }),
  toggleFilterVisibility: () => set((state) => ({ isFilterVisible: !state.isFilterVisible })),
}));

export default useMapStore;
