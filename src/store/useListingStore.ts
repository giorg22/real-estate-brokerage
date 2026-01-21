import { create } from 'zustand';

export interface Filters {
  searchQuery: string;
  city: string;
  type?: number; // Integer to match C# Enum
  minPrice: number;
  maxPrice: number;
  sortBy: string;
}

interface ListingStore {
  filters: Filters;
  setFilters: (newFilters: Partial<Filters>) => void;
  resetFilters: () => void;
}

export const useListingStore = create<ListingStore>((set) => ({
  filters: {
    searchQuery: "",
    city: "all",
    type: undefined,
    minPrice: 0,
    maxPrice: 1000000,
    sortBy: "date-desc",
  },
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => 
    set({ 
      filters: { 
        searchQuery: "", 
        city: "all", 
        type: undefined,
        minPrice: 0, 
        maxPrice: 1000000, 
        sortBy: "date-desc" 
      } 
    }),
}));