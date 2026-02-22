// store/useLocationStore.ts
import { create } from 'zustand';

interface LocationStore {
  cityQuery: string;
  streetQuery: string;
  setCityQuery: (q: string) => void;
  setStreetQuery: (q: string) => void;
  resetQueries: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  cityQuery: "",
  streetQuery: "",
  setCityQuery: (cityQuery) => set({ cityQuery }),
  setStreetQuery: (streetQuery) => set({ streetQuery }),
  resetQueries: () => set({ cityQuery: "", streetQuery: "" }),
}));