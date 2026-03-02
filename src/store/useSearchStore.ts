import { create } from 'zustand';

interface SearchState {
  dealType: number;
  propertyType: number;
  locations: any[];
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  // Generic setter for any field in the state
  setField: (field: keyof Omit<SearchState, 'setField' | 'resetAll'>, value: any) => void;
  resetAll: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  dealType: 0,
  propertyType: 0,
  locations: [],
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  resetAll: () => set({ 
    dealType: 0, propertyType: 0, locations: [], 
    minPrice: "", maxPrice: "", minArea: "", maxArea: "" 
  }),
}));